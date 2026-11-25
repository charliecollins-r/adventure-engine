"""The story half of the vent maze v6 build: painted rooms, people, the Audience, items, the map and events.

Imported by build_vent_maze_v6.py, which passes in its helpers. Every text here follows the "Vent Maze v6: The Colony"
doc. Room geometry (exits, floors, people's hotspots) was read off the paintings on the 960x720 grid.
"""
import copy, json

def S(o):
    return o


# ── room data: painting, name, floor, character spot, scale, exit boxes, air ────────────────────────────
WARREN_FLOORS = [
    # H1 the ledge (foreground lip), H2 the sinew bridge, H3 the dwellings' ledge, H4 the throat's ledge
    {'floor': [[120, 610], [300, 615], [520, 625], [760, 612], [860, 605], [860, 700], [120, 700]], 'scale': 0.32, 'speed': 3.0},
    {'floor': [[80, 448], [880, 448], [880, 486], [80, 486]], 'scale': 0.26, 'speed': 3.4,
     'shadows': [[[285, 440], [345, 440], [345, 492], [285, 492]], [[712, 440], [772, 440], [772, 492], [712, 492]]]},
    {'floor': [[100, 640], [300, 652], [640, 652], [870, 632], [870, 700], [100, 700]], 'scale': 0.3, 'speed': 3.0,
     'shadows': [[[200, 630], [290, 630], [290, 700], [200, 700]], [[560, 630], [650, 630], [650, 700], [560, 700]]]},
    {'floor': [[120, 640], [400, 660], [700, 652], [800, 630], [800, 690], [120, 690]], 'scale': 0.3, 'speed': 3.0,
     'shadows': [[[60, 640], [160, 640], [160, 700], [60, 700]]]},
]
WARREN_CHAR = [(170, 660), (140, 470), (840, 660), (170, 670)]
# exits per Warren screen: direction -> (box, label)
WARREN_EXITS = [
    {'S': ((10, 380, 100, 160), '↓ Back to the gas door'), 'E': ((880, 560, 80, 140), 'Along the ledge (east) →'), 'N': ((330, 540, 190, 70), '↑ Down into the city (north)')},
    {'W': ((0, 400, 60, 110), '← Back to the ledge (west)'), 'N': ((900, 400, 60, 110), 'Across the bridge (north) →')},
    {'S': ((0, 560, 80, 150), '↓ Back to the ledge (south)'), 'E': ((890, 540, 70, 160), 'Along the dwellings (east) →')},
    {'E': ((820, 230, 140, 420), 'Into the throat (east) →'), 'S': ((300, 690, 400, 30), '↓ Back to the bridge (south)'), 'W': ((0, 380, 100, 160), '← The dwellings (west)')},
]

ROOMS = {
    'vera': [dict(bg='maze_vera', name="Vera's Alcove", floor=True, char=(560, 650))],
    'chapel': [dict(bg='maze_chapel', name='The Chapel', floor=True, char=(560, 650), north=(430, 190, 110, 200)),
               dict(bg='maze_confessional', name='The Confessional', floor=False)],
    'hollow': [dict(bg='maze_archivist_1', name="The Archivist's Hollow", floor=True, char=(560, 650), north=(410, 230, 130, 230)),
               dict(bg='maze_archivist_2', name='The Archivist', floor=False)],
    'camp': [dict(bg='maze_camp', name="The Escapee's Camp", floor=True, char=(480, 650), north=(380, 130, 200, 290)),
             dict(bg='maze_last_hide', name='Her Last Hide', floor=False)],
    'nursery': [dict(bg='maze_nursery', name='The Egg Sacs', floor=True, char=(480, 650), north=(460, 170, 160, 260), scale=1.0),
                dict(bg='maze_court_2', name='The Brood Chamber', floor=[[100, 560], [520, 560], [520, 700], [100, 700]], char=(220, 640),
                     north=(440, 40, 140, 260), scale=0.5, speed=1.3),
                dict(bg='maze_court_3', name='The Queen', floor=[[150, 600], [800, 600], [800, 652], [150, 652]], char=(480, 640),
                     north=(380, 20, 200, 120), scale=0.25, speed=2.0)],
    'cache': [dict(bg='maze_cache', name='The Cache', floor=True, char=(560, 650), north=(380, 270, 200, 260)),
              dict(bg='maze_cache_vault', name="The Cache's Vault", floor=True, char=(480, 660))],
    'seam': [dict(bg='maze_seam', name='The Hull Seam', floor=True, char=(560, 650))],
    'grate': [dict(bg='maze_grate_office', name="Over the Curator's Office", floor=False)],
    'lever': [dict(bg='maze_z1_deadend', name='The Lever', floor=True, char=(480, 650))],
}
MUSIC_ROOM = {'nursery': 'audio/music_court.mp3'}


def room(c, name, idx, vid, links, exit_obj, msg, obj, it, ZR, zone, BOX_S, ROOM_FLOOR, LIGHTS, MUSIC, REFILL, G, SPR):
    z = zone(c)
    objs = []
    if name == 'warren':
        f = WARREN_FLOORS[idx]
        view = {'id': vid(c), 'name': 'The Warren', 'background_key': vid(c), 'background_file': f'backgrounds/maze/maze_warren_{idx + 1}.webp',
                'objects': [], 'enter_sound': 'crawl', 'music': 'audio/music_gut.mp3', 'map_xy': [c[0], 14 - c[1]],
                'character': {'x': WARREN_CHAR[idx][0], 'y': WARREN_CHAR[idx][1], 'facing': 'right', 'sprite_set': 'idle'},
                'walk_area': {k: v for k, v in f.items()}, 'on_enter': list(REFILL),
                'ambient_lighting': {'lights': [{'x': 0.5, 'y': 0.4, 'radius': 0.55, 'color': [90, 220, 160], 'pulse_speed': 0.11, 'pulse_amount': 0.3, 'alpha': 0.12}], 'flicker': False},
                'lighting_variants': [{'when': [{'type': 'flag_is', 'flag': 'vesk_allied', 'value': 'true'}],
                                       'lighting': {'lights': [{'x': 0.5, 'y': 0.4, 'radius': 0.6, 'color': [255, 180, 80], 'pulse_speed': 0.15, 'pulse_amount': 0.2, 'alpha': 0.16}], 'flicker': False}}],
                'hints': [{'text': 'You are a speck crossing a city that sees by moving air. On the in-breath the wind masks you: walk. When the air goes still, stand still, or stand in a shadow. Watch the Wardens\' lanes before you go.', 'when': []},
                          {'text': 'The colony knows you now. Walk where you like.', 'when': [{'type': 'flag_is', 'flag': 'vesk_allied', 'value': 'true'}]}]}
        for d, (box, label) in WARREN_EXITS[idx].items():
            o = exit_obj(c, d, box)
            o['visual']['label'] = label
            objs.append(o)
    else:
        spec = ROOMS[name][idx]
        view = {'id': vid(c), 'name': spec['name'], 'background_key': vid(c), 'background_file': f"backgrounds/maze/{spec['bg']}.webp",
                'objects': [], 'enter_sound': 'crawl', 'music': MUSIC_ROOM.get(name, MUSIC[z]), 'map_xy': [c[0], 14 - c[1]],
                'ambient_lighting': {'lights': copy.deepcopy(LIGHTS[z]), 'flicker': False}, 'hints': [{'text': ROOM_HINT.get(name, 'Look around.'), 'when': []}]}
        if spec.get('floor'):
            fl = ROOM_FLOOR if spec['floor'] is True else spec['floor']
            view['walk_area'] = {'floor': fl}
            if spec.get('scale'): view['walk_area']['scale'] = spec['scale']
            if spec.get('speed'): view['walk_area']['speed'] = spec['speed']
            view['character'] = {'x': spec['char'][0], 'y': spec['char'][1], 'facing': 'up', 'sprite_set': 'idle'}
        if c in {tuple(x) for r in G['air_rooms'] for x in G['rooms'][r]}:
            view['on_enter'] = list(REFILL)
        for d, n in links(c):
            box = BOX_S if d == 'S' else spec.get('north', (400, 200, 160, 260))
            o = exit_obj(c, d, box)
            objs.append(o)
    view['objects'] = [o['id'] for o in objs]
    return view, objs


ROOM_HINT = {
    'vera': 'Vera has lived down here for thirty years. TALK to her.',
    'chapel': 'Someone keeps candles burning here. Go deeper.',
    'hollow': 'The walls are covered in ears. Something down here remembers.',
    'camp': 'Someone lived here once. Look at what she left.',
    'nursery': 'The Queen\'s court. The royal guard wants the colony\'s greeting before it will let you deeper.',
    'cache': 'Choir trophies. Look for something you can use.',
    'seam': 'Cold air through a crack in the hull. Breathe.',
    'grate': 'Watch, and listen to what it hums.',
    'lever': 'A Choir maintenance lever. HAND it.',
}


def build(s, O, V, G, vid, links, exit_obj, msg, flag, is_, not_, over, obj, it, REFILL, SPR, CELLS, step, zone, K):
    nv, no = K['new_views'], K['new_objs']
    NV = {v['id']: v for v in nv}
    NO = {o['id']: o for o in no}
    def add(o, view_id):
        no.append(o); NO[o['id']] = o
        v = NV.get(view_id) or V.get(view_id)
        v['objects'].append(o['id'])
        return o
    def setv(view, at=None, **kw):
        e = {'type': 'set_view', 'view': view}
        if at: e['at'] = at
        e.update(kw)
        return e
    def ckpt(cid, text):
        return {'type': 'set_checkpoint', 'id': cid, 'text': text, 'no_undo': True}
    sounds = s['setting'].setdefault('sounds', {})
    for k, f in {'lung_in': 'audio/vents/lung_in.mp3', 'lung_out': 'audio/vents/lung_out.mp3', 'throat_gulp': 'audio/vents/throat_gulp.mp3',
                 'vent_scald': 'audio/vents/vent_scald.mp3', 'cough': 'audio/vents/cough.mp3', 'heartbeat': 'audio/vents/heartbeat.mp3',
                 'warden_click': 'audio/vents/warden_click.mp3', 'warden_click_far': 'audio/vents/warden_click_far.mp3',
                 'surge_roar': 'audio/vents/surge_roar.mp3', 'surge_far': 'audio/vents/surge_far.mp3', 'curator_hum': 'audio/vents/curator_hum.mp3',
                 'colony_knock': 'audio/vents/colony_knock.mp3', 'breath_long': 'audio/vents/breath_long.mp3', 'breath_short': 'audio/vents/breath_short.mp3',
                 'listen': 'audio/vents/listen.mp3', 'lever': 'audio/vents/lever.mp3', 'membrane_tear': 'audio/vents/membrane_tear.mp3',
                 'bellows_stop': 'audio/vents/bellows_stop.mp3', 'queen': 'audio/vents/queen.mp3'}.items():
        sounds[k] = f
    vc = lambda c: vid(tuple(c))
    J, EXIT, GAS, DOOR = K['JUNCTION'], K['EXIT'], K['GAS'], K['GAS_DOOR']
    N3, CORE_IN = K['BORDER_N3'], K['BORDER_CORE']
    warren = [tuple(x) for x in G['rooms']['warren']]
    court = [tuple(x) for x in G['rooms']['nursery']]

    # ── items ─────────────────────────────────────────────────────────────────────────────────────────
    mine = ('lung_sac', 'call_stone', 'hollowed_tag', 'queen_egg', 'claw_ring', 'mission_patch', 'choir_multitool')
    s['items'] = [i for i in s['items'] if i['id'] not in mine]
    s['items'] += [
        {'id': 'lung_sac', 'name': 'Lung-sac', 'description': 'A living air bladder from the Queen. It holds four breaths and refills at folds and air rooms.', 'icon_file': 'items/lung_sac.png',
         'examine': [{'verb': 'look', 'when': [], 'then': [msg('A plump, translucent sac, veined with amber and swollen with air, tied off with sinew. It holds four breaths. Squeeze it (the button up top) to breathe anywhere. Folds and air rooms refill it.')]},
                     {'verb': 'hand', 'when': [is_('in_thin_air')], 'then': [{'type': 'meter_transfer', 'meter': 'lungsac', 'to': 'breath'}, msg('You squeeze the lung-sac and breathe what it gives you.')]}]},
        {'id': 'call_stone', 'name': 'Call-stone', 'description': 'A hollow shell pierced with breathing holes. Tap it on a grate and the colony knocks on the walls far away.', 'icon_file': 'items/call_stone.png',
         'examine': [{'verb': 'look', 'when': [], 'then': [msg('A palm-sized oval of dark shell, hollow, pierced with a ring of holes like the Vesk\'s breathing slits. Tap it on a grate in the Core and the colony knocks on the walls far away, drawing the Curator off. Two taps, and they come back if you start the Core again.')]}]},
        {'id': 'hollowed_tag', 'name': 'Hollowed Tag', 'description': 'Your specimen tag, eaten hollow by the brood. The Choir have lost your trail.', 'icon_file': 'items/hollowed_tag.png',
         'examine': [{'verb': 'look', 'when': [], 'then': [msg('Your specimen tag, riddled with bore holes, its display dark. The countdown stopped when the brood ate the signal out of it. It still says what you were. It no longer says where you are.')]}]},
        {'id': 'queen_egg', 'name': "The Queen's Egg", 'description': 'One egg of the colony, in a cradle of sinew. A gift for someone she calls kin.', 'icon_file': 'items/queen_egg.png',
         'examine': [{'verb': 'look', 'when': [], 'then': [msg('A hen\'s-egg-sized sac of glowing amber, a tiny curled larva shadow inside, wrapped in woven sinew. It is warm. Now and then it breathes.')]}]},
        {'id': 'claw_ring', 'name': 'Claw Ring', 'description': 'A curved Keth-Vari claw bound into a ring with copper wire.', 'icon_file': 'items/claw_ring.png',
         'examine': [{'verb': 'look', 'when': [], 'then': [msg('One of the Keth-Vari\'s own claws, bent into a loop and bound with copper wire, tally marks scratched along it. It fits your finger. A promise, in a language you\'re still learning.')]}]},
        {'id': 'mission_patch', 'name': "Vera's Patch", 'description': "Vera Halloran's mission patch, torn from her flight suit. Her name, to take home.", 'icon_file': 'items/mission_patch.png',
         'examine': [{'verb': 'look', 'when': [], 'then': [msg('A round patch, faded orange around a stitched rocket and a ring of stars, torn from a flight suit thirty years old. On the back, in marker: V. HALLORAN, LIFE SUPPORT. Take her name home.')]}]},
        {'id': 'choir_multitool', 'name': 'Choir Multitool', 'description': 'A Choir maintenance tool, long and strong. It would jam almost anything.', 'icon': 'tool',
         'examine': [{'verb': 'look', 'when': [], 'then': [msg('A Choir maintenance tool from the Cache: a long, bone-handled rod that ends in a dozen folding prongs. Too big for a Choir to lose and too small for a Choir to miss. Long and strong enough to jam a fan.')]}]},
    ]

    # ── player actions: listen, squeeze the lung-sac ─────────────────────────────────────────────────
    folds_air = [vid(tuple(c)) for c in G['folds']] + [vid(tuple(c)) for r in G['air_rooms'] for c in G['rooms'][r]]
    s['setting']['actions'] = [
        {'id': 'listen', 'label': 'Listen', 'title': 'Hold your breath and listen (costs a breath; you make no sound this move)',
         'when': [is_('in_thin_air')],
         'effects': [{'type': 'meter_add', 'meter': 'breath', 'amount': -1}, flag('held_breath'), {'type': 'play_sound', 'sound': 'listen'},
                     {'type': 'sense', 'radius': 2, 'bonus': {'when': [is_('vesk_allied')], 'radius': 3},
                      'text': 'You hold your breath and listen. Only the ship breathing. Nothing near.',
                      'kinds': [{'label': 'Cold air', 'views': folds_air},
                                {'label': 'A duct breathing', 'views': [vid(tuple(c)) for c in G['breathing']]},
                                {'label': 'A scorched hiss (a purge duct opens off that screen)', 'views': sorted({vid(c) for c in CELLS if tuple(c) not in {tuple(p) for p in G['purge']} for d, n in links(c) if tuple(n) in {tuple(p) for p in G['purge']}})},
                                {'label': 'Dry clicking (a Warden)', 'patrol': 'v6_warden_w1'},
                                {'label': 'Dry clicking (a Warden)', 'patrol': 'v6_warden_w2'},
                                {'label': 'Cold light through a grate', 'views': [vid(tuple(c)) for c in G['grates']]}]}]},
        {'id': 'squeeze', 'label': 'Squeeze sac', 'title': 'Breathe from the lung-sac',
         'when': [is_('in_thin_air'), {'type': 'has_item', 'item': 'lung_sac'}, {'type': 'meter_above', 'meter': 'lungsac', 'threshold': 0}],
         'effects': [{'type': 'meter_transfer', 'meter': 'lungsac', 'to': 'breath'}, msg('You squeeze the lung-sac and breathe.')]},
    ]

    # ── 1. into the vent: the Choir eye, the Keth-Vari's path, the Outer Ducts checkpoint ────────────
    keth_ally = {'type': 'any_of', 'conditions': [is_('promised_freedom'), is_('prisoner_fed')]}
    keth_enemy = {'type': 'all_of', 'conditions': [not_('promised_freedom'), not_('prisoner_fed'),
                                                    {'type': 'any_of', 'conditions': [is_('prisoner_bond', 'pragmatic'), is_('prisoner_bond', 'silent')]}]}
    entry = O['nav_act1_vent_entry_to_act1_vent_junction']
    for x in entry['interactions']:
        if x['verb'] == 'move':
            x['then'] = [e for e in x['then'] if e.get('type') in ('set_view', 'message')] + [
                flag('in_vents'),
                {'type': 'conditional_effect', 'when': [keth_ally], 'then': [flag('keth_path', 'ally')],
                 'else': [{'type': 'conditional_effect', 'when': [keth_enemy], 'then': [flag('keth_path', 'enemy')], 'else': [flag('keth_path', 'none')]}]},
                ckpt('outer', 'the vent junction')]
    V['act1_vent_junction']['map_xy'] = [J[0], 14 - J[1]]
    V['act1_vent_junction']['objects'] = [o for o in V['act1_vent_junction']['objects'] if o != 'junction_keth_vari']
    # the v3 Keth-Vari wave at the junction is replaced by the Warren's Keth-Vari
    s['objects'] = [o for o in s['objects'] if o['id'] != 'junction_keth_vari']
    s['events'] = [e for e in s['events'] if 'junction_keth' not in json.dumps(e)]
    for oid, d in (('nav_act1_vent_junction_to_act1_vent_gas_chamber', 'W'), ('nav_act1_vent_junction_to_act1_vent_collapsed', 'E')):
        n = step(J, d)
        for x in O[oid]['interactions']:
            for e in x.get('then', []):
                if e.get('type') == 'set_view': e['view'] = vid(n); e.pop('at', None)
        O[oid]['name'] = 'West Duct' if d == 'W' else 'East Duct'
    for h in V['act1_vent_junction'].get('hints', []):
        if not h.get('when'):
            h['text'] = 'The Gut\'s door is far to the west, behind a Choir quarantine seal; the seal\'s lever is somewhere far to the east. Your map is north-up: count your turns.'
    # the Choir eye at the grate, once, when you drop in during the alarm
    s['events'].append({'id': 'v6_choir_eye', 'one_shot': True,
                        'trigger': {'type': 'all_of', 'conditions': [{'type': 'view_is', 'view': 'act1_ventilation_shaft'}, is_('alarm_hunters_out')]},
                        'effects': [{'type': 'show_closeup', 'image': 'closeups/maze_choir_eye.webp'}, {'type': 'play_sound', 'sound': 'curator'},
                                    msg('Above you the grate goes dark. An eye fills it, vast and wet, and a finger too thick to fit scrapes the bars, once, then withdraws. '
                                        'Through the metal, a voice like a chord: "Let the walls have it." The clicking upstairs stops. They have given you to the vents.')]})

    # ── 2. the Outer Ducts: the lever, the Gas Chamber and its door ─────────────────────────────────
    lever_c = tuple(G['rooms']['lever'][0])
    add(obj('v6_lever', 'Quarantine Lever', 'A heavy Choir lever on a corroded bronze plate.', (443, 210, 74, 264),
            [it('look', [msg('A heavy maintenance lever on a riveted bronze plate, its warning light a dull red. Stencilled beside it in Choir glyphs, and in a scratched human hand underneath: "GAS DOOR - WEST".')], when=[not_('lever_pulled')]),
             it('look', [msg('The lever is down and its light glows amber. Far to the west, the quarantine seal on the Gas Chamber door is open.')]),
             it('hand', [msg('You hang your whole weight on the lever. It grinds down, the light turns amber, and far away to the west something heavy unlocks with a boom that runs through every duct.'),
                         flag('lever_pulled'), {'type': 'play_sound', 'sound': 'lever'}, {'type': 'add_score', 'points': 2, 'id': 'v6_lever'}], when=[not_('lever_pulled')]),
             it('hand', [msg('It\'s down. The seal is open.')])],
            sprite=SPR['lever']([{'when': [is_('lever_pulled')], 'frame': 1}, {'when': [], 'frame': 0}]), walk_to={'x': 480, 'y': 650}),
        vid(lever_c))
    # the Gas Chamber (existing room): new painting with the dead Vesk, exits re-wired, the scout
    gv = V['act1_vent_gas_chamber']
    gv['background_file'] = 'backgrounds/maze/maze_gas_chamber.webp'
    gv['map_xy'] = [GAS[0], 14 - GAS[1]]
    for oid, d in (('nav_act1_vent_gas_to_act1_vent_fan_room', 'W'), ('nav_act1_vent_gas_to_act1_vent_junction', 'E')):
        n = step(GAS, d)
        for x in O[oid]['interactions']:
            for e in x.get('then', []):
                if e.get('type') == 'set_view': e['view'] = vid(n); e.pop('at', None)
                if e.get('type') == 'message' and x['verb'] == 'move' and d == 'W' and 'helmet' in e.get('text', '').lower():
                    e['text'] = "The helmet's visor seals as you push on through the gas, past the curled bodies, toward the door at the far end."
        O[oid]['name'] = 'Deeper into the gas (west)' if d == 'W' else 'Back to the ducts (east)'
    add(obj('v6_dead_vesk', 'Dead Vesk', 'Pale many-legged bodies curled on the floor.', (180, 600, 380, 110),
            [it('look', [msg('Three pale, many-legged things lie curled where the gas caught them, larger the closer they got to the door, skin greyed and blotched. They were trying to get out. Or trying to get something in.')]),
             it('hand', [msg('Through the glove the body is soft and cold. Whatever made this gas made it for them.')]),
             it('talk', [msg('Nothing answers. Something, a long way off behind the walls, breathes in.')])]), 'act1_vent_gas_chamber')
    # the scout watches from the edge of the gas (the duct east of the Gas Chamber)
    east = vid(step(GAS, 'E'))
    add(obj('v6_scout', 'Pale shape', 'Something pale, crouched in a side duct.', (700, 400, 150, 120),
            [it('look', [msg('Something pale and many-legged crouches at the edge of the haze, eyeless head raised toward you, slits fluttering. It won\'t go into the gas. When you look again it\'s gone.'), {'type': 'hide_object', 'object': 'v6_scout'}]),
             it('hand', [msg('It flinches back before you\'re anywhere near, and is gone down the duct.'), {'type': 'hide_object', 'object': 'v6_scout'}]),
             it('talk', [msg('Its breathing slits flutter at you: long, short, long. Then it flees.'), {'type': 'hide_object', 'object': 'v6_scout'}])],
            sprite=SPR['scout'](0), layer='sorted'), east)
    # the gas door: the N exit into the Warren is the quarantine seal, then the colony's membrane
    dv = NV[vid(DOOR)]
    dv['name'] = 'The Gas Chamber Door'
    dv['ambient_lighting']['lights'].append({'x': 0.5, 'y': 0.5, 'radius': 0.7, 'color': [170, 220, 60], 'pulse_speed': 0.2, 'pulse_amount': 0.2, 'alpha': 0.22})
    gate = NO[f'nav_v6_{DOOR[0]}_{DOOR[1]}_north']
    gate['name'] = 'The quarantine seal'
    gate['visual']['label'] = '↑ The seal'
    gate['interactions'] = [
        it('look', [msg('A Choir quarantine seal, a door of riveted bronze set into the duct. Beyond it, through a crack, something pale and wet is stretched across the opening, breathing.')], when=[not_('lever_pulled')]),
        it('look', [msg('The seal stands open. Across the opening beyond it the colony has grown a membrane, taut and wet, to keep the gas out. It breathes.')]),
        it('move', [msg('The seal won\'t move. A Choir lock: the release must be somewhere else in the ducts, probably far from here.')], when=[not_('lever_pulled')]),
        it('move', [setv(vid(warren[0]), at={'x': 160, 'y': 660, 'facing': 'right'}),
                    msg('You push into the membrane. It clings, stretches, and seals around you, and then it peels the helmet off your head like skin off fruit and spits you out the other side. '
                        'You come out small, on a ledge, under a sky made of breathing ribs. Below you is a city.'),
                    {'type': 'play_sound', 'sound': 'membrane_tear'}, {'type': 'set_character', 'sprite_set': 'idle'}, flag('helmet_torn'), flag('in_thin_air'),
                    {'type': 'meter_set', 'meter': 'breath', 'value': 'max'}, ckpt('gut', 'the Warren ledge')]),
        it('hand', [msg('Cold bronze, sweating gas.')]),
    ]
    # the Warren's way back out is one way
    h1 = NV[vid(warren[0])]
    back = NO[f'nav_v6_{warren[0][0]}_{warren[0][1]}_south']
    back['interactions'] = [it('look', [msg('The duct you came out of. The membrane has already closed over it, thick and wet. It won\'t let you back through: the gas is on the other side.')]),
                            it('move', [msg('The membrane has sealed behind you. There is no going back through the gas now.')]),
                            it('hand', [msg('Warm, and it pushes back.')])]
    # the scout again, waiting on the far side of the gas
    add(obj('v6_scout_warren', 'The scout', 'The pale scout from the Outer Ducts.', (220, 560, 60, 50),
            [it('look', [msg('The pale scout from the Outer Ducts, waiting on the far side of the gas it couldn\'t cross. It watched you walk through the Choir\'s gas. Now it watches you breathe. Then it scuttles off down into the city to tell someone.'), {'type': 'hide_object', 'object': 'v6_scout_warren'}]),
             it('talk', [msg('"I came through your gas. You\'re welcome." It flees.'), {'type': 'hide_object', 'object': 'v6_scout_warren'}])],
            sprite=dict(SPR['scout'](0), scale=0.09)), vid(warren[0]))

    # ── 3. the Warren: sensing Wardens, the wind, the Keth-Vari ─────────────────────────────────────
    lanes = {1: ([[880, 470], [100, 470], [880, 470]], 24, 150), 2: ([[100, 668], [880, 650], [100, 668]], 28, 140), 3: ([[760, 650], [640, 655], [760, 650]], 10, 125)}
    for idx, (path, period, radius) in lanes.items():
        s['patrols'].append({'id': f'v6_warren_warden_{idx}', 'name': 'A Warden', 'when': [is_('in_thin_air'), not_('vesk_allied')], 'period': period, 'first_at': 0,
                             'warn_seconds': 0, 'notice_seconds': 0.5, 'enter_sound': '',
                             'sprite': dict(SPR['warden'], scale=0.34), 'shadow': {'width': 30, 'height': 5, 'opacity': 0.4},
                             'stops': [{'views': [vid(warren[idx])], 'enter': 0, 'leave': period, 'path': path,
                                        'sense': {'radius': radius, 'only_while_moving': True, 'masked_when': [{'type': 'cycle_is', 'cycle': 'v6_lung', 'phase': 'in'}]}}],
                             'on_caught': [{'type': 'play_sound', 'sound': 'warden_click'}, msg('It turns. A click, then the whole city answers.'),
                                           over('Seen', "The Vesk see by moving air. On the lung's in-breath the wind masks you; when the air goes still, anything that moves within reach of a Warden is felt. "
                                                "Walk with the wind, freeze in the still, and use the shadows of the pillars and alcoves. You start again from the ledge.")]})
    # the Keth-Vari in the dwellings (ally), or seen once on a far perch (indifferent); the enemy has left false marks
    add(obj('v6_keth', 'The Keth-Vari', 'The four-armed prisoner from upstairs, perched on a rib.', (800, 470, 90, 80),
            [it('look', [msg('The Keth-Vari, perched on a rib among the honeycomb homes, as at ease here as anywhere. It knows these people. "Wall-mothers," it says, and makes a breathing sound that might be a laugh.')]),
             it('talk', [msg('"You came down after all." Four hands take your map and scratch the torn half onto it: the ducts, the folds, a curl for the court where the wall-mother sits. '
                             '"She wants three things of you. To speak her way. To give up what the Choir put on you. And a promise." It taps the tag on your wrist. "That, first."'),
                         flag('keth_marks'), {'type': 'add_score', 'points': 2, 'id': 'v6_keth_marks'}]),
             it('hand', [msg('It clasps your hand in two of its four. "Go on. They\'re watching you."')])],
            visible=True, walk_to={'x': 820, 'y': 660}), vid(warren[2]))
    s['events'].append({'id': 'v6_keth_show', 'one_shot': False, 'trigger': {'type': 'view_is', 'view': vid(warren[2])},
                        'effects': [{'type': 'conditional_effect', 'when': [is_('keth_path', 'ally')], 'then': [{'type': 'show_object', 'object': 'v6_keth'}],
                                     'else': [{'type': 'hide_object', 'object': 'v6_keth'}]}]})
    s['events'].append({'id': 'v6_keth_false', 'one_shot': True,
                        'trigger': {'type': 'all_of', 'conditions': [{'type': 'view_is', 'view': vid(warren[0])}, is_('keth_path', 'enemy')]},
                        'effects': [flag('keth_false_marks'), msg('Scratched into the ledge, fresh: a map of the torn half of the Gut, in four-fingered strokes. Someone wants you to have it. The Keth-Vari did not forgive you.')]})
    # workers coming and going in the dwellings
    add(obj('v6_workers', 'Vesk workers', 'Cat-sized pale workers, coming and going.', (420, 610, 60, 40),
            [it('look', [msg('Workers, each the size of a cat, carry food and egg crust along the ledge, breathing at each other as they pass. A city: homes, and the people who live in them.')]),
             it('talk', [msg('They freeze at your voice, slits wide, then hurry on.')])],
            sprite=dict(SPR['worker'], scale=0.09)), vid(warren[2]))

    # ── 4. the people of the Gut ────────────────────────────────────────────────────────────────────
    greet = flag('vesk_greeting_known')
    vera = vid(tuple(G['rooms']['vera'][0]))
    add(obj('v6_vera', 'Vera Halloran', 'A woman grown into the wall, breathing slits in the flesh around her.', (330, 130, 300, 300),
            [it('look', [msg('A woman, or what the colony kept of one: grey hair spread into the flesh of the wall, Vesk breathing slits opening and closing around her face. Her eyes follow you. Her name is stitched on what\'s left of an old flight suit: HALLORAN.')]),
             it('talk', [{'type': 'show_dialogue', 'prompt': '"Thirty years," she says. Her voice is thin; her lungs clean the air the colony shares. "The Choir threw me down here to die. The Vesk found me and grew me into the wall so I\'d live. They don\'t have to be kind. They chose to be."',
                          'choices': [
                              {'label': '"How do I talk to them?"', 'then': [greet, msg('"In breath. Long, short, long: that\'s their greeting. It means I come to listen. Breathe it at the royal guard and it will let you pass." She does it for you: a long exhale, a short one, a long one.')]},
                              {'label': '"How do the Wardens hunt?"', 'then': [msg('"By moving air. They sweep the same loops on a rhythm and you\'ll hear them clicking a few seconds before they come. Get into a cold fold and hold still. In the Warren, move with the wind."')]},
                              {'label': '"What do they want?"', 'then': [msg('"To stop being burned. The Choir fire the Purge Core and scald the ducts nearest the border, and they gassed the door besides. The young die first. They need someone small enough for their world who can still turn a Choir valve. Someone like you."')]},
                              {'label': '"Can I do anything for you?"', 'when': [{'type': 'flag_not', 'flag': 'vera_fate', 'value': 'name'}, {'type': 'flag_not', 'flag': 'vera_fate', 'value': 'mercy'}],
                               'then': [{'type': 'show_dialogue', 'prompt': '"Two things I could ask. Take my name home. Or..." She looks at the slits breathing for her. "Or let me stop."',
                                         'choices': [{'label': 'Take her name home', 'then': [{'type': 'add_item', 'item': 'mission_patch'}, {'type': 'set_flag', 'flag': 'vera_fate', 'value': 'name'},
                                                                                              {'type': 'add_score', 'points': 3, 'id': 'v6_vera'}, msg('She works the patch loose from her suit with fingers that barely move and presses it into your hand. "Halloran. Life support. Tell them I kept the air clean to the end."')]},
                                                     {'label': 'Mercy', 'then': [{'type': 'set_flag', 'flag': 'vera_fate', 'value': 'mercy'}, {'type': 'add_score', 'points': 3, 'id': 'v6_vera'},
                                                                                 msg('You hold her hand while the slits around her slow, and slow, and stop. Somewhere below, the Warren\'s lights dim, and the whole colony breathes out at once.')]},
                                                     {'label': 'Not yet', 'then': [msg('"Not yet, then." She almost smiles.')]}]}]}]}]),
             it('hand', [msg('Her hand is cool and dry. She squeezes back, faintly.')])], walk_to={'x': 480, 'y': 640}), vera)
    chapel, conf = vid(tuple(G['rooms']['chapel'][0])), vid(tuple(G['rooms']['chapel'][1]))
    add(obj('v6_candles', 'Candles', 'Candles of rendered fat, burning in the ribs.', (130, 320, 140, 120),
            [it('look', [msg('Candles of rendered fat in the rib-niches, kept burning by someone. Scratched into the bone in Choir glyphs, over and over, the same word. You can\'t read it. It looks like an apology.')])]), chapel)
    add(obj('v6_penitent', 'The Penitent', 'A Choir face grafted into the wall.', (380, 240, 200, 260),
            [it('look', [msg('A Choir face, grey and gaunt, grafted into the wall among the bones and candles. Its eyes open. It is the size of the Curator\'s, and it is weeping.')]),
             it('talk', [{'type': 'show_dialogue', 'prompt': '"Small one." Its voice is a chord with a crack in it. "I refused to fire a purge, so they grafted me here to hear it every time. The Vesk keep me alive. I am the only Choir that ever spared them."',
                          'choices': [
                              {'label': '"What is the purge?"', 'then': [flag('purge_explained'), msg('"The Purge Core is a furnace. Every few minutes it overflows the border and a hot wind rolls along the north ducts. Hide in a fold when you hear it roar. The Purge Heart drives it: the great fan at the far end of the Core. It blows the gas, too. Jam it, and both stop."')]},
                              {'label': '"How do I jam the Heart?"', 'then': [msg('"Something long and strong in its drive, where the muscle meets the axle. Your probe. Or a Choir multitool; the Collector keeps one in the Cache, in the Core\'s east. Be quick: the Curator will know where you are going before you get there."')]},
                              {'label': '"Is there a shorter way to the court?"', 'then': [flag('valve_known'), msg('"The Heart Valve, near the middle of the Gut. It opens for stasis fluid. Or for a song." It hums, low, a long chord. "Go to the valve. I will sing it open for you." '), flag('valve_open')]},
                              {'label': '"Do you want anything?"', 'then': [flag('penitent_message'), msg('"Tell the Curator, if you live to: the Penitent still sings."')]}]}]),
             it('hand', [msg('Its skin is cold and smooth. The eyes close, as if the touch is more than it can bear.')])]), conf)
    hollow, arch = vid(tuple(G['rooms']['hollow'][0])), vid(tuple(G['rooms']['hollow'][1]))
    add(obj('v6_ears', 'Walls of ears', 'Thousands of small grown ears.', (100, 150, 220, 380),
            [it('look', [msg('The walls are grown all over with small, soft ears, thousands of them, every one turned toward the dark at the end of the hollow. Listening.')])]), hollow)
    add(obj('v6_archivist', 'The Archivist', 'An old, blind grub that remembers by sound.', (300, 120, 380, 380),
            [it('look', [msg('A vast old grub, pale and blind, half-sunk in a pool, ears all over the walls around it. The colony\'s living memory. It remembers everything it has ever heard.')]),
             it('talk', [{'type': 'show_dialogue', 'prompt': 'The Archivist turns its blind head toward you. Its whole body is a throat. What do you ask it to play?',
                          'choices': [
                              {'label': 'The homeworld', 'then': [msg('Rain. A warm wet world breathing. Then a sound like the sky tearing, a roar that goes on and on, the siphon beams, and under them the soil coming loose with the larvae in it, riding up into the dark. The Choir ate their planet. The Vesk survived inside the thing that ate it.')]},
                              {'label': 'The greeting', 'then': [greet, msg('It breathes for you: long, short, long. "I come to listen." It breathes it again, slower, until you have it.')]},
                              {'label': 'The woman before you', 'then': [msg('A woman\'s voice, hoarse: "She won\'t take me. She says the Choir\'s mark is still on me. I can\'t. It\'s the last thing that says where I came from." Then crying, and the sound of someone walking away down a duct.')]},
                              {'label': 'Anything else', 'then': [msg('A burst of static, then, crisp and impossible: "Outrider, this is Mission Control, do you read?" The Archivist stole it from someone who steals voices. Remember that it was stolen.')]}]}]),
             it('hand', [msg('Soft, warm, and the whole body hums under your palm like a held note.')])]), arch)
    camp, hide = vid(tuple(G['rooms']['camp'][0])), vid(tuple(G['rooms']['camp'][1]))
    add(obj('v6_camp_map', 'Map scrap', 'A scrap of map, pinned up by the lantern.', (820, 420, 120, 140),
            [it('look', [msg('A torn scrap of map pinned to the wall by the lantern: the torn half of the Gut, drawn in a careful human hand. Folds marked with circles. A curl in the north for the court.')]),
             it('hand', [msg('You copy her scrap onto your map, line for line. The torn half isn\'t blank any more.'), flag('camp_map_piece'), {'type': 'add_score', 'points': 2, 'id': 'v6_camp_map'}])]), camp)
    add(obj('v6_camp_things', 'Her things', 'A rolled blanket, a book, a lantern.', (220, 440, 200, 100),
            [it('look', [msg('A rolled thermal blanket, a book with its cover gone, a lantern still burning on rendered fat. Someone lived here for a long time, and meant to come back.')])]), camp)
    add(obj('v6_escapee', 'The escapee', 'A woman in an orange flight suit, curled on the floor.', (450, 450, 350, 220),
            [it('look', [msg('A woman in a burned orange flight suit, curled on her side, her face to the wall. Burned down one side, the way the Purge Core burns. She tried the Core alone, came back, and lay down here.')]),
             it('hand', [msg('You close her eyes. Her specimen tag is still on her wrist, counting down nothing.')])]), hide)
    add(obj('v6_journal', 'Journal', 'A journal by her hand.', (410, 600, 140, 90),
            [it('look', [greet, msg('Her journal. "Their greeting: long, short, long, the way they say I come to listen. The Queen turned me away because the Choir\'s mark was still on me. I couldn\'t bear to lose it. It was the last thing that said where I came from. I\'ll try the Core alone. God help me." The last pages are blank.')]),
             it('hand', [greet, msg('You read it through. The greeting: long, short, long. And the Queen turned her away because of the tag.')])]), hide)
    # the valve: from its west and east sides
    vw, ve = K['VALVE_W'], K['VALVE_E']
    nv.append({'id': 'act1_v6_valve', 'name': 'The Heart Valve', 'background_key': 'act1_v6_valve', 'background_file': 'backgrounds/maze/maze_valve_closed.webp',
               'objects': [], 'enter_sound': 'crawl', 'music': 'audio/music_gut.mp3', 'walk_area': {'floor': [[336, 600], [336, 688], [624, 688], [624, 600]]},
               'character': {'x': 480, 'y': 660, 'facing': 'up', 'sprite_set': 'idle'}, 'hints': [{'text': 'The valve opens for stasis fluid, or for the Penitent\'s song.', 'when': []}]})
    NV['act1_v6_valve'] = nv[-1]
    nv.append({'id': 'act1_v6_valve_open', 'name': 'The Heart Valve', 'background_key': 'act1_v6_valve_open', 'background_file': 'backgrounds/maze/maze_valve_open.webp',
               'objects': [], 'enter_sound': 'crawl', 'music': 'audio/music_gut.mp3', 'walk_area': {'floor': [[336, 600], [336, 688], [624, 688], [624, 600]]},
               'character': {'x': 480, 'y': 660, 'facing': 'up', 'sprite_set': 'idle'}, 'hints': [{'text': 'The valve is open: straight through to the court\'s side of the Gut.', 'when': []}]})
    NV['act1_v6_valve_open'] = nv[-1]
    to_valve = lambda: {'type': 'conditional_effect', 'when': [is_('valve_open')], 'then': [setv('act1_v6_valve_open')], 'else': [setv('act1_v6_valve')]}
    add(obj('v6_valve_door_w', 'A fleshy valve', 'A ring of cartilage in the right wall.', (700, 230, 180, 300),
            [it('look', [msg('In the right-hand wall, a ring of cartilage around three closed leaflets of muscle: a heart valve, big enough to crawl through if it opened.')]),
             it('move', [to_valve()])], label='The valve →', nav=True), vid(vw))
    add(obj('v6_valve_door_e', 'A fleshy valve', 'A ring of cartilage in the left wall.', (90, 230, 180, 300),
            [it('look', [msg('In the left-hand wall, the back of the Heart Valve.')]), it('move', [to_valve()])], label='← The valve', nav=True), vid(ve))
    for v_id in ('act1_v6_valve', 'act1_v6_valve_open'):
        add(obj(f'v6_valve_back_{v_id[-4:]}', 'Back', 'The way you came.', (150, 660, 300, 60),
                [it('move', [setv(vid(vw))])], label='↓ Back (west side)', nav=True), v_id)
    add(obj('v6_valve', 'The Heart Valve', 'Three leaflets of muscle in a ring of cartilage.', (320, 130, 300, 380),
            [it('look', [msg('The Heart Valve: three leaflets of pink muscle pressed shut in a ring of cartilage, veins pulsing. It opens for the right thing. The Penitent said stasis fluid, or a song.')]),
             it('use_item', [{'type': 'remove_item', 'item': 'stasis_fluid_vial'}, flag('valve_open'), setv('act1_v6_valve_open'),
                             msg('You pour the stasis fluid over the leaflets. They shiver, slacken, and fold open, and stay open.')], item='stasis_fluid_vial'),
             it('hand', [msg('The leaflets are clenched tight. Pushing does nothing.')]),
             it('talk', [msg('You hum at it. It doesn\'t care for your singing.')])]), 'act1_v6_valve')
    add(obj('v6_valve_through', 'Through the valve', 'The open valve.', (320, 130, 300, 380),
            [it('look', [msg('The leaflets hang open. Beyond, the Gut\'s other half.')]), it('move', [setv(vid(ve)), msg('You crawl through the open valve.')])],
            label='↑ Through', nav=True), 'act1_v6_valve_open')
    add(obj('v6_valve_back_e', 'Back (east side)', 'Back to the east side.', (500, 660, 300, 60),
            [it('move', [setv(vid(ve))])], label='↓ East side', nav=True), 'act1_v6_valve_open')

    # ── 5. the Audience ─────────────────────────────────────────────────────────────────────────────
    eggs, brood, queen = (vid(c) for c in court)
    add(obj('v6_sacs', 'Egg sacs', 'Glowing amber egg sacs.', (40, 130, 260, 420),
            [it('look', [msg('Egg sacs, hundreds, glowing amber in the walls, each with a curled shadow inside. The ones nearest the north wall are blackened. Burned.')]),
             it('hand', [msg('Warm. Something inside turns toward your hand.')])]), eggs)
    add(obj('v6_guard', 'The royal guard', 'A Warden twice the size of the others, coiled around the brood.', (320, 320, 320, 140),
            [it('look', [msg('A Warden twice the size of any you\'ve seen, coiled around a woven basket of young as tall as you are now. Its head tracks your breathing. Nobody passes it without the colony\'s greeting.')]),
             it('talk', [{'type': 'show_dialogue', 'prompt': 'The guard\'s head lowers toward you, slits wide. It is waiting for something.',
                          'choices': [{'label': 'Breathe long, short, long', 'when': [is_('vesk_greeting_known')],
                                       'then': [flag('guard_greeted'), {'type': 'play_sound', 'sound': 'breath_long'}, msg('Long. Short. Long. I come to listen. The guard holds still, then lowers its head to the floor and uncoils from the way north.'), {'type': 'add_score', 'points': 2, 'id': 'v6_guard'}]},
                                      {'label': 'Say hello', 'then': [msg('Your voice means nothing to it. It hisses, and the young in the basket hiss with it. You need their greeting: someone in the Gut must know it.')]},
                                      {'label': 'Back away', 'then': [msg('You back away slowly. It watches you all the way.')]}]}], when=[not_('guard_greeted')]),
             it('talk', [msg('It lowers its head as you pass.')]),
             it('hand', [msg('You reach toward it. It rises, and keeps rising. You put your hand down.')])]), brood)
    north_brood = NO[f"nav_v6_{court[1][0]}_{court[1][1]}_north"]
    north_brood['interactions'] = [it('look', [msg('The way deeper, north, to the Queen.')]),
                                   it('move', [msg('The guard\'s coils close across the way. Not without the greeting.')], when=[not_('guard_greeted')]),
                                   it('move', [setv(queen), msg('You go down into the Queen\'s chamber. You feel very small.')])]
    s['puzzle_widgets'].append({'id': 'v6_queen_audience', 'widget_type': 'rhythm', 'presentation': 'overlay',
                                'config': {'title': 'She Who Breathes For Us', 'prompt': 'She breathes a phrase. Answer it: hold for a long breath, tap for a short one (mouse or Space), in time.',
                                           'phrases': ['LSL', 'SLSS', 'LSSLS'], 'extra_phrases': [{'when': [is_('keth_path', 'enemy')], 'pattern': 'LLSSLS'}],
                                           'beat_ms': 650, 'long_ms': 300, 'max_errors': 3, 'slow_after': 3, 'slow_factor': 1.5,
                                           'hint_when': [is_('keth_path', 'ally')], 'long_sound': 'breath_long', 'short_sound': 'breath_short'},
                                'on_solve': [flag('queen_spoken'), {'type': 'add_score', 'points': 5, 'id': 'v6_queen_spoken'},
                                             msg('She is quiet. She heard you. Then the brood around her rustle, and the air fills with the smell of you, and under it, something that isn\'t you. Something Choir.')],
                                'on_fail': [setv(brood), msg('The brood hiss and the guard shoulders you back up into the brood chamber. Nothing is lost. Go down and try again.')]})
    mark = {'type': 'show_dialogue', 'prompt': 'She smells the Choir on you: the tag they clipped to you upstairs, still counting down. "What are you to them?" breathes through the whole chamber.',
            'choices': [
                {'label': '"Let them take it." (offer your wrist)', 'when': [{'type': 'has_item', 'item': 'specimen_tag'}],
                 'then': [{'type': 'transform_item', 'item': 'specimen_tag', 'into': 'hollowed_tag'}, flag('tag_hollowed'), {'type': 'add_score', 'points': 3, 'id': 'v6_tag'},
                          msg('The brood swarm up your arm, a hundred tiny mouths, and eat the signal out of the tag. The countdown stops. The Choir have lost your trail. It is what the Choir did to her people too, and she knows it.')]},
                {'label': '"Let them take it." (show her where it was)', 'when': [{'type': 'not_has_item', 'item': 'specimen_tag'}],
                 'then': [flag('tag_hollowed'), {'type': 'add_score', 'points': 3, 'id': 'v6_tag'}, msg('The brood swarm up your arm and strip the last of the Choir\'s scent from your skin where the tag was clipped. The smell of Choir goes out of the chamber.')]},
                {'label': '"It\'s nothing. Ignore it."', 'then': [msg('She knows a lie by your breath. The brood hiss. She asks again.')]},
                {'label': 'Attack her', 'then': [msg('You go for her. She is a queen in her own court.'), over('Unwise', 'Attacking the Queen in her own court, surrounded by her brood and her guard, was the one wrong answer the Audience has. Every other wrong turn sends you back a step.')]}]}
    vow = {'type': 'show_dialogue', 'prompt': '"They choke us from below and burn us from above, and both come from the Choir\'s heart. Will you stop it?"',
           'choices': [
               {'label': 'Swear it', 'then': [flag('vesk_allied'), flag('vesk_vow', 'swore'), {'type': 'add_item', 'item': 'lung_sac'}, {'type': 'add_item', 'item': 'call_stone'},
                                               {'type': 'add_item', 'item': 'queen_egg'}, {'type': 'meter_set', 'meter': 'lungsac', 'value': 'max'}, {'type': 'meter_set', 'meter': 'callstone', 'value': 'max'},
                                               {'type': 'add_score', 'points': 5, 'id': 'v6_vow'}, {'type': 'play_sound', 'sound': 'queen'},
                                               msg('You swear it. The whole chamber breathes out, warm. She gives you a lung-sac to carry air where there is none, a call-stone to make her people knock on the walls, and one of her eggs, "for wherever you go". The wall behind her, the border into the Purge Core, unclenches.')]},
               {'label': 'Bargain: "Only if you get me out."', 'then': [flag('vesk_allied'), flag('vesk_vow', 'bargain'), {'type': 'add_item', 'item': 'lung_sac'},
                                                                         {'type': 'meter_set', 'meter': 'lungsac', 'value': 'max'}, {'type': 'add_score', 'points': 3, 'id': 'v6_vow'},
                                                                         msg('"A trade, then." She gives you a lung-sac and nothing else. The wall behind her, the border into the Purge Core, unclenches.')]},
               {'label': 'Refuse', 'then': [setv(eggs), msg('You won\'t promise. The guard escorts you, unharmed, up to the egg sacs. "Come back when you are ready," breathes after you. "I will wait."')]}]}
    add(obj('v6_queen', 'She Who Breathes For Us', 'The Queen: vast and pale, fed by her brood.', (250, 180, 500, 350),
            [it('look', [msg('The Queen. She fills the chamber: vast and pale, a ridge of breathing slits along her side glowing amber, her brood crawling over her. Older than the ship\'s crew. She has watched the Choir burn her children for three hundred cycles.')]),
             it('talk', [{'type': 'open_widget', 'widget': 'v6_queen_audience'}], when=[not_('queen_spoken')]),
             it('talk', [mark], when=[is_('queen_spoken'), not_('tag_hollowed')]),
             it('talk', [vow], when=[is_('tag_hollowed'), not_('vesk_allied')]),
             it('talk', [msg('"Go, kin. Stop the heart." The wall behind her stands open.')], when=[is_('vesk_allied'), is_('vesk_vow', 'swore')]),
             it('talk', [msg('"Go, trader. We have our bargain." The wall behind her stands open.')]),
             it('hand', [msg('Her side is warm and vast, rising and falling. The brood go still around your hand. Then she breathes, and you are lifted off your feet and set down again.')]),
             it('use_item', [msg('She smells it and lets it go. She wants you, not your things.')], item='nutrient_paste_tube')],
            walk_to={'x': 480, 'y': 630}), queen)
    # the border: the Queen's wall into the Purge Core
    core_entry = lambda view, text, at=None: [setv(view, at=at), flag('in_core'), flag('in_thin_air'), {'type': 'meter_set', 'meter': 'breath', 'value': 'max'},
                                              {'type': 'conditional_effect', 'when': [is_('vesk_vow', 'swore')], 'then': [{'type': 'meter_set', 'meter': 'callstone', 'value': 'max'}]},
                                              {'type': 'pursuer_reset', 'pursuer': 'v6_curator'}, msg(text), ckpt('core', 'where you entered the Purge Core')]
    border = NO[f"nav_v6_{N3[0]}_{N3[1]}_north"]
    border['name'] = 'The border'
    border['visual']['label'] = '↑ The border'
    border['interactions'] = [
        it('look', [msg('The wall behind the Queen: living muscle, clenched. On the other side, heat. The border into the Purge Core.')], when=[not_('vesk_allied')]),
        it('look', [msg('The border stands open, a ring of relaxed muscle. Heat breathes through it from the Core.')]),
        it('move', [msg('The wall won\'t open for a stranger.')], when=[not_('vesk_allied')]),
        it('move', [{'type': 'conditional_effect', 'when': [is_('keth_path', 'ally')], 'then': [{'type': 'add_item', 'item': 'claw_ring'},
                     msg('At the border the Keth-Vari catches up with you, bends one of its own claws into a ring and presses it onto your finger. "I stay with the wall-mothers. We\'ll fight them from in here. Go."')]}]
                    + core_entry(vid(CORE_IN), 'The Queen\'s guard walks you to the border and stops at its edge. No Vesk goes further. The heat hits you like a hand. From here on it\'s you, your breath, and what she gave you.')),
        it('hand', [msg('Warm muscle, and on the far side of it, heat.')])]
    # the drop-hole off the brood chamber, after the alliance
    nv.append({'id': 'act1_v6_drop_hole', 'name': 'The Drop-Hole', 'background_key': 'act1_v6_drop_hole', 'background_file': 'backgrounds/maze/maze_shaft.webp',
               'objects': [], 'enter_sound': 'crawl', 'music': 'audio/music_court.mp3', 'walk_area': {'floor': [[150, 640], [300, 640], [300, 700], [150, 700]]},
               'character': {'x': 220, 'y': 680, 'facing': 'right', 'sprite_set': 'idle'}, 'on_enter': list(REFILL),
               'hints': [{'text': 'A long drop into the Purge Core. The rope knuckle on the wall would hold a line.', 'when': []}]})
    NV['act1_v6_drop_hole'] = nv[-1]
    add(obj('v6_to_drop', 'The drop-hole', 'A hole the colony has opened in the floor.', (560, 470, 260, 160),
            [it('look', [msg('A wide hole in the floor of the brood chamber, ringed with chewed flesh. The colony opened it for you: a way down into the Purge Core, about halfway through.')], when=[is_('vesk_allied')]),
             it('look', [msg('A wide hole in the floor, ringed with chewed flesh and guarded by the young. Not for strangers.')]),
             it('move', [setv('act1_v6_drop_hole'), msg('You climb down to the lip of the drop-hole.')], when=[is_('vesk_allied')]),
             it('move', [msg('The young in the basket hiss. Not for strangers.')])], label='↓ The drop-hole', nav=True), brood)
    add(obj('v6_drop_back', 'Back up', 'Back to the brood chamber.', (0, 560, 120, 160), [it('move', [setv(brood)])], label='← Back up', nav=True), 'act1_v6_drop_hole')
    add(obj('v6_drop', 'The hole', 'A long drop into the Core.', (300, 500, 330, 140),
            [it('look', [msg('You look down. A long way down, heat and orange seams. Too far to drop. The bone knuckle on the right wall would hold a line.')]),
             it('use_item', [{'type': 'remove_item', 'item': 'grappling_line'}] + core_entry(vid(K['SHAFT_TO']), 'You tie the line to the bone knuckle and go down hand over hand into the heat, and let go the last few feet. The line stays behind, swinging.'),
                item='grappling_line'),
             it('move', [msg('You lower yourself over the edge and let go.'), over('A long way down', 'The drop-hole is a long fall into the Purge Core. LOOK down first: the bone knuckle on the wall would hold your grappling line.')]),
             it('hand', [msg('Warm, chewed edges. A long way down.')])]), 'act1_v6_drop_hole')

    # ── 6. the Purge Core: the Cache, the seam, the office grate, the race, the Purge Heart ──────────
    vault = vid(tuple(G['rooms']['cache'][1]))
    add(obj('v6_multitool', 'Choir multitool', 'A long bone-handled tool on a pedestal.', (440, 300, 120, 200),
            [it('look', [msg('On the pedestal, a Choir maintenance tool: a long bone-handled rod ending in folding prongs. Long and strong. It would jam a fan.')]),
             it('hand', [{'type': 'add_item', 'item': 'choir_multitool'}, {'type': 'hide_object', 'object': 'v6_multitool'}, {'type': 'add_score', 'points': 2, 'id': 'v6_multitool'},
                         msg('You lift the multitool off its pedestal. It is heavy and warm, made for hands three times yours.')])]), vault)
    add(obj('v6_trophies', 'Trophies', 'Shelves of trophies from harvested worlds.', (20, 60, 260, 600),
            [it('look', [msg('Shelves of trophies from worlds the Choir have eaten: masks, shells, a skull with too many eye sockets. On the right, a pale carving of a many-legged thing breathing: a Vesk, carved by a Vesk, from a world that isn\'t there any more.')])]), vault)
    seam = vid(tuple(G['rooms']['seam'][0]))
    add(obj('v6_earth_crack', 'The crack', 'A crack in the hull, and through it, stars.', (400, 130, 180, 330),
            [it('look', [msg('Through a crack in the hull, cold air, stars, and the blue edge of a planet you know. Earth. Closer than you thought.'), {'type': 'add_score', 'points': 2, 'id': 'v6_seam'}]),
             it('hand', [msg('Cold enough to burn. You breathe it in, and it\'s the best thing you\'ve ever breathed.')])]), seam)
    office = vid(tuple(G['rooms']['grate'][0]))
    add(obj('v6_office', 'The Curator\'s office', 'Through the grate, the Curator\'s office.', (260, 60, 450, 580),
            [it('look', [msg('Through the grate, far below: the Curator at a curved console, plotting the next purge on a map of the Core. Hanging over the map, the Purge Heart, marked in the far north-west. It hums while it works, a low, wandering note. You will know that hum again.'),
                         flag('curator_hum_known'), {'type': 'play_sound', 'sound': 'curator_hum'}, {'type': 'add_score', 'points': 2, 'id': 'v6_office'}]),
             it('talk', [{'type': 'conditional_effect', 'when': [is_('penitent_message')], 'then': [msg('"The Penitent still sings," you whisper through the grate. Far below, the Curator goes very still. Then it goes on working, slower.'), flag('penitent_message_given'), {'type': 'add_score', 'points': 2, 'id': 'v6_penitent_msg'}],
                          'else': [msg('You keep very quiet.')]}])]), office)
    # the race: entering a Core screen close to the Heart for the first time turns the Curator toward the controls
    for c, d in K['TO_HEART'].items():
        if 0 < d <= 5 and vid(c) in NV:
            v = NV[vid(c)]
            v.setdefault('on_enter', []).append({'type': 'conditional_effect', 'when': [not_('heart_race'), not_('purge_stopped')], 'then': [
                flag('heart_race'), {'type': 'meter_set', 'meter': 'race', 'amount': d + 2}, {'type': 'play_sound', 'sound': 'curator_hum'},
                msg(f'The hum behind the walls stops, then starts again, moving fast, away from you. The Curator knows where you are going. It is heading for the Purge Heart\'s controls to fire a purge that will clear the whole Core. Every seam brightens. It needs {d + 2} of your moves. The Heart is {d} away.'),
                ckpt('heart', 'the race to the Purge Heart')]})
    # the Purge Heart (the fan room)
    fv = V['act1_vent_fan_room']
    fv['background_file'] = 'backgrounds/maze/maze_purge_heart.webp'
    fv['name'] = 'The Purge Heart'
    fv['music'] = 'audio/music_core.mp3'
    fv['map_xy'] = [EXIT[0], 14 - EXIT[1]]
    O['vent_fan']['name'] = 'The Purge Heart'
    O['vent_fan']['position'] = {'x': 300, 'y': 70}
    O['vent_fan']['size'] = {'width': 360, 'height': 500}
    O['fan_mechanism']['position'] = {'x': 830, 'y': 220}
    O['fan_mechanism']['size'] = {'width': 120, 'height': 200}
    for x in O['vent_fan']['interactions']:
        if x['verb'] == 'look' and x['when'] and x['when'][0].get('state') == 'spinning':
            x['then'] = [msg('The Purge Heart: a fan as big as the duct, its five blades spinning, bronze canisters of the Choir\'s gas strapped around its hub and leaking yellow-green into the wind. It drives every purge in the Core and blows the gas out through the ducts. Its drive is on the right wall, where muscle meets axle.')]
        if x['verb'] == 'move':
            for e in x['then']:
                if e.get('type') == 'set_view': e['view'] = 'act1_vent_exit'
    for x in O['fan_mechanism']['interactions']:
        if x['verb'] == 'use_item' and x.get('item') == 'surgical_probe':
            x['then'] = [e for e in x['then'] if e.get('type') != 'message' and e.get('flag') != 'purge_stopped' and e.get('sound') != 'bellows_stop'] + [flag('purge_stopped'), {'type': 'play_sound', 'sound': 'bellows_stop'},
                         msg('You ram the probe into the drive where the muscle meets the axle. The Heart chokes, shudders, and stops. The bellows sigh out. The seams go dark, the gas thins, and the Core is quiet. '
                             'Then, far behind you, the ducts begin to fill with breathing: the colony, coming past the border for the first time.')]
    O['fan_mechanism']['interactions'] = [x for x in O['fan_mechanism']['interactions'] if x.get('item') != 'choir_multitool']
    O['fan_mechanism']['interactions'].insert(0, it('use_item', [{'type': 'remove_item', 'item': 'choir_multitool'}, {'type': 'set_state', 'object': 'vent_fan', 'state': 'jammed'},
                                                                 flag('fan_jammed'), flag('purge_stopped'), {'type': 'add_score', 'points': 5, 'id': 'fan_jammed'}, {'type': 'play_sound', 'sound': 'bellows_stop'},
                                                                 msg('You drive the Choir multitool into the drive and open its prongs. The Heart chokes, shudders, and stops. The seams go dark, the gas thins, and the Core is quiet. '
                                                                     'Far behind you, the ducts begin to fill with breathing: the colony, coming past the border.')],
                                                    when=[{'type': 'has_item', 'item': 'choir_multitool'}, {'type': 'object_state', 'object': 'vent_fan', 'state': 'spinning'}], item='choir_multitool'))
    back_nav = O['nav_act1_vent_fan_to_act1_vent_gas_chamber']
    back_nav['name'] = 'Back (west)'
    back_nav['interactions'] = [it('look', [msg('The duct back the way you came.')]), it('move', [setv(vid(step(EXIT, 'W')))])]
    # out of the vents: the hatch into the Airlock Bay ends the zone system
    for x in O['exit_hatch']['interactions']:
        if x['verb'] == 'move':
            x['then'] = [e for e in x['then'] if e.get('type') != 'clear_checkpoint' and e.get('flag') not in ('in_thin_air', 'in_core')] + [{'type': 'clear_checkpoint'}, flag('in_thin_air', ''), flag('in_core', '')]
    # the collapsed section's way back
    coll = tuple(G['rooms']['collapsed'][0])
    V['act1_vent_collapsed']['map_xy'] = [coll[0], 14 - coll[1]]
    cn = O['nav_act1_vent_collapsed_to_act1_vent_junction']
    for x in cn['interactions']:
        for e in x.get('then', []):
            if e.get('type') == 'set_view': e['view'] = vid(step(coll, 'S')); e.pop('at', None)

    # ── 7. the Keth-Vari and the cat in the Core ─────────────────────────────────────────────────────
    s['events'].append({'id': 'v6_keth_shriek', 'one_shot': True,
                        'trigger': {'type': 'all_of', 'conditions': [is_('keth_path', 'ally'), {'type': 'pursuer_near', 'pursuer': 'v6_curator', 'threshold': 1}]},
                        'effects': [{'type': 'pursuer_divert', 'pursuer': 'v6_curator', 'amount': 5},
                                    msg('Far off down the Core, a shriek: four-armed, furious, deliberate. The hum behind the walls swings away toward it. The Keth-Vari has bought you some room.')]})
    s['events'].append({'id': 'v6_keth_betrayal', 'one_shot': True,
                        'trigger': {'type': 'all_of', 'conditions': [is_('keth_path', 'enemy'), is_('in_core'),
                                                                     {'type': 'any_of', 'conditions': [{'type': 'view_is', 'view': vid(c)} for c in sorted(K['GRATES'])]}]},
                        'effects': [{'type': 'pursuer_divert', 'pursuer': 'v6_curator', 'amount': -3},
                                    msg('From the duct behind you, a shriek, right by the grate. The Keth-Vari, calling the Curator to you. The hum turns your way.')]})
    for c in sorted(K['BREATH_CORE']):
        add(obj(f'v6_cat_{c[0]}_{c[1]}', 'The black cat', 'The black cat from upstairs, sitting by the vent.', (560, 600, 70, 60),
                [it('look', [msg('The black cat from upstairs, sitting by the vent as if it owns it, watching the throat open and close. As it opens, the cat strolls through. Of course.')]),
                 it('hand', [msg('It allows one scratch behind the ears, then looks pointedly at the vent. On the in-breath, it\'s saying. Go when it opens.')])],
                visible=False), vid(c))
    s['events'].append({'id': 'v6_cat_core', 'one_shot': True, 'trigger': {'type': 'all_of', 'conditions': [is_('in_core'), is_('cat_petted')]},
                        'effects': [{'type': 'show_object', 'object': f'v6_cat_{c[0]}_{c[1]}'} for c in sorted(K['BREATH_CORE'])]})

    # ── 8. the alliance changes the Gut ──────────────────────────────────────────────────────────────
    s['events'].append({'id': 'v6_allied', 'one_shot': True, 'trigger': is_('vesk_allied'),
                        'effects': [msg('Through the walls, all across the Gut, the colony breathes in at once, and out. The Wardens have stopped hunting. The membranes are held open. On your map, new ducts appear in four-fingered scratches.')]})

    # ── 8b. after the alliance: the Mimic's dead end, Wardens as guides, the cat, Vera's fate ──────────
    mim = vid(K['MIMIC'])
    add(obj('v6_mimic_skin', 'Shed skin', 'A shed skin, and a Warden standing over it.', (330, 470, 300, 140),
            [it('look', [msg('The dead end is empty now: a long, torn shed skin, and a Warden standing over it like a guard over a grave. The Queen\'s guard dealt with the Mimic. The Warden lowers its head to you and doesn\'t move.')]),
             it('talk', [msg('"Outrider, respond," you say, just to hear it. The Warden\'s slits flare. Nobody answers.')])], visible=False), mim)
    s['events'].append({'id': 'v6_mimic_gone', 'one_shot': True, 'trigger': is_('vesk_allied'), 'effects': [{'type': 'show_object', 'object': 'v6_mimic_skin'}]})
    NV[mim].setdefault('on_enter', []).append({'type': 'conditional_effect', 'when': [is_('vesk_allied')], 'then': list(REFILL)})
    # allied Wardens wait at the next turn toward the border: a hint in every Gut duct
    import collections
    gut = [c for c in CELLS if 3 <= c[1] <= 10]
    dist = {N3: 0}
    q = collections.deque([N3])
    while q:
        c = q.popleft()
        for d, n in links(c):
            if n in gut and n not in dist and n != K['MIMIC']:
                dist[n] = dist[c] + 1
                q.append(n)
    WORD = {'N': 'north', 'S': 'south', 'E': 'east', 'W': 'west'}
    SCREEN = {'N': 'straight ahead', 'W': 'to your left', 'E': 'to your right', 'S': 'back the way you came'}
    for c, dd in dist.items():
        v = NV.get(vid(c))
        if not v or dd == 0:
            continue
        way = min((d for d, n in links(c) if n in dist), key=lambda d: dist[step(c, d)])
        v.setdefault('hints', []).append({'text': f'A Warden waits {SCREEN[way]} ({WORD[way]}), head low, and turns to lead you toward the border.', 'when': [is_('vesk_allied')]})
    # the cat, if you petted it, sits on a far rib in the Warren
    add(obj('v6_warren_cat', 'The black cat', 'A small black shape on a far rib.', (880, 300, 50, 50),
            [it('look', [msg('On a far rib above the city, a small black shape is licking a paw: the cat from upstairs. The Vesk won\'t touch it; they find its breathing strange. It goes where it likes.')])],
            visible=False), vid(warren[0]))
    s['events'].append({'id': 'v6_warren_cat', 'one_shot': True, 'trigger': {'type': 'all_of', 'conditions': [is_('cat_petted'), {'type': 'view_is', 'view': vid(warren[0])}]},
                        'effects': [{'type': 'show_object', 'object': 'v6_warren_cat'}]})
    # mercy for Vera dims the Warren's lights
    for c in warren:
        NV[vid(c)]['lighting_variants'].insert(0, {'when': [is_('vera_fate', 'mercy'), not_('vesk_allied')],
                                                   'lighting': {'lights': [{'x': 0.5, 'y': 0.4, 'radius': 0.5, 'color': [40, 90, 80], 'pulse_speed': 0.05, 'pulse_amount': 0.1, 'alpha': 0.18}], 'flicker': False}})

    # ── 9. the map: the escapee's, north-up, with layers ─────────────────────────────────────────────
    I = {i['id']: i for i in s['items']}
    m = I['ventilation_map']
    m['description'] = 'The escapee\'s map of the vents, scratched on a metal plate, north at the top. The Gut\'s east half is torn off. Look at it to read it.'
    m['examine'] = [{'verb': 'look', 'when': [], 'then': [
        {'type': 'show_closeup', 'image': 'closeups/vent_map_v6.webp', 'layers': [
            {'image': 'closeups/vent_map_v6_camp.png', 'when': [is_('camp_map_piece')]},
            {'image': 'closeups/vent_map_v6_keth.png', 'when': [is_('keth_marks')]},
            {'image': 'closeups/vent_map_v6_false.png', 'when': [is_('keth_false_marks'), not_('keth_marks')]},
            {'image': 'closeups/vent_map_v6_tunnels.png', 'when': [is_('vesk_allied')]}]},
        msg('The escapee\'s map, north at the top: the Outer Ducts across the bottom, the Gut in the middle with its east half torn off, the Purge Core at the top. Circles are cold folds, rings breathing ducts, skulls purge ducts, bars grates. Nothing marks where you are.')]}]
    return {}
