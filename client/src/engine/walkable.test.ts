import { describe, expect, it } from 'vitest';
import type { PointXY, WalkArea } from './types';
import {
  depthScaleAt, dist, facingFromDelta, findPath, isOnFloor, nearestFloorPoint, outlineProblems,
  pathLength, pointAlong, resolveFacing, segmentOnFloor, type Pt,
} from './walkable';

const P = (x: number, y: number): Pt => ({ x, y });
const square: WalkArea = { floor: [[0, 0], [100, 0], [100, 100], [0, 100]] };
// A "U": two arms joined along the top; the notch between the arms is not floor.
const U: WalkArea = { floor: [[0, 0], [300, 0], [300, 300], [200, 300], [200, 100], [100, 100], [100, 300], [0, 300]] };
const withHole: WalkArea = { floor: [[0, 0], [400, 0], [400, 400], [0, 400]], blocked: [[[150, 150], [250, 150], [250, 250], [150, 250]]] };
const twoHoles: WalkArea = {
  floor: [[0, 0], [600, 0], [600, 300], [0, 300]],
  blocked: [[[100, 50], [200, 50], [200, 250], [100, 250]], [[350, 0 + 40], [450, 40], [450, 260], [350, 260]]],
};
// A zig-zag corridor (concave in several places), roughly like a tunnel floor.
const zigzag: WalkArea = { floor: [[0, 600], [200, 600], [200, 200], [500, 200], [500, 500], [700, 500], [700, 700], [400, 700], [400, 300], [300, 300], [300, 700], [0, 700]] };
// Counter-clockwise copy of the U, to make sure winding doesn't matter.
const Uccw: WalkArea = { floor: [...U.floor].reverse() as PointXY[] };

const near = (a: Pt, b: Pt, tol = 1e-6) => dist(a, b) <= tol;

describe('isOnFloor', () => {
  it('inside, outside and on the outline', () => {
    expect(isOnFloor(square, P(50, 50))).toBe(true);
    expect(isOnFloor(square, P(0, 50))).toBe(true);      // on an edge
    expect(isOnFloor(square, P(100, 100))).toBe(true);   // on a corner
    expect(isOnFloor(square, P(101, 50))).toBe(false);
    expect(isOnFloor(square, P(-0.01, 50))).toBe(false);
  });
  it('concave notch is not floor', () => {
    expect(isOnFloor(U, P(150, 200))).toBe(false);
    expect(isOnFloor(U, P(150, 50))).toBe(true);
    expect(isOnFloor(Uccw, P(150, 200))).toBe(false);
  });
  it('blocked areas are not floor, but their outline is', () => {
    expect(isOnFloor(withHole, P(200, 200))).toBe(false);
    expect(isOnFloor(withHole, P(150, 200))).toBe(true);
    expect(isOnFloor(withHole, P(100, 100))).toBe(true);
  });
  it('degenerate floors are never floor', () => {
    expect(isOnFloor({ floor: [[0, 0], [10, 10]] }, P(5, 5))).toBe(false);
    expect(isOnFloor({ floor: [] }, P(0, 0))).toBe(false);
  });
});

describe('nearestFloorPoint', () => {
  it('returns the point itself when on the floor', () => {
    expect(nearestFloorPoint(square, P(30, 40))).toEqual(P(30, 40));
  });
  it('clamps points outside onto the nearest edge', () => {
    expect(near(nearestFloorPoint(square, P(150, 50)), P(100, 50))).toBe(true);
    expect(near(nearestFloorPoint(square, P(-20, -20)), P(0, 0))).toBe(true);
  });
  it('moves points in a blocked area to its nearest edge', () => {
    expect(near(nearestFloorPoint(withHole, P(160, 200)), P(150, 200))).toBe(true);
    expect(near(nearestFloorPoint(withHole, P(200, 245)), P(200, 250))).toBe(true);
  });
  it('a point in the U notch goes to the closest arm or the bar', () => {
    const q = nearestFloorPoint(U, P(150, 290));
    expect(isOnFloor(U, q)).toBe(true);
    expect(near(q, P(100, 290)) || near(q, P(200, 290))).toBe(true);
  });
});

describe('segmentOnFloor', () => {
  it('straight lines inside a convex floor', () => {
    expect(segmentOnFloor(square, P(10, 10), P(90, 90))).toBe(true);
  });
  it('rejects lines that leave a concave floor', () => {
    expect(segmentOnFloor(U, P(50, 250), P(250, 250))).toBe(false);
  });
  it('rejects lines through a blocked area, accepts lines along its edge', () => {
    expect(segmentOnFloor(withHole, P(100, 200), P(300, 200))).toBe(false);
    expect(segmentOnFloor(withHole, P(150, 100), P(150, 300))).toBe(true);
  });
  it('rejects a line that slips out through a corner', () => {
    // From inside the left arm, through the reflex corner (100,100), into the notch.
    expect(segmentOnFloor(U, P(50, 50), P(150, 150))).toBe(false);
  });
  it('accepts a line that only grazes a reflex corner', () => {
    expect(segmentOnFloor(U, P(50, 150), P(150, 50))).toBe(true);
  });
  it('walking along the outer wall is allowed', () => {
    expect(segmentOnFloor(square, P(0, 0), P(0, 100))).toBe(true);
  });
});

describe('findPath', () => {
  it('a straight line when nothing is in the way', () => {
    expect(findPath(square, P(10, 10), P(90, 50))).toEqual([P(10, 10), P(90, 50)]);
  });
  it('start equals goal', () => {
    expect(findPath(square, P(10, 10), P(10, 10))).toEqual([P(10, 10)]);
  });
  it('goes around the U through both reflex corners, exactly', () => {
    const path = findPath(U, P(50, 250), P(250, 250));
    expect(path.length).toBe(4);
    expect(near(path[1], P(100, 100))).toBe(true);
    expect(near(path[2], P(200, 100))).toBe(true);
    const expected = dist(P(50, 250), P(100, 100)) + 100 + dist(P(200, 100), P(250, 250));
    expect(pathLength(path)).toBeCloseTo(expected, 6);
  });
  it('winding direction does not matter', () => {
    expect(pathLength(findPath(Uccw, P(50, 250), P(250, 250)))).toBeCloseTo(pathLength(findPath(U, P(50, 250), P(250, 250))), 6);
  });
  it('goes around a blocked area by the shorter side, exactly', () => {
    const path = findPath(withHole, P(100, 200), P(300, 200));
    expect(pathLength(path)).toBeCloseTo(2 * Math.SQRT2 * 50 + 100, 6);
  });
  it('clamps both ends onto the floor first', () => {
    const path = findPath(square, P(-50, 50), P(150, 50));
    expect(near(path[0], P(0, 50))).toBe(true);
    expect(near(path[path.length - 1], P(100, 50))).toBe(true);
  });
  it('destination inside a blocked area ends on its edge', () => {
    const path = findPath(withHole, P(50, 50), P(200, 200));
    const end = path[path.length - 1];
    expect(isOnFloor(withHole, end)).toBe(true);
    expect(dist(end, P(200, 200))).toBeCloseTo(50, 6);
  });
  it('threads a zig-zag corridor', () => {
    const path = findPath(zigzag, P(50, 650), P(650, 600));
    for (let i = 1; i < path.length; i++) expect(segmentOnFloor(zigzag, path[i - 1], path[i])).toBe(true);
    expect(near(path[path.length - 1], P(650, 600))).toBe(true);
  });
});

describe('pointAlong', () => {
  const path = [P(0, 0), P(100, 0), P(100, 50)];
  it('interpolates within and across legs', () => {
    expect(pointAlong(path, 0).pt).toEqual(P(0, 0));
    expect(pointAlong(path, 50).pt).toEqual(P(50, 0));
    expect(pointAlong(path, 125)).toMatchObject({ pt: P(100, 25), leg: 2, done: false });
  });
  it('stops at the end', () => {
    expect(pointAlong(path, 1e6)).toMatchObject({ pt: P(100, 50), done: true });
    expect(pointAlong([P(5, 5)], 10)).toMatchObject({ pt: P(5, 5), done: true });
  });
});

describe('depthScaleAt', () => {
  const area: WalkArea = { floor: square.floor, depth_scale: { far_y: 400, far: 0.5, near_y: 700, near: 1 } };
  it('blends between far and near and holds beyond', () => {
    expect(depthScaleAt(area, 400)).toBe(0.5);
    expect(depthScaleAt(area, 550)).toBeCloseTo(0.75, 9);
    expect(depthScaleAt(area, 700)).toBe(1);
    expect(depthScaleAt(area, 100)).toBe(0.5);
    expect(depthScaleAt(area, 720)).toBe(1);
  });
  it('is 1 without depth_scale', () => {
    expect(depthScaleAt(square, 300)).toBe(1);
    expect(depthScaleAt(null, 300)).toBe(1);
  });
});

describe('facing', () => {
  it('from movement', () => {
    expect(facingFromDelta(10, 0)).toBe('right');
    expect(facingFromDelta(-10, 2)).toBe('left');
    expect(facingFromDelta(1, 20)).toBe('down');
    expect(facingFromDelta(1, -20)).toBe('up');
  });
  it('maps onto what a sprite set can draw', () => {
    const rd = ['right', 'down'] as const;
    expect(resolveFacing('left', [...rd])).toBe('left');          // mirrored right
    expect(resolveFacing('up', [...rd], 5)).toBe('right');        // no up row: sideways
    expect(resolveFacing('up', [...rd], -5)).toBe('left');
    expect(resolveFacing('down', [...rd])).toBe('down');
    expect(resolveFacing('down', ['right'])).toBe('right');
  });
});

describe('outlineProblems', () => {
  it('accepts simple outlines', () => {
    expect(outlineProblems(U.floor)).toEqual([]);
    expect(outlineProblems(zigzag.floor)).toEqual([]);
  });
  it('rejects too few points and bow ties', () => {
    expect(outlineProblems([[0, 0], [1, 1]])).toHaveLength(1);
    expect(outlineProblems([[0, 0], [100, 100], [100, 0], [0, 100]]).length).toBeGreaterThan(0);
  });
});

// ── property tests ────────────────────────────────────────────────────────────

function rng(seed: number) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
}
function bbox(area: WalkArea) {
  const xs = area.floor.map((p) => p[0]), ys = area.floor.map((p) => p[1]);
  return { x0: Math.min(...xs) - 40, x1: Math.max(...xs) + 40, y0: Math.min(...ys) - 40, y1: Math.max(...ys) + 40 };
}
const FIXTURES: [string, WalkArea][] = [['square', square], ['U', U], ['withHole', withHole], ['twoHoles', twoHoles], ['zigzag', zigzag]];

describe.each(FIXTURES)('random routes in %s', (_name, area) => {
  it('2,000 routes: correct ends, every point on the floor, never shorter than a straight line', () => {
    const r = rng(42), b = bbox(area);
    for (let n = 0; n < 2000; n++) {
      const a = P(b.x0 + r() * (b.x1 - b.x0), b.y0 + r() * (b.y1 - b.y0));
      const z = P(b.x0 + r() * (b.x1 - b.x0), b.y0 + r() * (b.y1 - b.y0));
      const path = findPath(area, a, z);
      const s = nearestFloorPoint(area, a), g = nearestFloorPoint(area, z);
      expect(near(path[0], s)).toBe(true);
      expect(near(path[path.length - 1], g)).toBe(true);
      for (let i = 1; i < path.length; i++) {
        for (let k = 0; k <= 32; k++) {
          const t = k / 32;
          const q = P(path[i - 1].x + (path[i].x - path[i - 1].x) * t, path[i - 1].y + (path[i].y - path[i - 1].y) * t);
          if (!isOnFloor(area, q)) throw new Error(`leg ${i} leaves the floor at ${q.x},${q.y} (route ${JSON.stringify(path)})`);
        }
      }
      expect(pathLength(path)).toBeGreaterThanOrEqual(dist(s, g) - 1e-6);
    }
  });

  it('150 routes are never longer than a fine grid search', () => {
    const r = rng(7), b = bbox(area);
    const step = 5;
    const xs: number[] = [], ys: number[] = [];
    for (let x = b.x0; x <= b.x1; x += step) xs.push(x);
    for (let y = b.y0; y <= b.y1; y += step) ys.push(y);
    const W = xs.length, H = ys.length;
    const on = new Uint8Array(W * H);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) on[j * W + i] = isOnFloor(area, P(xs[i], ys[j])) ? 1 : 0;
    const gridDist = (si: number, sj: number, gi: number, gj: number) => {
      const D = new Float64Array(W * H).fill(Infinity), done = new Uint8Array(W * H);
      D[sj * W + si] = 0;
      const heap: [number, number][] = [[0, sj * W + si]];
      while (heap.length) {
        heap.sort((p, q) => q[0] - p[0]);
        const [d, u] = heap.pop()!;
        if (done[u]) continue; done[u] = 1;
        if (u === gj * W + gi) return d;
        const ui = u % W, uj = (u / W) | 0;
        for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
          if (!di && !dj) continue;
          const vi = ui + di, vj = uj + dj; if (vi < 0 || vj < 0 || vi >= W || vj >= H) continue;
          const v = vj * W + vi; if (!on[v] || done[v]) continue;
          if (!segmentOnFloor(area, P(xs[ui], ys[uj]), P(xs[vi], ys[vj]))) continue;
          const nd = d + step * Math.hypot(di, dj);
          if (nd < D[v]) { D[v] = nd; heap.push([nd, v]); }
        }
      }
      return Infinity;
    };
    let compared = 0;
    for (let n = 0; n < 150; n++) {
      const pick = () => { for (;;) { const i = (r() * W) | 0, j = (r() * H) | 0; if (on[j * W + i]) return [i, j]; } };
      const [si, sj] = pick(), [gi, gj] = pick();
      const gd = gridDist(si, sj, gi, gj);
      if (gd === Infinity) continue;
      const ours = pathLength(findPath(area, P(xs[si], ys[sj]), P(xs[gi], ys[gj])));
      expect(ours).toBeLessThanOrEqual(gd + 1e-6);
      compared++;
    }
    expect(compared).toBeGreaterThan(100);
  }, 180_000);
});
