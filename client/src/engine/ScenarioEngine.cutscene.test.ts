import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ScenarioEngine } from './ScenarioEngine';
import type { Scenario } from './types';

/** Cutscenes (play_cutscene), message delivery styles, and The Harvest's playable prologue, headless. */
function mini(): Scenario {
  return {
    metadata: { id: 't', title: 'T' },
    setting: {
      initial_view: 'ship', ambient_text: '', room_style: { background_color: '', wall_color: '', floor_color: '' },
      cutscenes: { taken: [{ lines: [{ text: 'gone' }] }] },
      prologue: { view: 'space' },
    },
    views: [
      { id: 'ship', background_key: 'ship', objects: [] },
      { id: 'space', background_key: 'space', objects: ['panel'] },
    ],
    objects: [{
      id: 'panel', name: 'Panel', description: '', position: { x: 0, y: 0 }, size: { width: 10, height: 10 }, initial_state: 'default',
      interactions: [{ verb: 'look', then: [
        { type: 'message', text: 'Control, come in.', voice: 'v/p.mp3', style: 'comms' },
        { type: 'play_cutscene', cutscene: 'taken', wake: true, then: [{ type: 'set_flag', flag: 'taken', value: 'true' }, { type: 'set_view', view: 'ship' }] },
      ] }],
    }],
    items: [],
  } as unknown as Scenario;
}

describe('cutscenes', () => {
  it('play_cutscene waits for the UI; finishing it applies `then` and reports the wake-up', () => {
    const e = new ScenarioEngine(mini());
    e.navigateToView('space');
    e.interact('panel', 'look');
    expect(e.getCutscene()).toEqual({ id: 'taken', wake: true });
    expect(e.getFlags().taken).toBeUndefined();
    expect(e.finishCutscene()).toEqual({ wake: true });
    expect(e.getCutscene()).toBeNull();
    expect(e.getFlags().taken).toBe('true');
    expect(e.currentViewId).toBe('ship');
    expect(e.finishCutscene()).toEqual({ wake: false });   // nothing pending
  });

  it('headless runs (autoCutscenes) apply the cutscene at once', () => {
    const e = new ScenarioEngine(mini());
    e.autoCutscenes = true;
    e.navigateToView('space');
    e.interact('panel', 'look');
    expect(e.getCutscene()).toBeNull();
    expect(e.currentViewId).toBe('ship');
  });

  it('a message remembers how it is delivered, by text and by voice clip', () => {
    const e = new ScenarioEngine(mini());
    e.navigateToView('space');
    e.interact('panel', 'look');
    expect(e.getLineStyle('Control, come in.')).toEqual({ style: 'comms', static: undefined });
    expect(e.getLineStyle('v/p.mp3')?.style).toBe('comms');
    expect(e.getLineStyle('something else')).toBeNull();
  });

  it('a delayed message shows once (it used to be added twice)', async () => {
    const e = new ScenarioEngine(mini());
    e.runEffects([{ type: 'delay_then', seconds: 0.01, effects: [{ type: 'message', text: 'later' }] }]);
    await new Promise((r) => setTimeout(r, 40));
    expect(e.getMessages().filter((m) => m === 'later')).toHaveLength(1);
  });

  it('a death can carry its own sound (a path, or a setting.sounds key)', () => {
    const e = new ScenarioEngine(mini());
    e.runEffects([{ type: 'game_over', result: 'lose', reason: 'x', sound: 'audio/deaths/fan.mp3' }]);
    expect(e.getGameOverResult()?.sound).toBe('audio/deaths/fan.mp3');
    const f = new ScenarioEngine(mini());
    f.runEffects([{ type: 'game_over', result: 'lose', reason: 'x' }]);
    expect(f.getGameOverResult()?.sound).toBeUndefined();
  });

  it('setting.narration first_person turns the engine\'s own lines into the hero\'s thoughts', () => {
    const sc = mini();
    expect(new ScenarioEngine(sc).narrate("You can't go that way.")).toBe("You can't go that way.");
    sc.setting.narration = 'first_person';
    const e = new ScenarioEngine(sc);
    expect(e.narrate("You can't go that way.")).toBe("I can't go that way.");
    expect(e.narrate('Your hand finds only empty air. Nothing catches your eye.')).toBe('My hand finds only empty air. Nothing catches my eye.');
  });

  it('finishing a cutscene cancels anything still timed from before it', async () => {
    const e = new ScenarioEngine(mini());
    e.navigateToView('space');
    e.runEffects([{ type: 'delay_then', seconds: 0.02, effects: [{ type: 'set_flag', flag: 'late', value: 'true' }] }]);
    e.interact('panel', 'look');
    e.finishCutscene();
    await new Promise((r) => setTimeout(r, 50));
    expect(e.getFlags().late).toBeUndefined();
  });
});

describe('The Harvest: the playable prologue', () => {
  const scenario = JSON.parse(readFileSync(resolve(__dirname, '../../../scenarios/the-harvest/scenario.json'), 'utf8')) as Scenario;

  it('spacewalk → panel → the abduction → the Stasis Hold', () => {
    const e = new ScenarioEngine(scenario);
    e.patrolsEnabled = false;
    e.immediateDelays = true;
    const pro = scenario.setting.prologue!;
    e.runEffects([{ type: 'set_view', view: pro.view }]);
    expect(e.currentViewId).toBe('intro_spacewalk');
    expect(e.getFlags().sw_briefed).toBe('true');            // Control's call and the pilot's answer ran
    e.interact('sw_lumen_body', 'hand');
    expect(e.currentViewId).toBe('intro_panel_closeup');
    e.interact('pn_boards', 'look');
    expect(e.getCutscene()).toEqual({ id: 'abduction', wake: true });
    expect(scenario.setting.cutscenes!.abduction.length).toBeGreaterThan(2);
    expect(e.finishCutscene().wake).toBe(true);
    expect(e.currentViewId).toBe(scenario.setting.initial_view);
    expect(e.getInventoryIds()).toEqual([]);                  // the prologue hands nothing over
  });

  it('the pilot is drawn in his spacesuit sheet, at its own size, and the tips cover both routes', () => {
    const eva = scenario.character!.sprite_sets.eva;
    expect(eva.file).toBe('intro/sprites/eva_float_v3.png');   // the owner's v3 float sheet (scripts/build_eva_v3.py)
    expect(scenario.views.find((v) => v.id === 'intro_spacewalk')!.character!.sprite_set).toBe('eva');
    const steps = scenario.setting.tutorial!.steps;
    expect(steps.filter((s) => s.prologue === 'only').length).toBeGreaterThan(0);
    expect(steps.filter((s) => s.prologue === 'if_skipped').length).toBeGreaterThan(0);
  });
});
