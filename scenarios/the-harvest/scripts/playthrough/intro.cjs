// Browser test: the intro cinematic (setting.intro_scenes) plays, advances on click, can be skipped, and hands over to the game.
// Usage: node intro.cjs [screenshot-dir]   (dev server on :5173)
const { chromium } = require('playwright');
const OUT = process.argv[2];
let failures = 0; const fail = (m) => { failures++; console.log('  FAIL', m); }; const ok = (m) => console.log('ok   ' + m);
const inGame = (p) => p.evaluate(() => !document.querySelector('[data-intro-cinematic]') &&
  [...document.querySelectorAll('div')].some((d) => { const r = d.getBoundingClientRect(); return Math.round(r.width) === 960 && Math.round(r.height) === 540; }));
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('pageerror', (e) => fail('page error: ' + e.message));
  await p.goto('http://localhost:5173/?play=the-harvest');
  await p.waitForSelector('[data-intro-cinematic]', { timeout: 5000 }).then(() => ok('the cinematic opens')).catch(() => fail('no cinematic'));
  const lines = []; let shots = 0;
  for (let i = 0; i < 40 && !(await inGame(p)); i++) {
    const line = await p.waitForFunction(() => {
      const el = document.querySelector('[data-intro-line]');
      return el && getComputedStyle(el).opacity === '1' ? el.innerText.trim() : null;
    }, null, { timeout: 15000 }).then((h) => h.jsonValue()).catch(() => null);
    if (!line) break;
    if (lines[lines.length - 1] !== line) {
      lines.push(line);
      if (OUT) { await p.waitForTimeout(900); await p.screenshot({ path: `${OUT}/intro_${String(++shots).padStart(2, '0')}.png` }); }
    }
    await p.mouse.click(640, 300);
    await p.waitForTimeout(450);
  }
  await p.waitForTimeout(2500);
  if (lines.length < 12) fail(`only ${lines.length} lines shown: ${JSON.stringify(lines)}`); else ok(`${lines.length} lines, clicked through`);
  if (!lines.some((l) => /RADIO/.test(l))) fail('no radio line'); else ok('radio lines are marked');
  if (!(await inGame(p))) fail('the game did not start after the last line'); else ok('the game starts after the cinematic');

  // Skip straight to the game
  await p.goto('http://localhost:5173/?play=the-harvest');
  await p.waitForSelector('[data-skip-intro]');
  await p.waitForTimeout(3500);
  await p.click('[data-skip-intro]');
  await p.waitForTimeout(1500);
  if (!(await inGame(p))) fail('skip intro did not start the game'); else ok('skip intro goes straight to the game');

  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL INTRO TESTS PASSED');
  await b.close(); process.exit(failures ? 1 : 0);
})();
