#!/usr/bin/env node
/**
 * Scenario validator: catches the mistakes that parse fine but silently break play.
 *
 * Usage:
 *   node tools/validate-scenario.mjs scenarios/<id>/scenario.json [--views <prefix>]
 *
 * Errors (exit code 1):
 *   - duplicate keys in any JSON object (the LAST one silently wins in browsers)
 *   - use_item interactions without an `item` (the engine can never match them)
 *   - references to unknown item / object / view ids (incl. object ids used as item ids)
 *   - views listing unknown objects; initial_view missing
 *   - ambient lights missing required numeric fields (NaN crashes the lighting canvas)
 *   - referenced asset files (backgrounds, sprites, icons, audio) missing on disk
 * Warnings:
 *   - plain hotspots outside the 960x720 space; sprite anchors outside it
 *   - items that are used/required but never granted by anything
 *   - flags read by conditions but never set and not initialised
 *   - unconditional hints placed after conditional ones (getHint returns the LAST match)
 *
 * --views limits object/interaction checks to views whose id starts with the prefix
 * (useful while later acts are still stubs).
 */
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';

const args = process.argv.slice(2);
const file = args[0];
if (!file) { console.log('Usage: node tools/validate-scenario.mjs <scenario.json> [--views prefix]'); process.exit(1); }
const vi = args.indexOf('--views');
const prefix = vi >= 0 ? args[vi + 1] : '';
const dir = dirname(file);
const raw = readFileSync(file, 'utf8');
const errors = [], warnings = [];

// ---- duplicate-key scan (JSON.parse drops duplicates silently) ---------------
(function scanDupes(src) {
  let i = 0; const path = [];
  const ws = () => { while (/\s/.test(src[i])) i++; };
  const str = () => { let s = ''; i++; while (src[i] !== '"') { if (src[i] === '\\') { s += src[i] + src[i + 1]; i += 2; } else s += src[i++]; } i++; return s; };
  function val() {
    ws();
    if (src[i] === '{') {
      i++; const seen = new Set(); ws();
      if (src[i] === '}') { i++; return; }
      for (;;) {
        ws(); const k = str();
        if (seen.has(k)) errors.push(`duplicate key "${k}" at ${path.join('.') || '(root)'} (line ${src.slice(0, i).split('\n').length})`);
        seen.add(k); ws(); i++; path.push(k); val(); path.pop(); ws();
        if (src[i] === ',') { i++; continue; } i++; return;
      }
    }
    if (src[i] === '[') {
      i++; ws(); let n = 0;
      if (src[i] === ']') { i++; return; }
      for (;;) { path.push(n++); val(); path.pop(); ws(); if (src[i] === ',') { i++; continue; } i++; return; }
    }
    if (src[i] === '"') { str(); return; }
    while (i < src.length && !/[,\]}\s]/.test(src[i])) i++;
  }
  val();
})(raw);

const s = JSON.parse(raw);
const itemIds = new Set(s.items.map(x => x.id));
const objIds = new Set(s.objects.map(x => x.id));
const viewIds = new Set(s.views.map(x => x.id));
const scopeViews = s.views.filter(v => v.id.startsWith(prefix));
const scopeObjs = new Set(scopeViews.flatMap(v => v.objects));
const granted = new Set(), required = new Set(), flagsSet = new Set(Object.keys(s.flags || {})), flagsRead = new Map();
const where = (o, it) => `${o}${it ? ` [${it.verb}${it.item ? ' ' + it.item : ''}]` : ''}`;

function checkItem(id, ctx) {
  if (!id) return;
  if (!itemIds.has(id)) errors.push(`${ctx}: unknown item "${id}"${objIds.has(id) ? ' (that is an OBJECT id; use the item it yields)' : ''}`);
}
function conds(cs, ctx) {
  for (const c of cs || []) {
    if (['has_item', 'not_has_item', 'item_count'].includes(c.type)) { checkItem(c.item, ctx); if (c.type === 'has_item') required.add(c.item); }
    if (c.type === 'object_state' && !objIds.has(c.object)) errors.push(`${ctx}: condition on unknown object "${c.object}"`);
    if (c.type === 'view_is' && !viewIds.has(c.view)) errors.push(`${ctx}: condition on unknown view "${c.view}"`);
    if (c.type === 'flag_is' || c.type === 'flag_not') { if (!flagsRead.has(c.flag)) flagsRead.set(c.flag, ctx); }
    conds(c.conditions, ctx);
  }
}
function effs(es, ctx) {
  for (const e of es || []) {
    if (['add_item', 'remove_item', 'transform_item'].includes(e.type)) checkItem(e.item, ctx);
    if (e.type === 'add_item') granted.add(e.item);
    if (e.type === 'transform_item') { checkItem(e.into, ctx); granted.add(e.into); }
    if (['set_state', 'show_object', 'hide_object', 'set_animation'].includes(e.type) && !objIds.has(e.object)) errors.push(`${ctx}: effect "${e.type}" on unknown object "${e.object}"`);
    if (e.type === 'set_view' && !viewIds.has(e.view)) errors.push(`${ctx}: set_view to unknown view "${e.view}"`);
    if (e.type === 'set_flag') flagsSet.add(e.flag);
    if (e.type === 'show_closeup' && e.image && !existsSync(join(dir, e.image))) errors.push(`${ctx}: closeup image missing: ${e.image}`);
    conds(e.when, ctx); effs(e.then, ctx); effs(e.else, ctx); effs(e.effects, ctx);
    for (const ch of e.choices || []) { conds(ch.when, ctx); effs(ch.then, ctx); }
  }
}
const asset = (p, ctx) => { if (p && !existsSync(join(dir, p))) errors.push(`${ctx}: missing file ${p}`); };

if (!viewIds.has(s.setting?.initial_view)) errors.push(`setting.initial_view "${s.setting?.initial_view}" is not a view`);
for (const v of scopeViews) {
  for (const o of v.objects) if (!objIds.has(o)) errors.push(`view ${v.id}: lists unknown object "${o}"`);
  asset(v.background_file, `view ${v.id}`);
  (v.ambient_lighting?.lights || []).forEach((l, i) => {
    for (const k of ['x', 'y', 'radius', 'pulse_speed', 'pulse_amount', 'alpha']) if (typeof l[k] !== 'number') errors.push(`view ${v.id}: ambient light #${i} missing numeric "${k}"`);
  });
  for (const h of v.hints || []) conds(h.when, `view ${v.id} hint`);
  (v.hints || []).forEach((h, i, hs) => {
    const unconditional = !h.when || h.when.length === 0;
    if (unconditional && hs.slice(0, i).some(x => x.when && x.when.length)) warnings.push(`view ${v.id}: unconditional hint #${i} comes after conditional ones; the engine shows the LAST matching hint, so it masks them. Move it first.`);
  });
}
for (const o of s.objects) {
  if (!scopeObjs.has(o.id)) continue;
  const { x, y } = o.position || {}; const { width: w, height: h } = o.size || {};
  if (o.sprite) {
    asset(o.sprite.file, `object ${o.id} sprite`);
    if (x < 0 || x > 960 || y < 0 || y > 720) warnings.push(`object ${o.id}: sprite anchor (${x},${y}) outside 960x720`);
  } else if (x < 0 || y < 0 || x + w > 960 || y + h > 720) warnings.push(`object ${o.id}: hotspot (${x},${y}) ${w}x${h} exceeds 960x720`);
  for (const it of o.interactions || []) {
    const ctx = `object ${where(o.id, it)}`;
    if (it.verb === 'use_item' && !it.item) errors.push(`object ${o.id}: use_item interaction has no "item" — it can never match`);
    if (it.verb === 'use_item') { checkItem(it.item, `object ${o.id} [use_item]`); required.add(it.item); }
    conds(it.when, ctx); effs(it.then, ctx);
  }
}
for (const it of s.items) {
  asset(it.icon_file, `item ${it.id} icon`);
  for (const x of it.examine || []) { conds(x.when, `item ${it.id}`); effs(x.then, `item ${it.id}`); }
}
for (const c of s.combinations || []) {
  const ctx = `combination ${c.items.join('+')}`;
  c.items.forEach(i => { checkItem(i, ctx); required.add(i); }); checkItem(c.result, ctx); granted.add(c.result); conds(c.conditions, ctx);
}
for (const [k, p] of Object.entries(s.setting?.sounds || {})) asset(p, `setting.sounds.${k}`);
const ambient = s.setting?.ambient_audio; (Array.isArray(ambient) ? ambient : ambient ? [ambient] : []).forEach(p => asset(p, 'setting.ambient_audio'));
if (s.character) for (const [k, ss] of Object.entries(s.character.sprite_sets || {})) asset(ss.file, `character.sprite_sets.${k}`);

const scopedItemRefs = new Set();
for (const o of s.objects) if (scopeObjs.has(o.id)) for (const it of o.interactions || []) if (it.item) scopedItemRefs.add(it.item);
for (const i of required) if (scopedItemRefs.has(i) && !granted.has(i)) warnings.push(`item "${i}" is required somewhere but nothing grants it`);
for (const [f, ctx] of flagsRead) if (!flagsSet.has(f)) warnings.push(`flag "${f}" is read (${ctx}) but never set or initialised`);

for (const e of errors) console.log('ERROR   ', e);
for (const w of warnings) console.log('warning ', w);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)${prefix ? ` (objects scoped to views "${prefix}*")` : ''}`);
process.exit(errors.length ? 1 : 0);
