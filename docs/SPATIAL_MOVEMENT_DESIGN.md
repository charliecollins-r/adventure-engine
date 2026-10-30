# Spatial Movement & Click-to-Move Design

> Extends SCENARIO_SCHEMA v1.0 with player avatar movement, distance-based interactions, walkable areas, screen transitions, animated characters, and maze/exploration mechanics.

---

## Table of Contents

1. [Design Goals](#design-goals)
2. [Architecture Overview](#architecture-overview)
3. [Schema Extensions — Views](#schema-extensions--views)
4. [Schema Extensions — Objects](#schema-extensions--objects)
5. [Schema Extensions — Player](#schema-extensions--player)
6. [Schema Extensions — Navigation](#schema-extensions--navigation)
7. [Schema Extensions — Characters](#schema-extensions--characters)
8. [Schema Extensions — Killer](#schema-extensions--killer)
9. [Movement Engine](#movement-engine)
10. [Distance-Based Interactions](#distance-based-interactions)
11. [Screen Transitions & Exploration Maps](#screen-transitions--exploration-maps)
12. [Maze & Hazard Mechanics](#maze--hazard-mechanics)
13. [Animation System](#animation-system)
14. [Camera & Viewport](#camera--viewport)
15. [Backward Compatibility](#backward-compatibility)
16. [Implementation Notes (Phaser 3)](#implementation-notes-phaser-3)

---

## Design Goals

Transform Adventure Engine from a static point-and-click scene viewer into a spatially immersive adventure game where:

1. **The player avatar walks within and between scenes** — click a point, the character pathfinds there
2. **Distance matters** — objects have interaction ranges; walk closer to reach them
3. **Scenes connect geographically** — walk to screen edges to transition between views
4. **Characters animate** — frame-by-frame walk cycles, idle animations, action poses
5. **Exploration can be dangerous** — maze navigation, hazard zones, getting lost
6. **100% backward compatible** — scenarios without spatial data play exactly as before (classic mode)

### Two Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Classic** | View has no `walkable_area` | Current behavior: static background, click verbs on hotspots |
| **Spatial** | View has `walkable_area` defined | Avatar walks within scene, distance gates interactions, screen-edge transitions |

The engine auto-detects which mode based on the view data. A scenario can mix modes — spatial for exploration views, classic for closeup/puzzle views.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  VIEW (1024x768 background)                          │
│                                                       │
│  ┌──────────────────────────────────────────────┐    │
│  │  WALKABLE AREA (polygon mask)                 │    │
│  │                                               │    │
│  │  ┌─────┐        ┌──────┐                      │    │
│  │  │ OBJ │        │ OBJ  │    ● player avatar   │    │
│  │  │     │ ←reach→│      │                      │    │
│  │  └─────┘        └──────┘                      │    │
│  │                                               │    │
│  │  ═══ EXIT ZONE (screen edge) ═══             │    │
│  └──────────────────────────────────────────────┘    │
│                                                       │
│  NON-WALKABLE: walls, furniture tops, decorations     │
└─────────────────────────────────────────────────────┘
```

The walkable area is a polygon (or set of polygons) defining where the avatar can move. Objects sit at fixed positions. Each object has a `reach_distance` — the avatar must be within that many pixels to interact. Exit zones at screen edges trigger transitions to connected views.

---

## Schema Extensions — Views

### New fields on `views[]` entries:

```json
{
  "id": "desert_oasis",
  "background_key": "desert_oasis",
  "background_file": "backgrounds/desert_oasis.png",
  "objects": ["palm_tree", "water_pool", "stone_marker", "sand_pile"],

  "walkable_area": {
    "polygons": [
      {
        "points": [
          [0, 600], [200, 580], [400, 550], [600, 540],
          [800, 550], [1024, 580], [1024, 768], [0, 768]
        ]
      }
    ],
    "hazard_zones": [
      {
        "id": "quicksand_patch",
        "polygon": [[300, 620], [400, 610], [420, 680], [280, 690]],
        "effect": "slow",
        "slow_factor": 0.3,
        "on_enter": [
          { "type": "message", "text": "Your feet sink into loose sand. It's getting harder to move..." }
        ],
        "on_linger": {
          "delay_seconds": 5,
          "effects": [
            { "type": "message", "text": "You're sinking! Pull yourself out!" },
            { "type": "game_over", "reason": "Swallowed by the desert." }
          ]
        }
      }
    ],
    "nav_mesh_resolution": 16
  },

  "spawn_point": { "x": 512, "y": 700 },

  "exits": [
    {
      "id": "exit_north",
      "edge": "top",
      "zone": { "x1": 300, "x2": 700, "y": 0 },
      "target_view": "desert_dunes_3",
      "target_spawn": { "x": 512, "y": 720 },
      "when": [],
      "blocked_message": "The sand dunes are impassable from here."
    },
    {
      "id": "exit_east",
      "edge": "right",
      "zone": { "x": 1024, "y1": 500, "y2": 768 },
      "target_view": "desert_canyon",
      "target_spawn": { "x": 50, "y": 650 },
      "when": [{ "type": "has_item", "item": "compass" }],
      "blocked_message": "You'd get lost without a compass. The desert all looks the same."
    }
  ],

  "ambient_characters": [
    {
      "character_id": "vulture",
      "path": [[100, 200], [500, 180], [900, 200]],
      "speed": 30,
      "loop": true,
      "initially_visible": true
    }
  ],

  "depth_sorting": true,
  "scale_with_depth": {
    "min_y": 400,
    "max_y": 768,
    "min_scale": 0.5,
    "max_scale": 1.0
  }
}
```

### New view fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `walkable_area` | object | no | Defines spatial mode for this view. If absent, classic mode. |
| `walkable_area.polygons` | polygon[] | yes (in spatial) | One or more polygons defining where the avatar can walk. |
| `walkable_area.hazard_zones` | hazard[] | no | Dangerous zones within the walkable area. |
| `walkable_area.nav_mesh_resolution` | int | no | Grid cell size for pathfinding. Default 16. |
| `spawn_point` | `{x, y}` | no | Where the player avatar appears when entering this view. Overridden by exit's `target_spawn`. |
| `exits` | exit[] | no | Screen-edge transitions to other views. |
| `ambient_characters` | ambient_char[] | no | Non-interactive animated characters in the scene. |
| `depth_sorting` | boolean | no | If true, objects and avatar sorted by Y for depth illusion. Default false. |
| `scale_with_depth` | object | no | Avatar scales based on Y position (perspective). |

### Exit definition:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique exit identifier. |
| `edge` | `"top"` `"bottom"` `"left"` `"right"` `"portal"` | yes | Which screen edge, or `"portal"` for non-edge exits (doors, ladders). |
| `zone` | object | yes | The pixel region that triggers the transition. For edges: a strip along the edge. For portals: a rect `{x, y, width, height}`. |
| `target_view` | string | yes | View ID to transition to. |
| `target_spawn` | `{x, y}` | no | Where player appears in target view. Defaults to target's `spawn_point`. |
| `when` | condition[] | no | Conditions to allow passage. Empty = always open. |
| `blocked_message` | string | no | Shown when conditions aren't met. |
| `transition` | string | no | `"walk"` (default, avatar walks off-screen), `"fade"`, `"cut"`, `"slide_left"`, `"slide_right"`, `"slide_up"`, `"slide_down"`. |
| `on_enter` | effect[] | no | Effects triggered when the player uses this exit. |

### Hazard zone definition:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique hazard identifier. |
| `polygon` | int[][] | yes | Points defining the hazard area. |
| `effect` | `"slow"` `"damage"` `"teleport"` `"block"` | yes | What happens in this zone. |
| `slow_factor` | float | for `slow` | Movement speed multiplier (0.1 = very slow). |
| `teleport_target` | `{view, x, y}` | for `teleport` | Where the player ends up. |
| `on_enter` | effect[] | no | Effects when player steps into the zone. |
| `on_linger` | object | no | Effects after staying in zone for `delay_seconds`. |
| `when` | condition[] | no | Conditions for this hazard to be active. Inactive = normal ground. |

---

## Schema Extensions — Objects

### New fields on `objects[]`:

```json
{
  "id": "stone_marker",
  "name": "Stone Marker",
  "position": { "x": 500, "y": 600 },
  "size": { "width": 60, "height": 80 },

  "reach_distance": 80,
  "approach_point": { "x": 480, "y": 640 },
  "auto_approach": true,

  "depth_layer": "foreground",
  "occlude_player": false,
  "collision_box": { "x": 480, "y": 620, "width": 40, "height": 30 },

  "interactions": [ ... ]
}
```

### New object fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reach_distance` | int | no | Pixels from object center the player must be within to interact. Default: 100. In classic mode, this is ignored (always in reach). |
| `approach_point` | `{x, y}` | no | Where the avatar walks to when auto-approaching. If not set, calculated as nearest walkable point to object center. |
| `auto_approach` | boolean | no | If true, clicking the object with a verb first walks the avatar to `approach_point`, then performs the interaction. Default true. |
| `depth_layer` | `"background"` `"midground"` `"foreground"` | no | For depth sorting. Default `"midground"`. |
| `occlude_player` | boolean | no | If true, object sprite renders in front of player when player is behind it (Y-based). |
| `collision_box` | `{x, y, width, height}` | no | Solid area the avatar cannot walk through. If not set, the avatar can walk through the object. |
| `out_of_reach_message` | string | no | Custom message when player tries to interact from too far. Default: `"You need to get closer."` |

### Interaction Distance Flow:

```
Player clicks LOOK on distant object
  → reach_distance check
    → If verb == "look" AND distance > reach_distance * 2:
        Show: "You can barely make it out from here."
        (Look has 2x range — you can see farther than you can reach)
    → If verb == "look" AND distance <= reach_distance * 2:
        Normal look text
    → If verb in ("hand", "take", "use_item") AND distance > reach_distance:
        If auto_approach:
          Avatar walks to approach_point, THEN performs interaction
        Else:
          Show: out_of_reach_message or "You need to get closer."
    → If verb == "talk" AND distance > reach_distance * 1.5:
        Show: "You'd have to get closer to be heard."
```

**Look** has extended range (2x) — you can see things from farther away.
**Talk** has medium range (1.5x) — you can shout a bit.
**Hand/Take/Use** require close proximity (1x) — physical contact.

---

## Schema Extensions — Player

New top-level `player` section:

```json
"player": {
  "sprite_sheet": "sprites/player_sheet.png",
  "frame_width": 64,
  "frame_height": 128,
  "animations": {
    "idle_down": { "frames": [0, 1, 2, 3], "frame_rate": 4, "loop": true },
    "idle_up": { "frames": [4, 5, 6, 7], "frame_rate": 4, "loop": true },
    "idle_left": { "frames": [8, 9, 10, 11], "frame_rate": 4, "loop": true },
    "idle_right": { "frames": [12, 13, 14, 15], "frame_rate": 4, "loop": true },
    "walk_down": { "frames": [16, 17, 18, 19, 20, 21, 22, 23], "frame_rate": 10, "loop": true },
    "walk_up": { "frames": [24, 25, 26, 27, 28, 29, 30, 31], "frame_rate": 10, "loop": true },
    "walk_left": { "frames": [32, 33, 34, 35, 36, 37, 38, 39], "frame_rate": 10, "loop": true },
    "walk_right": { "frames": [40, 41, 42, 43, 44, 45, 46, 47], "frame_rate": 10, "loop": true },
    "hide": { "frames": [48, 49, 50], "frame_rate": 6, "loop": false },
    "interact": { "frames": [51, 52, 53, 54], "frame_rate": 8, "loop": false },
    "death": { "frames": [55, 56, 57, 58, 59], "frame_rate": 6, "loop": false }
  },
  "walk_speed": 150,
  "run_speed": 250,
  "run_noise_per_second": 3,
  "collision_radius": 12,
  "shadow": true,
  "footstep_sounds": {
    "stone": "sfx/footstep_stone.mp3",
    "sand": "sfx/footstep_sand.mp3",
    "wood": "sfx/footstep_wood.mp3",
    "water": "sfx/footstep_water.mp3"
  },
  "surface_map": "surfaces/player_surfaces.png"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sprite_sheet` | string | no | Path to sprite sheet PNG. If absent, default avatar. |
| `frame_width` | int | no | Width of each frame in the sprite sheet. |
| `frame_height` | int | no | Height of each frame. |
| `animations` | object | no | Named animation definitions. |
| `animations.*.frames` | int[] | yes | Frame indices in the sprite sheet (left-to-right, top-to-bottom). |
| `animations.*.frame_rate` | int | yes | Frames per second. |
| `animations.*.loop` | boolean | yes | Whether to loop. |
| `walk_speed` | int | no | Pixels per second walking. Default 150. |
| `run_speed` | int | no | Pixels per second running. Default 250. |
| `run_noise_per_second` | int | no | Noise generated per second of running. Default 3. |
| `collision_radius` | int | no | Avatar's collision circle radius. Default 12. |
| `shadow` | boolean | no | Render a shadow under the avatar. Default true. |
| `footstep_sounds` | object | no | Sound effects by surface type. |
| `surface_map` | string | no | A color-coded image where pixel color = surface type at that position. |

### Surface Map

An optional image (same size as background) where each pixel color maps to a surface type:
- `#000000` = non-walkable
- `#808080` = stone
- `#c8a050` = sand
- `#604020` = wood
- `#4060c0` = water

The engine reads the pixel under the player's feet to determine footstep sound and movement effects.

### Player Animation States

The engine maps movement to animations automatically:

```
if (moving) {
  if (abs(dx) > abs(dy)) {
    play(dx > 0 ? "walk_right" : "walk_left");
  } else {
    play(dy > 0 ? "walk_down" : "walk_up");
  }
} else {
  play("idle_" + lastDirection);
}
```

If diagonal animations are provided (`walk_down_left`, etc.), the engine uses 8-directional. Otherwise 4-directional.

If no `player` section exists, the engine renders a simple colored circle avatar in spatial mode, or no avatar in classic mode.

---

## Schema Extensions — Navigation

### Exploration Map (for multi-screen scenarios)

New top-level `exploration_map` section:

```json
"exploration_map": {
  "type": "grid",
  "width": 5,
  "height": 5,
  "cells": {
    "0,0": { "view": "desert_start" },
    "1,0": { "view": "desert_dunes_1" },
    "2,0": { "view": "desert_dunes_2", "hazard": "sandstorm" },
    "0,1": { "view": "desert_oasis" },
    "1,1": { "view": "desert_dunes_3" },
    "2,1": { "view": "desert_canyon" },
    "3,1": { "view": "desert_ruins_entrance" }
  },
  "fog_of_war": true,
  "minimap": true,
  "compass_item": "compass",
  "compass_required_for_navigation": true,
  "lost_mechanic": {
    "enabled": true,
    "trigger_conditions": [
      { "type": "not_has_item", "item": "compass" },
      { "type": "flag_not", "flag": "knows_desert_path", "value": "true" }
    ],
    "lost_pool": ["desert_dunes_1", "desert_dunes_2", "desert_dunes_3"],
    "lost_message": "The endless dunes look identical in every direction. You've lost your bearings.",
    "max_lost_steps": 5,
    "lost_consequence": [
      { "type": "message", "text": "The sun beats down mercilessly. You collapse from heat exhaustion." },
      { "type": "game_over", "reason": "Lost in the desert." }
    ]
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"grid"` `"graph"` | no | `"grid"` = 2D grid, `"graph"` = arbitrary node connections. Default `"grid"`. |
| `width`, `height` | int | for `grid` | Grid dimensions. |
| `cells` | object | for `grid` | Map of `"x,y"` → cell definition. |
| `nodes` | object | for `graph` | Map of node IDs → node definition (for non-grid layouts). |
| `fog_of_war` | boolean | no | If true, unvisited areas hidden on minimap. Default false. |
| `minimap` | boolean | no | Show a minimap overlay. Default false. |
| `compass_item` | string | no | Item ID that enables compass/direction UI. |
| `compass_required_for_navigation` | boolean | no | If true, without compass, exit direction labels are hidden. |
| `lost_mechanic` | object | no | KQ5-style "get lost in the desert" mechanic. |

### Lost Mechanic

When `lost_mechanic.enabled` is true AND the `trigger_conditions` are met:
- Instead of transitioning to the correct neighboring cell, the player is randomly sent to one of the `lost_pool` views
- After `max_lost_steps` consecutive lost transitions, `lost_consequence` fires
- Having the compass item (or satisfying any condition that makes `trigger_conditions` false) restores normal navigation
- The counter resets when the player reaches a non-lost-pool view

This recreates the KQ5 desert mechanic where walking without the compass randomly shuffles you between identical-looking dunes until you die.

### Graph-Based Navigation (non-grid)

For scenarios that aren't on a clean grid (buildings, caves, branching paths):

```json
"exploration_map": {
  "type": "graph",
  "nodes": {
    "entrance_hall": {
      "view": "entrance_hall",
      "connections": {
        "north": "gallery",
        "east": "library",
        "staircase": "upper_landing"
      }
    },
    "gallery": {
      "view": "art_gallery",
      "connections": {
        "south": "entrance_hall",
        "hidden_door": "secret_passage"
      }
    }
  }
}
```

The `connections` keys map to exit IDs on the view. The map tracks which node the player is on and enforces valid transitions.

---

## Schema Extensions — Characters

### NPC Characters (beyond the killer)

New top-level `characters` section:

```json
"characters": [
  {
    "id": "guide_npc",
    "name": "Old Hermit",
    "sprite_sheet": "sprites/hermit_sheet.png",
    "frame_width": 64,
    "frame_height": 128,
    "animations": {
      "idle": { "frames": [0, 1, 2, 3], "frame_rate": 3, "loop": true },
      "talk": { "frames": [4, 5, 6, 7, 8, 9], "frame_rate": 8, "loop": true },
      "walk_left": { "frames": [10, 11, 12, 13, 14, 15, 16, 17], "frame_rate": 10, "loop": true },
      "walk_right": { "frames": [18, 19, 20, 21, 22, 23, 24, 25], "frame_rate": 10, "loop": true },
      "gesture": { "frames": [26, 27, 28, 29], "frame_rate": 6, "loop": false }
    },
    "initial_view": "desert_oasis",
    "position": { "x": 400, "y": 620 },
    "walk_speed": 80,
    "reach_distance": 100,
    "behavior": "stationary",
    "patrol_path": null,
    "dialogue_interactions": [
      {
        "verb": "talk",
        "when": [{ "type": "flag_not", "flag": "talked_to_hermit", "value": "true" }],
        "then": [
          { "type": "message", "text": "'You seek the ruins? Follow the stone markers, child. Three markers point the way. Without them, the desert swallows all.'" },
          { "type": "set_flag", "flag": "talked_to_hermit", "value": "true" },
          { "type": "set_flag", "flag": "knows_desert_path", "value": "true" }
        ],
        "animation": "talk"
      }
    ]
  }
]
```

Characters are essentially mobile objects with animation. They use the same interaction verb system but can move between views and patrol paths.

---

## Schema Extensions — Killer

The killer already has a movement model, but in spatial mode it needs physical presence:

### New killer fields:

```json
"killer": {
  "name": "The Scorpion King",
  
  "spatial": {
    "sprite_sheet": "sprites/scorpion_king_sheet.png",
    "frame_width": 96,
    "frame_height": 128,
    "animations": {
      "idle": { "frames": [0, 1, 2, 3], "frame_rate": 3, "loop": true },
      "walk_down": { "frames": [4, 5, 6, 7, 8, 9, 10, 11], "frame_rate": 10, "loop": true },
      "walk_up": { "frames": [12, 13, 14, 15, 16, 17, 18, 19], "frame_rate": 10, "loop": true },
      "walk_left": { "frames": [20, 21, 22, 23, 24, 25, 26, 27], "frame_rate": 10, "loop": true },
      "walk_right": { "frames": [28, 29, 30, 31, 32, 33, 34, 35], "frame_rate": 10, "loop": true },
      "search": { "frames": [36, 37, 38, 39, 40, 41], "frame_rate": 6, "loop": true },
      "catch": { "frames": [42, 43, 44, 45, 46, 47, 48, 49], "frame_rate": 8, "loop": false }
    },
    "walk_speed": 120,
    "run_speed": 200,
    "detection_radius": 200,
    "catch_radius": 40,
    "patrol_views": ["desert_ruins_entrance", "desert_ruins_inner", "desert_temple"],
    "patrol_path_per_view": {
      "desert_ruins_entrance": [[200, 600], [500, 580], [800, 600]],
      "desert_ruins_inner": [[100, 650], [900, 650]]
    },
    "chase_behavior": "pathfind",
    "gives_up_after_seconds": 30,
    "search_pattern": "systematic"
  }
}
```

In spatial mode, the killer is a visible animated character that:
- **Patrols** between views on a schedule (existing check_interval)
- **Walks a path** within each view (patrol_path_per_view)
- **Detects** the player within `detection_radius` pixels (unless hiding)
- **Chases** using pathfinding when in detection range
- **Catches** when within `catch_radius` pixels
- **Searches** rooms systematically when evidence is found

In classic mode (no spatial data), the killer remains the existing abstract timer-based system.

---

## Movement Engine

### Pathfinding

The engine uses a **navigation mesh** derived from the walkable area polygons:

1. At view load, the walkable polygon(s) are rasterized into a grid (resolution = `nav_mesh_resolution`, default 16px)
2. Collision boxes from objects punch holes in the nav mesh
3. Pathfinding uses **A*** on the grid from player position to click target
4. The resulting path is smoothed (string-pulling / funnel algorithm) for natural-looking movement

### Movement Input

| Input | Result |
|-------|--------|
| Click on walkable ground | Walk to that point |
| Click on object (with verb selected) | Walk to object's `approach_point`, then interact |
| Click on exit zone | Walk to nearest point in exit zone, then transition |
| Double-click | Run to point (generates noise) |
| Click while walking | New destination replaces old one |
| Shift+click | Force-walk (ignores auto-approach on objects) |

### Collision

- Player has a `collision_radius` circle
- Object `collision_box` rects block movement
- Walkable polygon edges are walls
- Other characters have collision circles

---

## Distance-Based Interactions

### The Distance Check

When the player activates a verb on an object:

```
distance = euclidean(player.position, object.center)
effective_reach = object.reach_distance ?? 100

switch (verb) {
  case "look":
    max_range = effective_reach * 2.5
    if (distance > max_range)
      show("You can barely see it from here.")
    else if (distance > effective_reach)
      show(object.far_look_text ?? interaction.then messages)  // slightly degraded info
    else
      normal interaction
    break
    
  case "talk":
    max_range = effective_reach * 1.5
    if (distance > max_range)
      show("Too far away to be heard.")
    else
      normal interaction (maybe with "You call out:" prefix)
    break
    
  case "hand", "take", "use_item":
    if (distance > effective_reach)
      if (object.auto_approach)
        walk_to(object.approach_point).then(() => perform_interaction())
      else
        show(object.out_of_reach_message ?? "You need to get closer.")
    else
      normal interaction
    break
}
```

### New optional object fields for distance flavor:

| Field | Type | Description |
|-------|------|-------------|
| `far_look_text` | string | What you see from a distance. Less detail than the close-up look. |
| `out_of_reach_message` | string | Custom "too far" message. |
| `approach_animation` | string | Player animation to play when approaching. |

---

## Screen Transitions & Exploration Maps

### Transition Flow

1. Player walks into an exit zone
2. Engine checks exit's `when` conditions
3. If blocked: show `blocked_message`, player stops at zone edge
4. If open: play `transition` animation, fire `on_enter` effects
5. Load target view
6. Place player at `target_spawn` (or target view's `spawn_point`)
7. Resume play

### Transition Types

| Type | Visual |
|------|--------|
| `walk` | Avatar walks off one screen edge, appears walking in from the opposite edge on the new screen |
| `fade` | Fade to black, load new screen, fade in |
| `cut` | Instant cut |
| `slide_left/right/up/down` | New screen slides in from the direction |
| `door` | Screen goes black, door sound, new screen fades in |
| `climb` | Player plays climb animation, screen transitions vertically |

---

## Maze & Hazard Mechanics

### Desert/Maze Pattern (KQ5-style)

The `lost_mechanic` on `exploration_map` creates disorientation:

1. Player enters a "maze zone" (set of views in `lost_pool`)
2. Without a navigation aid (compass, map, knowledge), exits redirect randomly
3. Each wrong step increments a counter
4. After `max_lost_steps`, a consequence fires (death, teleport back, etc.)
5. With the right item/flag, navigation works normally

### Environmental Hazards

Beyond the `hazard_zones` on walkable areas, the schema supports:

**Timed hazards** (via events):
```json
{
  "id": "sandstorm_event",
  "trigger": { "type": "phase_is", "phase": "exposed" },
  "effects": [
    { "type": "message", "text": "A wall of sand approaches from the west..." },
    { "type": "delay_then", "delay_seconds": 15, "effects": [
      { "type": "set_flag", "flag": "sandstorm_active", "value": "true" },
      { "type": "message", "text": "The sandstorm hits. Visibility drops to zero." }
    ]}
  ]
}
```

**Conditional walkable areas** — areas that change based on flags:
```json
"walkable_area": {
  "polygons": [
    {
      "points": [[0, 600], [1024, 600], [1024, 768], [0, 768]],
      "when": []
    },
    {
      "points": [[400, 400], [600, 400], [600, 600], [400, 600]],
      "when": [{ "type": "flag_is", "flag": "bridge_extended", "value": "true" }],
      "label": "Extended bridge"
    }
  ]
}
```

Polygons with `when` conditions only appear in the nav mesh when conditions are met. This allows bridges to extend, floors to collapse, doors to open as walkable passages.

---

## Animation System

### Sprite Sheet Format

**Recommended format for Gemini generation**: PNG sprite sheet.

```
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ F0   │ F1   │ F2   │ F3   │ F4   │ F5   │ F6   │ F7   │  Row 0: idle_down
├──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ F8   │ F9   │ F10  │ F11  │ F12  │ F13  │ F14  │ F15  │  Row 1: idle_up
├──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ F16  │ F17  │ F18  │ F19  │ F20  │ F21  │ F22  │ F23  │  Row 2: walk_down
├──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ F24  │ F25  │ F26  │ F27  │ F28  │ F29  │ F30  │ F31  │  Row 3: walk_up
├──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ ...  │      │      │      │      │      │      │      │  (more rows)
└──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

**Specification for Gemini prompts**:
- Frame size: 64x128 pixels (or 96x128 for larger characters)
- 8 frames per row, rows stacked vertically
- Transparent background (PNG with alpha)
- Consistent anchor point (feet at bottom-center of each frame)
- Required animations: idle (4 directions), walk (4 directions), at minimum
- Optional: run, interact, hide, death, special actions
- Style: consistent with the scenario's art direction

### Alternative: Texture Atlas (JSON + PNG)

For more complex animations with varying frame sizes:

```json
{
  "sprite_atlas": "sprites/player_atlas.png",
  "atlas_json": "sprites/player_atlas.json"
}
```

The atlas JSON follows the standard Phaser/TexturePacker format. This is better for characters with animations of different sizes (e.g., a small idle but a wide attack swing).

### Phaser 3 Integration

```typescript
// Loading a sprite sheet
this.load.spritesheet('player', 'sprites/player_sheet.png', {
  frameWidth: 64,
  frameHeight: 128
});

// Creating animations from scenario data
for (const [name, anim] of Object.entries(scenario.player.animations)) {
  this.anims.create({
    key: `player_${name}`,
    frames: this.anims.generateFrameNumbers('player', { frames: anim.frames }),
    frameRate: anim.frame_rate,
    repeat: anim.loop ? -1 : 0
  });
}

// Playing animation based on movement
const sprite = this.add.sprite(x, y, 'player');
sprite.play('player_walk_down');
```

---

## Camera & Viewport

For views larger than 1024x768 (scrolling rooms):

```json
{
  "id": "long_corridor",
  "background_file": "backgrounds/corridor.png",
  "canvas_size": { "width": 3072, "height": 768 },
  "camera": {
    "follow_player": true,
    "bounds": { "x": 0, "y": 0, "width": 3072, "height": 768 },
    "dead_zone": { "width": 200, "height": 100 },
    "lerp": 0.1
  }
}
```

Most views stay at 1024x768 (no scrolling). But large outdoor areas or long hallways can use a wider canvas with camera follow.

| Field | Type | Description |
|-------|------|-------------|
| `canvas_size` | `{width, height}` | Actual background size. Default 1024x768. |
| `camera.follow_player` | boolean | Camera follows the player avatar. Default true if canvas > viewport. |
| `camera.bounds` | rect | Camera doesn't scroll past these bounds. |
| `camera.dead_zone` | `{width, height}` | Player can move this many pixels before camera starts following. |
| `camera.lerp` | float | Camera follow smoothing (0-1). Lower = smoother, slower. |

---

## Backward Compatibility

The spatial system is **fully additive**:

| Scenario Type | What Happens |
|---------------|-------------|
| No `walkable_area` on any view | Pure classic mode. No avatar, no distance checks. Exactly current behavior. |
| Some views have `walkable_area` | Mixed mode. Spatial views show avatar; closeup views revert to classic. |
| All views have `walkable_area` | Full spatial mode. |
| No `player` section | Spatial views use a default circle avatar. |
| No `exploration_map` | Views connect only through explicit `set_view` effects and exit definitions. |
| No `characters` section | No NPCs beyond the killer. |

All existing scenarios work without modification.

---

## Implementation Notes (Phaser 3)

### Scene Architecture

```
GameScene (main scene)
├── BackgroundLayer (background image)
├── GroundObjectLayer (objects behind player, sorted by Y)
├── PlayerSprite (the avatar)
├── ForegroundObjectLayer (objects in front of player, sorted by Y)
├── UILayer (verbs, inventory, messages)
├── MinimapOverlay (if exploration_map.minimap)
└── TransitionOverlay (fade/slide effects)
```

### Key Systems to Build

1. **NavMeshSystem** — Converts walkable polygons to A* grid, handles dynamic obstacles
2. **MovementSystem** — Handles click-to-move, pathfinding, collision, animation state
3. **DistanceSystem** — Checks reach distance before dispatching interactions
4. **TransitionSystem** — Manages screen transitions (fade, slide, walk)
5. **DepthSortSystem** — Sorts sprites by Y position each frame
6. **ExplorationMapSystem** — Tracks player position on the map grid, handles fog of war
7. **LostMechanicSystem** — Intercepts exits when lost conditions are met
8. **CharacterSystem** — Manages NPC movement, patrol paths, animation
9. **KillerSpatialSystem** — Extends killer AI with physical presence, detection, chasing
10. **CameraSystem** — Handles scrolling views, camera follow, bounds

### Estimated Implementation Order

1. NavMesh + basic click-to-move (2-3 days)
2. Distance checks on interactions (1 day)
3. Screen transitions via exits (1-2 days)
4. Player sprite sheet animation (1 day)
5. Depth sorting (0.5 day)
6. Exploration map + minimap (2 days)
7. Lost mechanic (1 day)
8. NPC characters (2 days)
9. Killer spatial mode (2-3 days)
10. Camera system for scrolling views (1 day)
11. Hazard zones (1 day)
12. Surface map + footstep sounds (0.5 day)

Total: ~15-17 days of implementation

---

## What to Generate from Gemini

When generating character animations, prompt Gemini for:

### Player Character Sprite Sheet
```
Generate a sprite sheet PNG for a [character description].
- Frame size: 64 pixels wide, 128 pixels tall
- 8 frames per row
- Transparent background
- Consistent foot position at bottom-center of each frame
- Art style: [scenario art style, e.g., "pixel art", "painted", "realistic"]

Rows needed (top to bottom):
Row 1: Idle facing down (4 frames, subtle breathing)
Row 2: Idle facing up (4 frames)
Row 3: Idle facing left (4 frames)
Row 4: Idle facing right (4 frames)
Row 5: Walk down (8 frames, full walk cycle)
Row 6: Walk up (8 frames)
Row 7: Walk left (8 frames)
Row 8: Walk right (8 frames)
Row 9: Hide/crouch (3 frames, transition to crouch)
Row 10: Interact/reach (4 frames, reaching forward)
Row 11: Death/collapse (5 frames)

Total: 55 frames, 8 columns × 11 rows = 512×1408 PNG
```

### Killer Character Sprite Sheet
Same format but typically larger frames (96x128) and with additional animations:
- Patrol walk (4 directions)
- Search (looking around)
- Chase/run (4 directions, faster cycle)
- Catch/attack animation
- Alert/notice animation (head turn, body reaction)

### Format Summary

| Asset | Format | Why |
|-------|--------|-----|
| Walk cycles | PNG sprite sheet | Phaser native, frame-perfect control, GPU-friendly |
| Complex animations | PNG atlas + JSON | Variable frame sizes, texture packing efficiency |
| Backgrounds | PNG | Static, high quality |
| Surface maps | PNG | Pixel-color lookup, same size as background |
| NOT recommended | GIF | Can't be used as Phaser sprite source, no alpha channel, limited colors |
| NOT recommended | Video/MP4 | Too heavy, can't control individual frames |
