# Walkable Areas & Click-to-Walk — Design

> **Status: implemented.** Schema reference: [SCENARIO_SCHEMA.md → Walkable Areas](SCENARIO_SCHEMA.md#walkable-areas-click-to-walk). The Harvest's Act 1 rooms and vent screens all have floors.
> This replaces the walking parts of [SPATIAL_MOVEMENT_DESIGN.md](SPATIAL_MOVEMENT_DESIGN.md) with a much smaller design that fits the engine as it exists today (React/CSS rendering, the root `character` block, per-view placements, `set_character`).

## The idea in one paragraph

A view may describe its **floor** as a list of points (a polygon) in the usual 960×720 coordinates. If it does, the player character can walk: click the floor with the **Move** (feet) cursor and he walks there along the shortest route that stays on the floor. Click an object with **Hand** or an inventory item and he walks over to it first, then the interaction runs; click an exit with **Move** and he walks to it, then the room changes. Views without a floor work exactly as today. Nothing else is required: stand points, facing and routing are worked out automatically, and every automatic choice can be overridden in JSON.

## Why this design (and what it replaces)

The old design proposed a nav-mesh grid, exits as screen-edge zones, hazard zones, reach distances per verb, NPC paths, a separate `player` block and a Phaser rewrite. That is a lot for an author to learn and for an agent to get right. This design keeps only what makes walking feel like King's Quest V and leans on systems that already exist:

| Need | Old design | This design |
|---|---|---|
| Where you can walk | `walkable_area.polygons` + nav-mesh resolution | `walk_area.floor`: one list of points |
| Furniture in the middle of the floor | `collision_box` per object | `walk_area.blocked`: lists of points |
| Exits | new `exits` array with edge zones | **existing nav objects** (Move on a door walks you there, then its `set_view` runs) |
| Getting close enough to touch | `reach_distance` per object, per verb | Hand/Use always walk you there first; Look/Talk never do |
| Where you stand to use something | `approach_point` (required to be sensible) | worked out automatically; optional `walk_to` override |
| Perspective | `scale_with_depth` with 4 numbers | `depth_scale` with the same 4 numbers, named plainly |
| Hazards, NPC paths, edge transitions | new systems | not needed: existing interactions, `game_over`, `set_view` already do these |

**Alternatives considered and rejected**

- **A painted walk mask (black/white PNG).** Easy to paint, but invisible in the JSON, can't be generated or checked by an agent, and breaks when a background is regenerated at another resolution. A polygon is 6–12 number pairs a person can read and an agent can write from the same reasoning it already uses for hotspots.
- **A grid nav-mesh.** Approximate paths, a tuning knob (`resolution`) nobody understands, and more code. With one polygon and a few holes, an exact shortest path is small and fast.
- **Automatic floor detection from the image.** Unreliable on painted art; not reproducible.

The authoring burden is kept low by tools, not by the format: the visual editor gets a **draw-the-floor** mode (click points on the background, drag to adjust, copy the JSON), `preview-hotspots.mjs` draws the floor, and the validator checks it.

## JSON

### On a view

```json
{
  "id": "act1_containment_corridor",
  "background_file": "backgrounds/act1_containment_corridor.webp",
  "character": { "x": 330, "y": 563, "facing": "right", "sprite_set": "idle" },

  "walk_area": {
    "floor":   [[150, 520], [810, 520], [960, 700], [960, 720], [0, 720], [0, 700]],
    "blocked": [
      [[440, 590], [580, 590], [580, 650], [440, 650]]
    ],
    "depth_scale": { "far_y": 520, "far": 0.8, "near_y": 720, "near": 1.15 }
  }
}
```

| Field | Meaning |
|---|---|
| `walk_area.floor` | **Required to turn walking on.** The outline of the floor, as `[x, y]` points in 960×720 space, in order around the edge (either direction). At least 3 points. Must not cross itself. |
| `walk_area.blocked` | Optional. Areas inside the floor the character must walk around (a table, a pit). Each is a list of points like `floor`. |
| `walk_area.depth_scale` | Optional. Makes the character smaller when he is further away. At feet height `far_y` he is drawn at `far` × the normal scale; at `near_y`, at `near` ×. In between it blends; beyond them it holds the end value. Omit for constant size. |
| `character.x`, `character.y` | Unchanged meaning: where he stands when you enter the room (bottom-center = his feet). Must be on the floor. |

### On an object (optional)

```json
{ "id": "vent_cover", "walk_to": { "x": 525, "y": 640, "facing": "down" } }
{ "id": "cracked_screen", "walk_to": false }
```

| Field | Meaning |
|---|---|
| `walk_to` | Where the character stands to Hand, Use or Move this object, and which way he faces when he gets there. If omitted: the nearest floor point to the bottom-center of the object, facing the object. |
| `walk_to: false` | Never walk to this object; interact from wherever he is standing (e.g. something high on a far wall that he "reaches" by looking up). |

### On `set_view` (optional)

```json
{ "type": "set_view", "view": "act1_containment_corridor", "at": { "x": 120, "y": 640, "facing": "right" } }
```

`at` puts the character at a specific spot when this transition happens: he arrives by the door he came through instead of at the room's default spot. If omitted, he appears at the view's `character` placement as today.

### On the character config (optional)

```json
"character": {
  "walk_speed": 150,
  "sprite_sets": {
    "idle":        { "file": "sprites/character_idle.png",        "walk": "walk" },
    "idle_helmet": { "file": "sprites/character_idle_helmet.png", "walk": "walk_helmet" },
    "walk":        { "file": "sprites/character_walk.png", "frame_rate": 6 },
    "walk_helmet": { "file": "sprites/character_walk_helmet.png", "frame_rate": 6 }
  }
}
```

| Field | Meaning |
|---|---|
| `walk_speed` | Pixels per second in 960×720 space at normal scale. Default 150. Scales with `depth_scale`, so he covers less screen distance when far away. |
| sprite set `walk` | The sprite set used while walking when this set is the current one. Lets the helmeted idle walk with the helmeted walk cycle. Default: a set named `walk`. If there is none, he glides in his idle pose. |

That is the whole format: three view fields, one object field, one effect field, two character fields. Every one is optional except `floor`, and only views that want walking need it.

## Behaviour

| You do | In a view with `walk_area` | In a view without it |
|---|---|---|
| **Move** on the floor | Walk there | "You can't go that way." (today) |
| **Move** outside the floor or in a blocked area | Walk to the nearest reachable floor point | (today) |
| **Move** on an exit / nav object | Walk to it, then its interaction runs (room change) | Interaction runs (today) |
| **Hand** or **use an item** on an object | Walk to it, face it, then the interaction runs | Interaction runs (today) |
| **Look** or **Talk** | Turn to face it, interaction runs immediately | (today) |
| Click again while walking | The new click replaces the old destination and any pending action | n/a |
| Walking into a room | Appears at `set_view.at`, else the view's placement | (today) |

Details that matter:

- **Facing.** While walking he faces the way he is moving: mostly sideways → left or right, mostly vertical → down or up (the engine already mirrors right for left, and uses row 0 when a set has no up row). On arrival he faces `walk_to.facing`, or the object.
- **Interaction timing.** The interaction runs when he arrives, using the game state at that moment. If something changes the room before then (a timer, a death), the pending action is dropped.
- **Messages.** Starting a walk dismisses the current message, exactly as clicking empty space does today.
- **Depth order.** In walking views, the character and sprite objects are drawn in order of their bottom edge (feet / base), so he can pass in front of or behind a crate. Painted-in furniture can't overlap him; shape `floor`/`blocked` so he can't walk "into" the painting.
- **Clicks pass through him.** The character never swallows a click meant for the floor or an object behind him (today he does: that hid the corridor vent cover). If a placement names a real `object_id`, clicks on him go to that object instead.
- **Close-ups and other no-character views** are unchanged.
- **Engine stays pure.** The engine stores the character's position and the pending action; a small pure geometry module computes routes; React only animates along the route and reports arrival. Save data gains one field (position).

## Pathfinding (exact, small, testable)

`client/src/engine/walkable.ts`, pure functions, no DOM:

- `isOnFloor(area, point)` — inside `floor`, outside every `blocked` (points on an edge count as inside).
- `nearestFloorPoint(area, point)` — the point itself if on the floor; otherwise the closest point on any floor/blocked edge, nudged a fraction of a pixel onto the floor and re-checked.
- `findPath(area, from, to)` — the shortest route that stays on the floor: a visibility graph over the corners of `floor` and `blocked` plus the two endpoints, then A*. A straight line is used when it already stays on the floor. Returns the list of corner points to walk through. With a dozen corners this is microseconds.
- Edge cases handled explicitly: start equals goal, goal in a blocked area, start slightly off the floor (snapped first), lines that touch a corner or run along an edge, concave floors, collinear points.

## Tooling

- **Visual editor (`editor.html`)**: a *Floor* mode. Click the background to add points, drag points, right-click to delete, switch to *Blocked* to draw holes, drag two guide lines to set `depth_scale` while a preview character shows the size at each height, and drag the preview character anywhere to see where he can stand. *Export* gives the `walk_area` block. Objects show their stand point, draggable to set `walk_to`.
- **`preview-hotspots.mjs`**: draws the floor (cyan), blocked areas (red), every object's stand point and the arrival spots.
- **`validate-scenario.mjs`** errors: fewer than 3 points, self-crossing outline, points outside 960×720, blocked area not inside the floor, the room's start spot not on the floor, a `walk_to` or `set_view.at` not on the floor, a `walk` sprite set that doesn't exist. Warnings: an object or exit whose stand point can't be reached from the start spot (that would be an invisible soft-lock), a `depth_scale` with `far_y >= near_y`.

## Testing plan

1. **Geometry unit tests** (Vitest, new dev dependency): hand-built cases for every edge case above, plus property tests over 10,000 random point pairs in several fixture shapes (convex, concave "U", floor with two holes, a narrow corridor): every returned route starts and ends at the right (snapped) points, every leg stays on the floor (checked by sampling), no route crosses a blocked area, and no route is longer than a fine grid search's answer.
2. **Engine unit tests**: position on entering a view, `set_view.at`, pending action runs on arrival and is dropped if the view changes, Look/Talk never queue, classic views never queue.
3. **Validator tests** on good and broken fixtures.
4. **Browser tests (Playwright)**, for every Harvest walking view: click 20 floor points and check his feet land within 1 px, sample his position every frame and check it never leaves the floor, click off the floor and check he stops at the nearest edge, Hand an object and check the message appears only after arrival, Move on every exit and check the room changes after the walk, re-click mid-walk, helmeted walking, left/right mirroring, depth scaling, close-ups untouched. Then the full Act 1 playthrough harness and the soft-lock search must still pass.
5. **Screenshot review** of every room with its floor drawn on, and of the character at near and far positions.

## Rollout

1. Schema first: this doc → `SCENARIO_SCHEMA.md` + `types.ts`.
2. `walkable.ts` + unit tests.
3. Engine: position, `at`, pending action; tests.
4. UI: click routing, walk animation, facing, depth scale, depth order, click pass-through.
5. Tools: validator rules, preview overlay, editor Floor mode.
6. The Harvest: floors for the 8 rooms and the vent screens (the 13 ducts share 5 geometries generated by `build_vent_maze.py`), stand points where the automatic ones look wrong, arrival spots on doors, depth scale per room.
7. Browser tests, harness update, docs (`ADVENTURE_BUILDER.md`, `SCENARIO_SCHEMA.md`, scenario-builder skill, `TECHNICAL_DEEP_DIVE.md`, `ART_GUIDE.md` on painting walkable floors, `CLAUDE.md`), then mark the old design superseded.

## Decisions (confirmed)

1. Look and Talk don't walk; he turns to face the object.
2. Entering a room puts him at the arrival spot (`set_view.at`, filled by `tools/arrival-spots.mjs`) or the room's default spot, never where he last stood. Leaving a close-up returns him to where he stood before it.
3. The Harvest doesn't use depth scaling for now (the field is implemented and tested).

## As built: additions to the plan

- **Move on objects that aren't exits walks to the clicked spot.** Most Harvest objects have flavour text for Move ("the pipes are fused into the walls"); treating those as destinations made clicking the floor grating walk to the grating and print a line. An object counts as an exit when one of its Move interactions can `set_view` or `game_over`, even behind a condition (a locked vent still walks you over before saying it's locked).
- **`tools/arrival-spots.mjs`** fills `set_view.at` for every door: the stand point of the exit in the target room that leads back, facing into the room.
- **Validator** bundles the real engine, so its stand points and reachability match the game exactly.
- **JSON formatting:** `[x, y]` pairs stay on one line in scenario.json (the maze build script and the arrival tool write that format).
