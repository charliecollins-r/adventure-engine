"""Key the rope-crossing frames (blue backdrop) into sprites/character_rope.png: the player hanging hand over hand.

    cd scenarios/the-harvest && python3 scripts/build_rope_sheet.py

Inputs: sprites/raw/rope_hang_{base,reach,swing}.png (Gemini: a base frame plus two edits).
The frames are aligned on the hands: the hands sit at the top centre of every cell, which is the point the sprite
set's `anchor: "top"` puts on the rope. They're scaled so his body (head to boots) matches the standing sprite,
so `scale` stays the player's 0.35. Sheet order: hang, reach, hang, swing (a hand-over-hand loop).
"""
import numpy as np
from PIL import Image

NAMES = ['base', 'reach', 'swing']
ORDER = ['base', 'reach', 'base', 'swing']
STANDING_BODY = 288          # head-to-boots of the standing sprite, in frame pixels (character_idle.png front row)

def key(path):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    alpha = np.clip((150 - (b - np.maximum(r, g))) / 70, 0, 1)
    out = a.copy(); out[..., 2] = np.minimum(b, np.maximum(r, g) + 12)
    return np.dstack([out, alpha * 255]).clip(0, 255).astype(np.uint8)

frames = {n: key(f'sprites/raw/rope_hang_{n}.png') for n in NAMES}
hands_x = []
for n, f in frames.items():                       # the grip: the opaque columns in the top rows
    cols = np.where(f[:40, :, 3].max(axis=0) > 128)[0]; hands_x.append((cols.min() + cols.max()) / 2)
hx = round(sum(hands_x) / len(hands_x))
right = max(np.where(f[..., 3].max(axis=0) > 128)[0].max() for f in frames.values())
left = min(np.where(f[..., 3].max(axis=0) > 128)[0].min() for f in frames.values())
half = max(hx - left, right - hx) + 4
bottom = max(np.where(f[..., 3].max(axis=1) > 128)[0].max() for f in frames.values()) + 2
base = frames['base']; head_top = np.where(base[:, int(hx) + 80: int(hx) + 140, 3].max(axis=1) > 128)[0].min()   # top of the head, beside the arms
body = bottom - head_top
s = STANDING_BODY / body
W, H = round(2 * half * s), round(bottom * s)
cells = {n: Image.fromarray(f).crop((hx - half, 0, hx + half, bottom)).resize((W, H), Image.LANCZOS) for n, f in frames.items()}
CW, CH = 300, 410                 # every player sprite set shares the character's 300x410 cell
assert W <= CW and H <= CH, (W, H)
sheet = Image.new('RGBA', (CW * len(ORDER), CH), (0, 0, 0, 0))
for i, n in enumerate(ORDER): sheet.paste(cells[n], (i * CW + (CW - W) // 2, 0))   # hands at the top centre of the cell
sheet.save('sprites/character_rope.png', optimize=True)
print(f'sprites/character_rope.png: {len(ORDER)} cells of {CW}x{CH}, figure {W}x{H} hanging from the top centre (scale {s:.3f}); hands to boots = {H} frame px')
