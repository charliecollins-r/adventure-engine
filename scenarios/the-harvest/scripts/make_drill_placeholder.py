"""Stand-in pixel art for the spacewalk's bolt driver until real art replaces it at the same paths:
sprites/eva_drill_mounted.png (on LUMEN-7's tool mount) and items/eva_drill.png (the inventory icon).
Never overwrites a file that isn't a stand-in (a .placeholder marker sits beside each one it made)."""
import os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(__file__), '..')
INK, BODY, BODY_HI, GRIP, METAL, METAL_HI, AMBER = (24, 20, 18, 255), (214, 168, 52, 255), (246, 214, 110, 255), (58, 54, 62, 255), (150, 156, 168, 255), (220, 226, 236, 255), (255, 150, 40, 255)


def drill(scale):
    w, h = 20, 14
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rectangle([3, 2, 13, 6], fill=BODY, outline=INK)        # body
    d.line([4, 3, 12, 3], fill=BODY_HI)
    d.rectangle([13, 3, 15, 5], fill=METAL, outline=INK)      # chuck
    d.line([16, 4, 19, 4], fill=METAL_HI)                      # bit
    d.rectangle([6, 7, 9, 12], fill=GRIP, outline=INK)        # grip
    d.rectangle([4, 11, 11, 13], fill=BODY, outline=INK)      # battery
    d.point([10, 8], fill=AMBER)                               # trigger light
    return im.resize((w * scale, h * scale), Image.NEAREST)


def mounted(scale):
    m = drill(scale)
    w, h = m.size
    im = Image.new('RGBA', (w + 4 * scale, h + 6 * scale), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 3 * scale, h + 6 * scale - 1], fill=METAL, outline=INK)       # the mount's rail
    d.rectangle([0, 4 * scale, w, 6 * scale], fill=METAL, outline=INK)               # the clip arm
    im.alpha_composite(m, (2 * scale, 5 * scale))
    return im


def save(im, rel):
    path = os.path.join(OUT, rel)
    marker = path + '.placeholder'
    if os.path.exists(path) and not os.path.exists(marker):
        print('kept real art:', rel); return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path); open(marker, 'w').write('stand-in, replace with real art\n')
    print('wrote', rel, im.size)


save(mounted(3), 'sprites/eva_drill_mounted.png')
save(drill(6), 'items/eva_drill.png')
