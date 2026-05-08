/**
 * Dev-only helper: run with `npm run discover:selectors`.
 * Paste codegen output here temporarily while mapping a module, then promote locators to Page Objects.
 *
 * Do not import this file from specs or CI jobs.
 */

/* eslint-disable no-console */

console.log(`
Selector discovery (Hybrid workflow)
====================================
1. npm run codegen
2. Perform flows in the target module (note iframe depth in DevTools).
3. Paste snippets below this comment block as you iterate.
4. Move stable locators into pages/<module>/ and delete scratch code.

Quick iframe probe (run in DevTools console on target page):
  document.querySelectorAll('iframe[id]')

`);

async function main(): Promise<void> {
  console.log('Ready to extend this script with programmatic probes using playwright if needed.');
}

main().catch(console.error);
