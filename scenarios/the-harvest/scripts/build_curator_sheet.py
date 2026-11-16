"""Key the Curator frames (green backdrop) and build sprites/curator.png.

    cd scenarios/the-harvest && python3 scripts/build_curator_sheet.py

Inputs: sprites/raw/curator_{base,tilt_a,tilt_b,glow}.webp (Gemini, the base plus three edits).
All frames share ONE crop so nothing jitters; the sheet repeats the base for a slow, uneasy idle.
"""
import numpy as np
from PIL import Image

NAMES = ['base', 'tilt_a', 'tilt_b', 'glow']
ORDER = ['base', 'base', 'base', 'tilt_a', 'tilt_a', 'base', 'base', 'tilt_b', 'tilt_b', 'base', 'base', 'glow', 'base']
SCALE = 0.5  # the raw frames are upscaled pixel art; halve them

def key(path):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    h, w, _ = a.shape
    corners = np.concatenate([a[:20, :20].reshape(-1, 3), a[:20, -20:].reshape(-1, 3), a[-20:, :20].reshape(-1, 3), a[-20:, -20:].reshape(-1, 3)])
    bg = np.median(corners, axis=0)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    greenness = g - np.maximum(r, b)                      # the backdrop is far greener than anything on the figure
    dist = np.linalg.norm(a - bg, axis=2)
    alpha = np.clip((np.minimum(dist, 255) - 60) / 60, 0, 1) * np.clip((120 - greenness) / 60, 0, 1)
    out = a.copy()
    spill = g > np.maximum(r, b)                           # despill: no green fringe on the dark body
    out[..., 1] = np.where(spill, np.maximum(r, b), g)
    rgba = np.dstack([out, alpha * 255]).clip(0, 255).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')

frames = {n: key(f'sprites/raw/curator_{n}.webp') for n in NAMES}
box = None
for im in frames.values():
    bb = im.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox()
    box = bb if box is None else (min(box[0], bb[0]), min(box[1], bb[1]), max(box[2], bb[2]), max(box[3], bb[3]))
frames = {n: im.crop(box) for n, im in frames.items()}
fw, fh = round(frames['base'].width * SCALE), round(frames['base'].height * SCALE)
frames = {n: im.resize((fw, fh), Image.LANCZOS) for n, im in frames.items()}
sheet = Image.new('RGBA', (fw * len(ORDER), fh), (0, 0, 0, 0))
for i, n in enumerate(ORDER): sheet.paste(frames[n], (i * fw, 0))
sheet.save('sprites/curator.png', optimize=True)
print(f'sprites/curator.png: {len(ORDER)} frames of {fw}x{fh}')
