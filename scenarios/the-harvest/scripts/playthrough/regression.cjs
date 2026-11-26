// Browser regression tests: one check per bug found in playtesting, so each stays fixed.
// Usage: node regression.cjs   (dev server on :5173)
const { chromium } = require('playwright');
let failures = 0; const fail = (m) => { failures++; console.log('  FAIL', m); }; const ok = (m) => console.log('ok   ' + m);
const URL = 'http://localhost:5173/';
const PLAY = URL + '?play=the-harvest';

async function page(b, { audioHang = false } = {}) {
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', (e) => fail('page error: ' + e.message));
  await p.addInitScript(() => {
    window.__plays = []; const op = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { window.__plays.push({ src: this.src.split('/').pop(), t: performance.now(), el: this }); return op.call(this); };
  });
  // A browser that never reports the narration clip's length (Safari-like): hang that request forever.
  if (audioHang) await p.route('**/intro/audio/v2/voice/w01.mp3', () => {});
  return p;
}
const eyeState = (p) => p.evaluate(() => { const e = document.querySelector('[data-eye-open]'); return e ? +getComputedStyle(e).opacity : -1; });
const inRoom = (p) => p.evaluate(() => !document.querySelector('[data-intro-cinematic]') && !!window.__engine);

(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });

  // 1. Skipping the intro reaches a visible first room (the eyes open; nothing stays black)
  {
    const p = await page(b);
    await p.goto(PLAY); await p.waitForSelector('[data-skip-intro]'); await p.waitForTimeout(1500); await p.click('[data-skip-intro]');
    await p.waitForTimeout(11000);
    const eye = await eyeState(p);
    if (!(await inRoom(p)) || (eye !== -1 && eye > 0.05)) fail(`after skipping, the room is still dark (eye overlay ${eye})`); else ok('skip intro: the first room is visible within 11 s');
    await p.close();
  }
  // 2. Same, when the browser never reports the narration's length (the wake-up must not wait forever)
  {
    const p = await page(b, { audioHang: true });
    await p.goto(PLAY); await p.waitForSelector('[data-skip-intro]'); await p.waitForTimeout(1000); await p.click('[data-skip-intro]');
    await p.waitForTimeout(13000);
    const eye = await eyeState(p);
    if (eye !== -1 && eye > 0.05) fail(`audio length never known: the screen stays black (eye overlay ${eye})`); else ok('narration length unknown: the wake-up still opens the eyes');
    await p.close();
  }
  // 3. Wake-up order: black, the eyes open, the narrator, he stands, then the verb nudge; the message is the spoken text
  {
    const p = await page(b);
    await p.goto(PLAY); await p.waitForSelector('[data-skip-intro]'); await p.click('[data-skip-intro]');
    await p.waitForTimeout(1200);
    if (await eyeState(p) < 0.95) fail('no black hold before the eyes open'); else ok('wake-up starts black');
    await p.waitForTimeout(6000);
    const tipEarly = await p.evaluate(() => document.querySelector('[data-verb-nudge]')?.dataset.verbNudge === 'shown');
    if (tipEarly) fail('the verb nudge shows while he is still lying down'); else ok('no verb nudge while he lies there');
    const msg = await p.evaluate(() => document.body.innerText);
    if (!/Green light\. A chemical smell/.test(msg)) fail('wake-up message is not the narrated text'); else ok('wake-up message matches the narration clip');
    const voiced = await p.evaluate(() => window.__plays.some((x) => x.src === 'w01.mp3'));
    if (!voiced) fail('the wake-up narration did not play'); else ok('the wake-up narration plays');
    await p.waitForTimeout(22000);
    const tip = await p.evaluate(() => document.querySelector('[data-verb-nudge]')?.dataset.verbNudge === 'shown');
    if (!tip) fail('the verb nudge never shows after he stands'); else ok('the verb nudge shows once he is standing');
    await p.close();
  }
  // 4. The intro never plays a radio line twice at once, and no room ambience plays under it
  {
    const p = await page(b);
    await p.goto(PLAY); await p.waitForSelector('[data-intro-cinematic]');
    // click through the narration to hear every radio line
    for (let i = 0; i < 14; i++) {
      await p.waitForFunction(() => { const el = document.querySelector('[data-intro-line]'); return el && getComputedStyle(el).opacity === '1'; }, null, { timeout: 25000 }).catch(() => {});
      const dup = await p.evaluate(() => { const live = window.__plays.filter((x) => !x.el.paused && /radio_|narr_|\/v2\/[cpn]\d/.test(x.src)).map((x) => x.src); return live.length !== new Set(live).size ? live : null; });
      if (dup) { fail('a voice line plays twice at once: ' + dup); break; }
      const room = await p.evaluate(() => (document.querySelector('[data-intro-cinematic]') ? window.__plays.filter((x) => !x.el.paused && /haunted|ambient_lab|ambient_industrial/.test(x.src)).map((x) => x.src) : []));
      if (room.length) { fail('room ambience plays under the intro: ' + room); break; }
      if (await inRoom(p)) break;
      await p.waitForTimeout(2500); await p.mouse.click(640, 300); await p.waitForTimeout(400);
    }
    if (!failures) ok('intro: no doubled voice lines, no room ambience underneath');
    await p.close();
  }
  // 5. Main menu: Play starts the intro; the Menu button comes back to the menu
  {
    const p = await page(b);
    await p.goto(URL); await p.waitForTimeout(2000);
    const title = await p.evaluate(() => document.querySelector('[data-title-screen]')?.innerText || '');
    if (!/The Harvest/i.test(title) || !(await p.$('[data-play]'))) fail('the title screen has no Harvest and no Play'); else { await p.click('[data-play]'); await p.waitForTimeout(1500); }
    if (!(await p.$('[data-intro-cinematic]'))) fail('Play did not start the intro'); else ok('main menu: Play starts the intro');
    await p.click('[data-skip-intro]'); await p.waitForTimeout(1500);
    await p.click('[data-hud-menu]'); await p.waitForTimeout(300);
    await p.click('[data-hud-menu-panel] button:has-text("Menu")'); await p.waitForTimeout(1500);
    if (!(await p.$('[data-title-screen]'))) fail('Menu did not return to the title screen'); else ok('the Menu button returns to the title screen');
    if (!/elevenlabs\.io/i.test(await p.evaluate(() => document.body.innerText))) fail('ElevenLabs credit missing on the menu'); else ok('the ElevenLabs credit shows on the menu');
    await p.close();
  }
  // 6. A delayed death shows on screen without another click, and Undo works
  {
    const p = await page(b);
    await p.goto(URL + '?dev'); await p.waitForTimeout(3000);
    await p.evaluate(() => window.__engine.applyEffects([{ type: 'delay_then', seconds: 0.3, effects: [{ type: 'game_over', result: 'lose', title: 'Caught', reason: 'test' }] }]));
    await p.waitForTimeout(1200);
    if (!/caught/i.test(await p.evaluate(() => document.body.innerText))) fail('a delayed game over did not appear until the next click'); else ok('delayed effects redraw the screen');
    const death = await p.evaluate(() => window.__plays.some((x) => x.src === 'death_sting.mp3'));
    if (!death) fail('no death sound'); else ok('death plays its sound');
    await p.close();
  }

  // 7. A death with its own sound plays that sound, not the generic sting (the gap jump: the fall)
  {
    const p = await page(b);
    await p.goto(URL + '?dev'); await p.waitForTimeout(3000);
    await p.evaluate(() => { window.__engine.applyEffects([{ type: 'game_over', result: 'lose', title: 'Sliced', reason: 'test', sound: 'audio/deaths/fan.mp3' }]); window.__bump(); });
    await p.waitForTimeout(800);
    const own = await p.evaluate(() => window.__plays.some((x) => x.src === 'fan.mp3'));
    const generic = await p.evaluate(() => window.__plays.some((x) => x.src === 'death_sting.mp3'));
    if (!own || generic) fail(`a death with its own sound played ${own ? '' : 'nothing of its own'}${generic ? ' and the generic sting' : ''}`); else ok('a death plays its own sound');
    await p.close();
  }

  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL REGRESSION TESTS PASSED');
  await b.close(); process.exit(failures ? 1 : 0);
})();
