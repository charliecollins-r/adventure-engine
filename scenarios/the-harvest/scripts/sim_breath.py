# Breath-meter experiment (Vents: Five Experiments doc). Run: python3 scripts/sim_breath.py  (slow: several minutes)
"""Monte Carlo players crossing the Gut (Warren -> the court door) on the v6 sample maze.
They know the west half from the escapee's map (cells + folds), not the torn half. Every screen costs a breath;
folds and air rooms refill; a breathing duct must be left on the in-breath (success p_ok, else blown back = 1 breath).
careful: only explores a frontier screen if it can still reach known air after it; reckless: explores until low."""
import json, random, collections, statistics
G = json.load(open('/home/user/kings-quest-multiplayer/scenarios/the-harvest/scripts/vent_maze_v6_grid.json'))
D = {'N': (0, 1), 'S': (0, -1), 'E': (1, 0), 'W': (-1, 0)}
cells = {tuple(map(int, k.split(','))): v for k, v in G['cells'].items()}
Z2 = range(G['zones']['2'][0], G['zones']['2'][1] + 1)
gut = {c for c in cells if c[1] in Z2}
adj = collections.defaultdict(set)
for c, ops in cells.items():
    for d in ops:
        n = (c[0] + D[d][0], c[1] + D[d][1])
        if n in gut and c in gut: adj[c].add(n); adj[n].add(c)
rooms = {k: [tuple(x) for x in v] for k, v in G['rooms'].items()}
warren, court = rooms['warren'], rooms['nursery']
air = {c for k in G['air_rooms'] for c in rooms[k]} & gut
folds = {tuple(c) for c in G['folds']} & gut
bducts = {tuple(c) for c in G['breathing_zones']['2']}
TORN = G['torn_x']

ALL = {}
for c0 in gut:
    d = {c0: 0}; q = collections.deque([c0])
    while q:
        c = q.popleft()
        for n in adj[c]:
            if n not in d: d[n] = d[c] + 1; q.append(n)
    ALL[c0] = d
def dist_map(src, known):     # approximation: true graph distance, limited to screens the player knows
    return {c: v for c, v in ALL[src].items() if c in known}
def step_toward(pos, target, known):
    d = dist_map(target, known)
    return min((n for n in adj[pos] if n in d), key=lambda n: d[n])

def run(maxb, p_ok, policy, restart, seed, draught=False):
    r = random.Random(seed)
    known = {c for c in gut if c[0] < TORN} | set(warren)
    seen_air = {c for c in folds | air if c in known}
    visited = set(warren)
    pos, b, moves, blackouts, cp = warren[3], maxb, 0, 0, warren[3]
    goal = court[0]
    commit = None
    for _ in range(4000):
        if pos == goal: return moves, blackouts, True
        here = dist_map(pos, known)
        if commit == pos: commit = None
        target = commit if commit in here else None
        if target is None and goal in here and here[goal] < b: target = goal
        if target is None:
            frontier = [c for c in known if c not in visited and c in here]
            def air_after(f):
                df = dist_map(f, known)
                return min((df[a] for a in seen_air if a in df), default=99)
            if policy == 'careful':
                safe = [f for f in frontier if here[f] + air_after(f) <= b - 1]
            else:
                near_air = min((here[a] for a in seen_air if a in here), default=99)
                safe = frontier if b > near_air + 1 else []
            if safe: target = min(safe, key=lambda f: (here[f], r.random()))
            elif pos in seen_air and b == maxb:            # topped up and still nothing safe: take a risk, and commit to it
                if goal in here: target = goal
                elif frontier: target = min(frontier, key=lambda f: here[f])
                commit = target
            else:
                cand = [a for a in seen_air if a in here and a != pos]
                if pos in seen_air: target = None; b = maxb
                elif cand: target = min(cand, key=lambda a: here[a])
                elif frontier: target = min(frontier, key=lambda f: here[f])
            if target is None: continue
        nxt = step_toward(pos, target, known)
        if pos in bducts:
            if r.random() > p_ok:
                b -= 1; moves += 1
                if b <= 0: blackouts += 1; pos, b = cp, maxb
                continue
            b = min(maxb, b + 3)
        pos = nxt; moves += 1; b -= 1
        visited.add(pos); known.add(pos); known |= adj[pos]
        if draught == 'listen' and b >= 3:
            # spend a breath to listen: folds and air within 2 screens become known
            b -= 1
            seen_air |= {c for c, v in ALL[pos].items() if v <= 2 and (c in folds or c in air)}
            known |= {c for c, v in ALL[pos].items() if v <= 2}
        elif draught: seen_air |= {n for n in adj[pos] if n in folds or n in air}
        if pos in folds or pos in air:
            b = maxb; seen_air.add(pos)
            if restart == 'air': cp = pos
        if b <= 0: blackouts += 1; pos, b = cp, maxb
    return moves, blackouts, False

print('breath  restart  aid      median moves  mean blackouts  3+ blackouts  stuck')
for maxb in (8, 9):
    for aid in (False, True, 'listen'):
        res = [run(maxb, 0.7, 'careful', 'zone', s, aid) for s in range(120)]
        mv = [m for m, _, ok in res if ok]; bo = [x for _, x, _ in res]
        stuck = sum(1 for *_, ok in res if not ok)
        print(f"{maxb:5}  zone     {str(aid):7}  {statistics.median(mv) if mv else 0:12.0f}  {statistics.mean(bo):14.2f}  {sum(1 for x in bo if x >= 3)/len(bo)*100:11.0f}%  {stuck:5}")
