# Adventure Engine — CLAUDE.md

> **ALWAYS keep this file current.** After every structural change, new scenario, architecture decision, tech stack update, or design decision — update this file AND README.md. A new agent should be able to read this and contribute immediately. If you are an AI agent contributing to this project, you MUST update this file when your work changes anything documented here.

---

## What This Project Is

A **JSON-driven point-and-click adventure game engine** — "no-code adventure game builder." Authors write a single JSON file describing views, objects, items, puzzles, and an optional AI antagonist. The engine renders it as a playable Sierra-style adventure game (King's Quest V/VI aesthetic) in the browser.

**The pitch**: Drop a JSON file + background art into a folder, get a fully playable point-and-click adventure. No code required. The JSON format is the product.

---

## North Star (the mission — never lose sight of this)

This is becoming a **development platform for point-and-click adventures**, distributed through **Steam with deep Steam Workshop integration**:

1. **A scenario is a package**: one `scenario.json` plus a folder (or zip/tar) of images and audio. Nothing else. No code, ever, for a new scenario.
2. **Agent-generatable from scratch**: the docs must be complete enough that an AI agent handed a single file from this repo plus a human's theme prompt ("a haunted lighthouse in 1890s Maine") can produce an entire playable, soft-lock-free scenario on its own: story, rooms, puzzles, JSON, art prompts, audio prompts. Image and audio generation use third-party tools; everything else is the agent.
3. **Steam Workshop**: players browse, subscribe to and play community scenario packages; authors publish them.

Every change should move toward this: schema-driven features (rule 8), documentation an agent can follow cold, validation tools as the quality gate (`validate-scenario.mjs`, `softlock-search.mjs`), and a package format the engine can load from anywhere (`resolveAsset()`/`setAssetBase()`).

---

## Repository Layout

```
/
├── CLAUDE.md                          ← YOU ARE HERE — project bible for AI agents
├── README.md                          ← Public-facing documentation (KEEP IN SYNC)
├── client/                            ← React + TypeScript frontend (Vite 6)
│   ├── src/
│   │   ├── engine/                    ← ScenarioEngine — pure TS state machine
│   │   │   ├── types.ts              ← TypeScript types matching SCENARIO_SCHEMA.md
│   │   │   ├── ScenarioEngine.ts     ← Core: load JSON, manage state, resolve interactions
│   │   │   ├── walkable.ts           ← Click-to-walk geometry: floor tests, exact shortest paths (+ walkable.test.ts)
│   │   │   ├── ScenarioEngine.walk.test.ts ← Engine walking tests (npm test); .patrol.test.ts: game clock + patrols; .vents.test.ts: meters, cycles, checkpoints, pursuers, sensing, rhythm; .v6route.test.ts: plays the v6 maze; .cutscene.test.ts: cutscenes, message styles, the prologue
│   │   │   └── assetResolver.ts      ← Centralized asset URL construction (portability layer)
│   │   ├── components/               ← React UI components
│   │   │   ├── ScenarioPlayer.tsx    ← Main game orchestrator (verb cycling, inventory tray, messages, overlays, HUD meters and action buttons, Restart from checkpoint)
│   │   │   ├── ScenarioLoader.tsx    ← Title screen: full-screen cover painting (metadata.cover), Play, more adventures, Steam Workshop (coming soon), load your own JSON
│   │   │   ├── GameView.tsx          ← Renders background + object hotspots + animations + verb cursors
│   │   │   ├── CharacterSprite.tsx   ← Sierra-style sprite sheet character renderer
│   │   │   ├── SpriteObject.tsx      ← Animated sprite sheets on world objects
│   │   │   ├── TetherLine.tsx        ← Safety tether line (character placement / sprite `tether`)
│   │   │   ├── AmbientCanvas.tsx     ← Canvas ambient lighting (view.ambient_lighting)
│   │   │   ├── InventoryPanel.tsx    ← Item display and selection
│   │   │   ├── ItemIcon.tsx          ← Built-in SVG item icons (item.icon)
│   │   │   ├── CloseupOverlay.tsx    ← show_closeup image overlay
│   │   │   ├── DialogueOverlay.tsx   ← show_dialogue choice modal
│   │   │   ├── KeypadWidget.tsx      ← Keypad puzzle widget overlay (open_widget)
│   │   │   ├── RhythmWidget.tsx      ← Rhythm widget overlay: call and response in long/short presses (the Audience)
│   │   │   ├── TutorialCoach.tsx     ← First-play tips (setting.tutorial), skippable, remembered
│   │   │   ├── IntroCinematic.tsx    ← Animated intro cinematic (setting.intro_scenes; timing in engine/introTimeline.ts)
│   │   │   ├── IntroSequence.tsx     ← Paged setting.intro_text (when there is no cinematic)
│   │   │   ├── EyeOpenTransition.tsx ← Fade-from-black at game start (with the standup sprite set)
│   │   │   ├── NoiseIndicator.tsx    ← Noise level meter
│   │   │   ├── DevPanel.tsx          ← In-game developer tools panel (?dev URL param)
│   │   │   └── VerbBar.tsx, MessagePanel.tsx ← Legacy, no longer rendered (right-click cycles verbs; ScenarioPlayer draws messages)
│   │   ├── App.tsx                   ← Entry: ScenarioLoader → ScenarioPlayer
│   │   ├── fullscreen.ts             ← Browser full screen (Play enters it; ☰ menu and the F key toggle it)
│   │   ├── audioBus.ts               ← Tracks every sound the game starts; stopAllAudio() for Main menu / Restart
│   │   └── App.css                   ← Dark theme base styles
│   ├── public/
│   │   ├── scenarios → ../../scenarios  ← Symlink so Vite serves scenario content
│   │   └── editor.html               ← Standalone visual editor (sprite preview, hotspot drawing, Floor tab with player preview + save)
│   ├── package.json                  ← React 19, Vite 6, TypeScript 5.7
│   └── vite.config.ts
├── server/                            ← Spring Boot 3 backend (Java 21, Maven)
│   └── src/main/java/com/kq/        ← Future: validation, tooling, save sync
├── scenarios/                         ← ALL scenario content (self-contained folders)
│   ├── manifest.json                 ← List of available scenario IDs for auto-discovery
│   ├── the-lighthouse-keeper/        ← Each scenario is a folder containing:
│   │   ├── scenario.json             ←   The scenario definition
│   │   ├── design.md                 ←   Design doc (story, image prompts, patterns)
│   │   └── backgrounds/              ←   Background images (optional; only the-harvest and the-clockmakers-secret have any yet)
│   ├── the-harvest/                  ← Flagship: 5 acts; Act 1 has 199 views (180 of them the v6 vent maze); 7 designed endings
│   │   ├── scenario.json
│   │   ├── design.md
│   │   ├── deep-design.md
│   │   ├── act1-level-design.md      ←   Act 1 navigation map, room tables, puzzle flow
│   │   ├── vent-maze-design.md       ←   Vent maze v2 grid, conventions, art plan
│   │   ├── walkthrough.md            ←   Act 1 walkthrough (screenshots, deck map, maze route in walkthrough/)
│   │   ├── walkthrough/              ←   Generated walkthrough images (scripts/build_walkthrough_images.py)
│   │   ├── intro/                    ←   Intro cinematic: backgrounds/, sprites/ (raw/ = Gemini frames), audio/ (v2/ = the new opening's voices and effects), reference/ (player frames for prompts)
│   │   ├── audio/                    ←   Ambient audio tracks and sound effects
│   │   ├── backgrounds/              ←   21 Act 1 backgrounds (19 in use: 9 rooms, 5 vent landmarks, 5 maze frames)
│   │   ├── closeups/                 ←   Detail images for show_closeup effect (incl. procedural vent_map.webp)
│   │   ├── scripts/                  ←   Scenario build scripts: build_intro_v2.py (the playable opening), build_vent_maze_v6.py + vent_story_v6.py (the v6 maze; v3's build_vent_maze.py is retired), augment_vent_maze_v6.py, build_vent_sprites_v6.py, make_vent_audio_v6.py, draw_player_map_v6.py, draw_vent_map.py, draw_rigged_line.py, extract_glyphs.py, build_player_idle.py, build_helmet_sheets.py, compose_security_closeup.py, build_walkthrough_images.py, make_placeholder_assets.py; playthrough/ (Playwright harness)
│   │   ├── items/                    ←   Inventory icons (icon_file)
│   │   ├── ui/                       ←   Widget art (keypad glyph keys)
│   │   └── sprites/                  ←   Character and object sprite sheets
│   └── ... (15 scenarios total, 13 with JSONs, 2 design-only)
├── docs/
│   ├── SCENARIO_SCHEMA.md            ← THE schema spec (1700+ lines) — full JSON reference
│   ├── ARCHITECTURE.md               ← Engine internals (diagrams, data flow)
│   ├── HOTSPOT_POSITIONING_GUIDE.md  ← Image-pixel → 960x720 hotspot conversion, worked examples
│   ├── SPATIAL_MOVEMENT_DESIGN.md    ← Deferred post-MVP spatial system design
│   ├── ART_GUIDE.md                  ← HOW TO MAKE ART: prompts, chroma-key, sizing, placement, verification
│   └── images/                       ← Screenshots for README
├── tools/
│   ├── splice-sprites.mjs            ← Node.js sprite sheet splicing utility
│   ├── process-chromakey-sprite.mjs  ← Blue-screen key + edge despill + trim for generated sprites
│   ├── validate-scenario.mjs         ← Referential/schema lint for scenario.json (run before committing)
│   ├── softlock-search.mjs           ← Exhaustive state-space soft-lock search using the real engine
│   ├── preview-hotspots.mjs          ← Render a view (or a raw new image) at 960×540 with hotspots/sprites/character/floor drawn on (--grid, --floor, --ghosts, --clean)
│   ├── arrival-spots.mjs             ← Fill set_view "at" for every door into a walking view (he arrives by the exit that leads back)
│   ├── generate-voiceover.mjs        ← ElevenLabs TTS batch generator for scenario narration
│   └── generate-intro-speech.mjs     ← ElevenLabs TTS for unvoiced intro_scenes lines (run locally; writes clips + voice paths)
├── .claude/skills/scenario-builder/SKILL.md ← AI agent guide to building a scenario package
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
16. **Floors are open floor only** — the player is always drawn over the background, so a `walk_area` that reaches behind a table, pipe, pod or hatch lip makes him look like he is standing on it. Trace only open painted floor with room for his whole body, keep edges about 14 screen px inside the painted floor (more along walls), leave exits off the floor, and check every floor with `node tools/preview-hotspots.mjs scenario.json <view> --clean --ghosts` (his sprite at sample spots; every figure must stand on the floor). Full rule: SCENARIO_SCHEMA → Walkable Areas.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 19 + TypeScript 5.7 + Vite 6 | POC uses React DOM rendering; a canvas only for ambient lighting |
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
There are no verb buttons: right-clicking the viewport cycles look → move → hand → talk (default look), and each verb has its own SVG cursor.

| Verb | What It Does |
|------|-------------|
| `look` | Examine visually. Always safe. Fallback shows object description. |
| `move` | Navigate between rooms. Used on nav hotspots (doorways, passages, exits). |
| `hand` | Touch, push, pull, open, close, take. All physical manipulation including picking up items. |
| `talk` | Speak, listen, read aloud. |

**Using inventory items**: Select an item from the inventory panel (click it), then click a world object. The engine calls `use_item` internally. No "use" verb button — it's implicit via inventory selection.

The engine falls back from `hand` to `take` for backwards compatibility with older scenario JSONs. Every click produces KQ5-style feedback, even when nothing happens ("You can't do anything useful with X right now.").

### Condition Types (17 + composites)
`flag_is`, `flag_not`, `object_state`, `has_item`, `not_has_item`, `view_is`, `not_in_view`, `noise_above`, `noise_below` (field `threshold`), `phase_is`, `time_after`, `time_before`, `item_count` (field `count`), `is_hiding`, `not_hiding`, `killer_is`, `widget_solved` + composites: `any_of`, `all_of`. `patrol_near` (field `patrol`) is true while a patrol is about to come into, or is in, the player's room. Vents v6 added `meter_below`/`meter_above` (`meter`, `threshold`), `cycle_is` (`cycle`, `phase`), `patrol_active` (a patrol mid-sweep anywhere), `pursuer_near` (`pursuer`, `threshold`) and `checkpoint_is`. `time_after`/`time_before` are not implemented (unknown types evaluate true) and `killer_is` is a stub (false).

### Effect Types (25+)
`message`, `random_message`, `set_flag`, `set_state`, `add_item`, `remove_item`, `set_view`, `open_widget`, `add_noise`, `set_noise`, `show_object`, `hide_object`, `set_animation`, `show_closeup`, `show_dialogue`, `game_over`, `advance_phase`, `start_hiding`, `stop_hiding`, `transform_item`, `trigger_event`, `visual_cue`, `play_sound`, `delay_then`, `conditional_effect`, `set_character`, `equip_item`, `unequip_item` (wearable item overlays; implemented but unused by any scenario), and from the vents: `meter_add`, `meter_set`, `meter_transfer`, `set_checkpoint`, `clear_checkpoint`, `pursuer_divert`, `pursuer_reset`, `sense`; `show_closeup` takes `layers`; and `play_cutscene` (a named `setting.cutscenes` cinematic mid-game; `wake: true` ends a prologue). `message` takes `style: "radio"|"comms"` (radio / helmet-mic voice filters)

### Other Systems
- **Items**: Inventory objects with examine interactions
- **Combinations**: Craft two items into a new one
- **Flags**: String key/value pairs tracking game progress
- **Phases**: Game stages with different killer behavior / world state
- **Killer**: Optional AI antagonist with patrol timers, noise thresholds, personality
- **Puzzle Widgets**: Special UI for specific puzzles. Implemented: `keypad` as an **overlay** opened by the `open_widget` effect (glyph or text keys, auto-submit, in-widget fail feedback, `on_solve`/`on_fail`/`max_attempts`+`on_max_fail` that never locks, `widget_solved` condition). Other types are specified but unrendered
- **Events**: Timer/condition-triggered narrative beats
- **Win/Lose Conditions**: Flag/state checks that end the game
- **Hints**: Progressive per-view help system (`view.hints`; the timed top-level `hints` array is not read by the engine)
- **Dialogue Choices**: Branching conversation system via `show_dialogue` effect
- **Character Sprites**: Sierra-style sprite sheet rendering on backgrounds
- **30 Design Patterns**: Documented reusable puzzle patterns
- **Sound Effects**: Optional `setting.sounds` with `room_transition`, `item_pickup`, `intro_voice`, `noise` and `combine` (a successful combination; defaults to `item_pickup`) paths; any other key (e.g. `discovery`) can be played with the `play_sound` effect
- **Game clock and patrols**: `setting.clock.show` puts seconds of play in the title bar; top-level `patrols` sweep a route of rooms every `period` seconds on that clock, warn the player 5 s before they come in, and catch anyone who isn't hiding (SCENARIO_SCHEMA → "Patrols and the game clock")
- **Ambient Lighting**: Optional per-view `ambient_lighting` with light sources for dynamic canvas glow effects
- **Vent systems (all general schema features, SCENARIO_SCHEMA → Meters … Rhythm widget)**: `meters` (HUD counters with a cost per move, warnings and `on_empty`: breath), `cycles` (rhythms on the game clock; sprites can follow them with `sync_cycle`, or pick a still frame with `frame_when`), checkpoints (`set_checkpoint`: the death screen offers "Restart from…", `no_undo`), `pursuers` (hunt from behind walls, one step per move, strike only at marked views after a hum), sensing patrols (`stops[].sense`: notice only a moving player close by, masked by a cycle, not in floor `shadows`), `walk_area.scale`/`speed` (a tiny figure crossing a vast place), `setting.actions` (HUD buttons: Listen, Squeeze sac), the `sense` effect (what is within N screens, with directions from views' `map_xy`), the `rhythm` widget, view `on_enter` effects, close-up map `layers`

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

Per-view placement: `"character": { "x": 480, "y": 550, "facing": "down", "sprite_set": "idle", "frame": 0 }` (x/y is the feet, bottom-center).

**Naming convention the player relies on**: if `sprite_sets` has a set named exactly `standup`, `ScenarioPlayer` plays it once during the intro fade-in, then switches the override to the set named `idle`. The Harvest's sets are `idle`, `walk`, `standup`, `idle_helmet`, `walk_helmet` (frame 300×410, scale 0.35).

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
| `not_in_view` | Yes | 0/13 |
| `killer_is` | Stub (returns false) | 8/13 |
| `widget_solved` | Yes | 0/13 (The Harvest's keypad uses an `on_solve` flag instead) |
| `patrol_near` | Yes | 1/13 (The Harvest: hiding spots answer to the hunter patrol and the vents' Wardens and surge) |
| `meter_below` / `meter_above` | Yes | 1/13 (The Harvest: the call-stone's uses) |
| `cycle_is` | Yes | 1/13 (The Harvest: breathing ducts, purge vents, the Warren's wind) |
| `patrol_active` | Yes | 1/13 (The Harvest: surge membranes) |
| `pursuer_near` | Yes | 1/13 (The Harvest: the Keth-Vari's shriek) |
| **`time_after`** | **NO** | **13/13** (events) |

### Effects — what's implemented vs. what scenarios use

All 25+ effect types have real implementations (`play_sound` queues a `setting.sounds` key or file path that `ScenarioPlayer` plays). Remaining no-ops:
- `trigger_event` — no-op (condition-triggered events run on their own; see below)
- `visual_cue` — no-op (cosmetic, fine for MVP)

### Major Unimplemented Systems

| System | Used By | Priority |
|--------|---------|----------|
| Events system | 13/13 | Condition triggers DONE (after every action, edge-triggered, `one_shot`); timed triggers need a game clock |
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
| The Harvest | `the-harvest/` | Yes | Yes + deep-design | 21 (Act 1) + 6 close-up images |
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
- **Ambient audio system**: Supports single or layered audio tracks per scenario, with per-view overrides (`[]` = silence). The Harvest's default is `audio/haunted.wav`; Act 1 views override it with lab ambience (`ambient_lab.mp3`), industrial ventilation (`ambient_industrial.wav`), or silence in the morgue.
- **Level design doc** at `scenarios/the-harvest/act1-level-design.md` with navigation map, room-by-room tables, puzzle flow, and Gemini background regeneration prompts.
- **All 13 scenario JSONs updated** with new verb mappings (nav: hand→move, take→hand).
- **Hotspot rendering** improved: nav objects get higher z-index; in debug mode nav objects are outlined red with a blue hover border and regular objects gold (hotspots are invisible in normal play); all hotspots positioned within 960x720 bounds
- **Lighthouse Keeper** is simplest (3 views) — first playtest target
- **Branch**: `claude/dreamy-volta-ha3r6v`
- **Architecture doc** at `docs/ARCHITECTURE.md` with SVG diagrams in `docs/images/`
- **Gameplay screenshots** in `docs/images/` referenced by README
- **Documentation suite**: README.md (ecosystem overview), ADVENTURE_BUILDER.md (third-party dev guide), TECHNICAL_DEEP_DIVE.md (engine internals), docs/SCENARIO_SCHEMA.md (JSON reference), docs/ARCHITECTURE.md (architecture diagrams)
- **Hotspot animation system**: CSS glimmer/pulse animations driven by `visual.animation` in schema. Applied to key Harvest objects.
- **Response shorthand**: Interactions can use `response` string instead of `then` effects array for simple messages.
- **Navigation routing corrected**: Corridor is primary hub (5 exits including gated vent), Feeding Station is secondary hub (3 exits: morgue, archive, corridor). Vent shaft entrance moved from Feeding Station to Corridor — gated by `security_locks_overridden`. Processing Lab and Security Hub are dead ends.
- **Animation suppression**: `set_animation` effect clears glimmer/pulse on completed objects so they stop drawing attention after the player has collected items or gained knowledge from them.
- **Closeup overlay system**: `show_closeup` effect displays a framed detail image in a dismissable overlay. Images stored in scenario `closeups/` subfolder. Used by: LOOK at the ventilation map (`closeups/vent_map.webp`). The cataloguer, lab terminal and security console close-ups are interactive sub-views instead (see below).
- **Hotspot positioning guide**: `docs/HOTSPOT_POSITIONING_GUIDE.md` plus sections in ADVENTURE_BUILDER.md, TECHNICAL_DEEP_DIVE.md, SCENARIO_SCHEMA.md, and CLAUDE.md covering image-to-coordinate conversion formulas, worked examples, debug mode workflow, common mistakes, and an AI agent checklist. Self-maintenance rule #9 requires verifying positions against actual background image dimensions.
- **Progressive hint system**: Per-view `hints` array on each view in the scenario JSON. Engine evaluates conditions in order and returns the last matching hint (most specific). Floating "?" button at bottom-right of viewport shows hints as message overlay. Implemented in ScenarioEngine.getHint(), ScenarioPlayer, and documented in SCENARIO_SCHEMA.md and ADVENTURE_BUILDER.md.
- **Scenario picker restored**: App.tsx shows ScenarioLoader on startup — all scenarios with JSON files are auto-discovered from `scenarios/manifest.json`. Players can also upload a custom JSON file. No hardcoded scenario ID.
- **HUD**: No verb buttons — right-click cycles look → move → hand → talk, with a per-verb SVG cursor (`VerbBar.tsx` and `MessagePanel.tsx` are no longer rendered). Below the viewport: a collapsible "Items" inventory tray (auto-opens on item pickup), then the message line (ambient text when idle). Hint "?" button floats at the viewport's bottom-right. (An earlier version overlaid messages on the viewport; inventory and messages moved back below it.)
- **Starting puzzle fix**: Stasis pod starts open (matches background art). Player scavenges wreckage instead of "breaking out." specimen_tag_hook now visible from start.
- **Character sprite system**: Sierra-style sprite sheet rendering on top of backgrounds. `CharacterSprite` component uses CSS background-position to show frames from sprite sheets. Supports animated walk cycles and static poses. Per-view character placement in scenario JSON. Dynamic state changes via `set_character` effect. Sprite sheets go in scenario `sprites/` subfolder. Splicing tool at `tools/splice-sprites.mjs`. The Harvest has character placements for 27 of the 30 Act 1 views (9 main rooms + 5 vent landmark rooms + 13 maze cells; the 3 closeup sub-views intentionally have no character).
- **Dialogue choice system**: `show_dialogue` effect pauses gameplay and shows a branching conversation modal (`DialogueOverlay` component). Each choice has a label, optional `when` conditions (hidden if not met), and `then` effects array. Engine methods: `getDialogue()`, `selectDialogueChoice(index)`, `dismissDialogue()`. First use: caged prisoner in feeding station with 4 branching choices that set different `prisoner_bond` values affecting all subsequent interactions. Documented in SCENARIO_SCHEMA.md.
- **Object sprite system**: `SpriteObject` component renders animated sprite sheets on world objects. Defined via `sprite` field in object JSON: `{ file, frame_width, frame_height, columns, rows, frame_rate, scale }`. Uses CSS background-position with requestAnimationFrame. Bottom-center anchored at z-index 4. First uses: caged_prisoner (pacing animation), holographic_display (spinning planets).
- **Room name labels**: Bottom-right of viewport shows the current view's `name` field subtly in gold. Bottom at 26px to avoid overlapping the hint "?" button.
- **Back navigation button**: Views with `back_label` show a "◀ {back_label}" button at top-left. Only on closeup-style sub-views, not on main rooms.
- **Act 1 fully solvable**: 30 views (9 main rooms + 3 close-up sub-views: cataloguer, lab terminal, security console + 18 vent maze screens: 5 landmark rooms and 13 duct cells), 16 items (15 collectible + the crafted grappling line; including 2 optional: crew_datapad and choir_access_chip in the collapsed section), all key flags settable, all 4 dialogue branches functional, lethal hazards with fair warnings. Walkthrough at `scenarios/the-harvest/walkthrough.md` with ASCII deck map, critical path table, and room-by-room guide.
- **Item compendium**: Published artifact (https://claude.ai/artifact/9Zw5Tx8D9GitG6uGVvZ9Tt) ranking all 18 Act 1 items by importance, with where to find each, every use (with in-game text), combinations, what uses it up, the rooms that check for it, later-act uses, and three flagged cross-act consumption risks (tendril, stasis fluid, nutrient paste). Built from data extracted from scenario.json; regenerate it when items or their uses change.
- **Act 1 walkthrough (current)**: `scenarios/the-harvest/walkthrough.md` with real screenshots, a deck map and the maze route (images in `walkthrough/`, built by `scripts/build_walkthrough_images.py` from screenshots captured by the Playwright harness in `scripts/playthrough/`, which plays the whole act in human order through real doors and logs every response). The old "Interactive scenario map" artifact is superseded by the published visual walkthrough artifact.
- **Playthrough fixes (Nov 2026)**: the corridor character stood on the vent cover (blocking clicks), the archive hologram hotspot was anchored off-screen, the junction character covered a hotspot, HAND now opens the lab terminal and security close-ups (not only LOOK), duplicated sentences fixed, Airlock Bay hints corrected, the four lines calling the player a goblin now say human (the sprite and story are human: Earth, "Sol-3 Primate"). Hotspots expose `data-object-id` for automated playtests.
- **Click-to-walk (implemented)**: views with a `walk_area` floor outline let the player walk (spec: SCENARIO_SCHEMA → Walkable Areas; design: `docs/WALKABLE_AREAS.md`). Move walks to the spot; Hand/items walk to the object (stand point from `walk_to` or automatic) then act; Move on an exit (a Move interaction that can `set_view`/`game_over`) walks there then goes; Look/Talk turn in place. Exact shortest paths around `blocked` areas (`engine/walkable.ts`), walk cycle per sprite set (`idle_helmet` → `walk_helmet`), optional `depth_scale`, arrival spots via `set_view.at` (filled by `tools/arrival-spots.mjs`), position restored when leaving a close-up, sprite objects and character depth-sorted, clicks pass through the character. The Harvest: floors for all 8 rooms and 19 vent screens (duct floors generated by `build_vent_maze.py`), 56 arrival spots, no depth scaling. Tooling: validator walk checks (bundles the real engine), preview `--grid`/`--floor`, editor **Floor** tab (player preview at the mouse and on dragged points, sample figures, **Save to scenario.json** through the dev server's `/__editor/walk-area` endpoint in `vite.config.ts`, which keeps the canonical format, refreshes arrival spots with `arrival-spots.mjs --into <view>` and returns the validator's findings). Tests: Vitest (55 unit tests incl. 10,000 random routes and a grid-search comparison), `scripts/playthrough/walk.cjs` (every walking view + behaviours), full playthrough and soft-lock search unchanged. scenario.json keeps `[x, y]` pairs on one line.
- **First-play tutorial**: `setting.tutorial.steps` (text + `done_when` trigger) shows six learn-by-doing tips in The Harvest (cycle verbs, walk, look, take the tag, use an item, hints). Click-through box with **Skip tutorial**, remembered per scenario (localStorage); hidden in `?dev`/`?skipIntro` unless `?tutorial`.
- **The caged prisoner matters (Act 1)**: first talk sets `prisoner_bond`; later talks open a second `show_dialogue` with conditional choices (ask about the ducts → purge warning; promise to free it → `promised_freedom`; offer the paste). The security override also drops the energy barriers: the prisoner escapes (`prisoner_freed`, sprite hidden, arrival message, enclosure text). If you promised or fed it, `prisoner_cage_scratches` appears: HAND it to copy the safe duct route (`vent_route_known`), which turns on step-by-step duct hints (generated by `build_vent_maze.py`, avoiding purge ducts). Browser test: `scripts/playthrough/prisoner.cjs`.
- **Walking polish**: paced walking (`character.walk_motion`, default `"paced"`: continuous movement that slows as each foot plants and speeds up mid-stride, on one clock with the walk frames and footsteps; `walk_pulse` 0–0.95 sets how strong, default 0.6; `"stepped"` is the classic Sierra jump-per-frame, which felt jarring; `"smooth"` is constant speed); metal footsteps (`character.footsteps`, 4 clips from Phil25's CC0 "Metal Steps", credits in `scenarios/the-harvest/audio/CREDITS.md`; per-view `walk_area.footsteps` override or `false`); the player is always drawn on top in The Harvest (`character.draw_order: "front"`, his shadow too); objects can opt into `layer: "floor"|"front"`.
- **Combining is self-evident**: a successful combination plays `setting.sounds.combine` (default `item_pickup`); the Items tray wraps onto extra rows instead of scrolling sideways, so every item is always in view; the tray shows "Using X: click something in the room, or another item to combine", a + badge and dashed outline on every other item ("combine with X"), and a "click two items to combine them" tip until the first combination.
- **Death screens show their text**: the 8 Harvest deaths used `message`/`title`, but the engine reads `reason`, so every death showed a bare "Game over.". Fixed in the JSON; `game_over` now also takes an optional `title` (the heading), and the validator flags a `game_over` without `reason`.
- **Cataloguer robot closeup**: Spider-legged drone in Stasis Hold with a 4-frame animated sprite (`sprites/cataloguer_robot.png`, 2fps). Looking or touching navigates to `act1_cataloguer_closeup` sub-view — a full interactive view using the specimen image as background with `back_label: "Stasis Hold"`. Four interactive objects (3 specimen tanks, data plates) with look/hand/talk responses. The specimen displays show the four-glyph section code (fern, double curl, sprouting snake, sprouting snake); LOOK/HAND the robot or plates sets `lab_code_known`. Sub-views support all 4 verbs, unlike the old `show_closeup` overlay which was hand-only. Character override only applies when the current view has a `character` placement — views without one (like closeup sub-views) show no character sprite.
- **Engine bug fixes**: `evaluateConditions()` now handles undefined/missing `when` arrays gracefully. `flag_is`/`flag_not` conditions without explicit `value` default to checking against `"true"` (previously compared against `undefined`, breaking conditions like `flag_not security_sequence_known`).
- **Vent cover in corridor**: Ventilation shaft entrance moved from Feeding Station to Containment Corridor. A `vent_cover` object with a sprite grate graphic (`sprites/vent_cover.png`) is always visible in the corridor floor (bottom-left) but gated by `security_locks_overridden` — trying to enter before overriding security shows a locked message.
- **Vent maze hazards and rewards** (routing superseded by "Vent maze v2" below): Gas Chamber (☠ needs helmet) → Fan Chamber (☠ jam with surgical probe, which is consumed) → Exit Passage → Airlock Bay. The Collapsed Section holds a Choir skeleton with crew_datapad (lore) and a hidden choir_access_chip. The emergency helmet comes from the Security Hub emergency cabinet. 3 game_over deaths (gas without helmet ×2, fan blades). All five special rooms have painted backgrounds.
- **Choir Access Chip**: Hidden optional item on the dead Choir engineer in the vent maze collapsed section. Found by HANDing the skeleton a second time after taking the crew_datapad. In Act 2, the Shuttle Bay entrance from Engineering has a bio-resonance security lock. With the chip: instant silent bypass. Without: a 3-option dialogue challenge where only 1 frequency is correct — wrong guesses add +15 noise each. Rewards thorough maze exploration with a significant Act 2 convenience.
- **Standup intro animation**: When the game starts and the intro text is dismissed, the player plays a 4-frame stand-up animation (`sprites/character_standup.png`, 3fps) during the fade-from-black transition, then transitions to the idle sprite. Implemented via `loop: false` on SpriteSet (plays once, holds last frame) and ScenarioPlayer managing the standup→idle character override. The convention is name-based: ScenarioPlayer looks for a sprite set literally named `standup`, and afterwards switches to the one named `idle` (no `standup` set = no animation). CharacterSprite resets frame counter when sprite_set changes.
- **Portability audit complete**: All scenario-specific hardcoding removed from engine and components. Zero references to "the-harvest" or any scenario-specific assets in `client/src/`. Changes: (1) App.tsx restored ScenarioLoader instead of hardcoded CAMPAIGN_ID, (2) ScenarioPlayer.tsx sound effects now read from `setting.sounds` in JSON instead of hardcoded paths, (3) AmbientCanvas.tsx rewritten to read `ambient_lighting` from view JSON instead of hardcoded presets, (4) ScenarioLoader.tsx reads from `scenarios/manifest.json` for auto-discovery, (5) All asset URL construction centralized through `resolveAsset()` utility. A third-party scenario needs only JSON + asset folders — no engine changes.
- **Centralized asset resolver**: `client/src/engine/assetResolver.ts` exports `resolveAsset(scenarioId, relativePath)` and `setAssetBase(url)`. All 8 components that load scenario assets (backgrounds, sprites, sounds, icons, closeups) route through this single function. Default behavior serves from `/scenarios/{id}/`, but `setAssetBase()` can redirect all asset loading to a different origin (CDN, blob URL from zip extraction, etc.) — one line change to support any deployment model.
- **JSON-driven sound effects**: `setting.sounds` object in scenario JSON with optional `room_transition`, `item_pickup`, and `intro_voice` paths. Engine plays these on the corresponding events. Scenarios without sounds simply don't play any — no errors.
- **JSON-driven ambient lighting**: Per-view `ambient_lighting` object with `lights` array and optional `flicker` flag. Each light has `x`, `y` (0-1 normalized), `radius`, `color` [r,g,b], `pulse_speed`, `pulse_amount`, `alpha`, and optional `phase`. Views without `ambient_lighting` show no canvas overlay. Moved from hardcoded AmbientCanvas.tsx presets into The Harvest's scenario.json.
- **Scenario manifest**: `scenarios/manifest.json` lists all available scenario folder names. ScenarioLoader reads this on startup to populate the picker. Adding a new scenario = add folder with scenario.json + add ID to manifest.json.
- **Main menu**: the app opens on a main menu (`ScenarioLoader.tsx`): Play (the manifest lists only `the-harvest`), three Steam Workshop placeholder cards (browse, subscribed, publish; "Coming soon"), and Load Custom Scenario. `?play=<id>` or the dev parameters (`?dev`, `?skipIntro`, `?view`) skip the menu on the first visit; leaving a game (the **Menu** button) returns to it. Other scenario folders remain on disk for future re-introduction.
- **Undo last move**: death screens offer **Undo last move** (back to just before the fatal action: `ScenarioEngine.snapshot()`/`restore()`, taken before every interaction, combination, dialogue choice and keypad entry), **Restart** and **Main menu**. `setting.allow_undo: false` turns undo off.
- **New player character sprites**: Replaced goblin with bearded human in green tunic. Sprite sheets: `character_idle.png` and `character_idle_helmet.png` (12×2, right+front, a subtle 2fps idle loop with breathing and a glance at the camera, built by `scenarios/the-harvest/scripts/build_player_idle.py`; see ART_GUIDE "Idle animations for the player character"), `character_walk.png`/`character_walk_helmet.png` (right walk+front walk at 6fps), `character_standup.png` (lying→standing at 3fps, no loop). Frame size 300×410, scale 0.35. Helmeted sheets (`character_idle_helmet.png`, `character_walk_helmet.png`) are generated by `scripts/build_helmet_sheets.py` (helmet covers the whole head in every frame). Every frame's feet sit on the cell's bottom row (the camera-facing rows used to float ~42 px). One global character shadow (`offset_y: -5`), no per-view overrides. Left-facing via CSS scaleX(-1) flip. Old goblin sprites removed.
- **Voiceover narration tool**: `tools/generate-voiceover.mjs` extracts all player-facing text from a scenario JSON (intro, ambient, messages, dialogue, game over, hints) and batch-generates MP3 files via the ElevenLabs TTS API. Supports `--dry-run` to preview without API calls, `--filter <category>` to generate only specific types, `--force` to regenerate existing files, and `--list-voices` to browse available voices. Saves to `scenarios/<id>/audio/voice/` with a manifest.json. Requires `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` environment variables. The Harvest has 1,489 text entries (~193K characters). Free tier gives 10K chars/month — prioritize intro narration first (`--filter intro`, 706 chars).
- **Scenario-builder skill**: `.claude/skills/scenario-builder/SKILL.md` — comprehensive AI agent onboarding guide (1100+ lines) covering package structure, background image generation (Gemini prompt formula), sprite creation (blue chroma-key workflow), full JSON authoring, coordinate system, ambient lighting, a 3-room template, and pre-flight checklist.
- **In-game DevPanel**: `DevPanel.tsx` — 5-tab developer tools panel activated via `?dev` URL parameter. Tabs: Views (jump to any view), Objects (position/size/visibility), Character (live animated sprite preview with facing/sprite_set controls), Sprites (browse all sprite sheets with animation), Export (paste-to-Claude format + JSON patch). Auto-enables debug mode and skips intro. Layout shifts to 960px game + 340px panel side-by-side.
- **Standalone Visual Editor**: `client/public/editor.html` — full visual editor for scenario authors. Shows actual animated sprites (character + object sprites) on backgrounds, hotspot boxes with drag/resize, character controls panel (sprite set, facing, animation play/pause), toggleable hotspot/sprite overlays, coordinate display, and 3-tab export (human-readable changes, JSON patch, full view JSON). Unified sprite box (single interactive element for sprite objects instead of separate hotspot + visual boxes). Shadow controls per sprite per view: tight-range sliders (offset ±10, skew ±30, width 10–150, height 2–40, opacity in 0.05 steps; the range widens automatically for existing values outside it) with −/+ nudge buttons. Dragging updates only the viewport and value label (`keepPanel` guard), so the slider is never rebuilt under the cursor. Accessible at `/editor.html` when dev server is running.
- **Sprite shadow system**: All sprites (character and object) support JSON-configurable shadows via `shadow` property. Object shadows go on the object definition alongside `sprite`. Character shadows set globally on `character` config and optionally overridden per-view in character placement. Shadow properties: `offset_x`, `offset_y`, `width`, `height`, `opacity`, `color`. Visual editor provides real-time shadow sliders. Implemented in `SpriteObject.tsx` and `CharacterSprite.tsx`.
- **Security console closeup**: `act1_security_closeup` sub-view with 3 objects: the red Emergency Override button (two objects, `sec_closeup_override_button_dark` until the lab terminal's `on_solve` swaps in the lit `sec_closeup_override_button` via `hide_object`/`show_object`; pressing the lit one sets `security_locks_overridden`, opening the corridor vent), surveillance feeds (Curator patrol), and the status display. `back_label: "Security Hub"`. Its background `closeups/security_closeup.webp` is composited from existing art by `scenarios/the-harvest/scripts/compose_security_closeup.py` (the hub painting's wall of screens, blurred, behind the chroma-keyed console art); the feeds and status hotspots sit on the painted screens. The containment key card comes from the `key_card_drawer` on the Security Hub wall, not the close-up.
- **Item use overhaul (Act 1)**: 7 new use_item interactions give previously unused items purpose: glass shard + organic growth (reveals scratched message from previous prisoner), stasis fluid vial + reading device (enhances reader), specimen tag + reader (reveals species classification), nutrient paste + prisoner (feeds prisoner, strengthens bond), neural tendril + holographic display (reveals Convergence heading to Earth), cat hair + examination tables (since removed: HAND now pets the cat instead), surgical probe + keypad/lever (flavor interactions with noise; since removed with the old security keypad and lever). Fixed missing `has_item` conditions on reading_device and airlock_override_panel.
- **Hitbox fixes**: corridor_pipes width 965→960, personal_log_crystal 20x53→50x70, broken_pod repositioned to (160,560) with size 150x100.
- **Grappling-line gap puzzle (soft-lock fix)**: The Stasis Hold walkway gap guards the cataloguer robot (four-glyph code → lab terminal → vent; at the time there was also a security keypad route). Its only solution used to be the neural tendril, which the holographic display consumes — visiting the Archive first soft-locked Act 1. Now: USE surgical probe ON restraint straps (Processing Lab; probe kept, shard fails with a hint) → Restraint Strap; HAND the carcass hook in the morgue's open drawer (`morgue_carcass_hook`) → Carcass Hook; COMBINE → Grappling Line (`consumes: true`, Act 1's first combination); USE line ON `platform_gap` → `gap_crossed`, line consumed, hidden `gap_grappling_line` object shown (procedural strap sprite drawn between the two painted railing stubs). Specific rejections for strap-only, hook-only, probe, tendril, shard; HAND still kills. Stasis/lab/morgue hints teach combining. New art: `items/restraint_strap.png`, `items/carcass_hook.png`, `items/grappling_line.png`, `sprites/carcass_hook.png`, `sprites/grappling_line_rigged.png`.
- **Duplicate-key cleanup**: `black_cat` and `emergency_cabinet` had two `shadow` blocks each (older value silently winning over the latest editor export). Removed the stale ones; scenario.json is now canonical `json.dumps(indent=2)` format, so scripted edits produce minimal diffs.
- **Act 1 was unwinnable — fixed**: (1) `fan_mechanism`'s `use_item` interactions had no `item` field since the vent maze was added, so the surgical probe could never jam the fan (walking into it was the only option: death). Now `item: "surgical_probe"`, plus the "won't fit" rejection is attached to the other plausible items. (2) The security-closeup key-card drawer sprite was anchored at y=-23 (off the top of the screen) by an editor export, making the only key card unobtainable; re-anchored beneath the console at (690,700). (3) Five vent-maze ambient lights lacked `pulse_speed`/`pulse_amount`, crashing the lighting canvas with NaN. All found by the new validator / soft-lock search.
- **One security route (simplified)**: the old security keypad, startup-sequence flag, membrane lever and close-up drawer were removed. They duplicated the lab terminal route, and the "five-step startup sequence" was never entered anywhere (one LOOK set a flag). Chain now: gap → glyph code → lab terminal keypad (arms the override) → Security Hub close-up → press the override → corridor vent. Soft-lock search: 27,371 states, 0 soft-locked, shortest win 27 actions.
- **How the vent views were made**: every vent background (5 special rooms + 3 generic frames) worked on the first Gemini attempt and fitted existing hotspots with small nudges. The full recipe is documented in `docs/ART_GUIDE.md` → "Case Study: The Vent Maze" (reference-image anchoring, hotspot-to-fraction composition, hero-frame edits, mirroring, shared hotspot geometry, data-driven build) and summarised in rule 14. Showcase image: `docs/images/vent-maze-rooms.webp`. Tools added: `tools/preview-hotspots.mjs`; `scenarios/the-harvest/scripts/build_vent_maze.py` (idempotent).
- **Vent maze v3 (KQ-desert hard; superseded by v6, kept for history)**: 48 duct cells on a fixed compass (camera faces north; left = W, right = E, back = S) with the five painted special rooms as landmarks: an 18-move shortest route, 6 loops, 6 dead ends and 3 deadly **purge ducts** (LOOK warns: scorched, breathing hot air; small skulls on the map). The layout is generated by `scenarios/the-harvest/scripts/design_vent_maze.py` (seeded search within what the five duct frames can show, scored for difficulty) into `scripts/vent_maze_grid.json`, which `build_vent_maze.py`, `draw_vent_map.py`, `build_walkthrough_images.py` and the playthrough harness read. The map shows the grid but no route and no "you are here"; duct hints explain how to read it, never which way to go. Soft-lock search: 53,995 states, 0 soft-locked, shortest win 40 actions. Design: `scenarios/the-harvest/vent-maze-design.md`.
- **Hint-order bug fixed**: five vent rooms had an always-true hint *after* their specific hints, and since `getHint()` returns the last match, the specific ones never showed (e.g. the fan room's "jam the mechanism"). Unconditional hints now come first everywhere, and the validator warns on this pattern.
- **Glyph keypad (puzzle widget #1)**: The lab terminal keypad is a real puzzle. HAND opens a `keypad` overlay widget with 8 alien-glyph keys. The code is the four characters painted on the specimen displays in the cataloguer close-up (fern, double curl, sprouting snake, sprouting snake), which are only reachable across the Stasis Hold gap. The solution glyphs are traced from that painting by `scenarios/the-harvest/scripts/extract_glyphs.py`, which renders 5 procedural decoys identically, so no key gives itself away. The painting's 3rd and 4th characters are the same sprouting snake, so the code repeats that key; the old "thorny branch" key was a near-copy of the snake and players pressed it for the second snake, so it was replaced by a `zigzag` decoy. Wrong entries add noise and show cycling in-widget feedback that hints toward "somewhere the characters are written in order". `max_attempts` (6) triggers a loud alarm but never locks. Brute force is possible (4,096 codes) but miserable, so the gap is a knowledge gate. The code unlocks the terminal, which arms the security console's Emergency Override (the only route to the vent). The old dead `lab_access_keypad` widget was removed. Soft-lock search (widget-aware): 143,587 states, 0 soft-locks at the time; after the security simplification it is 27,371 states (see "One security route").
- **Scenario tooling**: `tools/validate-scenario.mjs` (referential/schema lint) and `tools/softlock-search.mjs` (exhaustive search over the real engine, cone-of-influence reduced). Both documented in Key Commands.
- **Art guide**: `docs/ART_GUIDE.md` — two-style rule (painted backgrounds, pixel-art sprites), prompt template + the exact prompts that shipped, chroma pipeline (now with despill), sizing table measured from Act 1, anchoring rules, icon canvas spec, procedural composite sprites, Playwright verification recipe.
- **Noise and tension (Act 1)**: condition-triggered events are implemented in the engine (`runEvents()`, after every action, edge-triggered, `one_shot`; `time_*` triggers skipped). The Harvest uses them for the Curator: noise ≥ 50 "something is listening" + distant footsteps, ≥ 80 "it's hunting, hide", ≥ 100 caught (game over). Hiding spots (`hiding_spot: true`: an empty morgue drawer, your old pod, behind the overturned chair) reset noise to 10 when HANDed while noise is above 29. Brute-forcing the lab keypad (6 wrong codes) sounds an alarm, adds 30 noise, throws you out of the close-up and spawns `lab_hunter_drone` (`sprites/hunter_drone.png`, real art) beside the terminal: LOOK at the terminal refuses, HAND on it or the drone = caught; leaving the lab makes it give up. The corridor's lab and security doors are heavy (+3/+2 noise). Every noise jump of 3+ plays `setting.sounds.noise`; new clips `audio/noise_clang.mp3`, `alarm.mp3`, `curator_steps.mp3`, `discovery.wav`. `set_view` now closes an open widget. Recipe: SCENARIO_SCHEMA → "Pattern: noise, guards and hiding". Browser test: `scripts/playthrough/noise.cjs`.
- **Floors audited against the paintings (Nov 2026)**: every walking view was checked with `preview-hotspots --ghosts` (the player sprite drawn at sample spots). Most floors ran over furniture, so he looked like he was standing on tables, pods, pipes, troughs or the skeleton. Redrawn to open floor only: processing lab (front floor plus the aisle between the tables, traced from the owner's outline), stasis hold (in front of the broken pods plus the walkway), morgue (around the autopsy slab and gurney), feeding station (around the troughs and floor pipes), ventilation shaft, junction, all duct screens (`DUCT_FLOOR` in `build_vent_maze.py`: between the floor pipes), gas chamber (the channel between the pipes and the skeleton), fan room, collapsed section, vent exit (around the hatch), security hub (in front of the console) and archive (around the pedestal). Corridor and airlock bay were already right. Arrival spots refilled (128). Rule 16.
- **Floor edges pulled in**: every floor except the owner-tuned corridor and stasis hold was inset by 14 screen px (blocked areas grown by the same margin), because at the edges his body touched walls and objects. It was not a sprite offset: his feet are drawn exactly on the floor point (sheets have at most 4 px under the feet). The vent exit is now the floor in front of the hatch between the two pipes; small cut-off pieces (the feeding-station back strip, the archive right of the pedestal) were dropped, and clicks there walk him to the nearest floor point.
- **Corridor perspective**: the containment corridor now has the owner's floor reaching down the corridor to the feeding-station door, with `depth_scale` (0.3× at y 383, full size from y 546), the first Harvest room with perspective scaling. `preview-hotspots --ghosts` scales its figures by `depth_scale` like the editor.
- **Audit recommendations 1-15 (Nov 2026)**, from the Immersion Audit doc (https://claude.ai/artifact/8JSJXC4gkyL7wdMTZT9PCJ):
  - Engine (schema first): `setting.music`/view `music` (a music channel that carries on across rooms), view `enter_sound` and `set_view.sound` (close-ups silent, ducts crawl, the airlock bay a landing thud), `setting.noise_decay` (4 per room) and `noise_sound_min` (6, so doors don't clang), score (`add_score` effect, once per `id`; `setting.max_score`; title-bar and end-screen score; `sounds.score` sting), view `lighting_variants` (red alarm strobes after the override), `play_animation` effect + `sprite.loop: false` (one-shot set pieces, ready for art). Tests: `ScenarioEngine.features.test.ts`.
  - Writing: one backstory (the *Outrider*'s pilot, taken in orbit over Earth; the Convergence is already harvesting Earth, eleven cycles left), stakes in the first minute (the tag's countdown), the glyph code is read off the painting (no names in text, no key labels), the override is explained (terminal: "wants a hand on that button in Security"), maze directions fixed (the route starts EAST; west is a dead end), a humour pass on ~40 MOVE/TALK lines, Sierra-style death punchlines with hints, the prisoner names itself (Keth-Vari), continuity fixes (paste, the dead man, the goblin leftover, the airlock panel after opening, the datapad).
  - Set pieces and toys: the act now ends at the airlock window (key card → shutters → `act1_earth_closeup` → "End of Act 1" win with score); a one-time Curator glimpse on first entering the feeding station (`act1_curator_glimpse`, event `curator_glimpse`); purge ducts glow orange (lights from `build_vent_maze.py`); the override sounds the alarm, turns the lights red and shows the prisoner escaping on the feed; the Keth-Vari waves you east from the junction if you promised or fed it; toys: the orchid opens over three TALKs and gives you a spore, the hologram spins like a slot machine, the black cat turns up on the security console, a wedding ring in the morgue. Score: 95 points (progress + 34 curiosity flags + crossing the line).
  - Placeholder assets made by `scenarios/the-harvest/scripts/make_placeholder_assets.py` (synth music cues, crawl/thud/score sounds, ring and datapad icons) until real art and audio replace them at the same paths. The Earth close-up (`closeups/earth_siphon.webp`, the airlock viewport with siphon beams on North America) is now the owner's Gemini painting. The Curator now has real art: `sprites/curator.png`, 13 frames at 2 fps (a base plus three Gemini edits: head tilts and white-hot eyes) keyed from the green-backdrop frames in `sprites/raw/` by `scripts/build_curator_sheet.py` with one shared crop; drawn mirrored (`sprite.flip`, new) so it faces left, toward the pod.
- **Intro cinematic (Nov 2026)**: `setting.intro_scenes` (SCENARIO_SCHEMA → Intro Cinematic) replaces the text intro with animated scenes: painted backgrounds, sprites (move/bob/spin/rotate/frame order/filter), ambient lights, effects (particles, shade, sweep, sparks, shake), an eased camera, lines with voice clips (radio lines get a Web Audio radio filter), per-scene sound/loop/music and fade/cut/flash transitions; click advances, Escape or **skip intro** skips. The Harvest's intro (7 scenes, about 2 minutes): the *Outrider*'s pilot on a spacewalk at relay satellite LUMEN-7 above Earth, the stars going out, the harvest beam, cataloguing, the pod, then the wake-up. All six backgrounds are the owner's Gemini art (`intro/backgrounds/`); the slab (`specimen_limp`) and pod (`pod_float`) sprites are real art keyed by `scripts/build_intro_sprites.py` (raw Gemini frames in `intro/sprites/raw/`, matched in scale by boot width and aligned on the feet), the spacewalk scenes use `intro/sprites/eva.png` (one sheet of spacesuit poses: work, glance, alarm, tumble, limp; optional float poses are appended when their raw frames exist), all seven narration lines (Silas voice, `intro/audio/narr_01..07.mp3`) and the four Mission Control radio lines (Emily voice, `radio_01..04.mp3`, radio filter added in the player) are the owner's ElevenLabs clips (each covers a scene's narration, so split lines were merged); the breathing, drill, swell and harvest sounds are ElevenLabs too, and the music, heartbeat, scan, underwater and glass-crack sounds are stand-ins from `scripts/make_intro_placeholders.py` (which never overwrites a real clip) (brief: https://claude.ai/artifact/FJ2V2J4NJD89cLv8xPueE3). Browser test: `scripts/playthrough/intro.cjs`; unit tests: `engine/introTimeline.test.ts`; the validator checks intro files and sprite fields.
- **Intro audit (Nov 2026)**: a deep human-perspective pass. Fixed: (1) the game's room ambience (`haunted.wav`, lab hum) played under the whole intro (that was the "breathing" that drowned the voices); (2) every radio line played twice, overlapping itself (a finished line's safety timer re-triggered the next line; lines now carry a token); (3) voices sat ~4 dB under effects and music: all intro clips are loudness-mastered by `scripts/master_intro_audio.py` (originals kept in `intro/audio/source/`) and the player ducks music/loops under voices; (4) scene sounds bled across scenes and the breathing restarted between scenes: they now fade out, shared loops carry on, music crossfades; (5) pose changes and effects drifted out of step with the voices: new `cue`/`until_cue` (start, line:N, end) for sprites, effects and `sounds`, so the pilot looks up in alarm when Mission Control's "probably the cold" ends, and the stars die during that line; (6) staging: the pilot is tethered to the satellite (new `rope` effect) and closer to it, the abduction starts large in the foreground; (7) no music in scene 1 ("the only sound is your own breathing"), the score starts at the panel and plays once (`music_loop: false`); (8) the wake-up narration (`sounds.intro_voice`) was briefly removed, then restored and staged with `setting.wake` (see "The alarm escape" entry's follow-up below). Also `tail` per scene, `music_volume`, smoother sprite scaling under the moving camera, and `metadata.credits` (shown on the main-menu card: "Voices and sound effects by ElevenLabs (elevenlabs.io)"; ElevenLabs credits in README → Attribution and `intro/audio/CREDITS.md`).
- **The alarm escape (Nov 2026)**: the security override only fires while you carry the surgical probe, the helmet and the key card (else it warns you're not ready; close-up hints name what's missing). Back in the corridor after the alarm, event `alarm_vent_opens` swaps the closed grate for `vent_cover_open` (`sprites/vent_cover_open.png`, built from the closed grate by `scripts/build_vent_open.py`, with a red glow light in the alarm lighting) and sets `alarm_hunters_out`. Hunter drones then wait in the Stasis Hold, Processing Lab, Security Hub, Morgue and Archive (events `alarm_*`: show the drone, alarm sound, caught after 1.6 s, Undo back to the corridor); the Feeding Station stays open for the prisoner's scratched route. Engine fix found on the way: `delay_then` effects never redrew the UI (`setChangeListener`). New `setting.sounds.death` (`audio/death_sting.mp3`, synthesised) and `win`; intro: `fade_in` (the first shot fades in from black over 3.5 s), a quiet Stargazer ambient bed (`intro/audio/bed_stargazer.mp3`, looped and mastered from `audio/ambient_vastness.wav` by `scripts/master_intro_audio.py`) under the first two space scenes; when the ship appears it gives way to a dissonant hit (`sting_dread.mp3`) and a low beating drone (`music_dread.mp3`), both synthesised stand-ins. The title card fades up over 2.5 s; the radio voice is mastered 3 dB under the narrator (-20 LUFS). The validator now checks event effects (flags they set, objects they show). Browser test: `scripts/playthrough/alarm.cjs`. Recipe: SCENARIO_SCHEMA → "Pattern: the alarm escape".
- **Wake-up staging (Nov 2026)**: `setting.wake` (hold, fade, blink, voice delay). The Harvest: 1.8 s of black, the eyes open with a blink over 7 s, the narrator describes the Stasis Hold from 2.2 s (`audio/voice/ambient_stasis.mp3`, which speaks the first phase's message "Your eyes open to green light…", not `ambient_text`), he gets up as it ends, and only then does the tutorial start. All in-game voice clips (`audio/voice/`) are now loudness-mastered to -16 LUFS by `scripts/master_intro_audio.py` (originals in `audio/voice/source/`); before, the narration sat under the room ambience.
- **The gap is a real crossing (Nov 2026)**: using the grappling line on the gap now only rigs it; HAND the rigged line and he walks to it and climbs across (new `traverse` effect, 4.2 s, along the dip of the line) to the cataloguer's ledge, a second floor in the same view (new `walk_area_variants`, chosen by flag `on_far_ledge`), with depth scaling (0.62x on the ledge). The line sags under him (`sprites/grappling_line_bounce.png` / `_back.png`, 8 frames each, drawn by `scripts/draw_rigged_line.py`, which also prints the dip path). The cataloguer can only be read from the ledge; the exit is blocked until you climb back. He hangs from the line hand over hand: sprite set `rope` (`sprites/character_rope.png`, 4 cells: hang, reach, hang, swing; built from three Gemini frames in `sprites/raw/rope_hang_*.png` by `scripts/build_rope_sheet.py`, aligned on the hands and scaled to the standing body) with `anchor: "top"` (new: the route is his hands on the line, and the traverse effect's `at` says where his feet land). The soft-lock search now applies `delay_then` effects at once (`engine.immediateDelays`), which it needs to see the line come back: 67,879 states, 0 soft-locks. Browser test: `scripts/playthrough/rope.cjs`.
- **Regression tests (Nov 2026)**: `scripts/playthrough/regression.cjs` has one browser check per bug found in playtesting: skipping the intro reaches a visible room; the wake-up never waits forever for a narration clip's length (fixed: Safari-like browsers that only load audio length on play left the first room black; now `preload` + a 2 s fallback); the wake-up order (black, eyes, narration, stand, then tutorial) and that its message is the spoken text; no doubled voice lines or room ambience under the intro; main menu Play/Menu and the ElevenLabs credit; delayed game overs redraw and play the death sound. `run-all.cjs` runs every suite in order. Unit tests (89 now) cover traverse, floor variants, `immediateDelays` and patrols.
- **Hunter patrol and game clock (Nov 2026)**: a hunter drone (`sprites/hunter_drone.png`, the alarm guards' art; the cataloguer stays docile on its ledge) sweeps the starting slice of the ship every minute on the game clock, from 1:00: Stasis Hold 0-5 s, Containment Corridor 5-10, Feeding Station 10-15, Specimen Archive 15-20 (it fades out there). 5 s before it comes into your room you hear it (`audio/patrol_skitter.mp3`, synthesised by `make_placeholder_assets.py`) and get a room-specific warning; from a room next door (or its close-ups) you hear it pass and are told where it is (`nearby_sound` `audio/patrol_skitter_far.mp3`, the skitter softened and loudness-matched; per-leg `nearby_message`, e.g. in the lab: "Out in the corridor, metal legs tick past the door..."); if it finds you there and you're not hiding, it notices you in 1.5 s ("Caught", Undo rewinds the clock too). Escape by leaving (the corridor's side rooms, the morgue) or hiding: HAND your pod (Stasis Hold) or the archive benches while it's near (`patrol_near`). Standing on the far ledge is safe (`safe_when` `on_far_ledge`). It stops once the alarm hunters are out (`when` `flag_not alarm_hunters_out`). The title bar shows `Time m:ss` (`setting.clock.show`). Engine: `advanceClock()`, `getPatrolSightings()`, `patrol_near`, the clock in snapshots, hiding ends on physical actions and walking, the hidden player isn't drawn. Tests: `engine/ScenarioEngine.patrol.test.ts` (10), `scripts/playthrough/patrol.cjs`; every other suite that uses `lib.cjs` loads with `?noPatrols`. The validator checks patrols (views, legs, sounds, sprite, `patrol_near` ids).
- **Petting the cat (Nov 2026)**: HAND the black cat in the corridor (second visit) now pets it instead of taking a tuft of fur: it purrs, leans on your leg and slips away (`cat_petted`, 1 point), then sits on the Security Hub console (HAND it there: 2 points, the ones the fur's DNA analysis used to give, so the maximum stays 95). The `cat_hair` item and its examination-table use are gone. Only a petted cat will turn up in the vent maze v4 to help (designed in the maze doc, built with the maze); looking, talking or grabbing does nothing. Browser check in `features.cjs`.
- **The gap jump is animated**: HAND the Stasis Hold gap without the line and he walks to the edge (`walk_to` 500,714), leaps (a 0.8 s `traverse` in the walk pose), then falls out of the bottom of the screen in the arms-up `rope` pose (a second `traverse` inside `delay_then`), a thud, and only then the death screen. Delayed traverses now animate (ScenarioPlayer's engine change listener takes them). Browser check at the end of `rope.cjs`. `lib.cjs`'s `openInv` trusts the tray toggle's arrow (the clock's redraws can open the tray by themselves).
- **Visual and experience pass (Nov 2026)**: (1) the tip boxes broke the mood, so The Harvest's tutorial is now `style: "nudge"` (new): a small badge at the top of the picture (`VerbNudge.tsx`: a mouse with its right button lit, the verb icon turning through the four verbs) that fades after three verb changes. (2) The spacesuit sprites had lost their helmets: the glass bubble is painted over the blue screen, so keying removed it; `build_intro_v2_sprites.py` now fits a circle to each frame's painted rim and draws one consistent pixel-art helmet (glass, two-tone rim, highlight) on every frame. (3) Hand on LUMEN-7 goes straight to the close-up and "Panel's open… huh" plays after the door has swung. (4) The pilot's grab bar now sits on the hull beside the hatch frame (pilot x 446). (5) Both panel paintings showed green boards although the story says they're gone: `scripts/gut_panel.py` paints the panel out to an empty backplane (`intro_panel_gutted.webp`, used by the close-up), with a dim cold light instead of the green glow. (6) During the prologue the clock is hidden and **skip intro** sits top right, clear of the room name and hint button.
- **Pilot sprites v3 (Nov 2026)**: the owner's new Gemini sheets (`intro/sprites/raw/v3/`: model sheet, floating idle, rail, turn) with an opaque amber helmet painted in, so the drawn-on helmet is no longer used. `scripts/build_eva_v3.py` finds each pose as a figure (not fixed columns), keys the blue, and lines up the rail and turn poses on a pure-red placeholder bar that his glove holds, then removes the bar (the painted handrail shows through his fist). Outputs `eva_float_v3.png` (two near-identical poses: a breathing loop, also played while he drifts, since there's no swimming in orbit), `eva_rail_v3.png` (grip, swing, reach up as the door opens, lean in) and `eva_turn_v3.png` (uneasy look back, then he lets go, alarmed), plus `eva_rail_v3.json`, which `build_intro_v2.py` uses to put the bar's end on the painting's rail (`RAIL_GRIP`, scale 0.42, space under his boots). The cutscene poses are `eva_cutscene_v3.png` (drilling, alarm, taken, limp; replaces `eva.png`): the shadow scene uses alarm, the beam-up taken then limp.
- **Walking in through doors (Nov 2026)**: `character.walk_in` (new; The Harvest has it on): coming through a door he appears at the arrival spot by that door and walks a few steps toward the middle of the floor, scaled by `depth_scale` (out of the feeding-station doorway he comes toward the camera, small; from Security he steps in from the right). Interruptible by any click; `set_view.walk_in: false` opts out. Engine `planWalkIn()`/`takeWalkIn()`; tests in `ScenarioEngine.walk.test.ts`.
- **Walking motion**: `character.walk_motion` default is now `"paced"` (continuous, slows as each foot plants, speeds up mid-stride; `walk_pulse` sets the strength). The earlier `"stepped"` jump-per-frame felt jarring.
- **Vent maze v6 "The Colony" (built, Nov 2026)**: replaces the v3 maze. Design doc https://claude.ai/artifact/TXbhA8E6UQGPiDsts5uGkS, experiments https://claude.ai/artifact/YJivYneXFMMHZ27GnUvmtk, interactive map with demos https://claude.ai/artifact/GQf44LikYYCK5Knym4wD5Y. 180 views from `scripts/vent_maze_v6_grid.json` (layout by `design_vent_maze_v6.py`, experiment results added by `augment_vent_maze_v6.py`: 9 breaths, the purge surge's 4 legs, 6 surge membranes, 2 alliance tunnels), written into scenario.json by `build_vent_maze_v6.py` (exits, frames chosen by compass and mirrored, breath and folds, breathing ducts and Core purge vents on cycles with throat sprites on the exits that act on click, purge ducts, surge membranes, alliance tunnels, Wardens W1/W2, the surge, the Curator behind the grates, zone checkpoints, Keth-Vari scratched-route hints in the Outer Ducts, allied-Warden hints toward the border, max score 125) and `vent_story_v6.py` (the Choir eye at the vent, the lever, the Gas Chamber with the dead Vesk and the scout, the seal and the membrane that tears the helmet off, the Warren's sensing Wardens and wind at 0.26–0.32 scale, Vera, the Penitent, the Archivist, the escapee's camp and journal, the Heart Valve, the Audience (royal guard greeting, rhythm widget, the mark, the vow: swear/bargain/refuse), the border, the drop-hole, the Cache multitool, the seam, the office grate, the race to the Purge Heart, the Keth-Vari's ally/indifferent/enemy paths, the cat, the escapee's map with 4 layers). Items: lung-sac, call-stone, hollowed tag, Queen's egg, claw ring, Vera's patch, Choir multitool. Flags for later acts: `vesk_allied`, `vesk_vow`, `vera_fate`, `purge_stopped`. Art from the runbook processed by `build_vent_sprites_v6.py`; stand-in audio by `make_vent_audio_v6.py`; player map by `draw_player_map_v6.py`. Tests: `client/src/engine/ScenarioEngine.v6route.test.ts` (plays the whole route through the real scenario.json), browser `scripts/playthrough/vents.cjs` (the route in the real UI incl. the rhythm widget with real mouse presses, the Curator's hum, the Warren's Wardens, Restart from checkpoint). Soft-lock search, zone by zone (the zones are joined by one-way doors, and each zone start is a checkpoint): Outer Ducts 3,615 states, Gut 11,090, Purge Core 186,266, all exhaustive, 0 soft-locked (meters ignored: running out only ever kills, and checkpoints recover). Commands in "Soft-lock analysis".
- **Vent experiments and art runbook (Nov 2026, done)**: five experiments (doc https://claude.ai/artifact/YJivYneXFMMHZ27GnUvmtk) tuned v6: `scripts/sim_breath.py` (scripted players crossing the v6 Gut) showed 8 breaths is a cliff edge (64% of careful players black out 3+ times) and 9 is fair (12%), so v6 uses 9 breaths, a cold-draught cue next to folds, a listen action (spend a breath to sense folds, Wardens and ducts within 2 screens, 3 after the Audience; silent for that move, so the Curator loses you), surge membranes (about 3 per Gut half) and 2 alliance tunnels; the panorama Gut was rejected. Art runbook (35 steps, every reference picture embedded in its step, results pasted into chat): https://claude.ai/artifact/JQe264zrFkqZt9GrvpFzgz (the first version, GpjSEsUPerqhnHsaWZBbza, is superseded). All 35 runbook pictures are in (`backgrounds/maze/`, `sprites/raw/`, `items/raw/`, `closeups/maze_choir_eye.webp`) and built into the game.
- **Vent maze v5 (designed, superseded by v6)**: design doc https://claude.ai/artifact/Bbrpy1DDbB4imgfuc8vbqA (supersedes the v4 doc). Adds air: a breath meter (8, one per new screen in the Gut and Purge Core), cold folds and air rooms that refill it, 20 breathing ducts (leave on the in-breath for +3; the out-breath blows you back in the Gut and kills in the Core), the Belly (a vast two-screen cavern at the mouth of the Gut, player drawn tiny) and a shrinking Nursery. Sample layout from `scenarios/the-harvest/scripts/design_vent_maze_v5.py` (multiprocess seed search; proves the exit is reachable with a breath to spare, from the Belly and from every way into the Purge Core). Dying in the maze will restart the zone from its checkpoint (full breath), not Undo one move into `scripts/vent_maze_v5_grid.json`, drawn by `scripts/draw_vent_map_v5.py` to `design/vent_maze_v5_map.png`. Planned engine features: meters, cycles, floor walking speed, a pursuer, map layers.
- **The playable opening (intro v2, Nov 2026)**: replaces the 7-scene narrated cinematic, after five "human appeal" evaluations (doc https://claude.ai/artifact/2XATpinTPuh4rFEWwD5hmh: evaluations, beat sheet, voice script, ElevenLabs prompts for every death). About 80 s: a one-scene cold open (title, Earth, the pilot's breathing, one line of his voice-over) → the **playable spacewalk** (`setting.prologue`, view `intro_spacewalk`: Relay Control calls on the radio, the pilot answers; the tutorial teaches right-click, Move to drift, Hand on LUMEN-7) → the panel close-up (`intro_panel_closeup`: the boards are gone; Control can't explain it) → the cutscene `abduction` (`setting.cutscenes` + `play_cutscene` with `wake: true`: the stars go out, the harvest, "Outrider, respond" fainter each time) → the wake-up in the Stasis Hold. The pilot is the Silas voice (the same as the room narration) with a helmet-mic filter when he talks to Control (`message.style: "comms"`); Control is Emily through the radio filter (`"radio"`). All lines and effects are the owner's ElevenLabs clips in `intro/audio/v2/` (mastered by `master_intro_audio.py`); built by `scripts/build_intro_v2.py`. Engine (schema first): `setting.cutscenes`, `play_cutscene`, `setting.prologue` (clock stopped, **Skip intro** button, first phase's `on_enter` deferred to `beginGame()`), message `style`, per-sprite-set `frame_width`/`frame_height`/`scale`/`bob`, `walk_area.motion`, view `ambient_text`, tutorial `when` and `prologue: "only"|"if_skipped"` (tips numbered along the player's route). Fixed on the way: delayed messages were shown twice. Tests: `engine/ScenarioEngine.cutscene.test.ts`, browser `scripts/playthrough/intro.cjs` (plays the whole opening, both skips). The old `narr_*`/`radio_*` clips stay on disk, unused.
- **Full-screen play and one frame (Nov 2026)**: players (`?play`, the main menu) get full-screen play: the 960x540 picture is scaled to fill the window (`data-viewport`), and the controls are small translucent pop-overs at its edges: noise (only when above 0), time and meters top-left, player actions and **☰** top-right (title, score, Mute, Debug, Menu, the dev skip), an **Items** tab bottom-left that opens the tray above it, and lines as a subtitle band over the bottom of the picture (click to dismiss); no idle ambient line. The intro cinematic and cutscenes play inside the same picture (`IntroCinematic embedded`), so nothing changes layout from the title card to the end. `?dev` and `?framed` keep the framed layout (title bar, panels under the picture, dev panel), which every `lib.cjs` browser suite uses; `intro.cjs` and `regression.cjs` test full screen. The opening's stars-out transition uses the new `stars_out` cinematic effect on the orbit picture, then reveals the harvester; the pilot is in the panel close-up (`character.scale`). The opening's lines are the pilot's first-person thoughts, with a first-person wake line (`w01`) that replaces the narrator's once recorded. Audit with rating, sprite prompts and all 36 lines to record: https://claude.ai/artifact/SiEA3DpzQVEwJeC2DDuUkP. Next: a first-person pass over the game's 2,568 second-person lines, starting with the first rooms.
- **A seamless full-screen experience (Nov 2026)**: the main menu is a title screen over the scenario's cover painting (`metadata.cover`, new; default the first view's background) with a slow drift, the menu as an overlay (Play, more adventures, Steam Workshop coming soon, load your own); Enter plays. Play switches the browser to real full screen (`fullscreen.ts`; ☰ → Full screen and the F key toggle it; Esc leaves). In play, the bars around the 16:9 picture show a dark blur of the current room, the picture has no frame line, and the top controls and Items tab fade out after 3 s without mouse movement (back on any move; not while the menu or tray is open). Dialogue, keypad, close-ups and death screens were already full-window overlays.
- **Opening and HUD polish (Nov 2026)**: the cold open uses the game's verb cursor and right-click from the first frame and cuts straight into play (its camera settles centred; GameView `fadeRooms` skips the room fade for that one change), so there is no dip to black. The title card now plays right after the beam-up (`title_card` on a cutscene scene, `setting.intro_title: false`). Tutorial tips show in every new game (Skip hides them for that game; ☰ → Tips on/off is remembered). Full screen: items are a slim icon strip on the right edge (names fly out on hover; `InventoryPanel vertical`), and lines are see-through subtitles that clicks pass through and that fade after reading time (no click-to-dismiss).
- **Opening art from the owner (Nov 2026)**: `scripts/build_intro_v2_sprites.py` keys the Gemini sheets in `intro/sprites/raw/` into `eva_drift.png` (the floating swim cycle: the spacewalk's idle and walk sets, and the cold open's last frame), `eva_panel_open.png`/`eva_panel_turn.png` (grip, pull, peer, turn to camera; aligned on the grab bar) and `harvester_edge.png`, and cuts `panel_door.png` (8 frames: shut, edge-on, open) from `intro_panel.webp` by its difference from `intro_panel_empty.webp`. The panel close-up uses the empty painting with the door swinging open as he pulls (`pass_through` sprites, new; quick `enter_fade`, new) and he turns to us when the boards are gone; the stars scene cross-fades to `intro_orbit_starless.webp` (`backdrop` effect, new) as the harvester's edge slides across.
- **Act 1 voice pass (Nov 2026)**: every player-facing line in Act 1 (upstairs and the vents, about 1,000 unique lines) is the pilot's first-person thought in a KQ5/KQ6 tone: short, wry, lighter, every clue kept (148K → 98K characters). Death screens, hints and tutorial tips still talk to the player. The edits are a map in `scripts/voice_pass.json` (old line → new line, plus the voice guide in `_guide`) applied by `scripts/apply_voice_pass.py`, which must be re-run after `build_vent_maze_v6.py` (it regenerates vent text). Lines with recorded clips that changed lose their `voice` until re-recorded under the same file name; `voice_relink` re-attaches them once a newer clip exists (8 Stasis Hold clips pending). Story fixes on the way: the scratched route and junction markings match the v6 maze (east to the lever first), the security feeds show the drone's sweep, no stale suit-locker helmet hint, goblin-era leftovers gone.
- **A sound for every death (Nov 2026, in progress)**: `game_over` takes `sound` (default `sounds.death`). The owner's ElevenLabs clips are in `audio/deaths/` (originals in `source/`, mastered to -18 LUFS with a short fade by `master_intro_audio.py`) and `scripts/wire_death_sounds.py` sets them by death title: hunter drones `caught_drone`, too loud `caught_curator`, the gap `fall_gap`, the Gas Chamber `gas`, the fan `fan`. The ten vent deaths keep the generic sting until their clips arrive (the script already maps their titles to `purged`, `scalded`, `bitten`, `mimic`, `queen`, `drop`, `warden`, `seen`, `out_of_air`, `recovered`). Re-run it after `build_vent_maze_v6.py`.
- **Skip to the maze (TEMPORARY testing aid)**: `setting.dev_skip` (`{label, effects}`) puts a title-bar button in the player that runs those effects through `ScenarioEngine.runEffects()` (Undo returns to before it). The Harvest's hands over the 12 Act 1 items, sets the progress flags (override, alarm, prisoner freed, gap crossed, cat petted), puts the helmet on and drops you in the Ventilation Shaft. Remove `dev_skip` from scenario.json before release.
- **Opening polish from the intro audit (Nov 2026)**: the opening hands over about 27 s sooner (he stands about 2:10 in, not 2:37). Control's "long-range is acting up" (C2) is now the cutscene's first line, playing over the stars going out (it used to play over a frozen close-up); the pods scene is silent (two "Outrider, respond", not three); the catalogue, pods and dark scenes and the wake-up are shorter, and he gets up 10 s after the eyes start opening (`setting.wake.stand_by`, new) while the long wake line plays on. Camera: the cold open starts close on his helmet and pulls out to the playable picture; the stars shot pushes in on him and ends exactly where the shadow shot starts, with the pilot at the same spot and height (he used to jump to the far left). New stand-in sounds from `make_intro_placeholders.py`: `intro/audio/title_hit.mp3` under the title card and `rumble.mp3` plus a slight shake as the harvester's edge comes across. A flash now decays with an ease-out. The cinematic's **skip intro** sits top right like the prologue's. The verb nudge swells and glows if the player ignores it for 8 s (`data-nudge-calls`).
- **Tether, patrol cue, sound on exit (Nov 2026)**: the cold open has no narrator line any more: it fades in on Control's radio call (C1) and the pilot answers once play begins (`n1.mp3` unused). The pilot is clipped to LUMEN-7 by a safety tether in every shot until the beam-up: in the game (view `character.tether`, new, and sprite `tether` for the panel close-up pilot, drawn by `TetherLine.tsx`) and in the cutscenes (`rope` effects to the pilot sprite; hardpoint `TETHER_AT` in `build_intro_v2.py`). Patrol warnings now also jiggle the picture and pulse it faintly red (`patrols[].warn_cue`, new) and catch you much sooner: the hunter drone in 0.5 s (was 1.5), the vents' Wardens and the surge in 0.6 s (in `build_vent_maze_v6.py` and scenario.json). Main menu and Restart cut every sound (`client/src/audioBus.ts`: tracks every `play()`, `stopAllAudio()`, a gate that refuses stray sounds on the menu; `ScenarioEngine.dispose()`); Undo and Restart from checkpoint cut the death sting.
- **Sprite stubs**: none left. All 10 former stubs have art: vent_maintenance_hatch (`sprites/maintenance_hatch.png`), instrument_rack, corridor_emergency_panel, corridor_drag_marks, corridor_organic_growth, neural_tendril_sample, vent_old_remains, nutrient_dispenser all have chroma-keyed art; specimen_tag_hook and personal_log_crystal have procedural placeholder sprites (4-frame animated, generated via node-canvas). Both collectibles now hide on pickup via `hide_object` effect.

---

## Key Commands

```bash
# Frontend dev server
cd client && npm run dev    # http://localhost:5173

# Scenario JSONs served at
# /scenarios/the-lighthouse-keeper/scenario.json  (via Vite plugin in vite.config.ts)

# Backend (not needed for POC)
cd server && mvn spring-boot:run

# Type check (client/tsconfig.json only has project references, so plain `tsc --noEmit` checks nothing)
cd client && npx tsc -b

# Unit tests (geometry + engine walking)
cd client && npm test

# Browser test of click-to-walk in every Act 1 walking view (dev server running)
node scenarios/the-harvest/scripts/playthrough/walk.cjs

# Every browser suite in sequence (regression, intro, alarm, rope, prisoner, features, noise, patrol, walk, vents, full); dev server running
node scenarios/the-harvest/scripts/playthrough/run-all.cjs

# Rebuild the playable opening (cold open, spacewalk, panel, abduction cutscene, tutorial) after editing it
cd scenarios/the-harvest && python3 scripts/build_intro_v2.py && python3 scripts/master_intro_audio.py && cd ../..

# After adding or moving doors/floors: arrival spots by the right door
node tools/arrival-spots.mjs scenarios/the-harvest/scenario.json --views act1 --write
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

### Rebuild the vent maze (v6) after changing it
```bash
python3 scenarios/the-harvest/scripts/augment_vent_maze_v6.py                                   # only after re-running design_vent_maze_v6.py: re-adds surge, membranes, tunnels, breath 9
python3 scenarios/the-harvest/scripts/build_vent_maze_v6.py scenarios/the-harvest/scenario.json # idempotent: regenerates every act1_v6_* view and v6_* object, re-wires the special rooms
node tools/arrival-spots.mjs scenarios/the-harvest/scenario.json --views act1 --write         # exits were regenerated: refill arrival spots
cd scenarios/the-harvest && python3 scripts/draw_player_map_v6.py                               # the escapee's map + layers (needs Pillow + NumPy)
python3 scripts/build_vent_sprites_v6.py && python3 scripts/make_vent_audio_v6.py               # after new runbook art / to (re)make stand-in audio
python3 scripts/wire_death_sounds.py                                                            # the maze build rewrites vent deaths: put their death sounds back
python3 scripts/apply_voice_pass.py                                                             # and the Act 1 voice pass (the maze build brings back the old wording)
```

### Soft-lock analysis
```bash
# Exhaustive state-space search with the real engine (cone-of-influence reduced).
# Reports soft-locked states, the action that doomed them, the shortest win, and reachable deaths.
node --max-old-space-size=6000 tools/softlock-search.mjs scenarios/the-harvest/scenario.json \
  --views act1 --goal "state:airlock_override_panel!=locked"
```
Run it after any change that adds `remove_item`, `consumes: true`, irreversible `set_state`/`hide_object`, gated navigation, or dialogue choices. Meters are part of its state, cycles are always on their first phase (the player can wait), patrols and pursuers are off. To search one section on its own, start from `setting.dev_skip`:
```bash
# the v6 maze, zone by zone (each starts at the zone's checkpoint; --ignore-meters is sound because running out only kills)
N="node --max-old-space-size=7000 tools/softlock-search.mjs scenarios/the-harvest/scenario.json --views act1 --from-dev-skip --ignore-meters"
$N --then '[{"type":"set_flag","flag":"in_vents","value":"true"},{"type":"set_view","view":"act1_vent_junction"}]' --goal view:act1_v6_warren
$N --then '[{"type":"set_flag","flag":"lever_pulled","value":"true"},{"type":"set_flag","flag":"in_thin_air","value":"true"},{"type":"set_flag","flag":"helmet_torn","value":"true"},{"type":"set_view","view":"act1_v6_warren_ledge"}]' --goal flag:in_core=true
$N --then '[{"type":"set_flag","flag":"lever_pulled","value":"true"},{"type":"set_flag","flag":"in_thin_air","value":"true"},{"type":"set_flag","flag":"vesk_allied","value":"true"},{"type":"set_flag","flag":"vesk_vow","value":"swore"},{"type":"set_flag","flag":"in_core","value":"true"},{"type":"add_item","item":"lung_sac"},{"type":"add_item","item":"call_stone"},{"type":"set_view","view":"act1_v6_9_11"}]' --goal view:act1_airlock_bay
```

---

## Implementation Priority

1. ~~Implement `all_of` condition~~ DONE
2. ~~Implement `set_noise` effect, `noise_above` condition~~ DONE
3. ~~Fix coordinate scaling~~ DONE (960x720 space)
4. Add game clock for timed events (condition-triggered events DONE)
5. Implement puzzle widget UI components (keypad overlay DONE; dial, combination lock, toggle panel, sequence still TODO)
6. Implement killer AI state machine
7. ~~Fix The Harvest position data~~ DONE (all Act 1 objects within 960x720 bounds, nav z-index fix)
8. Get Lighthouse Keeper fully playable end-to-end
9. ~~Character shadow rendering~~ DONE — all sprites (character + object) support JSON-configurable shadows with offset, opacity, size. Character shadows overridable per-view. Visual editor has shadow sliders.
10. ~~Process and integrate cataloguer robot animated sprite (4-frame animation)~~ DONE
11. Voiceover narration — ElevenLabs TTS integration (script built, awaiting API key)
