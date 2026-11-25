"""Turn the vents art runbook's raw pictures into game sprite sheets and item icons (idempotent).

Each raw picture is a blue-screen (green for the Curator's hand) Gemini image with several poses laid out in a
grid. This keys the backdrop out (with despill, like tools/process-chromakey-sprite.mjs), cuts out each pose, and
lays the poses side by side in one row of equal cells, every pose on the cell's bottom edge (or its left edge for
the hand, whose shoulder must stay put). Prints each sheet's frame size for scenario.json.

Usage (from scenarios/the-harvest): python3 scripts/build_vent_sprites_v6.py
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RAW = os.path.join(ROOT, 'sprites', 'raw')


def key(img, green=False, threshold=110):
    """Alpha from distance to the key colour, then pull the key colour out of the edge pixels."""
    a = np.asarray(img.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if green:
        dom = g - np.maximum(r, b)
    else:
        dom = b - np.maximum(r, g)
    alpha = np.clip((threshold - dom) / (threshold * 0.45), 0, 1)
    alpha[dom > threshold] = 0
    # despill: where the key colour still leaks into an edge, clamp that channel to the others
    if green:
        a[..., 1] = np.minimum(g, np.maximum(r, b) + 10)
    else:
        a[..., 2] = np.minimum(b, np.maximum(r, g) + 18)
    out = np.dstack([a, alpha * 255]).astype(np.uint8)
    # drop specks
    solid = out[..., 3] > 40
    lab, n = ndimage.label(solid)
    if n:
        sizes = ndimage.sum(solid, lab, range(1, n + 1))
        for i, sz in enumerate(sizes, 1):
            if sz < 60:
                out[lab == i, 3] = 0
    return Image.fromarray(out, 'RGBA')


def poses(img, boxes):
    """Cut each box (x0, y0, x1, y1) out of the keyed image and trim it to its pixels."""
    out = []
    for box in boxes:
        c = img.crop(box)
        bb = c.getchannel('A').point(lambda v: 255 if v > 30 else 0).getbbox()
        out.append(c.crop(bb) if bb else c)
    return out


def components(img, min_area=4000):
    """Boxes of the big separate shapes, top-to-bottom then left-to-right."""
    al = np.asarray(img.getchannel('A')) > 40
    al = ndimage.binary_closing(al, iterations=4)
    lab, n = ndimage.label(al)
    boxes = []
    for sl in ndimage.find_objects(lab):
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        if (y1 - y0) * (x1 - x0) >= min_area:
            boxes.append((x0, y0, x1, y1))
    boxes.sort(key=lambda b: (round(b[1] / 120), b[0]))
    return boxes


def sheet(frames, name, anchor='bottom', scale_to=None):
    if scale_to:
        frames = [f.resize((max(1, round(f.width * scale_to)), max(1, round(f.height * scale_to))), Image.LANCZOS) for f in frames]
    fw = max(f.width for f in frames)
    fh = max(f.height for f in frames)
    out = Image.new('RGBA', (fw * len(frames), fh), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        if anchor == 'bottom':
            x, y = i * fw + (fw - f.width) // 2, fh - f.height
        elif anchor == 'left':
            x, y = i * fw, (fh - f.height) // 2
        else:
            x, y = i * fw + (fw - f.width) // 2, (fh - f.height) // 2
        out.alpha_composite(f, (x, y))
    path = os.path.join(ROOT, name)
    out.save(path)
    print(f'{name}: {len(frames)} frames of {fw}x{fh}')
    return fw, fh


def main():
    load = lambda n: Image.open(os.path.join(RAW, n))
    # Warden crawl: 4 poses stacked
    k = key(load('warden_crawl.png'))
    sheet(poses(k, components(k)), 'sprites/warden_crawl.png')
    # worker breathing: a 2 x 3 grid, use all six in reading order
    k = key(load('vesk_worker.png'))
    sheet(poses(k, components(k)), 'sprites/vesk_worker.png')
    # scout: the two poses in the top band (the Warden below is the reference copy)
    k = key(load('vesk_scout_sheet.png'))
    top = k.crop((0, 0, k.width, 395))
    # the reference Warden's back plates poke up into the band at the lower left of the fleeing pose: cut them off
    arr = np.asarray(top).copy(); arr[338:, :712, 3] = 0; arr[338:, :430, 3] = np.asarray(top)[338:, :430, 3]
    top = Image.fromarray(arr, 'RGBA')
    al = np.asarray(top.getchannel('A')) > 40
    lab, n = ndimage.label(al)
    sizes = ndimage.sum(al, lab, range(1, n + 1))
    keep = [i + 1 for i in np.argsort(sizes)[::-1][:2]]
    frames = []
    for i in sorted(keep, key=lambda i: ndimage.find_objects(lab)[i - 1][1].start):
        sl = ndimage.find_objects(lab)[i - 1]
        m = (lab == i)
        arr = np.asarray(top).copy()
        arr[~m, 3] = 0
        frames.append(Image.fromarray(arr, 'RGBA').crop((sl[1].start, sl[0].start, sl[1].stop, sl[0].stop)))
    sheet(frames, 'sprites/vesk_scout.png')
    # larvae nest: 4 frames stacked
    k = key(load('vesk_larvae.png'))
    sheet(poses(k, components(k)), 'sprites/vesk_larvae.png')
    # the gassed worker: two poses side by side, drawn upright: lay it on its side (legs up, head left)
    k = key(load('vesk_sick.png'))
    sheet([f.rotate(90, expand=True) for f in poses(k, components(k))], 'sprites/vesk_sick.png')
    # the Curator's hand: green screen, 4 frames stacked, the shoulder on the left edge
    k = key(load('curator_hand.png'), green=True)
    sheet(poses(k, components(k, min_area=1500)), 'sprites/curator_hand.png', anchor='left')
    # cold fold: one pose
    k = key(load('cold_fold.png'))
    sheet(poses(k, components(k)), 'sprites/cold_fold.png', anchor='center')
    # breathing throat: 2 x 2 grid read as open, half, nearly shut, half
    k = key(load('breathing_throat.png'))
    sheet(poses(k, components(k)), 'sprites/breathing_throat.png', anchor='center')
    # membrane door: top row = open, shut
    k = key(load('membrane_door.png'))
    b = components(k)
    sheet(poses(k, b[:2]), 'sprites/membrane_door.png', anchor='center')
    # lever: up, down
    k = key(load('lever.png'))
    sheet(poses(k, components(k)), 'sprites/lever.png', anchor='bottom')
    # item icons
    for n in ('lung_sac', 'call_stone', 'hollowed_tag', 'queen_egg', 'claw_ring', 'mission_patch'):
        k = key(Image.open(os.path.join(ROOT, 'items', 'raw', f'item_{n}.png')))
        f = poses(k, [(0, 0, k.width, k.height)])[0]
        f.thumbnail((256, 256), Image.LANCZOS)
        f.save(os.path.join(ROOT, 'items', f'{n}.png'))
        print(f'items/{n}.png: {f.width}x{f.height}')


if __name__ == '__main__':
    main()
