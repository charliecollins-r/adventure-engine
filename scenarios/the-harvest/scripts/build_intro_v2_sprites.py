"""Build the opening's new sprites from the owner's Gemini art (idempotent).

    cd scenarios/the-harvest && python3 scripts/build_intro_v2_sprites.py

Inputs (intro/sprites/raw/, 4 frames side by side on #0000FF, 2000 px wide):
  eva_panel.webp  the pilot at the panel: grip the handle, pull, lean in and peer, turn to the camera
  eva_drift.webp  the pilot floating: a slow swimming cycle, drill on his belt
  harvester_edge.webp  the leading edge of the harvester (painted), for the stars-out scene
and two paintings (intro/backgrounds/): intro_panel.webp (door open) and intro_panel_empty.webp (the same, door removed).

Outputs (intro/sprites/):
  eva_panel_open.png  frames 1-3 (grip, pull, peer), played once as the door opens; eva_panel_turn.png  frame 4
      Both share one cell and one anchor: the grab bar in each frame is the fixed point (it is on the hull), so the
      pilot leans and pulls against it while it stays put.
  eva_drift.png  the swim cycle, aligned on the body.
  panel_door.png  the service door swinging open on its hinge, 8 frames: shut over the opening, turning edge-on, then
      open as painted. Cut from intro_panel.webp by its difference from intro_panel_empty.webp.
  harvester_edge.png  keyed, painted alpha.
Prints the frame sizes and placements for build_intro_v2.py.
"""
import json
import numpy as np
from PIL import Image
from scipy import ndimage

RAW = 'intro/sprites/raw'
OUT = 'intro/sprites'


def key_blue(path, soft=False):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    k = b - np.maximum(r, g)
    alpha = np.clip((150 - k) / 70, 0, 1) if soft else (k < 85).astype(np.float32)
    # despill: no blue fringe on the edges
    edge = alpha < 1
    b2 = np.where(edge, np.minimum(b, np.maximum(r, g) + 10), b)
    rgba = np.dstack([r, g, b2, alpha * 255]).clip(0, 255).astype(np.uint8)
    return rgba


def helmets(frames, raw_path, n=4):
    """The helmet is a clear bubble painted over the blue screen, so keying removes it, and the painted rims vary
    frame to frame (some broken). Fit a circle to each frame's painted rim, give every frame of the sheet the same
    radius, and draw one clean pixel-art helmet: glass (faint tint), a two-tone rim and a highlight arc."""
    raw = np.asarray(Image.open(raw_path).convert('RGB')).astype(np.float32)
    rr = frames_of(np.dstack([raw, np.full(raw.shape[:2], 255, np.float32)]), n)
    fits = []
    for f, rf in zip(frames, rr):
        r, g, b = rf[..., 0], rf[..., 1], rf[..., 2]
        H = f.shape[0]
        rim = (np.maximum(r, g) > 85) & (f[..., 3] < 128)
        rim[int(0.5 * H):] = False
        ys, xs = np.where(rim)
        # algebraic circle fit: x^2+y^2 + Dx + Ey + F = 0
        A = np.c_[xs, ys, np.ones_like(xs)]
        D, E, F = np.linalg.lstsq(A, -(xs ** 2 + ys ** 2), rcond=None)[0]
        cx, cy = -D / 2, -E / 2
        fits.append([cx, cy, np.sqrt(cx ** 2 + cy ** 2 - F)])
    R = float(np.median([f[2] for f in fits]))
    out = []
    for f, (cx, cy, _) in zip(frames, fits):
        f = f.copy()
        H, W = f.shape[:2]
        yy, xx = np.mgrid[0:H, 0:W]
        d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
        # the painted rim's leftovers just outside the new helmet (pale highlight strokes)
        stray = (d >= R) & (d < R + 16) & (yy < cy) & (f[..., :3].min(axis=2) > 140)
        f[..., 3] = np.where(stray, 0, f[..., 3])
        empty = f[..., 3] < 40
        inside = (d < R - 3) & empty
        f[inside] = [205, 225, 255, 38]                     # glass
        outer = (d >= R - 3) & (d < R) & empty
        f[outer] = [190, 210, 235, 255]                     # rim, pale
        edge = (d >= R) & (d < R + 2) & empty
        f[edge] = [40, 52, 80, 255]                         # dark outline (VGA style)
        ang = np.degrees(np.arctan2(yy - cy, xx - cx))
        hi = (d >= R - 9) & (d < R - 5) & (ang > -75) & (ang < -25) & empty
        f[hi] = [255, 255, 255, 200]                        # highlight, upper right
        out.append(f)
    return out


def frames_of(rgba, n=4):
    w = rgba.shape[1] // n
    return [rgba[:, i * w:(i + 1) * w].copy() for i in range(n)]


def clean(fr, keep_small=0.01):
    """Drop specks: keep components larger than keep_small of the largest."""
    m = fr[..., 3] > 128
    lab, n = ndimage.label(m)
    if n == 0: return fr, m
    sizes = ndimage.sum(m, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= keep_small * sizes.max()])
    fr[..., 3] = np.where(m & ~keep, 0, fr[..., 3])     # drop specks; faint glass (alpha < 128) stays
    return fr, keep


def sheet(frames, anchors, name):
    """frames: RGBA arrays; anchors: (ax, ay) per frame, the point that must not move. One shared cell."""
    left = max(ax - np.where(f[..., 3] > 0)[1].min() for f, (ax, ay) in zip(frames, anchors))
    right = max(np.where(f[..., 3] > 0)[1].max() - ax for f, (ax, ay) in zip(frames, anchors))
    up = max(ay - np.where(f[..., 3] > 0)[0].min() for f, (ax, ay) in zip(frames, anchors))
    down = max(np.where(f[..., 3] > 0)[0].max() - ay for f, (ax, ay) in zip(frames, anchors))
    cw, ch = int(left + right + 2), int(up + down + 2)
    out = Image.new('RGBA', (cw * len(frames), ch))
    for i, (f, (ax, ay)) in enumerate(zip(frames, anchors)):
        out.alpha_composite(Image.fromarray(f), (int(i * cw + left - ax), int(up - ay)))
    out.save(f'{OUT}/{name}.png')
    return cw, ch, int(left), int(up)


info = {}

# ── the pilot at the panel: anchored on the grab bar (the rightmost thing in each frame) and his boots' line ──
fr = [clean(f)[0] for f in helmets(frames_of(key_blue(f'{RAW}/eva_panel.webp')), f'{RAW}/eva_panel.webp')]
anch = []
for f in fr:
    ys, xs = np.where(f[..., 3] > 0)
    anch.append((xs.max(), ys.max()))            # bar's right edge, boot soles
cw, ch, ax, ay = sheet(fr[:3], anch[:3], 'eva_panel_open')
sheet([fr[3]], [anch[3]], 'eva_panel_turn_tmp')
# the turn frame must share the open sheet's cell exactly: rebuild both with all four, then split
all_w, all_h, l4, u4 = sheet(fr, anch, 'eva_panel_all')
im = Image.open(f'{OUT}/eva_panel_all.png')
im.crop((0, 0, all_w * 3, all_h)).save(f'{OUT}/eva_panel_open.png')
im.crop((all_w * 3, 0, all_w * 4, all_h)).save(f'{OUT}/eva_panel_turn.png')
import os
os.remove(f'{OUT}/eva_panel_all.png'); os.remove(f'{OUT}/eva_panel_turn_tmp.png')
info['eva_panel'] = {'frame_width': all_w, 'frame_height': all_h, 'bar_x_in_cell': l4, 'sole_y_in_cell': u4}

# ── the drift cycle: anchored on the body's centre and its lowest point ──
fr = [clean(f, 0.02)[0] for f in helmets(frames_of(key_blue(f'{RAW}/eva_drift.webp')), f'{RAW}/eva_drift.webp')]
anch = []
for f in fr:
    m = f[..., 3] > 0
    lab, n = ndimage.label(m)
    big = lab == (np.argmax(ndimage.sum(m, lab, range(1, n + 1))) + 1)
    ys, xs = np.where(big)
    anch.append((int(np.median(xs)), ys.max()))
cw, ch, ax, ay = sheet(fr, anch, 'eva_drift')
info['eva_drift'] = {'frame_width': cw, 'frame_height': ch, 'feet_x_in_cell': ax, 'feet_y_in_cell': ay}

# ── the harvester's edge: soft painted alpha, trimmed ──
h = Image.fromarray(key_blue(f'{RAW}/harvester_edge.webp', soft=True))
h = h.crop(h.getbbox())
h.save(f'{OUT}/harvester_edge.png')
info['harvester_edge'] = {'frame_width': h.width, 'frame_height': h.height}

# ── the panel door: cut from the painting, swung on its hinge ──
A = np.asarray(Image.open('intro/backgrounds/intro_panel.webp').convert('RGB')).astype(np.float32)
Bimg = Image.open('intro/backgrounds/intro_panel_empty.webp').convert('RGB').resize((A.shape[1], A.shape[0]), Image.LANCZOS)
B = np.asarray(Bimg).astype(np.float32)
diff = np.abs(A - B).sum(axis=2)
roi = np.zeros_like(diff, bool)
roi[100:720, 1080:1340] = True                     # the open door's neighbourhood (1376x768 pixels)
m = (diff > 70) & roi
m = ndimage.binary_closing(m, iterations=4)
m = ndimage.binary_fill_holes(m)
lab, n = ndimage.label(m)
m = lab == (np.argmax(ndimage.sum(m, lab, range(1, n + 1))) + 1)
m = ndimage.binary_opening(m, iterations=2)
m = ndimage.binary_erosion(m, iterations=3)          # shed the sliver of gold foil the difference picks up at the edges
ys, xs = np.where(m)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
door = np.dstack([A, m * 255]).astype(np.uint8)[y0:y1 + 1, x0:x1 + 1]
door_img = Image.fromarray(door)
hinge = x0                                          # the door hangs from the opening's right edge
open_w = x1 - x0 + 1
# the opening it covers when shut: the dark frame in the empty painting, left of the hinge
gray = B.mean(axis=2)
row = gray[(y0 + y1) // 2, :hinge]
dark = np.where(row < 70)[0]
opening_left = int(dark[dark > hinge - 420].min()) if len(dark) else hinge - 300
shut_w = hinge - opening_left
H = y1 - y0 + 1
W = x1 - opening_left + 1                           # every frame spans from the opening's left edge to the open door's edge
frames = []
widths = [(-1, 1.0), (-1, 0.62), (-1, 0.3), (0, 0.04), (1, 0.3), (1, 0.6), (1, 0.85), (1, 1.0)]
inside = door_img.transpose(Image.FLIP_LEFT_RIGHT)   # the door's other face, seen while it is shut
for side, k in widths:
    f = Image.new('RGBA', (W, H))
    if side < 0:
        w = max(2, int(shut_w * k))
        part = inside.resize((w, H), Image.LANCZOS)
        shade = Image.new('RGBA', part.size, (0, 0, 0, int(90 * (1 - k))))
        part = Image.alpha_composite(part, Image.composite(shade, Image.new('RGBA', part.size), part.split()[3]))
        f.alpha_composite(part, (hinge - opening_left - w, 0))
    elif side == 0:
        part = door_img.resize((max(3, int(open_w * k)), H), Image.LANCZOS)
        f.alpha_composite(part, (hinge - opening_left - part.width // 2, 0))
    else:
        w = max(2, int(open_w * k))
        part = door_img.resize((w, H), Image.LANCZOS)
        f.alpha_composite(part, (hinge - opening_left, 0))
    frames.append(f)
door_sheet = Image.new('RGBA', (W * len(frames), H))
for i, f in enumerate(frames): door_sheet.alpha_composite(f, (i * W, 0))
door_sheet.save(f'{OUT}/panel_door.png')
# placement in the 960x720 authoring space (the painting is drawn cover-fitted into 960x540: 1376 px -> 960)
k = 960 / A.shape[1]
info['panel_door'] = {'frame_width': W, 'frame_height': H, 'frames': len(frames), 'scale': round(k, 4),
                      'anchor_x': round((opening_left + W / 2) * k), 'anchor_y': round((y1 + 1) * 720 / A.shape[0]),
                      'hinge_x': round(hinge * k), 'opening_left_x': round(opening_left * k)}
print(json.dumps(info, indent=1, default=int))
