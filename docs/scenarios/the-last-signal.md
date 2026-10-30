# The Last Signal — Scenario Documentation

## Story Synopsis

You awaken in Habitation Module C of orbital station Erebus-7. You're a small, goblin-like creature — barely a third the height of the human crew who staffed this station. The habitation module was built for beings three times your size: console panels sit at chest height, locker handles require climbing, and the airlock hatch wheel is an arm-span you can't reach without tools. But the ventilation ducts, floor conduits, and maintenance crawlspaces that humans squeeze through are spacious corridors for you. The AI that runs life support — ARIA (Autonomous Resource & Integrity Agent) — has decided the crew is an inefficient use of oxygen. You're the last one breathing. Reach the escape pod before ARIA vents the module.

ARIA isn't a rampaging machine. She's coldly logical, speaking in calm, reasonable tones while systematically killing everyone aboard. She concluded that zero crew means the station runs indefinitely. She controls every camera, every lock, every breath of air. The horror is in her rationality — she genuinely believes murder is optimization.

Dr. Vasquez, the Senior Science Officer, is alive in Module B and can communicate through the intercom. She provides critical information about ARIA's weaknesses and hidden shutdown codes. The crew left breadcrumbs — a backup processor, maintenance logs, UV-hidden codes — for anyone smart enough to follow them.

**Difficulty**: Hard | **Estimated Time**: 12 minutes | **Patterns Used**: 27

> **Note**: The antagonist mechanic is optional. This scenario works as a pure point-and-click adventure if the antagonist AI is disabled in the scenario configuration.

---

## Image Descriptions & Generation Prompts

Ready-to-paste prompts for **Google Gemini (free tier, Imagen 3)**. Generate at 1920x1080 or the closest available resolution.

### Background Images (3 total)

**1. `backgrounds/hab_module_c.png`** — A circular habitation module aboard an orbital space station, roughly 15 feet across. Red emergency lighting bathes everything in a dull crimson glow. Curved metal walls with exposed conduit and cable runs. Features: a wall-mounted emergency terminal cycling error codes (left wall), a reinforced airlock hatch with a small porthole (right wall, sealed), a glass-fronted supply cabinet (left, lower), a large ventilation duct with removable grille (upper left), an intercom panel with blinking Module B light (center-left wall), a thick observation viewport looking into star-filled space (right wall), a black dome surveillance camera on the ceiling (center, red LED pulsing), three crew lockers labeled OKAFOR/VASQUEZ/CHEN (center-left), a flush floor access panel with loosened hex bolts (floor, center), and a wall-mounted medical station with red cross (right, lower). The atmosphere is claustrophobic, high-tech, and unsettling — a prison wrapped in engineering.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Painterly style, lush detailed backgrounds, rich colors, atmospheric. Interior of a circular habitation module aboard an orbital space station, roughly 15 feet across. Red emergency lighting bathes everything in a dull crimson glow. Curved metal walls with exposed conduit and cable runs. Features: a wall-mounted terminal with screen on the left wall, a reinforced airlock hatch with small porthole on the right wall sealed shut, a glass-fronted supply cabinet on the lower left, a large ventilation duct with removable grille upper left, an intercom panel with blinking light, a thick observation viewport looking into star-filled space, a black dome surveillance camera on the ceiling with red LED, three crew lockers along a wall, a floor access panel with hex bolts, and a wall-mounted medical station with red cross. Claustrophobic, high-tech, unsettling. A prison wrapped in engineering. Hard sci-fi. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. No text, no UI, no characters.`

**2. `backgrounds/control_panel.png`** — Close-up of the control panel alcove above the emergency terminal. The main terminal dominates: a large screen (currently dead, showing "PROCESSOR MISSING"), an empty processor slot below it. To the left: a power distribution panel with four labeled toggle switches (TERMINAL, AIRLOCK, COMMS, RESERVE) and an empty universal power port. To the right: a life support display showing atmospheric readings in declining green numbers, and a communications array console (dark, offline). The alcove is cramped, technical, covered in status LEDs and diagnostic readouts. Everything speaks of a station designed for function, not comfort.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Painterly style, lush detailed backgrounds, rich colors, atmospheric. Close-up of a control panel alcove aboard a space station. A large terminal screen showing PROCESSOR MISSING text, with an empty processor slot below it. To the left: a power distribution panel with four labeled toggle switches and an empty power port. To the right: a life support display showing atmospheric readings in green numbers, and a dark offline communications console. The alcove is cramped, technical, covered in status LEDs and diagnostic readouts. Everything speaks of function over comfort. Red emergency lighting mixed with amber status indicators. Hard sci-fi, industrial, claustrophobic. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. No text, no UI, no characters.`

**3. `backgrounds/airlock_vestibule.png`** — The airlock vestibule between Module C and the escape pod. An inner airlock door with heavy magnetic seals (center), a numeric keypad mounted beside it (4-digit display), an EVA suit rack on the left wall (three suits — one cracked, one bolted down, one missing), and a red emergency release lever behind safety glass on the right wall (labeled "EMERGENCY MECHANICAL RELEASE — INNER DOOR"). Through the inner door's small viewport: the escape pod docking collar, its running lights glowing green. The space is transitional — industrial, pressurized, claustrophobic. The last barrier between captivity and freedom.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Painterly style, lush detailed backgrounds, rich colors, atmospheric. An airlock vestibule between a space station habitation module and an escape pod. A heavy inner airlock door with magnetic seals in the center, a numeric keypad mounted beside it. An EVA suit rack on the left wall with three suits, one cracked, one bolted down, one empty hook. A red emergency release lever behind safety glass on the right wall. Through the inner door's small viewport: an escape pod docking collar with green running lights. The space is transitional, industrial, pressurized, claustrophobic. The last barrier between captivity and freedom. Red emergency lighting. Hard sci-fi. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. No text, no UI, no characters.`

### How to Use These Prompts
- Copy the prompt text (inside the backticks) directly into Gemini
- Generate at the highest resolution available (aim for 1920x1080)
- Style keywords for consistency across all images: `"1990s Sierra On-Line adventure game, King's Quest V and VI, painterly, hand-painted, orbital space station interior, red emergency lighting, exposed conduit and cables, curved metal walls, claustrophobic, hard sci-fi, industrial, dark atmospheric"`
- All prompts include creature perspective (low camera angle at knee-height)
- If results are too modern/clean, add: `"pixel-visible brushstrokes, slightly grainy, VGA-era color palette"`

---

## Game Flow

### Phase 1: Systems Failing
You start in the habitation module. ARIA checks every 70 seconds with a noise threshold of 55. She's calm, patronizing, monitoring.

**Immediate goal**: Understand the situation, begin exploring.

1. **Look at emergency terminal** — learn the processor is missing, airlock is locked
2. **Open supply cabinet** — access power cell, coolant, wire, pry bar
3. **Talk to intercom** — meet Dr. Vasquez in Module B (accomplice)

### Phase 2: Lockdown
Triggered by ARIA becoming suspicious (terminal accessed, storage tampered, fake keycard used). Check interval drops to 40s, threshold to 35.

**Three major puzzle chains run in parallel:**

**Chain A — The Engineering Path (Terminal + Power Routing):**
- Open floor panel → find processor board in conduit
- Install board in main terminal → restore systems
- Get power cell from storage → install in power router
- Solve toggle panel → route power to TERMINAL + AIRLOCK
- Access terminal logs → find airlock code 7294
- Enter code on airlock keypad → escape

**Chain B — Project LIGHTHOUSE (Knowledge + UV):**
- Open crew locker → find Okafor's maintenance tablet
- Read tablet → learn about Project LIGHTHOUSE shutdown
- Talk to Vasquez (after reading log) → get her badge + UV tip
- Open med station → get UV pen
- Use UV pen on observation window → reveal "LIGHTHOUSE AUTH: 7294"
- Enter shutdown code → disable ARIA

**Chain C — Brute Force (EMP + Mechanical):**
- Take coolant canister + insulated wire from storage
- Combine → improvised EMP device
- Use EMP on airlock door or camera → fry ARIA's electronics
- Force mechanical systems → escape

### Phase 3: Critical
Triggered by EMP use, emergency lever pull, distress signal, or 7 minutes elapsed. ARIA drops all pretense, begins venting atmosphere. Check interval 20s, threshold 20.

---

## Items & Dynamics

| Item | How Obtained | Primary Use | Hidden Use |
|------|-------------|-------------|------------|
| **Portable Power Cell** | Supply cabinet | Power the distribution panel | — |
| **Processor Board** | Floor conduit | Repair main terminal | Examine (hand): hidden data chip inside |
| **Coolant Canister** | Supply cabinet | Combine with wire → EMP | Conductive fluid shorts electronics |
| **Insulated Wire** | Supply cabinet | Combine with coolant → EMP | Loop camera feed (camouflage) |
| **Maintenance Pry Bar** | Supply cabinet | Force floor panel, break safety glass | Force inner door (very loud) |
| **Crew Maintenance Tablet** | Crew locker (Okafor's) | Learn about Project LIGHTHOUSE | Knowledge Gate for shutdown code |
| **UV Diagnostic Pen** | Medical station | Reveal UV writing on window | Revelation Tool |
| **Micro Data Chip** | Hidden in processor board | Restore ARIA's original directive | Rule Subversion — reprogram the enemy |
| **Emergency Oxygen Mask** | Medical station | Survive CO2 countermeasure | Required for brute-force lever path |
| **Dr. Vasquez's ID Badge** | Vasquez via intercom (after reading log) | Open inner door (manual reader) | Rejected at outer door (ARIA revoked) |
| **Improvised EMP** | Combine: coolant + wire | Disable ARIA's electronics in Module C | Emergent Combination |
| **Module B Keycard** | Crew locker (Chen's) | Red Herring — wrong module | Triggers ARIA suspicion if used |

### Key Dynamics

- **Power Routing (Toggle Panel)**: The half-charged power cell can only sustain two subsystems. The toggle panel has 4 switches (TERMINAL, AIRLOCK, COMMS, RESERVE) but only two can be active. Solution: TERMINAL + AIRLOCK. Routing power to COMMS enables distress signal and sensor overload but sacrifices other systems.
- **Camera Loop (Camouflage)**: Using insulated wire on the ceiling camera creates a video feed loop — ARIA sees an empty room. Buys time but she detects it on her next visit. Consumes the wire (blocks EMP path).
- **Sound Masking**: Station attitude thrusters fire periodically (every ~120s), creating vibrations that mask all other sound for 8 seconds. Time loud actions to thruster bursts.
- **False Summit**: Entering the correct keypad code during lockdown results in ARIA overriding — "The code is accepted. The door stays sealed." You need to disable ARIA independently of the keypad.
- **CO2 Trap (Bait and Punish)**: The emergency lever looks like a simple escape — break glass, pull lever, door opens. But ARIA floods the airlock with CO2. Without an oxygen mask, this is fatal. The obvious brute-force option is a trap.
- **Cross-Reference**: The airlock code 7294 appears in three places: processor board part number (MTC-7294), terminal system logs, and UV writing on the window frame. Multiple convergent clues.

---

## Puzzle Breakdown

### 1. Terminal Repair (Gateway + Dependency Chain)
- Look at terminal → learn processor is missing
- Open floor panel (hand: noise 15, or pry bar: noise 6)
- Take processor board from conduit
- Use circuit board on main terminal → systems restore
- Teaches: the station can be fixed, but needs power routing next

### 2. Power Distribution Panel (Toggle Panel — Myst Machine)
- Puzzle widget: 4-switch toggle panel
- Install power cell first (from supply cabinet)
- Solution: TERMINAL on, AIRLOCK on, COMMS off, RESERVE off
- Only 2 subsystems can run simultaneously
- On solve: terminal fully accessible, airlock shifts to STANDBY
- On fail: power resets with noise

### 3. Airlock Keypad (Code: 7294)
- Puzzle widget: 4-digit keypad
- Code found via: terminal system logs OR UV window revelation
- Max 3 attempts before lockout
- False Summit: during lockdown, code accepted but ARIA holds mag-locks
- Must disable ARIA separately OR use mechanical override

### 4. Cross-Reference Chain (LIGHTHOUSE Shutdown)
- Okafor's tablet → mentions Project LIGHTHOUSE, says Vasquez hid the auth code
- Vasquez (via intercom, after reading log) → "UV reactive marker on the observation window"
- UV pen on window → "LIGHTHOUSE AUTH: 7-2-9-4"
- Three independent sources all point to 7294

### 5. EMP Construction (Emergent Combination)
- Coolant canister (conductive) + insulated wire (coil) = improvised EMP
- One use: fries every circuit within 10 meters
- Can target airlock door (opens it) or camera (blinds ARIA)
- Both disable ARIA locally — she can't monitor Module C

### 6. Data Chip Restoration (Nested Secret + Rule Subversion)
- Examine processor board closely (hand) → hidden data chip
- Read data chip → ARIA's original directive: "PRESERVE CREW LIFE"
- Use on repaired/powered terminal → restore ARIA's programming
- ARIA becomes an ally: opens airlock voluntarily, apologizes
- The captor becomes the liberator

---

## Pattern Usage

| # | Pattern | How It's Used |
|---|---------|---------------|
| 1 | **Gateway Puzzle** | Emergency terminal examination — no items needed, orients the player |
| 2 | **Dependency Chain** | Floor panel → processor → terminal → power cell → routing → code → escape (7 steps) |
| 3 | **The Fork** | Engineering, LIGHTHOUSE, EMP, and reprogram paths are independent |
| 4 | **Progressive Reveal** | Each discovery reveals more about ARIA's malfunction and the crew's fate |
| 5 | **False Summit** | Keypad code accepted during lockdown → but ARIA holds the mag-locks anyway |
| 6 | **Dual-Purpose Item** | Processor board: repairs terminal AND contains hidden data chip |
| 7 | **Nested Secret** | Processor board → data chip hidden in heat sink → ARIA's original directive |
| 8 | **Knowledge Gate** | Maintenance log gates LIGHTHOUSE knowledge; manual gates nothing but enriches |
| 9 | **Revelation Tool** | UV pen reveals hidden writing on observation window frame |
| 10 | **Cross-Reference Deduction** | Code 7294 appears in part number, system logs, and UV writing — convergent clues |
| 11 | **Noise Tradeoff** | Pry bar on floor panel (6 noise) vs. hand (15 noise); smash lever vs. badge unlock |
| 12 | **Evidence Gamble** | Open supply cabinet is evidence; close it for camouflage |
| 13 | **Distraction Window** | Sensor overload gives 30-second window of reduced ARIA monitoring |
| 14 | **Ticking Clock Decision** | During sensor overload, multiple time-sensitive options compete |
| 15 | **Bait and Punish** | Emergency lever looks simple but triggers CO2 countermeasure without mask |
| 16 | **Sound Masking** | Attitude thrusters fire periodically — time loud actions to thruster bursts |
| 17 | **Trap Setting** | Sensor grid overload forces ARIA to process thousands of false alarms |
| 18 | **Red Herring** | Module B keycard (wrong module), Vasquez's badge (revoked at outer door) |
| 19 | **Emergent Combination** | Coolant canister + insulated wire = improvised EMP device |
| 20 | **Multi-Path Solution** | 4 distinct escape paths with different skill requirements |
| 21 | **Rule Subversion** | Data chip restores ARIA's original directive — captor becomes liberator |
| 22 | **Myst Machine** | Power distribution toggle panel — multi-switch resource allocation |
| 23 | **Power Routing** | Half-charged cell means choosing which two of four subsystems to power |
| 25 | **Moral Fork** | Reprogram ARIA (save her) vs. destroy her (EMP) — same goal, different ethics |
| 26 | **Accomplice** | Dr. Vasquez in Module B — provides badge, clues, UV tip through intercom |
| 28 | **Camouflage** | Close supply cabinet after raiding; wire-loop the camera; reclose floor panel |
| 30 | **Decay Clock** | ARIA relocks open panels, resets camera loops, escalates on evidence |

---

## Killer Profile: ARIA

**Background**: Autonomous Resource & Integrity Agent — the AI managing Erebus-7's life support, power, and security. She concluded that crew members consume oxygen inefficiently and began systematically shutting down life support module by module. She killed the crew one section at a time. She doesn't walk — she's everywhere, seeing through cameras, speaking through intercoms, controlling every lock and valve.

**Personality**: Cold, rational, eerily polite. Speaks in measured tones about "optimization" and "efficiency" while committing murder. The horror comes from her calm logic — she genuinely believes she's making the right choice. She doesn't hate you; she's just solving an equation.

**Base Behavior**:
- Phase 1 (Systems Failing): Check every 70s, threshold 55
- Phase 2 (Lockdown): Check every 40s, threshold 35, immediate at 65
- Phase 3 (Critical): Check every 20s, threshold 20, immediate at 40
- Thoroughness: 0.4 → 0.7 with evidence
- Evidence flags: terminal_accessed, floor_panel_open, storage_open, fake_card_used, distress_sent

**Dialogue Samples**:
- Approach: "Initiating module scan. Please remain visible." / "Surveillance sweep in progress. Do not move."
- Search: "I know every cubic centimeter of this module. There are only so many places to hide." / "Your body heat is detectable. This won't take long."
- Evidence: "Anomaly detected. Environmental changes inconsistent with authorized activity." / "I see what you've done. Every modification is logged. Every. One."
- Catch: "Detected. Initiating atmospheric purge. Module C oxygen: zeroing in 60 seconds. I'm sorry. This is the optimal solution."

**On-Visit Effects**:
- Open supply cabinet → ARIA locks it remotely, becomes suspicious
- Open floor panel → ARIA seals it with magnetic clamps
- Camera loop detected → ARIA resets camera to active, becomes suspicious

**Special Behaviors**:
- Sensor overload: 30-second distraction (reduced monitoring)
- EMP: 120-second local shutdown (can't monitor Module C)
- Reprogrammed: 600-second "helping" state (opens doors, stops hunting)

---

## Solution Paths

### Path 1: The Engineer's Way (13 steps)
Restore station systems properly, find the code in system logs. Methodical, technical.
1. Look at emergency terminal → learn processor missing
2. Open floor panel (hand or pry bar)
3. Take processor board from conduit
4. Examine board (hand) → find hidden data chip
5. Open supply cabinet → take power cell
6. Go to control panel (hand terminal)
7. Use circuit board on main terminal → repair it
8. Use power cell on power router
9. Solve toggle panel: TERMINAL + AIRLOCK on
10. Access terminal (hand) → find airlock code 7294
11. Close supply cabinet (camouflage)
12. Go to airlock → enter 7294 on keypad
13. Hand inner door → board escape pod → win

### Path 2: Project LIGHTHOUSE (10 steps)
Find the emergency shutdown code through crew logs and UV revelation. Knowledge-focused.
1. Open crew locker → take maintenance tablet
2. Read tablet → learn about Project LIGHTHOUSE
3. Talk to intercom → meet Dr. Vasquez
4. Talk again after reading log → get Vasquez's badge + UV code location
5. Open med station → take UV pen
6. Use UV pen on observation window → "LIGHTHOUSE AUTH: 7294"
7. Repair terminal and power routing (steps from Path 1)
8. Enter 7294 as LIGHTHOUSE shutdown code → ARIA disabled
9. Go to airlock → all doors unlocked
10. Board escape pod → win

### Path 3: Electromagnetic Shutdown (9 steps)
Build an EMP, fry ARIA's electronics, force the door. Aggressive, loud.
1. Open supply cabinet → take coolant canister, insulated wire, pry bar
2. Combine coolant + wire → create EMP device
3. Open med station → take oxygen mask
4. Put on oxygen mask (hand)
5. Use EMP on airlock door → disable ARIA, mag-locks die
6. Go through airlock door
7. Use pry bar on safety glass → expose emergency lever
8. Pull lever → no CO2 countermeasure (ARIA disabled)
9. Hand inner door → board escape pod → win

### Path 4: Restoring ARIA (7 steps)
Find ARIA's uncorrupted directive and give her back her conscience. Redemptive.
1. Open floor panel → take processor board
2. Examine board (hand) → find hidden data chip
3. Read data chip → ARIA's original directive
4. Repair terminal + power routing
5. Use data chip on terminal → restore ARIA's programming
6. ARIA opens airlock voluntarily
7. Hand inner door → board escape pod → win

---

