import { describe, expect, it } from 'vitest';
import { ScenarioEngine } from './ScenarioEngine';
import type { Scenario } from './types';

const obj = (id: string, interactions: unknown[]) => ({ id, name: id, description: '', position: { x: 0, y: 0 }, size: { width: 10, height: 10 }, visual: { color: '', label: '' }, initial_state: 'default', initially_visible: true, interactions });
const scenario = {
  schema_version: '1.0', metadata: { id: 'undo-test', title: 'Undo' }, setting: { initial_view: 'room' },
  flags: { lamp: 'off' }, items: [{ id: 'key', name: 'Key', description: '' }],
  views: [{ id: 'room', background_key: 'r', objects: ['key_obj', 'bell', 'pit'] }],
  objects: [
    obj('key_obj', [{ verb: 'hand', when: [], then: [{ type: 'add_item', item: 'key' }, { type: 'hide_object', object: 'key_obj' }, { type: 'set_flag', flag: 'lamp', value: 'on' }] }]),
    obj('bell', [{ verb: 'hand', when: [], then: [{ type: 'add_noise', amount: 60 }] }]),
    obj('pit', [{ verb: 'move', when: [], then: [{ type: 'game_over', result: 'lose', reason: 'You fall.' }] }]),
  ],
  events: [{ id: 'heard', trigger: { type: 'noise_above', threshold: 99 }, one_shot: true, effects: [{ type: 'game_over', result: 'lose', reason: 'Caught.' }] }],
} as unknown as Scenario;

describe('undo last move (snapshot / restore)', () => {
  it('undoes a death and keeps everything that came before it', () => {
    const e = new ScenarioEngine(scenario);
    e.interact('key_obj', 'hand');
    const before = e.snapshot();
    e.interact('pit', 'move');
    expect(e.isGameOver()).toBe(true);
    e.restore(before);
    expect(e.isGameOver()).toBe(false);
    expect(e.getInventory().map((i) => i.id)).toEqual(['key']);
    expect(e.getFlags().lamp).toBe('on');
    expect(e.getVisibleObjects().map((o) => o.id)).not.toContain('key_obj');
  });
  it('undoes a death caused by an event, with the noise and the event state rolled back', () => {
    const e = new ScenarioEngine(scenario);
    e.interact('bell', 'hand');
    const before = e.snapshot();
    e.interact('bell', 'hand');
    expect(e.getGameOverResult()?.text).toBe('Caught.');
    e.restore(before);
    expect(e.isGameOver()).toBe(false);
    expect(e.getNoiseLevel()).toBe(60);
    e.interact('bell', 'hand'); // the one-shot event can still fire after an undo
    expect(e.isGameOver()).toBe(true);
  });
  it('a snapshot is a copy: later moves do not change it', () => {
    const e = new ScenarioEngine(scenario);
    const start = e.snapshot();
    e.interact('key_obj', 'hand');
    e.restore(start);
    expect(e.getInventory()).toEqual([]);
    expect(e.getFlags().lamp).toBe('off');
  });
});
