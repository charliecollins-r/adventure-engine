# Adventure Engine — CLAUDE.md

> **Keep this file current.** Any time you add a scenario, change the architecture, add a new pattern, update the tech stack, or make a design decision — update this file. A new agent should be able to read this and contribute immediately.

---

## What This Project Is

A **JSON-driven point-and-click adventure game engine** — think "no-code adventure game builder." Authors write a single JSON file describing views, objects, items, puzzles, and an optional AI antagonist. The engine renders it as a playable Sierra-style adventure game (King's Quest V/VI aesthetic) in the browser.

**The pitch**: Drop a JSON file → get a fully playable point-and-click adventure. No code required. The JSON format is the product.

---

## Repository Layout

```
/
├── CLAUDE.md                          ← YOU ARE HERE — project bible
├── client/                            ← React + TypeScript frontend (Vite 8)
│   ├── src/
│   │   ├── engine/                    ← ScenarioEngine — pure TS state machine
│   │   │   ├── types.ts              ← TypeScript types matching SCENARIO_SCHEMA.md
│   │   │   └── ScenarioEngine.ts     ← Core: load JSON, manage state, resolve interactions
│   │   ├── components/               ← React UI components
│   │   │   ├── ScenarioPlayer.tsx    ← Main game orchestrator
│   │   │   ├── ScenarioLoader.tsx    ← Scenario selection screen
│   │   │   ├── GameView.tsx          ← Renders background + object hotspots
│   │   │   ├── VerbBar.tsx           ← Verb selection (look, take, use, etc.)
│   │   │   ├── InventoryPanel.tsx    ← Item display and selection
│   │   │   ├── MessagePanel.tsx      ← Story text display
│   │   │   └── NoiseIndicator.tsx    ← Noise level meter
│   │   ├── App.tsx                   ← Entry: ScenarioLoader → ScenarioPlayer
│   │   └── App.css                   ← Dark theme base styles
│   ├── public/scenarios → ../examples ← Symlink so Vite serves scenario JSONs
│   ├── package.json                  ← React 19, Phaser 3 (available but not used in POC)
│   └── vite.config.ts
├── server/                            ← Spring Boot 3 backend (Java 21, Maven)
│   └── src/main/java/com/kq/        ← WebSocket game server (legacy multiplayer code)
├── docs/
│   ├── SCENARIO_SCHEMA.md            ← THE schema spec (1700+ lines) — read this first
│   ├── SPATIAL_MOVEMENT_DESIGN.md    ← Deferred post-MVP spatial system design
│   └── scenarios/                    ← Full scenario documentation (14 scenarios)
│       ├── the-lighthouse-keeper.md  ← 3 views, simplest scenario
│       ├── the-harvest.md            ← 50 views, 5 acts, flagship mega-scenario
│       └── ... (12 more)
├── examples/                          ← Scenario JSON files (13 complete)
│   ├── the-lighthouse-keeper.json    ← POC target scenario
│   ├── the-harvest.json              ← Largest (130KB, 50 views)
│   └── ... (11 more)
└── assets/                            ← Generated background images (Gemini)
```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 19 + TypeScript 7 + Vite 8 | POC uses React-only rendering (no canvas) |
| Game Engine | TypeScript `ScenarioEngine` class | Pure state machine, no rendering, no side effects |
| Rendering | React components + CSS positioning | Objects as positioned divs on colored backgrounds |
| Backend | Spring Boot 3.3.5 + Java 21 + Maven | Currently legacy WebSocket code; will become tooling server |
| Future Rendering | Phaser 3.80 (already in deps) | For animations, sprites, canvas effects — post-POC |
| Image Generation | Google Gemini (Imagen 3, free tier) | Background art in Sierra KQ5/KQ6 painterly style |

---

## Architecture (Approach 1 → Approach 3)

**Current (POC)**: Approach 1 — **Thick Client**. Everything runs in the browser. TypeScript `ScenarioEngine` loads scenario JSON, manages all game state, evaluates conditions, applies effects. React renders the view. No server needed for gameplay.

**Future**: Approach 3 — **Hybrid**. Spring Boot becomes a tooling server: scenario validation, playtesting simulation, scenario editor API, save sync, analytics. Game engine stays client-side. Killer AI may move server-side for competitive multiplayer.

**Why not server-authoritative**: This is a developer platform / no-code builder, not a competitive game. No incentive for cheating. Client-side inspection is acceptable. The JSON format IS the product.

---

## The Scenario JSON Format

The complete schema is in `docs/SCENARIO_SCHEMA.md` (1700+ lines). Key concepts:

- **Views**: Screens/locations. Each has a background and a list of object IDs. Views can be "closeup" sub-views (e.g., zoom into a desk).
- **Objects**: Clickable hotspots in views. Have position, size, visual appearance, state, and interactions.
- **Interactions**: Verb + conditions → effects. "If player uses wrench on bolt AND bolt_state is 'tight' THEN set bolt_state to 'loose' AND show message."
- **Items**: Inventory objects. Collected via interactions. Have examine interactions.
- **Combinations**: Craft two items into a new one (e.g., wire + tin_can → communicator).
- **Flags**: String key/value pairs tracking game progress (e.g., `"freed_from_chain": "true"`).
- **Phases**: Game stages with different killer behavior / world state.
- **Killer**: Optional AI antagonist with patrol timers, noise thresholds, and personality.
- **Puzzle Widgets**: Special UI overlays (keypads, dials, sliders) for specific puzzles.
- **Win/Lose Conditions**: Flag/state checks that end the game.
- **30 Design Patterns**: Documented reusable puzzle patterns (gateway puzzle, dependency chain, fork, etc.).

### Condition Types
`flag_is`, `flag_not`, `object_state`, `has_item`, `not_has_item`, `in_view`, `not_in_view`

### Effect Types
`message`, `set_flag`, `set_object_state`, `give_item`, `remove_item`, `navigate`, `add_noise`, `set_visible`, `play_sound`, `trigger_event`

### Standard Verbs
`look`, `take`, `use` (alias for `use_item` with inventory item), `hand`, `talk`, `push`, `pull`, `open`, `close`

---

## Visual Style

All generated images target the **1990s Sierra On-Line King's Quest V / King's Quest VI** aesthetic:
- 2D gouache illustration, visible brushstrokes, NOT photorealistic
- 16:9 aspect ratio, 1920x1080
- Low camera angle (viewed by a small goblin creature at knee-height)
- Saturated colors even in dark scenes — shadows have visible blue/purple color, not just black
- Shared color palette per scenario anchored across all views

### The Player Character
A small goblin-sized creature, roughly 1/3 the height of environment inhabitants. Low camera angle at knee-height emphasizes the towering scale of the environment. For MVP, the player is implied to be "in the room" without a visible avatar.

### Gemini Prompt Formula
Every prompt should open with:
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.
```
And close with:
```
Low camera angle looking UP from knee-height — [scene-specific description of what that means visually]. Saturated colors despite the dark mood — [palette-specific rich color description]. No text, no UI elements, no characters.
```
Always include a shared color palette across all views in a scenario.

---

## Scenario Doc Format

Each scenario doc (`docs/scenarios/*.md`) follows this structure:
1. `# Title` + Story Synopsis
2. `## Image Descriptions & Generation Prompts` with `### How to Use These Prompts` subsection BEFORE the images
3. Each image entry: description paragraph + blockquoted Gemini prompt
4. `## Game Flow` — walkthrough by phase
5. `## Items` — inventory item list
6. `## Patterns Used` — which of the 30 design patterns apply
7. Optional: `## Schema Considerations`, `## Killer Profiles`

**No separate "Image Generation Prompts" section** — prompts are integrated with descriptions.

---

## User Preferences

- **Java backend person** with Angular/React frontend experience — stick to this stack
- Pragmatic about security for POC — client-side state inspection is fine
- Prefers depth of reasoning — multiple paragraphs per approach, not bullet points
- Values "wow factor" for first impressions — the showcase scenario should sell the platform
- Wants Gemini prompts that work **first try** — be extremely specific about style, palette, lighting

---

## Current State (keep updated)

- **13 scenario JSONs** complete in `examples/`
- **14 scenario docs** in `docs/scenarios/` (all in integrated format)
- **Engine POC** in progress: ScenarioEngine + React components being built
- **Lighthouse-keeper** is the simplest scenario (3 views) — first playtest target
- **The Harvest** is the largest (50 views, 5 acts) — stress test target
- **Blackwood Manor** still needs Acts 3-5 Gemini prompts
- **Branch**: `claude/dreamy-volta-ha3r6v`

---

## Key Commands

```bash
# Frontend dev server
cd client && npm run dev    # http://localhost:5173

# Scenario JSONs served at
/scenarios/the-lighthouse-keeper.json  # via public/scenarios symlink

# Backend (not needed for POC)
cd server && mvn spring-boot:run

# Type check
cd client && npx tsc --noEmit
```

---

## Future Direction: Spatial Movement
The spatial movement / click-to-move system is designed and documented in `docs/SPATIAL_MOVEMENT_DESIGN.md` but deferred for post-MVP. The current focus is JSON → gameplay with classic point-and-click adventuring (static backgrounds, verb-on-hotspot interactions). The spatial system adds walkable area polygons, distance-based interactions, screen-edge transitions, sprite sheet animations, and maze/hazard mechanics — all fully additive and backward-compatible. For MVP, the player is implied to be "in the room" without a visible avatar. Spatial mode can be layered on per-view later.
