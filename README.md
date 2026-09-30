# dsh-client-ui-dracula

**DeepSeek Harness Web GUI 的 Dracula 深色主题** —— 把 VS Code 那套「吸血鬼」配色搬到 DSH 的网页界面上，顺带做了一组程序员向的排版调优。

[English](README.en.md)

```
底色 #282a36 · 当前行/气泡 #44475a · 前景 #f8f8f2 · 注释 #6272a4
青 #8be9fd · 绿 #50fa7b · 橙 #ffb86c · 粉 #ff79c6 · 紫 #bd93f9 · 红 #ff5555 · 黄 #f1fa8c
```

配色取自 [VS Code 的 Dracula 主题](https://draculatheme.com/)（MIT）。**只改深色模式**，切回浅色模式仍是出厂配色，依然可读。

## 它改了什么

| 范围 | 内容 |
|---|---|
| 配色（`lib/client.js` 第 11–12 节） | 页面/卡片/浮层/边框/文字/强调色/状态色、代码块与行内代码、语法高亮（shiki 令牌）、JSON 树、滚动条、选区、差异视图、新手引导渐变——全部重指到 Dracula 调色板 |
| 排版（第 0–10 节） | 等宽代码字体与 UI 字体、更紧的字号阶梯、正文宽度 1080px、代码块不折行可横向滚动、工具输出更高、12px 滚动条 |

实现上只有一张样式表，注入为 `<style data-plugin="dsh-client-ui-dracula">`，所有规则都挂在 `:root[data-dracula="on"]` 下，所以随时可以整页还原。

## 安装

`dsh-client-ui-dracula` 是一个自带 `dsh.bundle.patch` 的插件包：装进 profile 并把包名加进 `dsh.profile.bundles` 后，它会自己插入到 profile 的层栈里，无需手写 `cordis.patch.yml`。

### 桌面端（Electron，`desktop` profile）

桌面端的 profile 由宿主独占管理，命令行会拒绝直接操作（`profile "desktop" is managed exclusively by the Electron application`），所以走宿主自己的插件管理界面，或者手动装：

```powershell
# 1) 装进 desktop profile
cd $env:USERPROFILE\.dsh\profiles\desktop
pnpm add github:Erbsen16/dsh-client-ui-dracula

# 2) 把 "dsh-client-ui-dracula" 加进该目录 package.json 的 dsh.profile.bundles 数组

# 3) 重启宿主
```

### 其他 profile（`web` / `tui` / 自建）

```powershell
dsh plugin --profile web add github:Erbsen16/dsh-client-ui-dracula
```

`dsh plugin` 是 pnpm 的直通封装，所以任何 pnpm 能识别的来源都可以：npm 包名、`github:user/repo`、tarball URL、本地路径。

### 插件市场

DSH 的插件市场只安装 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 收录的来源；想上架就往那个仓库提一个条目的 PR，市场与官网会自动同步。

## 调节

打开 `lib/client.js`，第 0 节就是三个旋钮：

```js
'--dracula-content-width: 1080px;'   // 正文/输入框宽度（出厂值 748px）
'--dracula-code-font: "Cascadia Mono", ...';  // 代码字体
'--dracula-ui-font: "Segoe UI Variable Text", ...';  // 界面字体，想全等宽就写 var(--dracula-code-font)
```

改完保存，客户端 HMR 会把样式表热重载进已打开的页面，不用刷新。

临时开关（DevTools 控制台）：`__dracula.set(false)` 立刻还原，`__dracula.set(true)` 再打开。

## 卸载

把包名从 `dsh.profile.bundles` 里删掉、`pnpm remove dsh-client-ui-dracula`，然后重启宿主。

## 与 `dsh-client-ui-devtune` 的关系

本插件整理自作者本机在用的 `dsh-client-ui-devtune`——同一份样式表，标识（包名、`data-dracula` 开关、`__dracula` 全局）全部换成了 dracula。两个一起装不会出错（各注入一份几乎相同的规则），但没有必要，建议只留一个。

## extras/platform-purple

内嵌的 DeepSeek 开放平台页面（设置 → 账号与余额 → 查询用量）是 `platform.deepseek.com` 的远程网页，样式由它自己的 JS 运行时生成、类名带哈希，DSH 侧的样式表够不到。`extras/platform-purple/` 改的是 `app.asar` 里的 preload：遍历 DOM，把每个元素的实际颜色按 Dracula 调色板重映射（保持明暗关系与对比度），并跟随 MutationObserver 重绘。

它**不是插件**，不能用插件管理器安装，宿主升级会覆盖 `app.asar`，属于非官方修改、风险自负。用法见 [extras/platform-purple/README.md](extras/platform-purple/README.md)。

## 目录结构

```
lib/client.js              浏览器半侧：唯一的一张样式表
lib/index.js               宿主半侧：空实现，只为让 dsh.client 被 Loader 看见
cordis.patch.yml           bundle patch：把 ui-dracula 这一行插进 profile
scripts/smoke.mjs          npm test：无依赖的 DOM 桩冒烟测试
extras/platform-purple/    可选：内嵌平台页面调色（改 app.asar）
```

## 兼容性

面向 **DSH 0.2.0-rc.2 / 0.1.7-rc.2** 一代的前端构建。样式表的主通道是产品的 CSS 变量（`--dsw-*`、`--shiki-*`、`--json-tree-*`），比较稳；另有少量规则直接点名带哈希的 CSS Module 类名（`.wSkVaW_root`、`._Xvjua_body` 等），DSH 升级后这些类名可能改名——那几条细化规则会失效，但不会有任何报错。

## 许可

[MIT](LICENSE)。配色方案来自 [Dracula Theme](https://draculatheme.com/)（MIT）。
