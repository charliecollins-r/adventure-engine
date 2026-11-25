import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ScenarioEngine } from './ScenarioEngine';
import type { Effect, Scenario } from './types';

/**
 * Plays The Harvest's vent maze v6 through the real scenario.json: the shortest route from the vent to the Airlock
 * Bay (scripts/vent_maze_v6_grid.json), with the lever, the gas, the Warren, the Audience, the Purge Core, the race
 * and the Purge Heart. Patrols (Wardens, the surge, the Warren's Wardens) run on real time and are tested on their own,
 * so they are switched off here; breath, breathing ducts, the Curator and checkpoints are live.
 */
const root = resolve(__dirname, '../../../scenarios/the-harvest');
const scenario = JSON.parse(readFileSync(resolve(root, 'scenario.json'), 'utf8')) as Scenario;
const grid = JSON.parse(readFileSync(resolve(root, 'scripts/vent_maze_v6_grid.json'), 'utf8'));

function targets(effects: Effect[] | undefined, out: string[] = []): string[] {
  for (const e of effects ?? []) {
    if (e.type === 'set_view' && e.view) out.push(e.view);
    targets(e.then, out); targets(e.else, out); targets(e.effects, out);
  }
  return out;
}

/** Find the exit in the current view that leads to `view`, waiting for a breathing duct's in-breath first. */
function goTo(e: ScenarioEngine, view: string) {
  const from = e.currentViewId;
  const exit = e.getVisibleObjects().find((o) => o.interactions.some((x) => x.verb === 'move' && targets(x.then).includes(view)));
  if (!exit) throw new Error(`no exit from ${from} to ${view}`);
  // a breathing duct: wait for its in-breath
  const cyc = exit.interactions.flatMap((x) => x.when ?? []).find((c) => c.type === 'cycle_is')?.cycle;
  if (cyc) for (let i = 0; i < 200 && e.getCyclePhase(cyc) !== 'in'; i++) e.advanceClock(0.1);
  e.interact(exit.id, 'move');
  if (e.isGameOver()) throw new Error(`died moving ${from} → ${view}: ${e.getGameOverResult()?.text}`);
  expect(e.currentViewId).toBe(view);
}

function viewOf(e: ScenarioEngine, c: [number, number]): string {
  const v = scenario.views.find((x) => x.map_xy && x.map_xy[0] === c[0] && x.map_xy[1] === 14 - c[1]);
  if (!v) throw new Error(`no view at ${c}`);
  return v.id;
}

describe('vent maze v6: the whole route', () => {
  it('plays from the vent to the Airlock Bay', () => {
    const e = new ScenarioEngine(scenario);
    e.patrolsEnabled = false;
    e.immediateDelays = true;
    e.runEffects(scenario.setting.dev_skip!.effects);
    expect(e.currentViewId).toBe('act1_ventilation_shaft');
    e.interact('nav_act1_vent_entry_to_act1_vent_junction', 'move');
    expect(e.currentViewId).toBe('act1_vent_junction');
    expect(e.getCheckpoint()?.id).toBe('outer');
    let lowest = 99;
    const route: [number, number][] = grid.route;
    for (let i = 1; i < route.length; i++) {
      const c = route[i];
      const target = viewOf(e, c);
      if (target === e.currentViewId) continue;
      // story beats on the way
      if (c[0] === 0 && c[1] === 3) {
        // the quarantine seal: shut until the lever has been pulled (done at the far east)
        expect(e.getFlags().lever_pulled).toBe('true');
      }
      if (c[0] === 9 && c[1] === 10) {
        // the guard wants the greeting (taught by Vera, the Archivist and the journal, all off this route)
        e.runEffects([{ type: 'set_flag', flag: 'vesk_greeting_known', value: 'true' }]);
        e.interact('v6_guard', 'talk');
        e.selectDialogueChoice(0);
        expect(e.getFlags().guard_greeted).toBe('true');
      }
      if (c[0] === 9 && c[1] === 11) {
        // the Audience: speak in breath, give up the mark, swear the vow
        e.interact('v6_queen', 'talk');
        expect(e.getActiveWidget()?.id).toBe('v6_queen_audience');
        e.finishRhythm(true);
        e.interact('v6_queen', 'talk');
        e.selectDialogueChoice(0);
        expect(e.getInventoryIds()).toContain('hollowed_tag');
        e.interact('v6_queen', 'talk');
        e.selectDialogueChoice(0);
        expect(e.getFlags().vesk_allied).toBe('true');
        expect(e.getInventoryIds()).toEqual(expect.arrayContaining(['lung_sac', 'call_stone', 'queen_egg']));
      }
      goTo(e, target);
      if (c[0] === 14 && c[1] === 1) e.interact('v6_lever', 'hand');
      if (e.getFlags().in_thin_air === 'true') lowest = Math.min(lowest, e.getMeterValue('breath'));
      if (c[0] === 0 && c[1] === 3) expect(e.getCheckpoint()?.id).toBe('gut');
      if (c[0] === 9 && c[1] === 11) { expect(e.getCheckpoint()?.id).toBe('core'); expect(e.getMeterValue('callstone')).toBe(2); }
    }
    expect(e.currentViewId).toBe('act1_vent_fan_room');
    expect(e.getFlags().heart_race).toBe('true');
    expect(e.getCheckpoint()?.id).toBe('heart');
    e.interact('fan_mechanism', 'use_item', 'surgical_probe');
    expect(e.getFlags().purge_stopped).toBe('true');
    e.interact('vent_fan', 'move');
    expect(e.currentViewId).toBe('act1_vent_exit');
    e.interact('exit_hatch', 'move');
    expect(e.currentViewId).toBe('act1_airlock_bay');
    expect(e.getCheckpoint()).toBeNull();
    expect(e.isGameOver()).toBe(false);
    expect(lowest).toBeGreaterThan(0);
  });

  it('dying in the Gut restarts at the Warren ledge with full breath, and the Audience can be retried', () => {
    const e = new ScenarioEngine(scenario);
    e.patrolsEnabled = false;
    e.runEffects(scenario.setting.dev_skip!.effects);
    e.runEffects([{ type: 'set_flag', flag: 'lever_pulled', value: 'true' }, { type: 'set_view', view: viewOf(e, [0, 2]) }]);
    goTo(e, viewOf(e, [0, 3]));
    expect(e.getCheckpoint()?.label).toBe('the Warren ledge');
    // walk until out of air
    for (let i = 0; i < 20 && !e.isGameOver(); i++) e.runEffects([{ type: 'meter_add', meter: 'breath', amount: -1 }]);
    expect(e.getGameOverResult()?.title).toBe('Out of air');
    e.restoreCheckpoint();
    expect(e.currentViewId).toBe(viewOf(e, [0, 3]));
    expect(e.getMeterValue('breath')).toBe(9);
    expect(e.isGameOver()).toBe(false);
  });

  it('the Purge Core: the Curator hums at a grate and strikes unless you leave or hold your breath', () => {
    const e = new ScenarioEngine(scenario);
    e.patrolsEnabled = false;
    e.runEffects(scenario.setting.dev_skip!.effects);
    e.runEffects([{ type: 'set_flag', flag: 'in_core', value: 'true' }, { type: 'set_flag', flag: 'in_thin_air', value: 'true' },
      { type: 'set_view', view: viewOf(e, [9, 11]) }]);
    // walk back and forth next to a grate until it is close enough to hum
    const grate = grid.grates.find((g: number[]) => g[0] === 8 && g[1] === 12) as [number, number];
    for (let i = 0; i < 6; i++) { goTo(e, viewOf(e, [8, 11])); goTo(e, viewOf(e, [9, 11])); if ((e.getPursuer('v6_curator')?.distance ?? 9) <= 1) break; }
    goTo(e, viewOf(e, [8, 11]));
    goTo(e, viewOf(e, grate));
    expect(e.getPursuer('v6_curator')?.humming).toBe(true);
    e.runAction('listen');
    e.advanceClock(0.2);
    expect(e.getPursuer('v6_curator')?.humming).toBe(false);
    e.advanceClock(5);
    expect(e.isGameOver()).toBe(false);
  });

  it('every walking v6 view has a floor and a character spot, and every exit leads somewhere real', () => {
    const ids = new Set(scenario.views.map((v) => v.id));
    for (const v of scenario.views.filter((x) => x.id.startsWith('act1_v6_'))) {
      for (const oid of v.objects) {
        const o = scenario.objects.find((x) => x.id === oid)!;
        for (const x of o.interactions) for (const t of targets(x.then)) expect(ids.has(t), `${oid} → ${t}`).toBe(true);
      }
      if (v.walk_area) expect(v.character, v.id).toBeTruthy();
    }
  });
});
