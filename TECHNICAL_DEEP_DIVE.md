# Technical Deep Dive — Adventure Engine Internals

> For engine contributors, not scenario authors. How the engine works from JSON to pixels.
>
> For the JSON authoring specification, see [`docs/SCENARIO_SCHEMA.md`](docs/SCENARIO_SCHEMA.md).
> For how to build a scenario package, see [`ADVENTURE_BUILDER.md`](ADVENTURE_BUILDER.md).
> For the project overview, see the [`README`](README.md).

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [The ScenarioEngine Class](#the-scenarioengine-class)
- [Condition System](#condition-system)
- [Effect System](#effect-system)
- [Interaction Resolution](#interaction-resolution)
- [The React Layer](#the-react-layer)
- [Coordinate System](#coordinate-system)
- [Audio System](#audio-system)
- [Hotspot Animation System](#hotspot-animation-system)
- [Vite Configuration and Asset Serving](#vite-configuration-and-asset-serving)
- [Scenario Loading Pipeline](#scenario-loading-pipeline)
- [Implementation Status](#implementation-status)
- [Tech Stack](#tech-stack)
- [Development Guide](#development-guide)
- [Extending the Engine](#extending-the-engine)
- [Future Systems](#future-systems)

---

## Architecture Overview

The Adventure Engine is a **pure client-side state machine**. No server is required for gameplay. The entire pipeline is:

```
scenario.json + assets  →  ScenarioEngine (TypeScript)  →  React components  →  playable game
```

### Three-Layer Model

| Layer | Responsibility | Side Effects |
|-------|---------------|--------------|
| **Scenario JSON + Assets** | Define the entire game — views, objects, puzzles, narrative, backgrounds, audio, item icons | Static data |
| **ScenarioEngine** | State management, condition evaluation, effect application | None (pure state machine, except `setTimeout` for `delay_then`) |
| **React Components** | Render engine state as interactive UI | DOM updates only |

This separation is strict and intentional:

- **The engine never calls React.** React polls the engine through getter methods after each interaction.
- **React never mutates engine state directly.** All mutations go through engine methods like `interact()`, `navigateBack()`, `combineItems()`.
- **The engine has no DOM access.** It can be tested in Node.js without a browser.
- **Scenarios can be validated without rendering.** Load JSON, construct engine, call methods, assert state.
- **The renderer can be swapped.** React → Phaser → terminal — without touching game logic.

### Re-render Pattern

The React layer uses a "bump" pattern to avoid converting engine state into React state objects:

```typescript
// ScenarioPlayer.tsx
const engineRef = useRef<ScenarioEngine>(new ScenarioEngine(scenario));
const [, setVersion] = useState(0);
const bump = useCallback(() => setVersion(v => v + 1), []);

// After every engine call:
engine.interact(objectId, verb);
bump(); // forces re-render, components read fresh state from engine getters
```

This keeps the engine as the single source of truth. Components call `engine.getMessages()`, `engine.getVisibleObjects()`, etc. on every render.

---

## The ScenarioEngine Class

**File:** `client/src/engine/ScenarioEngine.ts` (~600 lines)

The heart of the system — a single TypeScript class with no rendering logic, no DOM access, and no external dependencies.

### Constructor and Initialization

When a scenario JSON is loaded, the constructor:

1. **Sets the initial view** from `scenario.setting.initial_view`
2. **Copies initial flags** as a shallow copy (so mutations don't affect the source JSON)
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
| `_noiseLevel` | `number` | 0-100 noise meter (triggers killer attention) |
| `_messages` | `string[]` | Current messages to display |
| `viewHistory` | `string[]` | Stack of previous view IDs for back-navigation |
| `_gameOver` | `GameOverResult \| null` | Win/lose state |
| `_currentPhaseId` | `string \| null` | Current game phase |
| `_isHiding` | `boolean` | Whether the player is hiding from the killer |
| `objectIndex` | `Map<string, ScenarioObject>` | O(1) lookup for objects by ID |
| `itemIndex` | `Map<string, Item>` | O(1) lookup for items by ID |

All state is exposed through read-only getter methods. The engine never hands out mutable references — arrays are returned as copies via spread (`[...this.inventory]`).

### Key Public Methods

| Method | Signature | Purpose |
|--------|-----------|---------|
| `interact` | `(objectId, verb, itemId?) → InteractionResult` | Primary game action — resolve verb + object + conditions → effects |
| `navigateToView` | `(viewId) → void` | Push current view to stack and move to new view |
| `navigateBack` | `() → void` | Pop view stack and return to previous view |
| `combineItems` | `(itemA, itemB) → InteractionResult` | Attempt to combine two inventory items |
| `examineItem` | `(itemId, verb?) → InteractionResult` | Use a verb on an inventory item |
| `getVisibleObjects` | `() → ScenarioObject[]` | Return objects in the current view whose visibility is `true` |
| `getAvailableVerbs` | `(objectId) → string[]` | Scan interactions to find which verbs have satisfied conditions |
| `getUsableItems` | `(objectId) → string[]` | Find which inventory items have valid `use_item` interactions on this object |
| `showMessage` | `(text) → void` | Display an arbitrary message |
| `dismissMessages` | `() → void` | Clear the current message queue |
| `decayNoise` | `(amount) → void` | Reduce noise level (used by killer AI timing) |
| `getMessages` | `() → string[]` | Copy of current message queue |
| `getInventory` | `() → Item[]` | Full Item objects for items in inventory |
| `getNoiseLevel` | `() → number` | Current noise level 0-100 |
| `getGameOverResult` | `() → GameOverResult \| null` | Win/lose state if game is over |
| `getAmbientText` | `() → string` | Phase-aware ambient text (falls back to setting) |
| `canGoBack` | `() → boolean` | Whether the view history stack has entries |
| `getBackLabel` | `() → string \| undefined` | Custom back button text for close-up views |

---

## Condition System

Conditions are the gating mechanism. Every interaction has a `when` array of conditions. **All must be true** (implicit AND) for the interaction to fire.

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

### All Condition Types

| Type | Tests | Fields | Status |
|------|-------|--------|--------|
| `flag_is` | A flag equals a specific value | `flag`, `value` | Implemented |
| `flag_not` | A flag does NOT equal a value | `flag`, `value` | Implemented |
| `object_state` | An object is in a specific state | `object`, `state` | Implemented |
| `has_item` | Player has an item in inventory | `item` | Implemented |
| `not_has_item` | Player does NOT have an item | `item` | Implemented |
| `view_is` | Player is in a specific view | `view` | Implemented |
| `not_in_view` | Player is NOT in a specific view | `view` | Implemented |
| `phase_is` | Game is in a specific phase | `phase` | Implemented |
| `is_hiding` | Player is currently hiding | *(none)* | Implemented |
| `not_hiding` | Player is NOT hiding | *(none)* | Implemented |
| `noise_above` | Noise level exceeds threshold | `threshold` | Implemented |
| `noise_below` | Noise level is below threshold | `threshold` | Implemented |
| `item_count` | Player has at least N items | `count` | Implemented |
| `all_of` | Logical AND — all sub-conditions must pass | `conditions[]` | Implemented |
| `any_of` | Logical OR — at least one sub-condition must pass | `conditions[]` | Implemented |
| `killer_is` | Killer AI is in a specific state | *(stub)* | **Stub — returns `false`** |
| `time_after` | Game clock past a time | *(not read)* | **Not implemented** |

### Composite Conditions

`all_of` and `any_of` nest arbitrarily deep:

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

Since the top-level `when` array is an implicit AND, `all_of` is mainly useful inside `any_of` for nested logic.

### Default Behavior

Unknown condition types return `true` — the engine fails open, preventing undefined future condition types from breaking existing scenarios.

---

## Effect System

Effects mutate game state. When an interaction matches, its `then[]` array executes in order. The `applyEffects` method returns an array of message strings for display.

### All Effect Types

**Narrative:**

| Type | Fields | Action | Status |
|------|--------|--------|--------|
| `message` | `text` | Display a message to the player | Implemented |
| `random_message` | `messages[]` | Pick and display a random message from the list | Implemented |

**State Mutation:**

| Type | Fields | Action | Status |
|------|--------|--------|--------|
| `set_flag` | `flag`, `value` | Set a progress flag (defaults to `"true"`) | Implemented |
| `set_state` | `object`, `state` | Change an object's state string | Implemented |
| `add_item` | `item` | Add item to inventory (no duplicates) | Implemented |
| `remove_item` | `item` | Remove item from inventory | Implemented |
| `show_object` | `object` | Make an object visible in its view | Implemented |
| `hide_object` | `object` | Make an object invisible | Implemented |
| `transform_item` | `item`, `into` | Replace one inventory item with another in-place | Implemented |

**Navigation:**

| Type | Fields | Action | Status |
|------|--------|--------|--------|
| `set_view` | `view` | Navigate to a different view (pushes current to history stack) | Implemented |

**Noise:**

| Type | Fields | Action | Status |
|------|--------|--------|--------|
| `add_noise` | `amount` | Increase noise level (clamped to 100) | Implemented |
| `set_noise` | `amount` | Set noise level to an exact value (clamped 0-100) | Implemented |

**Game Flow:**

| Type | Fields | Action | Status |
|------|--------|--------|--------|
| `game_over` | `result` (win/lose), `reason` | End the game with a message | Implemented |
| `advance_phase` | `phase` | Move to a new phase, run its `on_enter` effects | Implemented |
| `start_hiding` | *(none)* | Player enters hiding | Implemented |
| `stop_hiding` | *(none)* | Player exits hiding | Implemented |

**Temporal and Conditional:**

| Type | Fields | Action | Status |
|------|--------|--------|--------|
| `delay_then` | `seconds`, `effects[]` | Run nested effects after a delay via `setTimeout` | Implemented |
| `conditional_effect` | `when[]`, `then[]`, `else[]` | If/else branching on runtime conditions | Implemented |

**Stub (no-op, pending implementation):**

| Type | Purpose | Status |
|------|---------|--------|
| `visual_cue` | Screen effects (flicker, shake) | No-op |
| `play_sound` | Audio playback | No-op |
| `trigger_event` | Activate a scenario event | No-op (needs events system) |

### Recursive Effects

Several effect types are recursive — they call `applyEffects` internally:

- **`advance_phase`** — after setting `_currentPhaseId`, runs the new phase's `on_enter` effects
- **`conditional_effect`** — evaluates `when` conditions, then runs either `then` or `else` effects
- **`delay_then`** — schedules nested effects via `setTimeout`, which calls `applyEffects` and then `checkGameEndConditions`

This recursion is safe because all three eventually reach leaf effects (`message`, `set_flag`, etc.). There is no cycle detection — scenario authors must ensure no infinite loops.

### The `delay_then` Caveat

`delay_then` is the engine's only side effect beyond internal state mutation. It uses `setTimeout`, which means:

- Delayed effects run **asynchronously** — the interaction that triggered them has already returned
- Delayed effects push messages directly to `_messages` — but React won't see them until the next `bump()`
- The engine re-checks win/lose conditions after each delayed batch
- There is currently no mechanism to cancel scheduled delays (e.g., on game restart)

---

## Interaction Resolution

This is the core game loop — what happens when the player clicks an object with a verb selected.

### The `interact()` Method

```typescript
interact(objectId: string, verb: string, itemId?: string): InteractionResult
```

**Step 1: Guard checks**
- If the game is over, return early with "The game is over."
- Clear the message queue
- Look up the object by ID from `objectIndex`

**Step 2: Verb translation**
- If `verb === 'use'` and an `itemId` is provided, translate to `'use_item'`

**Step 3: Find a matching interaction**
- Search the object's `interactions` array with `findMatchingInteraction`
- Interactions are checked **in order** — first match wins

**Step 4: Hand→take fallback**
- If no match was found and verb is `'hand'`, retry with `'take'`
- This provides backwards compatibility with older scenario JSONs that used `take` instead of `hand`

**Step 5: No match — default feedback**
- If verb is `'look'` and no look interaction matched: show the object's `description` field (always succeeds)
- For any other verb: show a KQ5-style default failure message

**Step 6: Response shorthand**
- If the matched interaction has a `response` string but no `then` effects array (or an empty one), display the response directly
- This supports a compact format for simple look interactions: `{ "verb": "look", "response": "A heavy wooden door." }`

**Step 7: Apply effects**
- Run `applyEffects(matched.then)` to mutate game state and collect messages
- Add any `noise` from the interaction
- Check win/lose conditions

### `findMatchingInteraction`

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

**Order matters** — scenario authors must list more specific interactions before general fallbacks. The first one whose verb matches, whose item matches (for `use_item`), and whose conditions all pass is selected.

### Default Failure Messages (KQ5-style)

Every verb produces feedback, even when nothing happens:

| Verb | Default Message |
|------|----------------|
| `look` | Returns the object's `description` field (always succeeds) |
| `move` | "You can't go that way." |
| `hand` | "You can't do anything useful with {name} right now." |
| `take` | "You can't take {name}." |
| `talk` | "Talking to {name} doesn't accomplish anything." |
| `use` / `use_item` | "That doesn't seem to work." |
| *(unknown)* | "Nothing happens." |

### Win/Lose Checking

After every interaction and delayed effect batch, the engine scans `win_conditions` then `lose_conditions`:

```typescript
private checkGameEndConditions(): void {
  if (this._gameOver) return;
  for (const wc of this.scenario.win_conditions ?? []) {
    if (wc.conditions && this.evaluateConditions(wc.conditions)) {
      this._gameOver = { won: true, conditionId: wc.id, text: wc.description };
      return;
    }
  }
  // same for lose_conditions with won: false
}
```

Win conditions are checked first — if both a win and lose condition are true simultaneously, the player wins.

---

## The React Layer

Seven components form the UI, orchestrated by `ScenarioPlayer`.

### Component Tree

```
App
├── ScenarioLoader (scenario selection screen)
└── ScenarioPlayer (game orchestrator)
    ├── Title Bar
    │   ├── Scenario Title
    │   ├── NoiseIndicator
    │   ├── Mute Button (when ambient_audio present)
    │   └── Exit Button
    └── Game Area (960px wide)
        ├── GameView (960x540 viewport)
        │   ├── Background Image
        │   ├── Object Hotspots (positioned divs with animations)
        │   ├── Cursor Label (active verb / "Use {item} on...")
        │   └── Back Button
        ├── MessagePanel (story text, click to dismiss)
        ├── InventoryPanel (horizontal scrolling item bar)
        ├── VerbBar (Look, Move, Hand, Talk)
        └── Game Over Overlay
```

### ScenarioPlayer — The Orchestrator

**File:** `client/src/components/ScenarioPlayer.tsx`

Owns all game state coordination:

- `useRef<ScenarioEngine>` — engine instance, stable across renders
- `activeVerb` — which verb is selected (`'look'` default)
- `selectedItem` — which inventory item is selected for use
- `muted` — audio mute state
- `audioRefs` — array of `HTMLAudioElement` references for ambient audio

**Key event handlers:**

| Handler | What It Does |
|---------|-------------|
| `handleObjectClick` | If item selected → `use_item`. Otherwise → active verb. Always calls `bump()`. |
| `handleBackClick` | `engine.navigateBack()`, then `bump()` |
| `handleEmptyClick` | Dismisses messages. If item selected, deselects it. If move verb active, shows "You can't go that way." |
| `handleVerbSelect` | Sets active verb, clears selected item |
| `handleItemSelect` | If different item selected → `combineItems()`. Same item → deselect. No item → select. |
| `handleItemExamine` | `engine.examineItem(itemId, 'look')` |
| `handleDismiss` | `engine.dismissMessages()` |
| `handleRestart` | Constructs a new `ScenarioEngine` from the same scenario |

### GameView — Background and Hotspots

**File:** `client/src/components/GameView.tsx`

Renders the 960x540 viewport:

1. **Background image** — loaded from `/scenarios/{scenarioId}/{background_file}` with `object-fit: cover`. An `onError` handler hides broken images, falling back to the scenario's `room_style.background_color`.
2. **Object hotspots** — positioned `<div>` elements at scaled coordinates. When a background image is present, hotspots are fully transparent until hovered (invisible overlays on painted art). Without a background, hotspots show their `visual.color`.
3. **Navigation vs. regular hotspots** — objects with IDs starting with `nav_` get a higher z-index (2 vs. 1) and a blue hover border (`#4a90d9`) instead of gold (`#c0a030`).
4. **Animations** — objects with `visual.animation` get CSS keyframe animations (see [Hotspot Animation System](#hotspot-animation-system)).
5. **Cursor label** — top-right indicator showing the active verb or "Use {item} on..."
6. **Back button** — bottom-center, shown when `viewHistory` is non-empty or the view has a `back_label`.
7. **Empty click detection** — clicks on the viewport that don't hit an object hotspot or back button are routed to `onEmptyClick`.

### VerbBar

**File:** `client/src/components/VerbBar.tsx`

Four verb buttons: Look, Move, Hand, Talk. Active verb is highlighted with a gold border and brighter text. Supports an optional `availableVerbs` prop to dim unavailable verbs (not currently used but wired for future context-sensitive verb display).

### InventoryPanel

**File:** `client/src/components/InventoryPanel.tsx`

Horizontal scrolling bar of inventory items as text buttons.

- **Click** — selects item for use (highlight it, then click a world object)
- **Double-click** — examines the item (calls `onItemExamine`)
- **Right-click** — also examines (with `preventDefault()` to suppress context menu)
- **Selected item** gets a gold border and brighter text
- **Empty inventory** shows italic "Empty" text

### MessagePanel

**File:** `client/src/components/MessagePanel.tsx`

Displays story messages from the last interaction.

- When messages are present: shows them in gold serif text with "click to dismiss" hint. Auto-scrolls to bottom.
- When no messages: shows `ambientText` in italicized muted text. Phase-aware ambient text is passed from `engine.getAmbientText()`.
- Click anywhere on the panel to dismiss messages.

### NoiseIndicator

**File:** `client/src/components/NoiseIndicator.tsx`

A color-coded progress bar showing noise level 0-100:

| Level | Color | Meaning |
|-------|-------|---------|
| 0-30 | Green `#44aa44` | Safe |
| 31-60 | Yellow `#ccaa22` | Caution |
| 61-80 | Orange `#cc6622` | Danger |
| 81-100 | Red `#cc2222` | Killer alerted |

### ScenarioLoader

**File:** `client/src/components/ScenarioLoader.tsx`

The scenario selection screen:

1. Fetches metadata for each scenario ID in the `SCENARIOS` array
2. Displays cards in a responsive grid with title, description, difficulty, and estimated time
3. Clicking a card fetches the full `scenario.json` and calls `onLoad(scenario)`
4. **Custom scenario upload** — a file input button lets users load any `.json` file directly

### Data Flow Summary

```
User clicks object
  → ScenarioPlayer.handleObjectClick()
    → engine.interact(objectId, verb, itemId?)
      → findMatchingInteraction()
        → evaluateConditions() for each candidate
      → applyEffects(matched.then)
        → mutates flags, objectStates, inventory, noiseLevel, messages, etc.
      → checkGameEndConditions()
    ← InteractionResult { success, messages, noiseGenerated }
  → bump()  // force re-render
  → Components read fresh state from engine getters
```

---

## Coordinate System

Scenario authors place objects in a **960x720 coordinate space** (origin at top-left). The engine renders into a **960x540 pixel viewport**.

### Scaling Constants

```typescript
const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 540;
const COORD_SPACE_W = 960;
const COORD_SPACE_H = 720;
const SCALE_X = VIEW_WIDTH / COORD_SPACE_W;   // = 1.0 (no horizontal scaling)
const SCALE_Y = VIEW_HEIGHT / COORD_SPACE_H;  // = 0.75 (vertical compression)
```

### Position Mapping

An object at JSON position `(480, 360)` renders at pixel `(480, 270)` in the viewport.

```typescript
function objectHotspotStyle(x, y, w, h, ...): CSSProperties {
  return {
    left: `${x * SCALE_X}px`,   // x * 1.0
    top: `${y * SCALE_Y}px`,    // y * 0.75
    width: `${w * SCALE_X}px`,  // w * 1.0
    height: `${h * SCALE_Y}px`, // h * 0.75
  };
}
```

### Why 960x720

- **Horizontal resolution matches the viewport** — no X scaling needed, positions are pixel-accurate horizontally
- **4:3 authoring ratio** is more natural for placing objects than 16:9
- **The 0.75 Y scale** compresses gracefully without distorting hit targets
- **Background images** use `object-fit: cover` so any resolution works (1920x1080 recommended)
- **Matches real scenario data** — coordinate ranges across all 13 scenarios span x: 50-950, y: 30-720

### Hotspot Visibility

With a background image present:
- **Normal state**: fully transparent (opacity 0), invisible overlay on the painted art
- **Hovered**: opacity 0.3 with a colored border and label tooltip

Without a background image:
- **Normal state**: semi-transparent color block (opacity 0.35)
- **Hovered**: opacity 0.6 with border and label

---

## Audio System

Ambient audio is entirely schema-driven. Any scenario can specify audio files in its `setting`:

```json
{
  "setting": {
    "ambient_audio": "audio/ambient_ship.mp3"
  }
}
```

Or multiple layered tracks:

```json
{
  "setting": {
    "ambient_audio": ["audio/ambient_ship.mp3", "audio/ambient_lab.mp3"]
  }
}
```

### Implementation (ScenarioPlayer.tsx)

Audio elements are created in a `useEffect` when the scenario loads:

```typescript
useEffect(() => {
  const raw = scenario.setting.ambient_audio;
  if (!raw) return;
  const files = Array.isArray(raw) ? raw : [raw];
  const elements: HTMLAudioElement[] = [];
  for (const file of files) {
    const audio = new Audio(`/scenarios/${scenarioId}/${file}`);
    audio.loop = true;
    audio.volume = 0.35;
    audio.play().catch(() => {});
    elements.push(audio);
  }
  audioRefs.current = elements;
  return () => { /* pause and cleanup */ };
}, [scenario]);
```

- **Looping**: all tracks loop continuously
- **Volume**: 0.35 (35%) — ambient, not dominant
- **Mute toggle**: a Mute/Unmute button appears when `ambient_audio` is defined
- **Cleanup**: on unmount, all audio elements are paused and their `src` is cleared
- **Autoplay**: `.play().catch(() => {})` silently handles browsers that block autoplay

### Asset Serving

Audio files are served by the Vite middleware plugin from `scenarios/{id}/audio/`. See [Vite Configuration](#vite-configuration-and-asset-serving).

---

## Hotspot Animation System

Objects can have a `visual.animation` property that triggers a CSS keyframe animation on their hotspot div. This is fully schema-driven — any scenario author can add it to any object.

### Supported Animations

| Value | Effect | Duration | Use Case |
|-------|--------|----------|----------|
| `"glimmer"` | Subtle inset box-shadow shimmer, flickers twice per cycle | 6s | Items that glint (glass, metal, crystals) |
| `"pulse"` | Gentle opacity oscillation between 0.15 and 0.35 | 3s | Electronic displays, holographic screens |

### Schema Usage

```json
{
  "visual": {
    "color": "#2a4a3a",
    "label": "Broken Pod",
    "animation": "glimmer"
  }
}
```

### Implementation (GameView.tsx)

CSS keyframes are injected once into `<head>` via a module-level singleton:

```typescript
const GLIMMER_KEYFRAMES = `
@keyframes hotspot-glimmer {
  0%, 100% { box-shadow: none; }
  15% { box-shadow: inset 0 0 8px 2px rgba(200, 220, 255, 0.3); }
  30% { box-shadow: none; }
  45% { box-shadow: inset 0 0 4px 1px rgba(200, 220, 255, 0.15); }
  55% { box-shadow: none; }
}
@keyframes hotspot-pulse {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.35; }
}
`;

let stylesInjected = false;
function injectAnimationStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const el = document.createElement('style');
  el.textContent = GLIMMER_KEYFRAMES;
  document.head.appendChild(el);
}
```

Animations **pause on hover** so they don't fight with the hover highlight — the animation style is only applied when `!isHovered`.

### Adding New Hotspot Animations

1. Add the `@keyframes` rule to `ANIMATION_KEYFRAMES` in `GameView.tsx`
2. Add the animation name to the conditional in the hotspot rendering loop
3. Update `docs/SCENARIO_SCHEMA.md` and `ADVENTURE_BUILDER.md` with the new animation name
4. Scenario authors can now use it via `visual.animation`

## Ambient Room Animation System

Views can have a `room_animation` property that renders a subtle CSS overlay between the background and hotspots, giving static backgrounds life.

### Supported Room Animations

| Value | Effect | Duration | Use Case |
|-------|--------|----------|----------|
| `"flicker"` | Random green-tinted light flicker overlay | 8s | Labs, machinery rooms, overhead lighting |
| `"breathe"` | Slow pulsing blue radial glow | 10s | Organic rooms, crystal chambers, viewports |
| `"scan"` | Horizontal green scan line sweeping down | 12s | Security monitors, tech rooms, displays |

### Schema Usage

```json
{
  "id": "security_hub",
  "background_file": "backgrounds/security_hub.webp",
  "objects": ["console", "monitors"],
  "room_animation": "scan"
}
```

### Implementation

Each room animation is a static `CSSProperties` object in `AMBIENT_STYLES` map, rendered as a transparent div between the background `<img>` and the hotspot layer. The div has `pointerEvents: 'none'` so it doesn't interfere with clicks. Each uses CSS keyframes from the shared `ANIMATION_KEYFRAMES` string.

### Adding New Room Animations

1. Add the `@keyframes` rule to `ANIMATION_KEYFRAMES` in `GameView.tsx`
2. Add the style entry to `AMBIENT_STYLES` in `GameView.tsx`
3. Update `ADVENTURE_BUILDER.md` and `TECHNICAL_DEEP_DIVE.md` with the new animation name
4. Scenario authors can now use it via `room_animation` on any view

---

## Vite Configuration and Asset Serving

**File:** `client/vite.config.ts`

### The `serveScenarios` Plugin

A custom Vite middleware plugin serves scenario assets (JSON, images, audio) from the `scenarios/` directory at the repository root:

```typescript
function serveScenarios(): Plugin {
  const scenariosDir = path.resolve(__dirname, '../scenarios');
  return {
    name: 'serve-scenarios',
    configureServer(server) {
      server.middlewares.use('/scenarios', (req, res, next) => {
        const filePath = path.join(scenariosDir, decodeURIComponent(req.url || ''));
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          const ext = path.extname(filePath).toLowerCase();
          const types: Record<string, string> = {
            '.json': 'application/json',
            '.webp': 'image/webp',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg',
          };
          if (types[ext]) res.setHeader('Content-Type', types[ext]);
          fs.createReadStream(filePath).pipe(res);
        } else {
          next();
        }
      });
    },
  };
}
```

### Why a Plugin (Not a Symlink)

The scenario files live outside the `client/` directory (at `scenarios/` in the repo root). A symlink (`client/public/scenarios → ../../scenarios`) works on macOS/Linux but breaks on Windows. The Vite plugin serves the files directly with proper MIME types.

### URL Mapping

| URL Path | Filesystem Path |
|----------|----------------|
| `/scenarios/the-harvest/scenario.json` | `scenarios/the-harvest/scenario.json` |
| `/scenarios/the-harvest/backgrounds/act1_stasis_hold.webp` | `scenarios/the-harvest/backgrounds/act1_stasis_hold.webp` |
| `/scenarios/the-harvest/audio/ambient_ship.mp3` | `scenarios/the-harvest/audio/ambient_ship.mp3` |

### Production Builds

The plugin only intercepts dev server requests. For production, scenario assets need to be copied to the build output directory (not yet configured — currently dev-only).

---

## Scenario Loading Pipeline

### 1. ScenarioLoader Fetches Metadata

On mount, `ScenarioLoader` fetches each scenario's `scenario.json` to extract metadata (title, description, difficulty, estimated time). Failures are caught and shown as error cards.

### 2. User Selects a Scenario

Clicking a card fetches the full JSON, parses it as a `Scenario` type, and calls `onLoad(scenario)`.

Alternatively, the "Load Custom Scenario (JSON)" button opens a file picker for user-provided JSON files.

### 3. App Switches to ScenarioPlayer

`App.tsx` holds a `selectedScenario` state. When non-null, it renders `ScenarioPlayer` instead of `ScenarioLoader`.

### 4. ScenarioPlayer Constructs the Engine

The `ScenarioEngine` constructor receives the full scenario JSON object and initializes all state. The engine instance is stored in a `useRef` so it survives re-renders.

### 5. Gameplay Begins

The engine's initial view is rendered. If the first phase has `on_enter` effects, those fire immediately (e.g., opening narrative message).

---

## Implementation Status

### Conditions

| Condition | Implemented | Used By (of 13 scenarios) |
|-----------|-------------|--------------------------|
| `flag_is` | Yes | 13/13 |
| `flag_not` | Yes | 13/13 |
| `object_state` | Yes | 13/13 |
| `has_item` | Yes | 12/13 |
| `not_has_item` | Yes | 11/13 |
| `view_is` | Yes | 6/13 |
| `not_in_view` | Yes | — |
| `phase_is` | Yes | 2/13 |
| `is_hiding` | Yes | 2/13 |
| `not_hiding` | Yes | 5/13 |
| `any_of` | Yes | 11/13 |
| `all_of` | Yes | 13/13 |
| `noise_above` | Yes | 1/13 |
| `noise_below` | Yes | 1/13 |
| `item_count` | Yes | 1/13 |
| `killer_is` | **Stub (returns false)** | 8/13 |
| `time_after` | **Not implemented** | 13/13 (events) |

### Effects

All 20+ effect types have implementations. Remaining no-ops:
- `trigger_event` — needs events system
- `visual_cue` — cosmetic, acceptable for MVP
- `play_sound` — cosmetic, acceptable for MVP

### Major Unimplemented Systems

| System | Used By | Priority | Notes |
|--------|---------|----------|-------|
| Events system | 13/13 | HIGH | Timed/conditional narrative beats |
| Puzzle widgets | 13/13 | HIGH | Keypads, dials, sliders, etc. |
| Killer AI | 13/13 | MEDIUM | Patrol, detection, search, personality |
| Hints | defined | LOW | Progressive help system |
| `time_after` condition | 13/13 | HIGH (with events) | Needs game clock |

---

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Frontend | React + TypeScript + Vite | 19 / 5.7 / 8 | Pure React rendering (no canvas) |
| Engine | TypeScript `ScenarioEngine` | — | Pure state machine, ~600 lines |
| Rendering | React components + CSS | — | Objects as positioned divs on backgrounds |
| Backend | Spring Boot + Java + Maven | 3.3.5 / 21 | Future: validation, tooling, save sync |
| Future Rendering | Phaser | 3.80 (in deps) | For animations, sprites, canvas effects |
| Image Generation | Google Gemini (Imagen 3) | Free tier | Background art in Sierra KQ5/KQ6 style |

---

## Development Guide

### Commands

```bash
# Frontend dev server
cd client && npm install && npm run dev    # http://localhost:5173

# Type check
cd client && npx tsc -b

# Backend (not needed for gameplay)
cd server && mvn spring-boot:run
```

### File Map

| File | Purpose |
|------|---------|
| `client/src/engine/types.ts` | All TypeScript interfaces matching the JSON schema |
| `client/src/engine/ScenarioEngine.ts` | Core game engine — state machine |
| `client/src/components/ScenarioPlayer.tsx` | Top-level game orchestrator |
| `client/src/components/ScenarioLoader.tsx` | Scenario selection screen |
| `client/src/components/GameView.tsx` | Viewport rendering, hotspots, animations |
| `client/src/components/VerbBar.tsx` | Verb selection bar |
| `client/src/components/InventoryPanel.tsx` | Inventory item display |
| `client/src/components/MessagePanel.tsx` | Story text display |
| `client/src/components/NoiseIndicator.tsx` | Noise level meter |
| `client/src/App.tsx` | Entry point: ScenarioLoader → ScenarioPlayer |
| `client/src/App.css` | Dark theme base styles |
| `client/vite.config.ts` | Vite config + scenario serving plugin |
| `docs/SCENARIO_SCHEMA.md` | Complete JSON schema specification (1700+ lines) |

---

## Extending the Engine

### Adding a New Condition Type

1. **Add the type string** to `evaluateCondition()` in `ScenarioEngine.ts`:
   ```typescript
   case 'my_condition':
     return /* your boolean check using this.flags, this.inventory, etc. */;
   ```

2. **Add optional fields** to the `Condition` interface in `types.ts` if your condition needs new parameters.

3. **Document it** in `docs/SCENARIO_SCHEMA.md` under the Conditions section.

4. **Test it** — construct a `ScenarioEngine` with a test scenario that uses the condition, call `interact()`, and assert the result.

### Adding a New Effect Type

1. **Add the case** to `applyEffects()` in `ScenarioEngine.ts`:
   ```typescript
   case 'my_effect':
     // mutate state
     break;
   ```

2. **Add optional fields** to the `Effect` interface in `types.ts` if your effect needs new parameters.

3. **Document it** in `docs/SCENARIO_SCHEMA.md` under the Effects section.

### Adding a New UI Component

1. Create the component in `client/src/components/`
2. Wire it into `ScenarioPlayer.tsx` — read state from engine getters, call engine methods, then `bump()`
3. If it needs new engine state, add getters to `ScenarioEngine`

### Adding a New Hotspot Animation

1. Add the `@keyframes` CSS to `GLIMMER_KEYFRAMES` in `GameView.tsx`
2. Add the animation name check in the hotspot rendering loop
3. Document the animation name in `docs/SCENARIO_SCHEMA.md` under the Visual section

### Adding a New Audio Feature

1. Extend the `Setting` interface in `types.ts` (e.g., `ambient_audio` already supports `string | string[]`)
2. Handle it in `ScenarioPlayer.tsx`'s audio `useEffect`
3. Ensure the Vite plugin serves the file type (add MIME mapping if needed)

---

## Future Systems

### Events System (HIGH PRIORITY)

Timed and condition-triggered narrative beats. Events have a trigger (timer or condition check), can be one-shot or repeating, and fire a list of effects. All 13 scenarios define events. Needs a game clock and a tick loop.

### Puzzle Widgets (HIGH PRIORITY)

Pre-built UI components for physical puzzles: keypads, combination locks, toggle panels, dials, sliders, sequence memory. Each widget renders as an overlay on the game view. All 13 scenarios define at least one. Needs a `PuzzleWidgetOverlay` component and widget-specific sub-components.

### Killer AI (MEDIUM PRIORITY)

An optional AI antagonist with patrol timers, noise-based detection, search behaviors, and personality-driven dialogue. Phases modify killer behavior. Currently the `killer_is` condition returns `false`. When implemented, killer AI may run server-side for competitive multiplayer fairness.

### Spatial Movement (POST-MVP)

Click-to-move with walkable area polygons. See `docs/SPATIAL_MOVEMENT_DESIGN.md`. Currently, movement is handled via navigation hotspots with the `move` verb.

### Phaser Canvas Rendering (POST-MVP)

Phaser 3.80 is already in dependencies. The plan is to add a canvas layer for:
- Sprite animations (character movement, item pickup effects)
- Particle effects (breaking glass, sparks, ambient particles)
- Smooth transitions between views
- Animated object states (doors opening, screens flickering)

### Multiplayer

The Spring Boot backend is positioned for future multiplayer modes:
- **Competitive** — separate players, shared killer AI, racing to escape
- **Cooperative** — shared world, complementary inventory
- **Asymmetric** — one player controls the killer

The engine's pure state machine with serializable state supports this transition.

---

> **AI Agent Maintenance Rule:** When you modify the engine, add new features, change architecture, or update the tech stack — update this document. A new contributor should be able to read this and understand the entire system.

---

*For the JSON authoring specification, see [`docs/SCENARIO_SCHEMA.md`](docs/SCENARIO_SCHEMA.md).*
*For how to build a scenario package, see [`ADVENTURE_BUILDER.md`](ADVENTURE_BUILDER.md).*
*For the project overview, see the [`README`](README.md).*
