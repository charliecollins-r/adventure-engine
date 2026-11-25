#!/usr/bin/env node
/**
 * Hotspot preview: renders a view's background at the game's 960x540 viewport with every
 * hotspot box, sprite anchor and the character's footprint drawn on top. Use it to review a
 * newly generated background against the existing hotspots BEFORE wiring it in, and again
 * after refitting.
 *
 * Usage:
 *   node tools/preview-hotspots.mjs <scenario.json> <view_id> [--image path] [--out file.png]
 *
 *   --image   Render this image instead of the view's background_file (e.g. a fresh
 *             Gemini output you haven't installed yet).
 *   --out     Output PNG (default: ./preview_<view_id>.png)
 *
 * Legend: gold = interactive object, blue = navigation, green dot + box = sprite
 * (bottom-center anchor and rendered size), red = character footprint (frame size × scale),
 * cyan = walk_area floor and walk_to stand points, red fill = blocked areas.
 * Options: --grid (label 960x720 coordinates), --floor '[[x,y],...]' (preview a candidate floor),
 *   --ghosts (draw the player's idle sprite at sample spots across the floor, to check he never
 *   seems to stand on or in front of painted furniture), --clean (no hotspot boxes).
 */
import { readFileSync, writeFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { dirname, join } from 'path';
import { createCanvas, loadImage } from 'canvas';

const args = process.argv.slice(2);
const [file, viewId] = args;
if (!file || !viewId) { console.log('Usage: node tools/preview-hotspots.mjs <scenario.json> <view_id> [--image path] [--out file.png]'); process.exit(1); }
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const s = JSON.parse(readFileSync(file, 'utf8'));
const view = s.views.find((v) => v.id === viewId);
if (!view) { console.error(`No view "${viewId}"`); process.exit(1); }
const objs = Object.fromEntries(s.objects.map((o) => [o.id, o]));
const imgPath = opt('--image') || (view.background_file && join(dirname(file), view.background_file));
const out = opt('--out') || `preview_${viewId}.png`;

async function load(p) {
  try { return await loadImage(p); }
  catch { return loadImage(execFileSync('convert', [p, 'png:-'], { maxBuffer: 64 * 1024 * 1024 })); } // WebP etc.
}

const W = 960, H = 540, SY = 0.75;
const c = createCanvas(W, H); const g = c.getContext('2d');
g.fillStyle = '#0a1520'; g.fillRect(0, 0, W, H);
if (imgPath) {
  const im = await load(imgPath);
  const sc = Math.max(W / im.width, H / im.height); // object-fit: cover
  g.drawImage(im, (W - im.width * sc) / 2, (H - im.height * sc) / 2, im.width * sc, im.height * sc);
}
g.font = '11px sans-serif'; g.lineWidth = 2;
const label = (t, x, y, col) => { g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x, y, g.measureText(t).width + 6, 14); g.fillStyle = col; g.fillText(t, x + 3, y + 11); };
// --grid: label 960x720 coordinates every 40 px (for picking floor points)
if (process.argv.includes('--grid')) {
  g.save(); g.lineWidth = 1; g.font = '9px sans-serif';
  for (let x = 0; x <= 960; x += 40) { g.strokeStyle = x % 200 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.35)'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); if (x % 80 === 0) { g.fillStyle = '#fff'; g.fillText(String(x), x + 2, 10); } }
  for (let y = 0; y <= 720; y += 40) { const sy = y * SY; g.strokeStyle = y % 200 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.35)'; g.beginPath(); g.moveTo(0, sy); g.lineTo(W, sy); g.stroke(); if (y % 80 === 0) { g.fillStyle = '#fff'; g.fillText(String(y), 2, sy - 2); } }
  g.restore();
}
// Walk area: floor (cyan), blocked areas (red). --floor '<json>' previews a candidate floor.
const wa = opt('--floor') ? { ...(view.walk_area || {}), floor: JSON.parse(opt('--floor')) } : view.walk_area;
const poly = (pts, fill, stroke) => { if (!pts || pts.length < 2) return; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y * SY) : g.moveTo(x, y * SY))); g.closePath(); g.fillStyle = fill; g.fill(); g.strokeStyle = stroke; g.stroke(); pts.forEach(([x, y]) => { g.fillStyle = stroke; g.fillRect(x - 3, y * SY - 3, 6, 6); }); };
if (wa?.floor) {
  poly(wa.floor, 'rgba(34,211,238,0.16)', '#22d3ee');
  for (const b of wa.blocked || []) poly(b, 'rgba(248,113,113,0.25)', '#f87171');
  label('floor', wa.floor[0][0], wa.floor[0][1] * SY, '#22d3ee');
}
const clean = process.argv.includes('--clean');
for (const id of clean ? [] : view.objects) {
  const o = objs[id]; if (!o) continue;
  const hidden = o.initially_visible === false;
  if (o.sprite) {
    const w = o.sprite.frame_width * o.sprite.scale, h = o.sprite.frame_height * o.sprite.scale;
    const ax = o.position.x, ay = o.position.y * SY;
    g.strokeStyle = '#4ade80'; g.setLineDash(hidden ? [4, 4] : []); g.strokeRect(ax - w / 2, ay - h, w, h);
    g.fillStyle = '#4ade80'; g.beginPath(); g.arc(ax, ay, 4, 0, Math.PI * 2); g.fill();
    label(id + (hidden ? ' (hidden)' : ''), ax - w / 2, ay - h, '#4ade80');
  } else {
    const nav = o.visual?.nav || id.startsWith('nav_');
    const col = nav ? '#60a5fa' : '#facc15';
    g.strokeStyle = col; g.setLineDash(hidden ? [4, 4] : []);
    g.strokeRect(o.position.x, o.position.y * SY, o.size.width, o.size.height * SY);
    label(id + (hidden ? ' (hidden)' : ''), o.position.x, o.position.y * SY, col);
  }
}
g.setLineDash([]);
// explicit stand points (walk_to) as small cyan crosses
for (const id of view.objects) { const o = objs[id]; const w = o?.walk_to; if (!w) continue; g.strokeStyle = '#22d3ee'; g.beginPath(); g.moveTo(w.x - 6, w.y * SY); g.lineTo(w.x + 6, w.y * SY); g.moveTo(w.x, w.y * SY - 6); g.lineTo(w.x, w.y * SY + 6); g.stroke(); }
// --ghosts: the player's idle sprite at sample floor points (outline vertices pulled inward + an interior grid).
if (process.argv.includes('--ghosts') && wa?.floor && s.character) {
  // the view's own sprite set (a spacesuit in orbit), else idle; a set can have its own frame size and scale
  const ch0 = s.character, set = ch0.sprite_sets[view.character?.sprite_set] || ch0.sprite_sets.idle || Object.values(ch0.sprite_sets)[0];
  const sheet = await load(join(dirname(file), set.file));
  const dirs = set.directions || ['down']; const row = Math.max(0, dirs.indexOf('down'));
  const sc = (set.scale ?? ch0.scale ?? 1) * (wa.scale ?? 1), fw = set.frame_width ?? ch0.frame_width, fh = set.frame_height ?? ch0.frame_height;
  const inside = (x, y, pts) => { let a = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) a = !a; } return a; };
  const ok = (x, y) => inside(x, y, wa.floor) && !(wa.blocked || []).some((b) => inside(x, y, b));
  const cx = wa.floor.reduce((a, p) => a + p[0], 0) / wa.floor.length, cy = wa.floor.reduce((a, p) => a + p[1], 0) / wa.floor.length;
  const pts = [];
  for (const [x, y] of wa.floor) { for (const f of [0.06, 0.15, 0.3]) { const px = x + (cx - x) * f, py = y + (cy - y) * f; if (ok(px, py)) { pts.push([px, py]); break; } } }
  const step = Number(opt('--ghost-step') || 110);
  for (let y = 0; y <= 720; y += step * 0.75) for (let x = step / 2; x < 960; x += step) if (ok(x, y) && !pts.some(([px, py]) => Math.hypot(px - x, (py - y) * 0.75) < step * 0.5)) pts.push([x, y]);
  pts.sort((a, b) => a[1] - b[1]);
  const ds = wa.depth_scale;
  const depth = (y) => (ds ? ds.far + (ds.near - ds.far) * Math.max(0, Math.min(1, (y - ds.far_y) / ((ds.near_y - ds.far_y) || 1))) : 1);
  for (const [x, y] of pts) {
    const k = sc * depth(y);
    g.drawImage(sheet, 0, row * fh, fw, fh, x - (fw * k) / 2, y * SY - fh * k, fw * k, fh * k);
    g.fillStyle = '#22d3ee'; g.beginPath(); g.arc(x, y * SY, 3, 0, Math.PI * 2); g.fill();
  }
  console.log(`ghosts at ${pts.length} spots`);
}
const ch = view.character;
if (ch && s.character && !clean) {
  const set = s.character.sprite_sets[ch.sprite_set] || {};
  const sc = set.scale ?? s.character.scale ?? 1, w = (set.frame_width ?? s.character.frame_width) * sc, h = (set.frame_height ?? s.character.frame_height) * sc;
  g.strokeStyle = '#f87171'; g.strokeRect(ch.x - w / 2, ch.y * SY - h, w, h);
  label('character', ch.x - w / 2, ch.y * SY - h, '#f87171');
}
writeFileSync(out, c.toBuffer('image/png'));
console.log(`Wrote ${out}`);
