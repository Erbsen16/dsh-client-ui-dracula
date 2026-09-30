/**
 * dsh-client-ui-dracula — DSH Web GUI 的 Dracula 深色主题（浏览器半侧）。
 *
 * 一个样式表，在 materialization 时注入为
 * `<style data-plugin="dsh-client-ui-dracula">`（客户端 HMR 在重载时按这个
 * 标签 id 移除）。所有规则只在 `<html data-dracula="on">` 时生效，所以
 * `__dracula.set(false)`（或直接去掉该属性）可以立刻把页面还原成出厂外观。
 *
 * 配色取自 VS Code 的 Dracula 主题（draculatheme.com，MIT）：底色 #282a36、
 * 当前行 #44475a、前景 #f8f8f2、注释 #6272a4、青 #8be9fd、绿 #50fa7b、
 * 橙 #ffb86c、粉 #ff79c6、紫 #bd93f9、红 #ff5555、黄 #f1fa8c。
 * 只改深色模式，浅色模式保持出厂配色，切回浅色依然可读。
 *
 * 第 0 节是三个可调旋钮，第 1–10 节是程序员向排版调优（字体、字号密度、
 * 正文宽度、代码面、滚动条），第 11–12 节是 Dracula 配色本身。
 */
window.__ModuleLoader__.load({
	id: "dsh-client-ui-dracula",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		/**
		 * Browser half of `dsh-client-ui-dracula`: one stylesheet, injected as
		 * `<style data-plugin="dsh-client-ui-dracula">` at factory time (the
		 * documented materialization side effect, and the tag id the client HMR
		 * driver removes on reload).
		 *
		 * Layering rules, so this sheet stays order-independent against the
		 * product's own stylesheets:
		 *   - token overrides ride `:root[data-dracula="on"]` / `...[data-dracula="on"] body`,
		 *     out-specifying the product's `:root`, `body` and `body[data-ds-dark-theme]` rules;
		 *   - element/class-level refinements are scoped under the same attribute;
		 *   - every rule applies only while `<html data-dracula="on">` is set, so
		 *     `__dracula.set(false)` (or removing the attribute) reverts the page live.
		 *
		 * Selectors naming hashed CSS-module classes (`.wSkVaW_root`, `._Xvjua_body`,
		 * …) are coupled to the installed frontend build; a DSH upgrade may rename
		 * them, which costs the refinement but breaks nothing.
		 */
		var ID = "dsh-client-ui-dracula";
		var MARKER = "data-dracula";
		var ON = ':root[data-dracula="on"]';

		var CSS = [
			/* ── 0. Knobs: the three values worth tuning per person ─────────── */
			/* Editing these and saving the file hot-reloads the stylesheet into
			   every open page (the client HMR chain watches this bundle). */
			ON + ', ' + ON + ' body {',
			/* Chat/composer column. The shipped value is 748px; the composer card
			   follows through its own calc(). */
			'  --dracula-content-width: 1080px;',
			/* Programming font — first installed face wins. */
			'  --dracula-code-font: "Cascadia Mono", "Cascadia Code", "JetBrains Mono", "Fira Code", "SF Mono", Consolas, "Liberation Mono", Menlo, "Microsoft YaHei", "PingFang SC";',
			/* UI font. For an all-monospace interface, set this to
			   `var(--dracula-code-font)` — CJK still resolves through the same
			   fallbacks, so Chinese text keeps a real face. */
			'  --dracula-ui-font: "Segoe UI Variable Text", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;',
			'}',

			/* ── 1. Fonts ────────────────────────────────────────────────────── */
			/* A bare `monospace` tail would make Windows render CJK as SimSun, so
			   the stack ends in CJK faces instead (same reason the product's own
			   stack does). */
			ON + ', ' + ON + ' body {',
			'  --ds-font-family-code: var(--dracula-code-font);',
			'  --dsw-font-family: var(--dracula-ui-font);',
			'}',

			/* ── 2. Density: the UI type scale the product actually consumes ─── */
			/* Line heights tighten first (free vertical space), then the two
			   largest sizes step down 1px; every sub-token is restated so the
			   composite `font` shorthands and the `-font-*` longhands agree. */
			ON + ', ' + ON + ' body {',
			'  --dsw-font-base-16: 15px/23px var(--dsw-font-family);',
			'  --dsw-font-base-16-font-family: var(--dsw-font-family);',
			'  --dsw-font-base-16-font-size: 15px;',
			'  --dsw-font-base-strong-16: 500 15px/23px var(--dsw-font-family);',
			'  --dsw-font-base-strong-16-font-family: var(--dsw-font-family);',
			'  --dsw-font-base-strong-16-font-size: 15px;',
			'  --dsw-font-m-18: 500 15px/25px var(--dsw-font-family);',
			'  --dsw-font-m-18-font-family: var(--dsw-font-family);',
			'  --dsw-font-m-18-font-size: 15px;',
			'  --dsw-font-s-14: 14px/21px var(--dsw-font-family);',
			'  --dsw-font-s-14-font-family: var(--dsw-font-family);',
			'  --dsw-font-s-14-font-size: 14px;',
			'  --dsw-font-s-strong-14: 500 14px/21px var(--dsw-font-family);',
			'  --dsw-font-s-strong-14-font-family: var(--dsw-font-family);',
			'  --dsw-font-s-strong-14-font-size: 14px;',
			'  --dsw-font-xs-13: 13px/19px var(--dsw-font-family);',
			'  --dsw-font-xs-13-font-family: var(--dsw-font-family);',
			'  --dsw-font-xs-13-font-size: 13px;',
			'  --dsw-font-xs-strong-13: 500 13px/19px var(--dsw-font-family);',
			'  --dsw-font-xs-strong-13-font-family: var(--dsw-font-family);',
			'  --dsw-font-xs-strong-13-font-size: 13px;',
			'  --dsw-font-xxs-12: 12px/17px var(--dsw-font-family);',
			'  --dsw-font-xxs-12-font-family: var(--dsw-font-family);',
			'  --dsw-font-xxs-12-font-size: 12px;',
			'  --dsw-font-xxs-strong-12: 500 12px/17px var(--dsw-font-family);',
			'  --dsw-font-xxs-strong-12-font-family: var(--dsw-font-family);',
			'  --dsw-font-xxs-strong-12-font-size: 12px;',
			'  --dsw-font-xxxs-11: 11px/15px var(--dsw-font-family);',
			'  --dsw-font-xxxs-11-font-size: 11px;',
			'  --dsw-font-xxxs-strong-11: 500 11px/15px var(--dsw-font-family);',
			'  --dsw-font-xxxs-strong-11-font-size: 11px;',
			'}',

			/* ── 3. Prose (markdown) and code type scale ─────────────────────── */
			ON + ', ' + ON + ' body {',
			'  --dsw-font-markdown-base: 15px/25px var(--dsw-font-family);',
			'  --dsw-font-markdown-base-font-family: var(--dsw-font-family);',
			'  --dsw-font-markdown-base-font-size: 15px;',
			'  --dsw-font-markdown-base-strong: 600 15px/25px var(--dsw-font-family);',
			'  --dsw-font-markdown-base-strong-font-family: var(--dsw-font-family);',
			'  --dsw-font-markdown-base-strong-font-size: 15px;',
			'  --dsw-font-markdown-base-italic: italic 15px/25px var(--dsw-font-family);',
			'  --dsw-font-markdown-base-italic-font-family: var(--dsw-font-family);',
			'  --dsw-font-markdown-base-italic-font-size: 15px;',
			'  --dsw-font-markdown-base-strong-italic: italic 600 15px/25px var(--dsw-font-family);',
			'  --dsw-font-markdown-base-strong-italic-font-family: var(--dsw-font-family);',
			'  --dsw-font-markdown-base-strong-italic-font-size: 15px;',
			'  --dsw-font-markdown-h1: 700 22px/30px var(--dsw-font-family);',
			'  --dsw-font-markdown-h1-font-family: var(--dsw-font-family);',
			'  --dsw-font-markdown-h1-font-size: 22px;',
			'  --dsw-font-markdown-h2: 700 20px/28px var(--dsw-font-family);',
			'  --dsw-font-markdown-h2-font-family: var(--dsw-font-family);',
			'  --dsw-font-markdown-h2-font-size: 20px;',
			'  --dsw-font-markdown-h3: 700 18px/26px var(--dsw-font-family);',
			'  --dsw-font-markdown-h3-font-family: var(--dsw-font-family);',
			'  --dsw-font-markdown-h3-font-size: 18px;',
			'  --dsw-font-markdown-h4: 600 16px/25px var(--dsw-font-family);',
			'  --dsw-font-markdown-h4-font-family: var(--dsw-font-family);',
			'  --dsw-font-markdown-h4-font-size: 16px;',
			'  --dsw-font-markdown-table: 14px/23px var(--dsw-font-family);',
			'  --dsw-font-markdown-table-font-family: var(--dsw-font-family);',
			'  --dsw-font-markdown-table-font-size: 14px;',
			'  --dsw-font-markdown-table-head: 500 14px/23px var(--dsw-font-family);',
			'  --dsw-font-markdown-table-head-font-family: var(--dsw-font-family);',
			'  --dsw-font-markdown-table-head-font-size: 14px;',
			'  --dsw-font-markdown-small: 13px/21px var(--dsw-font-family);',
			'  --dsw-font-markdown-small-font-family: var(--dsw-font-family);',
			'  --dsw-font-markdown-small-font-size: 13px;',
			'  --dsw-font-markdown-small-strong: 600 13px/21px var(--dsw-font-family);',
			'  --dsw-font-markdown-small-strong-font-family: var(--dsw-font-family);',
			'  --dsw-font-markdown-small-strong-font-size: 13px;',
			'  --dsw-font-markdown-small-italic: italic 13px/21px var(--dsw-font-family);',
			'  --dsw-font-markdown-small-italic-font-family: var(--dsw-font-family);',
			'  --dsw-font-markdown-small-italic-font-size: 13px;',
			'  --dsw-font-markdown-small-strong-italic: italic 600 13px/21px var(--dsw-font-family);',
			'  --dsw-font-markdown-small-strong-italic-font-family: var(--dsw-font-family);',
			'  --dsw-font-markdown-small-strong-italic-font-size: 13px;',
			/* Inline code and code blocks step UP while prose steps down: code is
			   the thing being read here, and 13px blocks in a 15px column read as
			   fine print. */
			'  --dsw-font-markdown-code: 13.5px/22px var(--ds-font-family-code);',
			'  --dsw-font-markdown-code-font-family: var(--ds-font-family-code);',
			'  --dsw-font-markdown-code-font-size: 13.5px;',
			'  --dsw-font-markdown-code-block: 13.5px/21px var(--ds-font-family-code);',
			'  --dsw-font-markdown-code-block-font-family: var(--ds-font-family-code);',
			'  --dsw-font-markdown-code-block-font-size: 13.5px;',
			'  --dsw-font-markdown-code-block-small: 12.5px/19px var(--ds-font-family-code);',
			'  --dsw-font-markdown-code-block-small-font-family: var(--ds-font-family-code);',
			'  --dsw-font-markdown-code-block-small-font-size: 12.5px;',
			'}',

			/* ── 4. Code hygiene ─────────────────────────────────────────────── */
			/* CSS defaults `tab-size` to 8, which wrecks indentation in rendered
			   snippets; 4 is the house width everywhere code can appear. */
			ON + ' pre, ' + ON + ' code, ' + ON + ' kbd, ' + ON + ' samp, ' + ON + ' textarea { tab-size: 4; -moz-tab-size: 4; }',

			/* ── 5. Wider reading column ─────────────────────────────────────── */
			/* 748px wraps most diffs and stack traces. The composer card's
			   max-width is a calc() over this same variable, so it follows. */
			ON + ' .wSkVaW_root { --dsh-chat-content-width: var(--dracula-content-width); }',

			/* ── 6. Tool & command output: more rows, larger code, no fine print ─ */
			ON + ' ._Xvjua_body { max-height: 420px; }',
			ON + ' .pC0e7a_body { max-height: 320px; font: 400 12.5px/18px var(--ds-font-family-code); }',

			/* ── 7. Code surfaces: keep code aligned, scroll instead of reflowing ─ */
			/* The product renders chat code blocks with `white-space: pre-wrap;
			   word-break: break-all`, which splits identifiers mid-token and
			   destroys indentation. Its own diff/read/search blocks already use
			   `white-space: pre` per line, so this only makes the markdown block
			   agree with them. */
			ON + ' ._block_178r4_4 :where(pre) { white-space: pre; word-break: normal; overflow-wrap: normal; }',
			ON + ' .ydkMvW_code { white-space: pre; overflow-x: auto; }',
			/* Tool-view terminal output: 224px shows about a dozen lines. */
			ON + ' .CY-8Ka_terminal { --dsl-terminal-output-max-height: 480px; }',
			/* Tables: trim vertical padding only — the product's own first/last
			   child rules own the outer edges, and keep them. */
			ON + ' ._tableScroll_1nba0_174 th, ' + ON + ' ._tableScroll_1nba0_174 td { padding-top: 8px; padding-bottom: 8px; }',

			/* ── 8. Composer: mono, one step tighter (mirror + backdrop must match
			         the textarea, since they drive its autosize) ─────────────── */
			ON + ' .uV2eYG_card { font-size: 14px; line-height: 22px; }',
			ON + ' .uV2eYG_input, ' + ON + ' .uV2eYG_mirror, ' + ON + ' .uV2eYG_backdrop { font-family: "DshChipCell", var(--ds-font-family-code); }',

			/* ── 9. Message surfaces: follow the prose scale ─────────────────── */
			ON + ' .gdEzaW_bubble { font-size: 15px; line-height: 23px; }',
			ON + ' .QWLzlG_thinkBody { font-size: 13.5px; line-height: 22px; }',

			/* ── 10. Scrollbars: 12px grab area, slimmer-looking thumb ───────── */
			/* The thumbs are re-coloured, so the product's own hover rule is
			   restated here — a higher-specificity `background` would otherwise
			   kill hover feedback. */
			ON + ' body { --dsh-scrollbar-width: 12px; }',
			ON + ' ::-webkit-scrollbar { width: 12px; height: 12px; }',
			ON + ' ::-webkit-scrollbar-thumb { background: var(--dsh-scrollbar-thumb); background-clip: content-box; border: 3px solid transparent; border-radius: 8px; }',
			ON + ' ::-webkit-scrollbar-thumb:hover { background: var(--dsh-scrollbar-thumb-hover); background-clip: content-box; }',

			/* ── 11. Dracula palette — the VS Code "vampire" colours ─────────── */
			/* Canonical values from draculatheme.com: background #282a36,
			   current line / selection #44475a, foreground #f8f8f2, comment
			   #6272a4, cyan #8be9fd, green #50fa7b, orange #ffb86c, pink #ff79c6,
			   purple #bd93f9, red #ff5555, yellow #f1fa8c. Dark mode only: the
			   shipped light palette is left intact, so switching Appearance back
			   to light still gives a legible page.
			   The semantic alias layer is re-pointed rather than the raw static
			   ramp, which keeps the product's own "which surface gets which
			   elevation" decisions and only changes the colours. */
			ON + ' body[data-ds-dark-theme] {',
			/* surfaces */
			'  --dsw-alias-bg-base: #282a36;',
			'  --dsw-alias-bg-layer-1: #21222c;',
			'  --dsw-alias-bg-layer-2: #343746;',
			'  --dsw-alias-bg-layer-3: #44475a;',
			'  --dsw-alias-bg-overlay: #343746;',
			'  --dsw-alias-bg-multi-select: #343746;',
			'  --dsw-alias-bg-module-platform: #21222c;',
			'  --dsw-alias-bg-skeleton: rgba(248, 248, 242, 0.08);',
			'  --dsw-alias-bg-mask-1: rgba(25, 26, 33, 0.6);',
			'  --dsw-alias-bg-mask-2: rgba(25, 26, 33, 0.3);',
			'  --dsw-alias-bg-mask-3: rgba(25, 26, 33, 0.55);',
			'  --dsw-alias-bg-mask-photo: rgba(25, 26, 33, 0.9);',
			'  --dsw-alias-bg-mask-drop: rgba(40, 42, 54, 0.7);',
			/* text: white foreground, comment-blue for anything dimmed */
			'  --dsw-alias-label-primary: #f8f8f2;',
			'  --dsw-alias-label-primary-dimmed: #f8f8f2;',
			'  --dsw-alias-label-secondary: #f8f8f2;',
			'  --dsw-alias-label-tertiary: #6272a4;',
			'  --dsw-alias-label-caption: #6272a4;',
			'  --dsw-alias-label-dimmed: #44475a;',
			'  --dsw-alias-label-primary-bluish: #bd93f9;',
			'  --dsw-alias-label-primary-foreground: #282a36;',
			'  --dsw-alias-label-primary-inverted: #282a36;',
			/* borders: the comment blue at low alpha reads as Dracula's edge */
			'  --dsw-alias-border-l1: rgba(98, 114, 164, 0.35);',
			'  --dsw-alias-border-l2: rgba(98, 114, 164, 0.5);',
			'  --dsw-alias-border-l2-darkmode-thin: rgba(98, 114, 164, 0.35);',
			'  --dsw-alias-border-l3: rgba(98, 114, 164, 0.65);',
			'  --dsw-alias-border-l4: rgba(98, 114, 164, 0.85);',
			'  --dsw-alias-border-inverted: rgba(40, 42, 54, 0.08);',
			'  --dsw-alias-border-inverted2: rgba(40, 42, 54, 0.12);',
			/* accent: purple, with cyan for informational affordances */
			'  --dsw-alias-brand-primary: #bd93f9;',
			'  --dsw-alias-brand-text: #bd93f9;',
			'  --dsw-alias-brand-primary-invert: #282a36;',
			'  --dsw-alias-button-primary-fill: #bd93f9;',
			'  --dsw-alias-button-primary-hover: #caa9fa;',
			'  --dsw-alias-button-primary-dimmed: #44475a;',
			'  --dsw-alias-button-contrast-fill: #f8f8f2;',
			'  --dsw-alias-button-elevated-fill: #343746;',
			'  --dsw-alias-button-floating-fill: #343746;',
			'  --dsw-alias-button-floating-hover: #44475a;',
			'  --dsw-alias-button-ghost-active-fill: #44475a;',
			'  --dsw-alias-button-ghost-active-hover: #343746;',
			'  --dsw-alias-button-ghost-active-border: #bd93f9;',
			'  --dsw-alias-button-info-fill: #8be9fd;',
			'  --dsw-alias-button-info-hover: #9ff3ff;',
			'  --dsw-alias-button-tool-bar-fill: rgba(68, 71, 90, 0.55);',
			'  --dsw-alias-button-tool-bar-hover: rgba(68, 71, 90, 0.7);',
			'  --dsw-alias-button-tool-bar-fill-invisible: rgba(40, 42, 54, 0.36);',
			'  --dsw-alias-interactive-bg-hover: rgba(248, 248, 242, 0.08);',
			'  --dsw-alias-interactive-bg-hover-solid: #343746;',
			'  --dsw-alias-interactive-bg-active: rgba(248, 248, 242, 0.14);',
			'  --dsw-alias-interactive-bg-hover-accent: rgba(189, 147, 249, 0.24);',
			'  --dsw-alias-interactive-bg-hover-danger: rgba(255, 85, 85, 0.15);',
			/* states: Dracula's red / green / orange */
			'  --dsw-alias-state-business-primary: #bd93f9;',
			'  --dsw-alias-state-business-tertiary: rgba(189, 147, 249, 0.16);',
			'  --dsw-alias-state-error-primary: #ff5555;',
			'  --dsw-alias-state-error-secondary: #ff6e6e;',
			'  --dsw-alias-state-success-primary: #50fa7b;',
			'  --dsw-alias-state-success-secondary: #69ff94;',
			'  --dsw-alias-state-success-tertiary: rgba(80, 250, 123, 0.14);',
			'  --dsw-alias-state-warn-primary: #ffb86c;',
			'  --dsw-alias-state-warn-secondary: #ffcaa0;',
			'  --dsw-alias-state-warn-label: #ffb86c;',
			'  --dsw-alias-state-warn-tertiary: rgba(255, 184, 108, 0.14);',
			/* code surfaces: one step darker than the page, banner darker still */
			'  --dsw-alias-markdown-code-block: #21222c;',
			'  --dsw-alias-markdown-code-block-banner: #191a21;',
			'  --dsw-alias-markdown-inline-code: #343746;',
			'  --dsw-alias-markdown-citation: #343746;',
			'  --dsw-alias-markdown-tag: #343746;',
			'  --dsw-alias-markdown-placeholder: #44475a;',
			'  --dsw-alias-markdown-code-segment-selected: #44475a;',
			'  --dsw-alias-markdown-code-segment-unselected: #343746;',
			/* scrollbars, pills */
			'  --dsw-alias-scrollbar-bg-l1: #44475a;',
			'  --dsw-alias-scrollbar-bg-l2: #6272a4;',
			'  --dsw-alias-scrollbar-hover-l1: #6272a4;',
			'  --dsw-alias-scrollbar-hover-l2: #8be9fd;',
			'  --dsw-alias-toast-bg: #44475a;',
			'  --dsw-alias-tooltip-bg: #44475a;',
			'  --dsw-hovercard-bg: #343746;',
			/* named surfaces: sidebar recessed, menus raised, bubbles on current-line */
			'  --dsw-specific-bubble: #44475a;',
			'  --dsw-specific-bubble-highlight: #bd93f9;',
			'  --dsw-specific-input-major: #21222c;',
			'  --dsw-specific-login-input: #21222c;',
			'  --dsw-specific-menu: #44475a;',
			'  --dsw-specific-selector: #343746;',
			'  --dsw-specific-sidebar-fill: #21222c;',
			'  --dsw-specific-sidebar-nav-item-hover: #343746;',
			'  --dsw-specific-sidebar-nav-item-active: #44475a;',
			'  --dsw-specific-sidebar-nav-item-active-accent: #bd93f9;',
			'  --dsw-specific-tip: #21222c;',
			/* Syntax highlighting: the token slots the product's shiki theme
			   exposes, re-pointed to Dracula's keyword/function/string colours. */
			'  --shiki-foreground: #f8f8f2;',
			'  --shiki-background: #21222c;',
			'  --shiki-token-constant: #bd93f9;',
			'  --shiki-token-string: #f1fa8c;',
			'  --shiki-token-comment: #6272a4;',
			'  --shiki-token-keyword: #ff79c6;',
			'  --shiki-token-parameter: #ffb86c;',
			'  --shiki-token-function: #50fa7b;',
			'  --shiki-token-string-expression: #f1fa8c;',
			'  --shiki-token-punctuation: #f8f8f2;',
			'  --shiki-token-link: #8be9fd;',
			/* Components that read colours outside the alias layer: the JSON tree
			   viewer, and the turn-status shimmer's direct static uses. */
			'  --json-tree-property: #8be9fd;',
			'  --json-tree-string: #f1fa8c;',
			'  --json-tree-number: #bd93f9;',
			'  --json-tree-keyword: #ff79c6;',
			'  --json-tree-punctuation: #f8f8f2;',
			'  --json-tree-icon: #6272a4;',
			'  --json-tree-hover: rgba(98, 114, 164, 0.15);',
			/* The reasoning-text fade gradients are declared as literal colours
			   (not tokens), so they need naming here or they keep fading to the
			   shipped near-black page. */
			'  --dsw-linear-gradient-think: linear-gradient(180deg, #282a36 20.19%, rgba(40, 42, 54, 0) 100%);',
			'  --dsw-linear-think-select: linear-gradient(180deg, #44475a 20.19%, rgba(68, 71, 90, 0) 100%);',
			'  --dsw-static-deepseek-50: #f3ecfd;',
			'  --dsw-static-deepseek-100: #e4d1fb;',
			'  --dsw-static-deepseek-200: #d5b7f9;',
			'  --dsw-static-deepseek-300: #c9a3f8;',
			'  --dsw-static-deepseek-400: #caa9fa;',
			'  --dsw-static-deepseek-450: #c79bfa;',
			'  --dsw-static-deepseek-500: #bd93f9;',
			'  --dsw-static-deepseek-600: #9d6fd0;',
			'  --dsw-static-deepseek-800: #5a4670;',
			'  --dsw-static-deepseek-900: #2b2440;',
			'}',
			ON + ' body[data-ds-dark-theme] ::selection { background: rgba(189, 147, 249, 0.35); }',

			/* ── 12. Static ramps + onboarding: no stock-grey corners ────────── */
			/* Section 11 re-points the semantic alias layer, which covers every
			   component that reads those tokens. What is left is the places that
			   read the raw static ramps directly, plus the alias tokens this sheet
			   deliberately leaves alone — the document preview, the onboarding
			   hero, diff backgrounds, the idle state. Those still resolved to the
			   shipped blue-grey. Dark mode only, and the light ends of each ramp
			   stay untouched, so light overlays inside dark mode (a 5% white tile,
			   the light label on a dark document preview) keep their contrast. */
			ON + ' body[data-ds-dark-theme] {',
			/* Card fills that read the static grey ramp directly: the deliverables,
			   plan and schedule cards, and their hover. Lifted one step so a card
			   still reads as raised against the #282a36 page. */
			'  --dsw-static-neutral-850: #343746;',
			'  --dsw-static-neutral-800: #44475a;',
			/* Idle-state dot and the scrollbar bases. */
			'  --dsw-static-neutral-600: #6272a4;',
			/* Blue-grey surfaces still reached through alias tokens this sheet does
			   not restate (document preview, multi-select, onboarding card fill). */
			'  --dsw-static-neutral-bluish-950: #191a21;',
			'  --dsw-static-neutral-bluish-900: #191a21;',
			'  --dsw-static-neutral-bluish-875: #21222c;',
			'  --dsw-static-neutral-bluish-850: #343746;',
			'  --dsw-static-neutral-bluish-800: #343746;',
			'  --dsw-static-neutral-bluish-750: #44475a;',
			'  --dsw-static-neutral-bluish-700: #44475a;',
			'  --dsw-static-neutral-bluish-600: #6272a4;',
			/* Diff backgrounds and the state ramps the alias layer derives from. */
			'  --dsw-static-green-400: #69ff94;',
			'  --dsw-static-green-500: #50fa7b;',
			'  --dsw-static-green-500-a08: rgba(80, 250, 123, 0.08);',
			'  --dsw-static-green-500-a12: rgba(80, 250, 123, 0.12);',
			'  --dsw-static-red-400: #ff5555;',
			'  --dsw-static-red-400-a12: rgba(255, 85, 85, 0.12);',
			'  --dsw-static-red-600: #ff5555;',
			'  --dsw-static-red-600-a08: rgba(255, 85, 85, 0.08);',
			'  --dsw-static-amber-400: #ffcaa0;',
			'  --dsw-static-amber-500: #ffb86c;',
			'  --dsw-static-amber-600: #ffb86c;',
			/* Onboarding / login hero: the stock blue accent and its three stock
			   gradients, re-pointed to Dracula purple and cyan. The card fill and
			   the checkbox border follow the ramps above. */
			'  --dsw-alias-onboarding-accent: #bd93f9;',
			'  --dsw-alias-onboarding-secondary-fill: #44475a;',
			'  --dsw-gradient-onboarding-violet-stops: #4b3b6b 33.102%, #bd93f9 50.954%, #e2d3ff 85.326%, #4b3b6b;',
			'  --dsw-gradient-onboarding-blue-stops: #2f5f8f 18.75%, #8be9fd 51.78%, #cdf3ff 86.252%, #2f5f8f;',
			'  --dsw-gradient-onboarding-cyan-stops: #1f6d78 21.154%, #7ae2f0 50.954%, #c8f6fb 85.326%, #1f6d78;',
			/* File-level diff view: these six are literal colours in the shipped
			   dark theme rather than ramp-derived, so they need naming here or the
			   diff keeps its stock green-on-black and red-on-black. */
			'  --dsw-alias-file-diff-added-bg: #26382c;',
			'  --dsw-alias-file-diff-added-gutter: #1d2a21;',
			'  --dsw-alias-file-diff-added-marker: #50fa7b;',
			'  --dsw-alias-file-diff-deleted-bg: #3a2328;',
			'  --dsw-alias-file-diff-deleted-gutter: #2a181c;',
			'  --dsw-alias-file-diff-deleted-marker: #ff5555;',
			/* Translucent menu surface, the toast label, and the light label that
			   sits on the dark document preview. */
			'  --dsw-menu-surface-fill: #44475a73;',
			'  --dsw-alias-toast-label: #f8f8f2;',
			'  --dsw-alias-label-document-preview: #d7dae5;',
			'}',
		].join('\n');

		/** The style element this plugin owns, if installed. */
		function owned() {
			return document.head.querySelector('style[data-plugin="' + ID + '"]');
		}

		/** Set the opt-in attribute and append the stylesheet once. */
		function install() {
			document.documentElement.setAttribute(MARKER, 'on');
			if (owned() !== null) return;
			var el = document.createElement('style');
			el.setAttribute('data-plugin', ID);
			el.textContent = CSS;
			document.head.appendChild(el);
		}

		/** Drop the attribute and every owned style tag (HMR also removes them). */
		function uninstall() {
			document.documentElement.removeAttribute(MARKER);
			var tags = document.querySelectorAll('style[data-plugin="' + ID + '"]');
			for (var i = 0; i < tags.length; i++) tags[i].remove();
		}

		/* Runs at materialization, which for an `immediately` row is the shell's
		   pre-plugin interval — the marker and sheet are in place before first
		   paint, so a reload shows no flash of untuned UI. */
		install();

		function apply(ctx) {
			/* A hot reload drops owned style tags before the fiber re-mounts. */
			install();
			if (ctx !== undefined && typeof ctx.effect === 'function') {
				ctx.effect(function dispose() {
					return function () {
						uninstall();
					};
				});
			}
		}

		exports.name = 'ui-dracula';
		exports.inject = [];
		exports.apply = apply;

		/* Devtools affordance: `__dracula.set(false)` reverts the page live. */
		globalThis.__dracula = {
			id: ID,
			css: CSS,
			set: function (enabled) {
				if (enabled === false) uninstall();
				else install();
				return enabled !== false;
			},
			get enabled() {
				return owned() !== null;
			},
		};

		return module.exports;
	},
});
