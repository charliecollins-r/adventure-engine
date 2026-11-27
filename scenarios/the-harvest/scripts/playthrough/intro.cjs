// Browser test: the opening. Play starts on the playable spacewalk (setting.prologue), with no cinematic before it: the
// camera eases out from his helmet (view enter_camera) during Control's radio line and the pilot's answer, the tutorial teaching the verbs (right-click, MOVE to drift, HAND the panel,
// LOOK inside), the abduction cutscene (setting.cutscenes, play_cutscene), then the wake-up in the Stasis Hold with the
// rest of the tips. Also: skipping at once and from the spacewalk both land in the Stasis Hold and wake up.
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

// Players get full-screen play: the 960x540 picture is scaled to the window (k = screen px per view px).
async function viewport(p) {
  return p.evaluate(() => { const r = document.querySelector('[data-viewport]').getBoundingClientRect(); return { x: r.x, y: r.y, k: r.width / 960 }; });
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
    check(await waitFor(p, () => window.__engine?.currentViewId === 'intro_spacewalk', 3000), 'the game starts on the spacewalk');
    check(!(await p.$('[data-intro-cinematic]')), 'no opening cinematic (the pilot is the game\'s own sprite from the first frame)');
    check(await waitFor(p, () => /start|moving/.test(document.querySelector('[data-enter-camera]')?.dataset.enterCamera ?? ''), 2000), 'the camera starts close and eases out');
    check(!!(await p.$('[data-fullscreen]')) && !!(await p.$('[data-hud-menu]')), 'full-screen play with the same controls from the first frame');
    await p.waitForTimeout(5000);
    check(!(await p.evaluate(() => window.__audioSources())).length, 'the fade up and zoom out play in silence');
    check(await waitFor(p, () => /Tell me you've got eyes on it/.test(document.body.innerText), 9000), 'Relay Control calls on the radio once the picture has settled');
    check(await played(p, 'c1.mp3'), 'Control\'s voice plays');
    check(!(await played(p, 'n1.mp3')), 'no narrator line');
    check(!(await played(p, 'ambient_lab.mp3')) && !(await played(p, 'music_stasis.mp3')), 'no Stasis Hold sound before the spacewalk');
    await shot(p, 'v2_01_opening');
    check(await waitFor(p, () => document.querySelector('[data-enter-camera]')?.dataset.enterCamera === 'off', 15000), 'the camera settles on the whole picture');
    check(!!(await p.$('[data-skip-prologue]')), 'a skip intro button is in the corner');
    check(!(await p.$('[data-dev-skip]')), 'no testing shortcuts during the opening');
    check(await waitFor(p, () => /Big, expensive, and not talking/.test(document.body.innerText), 10000), 'the pilot answers');
    check(await played(p, 'p1.mp3'), 'the pilot\'s voice plays');
    check(await waitFor(p, () => document.querySelector('[data-verb-nudge]')?.dataset.verbNudge === 'shown', 9000), 'the right-click nudge shows (no tip boxes)');
    check(!(await p.$('[data-tutorial-step]')), 'no tutorial box over the picture');
    await shot(p, 'v2_02_spacewalk');
    check((await p.evaluate(() => window.__engine.getClock())) < 0.5, 'the game clock does not run on the spacewalk');

    const g = { p, vp: await viewport(p), verb: 'look' };
    await setVerb(g, 'move');
    await click(g, 200, 500);
    await p.waitForTimeout(2500);
    const pos = await p.evaluate(() => window.__engine.getCharacterPlacement());
    check(pos && pos.x < 300, `he drifts where you click (x ${pos && Math.round(pos.x)})`);
    await setVerb(g, 'hand');
    await click(g, 607, 338);
    check(await waitFor(p, () => window.__engine.currentViewId === 'intro_panel_closeup', 12000), 'Hand on the satellite: into the panel close-up');
    check(await waitFor(p, () => /Panel's open/.test(document.body.innerText), 5000), 'he says the panel is open once the door has swung');
    await shot(p, 'v2_03_panel');
    await setVerb(g, 'look');
    check(await waitFor(p, () => document.querySelector('[data-verb-nudge]')?.dataset.verbNudge === 'hidden', 3000), 'the nudge has gone after a few verb changes');
    await click(g, 691, 327);
    check(await waitFor(p, () => /the boards are missing/.test(document.body.innerText), 4000), 'the boards are missing');
    // right after his line: Control's reply is the cutscene's first line, over the stars going out
    check(await waitFor(p, () => !!document.querySelector('[data-intro-cinematic]'), 10000), 'the abduction cutscene starts');
    check(await waitFor(p, () => /long-range is acting up/.test(document.querySelector('[data-intro-cinematic]')?.innerText ?? ''), 4000), 'Control can\'t explain it, over the stars');
    check(await waitFor(p, () => /The stars/.test(document.body.innerText), 14000), 'the pilot sees the stars go out');
    await shot(p, 'v2_04_stars');
    // click through the cutscene like an impatient player; the ship's room ambience must not play under it
    let under = []; let titleSeen = false;
    for (let i = 0; i < 30 && (await view(p)) === null; i++) {
      if (!titleSeen) titleSeen = await p.evaluate(() => /HARVEST/i.test(document.querySelector('[data-title-card]')?.innerText || ''));
      const u = await p.evaluate(() => (document.querySelector('[data-intro-cinematic]') ? window.__plays.filter((x) => !x.el.paused && /ambient_lab|haunted/.test(x.src)).map((x) => x.src) : []));
      if (u.length) under = u;
      await p.mouse.click(640, 300); await p.waitForTimeout(1500);
    }
    check(!under.length, `no room ambience under the cutscene ${under.join(',')}`);
    check(titleSeen, 'the title card plays after the beam-up');
    check((await view(p)) === 'act1_stasis_hold', 'after the cutscene: the Stasis Hold');
    check(await played(p, 'harvest.mp3') && await played(p, 'c4.mp3'), 'the cutscene plays the harvest and "Outrider, respond"');
    check(await waitFor(p, () => { const e = document.querySelector('[data-eye-open]'); return e && +getComputedStyle(e).opacity > 0.9; }, 3000), 'the wake-up starts in black');
    check(await waitFor(p, () => window.__plays.some((x) => x.src === 'w01.mp3'), 8000), 'the wake-up narration plays');
    check(/Green light\. A chemical smell/.test(await text(p)), 'the wake-up message is the narrated text');
    check(!(await p.$('[data-skip-prologue]')), 'no skip intro button once the prologue is over');
    await p.click('[data-hud-menu]'); await p.waitForTimeout(300);
    check(!!(await p.$('[data-hud-menu-panel] [data-dev-skip]')), 'game-only controls come back with the Stasis Hold (in the menu)');
    await p.click('[data-hud-menu]'); await p.waitForTimeout(200);
    check(!(await tip(p)), 'no tip boxes in the Stasis Hold either');
    check((await p.evaluate(() => window.__engine.getClock())) < 30, 'the clock starts with the wake-up');
    await shot(p, 'v2_05_stasis');
    await p.close();
  }

  // ── Skip at once: straight to the wake-up, with the verb tips ──
  {
    const p = await page(b);
    await p.goto(PLAY); await p.waitForSelector('[data-skip-intro]'); await p.waitForTimeout(1500); await p.click('[data-skip-intro]');
    check(await waitFor(p, () => window.__engine?.currentViewId === 'act1_stasis_hold' && !document.querySelector('[data-intro-cinematic]'), 4000), 'skip at once: the Stasis Hold');
    check(!(await p.$('[data-skip-prologue]')), 'no prologue after skipping');
    check(await waitFor(p, () => document.querySelector('[data-verb-nudge]')?.dataset.verbNudge === 'shown', 40000), 'the right-click nudge shows for a player who skipped, once he is up');
    check(await waitFor(p, () => Number(document.querySelector('[data-verb-nudge]')?.dataset.nudgeCalls) >= 1, 10000), 'ignored for 8 s, the nudge calls for attention');
    await p.close();
  }

  // ── Skip from the spacewalk ──
  {
    const p = await page(b);
    await p.goto(PLAY);
    await waitFor(p, () => window.__engine?.currentViewId === 'intro_spacewalk', 5000); await p.waitForTimeout(1500);
    await p.click('[data-skip-prologue]');
    await p.waitForTimeout(800);
    check((await view(p)) === 'act1_stasis_hold', 'Skip intro on the spacewalk: the Stasis Hold');
    await p.waitForTimeout(9000);
    check(!/Big, expensive|LUMEN/.test(await text(p)), 'nothing from the spacewalk follows you in');
    check(await waitFor(p, () => window.__plays.some((x) => x.src === 'w01.mp3'), 4000), 'and the wake-up plays');
    await p.close();
  }

  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL INTRO TESTS PASSED');
  await b.close(); process.exit(failures ? 1 : 0);
})();
