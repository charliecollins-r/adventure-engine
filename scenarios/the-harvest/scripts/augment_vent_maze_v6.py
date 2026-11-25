"""Add the experiment results to the v6 vent maze layout (scripts/vent_maze_v6_grid.json), in place.

The "Vents: Five Experiments" doc changed v6 in four ways, all added here on top of the generated layout
(design_vent_maze_v6.py) so the layout itself stays the one that was reviewed:

1. Breath 9 (not 8): the route is re-traced with 9, and the breath search re-proves every zone start.
2. The purge surge: a sweep of the Gut's north rows on the game clock (built on patrols). Every surge screen must
   have a cold fold in it or a door out of the surge band, so a warned player can always get to safety.
3. Surge membranes: about 3 doorways in each half of the Gut that clench shut while a surge is under way. Only
   doorways the maze can lose without cutting anything off (not bridges), near the surge band.
4. Alliance tunnels: 2 ducts the colony opens after the Audience, chosen to shorten the walk back from the
   Queen's court to the west half the most.

Usage (from scenarios/the-harvest): python3 scripts/augment_vent_maze_v6.py   (idempotent)
"""
import collections, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
GRID = os.path.join(HERE, 'vent_maze_v6_grid.json')
D = {'N': (0, 1), 'S': (0, -1), 'E': (1, 0), 'W': (-1, 0)}
OPP = {'N': 'S', 'S': 'N', 'E': 'W', 'W': 'E'}
BREATH = 9
SURGE_ROWS = (9, 10)          # the Gut's two north rows, nearest the Purge Core's border


def key(c): return f'{c[0]},{c[1]}'
def cell(k): return tuple(int(v) for v in k.split(','))
def step(c, d): return (c[0] + D[d][0], c[1] + D[d][1])


def graph(cells, extra=()):
    g = collections.defaultdict(set)
    for k, ops in cells.items():
        c = cell(k)
        for d in ops:
            n = step(c, d)
            if key(n) in cells and OPP[d] in cells[key(n)]:
                g[c].add(n)
    for a, b in extra:
        g[a].add(b); g[b].add(a)
    return g


def bfs(g, start, banned=frozenset()):
    dist = {start: 0}
    q = collections.deque([start])
    while q:
        c = q.popleft()
        for n in g[c]:
            if (c, n) in banned or (n, c) in banned or n in dist: continue
            dist[n] = dist[c] + 1
            q.append(n)
    return dist


def main():
    G = json.load(open(GRID))
    # start from the generated layout (strip anything an earlier run added)
    for k in ('surge', 'membranes', 'tunnels'):
        G.pop(k, None)
    cells = G['cells']
    zone_rows = {int(z): range(r[0], r[1] + 1) for z, r in G['zones'].items()}
    gut = lambda c: c[1] in zone_rows[2]
    room_cells = {tuple(c) for cs in G['rooms'].values() for c in cs}
    folds = {tuple(c) for c in G['folds']}
    torn = G['torn_x']
    g = graph(cells)

    # ── 2. the purge surge ──────────────────────────────────────────────────
    band = sorted([cell(k) for k in cells if cell(k)[1] in SURGE_ROWS and gut(cell(k)) and cell(k) not in room_cells],
                  key=lambda c: (c[0], -c[1]))
    added_folds = []
    # safe within one move: a fold here or next door, or a door out of the band (a duct below, or an air room)
    for c in band:
        if c in folds or any(n not in band or n in folds for n in g[c]): continue
        folds.add(c); added_folds.append(c)
    # sweep west to east in four legs of a few screens each; 7 s per leg, every 3 minutes from 2:30
    legs, n = [], 4
    per = -(-len(band) // n)
    for i in range(n):
        part = band[i * per:(i + 1) * per]
        if part: legs.append([list(c) for c in part])
    G['surge'] = {'period': 180, 'first_at': 150, 'leg_seconds': 7, 'warn_seconds': 6, 'legs': legs,
                  'added_folds': [list(c) for c in added_folds]}
    G['folds'] = [list(c) for c in sorted(folds)]

    # ── 3. surge membranes ──────────────────────────────────────────────────
    route = [tuple(c) for c in G['route']]
    on_route = set(zip(route, route[1:])) | set(zip(route[1:], route))
    def bridge(a, b):
        d = bfs(g, a, banned={(a, b)})
        return b not in d
    cands = []
    for a in g:
        for b in g[a]:
            if a >= b or not (gut(a) and gut(b)) or a in room_cells or b in room_cells: continue
            if min(a[1], b[1]) < 7 or bridge(a, b): continue
            half = 'w' if max(a[0], b[0]) < torn else 'e' if min(a[0], b[0]) >= torn else None
            if not half: continue
            cands.append(((a, b) in on_route, -min(a[1], b[1]), a, b, half))
    cands.sort(key=lambda t: (not t[0], t[1], t[2]))
    membranes, used = [], set()
    for want in ('w', 'e'):
        k = 0
        for on, _, a, b, half in cands:
            if half != want or a in used or b in used or k >= 3: continue
            membranes.append({'cells': [list(a), list(b)], 'half': half, 'on_route': on})
            used |= {a, b}; k += 1
    G['membranes'] = membranes

    # ── 4. alliance tunnels ─────────────────────────────────────────────────
    court = tuple(G['rooms']['nursery'][0])
    targets = [tuple(G['rooms']['warren'][3]), tuple(G['rooms']['vera'][0]), tuple(G['rooms']['chapel'][0])]
    # not through a purge duct, and not where a shortcut already is (the Heart Valve)
    avoid = {tuple(c) for c in G['purge']} | {tuple(c) for c in G['shortcuts']['heart_valve']}
    def walk_back(extra=()):
        gg = graph(cells, extra)
        d = bfs(gg, court)
        return sum(d.get(t, 99) for t in targets)
    base = walk_back()
    tunnels = []
    for _ in range(2):
        best = None
        for k in cells:
            a = cell(k)
            if not gut(a) or a in room_cells or a in avoid: continue
            for dname in ('N', 'E'):
                b = step(a, dname)
                if key(b) not in cells or not gut(b) or b in room_cells or b in avoid or b in g[a]: continue
                ex = [tuple(map(tuple, t)) for t in tunnels] + [(a, b)]
                s = walk_back(ex)
                if best is None or s < best[0]: best = (s, a, b)
        tunnels.append([best[1], best[2]])
    after = walk_back([tuple(map(tuple, t)) for t in tunnels])
    G['tunnels'] = {'pairs': [[list(a), list(b)] for a, b in tunnels], 'saves_moves': base - after,
                    'targets': ['warren throat', 'Vera', 'the chapel']}

    # ── 1. breath 9 ─────────────────────────────────────────────────────────
    air = set(folds) | {tuple(c) for r in G['air_rooms'] for c in G['rooms'][r]}
    breathing = {tuple(c) for c in G['breathing']}
    def costs(c): return c[1] >= zone_rows[2].start
    def breath_search(start, goal_test, cap=BREATH):
        # states (cell, breath); a move costs 1, air refills to cap, leaving a breathing duct gains 3 (on the in-breath)
        best = {(start, cap)}
        q = collections.deque([(start, cap)])
        while q:
            c, b = q.popleft()
            if goal_test(c): return b
            for n in g[c]:
                nb = b + (3 if c in breathing else 0)
                nb = min(cap, nb) - (1 if costs(n) else 0)
                if n in air: nb = cap
                if nb <= 0: continue
                if (n, nb) not in best:
                    best.add((n, nb)); q.append((n, nb))
        return None
    border_in = tuple(G['gates']['border'][1])
    exit_ = tuple(G['exit'])
    proofs = {
        'warren_to_border': breath_search(tuple(G['rooms']['warren'][0]), lambda c: c == tuple(G['gates']['border'][0])),
        'border_to_exit': breath_search(border_in, lambda c: c == exit_),
        'shaft_landing_to_exit': breath_search(tuple(G['shortcuts']['vertical_shaft'][1]), lambda c: c == exit_),
    }
    G['breath']['max'] = BREATH
    G['breath']['proofs_reached_with'] = proofs
    assert all(v is not None for v in proofs.values()), proofs
    json.dump(G, open(GRID, 'w'), indent=1)
    print(f'surge: {len(band)} screens in {len(legs)} legs, {len(added_folds)} folds added')
    print('membranes:', [(m['half'], m['cells'], m['on_route']) for m in membranes])
    print('tunnels:', G['tunnels'])
    print('breath proofs (breath left at goal):', proofs)


if __name__ == '__main__':
    main()
