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
8. [Combinations](#combinations)
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
  thumbnail.png          # 320x240 preview for scenario browser
```

Background images can be any resolution (1920x1080 recommended for HD art). The engine scales them to fill the view canvas. **Object positions use a 960x720 coordinate space** (origin at top-left). The engine maps this coordinate space to the rendered viewport. Closeup views use the same coordinate space. Thumbnail is 320x240 for the scenario selection screen.

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
  "solution_paths": [ ... ]
}
```

**Required**: `schema_version`, `metadata`, `setting`, `objects`, `items`, `flags`.

**Optional**: `views` (defaults to one view containing all objects), `combinations`, `puzzle_widgets`, `phases`, `events`, `killer`, `win_conditions`, `lose_conditions`, `hints`, `solution_paths`.

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
| `initial_view` | string | no | Which view to start on. Defaults to `"main"`. |
| `ambient_text` | string | yes | Atmospheric text shown at game start. |
| `room_style` | object | no | Fallback colors when no background image exists. |

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
| `background_key` | string | yes | Key for the background image asset. |
| `background_file` | string | yes | Relative path to the background image file. |
| `objects` | string[] | yes | IDs of objects visible in this view. |
| `back_label` | string | no | Label for the "go back" action. Only on non-main views. |

If `views` is omitted, a default main view is created containing all objects, using `room_style` for rendering.

When the player transitions to a closeup view (via a `set_view` effect), the canvas switches to that view's background and shows only that view's objects. A back button returns to the previous view.

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
| `icon` | string | no | Icon key for rendering. Falls back to first 3 chars of name. |
| `examine` | interaction[] | no | Interactions when examining this item in inventory. Same format as object interactions. |

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
| `position` | `{x, y}` | yes | Top-left position in the 960x720 coordinate space. |
| `size` | `{width, height}` | yes | Clickable region dimensions. |
| `visual` | object | no | Fallback rendering when no background image. |
| `visual.color` | string | no | Fill color (hex). |
| `visual.stroke_color` | string | no | Border color (hex). |
| `visual.label` | string | no | Text label below object. |
| `visual.shape` | `"rect"` `"circle"` `"ellipse"` | no | Shape. Default `"rect"`. |
| `initial_state` | string | yes | Starting state. |
| `initially_visible` | boolean | no | Whether visible at game start. Default `true`. |
| `hiding_spot` | boolean | no | Whether the player can hide here. Default `false`. |
| `interactions` | interaction[] | yes | What happens when the player interacts. |

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
| `verb` | string | yes | One of: `"look"`, `"hand"`, `"take"`, `"talk"`, `"use_item"` |
| `item` | string | only for `use_item` | The inventory item ID being used. |
| `when` | condition[] | no | Conditions that must ALL be true. Empty = always matches. |
| `then` | effect[] | yes | Effects to apply when this interaction fires. |
| `noise` | number | no | Noise generated by this interaction. Default 0. |
| `fail_message` | string | no | Override message when conditions partially match but don't fully qualify. |

### Verb Descriptions

**`look`** — Examine visually. The player's eyes. Safe, quiet, informational.
- "You see a heavy wooden chest with a brass lock."
- "The painting is crooked. There's a gap behind the frame."
- "Scratches on the wall. Tally marks — someone was counting days."

**`hand`** — Physical interaction with bare hands. Push, pull, open, close, flip, grab, squeeze, twist.
- "You push the bookshelf. It scrapes across the floor." (noise: 25)
- "You pry up the floorboard with your fingers." (noise: 20)
- "You flip the light switch." (noise: 2)

**`take`** — Pick up and add to inventory.
- "You grab the wire cutters and pocket them."
- "You carefully peel the note off the wall."

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
5. If NO interaction matches, the engine returns a generic fallback:
   - `look` → "Nothing unusual."
   - `hand` → "That doesn't do anything."
   - `take` → "You can't take that."
   - `talk` → "..."
   - `use_item` → "That doesn't work here."

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

This single object supports: looking (reveals escape route), pulling (fails without tool), shouting for help (massive noise), using the wrong tool (scalpel breaks — red herring), using the right tool (wire cutters succeed), and the final escape action. All five verbs are useful on it.

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
| `noise_above` | `level` | Current noise > level |
| `noise_below` | `level` | Current noise < level |
| `phase_is` | `phase` | Current game phase matches |
| `time_after` | `seconds` | Seconds since game start > value |
| `time_before` | `seconds` | Seconds since game start < value |
| `item_count` | `min` | Player has >= min items in inventory |
| `is_hiding` | — | Player is currently in a hiding spot |
| `not_hiding` | — | Player is NOT hiding |
| `killer_is` | `state` | Killer AI is in this state |
| `view_is` | `view` | Player is on this view |

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
| `message` | `text` | Show text to the player. The primary narrative vehicle. |
| `add_item` | `item` | Add item to player's inventory. |
| `remove_item` | `item` | Remove item from inventory. |
| `set_state` | `object`, `state` | Change an object's state. |
| `show_object` | `object` | Make a hidden object visible. |
| `hide_object` | `object` | Make a visible object disappear. |
| `set_flag` | `flag`, `value` | Set a global flag. |
| `add_noise` | `amount` | Add to noise level (clamped 0-100). |
| `set_noise` | `level` | Set noise to exact value. |
| `advance_phase` | `phase` | Jump to a specific game phase. |
| `game_over` | `result` (`"win"`/`"lose"`), `reason` | End the game. |
| `start_hiding` | — | Player enters hiding. |
| `stop_hiding` | — | Player leaves hiding. |
| `transform_item` | `from`, `to` | Replace one inventory item with another. |
| `trigger_event` | `event` | Manually fire a named event. |
| `visual_cue` | `cue` | Client-side visual effect: `"shake"`, `"flash"`, `"flicker"`, `"dim"`, `"red_pulse"` |
| `set_view` | `view` | Switch to a different view (closeup or back to main). |
| `play_sound` | `sound` | Play a named sound effect (from a standard library). |
| `delay_then` | `seconds`, `effects` | Wait N seconds, then apply nested effects. |
| `random_message` | `messages` | Show one message randomly from an array. Good for variety. |
| `conditional_effect` | `when`, `then`, `else` | If condition is met, do `then` effects; otherwise do `else` effects. |

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

---

## Puzzle Widgets

For interactions more complex than "click → result" — things with their own UI like combination locks, keypads, toggle panels.

Puzzle widgets are pre-built client components. The JSON configures them.

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
| `position` | `{x, y}` | yes | Position in 960x720 coordinate space |
| `size` | `{width, height}` | yes | Clickable/display region |
| `view` | string | no | Which view this widget appears on. Default `"main"`. |
| `initially_visible` | boolean | no | Default `true`. |
| `config` | object | yes | Type-specific configuration. |
| `on_solve` | effect[] | yes | Effects when puzzle is solved. |
| `on_fail` | effect[] | no | Effects on wrong answer. |
| `noise_per_interaction` | number | no | Noise per dial turn / button press / toggle. |
| `max_attempts` | number | no | Fail after N wrong attempts (triggers `on_max_fail`). |
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

Events are evaluated every game tick (1/sec). Use `one_shot: true` for most narrative events. Use `one_shot: false` for repeating environmental effects (e.g., a dripping sound every time noise is below 10).

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

A valid scenario must satisfy all of these:

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

Two interactions on the same object: one with no gating condition but high noise/consequences, and another gated by a preparation flag that achieves the same result quietly.

```json
{
  "verb": "take",
  "when": [],
  "then": [
    { "type": "add_item", "item": "key" },
    { "type": "add_noise", "amount": 45 },
    { "type": "message", "text": "You grab the key — and an alarm blares!" },
    { "type": "trigger_event", "event": "alarm_triggered" }
  ],
  "noise": 0
},
{
  "verb": "take",
  "when": [{ "type": "flag_is", "flag": "alarm_disabled", "value": "true" }],
  "then": [
    { "type": "add_item", "item": "key" },
    { "type": "message", "text": "You take the key. Silence." }
  ],
  "noise": 2
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
