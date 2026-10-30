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
│   │   │   └── ScenarioEngine.ts     ← Core: load JSON, manage state, resolve interactions
│   │   ├── components/               ← React UI components
│   │   │   ├── ScenarioPlayer.tsx    ← Main game orchestrator
│   │   │   ├── ScenarioLoader.tsx    ← Scenario selection screen
│   │   │   ├── GameView.tsx          ← Renders background + object hotspots
│   │   │   ├── VerbBar.tsx           ← Verb selection (look, hand, take, talk, use)
│   │   │   ├── InventoryPanel.tsx    ← Item display and selection
│   │   │   ├── MessagePanel.tsx      ← Story text display
│   │   │   └── NoiseIndicator.tsx    ← Noise level meter
│   │   ├── App.tsx                   ← Entry: ScenarioLoader → ScenarioPlayer
│   │   └── App.css                   ← Dark theme base styles
│   ├── public/scenarios → ../../scenarios  ← Symlink so Vite serves scenario content
│   ├── package.json                  ← React 19
│   └── vite.config.ts
├── server/                            ← Spring Boot 3 backend (Java 21, Maven)
│   └── src/main/java/com/kq/        ← Future: validation, tooling, save sync
├── scenarios/                         ← ALL scenario content (self-contained folders)
│   ├── the-lighthouse-keeper/        ← Each scenario is a folder containing:
│   │   ├── scenario.json             ←   The scenario definition
│   │   ├── design.md                 ←   Design doc (story, image prompts, patterns)
│   │   └── backgrounds/              ←   Background images for this scenario
│   ├── the-harvest/                  ← Flagship: 5 acts, 50 views, 7 endings
│   │   ├── scenario.json
│   │   ├── design.md
│   │   ├── deep-design.md
│   │   └── backgrounds/              ← 11 Act 1 backgrounds
│   └── ... (15 scenarios total, 13 with JSONs, 2 design-only)
├── docs/
│   ├── SCENARIO_SCHEMA.md            ← THE schema spec (1700+ lines) — read this first
│   └── SPATIAL_MOVEMENT_DESIGN.md    ← Deferred post-MVP spatial system design
└── .gitignore
```

---

## Self-Maintenance Rules for AI Agents

When you contribute to this project, follow these rules:

1. **Update CLAUDE.md** when you change the repo structure, add/remove files or folders, change the tech stack, make architecture decisions, add scenarios, or change the coordinate system / schema
2. **Update README.md** when you change anything user-facing: repo structure, getting started instructions, scenario list, roadmap items, tech stack
3. **Keep the scenario list current** in both CLAUDE.md and README.md when adding or removing scenarios
4. **Update "Current State"** section below when completing work
5. **Never let docs drift from reality** — if you see something outdated, fix it

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
- **960x720 coordinate space** — object positions are center-point on this grid (origin at top-left)
- Background images can be any resolution (1920x1080 recommended); the engine scales to fit
- The render viewport is 960x540 pixels; the engine maps 960x720 coordinates to this viewport

### Views
Screens/locations. Each has a background key, optional background_file, and a list of object IDs. Views can be "closeup" sub-views (e.g., zoom into a desk).

### Objects
Clickable hotspots in views. Have position (960x720 coords), size, visual appearance, state, and interactions.

### Interactions
Verb + conditions → effects. "If player uses wrench on bolt AND bolt_state is 'tight' THEN set bolt_state to 'loose' AND show message."

### Five Verbs (the only five)
| Verb | What It Does |
|------|-------------|
| `look` | Examine visually. Always safe. |
| `hand` | Touch, push, pull, open, close, manipulate. |
| `take` | Pick up and add to inventory. |
| `talk` | Speak, listen, read aloud. |
| `use_item` | Apply an inventory item to a world object. |

No other verbs exist. `hand` covers all physical manipulation (push, pull, open, close are sub-cases).

### Condition Types (14 + composites)
`flag_is`, `flag_not`, `object_state`, `has_item`, `not_has_item`, `view_is`, `noise_above`, `noise_below`, `phase_is`, `time_after`, `time_before`, `item_count`, `is_hiding`, `not_hiding`, `killer_is` + composites: `any_of`, `all_of`

### Effect Types (20+)
`message`, `random_message`, `set_flag`, `set_state`, `add_item`, `remove_item`, `set_view`, `add_noise`, `set_noise`, `show_object`, `hide_object`, `game_over`, `advance_phase`, `start_hiding`, `stop_hiding`, `transform_item`, `trigger_event`, `visual_cue`, `play_sound`, `delay_then`, `conditional_effect`

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
- **30 Design Patterns**: Documented reusable puzzle patterns

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
| `killer_is` | Stub (returns false) | 8/13 |
| **`all_of`** | **NO** | **13/13** |
| **`time_after`** | **NO** | **13/13** (events) |
| `noise_above` | NO | 1/13 |

### Effects — what's implemented vs. what scenarios use

All 20+ effect types have at least stub implementations. Missing real implementations:
- `set_noise` — used by 1 scenario (trivial to add)
- `transform_item` — schema-defined but unused
- `trigger_event` — no-op (needs events system)
- `visual_cue` — no-op (cosmetic, fine for MVP)
- `play_sound` — no-op (cosmetic, fine for MVP)

### Major Unimplemented Systems

| System | Used By | Priority |
|--------|---------|----------|
| `all_of` condition | 13/13 | CRITICAL |
| Events system | 13/13 | HIGH |
| Puzzle widgets | 13/13 | HIGH |
| Killer AI | 13/13 | MEDIUM |
| Hints | defined | LOW |

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
- **Lighthouse Keeper** is simplest (3 views) — first playtest target
- **The Harvest** is largest (50 views, 5 acts) — needs position re-transformation
- **Branch**: `claude/dreamy-volta-ha3r6v`
- **Schema-first alignment** completed — gaps identified, implementation plan ready
- **Critical gap**: `all_of` condition not implemented but used by every scenario

---

## Key Commands

```bash
# Frontend dev server
cd client && npm run dev    # http://localhost:5173

# Scenario JSONs served at
# /scenarios/the-lighthouse-keeper/scenario.json  (via public/scenarios symlink)

# Backend (not needed for POC)
cd server && mvn spring-boot:run

# Type check
cd client && npx tsc --noEmit
```

---

## Implementation Priority

1. Implement `all_of` condition (used by all 13 scenarios)
2. Implement `set_noise` effect, `noise_above` condition
3. Fix coordinate scaling (engine uses 960x720 coordinate space)
4. Add game clock + events system
5. Implement puzzle widget UI components
6. Implement killer AI state machine
7. Fix The Harvest position data
8. Get Lighthouse Keeper fully playable end-to-end
