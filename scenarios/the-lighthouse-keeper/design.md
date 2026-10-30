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

### How to Use These Prompts

Each entry below includes the filename and a ready-to-paste prompt for **Google Gemini (free tier)**. Tips for best results:
- Use Gemini's image generation (Imagen 3 via Gemini)
- Specify "game background art" and "16:9 aspect ratio" in every prompt
- Request "no text, no UI elements, no characters" to keep backgrounds clean
- If a result is too bright or friendly, add "dark atmosphere, muted colors, unsettling"
- Generate at **1920x1080** or the closest available resolution
- **Style consistency keywords** for this scenario: `maritime horror, isolated lighthouse, cold moonlight, institutional decay, salt-stained stone, 1970s Coast Guard aesthetic`

---

### Background Images (3 views)

**1. `backgrounds/service_room.png`** — The main lighthouse service room, circular, roughly 15 feet across. Stone walls curved to match the tower's shape. A steel door (locked, industrial) on one wall. A porthole window with heavy bolts opposite. A military cot with rough wool blankets against the wall. A floor grate (metal bars, you can see dimness below). Mounted on the walls: rusted hooks, a signal lamp (old naval type), a fuse box (gray metal, closed). A coil of heavy rope hanging from a hook. An ankle chain bolted to the wall near the cot. Lighting: dim, cold — a single bare bulb overhead, moonlight through the porthole. The room feels institutional, maritime, isolated. Salt stains on the stone. Condensation on the steel.

> **Gemini Prompt**: `2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080. A circular lighthouse service room roughly 15 feet across. Curved stone walls in muted slate-blue and gray with salt stains and beaded condensation. A heavy riveted steel door with an industrial lock on one wall. A porthole window with heavy bolts opposite, letting in cool silver-blue moonlight. A military cot with rough olive-drab wool blankets against the curved wall. A metal floor grate in the center showing darkness below. Rusted iron hooks on the walls, an old brass naval signal lamp, a closed gray metal fuse box. A coil of heavy hemp rope hanging from a hook. An ankle chain bolted to the wall near the cot. Lighting: warm amber glow from a single bare bulb overhead mixing with cool silver moonlight from the porthole, creating long dramatic shadows. Color palette: slate-blue stone, rust-orange metal, olive-drab fabric, warm amber light, cool silver moonlight. Low camera angle looking UP from knee-height — the ceiling is visible, the door handle and fuse box are above eye level, furniture looms large. The room feels cavernous and imposing from this low vantage point. Maritime atmosphere, 1970s Coast Guard institutional decay. Saturated colors despite the dark mood — rich blues, warm oranges, deep shadows with visible color, not just black. No text, no UI elements, no characters.`

**2. `backgrounds/workbench_closeup.png`** — A heavy wooden workbench built against the curved wall. On the surface: a closed metal toolbox (padlocked), a rolled maritime chart, a signal manual (worn Coast Guard booklet), a dead radio (old tube-style transceiver, no power), a tin can, a spool of wire, and a pot of black machine grease. Tools hang on the wall behind — but most are missing, just nail holes and faded outlines. A small porthole window lets in moonlight. The bench is oil-stained, well-used, organized in Harold's precise military fashion.

> **Gemini Prompt**: `2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080. Close-up view of a heavy wooden workbench built against a curved slate-blue stone wall. On the bench surface: a closed padlocked metal toolbox (rust-orange), a rolled maritime chart, a worn Coast Guard signal manual booklet, a dead old tube-style radio transceiver with dark vacuum tubes, a dented tin can, a spool of copper wire, and a pot of black machine grease. On the wall behind: faded paint outlines where tools once hung, now just nail holes and ghostly shapes. A small porthole window on the right lets in cool silver-blue moonlight. The bench surface is oil-stained dark wood, everything arranged with military precision. Lighting: warm amber from a bare bulb above-left mixing with cool silver moonlight from the porthole on the right. Color palette: slate-blue stone, dark walnut wood, rust-orange metal, copper wire highlights, warm amber light, cool silver moonlight — same palette as the service room view. Low camera angle looking UP at the workbench from knee-height — the bench surface is at chest level, items on it are seen from slightly below, the wall and porthole tower above. The workbench feels massive and imposing from this small vantage point. Maritime atmosphere, 1970s Coast Guard institutional decay. Saturated colors despite the dark mood — rich blues, warm oranges, deep shadows with visible color. No text, no UI elements, no characters.`

**3. `backgrounds/radio_closeup.png`** — Close-up of the old marine radio transceiver. Bakelite body, dented metal chassis. A tuning dial with frequency markings (VHF marine band). A speaker grille with torn fabric. A telescoping antenna, extended but bent. Patch cables and vacuum tubes visible through an access panel. The radio is dead — needs a fuse to power up. When powered, the dial glows amber. Period-appropriate 1970s Coast Guard equipment.

> **Gemini Prompt**: `2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080. Close-up of an old 1970s marine VHF radio transceiver sitting on the dark walnut workbench. Bakelite body in dark brown, dented brass-colored metal chassis. A large round tuning dial with VHF marine band frequency markings etched around it. A round speaker grille with torn olive-drab fabric. A bent telescoping antenna extending upward. Patch cables in red and black, amber-tinted vacuum tubes visible through an open side access panel. The radio is dead and dark — no lights, no glow. The curved slate-blue stone wall visible behind it. Lighting: warm amber from a bare bulb above mixing with cool silver moonlight from off-frame right — same lighting as the service room and workbench views. Color palette: dark brown bakelite, brass metal, amber vacuum tubes, rust-orange patina, slate-blue stone background, warm amber light, cool silver moonlight — same palette as the other views. Low camera angle looking UP at the radio from below workbench-surface height — the radio looms large, the antenna extends toward the ceiling, knobs and dials are at eye level or above. The radio feels imposingly large from this small creature's perspective. Maritime atmosphere, 1970s Coast Guard vintage equipment. Saturated colors despite the dark mood — rich warm browns, deep brass tones, shadows with visible blue-purple color. No text, no UI elements, no characters.`

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

