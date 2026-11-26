"""The pilot's spacesuit sprites, v3: the owner's Gemini sheets with an opaque amber helmet (no helmet drawing here).

    cd scenarios/the-harvest && python3 scripts/build_eva_v3.py

Inputs: intro/sprites/raw/v3/*.webp (poses side by side on #0000FF, 1376x768).
  eva_float.webp  4 weightless idle poses (also used while he drifts: no swimming in orbit)
  eva_rail.webp   4 poses holding a pure-red placeholder bar (grip, swing, reach up for the door, lean in)
  eva_turn.webp   4 poses at the same bar (uneasy glance, then he lets go, alarmed, facing us)
  eva_cutscene.webp  4 single poses for the cutscenes: drilling, alarm, taken, limp
Frames are found as figures (large components), not fixed columns. The red bar marks where his glove holds the
satellite's rail: rail and turn frames share one cell anchored on the bar's right end, and the bar is removed.
Outputs (intro/sprites/): eva_float_v3.png, eva_rail_v3.png, eva_turn_v3.png, eva_cutscene_v3.png. Prints sizes and anchors.
"""
import json
import numpy as np
from PIL import Image
from scipy import ndimage

RAW, OUT = 'intro/sprites/raw/v3', 'intro/sprites'


def figures(path):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    k = b - np.maximum(r, g)
    alpha = (k < 85)
    # the placeholder bar: pure red, wide and flat (the orange knee patches are not)
    cand = (r > 180) & (g < 60) & (b < 70)
    rl, rn = ndimage.label(ndimage.binary_closing(cand, iterations=2))
    red = np.zeros_like(cand); bars = []
    for i in range(1, rn + 1):
        ys, xs = np.where(rl == i)
        if len(ys) > 40 and (xs.max() - xs.min()) > 2 * (ys.max() - ys.min() + 1):
            red |= rl == i; bars.append((xs.min(), xs.max(), int(np.median(ys))))
    # pieces of the bar inside his fist are too small to pass the test above: any red next to a bar is bar
    red |= ndimage.binary_dilation(cand, iterations=1) & ndimage.binary_dilation(red, iterations=45)
    # the bar's dark outline and anti-aliasing go with it; the white glove over it stays
    zone = ndimage.binary_dilation(red, iterations=7)
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    # near the bar keep only the white glove (light and neutral); its outline there goes too, which nobody sees
    red |= zone & ((lum < 150) | (np.abs(r - b) > 35) | (np.abs(r - g) > 35))
    body = ndimage.binary_opening(alpha & ~red, iterations=1)
    lab, n = ndimage.label(body)
    sizes = ndimage.sum(body, lab, range(1, n + 1))
    big = [i + 1 for i, s in enumerate(sizes) if s > 0.25 * sizes.max()]
    cents = {i: np.mean(np.where(lab == i)[1]) for i in big}
    own = np.zeros_like(lab)
    for i in range(1, n + 1):
        if sizes[i - 1] < 30: continue
        xs = np.mean(np.where(lab == i)[1])
        j = min(big, key=lambda c: abs(cents[c] - xs))
        own[lab == i] = j
    edge = ndimage.binary_dilation(~alpha, iterations=1) & alpha
    b2 = np.where(edge, np.minimum(b, np.maximum(r, g) + 10), b)
    rgb = np.dstack([r, g, b2]).clip(0, 255).astype(np.uint8)
    out = []
    for i in sorted(big, key=lambda c: cents[c]):
        m = own == i
        ys, xs = np.where(m)
        fr = np.zeros((a.shape[0], a.shape[1], 4), np.uint8)
        fr[..., :3] = rgb; fr[..., 3] = np.where(m, 255, 0)
        # the bar this figure holds: the nearest one to its right
        # the bar this figure holds: the first bar whose right end is right of the figure's middle (a glove can hide
        # its left part, so the right end is the reference)
        bar = min((bb for bb in bars if bb[1] > np.mean(xs)), key=lambda bb: bb[1], default=None)
        out.append({'rgba': fr, 'bbox': (xs.min(), ys.min(), xs.max(), ys.max()), 'bar': bar,
                    'centre': (int(np.mean(xs)), int(np.mean(ys)))})
    return out


def sheet(frames, anchors, name):
    left = max(ax - f['bbox'][0] for f, (ax, ay) in zip(frames, anchors))
    right = max(f['bbox'][2] - ax for f, (ax, ay) in zip(frames, anchors))
    up = max(ay - f['bbox'][1] for f, (ax, ay) in zip(frames, anchors))
    down = max(f['bbox'][3] - ay for f, (ax, ay) in zip(frames, anchors))
    cw, ch = int(left + right + 2), int(up + down + 2)
    img = Image.new('RGBA', (cw * len(frames), ch))
    for i, (f, (ax, ay)) in enumerate(zip(frames, anchors)):
        x0, y0, x1, y1 = f['bbox']
        crop = Image.fromarray(f['rgba']).crop((x0, y0, x1 + 1, y1 + 1))
        img.alpha_composite(crop, (int(i * cw + left - (ax - x0)), int(up - (ay - y0))))
    img.save(f'{OUT}/{name}.png')
    return {'frame_width': cw, 'frame_height': ch, 'anchor_x': int(left), 'anchor_y': int(up), 'frames': len(frames)}


info = {}
fl = figures(f'{RAW}/eva_float.webp')
# idle loop: anchored on the body's centre so the torso stays put; the sprite's bottom-centre is the cell's bottom-centre
fl = fl[1:3]   # poses 2 and 3 differ only a little: a breathing loop (1 has a hand on the drill, 4 is a side view)
info['eva_float_v3'] = sheet(fl, [f['centre'] for f in fl], 'eva_float_v3')
rail, turn = figures(f'{RAW}/eva_rail.webp'), figures(f'{RAW}/eva_turn.webp')
both = rail + turn
anch = [(f['bar'][1], f['bar'][2]) for f in both]       # the bar's right end (the rail runs on from there)
cell = sheet(both, anch, 'eva_rail_all')
im = Image.open(f'{OUT}/eva_rail_all.png'); cw = cell['frame_width']
im.crop((0, 0, cw * len(rail), cell['frame_height'])).save(f'{OUT}/eva_rail_v3.png')
im.crop((cw * len(rail), 0, cw * len(both), cell['frame_height'])).save(f'{OUT}/eva_turn_v3.png')
import os; os.remove(f'{OUT}/eva_rail_all.png')
info['eva_rail_v3'] = {**cell, 'frames': len(rail)}
info['eva_turn_v3'] = {**cell, 'frames': len(turn)}
cut = figures(f'{RAW}/eva_cutscene.webp')   # drilling, alarm (looking up), taken (arms flung up), limp
info['eva_cutscene_v3'] = sheet(cut, [f['centre'] for f in cut], 'eva_cutscene_v3')
json.dump(info['eva_rail_v3'], open(f'{OUT}/eva_rail_v3.json', 'w'), default=int)   # build_intro_v2.py places the pilot from this
print(json.dumps(info, indent=1, default=int))
