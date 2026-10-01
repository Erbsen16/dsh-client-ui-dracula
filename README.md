# dsh-client-ui-dracula

给 DeepSeek Harness 的 Web 界面换一套 [Dracula](https://draculatheme.com/) 配色，就是 VS Code 上那个「吸血鬼」主题的色板。顺手把代码区和排版也调了一遍。

[English](README.en.md)

```
底色 #282a36   当前行/气泡 #44475a   前景 #f8f8f2   注释 #6272a4
青 #8be9fd   绿 #50fa7b   橙 #ffb86c   粉 #ff79c6   紫 #bd93f9   红 #ff5555   黄 #f1fa8c
```

配色只管深色模式。设置里切回浅色还是官方那套，不会出现浅底配浅紫字。

## 改了什么

颜色不是一个个选择器去覆盖，而是把产品自己的语义色令牌（`--dsw-*`、`--shiki-*`、`--json-tree-*`）整体重指到 Dracula。页面、卡片、浮层、边框、文字、强调色、状态色、代码块、行内代码、语法高亮、JSON 树、滚动条、选区和文件差异视图都跟着变；产品原来「哪一层该比哪一层亮」的判断保留着，只换颜色。

排版上动了几处：

- 代码字体和界面字体换成编程向的字体栈（默认 Cascadia Mono / Segoe UI Variable Text），中文回退到雅黑、苹方
- 字号阶梯整体收紧一档，行高也压了一点
- 正文列宽从出厂的 748px 放到 1080px
- 代码块不折行，改成横向滚动。出厂是 `pre-wrap` + `break-all`，长标识符会被从中间切断
- 工具输出区更高一截，滚动条 12px

整套东西就是一张样式表，注入成 `<style data-plugin="dsh-client-ui-dracula">`，规则全挂在 `:root[data-dracula="on"]` 底下。所以摘掉这个属性，页面立刻回原样，不用刷新也不用重启。

## 截图

![对话与代码块](docs/00-chat.webp)

*对话页。语法高亮、代码块底色、气泡和正文列宽，主题主要就花在这些地方。*

![首屏与侧栏](docs/01-home.webp)

*首屏和侧栏。底色 `#282a36`，新会话按钮、选中态和强调色走紫色。*

![设置面板](docs/02-settings.webp)

*设置面板。因为 `--dsw-*` 是整体重指的，开关、下拉、卡片、侧栏选中项一起变，不是逐个打补丁。*

内嵌的开放平台页面（属于 `extras/`，不是插件）用的是同一套色板：

![开放平台页面](docs/03-platform-page.webp)

## 安装

包本身带 `dsh.bundle.patch`。装进 profile、并且出现在 `dsh.profile.bundles` 里之后，它会自己把 `ui-dracula` 那一行插进层栈，不用手写 `cordis.patch.yml`。

桌面端走图形界面最省事：设置 → 插件 → 右上角 **+ 添加插件**，填下面任意一个。

| 填什么 | 从哪拉 |
|---|---|
| `dsh-client-ui-dracula` | npm，安装源选「中国大陆镜像源」。包在 [npm 上](https://www.npmjs.com/package/dsh-client-ui-dracula) |
| `https://github.com/Erbsen16/dsh-client-ui-dracula` | GitHub 的源码归档，不经过 npm |

装完界面要是没动静，先去看 profile 的 `dsh.profile.bundles` 里有没有 `dsh-client-ui-dracula`。我这边实测官方管理器有时只装了依赖、忘了同步这个列表，而插件只有在被当成 bundle 时才会插入那一行。补上一行，HMR 会立刻重组；还不行就重启宿主。

`desktop` 之外的 profile 用命令行：

```powershell
dsh plugin --profile web add dsh-client-ui-dracula                    # 从 npm
dsh plugin --profile web add github:Erbsen16/dsh-client-ui-dracula    # 从 GitHub
```

`dsh plugin` 是 pnpm 的直通封装，任何 pnpm 认识的来源都行：npm 包名、`github:user/repo`、tarball 地址、本地目录。

`desktop` profile 是宿主独占的，命令行会直接拒绝（`profile "desktop" is managed exclusively by the Electron application`），要手动装得这样：

```powershell
cd $env:USERPROFILE\.dsh\profiles\desktop
pnpm add github:Erbsen16/dsh-client-ui-dracula
# 再把 "dsh-client-ui-dracula" 加进这个目录 package.json 的 dsh.profile.bundles
```

这个插件还没进 DSH 的插件市场——市场只认 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 收录的来源，上架要往那个仓库提一条条目。

## 调参

`lib/client.js` 第 0 节就是三个变量：

```js
'--dracula-content-width: 1080px;'                    // 正文和输入框宽度，出厂 748px
'--dracula-code-font: "Cascadia Mono", ...';          // 代码字体
'--dracula-ui-font: "Segoe UI Variable Text", ...';   // 界面字体，想全等宽就写 var(--dracula-code-font)
```

保存就行，客户端 HMR 会把样式表重载进已经打开的页面。

想临时对比：DevTools 控制台里 `__dracula.set(false)` 关掉，`__dracula.set(true)` 开回来。

## 卸载

从 `dsh.profile.bundles` 里删掉包名，`pnpm remove dsh-client-ui-dracula`，然后重启宿主。

## extras：内嵌的开放平台页面

设置 → 账号与余额 → 查询用量，打开的是 `platform.deepseek.com` 的远程网页。它的样式由自己的 JS 运行时生成、类名带哈希，DSH 这边的样式表够不到。

`extras/platform-purple/` 走的是另一条路：改 `app.asar` 里的 preload，遍历 DOM 把每个元素的实际颜色按 Dracula 重新映射，保持明暗关系和对比度，再用 MutationObserver 跟着 React 重渲染重绘。

它不是插件，插件管理器装不了；宿主升级会把 `app.asar` 覆盖回去，属于非官方改动、风险自负。用法见 [extras/platform-purple/README.md](extras/platform-purple/README.md)。

## 文件

```
lib/client.js        浏览器半侧，唯一的一张样式表
lib/index.js         宿主半侧，空实现，只是让 dsh.client 被 Loader 看见
cordis.patch.yml     bundle patch
scripts/smoke.mjs    npm test：DOM 桩上的冒烟测试，无依赖
docs/                README 的截图
extras/              内嵌平台页面的调色补丁，不是插件
```

## 兼容性

对着 DSH 0.2.0-rc.2 / 0.1.7-rc.2 那一代前端写的。样式表主要走产品的 CSS 变量（`--dsw-*`、`--shiki-*`、`--json-tree-*`），这块比较稳；另外有一小部分规则直接点名了带哈希的 CSS Module 类名（`.wSkVaW_root`、`._Xvjua_body` 这些），DSH 升级时类名一改，这几条细化规则就失效了——不报错，只是那部分退回官方样式。

## 许可

[MIT](LICENSE)。色板来自 [Dracula Theme](https://draculatheme.com/)，也是 MIT。
