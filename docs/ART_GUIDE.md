# Art Guide — Generating, Processing, Sizing, and Placing Scenario Art

> **Audience:** scenario authors and AI agents. Everything here was learned building *The Harvest*. Follow it and new art will match the existing look on the first or second try instead of the fifth.

The engine renders two kinds of art on top of each other, and they deliberately use **two different styles**:

| Layer | Style | Why |
|-------|-------|-----|
| **Backgrounds** (`backgrounds/`, `closeups/`) | Painted: 2D gouache, visible brushstrokes, soft gradients (Sierra *King's Quest V/VI* painted backdrops) | Atmosphere, depth, mood |
| **Sprites and item icons** (`sprites/`, `items/`) | **VGA pixel art**: visible hand-placed pixels, limited palette, crisp dark outlines, stepped/dithered shading | Must match the player character, which is pixel art. A smoothly painted prop next to a pixel-art character looks pasted in |

The single most common rejection in review was *"too painterly"* or *"too high fidelity"* for a sprite. **Sprites must match the character's fidelity, not the background's.**

---

## Table of Contents

1. [Background Prompts](#background-prompts)
2. [Sprite and Item Prompts](#sprite-and-item-prompts)
3. [Processing Pipeline](#processing-pipeline)
4. [Sizing](#sizing)
5. [Placement](#placement)
6. [Inventory Icons](#inventory-icons)
7. [Composite and Procedural Sprites](#composite-and-procedural-sprites)
8. [Verifying In-Game](#verifying-in-game)
9. [Checklist](#checklist)

---

## Background Prompts

Generator: Google Gemini image models (Imagen / "Nano Banana"). Output 16:9, 1920×1080 or 1376×768.

Every prompt **opens** with:

```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.
```

and **closes** with:

```
Low camera angle looking UP from knee-height — [what that means in this scene]. Saturated colors despite the dark mood — [palette-specific color description]. No text, no UI elements, no characters.
```

Rules that matter:

- **No characters, no loose props you will want to interact with.** Anything the player picks up should be a separate sprite (it has to disappear when taken). Fixed scenery the player only looks at can be painted in.
- **Anchor a palette per scenario** and repeat it in every prompt (The Harvest: bioluminescent teal/green, amber stasis fluid, rust, bone).
- **Leave walkable floor** in the lower third where the character stands.
- Describe interactive scenery explicitly ("an open morgue drawer at upper left", "a gap in the walkway with torn railing stubs on both sides") so hotspots have something to sit on.

Full background workflow and more examples: `.claude/skills/scenario-builder/SKILL.md` § 2.

---

## Sprite and Item Prompts

Generator: Gemini image ("Nano Banana 2" worked well). Square 1:1 output (1024×1024).

### The template

```
Single game [prop sprite | inventory item] in the style of 1990s Sierra On-Line King's Quest V VGA pixel art: visible hand-placed pixels, limited 256-color palette, crisp dark outlines, flat shading with stepped dithered gradients. NOT painterly, NOT airbrushed, NOT 3D rendered.
Subject: [what it is, what it's made of, its size relative to a forearm/hand/body, and the one or two details that make it read at small size].
Colors: [3–5 named colors]. [Wear, stains, damage.]
[View angle: "side view, upright, opening to the right" | "three-quarter top-down, lying flat"].
[Scenario aesthetic: "Dark bio-organic alien starship aesthetic, King's Quest meets H.R. Giger."]
One isolated object centered in a square frame with a generous empty margin. Flat solid pure blue (#0000FF) background, no cast shadow, no floor, no text, no other objects. Absolutely no blue tones anywhere on the object itself.
```

Why each clause is there:

| Clause | Reason |
|--------|--------|
| "VGA pixel art … NOT painterly" | Without it Gemini drifts toward smooth digital painting (the rejected look) |
| "flat solid pure blue (#0000FF)" | Chroma key. Pure blue barely overlaps skin, rust, bone, flesh, or green |
| "no blue tones on the object" | Any blue in the object is deleted by the key. If the object *must* be blue, use a green (#00FF00) key and `--color 0,255,0` |
| "no cast shadow, no floor" | The engine draws its own shadow (`shadow` field); a painted shadow doubles up and breaks the key |
| "one object, centered, generous margin" | Clean trim; nothing cut off at the frame edge |
| "the one or two details that read at small size" | Sprites render 20–150px tall. A barb, an eyelet, a buckle survives; fine engraving doesn't |
| explicit view angle | Must match how the object sits in the background (hanging, lying, wall-mounted) |

### Prompts that shipped (The Harvest grappling-line puzzle)

**Carcass hook** (world sprite and icon):
```
Single game prop sprite in the style of 1990s Sierra On-Line King's Quest V VGA pixel art: visible hand-placed pixels, limited 256-color palette, crisp dark outlines, flat shading with stepped dithered gradients. NOT painterly, NOT airbrushed, NOT 3D rendered. Subject: a heavy alien carcass hook used to drag bodies out of morgue drawers. One curved J-shaped hook of dark grown bio-metal, about forearm length, with a ridged bone-like texture like a vertebra or a talon. The tip is wickedly sharp with a small backward barb. At the top of the straight shank is a thick round eyelet ring big enough to tie a rope through. Colors: warm grey-green gunmetal with rust-orange corrosion, pale bone highlights along the ridges, a dried dark-red stain near the point. Shown upright in side view with the hook opening to the right. Dark bio-organic alien starship aesthetic, King's Quest meets H.R. Giger. One isolated object centered in a square frame with a generous empty margin. Flat solid pure blue (#0000FF) background, no cast shadow, no text, no other objects. Absolutely no blue tones anywhere on the object itself.
```

**Restraint strap** (icon only; the world version is painted into the background):
```
Single game inventory item in the style of 1990s Sierra On-Line King's Quest V VGA pixel art: visible hand-placed pixels, limited 256-color palette, crisp dark outlines, flat shading with stepped dithered gradients. NOT painterly, NOT airbrushed, NOT 3D rendered. Subject: one long severed alien restraint strap, a thick leathery band of grown bio-material in muted fleshy red-brown, worn smooth and glossy from struggling, with pale sinew ribbing along its length. One end has a heavy bone-like buckle with extra smaller holes punched crudely near it; the other end is freshly cut, clean and slightly frayed. Lying in a loose S-curve coil, three-quarter top-down view. Dark bio-organic alien starship aesthetic, King's Quest meets H.R. Giger. One isolated object centered in a square frame with a generous empty margin. Flat solid pure blue (#0000FF) background, no cast shadow, no text, no other objects. Absolutely no blue tones anywhere on the object itself.
```

**Combined item** (the crafted result gets its own icon so the combination is visible in inventory):
```
Same style and background rules as before. Subject: the same barbed bio-metal carcass hook with the [line] knotted through its eyelet ring, the line trailing off in two loose loops. Compact composition for an inventory icon, centered, generous margin, flat solid pure blue (#0000FF) background, no shadow, no text.
```
Tip: say "the same [object]" and paste the original subject description again, so the combined icon matches the parts. Gemini will still improvise materials (it drew the strap as a golden rope here), so compare it against the part icons before accepting.

### Animated sprites

Ask for a horizontal strip: *"N frames in a single horizontal row, evenly spaced, identical size and position in each frame, only [the moving part] changes"*. Then process with `--cols N`. Check that the object doesn't drift between frames: the corridor emergency panel jittered because its two frames were 96px apart horizontally. Fix drift by cropping per frame or keeping a single frame.

### When a result is too painterly

Re-prompt first. If the shape is right but the rendering is too smooth, quantize it:

```python
# 3× downscale + 96-color palette + nearest-neighbour upscale ("more KQ5 pixelation")
from PIL import Image; import numpy as np
im = Image.open('sprite.png').convert('RGBA')
small = im.resize((im.width // 3, im.height // 3), Image.BILINEAR)
q = small.convert('RGB').quantize(colors=96, method=Image.Quantize.MEDIANCUT).convert('RGBA')
a = np.array(q); a[:, :, 3] = np.array(small)[:, :, 3]
Image.fromarray(a).resize(im.size, Image.NEAREST).save('sprite.png')
```
2× / 128 colors is subtle; 4× / 64 colors is too blocky (NES look). 3× / 96 matched the character.

Never "pixelate" by blurring down and back up with bilinear filtering. That produces mush, not pixel art.

---

## Processing Pipeline

```bash
# 1. WebP → PNG (node-canvas may not decode WebP)
convert input.webp input.png

# 2. Key out the blue, despill the edges, trim tight
node tools/process-chromakey-sprite.mjs input.png --cols 1 --padding 0 --threshold 110 --out sprites/thing.png
#    --cols N        frames in a horizontal strip (animated sprites)
#    --threshold     colour distance from the key. 80 is default; 110 handles Gemini's
#                    off-pure blues like rgb(4,53,252). Raise if a blue haze remains,
#                    lower if dark-blue outlines are eaten
#    despill is ON by default: pixels within 2px of the removed background get their
#    blue cast neutralised. Without it you get a purple/blue fringe (the old bones sprite)

# 3. Single-frame sprites: make sure the PNG is trimmed (the tool trims; this is a safety net)
convert sprites/thing.png -trim +repage sprites/thing.png
```

**Verify on both a dark and a light backdrop.** Fringe that's invisible on dark teal shows up on white, and the reverse:

```bash
convert sprites/thing.png -background black -flatten /tmp/check_dark.png
convert sprites/thing.png -background white -flatten /tmp/check_light.png
```

Look for: blue/purple fringe, holes punched through the object (blue inside it got keyed), stray specks extending the bounding box, and enclosed regions that should be transparent (inside an eyelet, between rope loops) that stayed blue.

Keep the processed PNG's real dimensions in the JSON: `frame_width` × `frame_height` must equal the trimmed frame size.

---

## Sizing

The viewport is **960×540 screen pixels**. A sprite's on-screen size is:

```
screen_width  = frame_width  × scale
screen_height = frame_height × scale
```

So: `scale = desired_screen_height / frame_height`.

Note: sprite size is in **screen** pixels; positions are in the **960×720 JSON** space. Y positions get multiplied by 0.75, sprite sizes don't.

### Reference: The Harvest, Act 1 (on-screen heights)

| Thing | Screen height | Notes |
|-------|--------------:|-------|
| Player character (frame) | 144px | 410 × 0.35; the visible figure is **~97px** tall. Compare props to this |
| Cataloguer robot | 112px | Large machine, mid-depth |
| Maintenance hatch | 155px | Wall feature, near the camera |
| Emergency cabinet | 93px | Wall cabinet |
| Nutrient dispenser | 89px | Wall-mounted fixture |
| Carcass hook (morgue) | 60px | Oversized Choir hook on a drawer, mid-depth |
| Black cat | 34px | Small animal near the camera |
| Specimen tag | 26px | Hand-sized pickup |
| Neural tendril | 18px | Small pickup on the floor |

Rules of thumb:

- **Hand-held pickups:** 15–35px. Under ~15px nobody can click them; give them the `glimmer` animation so they're findable.
- **Scale with depth.** Objects at the back of the room are smaller than the same object near the camera. Match the painted furniture around them, not an absolute size.
- **Readable beats realistic.** A pickup can be ~1.5× its "true" size if that's what it takes to read. The carcass hook is bigger than a forearm because it's a hook sized for the Choir, who are larger than the player.

---

## Placement

### Anchoring (the #1 source of misplaced sprites)

| Object kind | `position` means | Clickable area |
|-------------|------------------|----------------|
| Plain hotspot (no `sprite`) | **Top-left corner** of the box, in 960×720 space | the `size` box |
| Sprite object (`sprite` set) | **Bottom-center** of the sprite, in 960×720 space | the sprite's rectangle (`size` is only used by the editor) |

So a sprite whose `position.y` sits on the floor line stands on the floor; one whose `position.y` is the underside of a shelf hangs below the shelf.

To place a sprite at a point you measured on the background image:

```
json_x = img_x × (960 / IMG_W)
json_y = img_y × (720 / IMG_H)      ← use the point where the object's BOTTOM-CENTER should touch
```

### Make placement mean something

- **Put it where the story says it is.** The carcass hook hangs from the lip of an open morgue drawer, because it's described as "jammed into the lip of an open drawer".
- **Put it on a surface.** Things rest on floors, shelves, and slabs, or hang from edges. Nothing should float on a wall with no support.
- **Avoid the character's standing spot** and nav hotspots. Overlapping sprites steal clicks.
- **Leave hotspots alone** if the author tuned them in the editor; adjust your sprite instead and note any hotspot you think is off.

---

## Inventory Icons

- File: `items/<item_id>.png`, referenced by the item's `icon_file`.
- Canvas: **326×273 transparent PNG**, object scaled to fit **240×230** and centered. All Harvest icons follow this so they line up in the inventory bar.
- Rendered **28px tall** with smooth (not pixelated) scaling, so silhouette is everything. Pick a view where the shape is unmistakable.
- **Crafted items get their own icon showing the combination** (hook *with* line), so the player can see the state change.

```python
from PIL import Image
im = Image.open('processed.png').convert('RGBA'); im.thumbnail((240, 230), Image.LANCZOS)
c = Image.new('RGBA', (326, 273), (0, 0, 0, 0)); c.paste(im, ((326 - im.width) // 2, (273 - im.height) // 2), im)
c.save('items/my_item.png')
```

A pickup usually needs both: a **world sprite** (`sprites/`, sized for the room) and an **icon** (`items/`). Both can come from the same generated image.

---

## Composite and Procedural Sprites

Some art has to meet exact points in the background, like a line strung between two railing stubs that already exist in the painting. A generated image won't hit those points, so draw it:

1. Measure the anchor points in **screen** space (resize the background to 960×540 and zoom in with a coordinate grid).
2. Draw on a transparent canvas covering just that region at **2× resolution**, so you can use `scale: 0.5`.
3. Reuse processed art where you can (the rigged line reuses the hook sprite, flipped to cup the far railing).
4. Use the object's own palette with a dark outline pass so it matches the pixel-art sprites.
5. `position` = bottom-center of that region: `x = (left + right) / 2`, `y = bottom / 0.75`.

Example: `sprites/grappling_line_rigged.png` in The Harvest. A strap drawn as a quadratic curve from the near railing stump (553, 413) to the hook's eyelet, plus the hook flipped vertically so its curve rests on the far stub (623, 437). The canvas covers screen (538, 392)–(650, 466) at 2×, so `scale: 0.5`, `position: {x: 594, y: 621}`. It starts hidden and appears through `show_object` when the player crosses.

---

## Repeated Frames (Mazes and Corridors)

When many screens must look interchangeable (a maze, a long corridor), consistency matters more than variety:

1. **Generate one hero frame first** (The Harvest's vent junction). Then make every variant as an **edit of that image**: attach it as the reference and say *"Keep EVERYTHING identical: camera position and height, room shape, ceiling lights, floor pipes, palette, brushwork. Change ONLY: 1) … 2) … 3) …"*. Edits keep the camera and lighting locked far better than fresh prompts.
2. **Ask for anonymity explicitly.** *"No scratched symbols, writing, debris or unique landmarks; indistinguishable from other generic screens."* Reject any result with a landmark, because landmarks defeat a maze.
3. **Mirror instead of generating** the right-handed versions of left-handed frames (`PIL.ImageOps.mirror` or `convert in.webp -flop out.webp`). Avoid text or numbers in frames you'll mirror.
4. **Mirror the hotspots too:** a box at `x..x+w` becomes `960−x−w..960−x`.
5. **Draw information-bearing images procedurally.** The vent map has to match the real layout exactly, so it's generated from the grid data (`scenarios/the-harvest/scripts/draw_vent_map.py`): multi-scale noise for rusted metal, riveted border, engraved strokes (a dark offset line under a light line, with jitter) for passages, and simple glyphs for landmarks. An AI image will not match a specific graph.

## Verifying In-Game

Do not report art as placed until you've seen it in the running game.

1. `cd client && npm run dev`, then open `http://localhost:5173/?dev`. Dev mode skips the intro, shows hotspot outlines, and has a **Views** tab to teleport.
2. `/editor.html` lets you drag sprites and hotspots, tune shadows, and export a position patch.
3. For agents: drive the game with Playwright (Chromium is preinstalled in cloud sessions). Gotchas:
   - The game viewport is the 960×540 element. Screen point = `(viewport.x + json_x, viewport.y + json_y × 0.75)`.
   - Click a sprite object at its visual center: `json_y − (frame_height × scale / 2) / 0.75`, not at `position`, which is its bottom edge.
   - There are no verb buttons. Right-click cycles **look → move → hand → talk**, and the default is look.
   - Use an item: click its inventory button (`button[title^="<Item Name> —"]`), dismiss the description message, then click the world object.
   - Messages are dismissed by clicking the panel that contains "click to dismiss".
   - Check: does it sit on a surface, is it the right size next to the ~97px character, does it overlap the character or a nav hotspot, and does the icon read at 28px?

---

## Checklist

- [ ] Prompt uses the template: pixel-art clauses, pure-blue background, no blue in the object, no shadow, one centered object
- [ ] WebP converted to PNG, processed with `process-chromakey-sprite.mjs --padding 0`
- [ ] Checked on dark and light backdrops: no fringe, no holes, no stray specks
- [ ] Looks like the same fidelity as the character (re-prompt or quantize if painterly)
- [ ] `frame_width`/`frame_height` match the trimmed PNG; `scale` from the desired on-screen height
- [ ] `position` is bottom-center for sprites (top-left for plain hotspots)
- [ ] Placed on a surface, consistent with the object's description text
- [ ] Inventory icon on the 326×273 canvas; crafted items have their own combined icon
- [ ] Seen in the running game (screenshot), next to the character
