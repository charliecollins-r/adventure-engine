import { describe, it, expect } from 'vitest';
import { lineSeconds, cameraAt, spriteAt, ease, cueSeconds } from './introTimeline';
import type { IntroSprite } from './types';

const sprite = (extra: Partial<IntroSprite> = {}): IntroSprite => ({
  file: 'a.png', frame_width: 100, frame_height: 100, columns: 4, frame_rate: 2, scale: 1, at: [100, 500], ...extra,
});

describe('intro timeline', () => {
  it('times a line by its voice clip, else by its length with a 3 s floor', () => {
    expect(lineSeconds({ text: 'Hi' }, 5)).toBeCloseTo(5.3);
    expect(lineSeconds({ text: 'Hi' })).toBe(3);
    expect(lineSeconds({ text: 'x'.repeat(100) })).toBeCloseTo(6);
    expect(lineSeconds({ text: 'Hi' }, NaN)).toBe(3);
  });

  it('eases the camera from its start to its end', () => {
    const cam = { from: { zoom: 1 }, to: { zoom: 1.2, y: -40 }, seconds: 10 };
    expect(cameraAt(cam, 0)).toEqual({ zoom: 1, x: 0, y: 0 });
    expect(cameraAt(cam, 20)).toEqual({ zoom: 1.2, x: 0, y: -40 });
    expect(cameraAt(cam, 5).zoom).toBeCloseTo(1.1);
    expect(cameraAt(undefined, 3)).toEqual({ zoom: 1, x: 0, y: 0 });
    expect(ease(-1)).toBe(0);
    expect(ease(2)).toBe(1);
  });

  it('moves, scales and spins a sprite and respects delay and until', () => {
    const s = sprite({ move: { to: [300, 100], scale: 0.5, seconds: 4 }, spin: 90, delay: 1, until: 9, fade: 0 });
    expect(spriteAt(s, 0.5).visible).toBe(false);
    const mid = spriteAt(s, 3);
    expect(mid.x).toBeCloseTo(200);
    expect(mid.scale).toBeCloseTo(0.75);
    expect(mid.rotation).toBeCloseTo(180);
    expect(spriteAt(s, 6).x).toBe(300);
    expect(spriteAt(s, 9.5).visible).toBe(false);
  });

  it('plays frames in a custom order, looping or holding the last', () => {
    const s = sprite({ frames: [0, 0, 3], frame_rate: 1 });
    expect([0, 1, 2, 3].map((t) => spriteAt(s, t + 0.1).column)).toEqual([0, 0, 3, 0]);
    expect(spriteAt({ ...s, loop: false }, 10).column).toBe(3);
  });
});

describe('intro cues', () => {
  it('resolves start, line:N and end, and null until they happen', () => {
    const times = { lines: [0.8, 12.4], end: null };
    expect(cueSeconds(undefined, times)).toBe(0);
    expect(cueSeconds('start', times)).toBe(0);
    expect(cueSeconds('line:2', times)).toBe(12.4);
    expect(cueSeconds('line:3', times)).toBeNull();
    expect(cueSeconds('end', times)).toBeNull();
    expect(cueSeconds('end', { lines: [], end: 20 })).toBe(20);
  });
});
