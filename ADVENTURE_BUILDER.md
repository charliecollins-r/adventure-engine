# Adventure Builder Guide

> **Create point-and-click adventure games without writing any code.**
> Define your game in a single JSON file, drop in background art and audio, and it's playable.

This guide covers everything you need to build a scenario package for the Adventure Engine. You don't need to understand the engine's source code — the JSON schema is the product.

---

## Table of Contents

1. [Package Structure](#package-structure)
2. [Quick Start — Your First Scenario](#quick-start--your-first-scenario)
3. [The Four Verbs](#the-four-verbs)
4. [Coordinate System](#coordinate-system)
5. [Views](#views)
6. [Objects](#objects)
7. [Interactions](#interactions)
8. [Conditions Reference](#conditions-reference)
9. [Effects Reference](#effects-reference)
10. [Items & Inventory](#items--inventory)
11. [Item Combinations](#item-combinations)
12. [Navigation](#navigation)
13. [Visual Effects](#visual-effects)
14. [Audio](#audio)
15. [Phases](#phases)
16. [Win & Lose Conditions](#win--lose-conditions)
17. [Advanced Features](#advanced-features)
18. [Registration & Testing](#registration--testing)
19. [Design Patterns](#design-patterns)
20. [Art Direction](#art-direction)

---

## Package Structure

A scenario is a self-contained folder inside `scenarios/`. Everything about your game lives in one place:

```
scenarios/my-scenario/
├── scenario.json          # Game definition (required)
├── design.md              # Story/puzzle design doc (optional, but recommended)
├── backgrounds/           # Background images for each view
│   ├── main_room.webp     #   1920x1080 recommended, any resolution works
│   └── closet_closeup.webp
├── closeups/              # Detail images for show_closeup effect (optional)
│   └── safe_interior.webp #   Any resolution, shown in framed overlay
├── audio/                 # Ambient audio tracks (optional)
│   └── rain_loop.mp3      #   MP3/WAV/OGG supported, loops automatically
└── items/                 # Item icons for inventory panel (optional)
    └── rusty_key.png
```

The engine discovers your scenario by its folder name and reads `scenario.json` from it. No build step, no compilation. Edit JSON → refresh browser → see changes.

---

## Quick Start — Your First Scenario

Here's a complete 2-room scenario. A locked room with a key hidden in a desk drawer. Find the key, unlock the door, escape.

Create `scenarios/my-first-escape/scenario.json`:

```json
{
  "schema_version": "1.0",
  "metadata": {
    "id": "my-first-escape",
    "title": "My First Escape",
    "description": "You wake in a locked room. A desk sits in the corner. Find a way out.",
    "author": "your-name",
    "difficulty": "easy",
    "estimated_minutes": 2,
    "tags": ["tutorial", "escape"],
    "version": "1.0"
  },
  "setting": {
    "initial_view": "bedroom",
    "ambient_text": "A bare room. The door is locked from outside.",
    "room_style": {
      "background_color": "#1a1a2e",
      "wall_color": "#16213e",
      "floor_color": "#0f3460"
    }
  },
  "views": [
    {
      "id": "bedroom",
      "background_key": "bedroom",
      "background_file": "backgrounds/bedroom.webp",
      "objects": ["door", "desk", "window"]
    },
    {
      "id": "desk_closeup",
      "background_key": "desk_closeup",
      "background_file": "backgrounds/desk_closeup.webp",
      "objects": ["desk_drawer", "desk_lamp"],
      "back_label": "Step back from desk"
    }
  ],
  "flags": {
    "drawer_opened": "false"
  },
  "items": [
    {
      "id": "rusty_key",
      "name": "Rusty Key",
      "description": "An old iron key. It might fit a door.",
      "icon": "key",
      "examine": [
        {
          "verb": "look",
          "when": [],
          "then": [
            { "type": "message", "text": "Cold iron, slightly bent. Stamped on the bow: 'MASTER'." }
          ]
        }
      ]
    }
  ],
  "combinations": [],
  "objects": [
    {
      "id": "door",
      "name": "Wooden Door",
      "description": "A heavy wooden door. Locked from the outside.",
      "position": { "x": 100, "y": 200 },
      "size": { "width": 120, "height": 350 },
      "visual": { "color": "rgba(139, 90, 43, 0.3)", "label": "Door" },
      "initial_state": "locked",
      "initially_visible": true,
      "interactions": [
        {
          "verb": "look",
          "when": [{ "type": "object_state", "object": "door", "state": "locked" }],
          "then": [
            { "type": "message", "text": "A solid wooden door. The handle won't turn — locked from outside." }
          ]
        },
        {
          "verb": "look",
          "when": [{ "type": "object_state", "object": "door", "state": "unlocked" }],
          "then": [
            { "type": "message", "text": "The door is unlocked. Freedom awaits." }
          ]
        },
        {
          "verb": "hand",
          "when": [{ "type": "object_state", "object": "door", "state": "locked" }],
          "then": [
            { "type": "message", "text": "You rattle the handle. Locked tight." }
          ]
        },
        {
          "verb": "hand",
          "when": [{ "type": "object_state", "object": "door", "state": "unlocked" }],
          "then": [
            { "type": "game_over", "result": "win", "reason": "You pull the door open and step into the hallway. You're free." }
          ]
        },
        {
          "verb": "use_item",
          "item": "rusty_key",
          "when": [{ "type": "object_state", "object": "door", "state": "locked" }],
          "then": [
            { "type": "message", "text": "The key turns with a satisfying click. The door is unlocked." },
            { "type": "set_state", "object": "door", "state": "unlocked" },
            { "type": "remove_item", "item": "rusty_key" }
          ]
        }
      ]
    },
    {
      "id": "desk",
      "name": "Old Desk",
      "description": "A battered wooden desk against the wall.",
      "position": { "x": 600, "y": 400 },
      "size": { "width": 200, "height": 150 },
      "visual": { "color": "rgba(101, 67, 33, 0.3)", "label": "Desk" },
      "initial_state": "default",
      "initially_visible": true,
      "interactions": [
        {
          "verb": "look",
          "when": [],
          "then": [
            { "type": "message", "text": "A desk with a single drawer. There might be something inside." },
            { "type": "set_view", "view": "desk_closeup" }
          ]
        }
      ]
    },
    {
      "id": "window",
      "name": "Barred Window",
      "description": "A small window with iron bars.",
      "position": { "x": 400, "y": 150 },
      "size": { "width": 140, "height": 120 },
      "visual": { "color": "rgba(100, 140, 180, 0.2)", "label": "Window" },
      "initial_state": "barred",
      "initially_visible": true,
      "interactions": [
        {
          "verb": "look",
          "response": "Iron bars. No way through. You can see a garden outside — so close."
        },
        {
          "verb": "hand",
          "when": [],
          "then": [
            { "type": "message", "text": "You pull at the bars. They don't budge." }
          ]
        }
      ]
    },
    {
      "id": "desk_drawer",
      "name": "Desk Drawer",
      "description": "A wooden drawer.",
      "position": { "x": 400, "y": 450 },
      "size": { "width": 200, "height": 80 },
      "visual": { "color": "rgba(120, 80, 40, 0.3)", "label": "Drawer" },
      "initial_state": "closed",
      "initially_visible": true,
      "interactions": [
        {
          "verb": "look",
          "when": [{ "type": "object_state", "object": "desk_drawer", "state": "closed" }],
          "then": [
            { "type": "message", "text": "A drawer. Might be worth opening." }
          ]
        },
        {
          "verb": "look",
          "when": [{ "type": "object_state", "object": "desk_drawer", "state": "open" }],
          "then": [
            { "type": "message", "text": "The drawer is empty now." }
          ]
        },
        {
          "verb": "hand",
          "when": [
            { "type": "object_state", "object": "desk_drawer", "state": "closed" },
            { "type": "not_has_item", "item": "rusty_key" }
          ],
          "then": [
            { "type": "message", "text": "You slide the drawer open. Inside: an old iron key." },
            { "type": "set_state", "object": "desk_drawer", "state": "open" },
            { "type": "add_item", "item": "rusty_key" },
            { "type": "set_flag", "flag": "drawer_opened", "value": "true" }
          ]
        },
        {
          "verb": "hand",
          "when": [{ "type": "object_state", "object": "desk_drawer", "state": "open" }],
          "then": [
            { "type": "message", "text": "The drawer is already open. Nothing else inside." }
          ]
        }
      ]
    },
    {
      "id": "desk_lamp",
      "name": "Desk Lamp",
      "description": "A dusty brass lamp.",
      "position": { "x": 700, "y": 200 },
      "size": { "width": 80, "height": 120 },
      "visual": { "color": "rgba(180, 160, 60, 0.2)", "label": "Lamp" },
      "initial_state": "off",
      "initially_visible": true,
      "interactions": [
        {
          "verb": "look",
          "response": "A brass desk lamp, coated in dust. The bulb looks intact."
        },
        {
          "verb": "hand",
          "when": [{ "type": "object_state", "object": "desk_lamp", "state": "off" }],
          "then": [
            { "type": "message", "text": "Click. The lamp flickers on, casting warm light across the desk." },
            { "type": "set_state", "object": "desk_lamp", "state": "on" }
          ]
        },
        {
          "verb": "hand",
          "when": [{ "type": "object_state", "object": "desk_lamp", "state": "on" }],
          "then": [
            { "type": "message", "text": "Click. The lamp goes dark." },
            { "type": "set_state", "object": "desk_lamp", "state": "off" }
          ]
        }
      ]
    }
  ],
  "win_conditions": [
    {
      "id": "escaped",
      "description": "You escaped the room!",
      "conditions": [{ "type": "object_state", "object": "door", "state": "unlocked" }]
    }
  ]
}
```

### What just happened

- **`metadata`** — Who you are, what this game is. The title and description show on the scenario selection screen.
- **`setting`** — Which view the player starts in, atmospheric flavor text, fallback colors when no background image exists.
- **`views`** — Two screens: the bedroom and a desk close-up. Each lists which objects appear there.
- **`flags`** — Global state variables. Simple key-value strings. Track progress like "has the drawer been opened?"
- **`items`** — Inventory objects the player can carry. The rusty key has an examine interaction for when the player inspects it from their inventory.
- **`objects`** — Everything clickable in the world. Each has a position, size, visual appearance, state, and a list of interactions.
- **`win_conditions`** — What triggers the victory screen. Here: unlocking the door.

---

## The Four Verbs

Players interact with the world through four verbs, inspired by King's Quest V:

| Verb | Cursor | What It Does | Default Fail Message |
|------|--------|-------------|---------------------|
| **Look** | `?` | Examine visually. Always safe. No noise. | Shows the object's `description` field |
| **Move** | `+` | Navigate between rooms. Click nav hotspots. | "You can't go that way." |
| **Hand** | `👆` | Physical manipulation — push, pull, open, take, touch. | "You can't do anything useful with {name} right now." |
| **Talk** | `T` | Speak, listen, read aloud. | "Talking to {name} doesn't accomplish anything." |

### Using Inventory Items

There is no "Use" verb button. Instead:

1. Player clicks an item in their inventory panel (selects it)
2. Player clicks a world object
3. The engine automatically tries `use_item` with that item on that object
4. If no matching interaction exists, the player sees: "That doesn't seem to work."

In your JSON, define inventory-use interactions with `"verb": "use_item"` and `"item": "the_item_id"`.

### Verb Fallback

The engine tries `hand` first. If no interaction matches, it automatically retries with `take` — this ensures backwards compatibility with older scenario JSONs that used separate hand/take verbs.

### Every Click Gets Feedback

Even when an action does nothing, the player gets a King's Quest-style message. You don't need to write fail interactions — the engine provides generic feedback for every verb. But you *can* override the generic message by writing a specific interaction for that verb+state combination.

---

## Coordinate System

All object positions use a **960x720 coordinate space** with origin at top-left. **Position** is the **top-left corner** of the hotspot rectangle, not its center.

```
(0,0) ─────────────────────── (960,0)
  │                               │
  │     960 x 720 design space    │
  │                               │
  │    Position = top-left corner │
  │    of the hotspot box          │
  │                               │
(0,720) ────────────────────── (960,720)
```

- **Background images** can be any resolution (1376x768 and 1920x1080 are common). The engine renders them with `object-fit: cover` to fill the 960x540 pixel viewport.
- **The viewport** renders at 960x540 pixels. The engine maps the 960x720 coordinate space to this viewport using `SCALE_X = 1.0` (no horizontal change) and `SCALE_Y = 0.75` (vertical compression).
- **Object positions** are the **top-left corner** of the hotspot box in the 960x720 space.
- **Object sizes** define the clickable area dimensions in the same 960x720 space.

### How Positions Actually Render

The engine positions hotspots as absolutely-positioned `<div>` elements inside the 960x540 viewport:

```
Rendered left  = position.x × 1.0     (no horizontal scaling)
Rendered top   = position.y × 0.75    (vertical compression)
Rendered width = size.width × 1.0
Rendered height= size.height × 0.75
```

**Example**: An object at `position: {x: 480, y: 360}` with `size: {width: 100, height: 80}` renders as a div at `left: 480px, top: 270px, width: 100px, height: 60px` inside the 960x540 viewport.

### Converting Background Image Coordinates to JSON Positions

This is the most common task: you have a background image and need to place a hotspot over a specific visual element. Here's the step-by-step process:

#### Step 1: Measure the pixel coordinates in your image

Open your background image in any image editor and find the **bounding box** of the area you want to make clickable. Record:
- The **top-left pixel** `(img_x, img_y)` of the region
- The **width and height** in pixels `(img_w, img_h)`

#### Step 2: Convert image pixels to the 960x720 coordinate space

The background image is rendered with `object-fit: cover`, which scales the image to fill the 960x540 viewport (may crop edges). The conversion depends on your image resolution:

**For 1376x768 images** (current Harvest backgrounds):
```
json_x = img_x × (960 / 1376)  ≈  img_x × 0.698
json_y = img_y × (720 / 768)   ≈  img_y × 0.9375
json_w = img_w × (960 / 1376)  ≈  img_w × 0.698
json_h = img_h × (720 / 768)   ≈  img_h × 0.9375
```

**For 1920x1080 images** (recommended resolution):
```
json_x = img_x × (960 / 1920)  =  img_x × 0.5
json_y = img_y × (720 / 1080)  ≈  img_y × 0.667
json_w = img_w × (960 / 1920)  =  img_w × 0.5
json_h = img_h × (720 / 1080)  ≈  img_h × 0.667
```

**General formula** for any image resolution `(IMG_W × IMG_H)`:
```
json_x = img_x × (960 / IMG_W)
json_y = img_y × (720 / IMG_H)
json_w = img_w × (960 / IMG_W)
json_h = img_h × (720 / IMG_H)
```

> **Important**: `object-fit: cover` may crop the image if its aspect ratio doesn't match 16:9. For 1376x768 (≈1.79:1) the match is nearly exact. For other ratios, the engine crops from edges — your measurements should account for any visible cropping.

#### Step 3: Round and validate

- Round all values to the nearest integer
- Verify `json_x + json_w ≤ 960` and `json_y + json_h ≤ 720`
- Be generous with size — a hotspot that's 10-20% larger than the visual element is better than one that's pixel-perfect but hard to click

#### Worked Example

Placing a hotspot over a broken pod in a 1376x768 background:

1. In the image editor, the broken pod occupies roughly pixels (265, 500) to (315, 540)
   - `img_x=265, img_y=500, img_w=50, img_h=40`

2. Convert using 1376x768 factors:
   - `json_x = 265 × 0.698 ≈ 185`
   - `json_y = 500 × 0.9375 ≈ 469`
   - `json_w = 50 × 0.698 ≈ 35`
   - `json_h = 40 × 0.9375 ≈ 38`

3. Final JSON:
   ```json
   "position": { "x": 185, "y": 469 },
   "size": { "width": 35, "height": 38 }
   ```

### Using Debug Mode to Verify Positions

The game has a **Debug Mode** button in the title bar that shows all hotspot boundaries:

- **Gold outlines**: Regular interactive objects
- **Red outlines**: Navigation hotspots (objects starting with `nav_`)
- **Labels**: Object names appear on hover in debug mode

**Workflow**: Set approximate positions → launch `npm run dev` → load the scenario → toggle Debug Mode → compare outlines to background art → adjust JSON values → refresh.

### Positioning Tips and Common Mistakes

**Do:**
- Start with generous hotspot sizes (30-60 range), then shrink if overlapping
- Use debug mode early and often — don't guess positions blind
- For nav hotspots (doorways, passages), cover the entire visible opening plus a little margin
- For small objects (keyholes, switches), make the hotspot at least 25×25 so it's easy to click
- Keep notes on your image dimensions — the conversion factor changes with resolution

**Don't:**
- Don't assume positions are center-point — they are **top-left corner** of the hotspot box
- Don't forget the Y compression — an object at image Y=400 is NOT at JSON Y=400
- Don't place hotspots that extend beyond 960×720 — they'll render outside the viewport
- Don't mix up image pixel coordinates with JSON coordinates — always convert
- Don't make hotspots too small (under 20×15) — they become frustrating to click

### For AI Agents: Positioning Checklist

When generating or modifying object positions:

1. **Know the image resolution** — check the actual background file dimensions, don't assume 1920x1080
2. **Apply the correct conversion factor** — `960/IMG_W` for X, `720/IMG_H` for Y
3. **Position is top-left, not center** — the rendered div starts at `(x, y)`, not centered on it
4. **Validate bounds** — every `position.x + size.width ≤ 960` and `position.y + size.height ≤ 720`
5. **Check for overlap** — objects in the same view shouldn't have hotspots that significantly overlap
6. **Nav objects need generous sizing** — doorways should be easy click targets (80-200px wide typically)
7. **Test with debug mode** — if you can run the dev server, verify visually before finalizing

---

## Views

Views are the screens/locations in your game. A room, a close-up of a desk, a zoomed-in safe dial.

```json
{
  "id": "main_room",
  "background_key": "main_room",
  "background_file": "backgrounds/main_room.webp",
  "objects": ["door", "desk", "window", "painting"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier. Referenced by `set_view` effects. |
| `background_key` | string | Yes | Key for the background asset. |
| `background_file` | string | No | Relative path to background image. Without this, objects render as colored rectangles (prototyping mode). |
| `objects` | string[] | Yes | IDs of objects visible in this view. An object can appear in multiple views. |
| `back_label` | string | No | If set, a "back" button appears with this label. Used for close-up/detail views. |

### Close-up Views

Use close-up views to zoom into specific areas. The player navigates to a close-up via a `set_view` effect, and the `back_label` button returns them:

```json
{
  "id": "safe_closeup",
  "background_key": "safe_closeup",
  "background_file": "backgrounds/safe_closeup.webp",
  "objects": ["safe_dial", "safe_handle"],
  "back_label": "Step back from safe"
}
```

In the parent room, an object's `look` or `hand` interaction navigates to the close-up:

```json
{
  "verb": "look",
  "when": [],
  "then": [
    { "type": "message", "text": "You lean in for a closer look at the wall safe." },
    { "type": "set_view", "view": "safe_closeup" }
  ]
}
```

---

## Objects

Objects are everything the player can see and interact with — furniture, doors, switches, items on tables, environmental features.

```json
{
  "id": "painting",
  "name": "Oil Painting",
  "description": "An unsettling portrait in a heavy frame.",
  "position": { "x": 300, "y": 250 },
  "size": { "width": 120, "height": 100 },
  "visual": {
    "color": "rgba(60, 48, 32, 0.3)",
    "label": "Painting",
    "animation": "glimmer"
  },
  "initial_state": "hanging",
  "initially_visible": true,
  "hiding_spot": false,
  "interactions": [ ... ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier. Referenced in view `objects` arrays and by conditions/effects. |
| `name` | string | Yes | Display name shown on hover and in messages. |
| `description` | string | Yes | Fallback text when looking without a specific look interaction. |
| `position` | `{x, y}` | Yes | Center point in 960x720 coordinate space. |
| `size` | `{width, height}` | Yes | Clickable region dimensions. |
| `visual.color` | string | Yes | Hotspot overlay color. Use `rgba()` with low alpha (0.2-0.35) for subtle tinting. |
| `visual.label` | string | Yes | Short label shown below the hotspot on hover. |
| `visual.animation` | string | No | `"glimmer"` for a subtle shimmer, `"pulse"` for gentle opacity pulsing. |
| `initial_state` | string | Yes | Starting state (e.g., `"locked"`, `"closed"`, `"default"`). |
| `initially_visible` | boolean | Yes | Whether visible at game start. Hidden objects can be revealed with `show_object` effects. |
| `hiding_spot` | boolean | No | If `true`, the player can hide here (used with killer AI). Default `false`. |
| `interactions` | array | Yes | What happens when the player interacts. See [Interactions](#interactions). |

### Object States

Objects track state as a simple string. States are implicit — they exist by being referenced in conditions and effects. Common patterns:

- Door: `"locked"` → `"unlocked"` → `"open"`
- Container: `"closed"` → `"open"` → `"empty"`
- Switch: `"off"` → `"on"`
- Destructible: `"intact"` → `"broken"`

The engine doesn't interpret state names — it just stores and compares strings. Use whatever names make sense for your scenario.

---

## Interactions

Interactions define what happens when a player uses a verb on an object. They follow a simple pattern: **verb + conditions → effects**.

### Full Form

```json
{
  "verb": "hand",
  "when": [
    { "type": "object_state", "object": "door", "state": "locked" },
    { "type": "has_item", "item": "crowbar" }
  ],
  "then": [
    { "type": "message", "text": "You jam the crowbar into the frame and heave. The lock snaps." },
    { "type": "set_state", "object": "door", "state": "open" },
    { "type": "add_noise", "amount": 35 }
  ],
  "noise": 35
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `verb` | string | Yes | `"look"`, `"move"`, `"hand"`, `"talk"`, or `"use_item"` |
| `item` | string | Only for `use_item` | Which inventory item is being used |
| `when` | condition[] | No | All conditions must be true. Empty array or omitted = always matches |
| `then` | effect[] | Yes | Effects applied when this interaction fires |
| `response` | string | No | Shorthand: just show this text (alternative to `then` with a message effect) |
| `noise` | number | No | Noise generated (0-100). Default 0 |

### Response Shorthand

For simple look descriptions, use `response` instead of a full `then` array:

```json
{
  "verb": "look",
  "response": "A heavy wooden door. The handle is cold to the touch."
}
```

This is equivalent to:

```json
{
  "verb": "look",
  "when": [],
  "then": [
    { "type": "message", "text": "A heavy wooden door. The handle is cold to the touch." }
  ]
}
```

### Interaction Resolution Order

When the player uses a verb on an object, the engine evaluates interactions **in order** and takes the **first match**:

1. Filter to interactions matching the verb (and item, for `use_item`)
2. For each matching interaction, evaluate its `when` conditions
3. The **first** interaction whose conditions are ALL satisfied fires
4. If nothing matches, the engine shows a default fail message

**Put specific interactions before generic ones.** The engine takes the first match, so:

```json
[
  { "verb": "hand", "when": [{"type": "has_item", "item": "key"}], "then": [...] },
  { "verb": "hand", "when": [], "then": [{"type": "message", "text": "It won't budge."}] }
]
```

The specific "has key" interaction fires first when the player has the key. Otherwise, the generic "won't budge" catches everything else.

### Inventory Use Interactions

When a player selects an inventory item and clicks an object, the engine looks for a matching `use_item` interaction:

```json
{
  "verb": "use_item",
  "item": "wire_cutters",
  "when": [{ "type": "object_state", "object": "window", "state": "barred" }],
  "then": [
    { "type": "message", "text": "Snip. Snip. The wire mesh falls away." },
    { "type": "set_state", "object": "window", "state": "open" },
    { "type": "remove_item", "item": "wire_cutters" }
  ],
  "noise": 25
}
```

---

## Conditions Reference

Conditions gate when interactions, events, and phases fire. A `when` array is AND — all conditions must be true.

### Atomic Conditions

| Type | Fields | True When | Example |
|------|--------|-----------|---------|
| `flag_is` | `flag`, `value` | Flag equals value | `{"type": "flag_is", "flag": "door_unlocked", "value": "true"}` |
| `flag_not` | `flag`, `value` | Flag does NOT equal value | `{"type": "flag_not", "flag": "alarm_triggered", "value": "true"}` |
| `object_state` | `object`, `state` | Object is in named state | `{"type": "object_state", "object": "door", "state": "locked"}` |
| `has_item` | `item` | Player has item in inventory | `{"type": "has_item", "item": "rusty_key"}` |
| `not_has_item` | `item` | Player does NOT have item | `{"type": "not_has_item", "item": "rusty_key"}` |
| `view_is` | `view` | Player is on this view | `{"type": "view_is", "view": "main_room"}` |
| `not_in_view` | `view` | Player is NOT on this view | `{"type": "not_in_view", "view": "closet"}` |
| `phase_is` | `phase` | Current game phase matches | `{"type": "phase_is", "phase": "hunted"}` |
| `noise_above` | `threshold` | Noise level > threshold | `{"type": "noise_above", "threshold": 50}` |
| `noise_below` | `threshold` | Noise level < threshold | `{"type": "noise_below", "threshold": 20}` |
| `item_count` | `count` | Player has >= count items | `{"type": "item_count", "count": 3}` |
| `is_hiding` | — | Player is hiding | `{"type": "is_hiding"}` |
| `not_hiding` | — | Player is NOT hiding | `{"type": "not_hiding"}` |
| `killer_is` | `state` | Killer AI is in named state | `{"type": "killer_is", "state": "searching"}` |

### Composite Conditions

For **OR** logic, use `any_of`:

```json
{
  "type": "any_of",
  "conditions": [
    { "type": "object_state", "object": "window", "state": "cracked" },
    { "type": "object_state", "object": "window", "state": "broken" }
  ]
}
```

For explicit **AND** (useful inside `any_of`):

```json
{
  "type": "all_of",
  "conditions": [
    { "type": "has_item", "item": "key" },
    { "type": "object_state", "object": "door", "state": "locked" }
  ]
}
```

Nesting is supported: `any_of` can contain `all_of` groups and vice versa. Keep nesting to 2 levels for readability.

---

## Effects Reference

Effects change the game world. They execute in order within a `then` array.

### Core Effects

| Type | Fields | What It Does |
|------|--------|-------------|
| `message` | `text` | Show text to the player |
| `random_message` | `messages` (string[]) | Show one random message from the array |
| `set_flag` | `flag`, `value` | Set a global flag |
| `set_state` | `object`, `state` | Change an object's state |
| `add_item` | `item` | Add item to inventory |
| `remove_item` | `item` | Remove item from inventory |
| `transform_item` | `item`, `into` | Replace one inventory item with another |
| `set_view` | `view` | Navigate to a different view |
| `show_object` | `object` | Make a hidden object visible |
| `hide_object` | `object` | Make an object invisible |
| `add_noise` | `amount` | Increase noise level (clamped 0-100) |
| `set_noise` | `amount` | Set noise to exact value |
| `game_over` | `result` (`"win"`/`"lose"`), `reason` | End the game |
| `advance_phase` | `phase` | Jump to a named game phase |
| `start_hiding` | — | Player enters hiding |
| `stop_hiding` | — | Player leaves hiding |

### Visual & Animation Effects

| Type | Fields | What It Does |
|------|--------|-------------|
| `set_animation` | `object`, `value` | Change or clear an object's `visual.animation`. Empty string `""` stops glimmer/pulse effects. Use to suppress attention-drawing animations after an object has been fully interacted with. |
| `show_closeup` | `image` | Show a framed close-up image in a dismissable overlay. Path relative to scenario folder (e.g. `"closeups/specimen_jars.webp"`). Player clicks anywhere or presses Escape to dismiss. |

### Advanced Effects

| Type | Fields | What It Does |
|------|--------|-------------|
| `delay_then` | `seconds`, `effects` | Wait N seconds, then apply nested effects |
| `conditional_effect` | `when`, `then`, `else` | If conditions met, do `then`; otherwise do `else` |
| `trigger_event` | `event` | Fire a named event (planned) |
| `visual_cue` | `cue` | Visual effect: `"shake"`, `"flash"`, `"flicker"` (planned) |
| `play_sound` | `sound` | Play a sound effect (planned) |

### Examples

**Delayed effect** (footsteps after 5 seconds):
```json
{
  "type": "delay_then",
  "seconds": 5,
  "effects": [
    { "type": "message", "text": "You hear footsteps on the stairs..." }
  ]
}
```

**Conditional branching** within a single interaction:
```json
{
  "type": "conditional_effect",
  "when": [{ "type": "flag_is", "flag": "guard_distracted", "value": "true" }],
  "then": [
    { "type": "message", "text": "The guard isn't looking. You slip through." }
  ],
  "else": [
    { "type": "message", "text": "You try to move but the guard turns — you freeze." },
    { "type": "add_noise", "amount": 10 }
  ]
}
```

**Random variety** for repeated looks:
```json
{
  "type": "random_message",
  "messages": [
    "Still locked.",
    "You've already tried that.",
    "The door isn't going anywhere."
  ]
}
```

---

## Items & Inventory

Items are objects the player carries. They appear in the inventory panel at the bottom of the screen.

```json
{
  "id": "pen_knife",
  "name": "Pen Knife",
  "description": "A small folding knife, well-worn.",
  "icon": "knife",
  "examine": [
    {
      "verb": "look",
      "when": [],
      "then": [
        { "type": "message", "text": "Bone handle, single blade. 'P.D.' scratched into it." }
      ]
    },
    {
      "verb": "hand",
      "when": [],
      "then": [
        { "type": "message", "text": "You fold it open and closed. Good steel." }
      ]
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier. Referenced in conditions, effects, and interactions. |
| `name` | string | Yes | Display name in the inventory panel. |
| `description` | string | Yes | Shown on hover. |
| `icon` | string | No | Icon key. Falls back to first 3 characters of name. |
| `examine` | interaction[] | No | Interactions when examining this item from inventory. Same format as object interactions. |

### Dual-Purpose Items

Items can carry hidden information discovered through examination. This is a classic adventure game technique:

```json
{
  "verb": "look",
  "when": [{ "type": "flag_not", "flag": "key_examined", "value": "true" }],
  "then": [
    { "type": "message", "text": "Stamped on the bow: '302'. A room number?" },
    { "type": "set_flag", "flag": "key_examined", "value": "true" }
  ]
}
```

The player picks up a key to unlock a drawer. Later, examining it reveals a room number that solves a different puzzle.

---

## Item Combinations

Define how inventory items can be crafted together:

```json
{
  "items": ["torn_note_a", "torn_note_b"],
  "result": "complete_note",
  "consumes": true,
  "message": "You hold the halves together. A combination: 7-4-1-9.",
  "noise": 0,
  "conditions": []
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | string[2] | Yes | Exactly two item IDs. Order doesn't matter. |
| `result` | string | Yes | ID of the produced item (must exist in `items[]`). |
| `consumes` | boolean | Yes | If true, both source items are removed. |
| `message` | string | Yes | Text shown on success. |
| `noise` | number | No | Noise generated. Default 0. |
| `conditions` | condition[] | No | Extra conditions required (e.g., must be at a workbench). |

To combine items, the player clicks one item in inventory, then clicks the other. Order doesn't matter — A+B equals B+A.

---

## Navigation

Navigation between rooms uses **nav objects** — invisible hotspots placed over doorways, passages, and exits in your background art.

### Creating Nav Objects

By convention, nav object IDs start with `nav_`. They use the `move` verb to trigger `set_view` effects:

```json
{
  "id": "nav_bedroom_to_hallway",
  "name": "Doorway",
  "description": "A doorway leading to the hallway.",
  "position": { "x": 100, "y": 300 },
  "size": { "width": 120, "height": 250 },
  "visual": { "color": "rgba(70, 130, 180, 0.25)", "label": "Hallway" },
  "initial_state": "default",
  "initially_visible": true,
  "interactions": [
    {
      "verb": "look",
      "response": "A dark hallway stretches beyond the door."
    },
    {
      "verb": "move",
      "when": [],
      "then": [
        { "type": "set_view", "view": "hallway" },
        { "type": "message", "text": "You step into the hallway." }
      ]
    }
  ]
}
```

### Nav Object Styling

Nav objects get a **blue hover border** (vs. gold for regular objects) and render at a higher z-index so they're always clickable, even when overlapping with regular objects.

### Bidirectional Navigation

Every room-to-room connection needs nav objects **in both directions**:

```
Room A → Room B:  nav object in Room A's view, set_view to Room B
Room B → Room A:  nav object in Room B's view, set_view to Room A
```

Forgetting the return nav creates a dead end with no way back.

### Hub-and-Spoke Layouts

Design your navigation around hubs (rooms with multiple exits) and spokes (dead ends with one exit back). This gives the player a sense of exploration without getting lost:

```
                    [Hub: Corridor]
                   /       |       \
           [Lab]    [Storage]    [Office]
         (dead end)  (dead end)    |
                              [Archives]
                              (dead end)
```

### Locked Navigation

Gate nav with conditions to create locked doors:

```json
{
  "verb": "move",
  "when": [{ "type": "flag_is", "flag": "has_keycard", "value": "true" }],
  "then": [
    { "type": "set_view", "view": "restricted_area" },
    { "type": "message", "text": "Your keycard beeps. The door slides open." }
  ]
}
```

Add a second interaction for the locked case:

```json
{
  "verb": "move",
  "when": [{ "type": "flag_not", "flag": "has_keycard", "value": "true" }],
  "then": [
    { "type": "message", "text": "The door won't open. You need some kind of access card." }
  ]
}
```

---

## Visual Effects

### Hotspot Colors

Use `rgba()` with low alpha for subtle tinting over background art:

```json
"visual": {
  "color": "rgba(139, 90, 43, 0.3)",
  "label": "Chest"
}
```

When no background image is loaded (prototyping mode), the color renders as a solid rectangle. With a background, it renders as a semi-transparent overlay on hover.

### Hotspot Animations

Add subtle visual cues to draw the player's attention to important objects:

| Animation | Effect | Best For |
|-----------|--------|----------|
| `"glimmer"` | Slow inset box-shadow shimmer every 6 seconds | Items that glint, reflections, glass, metal |
| `"pulse"` | Gentle opacity pulse every 3 seconds | Screens, displays, lights, glowing objects |

```json
"visual": {
  "color": "rgba(200, 220, 255, 0.2)",
  "label": "Glass Shard",
  "animation": "glimmer"
}
```

Animations pause when the player hovers over the object so they don't interfere with the hover highlight.

### Room Animations

Add a subtle ambient animation overlay to an entire view to give static backgrounds life:

| Animation | Effect | Best For |
|-----------|--------|----------|
| `"flicker"` | Random light flicker (green-tinted) | Rooms with overhead lights, machinery, labs |
| `"breathe"` | Slow pulsing radial glow (blue-tinted) | Organic rooms, crystal chambers, viewports |
| `"scan"` | Horizontal scan line moving down the screen | Monitor rooms, surveillance, tech spaces |

Add `room_animation` to any view definition:

```json
{
  "id": "security_hub",
  "background_file": "backgrounds/security_hub.webp",
  "objects": ["console", "monitors"],
  "room_animation": "scan"
}
```

The overlay is transparent and non-interactive — it sits between the background and hotspots.

---

## Audio

Add ambient audio to set the mood. Tracks loop automatically at 35% volume with a player-accessible mute button.

### Single Track

```json
"setting": {
  "initial_view": "main",
  "ambient_text": "Rain patters against the window.",
  "ambient_audio": "audio/rain_loop.mp3"
}
```

### Layered Tracks

Use an array for multiple simultaneous tracks that create a rich soundscape:

```json
"ambient_audio": [
  "audio/ship_hum.mp3",
  "audio/lab_ambience.mp3"
]
```

All tracks play simultaneously, all loop, all respect the mute toggle.

### Supported Formats

MP3, WAV, and OGG are supported. Place audio files in an `audio/` subfolder inside your scenario directory.

---

## Phases

Phases are story chapters that change the game's tone, ambient text, and (optionally) killer AI behavior.

```json
"phases": [
  {
    "id": "exploration",
    "name": "Exploration",
    "starts_when": [],
    "on_enter": [
      { "type": "message", "text": "You find yourself in a dim corridor. Explore carefully." }
    ],
    "ambient_text": "Distant machinery hums."
  },
  {
    "id": "hunted",
    "name": "Hunted",
    "starts_when": [{ "type": "flag_is", "flag": "alarm_triggered", "value": "true" }],
    "on_enter": [
      { "type": "message", "text": "An alarm blares! Something is coming." }
    ],
    "ambient_text": "Alarms wail. Heavy footsteps approach."
  }
]
```

The first phase with an empty `starts_when` is the initial phase. Phase transitions are checked after every interaction.

Use the `advance_phase` effect to jump to a phase explicitly, or let the engine auto-transition when `starts_when` conditions are met.

---

## Win & Lose Conditions

End the game when conditions are met:

```json
"win_conditions": [
  {
    "id": "escaped",
    "description": "You escaped through the window!",
    "conditions": [
      { "type": "object_state", "object": "window", "state": "open" },
      { "type": "flag_is", "flag": "rope_tied", "value": "true" }
    ]
  },
  {
    "id": "negotiated",
    "description": "You talked your way out. A rare victory.",
    "conditions": [
      { "type": "flag_is", "flag": "peace_negotiated", "value": "true" }
    ]
  }
],
"lose_conditions": [
  {
    "id": "caught",
    "description": "The killer found you. Game over.",
    "conditions": [
      { "type": "flag_is", "flag": "player_caught", "value": "true" }
    ]
  },
  {
    "id": "noise_overload",
    "description": "Too much noise. They heard everything.",
    "conditions": [
      { "type": "noise_above", "threshold": 95 }
    ]
  }
]
```

Multiple win/lose conditions give players different endings. The engine checks these after every interaction. You can also trigger game over directly with the `game_over` effect inside any interaction.

---

## Advanced Features

### Puzzle Widgets *(Planned)*

Pre-built UI overlays for complex puzzles — combination locks, keypads, toggle panels, dials, sequence puzzles. Define them in `puzzle_widgets[]` with a type and configuration. See [SCENARIO_SCHEMA.md](docs/SCENARIO_SCHEMA.md) for the full widget type reference.

### Killer AI *(Planned)*

An AI antagonist that patrols, responds to noise, searches for the player, and has configurable personality dialogue. Define the killer in the `killer` object with base behavior (check intervals, noise thresholds), search behavior (thoroughness, evidence awareness), and personality (approach/search/catch dialogue). See [SCENARIO_SCHEMA.md](docs/SCENARIO_SCHEMA.md) for full configuration.

### Events *(Planned)*

Named events triggered by conditions or timers. Use for narrative beats — a phone ringing after 90 seconds, lights flickering when the player enters a phase, the killer discovering an empty chair.

### Hints *(Planned)*

Progressive help system. Hints appear after a configurable delay, gated by conditions so they only show for unsolved puzzles.

### Hiding Spots

Mark objects as hiding spots for the killer AI system:

```json
{
  "id": "wardrobe",
  "hiding_spot": true,
  "interactions": [
    {
      "verb": "hand",
      "when": [{ "type": "not_hiding" }],
      "then": [
        { "type": "message", "text": "You climb inside and pull the door shut." },
        { "type": "start_hiding" }
      ]
    },
    {
      "verb": "hand",
      "when": [{ "type": "is_hiding" }],
      "then": [
        { "type": "message", "text": "You carefully push the door open and step out." },
        { "type": "stop_hiding" }
      ]
    }
  ]
}
```

### Noise System

Noise is a global value (0-100) that tracks how much sound the player makes. Use it as a resource/risk mechanic:

- `add_noise` effect increases it
- `set_noise` effect sets it to an exact value
- `noise_above` / `noise_below` conditions gate interactions
- The killer AI (when implemented) reacts to noise thresholds
- Noise naturally decays over time

---

## Registration & Testing

### Register Your Scenario

Add your scenario's folder name to the `SCENARIOS` array in `client/src/components/ScenarioLoader.tsx`:

```typescript
const SCENARIOS = [
  'the-harvest',
  'the-lighthouse-keeper',
  // ... existing scenarios
  'my-first-escape',  // ← Add yours here
];
```

### Run and Test

```bash
cd client
npm install      # First time only
npm run dev      # Start dev server at http://localhost:5173
```

Select your scenario from the list and play through. The dev server hot-reloads — edit your JSON, save, and the browser updates.

### Type-Check

```bash
cd client
npx tsc -b
```

This checks the engine code, not your JSON. JSON validation tooling is planned.

### Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Scenario doesn't appear in list | Not registered in ScenarioLoader.tsx | Add folder name to SCENARIOS array |
| "View not found" error | A `set_view` effect references a view ID that doesn't exist | Check spelling of view IDs |
| Object not clickable | Object ID not in the view's `objects` array | Add the object ID to the correct view |
| Item use does nothing | No `use_item` interaction matches | Add an interaction with `"verb": "use_item"` and the correct `"item"` ID |
| Background not loading | Wrong path in `background_file` | Path is relative to scenario folder: `"backgrounds/room.webp"` |
| No way back from close-up | Missing `back_label` on view or missing nav object | Add `back_label` to the close-up view |

---

## Design Patterns

The schema supports **30 proven design patterns** drawn from classic adventures, horror, immersive sims, puzzle games, stealth, escape rooms, and narrative games. Here are the most useful:

### Essential Patterns

| Pattern | Description | Example |
|---------|-------------|---------|
| **Gateway Puzzle** | First puzzle has zero prerequisites. Build confidence. | Look at desk → find key. No conditions. |
| **Dependency Chain** | A → B → C → D. Each step unlocks the next. | Get nail → pry board → find box → get cutters → cut mesh → escape |
| **Fork** | Two independent branches converge. Prevents bottlenecks. | Branch A gives note half, Branch B gives other half → combine → code |
| **Lock and Key** | Item/knowledge required to pass a gate. | Key unlocks door. Code opens safe. Keycard opens elevator. |
| **Knowledge Gate** | Nothing physical blocks progress — only knowing the answer. | Read date on calendar → enter it into keypad |
| **Dual-Purpose Item** | Item solves one puzzle AND carries a clue for another. | Key opens drawer. Examining key reveals room number. |
| **Noise Tradeoff** | Louder action = faster progress but higher risk. | Smash window (fast, loud) vs. pick lock (slow, quiet) |
| **Multi-Path Solution** | Same puzzle, multiple solutions with different costs. | Door: pick lock (quiet) / kick down (loud) / find key (slow) |

### Advanced Patterns

| Pattern | Description |
|---------|-------------|
| **Nested Secret** | Object unfolds through layers of examination |
| **Progressive Reveal** | Each puzzle reveals more of the environment |
| **False Summit** | Player thinks they can escape, then one more obstacle |
| **Bait and Punish** | Obvious action is a trap — punishment teaches caution |
| **Red Herring** | Fake puzzle that wastes time/noise |
| **Distraction Window** | Create a timed opportunity to act while enemy is occupied |
| **Trap Setting** | Player sets traps in advance for the killer |
| **Moral Fork** | Choice between two mutually exclusive outcomes |
| **Accomplice** | NPC that helps if you earn their trust |
| **Camouflage** | Hide evidence of your actions |

For complete documentation of all 30 patterns with JSON examples, see [`docs/SCENARIO_SCHEMA.md`](docs/SCENARIO_SCHEMA.md).

---

## Art Direction

The Adventure Engine's visual style follows the **1990s Sierra On-Line King's Quest V / King's Quest VI** aesthetic.

### Style Guidelines

- **2D gouache illustration** with visible brushstrokes
- Soft color gradients, NOT photorealistic, NOT 3D rendered
- **16:9 aspect ratio, 1920x1080** resolution (the engine scales to fit)
- **Low camera angle** — the player character is a small creature at knee-height, looking UP
- **Saturated colors** even in dark scenes — shadows have visible blue/purple
- Consistent color palette within each scenario

### Gemini Prompt Formula

For generating backgrounds with Google Gemini (Imagen 3), every prompt should follow this pattern:

**Opening:**
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line
King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients,
NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.
```

**Middle:**
*(Your specific scene description — be extremely detailed about what's in the frame, what's visible, what doors/passages exist)*

**Closing:**
```
Low camera angle looking UP from knee-height — [what that means for this scene].
Saturated colors despite the dark mood — [specific palette]. No text, no UI
elements, no characters.
```

### Background Tips

- Be **extremely specific** about doors, passages, and exits in your prompts — the player needs to see where they can go
- Describe **lighting direction** and **color temperature** for consistency
- Name the **color palette** explicitly (e.g., "amber ceiling lights, teal organic walls, green floor glow")
- Include "No text, no UI elements, no characters" to keep backgrounds clean for hotspot overlays

---

## Full Schema Reference

For the complete specification — all condition types, effect types, puzzle widget configurations, killer AI parameters, event triggers, hints, solution paths, validation rules, and all 30 design patterns with JSON examples — see:

**[`docs/SCENARIO_SCHEMA.md`](docs/SCENARIO_SCHEMA.md)** — 1700+ lines of documentation.

---

*Adventure Engine — where every game is just a JSON file away.*
