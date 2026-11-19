"""Design a vent maze v4 layout (three zones, ~140 duct screens) and write scripts/vent_maze_v4_grid.json.

A proposal generator for the maze in the "Vent Maze v4: Map and Player Journey" doc. Not wired into the game yet:
build_vent_maze.py still reads the v3 grid (vent_maze_grid.json).

Rules it obeys:
- Fixed compass: the camera faces north, so a cell is drawn by its openings other than south, and every
  subset of {N, W, E} now has a painting (dead end, straight, bend, ahead+side, T, crossroads). South open or
  closed is shown by the floor running off the screen or by the sealed lip.
- Zones run south to north: 1 The Outer Ducts (rows 0-3), 2 The Gut (rows 4-8), 3 The Purge Core (rows 9-12).
  Each zone is a random spanning tree plus a few loops, joined to the next by one gate.
- The Gut is split into a west half (on the map) and an east half (torn off the map). The long way to the Purge
  Core runs through the torn half; the Heart Valve (west half) and the Vertical Shaft (east half, a one-way drop)
  are optional shortcuts.
- Painted special rooms are dead ends entered from the south (their paintings look north at a back wall):
  Collapsed Section (zone 1), Escapee's Camp and Nursery (torn half), Vertical Shaft (east half),
  Collector's Cache, hull seam and the grate over the Curator's office (zone 3).
- Purge ducts are dead-end side branches (deadly; warned by LOOK and a skull on the map). In the Purge Core two
  cells on the route "breathe" (pass on the inhale).

Usage (from scenarios/the-harvest):
  python3 scripts/design_vent_maze_v4.py [--seed N]     # searches seeds, writes the grid json, prints a summary
  python3 scripts/draw_vent_map_v4.py                   # renders the designer map and the player's map
"""
import collections, json, os, random, sys

W = 13
ZONES = {1: range(0, 4), 2: range(4, 9), 3: range(9, 13)}
JUNCTION = (6, 0)
TORN_X = 7                                    # the Gut's east half (x >= 7) is torn off the map
D = {'N': (0, 1), 'S': (0, -1), 'E': (1, 0), 'W': (-1, 0)}
OPP = {'N': 'S', 'S': 'N', 'E': 'W', 'W': 'E'}
HOLES = {1: 8, 2: 12, 3: 12}                  # solid rock per zone, so the zones hold ~44 / ~53 / ~40 duct cells
LOOPS = {1: 7, 2: 9, 3: 8}                    # extra ducts on top of the tree: loops and crossroads to get a little lost in


def zone_of(c):
    for z, ys in ZONES.items():
        if c[1] in ys: return z
    return None


def step(c, d):
    return (c[0] + D[d][0], c[1] + D[d][1])


def layout(seed):
    r = random.Random(seed)
    cells = set()
    for z, ys in ZONES.items():
        zc = [(x, y) for y in ys for x in range(W)]
        keep = {JUNCTION, step(JUNCTION, 'W'), step(JUNCTION, 'E')}
        holes = set(r.sample([c for c in zc if c not in keep], HOLES[z]))
        cells |= set(zc) - holes
    edges = set()                                         # frozenset({a, b})
    def link(a, b): edges.add(frozenset((a, b)))
    # a spanning tree per zone (the Gut: one per half, joined later by a single gap), then loops
    def tree(region, start):
        # randomised Prim: grows from many points at once, so it branches into lots of short dead ends
        seen = {start}
        frontier = [(start, step(start, d)) for d in 'NSEW' if step(start, d) in region]
        while frontier:
            a, b = frontier.pop(r.randrange(len(frontier)))
            if b in seen: continue
            link(a, b); seen.add(b)
            frontier += [(b, step(b, d)) for d in 'NSEW' if step(b, d) in region and step(b, d) not in seen]
        return seen
    def biggest(region):  # a cell in the largest connected piece of a region
        best, left = set(), set(region)
        while left:
            s0 = left.pop(); comp, q = {s0}, [s0]
            while q:
                c = q.pop()
                for d in 'NSEW':
                    n = step(c, d)
                    if n in left: left.discard(n); comp.add(n); q.append(n)
            if len(comp) > len(best): best = comp
        return min(best)
    for z in (1, 3):
        region = {c for c in cells if zone_of(c) == z}
        start = JUNCTION if z == 1 else biggest(region)
        got = tree(region, start)
        if len(got) < 0.85 * len(region): return None
        cells -= region - got                           # rock may wall a few cells off: they become rock too
    west = {c for c in cells if zone_of(c) == 2 and c[0] < TORN_X}
    east = {c for c in cells if zone_of(c) == 2 and c[0] >= TORN_X}
    for half in (west, east):
        if not half: return None
        got = tree(half, biggest(half))
        if len(got) < 0.85 * len(half): return None
        cells -= half - got
    west = {c for c in cells if zone_of(c) == 2 and c[0] < TORN_X}
    east = {c for c in cells if zone_of(c) == 2 and c[0] >= TORN_X}
    gaps = [(a, step(a, 'E')) for a in west if a[0] == TORN_X - 1 and step(a, 'E') in east]
    if not gaps: return None
    link(*r.choice(gaps))
    for z, n in LOOPS.items():
        region = {c for c in cells if zone_of(c) == z}
        cand = [frozenset((a, step(a, d))) for a in region for d in 'NE' if step(a, d) in region]
        cand = [e for e in cand if e not in edges]
        for e in r.sample(cand, min(n, len(cand))): edges.add(e)
    # the junction shows left and right only (and the way back to the entry shaft)
    edges = {e for e in edges if not (JUNCTION in e and step(JUNCTION, 'N') in e)}
    link(JUNCTION, step(JUNCTION, 'W')); link(JUNCTION, step(JUNCTION, 'E'))
    # zone gates: 1 -> 2 (the mouth of the Gut, in the west half), 2 -> 3 (the long way, from the torn east half)
    g12 = [(a, step(a, 'N')) for a in cells if a[1] == ZONES[1].stop - 1 and step(a, 'N') in west]
    g23 = [(a, step(a, 'N')) for a in east if a[1] == ZONES[2].stop - 1 and step(a, 'N') in cells]
    valve = [(a, step(a, 'N')) for a in west if a[1] == ZONES[2].stop - 1 and step(a, 'N') in cells]
    if not (g12 and g23 and valve): return None
    gate12 = r.choice(g12); gate23 = r.choice(g23); valve_e = r.choice(valve)
    link(*gate12); link(*gate23)
    # the region can only be left through the gates: drop any other edge between zones
    edges = {e for e in edges if len({zone_of(c) for c in e}) == 1 or e in (frozenset(gate12), frozenset(gate23))}
    adj = collections.defaultdict(set)
    for e in edges:
        a, b = tuple(e); adj[a].add(b); adj[b].add(a)
    def bfs(src, extra=()):
        dist = {src: 0}; q = collections.deque([src]); g = {k: set(v) for k, v in adj.items()}
        for a, b in extra: g.setdefault(a, set()).add(b)
        while q:
            c = q.popleft()
            for n in g.get(c, ()):
                if n not in dist: dist[n] = dist[c] + 1; q.append(n)
        return dist
    dist = bfs(JUNCTION)
    if any(c not in dist for c in cells): return None
    # the way out: a zone 3 cell on the top row, as far from the junction as possible
    top = [c for c in cells if c[1] == ZONES[3].stop - 1]
    if not top: return None
    exit_c = max(top, key=lambda c: dist[c])
    # painted dead-end rooms: rock cells right above a duct in the same zone become rooms entered from the south
    def nook(z, cond=lambda c: True):
        return [c for c in ((x, y) for x in range(W) for y in ZONES[z])
                if c not in cells and step(c, 'S') in cells and zone_of(step(c, 'S')) == z and cond(c)]
    used = set()
    def place(pool, key):
        pool = [c for c in pool if c not in used and step(c, 'S') not in used and step(c, 'S') != exit_c]
        if not pool: return None
        c = max(pool, key=key); used.add(c); used.add(step(c, 'S'))
        cells.add(c); adj[c].add(step(c, 'S')); adj[step(c, 'S')].add(c); dist[c] = dist[step(c, 'S')] + 1
        return c
    special = {}
    special['collapsed'] = place(nook(1), key=lambda c: dist[step(c, 'S')])
    special['camp'] = place(nook(2, lambda c: c[0] >= TORN_X), key=lambda c: dist[step(c, 'S')])     # deepest in the torn half
    special['nursery'] = place(nook(2, lambda c: c[0] >= TORN_X), key=lambda c: dist[step(c, 'S')])
    special['shaft'] = place(nook(2, lambda c: c[0] >= TORN_X), key=lambda c: -dist[step(c, 'S')])  # early in the torn half
    special['cache'] = place(nook(3), key=lambda c: dist[step(c, 'S')])
    special['seam'] = place(nook(3), key=lambda c: dist[step(c, 'S')])
    special['grate'] = place(nook(3), key=lambda c: -abs(c[0] - exit_c[0]))
    if None in special.values(): return None
    leaves = {z: [c for c in cells if zone_of(c) == z and len(adj[c]) == 1 and c not in special.values() and c != JUNCTION] for z in ZONES}
    purge = []
    for z, n in ((1, 1), (2, 2), (3, 2)):
        pool = [c for c in leaves[z] if c not in used and c[1] > 0]
        if len(pool) < n: return None
        for c in r.sample(pool, n): used.add(c); purge.append(c)
    # the route (no shortcuts) and the shortcuts
    route = [exit_c]
    while route[-1] != JUNCTION:
        c = route[-1]; route.append(min(adj[c], key=lambda n: dist.get(n, 1e9)))
    route.reverse()
    if any(c in purge for c in route): return None
    shaft_land = min((c for c in cells if zone_of(c) == 3), key=lambda c: abs(c[0] - special['shaft'][0]) + c[1])
    d_valve = bfs(JUNCTION, extra=[valve_e])
    d_shaft = bfs(JUNCTION, extra=[(special['shaft'], shaft_land)])
    breathing = [c for c in route if zone_of(c) == 3][2::4][:2]
    zone_len = {z: sum(1 for c in route if zone_of(c) == z) for z in ZONES}
    return dict(seed=seed, cells=cells, adj=adj, special=special, purge=purge, breathing=breathing, route=route,
                exit=exit_c, gate12=gate12, gate23=gate23, valve=valve_e, shaft_land=shaft_land,
                route_len=len(route) - 1, valve_len=d_valve[exit_c], shaft_len=d_shaft[exit_c], zone_len=zone_len)


def score(L):
    zl = L['zone_len']
    s = -abs(zl[1] - 14) * 2 - abs(zl[2] - 22) * 2 - abs(zl[3] - 18) * 2       # target lengths per zone
    cross = sum(1 for c in L['cells'] if {'N', 'E', 'W'} <= {d for d in 'NEW' if step(c, d) in L['adj'][c]})
    s += min(cross, 14) * 1.5                                                     # crossroads: places to get a little lost
    s += min(L['route_len'] - L['valve_len'], 12) + min(L['route_len'] - L['shaft_len'], 12)   # shortcuts save time
    dead = sum(1 for c in L['cells'] if len(L['adj'][c]) == 1)
    s += min(dead, 22) * 0.5
    return s


def main():
    seeds = [int(a) for a in sys.argv[sys.argv.index('--seed') + 1:][:1]] if '--seed' in sys.argv else range(4000)
    best = None
    for sd in seeds:
        L = layout(sd)
        if L and (best is None or score(L) > score(best)): best = L
    L = best
    sp = {v: k for k, v in L['special'].items()}
    out = {
        'about': 'Vent maze v4 proposal, written by scripts/design_vent_maze_v4.py. Cells [x, y] (y north), openings N/E/S/W.',
        'seed': L['seed'], 'width': W, 'zones': {str(z): [ys.start, ys.stop - 1] for z, ys in ZONES.items()}, 'torn_x': TORN_X,
        'junction': list(JUNCTION), 'exit': list(L['exit']),
        'cells': {f'{x},{y}': ''.join(d for d in 'NESW' if step((x, y), d) in L['adj'][(x, y)]) + ('S' if (x, y) == JUNCTION else '')
                  for (x, y) in sorted(L['cells'])},
        'special': {k: list(v) for k, v in L['special'].items()},
        'purge': [list(c) for c in L['purge']], 'breathing': [list(c) for c in L['breathing']],
        'gates': {'outer_to_gut': [list(c) for c in L['gate12']], 'gut_to_core': [list(c) for c in L['gate23']]},
        'shortcuts': {'heart_valve': [list(c) for c in L['valve']], 'vertical_shaft': [list(L['special']['shaft']), list(L['shaft_land'])]},
        'route': [list(c) for c in L['route']],
        'stats': {'duct_cells': len(L['cells']), 'route_moves': L['route_len'], 'with_valve': L['valve_len'], 'with_shaft': L['shaft_len'],
                  'route_moves_by_zone': L['zone_len'], 'dead_ends': sum(1 for c in L['cells'] if len(L['adj'][c]) == 1),
                  'crossroads': sum(1 for c in L['cells'] if {'N', 'E', 'W'} <= {d for d in 'NEW' if step(c, d) in L['adj'][c]})},
    }
    p = os.path.join(os.path.dirname(__file__), 'vent_maze_v4_grid.json')
    json.dump(out, open(p, 'w'), indent=1)
    print(json.dumps(out['stats']), 'seed', L['seed'], {k: v for k, v in out['special'].items()})


if __name__ == '__main__':
    main()
