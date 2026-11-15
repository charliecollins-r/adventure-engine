"""Design the vent maze layout (v3, "King's Quest desert" hard) and write scripts/vent_maze_grid.json.

The duct art has five frames: ahead+left (lf), ahead+right (rf), left only (lt), right only (rt) and a
dead end (de); the way back (south) is always possible. So in a generic cell the openings other than
south must be one of {N,W}, {N,E}, {W}, {E} or none. This searches seeded random layouts that obey that,
and keeps the best one by a difficulty score: a long shortest route, many reachable ducts, several loops,
several dead ends, the optional skeleton room far from the route, and a few deadly purge ducts that the
map marks with a skull.

Usage (from scenarios/the-harvest):
  python3 scripts/design_vent_maze.py            # writes scripts/vent_maze_grid.json and prints a summary
  python3 scripts/build_vent_maze.py scenario.json
  python3 scripts/draw_vent_map.py closeups/vent_map.webp
  node ../../tools/arrival-spots.mjs scenario.json --views act1 --write
"""
import collections, json, os, random

W, H = 7, 7            # generic cells: x 0..6, y 1..7
JX = 3                 # the junction sits at (3, 1) above the entry shaft at (3, 0)
D = {'N': (0, 1), 'S': (0, -1), 'E': (1, 0), 'W': (-1, 0)}
OPP = {'N': 'S', 'S': 'N', 'E': 'W', 'W': 'E'}


def layout(seed):
    r = random.Random(seed)
    gx = r.choice([0, 1, 5, 6])                         # gas chamber column (far from the junction)
    cx = r.choice([x for x in range(W) if abs(x - gx) >= 3])  # collapsed section column
    side = {}                                           # (x,y) -> 'W' | 'E'
    side[(JX - 1, 1)] = 'E'; side[(JX + 1, 1)] = 'W'     # the junction's two side ducts
    for y in range(1, H + 1):
        x = 0
        while x < W - 1:
            a, b = (x, y), (x + 1, y)
            if a in side or b in side or (y == 1 and JX in (x, x + 1)):
                x += 1; continue
            if r.random() < 0.62:
                side[a] = 'E'; side[b] = 'W'; x += 2
            else:
                x += 1
    north = set()
    for (x, y) in side:
        if y < H and r.random() < 0.75: north.add((x, y))
        if y == H and x in (gx, cx): north.add((x, y))
    if (gx, H) not in side or (cx, H) not in side:
        return None
    # cells and their openings
    cells = {}
    for x in range(W):
        for y in range(1, H + 1):
            dirs = set()
            if (x, y) in side: dirs.add(side[(x, y)])
            if (x, y) in north: dirs.add('N')
            if y > 1 and (x, y - 1) in north: dirs.add('S')
            if dirs: cells[(x, y)] = dirs
    cells[(JX, 1)] = {'W', 'E', 'S'}
    cells[(JX, 0)] = {'N'}
    cells[(gx, H + 1)] = {'N', 'S'}; cells[(gx, H + 2)] = {'N', 'S'}; cells[(gx, H + 3)] = {'S'}
    cells[(cx, H + 1)] = {'S'}
    special = {(JX, 0): 'ENTRY', (JX, 1): 'J', (gx, H + 1): 'GAS', (gx, H + 2): 'FAN', (gx, H + 3): 'EXIT', (cx, H + 1): 'COLL'}
    # graph
    def nbrs(p):
        for d in cells.get(p, ()):
            q = (p[0] + D[d][0], p[1] + D[d][1])
            if q in cells and OPP[d] in cells[q]: yield d, q
    # every opening must lead somewhere (the art shows it)
    for p, ds in cells.items():
        for d in ds:
            q = (p[0] + D[d][0], p[1] + D[d][1])
            if q not in cells or OPP[d] not in cells[q]: return None
    def bfs(src):
        dist = {src: 0}; prev = {}; dq = collections.deque([src])
        while dq:
            p = dq.popleft()
            for _, q in nbrs(p):
                if q not in dist: dist[q] = dist[p] + 1; prev[q] = p; dq.append(q)
        return dist, prev
    dist, prev = bfs((JX, 1))
    gas, coll = (gx, H + 1), (cx, H + 1)
    if gas not in dist or coll not in dist: return None
    route = [gas]
    while route[-1] != (JX, 1): route.append(prev[route[-1]])
    route = set(route)
    reach = {p for p in dist if p not in special}
    # purge ducts: leaves (one connection) that are off the route and not next to the junction
    leaves = [p for p in reach if sum(1 for _ in nbrs(p)) == 1 and p not in route and abs(p[0] - JX) + p[1] > 2]
    r.shuffle(leaves)
    purge = set(leaves[:3])
    edges = sum(1 for p in reach | set(special) for _ in nbrs(p)) // 2
    verts = len(reach) + len(special)
    loops = edges - verts + 1
    dead = sum(1 for p in reach if sum(1 for _ in nbrs(p)) == 1) - len(purge)
    L = dist[gas]
    coll_off = min(abs(coll[0] - q[0]) + abs(coll[1] - q[1]) for q in route)
    return dict(seed=seed, cells=cells, special=special, purge=purge, reach=reach, L=L, loops=loops, dead=dead,
                coll_dist=dist[coll], coll_off=coll_off, gx=gx, cx=cx)


def score(m):
    if not m: return None
    if not (14 <= m['L'] <= 22) or len(m['reach']) < 26 or m['loops'] < 4 or m['dead'] < 4 or len(m['purge']) < 3 or m['coll_dist'] < 9:
        return None
    return m['L'] + 0.25 * len(m['reach']) + 2.5 * m['loops'] + 0.5 * m['dead'] + 0.3 * m['coll_off']


best = None
for seed in range(400000):
    m = layout(seed)
    sc = score(m)
    if sc is not None and (best is None or sc > best[0]):
        best = (sc, m)
sc, m = best
# name cells: special names, generic cells by column letter + row number (A1..G7)
names = {}
for p in sorted(m['cells'], key=lambda p: (p[1], p[0])):
    if p in m['special']: names[p] = m['special'][p]
    elif p in m['reach']: names[p] = 'ABCDEFG'[p[0]] + str(p[1])
out = {'about': 'Vent maze layout, written by scripts/design_vent_maze.py. Cells: [x, y], openings (N/E/S/W, south = the way back). '
                 'PURGE cells are deadly exhaust ducts: moving into one is a game over.',
       'seed': m['seed'],
       'cells': {names[p]: [[p[0], p[1]], ''.join(d for d in 'NWES' if d in m['cells'][p])] for p in names},
       'purge': sorted(names[p] for p in m['purge'])}
path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'vent_maze_grid.json')
json.dump(out, open(path, 'w'), indent=1)
print(f"seed {m['seed']}: shortest route {m['L']} moves, {len(m['reach'])} ducts ({len(m['purge'])} purge), {m['loops']} loops, "
      f"{m['dead']} dead ends, skeleton {m['coll_dist']} moves from the junction; gas column {m['gx']}, skeleton column {m['cx']}")
# ASCII picture, north up
for y in range(H + 3, -1, -1):
    row1, row2 = '', ''
    for x in range(W):
        p = (x, y); n = names.get(p, '')
        tag = ('☠' + n) if p in m['purge'] else n
        row1 += (tag or '·').center(6) + ('─' if p in m['cells'] and 'E' in m['cells'][p] else ' ')
        row2 += ('│' if (x, y - 1) in m['cells'] and 'N' in m['cells'].get((x, y - 1), ()) and p in m['cells'] else ' ').center(6) + ' '
    print(row1); print(row2)
