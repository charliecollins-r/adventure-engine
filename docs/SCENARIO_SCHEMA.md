# Adventure Engine Scenario Schema Specification

> Version: 1.0-draft
> This document defines the JSON schema for Adventure Engine scenarios.
> A scenario is fully defined by one JSON file + background images. No code changes are needed.

---

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Schema Root](#schema-root)
4. [Metadata](#metadata)
5. [Setting & Views](#setting--views)
6. [Flags](#flags)
7. [Items](#items)
8. [Combinations](#combinations) · [Item Consumption](#item-consumption-tools-vs-ingredients)
9. [Objects](#objects)
10. [Interaction Verbs](#interaction-verbs)
11. [Conditions](#conditions)
12. [Effects](#effects)
13. [Puzzle Widgets](#puzzle-widgets)
14. [Phases](#phases)
15. [Events](#events)
16. [Killer AI](#killer-ai)
17. [Win & Lose Conditions](#win--lose-conditions)
18. [Hints](#hints)
19. [Solution Paths](#solution-paths)
20. [Validation Rules](#validation-rules)
21. [Design Patterns](#design-patterns)
22. [Complete Example](#complete-example)

---

## Overview

An Adventure Engine scenario is a single-player escape room. The player is the captive — trapped in a room, solving puzzles to escape before an AI-controlled killer catches them.

Every scenario is defined entirely as:
- **One JSON file** — all game logic, objects, puzzles, killer behavior, narrative
- **Background images** — visual art for the room and any closeup views

The JSON file is the complete game. The engine reads it and runs the scenario without any scenario-specific code.

### Design Lineage

This schema captures mechanics from the greatest point-and-click adventure games ever made:

| Source | Mechanic We Took |
|--------|-----------------|
| King's Quest 5/6 | Verb icons (Look, Hand, Talk), inventory items, use-item-on-object, multi-step puzzle chains, dual-purpose items |
| Monkey Island 1-3 | Item combinations, dialogue puzzles, no-dead-ends philosophy, red herrings, alternate solutions |
| Myst | Environmental manipulation (switches, dials, machinery), code/pattern input, observation puzzles, sequence puzzles, power routing |
| Grim Fandango | Multi-state machinery, story-integrated puzzles, environment changes over time |
| Day of the Tentacle | Transformation chains, cross-system cause-and-effect |
| The Room series | Nested examination layers — object within object within object |
| The Witness | Perspective alignment — visual patterns only visible from specific viewpoints |
| Return of the Obra Dinn / Outer Wilds | Cross-reference deduction, knowledge-as-key progression |
| Resident Evil / Silent Hill | Bait-and-punish traps, point of no return commitments, irreversible consequences |
| Deus Ex / Dishonored / Prey | Emergent combinations, multi-path solutions with meaningful cost tradeoffs |
| Hitman / Metal Gear / Thief | Trap setting, sound masking, environmental manipulation against AI opponents |
| Telltale / Undertale | Moral forks, meaningful exclusive choices, multiple endings |
| Baba Is You | Rule subversion — change the constraint instead of satisfying it |
| Real escape rooms | Revelation tools (UV/blacklight), overlay puzzles, physical assembly, cross-reference clues |
| Adventure Engine (original) | AI killer antagonist, noise as risk/reward mechanic, hiding under pressure, evidence awareness, phase-based escalation |

---

## File Structure

A scenario is packaged as a directory:

```
my-scenario/
  scenario.json          # The scenario definition (this spec)
  backgrounds/
    main_room.png        # Primary room background (960x720 coordinate space)
    desk_closeup.png     # Optional closeup view
    safe_closeup.png     # Optional closeup view
  closeups/              # Optional: images for the show_closeup effect
  sprites/               # Optional: character and object sprite sheets (transparent PNG)
  items/                 # Optional: inventory icons (item icon_file)
  ui/                    # Optional: widget art such as keypad key images
  audio/                 # Optional: ambient tracks and sound effects
  thumbnail.png          # 320x240 preview for scenario browser (planned; not read yet)
```

To make the scenario appear in the game, add its folder name to `scenarios/manifest.json`.

Background images can be any resolution (1376x768 and 1920x1080 are common). The engine renders them with `object-fit: cover` inside a 960x540 pixel viewport. **Object positions use a 960x720 coordinate space** (origin at top-left). Position is the **top-left corner** of the hotspot box, not the center. The engine maps to the viewport with `SCALE_X = 1.0` (no horizontal change) and `SCALE_Y = 0.75` (vertical compression). To convert image pixel coordinates to JSON: `json_x = img_x × (960 / IMG_W)`, `json_y = img_y × (720 / IMG_H)`. Bounds: `x + width ≤ 960`, `y + height ≤ 720`. See `docs/HOTSPOT_POSITIONING_GUIDE.md` for the full conversion workflow and `ADVENTURE_BUILDER.md` for the builder guide. Closeup views use the same coordinate space.

---

## Schema Root

```json
{
  "schema_version": "1.0",
  "metadata": { ... },
  "setting": { ... },
  "flags": { ... },
  "items": [ ... ],
  "combinations": [ ... ],
  "objects": [ ... ],
  "puzzle_widgets": [ ... ],
  "views": [ ... ],
  "phases": [ ... ],
  "events": [ ... ],
  "killer": { ... },
  "win_conditions": [ ... ],
  "lose_conditions": [ ... ],
  "hints": [ ... ],
  "solution_paths": [ ... ],
  "character": { ... }
}
```

**Required**: `schema_version`, `metadata`, `setting`, `views`, `objects`, `items`, `flags`.

**Optional**: `combinations`, `puzzle_widgets`, `phases`, `events`, `killer`, `win_conditions`, `lose_conditions`, `hints` (the timed top-level form, not yet read by the engine; per-view `hints` are what the "?" button shows), `solution_paths`, `character` (see [Character Sprite](#character-sprite)).

---

## Metadata

```json
"metadata": {
  "id": "surgeons-attic",
  "title": "The Surgeon's Attic",
  "description": "You awaken in a dim attic, wrists bound. Below, a disgraced surgeon hums along to classical music.",
  "author": "scenario-creator-name",
  "difficulty": "medium",
  "estimated_minutes": 10,
  "tags": ["medical", "suspense", "classic"],
  "version": "1.0"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier. Lowercase, hyphens. |
| `title` | string | yes | Display name. |
| `description` | string | yes | 1-3 sentence premise shown to player before starting. |
| `author` | string | no | Creator name or "ai-generated". |
| `difficulty` | `"easy"` `"medium"` `"hard"` `"nightmare"` | yes | Affects expectations, not engine behavior. |
| `estimated_minutes` | number | yes | Approximate play time. |
| `tags` | string[] | no | Searchable tags for the marketplace. |
| `version` | string | no | Scenario version for updates. |

---

## Setting & Views

The setting defines the visual environment. Every scenario has a main view (the room) and optionally additional closeup views.

```json
"setting": {
  "initial_view": "main",
  "ambient_text": "Dim light filters through a cracked window. Classical music plays below.",
  "room_style": {
    "background_color": "#12121a",
    "wall_color": "#22222a",
    "floor_color": "#2a2218"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `initial_view` | string | yes | Which view to start on. The engine has no default; the ID must exist in `views`. |
| `ambient_text` | string | yes | Atmospheric text shown when no message is on screen. |
| `room_style` | object | no | Fallback colors when no background image exists. |
| `intro_text` | string[] | no | Pages of opening narration shown before play, one page per entry. |
| `intro_scenes` | IntroScene[] | no | An animated intro cinematic, used instead of `intro_text`. See "Intro Cinematic" below. |
| `wake` | object | no | How play begins after the intro: `hold_seconds` of black (default 0.2), the eyes opening over `fade_seconds` (default: the length of `sounds.intro_voice`), `blink` (open halfway, flutter shut, then open fully), and `voice_delay` seconds before `sounds.intro_voice` describes the room. A `standup` sprite set gets up as that voice ends, and the tutorial waits until then. Make the first phase's `on_enter` message the same words the voice speaks (check by speaking rate: about 12–13 characters per second for a calm narrator). |
| `ambient_audio` | string or string[] | no | Looping ambient track(s) for every view that doesn't set its own. |
| `music` | string | no | Background music on its own channel (a path). It keeps playing across rooms and only changes when a view names a different track (view `music`; `null` there = no music). |
| `music_volume` | number | no | Music volume 0..1. Default `0.3`. |
| `noise_decay` | number | no | Noise points that fade every time the player goes to another view (`set_view`), so exploring isn't punished forever. Default `0`. |
| `noise_sound_min` | number | no | Smallest rise in noise that plays `sounds.noise`. Default `3`. |
| `max_score` | number | no | Total points available. Shows "Score: x of max" in the title bar and on the end screen. Points come from the `add_score` effect. |
| `allow_undo` | boolean | no | Death screens offer **Undo last move**, which puts the game back to just before the fatal action. Default `true`; set `false` for a hardcore scenario. |
| `sounds` | object | no | Sound effect paths. `room_transition`, `item_pickup` and `intro_voice` are played by the engine on those events, `noise` whenever the noise level jumps by 3 or more, `combine` when two items are combined successfully (falls back to `item_pickup`), `death` when the game ends in a death (the music fades out under it) and `win` when it ends in a win; any other key (e.g. `discovery`) can be played by name with the `play_sound` effect. |
| `tutorial` | object | no | First-play tips: `{ "steps": [{ "text": "...", "done_when": "verb_changed" }] }`. Shown one at a time in the top-left of the picture after the intro; each moves on when the player does what `done_when` names: `verb_changed`, `walked`, `looked`, `handled`, `talked`, `item_taken`, `items_opened`, `item_selected`, `hint_used`, or `next` (shows a button). The box is click-through, has **Skip tutorial**, and is remembered per scenario in the browser. Hidden in `?dev`/`?skipIntro` mode unless the URL has `?tutorial`. A step can also take `when` (conditions: the tip waits, hidden, until they hold, e.g. a `view_is`; a tip left behind in another room is passed over when a later one fits where the player is) and `prologue`: `"only"` (a prologue tip, dropped when the prologue ends) or `"if_skipped"` (shown only to a player who skipped the prologue, to repeat what it taught). Tips are numbered along the player's own route. |
| `cutscenes` | object | no | Named cinematics, `{ "id": [IntroScene, ...] }` in the intro's format, played mid-game by the `play_cutscene` effect. See [Cutscenes and a playable prologue](#cutscenes-and-a-playable-prologue). |
| `prologue` | object | no | `{ "view": "...", "skip_label"? }`: a playable opening. After the intro cinematic the game starts in `view` instead of `initial_view`, with no wake-up; a `play_cutscene` with `wake: true` ends it. See [Cutscenes and a playable prologue](#cutscenes-and-a-playable-prologue). |

### Views

Views define what the player sees. The main view is always the room. Closeup views zoom into specific areas.

```json
"views": [
  {
    "id": "main",
    "background_key": "main_room",
    "background_file": "backgrounds/main_room.png",
    "objects": ["chair", "radiator", "painting", "bed", "door", "window", "bookshelf", "floorboard", "wardrobe"]
  },
  {
    "id": "desk_closeup",
    "background_key": "desk_closeup",
    "background_file": "backgrounds/desk_closeup.png",
    "objects": ["desk_drawer", "desk_lamp", "notebook", "pen_holder"],
    "back_label": "Step back"
  }
]
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique view identifier. |
| `name` | string | no | Display name, shown in the viewport's bottom-right corner. |
| `background_key` | string | yes | Key for the background image asset. (The renderer only reads `background_file`.) |
| `background_file` | string | yes | Relative path to the background image file. Without it, objects render as colored rectangles. |
| `background_fit` | `"cover"` or `"contain"` | no | How the image fills the 960x540 viewport. Default `cover`. |
| `objects` | string[] | yes | IDs of objects visible in this view. |
| `back_label` | string | no | Label for the "go back" action. Only on non-main views. |
| `ambient_text` | string | no | The idle line under the picture in this view, instead of `setting.ambient_text` (`""` for none). |
| `hints` | ViewHint[] | no | Progressive hints for this view (see below). |
| `character` | object | no | Character sprite placement for this view: `{x, y, facing, sprite_set, frame, shadow}`. Position is bottom-center anchor in 960x720 space. Optional `shadow` overrides the global character shadow for this view only. |
| `ambient_audio` | string or string[] | no | Ambient audio track(s) for this view, overriding the scenario-level `setting.ambient_audio`. Loops continuously while the player is in this view. Falls back to `setting.ambient_audio` when not specified. |
| `lighting_variants` | array | no | Lighting that replaces `ambient_lighting` while its conditions hold: `[{ "when": [conditions], "lighting": { "lights": [...] } }]`, the first match wins. Example: red alarm strobes after an override (`flag_is security_locks_overridden`). |
| `enter_sound` | string or null | no | Sound played on entering this view (a `setting.sounds` key or a path). `null` or `""` = silent (close-ups). Default: `setting.sounds.room_transition`. A `set_view` with its own `sound` wins. |
| `music` | string or null | no | Music for this view, overriding `setting.music`; `null` = silence. The same track carries on uninterrupted between rooms. |
| `on_enter` | Effect[] | no | Effects run each time the player enters this view with `set_view`, after any meter cost: refill a meter, say a line ("A cold draught from the north"). |
| `map_xy` | [col, row] | no | The view's square on a grid map (row 0 = north). The `sense` effect uses it to name directions. |
| `ambient_lighting` | object | no | Per-view ambient lighting: `{ "lights": [...], "flicker": bool }`. Each light is `{ x, y, radius, color, pulse_speed, pulse_amount, alpha, phase? }`: `x`/`y` are 0-1 fractions of the viewport, `radius` is a fraction of its larger side, `color` is `[r, g, b]`, `pulse_speed`/`pulse_amount` (both required numbers) shape a slow breathing glow. Drawn on a canvas over the background. |

### View Hints

Each view can have a `hints` array that provides progressive guidance to the player. When the player requests a hint, the engine evaluates each hint's `when` conditions in order and returns the **last** matching hint — so hints should be ordered from general to specific. As the player progresses (sets flags, collects items), more specific hints become active.

```json
"hints": [
  { "text": "Look around carefully. There might be something useful here.", "when": [] },
  { "text": "The desk drawer looks like it could be opened.", "when": [{"type": "flag_is", "flag": "room_searched", "value": "true"}] },
  { "text": "Try using the key on the desk drawer.", "when": [{"type": "has_item", "item": "brass_key"}] }
]
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | yes | The hint text shown to the player. |
| `when` | Condition[] | yes | Conditions that must ALL be true for this hint to be active. Empty array `[]` means always active. |

When the player transitions to a closeup view (via a `set_view` effect), the viewport switches to that view's background and shows only that view's objects. On views with a `back_label`, a back button at the top-left returns to the previous view.

**How backgrounds and objects relate:** When a background image is present, objects are invisible clickable hotspot regions positioned over the art. The player clicks on what they see in the painting; the hotspot region determines which object they clicked. When no background image is present, objects render as colored rectangles with labels (prototyping mode).

---

## Flags

Global state variables that track progress. Flags are key-value string pairs.

```json
"flags": {
  "bound_to_chair": "true",
  "chair_empty": "false",
  "found_escape_route": "false",
  "safe_code_known": "false"
}
```

All flags must be initialized here. Conditions can check flag values; effects can set them.

Use flags for abstract state that doesn't belong on a specific object: "has the player learned the code?", "has the killer been alerted?", "is phase 2 triggered?"

---

## Items

Inventory items the player can collect, examine, use, and combine.

```json
"items": [
  {
    "id": "rusty_nail",
    "name": "Bent Nail",
    "description": "A rusty nail, slightly bent. Could scratch or pry small things.",
    "icon": "nail",
    "examine": [
      {
        "verb": "look",
        "when": [],
        "then": [
          { "type": "message", "text": "About 3 inches long. The tip is still sharp." }
        ]
      },
      {
        "verb": "hand",
        "when": [],
        "then": [
          { "type": "message", "text": "You bend it back and forth. It's sturdy enough." }
        ]
      }
    ]
  },
  {
    "id": "torn_note_a",
    "name": "Torn Note (left half)",
    "description": "A torn piece of paper with neat handwriting.",
    "icon": "paper",
    "examine": [
      {
        "verb": "look",
        "when": [],
        "then": [
          { "type": "message", "text": "Numbers in careful handwriting: '7-4...' The rest is torn away." },
          { "type": "set_flag", "flag": "seen_partial_code", "value": "true" }
        ]
      }
    ]
  },
  {
    "id": "old_key",
    "name": "Tarnished Key",
    "description": "A brass key, green with age.",
    "icon": "key",
    "examine": [
      {
        "verb": "look",
        "when": [{ "type": "flag_not", "flag": "key_examined", "value": "true" }],
        "then": [
          { "type": "message", "text": "Stamped into the bow: '302'. A room number?" },
          { "type": "set_flag", "flag": "key_examined", "value": "true" },
          { "type": "set_flag", "flag": "knows_room_number", "value": "true" }
        ]
      },
      {
        "verb": "look",
        "when": [{ "type": "flag_is", "flag": "key_examined", "value": "true" }],
        "then": [
          { "type": "message", "text": "A brass key stamped '302'." }
        ]
      }
    ]
  }
]
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique item identifier. Referenced everywhere. |
| `name` | string | yes | Display name in inventory. |
| `description` | string | yes | Short description shown on hover. |
| `icon` | string | no | Built-in SVG icon keyword (`ItemIcon.tsx`: `vial`, `shard`, `probe`, `card`, `crystal`, `key`, `map`, `helmet`, `note`, …). Unknown keys render a ◆ glyph. |
| `icon_file` | string | no | Path to an inventory icon image, relative to the scenario folder (e.g. `"items/carcass_hook.png"`). Overrides `icon`. Convention: 326×273 transparent PNG, object centered; rendered 28px tall. See [ART_GUIDE.md](ART_GUIDE.md#inventory-icons). |
| `examine` | interaction[] | no | Interactions when examining this item in inventory. Same format as object interactions. |

An item ID is **not** an object ID. When a world object yields an item, they are separate records: `neural_tendril_sample` (the thing lying in the morgue) gives `severed_neural_tendril` (the thing in your pocket). `use_item` interactions, `has_item` conditions, and `combinations` must always reference the **item** ID. Mixing them up fails silently (the interaction just never matches).

### Key Design Point: Dual-Purpose Items

Items should carry hidden information revealed through examination. This is how King's Quest 6 created "aha!" moments — you pick up a key for one reason, examine it later, and discover it has a room number stamped on it that solves a completely different puzzle.

The `examine` interactions support full condition/effect chains, so examining an item can:
- Reveal clues (set flags)
- Change the item (transform_item effect)
- Unlock new interactions elsewhere

---

## Combinations

Define how inventory items can be merged together.

```json
"combinations": [
  {
    "items": ["torn_note_a", "torn_note_b"],
    "result": "complete_note",
    "consumes": true,
    "message": "You hold the torn halves together. A combination: 7-4-1-9.",
    "noise": 0,
    "conditions": []
  },
  {
    "items": ["cloth_strip", "glass_shard"],
    "result": "makeshift_knife",
    "consumes": true,
    "message": "You wrap the cloth around the glass. Crude, but it'll cut.",
    "noise": 5,
    "conditions": []
  },
  {
    "items": ["empty_bottle", "cleaning_fluid"],
    "result": "acid_bottle",
    "consumes": true,
    "message": "You pour the fluid into the bottle. Handle with care.",
    "noise": 3,
    "conditions": [
      { "type": "flag_is", "flag": "knows_acid_recipe", "value": "true" }
    ]
  }
]
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | string[2] | yes | Exactly two item IDs. Order doesn't matter. |
| `result` | string | yes | ID of the item produced. Must exist in `items[]`. |
| `consumes` | boolean | yes | If true, both source items are removed. If false, they stay (tool use). |
| `message` | string | yes | Text shown to the player on successful combination. |
| `noise` | number | no | Noise generated. Default 0. |
| `conditions` | condition[] | no | Additional conditions that must be met. Default: none. |

Order of `items` doesn't matter — combining A+B is the same as B+A.

The `conditions` field lets you gate combinations: maybe you can only combine items after reading instructions, or only while at a specific view (workbench closeup).

---

## Item Consumption (Tools vs. Ingredients)

The engine **never removes an item on its own**. Whether an item survives a use is always the author's explicit choice:

| Situation | How the item is consumed | How it is kept |
|-----------|--------------------------|----------------|
| Using an item on a world object (`use_item`) | Add `{ "type": "remove_item", "item": "..." }` to that interaction's `then` | Omit `remove_item`; the item stays in inventory |
| Combining two items | `"consumes": true` removes **both** inputs | `"consumes": false` keeps both (tool-style crafting) |
| Turning one item into another | `{ "type": "transform_item", "item": "old", "into": "new" }` | — |

Because consumption is per-interaction, **the same item can be a reusable tool in one place and a spent ingredient in another.** The Harvest's surgical probe is the reference example:

```json
// Processing Lab — the probe cuts a restraint strap free. The probe is KEPT.
{ "verb": "use_item", "item": "surgical_probe",
  "when": [{ "type": "object_state", "object": "restraint_straps", "state": "default" }],
  "then": [
    { "type": "message", "text": "Choir tools for Choir flesh: the strap parts like wet paper..." },
    { "type": "add_item", "item": "restraint_strap" },
    { "type": "set_state", "object": "restraint_straps", "state": "cut" }
  ] }

// Fan Chamber — the probe is jammed into the fan's gears. The probe is CONSUMED.
{ "verb": "use_item", "item": "surgical_probe", "when": [...],
  "then": [
    { "type": "message", "text": "You jam the probe into the gears..." },
    { "type": "remove_item", "item": "surgical_probe" },
    { "type": "set_state", "object": "vent_fan", "state": "jammed" }
  ] }
```

And a consuming combination feeding a consuming use: `restraint_strap` + `carcass_hook` → `grappling_line` (`"consumes": true`), then `use_item grappling_line` on the gap removes the line because it stays rigged across the gap (a hidden world object is shown to depict it).

**Tooling.** `node tools/validate-scenario.mjs <scenario.json>` catches bad item/object IDs and `use_item` interactions missing their `item`. `node tools/softlock-search.mjs <scenario.json> --goal <expr>` exhaustively checks that no reachable state is unwinnable.

**Soft-lock rule.** Every `remove_item` (and every `"consumes": true`) is a promise that the item is not needed again on any path. Before adding one, search the scenario for every `has_item`, `use_item`, and combination that references the item, and confirm none of them is required after this point. If it might be, keep the item, or give the player a second source. See Validation Rules → Reachability.

---

## Objects

World objects are everything the player can see and interact with in the game world. Furniture, doors, windows, containers, switches, decorations, hiding spots.

```json
"objects": [
  {
    "id": "painting",
    "name": "Oil Painting",
    "description": "An unsettling portrait in a heavy frame.",
    "position": { "x": 300, "y": 220 },
    "size": { "width": 100, "height": 80 },
    "visual": {
      "color": "#3a3020",
      "stroke_color": "#4a4030",
      "label": "Painting",
      "shape": "rect"
    },
    "initial_state": "hanging",
    "initially_visible": true,
    "hiding_spot": false,
    "interactions": [ ... ]
  }
]
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique object identifier. |
| `name` | string | yes | Display name on hover/interaction. |
| `description` | string | no | Brief description for accessibility/tooltips. |
| `position` | `{x, y}` | yes | **Top-left corner** of the hotspot box in the 960x720 coordinate space. Convert from image pixels: `json_x = img_x × (960/IMG_W)`, `json_y = img_y × (720/IMG_H)`. Must satisfy `x + size.width ≤ 960`, `y + size.height ≤ 720`. |
| `size` | `{width, height}` | yes | Clickable region dimensions in the 960x720 space. Minimum ~25×20 recommended for usability. |
| `visual` | object | no | Fallback rendering when no background image. |
| `visual.color` | string | no | Fill color (hex). |
| `visual.stroke_color` | string | no | Border color (hex). |
| `visual.label` | string | no | Text label below object. |
| `visual.shape` | `"rect"` `"circle"` `"ellipse"` | no | Shape. Default `"rect"`. |
| `initial_state` | string | yes | Starting state. |
| `initially_visible` | boolean | no | Whether visible at game start. Default `true`. |
| `hiding_spot` | boolean | no | Whether the player can hide here. Default `false`. |
| `sprite` | object | no | Animated sprite sheet for this object. See **Object Sprites** below. |
| `shadow` | object | no | Shadow ellipse rendered beneath the sprite. See **Sprite Shadows** below. |
| `interactions` | interaction[] | yes | What happens when the player interacts. |

### Object Sprites

Objects can optionally render as animated sprite sheets instead of (or in addition to) their hotspot box. When an object has a `sprite`, the sprite is rendered at the object's `position` using **bottom-center anchoring**: `position.x` is the horizontal center, `position.y` is the bottom edge.

```json
"sprite": {
  "file": "sprites/holographic_planets.png",
  "frame_width": 128,
  "frame_height": 96,
  "columns": 4,
  "rows": 1,
  "frame_rate": 2,
  "scale": 3
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | string | yes | Path to sprite sheet image, relative to scenario folder. |
| `frame_width` | number | yes | Width of a single frame in pixels. |
| `frame_height` | number | yes | Height of a single frame in pixels. |
| `columns` | number | yes | Number of columns in the sprite sheet grid. |
| `rows` | number | yes | Number of rows in the sprite sheet grid. |
| `frame_rate` | number | yes | Animation frames per second. `0` = static (shows first frame). |
| `loop` | boolean | no | `false` plays the frames once and holds the last one; the `play_animation` effect restarts it. Default `true`. |
| `flip` | boolean | no | `true` draws the sheet mirrored left-to-right, so a figure painted facing right faces left. Default `false`. |
| `scale` | number | yes | Render scale multiplier. Rendered size = `frame_width × scale` by `frame_height × scale`. |

### Sprite Shadows

Both object sprites and character sprites can have shadows — dark ellipses rendered beneath the sprite to ground it visually. Object shadows are configured on the object itself. Character shadows can be set globally on the character config, and optionally overridden per-view in the character placement.

```json
"shadow": {
  "offset_x": 0,
  "offset_y": 2,
  "width": 60,
  "height": 12,
  "opacity": 0.85,
  "color": "rgba(0,0,0,0.7)"
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `offset_x` | number | `0` | Horizontal offset from anchor point (positive = right). |
| `offset_y` | number | `0` | Vertical offset from anchor point (positive = down, toward feet). |
| `width` | number | 60% of sprite width | Ellipse width in pixels. |
| `height` | number | `6` | Ellipse height in pixels. |
| `opacity` | number | `0.6` | Shadow opacity (0–1). |
| `color` | string | `"rgba(0,0,0,0.5)"` | Shadow color as CSS color string. |
| `skew_x` | number | `0` | Skew in degrees for a directional shadow (positive = light from the left, negative = from the right). |

**Object shadows**: Add `shadow` alongside `sprite` on the object definition.

**Character shadows**: Set `shadow` on the top-level `character` config for global defaults. Override per-view by adding `shadow` to the view's `character` placement — the per-view shadow completely replaces the global one for that view.

### Character Sprite

An optional root-level `character` block defines the player sprite. Each view that should show the player gives a `character` placement (see [Views](#views)); views without one (close-ups) show no character.

```json
"character": {
  "sprite_sets": {
    "idle":        { "file": "sprites/character_idle.png",        "columns": 12, "rows": 2, "frame_rate": 2, "directions": ["right", "down"] },
    "walk":        { "file": "sprites/character_walk.png",        "columns": 4,  "rows": 2, "frame_rate": 6, "directions": ["right", "down"] },
    "standup":     { "file": "sprites/character_standup.png",     "columns": 4,  "rows": 1, "frame_rate": 3, "directions": ["right"], "loop": false },
    "idle_helmet": { "file": "sprites/character_idle_helmet.png", "columns": 12, "rows": 2, "frame_rate": 2, "directions": ["right", "down"] }
  },
  "frame_width": 300,
  "frame_height": 410,
  "scale": 0.35,
  "shadow": { "width": 60, "height": 12, "opacity": 0.85, "offset_y": 2 }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sprite_sets` | object | yes | Named sheets. Each: `file`, `columns` (frames per row), `rows`, `frame_rate` (fps, `0` = static), `directions` (one row per direction, in order; default `["down","left","right","up"]`), `loop` (default `true`; `false` plays once and holds the last frame). | A set can also take its own `frame_width`, `frame_height` and `scale` (a sheet drawn at another size, like a spacesuit), `bob: {amount, period}` (a gentle float up and down, in pixels and seconds: drifting in orbit), and `anchor: "top"`: the character's point is the top-centre of the frame (his hands on a rope he hangs from) instead of his feet, with no shadow; use it for hanging and climbing poses on a `traverse`.
| `frame_width`, `frame_height` | number | yes | Frame size in pixels, shared by every set unless a set gives its own. |
| `scale` | number | no | Render scale. On screen the sprite is `frame_width × scale` wide. |
| `shadow` | object | no | Default shadow (see [Sprite Shadows](#sprite-shadows)). |

**Placement** (`view.character`): `x`, `y` (the sprite's **bottom-center**, i.e. the feet, in 960x720 space), `sprite_set`, optional `facing` (`"down"`, `"left"`, `"right"`, `"up"`), `frame` (show one fixed frame), `flip_h`, `shadow`, `scale` (draw him bigger or smaller in this view, e.g. close to the camera in a close-up; multiplies the set's scale). If a sheet has no `left` row, `facing: "left"` mirrors the `right` row.

**Changing it at runtime**: the `set_character` effect overrides any of `x`, `y`, `facing`, `sprite_set`, `frame`, `flip_h` for the rest of the session (The Harvest switches to `idle_helmet` when the player takes the emergency helmet).

**Intro stand-up convention**: if a set is named exactly `standup`, the player plays it once during the opening fade-in, then the engine switches to the set named `idle`. A scenario that wants this needs both names.

**Walking fields** (only used in views with a `walk_area`, see below): `walk_speed` on the `character` block (pixels per second in 960x720 space, default 150), and `walk` on any sprite set: the set to use while walking when this one is current (default: a set named `walk`; without one he glides in his idle pose). The Harvest gives `idle_helmet` `"walk": "walk_helmet"` so the helmeted player walks with the helmeted cycle.

`walk_motion`: `"paced"` (default) moves him continuously, slowing as each foot plants and speeding up mid-stride, with the walk frame, the movement and the footsteps on one clock, so it reads as steps without ever jumping; `walk_pulse` (0–0.95, default 0.6) sets how much the speed swells and dips (0 = constant). `"stepped"` is classic Sierra: the position jumps one stride each time the walk frame changes. `"smooth"` moves at constant speed with frames and footsteps on their own timers. `footsteps`: `{ "sounds": ["audio/steps/step_1.mp3", ...], "volume": 0.45, "interval": 0.33 }` plays a step (random, never the same twice in a row, slight pitch variation) on each half of the walk cycle (`paced`, `stepped`) or every `interval` seconds (`smooth`); a view's `walk_area.footsteps` overrides it for that room (another sound set, or `false` for silence). `draw_order`: see Draw order below.

### Walkable Areas (click-to-walk)

Optional, per view. A view with a `walk_area` lets the player walk; a view without one works as before (the character stands still at his placement). Close-ups and other views with no `character` placement never walk. Design notes: [WALKABLE_AREAS.md](WALKABLE_AREAS.md).

```json
{
  "id": "act1_containment_corridor",
  "character": { "x": 330, "y": 563, "facing": "right", "sprite_set": "idle" },
  "walk_area": {
    "floor":   [[150, 520], [810, 520], [960, 700], [960, 720], [0, 720], [0, 700]],
    "blocked": [ [[440, 590], [580, 590], [580, 650], [440, 650]] ],
    "depth_scale": { "far_y": 520, "far": 0.8, "near_y": 720, "near": 1.15 }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `walk_area.floor` | `[x, y][]` | yes | The outline of the floor, in 960x720 space, points in order around the edge (either direction). At least 3 points; must not cross itself. Points on the outline count as floor. |
| `walk_area.blocked` | `[x, y][][]` | no | Areas inside the floor the character walks around (a table, a pit). Each is an outline like `floor`. |
| `walk_area.depth_scale` | object | no | `{ far_y, far, near_y, near }`: the character is drawn at `far` × his normal scale when his feet are at `far_y`, and `near` × at `near_y`, blended in between and held beyond. Omit for constant size. |
| `walk_area_variants` | array | no | Other floors for the same view, chosen by state: `[{ when, walk_area }]`; the first whose `when` matches replaces `walk_area`. Use it for a second place to stand that is reached a special way (a ledge across a pit, the top of a ladder): set a flag as you get there, and that flag's floor becomes the one he walks on. Block the room's exits while he's there (a Move interaction on the exit, `when` the flag, with a message). |

The view's `character.x`/`y` is where he appears on entering and must be on the floor.

**The floor must be painted floor, and only open floor.** The background is one flat image and the character is drawn over it, so the painting can never hide any part of him. If his feet are anywhere that something painted should be in front of him (behind a table, between a cabinet and the wall, inside a pit, up a curved duct wall), he looks like he is standing on that thing. So the outline covers only open floor where nothing painted overlaps his whole body (feet up to head, about 26 px either side of his feet in 960-wide space, and his sprite height above them):

1. Find each piece of furniture's **base**: where its nearest leg or edge meets the floor. His feet must never be behind that base while his body would overlap it sideways. Behind a table means he can't stand there at all; walk him around it.
2. Leave out everything that sits on the floor: pipes, crates, bodies, pods, the lip of a hatch. Floor-level things (grates, puddles, drain channels, the far rim of a hole) are fine to stand on or in front of.
3. Keep the edges about 14 px (on the 960x540 screen) inside the painted floor, more along walls. His feet are exactly on the point you click, and his body is about 37 px wide, so a floor that runs right up to a wall or an object puts his shoulder on it.
4. Doors and exits do not have to be on the floor: a click on an exit walks him to the nearest floor point, then the interaction runs. Don't stretch the floor up a back wall to reach a door.
5. Check it: in the visual editor's **Floor** tab the player stands under the mouse (red when off the floor) and **Save to scenario.json** writes the result; from the command line, `node tools/preview-hotspots.mjs scenario.json <view> --clean --ghosts` draws his real sprite at sample spots all over the floor. Every figure must look like it stands on the floor. If one seems to stand on, in or behind something, pull the outline in there and look again.


**What the player can do in a walking view**

| Action | Result |
|---|---|
| **Move** on the floor, or on any object that isn't an exit | Walk to the clicked spot (or the nearest reachable floor point if it's off the floor or blocked). Flavour-only Move text on such objects is not shown in walking views. |
| **Move** on an exit (an object with a Move interaction that can `set_view` or `game_over`, even behind a condition, e.g. a locked vent) | Walk to it, then the interaction runs. |
| **Hand**, or use an inventory item, on an object | Walk to it and face it, then the interaction runs. |
| **Look** or **Talk** | He stops, turns toward it, and the interaction runs at once. |
| Click while walking | The new click replaces the destination and any pending action. |

The interaction runs when he arrives, with the game state at that moment; if the view changes first, it is dropped.

**Draw order.** By default sprite objects and the character are drawn in order of their bottom edge, so he can pass in front of or behind them. Two fields change that: `character.draw_order: "front"` always draws him on top of every sprite object (The Harvest does this), and an object's `"layer": "floor"` keeps it under him (rugs, floor grates, puddles) while `"layer": "front"` keeps it over him (a pillar in the foreground). Clicks pass through the character unless his placement's `object_id` names a real object.

**`walk_to` on an object** (optional): `{ "x": 525, "y": 640, "facing": "down" }` is where he stands to Hand, Use or Move it, and which way he faces on arrival. Without it he goes to the floor point nearest the object's bottom-center and faces the object. `"walk_to": false` means he interacts from wherever he stands.

**`at` on `set_view`** (optional): `{ "type": "set_view", "view": "act1_containment_corridor", "at": { "x": 120, "y": 640, "facing": "right" } }` places him in the new view (for example by the door he came through). Without it he appears at the view's `character` placement. Re-entering a room never remembers where he last stood.

Validation: `tools/validate-scenario.mjs` checks outlines (3+ points, no self-crossing, inside 960x720, blocked areas strictly inside the floor, not touching its outline), that start spots, `walk_to` points and `at` points are on the floor, that `walk` sprite sets exist, and warns when an object's stand point can't be reached from the start spot.

### Object States

Objects track their current state as a string. States are implicit — they exist by being referenced in conditions and effects. Common state patterns:

- Door: `"locked"` → `"unlocked"` → `"open"`
- Container: `"closed"` → `"open"` → `"empty"`
- Switch: `"off"` → `"on"`
- Destructible: `"intact"` → `"broken"`
- Searchable: `"default"` → `"searched"`

States can be anything the scenario needs. The engine doesn't interpret state names — it just stores and compares strings.

---

## Interaction Verbs

Every interaction on an object (or item examination) has this structure:

```json
{
  "verb": "hand",
  "item": null,
  "when": [ ...conditions... ],
  "then": [ ...effects... ],
  "noise": 15,
  "fail_message": "That doesn't work."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `verb` | string | yes | One of: `"look"`, `"move"`, `"hand"`, `"talk"`, `"use_item"` (`"take"` is still accepted as a legacy fallback for `hand`). |
| `item` | string | only for `use_item` | The inventory item ID being used. |
| `when` | condition[] | no | Conditions that must ALL be true. Empty = always matches. |
| `then` | effect[] | yes, unless `response` | Effects to apply when this interaction fires. |
| `response` | string | no | Shorthand: with no (or an empty) `then`, this text is shown as the message. |
| `noise` | number | no | Noise generated by this interaction. Default 0. |
| `fail_message` | string | no | Reserved; not read by the engine yet. Write a specific fallback interaction instead. |

### Verb Descriptions

**`look`** — Examine visually. The player's eyes. Safe, quiet, informational.
- "You see a heavy wooden chest with a brass lock."
- "The painting is crooked. There's a gap behind the frame."
- "Scratches on the wall. Tally marks — someone was counting days."

**`hand`** — Physical interaction with bare hands. Push, pull, open, close, flip, grab, squeeze, twist.
- "You push the bookshelf. It scrapes across the floor." (noise: 25)
- "You pry up the floorboard with your fingers." (noise: 20)
- "You flip the light switch." (noise: 2)

**`move`** — Walk somewhere: doorways, passages, exits. Navigation hotspots (`nav_*` objects) answer `move` with a `set_view` effect.
- "You squeeze through the gap in the wall."

**`take`** *(legacy)* — Older scenarios used a separate take verb. The player UI no longer offers it: picking things up is `hand`, and when no `hand` interaction matches, the engine retries the object's `take` interactions.
- "You grab the wire cutters and pocket them."

**`talk`** — Speak, read aloud, listen, whisper, shout. Rich even in single-player:
- Talk to door: "Hello?! Anyone there?" (noise: 30) → Killer responds through the door
- Talk to self (object: journal): "Dear God... he's been keeping records." (reads aloud, sets flag)
- Talk to vent: You press your ear to the vent. Footsteps below. (listen mode, noise: 0)
- Talk to window: "HELP! SOMEONE HELP ME!" (noise: 50, may trigger special event)

**`use_item`** — Apply inventory item to this object. The `item` field specifies which item.
- Use key on lock → door unlocks
- Use crowbar on floorboard → board pries open
- Use acid on chain → chain dissolves

### Interaction Resolution

When the player performs a verb on an object:

1. Filter to interactions matching the verb (and item, if `use_item`)
2. For each matching interaction, evaluate its `when` conditions
3. Take the **first** interaction whose conditions are ALL satisfied
4. Apply its `then` effects in order and generate its `noise`
5. If NO interaction matches (and, for `hand`, no `take` interaction either), the engine returns a generic fallback, picked at random from a few KQ5-style lines per verb:
   - `look` → the object's `description`
   - `move` → "You can't go that way."
   - `hand` → "You can't do anything useful with {name} right now."
   - `talk` → "Talking to {name} doesn't accomplish anything."
   - `use_item` → "That doesn't seem to work."

**Order matters.** Put the most specific interactions first (with the most conditions) and the most generic last. The engine takes the first match.

### Example: A Fully Interactive Object

```json
{
  "id": "window",
  "name": "Barred Window",
  "position": { "x": 750, "y": 200 },
  "size": { "width": 80, "height": 100 },
  "visual": { "color": "#1a2a3a", "label": "Window" },
  "initial_state": "barred",
  "initially_visible": true,
  "interactions": [
    {
      "verb": "look",
      "when": [{ "type": "object_state", "object": "window", "state": "barred" }],
      "then": [
        { "type": "message", "text": "A small window covered with wire mesh. Through it, you see trees and a drainpipe running down the outside wall." },
        { "type": "set_flag", "flag": "found_escape_route", "value": "true" }
      ]
    },
    {
      "verb": "look",
      "when": [{ "type": "object_state", "object": "window", "state": "cut" }],
      "then": [
        { "type": "message", "text": "The mesh is cut away. Cold air rushes in. The drainpipe is right there." }
      ]
    },
    {
      "verb": "hand",
      "when": [{ "type": "object_state", "object": "window", "state": "barred" }],
      "then": [
        { "type": "message", "text": "You pull at the wire mesh. It holds firm. You'd need a tool." }
      ],
      "noise": 8
    },
    {
      "verb": "talk",
      "when": [{ "type": "object_state", "object": "window", "state": "barred" }],
      "then": [
        { "type": "message", "text": "\"HELP! IS ANYONE OUT THERE?!\" Your voice echoes into the night. No response." }
      ],
      "noise": 40
    },
    {
      "verb": "talk",
      "when": [{ "type": "object_state", "object": "window", "state": "cut" }],
      "then": [
        { "type": "message", "text": "You whisper into the cold air: \"Almost there. Almost free.\"" }
      ],
      "noise": 0
    },
    {
      "verb": "use_item",
      "item": "scalpel",
      "when": [{ "type": "object_state", "object": "window", "state": "barred" }],
      "then": [
        { "type": "message", "text": "The scalpel blade snaps against the wire. Too delicate for this." },
        { "type": "remove_item", "item": "scalpel" }
      ],
      "noise": 15
    },
    {
      "verb": "use_item",
      "item": "wire_cutters",
      "when": [{ "type": "object_state", "object": "window", "state": "barred" }],
      "then": [
        { "type": "set_state", "object": "window", "state": "cut" },
        { "type": "set_flag", "flag": "escape_ready", "value": "true" },
        { "type": "message", "text": "Snip. Snip. Snip. The wire mesh falls away. Cold air floods in." }
      ],
      "noise": 25
    },
    {
      "verb": "hand",
      "when": [{ "type": "object_state", "object": "window", "state": "cut" }],
      "then": [
        { "type": "game_over", "result": "win", "reason": "You squeeze through the window, grab the drainpipe, and slide down into the darkness. You're free." }
      ],
      "noise": 10
    }
  ]
}
```

This single object supports: looking (reveals escape route), pulling (fails without tool), shouting for help (massive noise), using the wrong tool (scalpel breaks — red herring), using the right tool (wire cutters succeed), and the final escape action. Every verb (look, hand, talk and item use) does something on it.

---

## Conditions

Conditions gate when interactions, events, and phase transitions fire.

### Atomic Conditions

| Type | Fields | True When |
|------|--------|-----------|
| `object_state` | `object`, `state` | The named object is in the named state |
| `has_item` | `item` | Player has this item in inventory |
| `not_has_item` | `item` | Player does NOT have this item |
| `flag_is` | `flag`, `value` | Global flag equals value |
| `flag_not` | `flag`, `value` | Global flag does NOT equal value |
| `noise_above` | `threshold` | Current noise > threshold |
| `noise_below` | `threshold` | Current noise < threshold |
| `phase_is` | `phase` | Current game phase matches |
| `time_after` | `seconds` | Seconds since game start > value *(not implemented: no game clock yet, so the engine treats it as true)* |
| `time_before` | `seconds` | Seconds since game start < value *(not implemented, treated as true)* |
| `item_count` | `count` | Player has >= count items in inventory |
| `is_hiding` | — | Player is currently in a hiding spot (`start_hiding`; any HAND, MOVE or item use, or walking, ends it) |
| `patrol_near` | `patrol` | That patrol is about to come into, or is in, the room the player is in (see [Patrols](#patrols-and-the-game-clock)) |
| `not_hiding` | — | Player is NOT hiding |
| `killer_is` | `state` | Killer AI is in this state *(stub: always false until the killer AI exists)* |
| `widget_solved` | `widget` | The puzzle widget with this id has been solved |
| `view_is` | `view` | Player is on this view |
| `not_in_view` | `view` | Player is NOT on this view |
| `meter_below` / `meter_above` | `meter`, `threshold` | That meter's value is below / above threshold (see [Meters](#meters)) |
| `cycle_is` | `cycle`, `phase` | That cycle is in that phase now (see [Cycles](#cycles)) |
| `patrol_active` | `patrol` | That patrol is mid-sweep anywhere (not just in the player's room): a surge is under way |
| `pursuer_near` | `pursuer`, `threshold` | The player is in that pursuer's zone and it is `threshold` moves or fewer from reaching him (see [Pursuers](#pursuers-behind-walls)) |
| `checkpoint_is` | `value` | The saved zone start is this checkpoint id |

### Composite Conditions

By default, a `when` array is AND — all conditions must be true.

For OR logic, use `any_of`:
```json
{ "type": "any_of", "conditions": [
  { "type": "object_state", "object": "window", "state": "cracked" },
  { "type": "object_state", "object": "window", "state": "broken" }
]}
```

For explicit AND (useful inside `any_of`):
```json
{ "type": "all_of", "conditions": [
  { "type": "has_item", "item": "key" },
  { "type": "object_state", "object": "door", "state": "locked" }
]}
```

Nesting is supported: `any_of` can contain `all_of` groups and vice versa. Keep it to 2 levels max for readability.

---

## Effects

Effects change the game world. They execute in order within an interaction's `then` array.

### Effect Types

| Type | Fields | What It Does |
|------|--------|-------------|
| `message` | `text`, `voice`?, `style`?, `static`? | Show text to the player. The primary narrative vehicle. `voice` plays a clip with it. `style: "radio"` delivers it as a transmission (a RADIO tag and cool italic text; the voice goes through a band-pass radio filter, grittier as `static` rises from 0 to 1, default 0.3); `style: "comms"` is the player talking over his suit radio (a light helmet-mic filter on the voice, plain text). |
| `add_item` | `item` | Add item to player's inventory. |
| `remove_item` | `item` | Remove item from inventory. |
| `set_state` | `object`, `state` | Change an object's state. |
| `show_object` | `object` | Make a hidden object visible. |
| `hide_object` | `object` | Make a visible object disappear. |
| `set_animation` | `object`, `value` | Change or clear an object's `visual.animation`. Empty string `""` clears the animation (stops glimmer/pulse). |
| `set_flag` | `flag`, `value` | Set a global flag. |
| `add_noise` | `amount` | Add to noise level (clamped 0-100). |
| `set_noise` | `amount` | Set noise to exact value (clamped 0-100). |
| `advance_phase` | `phase` | Jump to a specific game phase. |
| `game_over` | `result` (`"win"`/`"lose"`), `reason` (the text shown), optional `title` (the heading; default "Game Over" / "You Escaped"), optional `sound` (this ending's own sound, a `setting.sounds` key or a path; default `sounds.death` / `sounds.win`) | End the game. Give each kind of death its own sound: the fan, the gas, the fall. |
| `start_hiding` | — | Player enters hiding. |
| `stop_hiding` | — | Player leaves hiding. |
| `transform_item` | `item`, `into` | Replace one inventory item with another, in the same inventory slot. |
| `trigger_event` | `event` | Manually fire a named event. *(Not implemented yet: no-op.)* |
| `visual_cue` | `cue` | Client-side visual effect: `"shake"`, `"flash"`, `"flicker"`, `"dim"`, `"red_pulse"`. *(Not implemented yet: no-op.)* |
| `show_closeup` | `image`, `layers`? | Show a framed close-up image overlay. `layers: [{image, when?}]` are drawn over it while their conditions hold (map layers: the routes the colony scratched onto your map). Path relative to scenario folder (e.g. `"closeups/vent_map.webp"`). Player clicks to dismiss. For a close-up the player can interact with, use a sub-view with `back_label` instead. |
| `show_dialogue` | `prompt`, `choices` | Show a dialogue choice overlay. `prompt` is the situation text. `choices` is an array of `{label, when?, then}` objects — each choice has display text, optional conditions (hidden if not met), and effects to apply when selected. See Dialogue Choices section. |
| `open_widget` | `widget` | Open an overlay puzzle widget (e.g. a `keypad`) by id. See Puzzle Widgets → Overlay Widgets. |
| `set_view` | `view`, `at`?, `sound`? | Switch to a different view (closeup or back to main). `sound` names the transition sound for this move (`null` = silent), overriding the view's `enter_sound`. |
| `add_score` | `points`, `id`? | Add points to the score. With `id`, awarded only once per id (safe to put on repeatable interactions). |
| `traverse` | `path`, `seconds`, `sprite_set`, `facing`, `at` | Carry the character along a fixed route (960x720; feet positions, or hand positions with a sprite set anchored at the top), ignoring the floor: a rope, a ladder, a ledge. The engine puts him at the end at once; the player animates the route over `seconds` (clicks are ignored until he arrives) using `sprite_set` (default his walk set). `at` is where his feet stand when the route ends (needed when the route is drawn by his hands). Pair it with a `set_flag` that switches `walk_area_variants`, a `play_animation` on the thing he's crossing, and a `delay_then` of the same `seconds` to restore it. |
| `play_animation` | `object` | Show the object and restart its sprite from the first frame (pair with `sprite.loop: false` for one-shot set pieces: a fan grinding to a halt, a hatch dropping open). |
| `set_character` | `x`, `y`, `facing`, `sprite_set`, `frame`, `flip_h` (all optional) | Override the player sprite placement for the rest of the session. See [Character Sprite](#character-sprite). |
| `equip_item` / `unequip_item` | `item` | Equip or unequip a held item that has a `wearable` overlay (`{slot, sprite_file, frame_width, frame_height, offset_x, offset_y, scale?, auto_equip?}`), drawn on top of the character. `add_item` auto-equips when `auto_equip` is true; `remove_item` unequips. |
| `play_sound` | `sound` | Play a sound: a key of `setting.sounds` (e.g. `"discovery"`), or a file path relative to the scenario folder. Keys with no match are tried as paths. |
| `delay_then` | `seconds`, `effects` | Wait N seconds, then apply nested effects. Chain voiced lines by delaying each by the clip lengths before it. |
| `play_cutscene` | `cutscene`, `wake`?, `then`? | Play a `setting.cutscenes` entry full screen (skippable), then apply `then` (usually a `set_view`). With `wake: true` the wake-up staging (`setting.wake`) follows in the view `then` leads to, and the prologue ends. Anything still waiting in a `delay_then` is cancelled. |
| `random_message` | `messages` | Show one message randomly from an array. Good for variety. |
| `conditional_effect` | `when`, `then`, `else` | If condition is met, do `then` effects; otherwise do `else` effects. |
| `meter_add` | `meter`, `amount` | Add to a meter (negative to spend), clamped to 0..max. |
| `meter_set` | `meter`, `amount` or `value: "max"` | Set a meter (refill it). |
| `meter_transfer` | `meter`, `to`, `amount`? | Pour from one meter into another: as much as fits, or `amount` (squeeze the lung-sac into your breath). |
| `set_checkpoint` | `id`, `text`, `no_undo`? | Save this moment as the zone start: the death screen offers **Restart from `text`**. With `no_undo`, it offers no Undo while the checkpoint is set. Put it last in its effect list. See [Checkpoints](#checkpoints). |
| `clear_checkpoint` | — | Forget the zone start (back upstairs, where Undo rules). |
| `pursuer_divert` | `pursuer`, `amount` | Send a pursuer `amount` moves further away (a knock on the walls far off). |
| `pursuer_reset` | `pursuer` | Put a pursuer back to its start distance. |
| `sense` | `radius`, `bonus`?, `kinds`, `text`? | Name what is within `radius` screens (through exits), with directions from the views' `map_xy`: "Cold air to the north, 2 screens away." `kinds` are `{label, views}` (things in views) or `{label, patrol}` (where a patrol is now). `bonus: {when, radius}` reaches further while it holds; `text` is said when nothing is in reach. |

### Notable Effects

**`delay_then`** enables timed sequences:
```json
{ "type": "delay_then", "seconds": 5, "effects": [
  { "type": "message", "text": "You hear footsteps on the stairs..." },
  { "type": "visual_cue", "cue": "red_pulse" }
]}
```

**`conditional_effect`** enables branching within a single interaction:
```json
{ "type": "conditional_effect",
  "when": [{ "type": "flag_is", "flag": "killer_distracted", "value": "true" }],
  "then": [{ "type": "message", "text": "The killer is distracted. You pry the board without worry." }],
  "else": [
    { "type": "message", "text": "You pry the board, wincing at every creak." },
    { "type": "add_noise", "amount": 20 }
  ]
}
```

**`random_message`** adds replay variety:
```json
{ "type": "random_message", "messages": [
  "Nothing interesting here.",
  "You've already searched this.",
  "Just dust and cobwebs."
]}
```

**`show_dialogue`** presents branching conversation choices:
```json
{
  "type": "show_dialogue",
  "prompt": "The creature watches you expectantly. What do you say?",
  "choices": [
    {
      "label": "\"We're both prisoners here.\"",
      "then": [
        { "type": "message", "text": "The creature nods slowly..." },
        { "type": "set_flag", "flag": "prisoner_bond", "value": "empathy" }
      ]
    },
    {
      "label": "\"Do you know a way out?\"",
      "when": [{ "type": "flag_not", "flag": "already_asked_escape", "value": "true" }],
      "then": [
        { "type": "message", "text": "It points toward the airlock..." },
        { "type": "set_flag", "flag": "already_asked_escape", "value": "true" }
      ]
    },
    {
      "label": "[Say nothing]",
      "then": [
        { "type": "message", "text": "Silence says enough." }
      ]
    }
  ]
}
```

Each choice has a `label` (the text shown to the player), optional `when` conditions (choice is hidden if conditions aren't met), and `then` effects that fire when selected. Different choices can set different flags, enabling branching storylines where your dialogue choices affect the game world. Choices appear in a modal overlay that pauses gameplay until the player selects one.

---

## Puzzle Widgets

For interactions more complex than "click → result" — things with their own UI like combination locks, keypads, toggle panels.

Puzzle widgets are pre-built client components. The JSON configures them.

> **Implementation status.** `keypad` is implemented as an **overlay** widget, opened with the `open_widget` effect. The other widget types below are specified but not yet rendered by the engine.

### Overlay Widgets (implemented: `keypad`)

An overlay widget is a modal panel the player opens by interacting with a world object, like a closeup but with its own controls. It doesn't need a position. The object's interaction opens it:

```json
"puzzle_widgets": [
  {
    "id": "lab_terminal_lock",
    "widget_type": "keypad",
    "presentation": "overlay",
    "config": {
      "title": "Terminal Access",
      "prompt": "Four characters. The keys are warm under your fingers.",
      "columns": 4,
      "keys": [
        { "value": "fern",   "image": "ui/glyph_fern.png",   "label": "Fern" },
        { "value": "spiral", "image": "ui/glyph_spiral.png", "label": "Spiral" },
        { "value": "curl",   "image": "ui/glyph_curl.png",   "label": "Double curl" }
      ],
      "code_length": 4,
      "solution": ["fern", "curl", "sprout", "sprout"],
      "fail_text": ["The keys flash red.", "A harsh buzz. Wrong."]
    },
    "on_solve": [
      { "type": "set_flag", "flag": "terminal_unlocked", "value": "true" },
      { "type": "message", "text": "The keypad flashes green. ACCESS GRANTED." }
    ],
    "on_fail": [ { "type": "add_noise", "amount": 2 } ],
    "max_attempts": 5,
    "on_max_fail": [ { "type": "add_noise", "amount": 10 }, { "type": "message", "text": "A security tone sounds down the corridor." } ]
  }
]
```

```json
// On the world object:
{ "verb": "hand", "when": [ { "type": "flag_not", "flag": "terminal_unlocked" } ],
  "then": [ { "type": "open_widget", "widget": "lab_terminal_lock" } ] }
```

**How it plays:**
- The player presses keys and the display fills slot by slot (showing each key's image, or its label if there is no image).
- When `code_length` keys are entered, the code is submitted automatically.
- **Correct:** the widget closes, the engine marks it solved (see the `widget_solved` condition), and `on_solve` runs. Its messages show in the normal message panel.
- **Wrong:** the entry clears, one `fail_text` line is shown inside the widget (they cycle in order), and `on_fail` runs. The widget stays open so the player can try again.
- **Too many wrong tries:** every `max_attempts` wrong entries, `on_max_fail` runs and the counter resets. **The widget never locks permanently**, because a permanent lock would be a soft-lock.
- **Each key press** adds `noise_per_interaction`, if it's set.
- **Closing:** the player can close the widget at any time (Close button or Escape) without consequence.

The solution lives in the player's head, not in a flag. Anyone who knows the code can enter it, and brute force is possible but costly: 8 keys and 4 positions is 4,096 codes. Gate *access* to the code (the clue) behind your puzzle, not the keypad itself.

#### `keypad` config (overlay)

| Config Field | Type | Required | Description |
|-------------|------|----------|-------------|
| `keys` | `(string \| {value, label?, image?})[]` | yes | Keys in display order. A plain string is both value and label. `image` is a path relative to the scenario folder (transparent PNG; rendered about 56px). |
| `solution` | `string[]` or `string` | yes | Key **values** in order. A string is split into characters (for digit keypads like `"7319"`). |
| `code_length` | number | no | Keys per attempt. Default: length of `solution`. |
| `columns` | number | no | Key grid columns. Default 4. |
| `title` | string | no | Panel heading. |
| `prompt` | string | no | Line of flavour text under the title. |
| `fail_text` | string[] | no | In-widget feedback for wrong entries, cycled in order. |

#### Overlay widget fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `presentation` | `"overlay"` | yes | Modal panel opened by `open_widget`. |
| `on_solve` | effect[] | yes | Runs once, when the correct code is entered. |
| `on_fail` | effect[] | no | Runs on every wrong entry. |
| `max_attempts` | number | no | Run `on_max_fail` every N wrong entries (the counter then resets). |
| `on_max_fail` | effect[] | no | See above. |
| `noise_per_interaction` | number | no | Noise per key press. |

**Related effect and condition:**
- `{ "type": "open_widget", "widget": "<id>" }` opens the widget.
- `{ "type": "widget_solved", "widget": "<id>" }` is true once the widget has been solved.

Use the condition (or a flag set in `on_solve`) to swap the object's interaction to a "already unlocked" message, so a solved widget isn't reopened.

### Inline Widgets (specified, not yet implemented)

```json
"puzzle_widgets": [
  {
    "id": "safe_lock",
    "widget_type": "combination_lock",
    "position": { "x": 300, "y": 230 },
    "size": { "width": 80, "height": 60 },
    "view": "main",
    "initially_visible": false,
    "config": {
      "num_dials": 4,
      "values_per_dial": 10,
      "solution": [7, 4, 1, 9],
      "dial_labels": ["I", "II", "III", "IV"]
    },
    "on_solve": [
      { "type": "show_object", "object": "scalpel_tray" },
      { "type": "set_flag", "flag": "safe_opened", "value": "true" },
      { "type": "message", "text": "Click. The safe door swings open." }
    ],
    "on_fail": [
      { "type": "add_noise", "amount": 3 },
      { "type": "message", "text": "Wrong combination." }
    ],
    "noise_per_interaction": 1
  }
]
```

### Available Widget Types

#### `combination_lock`
A row of rotatable dials. Player sets each dial to the correct value.

| Config Field | Type | Description |
|-------------|------|-------------|
| `num_dials` | number | How many dials (typically 3-5) |
| `values_per_dial` | number | Values each dial cycles through (10 for digits 0-9) |
| `solution` | number[] | The correct combination |
| `dial_labels` | string[] | Optional labels under each dial |

#### `keypad`
A numeric keypad. Player types a code.

| Config Field | Type | Description |
|-------------|------|-------------|
| `code_length` | number | How many digits |
| `solution` | string | The correct code (string to support leading zeros) |
| `display_chars` | number | How many characters the display shows |

#### `toggle_panel`
A row of switches with on/off states. Player flips switches to match a pattern.

| Config Field | Type | Description |
|-------------|------|-------------|
| `num_switches` | number | How many switches |
| `solution` | boolean[] | The correct pattern (true=on, false=off) |
| `labels` | string[] | Optional switch labels |
| `linked` | number[][] | Optional: toggling switch N also toggles these others (lights-out mechanic) |

#### `sequence_puzzle`
Steps that must be performed in the correct order. Each step is a clickable element.

| Config Field | Type | Description |
|-------------|------|-------------|
| `steps` | `{id, label, position}[]` | The elements in order |
| `solution_order` | string[] | Correct sequence of step IDs |
| `reset_on_error` | boolean | Whether wrong order resets progress |
| `correct_step_message` | string | Shown on each correct step |
| `wrong_step_message` | string | Shown on wrong step |
| `wrong_step_noise` | number | Noise on wrong step |

#### `dial`
A single rotatable dial with labeled positions. Think: a valve, a radio tuner, a combination on a briefcase.

| Config Field | Type | Description |
|-------------|------|-------------|
| `positions` | string[] | The labels around the dial |
| `solution` | string | The correct position |
| `initial_position` | string | Starting position |

#### `wire_connect` (future)
Match colored wires to correct terminals.

#### `slider_puzzle` (future)
Arrange tiles in correct order by sliding.

### Common Widget Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `widget_type` | string | yes | One of the types above |
| `position` | `{x, y}` | inline only | Position in 960x720 coordinate space |
| `size` | `{width, height}` | inline only | Clickable/display region |
| `view` | string | no | Which view this widget appears on. Default `"main"`. |
| `initially_visible` | boolean | no | Default `true`. |
| `config` | object | yes | Type-specific configuration. |
| `on_solve` | effect[] | yes | Effects when puzzle is solved. |
| `on_fail` | effect[] | no | Effects on wrong answer. |
| `noise_per_interaction` | number | no | Noise per dial turn / button press / toggle. |
| `max_attempts` | number | no | Every N wrong attempts, `on_max_fail` runs and the counter resets (never a permanent lock). |
| `on_max_fail` | effect[] | no | Effects when max attempts exceeded. |

---

## Phases

Phases are story chapters that change the game's tone and the killer's behavior.

```json
"phases": [
  {
    "id": "bound",
    "name": "Bound",
    "starts_when": [],
    "on_enter": [
      { "type": "message", "text": "Your eyes adjust. An attic room. You're tied to a chair." }
    ],
    "ambient_text": "Faint classical music from below.",
    "killer_overrides": {
      "check_interval_seconds": 90,
      "noise_threshold_investigate": 70
    }
  },
  {
    "id": "free",
    "name": "Free",
    "starts_when": [{ "type": "flag_is", "flag": "freed_from_chair", "value": "true" }],
    "on_enter": [
      { "type": "message", "text": "You stand on shaking legs. Be quiet." }
    ],
    "ambient_text": "Footsteps pace below.",
    "killer_overrides": {
      "check_interval_seconds": 50,
      "noise_threshold_investigate": 50
    }
  },
  {
    "id": "hunted",
    "name": "Hunted",
    "starts_when": [{ "type": "flag_is", "flag": "killer_alerted", "value": "true" }],
    "on_enter": [
      { "type": "message", "text": "\"WHERE ARE YOU?!\" The killer is enraged." },
      { "type": "visual_cue", "cue": "red_pulse" }
    ],
    "ambient_text": "Frantic footsteps. Doors slamming.",
    "killer_overrides": {
      "check_interval_seconds": 20,
      "noise_threshold_investigate": 15
    }
  }
]
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Phase identifier. |
| `name` | string | yes | Display name (for HUD). |
| `starts_when` | condition[] | yes | Empty = initial phase. Otherwise, checked after every interaction. |
| `on_enter` | effect[] | no | Effects that fire once when this phase begins. |
| `ambient_text` | string | no | Atmosphere text displayed during this phase. |
| `killer_overrides` | object | no | Override killer behavior fields for this phase. |

The first phase with empty `starts_when` is the initial phase. Phase transitions are checked after every interaction and every game tick. Only the first qualifying phase transition fires per check. Phases always advance forward — revisiting an earlier phase requires explicit `advance_phase` effects.

---

## Events

Named events triggered by conditions. For narrative beats and timed occurrences.

```json
"events": [
  {
    "id": "phone_rings",
    "trigger": { "type": "time_after", "seconds": 90 },
    "one_shot": true,
    "effects": [
      { "type": "set_flag", "flag": "killer_distracted", "value": "true" },
      { "type": "play_sound", "sound": "phone_ring" },
      { "type": "message", "text": "A phone rings below. The killer answers." },
      { "type": "delay_then", "seconds": 25, "effects": [
        { "type": "set_flag", "flag": "killer_distracted", "value": "false" },
        { "type": "message", "text": "The call ends. Footsteps resume." }
      ]}
    ]
  },
  {
    "id": "killer_finds_empty_chair",
    "trigger": {
      "type": "all_of",
      "conditions": [
        { "type": "flag_is", "flag": "chair_empty", "value": "true" },
        { "type": "killer_is", "state": "checking" }
      ]
    },
    "one_shot": true,
    "effects": [
      { "type": "message", "text": "\"THE CHAIR IS EMPTY!\" The scream shakes the walls." },
      { "type": "set_flag", "flag": "killer_alerted", "value": "true" },
      { "type": "visual_cue", "cue": "shake" }
    ]
  },
  {
    "id": "lights_flicker",
    "trigger": { "type": "time_after", "seconds": 300 },
    "one_shot": true,
    "effects": [
      { "type": "visual_cue", "cue": "flicker" },
      { "type": "message", "text": "The lights flicker. This old wiring won't last forever." }
    ]
  }
]
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Event identifier. |
| `trigger` | condition (single) or composite | yes | When this event fires. |
| `one_shot` | boolean | yes | If true, fires only once. If false, fires every time conditions are met. |
| `effects` | effect[] | yes | What happens when the event fires. |

Events are evaluated after every player action (interaction, item use, combination, dialogue choice, widget entry). An event fires when its `trigger` **becomes** true: a `one_shot: false` event fires again only after its trigger has been false in between, so "noise above 49" warns once per crossing, not on every click. `one_shot: true` events fire at most once per game. Any condition type works as a trigger, including `all_of`/`any_of`.

*Not implemented yet:* triggers whose type starts with `time_` (`time_after`, `time_before`) need the game clock and are skipped, and `trigger_event` is still a no-op.

### Pattern: the alarm escape (a one-way door with guards)

A point of no return made physical. In The Harvest, pressing the security override sounds the alarm; back in the corridor an event opens the floor grate (hide the closed grate, show the open one), and from then on every room the player came from holds a hunter: entering one shows the guard, then `delay_then` (about 1.5 s, so the player sees what got them) ends the game with a death that names the way out. Undo puts them back in the corridor.

Make it fair:
1. **Gate the point of no return on what lies beyond it.** The override button only works while the player carries everything the rest of the act needs (`has_item` for each); otherwise it refuses with a warning ("there will be no coming back up here"), and the close-up's hints name what's missing one at a time.
2. **Leave any room that pays off the moment open.** The Feeding Station stays unguarded because the escaped prisoner's scratched route waits there.
3. **Make the way out unmistakable**: the open grate glows (a light in the alarm `lighting_variants`), the corridor message ends "The vent. Now.", and the corridor hint says so.
4. **Check it**: the soft-lock search can't see deaths that come through `delay_then`, so test the guarded rooms in the browser (`scripts/playthrough/alarm.cjs`) and run the search on a copy where they kill instantly.

### Pattern: noise, guards and hiding (tension without a clock)

Everything below is plain JSON; The Harvest Act 1 uses all of it (see `scenarios/the-harvest/scripts/playthrough/noise.cjs` for the browser test).

1. **Noise costs something.** Loud actions use `add_noise` (a heavy door: `add_noise` 2-3 on its Move interaction; a wrong keypad code: `on_fail: [{ "type": "add_noise", "amount": 1 }]`). Set `setting.sounds.noise` and the player hears it every time the level jumps by 3 or more.
2. **Thresholds escalate through events.** Condition-triggered events with `noise_above` fire on the action that crosses the line (not every action while it stays above), and again after the level has dropped back under it:

```json
"events": [
  { "id": "noise_listening", "trigger": { "type": "noise_above", "threshold": 49 }, "one_shot": false,
    "effects": [ { "type": "message", "text": "Somewhere above you, the footsteps stop. Something is listening." },
                 { "type": "play_sound", "sound": "curator" } ] },
  { "id": "noise_hunting", "trigger": { "type": "noise_above", "threshold": 79 }, "one_shot": false,
    "effects": [ { "type": "message", "text": "Closer now. Find somewhere to hide." }, { "type": "play_sound", "sound": "curator" } ] },
  { "id": "noise_caught", "trigger": { "type": "noise_above", "threshold": 99 }, "one_shot": true,
    "effects": [ { "type": "game_over", "result": "lose", "title": "Caught", "reason": "The clicking stops right behind you." } ] }
]
```

3. **Hiding resets it.** Put a noise-gated interaction *first* on a few objects (the first matching interaction wins), and mark them `hiding_spot: true`:

```json
{ "verb": "hand", "when": [ { "type": "noise_above", "threshold": 29 } ],
  "then": [ { "type": "message", "text": "You squeeze into an empty drawer and lie still..." }, { "type": "set_noise", "amount": 10 } ] }
```

4. **Brute force summons a guard.** A widget's `on_max_fail` can raise the alarm instead of just scolding: `play_sound`, a big `add_noise`, `set_flag guard_here`, `show_object` a hidden guard sprite and `set_view` the player out of the close-up (which also closes the widget). While the flag is set, the guarded object's interactions say "not with that thing watching" (LOOK) or end the game (HAND); the guard itself is LOOK-safe and HAND-deadly. Leaving the room clears it: a `conditional_effect` on the exit's Move interaction resets the flag and hides the guard. Never make a guard permanent unless an alternative route exists (rule: no soft-locks).
5. **The same guard blocks rooms.** Show a guard object on a nav hotspot's view and give the nav's Move interaction a `when: [flag_is guard_here]` variant that refuses ("The drone's lens sweeps the doorway. Not now.") before the normal one. Clear the flag from an event, a distraction item, or another room.

The soft-lock search resets noise to 0 between states, so noise-based deaths never show up as soft-locks; keep noise logic out of goal-critical interactions so the search stays small.

### Testing shortcut: `setting.dev_skip` (temporary)

```json
"dev_skip": { "label": "Skip to the maze", "effects": [ { "type": "add_item", "item": "surgical_probe" }, { "type": "set_view", "view": "act1_ventilation_shaft" } ] }
```

Puts a button in the player's title bar that runs `effects` (any effect types) at once, so a tester can jump past earlier content with the items and flags it would have earned. Undo goes back to before it. A testing aid only: remove it before publishing a scenario.

### Patrols and the game clock

A **patrol** is a unit that sweeps a fixed route of rooms on a fixed cycle, on the game clock. The player can learn its rhythm (turn on the clock display), hear it coming, and get out of its way or hide. It is a cheap, readable source of urgency that needs no AI.

**The game clock** counts seconds of play. It runs only while the player is in control: it stops during the intro and the wake-up, for dialogue, puzzle widgets and close-up overlays, on death screens and while the browser tab is hidden. `"setting": { "clock": { "show": true } }` shows it in the title bar as `Time m:ss`. Undo puts the clock back with everything else.

```json
"patrols": [{
  "id": "hunter_patrol",
  "when": [ { "type": "flag_not", "flag": "alarm_hunters_out" } ],
  "period": 60, "first_at": 60, "warn_seconds": 5,
  "warn_sound": "patrol", "enter_sound": "patrol", "nearby_sound": "patrol_far", "notice_seconds": 1.5,
  "warn_message": "Metal legs, clicking closer. Something is coming this way.",
  "sprite": { "file": "sprites/hunter_drone.png", "frame_width": 237, "frame_height": 600, "columns": 4, "rows": 1, "frame_rate": 4, "scale": 0.3 },
  "shadow": { "width": 56, "height": 10, "opacity": 0.5, "offset_y": 22 },
  "stops": [
    { "views": ["act1_stasis_hold", "act1_cataloguer_closeup"], "enter": 0, "leave": 5, "path": [[985, 712], [560, 650], [285, 448]],
      "warn_message": "...Get out of its way, or get back in your pod.", "safe_when": [ { "type": "flag_is", "flag": "on_far_ledge" } ] },
    { "views": ["act1_containment_corridor"], "enter": 5, "leave": 10, "path": [[465, 745], [470, 600], [585, 392]] },
    { "views": ["act1_feeding_station"], "enter": 10, "leave": 15, "path": [[515, 745], [745, 700], [790, 440]] },
    { "views": ["act1_specimen_archive"], "enter": 15, "leave": 20, "path": [[500, 745], [420, 650], [300, 612]], "fade_out": true }
  ],
  "on_caught": [ { "type": "game_over", "result": "lose", "title": "Caught", "reason": "..." } ]
}]
```

| Field | Meaning |
|-------|---------|
| `period` | Seconds between the starts of two sweeps |
| `first_at` | Clock time of the first sweep (default: one `period` in) |
| `when` | It patrols only while these conditions hold (switch it off for a chase, an alarm, an act change) |
| `stops[]` | One leg per room: `views` (the room plus any close-ups that belong to it), `enter`/`leave` (seconds into the sweep), `path` (its route across the room, 960x720 feet positions, walked at an even pace), `flip` (draw it mirrored), `fade_out` (it ends its sweep here), `warn_message` (overrides the patrol's), `nearby_message` (shown, with `nearby_sound`, to a player next door while it walks through this room: "Out in the corridor, metal legs tick past the door..."), `safe_when` (conditions that keep the player safe in this room besides hiding, e.g. up on a ledge it passes under) |
| `warn_seconds` | Warning before it comes into the player's room (default 5): `warn_sound` plays and the room's `warn_message` shows |
| `enter_sound` | Plays when it comes into the player's room |
| `nearby_sound` | Plays when it comes into a room next door to the player's (any room with a Move exit into it, either way): the player hears it pass through the wall, and the leg's `nearby_message` names where it is. A close-up sub-view (one with `back_label`) counts as the room it was opened from. Use a clip a little softer than `enter_sound`, but clearly audible |
| `notice_seconds` | How long it takes to notice a player who is in its room and not hiding (default 1.5), then `on_caught` runs |
| `sprite`, `shadow` | How it is drawn while it walks through the player's room (scaled by the floor's `depth_scale`; it never takes clicks) |

Rules that keep it fair (and soft-lock free):

- **Every room on the route needs a way out of it or a hiding spot.** Check the timing: a room whose only exit leads into the room the patrol is in *now* is a trap unless it has a hiding spot (The Harvest's archive is a dead end behind the feeding station, so it has the benches).
- **Hiding spots answer to `patrol_near`.** Put the hiding interaction first on the object, so it wins while the patrol is close and the ordinary interaction runs the rest of the time:

```json
{ "verb": "hand", "when": [ { "type": "patrol_near", "patrol": "hunter_patrol" } ],
  "then": [ { "type": "message", "text": "You climb back into your pod... Hold still." }, { "type": "start_hiding" } ] }
```

  While hiding, the player is not drawn and the patrol walks past. Any HAND, MOVE or item use, or walking, ends hiding; LOOK and TALK do not.
- **Teach it in the death text.** "They pass every minute, and you can hear them coming. Watch the clock, leave the room, or hide." With Undo, a death costs a few seconds.
- Patrols run on real time, which the soft-lock search does not model; keep them out of goal-critical logic (they only kill, and death has Undo).

Tests: `client/src/engine/ScenarioEngine.patrol.test.ts`, browser `scenarios/the-harvest/scripts/playthrough/patrol.cjs` (other browser suites load with `?noPatrols`).

### Meters

A **meter** is a counter on the HUD with a maximum: breath, a lung-sac, a countdown. It can cost one per move, warn as it runs low, and do something when it runs out.

```json
"meters": [
  { "id": "breath", "label": "Breath", "max": 9, "cost_per_move": 1,
    "active_when": [ { "type": "flag_is", "flag": "in_thin_air" } ],
    "warnings": [ { "at": 3, "message": "Your chest burns.", "sound": "cough" }, { "at": 1, "sound": "heartbeat" } ],
    "on_empty": [ { "type": "game_over", "result": "lose", "title": "Out of air", "reason": "..." } ] },
  { "id": "sac", "label": "Lung-sac", "max": 4, "initial": 0, "visible_when": [ { "type": "has_item", "item": "lung_sac" } ] }
]
```

| Field | Meaning |
|-------|---------|
| `max`, `initial` | Range and start (default `max`) |
| `cost_per_move` | Taken after each `set_view` while `active_when` holds. Close-up sub-views (with `back_label`) are free |
| `active_when` | When it costs and can run out (default always) |
| `visible_when` | When the HUD shows it (default: while active) |
| `style`, `color` | `"pips"` (a dot per point, default) or `"bar"` |
| `warnings[]` | `{at, message?, sound?}`: given once each time the value drops to `at` or below |
| `on_empty` | Runs once when the value reaches 0 while active (again only after a refill) |

Refill with a view's **`on_enter`** effects (run after every `set_view` into it, after the move's cost): `"on_enter": [ { "type": "meter_set", "meter": "breath", "value": "max" } ]`. The same hook carries any line a view should say on arrival ("A cold draught from the north").

### Cycles

A **cycle** is a rhythm on the game clock with named phases: a lung breathing in and out, a vent firing.

```json
"cycles": [ { "id": "gut_breath", "phases": [ { "id": "in", "seconds": 4, "sound": "lung_in" }, { "id": "out", "seconds": 3, "sound": "lung_out" } ],
              "offset": 0, "views": ["warren_1", "warren_2"] } ]
```

`cycle_is` reads it. `offset` puts cycles out of step; `when` switches it off; a phase's `sound` and `message` are given only to a player in one of `views`. A sprite can follow a cycle: `"sprite": { ..., "sync_cycle": "gut_breath" }` spreads its frames over the period (a throat opening and closing), and `"frame_when": [ { "when": [...], "frame": 1 } ]` picks a still frame by state (a membrane shut during a surge).

Gate an exit on a cycle with ordinary interactions: put the `cycle_is` one first.

### Checkpoints

`set_checkpoint` saves the whole game at a zone's start. On a death the end screen offers **Restart from (text)**, which puts everything back to that moment (items, flags, meters, the clock), keeping the checkpoint. `no_undo: true` hides **Undo last move** while it is set, so dying inside a zone sends you to its start (no soft-locks from a one-move undo into a doomed state). `clear_checkpoint` forgets it. Undo itself restores whichever checkpoint was set at the time.

### Pursuers (behind walls)

A **pursuer** hunts the player from the other side of the walls, one step per move, and can only reach him at marked views (grates). It is readable: it hums one move before it can strike.

```json
"pursuers": [ {
  "id": "curator", "when": [ { "type": "flag_is", "flag": "in_core" } ],
  "zone": ["core_1", "core_2", "..."], "strike_views": ["core_7", "core_12"],
  "start_distance": 6, "reset_distance": 4, "strike_seconds": 4,
  "silent_flag": "held_breath", "hum_sound": "curator_hum", "hum_message": "A low hum, right behind the grate.",
  "lost_message": "The hum moves off down the wall.",
  "on_strike": [ { "type": "game_over", "result": "lose", "title": "Recovered", "reason": "..." } ]
} ]
```

Each `set_view` inside its `zone` brings it one move closer (to 0). Entering a strike view with it 1 move away or less starts the **hum**; after `strike_seconds` it reaches in (`on_strike`). Leave the screen in time, or set `silent_flag` (hold your breath) during the hum, and it loses you: it falls back to `reset_distance`. A move made with `silent_flag` set doesn't bring it closer (the flag is used up). `pursuer_divert` sends it away; leaving the zone resets it. `pursuer_near` reads it. For a race against it (it heading to a control room), use a meter that costs one per move.

### Sensing patrols

A patrol stop with **`sense`** notices the player only within `radius` (960x720 units) of where it is drawn, only while he walks (`only_while_moving`), never while `masked_when` holds (a wind that covers you), and never while he stands inside one of the floor's `walk_area.shadows` polygons. Make it loop on one wide screen with one stop covering its whole period (`first_at: 0`, `warn_seconds: 0`, `enter: 0`, `leave: period`). Walk it in a loop by making its `path` end where it starts.

### Floor scale and speed

`walk_area.motion` (`"paced"`, `"stepped"` or `"smooth"`) overrides `character.walk_motion` on this floor: `"smooth"` for drifting in space, with `footsteps: false`.

`walk_area.scale` draws the character (and patrols) at that size on this floor, on top of `depth_scale`: a speck crossing a city. Walking slows with size, so add `walk_area.speed` (a multiplier) to keep wide screens quick to cross.

### Player actions

`setting.actions` are buttons on the HUD for things the player does to himself, shown while `when` holds:

```json
"actions": [ { "id": "listen", "label": "Listen", "title": "Hold your breath and listen (costs a breath)",
  "when": [ { "type": "flag_is", "flag": "in_thin_air" } ],
  "effects": [ { "type": "meter_add", "meter": "breath", "amount": -1 }, { "type": "set_flag", "flag": "held_breath" },
               { "type": "sense", "radius": 2, "kinds": [ { "label": "Cold air", "views": ["fold_3", "fold_8"] } ] } ] } ]
```

### Rhythm widget

`widget_type: "rhythm"` is call and response: she breathes a phrase of long and short beats, you answer it, holding the mouse button (or Space) for long and tapping for short, in time.

```json
{ "id": "queen_audience", "widget_type": "rhythm", "presentation": "overlay",
  "config": { "title": "She Who Breathes For Us", "phrases": ["LSL", "SLSS", "LSSLS"],
              "extra_phrases": [ { "when": [ { "type": "flag_is", "flag": "keth_enemy" } ], "pattern": "LLSSLS" } ],
              "beat_ms": 650, "long_ms": 300, "max_errors": 3, "slow_after": 3, "slow_factor": 1.5,
              "hint_when": [ { "type": "flag_is", "flag": "keth_ally" } ], "long_sound": "breath_long", "short_sound": "breath_short" },
  "on_solve": [ ... ], "on_fail": [ ... ] }
```

A mistake (wrong length, or off the beat) makes her repeat the phrase; `max_errors` in one phrase fails the attempt (`on_fail`). After `slow_after` failed attempts she breathes `slow_factor` slower; while `hint_when` holds the next beat is lit during your answer.

Tests for meters, cycles, checkpoints, pursuers, sensing patrols, sense, actions, the rhythm widget and map layers: `client/src/engine/ScenarioEngine.vents.test.ts`.



---

## Killer AI

The AI killer is the scenario's antagonist. Fully configurable per scenario.

```json
"killer": {
  "name": "Dr. Harlan Webb",
  "description": "A disgraced surgeon. Methodical. Patient. Keeps a schedule.",

  "base_behavior": {
    "check_interval_seconds": 50,
    "interval_variance_seconds": 10,
    "noise_threshold_curious": 25,
    "noise_threshold_investigate": 55,
    "noise_threshold_immediate": 85,
    "noise_decay_per_second": 1.5,
    "warning_duration_seconds": 8,
    "search_duration_seconds": 12
  },

  "search_behavior": {
    "thoroughness": 0.4,
    "evidence_flags": ["chair_empty", "safe_opened", "window_tampered"],
    "thoroughness_on_evidence": 0.7,
    "search_order": "random"
  },

  "personality": {
    "on_approach": [
      "Time for a check-up...",
      "Let's see how our patient is doing.",
      "Hold still now."
    ],
    "on_search": [
      "I know you're here...",
      "Come now, don't make this harder than it needs to be."
    ],
    "on_clear": [
      "Hmm. Behaving yourself.",
      "Everything in order."
    ],
    "on_evidence": [
      "What's this? Someone's been busy...",
      "You think I wouldn't notice?"
    ],
    "on_catch": [
      "There you are. The procedure begins now."
    ]
  },

  "on_visit_effects": [
    {
      "conditions": [{ "type": "object_state", "object": "desk_drawer", "state": "open" }],
      "effects": [
        { "type": "set_state", "object": "desk_drawer", "state": "locked" },
        { "type": "message", "text": "You hear the killer slam a drawer shut as he leaves." }
      ]
    }
  ],

  "special_behaviors": [
    {
      "id": "phone_distraction",
      "trigger": { "type": "flag_is", "flag": "killer_distracted", "value": "true" },
      "effect": "distracted",
      "duration_seconds": 25,
      "description": "Killer answers a phone call."
    },
    {
      "id": "enraged",
      "trigger": { "type": "flag_is", "flag": "killer_alerted", "value": "true" },
      "effect": "enraged",
      "overrides": {
        "check_interval_seconds": 15,
        "thoroughness": 0.8
      }
    }
  ]
}
```

### Behavior Parameters

| Field | Type | Description |
|-------|------|-------------|
| `check_interval_seconds` | number | Base time between routine checks. |
| `interval_variance_seconds` | number | Random +/- added to interval. Prevents gaming the timer. |
| `noise_threshold_curious` | number | Noise level that makes the killer pay attention (shorter next check). |
| `noise_threshold_investigate` | number | Noise level that triggers investigation (check within 15s). |
| `noise_threshold_immediate` | number | Noise level that causes immediate check. |
| `noise_decay_per_second` | number | How fast noise fades. Higher = more forgiving. |
| `warning_duration_seconds` | number | How long the player gets warned before the killer arrives. |
| `search_duration_seconds` | number | How long the killer searches before leaving. |

### Search Behavior

| Field | Type | Description |
|-------|------|-------------|
| `thoroughness` | float (0-1) | Chance of checking each hiding spot. 0.4 = 40% chance per spot. |
| `evidence_flags` | string[] | Flags the killer checks for. If found, `thoroughness_on_evidence` applies. |
| `thoroughness_on_evidence` | float | Higher search thoroughness when evidence is found. |
| `search_order` | `"random"` `"nearest"` `"sequential"` | How the killer checks hiding spots. |

### Killer States (for conditions)

The killer cycles through these states. Use `killer_is` conditions to react to them.

| State | Description |
|-------|-------------|
| `idle` | Downstairs, routine timer counting. |
| `curious` | Heard something. Timer shortened. |
| `approaching` | Coming upstairs. Warning shown to player. |
| `checking` | In the room, searching. Player must be hidden. |
| `returning` | Going back downstairs. Brief safe window. |
| `distracted` | Special behavior — not checking. |
| `enraged` | Special behavior — aggressive mode. |

### On-Visit Effects

After each killer visit, `on_visit_effects` fire. This is how the killer changes the environment:

```json
"on_visit_effects": [
  {
    "conditions": [{ "type": "object_state", "object": "window", "state": "cut" }],
    "effects": [
      { "type": "set_state", "object": "window", "state": "boarded" },
      { "type": "set_flag", "flag": "window_boarded", "value": "true" },
      { "type": "message", "text": "The killer notices the cut window. He boards it up. Your escape route is gone." }
    ]
  }
]
```

This is terrifying game design. The killer is an active opponent who responds to your progress. Leave evidence, and the killer adapts.

---

## Win & Lose Conditions

```json
"win_conditions": [
  {
    "id": "window_escape",
    "description": "Escape through the window"
  },
  {
    "id": "front_door_escape",
    "description": "Sneak out the front door while killer is upstairs"
  }
],

"lose_conditions": [
  {
    "id": "caught",
    "description": "Caught by the killer while not hiding"
  },
  {
    "id": "time_limit",
    "seconds": 600,
    "message": "Dawn breaks. The killer's accomplice arrives. It's too late.",
    "description": "Ran out of time"
  }
]
```

Win conditions are informational — the actual win is triggered by `game_over` effects on specific interactions. They're listed here for documentation and validation.

Lose conditions include `caught` (built into the killer AI system) and optional `time_limit` (global countdown).

---

## Hints

> **Engine status:** the "?" button reads the per-view `hints` array ([View Hints](#view-hints)). The timed top-level `hints` form below is specified for a future timer-driven system and is not read by the engine yet.

Progressive help system. Hints unlock over time or by request.

```json
"hints": [
  {
    "id": "hint_1",
    "after_seconds": 60,
    "text": "Look carefully at the radiator...",
    "relates_to": "rusty_nail"
  },
  {
    "id": "hint_2",
    "after_seconds": 180,
    "conditions": [{ "type": "not_has_item", "item": "wire_cutters" }],
    "text": "That floorboard seems unsteady.",
    "relates_to": "floorboard"
  },
  {
    "id": "hint_3",
    "after_seconds": 300,
    "conditions": [{ "type": "has_item", "item": "torn_note_a" }, { "type": "has_item", "item": "torn_note_b" }],
    "text": "Those torn notes might fit together...",
    "relates_to": "combination"
  }
]
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Hint identifier. |
| `after_seconds` | number | yes | Available after this many seconds. |
| `conditions` | condition[] | no | Only show if these are true (avoids hinting at solved puzzles). |
| `text` | string | yes | The hint text. Suggestive, not explicit. |
| `relates_to` | string | no | Object/item/combination this hint relates to. |

---

## Solution Paths

Documented paths through the scenario. Used for validation and to guide AI generation.

```json
"solution_paths": [
  {
    "id": "main_path",
    "name": "The Quiet Escape",
    "description": "Patient, methodical path through the window.",
    "difficulty": "medium",
    "steps": [
      { "action": "hand chair (struggle free)", "noise": 45, "note": "Loud but necessary" },
      { "action": "hand radiator (get nail)", "noise": 5 },
      { "action": "hand bookshelf (get torn note A)", "noise": 5 },
      { "action": "hand painting (reveal safe)", "noise": 10 },
      { "action": "hand floorboard (reveal box)", "noise": 25 },
      { "action": "hand hidden box (get torn note B + wire cutters)", "noise": 8 },
      { "action": "combine torn notes (get code)", "noise": 0 },
      { "action": "solve safe lock (7-4-1-9)", "noise": 4 },
      { "action": "take scalpel", "noise": 2 },
      { "action": "use wire cutters on window", "noise": 25 },
      { "action": "hand window (escape!)", "noise": 10 }
    ],
    "total_noise_estimate": 139,
    "estimated_time_seconds": 480
  },
  {
    "id": "alternate_path",
    "name": "The Desperate Smash",
    "description": "Louder, faster, riskier — break through the wall.",
    "difficulty": "hard",
    "steps": [
      { "action": "hand chair (struggle free)", "noise": 45 },
      { "action": "hand radiator (detach pipe)", "noise": 35 },
      { "action": "use pipe on weak wall", "noise": 60 },
      { "action": "hand wall opening (escape!)", "noise": 15 }
    ],
    "total_noise_estimate": 155,
    "estimated_time_seconds": 180
  }
]
```

Solution paths serve three purposes:
1. **Validation**: The engine can verify that these paths are actually completable
2. **AI guidance**: An LLM generating a scenario should design at least one solution path
3. **Documentation**: Playtesters and players (after completion) can see intended solutions

---

## Validation Rules

A valid scenario must satisfy all of these. Two tools check a subset automatically: `node tools/validate-scenario.mjs <scenario.json>` (referential integrity, missing assets, duplicate keys, off-canvas anchors, hint order) and `node tools/softlock-search.mjs <scenario.json> --goal <expr>` (reachability and no dead ends, by exhaustive search with the real engine). The rest are not machine-checked yet.

### Referential Integrity
1. Every `item` referenced in any condition or effect exists in `items[]`
2. Every `object` referenced in any condition or effect exists in `objects[]`
3. Every `flag` referenced in any condition exists in `flags{}`
4. Every `view` referenced in `set_view` effects or widget `view` fields exists in `views[]`
5. Every `event` referenced in `trigger_event` effects exists in `events[]`
6. Combination `result` items exist in `items[]`
7. Combination source items exist in `items[]`

### Reachability
8. At least one `game_over` effect with `result: "win"` exists
9. At least one documented `solution_path` is completable from initial state
10. Every item referenced in conditions is obtainable (reachable through some interaction chain)
11. No dead ends: if an item is consumed (`remove_item`), it must not be required downstream

### Structural
12. At least one hiding spot exists (`hiding_spot: true`)
13. At least one phase has empty `starts_when` (initial phase)
14. Phase transitions don't create cycles
15. Puzzle widget solutions are valid for their type
16. All noise values are in range 0-100
17. Killer behavior parameters are positive numbers
18. `thoroughness` values are between 0.0 and 1.0

### Best Practices (warnings, not errors)
19. Every object should have at least a `look` interaction
20. Items should have at least one `examine` interaction
21. Total noise of the quietest solution path should be survivable given killer thresholds
22. Hints should cover the main puzzle chain
23. There should be at least 2 distinct solution approaches

---

## Design Patterns

30 proven patterns for creating great scenarios. Drawn from classic point-and-click adventures AND adapted from horror, immersive sims, puzzle games, stealth games, real escape rooms, and narrative games. Every pattern is representable in the existing schema — no code changes needed.

A typical scenario uses 8-12 patterns from the 30. That's **over 30 million unique pattern combinations** (C(30,10) = 30,045,015) before accounting for theme, narrative, items, and killer personality. The design space is effectively infinite.

Organized into six categories: Structure, Item & Knowledge, Risk & Reward, Solution Design, Story & Choice, and Environment & Adaptation.

---

### Structure Patterns
*How puzzles connect to each other.*

#### Pattern 1: The Gateway Puzzle
The first puzzle should have no prerequisites. Let the player succeed immediately to build confidence. Zero conditions in `when`, simple reward in `then`.

> "Look at the radiator. There's a nail. Take the nail." — No items needed, no conditions, immediate reward.

#### Pattern 2: The Dependency Chain
A → B → C → D. Each step unlocks the next. The backbone of every good escape room. Each interaction's `when` conditions gate on the previous step's output (a flag, an item, an object state).

> Pry floorboard → find box → open box → get wire cutters → cut window mesh → escape.

#### Pattern 3: The Fork
Two independent puzzle branches that converge. Prevents the player from getting stuck on a single bottleneck. The convergence point has `all_of` conditions requiring both branches.

> Branch A: bookshelf → torn note A
> Branch B: floorboard → box → torn note B
> Converge: combine notes → safe code

#### Pattern 4: The Progressive Reveal
Each puzzle solved reveals more of the room or story, building momentum. Use `show_object` and `set_view` effects to open up the environment as the player progresses.

> Move painting → see safe. Open safe → get scalpel. Use scalpel on mattress → find journal. Read journal → learn the truth.

#### Pattern 5: The False Summit
Player thinks they can escape, then discovers one more obstacle. Use `advance_phase` to shift the game's tone at the moment of false hope.

> Cut the window mesh! Almost free! → Try to climb out → "The window frame is painted shut. You need something to pry it." → One more puzzle.

---

### Item & Knowledge Patterns
*What the player works with — objects, inventory, and information.*

#### Pattern 6: The Dual-Purpose Item
An item solves one puzzle AND carries a clue for another. Discovered through examination. The item's `examine` interactions set flags that unlock conditions elsewhere.

> Pick up key (to unlock a drawer). Examine key in inventory → "Stamped: 302." That number is the safe code.

#### Pattern 7: The Nested Secret
*Inspired by: The Room series*

A single object or item unfolds through layers of examination. Each layer is a separate `look` or `hand` interaction gated by a flag from the previous discovery. One object tells an entire story through progressive revelation.

> Examine the coat → find a pocket → reach inside → find a locket → open the locket → find a photograph → flip the photograph → read tiny text on the back.

**Schema implementation:** Sequential interactions on one item, each with `when` conditions checking flags set by the previous step. Or use `transform_item` to create progressively revealed versions of the item.

```json
{
  "verb": "hand",
  "when": [{ "type": "flag_is", "flag": "locket_found", "value": "true" },
           { "type": "flag_not", "flag": "locket_opened", "value": "true" }],
  "then": [
    { "type": "message", "text": "You pry the locket open. Inside: a tiny photograph." },
    { "type": "set_flag", "flag": "locket_opened", "value": "true" }
  ]
}
```

#### Pattern 8: The Knowledge Gate
*Inspired by: Myst, Outer Wilds*

Nothing physical blocks progress — only knowing the answer. You read a date on a calendar. You hear a name whispered through a vent. You find numbers scratched under a drawer. The combination lock was always interactable. The player carries knowledge, not keys.

This forces `look` and `talk` verbs to be as important as `use_item`. Clue interactions set flags purely for the player's benefit (showing messages). Puzzle widgets accept the solution directly without checking prerequisite flags — the gate is in the player's head.

> Three separate objects each reveal one digit of a combination when examined. The combination lock accepts the code immediately — no "has_item" or "flag_is" gating the puzzle widget.

#### Pattern 9: The Revelation Tool
*Inspired by: Real escape rooms (UV/blacklight)*

An item that when used on surfaces reveals hidden information. One item transforms the entire room into a second layer of puzzles. The player re-examines everything they've already seen. Doubles the interaction density of the whole scenario.

Every object that has hidden content gets an additional `use_item` interaction requiring the tool, with messages and flags revealing the hidden layer.

```json
{
  "verb": "use_item",
  "item": "uv_flashlight",
  "when": [{ "type": "object_state", "object": "poster", "state": "hanging" }],
  "then": [
    { "type": "message", "text": "Under the UV light, invisible ink glows on the poster: '7-4-1-9'" },
    { "type": "set_flag", "flag": "found_uv_code", "value": "true" }
  ]
}
```

**Design tip:** Don't overuse this. 3-5 objects with hidden content is ideal. If everything has a UV secret, the tool becomes tedious instead of exciting.

#### Pattern 10: The Cross-Reference Deduction
*Inspired by: Return of the Obra Dinn*

Three clues that individually mean nothing. The player synthesizes them mentally to derive the answer. No flag or condition connects them — the connection lives in the player's reasoning. This is the highest form of adventure game puzzle because it trusts the player's intelligence.

> A torn note reads "the third one." A row of seven colored switches on a panel. A faded photograph shows a hand pointing at the third switch from the left. The player synthesizes: flip the third switch. The puzzle widget just accepts the right answer.

**Schema implementation:** Clue objects have `look` interactions with descriptive messages. The puzzle widget (toggle_panel, combination_lock, keypad) has a fixed `solution`. No conditions connect the clues to the widget.

---

### Risk & Reward Patterns
*Tension with the killer — noise, evidence, time pressure.*

#### Pattern 11: The Noise Tradeoff
A loud solution vs. a quiet solution to the same puzzle. Risk vs. reward. Two interactions on the same object, gated by different conditions, with different `noise` values.

> Loud: Smash the glass case (noise: 40, instant, no items needed).
> Quiet: Pick the lock with the nail (noise: 5, requires the nail).

#### Pattern 12: The Evidence Gamble
Solving a puzzle leaves visible evidence. The killer notices on the next visit and adapts. The puzzle's effects set flags that appear in the killer's `evidence_flags` list.

> Open the safe → killer sees it on next visit → killer becomes more thorough.
> Alternative: close the safe after taking the item (extra interaction, but hides evidence).

**Design tip:** Give the player a way to hide evidence (close the safe, wipe fingerprints, move furniture back). This rewards careful play without punishing puzzle-solving.

#### Pattern 13: The Distraction Window
Intentionally trigger noise to create an opportunity. A high-noise interaction lures the killer, and a timed event (`delay_then`) fires during the killer's investigation, granting temporary access to something.

> Rattle the heating pipe (noise: 50) → killer comes to investigate → while they search, a `delay_then` event enables an interaction that's normally blocked by `killer_is: idle`.

#### Pattern 14: The Ticking Clock Decision
Two time-sensitive things happen at once. Player must choose which to pursue. Implemented with simultaneous events: one creating an opportunity (show_object, timed window) while another creates danger (killer approaching).

> The killer is coming AND a timed event is happening. Do you hide (safe) or rush to grab the item that just appeared (risky)?

#### Pattern 15: The Bait and Punish
*Inspired by: Resident Evil, survival horror*

Different from a Red Herring, which doesn't work. Bait and Punish **works** but costs dearly. The obvious solution is functional but punishing. The patient player who explores finds the better path.

Two interactions on the same object: one with no gating condition but high noise/consequences, and another gated by a preparation flag that achieves the same result quietly. List the gated one first: the engine takes the first match, so an unconditional interaction placed first would always win.

```json
{
  "verb": "hand",
  "when": [{ "type": "flag_is", "flag": "alarm_disabled", "value": "true" }],
  "then": [
    { "type": "add_item", "item": "key" },
    { "type": "message", "text": "You take the key. Silence." }
  ],
  "noise": 2
},
{
  "verb": "hand",
  "when": [],
  "then": [
    { "type": "add_item", "item": "key" },
    { "type": "add_noise", "amount": 45 },
    { "type": "message", "text": "You grab the key — and an alarm blares!" },
    { "type": "trigger_event", "event": "alarm_triggered" }
  ],
  "noise": 0
}
```

**Important:** Put the gated (quiet) interaction FIRST in the array so it matches before the ungated (loud) one. Interaction resolution takes the first match.

#### Pattern 16: The Sound Masking
*Inspired by: Hitman, Thief, stealth games*

Environmental noise covers the player's actions temporarily. Turn on the radio, start the washing machine, open the window during a thunderstorm. While the masking is active, noisy actions cost less.

Toggling a masking object sets a flag. Loud interactions have two entries: one gated by the masking flag with lower `add_noise`, one without. The masking device itself may add moderate noise when activated, and it may attract the killer's curiosity.

```json
{
  "verb": "hand",
  "when": [{ "type": "flag_is", "flag": "radio_playing", "value": "true" }],
  "then": [
    { "type": "message", "text": "You force the drawer open. The radio covers the sound." },
    { "type": "set_state", "object": "drawer", "state": "open" }
  ],
  "noise": 8
},
{
  "verb": "hand",
  "when": [],
  "then": [
    { "type": "message", "text": "You force the drawer open with a crack that echoes through the room." },
    { "type": "set_state", "object": "drawer", "state": "open" }
  ],
  "noise": 35
}
```

**Design tip:** Sound masking should be temporary (use a `delay_then` to clear the flag) and imperfect (the masking object itself adds some noise or triggers killer curiosity). A permanent noise nullifier removes tension.

#### Pattern 17: The Trap Setting
*Inspired by: Hitman, Home Alone, stealth games*

The player rigs the environment against the killer before a visit. `use_item` on environmental objects sets flags that the killer's `on_visit_effects` or `special_behaviors` check. When the killer arrives and triggers on-visit logic, the trap fires.

> Balance a bucket on the door. Scatter broken glass on the stairs. Rig the light switch to short-circuit. The killer is delayed, disoriented, or forced to retreat.

```json
{
  "verb": "use_item",
  "item": "bucket_of_water",
  "when": [{ "type": "object_state", "object": "door", "state": "closed" }],
  "then": [
    { "type": "remove_item", "item": "bucket_of_water" },
    { "type": "set_flag", "flag": "door_trap_set", "value": "true" },
    { "type": "message", "text": "You balance the bucket on top of the door. Crude, but effective." }
  ],
  "noise": 8
}
```

Then in `killer.special_behaviors`:
```json
{
  "id": "door_trap",
  "trigger": { "type": "flag_is", "flag": "door_trap_set", "value": "true" },
  "effect": "distracted",
  "duration_seconds": 15,
  "description": "The bucket crashes down. The killer stumbles, cursing.",
  "on_trigger_effects": [
    { "type": "set_flag", "flag": "door_trap_set", "value": "false" },
    { "type": "message", "text": "CRASH! The bucket dumps water on the killer. You hear swearing and stumbling." }
  ]
}
```

---

### Solution Design Patterns
*How individual puzzles are structured and solved.*

#### Pattern 18: The Red Herring
An item or approach that seems right but fails with an informative message. The failure teaches the player something about what they actually need. A `use_item` interaction that doesn't solve the puzzle but gives a clue.

> Use scalpel on wire mesh → "The blade snaps against the wire. Too delicate for this." Player learns they need a heavier cutting tool.

#### Pattern 19: The Emergent Combination
*Inspired by: Deus Ex, Dishonored, Prey (immersive sims)*

Two individually simple mechanics combine for a solution the player feels like they discovered. Each item has an obvious intended use, but a clever player notices they can interact in an unexpected way that the scenario designer actually planned for.

Multiple `use_item` entries on the same object, gated by different items. The "emergent" path is quieter, faster, or more elegant.

> Oil can has an obvious use (lubricate a hinge). Lighter has an obvious use (read in a dark vent). But use oil can on the boarded window, then use lighter on the oiled boards — they burn away silently, creating an escape route the crowbar couldn't open.

**Design tip:** Make both items have obvious "primary" uses so the combination feels discovered, not prescribed.

#### Pattern 20: The Multi-Path Solution
*Inspired by: Deus Ex, Dishonored, Prey (immersive sims)*

Same locked cabinet. Path A: find the key (quiet, requires exploration). Path B: pry it open with the crowbar (loud, fast). Path C: dissolve the hinges with acid (medium noise, consumes the acid you might need later). Not just "alternate solutions" vaguely — a deliberate design where each path has meaningfully different costs.

Multiple interaction entries on one object, each gated by different items, each with different `noise` values, `remove_item` effects, and downstream consequences.

**Design tip:** At least one path should be achievable with items from the Gateway Puzzle, so no player is permanently stuck.

#### Pattern 21: The Rule Subversion
*Inspired by: Baba Is You*

The player attacks the constraint itself instead of satisfying it. The sign says "Door opens at midnight" — the clever path isn't waiting for midnight but *changing the clock to read midnight*. The lock says "Requires 4-digit code" — the clever path is unscrewing the lock's housing.

The constraining object (clock, lock housing, sign) has its own `hand` or `use_item` interactions that modify conditions other objects check.

> A timed door mechanism reads the clock on the wall. The player manipulates the clock's state → the door's `object_state` condition is now met.

```json
{
  "verb": "hand",
  "when": [{ "type": "object_state", "object": "wall_clock", "state": "default" }],
  "then": [
    { "type": "set_state", "object": "wall_clock", "state": "midnight" },
    { "type": "message", "text": "You spin the clock hands to midnight. Something clicks in the walls." }
  ],
  "noise": 5
}
```

#### Pattern 22: The Myst Machine
*Inspired by: Myst*

An environmental puzzle with multiple interacting controls. A panel with dials, switches, and a lever. Set the controls based on clues found elsewhere, then activate. Wrong settings generate noise.

Implemented as a combination of puzzle widgets (dials, toggle panels) with a master activation object that checks their states.

> A ventilation control panel with 3 dials and a master switch. Each dial must match a number found elsewhere. Wrong combination = loud buzzer (noise: 20). Right combination = vent opens, revealing a hidden passage.

#### Pattern 23: The Power Routing
*Inspired by: Myst*

The room has limited power. A fuse box with three slots and five devices. The computer needs power to display the code. The UV light needs power to reveal hidden writing. The ventilation fan needs power to clear smoke from a blocked view. You can't run them all.

A toggle_panel puzzle widget or multi-state object represents the fuse box. Each configuration sets flags that device objects check. Different puzzles require different devices powered.

```json
{
  "id": "fuse_box",
  "widget_type": "toggle_panel",
  "config": {
    "num_switches": 5,
    "labels": ["Computer", "UV Lamp", "Vent Fan", "Camera", "Radio"],
    "max_active": 3,
    "solution": null
  },
  "on_change": [
    { "type": "conditional_effect",
      "when": [{ "type": "flag_is", "flag": "fuse_computer", "value": "on" }],
      "then": [{ "type": "set_state", "object": "computer", "state": "powered" }],
      "else": [{ "type": "set_state", "object": "computer", "state": "dead" }]
    }
  ]
}
```

**Note:** Power Routing uses toggle_panel without a single "solution" — the puzzle is figuring out which *combination* of powered devices you need at each stage of the escape.

#### Pattern 24: The Perspective Alignment
*Inspired by: The Witness*

Scattered marks on a wall look random from the main room view. But from a specific closeup view (look through a keyhole, peer through a grate, stand at a window), they align into a readable symbol, number, or map.

The marks exist as decorative objects in the main view (look → "Random scratches on the wall"). A specific view has a `look` interaction on an "aligned_marks" object that reveals the pattern and sets a flag.

> Scratches visible in the main view. Switch to `keyhole_view` → look at `aligned_scratches` → "From this angle, the scratches form a clear number: 47." → `set_flag: keyhole_code = 47`.

**Design tip:** This makes the views system a puzzle mechanic, not just navigation. The answer was always visible — the player just needed the right vantage point.

---

### Story & Choice Patterns
*Narrative structure and meaningful decisions.*

#### Pattern 25: The Moral Fork
*Inspired by: Telltale, Undertale*

A genuine branching choice with mutually exclusive outcomes. The choice interaction sets an exclusive flag. Downstream puzzles have entirely different interaction chains gated by which flag was set. Multiple `win_conditions` with different `flags_required` provide different endings.

> You find another captive chained in the closet. Free them — they help with a puzzle but take a tool you need, forcing a harder path. Or leave them — you keep all your items but miss their knowledge, and the ending reflects your choice.

**Design tip:** Both branches should lead to viable solutions. The fork is about *how* you escape and *who you are when you do*, not about one path being "correct."

#### Pattern 26: The Accomplice
*Inspired by: Adventure games, real escape rooms*

An NPC the player can't see but can interact with through a barrier: a voice through the wall, a hand under the door, someone on a phone that crackles to life. `talk` exchanges information, `use_item` passes objects through gaps.

An object represents the NPC/barrier. `talk` interactions give conditional dialogue based on trust/relationship flags. `use_item` passes items (`remove_item` + `set_flag` + `add_item` of what they return). Progressive trust unlocks better help.

```json
{
  "verb": "talk",
  "when": [{ "type": "flag_is", "flag": "ally_trust", "value": "high" }],
  "then": [
    { "type": "message", "text": "\"Listen — there's a loose brick behind the painting. That's where he hides the spare key.\"" },
    { "type": "set_flag", "flag": "knows_brick_secret", "value": "true" }
  ],
  "noise": 5
},
{
  "verb": "use_item",
  "item": "water_bottle",
  "when": [],
  "then": [
    { "type": "remove_item", "item": "water_bottle" },
    { "type": "set_flag", "flag": "ally_trust", "value": "high" },
    { "type": "message", "text": "You slide the water bottle under the door. \"Thank you... thank you. I'll tell you what I know.\"" }
  ],
  "noise": 3
}
```

#### Pattern 27: The Point of No Return
*Inspired by: Resident Evil, survival horror*

An irreversible action the player knows is permanent and must commit to. The tension isn't the puzzle but the decision to commit. Rewards players who prepare (extract information before destroying the source).

> Break the glass case to get the fire extinguisher — but cold air rushes in and a temperature timer starts. Burn the letter to create smoke that triggers sprinklers — but the letter had a code you might need. Pour acid on the lock — it dissolves, but so does the acid.

**Schema implementation:** An interaction that `remove_item` consumes a key resource, `set_state` changes something permanently (no reverse interaction exists), or `advance_phase` shifts the game irreversibly. The "preparation" step is examining the source object first (`look` to memorize the code before burning the letter).

**Design tip:** Always telegraph irreversibility. The `look` interaction should hint: "The acid would dissolve the lock... and everything else it touches." The player should feel informed, not ambushed.

---

### Environment & Adaptation Patterns
*The room changes around you. The killer fights back.*

#### Pattern 28: The Camouflage
*Adventure Engine-unique*

Actively hide evidence of your escape progress. After opening the safe, close it again. After cutting the wire mesh, hang a towel over the window. After prying up the floorboard, push the rug back over it. Extra interactions that produce zero puzzle progress but clear evidence flags so the killer doesn't escalate on the next visit.

Speed-runners skip it and gamble. Cautious players spend the extra clicks and stay safer. This rewards methodical, careful play.

*Schema: Additional `hand` interactions on solved objects that `set_state` to a "looks normal" variant and `set_flag` to clear flags from the killer's `evidence_flags` list.*

```json
{
  "verb": "hand",
  "when": [{ "type": "object_state", "object": "safe", "state": "open_empty" }],
  "then": [
    { "type": "set_state", "object": "safe", "state": "closed" },
    { "type": "set_flag", "flag": "safe_opened", "value": "false" },
    { "type": "message", "text": "You swing the safe door closed. From outside, it looks untouched." }
  ],
  "noise": 3
}
```

**Design tip:** Not every puzzle should be concealable. Let the player choose which evidence to hide and which to gamble on. The strategic choice is the fun part.

#### Pattern 29: The Echo
*Inspired by: Myst, Day of the Tentacle*

An action in one view produces an observable effect in another. Bang on the pipes in the main room → water pressure gauge changes in the bathroom closeup. Flip a breaker in the fuse box view → a device powers on in the main room. The player must explore multiple views to understand spatial cause-and-effect.

Different from the Myst Machine (a single panel with co-located controls). The Echo is about understanding how physically separated spaces connect through hidden systems.

*Schema: An interaction in one view's object sets flags or states on objects in another view. The player must `set_view` to observe results and map the connections.*

```json
{
  "verb": "hand",
  "when": [{ "type": "object_state", "object": "pipe_valve", "state": "closed" },
           { "type": "view_is", "view": "main" }],
  "then": [
    { "type": "set_state", "object": "pipe_valve", "state": "open" },
    { "type": "set_state", "object": "bathroom_faucet", "state": "running" },
    { "type": "set_flag", "flag": "water_flowing", "value": "true" },
    { "type": "message", "text": "You wrench the valve open. Water gurgles through the pipes behind the wall." }
  ],
  "noise": 12
}
```

The player only sees the faucet running when they visit the bathroom view — and only then do they understand the connection.

#### Pattern 30: The Decay Clock
*Adventure Engine-unique*

Puzzles get harder over time because the killer actively interferes via `on_visit_effects`. Early in the game, the window has thin wire mesh — one tool cuts it. But if the killer visits and notices, they board it up. Now you need a crowbar AND the wire cutters. Wait longer and the killer adds a padlock. Same escape route, three steps instead of one.

This creates urgency without an explicit timer. The player who explores early and acts decisively faces easier puzzles. The player who hesitates faces the killer's escalating countermeasures.

*Schema: `on_visit_effects` conditionally escalate obstacles. The same object has different interaction chains depending on which state the killer has pushed it to.*

```json
"on_visit_effects": [
  {
    "conditions": [{ "type": "object_state", "object": "window", "state": "cut" }],
    "effects": [
      { "type": "set_state", "object": "window", "state": "boarded" },
      { "type": "message", "text": "You hear hammering. The killer is boarding up the window." }
    ]
  },
  {
    "conditions": [{ "type": "object_state", "object": "window", "state": "boarded" }],
    "effects": [
      { "type": "set_state", "object": "window", "state": "boarded_and_padlocked" },
      { "type": "show_object", "object": "window_padlock" },
      { "type": "message", "text": "Metal clicking. The killer has padlocked the boards over the window." }
    ]
  }
]
```

**Design tip:** The hardest version of the puzzle should still be solvable — just require more steps or items. Never make a puzzle impossible through decay. The Decay Clock punishes delay, not failure.

---

## Complete Example

See `examples/surgeons-attic.json` for a full playable scenario using all features described in this specification.

---

## Intro Cinematic

`setting.intro_scenes` plays an animated opening before the game: painted scenes with sprites, glowing lights, particles, a slow camera, narration lines (with optional voice clips), music and sound. It replaces `intro_text` when both exist. The player clicks (or presses Space/Enter) to move to the next line and can skip the whole intro at any time. Coordinates are the usual 960x720 space; sprites are anchored by their feet (bottom-centre).

```json
"intro_scenes": [
  {
    "background": "intro/backgrounds/intro_taken.webp",
    "music": "intro/audio/music_intro.mp3",
    "sound": "intro/audio/sfx_taken.mp3",
    "camera": { "from": { "zoom": 1.0 }, "to": { "zoom": 1.14, "y": -60 }, "seconds": 11 },
    "sprites": [
      { "file": "intro/sprites/eva_tumble.png", "frame_width": 300, "frame_height": 300, "columns": 2, "frame_rate": 2,
        "scale": 0.3, "at": [560, 720], "move": { "to": [575, 170], "scale": 0.08, "seconds": 9 }, "spin": 150 }
    ],
    "ambient_lighting": { "lights": [ { "x": 0.5, "y": 0.13, "radius": 0.3, "color": [230, 255, 170], "alpha": 0.35, "pulse_speed": 0.8, "pulse_amount": 0.25 } ] },
    "effects": [ { "type": "particles", "motion": "rise", "area": [360, 130, 260, 590], "count": 60, "color": [240, 255, 200] } ],
    "lines": [
      { "text": "It did not attack. It harvested.", "voice": "intro/audio/narr_04.mp3" },
      { "text": "Outrider, respond. Outrider—", "style": "radio", "static": 0.85 }
    ],
    "hold": 10,
    "transition": "flash"
  }
]
```

**Scene fields**

| Field | Type | Meaning |
|-------|------|---------|
| `background` | string | Painting (any 16:9 size, cover-fitted). Omit for a black card: lines are then shown large and centred. |
| `camera` | `{from, to, seconds}` | `zoom` (1 = whole picture) and `x`/`y` offsets in 960x720 units, eased from `from` to `to`. |
| `sprites` | IntroSprite[] | Animated figures (below). Drawn pixel-crisp. |
| `ambient_lighting` | AmbientLighting | Same format as views: pulsing glows (veins, beams, lamps). |
| `effects` | IntroEffect[] | Procedural effects (below). |
| `lines` | IntroLine[] | Shown one after another at the bottom of the screen. |
| `sound` / `loop` | string | A one-shot sound when the scene starts; a sound looped while it lasts (a loop the next scene also uses carries on without a restart). When the scene ends its sounds fade out instead of bleeding into the next one. |
| `sounds` | IntroSound[] | More sounds on cues: `{ file, cue?, delay?, volume?, loop? }`. |
| `music` | string \| null | A file crossfades to that track (the same file keeps playing across scenes), `null` fades the music out, omitted keeps what is playing. |
| `music_loop` | boolean | `false` plays the track once: a scored cue that builds to an ending. Default true. |
| `music_volume` | number | 0..1, default 0.5. |
| `hold` | number | Minimum seconds on screen; the scene also lasts until its lines are done. |
| `tail` | number | Seconds to stay after the last line is done, before the transition. Default 1. |
| `fade_in` | number | Seconds the scene takes to fade in. Default 0.7 (1 after a flash); the first scene fades in slowly out of black (3.5 s). Give its first line a `pause` of about 3 s so the picture is established before anyone speaks. |
| `transition` | `fade` \| `cut` \| `flash` | How it hands over to the next scene. Default `fade` (through black). |

**IntroLine**: `text` (use `\n` for line breaks), `voice` (an audio clip; the line lasts as long as the clip, otherwise 0.06 s per character, at least 3 s), `style` (`narration` gold serif, the default; `radio`, a transmission in italic monospace marked RADIO whose voice gets a band-pass filter, crackle and, above 0.45, dropouts; `card`, large and centred), `static` (radio only, 0 clean to 1 barely there, default 0.3), `pause` (seconds of silence before the line, default 0.4).

**IntroSprite**: `file`, `frame_width`, `frame_height`, `columns`, `row` (default 0), `frames` (column order, e.g. `[0,0,0,1,0,0,2]` for an idle made of edits), `frame_rate`, `loop` (default true), `scale` (same meaning as object sprites), `at` (feet, `[x, y]`), `move` (`{to, scale?, seconds, delay?}`, eased), `bob` (`{amount, period}`: floating), `rotate` (fixed degrees, e.g. -90 to lay a figure down), `spin` (degrees per second, about the sprite's centre), `flip`, `cue` (when its clock starts: `"start"`, `"line:N"` when line N appears, 1-based, or `"end"` when the last line is done; `delay`, `until`, `move` and `spin` count from it), `until_cue` (fade it out once that cue is reached), `delay`/`until` (seconds after its cue), `fade` (in/out seconds, default 0.4), `opacity`, `filter` (a CSS filter such as `"sepia(0.8) brightness(0.8)"` to sit a figure inside coloured fluid).

**IntroEffect** (areas are `[x, y, width, height]`):

| `type` | Fields | Use |
|--------|--------|-----|
| `particles` | `motion` (`rise`, `fall`, `drift`, `twinkle`), `area`, `count`, `color`, `size`, `alpha`, `speed`, `delay` | Bubbles, motes in a beam, floating debris, twinkling stars |
| `shade` | `color`, `from`, `to`, `seconds`, `direction` (`down`, `up`, `none`), `area`, `delay` | Darken part of the picture over time (stars going out) |
| `stars_out` | `area`, `count`, `seconds`, `from` (`right`, `left`, `top`), `size`, `color`, `delay` | Stars that wink out one by one in a front crossing the area, each flaring briefly before it dies: something vast sliding between you and them. Drawn behind the sprites; pair it with a `shade`. |
| `sweep` | `area`, `color`, `period`, `alpha`, `delay` | A scanning line moving up and down |
| `sparks` | `at`, `color`, `every`, `delay`, `until` | Bursts of sparks from a point (a tool at work) |
| `shake` | `amount`, `delay`, `until` | Camera shake |
| `rope` | `from`, `to` or `to_sprite` (+ `offset` in sprite pixels), `sag`, `color`, `width` | A sagging tether or cable; with `to_sprite` it follows that sprite as it bobs |

Every effect also takes `cue`.

**Cue everything to the voices.** Lines last as long as their clips, so a pose change or an effect timed in fixed seconds drifts out of step as soon as a clip is re-recorded. Put it on a cue instead: The Harvest's pilot keeps working while Mission Control says all is well (`until_cue: "line:2"`), the stars die during that line (`cue: "line:2"`), and he looks up in alarm when it ends (`cue: "end"`).

**The mix.** Voices play at full volume; music and loops duck under them (music to 40%, loops to 70%) and recover slowly between lines; one-shot sounds play as authored. Master the files so voices are clearly the loudest: The Harvest's `scripts/master_intro_audio.py` gains every clip to a loudness target (voices -16 LUFS, events -20 to -26, beds -27 to -30). Nothing from the rooms (ambient audio, music) plays during the intro.

**Making one**: paint the establishing shot first, then make later shots as edits of it (the same recipe as rooms that belong together, ART_GUIDE → "Case Study: The Vent Maze"); paint the space where a figure goes empty and add the figure as a sprite; animate sprites as one base frame plus edits (ART_GUIDE → "Idle animations"). The validator checks every intro file and sprite field. The Harvest's intro (7 scenes) is the worked example; `scenarios/the-harvest/scripts/playthrough/intro.cjs` tests it in the browser.

### Credits

`metadata.credits` (string, optional) is a short credits line shown on the scenario's main-menu card, e.g. `"Voices and sound effects by ElevenLabs (elevenlabs.io)"`. Use it for any third-party service or asset whose terms require visible attribution.

## Cutscenes and a playable prologue

A cutscene is a cinematic in the intro's format (scenes with backgrounds, sprites, lights, effects, lines, voices, sounds and music) that plays in the middle of the game. Name it under `setting.cutscenes` and start it with the `play_cutscene` effect from any interaction, event or `delay_then`. It plays full screen (the rooms' ambience, music and clock wait), the player can click through lines or skip it, and when it ends its `then` effects apply.

```json
"cutscenes": {
  "abduction": [
    { "background": "intro/backgrounds/intro_shadow.webp", "sound": "intro/audio/v2/stars_out.mp3",
      "lines": [ { "text": "\u201cControl. The stars.\u201d", "voice": "intro/audio/v2/p5.mp3" },
                 { "text": "Outrider, long-range is showing something...", "voice": "intro/audio/v2/c3.mp3", "style": "radio", "static": 0.6 } ] }
  ]
}
...
{ "type": "play_cutscene", "cutscene": "abduction", "wake": true,
  "then": [ { "type": "set_view", "view": "act1_stasis_hold", "sound": null } ] }
```

A cutscene has no title card (that is only for the intro). Without `wake`, play returns to the game where `then` leaves it.

### A playable prologue

`setting.prologue: { "view": "..." }` makes the opening playable. The flow is:

1. The intro cinematic (`intro_scenes`). End it on the same picture as the prologue's first view, so the cut into play feels seamless.
2. The game starts in `prologue.view`, not `initial_view`, with a short fade up and no wake-up. The clock is stopped (patrols wait), and a **Skip intro** button in the title bar (label: `skip_label`) jumps straight to `initial_view` and the wake-up.
3. The prologue is ordinary views, objects and interactions. Use `on_enter` with a flag guard for the opening radio call, and voiced `message` effects with `style` for dialogue.
4. A `play_cutscene` with `wake: true` ends it. The cutscene plays, its `then` effects move the player into the game, and the wake-up staging (`setting.wake`: black, the eyes opening, `sounds.intro_voice`, standing up) follows.
5. The first phase's `on_enter` (its opening message) runs when the game proper begins: at the wake-up, not at load.

Skipping the intro cinematic (its skip button or Escape) skips the prologue too. `?skipIntro`, `?view` and `?dev` skip both.

**Teaching in the prologue.** Give tutorial tips `prologue: "only"` and a `when` naming the prologue's views, so they teach the verbs where they are needed (right-click on the spacewalk, Move to drift, Hand on the panel, Look inside). Repeat the basics as `prologue: "if_skipped"` tips for players who skip. Give the in-game tips a `when` that keeps them out of the prologue's views (`not_in_view`).

**The Harvest's opening** (about 80 seconds; `scenarios/the-harvest/scripts/build_intro_v2.py` writes it):
- The cold open: the title, then Earth and LUMEN-7 fade up with the pilot's breathing, and one line of his voice-over.
- The spacewalk (`intro_spacewalk`): the pilot drifts in his spacesuit (sprite set `eva`, with its own frame size, a `bob`, and a `smooth` walk with no footsteps). Relay Control calls (`style: "radio"`) and he answers (`style: "comms"`).
- The panel close-up (`intro_panel_closeup`): the boards are gone.
- The cutscene `abduction`: the stars go out, the harvest, then "Outrider, respond" fainter each time over the cataloguing, the pods and the dark.
- Then the wake-up in the Stasis Hold.

