# The Abandoned Ward — Scenario Documentation

## Story Synopsis

You wake strapped to a gurney in a condemned psychiatric ward. The fluorescent lights buzz and flicker. The smell of bleach and rot fills the air. Somewhere down the corridor, a woman in a stained nurse's uniform hums softly — Nurse Ratchford, a former psychiatric nurse who never accepted the ward's closure.

When the state shut down this wing of the asylum, Ratchford simply... stayed. She maintained one wing herself, convinced the patients still needed her. Now she has a new patient: you — a small, goblin-like creature barely a third the height of the humans who built this place. The gurneys tower above you like steel cliffs. Door handles require a running jump to reach. Every corridor stretches into a canyon of cracked tile and buzzing fluorescent tubes, and every shadow feels deeper when the world is built three times your scale. She's methodical, institutional, terrifying in her commitment to "proper care." Morning rounds are at six. The orderlies — two men she hired from a halfway house — arrive at dawn. You must escape before then.

The ward corridor connects to a nurse's station (behind barred glass), a utility room (pipes and cleaning supplies), a treatment room (with a functioning ECT machine), and a vent system that runs through the walls. Another patient, Marcus Davis, is locked in the treatment room — he's been here for weeks. Whether you free him or leave him changes your escape options.

**Difficulty**: Hard | **Estimated Time**: 15 minutes | **Patterns Used**: 30 (all)

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
- **Style consistency keywords** for this scenario: `medical horror, condemned psychiatric ward, flickering fluorescent lights, institutional green, cracked tile, 1970s asylum aesthetic`

---

### Background Images (5 views)

**1. `backgrounds/ward_corridor.png`** — A long institutional corridor in a condemned psychiatric ward. Cracked tile floor with a central drain. Fluorescent lights overhead, some broken, others flickering. On one side: a hospital gurney with leather restraints (your starting position), a glass-windowed nurse's station with a counter, a wall-mounted medicine cabinet with a keypad lock, an intercom panel, and a wall clock showing 2:47 AM. On the other side: a heavy door marked "TREATMENT" (locked), another door marked "UTILITY" (locked), and at the far end, a fire exit door with two keyholes. Scattered: a mop bucket on wheels, a wall-mounted fire extinguisher, a ceiling vent cover (screwed shut). The walls are institutional green paint peeling to reveal older layers beneath. Water stains on the ceiling. The atmosphere is grimy, abandoned, clinical.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Long institutional corridor in a condemned psychiatric ward. Cracked tile floor with a central drain. Fluorescent lights overhead, some broken and others flickering. On one side: a hospital gurney with leather restraints, a glass-windowed nurse's station with a counter, a wall-mounted medicine cabinet with a keypad lock, an intercom panel, and a wall clock showing 2:47 AM. On the other side: a heavy door marked TREATMENT (locked), another door marked UTILITY (locked), and at the far end a fire exit door. Scattered mop bucket on wheels, a wall-mounted fire extinguisher, a ceiling vent cover screwed shut. Institutional green peeling paint revealing older layers beneath. Water stains on the ceiling. Grimy, abandoned, clinical atmosphere. Medical horror, condemned asylum, flickering fluorescent lighting. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**2. `backgrounds/nurse_station.png`** — Behind the barred window, the nurse's station is a semi-circular desk area. Neatly organized despite the decay: patient files in wire racks, a medication log binder (open), a PA microphone on a goose-neck stand, a key cabinet on the wall (locked, three drawers), security monitors (CRT screens showing grainy camera feeds), a desk drawer (closed), an ornate brass key hanging on a hook by itself, and an old rotary phone. Everything has Ratchford's obsessive order imposed on it — labeled, color-coded, logged. The contrast between her meticulous organization and the crumbling infrastructure is unsettling. A coffee mug with dried rings sits by the phone. A framed photo of the ward's staff from the 1970s.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Interior of a psychiatric ward nurse's station behind barred windows. Semi-circular desk area with neatly organized patient files in wire racks, an open medication log binder, a PA microphone on a goose-neck stand, a locked key cabinet with three drawers on the wall, grainy CRT security monitors showing camera feeds, a closed desk drawer, an ornate brass key hanging on a hook, and an old rotary phone. Everything is obsessively organized despite the crumbling infrastructure around it. A coffee mug with dried rings sits by the phone. A framed 1970s staff photo on the wall. Medical horror, institutional decay, meticulous order contrasting with decay. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**3. `backgrounds/utility_room.png`** — A cramped utility/maintenance room. Exposed pipes running along the ceiling and walls (some leaking). A cleaning supply shelf with industrial bottles. A large drainage grate in the floor (bolted down). A water valve on a prominent pipe. A mop closet (tall, narrow, a person could hide inside). A utility shelf with miscellaneous tools and supplies. A junction box/breaker panel on the wall (the toggle panel puzzle — labeled breakers for different systems). The room smells of cleaning chemicals. A single bare bulb. Puddles on the floor from dripping pipes.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Cramped utility maintenance room in a condemned psychiatric ward. Exposed pipes running along the ceiling and walls, some leaking. A shelf of industrial cleaning supply bottles. A large bolted drainage grate in the floor. A water valve on a prominent pipe. A tall narrow mop closet. A utility shelf with miscellaneous tools and supplies. A junction box breaker panel on the wall with labeled toggle switches for different systems. Single bare bulb. Puddles on the floor from dripping pipes. Cramped, industrial, grimy. Medical horror, institutional maintenance, dim lighting. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**4. `backgrounds/treatment_room.png`** — A treatment room dominated by an ECT (electroconvulsive therapy) machine — a large device with dials, a control panel, and electrode paddles. A heavy restraint chair with arm and leg straps. A one-way mirror on one wall (observation window). An overhead surgical-style light (off). A treatment supply cabinet. A slot in the heavy door for passing trays. The walls are padded in patches where the padding hasn't been torn away. Through the restraint chair, you can see Marcus Davis if he's still there — gaunt, frightened, but coherent. Under UV light, the walls reveal messages scratched by previous patients.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Psychiatric treatment room dominated by a large electroconvulsive therapy ECT machine with dials, control panel, and electrode paddles. A heavy restraint chair with arm and leg straps in the center. A one-way mirror observation window on one wall. An overhead surgical-style light turned off. A treatment supply cabinet. A slot in the heavy door for passing trays. Walls partially padded with patches of padding torn away. Cold harsh fluorescent lighting. Medical horror, deeply unsettling psychiatric treatment room, clinical and terrifying. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**5. `backgrounds/vent_crawlspace.png`** — Inside the ventilation system. Metal ductwork, cramped, barely wide enough to crawl through. A junction where vents branch. Below one grate, you can see into the treatment room. Below another, an exterior vent with a grate leading outside. Scratches on the metal walls — someone crawled here before. An electrical switch mounted on the wall (controls the treatment room's UV light). Dust, cobwebs, dead insects. The metal creaks under your weight. You can hear Ratchford's humming carried through the ducts from different directions.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Interior of a ventilation duct system in an old building, viewed from a crawling perspective. Metal ductwork, cramped, barely wide enough for a person. A junction where vents branch in multiple directions. Ventilation grates below showing dimly lit rooms. Scratches on the metal walls from previous crawlers. Dust, cobwebs, dead insects. An electrical switch mounted on the duct wall. Dim red-orange light filtering through grates. Claustrophobic, metallic, tense. Medical horror, escape route atmosphere. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

---

## Game Flow

### Phase 1: Restrained
You start strapped to the gurney. Ratchford checks every 65 seconds with a high threshold (70). She's in no hurry — morning is hours away.

**Immediate goal**: Free yourself from the gurney straps.
1. **Hand the gurney** — struggle against straps, the weakened left buckle gives way (noise: 15)
2. **Take the gurney strap** — leather strap becomes an item (Dual-Purpose: examining it reveals patient code "WARD B - 7142")

### Phase 2: Exploring
Ratchford's interval drops to 45s, threshold to 45. You can move freely through unlocked areas.

**Key discoveries and chains**:

**Nurse Station Access**: 
- Look through window → see files, keys, monitors
- Hand window → can reach through bars for some items
- Take ornate key (accessible through bars)
- Patient files require getting behind the station (use hairpin on station door)

**Treatment Room / Utility Room Access**:
- Both doors are locked
- Treatment door: use ward key (from key cabinet)
- Utility door: use hairpin (simpler lock)

**The Cross-Reference Deduction**:
- Patient File A (Harmon): treatment code 3391, cabinet code is "treatment code reversed"
- Patient File B (Davis): medication schedule, floor drain references
- Medication Log: confirms patterns
- Deduced cabinet code: 1933 (3391 reversed)

### Phase 3: Alert
Triggered by evidence or direct confrontation. Interval 25s, threshold 25.

### Phase 4: Final Escape
Triggered when reaching the exit door area. Ratchford becomes desperate.

---

## Items & Dynamics

| Item | How Obtained | Primary Use | Hidden Use |
|------|-------------|-------------|------------|
| **Leather Strap** | Free from gurney | Improvised tool | Examine: reveals patient code "WARD B - 7142" |
| **Hairpin** | Floor drain | Pick simple locks | Access nurse station, utility room |
| **UV Penlight** | Medicine cabinet | Reveal hidden messages | Re-examine everything with UV |
| **Patient File A** | Nurse station files | Treatment code 3391 | Cross-reference for cabinet code |
| **Patient File B** | Nurse station files | Davis's history | Medication schedule details |
| **Sedative Vial** | Medicine cabinet | Sedate Ratchford | Combine with IV tubing |
| **IV Tubing** | Treatment room supplies | Combine with sedative | Delivery mechanism |
| **Sedative Gas Device** | Combine: vial + tubing | Blow through vent to sedate Ratchford | Emergent Combination |
| **Master Key** | Key cabinet drawer 3 (tiny key needed) | Exit door lock 1 | — |
| **Ward B Key** | Key cabinet drawer 2 (hairpin picks it) | Treatment room door | Exit door lock 2 |
| **Ornate Key** | Nurse station hook | Key cabinet lock | Nested Secret chain start |
| **Cleaning Solution** | Utility shelf | Spill for trap (Ratchford slips) | Trap Setting |
| **Tiny Key** | Inside pill bottle, inside tray, inside medicine cabinet | Opens key cabinet drawer 3 | 3-layer Nested Secret |
| **Fire Extinguisher** | Wall mount | Smash exterior vent grate | Alternative escape tool |

### Key Dynamics

- **Power Routing (Breaker Panel)**: The toggle panel in the utility room controls power to cameras, lights, and the ECT machine. Limited power means choosing what to activate — routing power to ECT means cameras go dark (good) but Ratchford notices the monitor failure (bad). This is a linked toggle puzzle where flipping one breaker affects others.
- **Nested Secret (Medicine Cabinet)**: Medicine cabinet (keypad 1933) → locked tray inside → pill bottle inside tray → tiny key inside bottle (wrapped in cotton). Four layers deep.
- **Cross-Reference Deduction**: The medicine cabinet code (1933) isn't written anywhere directly. Player must read File A (treatment code 3391), learn the cabinet code is "treatment code reversed," and mentally derive 1933.
- **The ECT Machine (Rule Subversion)**: The ECT machine is an instrument of torture... but set to overload (9-9-9), it blows the treatment room window lock, creating an escape route. Using the tool of captivity as the means of freedom.
- **Sound Masking**: Running the water valve creates ambient noise that covers your actions in nearby areas.

---

## Puzzle Breakdown

### 1. Gurney Escape (Gateway)
- Hand gurney → struggle free (noise: 15)
- Left buckle is weaker — the message hints at this
- Result: freedom + leather strap item

### 2. Medicine Cabinet Keypad (Code: 1933)
- Puzzle widget: 4-digit keypad
- Code derived from cross-referencing patient files
- File A says cabinet code = treatment code reversed
- Treatment code = 3391, therefore cabinet code = 1933
- Reward: UV penlight, sedative vial, access to locked tray

### 3. Breaker Panel (Toggle Panel — Power Routing)
- Puzzle widget: 6-switch toggle panel with linked switches
- Solution routes power optimally: ECT on, cameras off, lights mixed
- Linked mechanic: some switches affect others (lights-out style)
- Critical for ECT overload path and camera manipulation

### 4. ECT Machine Dials (Code: 9-9-9)
- Puzzle widget: 3-dial combination lock (voltage, frequency, duration)
- Overload settings (9-9-9) learned from:
  - Vent system perspective alignment (look down through grate at treatment room)
  - OR UV light on treatment room wall reveals scratched message
- Result: Power surge blows window lock → escape route

### 5. Nested Secret Chain
- Ornate key (nurse station) → key cabinet → pill bottle → tiny key → master key
- Four layers of nesting
- Each layer requires a different skill (reaching, examining, opening)

### 6. Vent System Navigation
- Open ceiling vent (need tool — fire extinguisher or hairpin)
- Crawl through (Point of No Return — hard to go back)
- Junction: treatment room grate OR exterior grate
- Flip electrical switch → treatment room UV light activates (Echo)
- Use fire extinguisher to smash exterior grate → escape

---

## Pattern Usage

| # | Pattern | How It's Used |
|---|---------|---------------|
| 1 | **Gateway Puzzle** | Gurney escape — struggle free, no items needed |
| 2 | **Dependency Chain** | Files → code → cabinet → tray → bottle → key → exit (6 steps) |
| 3 | **The Fork** | Master key path, vent path, and ECT path are independent |
| 4 | **Progressive Reveal** | Each room opened reveals more of the ward's story |
| 5 | **False Summit** | Exit door needs TWO keys, not one — first key inserted, realize need second |
| 6 | **Dual-Purpose Item** | Leather strap: tool AND patient code carrier |
| 7 | **Nested Secret** | Ornate key → cabinet → tray → pill bottle → tiny key (4 layers) |
| 8 | **Knowledge Gate** | Cross-referenced file data gates cabinet code |
| 9 | **Revelation Tool** | UV penlight reveals wall messages throughout the ward |
| 10 | **Cross-Reference Deduction** | Cabinet code (1933) = treatment code (3391) reversed |
| 11 | **Noise Tradeoff** | Smash vs. pick medicine cabinet; loud vs. quiet vent entry |
| 12 | **Evidence Gamble** | Open medicine cabinet is obvious evidence for Ratchford |
| 13 | **Distraction Window** | PA static plays, draws Ratchford to station → window to act |
| 14 | **Ticking Clock Decision** | When Ratchford is distracted, multiple time-sensitive options compete |
| 15 | **Bait and Punish** | Corridor window escape looks easy but triggers alarm |
| 16 | **Sound Masking** | Water valve creates ambient noise covering your actions |
| 17 | **Trap Setting** | Cleaning solution spill → Ratchford slips → window to act |
| 18 | **Red Herring** | Station phone seems useful but calls no one helpful |
| 19 | **Emergent Combination** | Sedative + IV tubing = gas delivery device |
| 20 | **Multi-Path Solution** | 4 solution paths with different skill requirements |
| 21 | **Rule Subversion** | ECT machine used for escape, not torture |
| 22 | **Myst Machine** | Breaker panel — multi-switch environmental control |
| 23 | **Power Routing** | Limited power allocation: cameras vs. ECT vs. lights |
| 24 | **Perspective Alignment** | Looking through vent grate reveals ECT overload code 9-9-9 |
| 25 | **Moral Fork** | Free Marcus Davis or leave him — affects escape options |
| 26 | **Accomplice** | Marcus Davis in treatment room — information, distraction |
| 27 | **Point of No Return** | Entering vent system — can't easily return |
| 28 | **Camouflage** | Close cabinet after raiding; straighten gurney to hide escape |
| 29 | **Echo** | Vent switch activates treatment room UV light (remote effect) |
| 30 | **Decay Clock** | Ratchford relocks cabinet, adds restraints, removes tools on visits |

---

## Killer Profile: Nurse Ratchford

**Background**: Former psychiatric nurse, worked at this institution for 30+ years. When the ward closed, she couldn't accept it. She hired two orderlies (they arrive at dawn), maintained one wing, and continued "treating" patients — whether they needed treatment or not.

**Personality**: Institutional, maternal but cold. She speaks in clinical terms, follows "procedures." Her care is genuine in her own twisted mind — she truly believes you need treatment. The horror is in her calm professionalism while doing terrible things.

**Base Behavior**:
- Phase 1 (Restrained): Check every 65s, threshold 70
- Phase 2 (Exploring): Check every 45s, threshold 45
- Phase 3 (Alert): Check every 25s, threshold 25
- Phase 4 (Final Escape): Check every 15s, threshold 15
- Thoroughness: 0.3 → 0.65 with evidence

**Dialogue Samples**:
- Approach: "Time for your medication, dear." / "Nurse Ratchford is making her rounds..."
- Search: "Come out, come out. Treatment isn't optional." / "I know every corner of this ward."
- Evidence: "Oh my. Someone's been out of bed. That's a demerit." / "Evidence of non-compliance."
- Catch: "There you are, dear. Time to go back to your room. We have SO much treatment left to do."

**On-Visit Effects**:
- Open medicine cabinet → she relocks it
- If suspicious + tools visible → she confiscates them
- If very suspicious → she adds extra restraints to gurney area

---

## Solution Paths

### Path 1: The Master Plan (10 steps)
Collect both keys and walk out the front. Direct, thorough, requires exploring everything.
1. Free from gurney
2. Examine strap → learn patient code
3. Find hairpin in floor drain
4. Access nurse station → get patient files
5. Read files + medication log → deduce code 1933
6. Enter code on medicine cabinet → access supplies
7. Open nested secret chain → get tiny key
8. Use tiny key on key cabinet → master key
9. Use hairpin on key cabinet → ward key
10. Both keys on exit door → escape

### Path 2: The Ghost (8 steps)
Crawl through the vent system. Stealth-focused, requires fire extinguisher.
1. Free from gurney
2. Get hairpin → open ceiling vent
3. Take fire extinguisher from wall
4. Enter vents (Point of No Return)
5. Flip vent switch → UV light activates in treatment room (Echo)
6. Look through grate → Perspective Alignment reveals 9-9-9
7. Continue to exterior vent
8. Use fire extinguisher to smash grate → escape

### Path 3: The Surge (7 steps)
Overload the ECT machine. Dangerous but dramatic.
1. Free from gurney, explore
2. Open utility room → solve breaker panel for ECT power
3. Open treatment room with ward key
4. Learn overload settings (9-9-9) from vents or UV wall
5. Set ECT to 9-9-9 (Rule Subversion)
6. Power surge blows window lock
7. Escape through treatment room window

### Path 4: Strength in Numbers (8 steps)
Free Marcus Davis, use teamwork. Moral choice path.
1. Free from gurney, get ward key
2. Open treatment room → find Marcus
3. Free Marcus (Moral Fork)
4. Marcus creates distraction + reveals shortcuts
5. Use water valve for sound masking
6. Set cleaning solution trap
7. Combine sedative + IV tubing → gas device
8. Sedate Ratchford → get master key → exit

