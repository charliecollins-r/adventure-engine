import { describe, expect, it } from 'vitest';
import { ScenarioEngine } from './ScenarioEngine';
import type { Scenario, ScenarioObject } from './types';
import { isOnFloor } from './walkable';

const obj = (o: Partial<ScenarioObject> & { id: string }): ScenarioObject => ({
  name: o.id, description: '', position: { x: 0, y: 0 }, size: { width: 10, height: 10 },
  visual: { color: '', label: '' }, initial_state: 'default', initially_visible: true, interactions: [], ...o,
});

function scenario(): Scenario {
  return {
    schema_version: '1.0',
    metadata: { id: 'walk-test', title: 'Walk test' },
    setting: { initial_view: 'hall' },
    flags: {},
    items: [{ id: 'key', name: 'Key', description: '' }],
    character: {
      frame_width: 100, frame_height: 200, scale: 0.5,
      sprite_sets: { idle: { file: 'i.png', columns: 1, rows: 1, frame_rate: 0 }, walk: { file: 'w.png', columns: 4, rows: 1 } },
    },
    views: [
      {
        id: 'hall', background_key: 'hall', objects: ['door', 'crate', 'painting', 'far_screen', 'rug'],
        character: { x: 100, y: 600, facing: 'right', sprite_set: 'idle' },
        walk_area: { floor: [[0, 500], [960, 500], [960, 720], [0, 720]], blocked: [[[400, 560], [520, 560], [520, 640], [400, 640]]] },
      },
      { id: 'yard', background_key: 'yard', objects: ['gate'], character: { x: 480, y: 650, sprite_set: 'idle' },
        walk_area: { floor: [[0, 550], [960, 550], [960, 720], [0, 720]] } },
      { id: 'closeup', background_key: 'c', objects: [], back_label: 'Hall' },
      { id: 'classic', background_key: 'k', objects: ['door'], character: { x: 300, y: 600, sprite_set: 'idle' } },
    ],
    objects: [
      obj({ id: 'door', position: { x: 880, y: 300 }, size: { width: 60, height: 200 },
        interactions: [{ verb: 'move', when: [], then: [{ type: 'set_view', view: 'yard', at: { x: 40, y: 640, facing: 'right' } }] }] }),
      obj({ id: 'crate', position: { x: 300, y: 620 }, sprite: { file: 'c.png', frame_width: 80, frame_height: 60, columns: 1, rows: 1, frame_rate: 0, scale: 1 },
        interactions: [{ verb: 'look', when: [], then: [{ type: 'set_view', view: 'closeup' }] }] }),
      obj({ id: 'painting', position: { x: 600, y: 100 }, size: { width: 100, height: 80 }, walk_to: { x: 650, y: 520, facing: 'up' } }),
      obj({ id: 'far_screen', position: { x: 100, y: 50 }, size: { width: 50, height: 50 }, walk_to: false }),
      obj({ id: 'rug', position: { x: 440, y: 590 }, size: { width: 40, height: 20 } }),
      obj({ id: 'gate', interactions: [{ verb: 'move', when: [], then: [{ type: 'set_view', view: 'hall' }] }] }),
    ],
  } as unknown as Scenario;
}

describe('engine walking state', () => {
  it('starts at the view placement and reports the walk area', () => {
    const e = new ScenarioEngine(scenario());
    expect(e.getWalkArea()).not.toBeNull();
    expect(e.getCharacterPlacement()).toMatchObject({ x: 100, y: 600, facing: 'right' });
    expect(e.getCharacterPosition()).toBeNull();
  });

  it('setCharacterPosition moves the placement; sprite set and overrides are kept', () => {
    const e = new ScenarioEngine(scenario());
    e.setCharacterOverride({ sprite_set: 'walk' });
    e.setCharacterPosition({ x: 700, y: 650, facing: 'left' });
    expect(e.getCharacterPlacement()).toMatchObject({ x: 700, y: 650, facing: 'left', sprite_set: 'walk' });
  });

  it('set_view with `at` places him in the new view; without it he uses the placement', () => {
    const e = new ScenarioEngine(scenario());
    e.setCharacterPosition({ x: 700, y: 650 });
    e.interact('door', 'move');
    expect(e.getCurrentView().id).toBe('yard');
    expect(e.getCharacterPlacement()).toMatchObject({ x: 40, y: 640, facing: 'right' });
    e.setCharacterPosition({ x: 500, y: 600 });
    e.interact('gate', 'move');
    expect(e.getCurrentView().id).toBe('hall');
    expect(e.getCharacterPlacement()).toMatchObject({ x: 100, y: 600 });  // re-entry: placement, not last spot
  });

  it('leaving a close-up puts him back where he stood', () => {
    const e = new ScenarioEngine(scenario());
    e.setCharacterPosition({ x: 330, y: 680, facing: 'up' });
    e.interact('crate', 'look');
    expect(e.getCurrentView().id).toBe('closeup');
    expect(e.getCharacterPlacement()).toBeNull();
    expect(e.getWalkArea()).toBeNull();
    e.navigateBack();
    expect(e.getCurrentView().id).toBe('hall');
    expect(e.getCharacterPlacement()).toMatchObject({ x: 330, y: 680, facing: 'up' });
  });

  it('navigateToView (dev jump) resets to the placement', () => {
    const e = new ScenarioEngine(scenario());
    e.setCharacterPosition({ x: 700, y: 650 });
    e.navigateToView('yard');
    expect(e.getCharacterPlacement()).toMatchObject({ x: 480, y: 650 });
  });

  it('views without a floor, or without a character, do not walk', () => {
    const e = new ScenarioEngine(scenario());
    e.navigateToView('classic');
    expect(e.getWalkArea()).toBeNull();
    expect(e.getApproach('door')).toBeNull();
    e.navigateToView('closeup');
    expect(e.getWalkArea()).toBeNull();
  });
});

describe('getApproach', () => {
  it('uses walk_to (snapped onto the floor) and its facing', () => {
    const e = new ScenarioEngine(scenario());
    expect(e.getApproach('painting')).toEqual({ x: 650, y: 520, facing: 'up' });
  });
  it('walk_to: false means interact in place', () => {
    expect(new ScenarioEngine(scenario()).getApproach('far_screen')).toBeNull();
  });
  it('defaults to the floor point nearest the bottom-centre of a hotspot, facing it', () => {
    const e = new ScenarioEngine(scenario());
    const a = e.getApproach('door')!; // hotspot bottom-centre (910, 500) is on the floor edge
    expect(a).toMatchObject({ x: 910, y: 500, facing: 'up' });
  });
  it('a sprite object is approached at its base (its position)', () => {
    const e = new ScenarioEngine(scenario());
    const a = e.getApproach('crate')!;
    expect(a.x).toBe(300); expect(a.y).toBe(620);
    expect(a.facing).toBe('up');
  });
  it('an object over a blocked area is approached from the nearest edge of it', () => {
    const e = new ScenarioEngine(scenario());
    const a = e.getApproach('rug')!; // bottom-centre (460, 610) is inside the blocked box
    expect(isOnFloor(e.getWalkArea()!, a)).toBe(true);
    expect(a).toMatchObject({ x: 460, y: 640 });
  });
  it('unknown objects have no approach', () => {
    expect(new ScenarioEngine(scenario()).getApproach('nope')).toBeNull();
  });
});

describe('isExit', () => {
  it('objects whose Move changes the view are exits; flavour-only Move is not', () => {
    const sc = scenario();
    sc.objects.push(obj({ id: 'pipes', interactions: [{ verb: 'move', when: [], then: [{ type: 'message', text: 'Fused.' }] }] }));
    sc.objects.push(obj({ id: 'locked_door', interactions: [
      { verb: 'move', when: [{ type: 'flag_not', flag: 'open' }], then: [{ type: 'message', text: 'Locked.' }] },
      { verb: 'move', when: [], then: [{ type: 'conditional_effect', when: [], then: [{ type: 'set_view', view: 'yard' }] }] },
    ] }));
    sc.objects.push(obj({ id: 'pit', interactions: [{ verb: 'move', when: [], then: [{ type: 'game_over', text: 'You fall.' }] }] }));
    const e = new ScenarioEngine(sc);
    expect(e.isExit('door')).toBe(true);
    expect(e.isExit('locked_door')).toBe(true);
    expect(e.isExit('pit')).toBe(true);
    expect(e.isExit('pipes')).toBe(false);
    expect(e.isExit('rug')).toBe(false);
    expect(e.isExit('nope')).toBe(false);
  });
});

describe('hasInteraction / getObjectFocus', () => {
  it('knows which verbs an object handles', () => {
    const e = new ScenarioEngine(scenario());
    expect(e.hasInteraction('door', 'move')).toBe(true);
    expect(e.hasInteraction('rug', 'move')).toBe(false);
  });
  it('focus is the hotspot centre, or the middle of a sprite above its base', () => {
    const e = new ScenarioEngine(scenario());
    expect(e.getObjectFocus('painting')).toEqual({ x: 650, y: 140 });
    expect(e.getObjectFocus('crate')).toEqual({ x: 300, y: 620 - 40 });
  });
});

describe('walk_in: coming through a door', () => {
  const sc = () => ({
    metadata: { id: 't', title: 'T' },
    setting: { initial_view: 'a', ambient_text: '', room_style: { background_color: '', wall_color: '', floor_color: '' } },
    character: { sprite_sets: { idle: { file: 'x.png', columns: 1, rows: 1, frame_rate: 0 } }, frame_width: 10, frame_height: 10, walk_in: true },
    views: [
      { id: 'a', background_key: 'a', objects: ['door'], character: { x: 100, y: 500, facing: 'right', sprite_set: 'idle' }, walk_area: { floor: [[0, 400], [960, 400], [960, 700], [0, 700]] } },
      { id: 'b', background_key: 'b', objects: [], character: { x: 480, y: 600, facing: 'down', sprite_set: 'idle' }, walk_area: { floor: [[0, 400], [960, 400], [960, 700], [0, 700]], depth_scale: { far_y: 400, far: 0.5, near_y: 700, near: 1 } } },
    ],
    objects: [{ id: 'door', name: 'Door', description: '', position: { x: 0, y: 0 }, size: { width: 10, height: 10 }, initial_state: 'default', interactions: [] }],
    items: [],
  }) as unknown as Scenario;

  it('he appears at the door and walks a few steps toward the middle of the floor, shorter where he is drawn smaller', () => {
    const e = new ScenarioEngine(sc());
    e.runEffects([{ type: 'set_view', view: 'b', at: { x: 900, y: 420, facing: 'left' } }]);
    const w = e.takeWalkIn()!;
    expect(w.path[0]).toEqual({ x: 900, y: 420 });
    expect(e.getCharacterPosition()).toEqual(w.end);
    const len = Math.hypot(w.end.x - 900, w.end.y - 420);
    expect(len).toBeGreaterThan(60); expect(len).toBeLessThan(80);   // 140 px × 0.53 depth scale
    expect(w.end.x).toBeLessThan(900); expect(w.end.y).toBeGreaterThan(420);   // into the room
    expect(e.takeWalkIn()).toBeNull();
  });

  it('walk_in: false on the set_view, or off in the scenario, keeps him standing at `at`', () => {
    const e = new ScenarioEngine(sc());
    e.runEffects([{ type: 'set_view', view: 'b', at: { x: 900, y: 420 }, walk_in: false }]);
    expect(e.takeWalkIn()).toBeNull();
    expect(e.getCharacterPosition()).toEqual({ x: 900, y: 420 });
    const off = sc(); delete (off.character as { walk_in?: boolean }).walk_in;
    const f = new ScenarioEngine(off);
    f.runEffects([{ type: 'set_view', view: 'b', at: { x: 900, y: 420 } }]);
    expect(f.takeWalkIn()).toBeNull();
  });
});
