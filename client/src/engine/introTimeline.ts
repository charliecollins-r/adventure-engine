/**
 * Pure timing for the intro cinematic (setting.intro_scenes): how long a line lasts, where the camera
 * is, and where each sprite is at a given moment. No DOM, so it is unit-tested.
 */
import type { IntroCamera, IntroLine, IntroSprite } from './types';

/** Seconds a line stays up: its voice clip's length, or 0.06 s per character (3 s minimum). */
export function lineSeconds(line: IntroLine, voiceSeconds?: number | null): number {
  if (voiceSeconds && Number.isFinite(voiceSeconds) && voiceSeconds > 0) return voiceSeconds + 0.3;
  return Math.max(3, line.text.length * 0.06);
}

/** Smooth start and finish (0..1 → 0..1). */
export function ease(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export interface CameraState { zoom: number; x: number; y: number }

export function cameraAt(camera: IntroCamera | undefined, t: number): CameraState {
  const from = { zoom: camera?.from?.zoom ?? 1, x: camera?.from?.x ?? 0, y: camera?.from?.y ?? 0 };
  if (!camera?.to) return from;
  const to = { zoom: camera.to.zoom ?? from.zoom, x: camera.to.x ?? from.x, y: camera.to.y ?? from.y };
  const k = ease(t / Math.max(0.001, camera.seconds ?? 10));
  return { zoom: lerp(from.zoom, to.zoom, k), x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k) };
}

export interface SpriteState {
  visible: boolean;
  /** Feet, 960x720 coordinates. */
  x: number;
  y: number;
  scale: number;
  /** Degrees. */
  rotation: number;
  opacity: number;
  /** Column of the sheet to draw. */
  column: number;
}

export function spriteAt(s: IntroSprite, t: number): SpriteState {
  const delay = s.delay ?? 0;
  const fade = s.fade ?? 0.4;
  const local = t - delay;
  const until = s.until ?? Infinity;
  let opacity = s.opacity ?? 1;
  const visible = local >= 0 && t < until;
  if (fade > 0) {
    opacity *= Math.min(1, Math.max(0, local / fade));
    if (Number.isFinite(until)) opacity *= Math.min(1, Math.max(0, (until - t) / fade));
  }
  let [x, y] = s.at;
  let scale = s.scale;
  if (s.move) {
    const k = ease((local - (s.move.delay ?? 0)) / Math.max(0.001, s.move.seconds));
    x = lerp(s.at[0], s.move.to[0], k);
    y = lerp(s.at[1], s.move.to[1], k);
    if (s.move.scale != null) scale = lerp(s.scale, s.move.scale, k);
  }
  if (s.bob) y += Math.sin((local / Math.max(0.001, s.bob.period)) * Math.PI * 2) * s.bob.amount;
  const rotation = (s.rotate ?? 0) + (s.spin ?? 0) * Math.max(0, local);
  const order = s.frames?.length ? s.frames : Array.from({ length: Math.max(1, s.columns) }, (_, i) => i);
  let step = s.frame_rate > 0 ? Math.floor(Math.max(0, local) * s.frame_rate) : 0;
  step = s.loop === false ? Math.min(step, order.length - 1) : step % order.length;
  return { visible: visible && opacity > 0, x, y, scale, rotation, opacity, column: order[step] };
}

/** Deterministic pseudo-random in [0, 1) for particle n of effect k. */
export function hash01(k: number, n: number, salt = 0): number {
  const v = Math.sin(k * 127.1 + n * 311.7 + salt * 74.7) * 43758.5453;
  return v - Math.floor(v);
}
