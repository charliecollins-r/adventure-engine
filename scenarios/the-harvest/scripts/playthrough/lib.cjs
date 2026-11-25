const { chromium } = require('playwright');
const VERBS = ['look', 'move', 'hand', 'talk'];
async function start(opts = {}) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERR', m.text()); });
  p.on('pageerror', e => console.log('PAGE ERR', e.message));
  // patrols (scenario.patrols) are off unless a suite asks for them: long suites would get caught
  await p.goto(opts.patrols ? 'http://localhost:5173/?dev' : 'http://localhost:5173/?dev&noPatrols');
  await p.waitForTimeout(2500);
  const vp = await p.evaluate(() => { const d = [...document.querySelectorAll('div')].find(d => { const r = d.getBoundingClientRect(); return Math.round(r.width) === 960 && Math.round(r.height) === 540; }); const r = d.getBoundingClientRect(); return { x: r.x, y: r.y }; });
  const g = { b, p, vp, verb: 'look', log: [] };
  return g;
}
const sp = (g, x, y) => ({ x: g.vp.x + x, y: g.vp.y + y * 0.75 });
/** Wait until the character has stopped walking (walking views animate before an action runs). */
async function settle(g, maxMs = 10000) {
  const t0 = Date.now(); let still = 0;
  while (Date.now() - t0 < maxMs) {
    const walking = await g.p.evaluate(() => [...document.querySelectorAll('div')].some((d) => /_walk/.test(d.style.backgroundImage)));
    still = walking ? 0 : still + 1;
    if (still >= 2) return;
    await g.p.waitForTimeout(120);
  }
}
async function msg(g) {
  await g.p.waitForTimeout(250);
  await settle(g);
  await g.p.waitForTimeout(250);
  return await g.p.evaluate(() => { const h = [...document.querySelectorAll('div')].find(d => d.children.length === 0 && d.textContent.trim() === 'click to dismiss'); return h ? h.parentElement.innerText.replace(/\s*click to dismiss\s*$/, '').trim() : null; });
}
async function dismiss(g) {
  for (let i = 0; i < 6; i++) {
    const ok = await g.p.evaluate(() => { const h = [...document.querySelectorAll('div')].find(d => d.children.length === 0 && d.textContent.trim() === 'click to dismiss'); if (!h) return false; h.parentElement.click(); return true; });
    if (!ok) return;
    await g.p.waitForTimeout(250);
  }
}
async function setVerb(g, v) {
  await dismiss(g);
  while (g.verb !== v) {
    const pt = sp(g, 950, 10);
    await g.p.mouse.click(pt.x, pt.y, { button: 'right' });
    g.verb = VERBS[(VERBS.indexOf(g.verb) + 1) % 4];
    await g.p.waitForTimeout(120);
  }
}
async function act(g, verb, x, y, label) {
  await setVerb(g, verb);
  const pt = sp(g, x, y);
  await g.p.mouse.click(pt.x, pt.y);
  const t = await msg(g);
  g.log.push(`[${verb} ${label}] ${t}`);
  return t;
}
async function openInv(g) {
  // The tray can open by itself (an item just arrived) while we look: let renders settle, then trust the toggle's arrow.
  await g.p.waitForTimeout(200);
  for (let i = 0; i < 4; i++) {
    const closed = await g.p.$('button:has-text("▸ Items")');
    if (!closed) return;
    await closed.click(); await g.p.waitForTimeout(400);
  }
}
async function selectItem(g, name) {
  await dismiss(g); await openInv(g);
  await g.p.click(`button[title^="${name} —"]`);
  await g.p.waitForTimeout(250);
  // selecting shows the description as a message — dismiss without deselecting
  const t = await msg(g); g.log.push(`[select ${name}] ${t}`);
}
async function useOn(g, name, x, y, label) {
  await selectItem(g, name);
  await dismiss(g);
  const pt = sp(g, x, y);
  await g.p.mouse.click(pt.x, pt.y);
  const t = await msg(g); g.log.push(`[use ${name} on ${label}] ${t}`); return t;
}
async function combine(g, a, b) {
  await selectItem(g, a);
  await dismiss(g); await openInv(g);
  await g.p.click(`button[title^="${b} —"]`);
  const t = await msg(g); g.log.push(`[combine ${a}+${b}] ${t}`); return t;
}
async function go(g, viewId) {
  await dismiss(g);
  await g.p.click(`text=${viewId}`);
  await g.p.waitForTimeout(900);
}
async function shot(g, name) { await g.p.screenshot({ path: name + '.png', clip: { x: g.vp.x, y: g.vp.y, width: 960, height: 540 } }); }
async function shotFull(g, name) { await g.p.screenshot({ path: name + '.png' }); }
module.exports = { start, settle, act, useOn, combine, go, shot, shotFull, dismiss, openInv, setVerb, msg, sp };
module.exports.hint = async (g, label) => {
  await module.exports.dismiss(g);
  await g.p.click('button:text-is("?")');
  const t = await module.exports.msg(g); g.log.push(`[HINT ${label}] ${t}`); return t;
};
let SC = JSON.parse(require("fs").readFileSync(require('path').join(__dirname, '..', '..', 'scenario.json'), "utf8"));
const OBJ = Object.fromEntries(SC.objects.map(o => [o.id, o]));
function pt(id) {
  const o = OBJ[id]; if (!o) throw new Error('no object ' + id);
  if (o.sprite) { const rh = o.sprite.frame_height * o.sprite.scale; return [o.position.x, (o.position.y * 0.75 - rh / 2) / 0.75]; }
  return [o.position.x + o.size.width / 2, o.position.y + o.size.height / 2];
}
// One-time cutaways (the Curator glimpse) take over the screen after a move: step back out like a player would.
module.exports.clearCutaways = async (g) => {
  let cleared = false;
  for (let i = 0; i < 3; i++) {
    const back = await g.p.$('[data-object-id="curator_glimpse_return"]');
    if (!back) return cleared;
    cleared = true;
    await module.exports.dismiss(g); const b = await back.boundingBox(); await g.p.mouse.click(b.x + 20, b.y + 20); await g.p.waitForTimeout(600); await module.exports.dismiss(g);
  }
  return cleared;
};
module.exports.A = (g, verb, id) => { const [x, y] = pt(id); return module.exports.act(g, verb, x, y, id); };
module.exports.U = (g, item, id) => { const [x, y] = pt(id); return module.exports.useOn(g, item, x, y, id); };
// Click a rendered hotspot by object ID (needs data-object-id in GameView/SpriteObject).
async function clickId(g, id) {
  const el = await g.p.$(`[data-object-id="${id}"]`);
  if (!el) return false;
  const b = await el.boundingBox(); if (!b) return false;
  await g.p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); return true;
}
module.exports.A = async (g, verb, id) => {
  await setVerb(g, verb);
  if (!(await clickId(g, id))) { g.log.push(`[${verb} ${id}] NOT RENDERED`); return null; }
  const t = await msg(g); g.log.push(`[${verb} ${id}] ${t}`); return t;
};
module.exports.U = async (g, item, id) => {
  await selectItem(g, item); await dismiss(g);
  if (!(await clickId(g, id))) { g.log.push(`[use ${item} on ${id}] NOT RENDERED`); return null; }
  const t = await msg(g); g.log.push(`[use ${item} on ${id}] ${t}`); return t;
};

// ── the vent maze v6 (vents.cjs, full.cjs): drive the real UI through the v6 grid ─────────────────────
const V6GRID = () => JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'vent_maze_v6_grid.json'), 'utf8'));
async function viewOf(g, c) {
  return g.p.evaluate(([x, y]) => window.__engine.getScenario().views.find((v) => v.map_xy && v.map_xy[0] === x && v.map_xy[1] === 14 - y)?.id, c);
}
async function closeups(g) {
  if (await g.p.evaluate(() => !!window.__engine.getCloseupImage())) {
    await g.p.keyboard.press('Escape');
    await g.p.waitForTimeout(300);
  }
}
async function cur(g) { return g.p.evaluate(() => window.__engine.currentViewId); }
async function flag(g, f) { return g.p.evaluate((f) => window.__engine.getFlags()[f], f); }

/** Click the exit in this view that leads to `view`, after its breathing duct's in-breath if it has one. */
async function goTo(g, view) {
  const info = await g.p.evaluate((view) => {
    const e = window.__engine;
    const targets = (effs, out = []) => { for (const x of effs || []) { if (x.type === 'set_view' && x.view) out.push(x.view); targets(x.then, out); targets(x.else, out); targets(x.effects, out); } return out; };
    const o = e.getVisibleObjects().find((o) => o.interactions.some((x) => x.verb === 'move' && targets(x.then).includes(view)));
    if (!o) return null;
    const cyc = o.interactions.flatMap((x) => x.when || []).find((c) => c.type === 'cycle_is');
    return { id: o.id, cycle: cyc ? cyc.cycle : null };
  }, view);
  await closeups(g);
  if (!info) { g.log.push(`[no exit from ${await cur(g)} to ${view}]`); return false; }
  if (info.cycle) await g.p.waitForFunction((c) => window.__engine.getCyclePhase(c) === 'in' && window.__engine.getCycleProgress(c) < 0.4, info.cycle, { timeout: 20000 });
  await module.exports.A(g, 'move', info.id);
  await module.exports.settle(g);
  await g.p.waitForTimeout(150);
  return (await cur(g)) === view;
}

/** Answer the Queen: real mouse presses in time with her phrases. */
async function answerQueen(g) {
  const setup = await g.p.evaluate(() => window.__engine.getRhythmSetup());
  const panel = await g.p.$('[data-rhythm-widget] > div');
  const b = await panel.boundingBox();
  await g.p.click('[data-rhythm-start]');
  for (const pattern of setup.phrases) {
    await g.p.waitForSelector('[data-rhythm-stage="answer"]', { timeout: 20000 });
    const t0 = Date.now();
    let due = 0;
    for (const beat of pattern) {
      const wait = due - (Date.now() - t0);
      if (wait > 0) await g.p.waitForTimeout(wait);
      await g.p.mouse.move(b.x + b.width / 2, b.y + b.height - 30);
      await g.p.mouse.down();
      await g.p.waitForTimeout(beat === 'L' ? 480 : 110);
      await g.p.mouse.up();
      due += setup.beatMs * (beat === 'L' ? 2 : 1);
    }
    await g.p.waitForTimeout(400);
  }
  await g.p.waitForSelector('[data-rhythm-widget]', { state: 'detached', timeout: 8000 });
}

async function choose(g, text) {
  await g.p.click(`text=${text}`);
  await g.p.waitForTimeout(400);
}


/** Shortest walk on the v6 grid between two cells (avoiding purge ducts and the Mimic). */
function v6path(from, to) {
  const G = V6GRID();
  const D = { N: [0, 1], S: [0, -1], E: [1, 0], W: [-1, 0] }, OPP = { N: 'S', S: 'N', E: 'W', W: 'E' };
  const bad = new Set([...G.purge.map(String), String(G.npcs.mimic)]);
  const k = (c) => c.join(',');
  const prev = { [k(from)]: null }, q = [from];
  while (q.length) {
    const c = q.shift(); if (k(c) === k(to)) break;
    for (const d of G.cells[k(c)] || '') { const n = [c[0] + D[d][0], c[1] + D[d][1]]; if (!G.cells[k(n)] || !G.cells[k(n)].includes(OPP[d]) || bad.has(String(n)) || k(n) in prev) continue; prev[k(n)] = c; q.push(n); }
  }
  const out = []; for (let c = to; c && k(c) !== k(from); c = prev[k(c)]) out.unshift(c); return out;
}
async function v6walk(g, from, to) { for (const c of v6path(from, to)) { if (!(await goTo(g, await viewOf(g, c)))) return false; } return true; }
module.exports.v6 = { grid: V6GRID, viewOf, cur, flag, closeups, goTo, answerQueen, choose, path: v6path, walk: v6walk };
