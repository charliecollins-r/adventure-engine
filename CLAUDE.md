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
│   │   ├── closeups/                 ←   Detail images for show_closeup effect
│   │   └── sprites/                  ←   Character sprite sheets
│   └── ... (15 scenarios total, 13 with JSONs, 2 design-only)
├── docs/
│   ├── SCENARIO_SCHEMA.md            ← THE schema spec (1700+ lines) — full JSON reference
│   ├── ARCHITECTURE.md               ← Engine internals (diagrams, data flow)
│   ├── SPATIAL_MOVEMENT_DESIGN.md    ← Deferred post-MVP spatial system design
│   └── images/                       ← Screenshots for README
├── tools/
│   ├── splice-sprites.mjs            ← Node.js sprite sheet splicing utility
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
`flag_is`, `flag_not`, `object_state`, `has_item`, `not_has_item`, `view_is`, `noise_above`, `noise_below`, `phase_is`, `time_after`, `time_before`, `item_count`, `is_hiding`, `not_hiding`, `killer_is` + composites: `any_of`, `all_of`

### Effect Types (20+)
`message`, `random_message`, `set_flag`, `set_state`, `add_item`, `remove_item`, `set_view`, `add_noise`, `set_noise`, `show_object`, `hide_object`, `set_animation`, `show_closeup`, `show_dialogue`, `game_over`, `advance_phase`, `start_hiding`, `stop_hiding`, `transform_item`, `trigger_event`, `visual_cue`, `play_sound`, `delay_then`, `conditional_effect`, `set_character`

### Other Systems
- **Items**: Inventory objects with examine interactions
- **Combinations**: Craft two items into a new one
- **Flags**: String key/value pairs tracking game progress
- **Phases**: Game stages with different killer behavior / world state
- **Killer**: Optional AI antagonist with patrol timers, noise thresholds, personality
- **Puzzle Widgets**: Special UI overlays (keypads, dials, sliders) for specific puzzles
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
| Puzzle widgets | 13/13 | HIGH |
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
- **Character sprite system**: Sierra-style sprite sheet rendering on top of backgrounds. `CharacterSprite` component uses CSS background-position to show frames from sprite sheets. Supports animated walk cycles and static poses. Per-view character placement in scenario JSON. Dynamic state changes via `set_character` effect. Sprite sheets go in scenario `sprites/` subfolder. Splicing tool at `tools/splice-sprites.mjs`. The Harvest has character placements for all 9 Act 1 views — awaiting sprite sheet image files.
- **Dialogue choice system**: `show_dialogue` effect pauses gameplay and shows a branching conversation modal (`DialogueOverlay` component). Each choice has a label, optional `when` conditions (hidden if not met), and `then` effects array. Engine methods: `getDialogue()`, `selectDialogueChoice(index)`, `dismissDialogue()`. First use: caged prisoner in feeding station with 4 branching choices that set different `prisoner_bond` values affecting all subsequent interactions. Documented in SCENARIO_SCHEMA.md.
- **Object sprite system**: `SpriteObject` component renders animated sprite sheets on world objects. Defined via `sprite` field in object JSON: `{ file, frame_width, frame_height, columns, rows, frame_rate, scale }`. Uses CSS background-position with requestAnimationFrame. Bottom-center anchored at z-index 4. First uses: caged_prisoner (pacing animation), holographic_display (spinning planets).
- **Room name labels**: Bottom-right of viewport shows the current view's `name` field subtly in gold. Bottom at 26px to avoid overlapping the hint "?" button.
- **Back navigation button**: Views with `back_label` show a "Back to X" button at top-left. Only on closeup-style sub-views, not on main rooms.
- **Act 1 fully solvable**: Playwright audit confirms all 9 rooms navigable, all 11 items collectible, all key flags settable, all 4 dialogue branches functional. Walkthrough at `scenarios/the-harvest/walkthrough.md` with ASCII deck map, critical path table, and room-by-room guide.
- **Interactive scenario map**: Published artifact at claude.ai showing Act 1 room graph, item locations, puzzle chains, and 30-step walkthrough. Keep this updated when rooms, items, or puzzles change. Data extracted from scenario JSON.
- **Cataloguer robot closeup**: Spider-legged drone in Stasis Hold with static sprite (frame_rate=0). Looking or touching navigates to `act1_cataloguer_closeup` sub-view — a full interactive view using the specimen image as background with `back_label: "Stasis Hold"`. Five interactive objects (3 specimen tanks, data plates, cataloguer mechanism) with look/hand/talk responses. Data plates interaction discovers section code 7319 (sets `lab_code_known`). Sub-views support all 4 verbs, unlike the old `show_closeup` overlay which was hand-only. Character override only applies when the current view has a `character` placement — views without one (like closeup sub-views) show no character sprite.
- **Engine bug fixes**: `evaluateConditions()` now handles undefined/missing `when` arrays gracefully. `flag_is`/`flag_not` conditions without explicit `value` default to checking against `"true"` (previously compared against `undefined`, breaking conditions like `flag_not security_sequence_known`).
- **Vent cover in corridor**: Ventilation shaft entrance moved from Feeding Station to Containment Corridor. A `vent_cover` object with a sprite grate graphic (`sprites/vent_cover.png`) is always visible in the corridor floor (bottom-left) but gated by `security_locks_overridden` — trying to enter before overriding security shows a locked message. Navigation graph: Corridor → Vent Shaft → Airlock Bay. Vent shaft back-nav returns to corridor.
- **Standup intro animation**: When the game starts and the intro text is dismissed, the goblin plays an 8-frame stand-up animation (`sprites/goblin_standup.png`) during the fade-from-black transition, then transitions to the idle sprite. Implemented via `loop: false` on SpriteSet (plays once, holds last frame) and ScenarioPlayer managing the standup→idle character override. CharacterSprite resets frame counter when sprite_set changes.
- **Portability audit complete**: All scenario-specific hardcoding removed from engine and components. Zero references to "the-harvest" or any scenario-specific assets in `client/src/`. Changes: (1) App.tsx restored ScenarioLoader instead of hardcoded CAMPAIGN_ID, (2) ScenarioPlayer.tsx sound effects now read from `setting.sounds` in JSON instead of hardcoded paths, (3) AmbientCanvas.tsx rewritten to read `ambient_lighting` from view JSON instead of hardcoded presets, (4) ScenarioLoader.tsx reads from `scenarios/manifest.json` for auto-discovery, (5) All asset URL construction centralized through `resolveAsset()` utility. A third-party scenario needs only JSON + asset folders — no engine changes.
- **Centralized asset resolver**: `client/src/engine/assetResolver.ts` exports `resolveAsset(scenarioId, relativePath)` and `setAssetBase(url)`. All 8 components that load scenario assets (backgrounds, sprites, sounds, icons, closeups) route through this single function. Default behavior serves from `/scenarios/{id}/`, but `setAssetBase()` can redirect all asset loading to a different origin (CDN, blob URL from zip extraction, etc.) — one line change to support any deployment model.
- **JSON-driven sound effects**: `setting.sounds` object in scenario JSON with optional `room_transition`, `item_pickup`, and `intro_voice` paths. Engine plays these on the corresponding events. Scenarios without sounds simply don't play any — no errors.
- **JSON-driven ambient lighting**: Per-view `ambient_lighting` object with `lights` array and optional `flicker` flag. Each light has `x`, `y` (0-1 normalized), `radius`, `color` [r,g,b], `pulse_speed`, `pulse_amount`, `alpha`, and optional `phase`. Views without `ambient_lighting` show no canvas overlay. Moved from hardcoded AmbientCanvas.tsx presets into The Harvest's scenario.json.
- **Scenario manifest**: `scenarios/manifest.json` lists all available scenario folder names. ScenarioLoader reads this on startup to populate the picker. Adding a new scenario = add folder with scenario.json + add ID to manifest.json.
- **MVP menu restriction**: Manifest currently includes only `the-harvest`. ScenarioLoader auto-launches when a single scenario is available — no picker screen. Upload button preserved for custom JSONs. Other scenario folders remain on disk for future re-introduction.
- **New player character sprites**: Replaced goblin with bearded human in green tunic. Three sprite sheets: `character_idle.png` (1×2, right+front), `character_walk.png` (4×2, right walk+front walk at 6fps), `character_standup.png` (4×1, lying→standing at 3fps, no loop). Frame size 300×447, scale 0.35. Left-facing via CSS scaleX(-1) flip. Old goblin sprites removed.
- **Voiceover narration tool**: `tools/generate-voiceover.mjs` extracts all player-facing text from a scenario JSON (intro, ambient, messages, dialogue, game over, hints) and batch-generates MP3 files via the ElevenLabs TTS API. Supports `--dry-run` to preview without API calls, `--filter <category>` to generate only specific types, `--force` to regenerate existing files, and `--list-voices` to browse available voices. Saves to `scenarios/<id>/audio/voice/` with a manifest.json. Requires `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` environment variables. The Harvest has 1,489 text entries (~193K characters). Free tier gives 10K chars/month — prioritize intro narration first (`--filter intro`, 706 chars).
- **Scenario-builder skill**: `.claude/skills/scenario-builder/SKILL.md` — comprehensive AI agent onboarding guide (1100+ lines) covering package structure, background image generation (Gemini prompt formula), sprite creation (blue chroma-key workflow), full JSON authoring, coordinate system, ambient lighting, a 3-room template, and pre-flight checklist.
- **In-game DevPanel**: `DevPanel.tsx` — 5-tab developer tools panel activated via `?dev` URL parameter. Tabs: Views (jump to any view), Objects (position/size/visibility), Character (live animated sprite preview with facing/sprite_set controls), Sprites (browse all sprite sheets with animation), Export (paste-to-Claude format + JSON patch). Auto-enables debug mode and skips intro. Layout shifts to 960px game + 340px panel side-by-side.
- **Standalone Visual Editor**: `client/public/editor.html` — full visual editor for scenario authors. Shows actual animated sprites (character + object sprites) on backgrounds, hotspot boxes with drag/resize, character controls panel (sprite set, facing, animation play/pause), toggleable hotspot/sprite overlays, coordinate display, and 3-tab export (human-readable changes, JSON patch, full view JSON). Unified sprite box (single interactive element for sprite objects instead of separate hotspot + visual boxes). Shadow controls with sliders for offset, opacity, width, height per sprite per view. Accessible at `/editor.html` when dev server is running.
- **Sprite shadow system**: All sprites (character and object) support JSON-configurable shadows via `shadow` property. Object shadows go on the object definition alongside `sprite`. Character shadows set globally on `character` config and optionally overridden per-view in character placement. Shadow properties: `offset_x`, `offset_y`, `width`, `height`, `opacity`, `color`. Visual editor provides real-time shadow sliders. Implemented in `SpriteObject.tsx` and `CharacterSprite.tsx`.
- **Security console closeup**: `act1_security_closeup` sub-view with 5 objects: bio-organic keypad (requires code 7319 from data plates), override lever (requires active console, triggers containment lock override + 20 noise), key card drawer (moved from main security hub view), surveillance feeds (shows Curator patrol when active), system status display. Multi-step puzzle replaces old 3-click console solve. `back_label: "Security Hub"`.
- **Item use overhaul (Act 1)**: 7 new use_item interactions give previously unused items purpose: glass shard + organic growth (reveals scratched message from previous prisoner), stasis fluid vial + reading device (enhances reader), specimen tag + reader (reveals species classification), nutrient paste + prisoner (feeds prisoner, strengthens bond), neural tendril + holographic display (reveals Convergence heading to Earth), cat hair + examination tables (DNA analysis reveals cat was processed), surgical probe + keypad/lever (flavor interactions with noise). Fixed missing `has_item` conditions on reading_device and airlock_override_panel.
- **Hitbox fixes**: corridor_pipes width 965→960, personal_log_crystal 20x53→50x70, broken_pod repositioned to (160,560) with size 150x100.
- **Sprite stubs**: 10 objects have sprite config stubs awaiting art: specimen_tag_hook, instrument_rack, corridor_emergency_panel, corridor_drag_marks, corridor_organic_growth (4-frame animated), neural_tendril_sample (4-frame animated), vent_old_remains, vent_maintenance_hatch, nutrient_dispenser, personal_log_crystal (4-frame animated).

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
