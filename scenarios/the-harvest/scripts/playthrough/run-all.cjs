// Runs every browser suite one after another (they share the dev server, so never in parallel).
// Usage: node run-all.cjs   (dev server on :5173)
const { spawnSync } = require('child_process');
const suites = ['regression', 'intro', 'alarm', 'rope', 'prisoner', 'features', 'noise', 'patrol', 'walk', 'full'];
const results = [];
for (const s of suites) {
  const t0 = Date.now();
  const r = spawnSync('node', [`${s}.cjs`], { cwd: __dirname, encoding: 'utf8', timeout: 20 * 60 * 1000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const passed = r.status === 0;
  results.push(`${passed ? 'PASS' : 'FAIL'}  ${s.padEnd(11)} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  if (!passed) console.log(`--- ${s} ---\n${out.split('\n').filter((l) => /FAIL|ERR|Error/.test(l)).slice(0, 15).join('\n')}`);
}
console.log('\n' + results.join('\n'));
process.exit(results.some((r) => r.startsWith('FAIL')) ? 1 : 0);
