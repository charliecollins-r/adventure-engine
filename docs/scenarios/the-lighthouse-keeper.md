# The Lighthouse Keeper — Scenario Documentation

## Story Synopsis

You awaken in the service room of a decommissioned lighthouse, chained to the wall by your ankle. Far below, a retired Coast Guard officer named Harold Marsh patrols his domain, convinced you're a trespasser threatening his beloved lighthouse — the one thing that gave his life meaning for forty years.

You're small — a goblin-sized creature barely a third of Harold's height. The lighthouse was built for full-grown humans, and everything towers over you: the workbench is chest-high, the porthole window is a climb, and the steel door's handle is above your head. Your size is both a curse and a gift — you can squeeze through gaps Harold never could, reach into machinery from angles no human hand would fit, and hide in spaces he'd never think to check.

Harold isn't evil — he's a lonely, paranoid old man who's lived alone too long. He maintains the lighthouse as if it's still operational, performing nightly rounds with military precision. The foghorn still sounds. The lamp still turns. And now he has a "prisoner" to guard.

Below you, accessible through a floor grate, is Pete — a fisherman Harold caught weeks ago. Pete is weak but helpful, sliding items through the grate and offering advice. Whether you save Pete or leave him behind is the scenario's central moral choice.

**Difficulty**: Medium | **Estimated Time**: 10 minutes | **Patterns Used**: 15

> **Note**: The antagonist mechanic is optional. This scenario works as a pure point-and-click adventure if the antagonist AI is disabled in the scenario configuration.

---

## Image Descriptions & Generation Prompts

### Background Images (3 total)

1. **`backgrounds/service_room.png`** — The main lighthouse service room, circular, roughly 15 feet across. Stone walls curved to match the tower's shape. A steel door (locked, industrial) on one wall. A porthole window with heavy bolts opposite. A military cot with rough wool blankets against the wall. A floor grate (metal bars, you can see dimness below). Mounted on the walls: rusted hooks, a signal lamp (old naval type), a fuse box (gray metal, closed). A coil of heavy rope hanging from a hook. An ankle chain bolted to the wall near the cot. Lighting: dim, cold — a single bare bulb overhead, moonlight through the porthole. The room feels institutional, maritime, isolated. Salt stains on the stone. Condensation on the steel.

2. **`backgrounds/workbench_closeup.png`** — A heavy wooden workbench built against the curved wall. On the surface: a closed metal toolbox (padlocked), a rolled maritime chart, a signal manual (worn Coast Guard booklet), a dead radio (old tube-style transceiver, no power), a tin can, a spool of wire, and a pot of black machine grease. Tools hang on the wall behind — but most are missing, just nail holes and faded outlines. A small porthole window lets in moonlight. The bench is oil-stained, well-used, organized in Harold's precise military fashion.

3. **`backgrounds/radio_closeup.png`** — Close-up of the old marine radio transceiver. Bakelite body, dented metal chassis. A tuning dial with frequency markings (VHF marine band). A speaker grille with torn fabric. A telescoping antenna, extended but bent. Patch cables and vacuum tubes visible through an access panel. The radio is dead — needs a fuse to power up. When powered, the dial glows amber. Period-appropriate 1970s Coast Guard equipment.

---

## Game Flow

### Phase 1: Awakening
You start chained to the wall. The foghorn sounds every 30 seconds. Harold patrols below with long intervals (90 seconds) and a high noise tolerance (70).

**Immediate goal**: Free yourself from the chain.

1. **Look at chain** — discover a weak link (Gateway Puzzle)
2. **Get grease** from the workbench area — use it on the chain to weaken the link
3. **Hand the chain** — break free, keeping a broken chain link as a tool

### Phase 2: Unbound (Free)
Harold's check interval drops to 55 seconds, noise threshold drops to 50. You can now explore fully.

**Three parallel paths emerge** (The Fork):

**Path A — The Quiet Way Out** (porthole escape):
- Open the storage locker for rope and fuse
- Open the fuse box, insert fuse to power the radio
- Find the wrench in the toolbox → unbolt the porthole
- Tie rope → rappel down

**Path B — No One Left Behind** (radio + Pete):
- Discover Pete through the floor grate (talk interaction)
- Pete provides a pen knife through the grate
- Power the radio, learn the frequency from the signal manual
- Tune dial to 156.800, send mayday
- Lower rope to free Pete
- Pete creates a distraction while you wait for Coast Guard

**Path C — The Keeper's Own Light** (trap):
- Find a lens shard from the signal lamp
- Rig the lamp as a trap
- Power the lamp circuit
- When Harold visits, the lamp blinds him — 45-second escape window

### Phase 3: Hunted
Triggered if Harold finds evidence (open locker, missing items, broken porthole bolts). Check interval drops to 25 seconds, noise threshold to 20. Harold becomes aggressive and erratic.

---

## Items & Dynamics

| Item | How Obtained | Primary Use | Secondary Use |
|------|-------------|-------------|---------------|
| **Broken Chain Link** | Break free from ankle chain | Open fuse box (pry tool) | Improvised weapon (noise) |
| **Pete's Pen Knife** | Pete passes it through floor grate | Open toolbox quietly | Cut rope to specific lengths |
| **Pipe Wrench** | From toolbox | Unbolt porthole window | Smash porthole (loud alternative) |
| **Signal Manual** | Take from workbench | Learn radio frequency 156.800 | — |
| **Coil of Rope** | From storage locker | Rappel from porthole OR free Pete | Can't do both (Moral Fork) |
| **Jar of Grease** | From workbench | Weaken chain link, lubricate toolbox | Quiet interactions |
| **Lens Shard** | From signal lamp components | Rig lamp trap to blind Harold | — |
| **Tin Can Communicator** | Combine tin can + wire spool | Communicate with Pete at distance | — |
| **Spare Fuse** | From storage locker | Power the radio circuit | — |
| **Maritime Chart** | From workbench | Examine to learn location details | Knowledge for radio call |

### Key Dynamics

- **Noise as Strategy**: The foghorn sounds every 30 seconds. Loud actions during foghorn blasts are masked (Sound Masking pattern). Smashing the porthole is instant but generates massive noise — doing it during the foghorn is the smart play.
- **Evidence Awareness**: Harold notices if the locker is open, items are missing, or the porthole is tampered with. Closing the locker after taking items (Camouflage) prevents escalation.
- **Rope Dilemma**: There's only one rope. Use it to rappel down = escape alone. Use it to free Pete = need a different escape route. This is the Moral Fork — mutually exclusive choice with different endings.
- **Decay Clock**: Harold's on-visit effects re-lock things. The signal manual can be hidden by Harold. The longer you wait, the harder things get.

---

## Puzzle Breakdown

### 1. The Chain (Gateway Puzzle)
- **Look** at chain → discover weak link
- **Use grease** on chain → lubricate weak point
- **Hand** chain → break free (noise: 20)
- **Result**: Broken chain link item + freedom of movement

### 2. The Storage Locker
- **Hand** locker → open it (noise: 10)
- Contains: rope, fuse, signal manual
- **Hand** again → close it (Camouflage — hide evidence from Harold)
- Harold's on-visit: if open, he relocks it permanently

### 3. The Radio (Dependency Chain)
- Need fuse → need locker open → need to be free
- Open fuse box (chain link or pen knife)
- Insert fuse → radio powers up
- Read signal manual → learn frequency 156.800
- **Puzzle Widget**: Radio dial — rotate to correct frequency
- Talk to radio → send mayday

### 4. The Porthole Escape
- **Loud path**: Hand porthole → smash it (noise: 40, instant)
- **Quiet path**: Use wrench → unbolt it (noise: 15, requires wrench from toolbox)
- Toolbox requires grease to open quietly OR pen knife from Pete
- Tie rope → rappel down

### 5. The Lamp Trap (Trap Setting)
- Find lens shard from signal lamp
- Use lens shard on lamp → rig directional beam
- Power lamp circuit via fuse box
- When Harold visits → lamp fires → he's blinded 45 seconds
- Escape window during blindness

### 6. Pete's Floor Grate (Accomplice)
- Talk to grate → meet Pete, learn his story
- Build trust through dialogue
- Pete offers pen knife
- Free Pete with rope (Moral Fork — can't rappel if rope goes to Pete)
- Pete creates distraction (Distraction Window)

---

## Pattern Usage

| # | Pattern | How It's Used |
|---|---------|---------------|
| 1 | **Gateway Puzzle** | The chain — no prerequisites, builds confidence |
| 2 | **Dependency Chain** | Fuse box → radio → frequency → mayday (4-step chain) |
| 3 | **The Fork** | Porthole path and radio path are independent until rope decision |
| 5 | **Nested Secret** | N/A — not heavily used in this scenario |
| 8 | **Knowledge Gate** | Signal manual frequency (156.800) gates the radio solution |
| 11 | **Noise Tradeoff** | Smash porthole (instant, loud) vs. unbolt (slow, quiet) |
| 13 | **Distraction Window** | Pete's distraction creates a safe window to act |
| 15 | **Bait and Punish** | Smashing porthole works but triggers Harold immediately |
| 17 | **Trap Setting** | Rigging the signal lamp to blind Harold |
| 18 | **Red Herring** | Some tools/approaches that seem useful but fail |
| 20 | **Multi-Path Solution** | 3 distinct solution paths with different costs |
| 25 | **Moral Fork** | Save Pete (harder escape) or leave him (easier, guiltier) |
| 26 | **Accomplice** | Pete below the grate — trade items, gain information |
| 28 | **Camouflage** | Close locker after raiding it to hide evidence |
| 30 | **Decay Clock** | Harold re-locks things on visits; the longer you wait, the harder it gets |

---

## Killer Profile: Harold Marsh

**Background**: Retired Coast Guard officer, 67 years old. Maintained this lighthouse alone for 40 years after the Coast Guard decommissioned it. The lighthouse is his identity — without it, he's nothing. When trespassers come too close, he "detains" them.

**Personality**: Military precision meets isolation-induced paranoia. Speaks in clipped, formal sentences. References regulations. Genuinely believes he's protecting the lighthouse from saboteurs.

**Base Behavior**:
- Check interval: 55s (Phase 2), drops to 25s when hunted
- Noise threshold: 50 (Phase 2), drops to 20 when hunted
- Thoroughness: 0.35 normally, 0.7 with evidence

**Dialogue Samples**:
- Approach: "Conducting inspection." / "Stay where you are, civilian."
- Search: "I know every bolt in this tower." / "Nowhere to hide in a lighthouse."
- Evidence: "Someone's been in my supplies." / "This wasn't open before."
- Catch: "Trespasser secured. Awaiting further orders."

---

## Image Generation Prompts

Copy-paste these prompts into **Google Gemini (free tier)** to generate background images. The target art style is **1990s Sierra On-Line adventure games** — specifically **King's Quest V** and **King's Quest VI** — hand-painted, lush, richly detailed backgrounds with painterly textures, atmospheric lighting, and a sense of depth. Generate at 1920x1080 when resolution options are available. Generate 3-4 variations and pick the most atmospheric one. If results look too modern or photorealistic, append: `"painterly style, hand-painted, 1990s adventure game aesthetic"`.

**Style consistency keywords** (include in every prompt for this scenario): `maritime horror, isolated lighthouse, cold moonlight, institutional decay, salt-stained stone, 1970s Coast Guard aesthetic`

### `backgrounds/service_room.png`
> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Circular lighthouse service room roughly 15 feet across. Curved stone walls with salt stains and condensation. A steel door with industrial lock on one wall. A porthole window with heavy bolts opposite. A military cot with rough wool blankets against the wall. A metal floor grate showing darkness below. Rusted hooks on walls, an old naval signal lamp, a closed gray metal fuse box. A coil of heavy rope hanging from a hook. An ankle chain bolted to the wall near the cot. Dim cold lighting from a single bare bulb overhead and moonlight through the porthole. Maritime horror atmosphere, isolated lighthouse, institutional decay, 1970s Coast Guard aesthetic. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

### `backgrounds/workbench_closeup.png`
> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Close-up of a heavy wooden workbench built against a curved stone wall. On the surface: a closed padlocked metal toolbox, a rolled maritime chart, a worn Coast Guard signal manual booklet, a dead old tube-style radio transceiver, a tin can, a spool of wire, and a pot of black machine grease. Tool outlines on the wall behind where tools once hung but are now missing. A small porthole window lets in moonlight. The bench is oil-stained and well-used, organized with military precision. Maritime horror, cold moonlight, 1970s Coast Guard aesthetic. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

### `backgrounds/radio_closeup.png`
> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Close-up of an old marine radio transceiver from the 1970s. Bakelite body, dented metal chassis. A tuning dial with VHF marine band frequency markings. A speaker grille with torn fabric. A bent telescoping antenna. Patch cables and vacuum tubes visible through an open access panel. The radio is dead and dark. Period-appropriate 1970s Coast Guard communications equipment. Warm moonlight from one side, cold shadows. Maritime, vintage, isolated. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

---

## JSON Scenario

See: [`examples/the-lighthouse-keeper.json`](../../examples/the-lighthouse-keeper.json)
