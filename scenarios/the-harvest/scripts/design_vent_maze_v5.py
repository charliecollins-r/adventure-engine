"""Design a vent maze v5 layout and write scripts/vent_maze_v5_grid.json.

A proposal generator for the maze in the "Vent Maze v5: Design" doc (v4 plus air: the breath meter, cold folds and
many more breathing ducts; the Belly at the mouth of the Gut). Not wired into the game yet:
build_vent_maze.py still reads the v3 grid (vent_maze_grid.json).

Rules it obeys:
- Fixed compass: the camera faces north, so a duct screen is drawn by its openings other than south, and every
  subset of {N, W, E} has a painting (dead end, straight, bend, ahead+side, T, crossroads). South open or closed
  is shown by the floor running off the screen or by the sealed lip.
- Zones run south to north: 1 The Outer Ducts (rows 0-2, ~33 screens), 2 The Gut (rows 3-10, ~100 screens),
  3 The Purge Core (rows 11-14, ~44 screens). Each zone is a random spanning tree plus loops, joined by one gate.
- The Outer Ducts' door into the Gut is on the far west side, through the Gas Chamber (the helmet gets you
  through, then the Gut's entrance tears it off). It opens only after a lever on the far east side is pulled, so
  the route crosses the zone twice.
- The Gut is split into a west half (on the map) and an east half (torn off the map). The long way to the Purge
  Core runs through the torn half; the Heart Valve (west half) and the Vertical Shaft (east half, a one-way drop)
  are optional shortcuts. Two Warden patrols sweep loops of the Gut on the game clock, one in each half.
- Painted rooms are entered from the south (their paintings look north). Some are 2 or 3 screens deep: a chain
  of rooms going north, each opening into the next.
- NPCs: Vera (good) and the Penitent (wary) in the west half, the Archivist (neutral) and the Mimic (bad) in
  the torn half, the Keth-Vari at the mouth of the Gut.
- Air (v5): once the Gut tears the helmet off, every screen you enter costs one breath of eight. Cold folds (a
  crease of cooler air in the wall: HAND it to breathe, and hide from a Warden) and air rooms refill you. Every Gut
  duct is within 3 screens of a refill, every Purge Core duct within 4 counting breathing ducts.
- Breathing ducts: you leave one only on its in-breath (pulled through, +3 breath). In the Gut the out-breath blows
  you back where you came from (a breath lost); in the Purge Core it kills. About 12 in the Gut and 8 in the Core,
  on and off the route alike, so finding one says nothing about the way.
- The Belly: the mouth of the Gut is a vast two-screen cavern (the player drawn tiny) just past the Gas Chamber.
- Purge ducts are dead-end side branches (deadly; warned by LOOK and a skull on the map).

Usage (from scenarios/the-harvest):
  python3 scripts/design_vent_maze_v4.py [--seed N]     # searches seeds, writes the grid json, prints a summary
  python3 scripts/draw_vent_map_v4.py                   # renders the designer map
"""
import collections, json, os, random, sys

W = 15
ZONES = {1: range(0, 3), 2: range(3, 11), 3: range(11, 15)}
JUNCTION = (7, 0)
TORN_X = 8                                    # the Gut's east half (x >= 8) is torn off the map
D = {'N': (0, 1), 'S': (0, -1), 'E': (1, 0), 'W': (-1, 0)}
HOLES = {1: 8, 2: 14, 3: 12}                 # solid rock per zone (the room chains take more)
LOOPS = {1: 5, 2: 13, 3: 9}                   # extra ducts on top of the tree: loops and crossroads to get a little lost in
# painted rooms: name -> (zone, half: 'w' | 'e' | None, depth in screens)
ROOMS = {
    'lever': (1, 'far_e', 1), 'collapsed': (1, None, 1),
    'vera': (2, 'w', 1), 'chapel': (2, 'w', 2), 'hollow': (2, 'e', 2), 'camp': (2, 'e', 2), 'nursery': (2, 'e', 3),
    'shaft': (2, 'e', 1), 'belly': (2, 'mouth', 2),
    'cache': (3, None, 2), 'seam': (3, None, 1), 'grate': (3, None, 1),
}


def zone_of(c):
    for z, ys in ZONES.items():
        if c[1] in ys: return z
    return None


def step(c, d):
    return (c[0] + D[d][0], c[1] + D[d][1])


def layout(seed):
    r = random.Random(seed)
    # reserve the room chains first: a column of `depth` rock cells whose bottom one opens south onto a duct
    reserved, rooms = set(), {}
    keep = {JUNCTION, step(JUNCTION, 'W'), step(JUNCTION, 'E')}
    # the Belly first: two screens side by side on the Gut's first row, entered from the Gas Chamber below its west
    # half, left by the duct east of its east half
    bx = r.randrange(0, 3)
    belly = [(bx, ZONES[2].start), (bx + 1, ZONES[2].start)]
    rooms['belly'] = belly
    reserved |= set(belly) | {step(c, 'N') for c in belly} | {step(belly[0], 'W')}
    keep |= {step(belly[0], 'S'), step(belly[1], 'E')}
    for name, (z, half, depth) in ROOMS.items():
        if name == 'belly': continue
        ys = ZONES[z]
        xs = range(W - 3, W) if half == 'far_e' else range(0, TORN_X) if half == 'w' else range(TORN_X, W) if half == 'e' else range(W)
        options = []
        for x in xs:
            for y in range(ys.start + 1, ys.stop - depth + 1):
                chain = [(x, y + i) for i in range(depth)]
                ring = set(chain) | {step(c, d) for c in chain for d in 'EW'} | {step(chain[-1], 'N'), step(chain[0], 'S')}
                if ring & reserved or step(chain[0], 'S') in keep or step(chain[0], 'S') in {step(c, 'S') for c in reserved}:
                    continue
                options.append(chain)
        if not options: return None
        chain = r.choice(options)
        rooms[name] = chain
        reserved |= set(chain) | {step(c, d) for c in chain for d in 'EW'}   # walls either side of a room
    room_cells = {c for ch in rooms.values() for c in ch}
    cells = set()
    keep |= {step(ch[0], 'S') for ch in rooms.values()}
    for z, ys in ZONES.items():
        zc = [(x, y) for y in ys for x in range(W) if (x, y) not in room_cells]
        pool = [c for c in zc if c not in keep and c not in {step(ch[0], 'S') for ch in rooms.values()}]
        holes = set(r.sample(pool, HOLES[z]))
        cells |= set(zc) - holes
    edges = set()                                         # frozenset({a, b})
    def link(a, b): edges.add(frozenset((a, b)))
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
    def biggest(region):
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
        got = tree(region, JUNCTION if z == 1 else biggest(region))
        if len(got) < 0.85 * len(region): return None
        cells -= region - got
    for side in ('w', 'e'):
        half = {c for c in cells if zone_of(c) == 2 and (c[0] < TORN_X) == (side == 'w')}
        if not half: return None
        got = tree(half, biggest(half))
        if len(got) < 0.85 * len(half): return None
        cells -= half - got
    west = {c for c in cells if zone_of(c) == 2 and c[0] < TORN_X}
    east = {c for c in cells if zone_of(c) == 2 and c[0] >= TORN_X}
    gaps = [(a, step(a, 'E')) for a in west if a[0] == TORN_X - 1 and step(a, 'E') in east]
    if len(gaps) < 2: return None
    for g in r.sample(gaps, 2): link(*g)                   # two ways between the halves
    tree_edges = set(edges)
    for z, n in LOOPS.items():
        region = {c for c in cells if zone_of(c) == z}
        cand = [frozenset((a, step(a, d))) for a in region for d in 'NE' if step(a, d) in region]
        cand = [e for e in cand if e not in edges]
        for e in r.sample(cand, min(n, len(cand))): edges.add(e)
    edges = {e for e in edges if not (JUNCTION in e and step(JUNCTION, 'N') in e)}
    link(JUNCTION, step(JUNCTION, 'W')); link(JUNCTION, step(JUNCTION, 'E'))
    # gates: the far-west door into the Gut; the long way out of the Gut, from the torn half; the Heart Valve
    g12 = [(step(belly[0], 'S'), belly[0])]
    g23 = [(a, step(a, 'N')) for a in east if a[1] == ZONES[2].stop - 1 and step(a, 'N') in cells]
    valve = [(a, step(a, 'N')) for a in west if a[1] == ZONES[2].stop - 1 and step(a, 'N') in cells]
    if not (g23 and valve) or g12[0][0] not in cells or step(belly[1], 'E') not in west: return None
    gate12 = g12[0]; gate23 = r.choice(g23); valve_e = r.choice(valve)
    link(*gate12); link(*gate23)
    edges = {e for e in edges if len({zone_of(c) for c in e}) == 1 or e in (frozenset(gate12), frozenset(gate23))}
    adj = collections.defaultdict(set)
    for e in edges:
        a, b = tuple(e); adj[a].add(b); adj[b].add(a)
    # open the rooms: bottom room onto the duct below, each room onto the next one up
    adj[belly[1]].add(step(belly[1], 'E')); adj[step(belly[1], 'E')].add(belly[1])
    for name, ch in rooms.items():
        below = step(ch[0], 'S')
        if below not in cells: return None
        cells |= set(ch)
        for a, b in zip([below] + ch, ch):
            adj[a].add(b); adj[b].add(a)
    def bfs(src, extra=(), g=None):
        g = g or adj
        dist = {src: 0}; q = collections.deque([src]); gg = {k: set(v) for k, v in g.items()}
        for a, b in extra: gg.setdefault(a, set()).add(b)
        while q:
            c = q.popleft()
            for n in gg.get(c, ()):
                if n not in dist: dist[n] = dist[c] + 1; q.append(n)
        return dist
    dist = bfs(JUNCTION)
    if any(c not in dist for c in cells): return None
    top = [c for c in cells if c[1] == ZONES[3].stop - 1 and c not in room_cells]
    if not top: return None
    exit_c = max(top, key=lambda c: dist[c])
    lever = rooms['lever'][0]
    def path(src, dst, d):
        out = [dst]
        while out[-1] != src:
            c = out[-1]; out.append(min(adj[c], key=lambda n: d.get(n, 1e9)))
        return out[::-1]
    d_lever = bfs(lever)
    route = path(JUNCTION, lever, dist) + path(lever, exit_c, d_lever)[1:]
    on_route = set(route)
    # NPCs on duct screens (not rooms): the Keth-Vari at the mouth of the Gut; the Mimic at a dead end in the torn half
    ducts = cells - room_cells
    leaves = {z: [c for c in ducts if zone_of(c) == z and len(adj[c]) == 1 and c != JUNCTION and c not in on_route] for z in ZONES}
    mimic_pool = [c for c in leaves[2] if c[0] >= TORN_X]
    if not mimic_pool: return None
    mimic = max(mimic_pool, key=lambda c: dist[c])
    purge = []
    for z, n in ((1, 1), (2, 3), (3, 2)):
        pool = [c for c in leaves[z] if c != mimic and c[1] > 0]
        if len(pool) < n: return None
        purge += r.sample(pool, n)
    # Warden patrols: one loop in each half of the Gut, from a loop edge plus the tree path that closes it
    tree_adj = collections.defaultdict(set)
    for e in tree_edges:
        a, b = tuple(e); tree_adj[a].add(b); tree_adj[b].add(a)
    patrols = {}
    for side in ('w', 'e'):
        best = None
        for e in edges - tree_edges:
            a, b = tuple(e)
            if zone_of(a) != 2 or zone_of(b) != 2 or (a[0] < TORN_X) != (side == 'w') or (b[0] < TORN_X) != (side == 'w'):
                continue
            d = bfs(a, g=tree_adj)
            if b not in d: continue
            loop = []
            c = b
            while c != a:
                loop.append(c); c = min(tree_adj[c], key=lambda n: d.get(n, 1e9))
            loop.append(a)
            if not all(zone_of(c) == 2 and (c[0] < TORN_X) == (side == 'w') for c in loop): continue
            if 8 <= len(loop) <= 16 and (best is None or abs(len(loop) - 11) < abs(len(best) - 11)):
                best = loop
        if best is None: return None
        patrols[side] = best
    if any(c in purge for c in route): return None
    gut_route = [c for c in route if zone_of(c) == 2 and c not in room_cells]
    core_route = [c for c in route if zone_of(c) == 3 and c not in room_cells]
    # ---- air: breathing ducts and cold folds ------------------------------------------------------------------
    AIR_ROOMS = ('belly', 'vera', 'chapel', 'hollow', 'camp', 'cache', 'seam')
    air_cells = {c for k in AIR_ROOMS for c in rooms[k]}
    busy = set(purge) | {mimic} | set(belly) | {step(belly[1], 'E')}
    def tube(c): return 2 <= len(adj[c]) <= 3        # a throat you pass through (not a crossroads, not a dead end)
    breathing = []
    for z, n in ((2, 12), (3, 8)):
        cand = [c for c in ducts if zone_of(c) == z and tube(c) and c not in busy]
        r.shuffle(cand)
        picked = []
        n_on = round(n * 0.45)                           # on and off the route alike
        for want_on in (True, False):
            got = 0
            for c in cand:
                if (want_on and got == n_on) or len(picked) == n: break
                if (c in on_route) != want_on or c in picked: continue
                if all(abs(c[0] - p[0]) + abs(c[1] - p[1]) >= 3 for p in picked): picked.append(c); got += 1
        if len(picked) < n or sum(1 for c in picked if c in on_route) < (4 if z == 2 else 3): return None
        breathing += picked
    bset = set(breathing)
    def dists_from(srcs):
        d = {s0: 0 for s0 in srcs}; q = collections.deque(srcs)
        while q:
            c = q.popleft()
            for nb in adj[c]:
                if nb not in d: d[nb] = d[c] + 1; q.append(nb)
        return d
    folds = []
    for z, radius, extra in ((2, 3, set()), (3, 4, {c for c in bset if zone_of(c) == 3})):
        zone_ducts = {c for c in ducts if zone_of(c) == z}
        cand = [c for c in zone_ducts if c not in busy and c not in bset]
        refills = {c for c in air_cells if zone_of(c) == z} | extra
        def uncovered():
            d = dists_from(list(refills | set(folds))) if (refills or folds) else {}
            return {c for c in zone_ducts if d.get(c, 99) > radius}
        left = uncovered()
        while left:
            def gain(c):
                d = dists_from([c]); return sum(1 for u in left if d.get(u, 99) <= radius)
            best_c = max(cand, key=lambda c: (gain(c), c not in on_route, r.random()))
            if gain(best_c) == 0: return None
            folds.append(best_c); cand.remove(best_c); left = uncovered()
    fset = set(folds)
    def breath_trace(path_cells):
        b, low, trace = 8, 8, []
        prev = None
        for c in path_cells:
            if zone_of(c) in (2, 3) and c not in belly:
                if prev in bset: b = min(8, b + 3)      # pulled through on the in-breath
                b -= 1
                if c in air_cells or c in fset: b = 8
            elif c in belly:
                b = 8
            low = min(low, b); trace.append(b); prev = c
        return low, trace
    def breath_search(cap, start_cell=None):
        # shortest way from the Belly to the exit when every screen costs a breath and folds/air rooms refill to cap;
        # breathing ducts give +3 on the way out. Returns (moves, path) or None.
        start = (start_cell or belly[0], cap); prev_s = {start: None}; q = collections.deque([start])
        while q:
            c, b = q.popleft()
            if c == exit_c:
                path, st = [], (c, b)
                while st: path.append(st[0]); st = prev_s[st]
                return len(path) - 1, path[::-1]
            for nb in adj[c]:
                if zone_of(nb) == 1: continue
                nbb = min(cap, b + 3) if c in bset else b
                nbb -= 1
                if nb in air_cells or nb in fset: nbb = cap
                if nbb <= 0: continue
                st = (nb, nbb)
                if st not in prev_s: prev_s[st] = (c, b); q.append(st)
        return None
    found = breath_search(7)                             # solvable with a breath to spare
    if not found: return None
    gut_core = found[1]
    low, trace = breath_trace(gut_core)
    detour = found[0] - (len(route) - 1 - route.index(belly[0]))
    if any(not (fset & set(loop) or any(step(c, d) in fset for c in loop for d in 'NSEW')) for loop in patrols.values()):
        return None                                      # a fold to hide in on or beside every Warden loop
    shaft = rooms['shaft'][0]
    shaft_land = min((c for c in ducts if zone_of(c) == 3), key=lambda c: abs(c[0] - shaft[0]) + c[1])
    # dying sends you back to the start of the zone, breath full: every way into the Purge Core must be winnable
    core_entries = [gate23[1], valve_e[1], shaft_land]
    if any(not breath_search(7, e) for e in core_entries): return None
    valve_len = dist[lever] + bfs(lever, extra=[valve_e])[exit_c]
    shaft_len = dist[lever] + bfs(lever, extra=[(shaft, shaft_land)])[exit_c]
    zone_len = {z: sum(1 for c in route if zone_of(c) == z) for z in ZONES}
    if len(route) - 1 - shaft_len < 8 or len(route) - 1 - valve_len < 10: return None   # the shortcuts are worth taking
    if zone_len[3] < 16: return None
    if zone_len[2] < 28: return None                                         # the Gut is a journey, not a corridor
    if any(len(set(loop) & on_route) < 2 for loop in patrols.values()): return None   # both patrols cross the route
    edge_x = sum(1 for c in route if zone_of(c) == 2 and (c[0] in (0, W - 1) or c[1] == ZONES[2].start))
    if edge_x > zone_len[2] * 0.55: return None                              # not hugging the walls
    gut_dist = dists_from(list({c for c in air_cells if zone_of(c) == 2} | {c for c in fset if zone_of(c) == 2}))
    core_dist = dists_from(list({c for c in air_cells if zone_of(c) == 3} | {c for c in fset if zone_of(c) == 3}))
    air = dict(detour=detour, breath_path=[list(c) for c in gut_core], folds=folds, air_rooms=list(AIR_ROOMS), route_low=low, route_trace=trace,
               worst_gut=max(gut_dist.get(c, 99) for c in ducts if zone_of(c) == 2),
               worst_core_full=max(core_dist.get(c, 99) for c in ducts if zone_of(c) == 3))
    return dict(seed=seed, air=air, cells=cells, ducts=ducts, adj=adj, rooms=rooms, purge=purge, breathing=breathing, route=route,
                exit=exit_c, gate12=gate12, gate23=gate23, valve=valve_e, shaft_land=shaft_land, patrols=patrols,
                npcs={'kethvari': belly[0], 'mimic': mimic},
                route_len=len(route) - 1, valve_len=valve_len, shaft_len=shaft_len, zone_len=zone_len, dist=dist)


def crossroads(L):
    return sum(1 for c in L['ducts'] if {'N', 'E', 'W'} <= {d for d in 'NEW' if step(c, d) in L['adj'][c]})


def score(L):
    zl, dist = L['zone_len'], L['dist']
    s = -abs(zl[1] - 19) * 3 - abs(zl[2] - 34) * 3 - abs(zl[3] - 20) * 2      # target route lengths per zone
    s += min(crossroads(L), 40) * 0.8
    s += min(L['route_len'] - L['valve_len'], 20) * 0.5 + min(L['route_len'] - L['shaft_len'], 14) * 1.5
    s += (dist[L['rooms']['camp'][0]] + dist[L['rooms']['nursery'][0]]) * 0.4          # the deep rooms are deep
    s += L['air']['route_low'] * 1.5 - abs(len(L['air']['folds']) - 20) * 0.5               # air that is tight, not starved
    return s


def _try(sd):
    L = layout(sd)
    return sd, (score(L) if L else None)


def main():
    seeds = [int(a) for a in sys.argv[sys.argv.index('--seed') + 1:][:1]] if '--seed' in sys.argv else range(int(os.environ.get('SEEDS', 40000)))
    import multiprocessing
    with multiprocessing.Pool() as pool:
        good = [sd for sd, sc in pool.map(_try, seeds, chunksize=200) if sc is not None]
    print(len(good), 'layouts pass every rule')
    best = max(good, key=lambda sd: score(layout(sd)))
    L = layout(best)
    out = {
        'about': 'Vent maze v5 proposal, written by scripts/design_vent_maze_v5.py. Cells [x, y] (y north), openings N/E/S/W.',
        'seed': L['seed'], 'width': W, 'zones': {str(z): [ys.start, ys.stop - 1] for z, ys in ZONES.items()}, 'torn_x': TORN_X,
        'junction': list(JUNCTION), 'exit': list(L['exit']),
        'cells': {f'{x},{y}': ''.join(d for d in 'NESW' if step((x, y), d) in L['adj'][(x, y)]) + ('S' if (x, y) == JUNCTION else '')
                  for (x, y) in sorted(L['cells'])},
        'rooms': {k: [list(c) for c in v] for k, v in L['rooms'].items()},
        'npcs': {k: list(v) for k, v in L['npcs'].items()},
        'patrols': {k: [list(c) for c in v] for k, v in L['patrols'].items()},
        'purge': [list(c) for c in L['purge']], 'breathing': [list(c) for c in L['breathing']],
        'gates': {'outer_to_gut': [list(c) for c in L['gate12']], 'gut_to_core': [list(c) for c in L['gate23']]},
        'gas_chamber': [list(c) for c in L['route'][L['route'].index(L['gate12'][0]) - 1:L['route'].index(L['gate12'][0]) + 1]],
        'folds': [list(c) for c in L['air']['folds']],
        'breathing_zones': {'2': [list(c) for c in L['breathing'] if zone_of(c) == 2], '3': [list(c) for c in L['breathing'] if zone_of(c) == 3]},
        'air_rooms': L['air']['air_rooms'],
        'tiny': {'belly': 0.2, 'nursery': [1.0, 0.5, 0.25]},
        'breath': {'max': 8, 'route_lowest': L['air']['route_low'], 'route_trace': L['air']['route_trace'],
                   'extra_moves_for_air': L['air']['detour'], 'breath_path': L['air']['breath_path'],
                   'worst_gut_screens_to_air': L['air']['worst_gut'], 'worst_core_screens_to_fold_or_room': L['air']['worst_core_full']},
        'shortcuts': {'heart_valve': [list(c) for c in L['valve']], 'vertical_shaft': [L['rooms']['shaft'][0], list(L['shaft_land'])]},
        'route': [list(c) for c in L['route']],
        'stats': {'screens': len(L['cells']), 'duct_screens': len(L['ducts']),
                  'screens_by_zone': {z: sum(1 for c in L['cells'] if zone_of(c) == z) for z in ZONES},
                  'room_screens': len(L['cells']) - len(L['ducts']),
                  'route_moves': L['route_len'], 'with_valve': L['valve_len'], 'with_shaft': L['shaft_len'],
                  'route_moves_by_zone': L['zone_len'], 'dead_ends': sum(1 for c in L['ducts'] if len(L['adj'][c]) == 1),
                  'crossroads': crossroads(L), 'patrol_loops': {k: len(v) for k, v in L['patrols'].items()},
                  'folds_by_zone': {z: sum(1 for c in L['air']['folds'] if zone_of(c) == z) for z in (2, 3)},
                  'breathing_by_zone': {z: sum(1 for c in L['breathing'] if zone_of(c) == z) for z in (2, 3)},
                  'breathing_on_route': sum(1 for c in L['breathing'] if c in set(L['route'])),
                  'route_lowest_breath': L['air']['route_low']},
    }
    out['shortcuts']['vertical_shaft'][0] = list(out['shortcuts']['vertical_shaft'][0])
    p = os.path.join(os.path.dirname(__file__), 'vent_maze_v5_grid.json')
    json.dump(out, open(p, 'w'), indent=1)
    print(json.dumps(out['stats']), 'seed', L['seed'])


if __name__ == '__main__':
    main()
