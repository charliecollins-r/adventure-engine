"""Build The Harvest's vent maze v6 ("The Colony") into scenario.json from scripts/vent_maze_v6_grid.json.

Replaces the v3 maze (views act1_vent_maze_*, objects nav_vent_maze_* / vent_maze_sealed_grate_*). Idempotent:
everything it generates is removed and regenerated on each run (views act1_v6_*, objects v6_* and nav_v6_*,
patrols/cycles/meters/pursuers/actions/widgets/events/items it owns), and the special rooms it re-wires
(the Entry Shaft, junction, Gas Chamber, collapsed section, fan room = the Purge Heart, exit) are rewritten in place.

The layout: design_vent_maze_v6.py (the reviewed layout) + augment_vent_maze_v6.py (the experiment results).
The story (people, the Audience, items, map, events): vent_story_v6.py.
Design: "Vent Maze v6: The Colony" (https://claude.ai/artifact/TXbhA8E6UQGPiDsts5uGkS), the experiments doc, and the
interactive map (https://claude.ai/artifact/GQf44LikYYCK5Knym4wD5Y).

Usage (from the repo root):
    python3 scenarios/the-harvest/scripts/build_vent_maze_v6.py scenarios/the-harvest/scenario.json
then: node tools/arrival-spots.mjs scenarios/the-harvest/scenario.json --views act1 --write
      node tools/validate-scenario.mjs scenarios/the-harvest/scenario.json --views act1
"""
import collections, copy, json, os, re, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import vent_story_v6 as story

P = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'scenario.json')
s = json.load(open(P))
G = json.load(open(os.path.join(HERE, 'vent_maze_v6_grid.json')))

# ── remove the v3 maze and anything an earlier v6 run generated ─────────────────────────────────────────
GEN_VIEW = lambda vid: vid.startswith('act1_vent_maze_') or vid.startswith('act1_v6_')
GEN_OBJ = lambda oid: oid.startswith(('nav_vent_maze_', 'vent_maze_sealed_grate', 'v6_', 'nav_v6_'))
s['views'] = [v for v in s['views'] if not GEN_VIEW(v['id'])]
s['objects'] = [o for o in s['objects'] if not GEN_OBJ(o['id'])]
for v in s['views']:
    v['objects'] = [o for o in v['objects'] if not GEN_OBJ(o)]
for k in ('patrols', 'events', 'puzzle_widgets', 'items'):
    s[k] = [x for x in s.get(k, []) if not str(x.get('id', '')).startswith('v6_')]
s['meters'] = []
s['cycles'] = []
s['pursuers'] = []
s['setting']['actions'] = []
O = {o['id']: o for o in s['objects']}
V = {v['id']: v for v in s['views']}

# ── the grid ────────────────────────────────────────────────────────────────────────────────────────────
D = {'N': (0, 1), 'S': (0, -1), 'E': (1, 0), 'W': (-1, 0)}
OPP = {'N': 'S', 'S': 'N', 'E': 'W', 'W': 'E'}
WORD = {'N': 'north', 'S': 'south', 'E': 'east', 'W': 'west'}
SCREEN = {'N': 'straight ahead', 'W': 'left', 'E': 'right', 'S': 'back'}
LABEL = {'N': '↑ Ahead', 'W': '← Left', 'E': 'Right →', 'S': '↓ Back'}
key = lambda c: f'{c[0]},{c[1]}'
cell = lambda k: tuple(int(v) for v in k.split(','))
step = lambda c, d: (c[0] + D[d][0], c[1] + D[d][1])
CELLS = {cell(k): ops for k, ops in G['cells'].items()}
ZR = {int(z): range(r[0], r[1] + 1) for z, r in G['zones'].items()}
zone = lambda c: next(z for z, r in ZR.items() if c[1] in r)
ROOMS = {tuple(c): r for r, cs in G['rooms'].items() for c in cs}
room_index = lambda c: [tuple(x) for x in G['rooms'][ROOMS[c]]].index(c)
PURGE = {tuple(c) for c in G['purge']}
FOLDS = {tuple(c) for c in G['folds']}
BREATH_GUT = {tuple(c) for c in G['breathing_zones']['2']}
BREATH_CORE = {tuple(c) for c in G['breathing_zones']['3']}
GRATES = {tuple(c) for c in G['grates']}
AIR_ROOMS = {tuple(c) for r in G['air_rooms'] for c in G['rooms'][r]}
MIMIC = tuple(G['npcs']['mimic'])
KETH = tuple(G['npcs']['kethvari'])
JUNCTION, EXIT = tuple(G['junction']), tuple(G['exit'])
GAS, GAS_DOOR = tuple(G['gas_chamber'][0]), tuple(G['gas_chamber'][1])
BORDER_N3, BORDER_CORE = [tuple(c) for c in G['gates']['border']]
VALVE_W, VALVE_E = [tuple(c) for c in G['shortcuts']['heart_valve']]
SHAFT_FROM, SHAFT_TO = [tuple(c) for c in G['shortcuts']['vertical_shaft']]
MEMBRANES = [tuple(sorted(tuple(c) for c in m['cells'])) for m in G['membranes']]
TUNNELS = [tuple(sorted(tuple(c) for c in p)) for p in G['tunnels']['pairs']]
SURGE_LEGS = [[tuple(c) for c in leg] for leg in G['surge']['legs']]
SURGE_CELLS = {c for leg in SURGE_LEGS for c in leg}
WARDEN = {'w': [tuple(c) for c in G['patrols']['w']], 'e': [tuple(c) for c in G['patrols']['e']]}
TORN_X = G['torn_x']
if MIMIC in FOLDS:      # the Mimic's dead end is no refuge before the alliance (its fold opens after)
    FOLDS.discard(MIMIC)

SPECIAL = {JUNCTION: 'act1_vent_junction', GAS: 'act1_vent_gas_chamber', tuple(G['rooms']['collapsed'][0]): 'act1_vent_collapsed',
           EXIT: 'act1_vent_fan_room'}
ROOM_VIEW = {'warren': ['warren_ledge', 'warren_bridge', 'warren_dwellings', 'warren_throat'], 'vera': ['vera'],
             'chapel': ['chapel', 'confessional'], 'hollow': ['hollow', 'archivist'], 'camp': ['camp', 'last_hide'],
             'nursery': ['court_eggs', 'court_brood', 'court_queen'], 'cache': ['cache', 'cache_vault'], 'seam': ['seam'],
             'grate': ['office_grate'], 'lever': ['lever'], 'collapsed': ['collapsed']}


def vid(c):
    c = tuple(c)
    if c in SPECIAL: return SPECIAL[c]
    if c in ROOMS: return f"act1_v6_{ROOM_VIEW[ROOMS[c]][room_index(c)]}"
    return f'act1_v6_{c[0]}_{c[1]}'


def linked(c, d):
    n = step(c, d)
    return n in CELLS and OPP[d] in CELLS[n] and d in CELLS[c]


def links(c):
    return [(d, step(c, d)) for d in 'NESW' if linked(c, d)]


def msg(t): return {'type': 'message', 'text': t}
def flag(f, v='true'): return {'type': 'set_flag', 'flag': f, 'value': v}
def is_(f, v='true'): return {'type': 'flag_is', 'flag': f, 'value': v}
def not_(f, v='true'): return {'type': 'flag_not', 'flag': f, 'value': v}
def over(title, reason): return {'type': 'game_over', 'result': 'lose', 'title': title, 'reason': reason}
def obj(oid, name, desc, box, interactions, label=None, nav=False, visible=True, **extra):
    x, y, w, h = box
    o = {'id': oid, 'name': name, 'description': desc, 'position': {'x': x, 'y': y}, 'size': {'width': w, 'height': h},
         'visual': {'color': 'rgba(100, 130, 200, 0.2)' if nav else 'rgba(0,0,0,0)', 'label': label or name, **({'nav': True} if nav else {})},
         'initial_state': 'default', 'initially_visible': visible, 'interactions': interactions}
    if extra.get('sprite'):
        # sprite objects are anchored at their bottom-centre (the box's bottom edge, midway across)
        o['position'] = {'x': round(x + w / 2), 'y': y + h}
    o.update(extra)
    return o
def it(verb, then, when=None, item=None):
    x = {'verb': verb, 'when': when or [], 'then': then}
    if item: x['item'] = item
    return x


# ── shortest distances (for the hints and the race to the Purge Heart) ──────────────────────────────────
def bfs(start, ok=lambda c: True):
    dist = {start: 0}
    q = collections.deque([start])
    while q:
        c = q.popleft()
        for d, n in links(c):
            if n not in dist and ok(n):
                dist[n] = dist[c] + 1
                q.append(n)
    return dist
TO_HEART = bfs(EXIT, lambda c: c not in PURGE and zone(c) == 3)
TO_GASDOOR = bfs(GAS_DOOR, lambda c: c not in PURGE and zone(c) == 1)
TO_LEVER = bfs(tuple(G['rooms']['lever'][0]), lambda c: c not in PURGE and zone(c) == 1)

# ── frames: which painting a duct screen uses ───────────────────────────────────────────────────────────
ZN = {1: 'z1', 2: 'z2', 3: 'z3'}
def frame(c):
    o = {d for d in CELLS[c] if d != 'S' and linked(c, d)}
    n, w, e = 'N' in o, 'W' in o, 'E' in o
    if not (n or w or e): return 'deadend', False
    if n and not w and not e: return 'straight', False
    if not n and w != e: return 'bend', e
    if n and w != e: return 'aheadside', e
    if not n and w and e: return 't', False
    return 'cross', False


MIRRORED = set()
def frame_file(z, name, flip):
    base = f'maze_{ZN[z]}_{name}'
    if z == 1 and name == 'bend': base = None; src = 'backgrounds/act1_vent_maze_lt.webp'
    elif z == 1 and name == 'aheadside': base = None; src = 'backgrounds/act1_vent_maze_lf.webp'
    else: src = f'backgrounds/maze/{base}.webp'
    if not flip: return src
    out = src.replace('.webp', '_r.webp')
    if src.endswith('act1_vent_maze_lt.webp'): out = 'backgrounds/act1_vent_maze_rt.webp'
    elif src.endswith('act1_vent_maze_lf.webp'): out = 'backgrounds/act1_vent_maze_rf.webp'
    elif out not in MIRRORED:
        Image.open(os.path.join(ROOT, src)).transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(ROOT, out), quality=90)
        MIRRORED.add(out)
    return out


# hotspot boxes and floor shared by every duct frame (they are all edits of one painting)
BOX_N = (380, 210, 220, 255)
BOX_W = (95, 187, 205, 347)
BOX_E = (660, 187, 205, 347)
BOX_S = (150, 660, 660, 60)
DUCT_FLOOR = [[336, 528], [336, 688], [624, 688], [624, 528], [697, 528], [658, 515], [302, 515], [263, 528]]
DUCT_CHAR = {'straight': 480, 'deadend': 480, 't': 480, 'cross': 480, 'bend': 560, 'aheadside': 560}
ROOM_FLOOR = DUCT_FLOOR
BOX = {'N': BOX_N, 'W': BOX_W, 'E': BOX_E, 'S': BOX_S}

# ── art: sprite definitions ─────────────────────────────────────────────────────────────────────────────
def sheet(file, fw, fh, cols, rate, scale, **kw):
    return {'file': file, 'frame_width': fw, 'frame_height': fh, 'columns': cols, 'rows': 1, 'frame_rate': rate, 'scale': scale, **kw}
SPR = {
    'fold': sheet('sprites/cold_fold.png', 646, 1012, 1, 0, 0.21),
    'throat_n': lambda cyc: sheet('sprites/breathing_throat.png', 420, 562, 4, 0, 0.5, sync_cycle=cyc),
    'throat_side': lambda cyc: sheet('sprites/breathing_throat.png', 420, 562, 4, 0, 0.6, sync_cycle=cyc),
    'membrane': lambda when: sheet('sprites/membrane_door.png', 438, 455, 2, 0, 0.5, frame_when=when),
    'lever': lambda when: sheet('sprites/lever.png', 352, 942, 2, 0, 0.21, frame_when=when),
    'larvae': sheet('sprites/vesk_larvae.png', 815, 271, 4, 3, 0.32),
    'sick': sheet('sprites/vesk_sick.png', 1090, 411, 2, 0.7, 0.22),
    'worker': sheet('sprites/vesk_worker.png', 412, 282, 6, 2, 0.3),
    'scout': lambda frame: sheet('sprites/vesk_scout.png', 457, 362, 2, 0, 0.32, frame_when=[{'when': [], 'frame': frame}]),
    'warden': sheet('sprites/warden_crawl.png', 862, 281, 4, 5, 0.34),
    'grate': sheet('sprites/core_grate.png', 0, 0, 1, 0, 1.0),   # sizes filled by make_grate_sprite()
    'lip': lambda z: sheet(f'sprites/maze_back_sealed_{ZN[z]}.png', 0, 0, 1, 0, 1.0),
}


def make_grate_sprite():
    """A Core grate on a side wall, cut from the grate frame painting (its light beams included)."""
    im = Image.open(os.path.join(ROOT, 'backgrounds/maze/maze_z3_grate.webp')).convert('RGBA')
    W, H = im.size
    sx, sy = W / 960, H / 720
    crop = im.crop((int(40 * sx), int(105 * sy), int(250 * sx), int(470 * sy)))
    # feather the edges so it sits into any wall
    import numpy as np
    a = np.asarray(crop).copy()
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    edge = np.minimum.reduce([xx, w - 1 - xx, yy, h - 1 - yy]).astype(float)
    a[..., 3] = (np.clip(edge / 18.0, 0, 1) * 255).astype('uint8')
    out = Image.fromarray(a, 'RGBA')
    out.save(os.path.join(ROOT, 'sprites/core_grate.png'))
    out.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(ROOT, 'sprites/core_grate_r.png'))
    return out.width, out.height


def make_lips():
    """The sealed-back lip at the bottom of every duct screen with no way back (keyed, squashed, one per zone)."""
    import numpy as np
    sizes = {}
    for z, raw in ((1, 'maze_back_sealed.png'), (2, 'maze_z2_back_sealed.png'), (3, 'maze_z3_back_sealed.png')):
        im = Image.open(os.path.join(ROOT, 'sprites/raw', raw)).convert('RGBA')
        a = np.asarray(im).astype(int)
        mask = (a[..., 2] > 140) & (a[..., 0] < 110) & (a[..., 1] < 110)
        a[..., 3] = np.where(mask, 0, 255)
        a[..., 2] = np.minimum(a[..., 2], np.maximum(a[..., 0], a[..., 1]) + 18)
        im = Image.fromarray(a.astype('uint8'), 'RGBA')
        im = im.crop(im.getbbox())
        im = im.resize((960, 52), Image.LANCZOS)
        im.save(os.path.join(ROOT, f'sprites/maze_back_sealed_{ZN[z]}.png'))
        sizes[z] = im.size
    return sizes


GW, GH = make_grate_sprite()
LIPS = make_lips()

# ── cycles: the Gut's lung breath, the Warren's wind, and each Core purge vent out of step ──────────────
s['cycles'].append({'id': 'v6_gut_breath', 'phases': [{'id': 'in', 'seconds': 4.5, 'sound': 'lung_in'}, {'id': 'out', 'seconds': 3.5, 'sound': 'lung_out'}],
                    'views': [vid(c) for c in sorted(BREATH_GUT)]})
s['cycles'].append({'id': 'v6_lung', 'phases': [{'id': 'in', 'seconds': 5, 'sound': 'lung_in', 'message': 'The lung breathes in. A wind rushes through the city.'},
                                                 {'id': 'still', 'seconds': 4, 'sound': 'lung_out', 'message': 'The air goes still. Anything that moves now can be felt.'}],
                    'views': [vid(c) for c in G['rooms']['warren']], 'when': [not_('vesk_allied')]})
CORE_CYCLE = {}
for i, c in enumerate(sorted(BREATH_CORE)):
    cid = f'v6_vent_{c[0]}_{c[1]}'
    CORE_CYCLE[c] = cid
    s['cycles'].append({'id': cid, 'offset': round(i * 1.37, 2), 'phases': [{'id': 'in', 'seconds': 2.6, 'sound': 'throat_gulp'},
                        {'id': 'out', 'seconds': 2.2 + (i % 3) * 0.4, 'sound': 'vent_scald'}], 'views': [vid(c)]})

# ── meters ──────────────────────────────────────────────────────────────────────────────────────────────
s['meters'] += [
    {'id': 'breath', 'label': 'Breath', 'max': 9, 'cost_per_move': 1, 'active_when': [is_('in_thin_air')], 'color': '#9ad0e0',
     'warnings': [{'at': 3, 'message': 'Your chest is starting to burn. Find air soon: a cold fold, a room with air, or a breathing duct on its in-breath.', 'sound': 'cough'},
                  {'at': 1, 'message': 'Your heartbeat is pounding in your ears. One breath left.', 'sound': 'heartbeat'}],
     'on_empty': [msg('The edges of the duct go grey, then black.'),
                  over('Out of air', "You blacked out. The Gut's air is thin because the colony breathes most of it; every screen costs a breath. "
                       "Plan from fold to fold, LISTEN for cold air (it costs a breath but tells you where), and take breathing ducts on their in-breath.")]},
    {'id': 'lungsac', 'label': 'Lung-sac', 'max': 4, 'initial': 0, 'color': '#f0a640', 'visible_when': [{'type': 'has_item', 'item': 'lung_sac'}]},
    {'id': 'callstone', 'label': 'Call-stone', 'max': 2, 'initial': 0, 'color': '#c8a0ff', 'visible_when': [{'type': 'has_item', 'item': 'call_stone'}]},
    {'id': 'race', 'label': 'The Curator', 'max': 9, 'initial': 9, 'style': 'bar', 'color': '#ff6a2a', 'cost_per_move': 1,
     'active_when': [is_('heart_race'), not_('purge_stopped')],
     'warnings': [{'at': 2, 'message': 'The hum behind the walls is very loud now, and the heat seams are white. Two more moves.', 'sound': 'curator_hum'}],
     'on_empty': [msg('Every seam in the Core goes white at once.'),
                  over('Purged', "The Curator reached the controls first and fired the purge. The race starts the same way every time: "
                       "from where it changes course, take the shortest way to the Purge Heart (count it on your map), and jam it with the probe or the Choir multitool.")]},
]
REFILL = [{'type': 'meter_set', 'meter': 'breath', 'value': 'max'}, {'type': 'meter_set', 'meter': 'lungsac', 'value': 'max'}]

# ── hiding and patrols: Wardens W1 and W2, the purge surge ───────────────────────────────────────────────
DUCT_PATH = [[250, 712], [480, 590], [720, 712]]
def warden_patrol(pid, loop, name, period, when):
    stops = [{'views': [vid(c)], 'enter': i * 4, 'leave': i * 4 + 4, 'path': DUCT_PATH if i % 2 == 0 else DUCT_PATH[::-1], 'flip': i % 2 == 1,
              'nearby_message': 'Somewhere close, through the flesh of the wall: a dry clicking, moving along the ducts.'} for i, c in enumerate(loop)]
    return {'id': pid, 'name': name, 'when': when, 'period': period, 'first_at': 20 + period // 3, 'warn_seconds': 5,
            'warn_message': 'Clicking, getting closer, and the air moves the wrong way. A Warden is coming down this duct. Get into a cold fold, or out of its way.',
            'warn_sound': 'warden_click', 'enter_sound': 'warden_click', 'nearby_sound': 'warden_click_far', 'notice_seconds': 1.5,
            'sprite': SPR['warden'], 'shadow': {'width': 120, 'height': 12, 'opacity': 0.45, 'offset_y': -2}, 'stops': stops,
            'on_caught': [msg('It stops. Its head swings toward you, slits flaring, tasting your breath.'),
                          over('Taken by a Warden', "The Wardens hunt anything the colony doesn't know, and they see by moving air. "
                               "They sweep their loops on a rhythm, and you hear them coming: get into a cold fold (HAND it) or out of their way. "
                               "Once the Queen accepts you, they'll let you pass.")]}
GUT_WHEN = [is_('in_thin_air'), not_('vesk_allied')]
s['patrols'] += [warden_patrol('v6_warden_w1', WARDEN['w'], 'Warden W1', 60, GUT_WHEN), warden_patrol('v6_warden_w2', WARDEN['e'], 'Warden W2', 100, GUT_WHEN)]
sg = G['surge']
s['patrols'].append({
    'id': 'v6_surge', 'name': 'The purge surge', 'when': [is_('in_thin_air'), not_('purge_stopped')], 'period': sg['period'], 'first_at': sg['first_at'],
    'warn_seconds': sg['warn_seconds'], 'warn_sound': 'surge_roar', 'nearby_sound': 'surge_far', 'notice_seconds': 1.2,
    'warn_message': 'A deep roar from the north, and every duct around you breathes out at once. The Vesk are scrambling for the folds. A purge surge is coming: get into a cold fold, or out of the north ducts, now.',
    'stops': [{'views': [vid(c) for c in leg], 'enter': i * sg['leg_seconds'], 'leave': (i + 1) * sg['leg_seconds'],
               'nearby_message': 'A hot wind roars along the ducts to the north. The surge is passing.'} for i, leg in enumerate(SURGE_LEGS)],
    'on_caught': [msg('The hot wind arrives. It is not wind.'),
                  over('Scalded', "The Purge Core's surge overflows the border every few minutes and rolls along the Gut's north ducts. "
                       "You get six seconds of warning (the roar, and the Vesk running for the folds). Hide in a cold fold, or get south out of the north rows.")]})
HIDE_FROM = [{'type': 'any_of', 'conditions': [{'type': 'patrol_near', 'patrol': p} for p in ('v6_warden_w1', 'v6_warden_w2', 'v6_surge')]}]

# ── the Curator behind the walls ────────────────────────────────────────────────────────────────────────
CORE_VIEWS = [vid(c) for c in CELLS if zone(c) == 3 and c not in PURGE]
s['pursuers'].append({
    'id': 'v6_curator', 'name': 'The Curator', 'when': [is_('in_core'), not_('heart_race'), not_('purge_stopped')],
    'zone': CORE_VIEWS, 'strike_views': [vid(c) for c in sorted(GRATES)], 'start_distance': 5, 'reset_distance': 4, 'strike_seconds': 6,
    'silent_flag': 'held_breath', 'hum_sound': 'curator_hum',
    'hum_message': 'A low hum, right behind the grate. Something very large has stopped on the other side of it. Leave, or hold your breath, NOW.',
    'lost_message': 'Behind you a long grey hand gropes through the grate into an empty duct, and withdraws. The hum moves off down the wall.',
    'on_strike': [msg('A long grey hand comes through the grate, faster than anything that size should move.'),
                  over('Recovered', "The Curator files you under 'recovered'. It can only reach you at a grate, and it hums one move before it can: "
                       "leave the screen, hold your breath (LISTEN) so it loses you, or tap the call-stone on the grate to send it the wrong way.")]})

# ── views ───────────────────────────────────────────────────────────────────────────────────────────────
LIGHTS = {1: [{'x': 0.5, 'y': 0.12, 'radius': 0.45, 'color': [200, 50, 50], 'pulse_speed': 0.3, 'pulse_amount': 0.15, 'alpha': 0.14}],
          2: [{'x': 0.5, 'y': 0.3, 'radius': 0.5, 'color': [70, 200, 140], 'pulse_speed': 0.18, 'pulse_amount': 0.25, 'alpha': 0.1}],
          3: [{'x': 0.5, 'y': 0.15, 'radius': 0.5, 'color': [255, 110, 30], 'pulse_speed': 0.5, 'pulse_amount': 0.2, 'alpha': 0.13}]}
MUSIC = {1: 'audio/music_ducts.mp3', 2: 'audio/music_gut.mp3', 3: 'audio/music_core.mp3'}
LOOK_EXIT = {
    1: {'N': 'The duct runs on ahead, ribbed and red.', 'W': 'A side duct opens in the left wall.', 'E': 'A side duct opens in the right wall.', 'S': 'The way you came.'},
    2: {'N': 'The duct runs on ahead, wet and breathing.', 'W': 'A soft opening in the left wall, rimmed with veins.', 'E': 'A soft opening in the right wall, rimmed with veins.', 'S': 'The way you came. The walls close in a little behind you, then relax.'},
    3: {'N': 'The duct runs on ahead, soot-black, its seams glowing orange.', 'W': 'A side duct in the left wall, hot to look at.', 'E': 'A side duct in the right wall, hot to look at.', 'S': 'The way you came.'},
}
PURGE_LOOK = 'Scalding air gusts out of this duct in slow pulses and the walls around its mouth are scorched black. Something vents through here, hard.'
PURGE_DEATH = "The duct breathes out. Unfortunately, you're in it. Purge ducts are scorched black, glow with heat and are marked with small skulls on the map: LOOK before you crawl."
HAND_EXIT = {1: 'Cold ribbed metal, slick with condensation.', 2: 'Warm, wet and faintly pulsing, like the inside of a cheek.', 3: 'Hot. You snatch your hand back.'}

new_views, new_objs, events = [], [], []


def move_effects(c, n, d):
    """What happens when the player goes from c through exit d into n."""
    z = zone(n)
    if n in PURGE:
        return [msg('You crawl into the scorched duct. Halfway in, the metal starts to tick and shudder.'), over('Purged', PURGE_DEATH)]
    if n == MIMIC:
        return [msg('"Outrider, respond. Outrider..." The voice is so close now. The duct ends. Something unfolds out of the dark where the voice was.'),
                over('Eaten by the Mimic', "The voice repeated itself exactly, every time, and LOOK told you the duct ends. Mission Control is a long way from here. "
                     "The colony has its monsters too; once the Queen accepts you, her guard deals with it.")]
    return [{'type': 'set_view', 'view': vid(n)}]


def exit_obj(c, d, box=None):
    n = step(c, d)
    z = zone(c)
    oid = f'nav_v6_{c[0]}_{c[1]}_{WORD[d]}'
    look = PURGE_LOOK if n in PURGE else LOOK_EXIT[z][d]
    if n == MIMIC:
        look = 'The duct ends a few yards in; you can see the back wall. And from the back wall, a voice: "Outrider, respond. Outrider, respond." The same words, the same breath, every time.'
    inter = [it('look', [msg(look)])]
    moves = []
    # breathing ducts: leave on the in-breath (+3); the out-breath blows you back (Gut) or scalds you (Core)
    if c in BREATH_GUT and n not in PURGE:
        moves.append(it('move', [msg('The duct breathes out as you go, and the gust shoves you back where you started.'), {'type': 'meter_add', 'meter': 'breath', 'amount': -1}],
                        when=[{'type': 'cycle_is', 'cycle': 'v6_gut_breath', 'phase': 'out'}]))
        moves.append(it('move', [{'type': 'meter_add', 'meter': 'breath', 'amount': 3}, msg('The duct breathes in and pulls you through with it. Air! (+3)')] + move_effects(c, n, d),
                        when=[{'type': 'cycle_is', 'cycle': 'v6_gut_breath', 'phase': 'in'}]))
    if c in BREATH_CORE and n not in PURGE:
        moves.append(it('move', [msg('The vent fires as you go.'), over('Scalded', "Purge vents fire fast and out of step. Leave on the in-breath (the throat opens and gulps), "
                                                                       "never on the out-breath. Watch one cycle before you go; the cat, if it's with you, always goes on the in-breath.")],
                        when=[{'type': 'cycle_is', 'cycle': CORE_CYCLE[c], 'phase': 'out'}]))
        moves.append(it('move', [{'type': 'meter_add', 'meter': 'breath', 'amount': 3}, msg('The vent gulps and pulls you through on a breath of hot air. (+3)')] + move_effects(c, n, d),
                        when=[{'type': 'cycle_is', 'cycle': CORE_CYCLE[c], 'phase': 'in'}]))
    # surge membranes: clenched shut while a surge is under way, before the alliance
    pair = tuple(sorted((c, n)))
    if pair in MEMBRANES:
        moves.insert(0, it('move', [msg('The membrane is clenched shut, hard as a fist. It will relax when the surge has passed.')],
                           when=[{'type': 'patrol_active', 'patrol': 'v6_surge'}, not_('vesk_allied')]))
    if not any(not any(w.get('type') == 'patrol_active' for w in m['when']) for m in moves):
        moves.append(it('move', move_effects(c, n, d)))
    inter += moves
    inter.append(it('hand', [msg(HAND_EXIT[z])]))
    inter.append(it('talk', [msg('Your whisper runs away down the duct and comes back as a dozen whispers.')]))
    extra = {}
    bx = box or BOX[d]
    if (c in BREATH_GUT or c in BREATH_CORE) and n not in PURGE:
        extra['walk_to'] = False   # a breathing duct is a timing skill: you go the moment you click, not after a walk
        if d != 'S':
            cyc = 'v6_gut_breath' if c in BREATH_GUT else CORE_CYCLE[c]
            sp = SPR['throat_n'](cyc) if d == 'N' else SPR['throat_side'](cyc)
            extra['sprite'] = dict(sp, scale=round(min(bx[2] / 420, bx[3] * 0.75 / 562), 3))
            extra['layer'] = 'floor'
            inter[0] = it('look', [msg(look + ' Its mouth is a ring of muscle that opens and closes with the breath: on the in-breath it would pull you through; on the out-breath, '
                                       + ('it would blow you back.' if c in BREATH_GUT else 'it vents scalding air.') + ' Go the moment it opens.')])
    if pair in MEMBRANES and d != 'S' and 'sprite' not in extra:
        extra['sprite'] = dict(SPR['membrane']([{'when': [{'type': 'patrol_active', 'patrol': 'v6_surge'}, not_('vesk_allied')], 'frame': 1}, {'when': [], 'frame': 0}]),
                               scale=round(min(bx[2] / 438, bx[3] * 0.75 / 455), 3))
        extra['layer'] = 'floor'
    return obj(oid, f'Duct ({SCREEN[d]})', f'A duct leading {WORD[d]}.', box or BOX[d], inter, label=LABEL[d], nav=True, **extra)


def deco(c, oid, name, desc, box, sprite, interactions, **kw):
    return obj(oid, name, desc, box, interactions, sprite=sprite, **kw)


def duct_view(c):
    z = zone(c)
    name, flip = frame(c)
    bg = frame_file(z, name, flip)
    objs = []
    open_dirs = [d for d in 'NWE' if linked(c, d)]
    for d in open_dirs:
        objs.append(exit_obj(c, d))
    if linked(c, 'S'):
        objs.append(exit_obj(c, 'S'))
    else:
        lw, lh = LIPS[z]
        objs.append(deco(c, f'v6_lip_{c[0]}_{c[1]}', 'Sealed lip', 'The duct behind you is sealed.', (0, 720 - lh, 960, lh),
                         dict(SPR['lip'](z), frame_width=lw, frame_height=lh), [it('look', [msg('Behind you the duct is sealed with a ridged lip. No way back that way.')])],
                         layer='floor'))
    closed = [d for d in 'WEN' if d not in open_dirs]
    wall = closed[0] if closed else None
    # cold fold: set into a closed wall
    if c in FOLDS:
        pos = {'W': (180, 560), 'E': (780, 560), 'N': (480, 470)}.get(wall, (340, 470))
        sc = 0.21 if wall in ('W', 'E') else 0.15 if wall == 'N' else 0.09
        objs.append(deco(c, f'v6_fold_{c[0]}_{c[1]}', 'Cold fold', 'A tall crease in the flesh of the wall, rimmed with frost.', (pos[0] - 68, pos[1] - 212, 136, 212),
                         dict(SPR['fold'], scale=sc),
                         [it('hand', [msg("You press yourself into the cold fold. The flesh closes over you, frost on your lips, and you keep very still."), {'type': 'start_hiding'}] + REFILL, when=HIDE_FROM),
                          it('hand', [msg('You put your face to the fold and breathe the cold air seeping in from the hull. Your head clears.')] + REFILL),
                          it('look', [msg('A crease in the wall where the hull\'s cold seeps in. Frost on its lips, mist curling out. Air, and a place to hide: HAND it to press into it.')]),
                          it('talk', [msg('Your breath fogs in the cold air. Somewhere far behind the fold, the hull ticks.')])],
                         walk_to={'x': 345 if pos[0] < 480 else 615, 'y': 640}))
    # Core grates: cut from the grate painting, set into a closed wall (or the floor at a crossroads)
    if c in GRATES:
        # the painted grate spans 960x720 x 40-250, y 105-470 (210 x 273 viewport px): the crop drawn at 0.7 matches it
        if wall == 'W': g = ('sprites/core_grate.png', 145, 470, 0.7)
        elif wall == 'E': g = ('sprites/core_grate_r.png', 815, 470, 0.7)
        elif wall == 'N': g = ('sprites/core_grate.png', 480, 440, 0.45)
        else: g = ('sprites/core_grate.png', 175, 620, 0.4)
        objs.append(deco(c, f'v6_grate_{c[0]}_{c[1]}', 'Grate', 'A thin grate onto a Choir hall, its light falling through in stripes.',
                         (g[1] - round(GW * g[3] / 2), g[2] - round(GH * g[3] / 0.75), round(GW * g[3]), round(GH * g[3] / 0.75)), sheet(g[0], GW, GH, 1, 0, g[3]),
                         [it('look', [msg('Through the grate: a Choir hall, too tall to see the top of, lit cold and blue. Something very large could reach in here. Only here.')]),
                          it('hand', [msg('You touch the grate and pull your hand back at once. On the other side, something heard that.')]),
                          it('use_item', [{'type': 'meter_add', 'meter': 'callstone', 'amount': -1}, {'type': 'pursuer_divert', 'pursuer': 'v6_curator', 'amount': 4},
                                          {'type': 'play_sound', 'sound': 'colony_knock'},
                                          msg('You tap the call-stone on the grate. For a moment nothing. Then, far off across the ship, the colony answers: knocking in the walls, '
                                              'hundreds of soft knocks. The hum behind the grate turns and goes the wrong way.')],
                             when=[{'type': 'meter_above', 'meter': 'callstone', 'threshold': 0}], item='call_stone'),
                          it('use_item', [msg('You tap the stone on the grate. Nothing answers: it\'s spent until you start the Core again.')], item='call_stone')],
                         layer='floor'))
    # Vesk life: sick in some dead ends of the Gut, larvae nests in others (bite before the alliance), workers patching seals
    if frame(c)[0] == 'deadend' and c not in FOLDS and c not in ROOMS:
        if zone(c) == 2 and (c[0] + c[1]) % 2 == 0:
            objs.append(deco(c, f'v6_sick_{c[0]}_{c[1]}', 'Gassed Vesk', 'A worker lying on its side, its skin blotched yellow-green.', (380, 470, 230, 100), SPR['sick'],
                             [it('look', [msg('A worker lies curled on its side, skin greyed and blotched where the gas got it. Its breathing slits open and close in wet, broken rhythm. Every breath sounds like it costs something.')]),
                              it('hand', [msg('You lay a hand on its side. It flinches, then goes still under your palm. It has nothing left to fight with.')]),
                              it('talk', [msg('"Hey. It\'s all right." Its slits flutter: long, short. Maybe it\'s trying to answer.')])]))
        elif zone(c) in (1, 2):
            objs.append(deco(c, f'v6_larvae_{c[0]}_{c[1]}', 'Nest', 'A heap of pale grubs in a nest of shed skins.', (350, 560, 260, 100), SPR['larvae'],
                             [it('look', [msg('A nest of shed skins and egg crust, and in it a heap of thumb-sized pale grubs, wriggling. Their mouths are mostly teeth. Best not to reach in.')]),
                              it('hand', [msg('The grubs scatter from your hand like you\'re one of them. The colony knows you now.')], when=[is_('vesk_allied')]),
                              it('hand', [msg('You reach into the nest. Every grub turns toward your hand at once.'),
                                          over('Bitten', 'Larvae nests sit in dead ends: skins, egg crust and wriggling. LOOK first, and leave them be. (After the Queen accepts you, they scatter from you instead.)')]),
                              it('talk', [msg('The heap goes quiet, listening. Then wriggles again.')])]))
    # alliance tunnels: a shut membrane in a wall that opens after the Audience
    for pair in TUNNELS:
        if c in pair:
            other = pair[1] if pair[0] == c else pair[0]
            d = next(dd for dd in 'NESW' if step(c, dd) == other)
            box = BOX.get(d if d != 'S' else 'S')
            if d in open_dirs or d == 'S' and linked(c, 'S'):
                continue
            x, y, w, h = box if d != 'S' else (380, 560, 200, 120)
            objs.append(obj(f'v6_tunnel_{c[0]}_{c[1]}', 'Colony tunnel', 'A knot of membrane in the wall.', (x, y, w, h),
                            [it('look', [msg('A tight knot of membrane, grown over a hole in the wall. The colony keeps it shut.')], when=[not_('vesk_allied')]),
                             it('look', [msg('The knot of membrane has relaxed into an open ring: a tunnel the colony opened for you.')]),
                             it('move', [msg('The knot of membrane doesn\'t open for you.')], when=[not_('vesk_allied')]),
                             it('move', [msg('You squeeze through the colony\'s tunnel.'), {'type': 'set_view', 'view': vid(other)}])],
                            label=LABEL.get(d, 'Tunnel'), nav=True,
                            sprite=dict(SPR['membrane']([{'when': [not_('vesk_allied')], 'frame': 1}, {'when': [], 'frame': 0}]), scale=round(min(w / 438, h / 455), 3)),
                            layer='floor'))
    # hints
    hints = [{'text': {1: 'These ducts all look alike. Count your turns on the map: the camera always faces north, so ahead is north, left west, right east.',
                       2: 'Every screen here costs a breath. Plan from air to air: cold folds, rooms with air, breathing ducts on the in-breath. LISTEN costs a breath but tells you where air is.',
                       3: 'No folds in the Core. Purge vents give air on their in-breath and kill on the out-breath. The Curator can only reach you at a grate, and hums one move before it can.'}[z], 'when': []}]
    if z == 1 and c in TO_LEVER and not c == tuple(G['rooms']['lever'][0]):
        pass
    view = {'id': vid(c), 'name': {1: 'The Outer Ducts', 2: 'The Gut', 3: 'The Purge Core'}[z], 'background_key': vid(c), 'background_file': bg,
            'objects': [o['id'] for o in objs], 'hints': hints, 'enter_sound': 'crawl', 'music': MUSIC[z], 'map_xy': [c[0], 14 - c[1]],
            'character': {'x': DUCT_CHAR[name] if not flip else 960 - DUCT_CHAR[name], 'y': 650, 'facing': 'up', 'sprite_set': 'idle'},
            'walk_area': {'floor': DUCT_FLOOR}, 'ambient_lighting': {'lights': copy.deepcopy(LIGHTS[z]), 'flicker': z != 2}}
    on_enter = []
    if c in FOLDS or c in AIR_ROOMS:
        on_enter += REFILL
    elif z == 2 and any(n in FOLDS for d, n in links(c)) and c not in ROOMS:
        d = next(d for d, n in links(c) if n in FOLDS)
        on_enter.append(msg(f'A cold draught brushes your face from the {WORD[d]}.'))
    if c in PURGE:
        pass
    if on_enter:
        view['on_enter'] = on_enter
    # purge ducts glow: an orange haze in the mouth of every deadly duct
    for d in open_dirs:
        if step(c, d) in PURGE:
            x, y, w, h = BOX[d]
            view['ambient_lighting']['lights'].append({'x': round((x + w / 2) / 960, 3), 'y': round((y + h / 2) / 720, 3), 'radius': 0.16, 'color': [255, 110, 20],
                                                       'pulse_speed': 1.1, 'pulse_amount': 0.45, 'alpha': 0.42})
    if c in GRATES:
        view['ambient_lighting']['lights'].append({'x': 0.18, 'y': 0.45, 'radius': 0.25, 'color': [150, 200, 255], 'pulse_speed': 0.1, 'pulse_amount': 0.1, 'alpha': 0.16})
    return view, objs


for c in sorted(CELLS):
    if c in PURGE or c in SPECIAL or c == MIMIC and False:
        continue
    if c in ROOMS:
        continue
    v, objs = duct_view(c)
    new_views.append(v)
    new_objs += objs

# rooms (the story module fills them in): exits first
ROOM_EXIT_BOX = {'N': (400, 200, 160, 260), 'S': BOX_S}
for c in sorted(ROOMS):
    if c in SPECIAL:
        continue
    v, objs = story.room(c, ROOMS[c], room_index(c), vid, links, exit_obj, msg, obj, it, ZR, zone, BOX_S, ROOM_FLOOR, LIGHTS, MUSIC, REFILL, G, SPR)
    new_views.append(v)
    new_objs += objs


# ── story: special rooms, people, the Audience, items, map, events ──────────────────────────────────────
extra = story.build(s, O, V, G, vid, links, exit_obj, msg, flag, is_, not_, over, obj, it, REFILL, SPR, CELLS, step, zone,
                    dict(JUNCTION=JUNCTION, EXIT=EXIT, GAS=GAS, GAS_DOOR=GAS_DOOR, BORDER_N3=BORDER_N3, BORDER_CORE=BORDER_CORE,
                         VALVE_W=VALVE_W, VALVE_E=VALVE_E, SHAFT_FROM=SHAFT_FROM, SHAFT_TO=SHAFT_TO, KETH=KETH, MIMIC=MIMIC,
                         TO_HEART=TO_HEART, GRATES=GRATES, BREATH_CORE=BREATH_CORE, FOLDS=FOLDS, CORE_VIEWS=CORE_VIEWS, BOX=BOX,
                         new_views=new_views, new_objs=new_objs))

# insert new views after the junction; objects at the end
ji = next(i for i, v in enumerate(s['views']) if v['id'] == 'act1_vent_junction')
s['views'][ji + 1:ji + 1] = new_views
s['objects'] += new_objs

# the score: every add_score with an id counts once
def scores(x, out):
    if isinstance(x, dict):
        if x.get('type') == 'add_score' and x.get('id'): out[x['id']] = max(out.get(x['id'], 0), x.get('points', 0))
        for v in x.values(): scores(v, out)
    elif isinstance(x, list):
        for v in x: scores(v, out)
    return out
s['setting']['max_score'] = sum(scores(s, {}).values())

# canonical format: indent=2, [x, y] number pairs on one line
out = json.dumps(s, indent=2, ensure_ascii=False)
out = re.sub(r'\[\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\s*\]', r'[\1, \2]', out)
open(P, 'w').write(out + '\n')
print(f'v6 maze: {len(new_views)} views, {len(new_objs)} objects; {len(s["patrols"])} patrols, {len(s["cycles"])} cycles, {len(s["meters"])} meters')
