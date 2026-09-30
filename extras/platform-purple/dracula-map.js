/**
 * dsh-platform-purple / dracula-map.js
 *
 * 把任意 CSS 颜色映射到 VS Code "Dracula" 主题的实际调色板（纯函数，可单独验算）。
 *
 * 关键设计：
 *  1) 用「彩度 chroma = max-min」而不是 HSL 饱和度来区分中性色与彩色 ——
 *     Dracula 自己的深灰（#282a36 之类）带一点点紫，用饱和度会被误判成彩色。
 *  2) 明暗阶按各 Dracula 色的**真实相对亮度**锚定，而不是凭感觉写的数字，
 *     这样"哪个面比哪个面亮"的关系保持原样。
 *  3) 支持 anchor：把页面自身底色的亮度映射到 Dracula 底色 #282a36 的亮度，
 *     整个页面因此整体落在 Dracula 的明暗阶梯上（卡片自动变成 #343746 之类）。
 *  4) 彩色（chroma ≥ 0.25）直接用 Dracula 对应色（红/橙/黄/绿/青/紫/粉），
 *     只有淡彩才与白/黑混合，避免把鲜亮的强调色洗成灰绿。
 */

const DSH_DRACULA = (() => {
  // 亮度锚点均取自 Dracula 标准色的真实线性亮度
  const RAMP = [
    [0.103, [0x19, 0x1a, 0x21]], // 最深：横幅 / 代码块底
    [0.135, [0x21, 0x22, 0x2c]], // 侧栏 / 层 1
    [0.166, [0x28, 0x2a, 0x36]], // 页面底色
    [0.218, [0x34, 0x37, 0x46]], // 层 2 / 卡片
    [0.282, [0x44, 0x47, 0x5a]], // 当前行 / 气泡 / hover
    [0.448, [0x62, 0x72, 0xa4]], // 注释蓝灰
    [0.604, [0x95, 0x99, 0xb3]], // 次级文字
    [0.800, [0xc8, 0xcb, 0xe0]], // 浅色次要文字
    [0.971, [0xf8, 0xf8, 0xf2]] // 前景白
  ];
  const ACCENTS = [
    [15, [0xff, 0x55, 0x55]], // 红
    [45, [0xff, 0xb8, 0x6c]], // 橙
    [70, [0xf1, 0xfa, 0x8c]], // 黄
    [165, [0x50, 0xfa, 0x7b]], // 绿
    [200, [0x8b, 0xe9, 0xfd]], // 青
    [265, [0xbd, 0x93, 0xf9]], // 紫（也替蓝色）
    [320, [0xbd, 0x93, 0xf9]], // 紫
    [345, [0xff, 0x79, 0xc6]], // 粉
    [361, [0xff, 0x55, 0x55]]
  ];
  const DARK = [0x19, 0x1a, 0x21];
  const LIGHT = [0xf8, 0xf8, 0xf2];
  const BASE_LUMA = 0.166; // #282a36 的亮度
  const CHROMA_CUT = 0.12; // 低于此视为中性色
  const SOLID_CUT = 0.25; // 高于此视为鲜亮强调色，直接用 Dracula 色

  let anchor = null; // 页面自身底色的亮度；由画布代码运行时探测

  function parse(value) {
    if (typeof value !== "string") return null;
    const m = value.trim().match(/^rgba?\(([^)]+)\)$/i);
    if (m === null) return null;
    const parts = m[1].split(/[,\s/]+/).filter((p) => p.length > 0);
    if (parts.length < 3) return null;
    const r = Number(parts[0]);
    const g = Number(parts[1]);
    const b = Number(parts[2]);
    const a = parts.length > 3 ? Number(parts[3]) : 1;
    if (![r, g, b, a].every((n) => Number.isFinite(n))) return null;
    return { r, g, b, a: Math.min(1, Math.max(0, a)) };
  }
  function format(rgb, a) {
    const r = Math.round(Math.min(255, Math.max(0, rgb[0])));
    const g = Math.round(Math.min(255, Math.max(0, rgb[1])));
    const b = Math.round(Math.min(255, Math.max(0, rgb[2])));
    if (a === undefined || a >= 0.999) return `rgb(${r}, ${g}, ${b})`;
    if (a <= 0.001) return "rgba(0, 0, 0, 0)";
    return `rgba(${r}, ${g}, ${b}, ${Math.round(a * 1000) / 1000})`;
  }
  const luma = (rgb) => (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
  const chroma = (rgb) => (Math.max(rgb[0], rgb[1], rgb[2]) - Math.min(rgb[0], rgb[1], rgb[2])) / 255;
  function ramp(l) {
    if (l <= RAMP[0][0]) return RAMP[0][1];
    for (let i = 1; i < RAMP.length; i++) {
      if (l <= RAMP[i][0]) {
        const [l0, c0] = RAMP[i - 1];
        const [l1, c1] = RAMP[i];
        const t = (l - l0) / (l1 - l0 || 1);
        return [c0[0] + (c1[0] - c0[0]) * t, c0[1] + (c1[1] - c0[1]) * t, c0[2] + (c1[2] - c0[2]) * t];
      }
    }
    return RAMP[RAMP.length - 1][1];
  }
  function hue(rgb) {
    const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    if (d === 0) return 0;
    let h;
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    return h < 0 ? h + 360 : h;
  }
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  function accent(h) {
    for (const [max, rgb] of ACCENTS) if (h <= max) return rgb;
    return ACCENTS[ACCENTS.length - 1][1];
  }
  /** 把页面自身底色的亮度抬到 Dracula 底色，高于它的按比例拉伸到 1.0。 */
  function rescale(l) {
    if (anchor === null || !(anchor > 0.005 && anchor < 0.35)) return l;
    if (l <= anchor) return Math.max(0, BASE_LUMA * (l / anchor));
    return BASE_LUMA + (l - anchor) * ((1 - BASE_LUMA) / (1 - anchor));
  }

  /** CSS 颜色 → Dracula；无法解析或几乎透明时返回 null（保持原样）。 */
  function map(value) {
    const c = parse(value);
    if (c === null || c.a < 0.05) return null;
    const rgb = [c.r, c.g, c.b];
    const l = luma(rgb);
    const ch = chroma(rgb);
    let out;
    if (ch < CHROMA_CUT) {
      out = ramp(rescale(l));
    } else if (ch >= SOLID_CUT) {
      out = accent(hue(rgb));
    } else {
      const base = accent(hue(rgb));
      const baseL = luma(base);
      out = l > baseL ? mix(base, LIGHT, Math.min(0.8, (l - baseL) / (1 - baseL || 1))) : mix(base, DARK, Math.min(0.8, (baseL - l) / (baseL || 1)));
    }
    return format(out, c.a);
  }

  /**
   * 映射整段 background-image（渐变）：把里面的每个颜色停靠点分别映射到 Dracula，
   * 几何与 url(...) 图片保持不动。没有颜色被改动时返回 null。
   */
  function mapGradient(value) {
    if (typeof value !== "string" || value === "none" || value.indexOf("gradient") < 0) return null;
    let changed = false;
    const out = value.replace(/rgba?\([^)]+\)/g, (m) => {
      const mapped = map(m);
      if (mapped !== null && mapped !== m) { changed = true; return mapped; }
      return m;
    });
    return changed ? out : null;
  }

  return {
    map,
    mapGradient,
    parse,
    format,
    luma,
    chroma,
    ramp,
    hue,
    rescale,
    setAnchor(l) { anchor = Number.isFinite(l) ? l : null; },
    get anchor() { return anchor; },
    ACCENTS,
    RAMP
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = DSH_DRACULA;
