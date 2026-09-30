/**
 * Smoke test for `dsh-client-ui-dracula`, dependency-free.
 *
 * The browser half is a plain script bundle: it registers a factory on
 * `window.__ModuleLoader__` and only touches `document` when that factory is
 * materialized. So a minimal DOM stub is enough to prove the whole contract:
 *
 *   1. the bundle registers under the package name the loader row expects;
 *   2. materialization installs exactly one `<style data-plugin>` and the
 *      `data-dracula="on"` opt-in attribute;
 *   3. the stylesheet carries the Dracula palette (and no leftover identifier
 *      from the plugin this theme was extracted out of);
 *   4. `__dracula.set(false)` / `set(true)` and the Cordis dispose turn the
 *      page back and forth;
 *   5. the manifest and the bundle patch agree with the bundle.
 *
 * Run with `npm test` (or `node scripts/smoke.mjs`).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

/* ── minimal DOM ─────────────────────────────────────────────────────────── */

const registry = [];

class Element {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map();
    this.children = [];
    this.parent = null;
    this.textContent = '';
    this.shadowRoot = null;
    this.style = { setProperty() {} };
    registry.push(this);
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
  removeAttribute(name) { this.attributes.delete(name); }
  appendChild(child) { child.parent = this; this.children.push(child); return child; }
  remove() { this.removed = true; }
  querySelector(selector) { return queryAll(selector)[0] ?? null; }
  querySelectorAll(selector) { return queryAll(selector); }
}

function queryAll(selector) {
  const match = /^(\w+)\[([\w-]+)="([^"]*)"\]$/.exec(selector);
  if (match === null) throw new Error('unsupported selector in stub: ' + selector);
  const [, tag, name, value] = match;
  return registry.filter(
    (el) => el.removed !== true && el.tagName === tag.toUpperCase() && el.getAttribute(name) === value,
  );
}

const documentElement = new Element('html');
const head = new Element('head');
const body = new Element('body');
documentElement.appendChild(head);
documentElement.appendChild(body);
const document = {
  documentElement,
  head,
  body,
  createElement: (tag) => new Element(tag),
  querySelector: (selector) => queryAll(selector)[0] ?? null,
  querySelectorAll: (selector) => queryAll(selector),
};

/* ── load the bundle ─────────────────────────────────────────────────────── */

const registrations = [];
const window = { __ModuleLoader__: { load: (registration) => registrations.push(registration) } };

const source = read('lib', 'client.js');
new Function('window', 'document', source)(window, document);

const manifest = JSON.parse(read('package.json'));

assert.equal(registrations.length, 1, 'the bundle must register exactly one factory');
const registration = registrations[0];
assert.equal(registration.id, manifest.name, 'registration id must be the package name');
assert.equal(typeof registration.factory, 'function', 'registration must carry a factory');

const styleTag = () =>
  document.querySelectorAll(`style[data-plugin="${manifest.name}"]`).filter((el) => el.removed !== true);

assert.equal(styleTag().length, 0, 'nothing may be injected before the factory materializes');

/* ── materialize ─────────────────────────────────────────────────────────── */

const exports_ = registration.factory((specifier) => {
  throw new Error('this bundle requests no modules, got: ' + specifier);
});

assert.equal(exports_.name, 'ui-dracula');
assert.equal(typeof exports_.apply, 'function', 'the Cordis plugin face must expose apply()');
assert.deepEqual(exports_.inject, []);

assert.equal(documentElement.getAttribute('data-dracula'), 'on', 'the opt-in attribute must be set');
assert.equal(styleTag().length, 1, 'exactly one owned stylesheet must be injected');

const css = styleTag()[0].textContent;
assert.ok(css.length > 14000, 'the stylesheet looks truncated: ' + css.length + ' chars');
assert.ok(css.includes(':root[data-dracula="on"]'), 'rules must be scoped to the opt-in attribute');
assert.ok(css.includes('--dsw-alias-bg-base: #282a36;'), 'Dracula page background token missing');
assert.ok(css.includes('--shiki-token-keyword: #ff79c6;'), 'Dracula syntax colours missing');
assert.ok(css.includes('--dracula-content-width: 1080px;'), 'the typography knobs are missing');
assert.ok(!/devtune/i.test(css), 'the extracted plugin identifier must not survive in the stylesheet');

/* ── revert / re-apply ───────────────────────────────────────────────────── */

assert.equal(globalThis.__dracula.enabled, true);
assert.equal(globalThis.__dracula.set(false), false);
assert.equal(styleTag().length, 0, 'set(false) must drop the stylesheet');
assert.equal(documentElement.getAttribute('data-dracula'), null, 'set(false) must drop the attribute');
assert.equal(globalThis.__dracula.enabled, false);

assert.equal(globalThis.__dracula.set(true), true);
assert.equal(styleTag().length, 1, 'set(true) must re-install exactly one stylesheet');

let dispose;
exports_.apply({ effect: (fn) => { dispose = fn(); } });
assert.equal(typeof dispose, 'function', 'apply() must register a Cordis dispose');
dispose();
assert.equal(styleTag().length, 0, 'the dispose must uninstall the stylesheet');
assert.equal(documentElement.getAttribute('data-dracula'), null, 'the dispose must drop the attribute');

/* ── manifest and bundle patch ───────────────────────────────────────────── */

assert.equal(manifest.dsh.client.platform, 'web');
assert.equal(manifest.dsh.client.immediately, true, 'the theme must land before first paint');
assert.equal(manifest.license, 'MIT');

for (const entry of manifest.files) {
  assert.ok(fs.existsSync(path.join(root, entry)), `package.json files[] names a missing path: ${entry}`);
}

const patchPath = path.join(root, manifest.dsh.bundle.patch.replace(/^\.\//, ''));
assert.ok(fs.existsSync(patchPath), 'dsh.bundle.patch must point at a real file');
const patch = fs.readFileSync(patchPath, 'utf8');
assert.ok(patch.includes(`name: '${manifest.name}'`), 'the bundle patch must mount this package');
assert.ok(/^- insert:/m.test(patch), 'the bundle patch must contain an insert list');

console.log('smoke: ok — one stylesheet of ' + css.length + ' chars, manifest and bundle patch agree');
