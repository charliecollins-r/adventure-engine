# Adventure Engine

**A JSON-driven point-and-click adventure game engine inspired by the golden age of Sierra and LucasArts.**

Define an entire adventure — views, puzzles, items, narrative, and an optional AI antagonist — in a single JSON file with background art. No code required. Drop in JSON, drop in art, play.

<p align="center">
  <img src="docs/images/screenshot-harvest-gameplay.png" width="800" alt="Gameplay — The Harvest, Act 1: Stasis Hold" />
  <br />
  <em>Gameplay from "The Harvest" — waking in a stasis pod aboard an alien vessel</em>
</p>

---

## Quick Start

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`, select a scenario, and play.

<p align="center">
  <img src="docs/images/screenshot-scenario-select.png" width="700" alt="Scenario Selection Screen" />
  <br />
  <em>Choose from 13 playable scenarios spanning horror, sci-fi, thriller, and more</em>
</p>

---

## How It Works

1. Write a scenario JSON following the [schema spec](docs/SCENARIO_SCHEMA.md)
2. Paint or generate background art for each view
3. Drop both into a `scenarios/` folder
4. The engine reads the JSON and renders a fully playable point-and-click adventure

The engine is completely generic — it has no scenario-specific code. All game logic lives in the JSON: conditions gate when interactions fire, effects change the world, and the player solves puzzles through a classic five-verb interface.

For the full technical deep dive — how the engine evaluates conditions, applies effects, manages state, and renders views — see [**Architecture**](docs/ARCHITECTURE.md).

---

## The Five Verbs

Every interaction uses one of five verbs — inherited from the Sierra and LucasArts classics:

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

<p align="center">
  <img src="docs/images/screenshot-security-hub.png" width="700" alt="Gameplay — Security Hub" />
  <br />
  <em>Security Hub — organic control console with navigation between rooms</em>
</p>

---

## What You Can Build

The schema supports **30+ proven design patterns** drawn from classic adventures, horror, immersive sims, puzzle games, stealth, escape rooms, and narrative games. Mix and match to create any point-and-click experience:

**Puzzle Mechanics**
- Lock-and-key, combination locks, keypads, toggle panels, dials, sliders, sequence memory
- Multi-step item crafting and transformation chains
- State-dependent puzzles (objects change behavior based on world state)
- Environmental puzzles (noise levels, timing, positioning)

**Narrative Systems**
- Branching dialogue and multiple solution paths
- Progressive hint system (timer-based, condition-gated)
- Win/lose conditions with custom endings
- Phase-based story progression

**Advanced Features**
- **AI Antagonist** — patrol timers, noise thresholds, search thoroughness, evidence awareness, personality dialogue, phase-based escalation
- **Stealth System** — hiding spots, noise tracking, detection mechanics
- **Timed Events** — condition-triggered narrative beats, delayed effects
- **14 condition types** including composites (`any_of`, `all_of`) for complex logic
- **20+ effect types** for messages, items, state changes, visibility, game flow control

The full schema is in [`docs/SCENARIO_SCHEMA.md`](docs/SCENARIO_SCHEMA.md) — 1700+ lines of documentation covering every feature and pattern.

---

## Creating a Scenario

### 1. Create a Folder

```
scenarios/my-escape-room/
├── scenario.json          # The scenario definition
├── design.md              # Story, puzzle flow, image prompts (optional)
└── backgrounds/           # Background images for each view
    ├── main_room.webp
    └── closet.webp
```

### 2. Write the JSON

A minimal scenario needs metadata, settings, views, objects, and items:

```json
{
  "schema_version": "1.0",
  "metadata": {
    "id": "my-escape-room",
    "title": "My Escape Room",
    "description": "A short escape room scenario.",
    "difficulty": "easy",
    "estimated_minutes": 5
  },
  "setting": {
    "initial_view": "main_room",
    "ambient_text": "You're locked in a room. Find a way out."
  },
  "views": [
    {
      "id": "main_room",
      "background_file": "backgrounds/main_room.webp",
      "objects": ["door", "desk", "key_hook"]
    }
  ],
  "objects": [
    {
      "id": "door",
      "name": "Heavy Door",
      "position": { "x": 480, "y": 360 },
      "size": { "width": 200, "height": 400 },
      "visual": { "color": "rgba(139, 90, 43, 0.3)", "label": "Door" },
      "initial_state": "locked",
      "initially_visible": true,
      "interactions": [
        {
          "verb": "look",
          "response": "A heavy wooden door. It's locked tight."
        },
        {
          "verb": "use_item",
          "item": "rusty_key",
          "when": [{ "type": "object_state", "object": "door", "state": "locked" }],
          "then": [
            { "type": "message", "text": "The key turns with a satisfying click." },
            { "type": "set_state", "object": "door", "state": "unlocked" },
            { "type": "remove_item", "item": "rusty_key" }
          ]
        }
      ]
    }
  ],
  "items": [
    {
      "id": "rusty_key",
      "name": "Rusty Key",
      "description": "An old iron key, cold to the touch."
    }
  ],
  "flags": {},
  "combinations": [],
  "win_conditions": [
    {
      "id": "escaped",
      "description": "You escaped the room!",
      "conditions": [{ "type": "object_state", "object": "door", "state": "unlocked" }]
    }
  ]
}
```

### 3. Register It

Add your scenario ID to the `SCENARIOS` array in `client/src/components/ScenarioLoader.tsx`:

```typescript
const SCENARIOS = [
  'the-harvest',
  'the-lighthouse-keeper',
  // ...
  'my-escape-room',  // Add your scenario here
];
```

### 4. Coordinate System

Object positions use a **960x720 coordinate space** (origin at top-left). The engine scales this to the rendered viewport. Background images can be any resolution — 1920x1080 is recommended; the engine scales to fit.

For complete schema documentation including all condition types, effect types, and design patterns, see [`docs/SCENARIO_SCHEMA.md`](docs/SCENARIO_SCHEMA.md).

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
  <img src="scenarios/the-harvest/backgrounds/act1_stasis_hold.webp" width="400" alt="Stasis Hold" />
  <img src="scenarios/the-harvest/backgrounds/act1_security_hub.webp" width="400" alt="Security Hub" />
  <br />
  <img src="scenarios/the-harvest/backgrounds/act1_morgue.webp" width="400" alt="Morgue" />
  <img src="scenarios/the-harvest/backgrounds/act1_ventilation_shaft.webp" width="400" alt="Ventilation Shaft" />
</p>

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
|   +-- ... (15 scenarios total)
|
+-- docs/                             Engine-level documentation
|   +-- ARCHITECTURE.md               Technical deep dive — how the engine works
|   +-- SCENARIO_SCHEMA.md            THE schema spec (1700+ lines, 30 design patterns)
|   +-- SPATIAL_MOVEMENT_DESIGN.md    Future: click-to-move system (post-MVP)
|   +-- images/                       Screenshots and diagrams
|
+-- CLAUDE.md                         Project context for AI agents
+-- README.md                         You are here
```

Each scenario folder holds everything about that scenario — the JSON definition, the design document with story and image generation prompts, and the background images. A human browsing the repo can find everything about "The Lighthouse Keeper" in one place: `scenarios/the-lighthouse-keeper/`.

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

**Current architecture**: Thick client. The TypeScript `ScenarioEngine` runs entirely in the browser — loads scenario JSON, manages all game state, evaluates conditions, applies effects. React renders the view. No server needed for gameplay.

For the complete architecture breakdown, see [**docs/ARCHITECTURE.md**](docs/ARCHITECTURE.md).

---

## Art Direction

All background art follows the **Sierra King's Quest V/VI aesthetic** — 2D gouache illustration with visible brushstrokes, soft color gradients, dramatic lighting. NOT photorealistic, NOT 3D rendered.

The player character is a small goblin-sized creature at knee-height to environment inhabitants. Backgrounds are painted from this low camera angle, looking UP at furniture and architecture.

<p align="center">
  <img src="scenarios/the-harvest/backgrounds/act1_specimen_archive.webp" width="400" alt="Specimen Archive" />
  <img src="scenarios/the-harvest/backgrounds/act1_feeding_station.webp" width="400" alt="Feeding Station" />
  <br />
  <img src="scenarios/the-harvest/backgrounds/act1_processing_lab.webp" width="400" alt="Processing Lab" />
  <img src="scenarios/the-harvest/backgrounds/act1_containment_corridor.webp" width="400" alt="Containment Corridor" />
</p>

---

## Roadmap

- [x] Scenario schema specification (30 design patterns, 5 verbs, condition/effect system)
- [x] 13 complete scenario JSONs across genres
- [x] Flagship scenario deep design (The Harvest — 5 acts, 7 endings)
- [x] Background art for Act 1 of The Harvest (11 views at 1920x1080)
- [x] ScenarioEngine — pure TypeScript state machine with all condition/effect types
- [x] Scenario loader and player UI
- [x] Background image rendering with object hotspots
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
