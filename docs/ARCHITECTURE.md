# Architecture Deep Dive

> **How the Adventure Engine works under the hood** — from JSON file to playable game.

Technical reference for developers who want to understand, extend, or build on the engine. For the JSON authoring specification, see [SCENARIO_SCHEMA.md](SCENARIO_SCHEMA.md). For the project overview, see the [README](../README.md).

---

## Table of Contents

- [System Overview](#system-overview)
- [The ScenarioEngine](#the-scenarioengine)
- [Condition System](#condition-system)
- [Effect System](#effect-system)
- [Interaction Resolution](#interaction-resolution)
- [View Navigation](#view-navigation)
- [The Five Verbs](#the-five-verbs)
- [The React Layer](#the-react-layer)
- [Coordinate System](#coordinate-system)
- [Scenario JSON Format](#scenario-json-format)
- [Design Patterns](#design-patterns)
- [Future Systems](#future-systems)

---

## System Overview

The Adventure Engine is a **pure client-side state machine**. No server is required for gameplay. The entire pipeline is:

```
scenario.json + background art  →  ScenarioEngine (TypeScript)  →  React components  →  playable game
```

The engine has three strict layers:

| Layer | Responsibility | Side Effects |
|-------|---------------|--------------|
| **Scenario JSON** | Define the entire game — views, objects, puzzles, narrative | Static data |
| **ScenarioEngine** | State management, condition evaluation, effect application | None (pure state machine) |
| **React Components** | Render engine state as interactive UI | DOM updates only |

This separation means the engine can be tested without a browser, scenarios can be validated without rendering, and the renderer can be swapped (React → Phaser → terminal) without touching game logic. The engine never calls React; React polls the engine.

---

## The ScenarioEngine

`ScenarioEngine` (`client/src/engine/ScenarioEngine.ts`) is the heart of the system — a single TypeScript class (~580 lines) with no rendering logic, no DOM access, and no side effects beyond internal state mutation (plus `setTimeout` for `delay_then`).

### Construction and Initialization

When a scenario JSON is loaded, the constructor:

1. **Sets the initial view** from `scenario.setting.initial_view`
2. **Copies initial flags** from `scenario.flags` (shallow copy so mutations don't affect the source)
3. **Builds O(1) lookup indexes** — `Map<string, ScenarioObject>` and `Map<string, Item>` for instant access by ID
4. **Records initial state** — each object's `initial_state` and `initially_visible` go into fast-lookup dictionaries
5. **Sets the initial phase** — first entry in `scenario.phases`, if any
6. **Applies first phase effects** — runs `on_enter` effects for the initial phase (typically the opening narrative)

```typescript
constructor(scenario: Scenario) {
  this._currentViewId = scenario.setting.initial_view;
  this.flags = { ...scenario.flags };

  this.objectIndex = new Map();
  for (const obj of scenario.objects) {
    this.objectIndex.set(obj.id, obj);
    this.objectStates[obj.id] = obj.initial_state;
    this.objectVisibility[obj.id] = obj.initially_visible;
  }

  this.itemIndex = new Map();
  for (const item of scenario.items) {
    this.itemIndex.set(item.id, item);
  }

  if (this._currentPhaseId && scenario.phases?.[0]?.on_enter) {
    this.applyEffects(scenario.phases[0].on_enter);
  }
}
```

### State Fields

| Field | Type | Purpose |
|-------|------|---------|
| `_currentViewId` | `string` | Which view (screen/room) the player is in |
| `flags` | `Record<string, string>` | Key-value pairs tracking game progress |
| `objectStates` | `Record<string, string>` | Current state of each object (e.g., `"locked"`, `"open"`) |
| `objectVisibility` | `Record<string, boolean>` | Whether each object is visible in its view |
| `inventory` | `string[]` | IDs of items the player carries |
| `_noiseLevel` | `number` | 0–100 noise meter (triggers killer attention) |
| `_messages` | `string[]` | Current messages to display |
| `viewHistory` | `string[]` | Stack of previous view IDs for back-navigation |
| `_gameOver` | `GameOverResult \| null` | Win/lose state |
| `_currentPhaseId` | `string \| null` | Current game phase |
| `_isHiding` | `boolean` | Whether the player is hiding from the killer |

All state is exposed through read-only getter methods. The engine never hands out mutable references.

### Key Methods

| Method | Purpose |
|--------|---------|
| `interact(objectId, verb, itemId?)` | Primary game action — resolve verb + object + conditions → effects |
| `navigateToView(viewId)` | Push current view to stack and move to new view |
| `navigateBack()` | Pop view stack and return to previous view |
| `combineItems(itemA, itemB)` | Attempt to combine two inventory items |
| `examineItem(itemId, verb)` | Use a verb on an inventory item |
| `getVisibleObjects()` | Return objects in the current view whose visibility is `true` |
| `getAvailableVerbs(objectId)` | Scan interactions to find which verbs have satisfied conditions |
| `getUsableItems(objectId)` | Find which inventory items have valid `use_item` interactions on this object |
| `dismissMessages()` | Clear the current message queue |
| `decayNoise(amount)` | Reduce noise level (used by killer AI timing) |

---

## Condition System

Conditions are the gating mechanism. Every interaction has a `when` array of conditions. All must be true (implicit AND) for the interaction to fire.

```typescript
private evaluateConditions(conditions: Condition[]): boolean {
  if (conditions.length === 0) return true;  // empty = always matches
  for (const c of conditions) {
    if (!this.evaluateCondition(c)) return false;
  }
  return true;
}
```

An empty `when` array always passes — unconditional interactions fire regardless of game state.

### Condition Types

| Type | Tests | Fields |
|------|-------|--------|
| `flag_is` | A flag equals a specific value | `flag`, `value` |
| `flag_not` | A flag does NOT equal a value | `flag`, `value` |
| `object_state` | An object is in a specific state | `object`, `state` |
| `has_item` | Player has an item in inventory | `item` |
| `not_has_item` | Player does NOT have an item | `item` |
| `view_is` | Player is in a specific view | `view` |
| `not_in_view` | Player is NOT in a specific view | `view` |
| `phase_is` | Game is in a specific phase | `phase` |
| `is_hiding` | Player is currently hiding | *(none)* |
| `not_hiding` | Player is NOT hiding | *(none)* |
| `noise_above` | Noise level exceeds threshold | `threshold` |
| `noise_below` | Noise level is below threshold | `threshold` |
| `item_count` | Player has at least N items | `count` |
| `killer_is` | Killer AI is in a specific state | *(stub — returns `false`)* |

### Composite Conditions

Two composite types allow complex boolean logic:

| Type | Behavior |
|------|----------|
| `all_of` | `conditions.every(sub => evaluate(sub))` — logical AND |
| `any_of` | `conditions.some(sub => evaluate(sub))` — logical OR |

Composites nest arbitrarily:

```json
{
  "type": "all_of",
  "conditions": [
    { "type": "has_item", "item": "keycard" },
    {
      "type": "any_of",
      "conditions": [
        { "type": "flag_is", "flag": "hacked_terminal", "value": "true" },
        { "type": "object_state", "object": "door_panel", "state": "overridden" }
      ]
    }
  ]
}
```

*"Player has the keycard AND (has hacked the terminal OR overridden the door panel)."*

Since the top-level `when` array is an implicit AND, `all_of` is mainly useful inside `any_of` for nested logic. Every scenario uses `all_of`; 11 of 13 use `any_of`.

**Default behavior:** Unknown condition types return `true` — the engine fails open, preventing undefined future condition types from breaking existing scenarios.

---

## Effect System

Effects mutate game state. When an interaction matches, its `then[]` array executes in order. The `applyEffects` method returns an array of message strings for display.

### Effect Types

**Narrative:**

| Type | Fields | Action |
|------|--------|--------|
| `message` | `text` | Display a message to the player |
| `random_message` | `messages[]` | Pick and display a random message from the list |

**State mutation:**

| Type | Fields | Action |
|------|--------|--------|
| `set_flag` | `flag`, `value` | Set a progress flag (defaults to `"true"`) |
| `set_state` | `object`, `state` | Change an object's state string |
| `add_item` | `item` | Add item to inventory (no duplicates) |
| `remove_item` | `item` | Remove item from inventory |
| `show_object` | `object` | Make an object visible in its view |
| `hide_object` | `object` | Make an object invisible |
| `transform_item` | `item`, `into` | Replace one inventory item with another in-place |

**Navigation:**

| Type | Fields | Action |
|------|--------|--------|
| `set_view` | `view` | Navigate to a different view (pushes current to history stack) |

**Noise:**

| Type | Fields | Action |
|------|--------|--------|
| `add_noise` | `amount` | Increase noise level (clamped to 100) |
| `set_noise` | `amount` | Set noise level to an exact value (clamped 0–100) |

**Game flow:**

| Type | Fields | Action |
|------|--------|--------|
| `game_over` | `result` (win/lose), `reason` | End the game with a message |
| `advance_phase` | `phase` | Move to a new phase, run its `on_enter` effects |
| `start_hiding` | *(none)* | Player enters hiding |
| `stop_hiding` | *(none)* | Player exits hiding |

**Temporal and conditional:**

| Type | Fields | Action |
|------|--------|--------|
| `delay_then` | `seconds`, `effects[]` | Run nested effects after a delay via `setTimeout` |
| `conditional_effect` | `when[]`, `then[]`, `else[]` | Branch: if conditions met, run `then`; otherwise `else` |

**Stub (no-op, pending implementation):**

| Type | Purpose |
|------|---------|
| `visual_cue` | Screen effects (flicker, shake) |
| `play_sound` | Audio playback |
| `trigger_event` | Activate a scenario event |

### Branching Effects: conditional_effect

Effects can branch on runtime conditions, enabling if/else logic within a single interaction:

```json
{
  "type": "conditional_effect",
  "when": [{ "type": "flag_is", "flag": "alarm_disabled", "value": "true" }],
  "then": [{ "type": "message", "text": "You slip through undetected." }],
  "else": [
    { "type": "message", "text": "The alarm blares!" },
    { "type": "add_noise", "amount": 50 }
  ]
}
```

### Deferred Effects: delay_then

`delay_then` uses `setTimeout` to schedule effects in the future. Delayed effects run independently and push messages directly to `_messages`. The engine re-checks win/lose conditions after each delayed batch:

```typescript
case 'delay_then':
  setTimeout(() => {
    const delayMessages = this.applyEffects(delayedEffects);
    this._messages.push(...delayMessages);
    this.checkGameEndConditions();
  }, delayMs);
```

This enables timed narrative beats: "The door creaks open." → *(3 seconds)* → "Footsteps echo in the hallway."

---

## Interaction Resolution

This is the core game loop — what happens when the player clicks an object with a verb selected.

### Step 1: The `interact` Method

```typescript
interact(objectId: string, verb: string, itemId?: string): InteractionResult
```

1. If the game is over, return early
2. Look up the object by ID from `objectIndex`
3. Translate `use` verb to `use_item` when an item is selected
4. Search for a matching interaction
5. If none found: return the object's `description` for `look`, or a default failure message for other verbs
6. If found: apply effects, add noise, check win/lose conditions

### Step 2: Finding a Matching Interaction

```typescript
private findMatchingInteraction(interactions, verb, itemId?): Interaction | null {
  for (const interaction of interactions) {
    if (interaction.verb !== verb) continue;
    if (verb === 'use_item' && interaction.item !== itemId) continue;
    if (this.evaluateConditions(interaction.when)) {
      return interaction;
    }
  }
  return null;
}
```

Interactions are searched **in order**. The first one whose verb matches, whose item matches (for `use_item`), and whose conditions all pass is selected. **Order matters** — scenario authors list more specific interactions before general fallbacks.

### Concrete Example

From The Lighthouse Keeper — the ankle chain has multiple look interactions gated on different states:

```json
{
  "verb": "look",
  "when": [{ "type": "object_state", "object": "chain", "state": "locked" }],
  "then": [
    { "type": "message", "text": "One link near the floor bolt is paper-thin with rust. If you could weaken it further..." },
    { "type": "set_flag", "flag": "awake", "value": "true" }
  ]
},
{
  "verb": "look",
  "when": [{ "type": "object_state", "object": "chain", "state": "greased" }],
  "then": [
    { "type": "message", "text": "The grease is eating into the corroded link. One good yank should do it." }
  ]
}
```

The engine tries the first `look` interaction: is chain state `"locked"`? If yes, show the locked description and set the awake flag. If not, try the second: is chain state `"greased"`? The state evolves as the player progresses, and different interactions fire for the same verb+object combination.

### Win/Lose Checking

After every interaction and delayed effect batch, the engine scans `win_conditions` and `lose_conditions`:

```typescript
private checkGameEndConditions(): void {
  if (this._gameOver) return;
  for (const wc of this.scenario.win_conditions ?? []) {
    if (wc.conditions && this.evaluateConditions(wc.conditions)) {
      this._gameOver = { won: true, conditionId: wc.id, text: wc.description };
      return;
    }
  }
  // ...same for lose_conditions with won: false
}
```

---

## View Navigation

Views are the screens of the game. Each view has a unique `id`, an optional background image, and a list of object IDs (references into the top-level `objects` array).

### Forward Navigation

Navigation between views is handled entirely by `set_view` effects on navigation objects:

```json
{
  "id": "nav_stasis_hold_to_pod_cluster",
  "name": "Pod Cluster Passage",
  "interactions": [{
    "verb": "hand",
    "when": [],
    "then": [
      { "type": "message", "text": "You move to Pod Cluster." },
      { "type": "set_view", "view": "act1_pod_cluster" }
    ]
  }]
}
```

When `set_view` fires, the current view is pushed onto `viewHistory` and the new view becomes active:

```typescript
case 'set_view':
  this.viewHistory.push(this._currentViewId);
  this._currentViewId = e.view;
```

### Back Navigation

The `viewHistory` acts as a stack. `navigateBack()` pops the most recent view:

```typescript
navigateBack(): void {
  const previous = this.viewHistory.pop();
  if (previous) {
    this._currentViewId = previous;
    this._messages = [];
  }
}
```

The UI shows a "< Back" button when `viewHistory` is non-empty or the view has a `back_label`.

### Conditional Navigation

Navigation can be gated by conditions — locked doors, hidden passages, phase-dependent routing:

```json
{
  "verb": "hand",
  "when": [{ "type": "flag_is", "flag": "airlock_unlocked", "value": "true" }],
  "then": [
    { "type": "message", "text": "The airlock hisses open." },
    { "type": "set_view", "view": "act2_planet_surface" }
  ]
}
```

---

## The Five Verbs

The engine supports exactly five verbs, inherited from the Sierra/LucasArts tradition:

| Verb | Engine ID | Cursor | What the Player Does |
|------|-----------|--------|---------------------|
| Look | `look` | `help` | Examine, read, observe |
| Hand | `hand` | `pointer` | Touch, push, pull, open, close, flip, press |
| Take | `take` | `grab` | Pick up and add to inventory |
| Talk | `talk` | `text` | Speak, listen, read aloud |
| Use | `use` → `use_item` | `cell` | Apply an inventory item to a world object |

### Why Exactly Five

Every physical manipulation (push, pull, open, close, turn, flip) maps to `hand`. The schema analysis across all 13 scenarios confirmed zero usage of `push`, `pull`, `open`, or `close` as separate verbs — authors naturally use `hand` for all physical interaction. Five verbs is the sweet spot: enough expressiveness for complex puzzles, simple enough for intuitive play.

### The Use Verb

"Use" is the puzzle verb. When selected, the player first selects an inventory item, then clicks a world object. The engine internally maps this:

```
Player action:  Use verb → select "wrench" → click "bolt"
Engine call:    interact("bolt", "use_item", "wrench")
Matched JSON:   { "verb": "use_item", "item": "wrench", "when": [...], "then": [...] }
```

### Default Failure Messages

When no interaction matches, the engine provides sensible defaults:

| Verb | Fallback Message |
|------|-----------------|
| `look` | Returns the object's `description` field (always succeeds) |
| `hand` | "You can't do anything with {name} right now." |
| `take` | "You can't take {name}." |
| `talk` | "{name} doesn't respond." |
| `use` | "That doesn't work." |

---

## The React Layer

Six components form the UI, orchestrated by `ScenarioPlayer`.

### Component Tree

```
ScenarioPlayer
├── Title Bar
│   ├── Scenario Title
│   ├── NoiseIndicator (color-coded progress bar)
│   └── Exit Button
└── Game Area (960px wide)
    ├── GameView (960×540 viewport)
    │   ├── Background Image (<img> with object-fit: cover)
    │   ├── Object Hotspots (positioned <div>s)
    │   ├── Cursor Label (active verb / "Use {item} on...")
    │   └── Back Button (when navigation stack > 0)
    ├── MessagePanel (story text, click to dismiss)
    ├── InventoryPanel (horizontal scrolling item bar)
    ├── VerbBar (Look, Hand, Take, Talk, Use)
    └── Game Over Overlay (when gameOver ≠ null)
```

### ScenarioPlayer — The Orchestrator

The top-level component owns:

- A `useRef<ScenarioEngine>` — the engine instance, stable across renders
- `activeVerb` state — which verb is selected
- `selectedItem` state — which inventory item is selected for `use`
- A `bump()` callback — increments a dummy counter to force re-render after engine state changes

```typescript
const [, setVersion] = useState(0);
const bump = useCallback(() => setVersion(v => v + 1), []);
```

After every engine call, `bump()` triggers a re-render. Components then read fresh state from engine getters. This avoids the overhead of converting engine state to React state objects.

### GameView — Background and Hotspots

Renders the 960×540 viewport:

1. **Background image** — loaded from `/scenarios/{scenarioId}/{background_file}` with `object-fit: cover`. Falls back to the scenario's `room_style.background_color` if no image exists or loading fails (an `onError` handler hides broken images)
2. **Object hotspots** — positioned `<div>` elements at scaled coordinates. Transparent when a background image is present (invisible overlays on painted art). On hover: gold border (`#c0a030`) and label tooltip
3. **Cursor label** — top-right indicator showing the active verb or "Use {item} on..."
4. **Back button** — bottom-center when back-navigation is available

### VerbBar, InventoryPanel, MessagePanel

- **VerbBar** — five buttons. Active verb is highlighted. Unavailable verbs are dimmed.
- **InventoryPanel** — horizontal scrolling bar. Click selects for `use`; double-click / right-click examines.
- **MessagePanel** — displays messages from the last interaction. Falls back to `ambient_text` when empty. Click dismisses.

### NoiseIndicator

A color-coded progress bar:

| Level | Color | Meaning |
|-------|-------|---------|
| 0–30 | Green | Safe |
| 31–60 | Yellow | Caution |
| 61–80 | Orange | Danger |
| 81–100 | Red | Killer alerted |

### Data Flow

```
User clicks object
  → ScenarioPlayer.handleObjectClick()
    → engine.interact(objectId, verb, itemId?)
      → findMatchingInteraction()
      → evaluateConditions()
      → applyEffects()
      → checkGameEndConditions()
    ← InteractionResult { success, messages, noiseGenerated }
  → bump()  // force re-render
  → Components read fresh state from engine getters
```

---

## Coordinate System

Scenario authors place objects in a **960×720 coordinate space** (origin at top-left). The engine renders into a **960×540 pixel viewport**.

### Scaling

```typescript
const SCALE_X = 960 / 960 = 1.0;    // no horizontal scaling
const SCALE_Y = 540 / 720 = 0.75;   // vertical compression
```

An object at JSON position `(480, 360)` renders at pixel `(480, 270)` in the viewport. Object sizes scale the same way.

### Why 960×720

- **Horizontal resolution matches the viewport** — no X scaling needed, positions are pixel-accurate horizontally
- **4:3 authoring ratio** is more natural for placing objects than 16:9
- **The 0.75 Y scale** compresses gracefully without distorting hit targets
- **Background images** use `object-fit: cover` so any resolution works (1920×1080 recommended)
- **Matches real scenario data** — coordinate ranges across all 13 scenarios span x: 50–950, y: 30–720

---

## Scenario JSON Format

A scenario JSON has this top-level structure:

```json
{
  "schema_version": "1.0",
  "metadata": { "id": "my-scenario", "title": "...", "difficulty": "medium", ... },
  "setting": { "initial_view": "room_1", "ambient_text": "...", "room_style": { ... } },
  "views": [{ "id": "room_1", "background_file": "backgrounds/room.webp", "objects": ["door", "desk"] }],
  "flags": { "game_started": "false", "found_key": "false" },
  "items": [{ "id": "key", "name": "Rusty Key", "description": "...", "examine": [...] }],
  "objects": [{ "id": "door", "name": "Door", "position": {...}, "interactions": [...] }],
  "combinations": [{ "items": ["wire", "tape"], "result": "patched_wire", ... }],
  "puzzle_widgets": [{ "id": "keypad", "widget_type": "keypad", "config": {...}, ... }],
  "phases": [{ "id": "calm", "on_enter": [...], "killer_overrides": {...} }],
  "events": [{ "id": "creak", "trigger": {"type": "timer", "seconds": 120}, ... }],
  "killer": { "name": "The Warden", "base_behavior": {...}, "search_behavior": {...} },
  "win_conditions": [{ "id": "escape", "conditions": [...] }],
  "lose_conditions": [{ "id": "caught", "conditions": [...] }],
  "hints": [{ "after_seconds": 60, "condition": {...}, "text": "..." }],
  "solution_paths": [{ "id": "main", "steps": ["take_nail", "pry_board", ...] }]
}
```

### Key Structural Decisions

- **Views reference objects by ID string** — a view's `objects` array contains strings like `["door", "desk"]`, not inline definitions. Object definitions live in the top-level `objects` array. One object can appear in multiple views.
- **Flags are string key-value pairs** — not booleans. This supports multi-value states like `"chain_state": "locked"` / `"greased"` / `"broken"`.
- **Interactions are ordered** — the engine takes the first match, so more specific conditions come before general fallbacks.
- **Objects and items are global** — they exist at the scenario level, not scoped to views. Views list which objects they display.

For the full 1700+ line specification with all field definitions and 30 design patterns, see [SCENARIO_SCHEMA.md](SCENARIO_SCHEMA.md).

---

## Design Patterns

The schema spec documents **30 proven puzzle patterns** organized into six categories: Structure, Item & Knowledge, Risk & Reward, Solution Design, Story & Choice, and Environment & Adaptation. Patterns are purely structural — they describe how to arrange conditions, effects, and objects in JSON. No engine changes needed.

### The Dependency Chain (Pattern 2)

A linear sequence where each step unlocks the next:

```json
[
  {
    "verb": "take", "when": [],
    "then": [
      { "type": "add_item", "item": "nail" },
      { "type": "message", "text": "You pull the nail free." }
    ]
  },
  {
    "verb": "use_item", "item": "nail",
    "when": [{ "type": "object_state", "object": "floorboard", "state": "loose" }],
    "then": [
      { "type": "set_state", "object": "floorboard", "state": "pried" },
      { "type": "show_object", "object": "hidden_box" }
    ]
  }
]
```

### The Fork (Pattern 3)

Two independent branches converge with `all_of`:

```json
{
  "verb": "hand",
  "when": [{
    "type": "all_of",
    "conditions": [
      { "type": "has_item", "item": "torn_note_a" },
      { "type": "has_item", "item": "torn_note_b" }
    ]
  }],
  "then": [
    { "type": "message", "text": "You piece the notes together: the safe code is 7-4-1." },
    { "type": "set_flag", "flag": "knows_safe_code", "value": "true" }
  ]
}
```

### The Noise Tradeoff (Pattern 11)

Same puzzle, two solutions with different risk:

```json
[
  {
    "verb": "hand",
    "when": [{ "type": "object_state", "object": "glass_case", "state": "intact" }],
    "then": [
      { "type": "message", "text": "You smash the case! Glass flies everywhere." },
      { "type": "set_state", "object": "glass_case", "state": "broken" },
      { "type": "show_object", "object": "scalpel" }
    ],
    "noise": 40
  },
  {
    "verb": "use_item", "item": "lockpick",
    "when": [{ "type": "object_state", "object": "glass_case", "state": "intact" }],
    "then": [
      { "type": "message", "text": "You pick the lock. The case opens silently." },
      { "type": "set_state", "object": "glass_case", "state": "open" },
      { "type": "show_object", "object": "scalpel" }
    ],
    "noise": 5
  }
]
```

### The Revelation Tool (Pattern 9)

One item transforms the entire room into a second layer of puzzles:

```json
{
  "verb": "use_item",
  "item": "uv_flashlight",
  "when": [{ "type": "object_state", "object": "poster", "state": "hanging" }],
  "then": [
    { "type": "message", "text": "Under the UV light, invisible ink glows: '7-4-1-9'" },
    { "type": "set_flag", "flag": "found_uv_code", "value": "true" }
  ]
}
```

### Combinatorial Depth

A typical scenario uses 8–12 of the 30 patterns. That's over **30 million unique pattern combinations** (C(30,10) = 30,045,015) before accounting for theme, narrative, items, and killer personality. The design space is effectively infinite.

---

## Future Systems

These systems are fully specified in the [schema](SCENARIO_SCHEMA.md) and referenced by all 13 scenario JSONs, but are not yet implemented in the engine.

### Events System

Timed and condition-triggered narrative beats. Events have a trigger (timer or condition check), can be one-shot or repeating, and fire a list of effects:

```typescript
interface ScenarioEvent {
  id: string;
  trigger: { type: string; seconds?: number; };
  one_shot: boolean;
  effects: Effect[];
}
```

Events enable atmospheric moments ("The lights flicker at the 2-minute mark"), story reveals ("After three puzzles, the phone rings"), and time pressure ("Killer starts patrolling after 5 minutes"). All 13 scenarios define events.

### Puzzle Widgets

Pre-built UI components for physical puzzles: keypads, combination locks, toggle panels, dials, sliders, and sequence memory challenges. Each widget has a `config` with a solution and parameters, and an `on_solve` effect list:

```typescript
interface PuzzleWidget {
  id: string;
  widget_type: string;  // "keypad", "combination_lock", "toggle_panel", etc.
  position: Position;
  size: Size;
  view: string;
  config: PuzzleWidgetConfig;
  on_solve: Effect[];
}
```

These render as overlay UI elements on top of the game view. All 13 scenarios define at least one puzzle widget.

### Killer AI

An optional AI antagonist with patrol timers, noise-based detection, search behaviors, and personality-driven dialogue:

```typescript
interface Killer {
  name: string;
  base_behavior: {
    check_interval_seconds: number;
    noise_threshold_curious: number;      // triggers curiosity
    noise_threshold_investigate: number;  // triggers search
    noise_threshold_immediate: number;    // triggers instant catch
    noise_decay_per_second: number;
  };
  search_behavior: {
    thoroughness: number;       // 0.0-1.0, probability of checking hiding spots
    evidence_flags: string[];   // flags that increase thoroughness
  };
}
```

Phases modify killer behavior — early phases have longer intervals and lower thoroughness, while late phases have aggressive, nearly unavoidable patrols. Currently stubbed: the `killer_is` condition returns `false`. When implemented, killer AI may run server-side for competitive multiplayer.

### Multiplayer

The Spring Boot backend (`server/`) is positioned for future multiplayer modes:

- **Competitive** — separate players, shared killer AI, racing to escape
- **Cooperative** — shared world, complementary inventory
- **Asymmetric** — one player controls the killer

The engine's architecture — pure state machine with serializable state — supports this transition. The game engine stays client-side; the server synchronizes state and manages fairness.

---

*For the complete JSON authoring specification, see [SCENARIO_SCHEMA.md](SCENARIO_SCHEMA.md).*
*For the project overview and getting started guide, see the [README](../README.md).*
