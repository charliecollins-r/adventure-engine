"""Apply the Act 1 voice pass: replace player-facing lines in scenario.json with their edited versions (idempotent).

    cd scenarios/the-harvest && python3 scripts/apply_voice_pass.py

scripts/voice_pass.json maps each original line to its edited line (the pilot's first-person voice, KQ5/KQ6 tone,
short; voice guide in the file's "_guide" entry). Lines are matched exactly, wherever they appear: object
interactions, items, events, patrols, meters, widgets, hints and idle lines. Run it after any build script that
regenerates text (build_vent_maze_v6.py / vent_story_v6.py), so a rebuild never brings the old wording back.

A message whose text changes loses its recorded `voice` (the clip no longer matches); the script lists those clips so
they can be recorded again under the same names, and they are re-attached by `voice_relink` when the new clip exists.
The first phase's opening message is left alone: the wake-up line (w01 in build_intro_v2.py) replaces it with its voice.
"""
import json, os, re

PATH = 'scenario.json'
MAP = 'scripts/voice_pass.json'
FIELDS = ('text', 'response', 'description', 'reason', 'prompt')


def main():
    s = json.load(open(PATH))
    vp = json.load(open(MAP))
    lines = vp['lines']
    relink = vp.get('voice_relink', {})      # new text -> clip, re-attached once the re-recorded clip exists
    keep = s['phases'][0]['on_enter'][0].get('text') if s.get('phases') else None
    changed, unhooked = 0, []

    def sub(t):
        return lines.get(t, t) if t != keep else t

    def walk(x):
        nonlocal changed
        if isinstance(x, dict):
            for k, v in list(x.items()):
                if isinstance(v, str) and (k in FIELDS or k.endswith('message') or k == 'ambient_text'):
                    n = sub(v)
                    if n != v:
                        x[k] = n; changed += 1
                        if k == 'text' and x.get('voice') and not x['voice'].startswith('intro/'):
                            unhooked.append(x['voice']); relink[n] = x.pop('voice')
                elif k == 'messages' and isinstance(v, list):
                    x[k] = [sub(m) for m in v]; changed += sum(1 for a, b in zip(v, x[k]) if a != b)
                else:
                    walk(v)
            # a re-recorded clip comes back on the line it belongs to
            if x.get('type') == 'message' and not x.get('voice') and x.get('text') in relink and os.path.exists(relink[x['text']]) \
                    and os.path.getmtime(relink[x['text']]) > vp.get('_recorded_before', 0):
                x['voice'] = relink[x['text']]
        elif isinstance(x, list):
            for v in x: walk(v)

    for key in ('objects', 'items', 'events', 'patrols', 'pursuers', 'meters', 'puzzle_widgets', 'combinations', 'views', 'phases'):
        walk(s.get(key, []))
    walk(s['setting'].get('actions', []))

    vp['voice_relink'] = relink
    json.dump(vp, open(MAP, 'w'), indent=1, ensure_ascii=False)
    out = json.dumps(s, indent=2, ensure_ascii=False)
    out = re.sub(r'\[\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\s*\]', r'[\1, \2]', out)
    open(PATH, 'w').write(out + '\n')
    print(f'voice pass: {changed} line(s) replaced; {len(unhooked)} recorded clip(s) unhooked until re-recorded: {", ".join(sorted(set(unhooked))) or "none"}')


if __name__ == '__main__':
    main()
