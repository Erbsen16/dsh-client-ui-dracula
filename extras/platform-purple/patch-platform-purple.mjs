/**
 * dsh-platform-purple — 让桌面端内嵌的 DeepSeek 开放平台页面变成 VS Code Dracula 配色。
 *
 * 背景：宿主（app.asar!/lib/main.js 第 11317 行）用 WebContentsView 打开
 * platform.deepseek.com，并把 app.asar!/lib/preload-platform-account.cjs 作为 preload
 * 注入那个页面。该页面的样式是 CSS-in-JS 运行时生成、类名带哈希、没有任何 CSS 变量，
 * 所以这里不改选择器，而是：
 *   1) 在 preload 里遍历 DOM，用 dracula-map.js 把每个元素的实际背景色/文字色/边框色
 *      映射到 Dracula 调色板（保持明暗关系与对比度）；
 *   2) MutationObserver + 定时兜底重绘，React 重渲染后依旧生效。
 *
 * 用法：
 *   node patch-platform-purple.mjs            生成 app.asar.new 并逐项校验（可在应用运行时执行）
 *   node patch-platform-purple.mjs --install  退出应用后替换 app.asar（先备份、失败自动回滚）
 *   node patch-platform-purple.mjs --revert   用最近备份还原
 *   node patch-platform-purple.mjs --status   查看当前是否已打补丁
 *
 * 路径：默认取作者本机的 D:/DeepSeek/resources；换机器请改下面的 DEFAULT_RESOURCES，
 * 或设置环境变量 DSH_RESOURCES 指向你自己的 resources 目录（宿主安装目录下那个
 * 装着 app.asar 的 resources 文件夹）。
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

/** 宿主安装目录下的 resources 目录；DSH_RESOURCES 环境变量优先。 */
const DEFAULT_RESOURCES = "D:/DeepSeek/resources";
const RESOURCES = path.resolve(process.env.DSH_RESOURCES || DEFAULT_RESOURCES);
const ASAR = path.join(RESOURCES, "app.asar");
const NEW = path.join(RESOURCES, "app.asar.new");
const TARGET = "/lib/preload-platform-account.cjs";
const WORKDIR = path.dirname(fileURLToPath(import.meta.url));
const MAP_SOURCE = fs.readFileSync(path.join(WORKDIR, "dracula-map.js"), "utf8");

/** 基础样式：滚动条与选中色（颜色本身由 DOM 调色负责）。 */
const BASE_CSS = [
  "::selection { background: rgba(189, 147, 249, .35) !important; }",
  "::-webkit-scrollbar { width: 12px; height: 12px; }",
  "::-webkit-scrollbar-thumb { background: #44475a; border-radius: 8px; }",
  "::-webkit-scrollbar-thumb:hover { background: #6272a4; }",
  "::-webkit-scrollbar-track { background: #21222c; }"
].join("\n");

/** 追加进平台页面 preload 的代码（整块删除即可还原）。 */
const INJECTED = `
//#region dsh-platform-purple (本地补丁：把内嵌的开放平台页面改成 VS Code Dracula 配色)
// 这一块是本地加的，删掉即可恢复页面原样。页面的样式是运行时生成的、类名带哈希、
// 也没有 CSS 变量，所以这里不用选择器，而是遍历 DOM，把每个元素的实际颜色
// 按 Dracula 调色板重新映射（保持明暗与对比度），并在 React 重渲染后重绘。
if (process.isMainFrame && location.origin === allowedOrigin) {
${MAP_SOURCE.replace(/^/gm, "\t")}
	const DSHP_CSS = ${JSON.stringify(BASE_CSS)};
	const DSHP_SKIP = { SVG: 1, IMG: 1, CANVAS: 1, VIDEO: 1, AUDIO: 1, IFRAME: 1, PATH: 1, CIRCLE: 1, ELLIPSE: 1, RECT: 1, LINE: 1, POLYGON: 1, POLYLINE: 1, TEXT: 1, TSPAN: 1, G: 1, DEFS: 1, USE: 1, STOP: 1, LINEARGradient: 1, RADIALGRADIENT: 1, CLIPPATH: 1, MASK: 1, PATTERN: 1, SYMBOL: 1, STYLE: 1, SCRIPT: 1, LINK: 1, META: 1, HEAD: 1, TITLE: 1, NOSCRIPT: 1 };
	const dshpSeen = new WeakMap();
	let dshpRuns = 0;
	let dshpStyle = false;
	let dshpScheduled = false;
	function dshpBaseLuma() {
		for (const el of [document.body, document.documentElement]) {
			if (!el) continue;
			let cs;
			try { cs = getComputedStyle(el); } catch (error) { continue; }
			const c = DSH_DRACULA.parse(cs.backgroundColor);
			if (c !== null && c.a > 0.5) return DSH_DRACULA.luma([c.r, c.g, c.b]);
		}
		return null;
	}
	function dshpPaint() {
		dshpScheduled = false;
		const root = document.documentElement;
		if (!root) return;
		if (!dshpStyle) {
			const style = document.createElement("style");
			style.setAttribute("data-dsh-platform-purple", "on");
			style.textContent = DSHP_CSS;
			(root.querySelector("head") || root).appendChild(style);
			dshpStyle = true;
		}
		// 以页面自身底色为锚：整页落到 Dracula 的明暗阶梯上
		DSH_DRACULA.setAnchor(dshpBaseLuma());
		const run = { elements: 0, changed: 0, gradients: 0, shadowRoots: 0, errors: [], bgSamples: [] };
		const apply = (el) => {
			if (DSHP_SKIP[el.tagName] === 1) return;
			let cs;
			try { cs = getComputedStyle(el); } catch (error) { run.errors.push("computed"); return; }
			run.elements++;
			const prev = dshpSeen.get(el) || {};
			const next = {};
			const set = (prop, value, key) => {
				if (value === prev[key]) { next[key] = value; return; }
				const mapped = DSH_DRACULA.map(value);
				if (mapped === null) { next[key] = value; return; }
				next[key] = mapped;
				try { el.style.setProperty(prop, mapped, "important"); run.changed++; } catch (error) { run.errors.push("set"); }
			};
			set("background-color", cs.backgroundColor, "bg");
			set("color", cs.color, "fg");
			set("border-top-color", cs.borderTopColor, "bt");
			set("border-right-color", cs.borderRightColor, "br");
			set("border-bottom-color", cs.borderBottomColor, "bb");
			set("border-left-color", cs.borderLeftColor, "bl");
			// 有些面是用渐变画的，只改 background-color 会被渐变盖住，所以逐个颜色停靠点映射
			const image = cs.backgroundImage;
			if (typeof image === "string" && image !== "none" && image.indexOf("gradient") >= 0) {
				run.gradients++;
				if (image !== prev.bi) {
					const mappedImage = DSH_DRACULA.mapGradient(image);
					if (mappedImage === null) next.bi = image;
					else {
						next.bi = mappedImage;
						try { el.style.setProperty("background-image", mappedImage, "important"); run.changed++; } catch (error) { run.errors.push("bi"); }
					}
				} else next.bi = image;
			}
			if (run.bgSamples.length < 25 && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && run.bgSamples.indexOf(cs.backgroundColor) < 0) run.bgSamples.push(cs.backgroundColor);
			dshpSeen.set(el, next);
		};
		const walk = (el) => {
			apply(el);
			const shadow = el.shadowRoot; // 阴影 DOM 里的节点不会出现在 children 里，要单独走
			if (shadow) { run.shadowRoots++; for (let i = 0; i < shadow.children.length; i++) walk(shadow.children[i]); }
			for (let i = 0; i < el.children.length; i++) walk(el.children[i]);
		};
		walk(root);
		dshpRuns++;
		try {
			localStorage.setItem("dshPlatformPurple", JSON.stringify({ runs: dshpRuns, elements: run.elements, changed: run.changed, gradients: run.gradients, shadowRoots: run.shadowRoots, anchor: DSH_DRACULA.anchor, title: document.title, bgSamples: run.bgSamples, errors: run.errors.slice(0, 5) }));
		} catch (error) {}
	}
	function dshpSchedule() {
		if (dshpScheduled) return;
		dshpScheduled = true;
		setTimeout(dshpPaint, 60);
	}
	try {
		dshpPaint();
		document.addEventListener("DOMContentLoaded", dshpSchedule, { once: true });
		new MutationObserver(dshpSchedule).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class"] });
		setInterval(dshpSchedule, 2500);
	} catch (error) {
		console.error("dsh-platform-purple failed", error);
	}
}
//#endregion
`;

function readAsar(file) {
  const buf = fs.readFileSync(file);
  const u32 = (o) => buf.readUInt32LE(o);
  const jsonSize = u32(12);
  const json = JSON.parse(buf.slice(16, 16 + jsonSize).toString("utf8"));
  const dataStart = 8 + u32(4);
  const index = new Map();
  (function walk(node, prefix) {
    for (const [name, val] of Object.entries(node.files || {})) {
      const full = prefix + "/" + name;
      if (val.files) walk(val, full);
      else index.set(full, val);
    }
  })(json, "");
  return { buf, json, jsonSize, dataStart, index };
}

function slice(archive, entry) {
  const off = Number(entry.offset);
  const size = Number(entry.size);
  return archive.buf.slice(archive.dataStart + off, archive.dataStart + off + size);
}

function preloadText(archive) { return slice(archive, archive.index.get(TARGET)).toString("utf8"); }
function isPatchedFile(file) { return preloadText(readAsar(file)).includes("dsh-platform-purple"); }
function build() {
  // 当前归档若已打过补丁，就以最近一次的原始备份为基底重新构建（补丁可反复升级）
  const base = isPatchedFile(ASAR) ? (backups().length > 0 ? backups()[backups().length - 1] : null) : ASAR;
  if (base === null) throw new Error("当前 app.asar 已打过补丁，但找不到原始备份，无法重新构建");
  if (base !== ASAR) console.log("基底归档    : " + base + "（当前已是补丁版，改用原始备份重建）");
  const archive = readAsar(base);
  const entry = archive.index.get(TARGET);
  if (!entry) throw new Error("归档里找不到 " + TARGET);
  const original = slice(archive, entry).toString("utf8");
  const patched = (original + INJECTED).replace(/\n+$/, "\n");

  const newSize = Buffer.byteLength(patched, "utf8");
  entry.offset = String(archive.buf.length - archive.dataStart); // offset 相对数据段起点
  entry.size = newSize;
  const digest = crypto.createHash("sha256").update(Buffer.from(patched, "utf8")).digest("hex");
  if (entry.integrity !== undefined && entry.integrity !== null) {
    entry.integrity.hash = digest; // 头部每个文件都带完整性校验，内容改了必须同步
    if (Array.isArray(entry.integrity.blocks)) entry.integrity.blocks = [digest];
  }
  // 头部允许变长：entry 的 offset 是相对“数据段起点”的，数据段整体后移不影响它们。
  // 只需重算三个长度字段，并把 JSON 补到 4 字节对齐（数据段起点继续保持对齐）。
  let jsonText = JSON.stringify(archive.json);
  const jsonBytes = Buffer.byteLength(jsonText, "utf8");
  const jsonSize = Math.ceil(jsonBytes / 4) * 4;
  jsonText = jsonText + " ".repeat(jsonSize - jsonBytes);

  const head = Buffer.alloc(16);
  head.writeUInt32LE(4, 0);
  head.writeUInt32LE(jsonSize + 8, 4);
  head.writeUInt32LE(jsonSize + 4, 8);
  head.writeUInt32LE(jsonSize, 12);

  const out = Buffer.concat([head, Buffer.from(jsonText, "utf8"), archive.buf.slice(archive.dataStart), Buffer.from(patched, "utf8")]);
  if (out.length !== jsonSize + 16 + (archive.buf.length - archive.dataStart) + newSize) throw new Error("归档长度与预期不符，已中止");
  fs.writeFileSync(NEW, out);

  const check = readAsar(NEW);
  const problems = [];
  if (check.index.size !== archive.index.size) problems.push("条目数不一致");
  for (const [name, val] of archive.index) {
    const other = check.index.get(name);
    if (!other) { problems.push("缺少条目 " + name); continue; }
    if (name === TARGET) continue;
    if (JSON.stringify(other) !== JSON.stringify(val)) problems.push("条目元数据变了 " + name);
  }
  const back = slice(check, check.index.get(TARGET)).toString("utf8");
  if (back !== patched) problems.push("写入内容与预期不一致");
  if (!back.includes("dsh-platform-purple")) problems.push("写入内容里没有补丁");
  const sample = [...archive.index].filter(([n, v]) => n !== TARGET && v.unpacked !== true && Number(v.size) > 512).slice(0, 400);
  let sampled = 0;
  for (let i = 0; i < sample.length && sampled < 8; i += Math.max(1, Math.floor(sample.length / 8))) {
    const [name, val] = sample[i];
    const a = crypto.createHash("sha256").update(slice(archive, val)).digest("hex");
    const b = crypto.createHash("sha256").update(slice(check, check.index.get(name))).digest("hex");
    if (a !== b) problems.push("抽查内容不一致 " + name);
    sampled++;
  }

  fs.writeFileSync(path.join(WORKDIR, "preload-platform-account.cjs.orig"), original);
  fs.writeFileSync(path.join(WORKDIR, "preload-platform-account.cjs.patched"), patched);
  console.log("原文件      : " + original.length + " 字符");
  console.log("补丁后      : " + patched.length + " 字符（其中调色模块 " + MAP_SOURCE.length + "）");
  console.log("新归档      : " + NEW + "  (" + out.length + " 字节, 原 " + archive.buf.length + ")");
  console.log("头部 JSON   : " + jsonBytes + " / 上限 " + archive.jsonSize);
  console.log("抽查文件    : " + sampled + " 个哈希一致");
  console.log(problems.length === 0 ? "校验结果    : 通过 ✅" : "校验结果    : 失败 ❌\n  " + problems.slice(0, 10).join("\n  ") + (problems.length > 10 ? `\n  ...（共 ${problems.length} 条）` : ""));
  if (problems.length > 0) process.exitCode = 1;
}

const backups = () => fs.readdirSync(RESOURCES).filter((n) => n.startsWith("app.asar.bak-purple-")).sort().map((n) => path.join(RESOURCES, n));

function install() {
  if (!fs.existsSync(NEW)) throw new Error("找不到 " + NEW + "，先跑一次构建");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backup = path.join(RESOURCES, "app.asar.bak-purple-" + stamp);
  const aside = path.join(RESOURCES, "app.asar.replaced-" + stamp);
  let madeBackup = false;
  if (isPatchedFile(ASAR)) {
    console.log("当前归档已含补丁，保留既有原始备份，不再重复备份");
  } else {
    madeBackup = true;
    fs.copyFileSync(ASAR, backup);
    const same = crypto.createHash("sha256").update(fs.readFileSync(ASAR)).digest("hex") === crypto.createHash("sha256").update(fs.readFileSync(backup)).digest("hex");
    if (!same) throw new Error("备份校验失败，已中止（未改动任何文件）");
  }
  try {
    fs.renameSync(ASAR, aside); // 应用占用时会抛 EBUSY/EPERM：此时什么都没变
  } catch (error) {
    fs.rmSync(backup, { force: true });
    throw new Error("替换失败（应用可能仍在运行）：" + error.code);
  }
  try {
    fs.renameSync(NEW, ASAR);
  } catch (error) {
    fs.renameSync(aside, ASAR); // 回滚
    throw new Error("替换失败，已回滚：" + error.code);
  }
  fs.rmSync(aside, { force: true });
  const known = madeBackup ? backup : (backups()[backups().length - 1] || "无");
  console.log("已替换 app.asar；原始备份：" + known);
}

function revert() {
  const list = backups();
  if (list.length === 0) throw new Error("没有可用的备份");
  const latest = list[list.length - 1];
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.renameSync(ASAR, path.join(RESOURCES, "app.asar.patched-" + stamp));
  fs.copyFileSync(latest, ASAR);
  console.log("已从备份还原：" + latest);
}

function status() {
  const archive = readAsar(ASAR);
  const text = slice(archive, archive.index.get(TARGET)).toString("utf8");
  const kind = !text.includes("dsh-platform-purple") ? "未打（原样）" : text.includes("DSH_DRACULA") ? "已打上 ✅（调色板映射版）" : "已打上（旧版蒙版，建议换成映射版）";
  console.log("当前 app.asar：" + ASAR);
  console.log("平台页面补丁：" + kind);
  console.log("可用备份：" + (backups().join(", ") || "无"));
  if (fs.existsSync(NEW)) console.log("另有待安装的 app.asar.new（" + fs.statSync(NEW).size + " 字节）");
}

const arg = process.argv[2];
if (arg === "--install") install();
else if (arg === "--revert") revert();
else if (arg === "--status") status();
else build();
