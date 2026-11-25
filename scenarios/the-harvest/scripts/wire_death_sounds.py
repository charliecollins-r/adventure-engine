"""Give each death its own sound: sets `sound` on every losing game_over in scenario.json (idempotent).

    cd scenarios/the-harvest && python3 scripts/wire_death_sounds.py

Deaths are matched by their title (and, for "Caught", by who catches you). A death whose clip doesn't exist yet in
audio/deaths/ keeps the generic setting.sounds.death sting. Re-run after build_vent_maze_v6.py, which rewrites the
vent deaths. Prompts for every clip: the "First Impression" doc (ElevenLabs sound-effect prompts).
"""
import json, os, re

PATH = 'scenario.json'
# title -> clip (in audio/deaths/); the first matching rule wins
RULES = [
    ('Caught', lambda ctx: ctx == 'event:noise_caught', 'caught_curator.mp3'),   # too loud: the Curator comes
    ('Caught', None, 'caught_drone.mp3'),                                         # hunter drones (alarm, patrol, keypad)
    ('Look Before You Leap', None, 'fall_gap.mp3'),
    ('Toxic Curiosity', None, 'gas.mp3'),
    ('Toxic Death', None, 'gas.mp3'),
    ('Sliced', None, 'fan.mp3'),
    ('Purged', None, 'purged.mp3'),
    ('Scalded', None, 'scalded.mp3'),
    ('Bitten', None, 'bitten.mp3'),
    ('Eaten by the Mimic', None, 'mimic.mp3'),
    ('Unwise', None, 'queen.mp3'),
    ('A long way down', None, 'drop.mp3'),
    ('Taken by a Warden', None, 'warden.mp3'),
    ('Seen', None, 'seen.mp3'),
    ('Out of air', None, 'out_of_air.mp3'),
    ('Recovered', None, 'recovered.mp3'),
]


def clip_for(title, ctx):
    for t, test, f in RULES:
        if t == title and (test is None or test(ctx)):
            return f if os.path.exists(f'audio/deaths/{f}') else None
    return None


def main():
    s = json.load(open(PATH))
    wired, generic = {}, set()

    def walk(x, ctx):
        if isinstance(x, dict):
            if x.get('type') == 'game_over' and x.get('result') != 'win':
                f = clip_for(x.get('title'), ctx)
                if f:
                    x['sound'] = f'audio/deaths/{f}'
                    wired[x.get('title')] = wired.get(x.get('title'), 0) + 1
                else:
                    x.pop('sound', None)
                    generic.add(x.get('title'))
            for v in x.values(): walk(v, ctx)
        elif isinstance(x, list):
            for v in x: walk(v, ctx)

    for key, items, idk in [('objects', s['objects'], 'id'), ('events', s.get('events', []), 'id'), ('patrols', s.get('patrols', []), 'id'),
                            ('pursuers', s.get('pursuers', []), 'id'), ('meters', s.get('meters', []), 'id'), ('views', s['views'], 'id'),
                            ('puzzle_widgets', s.get('puzzle_widgets', []), 'id')]:
        for it in items: walk(it, f'{key[:-1] if key != "puzzle_widgets" else "widget"}:{it.get(idk, "")}')

    out = json.dumps(s, indent=2, ensure_ascii=False)
    out = re.sub(r'\[\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\s*\]', r'[\1, \2]', out)
    open(PATH, 'w').write(out + '\n')
    for t, n in sorted(wired.items()): print(f'  {t}: {n} death(s) wired')
    print(f'  still on the generic sting: {", ".join(sorted(x for x in generic if x)) or "none"}')


if __name__ == '__main__':
    main()
