"""Key the intro cinematic's sprite frames and build the sheets in intro/sprites/.

    cd scenarios/the-harvest && python3 scripts/build_intro_sprites.py

Inputs: intro/sprites/raw/<sprite>_<frame>.(png|webp), Gemini output: a base frame plus edits on a flat
blue (#0000FF) or green (#00FF00) backdrop. Gemini returns edits at slightly different sizes, so frames are
matched to the base by the width of the boots (the part that never moves) and aligned on the feet before
ONE shared crop, so nothing jumps between frames. Prints each sheet's frame size for the scenario JSON.
Sheets whose raw frames are not there yet are skipped.
"""
import glob, os
import numpy as np
from PIL import Image

RAW = 'intro/sprites/raw'
# sprite: (backdrop, frames in sheet order, output scale, align)
SHEETS = {
    'pod_float': ('blue', ['base', 'a', 'b'], 0.5, 'feet'),
    'specimen_limp': ('blue', ['base', 'a'], 0.5, 'none'),
    'eva_float': ('green', ['base', 'a', 'b'], 0.5, 'none'),
    'eva_work': ('green', ['base', 'a', 'b'], 0.5, 'none'),
    'eva_look_up': ('green', ['a', 'base'], 0.5, 'none'),
    'eva_tumble': ('green', ['base', 'a'], 0.5, 'none'),
}

def load(name):
    for ext in ('png', 'webp', 'jpg'):
        p = f'{RAW}/{name}.{ext}'
        if os.path.exists(p): return np.asarray(Image.open(p).convert('RGB')).astype(np.float32)
    return None

def key(a, backdrop):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if backdrop == 'blue':
        k = b - np.maximum(r, g)
    else:
        k = g - np.maximum(r, b)
    alpha = np.clip((150 - k) / 70, 0, 1)                 # strongly blue/green = backdrop
    out = a.copy()
    other = np.maximum(r, g) if backdrop == 'blue' else np.maximum(r, b)
    ch = 2 if backdrop == 'blue' else 1
    out[..., ch] = np.minimum(out[..., ch], other + 12)    # despill the fringe
    return np.dstack([out, alpha * 255]).clip(0, 255).astype(np.uint8)

def feet_info(rgba):
    m = rgba[..., 3] > 128
    ys, xs = np.where(m); feet = ys.max()
    span = sum(np.ptp(np.where(m[feet - d])[0]) for d in (60, 90, 120))
    cx = xs[ys > feet - 120].mean()
    return feet, span, cx

for sprite, (backdrop, order, out_scale, align) in SHEETS.items():
    names = sorted(set(order))
    raws = {n: load(f'{sprite}_{n}') for n in names}
    if any(v is None for v in raws.values()):
        print(f'{sprite}: raw frames missing, skipped'); continue
    keyed = {n: key(a, backdrop) for n, a in raws.items()}
    if align == 'feet':
        bf, bspan, bcx = feet_info(keyed['base'])
        H, W = keyed['base'].shape[:2]
        placed = {}
        for n, im in keyed.items():
            f, span, cx = feet_info(im)
            s = bspan / span
            img = Image.fromarray(im).resize((round(im.shape[1] * s), round(im.shape[0] * s)), Image.LANCZOS)
            canvas = Image.new('RGBA', (W * 2, H * 2), (0, 0, 0, 0))
            canvas.paste(img, (round(W - cx * s), round(H + bf - f * s)), img)   # feet on (W, H + bf)
            placed[n] = canvas
    else:
        placed = {n: Image.fromarray(im) for n, im in keyed.items()}
    # one shared crop: the union of the frames, but cut at the lowest top so a tube/rope reaching the top
    # edge of the raw frames reaches the top of every frame
    boxes = [im.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox() for im in placed.values()]
    top = max(b[1] for b in boxes) if align == 'feet' else min(b[1] for b in boxes)
    box = (min(b[0] for b in boxes), top, max(b[2] for b in boxes), max(b[3] for b in boxes))
    frames = {n: im.crop(box) for n, im in placed.items()}
    fw, fh = round((box[2] - box[0]) * out_scale), round((box[3] - box[1]) * out_scale)
    frames = {n: im.resize((fw, fh), Image.LANCZOS) for n, im in frames.items()}
    sheet = Image.new('RGBA', (fw * len(order), fh), (0, 0, 0, 0))
    for i, n in enumerate(order): sheet.paste(frames[n], (i * fw, 0))
    sheet.save(f'intro/sprites/{sprite}.png', optimize=True)
    print(f'intro/sprites/{sprite}.png: {len(order)} frames of {fw}x{fh} ({" ".join(order)})')
