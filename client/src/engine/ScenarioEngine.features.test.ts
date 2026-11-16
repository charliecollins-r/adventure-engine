import { describe, expect, it } from 'vitest';
import { ScenarioEngine } from './ScenarioEngine';
import type { Scenario } from './types';

const obj = (id: string, interactions: unknown[], extra: object = {}) => ({ id, name: id, description: '', position: { x: 0, y: 0 }, size: { width: 10, height: 10 }, visual: { color: '', label: '' }, initial_state: 'default', initially_visible: true, interactions, ...extra });
const make = (setting: object = {}) => new ScenarioEngine({
  schema_version: '1.0', metadata: { id: 'features', title: 'Features' }, setting: { initial_view: 'a', max_score: 10, ...setting },
  flags: { alarm: 'false' }, items: [],
  views: [
    { id: 'a', background_key: 'a', objects: ['bell', 'door', 'quiet_door', 'gem', 'switch', 'fan'],
      ambient_lighting: { lights: [{ x: 0.5, y: 0.5, radius: 0.3, color: [0, 0, 255], pulse_speed: 0, pulse_amount: 0, alpha: 0.1 }] },
      lighting_variants: [{ when: [{ type: 'flag_is', flag: 'alarm', value: 'true' }], lighting: { lights: [{ x: 0.5, y: 0.5, radius: 0.3, color: [255, 0, 0], pulse_speed: 2, pulse_amount: 0.5, alpha: 0.3 }] } }] },
    { id: 'b', background_key: 'b', objects: ['back'], enter_sound: null },
  ],
  objects: [
    obj('bell', [{ verb: 'hand', when: [], then: [{ type: 'add_noise', amount: 30 }] }]),
    obj('door', [{ verb: 'move', when: [], then: [{ type: 'set_view', view: 'b' }] }]),
    obj('quiet_door', [{ verb: 'move', when: [], then: [{ type: 'set_view', view: 'b', sound: 'crawl' }] }]),
    obj('back', [{ verb: 'move', when: [], then: [{ type: 'set_view', view: 'a' }] }]),
    obj('gem', [{ verb: 'hand', when: [], then: [{ type: 'add_score', points: 3, id: 'gem' }] }]),
    obj('switch', [{ verb: 'hand', when: [], then: [{ type: 'set_flag', flag: 'alarm', value: 'true' }] }]),
    obj('fan', [{ verb: 'hand', when: [], then: [{ type: 'play_animation', object: 'fan' }] }], { initially_visible: false }),
  ],
} as unknown as Scenario);

describe('engine features for set pieces', () => {
  it('noise fades by setting.noise_decay on every room change', () => {
    const e = make({ noise_decay: 10 });
    e.interact('bell', 'hand'); expect(e.getNoiseLevel()).toBe(30);
    e.interact('door', 'move'); expect(e.getNoiseLevel()).toBe(20);
    e.interact('back', 'move'); expect(e.getNoiseLevel()).toBe(10);
  });
  it('no decay unless the scenario asks for it', () => {
    const e = make();
    e.interact('bell', 'hand'); e.interact('door', 'move');
    expect(e.getNoiseLevel()).toBe(30);
  });
  it('set_view can name its own transition sound, once', () => {
    const e = make();
    e.interact('quiet_door', 'move');
    expect(e.takeTransitionSound()).toBe('crawl');
    expect(e.takeTransitionSound()).toBeUndefined();
    e.interact('back', 'move');
    expect(e.takeTransitionSound()).toBeUndefined();
  });
  it('add_score with an id is awarded once; undo rolls it back', () => {
    const e = make();
    const snap = e.snapshot();
    e.interact('gem', 'hand'); e.interact('gem', 'hand');
    expect(e.getScore()).toBe(3);
    e.restore(snap);
    expect(e.getScore()).toBe(0);
    e.interact('gem', 'hand'); expect(e.getScore()).toBe(3);
  });
  it('lighting_variants replace the lighting while their conditions hold', () => {
    const e = make();
    expect(e.getLighting()?.lights[0].color).toEqual([0, 0, 255]);
    e.interact('switch', 'hand');
    expect(e.getLighting()?.lights[0].color).toEqual([255, 0, 0]);
  });
  it('play_animation shows the object and restarts its sprite', () => {
    const e = make();
    expect(e.getAnimationRun('fan')).toBe(0);
    e.interact('fan', 'hand');
    expect(e.getAnimationRun('fan')).toBe(1);
    expect(e.getVisibleObjects().map((o) => o.id)).toContain('fan');
  });
});

describe('delayed effects', () => {
  it('a delay_then ending the game tells the UI to redraw when it fires', async () => {
    const e = new ScenarioEngine({
      schema_version: '1.0', metadata: { id: 'delay', title: 'Delay' }, setting: { initial_view: 'a' }, flags: {}, items: [],
      views: [{ id: 'a', background_key: 'a', objects: ['trap'] }],
      objects: [obj('trap', [{ verb: 'hand', when: [], then: [{ type: 'delay_then', seconds: 0.05, effects: [{ type: 'game_over', result: 'lose', reason: 'Got you.' }] }] }])],
    } as unknown as Scenario);
    let redraws = 0;
    e.setChangeListener(() => { redraws++; });
    e.interact('trap', 'hand');
    expect(e.getGameOverResult()).toBeFalsy();
    await new Promise((r) => setTimeout(r, 120));
    expect(e.getGameOverResult()).toBeTruthy();
    expect(redraws).toBe(1);
  });
});

describe('traverse, floor variants and tool mode (regressions)', () => {
  const make2 = () => new ScenarioEngine({
    schema_version: '1.0', metadata: { id: 'rope', title: 'Rope' }, setting: { initial_view: 'a' }, flags: {}, items: [],
    character: { sprite_sets: { idle: { file: 'i.png', columns: 1, rows: 1 } }, frame_width: 10, frame_height: 10, scale: 1 },
    views: [{
      id: 'a', background_key: 'a', objects: ['line', 'door'],
      character: { x: 100, y: 600, sprite_set: 'idle' },
      walk_area: { floor: [[50, 550], [300, 550], [300, 700], [50, 700]] },
      walk_area_variants: [{ when: [{ type: 'flag_is', flag: 'ledge', value: 'true' }], walk_area: { floor: [[700, 450], [800, 450], [800, 500], [700, 500]] } }],
    }],
    objects: [
      obj('line', [
        { verb: 'hand', when: [{ type: 'flag_not', flag: 'ledge', value: 'true' }], then: [
          { type: 'traverse', path: [[200, 600], [500, 520], [750, 480]], seconds: 2, facing: 'right' },
          { type: 'set_flag', flag: 'ledge', value: 'true' },
          { type: 'hide_object', object: 'line' },
          { type: 'delay_then', seconds: 2, effects: [{ type: 'show_object', object: 'line' }] }] },
      ]),
      obj('door', []),
    ],
  } as unknown as Scenario);

  it('traverse puts him at the end of the route and hands the route to the UI once', () => {
    const e = make2();
    e.interact('line', 'hand');
    expect(e.getCharacterPosition()).toMatchObject({ x: 750, y: 480, facing: 'right' });
    const route = e.takeTraverse();
    expect(route?.path).toHaveLength(3);
    expect(route?.seconds).toBe(2);
    expect(e.takeTraverse()).toBeNull();
  });

  it('a floor variant replaces the floor when its condition holds', () => {
    const e = make2();
    expect(e.getWalkArea()?.floor[0]).toEqual([50, 550]);
    e.interact('line', 'hand');
    expect(e.getWalkArea()?.floor[0]).toEqual([700, 450]);
  });

  it('in tool mode delay_then applies at once (the soft-lock search relies on this)', () => {
    const e = make2();
    e.immediateDelays = true;
    e.interact('line', 'hand');
    expect(e.getVisibleObjects().some((o) => o.id === 'line')).toBe(true);
  });

  it('normally delay_then waits', () => {
    const e = make2();
    e.interact('line', 'hand');
    expect(e.getVisibleObjects().some((o) => o.id === 'line')).toBe(false);
  });
});
