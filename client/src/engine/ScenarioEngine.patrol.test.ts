import { describe, expect, it } from 'vitest';
import { ScenarioEngine } from './ScenarioEngine';
import type { Scenario } from './types';

const obj = (id: string, interactions: unknown[]) => ({
  id, name: id, description: '', position: { x: 0, y: 0 }, size: { width: 10, height: 10 }, visual: { color: '', label: '' },
  initial_state: 'default', initially_visible: true, interactions,
});

/** Three rooms in a row (a → b → c) plus a side room; a bot sweeps a, b, c for 5 s each, every 120 s. */
function scenario(extra: Record<string, unknown> = {}): Scenario {
  const go = (v: string) => [{ verb: 'move', when: [], then: [{ type: 'set_view', view: v }] }];
  return {
    schema_version: '1.0', metadata: { id: 'patrol-test', title: 'Patrol' }, setting: { initial_view: 'a', sounds: { skitter: 'audio/skitter.mp3' } },
    flags: {}, items: [],
    views: [
      { id: 'a', background_key: 'a', objects: ['to_b', 'pod'] },
      { id: 'b', background_key: 'b', objects: ['to_a', 'to_side', 'to_c'] },
      { id: 'c', background_key: 'c', objects: ['to_b'] },
      { id: 'side', background_key: 's', objects: ['to_b', 'desk'] },
      { id: 'side_close', background_key: 'sc', back_label: 'Side room', objects: [] },
    ],
    objects: [
      obj('desk', [{ verb: 'look', when: [], then: [{ type: 'set_view', view: 'side_close' }] }]),
      obj('to_a', go('a')), obj('to_b', go('b')), obj('to_c', go('c')), obj('to_side', go('side')),
      obj('pod', [
        { verb: 'hand', when: [{ type: 'patrol_near', patrol: 'bot' }], then: [{ type: 'message', text: 'You hide.' }, { type: 'start_hiding' }] },
        { verb: 'hand', when: [], then: [{ type: 'message', text: 'A pod.' }] },
      ]),
    ],
    patrols: [{
      id: 'bot', period: 120, nearby_sound: 'far', warn_seconds: 5, warn_message: 'Clicking, coming closer.', warn_sound: 'skitter', enter_sound: 'skitter',
      notice_seconds: 1.5,
      stops: [
        { views: ['a'], enter: 0, leave: 5, path: [[900, 700], [300, 450]] },
        { views: ['b'], enter: 5, leave: 10, nearby_message: 'Next door, legs tick past.', safe_when: [{ type: 'flag_is', flag: 'up_high' }] },
        { views: ['c'], enter: 10, leave: 15, fade_out: true },
      ],
      on_caught: [{ type: 'game_over', reason: 'Filed.' }],
    }],
    ...extra,
  } as unknown as Scenario;
}

/** Run the clock in small steps, like the UI's animation frames. */
function run(e: ScenarioEngine, seconds: number) {
  for (let t = 0; t < seconds - 1e-9; t += 0.1) e.advanceClock(Math.min(0.1, seconds - t));
}

describe('game clock and patrols', () => {
  it('first_after: the sweeps start when the story starts the search, then every period', () => {
    const s = scenario();
    Object.assign(s.patrols![0], { when: [{ type: 'flag_is', flag: 'search_on' }], first_after: 20, period: 45 });
    const e = new ScenarioEngine(s);
    run(e, 200);
    expect(e.getMessages()).not.toContain('Clicking, coming closer.');   // no search yet
    e.runEffects([{ type: 'set_flag', flag: 'search_on', value: 'true' }]);
    run(e, 14.9);
    expect(e.getMessages()).not.toContain('Clicking, coming closer.');
    run(e, 0.3);                                                          // 15 s after: warned 5 s before the 20 s sweep
    expect(e.getMessages()).toContain('Clicking, coming closer.');
    // the next sweep is one period (45 s) later; it carries over an Undo (snapshot/restore)
    const snap = e.snapshot();
    const e2 = new ScenarioEngine(s);
    e2.restore(snap);
    for (const x of [e, e2]) {
      x.runEffects([{ type: 'set_view', view: 'side' }]);
      run(x, 44.4);
      x.runEffects([{ type: 'set_view', view: 'a' }]);
      run(x, 1.0);
      expect(x.getMessages()).toContain('Clicking, coming closer.');
    }
  });

  it('counts seconds of play', () => {
    const e = new ScenarioEngine(scenario());
    run(e, 3);
    expect(e.getClock()).toBeCloseTo(3);
  });

  it('warns 5 s before it comes into your room, once, with a sound', () => {
    const e = new ScenarioEngine(scenario());
    run(e, 114.9);
    expect(e.getMessages()).not.toContain('Clicking, coming closer.');
    e.advanceClock(0.2);
    expect(e.getMessages()).toContain('Clicking, coming closer.');
    expect(e.getPendingSounds()).toContain('audio/skitter.mp3'); // setting.sounds key resolved
    e.clearPendingSounds(); e.dismissMessages();
    run(e, 2);
    expect(e.getMessages()).toEqual([]);
  });

  it('catches you if you stay in its room', () => {
    const e = new ScenarioEngine(scenario());
    run(e, 120.5);
    expect(e.isGameOver()).toBe(false); // it has only just come in
    run(e, 1.2);
    expect(e.getGameOverResult()?.text).toBe('Filed.');
  });

  it('leaving the room in time saves you, and it is not in rooms off its route', () => {
    const e = new ScenarioEngine(scenario());
    run(e, 117);
    e.interact('to_b', 'move'); // a → b (it reaches b at 125)
    run(e, 5);
    e.interact('to_side', 'move'); // into the side room before it arrives
    run(e, 30);
    expect(e.isGameOver()).toBe(false);
  });

  it('walking into its room while it is there gets you caught', () => {
    const e = new ScenarioEngine(scenario());
    e.interact('to_b', 'move');
    e.interact('to_side', 'move');
    run(e, 126);
    e.interact('to_b', 'move'); // it is in b from 125 to 130
    run(e, 2);
    expect(e.isGameOver()).toBe(true);
  });

  it('hiding keeps you safe until you move; patrol_near gates the hiding spot', () => {
    const e = new ScenarioEngine(scenario());
    run(e, 10);
    expect(e.interact('pod', 'hand').messages).toEqual(['A pod.']); // not near: ordinary interaction
    run(e, 106);
    expect(e.interact('pod', 'hand').messages).toEqual(['You hide.']);
    expect(e.isHiding()).toBe(true);
    run(e, 10); // it passes through a (120–125)
    expect(e.isGameOver()).toBe(false);
    e.interact('to_b', 'move'); // moving brings you out of hiding
    expect(e.isHiding()).toBe(false);
  });

  it('safe_when protects you on that leg', () => {
    const e = new ScenarioEngine(scenario({ flags: { up_high: 'true' } }));
    e.interact('to_b', 'move');
    run(e, 135);
    expect(e.isGameOver()).toBe(false);
  });

  it('repeats every period, draws it along its path and fades it out', () => {
    const sc = scenario();
    sc.patrols![0].stops[2].safe_when = [{ type: 'flag_not', flag: 'never_set' }]; // watch it without being caught
    const e = new ScenarioEngine(sc);
    e.interact('to_b', 'move'); e.interact('to_side', 'move');
    run(e, 240 + 2.5);
    e.navigateToView('a');
    const [s] = e.getPatrolSightings();
    expect(s.x).toBeCloseTo(600, 0); // half way along its path at 2.5 of 5 s
    expect(s.y).toBeCloseTo(575, 0);
    e.navigateToView('c');
    run(e, 10); // 252.5: in c from 250 to 255, fading over the last second
    expect(e.getPatrolSightings()[0].opacity).toBe(1);
    run(e, 2); // 254.5
    expect(e.getPatrolSightings()[0].opacity).toBeCloseTo(0.5, 1);
  });

  it('does nothing while its `when` is false, or when patrols are switched off', () => {
    const off = new ScenarioEngine(scenario());
    off.patrolsEnabled = false;
    run(off, 130);
    expect(off.isGameOver()).toBe(false);
    const s = scenario();
    s.patrols![0].when = [{ type: 'flag_is', flag: 'alarm' }];
    const quiet = new ScenarioEngine(s);
    run(quiet, 130);
    expect(quiet.isGameOver()).toBe(false);
  });

  it('you hear it from next door when it comes into a neighbouring room, once per leg', () => {
    const e = new ScenarioEngine(scenario());
    e.interact('to_b', 'move'); e.interact('to_side', 'move'); // side is next door to b only
    run(e, 120.2); // it comes into a: not next door
    expect(e.getPendingSounds()).not.toContain('far');
    run(e, 5); // 125.2: it comes into b, next door
    expect(e.getPendingSounds().filter((x) => x === 'far')).toHaveLength(1);
    expect(e.getMessages()).toEqual(['Next door, legs tick past.']);
    e.clearPendingSounds();
    run(e, 3);
    expect(e.getPendingSounds()).not.toContain('far');
    expect(e.isGameOver()).toBe(false);
  });

  it('a close-up counts as the room it was opened from', () => {
    const e = new ScenarioEngine(scenario());
    e.interact('to_b', 'move'); e.interact('to_side', 'move'); e.interact('desk', 'look'); // side_close, opened from side
    run(e, 125.2);
    expect(e.getMessages()).toEqual(['Next door, legs tick past.']);
  });

  it('undo puts the clock back with everything else', () => {
    const e = new ScenarioEngine(scenario());
    run(e, 100);
    const snap = e.snapshot();
    run(e, 22);
    expect(e.isGameOver()).toBe(true);
    e.restore(snap);
    expect(e.getClock()).toBeCloseTo(100);
    expect(e.isGameOver()).toBe(false);
  });
});
