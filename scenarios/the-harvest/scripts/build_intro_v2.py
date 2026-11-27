"""Write The Harvest's new opening into scenario.json (idempotent; safe to re-run).

    cd scenarios/the-harvest && python3 scripts/build_intro_v2.py

The opening, about 80 seconds (design: the "First Impression" doc):
  1. Cold open (setting.intro_scenes): the title, then Earth and LUMEN-7 fade up with the pilot's breathing; one line of
     his own voice-over (N1). It ends on exactly the picture the game starts on, so the cut is seamless.
  2. The spacewalk (view intro_spacewalk, the prologue): playable. Relay Control asks for eyes on the satellite (C1),
     the pilot answers (P1). The tutorial teaches the verbs here: right-click, MOVE to drift, HAND the panel (P3).
  3. The panel (view intro_panel_closeup): LOOK or HAND inside. The boards are gone (P4); Control can't explain it (C2).
  4. The cutscene "abduction" (setting.cutscenes): the stars go out (P5, C3), the harvest (P6), then "Outrider,
     respond" under the cataloguing, the pods and the dark (C4, fainter each time). Then the wake-up in the Stasis Hold.

Voices: the pilot is the Silas voice (the same voice that narrates the rooms) with a helmet-mic filter on lines he says
to Control (message style "comms"); Relay Control is the Emily voice through the radio filter (style "radio").
Audio lives in intro/audio/v2/ (mastered by master_intro_audio.py).
"""
import json
import os, re

PATH = 'scenario.json'
A = 'intro/audio/v2/'
SPACE = 'intro_spacewalk'
PANEL = 'intro_panel_closeup'

# Clip lengths in seconds (measured), so lines follow each other without overlapping.
LEN = {'c1': 6.19, 'p1': 6.92, 'p3': 2.59, 'p4': 6.35, 'c2': 9.40}

C1 = "Outrider, Relay. Still nothing from LUMEN on our end. Tell me you've got eyes on it."
P1 = "“Eyes on it. Big, expensive, and not talking. Heading for the access panel.”"
P3 = "“Panel's open. ...Huh.”"
P4 = "“Control, the boards are missing. All of them. Somebody unplugged this thing and took the parts home.”"
C2 = "Say again? Missing? ...Okay. Don't touch anything. I'm pulling up long-range... and long-range is acting up. Great."
P5 = "“Control. The stars.”"
C3 = "Outrider, long-range is showing something. It's big. It's right on top of y—"
P6 = "“Control, something's pulling me in, I can't—”"
C4 = "Outrider, respond. Outrider, come back."

SUN = {'x': 0.97, 'y': 0.04, 'radius': 0.22, 'color': [255, 214, 160], 'alpha': 0.3, 'pulse_speed': 0.15, 'pulse_amount': 0.3, 'phase': 0}
START = [330, 450]          # where the pilot floats: the same in the cold open and the playable view
HELMET = [START[0] + 4, START[1] - 118]   # his helmet in the cold open (the float sprite is ~142 tall at EVA_SCALE): the first shot's centre
TETHER_AT = [536, 384]     # his safety tether's hardpoint: the lower-left corner of LUMEN-7's gold body (960x720)
TETHER = {'color': [225, 205, 150], 'width': 2}
def tether_fx(sprite_index, waist, sag=40, **extra):
    """The tether in a cinematic shot: a rope effect from the hardpoint to a sprite's waist (offset in sprite pixels from its feet)."""
    return {'type': 'rope', 'from': TETHER_AT, 'to_sprite': sprite_index, 'offset': [0, -waist], 'sag': sag, **TETHER, **extra}
PANEL_SPOT = [482, 505]     # where he works the panel: his stand point by LUMEN-7's gold body, and where the stars scene finds him
EVA_SCALE = 0.2    # the v3 float sheet (709 px cells): about the same height on screen as the old drift art
# the drifting pilot (drill on his belt): the spacewalk, the cold open's last frame and the stars scene
def _cell(path, columns):
    """(frame_width, frame_height) of a built sheet, so a rebuild of the art can't leave stale sizes here."""
    from PIL import Image
    w, h = Image.open(path).size
    return w // columns, h
# the pilot floating (scripts/build_eva_v3.py, the owner's v3 sheets): two near-identical poses, a slow breathing loop.
# There's no swimming in orbit, so the same loop plays while he drifts to where you click.
DRIFT = {'file': 'intro/sprites/eva_float_v3.png', 'frame_width': _cell('intro/sprites/eva_float_v3.png', 2)[0], 'frame_height': _cell('intro/sprites/eva_float_v3.png', 2)[1], 'columns': 2, 'frame_rate': 0}
# cutscene poses (scripts/build_eva_v3.py): 0 drilling, 1 alarm, 2 taken, 3 limp. 0.6 = the old eva.png's size on screen
EVA = {'file': 'intro/sprites/eva_cutscene_v3.png', 'frame_width': _cell('intro/sprites/eva_cutscene_v3.png', 4)[0], 'frame_height': _cell('intro/sprites/eva_cutscene_v3.png', 4)[1], 'columns': 4, 'frame_rate': 0}
EVA_K = 419 / EVA['frame_height']
STARS_END = {'zoom': 1.14, 'x': PANEL_SPOT[0] - 480 + 40, 'y': 40}   # where the stars shot's push-in ends and the shadow shot starts


def msg(text, voice=None, style=None, static=None):
    m = {'type': 'message', 'text': text}
    if voice: m['voice'] = A + voice + '.mp3'
    if style: m['style'] = style
    if static is not None: m['static'] = static
    return m


def later(seconds, *effects):
    return {'type': 'delay_then', 'seconds': round(seconds, 2), 'effects': list(effects)}


def obj(oid, name, desc, pos, size, interactions, **extra):
    o = {'id': oid, 'name': name, 'description': desc, 'position': {'x': pos[0], 'y': pos[1]},
         'size': {'width': size[0], 'height': size[1]}, 'visual': {'color': 'transparent', 'label': name},
         'initial_state': 'default', 'interactions': interactions}
    o.update(extra)
    return o


# Every line the player can hear in the opening, by id. The clip for a line is intro/audio/v2/voice/<id>.mp3 (the Silas
# voice); a line is wired to its clip as soon as the file exists, so re-run this script after adding clips.
# s* = the pilot: his thoughts in the first person, or “quoted” words he says out loud; w01 = waking up; t* = the tutorial tips.
VOICE_DIR = A + 'voice/'
LINES = {
    # the spacewalk
    's01': "LUMEN-7. A relay the size of a delivery van, wrapped in gold foil. Nine days of silence, and not a scratch on her. The service panel's on this side.",
    's02': "I knock on the hull, twice. Nobody home. It's a satellite. What did I expect?",
    's03': "The Outrider. My ship. Small, old, and paid for.",
    's04': "The airlock's right there. But the job's not done.",
    's05': "\u201cBack soon,\u201d I tell her. Ships like to hear it.",
    's06': "The main dish. Still pointed at Earth. Still saying nothing.",
    's07': "Hands off the dish. Control would never let me hear the end of it.",
    's08': "I lean in and say \u201ctesting.\u201d Somewhere, probably, nobody hears it.",
    's09': "Solar wings, clean and soaking up the sun. The power's fine. That makes the silence worse.",
    's10': "I run a glove along the edge of a cell. Not a mark. Nobody's been out here but me.",
    's11': "Nothing to say to a solar panel. I've tried.",
    's12': "Home. All of it, every city light still on. Every time. You'd think I'd get used to it.",
    's13': "It's a long way down. One hand on the satellite.",
    's14': "I say hello to Earth. It doesn't answer. Best conversation I've had all week.",
    # the panel
    's15': "\u201cControl, you're going to want to see this.\u201d",
    's16': "Rows of empty sockets. Every module pulled, every contact scraped clean. Whoever did this took their time.",
    's17': "The panel door. The latches weren't forced. Somebody had the key. Or didn't need one.",
    's18': "I swing the door a little. It moves like it was oiled yesterday.",
    's19': "Nothing to say to a door. Not out loud, anyway.",
    's20': "A handrail. I keep one glove on it. Habit.",
    's21': "I tighten my grip on the rail. Habit, mostly.",
    's22': "I thank the handrail. Most reliable thing up here.",
    's23': "Earth, over my shoulder. Still there. Good.",
    's24': "Earth's a long way past my glove. Back to the panel.",
    's25': "\u201cHold on down there. Won't be long.\u201d",
    # the wake-up, in his own head (replaces the narrator's "Your eyes open..." once w01.mp3 exists)
    'w01': "Green light. A chemical smell. My pod's cracked open, and whatever they kept me in is running out across the floor. I'm cold. Weak. And not alone: hundreds of pods, full of dead things from a dozen worlds. Something hums in the walls. This ship is alive.",
    # tutorial tips (t01-t04 on the spacewalk; t05-t07 only for players who skipped it; t08-t10 in the Stasis Hold)
    't01': 'Your cursor is your eyes and hands. Right-click to change what it does: Look (the eye), Move (the feet), Hand and Talk.',
    't02': "With Move (the feet), click open space to drift there. LUMEN-7's service panel is on the gold body.",
    't03': 'Hand works things. Use it on the gold body to open the service panel.',
    't04': 'Look (the eye) is always safe. Look inside the panel.',
    't05': 'Your cursor is your eyes and hands. Right-click to change what it does: Look (the eye), Move (the feet), Hand and Talk.',
    't06': 'With the Move cursor (the feet), click the floor to walk there.',
    't07': 'Switch to Look (the eye) and click something to examine it. Looking is always safe.',
    't08': 'Hand picks things up and works them. Try the specimen tag hanging from your pod.',
    't09': 'What you carry is in Items, under the picture. Click an item, then click something in the room to use it there. Click one item and then another to combine them.',
    't10': "Stuck? The ? button at the bottom right gives a hint for the room you're in. Good luck.",
}
COMMS = {'s15'}   # said out loud to Control: the helmet-mic filter


def voice_of(lid):
    f = VOICE_DIR + lid + '.mp3'
    return f if os.path.exists(f) else None


def line(lid):
    m = {'type': 'message', 'text': LINES[lid]}
    if voice_of(lid): m['voice'] = voice_of(lid)
    if lid in COMMS: m['style'] = 'comms'
    return m


def say(verb, lid, **extra):
    return {'verb': verb, 'then': [line(lid)], **extra}


def tip(lid, done_when, **extra):
    t = {'text': LINES[lid], 'done_when': done_when, **extra}
    if voice_of(lid): t['voice'] = voice_of(lid)
    return t


# ── 1. Cold open ──────────────────────────────────────────────────────────────
COLD_OPEN = [{
    'background': 'intro/backgrounds/intro_orbit.webp',
    'loop': A + 'breath_loop.mp3',
    # starts close on his helmet and pulls out to reveal LUMEN-7 and Earth; it settles before the scene ends,
    # so the last frames are exactly the playable picture
    'camera': {'from': {'zoom': 2.3, 'x': HELMET[0] - 480, 'y': HELMET[1] - 360}, 'to': {'zoom': 1, 'x': 0, 'y': 0}, 'seconds': 7.5},
    'sprites': [{**DRIFT, 'frames': [0], 'scale': EVA_SCALE, 'at': START, 'bob': {'amount': 5, 'period': 4.5}}],
    'ambient_lighting': {'lights': [SUN]},
    'effects': [{'type': 'particles', 'motion': 'twinkle', 'area': [0, 0, 600, 380], 'count': 26, 'size': 2, 'color': [255, 255, 255], 'alpha': 0.8},
                tether_fx(0, 320, sag=50)],
    # dialogue from the first second: Control calls as the picture fades in (no narrator); he answers once you can play
    'lines': [{'text': C1, 'voice': A + 'c1.mp3', 'style': 'radio', 'static': 0.2, 'pause': 1.2}],
    'music': 'intro/audio/bed_stargazer.mp3', 'music_volume': 0.5,
    'hold': 8, 'tail': 0.3, 'fade_in': 2.5,
    'transition': 'cut',   # the last shot is exactly the spacewalk's picture: play starts with no fade
}]

# ── 4. The abduction ──────────────────────────────────────────────────────────
ABDUCTION = [
    {   # the stars go out, seen from where he is: the same orbit picture as the spacewalk, the pilot at the panel
        'background': 'intro/backgrounds/intro_orbit.webp',
        'loop': A + 'breath_loop.mp3',
        'sound': A + 'stars_out.mp3',
        'sounds': [{'file': 'intro/audio/rumble.mp3', 'volume': 0.85, 'delay': 4.5}],   # felt as the edge comes across
        # a slow push in on him as the stars die (ends where the next shot starts, so the cut doesn't jump)
        'camera': {'from': {'zoom': 1}, 'to': STARS_END, 'seconds': 14},
        'sprites': [
            # the harvester's leading edge slides across the sky from the right, swallowing the stars as it comes
            {'file': 'intro/sprites/harvester_edge.png', 'frame_width': 2000, 'frame_height': 512, 'columns': 1, 'frame_rate': 0, 'frames': [0],
             'scale': 0.6, 'at': [1700, 250], 'move': {'to': [430, 250], 'seconds': 9, 'delay': 3.4}},
            {**DRIFT, 'frames': [0], 'scale': EVA_SCALE, 'at': PANEL_SPOT, 'bob': {'amount': 4, 'period': 4.5}, 'until_cue': 'line:1', 'fade': 0.01},
            {**DRIFT, 'frames': [1], 'scale': EVA_SCALE, 'at': PANEL_SPOT, 'bob': {'amount': 4, 'period': 4.5}, 'cue': 'line:1', 'fade': 0.01}],
        'ambient_lighting': {'lights': [SUN]},
        'effects': [
            # something vast slides across the sky: the stars go out in a front from the right, the light dims behind it
            # (they start dying under "long-range is acting up", so Control's joke lands on the sky going dark)
            {'type': 'stars_out', 'area': [0, 0, 960, 330], 'count': 110, 'seconds': 7.5, 'delay': 3.6, 'from': 'right'},
            {'type': 'backdrop', 'image': 'intro/backgrounds/intro_orbit_starless.webp', 'from': 0, 'to': 1, 'seconds': 7, 'delay': 3.8},
            {'type': 'shade', 'color': [0, 0, 0], 'from': 0, 'to': 0.35, 'seconds': 8, 'delay': 4.2, 'direction': 'down', 'area': [0, 0, 960, 720]},
            {'type': 'shake', 'amount': 1.5, 'cue': 'line:1', 'until': 20},
            tether_fx(1, 320, sag=30), tether_fx(2, 320, sag=30)],
        'lines': [{'text': C2, 'voice': A + 'c2.mp3', 'style': 'radio', 'static': 0.35, 'pause': 0.4},
                  {'text': P5, 'voice': A + 'p5.mp3', 'pause': 0.6}],
        'hold': 13, 'tail': 0.6, 'fade_in': 0.6, 'transition': 'cut',
    },
    {   # the harvester: revealed out of the dark, enormous and green; Control is cut off
        'background': 'intro/backgrounds/intro_shadow.webp',
        'loop': A + 'breath_loop.mp3',
        'camera': {'from': STARS_END, 'to': {'zoom': 1, 'x': 0, 'y': -30}, 'seconds': 8},
        # the alarm pose where the stars shot left him: same spot, same height on screen (its feet sit 25 px higher in the cell)
        'sprites': [{**EVA, 'frames': [1], 'scale': EVA_SCALE, 'at': [PANEL_SPOT[0], PANEL_SPOT[1] + 5], 'bob': {'amount': 4, 'period': 4}, 'rotate': 8}],
        'ambient_lighting': {'lights': [
            {'x': 0.47, 'y': 0.16, 'radius': 0.3, 'color': [70, 255, 190], 'alpha': 0.22, 'pulse_speed': 0.35, 'pulse_amount': 0.5, 'phase': 0},
            {'x': 0.22, 'y': 0.22, 'radius': 0.18, 'color': [70, 255, 190], 'alpha': 0.14, 'pulse_speed': 0.27, 'pulse_amount': 0.6, 'phase': 1.5},
            {'x': 0.78, 'y': 0.2, 'radius': 0.18, 'color': [70, 255, 190], 'alpha': 0.14, 'pulse_speed': 0.31, 'pulse_amount': 0.6, 'phase': 3.1}]},
        'effects': [
            {'type': 'shade', 'color': [0, 0, 0], 'from': 0.45, 'to': 0, 'seconds': 3, 'direction': 'none'},
            {'type': 'shake', 'amount': 2, 'delay': 0.5, 'until': 8},
            tether_fx(0, 345, sag=20)],   # pulled taut toward the ship
        'lines': [{'text': C3, 'voice': A + 'c3.mp3', 'style': 'radio', 'static': 0.65, 'pause': 1.6}],
        'sounds': [{'file': 'intro/audio/sting_dread.mp3', 'volume': 0.9}],
        'music': 'intro/audio/music_dread.mp3', 'music_volume': 0.45,
        'hold': 7, 'tail': 1.6, 'fade_in': 0.01,
    },
    {   # the harvest beam
        'background': 'intro/backgrounds/intro_taken.webp',
        'sound': A + 'harvest.mp3',
        'camera': {'from': {'zoom': 1}, 'to': {'zoom': 1.14, 'y': -60}, 'seconds': 9},
        'sprites': [{**EVA, 'frame_rate': 0.45, 'frames': [2, 2, 2, 2, 3], 'loop': False, 'scale': round(0.42 * EVA_K, 3), 'at': [470, 650],
                     'move': {'to': [482, 110], 'scale': round(0.05 * EVA_K, 3), 'seconds': 8, 'delay': 0.4}, 'spin': 150}],
        'ambient_lighting': {'lights': [
            {'x': 0.5, 'y': 0.13, 'radius': 0.3, 'color': [230, 255, 170], 'alpha': 0.35, 'pulse_speed': 0.8, 'pulse_amount': 0.25, 'phase': 0},
            {'x': 0.53, 'y': 0.65, 'radius': 0.22, 'color': [230, 255, 170], 'alpha': 0.14, 'pulse_speed': 0.5, 'pulse_amount': 0.3, 'phase': 1}]},
        'effects': [
            {'type': 'particles', 'motion': 'rise', 'area': [360, 130, 260, 590], 'count': 60, 'size': 3, 'color': [240, 255, 200], 'alpha': 0.85, 'speed': 60},
            {'type': 'shake', 'amount': 3, 'delay': 0.5, 'until': 9}],
        'lines': [{'text': P6, 'voice': A + 'p6.mp3', 'pause': 0.6}],
        'hold': 7.5, 'tail': 0.4, 'transition': 'flash',
    },
    {   # the title, on black, straight out of the beam's white flash
        'title_card': 'The Harvest',
        'sound': 'intro/audio/title_hit.mp3',
        'hold': 5, 'tail': 0.4, 'fade_in': 0.35,
    },
    {   # catalogued: Control calls into nothing
        'background': 'intro/backgrounds/intro_catalogue.webp',
        'sound': A + 'scan.mp3',
        'camera': {'from': {'zoom': 1.06, 'x': 10}, 'to': {'zoom': 1}, 'seconds': 9},
        'sprites': [
            {'file': 'intro/sprites/specimen_limp.png', 'frame_width': 626, 'frame_height': 112, 'columns': 2, 'frames': [0, 0, 1, 1], 'frame_rate': 1, 'scale': 0.36, 'at': [505, 438], 'rotate': -10},
            {'file': 'sprites/cataloguer_robot.png', 'frame_width': 339, 'frame_height': 562, 'columns': 4, 'frame_rate': 2, 'scale': 0.4, 'at': [840, 640]}],
        'ambient_lighting': {'lights': [
            {'x': 0.59, 'y': 0.17, 'radius': 0.2, 'color': [90, 255, 170], 'alpha': 0.22, 'pulse_speed': 0.4, 'pulse_amount': 0.3},
            {'x': 0.52, 'y': 0.55, 'radius': 0.18, 'color': [90, 255, 170], 'alpha': 0.12, 'pulse_speed': 0.25, 'pulse_amount': 0.3, 'phase': 1}]},
        'effects': [{'type': 'sweep', 'area': [350, 330, 360, 130], 'color': [110, 255, 180], 'period': 3.2, 'alpha': 0.5}],
        'lines': [{'text': C4, 'voice': A + 'c4.mp3', 'style': 'radio', 'static': 0.55, 'pause': 1.0}],
        'music': None, 'hold': 5.5, 'tail': 0.6,
    },
    {   # filed away in a pod
        'background': 'intro/backgrounds/intro_pods.webp',
        'loop': A + 'pod.mp3',
        'camera': {'from': {'zoom': 1}, 'to': {'zoom': 1.12, 'y': -10}, 'seconds': 6},
        'sprites': [{'file': 'intro/sprites/pod_float.png', 'frame_width': 306, 'frame_height': 602, 'columns': 3, 'frames': [1], 'frame_rate': 0,
                     'scale': 0.43, 'at': [482, 542], 'bob': {'amount': 5, 'period': 6}, 'opacity': 0.88,
                     'filter': 'sepia(0.55) saturate(1.5) hue-rotate(-10deg) brightness(0.85)'}],
        'ambient_lighting': {'lights': [{'x': 0.5, 'y': 0.45, 'radius': 0.22, 'color': [255, 176, 60], 'alpha': 0.18, 'pulse_speed': 0.2, 'pulse_amount': 0.35, 'phase': 0}]},
        'effects': [{'type': 'particles', 'motion': 'rise', 'area': [418, 110, 135, 440], 'count': 18, 'size': 3, 'color': [255, 236, 180], 'alpha': 0.7, 'speed': 25}],
        'hold': 5, 'tail': 0.6,
    },
    {   # the dark: a heartbeat, the glass gives
        'sound': A + 'heartbeat.mp3',
        'sounds': [{'file': A + 'glass.mp3', 'delay': 2.4}],
        'lines': [{'text': C4, 'voice': A + 'c4.mp3', 'style': 'radio', 'static': 0.95, 'pause': 0.5}],
        'hold': 4.2, 'tail': 0.3,
    },
]

# ── 2. The spacewalk ──────────────────────────────────────────────────────────
SPACE_VIEW = {
    'id': SPACE, 'name': 'LUMEN-7, High Orbit',
    'background_key': SPACE, 'background_file': 'intro/backgrounds/intro_orbit.webp',
    'objects': ['sw_lumen_body', 'sw_outrider', 'sw_dish', 'sw_solar_wing', 'sw_earth'],
    'character': {'x': START[0], 'y': START[1], 'facing': 'right', 'sprite_set': 'eva', 'shadow': {'opacity': 0},
                  'tether': {'from': TETHER_AT, 'attach': [0.5, 0.55], 'sag': 40, **TETHER}},   # clipped to LUMEN-7 wherever he drifts
    'walk_area': {'floor': [[60, 330], [300, 300], [470, 330], [520, 460], [528, 525], [430, 575], [200, 600], [60, 565]],
                  'motion': 'smooth', 'speed': 0.55, 'footsteps': False},
    'ambient_lighting': {'lights': [SUN]},
    'ambient_audio': A + 'breath_loop.mp3',
    'ambient_text': 'Four hundred kilometres up. The only sound is your own breathing, and LUMEN-7 saying nothing at all.',
    'music': 'intro/audio/bed_stargazer.mp3',
    'enter_sound': None,
    'on_enter': [{'type': 'conditional_effect', 'when': [{'type': 'flag_not', 'flag': 'sw_briefed', 'value': 'true'}], 'then': [
        {'type': 'set_flag', 'flag': 'sw_briefed', 'value': 'true'},
        # Control's call (C1) is the cold open's line; his answer comes as play begins
        later(0.4, msg(P1, 'p1', 'comms')),
        # the tips wait for this exchange to finish, so a spoken tip never talks over it
        later(0.4 + LEN['p1'] + 0.6, {'type': 'set_flag', 'flag': 'sw_briefed_done', 'value': 'true'}),
    ]}],
    'hints': [{'text': "LUMEN-7's service panel is on the gold body. Drift over with Move (the feet), then use Hand on the gold body."}],
}

OPEN_PANEL = [
    {'type': 'conditional_effect', 'when': [{'type': 'flag_not', 'flag': 'sw_panel_open', 'value': 'true'}],
     # straight to the close-up: the door is seen swinging open there, and only then does he say it's open
     'then': [{'type': 'set_flag', 'flag': 'sw_panel_open', 'value': 'true'}, {'type': 'set_view', 'view': PANEL},
              later(1.5, msg(P3, 'p3', 'comms'))],
     'else': [{'type': 'set_view', 'view': PANEL}]},
]

SPACE_OBJECTS = [
    obj('sw_lumen_body', 'LUMEN-7', "LUMEN-7, a relay satellite.", (525, 222), (165, 232), [
        say('look', 's01'),
        {'verb': 'hand', 'then': OPEN_PANEL},
        {'verb': 'move', 'then': OPEN_PANEL},
        say('talk', 's02'),
    ], walk_to={'x': PANEL_SPOT[0], 'y': PANEL_SPOT[1], 'facing': 'right'}),
    obj('sw_outrider', 'The Outrider', "Your ship, docked at LUMEN-7's service port.", (700, 382), (135, 168),
        [say('look', 's03'), say('hand', 's04'), say('talk', 's05')], walk_to=False),
    obj('sw_dish', 'Main Dish', "LUMEN-7's main dish.", (482, 105), (135, 135),
        [say('look', 's06'), say('hand', 's07'), say('talk', 's08')], walk_to=False),
    obj('sw_solar_wing', 'Solar Wing', "LUMEN-7's solar wings.", (318, 300), (205, 140),
        [say('look', 's09'), say('hand', 's10'), say('talk', 's11')], walk_to=False),
    obj('sw_earth', 'Earth', "Home.", (0, 500), (700, 220),
        [say('look', 's12'), say('hand', 's13'), say('talk', 's14')], walk_to=False),
]

# ── 3. The panel ──────────────────────────────────────────────────────────────
BOARDS_GONE = [
    {'type': 'conditional_effect', 'when': [{'type': 'flag_not', 'flag': 'sw_boards_seen', 'value': 'true'}],
     'then': [{'type': 'set_flag', 'flag': 'sw_boards_seen', 'value': 'true'},
              {'type': 'hide_object', 'object': 'pn_pilot_open'}, {'type': 'show_object', 'object': 'pn_pilot_turn'},   # he turns to us
              msg(P4, 'p4', 'comms'),
              # Control's reply (C2) is the cutscene's first line, over the stars going out
              later(LEN['p4'] + 0.5,
                    {'type': 'play_cutscene', 'cutscene': 'abduction', 'wake': True,
                     'then': [{'type': 'set_view', 'view': 'act1_stasis_hold', 'sound': None}]})],
     'else': [line('s16')]},
]

PANEL_VIEW = {
    'id': PANEL, 'name': 'LUMEN-7 Service Panel',
    'background_key': PANEL, 'background_file': 'intro/backgrounds/intro_panel_gutted.webp',   # door removed, boards painted out (scripts/gut_panel.py)
    # the door and the pilot are sprites over the painting with its door removed: the door swings open as he pulls
    'objects': ['pn_door_swing', 'pn_pilot_open', 'pn_pilot_turn', 'pn_boards', 'pn_door', 'pn_handrail', 'pn_earth'],
    'on_enter': [later(1.2, {'type': 'set_flag', 'flag': 'sw_door_swung', 'value': 'true'})],
    'enter_fade': 0.35,   # quick, so the door is seen swinging open
    'back_label': 'LUMEN-7',
    'ambient_text': "LUMEN-7's service panel, open. Your breath fogs the bottom of your visor.",
    'ambient_audio': A + 'breath_loop.mp3',
    'music': 'intro/audio/bed_stargazer.mp3',
    'enter_sound': A + 'panel.mp3',
    'ambient_lighting': {'lights': [{'x': 0.76, 'y': 0.45, 'radius': 0.16, 'color': [150, 190, 255], 'alpha': 0.06, 'pulse_speed': 0.2, 'pulse_amount': 0.2, 'phase': 0}]},
    'hints': [{'text': 'LOOK inside the panel.'}],
}

# The v3 rail sheets (scripts/build_eva_v3.py) share one cell, anchored on the end of the red placeholder bar his glove
# held: that point goes on the painting's yellow-black handrail, at the hatch's lower left corner.
RAIL = json.load(open('intro/sprites/eva_rail_v3.json')) if os.path.exists('intro/sprites/eva_rail_v3.json') else None
PANEL_TETHER = {'from': [300, 760], 'attach': [0.5, 0.56], 'sag': 30, **TETHER, 'width': 4}   # up from a hardpoint below the frame
RAIL_GRIP = (561, 377)                 # the handrail's left end, in the 960x540 picture
RAIL_SCALE = 0.42      # leaves space under his boots: nothing reads as a floor
PILOT_AT_PANEL = {'x': round(RAIL_GRIP[0] - (RAIL['anchor_x'] - RAIL['frame_width'] / 2) * RAIL_SCALE),
                  'y': round((RAIL_GRIP[1] + (RAIL['frame_height'] - RAIL['anchor_y']) * RAIL_SCALE) / 0.75)}   # sprite bottom-centre, 960x720
PANEL_OBJECTS = [
    obj('pn_door_swing', 'Panel Door', "The service panel's door.", (716, 664), (1, 1), [], walk_to=False,
        sprite={'file': 'intro/sprites/panel_door.png', 'frame_width': 626, 'frame_height': 605, 'columns': 8, 'rows': 1, 'frame_rate': 9,
                'scale': 0.7031, 'loop': False, 'pass_through': True,
                'frame_when': [{'when': [{'type': 'flag_is', 'flag': 'sw_door_swung', 'value': 'true'}], 'frame': 7}]}),
    # grabs the rail, swings in, reaches up as the door opens, then leans in to look
    obj('pn_pilot_open', 'You', "", (PILOT_AT_PANEL['x'], PILOT_AT_PANEL['y']), (1, 1), [], walk_to=False,
        sprite={'file': 'intro/sprites/eva_rail_v3.png', 'frame_width': RAIL['frame_width'], 'frame_height': RAIL['frame_height'], 'columns': 4, 'rows': 1, 'frame_rate': 2.4,
                'scale': RAIL_SCALE, 'loop': False, 'pass_through': True, 'tether': PANEL_TETHER,
                'frame_when': [{'when': [{'type': 'flag_is', 'flag': 'sw_door_swung', 'value': 'true'}], 'frame': 3}]}),
    # the boards are gone: an uneasy look back at us, then he lets go of the rail, alarmed
    obj('pn_pilot_turn', 'You', "", (PILOT_AT_PANEL['x'], PILOT_AT_PANEL['y']), (1, 1), [], walk_to=False, initially_visible=False,
        sprite={'file': 'intro/sprites/eva_turn_v3.png', 'frame_width': RAIL['frame_width'], 'frame_height': RAIL['frame_height'], 'columns': 4, 'rows': 1, 'frame_rate': 1.4,
                'scale': RAIL_SCALE, 'loop': False, 'pass_through': True, 'tether': PANEL_TETHER}),
    obj('pn_boards', 'Inside the Panel', "The inside of LUMEN-7's service panel.", (598, 195), (186, 265), [
        {'verb': 'look', 'then': BOARDS_GONE},
        {'verb': 'hand', 'then': BOARDS_GONE},
        say('talk', 's15'),
    ]),
    obj('pn_door', 'Panel Door', "The service panel's door, hanging open.", (785, 125), (135, 520),
        [say('look', 's17'), say('hand', 's18'), say('talk', 's19')]),
    obj('pn_handrail', 'Handrail', "A yellow and black handrail.", (525, 485), (300, 110),
        [say('look', 's20'), say('hand', 's21'), say('talk', 's22')]),
    obj('pn_earth', 'Earth', "Earth, over your shoulder.", (0, 430), (380, 290),
        [say('look', 's23'), say('hand', 's24'), say('talk', 's25')]),
]

# ── Tutorial: the verbs on the spacewalk, the rest in the Stasis Hold ─────────
IN_SHIP = [{'type': 'not_in_view', 'view': SPACE}, {'type': 'not_in_view', 'view': PANEL}]
TUTORIAL = [
    tip('t01', 'verb_changed', prologue='only', when=[{'type': 'view_is', 'view': SPACE}, {'type': 'flag_is', 'flag': 'sw_briefed_done', 'value': 'true'}]),
    tip('t02', 'walked', prologue='only', when=[{'type': 'view_is', 'view': SPACE}, {'type': 'flag_is', 'flag': 'sw_briefed_done', 'value': 'true'}]),
    tip('t03', 'handled', prologue='only', when=[{'type': 'view_is', 'view': SPACE}, {'type': 'flag_is', 'flag': 'sw_briefed_done', 'value': 'true'}]),
    tip('t04', 'looked', prologue='only', when=[{'type': 'view_is', 'view': PANEL}]),
    tip('t05', 'verb_changed', prologue='if_skipped'),
    tip('t06', 'walked', prologue='if_skipped'),
    tip('t07', 'looked', prologue='if_skipped'),
    tip('t08', 'item_taken', when=IN_SHIP),
    tip('t09', 'item_selected', when=IN_SHIP),
    tip('t10', 'next', when=IN_SHIP),
]


def main():
    with open(PATH) as f:
        s = json.load(f)
    st = s['setting']
    st['intro_scenes'] = COLD_OPEN
    st['intro_title'] = False   # the title card plays after the abduction instead (a title_card scene)
    st['cutscenes'] = {**st.get('cutscenes', {}), 'abduction': ABDUCTION}
    st['prologue'] = {'view': SPACE}
    s['metadata']['cover'] = 'intro/backgrounds/intro_orbit.webp'   # the title screen's painting
    s['metadata']['description'] = ("A repair pilot on a routine spacewalk is plucked out of orbit by a living harvester ship. "
                                    "He wakes in a cracked pod among a thousand stolen specimens. Earth is next on the list. Get out, and get home.")
    s['metadata']['difficulty'] = 'Hard'
    st['narration'] = 'first_person'   # the engine's own lines in his voice too ("I can't go that way.")
    st['tutorial'] = {'style': 'nudge', 'steps': TUTORIAL}   # a quiet right-click badge; the tip boxes broke the mood
    # The wake-up line is his own thought once its clip is recorded: the first phase's opening message and the wake voice.
    if voice_of('w01'):
        s['phases'][0]['on_enter'][0]['text'] = LINES['w01']
        st.setdefault('sounds', {})['intro_voice'] = voice_of('w01')
    # floating still (drift frame 1), and a slow swim as he moves
    s['character']['sprite_sets']['eva'] = {
        'file': DRIFT['file'], 'columns': 2, 'rows': 1, 'frame_rate': 0.7, 'directions': ['right'],
        'frame_width': DRIFT['frame_width'], 'frame_height': DRIFT['frame_height'], 'scale': EVA_SCALE, 'bob': {'amount': 5, 'period': 4.5}, 'walk': 'eva_drift'}
    s['character']['sprite_sets']['eva_drift'] = {
        'file': DRIFT['file'], 'columns': 2, 'rows': 1, 'frame_rate': 1.2, 'directions': ['right'],
        'frame_width': DRIFT['frame_width'], 'frame_height': DRIFT['frame_height'], 'scale': EVA_SCALE, 'bob': {'amount': 4, 'period': 3}}

    new_views = [SPACE_VIEW, PANEL_VIEW]
    ids = {v['id'] for v in new_views}
    s['views'] = [v for v in s['views'] if v['id'] not in ids] + new_views
    new_objs = SPACE_OBJECTS + PANEL_OBJECTS
    oids = {o['id'] for o in new_objs}
    s['objects'] = [o for o in s['objects'] if o['id'] not in oids] + new_objs

    # canonical format: indent=2, [x, y] number pairs on one line
    out = json.dumps(s, indent=2, ensure_ascii=False)
    out = re.sub(r'\[\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\s*\]', r'[\1, \2]', out)
    with open(PATH, 'w') as f:
        f.write(out + '\n')
    print(f'intro v2: cold open, {len(ABDUCTION)}-scene abduction cutscene, views {SPACE} + {PANEL}, {len(new_objs)} objects, {len(TUTORIAL)} tutorial tips')


if __name__ == '__main__':
    main()
