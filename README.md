# Adventure Engine

**A JSON-driven point-and-click adventure game engine inspired by the golden age of Sierra and LucasArts.**

Define an entire adventure — views, puzzles, items, narrative, and an optional AI antagonist — in a single JSON file with background art. No code required. Drop in JSON, drop in art, play.

<p align="center">
  <img src="scenarios/the-harvest/backgrounds/act1_stasis_hold.webp" width="800" alt="The Stasis Hold — Act 1 of The Harvest" />
  <br />
  <em>Act 1 of "The Harvest" — a flagship scenario spanning 5 acts and 7 endings</em>
</p>

---

## How It Works

1. Write a scenario JSON following the [schema spec](docs/SCENARIO_SCHEMA.md)
2. Paint or generate background art for each view
3. Drop both into a `scenarios/` folder
4. The engine reads the JSON and renders a fully playable point-and-click adventure

The engine is completely generic — it has no scenario-specific code. All game logic lives in the JSON: conditions gate when interactions fire, effects change the world, and the player solves puzzles through a five-verb interface inherited from the classics.

---

## Repository Structure

```
adventure-engine/
|
+-- client/                           React + TypeScript + Vite
|   +-- src/
|       +-- engine/                   ScenarioEngine — pure TypeScript state machine
|       |   +-- types.ts              TypeScript types matching the schema
|       |   +-- ScenarioEngine.ts     Core: load JSON, manage state, resolve interactions
|       +-- components/               React UI components
|           +-- ScenarioPlayer.tsx    Main game orchestrator
|           +-- ScenarioLoader.tsx    Scenario selection screen
|           +-- GameView.tsx          Background + object hotspot rendering
|           +-- VerbBar.tsx           Verb selection (look, hand, take, talk, use)
|           +-- InventoryPanel.tsx    Item display and selection
|           +-- MessagePanel.tsx      Story text display
|           +-- NoiseIndicator.tsx    Noise level meter
|
+-- server/                           Spring Boot 3 + Java 21 + Maven
|   +-- src/main/java/com/kq/        WebSocket game server (future: tooling, validation)
|
+-- scenarios/                        ALL scenario content lives here
|   +-- the-lighthouse-keeper/        Each scenario is a self-contained folder
|   |   +-- scenario.json             The scenario definition
|   |   +-- design.md                 Design document (story, prompts, patterns)
|   |   +-- backgrounds/              Background images for this scenario
|   +-- the-harvest/                  Flagship: 5 acts, 50 views, 7 endings
|   |   +-- scenario.json
|   |   +-- design.md
|   |   +-- deep-design.md            Decision trees, level maps, puzzle evaluations
|   |   +-- backgrounds/              11 painted backgrounds (Act 1)
|   +-- ... (15 scenarios total)
|
+-- docs/                             Engine-level documentation
|   +-- SCENARIO_SCHEMA.md            THE schema spec (1700+ lines, 30 design patterns)
|   +-- SPATIAL_MOVEMENT_DESIGN.md    Future: click-to-move system (post-MVP)
|
+-- CLAUDE.md                         Project bible for AI agents
+-- README.md                         You are here
```

### Key principle: scenarios are self-contained

Each scenario folder holds everything about that scenario — the JSON definition, the design document with story and image generation prompts, and the background images. A human browsing the repo can find everything about "The Lighthouse Keeper" in one place: `scenarios/the-lighthouse-keeper/`.

The client serves scenarios via a symlink (`client/public/scenarios -> ../../scenarios`), so Vite serves them directly during development.

---

## The Five Verbs

Every interaction uses one of five verbs — the same icons Sierra and LucasArts used:

| Verb | What It Does |
|------|-------------|
| **Look** | Examine visually. Always safe. The discovery verb. |
| **Hand** | Touch, push, pull, open, close, manipulate physically. |
| **Take** | Pick up an object and add it to inventory. |
| **Talk** | Speak, listen, read aloud, whisper, shout. |
| **Use** | Apply an inventory item to a world object. The puzzle verb. |

Interactions are gated by **conditions** (what must be true) and produce **effects** (what changes):

```json
{
  "verb": "use_item",
  "item": "wire_cutters",
  "when": [
    { "type": "object_state", "object": "window", "state": "mesh_intact" }
  ],
  "then": [
    { "type": "message", "text": "You cut through the wire mesh. Cold air rushes in." },
    { "type": "set_state", "object": "window", "state": "mesh_cut" },
    { "type": "add_noise", "amount": 25 }
  ],
  "noise": 0
}
```

---

## Scenarios

15 scenario designs spanning genres from cozy kids adventures to psychological horror. 13 have complete JSON definitions ready to play:

| Scenario | Genre | Views | Difficulty |
|----------|-------|-------|-----------|
| [The Wizard's Apprentice](scenarios/the-wizards-apprentice/) | Kids / Cozy | 8 | Easy |
| [The Lighthouse Keeper](scenarios/the-lighthouse-keeper/) | Atmospheric | 3 | Medium |
| [The Last Signal](scenarios/the-last-signal/) | Sci-Fi | 3 | Medium |
| [Pressure Point](scenarios/pressure-point/) | Thriller | 4 | Medium |
| [The Seance Room](scenarios/the-seance-room/) | Gothic | 3 | Medium |
| [The Memory Dealer](scenarios/the-memory-dealer/) | Sci-Fi Noir | 3 | Medium |
| [The Abandoned Ward](scenarios/the-abandoned-ward/) | Medical Horror | 5 | Hard |
| [The Defector's Gambit](scenarios/the-defectors-gambit/) | Cold War Espionage | 4 | Hard |
| [The Taxidermist](scenarios/the-taxidermist/) | Southern Gothic | 4 | Hard |
| [The Butcher's Debt](scenarios/the-butchers-debt/) | Horror | 4 | Hard |
| [The Dollmaker's Workshop](scenarios/the-dollmakers-workshop/) | Psychological Horror | 5 | Hard |
| [The Pharaoh's Architect](scenarios/the-pharaohs-architect/) | Historical | 24 | Hard |
| [The Harvest](scenarios/the-harvest/) | Sci-Fi Epic | 50 | Epic |
| [Blackwood Manor](scenarios/blackwood-manor/) | Gothic Mystery | — | *Design only* |
| [The Clockmaker's Secret](scenarios/the-clockmakers-secret/) | Steampunk | — | *Design only* |

### The Harvest (Flagship)

A full-length adventure spanning **5 acts, 50 views, and 7 possible endings** including a hidden ending that rewards empathy across the entire game. The player wakes in a stasis pod aboard an alien vessel, escapes containment, navigates the ship, descends to a dying planet, explores a dead city, and confronts the parasitic Convergence in its nexus.

<p align="center">
  <img src="scenarios/the-harvest/backgrounds/act1_specimen_archive.webp" width="400" alt="Specimen Archive" />
  <img src="scenarios/the-harvest/backgrounds/act1_security_hub.webp" width="400" alt="Security Hub" />
  <br />
  <img src="scenarios/the-harvest/backgrounds/act1_morgue.webp" width="400" alt="Morgue" />
  <img src="scenarios/the-harvest/backgrounds/act1_ventilation_shaft.webp" width="400" alt="Ventilation Shaft" />
</p>

---

## Schema Highlights

The full schema is in [`docs/SCENARIO_SCHEMA.md`](docs/SCENARIO_SCHEMA.md) — 1700+ lines covering every feature. Key capabilities:

- **14 condition types** — flag checks, item checks, object state, noise levels, time, phase, killer state, composites (`any_of`, `all_of`)
- **20+ effect types** — messages, items, state changes, visibility, noise, phases, game over, hiding, timed delays, conditional branching
- **Puzzle widgets** — combination locks, keypads, toggle panels, dials, sliders, sequence memory — pre-built UI components parameterized by JSON
- **AI antagonist** (optional) — patrol timers, noise thresholds, search thoroughness, evidence awareness, personality dialogue, phase-based escalation
- **30 design patterns** — proven puzzle structures from classic adventures, horror, immersive sims, puzzle games, stealth, escape rooms, and narrative games
- **Progressive hints** — timer-based, condition-gated help system
- **Multiple solution paths** — documented paths for validation and playtesting

---

## Quick Start

### Prerequisites

- **Node.js 18+** (client)
- **Java 21** + **Maven 3.9+** (server — not needed for the scenario engine POC)

### Run the Client

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`, select a scenario, and play.

### Type Check

```bash
cd client
npx tsc --noEmit
```

---

## Creating a Scenario

1. **Create a folder** in `scenarios/` with your scenario ID (e.g., `scenarios/my-escape-room/`)
2. **Write `scenario.json`** following the [schema spec](docs/SCENARIO_SCHEMA.md)
3. **Add background images** in a `backgrounds/` subfolder — any resolution (1920x1080 recommended), the engine scales to fit
4. **Write `design.md`** documenting the story, puzzle flow, and image generation prompts
5. **Add your scenario ID** to the `SCENARIOS` array in `client/src/components/ScenarioLoader.tsx`

Object positions use a **960x720 coordinate space** (origin at top-left). The engine maps this to the rendered viewport.

---

## Art Direction

All background art follows the **Sierra King's Quest V/VI aesthetic** — 2D gouache illustration with visible brushstrokes, soft color gradients, dramatic lighting. NOT photorealistic, NOT 3D rendered.

The player character is a small goblin-sized creature at knee-height to environment inhabitants. Backgrounds are painted from this low camera angle, looking UP at furniture and architecture. Every scene has two layers: the surface layer (tabletops, shelves — requires creativity to reach) and the floor layer (under-table passages, kicked-aside objects — your domain).

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 19 + TypeScript + Vite 8 | Pure React rendering (no canvas) |
| Engine | TypeScript `ScenarioEngine` | Pure state machine — no rendering, no side effects |
| Rendering | React components + CSS positioning | Objects as positioned divs on painted backgrounds |
| Backend | Spring Boot 3.3.5 + Java 21 + Maven | Future: validation, tooling, save sync |
| Future Rendering | Phaser 3.80 (in deps) | For animations, sprites, canvas effects — post-POC |
| Image Generation | Google Gemini (Imagen 3) | Background art in Sierra KQ5/KQ6 style |

---

## Architecture

**Current (POC)**: Thick client. The TypeScript `ScenarioEngine` runs entirely in the browser — loads the scenario JSON, manages all game state, evaluates conditions, applies effects. React renders the view. No server needed for gameplay.

**Future**: Hybrid. Spring Boot becomes a tooling server for scenario validation, playtesting simulation, save sync, and analytics. The game engine stays client-side. Killer AI may move server-side for competitive multiplayer.

---

## Roadmap

- [x] Scenario schema specification (30 design patterns, 5 verbs, condition/effect system)
- [x] 13 complete scenario JSONs across genres
- [x] Flagship scenario deep design (The Harvest — 5 acts, 7 endings)
- [x] Background art for Act 1 of The Harvest (11 views at 1920x1080)
- [x] ScenarioEngine (TypeScript state machine)
- [x] Scenario loader and player UI
- [x] Background image rendering
- [ ] `all_of` condition + missing condition/effect types
- [ ] Events system (timed/conditional narrative beats)
- [ ] Puzzle widget UI components
- [ ] Killer AI state machine
- [ ] Scenario validation tooling
- [ ] Sound/music system
- [ ] Spatial movement system (click-to-move, walkable areas)
- [ ] Multiplayer mode

---

## License

TBD
