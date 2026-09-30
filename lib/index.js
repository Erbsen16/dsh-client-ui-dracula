/**
 * Host half of `dsh-client-ui-dracula`.
 *
 * The row exists so `@deepseek-ai/dsh-client-modules` finds a `dsh.client`
 * package in the Loader tree and serves this package's `./client` bundle to the
 * browser. All behaviour lives in the browser half (`lib/client.js`), which
 * injects one `<style data-plugin="dsh-client-ui-dracula">` tag; the host has
 * nothing to provide, so this plugin owns no service, config, or route.
 */

/** Cordis plugin name (diagnostics only). */
export const name = 'client-ui-dracula'

/** No-op: the browser half owns the entire feature. */
export function apply() {}
