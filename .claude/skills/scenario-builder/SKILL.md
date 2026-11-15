# Scenario Builder Skill

> Build a complete, plug-and-play scenario package for the Adventure Engine.
> This skill teaches you everything needed to create background images, sprite sheets, JSON scenario definitions, and all supporting assets from scratch.

---

## Overview

A scenario is a self-contained folder that the engine auto-discovers. No code changes needed. You produce:

1. **Background images** — one per view, Sierra KQ5/KQ6 style
2. **A `scenario.json`** — the entire game: views, objects, items, puzzles, interactions
3. **Sprite sheets** (optional) — animated characters/objects
4. **Audio** (optional) — ambient tracks, sound effects
5. **Item icons** (optional) — inventory art
6. **A `design.md`** — story/puzzle design doc with ready-to-paste image generation prompts
7. **Registration** — add to `scenarios/manifest.json`

---

## 1. Package Structure

```
scenarios/<scenario-id>/
├── scenario.json          # Game definition (REQUIRED)
├── design.md              # Story doc + Gemini prompts (recommended)
├── backgrounds/           # One image per view
│   ├── main_room.webp     #   1920x1080 recommended, any resolution works
│   └── closeup_desk.webp
├── sprites/               # Character/object sprite sheets
│   ├── character_idle.png
│   └── character_walk.png
├── closeups/              # Detail images for show_closeup effect
│   └── safe_interior.webp
├── audio/                 # Ambient audio + sound effects
│   ├── ambient_rain.mp3   #   MP3/WAV/OGG, loops automatically
│   └── door_open.wav
├── items/                 # Inventory item icons
│   └── rusty_key.png
└── ui/                    # Puzzle widget art (e.g. keypad key images)
```

The folder name IS the scenario ID. Use kebab-case: `the-haunted-manor`, `escape-from-mars`.

---

## 2. Background Image Generation

### Art Style

All backgrounds follow the **1990s Sierra On-Line King's Quest V / King's Quest VI** aesthetic:

- **2D gouache illustration** with visible brushstrokes
- Soft color gradients — NOT photorealistic, NOT 3D rendered
- **16:9 aspect ratio, 1920x1080** resolution
- **Low camera angle** — viewed by a small creature at knee-height, looking UP
- **Saturated colors** even in dark/horror scenes — shadows have visible blue/purple tones
- Consistent color palette anchored across ALL views in the scenario

### Gemini Prompt Formula (Google Gemini / Imagen 3)

Every prompt has three parts — Opening, Middle, Closing. Use this EXACT structure:

**Opening** (paste verbatim at start of every prompt):
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line
King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients,
NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.
```

**Middle** (your scene-specific description):
- Be EXTREMELY specific about what's visible — doors, passages, exits, objects
- Name exact lighting direction and color temperature
- Describe the color palette explicitly (e.g., "amber ceiling lights, teal walls, green floor glow")
- Mention architectural features the player will interact with

**Closing** (paste verbatim at end of every prompt):
```
Low camera angle looking UP from knee-height — [describe what that perspective
means for THIS scene]. Saturated colors despite the dark mood — [name specific
palette colors]. No text, no UI elements, no characters.
```

### Prompt Tips That Actually Work

- If results are too bright/friendly, add: "dark atmosphere, muted colors, unsettling"
- If results have wrong aspect ratio, re-emphasize "16:9 aspect ratio, 1920x1080"
- If you get 3D renders, add: "hand-painted, painterly style, lush detailed backgrounds"
- Always end with "No text, no UI elements, no characters" — Gemini will add UI chrome otherwise
- Describe ALL doors/passages/exits explicitly — the player needs visual navigation cues
- Name a consistent color palette across all prompts for the same scenario (e.g., "teal and amber" for all rooms)

### Example Prompt (complete, ready to paste)

```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line
King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients,
NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.

Interior of a lighthouse keeper's quarters. A round stone room at the top of the
tower. A brass telescope pointed at a rain-streaked window. A roll-top desk with
charts and logbooks. An oil lamp flickering on the desk. A spiral staircase
descending through the floor. A locked medicine cabinet on the wall. Rain hammering
the windows outside.

Low camera angle looking UP from knee-height — the desk and telescope tower above,
the spiral staircase is an intimidating descent into shadow. Saturated colors
despite the stormy mood — warm amber lamplight against cold blue-grey stone walls,
rain on the windows catching green-blue reflections. No text, no UI elements,
no characters.
```

### Rooms That Belong Together (the vent-maze recipe)

When several screens must read as one place (a maze, corridor runs, decks of a ship), follow **`docs/ART_GUIDE.md` → "Case Study: The Vent Maze"**. Every vent screen in The Harvest worked first try with it:

1. **Anchor to one approved background.** Attach it as a reference image to every prompt, and describe it literally in a style paragraph (geometry, materials, named colors, light sources, signature details).
2. **Place features by their hotspots, as frame fractions.** `x/960`, `y/720` become "from about 20% to 70% down". Do this for every object, every exit, and the clear floor where the character stands.
3. **Replace "no characters"** with "no people, no living creatures (the remains described above are part of the scenery)". Otherwise skeletons and corpses vanish.
4. **Preview the raw image against the hotspots** with `node tools/preview-hotspots.mjs <scenario.json> <view> --image new.webp`. Refit the boxes, move the character off holes and focal points, and move the lights onto painted light sources.
5. **Make interchangeable screens as numbered EDITS of one hero frame:** "Keep EVERYTHING identical … change ONLY: 1) 2) 3)", plus "anonymous, no landmarks". Never fresh prompts.
6. **Mirror right-handed variants** (`ImageOps.mirror`), and mirror their hotspots: `x → 960−x−w`.
7. **Reuse one hotspot geometry** in every generic screen.
8. **Design the layout around the frame classes you have art for**, and generate cells, maps and hints from data. Reference scripts: `scenarios/the-harvest/scripts/build_vent_maze.py`, `draw_vent_map.py`.
9. **Verify** with `tools/validate-scenario.mjs`, `tools/softlock-search.mjs`, and a browser walk with screenshots.

### Image Format

- Save as `.webp` (preferred, smaller files) or `.png`
- Place in `backgrounds/` subfolder
- File name should match the `background_file` path in JSON (e.g., `backgrounds/main_room.webp`)
- Any resolution works — the engine scales to fit with `object-fit: cover`

---

## 3. Sprite Sheet Creation

### When You Need Sprites

- **Player character** on backgrounds (optional — many scenarios work without one)
- **Animated objects** in the world (NPCs, machines, creatures)
- Characters need: idle pose (1-2 frames), walk cycle (4 frames), and any special animations

### Style: Pixel Art, Not Painted

Backgrounds are painted gouache. **Sprites and inventory icons are VGA pixel art** at the same fidelity as the player character: visible pixels, limited palette, crisp dark outlines. The most common reason art gets rejected is "too painterly". The full prompt template, the exact prompts that shipped, and the fix-up recipe for painterly results are in **`docs/ART_GUIDE.md`**. Read it before generating any sprite.

### Blue Chroma-Key Workflow

**Step 1 — Generate on pure blue.** End every sprite/item prompt with:
```
One isolated object centered in a square frame with a generous empty margin. Flat solid pure blue (#0000FF) background, no cast shadow, no floor, no text, no other objects. Absolutely no blue tones anywhere on the object itself.
```
(The engine draws its own shadows, so painted shadows double up and break the key. If the object itself must be blue, generate on green #00FF00 and pass `--color 0,255,0`.)

**Step 2 — Key, despill, trim** with the repo tool:
```bash
convert input.webp input.png      # node-canvas may not decode WebP
node tools/process-chromakey-sprite.mjs input.png --cols 1 --padding 0 --threshold 110 --out sprites/thing.png
# --cols N for an N-frame horizontal strip. Despill is on by default: it neutralises the
# blue cast on anti-aliased edge pixels (otherwise you get a purple fringe).
```

**Step 3 — Verify on dark AND light backdrops:**
```bash
convert sprites/thing.png -background black -flatten /tmp/dark.png
convert sprites/thing.png -background white -flatten /tmp/light.png
```
Look for fringe, holes keyed through the object, stray specks, and enclosed gaps (an eyelet, between rope loops) that stayed blue.

**Step 4 — Size and place** (details in `docs/ART_GUIDE.md`):
- `scale = desired_screen_height / frame_height`. The viewport is 960×540; the player figure is about 97px tall on screen. Hand-held pickups are 15–35px.
- Sprite `position` is the **bottom-center** in 960×720 space (plain hotspots use top-left). Rest it on a surface that matches the object's description.
- Inventory icon: 326×273 transparent PNG, object fitted into 240×230 and centered. Crafted items get their own combined icon.
- Screenshot it in the running game (`?dev`) next to the character before you call it done.

### Sprite Sheet Layout

Frames are laid out in a grid: columns = frames per animation, rows = directions.

```
┌─────┬─────┬─────┬─────┐
│ F0  │ F1  │ F2  │ F3  │  Row 0: direction[0] (e.g., "right")
├─────┼─────┼─────┼─────┤
│ F0  │ F1  │ F2  │ F3  │  Row 1: direction[1] (e.g., "down")
└─────┴─────┴─────┴─────┘
  columns: 4, rows: 2
```

**Rules:**
- Every frame in the sheet must be the SAME pixel dimensions (`frame_width` × `frame_height`)
- All sprite_sets for one character must share the same frame_width/frame_height
- Left-facing is handled via CSS `scaleX(-1)` flip — only generate right-facing frames
- Static sprites (idle poses) use `frame_rate: 0`
- For subtle idle animation, use a few frames at a low rate (The Harvest's idle is 12 frames at 2fps, mostly the base pose with a breath and a glance; see `docs/ART_GUIDE.md` → "Idle animations for the player character")

### Idle Breathing Animation Trick

Create a 2-frame breathing animation from a single static frame without generating new art:

```bash
# Frame 1: original
cp character_frame.png frame1.png

# Frame 2: shift character up by 3px (subtle breathing rise)
convert character_frame.png -gravity south -chop 0x3 -gravity north -splice 0x3 frame2.png

# Combine into sprite sheet (2 columns × N rows)
node tools/splice-sprites.mjs frame1.png frame2.png --cols 2 --output character_idle.png
```

This creates barely perceptible vertical oscillation at 1fps — enough to feel alive without looking twitchy. For a better result (head and shoulders lift, torso stretches, original pixels kept), see `scenarios/the-harvest/scripts/build_player_idle.py`.

### Splicing Separate Frames Into a Sheet

```bash
# Combine frames into a single sprite sheet PNG
node tools/splice-sprites.mjs frame1.png frame2.png frame3.png frame4.png \
  --cols 4 --output walk_cycle.png

# For multi-row sheets (multiple directions), generate each row separately
# then stack with ImageMagick:
convert right_row.png down_row.png -append full_sheet.png
```

### Character Config in JSON

```json
"character": {
  "sprite_sets": {
    "idle": {
      "file": "sprites/character_idle.png",
      "columns": 12,
      "rows": 2,
      "frame_rate": 2,
      "directions": ["right", "down"]
    },
    "walk": {
      "file": "sprites/character_walk.png",
      "columns": 4,
      "rows": 2,
      "frame_rate": 6,
      "directions": ["right", "down"]
    },
    "standup": {
      "file": "sprites/character_standup.png",
      "columns": 4,
      "rows": 1,
      "frame_rate": 3,
      "directions": ["right"],
      "loop": false
    }
  },
  "frame_width": 300,
  "frame_height": 410,
  "scale": 0.35,
  "shadow": {
    "width": 60,
    "height": 12,
    "opacity": 0.85,
    "offset_y": 2
  }
}
```

(These are The Harvest's real values; it also has `idle_helmet` and `walk_helmet` sets that a `set_character` effect switches to.)

**Sprite set names that mean something:** if a set is named exactly `standup`, the game plays it once (`"loop": false` holds the last frame) during the opening fade-in and then switches to the set named `idle`. Name them that way if you want the intro stand-up; any other names are free.

**Character shadow** renders as a radial-gradient ellipse beneath the sprite's feet. All fields optional — defaults: width = 60% of render width, height = 6px, opacity = 0.6, color = `rgba(0,0,0,0.5)`.

### Per-View Character Placement

Each view that shows the character needs a `character` block:

```json
{
  "id": "main_room",
  "background_file": "backgrounds/main_room.webp",
  "objects": ["door", "desk"],
  "character": {
    "x": 480,
    "y": 550,
    "facing": "right",
    "sprite_set": "idle",
    "frame": 0
  }
}
```

- Position is in **960×720 coordinate space** (see Coordinate System below)
- `x, y` = character's **bottom-center anchor point** (feet position)
- `facing`: `"down"`, `"left"`, `"right"`, or `"up"`
- Views without a `character` block (like closeup sub-views) show no sprite

---

### Walkable Floors (optional, recommended for main rooms)

To let the player walk in a view, add `"walk_area": { "floor": [[x, y], ...] }` (960x720 space, points in order around the floor; `blocked` outlines for furniture; optional `depth_scale`). The floor is **only open, painted floor**: the character is always drawn over the background, so any spot behind furniture, pipes, pods or a hatch lip makes him look like he is standing on it. Leave furniture out entirely (walk him around it), let doors sit off the floor (a click walks him to the nearest floor point), and check every floor with `node tools/preview-hotspots.mjs scenario.json <view> --clean --ghosts`, which draws his sprite at sample spots: every figure must stand on the floor. Pick the points from `node tools/preview-hotspots.mjs scenario.json <view> --grid` (or draw them in the editor's **Floor** tab, which shows the player under the mouse, red when off the floor, and saves straight into scenario.json), keep the view's `character.x`/`y` on the floor, then run `node tools/arrival-spots.mjs scenario.json --write` so he arrives by the door he came through, and `node tools/validate-scenario.mjs` (it warns about any object he can't reach). Close-ups stay without a character and without a floor. Reference: `docs/SCENARIO_SCHEMA.md` → Walkable Areas.

## 4. JSON Scenario Structure

The complete JSON reference is in `docs/SCENARIO_SCHEMA.md` (1700+ lines). Here is the practical guide to building one.

### Root Structure

```json
{
  "schema_version": "1.0",
  "metadata": { ... },
  "setting": { ... },
  "character": { ... },
  "views": [ ... ],
  "flags": { ... },
  "items": [ ... ],
  "combinations": [ ... ],
  "objects": [ ... ],
  "puzzle_widgets": [ ... ],
  "phases": [ ... ],
  "events": [ ... ],
  "killer": { ... },
  "win_conditions": [ ... ],
  "lose_conditions": [ ... ],
  "hints": [ ... ],
  "solution_paths": [ ... ]
}
```

Only `schema_version`, `metadata`, `setting`, `views`, `flags`, `items`, and `objects` are required. Everything else is optional. (The top-level `hints` array is the timed form from the schema and isn't read by the engine; put hints on views.)

### Metadata

```json
"metadata": {
  "id": "my-scenario",
  "title": "My Scenario",
  "description": "A short blurb shown in the scenario picker.",
  "author": "your-name",
  "difficulty": "easy|medium|hard|nightmare",
  "estimated_minutes": 30,
  "tags": ["horror", "escape", "puzzle"],
  "version": "1.0"
}
```

The `id` MUST match the folder name.

### Setting

```json
"setting": {
  "initial_view": "first_room",
  "ambient_text": "Text shown when the player is idle.",
  "room_style": {
    "background_color": "#1a1a2e",
    "wall_color": "#16213e",
    "floor_color": "#0f3460"
  },
  "ambient_audio": "audio/ambient.mp3",
  "intro_text": [
    "First screen of intro...",
    "Second screen...",
    "Third screen — player clicks through these."
  ],
  "sounds": {
    "room_transition": "audio/door.wav",
    "item_pickup": "audio/pickup.wav",
    "intro_voice": "audio/narration.mp3"
  }
}
```

- `ambient_audio` can be a string (single track) or array (layered tracks that play simultaneously)
- `intro_text` array = multi-screen intro the player clicks through before gameplay starts
- `sounds` paths are relative to the scenario folder. `room_transition`, `item_pickup` and `intro_voice` play automatically; any other key (e.g. `"discovery"`) can be played with `{ "type": "play_sound", "sound": "discovery" }`

### Views

Views are screens/locations. Each one has a background and a list of which objects appear in it.

```json
"views": [
  {
    "id": "main_room",
    "name": "Living Room",
    "background_key": "main_room",
    "background_file": "backgrounds/main_room.webp",
    "objects": ["door", "desk", "window", "nav_to_kitchen"],
    "character": { "x": 480, "y": 550, "facing": "down", "sprite_set": "idle", "frame": 0 },
    "hints": [
      { "text": "Try looking at the desk.", "when": [{ "type": "not_has_item", "item": "key" }] }
    ]
  },
  {
    "id": "desk_closeup",
    "name": "Desk",
    "background_key": "desk_closeup",
    "background_file": "backgrounds/desk_closeup.webp",
    "objects": ["drawer", "papers"],
    "back_label": "Step back"
  }
]
```

- `name`: displayed as a subtle room label at bottom-right of viewport
- `back_label`: shows a "◀ {back_label}" button at top-left that returns to the previous view (use for closeup sub-views)
- `hints`: per-view progressive hints — engine shows the LAST matching hint (most specific first = least helpful, most specific last = most helpful)
- An object can appear in multiple views (e.g., the same door seen from both sides)

### Objects

Objects are clickable hotspots. They have a position, size, visual, state, and interactions.

```json
"objects": [
  {
    "id": "wooden_door",
    "name": "Wooden Door",
    "description": "A heavy oak door with iron hinges.",
    "position": { "x": 100, "y": 200 },
    "size": { "width": 120, "height": 300 },
    "visual": { "color": "rgba(139, 90, 43, 0.3)", "label": "Door", "animation": "glimmer" },
    "initial_state": "locked",
    "initially_visible": true,
    "interactions": [ ... ]
  }
]
```

- `position`: top-left corner in 960×720 coordinate space
- `visual.color`: fill color in prototyping mode (no background image); over painted art hotspots are invisible
- `visual.animation`: `"glimmer"` or `"pulse"` — CSS animation to draw player attention (plain hotspots only; not drawn on objects with a `sprite`)
- `initially_visible: false` = hidden until a `show_object` effect reveals it
- Objects referenced by a view's `objects` array are rendered; unreferenced objects exist but are invisible

### The Four Verbs

| Verb | Purpose | JSON verb string |
|------|---------|------------------|
| Look | Examine visually. Always safe. | `"look"` |
| Move | Navigate between rooms. | `"move"` |
| Hand | Touch, push, pull, open, take. All physical interaction. | `"hand"` |
| Talk | Speak, listen, read aloud. | `"talk"` |
| Use Item | Implicit — player selects inventory item, clicks object. | `"use_item"` (with `"item"` field) |

There are no verb buttons: the player right-clicks to cycle look → move → hand → talk. `hand` also falls back to legacy `"take"` interactions.

### Interactions

Interactions follow the pattern: **verb + optional item + conditions → effects**.

```json
"interactions": [
  {
    "verb": "look",
    "when": [],
    "then": [
      { "type": "message", "text": "A rusty iron door. Locked." }
    ]
  },
  {
    "verb": "hand",
    "when": [{ "type": "object_state", "object": "door", "state": "locked" }],
    "then": [
      { "type": "message", "text": "You rattle the handle. Won't budge." }
    ]
  },
  {
    "verb": "use_item",
    "item": "iron_key",
    "when": [{ "type": "object_state", "object": "door", "state": "locked" }],
    "then": [
      { "type": "message", "text": "The key turns with a click." },
      { "type": "set_state", "object": "door", "state": "unlocked" },
      { "type": "remove_item", "item": "iron_key" }
    ]
  }
]
```

**Shorthand** for simple message responses:
```json
{ "verb": "look", "response": "A rusty door. Nothing special about it." }
```

This is equivalent to `"when": [], "then": [{ "type": "message", "text": "..." }]`.

**Interaction matching rules:**
1. Engine tries verb + conditions in order, returns the FIRST match
2. Put more specific conditions BEFORE less specific ones
3. Every object should have at least a `look` interaction (fallback shows `description`)
4. Every click produces KQ5-style feedback — never leave the player with silence

### Navigation Objects

Navigation between rooms uses `move` verb + `set_view` effect:

```json
{
  "id": "nav_to_kitchen",
  "name": "Kitchen Doorway",
  "description": "An arched doorway leading to the kitchen.",
  "position": { "x": 800, "y": 250 },
  "size": { "width": 100, "height": 300 },
  "visual": { "color": "rgba(100, 150, 255, 0.15)", "label": "→ Kitchen" },
  "initial_state": "open",
  "initially_visible": true,
  "interactions": [
    {
      "verb": "move",
      "when": [],
      "then": [{ "type": "set_view", "view": "kitchen" }]
    },
    {
      "verb": "look",
      "response": "A doorway to the kitchen. You can see tiles on the floor."
    }
  ]
}
```

Navigation objects (IDs starting `nav_`) sit above regular objects so they stay clickable. Hotspots are invisible in play; in debug mode nav objects are outlined red (blue on hover) and regular objects gold. `visual.label` is the debug hover label, so `"→ Kitchen"` is a handy convention.

### Conditions Reference

| Type | Fields | What it checks |
|------|--------|----------------|
| `flag_is` | `flag`, `value` | Flag equals value (defaults to `"true"`) |
| `flag_not` | `flag`, `value` | Flag does NOT equal value (defaults to `"true"`) |
| `object_state` | `object`, `state` | Object's current state matches |
| `has_item` | `item` | Player has this item in inventory |
| `not_has_item` | `item` | Player does NOT have this item |
| `view_is` | `view` | Player is in this view |
| `phase_is` | `phase` | Game is in this phase |
| `noise_above` | `threshold` | Noise meter > threshold |
| `noise_below` | `threshold` | Noise meter < threshold |
| `is_hiding` | — | Player is currently hiding |
| `not_hiding` | — | Player is NOT hiding |
| `item_count` | `count` | Player has >= this many items |
| `not_in_view` | `view` | Player is NOT in this view |
| `widget_solved` | `widget` | A puzzle widget has been solved |
| `any_of` | `conditions[]` | At least ONE sub-condition is true (OR) |
| `all_of` | `conditions[]` | ALL sub-conditions are true (AND) |

### Effects Reference

| Type | Key Fields | What it does |
|------|-----------|--------------|
| `message` | `text` | Show narrative text |
| `random_message` | `messages[]` | Show one random message from list |
| `set_flag` | `flag`, `value` | Set a game flag |
| `set_state` | `object`, `state` | Change an object's state |
| `add_item` | `item` | Add item to player inventory |
| `remove_item` | `item` | Remove item from inventory |
| `set_view` | `view` | Navigate to a view |
| `add_noise` | `amount` | Add to noise meter |
| `set_noise` | `amount` | Set noise to exact value |
| `show_object` | `object` | Make a hidden object visible |
| `hide_object` | `object` | Hide a visible object |
| `set_animation` | `object`, `value` | Set/clear animation on object. Pass `"value": ""` to clear. |
| `show_closeup` | `image` | Show detail image in overlay |
| `show_dialogue` | `prompt`, `choices[]` | Show branching dialogue UI |
| `open_widget` | `widget` | Open a puzzle widget overlay (keypad; see `docs/SCENARIO_SCHEMA.md` → Puzzle Widgets) |
| `game_over` | `result` ("win"/"lose"), `reason` | End the game |
| `advance_phase` | `phase` | Move to a new game phase |
| `start_hiding` | — | Player starts hiding |
| `stop_hiding` | — | Player stops hiding |
| `transform_item` | `item`, `into` | Replace one inventory item with another |
| `set_character` | `sprite_set`, `facing`, `x`, `y`, `frame`, `flip_h` | Change character appearance/position |
| `conditional_effect` | `when[]`, `then[]`, `else[]` | If conditions met → then effects, else → else effects |
| `delay_then` | `seconds`, `effects[]` | Wait N seconds then apply effects |
| `play_sound` | `sound` | Play a sound effect: a `setting.sounds` key, or a path relative to the scenario folder |

### Items

```json
"items": [
  {
    "id": "rusty_key",
    "name": "Rusty Key",
    "description": "An old iron key with teeth worn smooth.",
    "icon": "key",
    "icon_file": "items/rusty_key.png",
    "examine": [
      {
        "verb": "look",
        "when": [],
        "then": [{ "type": "message", "text": "Stamped on the bow: 'MASTER'." }]
      }
    ]
  }
]
```

- `icon`: fallback emoji/text label if no `icon_file`
- `icon_file`: path to inventory icon image (relative to scenario folder)
- `examine`: interactions triggered when the player examines the item in inventory

### Combinations

Craft two items into a new one:

```json
"combinations": [
  {
    "items": ["broken_wire", "battery"],
    "result": "charged_probe",
    "consumes": true,
    "message": "You connect the wire to the battery — it sparks to life."
  }
]
```

### Flags

Key/value string pairs that track progress:

```json
"flags": {
  "door_unlocked": "false",
  "code_discovered": "false",
  "guard_distracted": "false"
}
```

All flag values are strings. Check with `flag_is`/`flag_not`, set with `set_flag`.

### Dialogue Choices

The `show_dialogue` effect pauses the game and shows a conversation modal:

```json
{
  "type": "show_dialogue",
  "prompt": "The old man squints at you. 'What do you want?'",
  "choices": [
    {
      "label": "Ask about the key",
      "when": [{ "type": "has_item", "item": "broken_key" }],
      "then": [
        { "type": "message", "text": "'Ah, that old thing. The locksmith on Pine Street made it.'" },
        { "type": "set_flag", "flag": "knows_locksmith", "value": "true" }
      ]
    },
    {
      "label": "Ask about the weather",
      "then": [
        { "type": "message", "text": "'Storm's coming. Best get inside.'" }
      ]
    },
    {
      "label": "Leave",
      "then": [
        { "type": "message", "text": "You step away." }
      ]
    }
  ]
}
```

Choices with `when` conditions are hidden if conditions aren't met — the player only sees available options.

### Object Sprites (Animated World Objects)

```json
{
  "id": "spinning_globe",
  "name": "Holographic Globe",
  "description": "A slowly spinning hologram.",
  "position": { "x": 400, "y": 300 },
  "size": { "width": 100, "height": 120 },
  "visual": { "color": "rgba(100, 200, 255, 0.2)", "label": "Globe" },
  "initial_state": "active",
  "initially_visible": true,
  "sprite": {
    "file": "sprites/globe.png",
    "frame_width": 128,
    "frame_height": 128,
    "columns": 8,
    "rows": 1,
    "frame_rate": 4,
    "scale": 1.5
  },
  "interactions": [ ... ]
}
```

Object sprites are bottom-center anchored at the object's position, and the rendered sprite itself is the click target. `size` is only used by the editor for sprite objects (see `docs/ART_GUIDE.md` → Anchoring).

---

## 5. Coordinate System

### The 960×720 Space

All positions in the JSON use a **960×720 coordinate space**. Origin is top-left (0,0).

- Object `position` = **top-left corner** of the clickable hotspot box
- Character `x, y` = **bottom-center** of the sprite (feet position)
- The viewport renders at **960×540** pixels
- Scaling: `SCALE_X = 1.0`, `SCALE_Y = 0.75`

### Converting From Image Pixels to JSON Coordinates

If your background image is 1920×1080:

```
json_x = image_pixel_x × (960 / 1920) = image_pixel_x × 0.5
json_y = image_pixel_y × (720 / 1080) = image_pixel_y × 0.667
```

General formula:
```
json_x = image_pixel_x × (960 / IMAGE_WIDTH)
json_y = image_pixel_y × (720 / IMAGE_HEIGHT)
```

### Bounds Rule

Every hotspot must fit inside the coordinate space:
```
position.x + size.width  ≤ 960
position.y + size.height ≤ 720
```

### Positioning Workflow

1. Open the background image in a viewer and note pixel coordinates of each interactive element
2. Apply the conversion formula
3. Run the dev server (`cd client && npm run dev`)
4. Enable debug mode (the **Debug** button in the title bar, or open `http://localhost:5173/?debug`; `?dev` adds the dev panel) — shows colored hotspot outlines. `node tools/preview-hotspots.mjs <scenario.json> <view_id>` draws the same boxes on a PNG without running the game
5. Adjust positions until hotspots align with the painted art
6. Navigation hotspots should cover the visible doorway/passage in the art

---

## 6. Ambient Lighting (Optional)

Add dynamic glow effects per view:

```json
{
  "id": "lab",
  "background_file": "backgrounds/lab.webp",
  "objects": ["..."],
  "ambient_lighting": {
    "lights": [
      {
        "x": 0.5, "y": 0.3,
        "radius": 0.2,
        "color": [0, 255, 100],
        "pulse_speed": 1.5,
        "pulse_amount": 0.3,
        "alpha": 0.15
      }
    ],
    "flicker": true
  }
}
```

- `x, y` are normalized (0-1), NOT 960×720 coordinates
- `radius` is a fraction of the viewport's larger side (0.1–0.3 is typical)
- `color` is [R, G, B] (0-255)
- `pulse_speed`: oscillation frequency (cycles per second)
- `pulse_amount`: how deep the brightness pulse is (0-1)
- `alpha`: base opacity of the light overlay
- `phase` (optional): offset so lights don't pulse in sync
- `pulse_speed` and `pulse_amount` are required on every light: a missing one turns into NaN and breaks the lighting canvas (`tools/validate-scenario.mjs` flags it)

---

## 7. Win and Lose Conditions

```json
"win_conditions": [
  {
    "id": "escaped",
    "description": "You escaped the building!",
    "conditions": [{ "type": "flag_is", "flag": "escaped", "value": "true" }]
  }
],
"lose_conditions": [
  {
    "id": "caught",
    "description": "The guard found you.",
    "conditions": [{ "type": "flag_is", "flag": "caught", "value": "true" }]
  }
]
```

The engine checks these after every interaction (and after each `delay_then` batch). When one is met, the game shows a win/lose screen with the `description`. Win conditions are checked first.

---

## 8. Phases (Optional)

Phases divide the game into stages that change world behavior:

```json
"phases": [
  {
    "id": "exploration",
    "name": "Exploration",
    "starts_when": [],
    "on_enter": [
      { "type": "message", "text": "You begin exploring the house." }
    ]
  },
  {
    "id": "escape",
    "name": "Escape",
    "starts_when": [{ "type": "flag_is", "flag": "alarm_triggered" }],
    "on_enter": [
      { "type": "message", "text": "Alarms blare! You need to get out NOW!" }
    ],
    "killer_overrides": {
      "check_interval_seconds": 15,
      "noise_threshold_investigate": 3
    }
  }
]
```

The engine starts in the first phase and shows each phase's `ambient_text` while it is active. It does **not** evaluate `starts_when` yet, so move between phases explicitly with `{ "type": "advance_phase", "phase": "escape" }`. `killer_overrides` are for the planned killer AI.

### The `set_character` Effect

Dynamically change the character during gameplay:

```json
{ "type": "set_character", "sprite_set": "scared", "facing": "left" }
```

Useful for: changing pose after a scare, switching to a crawling animation in vents, showing a disguise.

---

## 9. Design Doc Format

Create a `design.md` alongside your scenario.json. Structure it like this:

```markdown
# Scenario Title — Design Documentation

## Story Synopsis
[2-3 paragraphs: who is the player, where are they, what happened, what's at stake]

## Act Structure (if multi-act)
| Act | Name | Setting | Views | Duration |
|-----|------|---------|-------|----------|

## Image Descriptions & Generation Prompts

### How to Use These Prompts
[Brief tips for the AI image tool you're targeting]

### View 1: `backgrounds/filename.webp` — [Description]
> **Gemini Prompt**: `[complete ready-to-paste prompt following the formula]`

### View 2: `backgrounds/filename.webp` — [Description]
> **Gemini Prompt**: `[complete ready-to-paste prompt]`

[... one entry per background]
```

The key is that every background image has a **ready-to-paste prompt** in the design doc. This makes regenerating or improving images trivial — just copy the prompt and paste into Gemini.

---

## 10. Registration & Testing

### Register Your Scenario

Add your scenario's folder name to `scenarios/manifest.json`:

```json
["the-harvest", "my-new-scenario"]
```

### Run and Test

```bash
cd client
npm install      # First time only
npm run dev      # Start dev server at http://localhost:5173
```

Select your scenario from the picker and play through (with only one ID in the manifest it launches straight away). Hot-reload is active — edit JSON, save, refresh.

### Debug Mode

Click **Debug** in the title bar (or add `?debug` to the URL; `?dev` also opens the dev panel and skips the intro) to toggle debug mode:
- Shows colored outlines on all hotspot boxes
- Gold borders = regular objects
- Red borders = navigation objects (blue on hover)
- Essential for verifying hotspot alignment with background art

`?view=<view_id>` starts the game in that view.

### Type Check

```bash
cd client && npx tsc -b
```

### Validate and Prove Solvable

```bash
node tools/validate-scenario.mjs scenarios/my-scenario/scenario.json
node tools/softlock-search.mjs scenarios/my-scenario/scenario.json --goal "flag:escaped=true"
```

The validator catches duplicate keys, `use_item` without `item`, object IDs used as item IDs, dangling references, missing assets, malformed lights, off-screen pickups and mis-ordered hints. The soft-lock search explores every reachable state with the real engine and reports any state from which the goal can't be reached.

### Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Object ID not in view's `objects` array | Object doesn't appear | Add ID to the view |
| `position.x + size.width > 960` | Object clipped or off-screen | Reduce position or size |
| `set_view` references non-existent view ID | "View not found" error | Check view ID spelling |
| Missing `background_file` on view | Blank room | Add the file path |
| `use_item` interaction without `"item"` field | Item use has no effect | Add `"item": "item_id"` |
| Flag checked before it's set | Condition never true | Initialize in `flags` object |
| Interaction order wrong | Wrong message shown | Most specific conditions first |
| Closeup view missing `back_label` | Player stuck | Add `"back_label": "Step back"` |

---

## 11. Complete Minimal Example

A 3-room scenario with 1 puzzle, ready to extend:

```json
{
  "schema_version": "1.0",
  "metadata": {
    "id": "template-scenario",
    "title": "Template Scenario",
    "description": "A starting template with 3 rooms and 1 puzzle.",
    "author": "builder",
    "difficulty": "easy",
    "estimated_minutes": 5,
    "tags": ["template"],
    "version": "1.0"
  },
  "setting": {
    "initial_view": "room_a",
    "ambient_text": "A quiet house. Something feels wrong.",
    "room_style": {
      "background_color": "#1a1a2e",
      "wall_color": "#16213e",
      "floor_color": "#0f3460"
    }
  },
  "views": [
    {
      "id": "room_a",
      "name": "Entrance Hall",
      "background_key": "room_a",
      "background_file": "backgrounds/room_a.webp",
      "objects": ["cabinet", "nav_to_room_b"]
    },
    {
      "id": "room_b",
      "name": "Study",
      "background_key": "room_b",
      "background_file": "backgrounds/room_b.webp",
      "objects": ["desk", "locked_door", "nav_back_to_a"]
    },
    {
      "id": "room_c",
      "name": "Garden",
      "background_key": "room_c",
      "background_file": "backgrounds/room_c.webp",
      "objects": ["gate"]
    }
  ],
  "flags": {
    "has_read_note": "false"
  },
  "items": [
    {
      "id": "brass_key",
      "name": "Brass Key",
      "description": "A small brass key with ornate teeth.",
      "icon": "key",
      "examine": [
        { "verb": "look", "when": [], "then": [{ "type": "message", "text": "Engraved: 'Study'." }] }
      ]
    }
  ],
  "combinations": [],
  "objects": [
    {
      "id": "cabinet",
      "name": "Cabinet",
      "description": "A tall wooden cabinet.",
      "position": { "x": 150, "y": 200 },
      "size": { "width": 120, "height": 250 },
      "visual": { "color": "rgba(139, 90, 43, 0.3)", "label": "Cabinet" },
      "initial_state": "closed",
      "initially_visible": true,
      "interactions": [
        { "verb": "look", "response": "A tall cabinet with a brass handle." },
        {
          "verb": "hand",
          "when": [{ "type": "object_state", "object": "cabinet", "state": "closed" }],
          "then": [
            { "type": "message", "text": "You open the cabinet. A brass key falls out." },
            { "type": "set_state", "object": "cabinet", "state": "open" },
            { "type": "add_item", "item": "brass_key" }
          ]
        },
        {
          "verb": "hand",
          "when": [{ "type": "object_state", "object": "cabinet", "state": "open" }],
          "then": [{ "type": "message", "text": "The cabinet is empty." }]
        }
      ]
    },
    {
      "id": "nav_to_room_b",
      "name": "Study Door",
      "description": "A door to the study.",
      "position": { "x": 700, "y": 200 },
      "size": { "width": 100, "height": 300 },
      "visual": { "color": "rgba(100, 150, 255, 0.15)", "label": "→ Study" },
      "initial_state": "default",
      "initially_visible": true,
      "interactions": [
        { "verb": "move", "when": [], "then": [{ "type": "set_view", "view": "room_b" }] },
        { "verb": "look", "response": "A door leading to the study." }
      ]
    },
    {
      "id": "nav_back_to_a",
      "name": "Back to Hall",
      "description": "The entrance hall.",
      "position": { "x": 50, "y": 200 },
      "size": { "width": 80, "height": 300 },
      "visual": { "color": "rgba(100, 150, 255, 0.15)", "label": "← Hall" },
      "initial_state": "default",
      "initially_visible": true,
      "interactions": [
        { "verb": "move", "when": [], "then": [{ "type": "set_view", "view": "room_a" }] },
        { "verb": "look", "response": "The way back to the entrance hall." }
      ]
    },
    {
      "id": "desk",
      "name": "Writing Desk",
      "description": "A desk with scattered papers.",
      "position": { "x": 400, "y": 350 },
      "size": { "width": 180, "height": 120 },
      "visual": { "color": "rgba(101, 67, 33, 0.3)", "label": "Desk" },
      "initial_state": "default",
      "initially_visible": true,
      "interactions": [
        { "verb": "look", "response": "Scattered papers. Nothing interesting." },
        { "verb": "hand", "response": "You rifle through the papers. Just old bills." }
      ]
    },
    {
      "id": "locked_door",
      "name": "Locked Door",
      "description": "A door to the garden. Locked.",
      "position": { "x": 750, "y": 200 },
      "size": { "width": 100, "height": 300 },
      "visual": { "color": "rgba(100, 150, 255, 0.15)", "label": "Garden?" },
      "initial_state": "locked",
      "initially_visible": true,
      "interactions": [
        {
          "verb": "move",
          "when": [{ "type": "object_state", "object": "locked_door", "state": "unlocked" }],
          "then": [{ "type": "set_view", "view": "room_c" }]
        },
        {
          "verb": "move",
          "when": [{ "type": "object_state", "object": "locked_door", "state": "locked" }],
          "then": [{ "type": "message", "text": "The door won't budge. It's locked." }]
        },
        { "verb": "look", "response": "A door with a brass keyhole. Leads to the garden." },
        {
          "verb": "hand",
          "when": [{ "type": "object_state", "object": "locked_door", "state": "locked" }],
          "then": [{ "type": "message", "text": "Locked tight." }]
        },
        {
          "verb": "use_item",
          "item": "brass_key",
          "when": [{ "type": "object_state", "object": "locked_door", "state": "locked" }],
          "then": [
            { "type": "message", "text": "Click! The key fits perfectly." },
            { "type": "set_state", "object": "locked_door", "state": "unlocked" },
            { "type": "remove_item", "item": "brass_key" }
          ]
        }
      ]
    },
    {
      "id": "gate",
      "name": "Garden Gate",
      "description": "The gate to freedom.",
      "position": { "x": 400, "y": 300 },
      "size": { "width": 160, "height": 250 },
      "visual": { "color": "rgba(100, 200, 100, 0.3)", "label": "Gate" },
      "initial_state": "default",
      "initially_visible": true,
      "interactions": [
        { "verb": "look", "response": "The garden gate. Sunlight beyond." },
        {
          "verb": "hand",
          "when": [],
          "then": [
            { "type": "game_over", "result": "win", "reason": "You push open the gate and step into the sunlight. You're free." }
          ]
        }
      ]
    }
  ]
}
```

---

## 12. Checklist — Scenario Package Completeness

Before registering, verify:

- [ ] Folder name matches `metadata.id`
- [ ] Every view has a `background_file` that exists in `backgrounds/`
- [ ] Every object referenced in a view's `objects[]` exists in the `objects` array
- [ ] Every `set_view` target exists as a view ID
- [ ] Every `add_item`/`remove_item`/`has_item` references an item in the `items` array
- [ ] Every `use_item` interaction has a matching `"item"` field
- [ ] All hotspots fit within bounds: `x + width ≤ 960`, `y + height ≤ 720`
- [ ] All flags used in conditions are initialized in the `flags` object
- [ ] Closeup sub-views have `back_label` so the player can return
- [ ] Navigation is bidirectional — every room has a way back (unless intentionally one-way)
- [ ] At least one `game_over` with `"result": "win"` exists (or `win_conditions`)
- [ ] Every object has at least a `look` interaction
- [ ] Scenario ID added to `scenarios/manifest.json`
- [ ] `tools/validate-scenario.mjs` reports 0 errors and `tools/softlock-search.mjs` reports 0 soft-locked states
- [ ] Design doc with image prompts exists at `design.md`

---

## References

- **Full JSON Schema**: `docs/SCENARIO_SCHEMA.md` (1700+ lines — every field documented)
- **Architecture**: `docs/ARCHITECTURE.md` (engine internals, data flow diagrams)
- **Builder Guide**: `ADVENTURE_BUILDER.md` (third-party developer reference)
- **Example Scenario**: `scenarios/the-harvest/` (flagship — 70 views, 30 of them in Act 1; full sprites, ambient audio, keypad widget, vent maze)
- **Simple Example**: `scenarios/the-lighthouse-keeper/` (3 views, straightforward)
- **Sprite Splicing Tool**: `node tools/splice-sprites.mjs` (combine frames into sheets)
