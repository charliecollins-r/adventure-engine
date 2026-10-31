# Hotspot Positioning Guide

> Deep reference for placing objects accurately in the Adventure Engine.
> For the quick-start version, see the **Coordinate System** section in [ADVENTURE_BUILDER.md](../ADVENTURE_BUILDER.md).

---

## Three Coordinate Spaces

The engine uses three distinct coordinate spaces. Mixing them up is the #1 source of misplaced hotspots.

```
┌─────────────────────────────────────────────────────────────────┐
│  1. IMAGE SPACE                                                 │
│     Whatever your background image's native resolution is.      │
│     Example: 1376×768, 1920×1080, 1280×720                     │
│     This is where you measure pixel positions in an editor.     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    json_x = img_x × (960 / IMG_W)
                    json_y = img_y × (720 / IMG_H)
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. JSON COORDINATE SPACE (960×720)                             │
│     This is what you write in scenario.json.                    │
│     Position = top-left corner of the hotspot rectangle.        │
│     Bounds: x + width ≤ 960, y + height ≤ 720                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    rendered_x = json_x × 1.0   (SCALE_X)
                    rendered_y = json_y × 0.75  (SCALE_Y)
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. VIEWPORT (960×540 pixels)                                   │
│     What the player actually sees in the browser.               │
│     Background rendered with object-fit: cover.                 │
│     Hotspots are absolutely-positioned <div> elements.          │
└─────────────────────────────────────────────────────────────────┘
```

**Key insight**: You never write viewport coordinates directly. You write JSON coordinates (960×720) and the engine compresses Y by 25% to render in the 960×540 viewport.

---

## Position Semantics

`position: { x, y }` is the **top-left corner** of the hotspot box, not the center.

```
  (x, y) ──────────────────┐
    │                       │
    │    hotspot area        │
    │    (width × height)    │
    │                       │
    └───────────────────────┘
                    (x+width, y+height)
```

This means:
- To center a 60×40 hotspot on a visual element at JSON position (300, 400), use `position: {x: 270, y: 380}` — offset by half the size.
- Objects near the right/bottom edges need careful bounds checking: `x + width ≤ 960`, `y + height ≤ 720`.

---

## Y Compression

The JSON space is 960×720 but the viewport is 960×540. The Y axis is compressed by 0.75:

| JSON Y | Viewport Y | Visual position |
|--------|-----------|-----------------|
| 0      | 0         | Top edge        |
| 180    | 135       | Quarter down    |
| 360    | 270       | Middle          |
| 540    | 405       | Three-quarters  |
| 720    | 540       | Bottom edge     |

Widths render 1:1. Heights are compressed 25% — a 100px-tall JSON hotspot renders as 75px on screen.

---

## Image-to-JSON Conversion

### General Formula

For an image of dimensions `IMG_W × IMG_H`:

```
json_x = img_x × (960 / IMG_W)
json_y = img_y × (720 / IMG_H)
json_w = img_w × (960 / IMG_W)
json_h = img_h × (720 / IMG_H)
```

### Quick Reference Table

| Image Resolution | X Factor | Y Factor | Notes |
|-----------------|----------|----------|-------|
| 1920×1080       | 0.500    | 0.667    | Recommended resolution |
| 1376×768        | 0.698    | 0.9375   | Current Harvest backgrounds |
| 1280×720        | 0.750    | 1.000    | Y maps 1:1 |
| 1024×768        | 0.9375   | 0.9375   | 4:3 — will be cropped by cover |

### object-fit: cover Behavior

The engine renders backgrounds with `object-fit: cover`, which scales the image to fill the 960×540 viewport and crops any overflow. For 16:9 images (1920×1080, 1376×768), the match is nearly exact with minimal cropping. Non-16:9 images will be cropped from the edges — account for this when measuring positions near borders.

---

## Spatial Vocabulary

Use these ranges as starting points when placing objects by description rather than measurement:

### Horizontal Positions (X axis, 0–960)

| Region | X Range | Example |
|--------|---------|---------|
| Far left | 0–100 | Left wall fixtures, alcoves |
| Left | 100–300 | Left-side furniture, doorways |
| Left-center | 300–420 | Items left of center |
| Center | 420–540 | Focal point objects |
| Right-center | 540–660 | Items right of center |
| Right | 660–860 | Right-side furniture, doorways |
| Far right | 860–960 | Right wall fixtures, alcoves |

### Vertical Positions (Y axis, 0–720)

| Region | Y Range | Example |
|--------|---------|---------|
| Ceiling/top | 0–100 | Hanging items, skylights |
| Upper wall | 100–250 | Wall-mounted objects, signs |
| Eye level | 250–380 | Switches, panels, shelves |
| Table/counter | 380–480 | Items on surfaces |
| Lower/floor | 480–600 | Floor objects, low furniture |
| Ground | 600–720 | Floor-level hotspots, passages |

---

## Object Size Ranges by Type

| Object Type | Typical Width | Typical Height | Notes |
|------------|---------------|----------------|-------|
| Small item (key, note) | 25–40 | 20–35 | Minimum 25×25 for clickability |
| Medium item (book, tool) | 40–80 | 35–70 | |
| Large object (desk, crate) | 80–200 | 60–150 | |
| Nav hotspot (doorway) | 100–360 | 150–400 | Cover the entire visible opening |
| Nav hotspot (passage) | 100–250 | 80–200 | |
| Wall-spanning feature | 200–500 | 100–300 | Bookshelves, windows, murals |
| Floor area / zone | 200–400 | 100–200 | Searchable floor areas |

Nav hotspots should be generous — frustrating click targets break immersion.

---

## Working From Screenshots

When you have a screenshot of the game viewport (960×540) rather than the raw background image:

1. **Measure pixel positions in the screenshot** — `(screen_x, screen_y)`
2. **Convert to JSON space**: `json_x = screen_x` (X is 1:1), `json_y = screen_y / 0.75` (undo Y compression)
3. **Convert sizes**: `json_w = screen_w`, `json_h = screen_h / 0.75`
4. **Validate bounds**: `json_x + json_w ≤ 960`, `json_y + json_h ≤ 720`

### Working From Annotated Screenshots

If someone circles or boxes a region on a screenshot:
1. Estimate the bounding rectangle of the annotation
2. Apply the screenshot-to-JSON conversion above
3. Add 10–15% padding for comfortable clicking
4. Check that the padded hotspot doesn't extend past 960×720

---

## Debug Mode

Toggle **Debug Mode** from the title bar in-game to show all hotspot boundaries:

- **Gold outlines** — regular interactive objects
- **Red outlines** — navigation hotspots (`nav_` prefix)
- **Cyan outlines** — objects with active animations
- **Labels** — object names shown on hover

### Debug Workflow

1. Set approximate positions in the JSON
2. Run `cd client && npm run dev` → load the scenario
3. Toggle Debug Mode on
4. Compare outlines to the painted background
5. Adjust JSON values → save → the page hot-reloads
6. Repeat until all hotspots align with their visual targets

---

## Common Mistakes

1. **Using center instead of top-left** — Position is the top-left corner. To place a hotspot centered on a visual element, subtract half the hotspot size from the element's center coordinates.

2. **Forgetting to convert image coordinates** — Raw pixel positions from a 1920×1080 image need halving for X and ×0.667 for Y. Always apply the conversion formula.

3. **Exceeding bounds** — `position.x + size.width` must be ≤ 960, `position.y + size.height` must be ≤ 720. Objects that exceed bounds render partially or fully outside the viewport.

4. **Mixing coordinate spaces** — Screenshot coordinates (960×540) are NOT the same as JSON coordinates (960×720). X is identical but Y differs by the 0.75 factor.

5. **Ignoring aspect ratio cropping** — `object-fit: cover` crops non-16:9 images. Positions near edges may not align if the image is cropped. Check with debug mode.

---

## AI Agent Checklist

When generating or modifying object positions:

- [ ] Check actual background image dimensions (don't assume 1920×1080)
- [ ] Apply correct conversion factor: `960/IMG_W` for X, `720/IMG_H` for Y
- [ ] Position is top-left corner, not center
- [ ] Validate: `position.x + size.width ≤ 960`
- [ ] Validate: `position.y + size.height ≤ 720`
- [ ] Check for significant overlap with other objects in the same view
- [ ] Nav objects have generous sizing (easy click targets)
- [ ] Small objects are at least 25×25
- [ ] Test with debug mode if possible
