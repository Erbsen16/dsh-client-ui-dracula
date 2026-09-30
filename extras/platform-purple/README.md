# dsh-platform-purple

让桌面端内嵌的 **DeepSeek 开放平台页面**（设置 → 账号与余额 → 查询用量 打开的那个网页）呈现 Dracula（VS Code「吸血鬼」）配色。它是 `dsh-client-ui-dracula` 仓库里的附加件，**不是 DSH 插件**。

![开放平台页面打上补丁后](../../docs/03-platform-page.png)

*打上补丁后的用量页面：卡片、文字、图表轴与滚动条都落在 Dracula 的明暗阶梯上。*

## 为什么需要单独一套

- 那个页面是 `platform.deepseek.com` 的远程网页，宿主用 Electron 的 `WebContentsView` 打开它，样式由它自己的 JS 运行时生成（类名带哈希、没有 CSS 变量），所以 DSH 侧的样式表够不到它。
- 宿主打开它时会注入 `app.asar!/lib/preload-platform-account.cjs` 作为 preload。这个脚本就是唯一可以不依赖类名的注入口。

## 打了什么

给该 preload 追加一段本地补丁（源码里搜 `dsh-platform-purple`）：

- 在页面里遍历 DOM，用 `dracula-map.js` 把每个元素**实际算出来的**背景色、文字色、四边边框色、渐变停靠点映射到 Dracula 调色板：以页面自身底色的亮度为锚，整体落到 Dracula 的明暗阶梯上，鲜艳强调色直接取 Dracula 对应色，中性色按真实相对亮度插值。
- 同时统一滚动条与选中色。
- `MutationObserver` + 2.5 秒定时兜底重绘，React 重渲染之后依旧生效。

运行状态会写进页面的 `localStorage.dshPlatformPurple`（跑了几轮、改了多少个元素、锚点亮度等），排查时可以直接看。想调节强度就改 `dracula-map.js` 里的 `CHROMA_CUT` / `SOLID_CUT` / `RAMP`；想彻底关掉就删掉 preload 里整段 `//#region dsh-platform-purple ... //#endregion`，或 `--revert`。

## 用法

```powershell
# 0) 换机器先指路：宿主安装目录下那个装着 app.asar 的 resources 文件夹
$env:DSH_RESOURCES = 'D:\DeepSeek\resources'   # 或改 patch-platform-purple.mjs 里的 DEFAULT_RESOURCES

# 1) 生成 app.asar.new 并逐项校验（不动原文件，可以在应用运行时跑）
node patch-platform-purple.mjs

# 2) 退出应用后安装（会先把原 app.asar 备份成 app.asar.bak-purple-<时间戳>）
node patch-platform-purple.mjs --install

# 3) 查看状态 / 还原
node patch-platform-purple.mjs --status
node patch-platform-purple.mjs --revert
```

嫌手动关应用麻烦就用安装助手：它自己停宿主、等文件释放、重试安装、校验、再把宿主拉起来，全过程写进 `install.log`。

```powershell
# -Exe 只在宿主不在默认路径时需要
powershell -NoProfile -ExecutionPolicy Bypass -File install-platform-purple.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File install-platform-purple.ps1 -DryRun
```

## 注意

- **应用升级会覆盖 `app.asar`**：升级后重新跑一次 `node patch-platform-purple.mjs` 再 `--install` 即可（脚本会以最近一次的原始备份为基底重建，不会叠补丁）。
- 归档头部每个文件都带 SHA-256 完整性哈希，脚本会连同哈希一起更新，并做全库校验与抽查比对，校验不通过就不写文件。
- 替换用「重命名 + 回滚」两步走：应用还占着文件时（EBUSY/EPERM）不会改坏任何东西。
- 备份文件约 121 MB，确认新版本没问题后可以自行删除。
- 这是对宿主安装目录的非官方修改，风险自负；出问题用 `--revert` 还原，或把 `app.asar.bak-purple-*` 复制回 `app.asar`。
