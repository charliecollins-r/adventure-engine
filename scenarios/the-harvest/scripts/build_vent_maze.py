"""Build (or rebuild) The Harvest's vent maze from a grid definition.

Usage (from the repo root):
    python3 scenarios/the-harvest/scripts/build_vent_maze.py scenarios/the-harvest/scenario.json

Edit CELLS below to change the layout, then re-run. Generated content (views
`act1_vent_maze_*`, objects `nav_vent_maze_*` and `vent_maze_sealed_grate`) is
removed and regenerated each run; the special rooms' exits, the map item and the
junction hints are (re)written in place, so running twice is safe. Afterwards:
re-draw the map (scripts/draw_vent_map.py), then run tools/validate-scenario.mjs
and tools/softlock-search.mjs. Conventions: see vent-maze-design.md.
"""
import json, sys, collections, copy
p = sys.argv[1]
s = json.load(open(p))
# idempotent: drop previously generated maze content before rebuilding
s['views'] = [v for v in s['views'] if not v['id'].startswith('act1_vent_maze_')]
s['objects'] = [o for o in s['objects'] if not (o['id'].startswith('nav_vent_maze_') or o['id'] == 'vent_maze_sealed_grate')]
O = {o['id']: o for o in s['objects']}
V = {v['id']: v for v in s['views']}
I = {i['id']: i for i in s['items']}

CELLS = {'ENTRY': ((2,0),'N'), 'J': ((2,1),'WES'), 'A': ((1,1),'NE'), 'B': ((1,2),'NWS'), 'C': ((0,2),'NE'),
         'D': ((0,3),'ES'), 'E': ((1,3),'NWS'), 'F': ((1,4),'NES'), 'GAS': ((1,5),'NS'), 'FAN': ((1,6),'NS'),
         'EXIT': ((1,7),'S'), 'G': ((3,1),'NW'), 'H': ((3,2),'NES'), 'I': ((4,2),'NW'), 'COLL': ((4,3),'S'),
         'K': ((3,3),'NWS'), 'L': ((3,4),'S'), 'M': ((2,3),'NE'), 'N': ((2,4),'WS')}
SPECIAL = {'ENTRY': 'act1_ventilation_shaft', 'J': 'act1_vent_junction', 'GAS': 'act1_vent_gas_chamber',
           'FAN': 'act1_vent_fan_room', 'EXIT': 'act1_vent_exit', 'COLL': 'act1_vent_collapsed'}
GENERIC = [c for c in CELLS if c not in SPECIAL]
vid = lambda c: SPECIAL.get(c, f'act1_vent_maze_{c.lower()}')
D = {'N': (0,1), 'S': (0,-1), 'E': (1,0), 'W': (-1,0)}
pos = {v[0]: k for k, v in CELLS.items()}
nbr = lambda c, d: pos[(CELLS[c][0][0]+D[d][0], CELLS[c][0][1]+D[d][1])]
WORD = {'N': 'north', 'S': 'south', 'E': 'east', 'W': 'west'}
SCREEN = {'N': 'straight ahead', 'W': 'left', 'E': 'right', 'S': 'back'}

# shortest-path direction toward the gas chamber (what the map tells you)
dist = {'GAS': 0}; q = collections.deque(['GAS'])
while q:
    c = q.popleft()
    for d in CELLS[c][1]:
        n = nbr(c, d) if (CELLS[c][0][0]+D[d][0], CELLS[c][0][1]+D[d][1]) in pos else None
        if n and n not in dist: dist[n] = dist[c]+1; q.append(n)
def toward_gas(c):
    return min((d for d in CELLS[c][1] if (CELLS[c][0][0]+D[d][0], CELLS[c][0][1]+D[d][1]) in pos), key=lambda d: dist[nbr(c, d)])

def frame(c):
    o = set(CELLS[c][1]) - {'S'}
    return {frozenset('NW'): 'lf', frozenset('NE'): 'rf', frozenset('W'): 'lt', frozenset('E'): 'rt', frozenset(): 'de'}[frozenset(o)]
BOX = {'lf': {'N': (380,210,220,255), 'W': (95,187,205,347)}, 'rf': {'N': (360,210,220,255), 'E': (660,187,205,347)},
       'lt': {'W': (95,187,205,347)}, 'rt': {'E': (660,187,205,347)}, 'de': {}}
CHAR_X = {'lf': 560, 'rf': 400, 'lt': 560, 'rt': 400, 'de': 480}
SOUTH = (150, 660, 660, 60)
LABEL = {'N': '↑ Ahead', 'W': '← Left', 'E': 'Right →', 'S': '↓ Back'}
LOOK = {'N': 'The duct runs on straight ahead, deeper into the dark. A faint teal glow hangs somewhere far along it.',
        'W': 'A side duct opens in the left wall, round and black.',
        'E': 'A side duct opens in the right wall, round and black.',
        'S': 'The duct behind you. Every stretch of this place looks the same from here.'}

def msg(t): return {'type': 'message', 'text': t}
def nav_obj(c, d, box):
    t = nbr(c, d); x, y, w, h = box
    return {'id': f'nav_vent_maze_{c.lower()}_{WORD[d]}', 'name': f'Duct ({SCREEN[d]})',
            'description': f'A duct leading {WORD[d]}.', 'position': {'x': x, 'y': y}, 'size': {'width': w, 'height': h},
            'visual': {'color': 'rgba(100, 130, 200, 0.2)', 'label': LABEL[d], 'nav': True},
            'initial_state': 'default', 'initially_visible': True,
            'interactions': [
                {'verb': 'look', 'when': [], 'then': [msg(LOOK[d])]},
                {'verb': 'move', 'when': [], 'then': [{'type': 'set_view', 'view': vid(t)}]},
                {'verb': 'hand', 'when': [], 'then': [msg('Cold ribbed metal, slick with condensation. It hums faintly under your palm.')]},
                {'verb': 'talk', 'when': [], 'then': [msg('Your whisper runs away down the duct and comes back as a dozen whispers. None of them helpful.')]}]}

lights_base = [{'x': 0.5, 'y': 0.12, 'radius': 0.45, 'color': [200, 50, 50], 'pulse_speed': 0.3, 'pulse_amount': 0.15, 'alpha': 0.14},
               {'x': 0.5, 'y': 0.92, 'radius': 0.3, 'color': [180, 40, 40], 'pulse_speed': 0.2, 'pulse_amount': 0.1, 'alpha': 0.08, 'phase': 1.2}]
new_views, new_objs = [], []
for c in GENERIC:
    f = frame(c); objs = []
    for d, box in BOX[f].items(): objs.append(nav_obj(c, d, box))
    if 'S' in CELLS[c][1]: objs.append(nav_obj(c, 'S', SOUTH))
    if f == 'de':
        objs.append({'id': 'vent_maze_sealed_grate', 'name': 'Sealed Grate', 'description': 'A heavy grate bolted over a sealed vent.',
                     'position': {'x': 395, 'y': 220}, 'size': {'width': 175, 'height': 253},
                     'visual': {'color': 'rgba(120, 100, 80, 0.2)', 'label': 'Grate'}, 'initial_state': 'default', 'initially_visible': True,
                     'interactions': [
                         {'verb': 'look', 'when': [], 'then': [msg('A heavy grate, rusted solid over a sealed vent. Old claw marks score the wall beside it: something else ended up here, and tried to get out. Dead end.')]},
                         {'verb': 'hand', 'when': [], 'then': [msg("You rattle the grate. It doesn't move a hair. Whoever left those claw marks had the same luck.")]},
                         {'verb': 'talk', 'when': [], 'then': [msg('"Wrong way," you tell yourself. The duct agrees.')]},
                         {'verb': 'move', 'when': [], 'response': "It's bolted shut. You'll have to go back.", 'then': []}]})
    lights = copy.deepcopy(lights_base)
    if 'N' in CELLS[c][1]:
        lights.append({'x': 0.51 if f == 'lf' else 0.49, 'y': 0.47, 'radius': 0.13, 'color': [60, 170, 150], 'pulse_speed': 0.25, 'pulse_amount': 0.2, 'alpha': 0.12, 'phase': 0.6})
    way = toward_gas(c)
    hints = [{'text': "These ducts all look the same. Without something to map them with, it would be easy to go in circles.", 'when': []},
             {'text': f"Your scratched map says: from here, go {SCREEN[way]} ({WORD[way]}). The skull marks the gas, so have the helmet before you go that far.",
              'when': [{'type': 'has_item', 'item': 'ventilation_map'}]}]
    new_views.append({'id': vid(c), 'name': 'Air Ducts', 'background_key': vid(c), 'background_file': f'backgrounds/act1_vent_maze_{f}.webp',
                      'objects': [o['id'] for o in objs], 'room_animation': 'flicker', 'hints': hints,
                      'character': {'x': CHAR_X[f], 'y': 650, 'facing': 'up', 'sprite_set': 'idle', 'object_id': 'goblin_self'},
                      'ambient_lighting': {'lights': lights, 'flicker': True}})
    new_objs += objs

# insert new views right after the junction, objects at the end
ji = next(i for i, v in enumerate(s['views']) if v['id'] == 'act1_vent_junction')
s['views'][ji+1:ji+1] = new_views
s['objects'] += new_objs

def retarget(oid, view, move_text=None, look=None):
    for it in O[oid]['interactions']:
        for e in it.get('then', []):
            if e.get('type') == 'set_view': e['view'] = view
            if move_text and it['verb'] == 'move' and e.get('type') == 'message': e['text'] = move_text
        if look and it['verb'] == 'look':
            key = 'map' if any(c.get('type') == 'has_item' for c in it.get('when', [])) else 'nomap'
            for e in it.get('then', []):
                if e.get('type') == 'message' and key in look: e['text'] = look[key]

retarget('nav_act1_vent_junction_to_act1_vent_gas_chamber', vid('A'),
         'You crawl into the left tunnel. It opens into more ducts, ribbed and red and all alike. Somewhere ahead, the air has a faint chemical tang.',
         {'nomap': 'The left tunnel. A faint yellowish haze curls out of it, and the air from it smells sharp and chemical.',
          'map': "Your map marks WEST, this way, as the route: straight on north after it, toward a scratched skull. The skull means the air goes bad. You'll want protection."})
retarget('nav_act1_vent_junction_to_act1_vent_collapsed', vid('G'),
         'You squeeze into the right tunnel. It branches almost at once into ducts that all look the same.',
         {'nomap': 'The right tunnel is darker. The air from it is stale and still.',
          'map': 'Your map shows the EAST ducts winding the long way round. Off to one side an X is gouged deep: something there, at the end of a branch.'})
O['nav_act1_vent_junction_to_act1_vent_gas_chamber']['name'] = 'West Duct'
O['nav_act1_vent_junction_to_act1_vent_collapsed']['name'] = 'East Duct'
retarget('nav_act1_vent_gas_to_act1_vent_junction', vid('F'), 'You retreat from the gas, back into the ducts. The air clears as you crawl.')
O['nav_act1_vent_gas_to_act1_vent_junction']['name'] = 'Back to the Ducts'
for it in O['nav_act1_vent_gas_to_act1_vent_junction']['interactions']:
    if it['verb'] == 'look': it['then'] = [msg('The duct back the way you came. The air is cleaner in that direction.')]
retarget('nav_act1_vent_collapsed_to_act1_vent_junction', vid('I'), 'You back out of the dead end and into the ducts again.')
O['nav_act1_vent_collapsed_to_act1_vent_junction']['name'] = 'Back to the Ducts'
for it in O['nav_act1_vent_collapsed_to_act1_vent_junction']['interactions']:
    if it['verb'] == 'look': it['then'] = [msg('The duct back the way you came.')]

# junction hints use compass words too
for h in V['act1_vent_junction']['hints']:
    if any(c.get('item') == 'ventilation_map' and c['type'] == 'has_item' for c in h['when']):
        h['text'] = "Your map says WEST (the left tunnel), then straight north. The skull scratched near the end means bad air: have the helmet."
    if not h['when']:
        h['text'] = 'Two ways into the ducts. Beyond this junction they all look alike. A map would help, and the air currents might give you a clue.'

# the map item: a real map you can look at
m = I['ventilation_map']
m['description'] = 'A scratched metal plate mapping the ventilation ducts, north at the top. Look at it to read it.'
m['examine'] = [{'verb': 'look', 'when': [], 'then': [
    {'type': 'show_closeup', 'image': 'closeups/vent_map.webp'},
    msg("A scratched map of the ducts, north at the top. From the junction, arrows run WEST, then straight NORTH past a skull, a fan, and a box: the way out. A loop of ducts hangs off to the west, a long way round winds through the east, a deep X marks the end of one eastern branch, and three gouged bars mark a dead end.")]}]

open(p, 'w').write(json.dumps(s, indent=2, ensure_ascii=False) + '\n')
print('views added', len(new_views), 'objects added', len(new_objs))
print({c: (frame(c), toward_gas(c)) for c in GENERIC})
