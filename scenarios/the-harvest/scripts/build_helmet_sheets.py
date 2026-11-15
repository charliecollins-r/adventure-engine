"""Build the helmeted player sheets from the plain ones, so the helmet covers his whole head.

For every frame of sprites/character_idle.png and sprites/character_walk.png, find the head (the top
rows of the figure), then paste sprites/emergency_helmet.png over it, scaled to HELMET_W_PER_HEAD x the
head width and placed so the dome encloses the head and the visor sits over the face. Breathing and the
walk bob carry over because the head is found per frame. The left-facing look is a CSS mirror of the
right-facing row, so the helmet mirrors with him.

Usage (from scenarios/the-harvest):
  python3 scripts/build_helmet_sheets.py
"""
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SPR = os.path.join(HERE, '..', 'sprites')
FW, FH = 300, 410
HELMET_W_PER_HEAD = 1.8   # helmet width relative to the head's width
HEAD_ROWS = 50            # rows from the top of the figure that count as head (hair to chin)
DOME_TOP = 0.13           # fraction of the helmet's height above the head's top
DOME_CX = 0.47            # where the dome's centre is across the helmet art (0..1)

helmet = Image.open(os.path.join(SPR, 'emergency_helmet.png')).convert('RGBA')
helmet = helmet.crop(helmet.getbbox())


def head_box(frame):
    a = np.asarray(frame)[..., 3] > 40
    rows = np.where(a.any(axis=1))[0]
    if not len(rows):
        return None
    top = rows[0]
    xs = [np.where(a[y])[0] for y in range(top, min(top + HEAD_ROWS, FH))]
    xs = [x for x in xs if len(x)]
    left = int(np.median([x.min() for x in xs]))
    right = int(np.median([x.max() for x in xs]))
    return top, left, right


def helmet_frame(frame, facing_front):
    box = head_box(frame)
    out = frame.copy()
    if not box:
        return out
    top, left, right = box
    head_w = right - left + 1
    w = round(head_w * HELMET_W_PER_HEAD * (1.08 if facing_front else 1.0))
    h = round(helmet.height * w / helmet.width)
    hel = helmet.resize((w, h), Image.LANCZOS)
    cx = (left + right) / 2
    x = round(cx - DOME_CX * w)
    y = round(top - DOME_TOP * h)
    out.alpha_composite(hel, (max(-w, min(FW, x)), y)) if 0 <= y else out.paste(hel, (x, y), hel)
    return out


def build(src_name, out_name, rows_front):
    src = Image.open(os.path.join(SPR, src_name)).convert('RGBA')
    cols, rows = src.width // FW, src.height // FH
    out = Image.new('RGBA', src.size, (0, 0, 0, 0))
    for r in range(rows):
        for c in range(cols):
            f = src.crop((c * FW, r * FH, (c + 1) * FW, (r + 1) * FH))
            out.alpha_composite(helmet_frame(f, r in rows_front), (c * FW, r * FH))
    out.save(os.path.join(SPR, out_name))
    print('wrote', out_name, f'{cols}x{rows}')


if __name__ == '__main__':
    # Row 0 faces right, row 1 faces the camera (see sprite_sets.directions in scenario.json).
    build('character_idle.png', 'character_idle_helmet.png', rows_front={1})
    build('character_walk.png', 'character_walk_helmet.png', rows_front={1})
