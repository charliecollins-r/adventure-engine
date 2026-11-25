/**
 * Walkable-area geometry for click-to-walk. Pure functions, no DOM.
 *
 * A walk area is a floor outline plus optional blocked outlines (holes), all in 960x720 authoring
 * space. Points ON an outline count as floor, so the character may walk along a wall or around the
 * edge of a blocked area. Shortest paths use a visibility graph over the outline corners (exact for
 * polygons with holes), searched with Dijkstra. See docs/WALKABLE_AREAS.md.
 */
import type { Facing, PointXY, WalkArea } from './types';

export interface Pt { x: number; y: number }

/** Distance tolerance in authoring pixels for "on an edge" tests. */
const EPS = 1e-6;
/** Tolerance for orientation tests (cross products are in px²). */
const CEPS = 1e-7;

interface Prepared {
  floor: Pt[];
  holes: Pt[][];
  rings: Pt[][];          // floor + holes
  vertices: Pt[];         // every corner of every ring (graph nodes)
  vis: (boolean | undefined)[][]; // lazily filled vertex-to-vertex visibility
}

const cache = new WeakMap<WalkArea, Prepared>();

function toRing(poly: PointXY[]): Pt[] {
  const out: Pt[] = [];
  for (const [x, y] of poly) {
    const p = { x, y };
    const last = out[out.length - 1];
    if (!last || dist(last, p) > EPS) out.push(p);
  }
  if (out.length > 1 && dist(out[0], out[out.length - 1]) <= EPS) out.pop();
  return out;
}

function prepare(area: WalkArea): Prepared {
  let p = cache.get(area);
  if (!p) {
    const floor = toRing(area.floor);
    const holes = (area.blocked ?? []).map(toRing).filter((r) => r.length >= 3);
    const rings = [floor, ...holes];
    const vertices = rings.flat();
    p = { floor, holes, rings, vertices, vis: vertices.map(() => []) };
    cache.set(area, p);
  }
  return p;
}

// ── basic geometry ────────────────────────────────────────────────────────────

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function cross(o: Pt, a: Pt, b: Pt): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/** Closest point to p on segment ab, and its parameter t in [0, 1]. */
function closestOnSegment(p: Pt, a: Pt, b: Pt): { pt: Pt; t: number } {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return { pt: { x: a.x, y: a.y }, t: 0 };
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return { pt: { x: a.x + t * dx, y: a.y + t * dy }, t };
}

function distToSegment(p: Pt, a: Pt, b: Pt): number {
  return dist(p, closestOnSegment(p, a, b).pt);
}

function onBoundary(p: Pt, ring: Pt[]): boolean {
  for (let i = 0; i < ring.length; i++) {
    if (distToSegment(p, ring[i], ring[(i + 1) % ring.length]) <= EPS) return true;
  }
  return false;
}

/** Even-odd ray cast. Caller handles the boundary separately. */
function rayInside(p: Pt, ring: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a.y > p.y) !== (b.y > p.y)) {
      const x = a.x + ((p.y - a.y) * (b.x - a.x)) / (b.y - a.y);
      if (p.x < x) inside = !inside;
    }
  }
  return inside;
}

/** Inside or on the outline. */
export function insideRing(p: Pt, ring: Pt[]): boolean {
  return onBoundary(p, ring) || rayInside(p, ring);
}

function strictlyInsideRing(p: Pt, ring: Pt[]): boolean {
  return !onBoundary(p, ring) && rayInside(p, ring);
}

/** Segments ab and cd cross at a single interior point of both (touching does not count). */
function properlyCross(a: Pt, b: Pt, c: Pt, d: Pt): boolean {
  const d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
  return ((d1 > CEPS && d2 < -CEPS) || (d1 < -CEPS && d2 > CEPS)) &&
         ((d3 > CEPS && d4 < -CEPS) || (d3 < -CEPS && d4 > CEPS));
}

// ── walk-area queries ─────────────────────────────────────────────────────────

/** True if p is on the floor (inside or on its outline) and not strictly inside a blocked area. */
export function isOnFloor(area: WalkArea, p: Pt): boolean {
  const P = prepare(area);
  if (P.floor.length < 3 || !insideRing(p, P.floor)) return false;
  return P.holes.every((h) => !strictlyInsideRing(p, h));
}

/** The point itself if it is on the floor, otherwise the closest point of the floor. */
export function nearestFloorPoint(area: WalkArea, p: Pt): Pt {
  if (isOnFloor(area, p)) return { x: p.x, y: p.y };
  const P = prepare(area);
  const candidates: { pt: Pt; d: number }[] = [];
  for (const ring of P.rings) {
    for (let i = 0; i < ring.length; i++) {
      const { pt } = closestOnSegment(p, ring[i], ring[(i + 1) % ring.length]);
      candidates.push({ pt, d: dist(p, pt) });
    }
  }
  candidates.sort((a, b) => a.d - b.d);
  for (const c of candidates) if (isOnFloor(area, c.pt)) return c.pt;
  return P.floor.length ? { ...P.floor[0] } : { x: p.x, y: p.y };
}

/** True if the whole straight segment a→b stays on the floor. */
export function segmentOnFloor(area: WalkArea, a: Pt, b: Pt): boolean {
  if (!isOnFloor(area, a) || !isOnFloor(area, b)) return false;
  const P = prepare(area);
  for (const ring of P.rings) {
    for (let i = 0; i < ring.length; i++) {
      if (properlyCross(a, b, ring[i], ring[(i + 1) % ring.length])) return false;
    }
  }
  // No proper crossings: the segment can only change between floor and not-floor where it touches
  // a corner or runs along an edge. Split it at every such touch and test each piece's midpoint.
  const ts = [0, 1];
  for (const v of P.vertices) {
    const { pt, t } = closestOnSegment(v, a, b);
    if (dist(pt, v) <= EPS) ts.push(t);
  }
  ts.sort((x, y) => x - y);
  for (let i = 0; i + 1 < ts.length; i++) {
    if (ts[i + 1] - ts[i] < 1e-9) continue;
    const t = (ts[i] + ts[i + 1]) / 2;
    if (!isOnFloor(area, { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })) return false;
  }
  return true;
}

function vertexVisible(area: WalkArea, P: Prepared, i: number, j: number): boolean {
  if (i === j) return true;
  const [lo, hi] = i < j ? [i, j] : [j, i];
  let v = P.vis[lo][hi];
  if (v === undefined) {
    v = segmentOnFloor(area, P.vertices[lo], P.vertices[hi]);
    P.vis[lo][hi] = v;
  }
  return v;
}

/**
 * Shortest route on the floor from `from` to `to`, as the list of points to walk through
 * (first = start, last = destination). Both ends are first moved to the nearest floor point.
 * If the destination can't be reached (the floor is split), the route ends at the reachable
 * point nearest to it.
 */
export function findPath(area: WalkArea, from: Pt, to: Pt): Pt[] {
  const P = prepare(area);
  const s = nearestFloorPoint(area, from);
  const g = nearestFloorPoint(area, to);
  if (dist(s, g) <= EPS) return [s];
  if (segmentOnFloor(area, s, g)) return [s, g];

  const N = P.vertices.length;
  const S = N, G = N + 1;
  const pts = [...P.vertices, s, g];
  const visS = P.vertices.map((v) => segmentOnFloor(area, s, v));
  const visG = P.vertices.map((v) => segmentOnFloor(area, v, g));
  const visible = (i: number, j: number): boolean => {
    if (i === j) return true;
    if (i === S || j === S) { const k = i === S ? j : i; return k === G ? false : visS[k]; }
    if (i === G || j === G) { const k = i === G ? j : i; return visG[k]; }
    return vertexVisible(area, P, i, j);
  };

  const D = new Array(N + 2).fill(Infinity);
  const prev = new Array(N + 2).fill(-1);
  const done = new Array(N + 2).fill(false);
  D[S] = 0;
  for (;;) {
    let u = -1;
    for (let i = 0; i < N + 2; i++) if (!done[i] && D[i] < Infinity && (u < 0 || D[i] < D[u])) u = i;
    if (u < 0 || u === G) break;
    done[u] = true;
    for (let v = 0; v < N + 2; v++) {
      if (done[v] || v === u || v === S) continue;
      if (!visible(u, v)) continue;
      const nd = D[u] + dist(pts[u], pts[v]);
      if (nd < D[v] - 1e-12) { D[v] = nd; prev[v] = u; }
    }
  }

  let end = G;
  if (D[G] === Infinity) {
    // Unreachable: walk to the reachable point nearest the destination.
    end = S;
    for (let i = 0; i < N; i++) if (D[i] < Infinity && dist(pts[i], g) < dist(pts[end], g)) end = i;
  }
  const route: Pt[] = [];
  for (let k = end; k !== -1; k = prev[k]) route.unshift({ ...pts[k] });
  return route;
}

export function pathLength(path: Pt[]): number {
  let L = 0;
  for (let i = 1; i < path.length; i++) L += dist(path[i - 1], path[i]);
  return L;
}

/** Where you are after walking `d` pixels along `path`, and which leg you're on. */
export function pointAlong(path: Pt[], d: number): { pt: Pt; leg: number; done: boolean } {
  if (path.length === 0) return { pt: { x: 0, y: 0 }, leg: 0, done: true };
  let left = Math.max(0, d);
  for (let i = 1; i < path.length; i++) {
    const L = dist(path[i - 1], path[i]);
    if (left <= L) {
      const t = L === 0 ? 1 : left / L;
      return { pt: { x: path[i - 1].x + (path[i].x - path[i - 1].x) * t, y: path[i - 1].y + (path[i].y - path[i - 1].y) * t }, leg: i, done: false };
    }
    left -= L;
  }
  return { pt: { ...path[path.length - 1] }, leg: path.length - 1, done: true };
}

/** Character scale multiplier at feet height y (1 without depth_scale). */
export function depthScaleAt(area: WalkArea | null | undefined, y: number): number {
  const k = area?.scale ?? 1;
  const ds = area?.depth_scale;
  if (!ds || ds.near_y === ds.far_y) return k;
  const t = Math.max(0, Math.min(1, (y - ds.far_y) / (ds.near_y - ds.far_y)));
  return k * (ds.far + t * (ds.near - ds.far));
}

/** The direction of a movement or look vector (authoring space; vertical is drawn at 0.75). */
export function facingFromDelta(dx: number, dy: number): Facing {
  const sy = dy * 0.75;
  if (Math.abs(dx) >= Math.abs(sy)) return dx >= 0 ? 'right' : 'left';
  return sy > 0 ? 'down' : 'up';
}

/**
 * Map a wanted facing onto what a sprite set can draw. `left` mirrors `right`; a missing `up`
 * (or `down`) row falls back to the sideways direction of travel rather than a wrong-way row.
 */
export function resolveFacing(want: Facing, directions: Facing[] | undefined, dx = 0): Facing {
  const dirs = directions ?? ['down', 'left', 'right', 'up'];
  const can = (f: Facing) => dirs.includes(f) || (f === 'left' && dirs.includes('right'));
  if (can(want)) return want;
  const side: Facing = dx < 0 ? 'left' : 'right';
  if (can(side)) return side;
  return dirs[0];
}

/** p is strictly inside the outline (not on it). For the validator: blocked areas must sit inside the floor. */
export function strictlyInsideOutline(p: Pt, poly: PointXY[]): boolean {
  return strictlyInsideRing(p, toRing(poly));
}

/** Outline problems for the validator: fewer than 3 points, or edges that cross or touch. */
export function outlineProblems(poly: PointXY[]): string[] {
  const ring = toRing(poly);
  if (ring.length < 3) return ['needs at least 3 distinct points'];
  const out: string[] = [];
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue; // neighbouring edges share a corner
      const a = ring[i], b = ring[(i + 1) % n], c = ring[j], d = ring[(j + 1) % n];
      const touch = properlyCross(a, b, c, d) ||
        distToSegment(a, c, d) <= EPS || distToSegment(b, c, d) <= EPS ||
        distToSegment(c, a, b) <= EPS || distToSegment(d, a, b) <= EPS;
      if (touch) out.push(`edges ${i}→${(i + 1) % n} and ${j}→${(j + 1) % n} cross or touch`);
    }
  }
  return out;
}
