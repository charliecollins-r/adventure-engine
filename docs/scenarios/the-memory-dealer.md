# The Memory Dealer — Scenario Documentation

## Story Synopsis

Neo-Shanghai, 2087. You awaken on a medical gurney in a back-room clinic, skull throbbing where electrodes were attached. You're a small, goblin-like creature — barely a third the height of the humans who crowd Neo-Shanghai's neon-drenched streets. Chen's clinic was built for human-sized clients: the gurney is a plateau, the medicine cabinet is mounted at twice your reach, and the exit door's biometric panel sits above your eye level. But the ventilation grates, the gaps behind storage racks, and the crawlspaces beneath equipment are your domain — spaces Chen would never think to check. A black-market memory dealer named Lao Chen botched a neural extraction — the procedure that rips memories from a subject's brain and stores them on crystalline cartridges for resale. The extraction went wrong, and now fragments of stolen memories are surfacing in your consciousness: a woman begging, an address, a safe combination, a name. These fragments are evidence of Chen's operation — and he needs to finish the job before you can tell anyone.

The clinic is a cramped, neon-lit space divided into three areas: the main treatment room (gurney, cabinets, the front door), a neural interface alcove (the extraction chair, the headset, diagnostic screens), and a storage area (racks of memory cartridges, Chen's ledger, his personal safe). Chen runs his operation alone, sitting beyond a plastic curtain partition, drinking jasmine tea, humming Cantonese lullabies, and waiting for clients.

What makes Chen terrifying is his pragmatism. He doesn't hate you. You're product. A struggling subject degrades the memory quality, which "ruins the product." He calls you by your case number — 4471-C — and philosophizes about the nature of identity while preparing to erase yours.

**Difficulty**: Hard | **Estimated Time**: 15 minutes | **Patterns Used**: 29

> **Note**: The antagonist mechanic is optional. This scenario works as a pure point-and-click adventure if the antagonist AI is disabled in the scenario configuration.

---

## Image Descriptions & Generation Prompts

### Background Images (3 total)

1. **`backgrounds/clinic_main.png`** — A cramped back-room clinic in a cyberpunk megacity. Neon light bleeds through fogged plexi-glass walls from the alley outside — pink and blue. A medical gurney sits center-left with leather restraints. An instrument tray on a rolling stand beside it. To the right, a plastic partition curtain (translucent, you can see shadows of movement beyond). Against the walls: a locked medicine cabinet with a keypad, a supply shelf with medical boxes, a ventilation grate near the floor, a power junction box with exposed wiring, a medical waste bin, and the front exit door — heavy steel with a biometric panel and keypad beside it. A security camera dome is mounted in the ceiling corner, red LED blinking. An intercom speaker is mounted beside the exit. Ceiling pipes run overhead (some corroded). A floor drain is visible (bolted shut). A neon sign reading something in Chinese characters casts the dominant light. The room feels clinical but illegal — peeling paint, improvised wiring, stainless steel surfaces. Technology is high but presentation is low.

2. **`backgrounds/neural_interface_closeup.png`** — Close-up of the neural extraction alcove. Dominating the view: a reclining extraction chair with arm restraints and a head brace. Above it, a neural headset cradle holding a complex apparatus — electrodes, signal amplifiers, data connectors. A wall-mounted neural activity display shows waveforms (in standby, dim amber). A memory cartridge slot (empty, waiting for a cartridge). Below the display: calibration dials (3 rotary dials labeled FREQ / AMP / BANDWIDTH). A coiled data cable connects the headset to the display. A patient records terminal (small screen, keyboard, card reader) is built into a side console. Everything is brushed steel and fiber-optic cabling — advanced technology in a dirty setting. Surgical-grade lighting overhead (currently dim).

3. **`backgrounds/storage_rack_closeup.png`** — Close-up of Chen's memory storage area. Floor-to-ceiling racks of cylindrical memory cartridges, each glowing faintly in different colors (blue for recent, amber for aged, red for damaged). They sit in cooling slots with wisps of cold vapor — the cooling unit hums visibly at the bottom of the rack. An inventory ledger (a physical notebook with a pen — Chen is old-school) rests on a small shelf. An encryption terminal (compact screen, keypad) sits beside the rack. A backup drive slot (occupied by a thumb-sized drive). Tucked behind the rack: Chen's personal safe (small, wall-mounted, 4-dial combination lock). Labels on the cartridges show case numbers and dates in handwritten Chinese characters. The area feels like a wine cellar for stolen minds.

---

## Game Flow

### Phase 1: Disoriented
You start strapped to the gurney. Your head is foggy. Chen checks every 90 seconds with a noise threshold of 65 — he's relaxed, expecting you to stay sedated.

**Immediate goal**: Free yourself.
1. **Rock the gurney** (hand) — shift it close enough to the instrument tray
2. **Look at the instrument tray** — spot the scalpel
3. **Take the scalpel** — it's within reach after rocking
4. **Use scalpel on gurney** — cut the restraints

A stolen memory fragment surfaces at 30 seconds — a woman's face, terrified, begging. The fragments are clues and atmosphere both.

### Phase 2: Recovering
Triggered when free from the gurney. Check interval drops to 55s, threshold to 50. You're upright but your head pounds. Memory fragments continue surfacing.

**Three major chains open** (The Fork):

**Chain A — Evidence & Front Door** (The Whistleblower):
- Explore → find data shard in waste bin → examine → learn exit code 7204
- Access neural closeup → find patient records terminal → need access card
- Access storage closeup → examine ledger → photograph it → get ledger evidence
- Crack Chen's safe (combo 0808, learned from memory fragments) → get access card + backup drive
- Decrypt backup drive at encryption terminal
- Compile evidence package (ledger photo + backup drive)
- Loop camera feed (access card on neural display)
- Unlock exit door (access card + keypad 7204) → walk out with evidence

**Chain B — Drain Escape** (The Rat):
- Get wrench from medicine cabinet (keypad code 0808)
- Use wrench on floor drain (very loud — noise 30)
- Drop into sewage system → escape (no evidence saved)

**Chain C — Broadcast** (The Signal):
- Reroute power via toggle panel (rig ON, security OFF, cooling OFF)
- Access patient records → learn emergency frequency 108.7 MHz
- Set calibration dials to emergency frequency
- Compile evidence package
- Broadcast through the rig → Chen's operation exposed to authorities

**Chain D — Memory Overwrite** (The Eraser):
- Take electrode patch + data cable from neural interface
- Combine into modified headset
- Create distraction (poisoned tea, neon tube short, or cartridge overheat)
- Use modified headset on distracted/sedated Chen → overwrite his memories of you
- Walk out — Chen doesn't remember you exist

### Phase 3: Lucid
Triggered after 3+ memory fragments surface or Chen becomes suspicious. Interval drops to 35s, threshold to 35. Chen is actively worried.

---

## Items & Dynamics

| Item | How Obtained | Primary Use | Secondary Use |
|------|-------------|-------------|---------------|
| **Surgical Scalpel** | Instrument tray (after rocking gurney) | Cut gurney restraints (Gateway) | Pry open panels |
| **Neural Electrode Patch** | Headset cradle (neural closeup) | Combine → modified headset | — |
| **Cracked Data Shard** | Waste bin | Examine → learn exit code 7204 | Red Herring (looks broken/useless) |
| **Sedative Vial** | Medicine cabinet | Combine with tea kettle → trap | — |
| **Access Card** | Chen's safe (storage closeup) | Loop cameras, unlock exit door, access terminals | Multi-use key |
| **Copper Wire** | Stripped from ceiling pipes | Combine with neon tube → EMP device | — |
| **Memory Cartridge (Yours)** | Memory cartridge slot (neural closeup) | Proof of your extraction | Evidence |
| **Ledger Photograph** | Photograph the inventory ledger | Evidence of Chen's clients | Combine → evidence package |
| **Encrypted Backup Drive** | Backup drive slot (storage closeup) | Client database (once decrypted) | Combine → evidence package |
| **Modified Neural Headset** | Combine: electrode patch + data cable | Overwrite Chen's memories | Rule Subversion |
| **Pipe Wrench** | Medicine cabinet | Remove floor drain bolts | Noise: 30 (loud path) |
| **Electric Tea Kettle** | Behind partition (after opening) | Combine with sedative → trap | — |
| **Poisoned Tea** | Combine: sedative + tea kettle | Sedate Chen (Trap Setting) | — |
| **Neon Tube** | Salvaged from neon sign (after shorting) | Combine with copper wire → short-circuit | Distraction tool |
| **Neural Data Cable** | Extraction rig (neural closeup) | Combine → modified headset | — |
| **Evidence Package** | Combine: ledger photo + backup drive | Win condition for front door + broadcast | Compiled proof |

### Key Dynamics

- **Memory Fragments as Clues**: Stolen memories surface automatically at timed intervals (events). Each fragment contains a clue — a birthday (safe combo 0808), a frequency (108.7 MHz), a code (7204). The player doesn't realize at first that the "narrative flavor" is actually puzzle data. This is the Knowledge Gate pattern embedded in story.
- **Camera Awareness**: The security camera tracks you. Chen reviews footage. Actions taken while the camera is active generate "evidence" that raises suspicion faster. Looping the camera feed (using the access card on the neural display) is critical for most paths.
- **Power Routing Tradeoff**: The toggle panel controls power to three systems: extraction rig, security/cameras, and cooling. You can only power one fully. Rig ON = broadcast capability but cameras stay active. Security OFF = cameras dark but rig unpowered. Cooling OFF = cartridges overheat (timer starts) — a distraction, but also destroys evidence if you wait too long.
- **Evidence as Currency**: The evidence package is both a win condition (front door + broadcast paths) and a moral element. The Rat path (drain) escapes without evidence — Chen keeps operating. The Eraser path is elegant but lets Chen's operation continue with other victims.

---

## Puzzle Breakdown

### 1. Gurney Escape (Gateway Puzzle)
- Rock gurney (hand, noise: 5) → shifts within reach of tray
- Look at tray → spot scalpel
- Take scalpel → obtain cutting tool
- Use scalpel on gurney → cut restraints (noise: 10)

### 2. Exit Keypad (Code: 7204)
- Puzzle widget: 4-digit keypad beside the exit door
- Code learned from examining the cracked data shard found in the waste bin
- Also requires access card swipe (biometric panel)

### 3. Chen's Safe (Combination: 0808)
- Puzzle widget: 4-dial combination lock
- Code (0808) surfaces through memory fragments — one fragment shows Chen's birthday (August 8th)
- Located in storage closeup
- Contains: access card, and other supplies

### 4. Medicine Cabinet Keypad (Code: 0808)
- Puzzle widget: 4-digit keypad
- Same code as safe (Chen reuses his birthday — Dual-Purpose knowledge)
- Contains: sedative vial, pipe wrench

### 5. Power Toggle Panel (Myst Machine / Power Routing)
- Puzzle widget: 3-switch toggle panel with labels
- EXTRACTION RIG / SECURITY-CAMS / COOLING SYS
- Solution for broadcast path: [ON, OFF, OFF]
- Each configuration has tradeoffs — genuine Power Routing puzzle
- Cooling OFF triggers a timer: cartridges overheat in 90s

### 6. Calibration Dials (Emergency Frequency)
- 3 dials in the neural closeup, set to 108.7 MHz
- Frequency learned from patient records terminal (requires access card)
- Enables broadcast of evidence through the extraction rig

### 7. Encryption Terminal (Backup Drive Decryption)
- Use backup drive on encryption terminal
- Terminal cracks the encryption → reveals client database
- Key step for compiling the evidence package

---

## Pattern Usage

| # | Pattern | How It's Used |
|---|---------|---------------|
| 1 | **Gateway Puzzle** | Gurney escape — rock, scalpel, cut |
| 2 | **Dependency Chain** | Safe → access card → terminal → frequency → calibrate → broadcast (6 steps) |
| 3 | **The Fork** | Four independent escape chains (Whistleblower, Rat, Signal, Eraser) |
| 4 | **Progressive Reveal** | Memory fragments progressively reveal clues and story |
| 5 | **False Summit** | Exit door needs BOTH access card AND keypad code — one alone fails |
| 6 | **Dual-Purpose Item** | Data shard looks like trash but holds the exit code; same code for safe and cabinet |
| 7 | **Nested Secret** | Safe → access card → terminal → encrypted drive → decrypted data (4 layers) |
| 8 | **Knowledge Gate** | Memory fragments carry codes (0808, 7204, 108.7) — info gates progress |
| 9 | **Revelation Tool** | Access card unlocks terminals that reveal hidden data throughout |
| 10 | **Cross-Reference Deduction** | Combine memory fragment birthday + ledger dates + case numbers → safe code |
| 11 | **Noise Tradeoff** | Drain escape is fast but generates noise 30; quiet paths take longer |
| 12 | **Evidence Gamble** | Free gurney, opened vents, moved items — Chen notices |
| 13 | **Distraction Window** | Chen's phone call (120s event) creates a 30s action window |
| 14 | **Ticking Clock Decision** | Client arriving at 360s forces commitment to a path |
| 15 | **Bait and Punish** | Exit door looks simple but needs both card AND code |
| 16 | **Sound Masking** | Power grid fluctuation event masks noise briefly |
| 17 | **Trap Setting** | Poisoned tea kettle sedates Chen |
| 18 | **Red Herring** | Cracked data shard looks like garbage; biometric panel seems to need fingerprint |
| 19 | **Emergent Combination** | Electrode patch + data cable = reversed headset; sedative + tea = trap |
| 20 | **Multi-Path Solution** | 4 win conditions, each with different moral weight |
| 21 | **Rule Subversion** | Neural extraction headset reversed to WRITE memories instead of read |
| 22 | **Myst Machine** | Power toggle panel — interconnected system with tradeoffs |
| 23 | **Power Routing** | 3 systems, limited power — choose what to activate |
| 24 | **Perspective Alignment** | Memory fragments only make sense when cross-referenced with physical evidence |
| 25 | **Moral Fork** | Escape with evidence (justice) vs. erase Chen's memory (personal safety, no justice) |
| 27 | **Point of No Return** | Disabling cooling starts a destruction timer; broadcasting alerts Chen |
| 28 | **Camouflage** | Close curtain after exploring; replace items; loop camera feed |
| 29 | **Echo** | Disabling cooling in main view causes overheat alarm in storage area |
| 30 | **Decay Clock** | Chen blocks vents on visits, shuts off intercom, re-secures the camera |

---

## Killer Profile: Lao Chen

**Background**: A black-market memory dealer in his sixties. Former neuroscience researcher who lost his license. He operates a one-man extraction clinic in Neo-Shanghai's underbelly, selling stolen memories to wealthy clients who want experiences they never had — first loves, combat thrills, childhood in places they've never been. He's been doing this for decades and considers it a service.

**Personality**: Businesslike, philosophical, pragmatic. He sees memories as commodities — "nothing personal." He hums Cantonese lullabies while he works and drinks jasmine tea obsessively. He genuinely ponders questions of identity ("If I take your memory of your mother's face, did she still raise you?") while preparing to erase you. He speaks in a mix of English and Mandarin fragments. He calls you by case number: 4471-C.

**Base Behavior**:
- Check interval: 55s (recovering), drops to 35s when lucid
- Noise threshold investigate: 50 (recovering), 35 (lucid)
- Thoroughness: 0.35 normally, 0.7 with evidence
- Variance: 15 seconds — unpredictable timing

**Dialogue Samples**:
- Approach: "Time to check on our guest... the neural patterns should be stabilizing."
- Search: "Interesting. The gurney is empty. Where did you go, 4471-C?" / "Don't make this difficult. A struggling subject damages the neural pattern — lowers the resale value."
- Evidence: "The restraints are cut? Clever. But this clinic has no exits you can reach." / "You've been busy. That's a shame — struggling degrades the memory quality."
- Catch: "There you are. Don't worry — the second extraction is always smoother. You won't remember any of this." / "Caught. Sit down, 4471-C. We have a buyer waiting. Bu hao yisi — nothing personal."

**On-Visit Effects**:
- Open ventilation grate → Chen drags equipment over it, blocking access
- Active intercom broadcast → Chen yanks the toggle off and increases suspicion

**Special Behaviors**:
- **Phone distraction** (120s event): Chen takes a call, distracted for 30 seconds
- **Suspicious mode**: When evidence flags trip, Chen becomes aggressive (enraged)

---

## Solution Paths

### Path 1: The Whistleblower (7 steps)
Compile evidence and escape through the front door to deliver it to authorities.
1. Free from gurney (scalpel from instrument tray)
2. Loop security camera (access card on neural display)
3. Crack Chen's safe (combo 0808 from memory fragment) → get access card + backup drive
4. Find data shard in waste bin → examine → learn exit code 7204
5. Compile evidence (photograph ledger + decrypt backup drive → combine into evidence package)
6. Unlock exit door (swipe access card + enter keypad 7204)
7. Walk out with evidence package — justice served

### Path 2: The Rat (4 steps)
Quick, dirty escape through the floor drain. No evidence saved.
1. Free from gurney
2. Get wrench from medicine cabinet (keypad code 0808)
3. Use wrench on floor drain to remove grate (noise: 30 — very loud)
4. Drop into drain → escape. Chen keeps operating.

### Path 3: The Signal (7 steps)
Broadcast evidence on emergency frequency — authorities come to you.
1. Free from gurney
2. Access patient records terminal (access card) → learn frequency 108.7 MHz
3. Reroute power (toggle panel: rig ON, security OFF, cooling OFF)
4. Set calibration dials to 108.7
5. Compile evidence package (ledger photo + decrypted backup)
6. Broadcast through extraction rig → Chen's operation exposed
7. Optional: escape through unmonitored exit while Chen panics

### Path 4: The Eraser (7 steps)
Turn Chen's own technology against him — overwrite his memories.
1. Free from gurney
2. Take electrode patch from headset cradle (neural closeup)
3. Take data cable from extraction rig (neural closeup)
4. Combine electrode patch + data cable → modified headset
5. Create distraction (poison tea, short neon tube, or disable cooling for overheat)
6. Use modified headset on distracted/sedated Chen → overwrite his memories of you
7. Walk out — Chen won't remember you were ever here

---

## Image Generation Prompts

Ready-to-paste prompts for **Google Gemini (free tier, Imagen 3)**. Generate at 1920x1080 or the closest available resolution.

### Style Consistency Keywords
Use in every prompt for visual cohesion: `"1990s Sierra On-Line adventure game style, King's Quest V and VI painterly backgrounds, hand-painted, lush detail, cyberpunk back-alley clinic, neon pink and blue lighting, high-tech low-life, brushed steel and fiber optics, rain-streaked plexi-glass, dark atmospheric"`

### `backgrounds/clinic_main.png`
> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Painterly style, lush detailed backgrounds, rich colors, atmospheric. Interior of a cramped illegal back-room clinic in a cyberpunk megacity. Neon pink and blue light bleeds through fogged plexi-glass walls from an alley outside. A medical gurney with leather restraints sits center-left, instrument tray on a rolling stand beside it. A translucent plastic partition curtain on the right. Against the walls: a locked medicine cabinet, supply shelf, ventilation grate near the floor, exposed wiring from a power junction box, medical waste bin, and a heavy steel exit door with a biometric panel. A ceiling-mounted dome security camera with red LED. Ceiling pipes run overhead. Neon Chinese characters cast the dominant light. The room is clinical but clearly illegal: peeling paint, improvised wiring, stainless steel surfaces. Cyberpunk noir atmosphere, dark and moody. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. No text, no UI, no characters.`

### `backgrounds/neural_interface_closeup.png`
> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Painterly style, lush detailed backgrounds, rich colors, atmospheric. Close-up of a neural extraction alcove in a cyberpunk clinic. A reclining extraction chair with arm restraints and head brace dominates the view. Above it: a complex neural headset apparatus with electrodes, signal amplifiers, and data connectors in a cradle. A wall-mounted display shows dim amber waveforms, text reads PROCESSOR MISSING on a dead screen. Below the display: three rotary calibration dials. A coiled data cable connects headset to display. A small patient records terminal with screen and keyboard on a side console. Everything is brushed steel and fiber-optic cabling, advanced technology in a dirty setting. Surgical lighting overhead, currently dim. Cyberpunk medical tech, dark atmosphere. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. No text, no UI, no characters.`

### `backgrounds/storage_rack_closeup.png`
> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Painterly style, lush detailed backgrounds, rich colors, atmospheric. Close-up of a black-market memory storage area in a cyberpunk clinic. Floor-to-ceiling racks of cylindrical crystalline memory cartridges glowing faintly in different colors: blue for recent, amber for aged, red for damaged. They sit in cooling slots with wisps of cold vapor, a cooling unit humming at the bottom. A physical notebook with pen rests on a small shelf. An encryption terminal with compact screen and keypad sits beside the rack. A small wall-mounted safe with a 4-dial combination lock is tucked behind the rack. Handwritten labels on cartridges with case numbers. The area feels like a wine cellar for stolen minds. Cold blue-purple lighting, cyberpunk noir. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. No text, no UI, no characters.`

---

## JSON Scenario

See: [`examples/the-memory-dealer.json`](../../examples/the-memory-dealer.json)
