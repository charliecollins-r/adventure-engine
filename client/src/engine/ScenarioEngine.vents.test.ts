import { describe, expect, it } from 'vitest';
import { ScenarioEngine } from './ScenarioEngine';
import { depthScaleAt } from './walkable';
import type { Scenario, WalkArea } from './types';

/** Engine features for the vents: meters, cycles, checkpoints, pursuers, sensing patrols, sense, actions, rhythm, layers. */

const obj = (id: string, interactions: unknown[], extra: Record<string, unknown> = {}) => ({
  id, name: id, description: '', position: { x: 480, y: 600 }, size: { width: 10, height: 10 }, visual: { color: '', label: '' },
  initial_state: 'default', initially_visible: true, interactions, ...extra,
});
const go = (v: string) => [{ verb: 'move', when: [], then: [{ type: 'set_view', view: v }] }];

/**
 * A row of duct screens a — b — c — d (west to east) with a fold in c and a grate in d, plus a close-up of b.
 * Breath (max 4) is active once `in_gut` is set.
 */
function scenario(extra: Record<string, unknown> = {}): Scenario {
  return {
    schema_version: '1.0', metadata: { id: 'vents-test', title: 'Vents' },
    setting: {
      initial_view: 'a', sounds: { hum: 'audio/hum.mp3', cough: 'audio/cough.mp3' },
      actions: [{ id: 'listen', label: 'Listen', when: [{ type: 'flag_is', flag: 'in_gut' }], effects: [
        { type: 'meter_add', meter: 'breath', amount: -1 }, { type: 'set_flag', flag: 'held_breath' },
        { type: 'sense', radius: 2, bonus: { when: [{ type: 'flag_is', flag: 'allied' }], radius: 3 }, kinds: [{ label: 'Cold air', views: ['c'] }, { label: 'Clicking', patrol: 'warden' }] },
      ] }],
    },
    flags: {}, items: [{ id: 'sac', name: 'Lung-sac', description: '' }],
    views: [
      { id: 'a', background_key: 'a', objects: ['to_b', 'enter_gut'], map_xy: [0, 1] },
      { id: 'b', background_key: 'b', objects: ['to_a', 'to_c', 'panel'], map_xy: [1, 1] },
      { id: 'b_close', background_key: 'bc', back_label: 'Duct', objects: [] },
      { id: 'c', background_key: 'c', objects: ['to_b', 'to_d', 'throat'], map_xy: [2, 0],
        on_enter: [{ type: 'meter_set', meter: 'breath', value: 'max' }, { type: 'message', text: 'Cold air. You breathe.' }] },
      { id: 'd', background_key: 'd', objects: ['to_c'], map_xy: [3, 0] },
    ],
    objects: [
      obj('to_a', go('a')), obj('to_b', go('b')), obj('to_c', go('c')), obj('to_d', go('d')),
      obj('enter_gut', [{ verb: 'hand', when: [], then: [{ type: 'set_flag', flag: 'in_gut' }, { type: 'set_checkpoint', id: 'gut', text: 'the Warren', no_undo: true }] }]),
      obj('panel', [{ verb: 'look', when: [], then: [{ type: 'set_view', view: 'b_close' }] }]),
      obj('throat', [], { sprite: { file: 's.png', frame_width: 10, frame_height: 10, columns: 4, rows: 1, frame_rate: 0, scale: 1, sync_cycle: 'lung',
        frame_when: [{ when: [{ type: 'flag_is', flag: 'held_open' }], frame: 0 }] } }),
    ],
    meters: [
      { id: 'breath', label: 'Breath', max: 4, cost_per_move: 1, active_when: [{ type: 'flag_is', flag: 'in_gut' }],
        warnings: [{ at: 2, message: 'You cough.', sound: 'cough' }], on_empty: [{ type: 'game_over', reason: 'You black out.' }] },
      { id: 'sac', label: 'Sac', max: 4, initial: 0, visible_when: [{ type: 'has_item', item: 'sac' }] },
    ],
    cycles: [{ id: 'lung', phases: [{ id: 'in', seconds: 3, message: 'The lung breathes in.' }, { id: 'out', seconds: 2, sound: 'hum' }], views: ['b'] }],
    pursuers: [{
      id: 'curator', zone: ['b', 'c', 'd'], strike_views: ['d'], start_distance: 3, reset_distance: 3, strike_seconds: 4,
      silent_flag: 'held_breath', hum_sound: 'hum', hum_message: 'A hum behind the grate.', lost_message: 'The hum fades.',
      on_strike: [{ type: 'game_over', reason: 'Filed under recovered.' }],
    }],
    ...extra,
  } as unknown as Scenario;
}

const move = (e: ScenarioEngine, to: string) => e.interact(`to_${to}`, 'move');
const run = (e: ScenarioEngine, s: number) => { for (let t = 0; t < s - 1e-9; t += 0.1) e.advanceClock(Math.min(0.1, s - t)); };

describe('meters', () => {
  it('costs one per move only while active, and close-ups are free', () => {
    const e = new ScenarioEngine(scenario());
    move(e, 'b');
    expect(e.getMeterValue('breath')).toBe(4);
    e.interact('enter_gut', 'hand');
    move(e, 'a'); move(e, 'b');
    expect(e.getMeterValue('breath')).toBe(2);
    e.interact('panel', 'look');
    expect(e.currentViewId).toBe('b_close');
    expect(e.getMeterValue('breath')).toBe(2);
  });

  it('warns once as it drops past a threshold, refills on a view\'s on_enter, and runs on_empty at 0', () => {
    const e = new ScenarioEngine(scenario());
    e.interact('enter_gut', 'hand');
    move(e, 'b');
    expect(e.getMessages()).not.toContain('You cough.');
    move(e, 'a');
    expect(e.getMessages()).toContain('You cough.');
    expect(e.getPendingSounds()).toContain('audio/cough.mp3');
    move(e, 'b'); move(e, 'c');
    expect(e.getMeterValue('breath')).toBe(4);
    expect(e.getMessages()).toContain('Cold air. You breathe.');
    move(e, 'b'); move(e, 'a'); move(e, 'b');
    expect(e.isGameOver()).toBe(false);
    move(e, 'a');
    expect(e.getMeterValue('breath')).toBe(0);
    expect(e.getGameOverResult()?.text).toBe('You black out.');
  });

  it('meter_transfer pours as much as fits; visible_when hides a meter from the HUD', () => {
    const e = new ScenarioEngine(scenario());
    expect(e.getMeters().map((m) => m.id)).toEqual([]);
    e.runEffects([{ type: 'add_item', item: 'sac' }, { type: 'meter_set', meter: 'sac', amount: 4 }, { type: 'set_flag', flag: 'in_gut' }]);
    expect(e.getMeters().map((m) => m.id)).toEqual(['breath', 'sac']);
    e.runEffects([{ type: 'meter_add', meter: 'breath', amount: -3 }]);
    e.runEffects([{ type: 'meter_transfer', meter: 'sac', to: 'breath' }]);
    expect(e.getMeterValue('breath')).toBe(4);
    expect(e.getMeterValue('sac')).toBe(1);
  });

  it('meter_below / meter_above conditions', () => {
    const e = new ScenarioEngine(scenario({ objects: [...scenario().objects, obj('gauge', [
      { verb: 'look', when: [{ type: 'meter_below', meter: 'breath', threshold: 3 }], then: [{ type: 'message', text: 'low' }] },
      { verb: 'look', when: [{ type: 'meter_above', meter: 'breath', threshold: 3 }], then: [{ type: 'message', text: 'full' }] },
    ])] }));
    expect(e.interact('gauge', 'look').messages).toEqual(['full']);
    e.runEffects([{ type: 'meter_add', meter: 'breath', amount: -2 }]);
    expect(e.interact('gauge', 'look').messages).toEqual(['low']);
  });
});

describe('cycles', () => {
  it('runs phases on the game clock, with offsets, and cycle_is reads them', () => {
    const e = new ScenarioEngine(scenario());
    expect(e.getCyclePhase('lung')).toBe('in');
    run(e, 3.05);
    expect(e.getCyclePhase('lung')).toBe('out');
    run(e, 2);
    expect(e.getCyclePhase('lung')).toBe('in');
    const off = new ScenarioEngine(scenario({ cycles: [{ id: 'lung', offset: 4, phases: [{ id: 'in', seconds: 3 }, { id: 'out', seconds: 2 }] }] }));
    expect(off.getCyclePhase('lung')).toBe('out');
  });

  it('gives a phase\'s message and sound only in its views', () => {
    const e = new ScenarioEngine(scenario());
    run(e, 3.1);
    expect(e.getPendingSounds()).not.toContain('audio/hum.mp3');
    move(e, 'b');
    e.clearPendingSounds();
    run(e, 2.0);
    expect(e.getMessages()).toContain('The lung breathes in.');
    run(e, 3.0);
    expect(e.getPendingSounds()).toContain('audio/hum.mp3');
  });

  it('drives a synced sprite\'s frame, and frame_when overrides it', () => {
    const e = new ScenarioEngine(scenario());
    move(e, 'b'); move(e, 'c');
    const throat = e.getVisibleObjects().find((o) => o.id === 'throat')!;
    expect(e.getSpriteFrame(throat)).toBe(0);
    run(e, 2.6);
    expect(e.getSpriteFrame(throat)).toBe(2);
    expect(e.hasCycleSprites()).toBe(true);
    e.runEffects([{ type: 'set_flag', flag: 'held_open' }]);
    expect(e.getSpriteFrame(throat)).toBe(0);
  });
});

describe('checkpoints', () => {
  it('restarts from the zone start after a death, and the saved state carries no older checkpoint', () => {
    const e = new ScenarioEngine(scenario());
    e.interact('enter_gut', 'hand');
    expect(e.getCheckpoint()).toEqual({ id: 'gut', label: 'the Warren', noUndo: true });
    move(e, 'b'); move(e, 'a'); move(e, 'b'); move(e, 'a');
    expect(e.isGameOver()).toBe(true);
    expect(e.restoreCheckpoint()).toBe(true);
    expect(e.isGameOver()).toBe(false);
    expect(e.currentViewId).toBe('a');
    expect(e.getMeterValue('breath')).toBe(4);
    expect(e.getCheckpoint()?.id).toBe('gut');
    e.runEffects([{ type: 'set_checkpoint', id: 'core', text: 'the border' }]);
    const snap = e.snapshot();
    expect(snap.checkpoint?.snap.checkpoint).toBeNull();
    e.runEffects([{ type: 'clear_checkpoint' }]);
    expect(e.getCheckpoint()).toBeNull();
    expect(e.restoreCheckpoint()).toBe(false);
  });

  it('undo (restore) brings back the checkpoint that was set then', () => {
    const e = new ScenarioEngine(scenario());
    const before = e.snapshot();
    e.interact('enter_gut', 'hand');
    e.restore(before);
    expect(e.getCheckpoint()).toBeNull();
  });
});

describe('pursuers', () => {
  it('comes one step closer per move in its zone, hums at a grate when one move away, and strikes after strike_seconds', () => {
    const e = new ScenarioEngine(scenario());
    move(e, 'b');                       // 3 → 2
    expect(e.getPursuer('curator')?.distance).toBe(2);
    move(e, 'c');                       // 2 → 1 (no grate here)
    expect(e.getPursuer('curator')?.humming).toBe(false);
    move(e, 'd');                       // 1 → 0 at a grate: hum
    expect(e.getPursuer('curator')?.humming).toBe(true);
    expect(e.getMessages()).toContain('A hum behind the grate.');
    run(e, 3.8);
    expect(e.isGameOver()).toBe(false);
    run(e, 0.4);
    expect(e.getGameOverResult()?.text).toBe('Filed under recovered.');
  });

  it('leaving the grate in time makes it lose you (back to reset_distance)', () => {
    const e = new ScenarioEngine(scenario());
    move(e, 'b'); move(e, 'c'); move(e, 'd');
    run(e, 2);
    move(e, 'c');
    expect(e.getMessages()).toContain('The hum fades.');
    expect(e.getPursuer('curator')).toEqual({ distance: 2, humming: false });
  });

  it('holding your breath: a silent move doesn\'t bring it closer, and during a hum it loses you', () => {
    const e = new ScenarioEngine(scenario());
    move(e, 'b');
    e.runEffects([{ type: 'set_flag', flag: 'held_breath' }]);
    move(e, 'c');
    expect(e.getPursuer('curator')?.distance).toBe(2);
    expect(e.getFlags().held_breath).toBeUndefined();
    move(e, 'd');   // 2 → 1 at a grate: hum
    expect(e.getPursuer('curator')?.humming).toBe(true);
    e.runEffects([{ type: 'set_flag', flag: 'held_breath' }]);
    run(e, 0.2);
    expect(e.getPursuer('curator')).toEqual({ distance: 3, humming: false });
    run(e, 5);
    expect(e.isGameOver()).toBe(false);
  });

  it('pursuer_divert sends it away; leaving the zone resets it; pursuer_near reads it', () => {
    const e = new ScenarioEngine(scenario({ objects: [...scenario().objects, obj('ear', [
      { verb: 'look', when: [{ type: 'pursuer_near', pursuer: 'curator', threshold: 1 }], then: [{ type: 'message', text: 'close' }] },
      { verb: 'look', when: [], then: [{ type: 'message', text: 'far' }] },
    ])] }));
    move(e, 'b'); move(e, 'c');
    expect(e.interact('ear', 'look').messages).toEqual(['close']);
    e.runEffects([{ type: 'pursuer_divert', pursuer: 'curator', amount: 3 }]);
    expect(e.getPursuer('curator')?.distance).toBe(4);
    expect(e.interact('ear', 'look').messages).toEqual(['far']);
    move(e, 'b'); move(e, 'a');
    expect(e.getPursuer('curator')?.distance).toBe(3);
  });
});

describe('sense and player actions', () => {
  it('listening costs a breath, sets the silent flag and names what is within reach with directions', () => {
    const e = new ScenarioEngine(scenario());
    expect(e.getActions()).toEqual([]);
    e.interact('enter_gut', 'hand');
    expect(e.getActions().map((a) => a.id)).toEqual(['listen']);
    const r = e.runAction('listen');
    expect(e.getMeterValue('breath')).toBe(3);
    expect(e.getFlags().held_breath).toBe('true');
    expect(r.messages.join(' ')).toBe('Cold air to the east, 2 screens away.');
  });

  it('reaches further while its bonus holds, and says so when nothing is near', () => {
    const e = new ScenarioEngine(scenario({ views: scenario().views.map((v) => v.id === 'a' ? { ...v, objects: ['to_b', 'enter_gut', 'far'] } : v),
      objects: [...scenario().objects, obj('far', go('a'))] }));
    e.interact('enter_gut', 'hand');
    e.runEffects([{ type: 'sense', radius: 1, kinds: [{ label: 'Cold air', views: ['c'] }], text: 'Nothing.' }]);
    expect(e.getMessages()).toEqual(['Nothing.']);
    e.runEffects([{ type: 'set_flag', flag: 'allied' }, { type: 'sense', radius: 1, bonus: { when: [{ type: 'flag_is', flag: 'allied' }], radius: 2 }, kinds: [{ label: 'Cold air', views: ['c'] }] }]);
    expect(e.getMessages()[0]).toContain('Cold air to the east');
  });
});

describe('rhythm widget', () => {
  const withWidget = () => scenario({
    puzzle_widgets: [{
      id: 'queen', widget_type: 'rhythm', config: {
        phrases: ['LSL', 'SLSS'], extra_phrases: [{ when: [{ type: 'flag_is', flag: 'enemy' }], pattern: 'LLSSLS' }],
        beat_ms: 600, slow_after: 3, slow_factor: 1.5, hint_when: [{ type: 'flag_is', flag: 'friend' }],
      },
      on_solve: [{ type: 'set_flag', flag: 'spoke' }, { type: 'message', text: 'She heard you.' }],
      on_fail: [{ type: 'message', text: 'Pushed back.' }],
    }],
  });

  it('plays her phrases (plus extras while they hold), slows after failures, and hints while a friend is there', () => {
    const e = new ScenarioEngine(withWidget());
    e.runEffects([{ type: 'open_widget', widget: 'queen' }]);
    expect(e.getRhythmSetup()).toMatchObject({ phrases: ['LSL', 'SLSS'], beatMs: 600, hint: false, maxErrors: 3 });
    e.runEffects([{ type: 'set_flag', flag: 'enemy' }, { type: 'set_flag', flag: 'friend' }]);
    expect(e.getRhythmSetup()).toMatchObject({ phrases: ['LSL', 'SLSS', 'LLSSLS'], hint: true });
    for (let i = 0; i < 3; i++) { e.runEffects([{ type: 'open_widget', widget: 'queen' }]); e.finishRhythm(false); }
    expect(e.getMessages()).toEqual(['Pushed back.']);
    e.runEffects([{ type: 'open_widget', widget: 'queen' }]);
    expect(e.getRhythmSetup()?.beatMs).toBe(900);
    e.finishRhythm(true);
    expect(e.getFlags().spoke).toBe('true');
    expect(e.getActiveWidget()).toBeNull();
    expect(e.getMessages()).toEqual(['She heard you.']);
  });
});

describe('sensing patrols, patrol_active and map layers', () => {
  const warren = () => scenario({
    views: [{ id: 'a', background_key: 'a', objects: ['map'], walk_area: { floor: [[0, 300], [960, 300], [960, 720], [0, 720]], shadows: [[[0, 600], [200, 600], [200, 720], [0, 720]]] } }],
    objects: [obj('map', [{ verb: 'look', when: [], then: [{ type: 'show_closeup', image: 'map.webp', layers: [
      { image: 'route.png', when: [{ type: 'flag_is', flag: 'marks' }] }, { image: 'always.png' }] }] }])],
    cycles: [{ id: 'wind', phases: [{ id: 'in', seconds: 4 }, { id: 'still', seconds: 4 }] }],
    patrols: [{ id: 'warden', period: 20, first_at: 0, warn_seconds: 0, notice_seconds: 0.5,
      stops: [{ views: ['a'], enter: 0, leave: 20, path: [[100, 650], [900, 650]], sense: { radius: 150, only_while_moving: true, masked_when: [{ type: 'cycle_is', cycle: 'wind', phase: 'in' }] } }],
      on_caught: [{ type: 'game_over', reason: 'Seen.' }] }],
  });

  it('notices only a moving player near it, outside the wind and the shadows', () => {
    const e = new ScenarioEngine(warren());
    e.setLivePosition({ x: 300, y: 650 }, true);
    run(e, 3.5);                         // wind blowing: masked
    expect(e.isGameOver()).toBe(false);
    run(e, 1.2);                         // still air from 4 s; it's at ~x 280, you're moving: seen
    expect(e.getGameOverResult()?.text).toBe('Seen.');
  });

  it('standing still, far away, or in a shadow, you are safe', () => {
    const still = new ScenarioEngine(warren());
    still.setLivePosition({ x: 300, y: 650 }, false);
    run(still, 8);
    expect(still.isGameOver()).toBe(false);
    const far = new ScenarioEngine(warren());
    far.setLivePosition({ x: 900, y: 400 }, true);
    run(far, 6);
    expect(far.isGameOver()).toBe(false);
    const shade = new ScenarioEngine(warren());
    shade.setLivePosition({ x: 120, y: 660 }, true);
    run(shade, 6);
    expect(shade.isGameOver()).toBe(false);
  });

  it('patrol_active is true while a patrol is mid-sweep anywhere', () => {
    const e = new ScenarioEngine(warren());
    const st = (e as unknown as { evaluateCondition(c: unknown): boolean }).evaluateCondition({ type: 'patrol_active', patrol: 'warden' });
    expect(st).toBe(true);
  });

  it('show_closeup draws the layers whose conditions hold', () => {
    const e = new ScenarioEngine(warren());
    e.interact('map', 'look');
    expect(e.getCloseupLayers()).toEqual(['always.png']);
    e.runEffects([{ type: 'set_flag', flag: 'marks' }]);
    e.interact('map', 'look');
    expect(e.getCloseupLayers()).toEqual(['route.png', 'always.png']);
  });
});

describe('floor scale and speed', () => {
  it('a floor\'s scale multiplies its depth scale', () => {
    const area: WalkArea = { floor: [[0, 0], [10, 0], [10, 10]], scale: 0.25, depth_scale: { far_y: 0, far: 0.5, near_y: 100, near: 1 } };
    expect(depthScaleAt(area, 100)).toBe(0.25);
    expect(depthScaleAt(area, 0)).toBe(0.125);
    expect(depthScaleAt({ floor: area.floor, scale: 0.2 }, 50)).toBe(0.2);
  });
});
