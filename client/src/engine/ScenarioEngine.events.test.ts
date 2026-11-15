import { describe, expect, it } from 'vitest';
import { ScenarioEngine } from './ScenarioEngine';
import type { Scenario } from './types';

function scenario(events: unknown[]): Scenario {
  return {
    schema_version: '1.0', metadata: { id: 'events-test', title: 'Events' }, setting: { initial_view: 'room' },
    flags: {}, items: [],
    views: [{ id: 'room', background_key: 'r', objects: ['bell', 'pillow', 'clock'] }],
    objects: [
      { id: 'bell', name: 'Bell', description: '', position: { x: 0, y: 0 }, size: { width: 10, height: 10 }, visual: { color: '', label: '' }, initial_state: 'default', initially_visible: true,
        interactions: [{ verb: 'hand', when: [], then: [{ type: 'add_noise', amount: 30 }, { type: 'message', text: 'DONG' }] }] },
      { id: 'pillow', name: 'Pillow', description: '', position: { x: 0, y: 0 }, size: { width: 10, height: 10 }, visual: { color: '', label: '' }, initial_state: 'default', initially_visible: true,
        interactions: [{ verb: 'hand', when: [], then: [{ type: 'set_noise', amount: 0 }, { type: 'message', text: 'shh' }] }] },
      { id: 'clock', name: 'Clock', description: '', position: { x: 0, y: 0 }, size: { width: 10, height: 10 }, visual: { color: '', label: '' }, initial_state: 'default', initially_visible: true,
        interactions: [{ verb: 'look', when: [], then: [{ type: 'message', text: 'tick' }] }] },
    ],
    events,
  } as unknown as Scenario;
}

describe('condition-triggered events', () => {
  it('fire when the trigger becomes true, again only after it was false (not one_shot)', () => {
    const e = new ScenarioEngine(scenario([{ id: 'loud', trigger: { type: 'noise_above', threshold: 49 }, one_shot: false, effects: [{ type: 'message', text: 'Something listens.' }] }]));
    expect(e.interact('bell', 'hand').messages).toEqual(['DONG']);
    expect(e.getMessages()).not.toContain('Something listens.');
    e.interact('bell', 'hand'); // 60 > 49: fires
    expect(e.getMessages()).toContain('Something listens.');
    e.interact('clock', 'look'); // still true: does not fire again
    expect(e.getMessages()).not.toContain('Something listens.');
    e.interact('pillow', 'hand'); // drops to 0
    e.interact('bell', 'hand'); e.interact('bell', 'hand'); // rises again: fires again
    expect(e.getMessages()).toContain('Something listens.');
  });
  it('one_shot events fire once', () => {
    const e = new ScenarioEngine(scenario([{ id: 'once', trigger: { type: 'noise_above', threshold: 10 }, one_shot: true, effects: [{ type: 'message', text: 'Once.' }] }]));
    e.interact('bell', 'hand'); expect(e.getMessages()).toContain('Once.');
    e.interact('pillow', 'hand'); e.interact('bell', 'hand'); expect(e.getMessages()).not.toContain('Once.');
  });
  it('can end the game', () => {
    const e = new ScenarioEngine(scenario([{ id: 'caught', trigger: { type: 'noise_above', threshold: 89 }, one_shot: true, effects: [{ type: 'game_over', result: 'lose', reason: 'Found.', title: 'Caught' }] }]));
    e.interact('bell', 'hand'); e.interact('bell', 'hand'); expect(e.isGameOver()).toBe(false);
    e.interact('bell', 'hand'); e.interact('bell', 'hand');
    expect(e.isGameOver()).toBe(true);
    expect(e.getGameOverResult()).toMatchObject({ won: false, text: 'Found.', title: 'Caught' });
  });
  it('time-based triggers are not fired by actions', () => {
    const e = new ScenarioEngine(scenario([{ id: 'later', trigger: { type: 'time_after', seconds: 10 }, one_shot: true, effects: [{ type: 'message', text: 'Later.' }] }]));
    e.interact('bell', 'hand');
    expect(e.getMessages()).not.toContain('Later.');
  });
});
