# Adventure Engine — CLAUDE.md

> **ALWAYS keep this file current.** After every structural change, new scenario, architecture decision, tech stack update, or design decision — update this file AND README.md. A new agent should be able to read this and contribute immediately. If you are an AI agent contributing to this project, you MUST update this file when your work changes anything documented here.

---

## What This Project Is

A **JSON-driven point-and-click adventure game engine** — "no-code adventure game builder." Authors write a single JSON file describing views, objects, items, puzzles, and an optional AI antagonist. The engine renders it as a playable Sierra-style adventure game (King's Quest V/VI aesthetic) in the browser.

**The pitch**: Drop a JSON file + background art into a folder, get a fully playable point-and-click adventure. No code required. The JSON format is the product.

---

## Repository Layout

```
/
├── CLAUDE.md                          ← YOU ARE HERE — project bible for AI agents
├── README.md                          ← Public-facing documentation (KEEP IN SYNC)
├── client/                            ← React + TypeScript frontend (Vite 8)
│   ├── src/
│   │   ├── engine/                    ← ScenarioEngine — pure TS state machine
│   │   │   ├── types.ts              ← TypeScript types matching SCENARIO_SCHEMA.md
│   │   │   ├── ScenarioEngine.ts     ← Core: load JSON, manage state, resolve interactions
│   │   │   └── assetResolver.ts      ← Centralized asset URL construction (portability layer)
│   │   ├── components/               ← React UI components
│   │   │   ├── ScenarioPlayer.tsx    ← Main game orchestrator
│   │   │   ├── ScenarioLoader.tsx    ← Scenario selection screen
│   │   │   ├── GameView.tsx          ← Renders background + object hotspots + animations
│   │   │   ├── CharacterSprite.tsx   ← Sierra-style sprite sheet character renderer
│   │   │   ├── VerbBar.tsx           ← Verb selection (look, move, hand, talk)
│   │   │   ├── InventoryPanel.tsx    ← Item display and selection
│   │   │   ├── MessagePanel.tsx      ← Story text display
│   │   │   ├── KeypadWidget.tsx      ← Keypad puzzle widget overlay (open_widget)
│   │   │   ├── NoiseIndicator.tsx    ← Noise level meter
│   │   │   └── DevPanel.tsx          ← In-game developer tools panel (?dev URL param)
│   │   ├── App.tsx                   ← Entry: ScenarioLoader → ScenarioPlayer
│   │   └── App.css                   ← Dark theme base styles
│   ├── public/
│   │   ├── scenarios → ../../scenarios  ← Symlink so Vite serves scenario content
│   │   └── editor.html               ← Standalone visual editor (sprite preview, hotspot drawing)
│   ├── package.json                  ← React 19
│   └── vite.config.ts
├── server/                            ← Spring Boot 3 backend (Java 21, Maven)
│   └── src/main/java/com/kq/        ← Future: validation, tooling, save sync
├── scenarios/                         ← ALL scenario content (self-contained folders)
│   ├── manifest.json                 ← List of available scenario IDs for auto-discovery
│   ├── the-lighthouse-keeper/        ← Each scenario is a folder containing:
│   │   ├── scenario.json             ←   The scenario definition
│   │   ├── design.md                 ←   Design doc (story, image prompts, patterns)
│   │   └── backgrounds/              ←   Background images for this scenario
│   ├── the-harvest/                  ← Flagship: 5 acts, 49 views, 7 endings
│   │   ├── scenario.json
│   │   ├── design.md
│   │   ├── deep-design.md
│   │   ├── audio/                    ←   Ambient audio tracks
│   │   ├── backgrounds/              ←   11 Act 1 backgrounds
│   │   ├── closeups/                 ←   Detail images for show_closeup effect (incl. procedural vent_map.webp)
│   │   ├── scripts/                  ←   Scenario build scripts: build_vent_maze.py, draw_vent_map.py, draw_rigged_line.py, extract_glyphs.py, build_player_idle.py
│   │   ├── ui/                       ←   Widget art (keypad glyph keys)
│   │   └── sprites/                  ←   Character sprite sheets
│   └── ... (15 scenarios total, 13 with JSONs, 2 design-only)
├── docs/
│   ├── SCENARIO_SCHEMA.md            ← THE schema spec (1700+ lines) — full JSON reference
│   ├── ARCHITECTURE.md               ← Engine internals (diagrams, data flow)
│   ├── SPATIAL_MOVEMENT_DESIGN.md    ← Deferred post-MVP spatial system design
│   ├── ART_GUIDE.md                  ← HOW TO MAKE ART: prompts, chroma-key, sizing, placement, verification
│   └── images/                       ← Screenshots for README
├── tools/
│   ├── splice-sprites.mjs            ← Node.js sprite sheet splicing utility
│   ├── process-chromakey-sprite.mjs  ← Blue-screen key + edge despill + trim for generated sprites
│   ├── validate-scenario.mjs         ← Referential/schema lint for scenario.json (run before committing)
│   ├── softlock-search.mjs           ← Exhaustive state-space soft-lock search using the real engine
│   ├── preview-hotspots.mjs          ← Render a view (or a raw new image) at 960×540 with all hotspots/sprites/character drawn on
│   └── generate-voiceover.mjs        ← ElevenLabs TTS batch generator for scenario narration
├── ADVENTURE_BUILDER.md               ← Third-party developer guide (KEEP IN SYNC)
├── TECHNICAL_DEEP_DIVE.md             ← Engine internals deep reference (KEEP IN SYNC)
└── .gitignore
```

---

## Self-Maintenance Rules for AI Agents

When you contribute to this project, follow these rules:

1. **Update CLAUDE.md** when you change the repo structure, add/remove files or folders, change the tech stack, make architecture decisions, add scenarios, or change the coordinate system / schema
2. **Update README.md** when you change anything user-facing: repo structure, getting started instructions, scenario list, roadmap items, tech stack
3. **Update ADVENTURE_BUILDER.md** when you change anything a scenario author needs to know: schema fields, supported features, verbs, coordinate system, asset formats, registration process
4. **Update TECHNICAL_DEEP_DIVE.md** when you change engine internals: ScenarioEngine behavior, new condition/effect types, component architecture, rendering pipeline, build config
5. **Keep the scenario list current** in both CLAUDE.md and README.md when adding or removing scenarios
6. **Update "Current State"** section below when completing work
7. **Never let docs drift from reality** — if you see something outdated, fix it
8. **Everything must be schema-driven** — never hardcode scenario-specific behavior in the engine. All game logic comes from the JSON. A third-party dev must be able to create a complete scenario package without writing code.
9. **Maintain hotspot positioning accuracy** — when adding or modifying object positions in any scenario JSON: (a) check the actual background image dimensions, (b) apply the correct conversion formula (`json_x = img_x × (960/IMG_W)`, `json_y = img_y × (720/IMG_H)`), (c) validate bounds (`x+w ≤ 960`, `y+h ≤ 720`), (d) verify with debug mode when possible. Position is **top-left corner** of the hotspot box. See ADVENTURE_BUILDER.md "Coordinate System" for the full guide.
10. **Always trim processed sprite PNGs** — when processing chroma-key sprites: (a) convert webp→png with ImageMagick (`convert in.webp in.png`; node-canvas may not read WebP), (b) run through `tools/process-chromakey-sprite.mjs` with `--padding 0 --threshold 110` (despill is on by default and removes blue/purple edge fringe), (c) for single-frame sprites, additionally run `convert sprite.png -trim +repage sprite.png` to remove any remaining transparent border, (d) update frame_width/frame_height in the JSON to match the trimmed dimensions, (e) check the result composited on both a dark and a light backdrop. Tight bounds ensure proper shadow rendering. Never use padding > 0 unless there's a specific reason.
11. **Art follows `docs/ART_GUIDE.md`** — backgrounds are painterly gouache; sprites and item icons are **VGA pixel art matching the player character's fidelity** (the most common rejection is "too painterly"). Use the guide's prompt template (pure #0000FF background, no blue in the object, no cast shadow), size with `scale = desired_screen_px / frame_height`, remember sprite `position` is **bottom-center** (plain hotspots are top-left), give crafted items their own combined icon, and screenshot the result in the running game next to the character before calling it done.
12. **Schema first** — every new capability starts in `docs/SCENARIO_SCHEMA.md` and `client/src/engine/types.ts`, then the engine, then scenario JSON. If something can already be expressed in the schema (it usually can), use it instead of adding engine code. Item IDs are not object IDs: `use_item`/`has_item`/`combinations` take the **item** ID (`severed_neural_tendril`), never the world object that yields it (`neural_tendril_sample`). Item consumption is always explicit (`remove_item`, `consumes: true`); see "Item Consumption" in the schema doc.
13. **No soft-locks** — before adding any `remove_item`, `consumes: true`, irreversible `set_state`, or one-shot dialogue choice, check every place that item/flag/state is required later. Re-run the validator and the state-space soft-lock search (see "Key Commands") after puzzle changes. The search can't see screen positions, so also keep every required pickup on-screen (the validator warns on off-canvas anchors).
14. **Rooms that belong together follow the vent-maze recipe** — `docs/ART_GUIDE.md` → "Case Study: The Vent Maze". In short: (1) attach one approved background as a reference image to every prompt AND describe it literally in a style paragraph; (2) place every feature by its hotspot as frame fractions ("from about 20% to 70% down"), including clear floor where the character stands; (3) say "no people, no living creatures (the remains are scenery)" instead of "no characters"; (4) review the raw image with `tools/preview-hotspots.mjs --image` and refit boxes, character spot and light positions to the painting; (5) make interchangeable screens as numbered EDITS of one hero frame ("Keep EVERYTHING identical … change ONLY: 1) 2) 3)") plus an anonymity clause; (6) mirror for right-handed variants (and mirror their hotspots); (7) reuse one hotspot geometry across generic screens; (8) design the layout around the frame classes you have; (9) generate cells/maps/hints from data with scripts; (10) verify with the validator, soft-lock search and a browser walk.
15. **Never hand-edit duplicate keys into JSON** — when applying editor exports, replace an existing `shadow`/`sprite` block instead of adding a second one. Duplicate keys parse without error and the *last* one silently wins.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 19 + TypeScript + Vite 8 | POC uses React-only rendering (no canvas) |
| Game Engine | TypeScript `ScenarioEngine` class | Pure state machine, no rendering, no side effects |
| Rendering | React components + CSS positioning | Objects as positioned divs on painted backgrounds |
| Backend | Spring Boot 3.3.5 + Java 21 + Maven | Future: tooling server for validation, save sync |
| Future Rendering | Phaser 3.80 (already in deps) | For animations, sprites, canvas effects — post-POC |
| Image Generation | Google Gemini (Imagen 3, free tier) | Background art in Sierra KQ5/KQ6 painterly style |

---

## Architecture

**Current (POC)**: Thick client. TypeScript `ScenarioEngine` runs entirely in the browser — loads scenario JSON, manages all game state, evaluates conditions, applies effects. React renders the view. No server needed for gameplay.

**Future**: Hybrid. Spring Boot becomes a tooling server: scenario validation, playtesting simulation, scenario editor API, save sync, analytics. Game engine stays client-side. Killer AI may move server-side for competitive multiplayer.

---

## The Scenario JSON Format

The complete schema is in `docs/SCENARIO_SCHEMA.md` (1700+ lines). Key concepts:

### Coordinate System
- **960x720 coordinate space** — object `position` is the **top-left corner** of the hotspot box (origin at top-left)
- Background images can be any resolution (1376x768 and 1920x1080 are common); rendered with `object-fit: cover`
- The render viewport is 960x540 pixels; scaling: `SCALE_X = 1.0`, `SCALE_Y = 0.75`
- **Image-to-JSON conversion**: `json_x = img_pixel_x × (960 / IMG_W)`, `json_y = img_pixel_y × (720 / IMG_H)`
- **Bounds rule**: `position.x + size.width ≤ 960` and `position.y + size.height ≤ 720`

### Views
Screens/locations. Each has a background key, optional background_file, and a list of object IDs. Views can be "closeup" sub-views (e.g., zoom into a desk).

### Objects
Clickable hotspots in views. Have position (960x720 coords), size, visual appearance, state, and interactions.

### Interactions
Verb + conditions → effects. "If player uses wrench on bolt AND bolt_state is 'tight' THEN set bolt_state to 'loose' AND show message."

### Four Verbs + Inventory Use
| Verb | What It Does |
|------|-------------|
| `look` | Examine visually. Always safe. Fallback shows object description. |
| `move` | Navigate between rooms. Used on nav hotspots (doorways, passages, exits). |
| `hand` | Touch, push, pull, open, close, take. All physical manipulation including picking up items. |
| `talk` | Speak, listen, read aloud. |

**Using inventory items**: Select an item from the inventory panel (click it), then click a world object. The engine calls `use_item` internally. No "use" verb button — it's implicit via inventory selection.

The engine falls back from `hand` to `take` for backwards compatibility with older scenario JSONs. Every click produces KQ5-style feedback, even when nothing happens ("You can't do anything useful with X right now.").

### Condition Types (14 + composites)
`flag_is`, `flag_not`, `object_state`, `has_item`, `not_has_item`, `view_is`, `noise_above`, `noise_below`, `phase_is`, `time_after`, `time_before`, `item_count`, `is_hiding`, `not_hiding`, `killer_is`, `widget_solved` + composites: `any_of`, `all_of`

### Effect Types (20+)
`message`, `random_message`, `set_flag`, `set_state`, `add_item`, `remove_item`, `set_view`, `open_widget`, `add_noise`, `set_noise`, `show_object`, `hide_object`, `set_animation`, `show_closeup`, `show_dialogue`, `game_over`, `advance_phase`, `start_hiding`, `stop_hiding`, `transform_item`, `trigger_event`, `visual_cue`, `play_sound`, `delay_then`, `conditional_effect`, `set_character`

### Other Systems
- **Items**: Inventory objects with examine interactions
- **Combinations**: Craft two items into a new one
- **Flags**: String key/value pairs tracking game progress
- **Phases**: Game stages with different killer behavior / world state
- **Killer**: Optional AI antagonist with patrol timers, noise thresholds, personality
- **Puzzle Widgets**: Special UI for specific puzzles. Implemented: `keypad` as an **overlay** opened by the `open_widget` effect (glyph or text keys, auto-submit, in-widget fail feedback, `on_solve`/`on_fail`/`max_attempts`+`on_max_fail` that never locks, `widget_solved` condition). Other types are specified but unrendered
- **Events**: Timer/condition-triggered narrative beats
- **Win/Lose Conditions**: Flag/state checks that end the game
- **Hints**: Progressive help system
- **Dialogue Choices**: Branching conversation system via `show_dialogue` effect
- **Character Sprites**: Sierra-style sprite sheet rendering on backgrounds
- **30 Design Patterns**: Documented reusable puzzle patterns
- **Sound Effects**: Optional `setting.sounds` with `room_transition`, `item_pickup`, `intro_voice` paths
- **Ambient Lighting**: Optional per-view `ambient_lighting` with light sources for dynamic canvas glow effects

### Character Sprite System
Optional `character` config at scenario root defines available sprite sets (walk cycles, poses) with frame dimensions and scale. Each view can include a `character` placement specifying position (960x720 coords), facing direction, sprite set, and optional static frame. The `set_character` effect changes character state dynamically (e.g., switch from scared to idle after a puzzle). Sprite sheets use CSS background-position rendering with `image-rendering: pixelated` for crisp pixel art.

```json
"character": {
  "sprite_sets": {
    "idle": { "file": "sprites/walk.png", "columns": 4, "rows": 4, "frame_rate": 0, "directions": ["down","left","right","up"] },
    "walk": { "file": "sprites/walk.png", "columns": 4, "rows": 4, "frame_rate": 6, "directions": ["down","left","right","up"] }
  },
  "frame_width": 64, "frame_height": 64, "scale": 2
}
```

Per-view placement: `"character": { "x": 480, "y": 550, "facing": "down", "sprite_set": "idle", "frame": 0 }`

---

## Engine Implementation Status

### Conditions — what's implemented vs. what scenarios use

| Condition | Engine | Used By |
|-----------|--------|---------|
| `flag_is` | Yes | 13/13 |
| `flag_not` | Yes | 13/13 |
| `object_state` | Yes | 13/13 |
| `has_item` | Yes | 12/13 |
| `not_has_item` | Yes | 11/13 |
| `view_is` | Yes | 6/13 |
| `phase_is` | Yes | 2/13 |
| `is_hiding` | Yes | 2/13 |
| `not_hiding` | Yes | 5/13 |
| `any_of` | Yes | 11/13 |
| `all_of` | Yes | 13/13 |
| `noise_above` | Yes | 1/13 |
| `noise_below` | Yes | 1/13 |
| `item_count` | Yes | 1/13 |
| `killer_is` | Stub (returns false) | 8/13 |
| `widget_solved` | Yes | 1/13 (The Harvest keypads) |
| **`time_after`** | **NO** | **13/13** (events) |

### Effects — what's implemented vs. what scenarios use

All 20+ effect types have real implementations. Remaining no-ops:
- `trigger_event` — no-op (needs events system)
- `visual_cue` — no-op (cosmetic, fine for MVP)
- `play_sound` — no-op (cosmetic, fine for MVP)

### Major Unimplemented Systems

| System | Used By | Priority |
|--------|---------|----------|
| Events system | 13/13 | HIGH |
| Puzzle widgets | 13/13 | HIGH — `keypad` overlay DONE; inline dial/combination/toggle/sequence still TODO |
| Killer AI | 13/13 | MEDIUM |
| ~~Hints~~ | ~~defined~~ | **DONE** — per-view progressive hints |

---

## Scenarios (15 total)

| Scenario | Folder | JSON | Design Doc | Backgrounds |
|----------|--------|------|-----------|-------------|
| The Wizard's Apprentice | `the-wizards-apprentice/` | Yes | Yes | No |
| The Lighthouse Keeper | `the-lighthouse-keeper/` | Yes | Yes | No |
| The Last Signal | `the-last-signal/` | Yes | Yes | No |
| Pressure Point | `pressure-point/` | Yes | Yes | No |
| The Seance Room | `the-seance-room/` | Yes | Yes | No |
| The Memory Dealer | `the-memory-dealer/` | Yes | Yes | No |
| The Abandoned Ward | `the-abandoned-ward/` | Yes | Yes | No |
| The Defector's Gambit | `the-defectors-gambit/` | Yes | Yes | No |
| The Taxidermist | `the-taxidermist/` | Yes | Yes | No |
| The Butcher's Debt | `the-butchers-debt/` | Yes | Yes | No |
| The Dollmaker's Workshop | `the-dollmakers-workshop/` | Yes | Yes | No |
| The Pharaoh's Architect | `the-pharaohs-architect/` | Yes | Yes | No |
| The Harvest | `the-harvest/` | Yes | Yes + deep-design | 11 (Act 1) |
| Blackwood Manor | `blackwood-manor/` | No | Yes | No |
| The Clockmaker's Secret | `the-clockmakers-secret/` | No | Yes | 1 |

---

## Visual Style

All generated images target the **1990s Sierra On-Line King's Quest V / King's Quest VI** aesthetic:
- 2D gouache illustration, visible brushstrokes, NOT photorealistic
- 16:9 aspect ratio, 1920x1080
- Low camera angle (viewed by a small goblin creature at knee-height)
- Saturated colors even in dark scenes — shadows have visible blue/purple color
- **Sprites and inventory icons are different**: VGA pixel art (visible pixels, limited palette, dark outlines) matching the player character, NOT painterly. Full prompt templates, processing, sizing and placement rules: **`docs/ART_GUIDE.md`**
- Shared color palette per scenario anchored across all views

### Gemini Prompt Formula
Every prompt should open with:
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.
```
And close with:
```
Low camera angle looking UP from knee-height — [scene-specific description of what that means visually]. Saturated colors despite the dark mood — [palette-specific rich color description]. No text, no UI elements, no characters.
```

---

## User Preferences

- **Java backend person** with Angular/React frontend experience — stick to this stack
- Pragmatic about security for POC — client-side state inspection is fine
- Wants Gemini prompts that work **first try** — be extremely specific about style, palette, lighting
- Repository should be BEAUTIFUL, POLISHED, ACCURATE, CONSISTENT, ROBUST

---

## Current State (keep updated)

- **15 scenarios designed**, 13 with complete JSONs, 2 design-only
- **Engine POC** functional: ScenarioEngine + React components, scenario loader, background rendering
- **Verb system redesigned**: 4 verbs (look, move, hand, talk) + implicit inventory use. KQ5-style feedback on every click. "move" for navigation, "hand" merges old hand+take, inventory items selected then clicked on world objects.
- **All core conditions implemented**: `all_of`, `any_of`, `noise_above`, `noise_below`, `item_count` all working
- **All core effects implemented**: `set_noise`, `transform_item`, `conditional_effect`, `delay_then` all working
- **The Harvest Act 1** redesigned — navigation graph corrected to match actual background art. 9 rooms: Stasis Hold → Corridor (hub, 5 exits) → Processing Lab, Security Hub, Feeding Station (secondary hub, 3 exits), Ventilation Shaft (via gated floor vent, requires `security_locks_overridden`) → Feeding Station → Morgue, Specimen Archive → Ventilation Shaft → Airlock Bay. All object positions aligned to painted backgrounds.
- **Ambient audio system**: Supports single or layered audio tracks per scenario. The Harvest has 2 ambient tracks (ship hum + lab ambience).
- **Level design doc** at `scenarios/the-harvest/act1-level-design.md` with navigation map, room-by-room tables, puzzle flow, and Gemini background regeneration prompts.
- **All 13 scenario JSONs updated** with new verb mappings (nav: hand→move, take→hand).
- **Hotspot rendering** improved: nav objects get higher z-index and blue hover border, regular objects get gold hover border, all hotspots positioned within 960x720 bounds
- **Lighthouse Keeper** is simplest (3 views) — first playtest target
- **Branch**: `claude/dreamy-volta-ha3r6v`
- **Architecture doc** at `docs/ARCHITECTURE.md` with SVG diagrams in `docs/images/`
- **Gameplay screenshots** in `docs/images/` referenced by README
- **Documentation suite**: README.md (ecosystem overview), ADVENTURE_BUILDER.md (third-party dev guide), TECHNICAL_DEEP_DIVE.md (engine internals), docs/SCENARIO_SCHEMA.md (JSON reference), docs/ARCHITECTURE.md (architecture diagrams)
- **Hotspot animation system**: CSS glimmer/pulse animations driven by `visual.animation` in schema. Applied to key Harvest objects.
- **Response shorthand**: Interactions can use `response` string instead of `then` effects array for simple messages.
- **Navigation routing corrected**: Corridor is primary hub (5 exits including gated vent), Feeding Station is secondary hub (3 exits: morgue, archive, corridor). Vent shaft entrance moved from Feeding Station to Corridor — gated by `security_locks_overridden`. Processing Lab and Security Hub are dead ends.
- **Animation suppression**: `set_animation` effect clears glimmer/pulse on completed objects so they stop drawing attention after the player has collected items or gained knowledge from them.
- **Closeup overlay system**: `show_closeup` effect displays a framed detail image in a dismissable overlay. Images stored in scenario `closeups/` subfolder. Used by: cataloguer robot in Stasis Hold shows 3-tank specimen closeup.
- **Hotspot positioning guide**: Comprehensive documentation across ADVENTURE_BUILDER.md, TECHNICAL_DEEP_DIVE.md, SCENARIO_SCHEMA.md, and CLAUDE.md covering image-to-coordinate conversion formulas, worked examples, debug mode workflow, common mistakes, and an AI agent checklist. Self-maintenance rule #9 requires verifying positions against actual background image dimensions.
- **Progressive hint system**: Per-view `hints` array on each view in the scenario JSON. Engine evaluates conditions in order and returns the last matching hint (most specific). Floating "?" button at bottom-right of viewport shows hints as message overlay. Implemented in ScenarioEngine.getHint(), ScenarioPlayer, and documented in SCENARIO_SCHEMA.md and ADVENTURE_BUILDER.md.
- **Scenario picker restored**: App.tsx shows ScenarioLoader on startup — all scenarios with JSON files are auto-discovered from `scenarios/manifest.json`. Players can also upload a custom JSON file. No hardcoded scenario ID.
- **Immersive HUD**: Messages overlay on the game viewport (semi-transparent backdrop) instead of a dedicated panel below. Inventory is a collapsible drawer with "Items" toggle tab at bottom-left. Hint "?" button floats at bottom-right. Ambient text shows subtly when idle. Inventory auto-opens on item pickup. No UI elements below the viewport — full immersion.
- **Starting puzzle fix**: Stasis pod starts open (matches background art). Player scavenges wreckage instead of "breaking out." specimen_tag_hook now visible from start.
- **Character sprite system**: Sierra-style sprite sheet rendering on top of backgrounds. `CharacterSprite` component uses CSS background-position to show frames from sprite sheets. Supports animated walk cycles and static poses. Per-view character placement in scenario JSON. Dynamic state changes via `set_character` effect. Sprite sheets go in scenario `sprites/` subfolder. Splicing tool at `tools/splice-sprites.mjs`. The Harvest has character placements for all 14 Act 1 views (9 main rooms + 5 vent maze rooms; closeup sub-views intentionally have no character).
- **Dialogue choice system**: `show_dialogue` effect pauses gameplay and shows a branching conversation modal (`DialogueOverlay` component). Each choice has a label, optional `when` conditions (hidden if not met), and `then` effects array. Engine methods: `getDialogue()`, `selectDialogueChoice(index)`, `dismissDialogue()`. First use: caged prisoner in feeding station with 4 branching choices that set different `prisoner_bond` values affecting all subsequent interactions. Documented in SCENARIO_SCHEMA.md.
- **Object sprite system**: `SpriteObject` component renders animated sprite sheets on world objects. Defined via `sprite` field in object JSON: `{ file, frame_width, frame_height, columns, rows, frame_rate, scale }`. Uses CSS background-position with requestAnimationFrame. Bottom-center anchored at z-index 4. First uses: caged_prisoner (pacing animation), holographic_display (spinning planets).
- **Room name labels**: Bottom-right of viewport shows the current view's `name` field subtly in gold. Bottom at 26px to avoid overlapping the hint "?" button.
- **Back navigation button**: Views with `back_label` show a "Back to X" button at top-left. Only on closeup-style sub-views, not on main rooms.
- **Act 1 fully solvable**: 14 rooms navigable (9 main + 1 cataloguer closeup + 1 security closeup + 3 vent maze rooms accessible without items), 15 collectible/craftable items (12 original + restraint strap, carcass hook, grappling line) (including 2 optional: crew_datapad and choir_access_chip in vent dead end), all key flags settable, all 4 dialogue branches functional, 3 lethal hazards with fair warnings. Walkthrough at `scenarios/the-harvest/walkthrough.md` with ASCII deck map, critical path table, and room-by-room guide.
- **Item compendium**: Published artifact (https://claude.ai/artifact/9Zw5Tx8D9GitG6uGVvZ9Tt) ranking all 18 Act 1 items by importance, with where to find each, every use (with in-game text), combinations, what uses it up, the rooms that check for it, later-act uses, and three flagged cross-act consumption risks (tendril, stasis fluid, nutrient paste). Built from data extracted from scenario.json; regenerate it when items or their uses change.
- **Interactive scenario map**: Published artifact at claude.ai showing Act 1 room graph, item locations, puzzle chains, and 30-step walkthrough. Keep this updated when rooms, items, or puzzles change. Data extracted from scenario JSON.
- **Cataloguer robot closeup**: Spider-legged drone in Stasis Hold with static sprite (frame_rate=0). Looking or touching navigates to `act1_cataloguer_closeup` sub-view — a full interactive view using the specimen image as background with `back_label: "Stasis Hold"`. Five interactive objects (3 specimen tanks, data plates, cataloguer mechanism) with look/hand/talk responses. The specimen displays show the four-glyph section code (fern, double curl, sprouting snake, thorny branch); LOOK/HAND the robot or plates sets `lab_code_known`. Sub-views support all 4 verbs, unlike the old `show_closeup` overlay which was hand-only. Character override only applies when the current view has a `character` placement — views without one (like closeup sub-views) show no character sprite.
- **Engine bug fixes**: `evaluateConditions()` now handles undefined/missing `when` arrays gracefully. `flag_is`/`flag_not` conditions without explicit `value` default to checking against `"true"` (previously compared against `undefined`, breaking conditions like `flag_not security_sequence_known`).
- **Vent cover in corridor**: Ventilation shaft entrance moved from Feeding Station to Containment Corridor. A `vent_cover` object with a sprite grate graphic (`sprites/vent_cover.png`) is always visible in the corridor floor (bottom-left) but gated by `security_locks_overridden` — trying to enter before overriding security shows a locked message.
- **Vent maze hazards and rewards** (routing superseded by "Vent maze v2" below): Gas Chamber (☠ needs helmet) → Fan Chamber (☠ jam with surgical probe, which is consumed) → Exit Passage → Airlock Bay. The Collapsed Section holds a Choir skeleton with crew_datapad (lore) and a hidden choir_access_chip. The emergency helmet comes from the Security Hub emergency cabinet. 3 game_over deaths (gas without helmet ×2, fan blades). All five special rooms have painted backgrounds.
- **Choir Access Chip**: Hidden optional item on the dead Choir engineer in the vent maze collapsed section. Found by HANDing the skeleton a second time after taking the crew_datapad. In Act 2, the Shuttle Bay entrance from Engineering has a bio-resonance security lock. With the chip: instant silent bypass. Without: a 3-option dialogue challenge where only 1 frequency is correct — wrong guesses add +15 noise each. Rewards thorough maze exploration with a significant Act 2 convenience.
- **Standup intro animation**: When the game starts and the intro text is dismissed, the goblin plays an 8-frame stand-up animation (`sprites/goblin_standup.png`) during the fade-from-black transition, then transitions to the idle sprite. Implemented via `loop: false` on SpriteSet (plays once, holds last frame) and ScenarioPlayer managing the standup→idle character override. CharacterSprite resets frame counter when sprite_set changes.
- **Portability audit complete**: All scenario-specific hardcoding removed from engine and components. Zero references to "the-harvest" or any scenario-specific assets in `client/src/`. Changes: (1) App.tsx restored ScenarioLoader instead of hardcoded CAMPAIGN_ID, (2) ScenarioPlayer.tsx sound effects now read from `setting.sounds` in JSON instead of hardcoded paths, (3) AmbientCanvas.tsx rewritten to read `ambient_lighting` from view JSON instead of hardcoded presets, (4) ScenarioLoader.tsx reads from `scenarios/manifest.json` for auto-discovery, (5) All asset URL construction centralized through `resolveAsset()` utility. A third-party scenario needs only JSON + asset folders — no engine changes.
- **Centralized asset resolver**: `client/src/engine/assetResolver.ts` exports `resolveAsset(scenarioId, relativePath)` and `setAssetBase(url)`. All 8 components that load scenario assets (backgrounds, sprites, sounds, icons, closeups) route through this single function. Default behavior serves from `/scenarios/{id}/`, but `setAssetBase()` can redirect all asset loading to a different origin (CDN, blob URL from zip extraction, etc.) — one line change to support any deployment model.
- **JSON-driven sound effects**: `setting.sounds` object in scenario JSON with optional `room_transition`, `item_pickup`, and `intro_voice` paths. Engine plays these on the corresponding events. Scenarios without sounds simply don't play any — no errors.
- **JSON-driven ambient lighting**: Per-view `ambient_lighting` object with `lights` array and optional `flicker` flag. Each light has `x`, `y` (0-1 normalized), `radius`, `color` [r,g,b], `pulse_speed`, `pulse_amount`, `alpha`, and optional `phase`. Views without `ambient_lighting` show no canvas overlay. Moved from hardcoded AmbientCanvas.tsx presets into The Harvest's scenario.json.
- **Scenario manifest**: `scenarios/manifest.json` lists all available scenario folder names. ScenarioLoader reads this on startup to populate the picker. Adding a new scenario = add folder with scenario.json + add ID to manifest.json.
- **MVP menu restriction**: Manifest currently includes only `the-harvest`. ScenarioLoader auto-launches when a single scenario is available — no picker screen. Upload button preserved for custom JSONs. Other scenario folders remain on disk for future re-introduction.
- **New player character sprites**: Replaced goblin with bearded human in green tunic. Sprite sheets: `character_idle.png` and `character_idle_helmet.png` (12×2, right+front, a subtle 2fps idle loop with breathing and a glance at the camera, built by `scenarios/the-harvest/scripts/build_player_idle.py`; see ART_GUIDE "Idle animations for the player character"), `character_walk.png`/`character_walk_helmet.png` (right walk+front walk at 6fps), `character_standup.png` (lying→standing at 3fps, no loop). Frame size 300×410, scale 0.35. Left-facing via CSS scaleX(-1) flip. Old goblin sprites removed.
- **Voiceover narration tool**: `tools/generate-voiceover.mjs` extracts all player-facing text from a scenario JSON (intro, ambient, messages, dialogue, game over, hints) and batch-generates MP3 files via the ElevenLabs TTS API. Supports `--dry-run` to preview without API calls, `--filter <category>` to generate only specific types, `--force` to regenerate existing files, and `--list-voices` to browse available voices. Saves to `scenarios/<id>/audio/voice/` with a manifest.json. Requires `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` environment variables. The Harvest has 1,489 text entries (~193K characters). Free tier gives 10K chars/month — prioritize intro narration first (`--filter intro`, 706 chars).
- **Scenario-builder skill**: `.claude/skills/scenario-builder/SKILL.md` — comprehensive AI agent onboarding guide (1100+ lines) covering package structure, background image generation (Gemini prompt formula), sprite creation (blue chroma-key workflow), full JSON authoring, coordinate system, ambient lighting, a 3-room template, and pre-flight checklist.
- **In-game DevPanel**: `DevPanel.tsx` — 5-tab developer tools panel activated via `?dev` URL parameter. Tabs: Views (jump to any view), Objects (position/size/visibility), Character (live animated sprite preview with facing/sprite_set controls), Sprites (browse all sprite sheets with animation), Export (paste-to-Claude format + JSON patch). Auto-enables debug mode and skips intro. Layout shifts to 960px game + 340px panel side-by-side.
- **Standalone Visual Editor**: `client/public/editor.html` — full visual editor for scenario authors. Shows actual animated sprites (character + object sprites) on backgrounds, hotspot boxes with drag/resize, character controls panel (sprite set, facing, animation play/pause), toggleable hotspot/sprite overlays, coordinate display, and 3-tab export (human-readable changes, JSON patch, full view JSON). Unified sprite box (single interactive element for sprite objects instead of separate hotspot + visual boxes). Shadow controls per sprite per view: tight-range sliders (offset ±10, skew ±30, width 10–150, height 2–40, opacity in 0.05 steps; the range widens automatically for existing values outside it) with −/+ nudge buttons. Dragging updates only the viewport and value label (`keepPanel` guard), so the slider is never rebuilt under the cursor. Accessible at `/editor.html` when dev server is running.
- **Sprite shadow system**: All sprites (character and object) support JSON-configurable shadows via `shadow` property. Object shadows go on the object definition alongside `sprite`. Character shadows set globally on `character` config and optionally overridden per-view in character placement. Shadow properties: `offset_x`, `offset_y`, `width`, `height`, `opacity`, `color`. Visual editor provides real-time shadow sliders. Implemented in `SpriteObject.tsx` and `CharacterSprite.tsx`.
- **Security console closeup**: `act1_security_closeup` sub-view with 3 objects: the red Emergency Override button (two objects, `sec_closeup_override_button_dark` until the lab terminal's `on_solve` swaps in the lit `sec_closeup_override_button` via `hide_object`/`show_object`; pressing the lit one sets `security_locks_overridden`, opening the corridor vent), surveillance feeds (Curator patrol), and the status display. `back_label: "Security Hub"`. The containment key card comes from the `key_card_drawer` on the Security Hub wall, not the close-up.
- **Item use overhaul (Act 1)**: 7 new use_item interactions give previously unused items purpose: glass shard + organic growth (reveals scratched message from previous prisoner), stasis fluid vial + reading device (enhances reader), specimen tag + reader (reveals species classification), nutrient paste + prisoner (feeds prisoner, strengthens bond), neural tendril + holographic display (reveals Convergence heading to Earth), cat hair + examination tables (DNA analysis reveals cat was processed), surgical probe + keypad/lever (flavor interactions with noise; since removed with the old security keypad and lever). Fixed missing `has_item` conditions on reading_device and airlock_override_panel.
- **Hitbox fixes**: corridor_pipes width 965→960, personal_log_crystal 20x53→50x70, broken_pod repositioned to (160,560) with size 150x100.
- **Grappling-line gap puzzle (soft-lock fix)**: The Stasis Hold walkway gap guards the cataloguer robot (four-glyph code → security keypad or lab terminal → vent). Its only solution used to be the neural tendril, which the holographic display consumes — visiting the Archive first soft-locked Act 1. Now: USE surgical probe ON restraint straps (Processing Lab; probe kept, shard fails with a hint) → Restraint Strap; HAND the carcass hook in the morgue's open drawer (`morgue_carcass_hook`) → Carcass Hook; COMBINE → Grappling Line (`consumes: true`, Act 1's first combination); USE line ON `platform_gap` → `gap_crossed`, line consumed, hidden `gap_grappling_line` object shown (procedural strap sprite drawn between the two painted railing stubs). Specific rejections for strap-only, hook-only, probe, tendril, shard; HAND still kills. Stasis/lab/morgue hints teach combining. New art: `items/restraint_strap.png`, `items/carcass_hook.png`, `items/grappling_line.png`, `sprites/carcass_hook.png`, `sprites/grappling_line_rigged.png`.
- **Duplicate-key cleanup**: `black_cat` and `emergency_cabinet` had two `shadow` blocks each (older value silently winning over the latest editor export). Removed the stale ones; scenario.json is now canonical `json.dumps(indent=2)` format, so scripted edits produce minimal diffs.
- **Act 1 was unwinnable — fixed**: (1) `fan_mechanism`'s `use_item` interactions had no `item` field since the vent maze was added, so the surgical probe could never jam the fan (walking into it was the only option: death). Now `item: "surgical_probe"`, plus the "won't fit" rejection is attached to the other plausible items. (2) The security-closeup key-card drawer sprite was anchored at y=-23 (off the top of the screen) by an editor export, making the only key card unobtainable; re-anchored beneath the console at (690,700). (3) Five vent-maze ambient lights lacked `pulse_speed`/`pulse_amount`, crashing the lighting canvas with NaN. All found by the new validator / soft-lock search.
- **One security route (simplified)**: the old security keypad, startup-sequence flag, membrane lever and close-up drawer were removed. They duplicated the lab terminal route, and the "five-step startup sequence" was never entered anywhere (one LOOK set a flag). Chain now: gap → glyph code → lab terminal keypad (arms the override) → Security Hub close-up → press the override → corridor vent. Soft-lock search: 27,371 states, 0 soft-locked, shortest win 27 actions.
- **How the vent views were made**: every vent background (5 special rooms + 3 generic frames) worked on the first Gemini attempt and fitted existing hotspots with small nudges. The full recipe is documented in `docs/ART_GUIDE.md` → "Case Study: The Vent Maze" (reference-image anchoring, hotspot-to-fraction composition, hero-frame edits, mirroring, shared hotspot geometry, data-driven build) and summarised in rule 14. Showcase image: `docs/images/vent-maze-rooms.webp`. Tools added: `tools/preview-hotspots.mjs`; `scenarios/the-harvest/scripts/build_vent_maze.py` (idempotent).
- **Vent maze v2 (implemented)**: KQ-style labyrinth replacing the single fork. Fixed compass (camera always faces north; left=W, right=E, bottom edge=S). 13 generic "Air Ducts" cells (`act1_vent_maze_a`…`n`) on 5 reusable frames: LF/LT/DE generated as Gemini edits of the junction art, RF/RT as horizontal mirrors. The five painted special rooms (junction, gas chamber, fan chamber, collapsed section, exit passage) are landmarks inside the grid. The `ventilation_map` is the way through: LOOKing at it shows `closeups/vent_map.webp`, drawn from the grid by `scenarios/the-harvest/scripts/draw_vent_map.py`. Per-cell hints point along the map once you have it. Route: junction → W → N×4 → gas → fan → exit. It includes a loop, a dead end, and a long east arm to the optional skeleton room. Soft-lock search: 0 soft-locks. Design and conventions: `scenarios/the-harvest/vent-maze-design.md`.
- **Hint-order bug fixed**: five vent rooms had an always-true hint *after* their specific hints, and since `getHint()` returns the last match, the specific ones never showed (e.g. the fan room's "jam the mechanism"). Unconditional hints now come first everywhere, and the validator warns on this pattern.
- **Glyph keypad (puzzle widget #1)**: The lab terminal keypad is a real puzzle. HAND opens a `keypad` overlay widget with 8 alien-glyph keys. The code is the four characters painted on the specimen displays in the cataloguer close-up (fern, double curl, sprouting snake, thorny branch), which are only reachable across the Stasis Hold gap. The solution glyphs are traced from that painting by `scenarios/the-harvest/scripts/extract_glyphs.py`, which renders 4 procedural decoys identically, so no key gives itself away. Wrong entries add noise and show cycling in-widget feedback that hints toward "somewhere the characters are written in order". `max_attempts` (6) triggers a loud alarm but never locks. Brute force is possible (4,096 codes) but miserable, so the gap is a knowledge gate. The code unlocks the terminal, which arms the security console's Emergency Override (the only route to the vent). The old dead `lab_access_keypad` widget was removed. Soft-lock search (widget-aware): 143,587 states, 0 soft-locks.
- **Scenario tooling**: `tools/validate-scenario.mjs` (referential/schema lint) and `tools/softlock-search.mjs` (exhaustive search over the real engine, cone-of-influence reduced). Both documented in Key Commands.
- **Art guide**: `docs/ART_GUIDE.md` — two-style rule (painted backgrounds, pixel-art sprites), prompt template + the exact prompts that shipped, chroma pipeline (now with despill), sizing table measured from Act 1, anchoring rules, icon canvas spec, procedural composite sprites, Playwright verification recipe.
- **Sprite stubs**: 1 object has sprite config stub awaiting art: vent_maintenance_hatch. Previously 10 — now resolved: instrument_rack, corridor_emergency_panel, corridor_drag_marks, corridor_organic_growth, neural_tendril_sample, vent_old_remains, nutrient_dispenser all have chroma-keyed art; specimen_tag_hook and personal_log_crystal have procedural placeholder sprites (4-frame animated, generated via node-canvas). Both collectibles now hide on pickup via `hide_object` effect.

---

## Key Commands

```bash
# Frontend dev server
cd client && npm run dev    # http://localhost:5173

# Scenario JSONs served at
# /scenarios/the-lighthouse-keeper/scenario.json  (via Vite plugin in vite.config.ts)

# Backend (not needed for POC)
cd server && mvn spring-boot:run

# Type check
cd client && npx tsc --noEmit
```

### Validate a scenario (run before every commit that touches scenario.json)
```bash
node tools/validate-scenario.mjs scenarios/the-harvest/scenario.json --views act1
```
Errors: duplicate JSON keys, `use_item` without `item`, object IDs used as item IDs, unknown item/object/view references, ambient lights missing numeric fields, missing asset files. Warnings: off-canvas hotspots/sprite anchors (an off-screen pickup is an invisible soft-lock), items required but never granted, flags read but never set, unconditional hints placed after conditional ones (they mask them).

### Preview a background against its hotspots
```bash
# Installed background:
node tools/preview-hotspots.mjs scenarios/the-harvest/scenario.json act1_vent_junction --out /tmp/junction.png
# Raw Gemini output, before installing it:
node tools/preview-hotspots.mjs scenarios/the-harvest/scenario.json act1_vent_junction --image ~/Downloads/new.webp
```
Draws every hotspot (gold = object, blue = nav), each sprite's bottom-center anchor and rendered box (green, dashed if hidden), and the character footprint (red).

### Rebuild the vent maze after changing its grid
```bash
python3 scenarios/the-harvest/scripts/build_vent_maze.py scenarios/the-harvest/scenario.json   # idempotent
cd scenarios/the-harvest && python3 scripts/draw_vent_map.py closeups/vent_map.webp            # needs Pillow + NumPy
```

### Soft-lock analysis
```bash
# Exhaustive state-space search with the real engine (cone-of-influence reduced).
# Reports soft-locked states, the action that doomed them, the shortest win, and reachable deaths.
node --max-old-space-size=6000 tools/softlock-search.mjs scenarios/the-harvest/scenario.json \
  --views act1 --goal "state:airlock_override_panel!=locked"
```
Run it after any change that adds `remove_item`, `consumes: true`, irreversible `set_state`/`hide_object`, gated navigation, or dialogue choices.

---

## Implementation Priority

1. ~~Implement `all_of` condition~~ DONE
2. ~~Implement `set_noise` effect, `noise_above` condition~~ DONE
3. ~~Fix coordinate scaling~~ DONE (960x720 space)
4. Add game clock + events system
5. Implement puzzle widget UI components
6. Implement killer AI state machine
7. ~~Fix The Harvest position data~~ DONE (all Act 1 objects within 960x720 bounds, nav z-index fix)
8. Get Lighthouse Keeper fully playable end-to-end
9. ~~Character shadow rendering~~ DONE — all sprites (character + object) support JSON-configurable shadows with offset, opacity, size. Character shadows overridable per-view. Visual editor has shadow sliders.
10. Process and integrate cataloguer robot animated sprite (4-frame animation)
11. Voiceover narration — ElevenLabs TTS integration (script built, awaiting API key)
