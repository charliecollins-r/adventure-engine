// Browser test: the opening. The cold open (setting.intro_scenes) hands over to the playable spacewalk (setting.prologue):
// Control's radio line and the pilot's answer, the tutorial teaching the verbs (right-click, MOVE to drift, HAND the panel,
// LOOK inside), the abduction cutscene (setting.cutscenes, play_cutscene), then the wake-up in the Stasis Hold with the
// rest of the tips. Also: skipping from the cold open and from the spacewalk both land in the Stasis Hold and wake up.
// Usage: node intro.cjs [screenshot-dir]   (dev server on :5173)
const { chromium } = require('playwright');
const OUT = process.argv[2];
const PLAY = 'http://localhost:5173/?play=the-harvest';
let failures = 0; const fail = (m) => { failures++; console.log('  FAIL', m); }; const ok = (m) => console.log('ok   ' + m);
const check = (c, m) => (c ? ok(m) : fail(m));
const VERBS = ['look', 'move', 'hand', 'talk'];

async function page(b) {
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', (e) => fail('page error: ' + e.message));
  await p.addInitScript(() => {
    window.__plays = []; const op = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { window.__plays.push({ src: this.src.split('/').pop(), t: performance.now(), el: this }); return op.call(this); };
  });
  return p;
}
const view = (p) => p.evaluate(() => (document.querySelector('[data-intro-cinematic]') ? null : window.__engine?.currentViewId ?? null));
const text = (p) => p.evaluate(() => document.body.innerText);
const played = (p, f) => p.evaluate((f) => window.__plays.some((x) => x.src === f), f);
const waitFor = async (p, fn, ms, arg) => p.waitForFunction(fn, arg, { timeout: ms }).then(() => true).catch(() => false);
const shot = async (p, name) => { if (OUT) await p.screenshot({ path: `${OUT}/${name}.png` }); };

// The prologue plays full screen: its 960x540 game view is scaled to fit the window (k = screen px per view px).
async function viewport(p) {
  return p.evaluate(() => { const r = document.querySelector('[data-prologue-view]').getBoundingClientRect(); return { x: r.x, y: r.y, k: r.width / 960 }; });
}
async function setVerb(g, v) {
  while (g.verb !== v) {
    await g.p.mouse.click(g.vp.x + 950 * g.vp.k, g.vp.y + 8 * g.vp.k, { button: 'right' });
    g.verb = VERBS[(VERBS.indexOf(g.verb) + 1) % 4];
    await g.p.waitForTimeout(150);
  }
}
const click = (g, x, y) => g.p.mouse.click(g.vp.x + x * g.vp.k, g.vp.y + y * 0.75 * g.vp.k);
const tip = (p) => p.evaluate(() => document.querySelector('[data-tutorial-step]')?.innerText ?? '');

(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });

  // ── The whole opening, played ──
  {
    const p = await page(b);
    await p.goto(PLAY);
    check(await waitFor(p, () => !!document.querySelector('[data-intro-cinematic]'), 5000), 'the cold open plays');
    check(await waitFor(p, () => /went quiet nine days ago/.test(document.body.innerText), 15000), 'the pilot\'s voice-over line shows');
    await shot(p, 'v2_01_cold_open');
    check(await waitFor(p, () => !document.querySelector('[data-intro-cinematic]'), 30000), 'the cold open hands over to the game');
    check((await view(p)) === 'intro_spacewalk', 'the game starts on the spacewalk');
    check(!!(await p.$('[data-skip-prologue]')), 'a skip intro button is in the corner');
    check(!(await p.$('button:has-text("Menu")')) && !(await p.$('button:has-text("Items")')), 'full screen: no title bar, no Items tray');
    const vp0 = await viewport(p);
    check(vp0.k > 1.2, `the spacewalk fills the screen (scale ${vp0.k.toFixed(2)})`);
    check(await waitFor(p, () => !!document.querySelector('[data-radio-line]'), 4000), 'Relay Control calls on the radio (RADIO line)');
    check(await played(p, 'c1.mp3'), 'Control\'s voice plays');
    check(await waitFor(p, () => /Big, expensive, and not talking/.test(document.body.innerText), 10000), 'the pilot answers');
    check(await played(p, 'p1.mp3'), 'the pilot\'s voice plays');
    check(await waitFor(p, () => /Right-click to change/.test(document.querySelector('[data-tutorial-step]')?.innerText ?? ''), 6000), 'tip 1: right-click to change verbs');
    check(/Tip 1 of 7/i.test(await tip(p)), `tips are numbered along this route ("${(await tip(p)).split('\n')[0]}")`);
    await shot(p, 'v2_02_spacewalk');
    check((await p.evaluate(() => window.__engine.getClock())) < 0.5, 'the game clock does not run on the spacewalk');

    const g = { p, vp: await viewport(p), verb: 'look' };
    await setVerb(g, 'move');
    check(/drift/.test(await tip(p)), 'tip 2: drift with Move');
    await click(g, 200, 500);
    await p.waitForTimeout(2500);
    const pos = await p.evaluate(() => window.__engine.getCharacterPlacement());
    check(pos && pos.x < 300, `he drifts where you click (x ${pos && Math.round(pos.x)})`);
    check(/Hand works things/.test(await tip(p)), 'tip 3: Hand the panel');
    await setVerb(g, 'hand');
    await click(g, 607, 338);
    check(await waitFor(p, () => /Panel's open/.test(document.body.innerText), 12000), 'Hand on the satellite: "Panel\'s open"');
    check(await waitFor(p, () => window.__engine.currentViewId === 'intro_panel_closeup', 6000), 'into the panel close-up');
    check(/Look inside the panel/.test(await tip(p)), 'tip 4: look inside the panel');
    await shot(p, 'v2_03_panel');
    await setVerb(g, 'look');
    await click(g, 691, 327);
    check(await waitFor(p, () => /the boards are missing/.test(document.body.innerText), 4000), 'the boards are missing');
    check(await waitFor(p, () => /long-range is acting up/.test(document.body.innerText), 10000), 'Control can\'t explain it');
    check(await waitFor(p, () => !!document.querySelector('[data-intro-cinematic]'), 14000), 'the abduction cutscene starts');
    check(await waitFor(p, () => /The stars/.test(document.body.innerText), 8000), 'the pilot sees the stars go out');
    await shot(p, 'v2_04_stars');
    // click through the cutscene like an impatient player; the ship's room ambience must not play under it
    let under = [];
    for (let i = 0; i < 30 && (await view(p)) === null; i++) {
      const u = await p.evaluate(() => (document.querySelector('[data-intro-cinematic]') ? window.__plays.filter((x) => !x.el.paused && /ambient_lab|haunted/.test(x.src)).map((x) => x.src) : []));
      if (u.length) under = u;
      await p.mouse.click(640, 300); await p.waitForTimeout(1500);
    }
    check(!under.length, `no room ambience under the cutscene ${under.join(',')}`);
    check((await view(p)) === 'act1_stasis_hold', 'after the cutscene: the Stasis Hold');
    check(await played(p, 'harvest.mp3') && await played(p, 'c4.mp3'), 'the cutscene plays the harvest and "Outrider, respond"');
    check(await waitFor(p, () => { const e = document.querySelector('[data-eye-open]'); return e && +getComputedStyle(e).opacity > 0.9; }, 3000), 'the wake-up starts in black');
    check(await waitFor(p, () => window.__plays.some((x) => x.src === 'ambient_stasis.mp3'), 8000), 'the wake-up narration plays');
    check(/Your eyes open to green light/.test(await text(p)), 'the wake-up message is the narrated text');
    check(!(await p.$('[data-skip-prologue]')), 'no skip intro button once the prologue is over');
    check(!!(await p.$('button:has-text("Menu")')), 'the game interface appears with the Stasis Hold');
    check(!(await tip(p)), 'no tip while he lies there');
    check(await waitFor(p, () => /specimen tag/.test(document.querySelector('[data-tutorial-step]')?.innerText ?? ''), 40000), 'after he stands: the next tip (take the specimen tag)');
    check(/Tip 5 of 7/i.test(await tip(p)), `numbering carries on ("${(await tip(p)).split('\n')[0]}")`);
    check((await p.evaluate(() => window.__engine.getClock())) < 30, 'the clock starts with the wake-up');
    await shot(p, 'v2_05_stasis');
    await p.close();
  }

  // ── Skip from the cold open: straight to the wake-up, with the verb tips ──
  {
    const p = await page(b);
    await p.goto(PLAY); await p.waitForSelector('[data-skip-intro]'); await p.waitForTimeout(1500); await p.click('[data-skip-intro]');
    check(await waitFor(p, () => window.__engine?.currentViewId === 'act1_stasis_hold' && !document.querySelector('[data-intro-cinematic]'), 4000), 'skip in the cold open: the Stasis Hold');
    check(!(await p.$('[data-skip-prologue]')), 'no prologue after skipping');
    check(await waitFor(p, () => /Right-click to change/.test(document.querySelector('[data-tutorial-step]')?.innerText ?? ''), 40000), 'the verb tip shows for a player who skipped');
    check(/Tip 1 of 6/i.test(await tip(p)), `skipper's route numbering ("${(await tip(p)).split('\n')[0]}")`);
    await p.close();
  }

  // ── Skip from the spacewalk ──
  {
    const p = await page(b);
    await p.goto(PLAY);
    await waitFor(p, () => !document.querySelector('[data-intro-cinematic]') && window.__engine?.currentViewId === 'intro_spacewalk', 30000);
    await p.click('[data-skip-prologue]');
    await p.waitForTimeout(800);
    check((await view(p)) === 'act1_stasis_hold', 'Skip intro on the spacewalk: the Stasis Hold');
    await p.waitForTimeout(9000);
    check(!/Big, expensive|LUMEN/.test(await text(p)), 'nothing from the spacewalk follows you in');
    check(await waitFor(p, () => window.__plays.some((x) => x.src === 'ambient_stasis.mp3'), 4000), 'and the wake-up plays');
    await p.close();
  }

  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL INTRO TESTS PASSED');
  await b.close(); process.exit(failures ? 1 : 0);
})();
