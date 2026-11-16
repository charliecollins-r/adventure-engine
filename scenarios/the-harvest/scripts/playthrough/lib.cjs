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
// Route through the vent maze from the layout file: [{ nav, view }] steps from cell `from` to cell `to`.
module.exports.mazeRoute = (from, to) => {
  const grid = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'vent_maze_grid.json'), 'utf8'));
  const C = grid.cells, purge = new Set(grid.purge);
  const D = { N: [0, 1], S: [0, -1], E: [1, 0], W: [-1, 0] }, OPP = { N: 'S', S: 'N', E: 'W', W: 'E' }, WORD = { N: 'north', S: 'south', E: 'east', W: 'west' };
  const at = {}; for (const [k, v] of Object.entries(C)) at[v[0].join(',')] = k;
  const view = (c) => ({ J: 'act1_vent_junction', GAS: 'act1_vent_gas_chamber', COLL: 'act1_vent_collapsed', ENTRY: 'act1_ventilation_shaft' }[c] || `act1_vent_maze_${c.toLowerCase()}`);
  const prev = { [from]: null }, q = [from];
  while (q.length) { const c = q.shift(); if (c === to) break; for (const d of C[c][1]) { const [x, y] = C[c][0]; const n = at[[x + D[d][0], y + D[d][1]].join(',')]; if (n && !purge.has(n) && C[n][1].includes(OPP[d]) && !(n in prev) && n !== 'ENTRY') { prev[n] = [c, d]; q.push(n); } } }
  const steps = []; for (let c = to; prev[c]; c = prev[c][0]) steps.unshift([prev[c][0], prev[c][1], c]);
  return steps.map(([c, d, n]) => {
    let nav = `nav_vent_maze_${c.toLowerCase()}_${WORD[d]}`;
    if (c === 'J') nav = d === 'W' ? 'nav_act1_vent_junction_to_act1_vent_gas_chamber' : 'nav_act1_vent_junction_to_act1_vent_collapsed';
    if (c === 'GAS') nav = 'nav_act1_vent_gas_to_act1_vent_junction';
    if (c === 'COLL') nav = 'nav_act1_vent_collapsed_to_act1_vent_junction';
    return { nav, view: view(n) };
  });
};
