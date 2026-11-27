import type { Tether } from '../engine/types';

/**
 * A safety tether (a character placement's or a sprite object's `tether`): a loose line from a fixed point in the room
 * to a point on the figure (`attach`, fractions of its frame), redrawn as he moves. With `bob`, the figure's end rises
 * and falls with the same period as the figure's own bob, so the line stays clipped on while he floats.
 */
export function TetherLine({ tether, scaleX, scaleY, frameLeft, frameTop, frameW, frameH, mirrored, bob, zIndex, opacity = 1 }: {
  tether: Tether; scaleX: number; scaleY: number;
  /** The figure's frame on screen (px). */
  frameLeft: number; frameTop: number; frameW: number; frameH: number;
  mirrored?: boolean;
  /** The figure's float: rise in screen px and period in seconds. */
  bob?: { amount: number; period: number };
  zIndex: number; opacity?: number;
}) {
  const [fx, fy] = tether.attach ?? [0.5, 0.55];
  const x1 = tether.from[0] * scaleX, y1 = tether.from[1] * scaleY;
  const x2 = frameLeft + (mirrored ? 1 - fx : fx) * frameW, y2 = frameTop + fy * frameH;
  const sag = (tether.sag ?? 30) * scaleY;
  const d = (y: number) => `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${Math.max(y1, y) + sag} ${x2} ${y}`;
  const [r, g, b] = tether.color ?? [225, 205, 150];
  const w = (tether.width ?? 2) * scaleX;
  const anim = bob && bob.amount ? (
    <animate attributeName="d" dur={`${bob.period}s`} repeatCount="indefinite" calcMode="spline"
      keyTimes="0;0.5;1" keySplines="0.42 0 0.58 1;0.42 0 0.58 1" values={`${d(y2)};${d(y2 - bob.amount)};${d(y2)}`} />
  ) : null;
  return (
    <svg data-tether style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex, opacity }}>
      <path d={d(y2)} fill="none" stroke="rgba(15,10,6,0.85)" strokeWidth={w + 2} strokeLinecap="round">{anim}</path>
      <path d={d(y2)} fill="none" stroke={`rgb(${r},${g},${b})`} strokeWidth={w} strokeLinecap="round" strokeDasharray={tether.dashed ? `${w * 3} ${w * 2}` : undefined}>{anim}</path>
    </svg>
  );
}
