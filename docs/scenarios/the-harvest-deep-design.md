# The Harvest — Deep Design Document

## Companion to [the-harvest.md](./the-harvest.md)

This document contains the detailed game design: branching decision architecture, per-view interaction breakdowns, item chains, puzzle playability evaluations, and pacing analysis. The parent document covers story, image prompts, and structural overview.

---

## Design Philosophy

### Front-Load the Hook
The most compelling mechanics appear in the first 20 minutes:
- **The Pod Escape** — visceral, immediate, teaches the noise system
- **The Living Specimens** — moral choice with invisible long-term consequences
- **The Predecessor's Trail** — environmental storytelling that rewards attention
- **The Curator's First Patrol** — the hide/flee decision that defines your playstyle
- **Memory Fragments** — involuntary visions from stasis that are actually clues

### Branching Over Linearity
Act 1 decisions create genuinely different playthroughs. Not cosmetic differences — different puzzles, different available items, different ally configurations, different endings accessible. A player who frees all three specimens in Act 1 plays a fundamentally different Act 3-5 than one who left them. This means some content is only seen on specific playthroughs, which is the point: replayability through meaningful divergence.

### Puzzles Must Be Human-Logical
Every puzzle is evaluated against: "Would a thoughtful player, paying attention to environmental clues, arrive at this solution without trial-and-error?" If the answer is no, the puzzle needs more signposting or a simpler solution. The game is hard because of strategic decisions and resource management, not because puzzles are obtuse.

---

## Branching Decision Architecture

### The Decision Tree

```
ACT 1 — SPECIMEN
│
├─ DECISION: Free the Kethrani (Pod A)?
│   ├─ YES → Kethrani creates distraction in Act 2 armory (easy access)
│   │         Kethrani survives crash, becomes scout in Act 3
│   │         Noise +20 now, Curator enters "curious" state
│   │         UNLOCKS: "Hive Mind" puzzle bypass in Act 4
│   └─ NO  → Must solve stealth puzzle for armory (harder but quieter)
│             No scout in Act 3 (must find paths yourself)
│             Curator stays in "idle" state longer
│
├─ DECISION: Free the Vyss (Pod B)?
│   ├─ YES → Vyss teaches you bioluminescent communication (new verb context)
│   │         Vyss leads you to fungal grove shortcut in Act 3
│   │         Vyss translates some alien text without cipher fragments
│   │         Noise +20 now, Curator patrol tightens
│   │         UNLOCKS: Vyss acts as translator in Act 4 Echo conversations
│   └─ NO  → Must find fungal grove through dangerous wasteland
│             Need ALL 4 cipher fragments for any alien text
│             No translator for Echoes (need Echo Communicator item instead)
│
├─ DECISION: Free the Crystal Entity (Pod C)?
│   ├─ YES → Crystal Entity absorbs Convergence energy (teaches you about it)
│   │         Crystal Entity sacrifices itself in Act 4 to open weapon vault
│   │         Noise +25 now (loudest release), Curator enters "approaching"
│   │         UNLOCKS: Shortcut to Countermeasure assembly (skip one component)
│   └─ NO  → Must solve weapon vault biometric puzzle (hardest puzzle in game)
│             Need ALL Countermeasure components (no shortcuts)
│             But: quieter Act 1, more time to explore
│
├─ DECISION: Disable security alarms (Security Hub)?
│   ├─ YES → Containment deck is safer (no alarms trigger Curator)
│   │         BUT: lose camera feeds (can't track Curator via monitors)
│   │         Act 2 security systems are also weakened (easier access)
│   │         CONSEQUENCE: Curator doesn't know you escaped for longer
│   │                      but you don't know where it is either
│   └─ NO  → Alarms remain active (risk of triggering them)
│             Camera feeds stay live (can watch Curator patrols)
│             Act 2 security is full strength
│
├─ DECISION: Take the surgical probe (Processing Lab)?
│   ├─ YES → Versatile tool for the rest of the game
│   │         Tamper alert flags on Curator's next patrol
│   │         Curator becomes more thorough in containment area
│   └─ NO  → Harder to interact with fine mechanisms
│             Curator stays less alert
│             Can find alternative tools in Act 2 (but delayed)
│
└─ DECISION: How do you leave Act 1?
    ├─ VENTILATION SHAFT → Quiet exit, reach engineering first
    │   Requires: Ventilation map + surgical probe (or glass shard)
    │   Opens: Direct path to engineering/shuttle bay
    │   Closes: Cannot easily return to containment deck
    │
    ├─ ELEVATOR HACK → Loud exit, reach bridge first
    │   Requires: Containment key card + security console access
    │   Opens: Direct path to bridge/command areas
    │   Closes: Curator knows exactly where you went
    │
    └─ MAINTENANCE CRAWL → Medium, reach hydroponics first
        Requires: Nothing (always available, just hidden)
        Opens: Safe starting point in Act 2
        Closes: Nothing (but you miss some Act 1 items if rushed)


ACT 2 — THE HIVE
│
├─ DECISION: Sabotage the ship's systems?
│   ├─ SABOTAGE ENGINES → Siphon beams weaken (Act 3-4 easier surface travel)
│   │   Curator becomes enraged (Act 5 hostile guaranteed)
│   │   Ship can't reposition (affects Kamikaze ending)
│   │
│   ├─ SABOTAGE COMMS → Convergence loses updates (Watcher less informed Act 4)
│   │   BLOCKS: Signal ending (can't use comm array)
│   │   UNLOCKS: "Silent approach" path in Act 5
│   │
│   ├─ SABOTAGE CONTAINMENT → All specimens freed, ship-wide chaos
│   │   Some specimens survive to surface (minor allies Act 3)
│   │   Ship becomes extremely dangerous (drones everywhere)
│   │   UNLOCKS: "Specimen uprising" distraction in Act 5
│   │
│   └─ NO SABOTAGE → Ship intact, harder surface but more Act 5 options
│       Curator is at baseline aggression
│       All endings remain available
│       Can use ship systems remotely in Act 5
│
├─ DECISION: How do you reach the planet?
│   ├─ REPAIRED SHUTTLE → Controlled landing, choose landing zone
│   │   Requires: Power cell + fuel line + navigation chip
│   │   Land near city (skip some Act 3 wasteland)
│   │   Shuttle is reusable for escape endings
│   │
│   ├─ ESCAPE POD → Crash landing, random zone
│   │   Requires: Nothing (always available in engineering)
│   │   Harsh landing, lose some inventory items
│   │   No reusable vehicle (harder escape endings)
│   │
│   └─ CHOIR SHUTTLE (stolen) → Best ship, but highest risk
│       Requires: Universal bypass + Curator distraction
│       Land anywhere, shuttle has Choir tech onboard
│       UNLOCKS: Choir shuttle items for Act 5 combinations
│       Curator is CERTAIN to follow you (enters Act 3 early)
│
├─ DECISION: Access the data core?
│   ├─ YES → Learn Convergence communications, planet intel
│   │   Memory fragment: vision of Convergence consuming a world
│   │   This vision gives clues for Act 5 core confrontation
│   │   Takes time (risk of discovery)
│   └─ NO  → Less intel, but faster Act 2 completion
│             Miss key lore that makes Act 5 choices clearer
│
└─ DECISION: Record the Choir's resonance patterns?
    ├─ YES → Can mimic Choir communications later
    │   UNLOCKS: "False orders" option in Act 5 (Rule Subversion)
    │   Requires time in hive quarters (dangerous)
    └─ NO  → Cannot impersonate Choir communications
              One fewer tool in Act 5


ACT 3 — DESCENT
│
├─ VARIES BY: Landing method (shuttle/pod/choir shuttle)
│   └─ Different starting view, different initial items available
│
├─ DECISION: Investigate the siphon tower?
│   ├─ EXTRACT CRYSTAL (loud) → Siphon crystal fragment immediately
│   │   Massive noise, Echoes converge on area
│   │   Tower partially destabilizes (affects Act 5 energy flow)
│   │
│   ├─ EXTRACT CRYSTAL (quiet, with reinforced blade) → Same item, no noise
│   │   Requires Act 2 crafted item
│   │   Tower remains stable
│   │
│   └─ SKIP → No siphon crystal this act
│             Can find one in Act 5 nexus (but harder, more dangerous)
│
├─ DECISION: Help the Echoes in the echo field?
│   ├─ HELP (3+ Echoes) → Echoes become guides in Act 4 (show hidden paths)
│   │   One Echo reveals location of weapon vault in Act 4
│   │   Echoes passive/helpful in Act 5
│   │   Time-consuming, requires Echo Stabilizer + patience
│   │   UNLOCKS: Hidden 7th ending ("Resonance" — detailed below)
│   │
│   ├─ HELP (1-2 Echoes) → Partial guidance, Echoes are neutral
│   │   Some hidden paths revealed, some not
│   │
│   ├─ IGNORE → Echoes are environmental hazards throughout
│   │   No guidance, no hidden paths revealed
│   │   Faster progression
│   │
│   └─ EXPLOIT (use as distractions) → Echoes become hostile Act 4-5
│       The Watcher is distracted (easier Act 4 entry)
│       But Echoes actively work against you going forward
│       BLOCKS: "Resonance" ending
│
└─ DECISION: Explore the military bunker thoroughly?
    ├─ THOROUGH → Find all bunker items + complete defense schematics
    │   Takes 20+ minutes, risk of Echo activity
    │   UNLOCKS: Full weapon assembly knowledge (skip some Act 4 research)
    │
    ├─ QUICK → Find alien sidearm + partial schematics
    │   5 minutes, minimal risk
    │   Need Act 4 research lab for remaining knowledge
    │
    └─ SKIP → Miss bunker entirely (hidden, easy to walk past)
              No alien weapon, no schematics
              Must find everything in Act 4 (harder)


ACT 4 — THE DEAD CITY
│
├─ DECISION: Restore city power?
│   ├─ FULL POWER → All city systems online
│   │   Library, rail system, weapon vault all accessible
│   │   The Watcher immediately aware of you (aggressive from start)
│   │   Lights reveal hidden details throughout the city
│   │
│   ├─ PARTIAL POWER → Choose which districts to activate
│   │   Puzzle: power routing (toggle panel)
│   │   Only chosen areas functional
│   │   Watcher less aggressive but still aware
│   │
│   └─ NO POWER → City stays dark
│       Must use improvised torch/light redirector for visibility
│       Watcher doesn't detect you initially (stealth approach)
│       Many interactions unavailable (no powered systems)
│       Rail system offline (must walk everywhere)
│
├─ DECISION: Ally with a coherent Echo?
│   ├─ THE SCIENTIST → Provides weapon assembly guidance
│   │   Requires: Echo Communicator + helping Echoes in Act 3
│   │   UNLOCKS: Guided weapon assembly (can't mess up component order)
│   │   Lore: tells you about the final battle, what went wrong
│   │
│   ├─ THE SOLDIER → Provides tactical guidance for Act 5
│   │   Requires: Echo Communicator + finding their memorial in residential block
│   │   UNLOCKS: Safe routes through the nexus
│   │   Lore: tells you about the Convergence's defenses
│   │
│   ├─ THE CHILD → Provides emotional key to the temple
│   │   Requires: Echo Communicator + alien personal locket
│   │   UNLOCKS: Temple resonance puzzle bypass (the child knows the frequency)
│   │   Lore: the most heartbreaking interaction in the game
│   │
│   └─ NONE → Must solve everything through items and puzzles alone
│             No guided assembly, no safe routes, no bypasses
│
└─ DECISION: How do you enter the nexus?
    ├─ UNDERGROUND RAILWAY → Direct tunnel descent
    │   Requires: Railway pass token + power to rail system
    │   Fast, but one-way (train doesn't return)
    │
    ├─ SCIENTIST ECHO'S PATH → Hidden passage through the temple
    │   Requires: Allied Scientist Echo
    │   Safer, with supply caches the scientists left
    │
    └─ SURFACE APPROACH → Walk to the nexus across crystallized wasteland
        Requires: Energy dampener (protection from Convergence energy)
        Dangerous, but you can retreat if needed
        Allows: Stopping at the nexus entrance for final preparation


ACT 5 — THE NEXUS
│
├─ All previous decisions converge here
│   Freed specimens may appear as allies
│   Sabotaged ship systems affect nexus behavior
│   Echo relationships determine help or hindrance
│   Items from ALL acts needed for final combinations
│
└─ ENDINGS (which are available depends on cumulative decisions)
    ├─ ESCAPE → Always available (minimum items: nav chip, beacon, shaft key)
    ├─ DESTROY → Requires Countermeasure (items from Acts 1,2,3,4,5)
    ├─ SABOTAGE+ESCAPE → Requires Countermeasure + escape items + timer
    ├─ SIGNAL → Requires Galactic Broadcast (blocked if comms sabotaged)
    ├─ KAMIKAZE → Requires Orbital Weapon (blocked if engines sabotaged)
    ├─ TRANSCENDENCE → Requires Neural Bridge + prophet's crystal
    └─ RESONANCE (hidden) → Requires helping 3+ Echoes + Crystal Entity freed
                             + prophet's crystal + Echo Communicator
```

---

## Ending 7: Resonance (Hidden Ending)

**Requirements**: Freed the Crystal Entity (Act 1), helped 3+ Echoes find peace (Act 3), built the Echo Communicator (Act 4), obtained the prophet's crystal (Act 4).

**How it unfolds**: If you've done all of the above, the prophet's crystal shows you a vision the other endings don't include: the civilization that lived here didn't just build a weapon. They also built a **resonance network** — a way to harmonize with the planet's natural energy and counter the Convergence's drain without destruction. It failed because they couldn't generate enough resonance alone. But you're not alone. The Echoes you helped — dozens of them, all the ones you freed from their loops — they can resonate together. The Crystal Entity, which absorbed Convergence energy throughout the game, acts as an amplifier.

You don't destroy the Convergence. You don't flee. You don't merge with it. You *sing it to sleep*. The Echoes and the Crystal Entity create a harmonic field that neutralizes the Convergence's hunger on this planet — not by force, but by resonance. The planet begins to heal. The Echoes find true peace, fading into the planet's energy with gratitude. The Crystal Entity becomes a permanent guardian. The Choir, cut off from their master's commands, become dormant.

**Emotional tone**: Peaceful. Beautiful. The hardest ending to find but the most emotionally satisfying. You solved the problem without violence, without sacrifice, without compromise. The final image is the planet from orbit — green returning to the scarred surface, the siphon beams fading, and your shuttle heading home.

**Steps**: ~22 (spread across the entire game — requires specific choices from Act 1 onward)

**Why it's hidden**: No hint in the game explicitly points to this ending. The prophet's crystal vision only appears if ALL prerequisites are met. Players discover it by being compassionate throughout — freeing specimens, helping Echoes — without knowing it leads anywhere. The game rewards empathy.

---

## Act 1: Specimen — Detailed Breakdown

### Opening Sequence (First 5 Minutes)

**What the player experiences:**

You see amber. Everything is amber. Slowly, the fluid drains — your pod's glass is cracked, and stasis fluid is leaking. Your vision clears. You're inside a translucent pod. Through the glass, you see hundreds of other pods, stretching up into darkness. Most contain dead things. The pod to your left holds a massive insectoid creature — alive, its compound eyes tracking you through the glass. The pod to your right holds a translucent amphibian, calmly watching you with bioluminescent spots pulsing along its body.

**First interaction**: `look` at your pod. Message: *"The glass is cracked in a spiderweb pattern. Stasis fluid pools at your feet, amber and viscous. A control panel on the inside of the pod blinks red — malfunction. Your body aches. How long were you in here?"*

**Second interaction**: `hand` on the cracked glass. This is the **Gateway Puzzle** — the very first interaction, no prerequisites. The glass breaks. Noise +15. You're out.

**Playability evaluation**: Perfect opening. The player is immediately oriented (I'm in a pod, I need to get out) and the solution is obvious (the glass is already cracked, push on it). The noise consequence teaches the core mechanic immediately — loud actions have consequences. The living specimens watching you creates instant emotional context.

**The 90-second window**: After breaking out, the Curator is alerted by the pod malfunction (not by the noise — the pod itself sends an alert). You have approximately 90 seconds before it arrives at the stasis hold. This is communicated by a distant sound: *CLICK. CLICK. CLICK. Precise footsteps, far away but approaching.*

The player has 90 seconds to:
1. Grab the stasis fluid vial (take — from the puddle, 2 seconds)
2. Grab the pod glass shard (take — from the broken pod, 2 seconds)
3. Choose: hide or explore

**HIDE option**: Get back in your pod and close the glass as best you can (hand on pod from outside). The Curator arrives, examines pods, finds the malfunction, and moves on. You're safe but you've used your 90 seconds hiding. The Curator is now in "curious" state.

**EXPLORE option**: Move to the pod cluster or containment corridor. You see more of the hold but risk being caught. If caught: the Curator returns you to a containment cell (not the pod — a new location with its own escape puzzle). You lose 10 minutes but gain knowledge of the cell area.

**Playability evaluation**: This early decision is brilliant because BOTH choices are valid and neither is a dead end. Hiding is safer and teaches patience. Exploring is riskier but rewards initiative. Being caught isn't game over — it's a detour that provides its own items and knowledge. No player can make a "wrong" choice here.

---

### View-by-View Breakdown

#### View 1: Stasis Hold (act1_stasis_hold)

**Objects** (12):
| Object | Verbs | Key Interactions |
|--------|-------|------------------|
| your_broken_pod | look, hand, take | Look: description of the pod. Hand: climb back in (hide). Take: stasis fluid vial from residue |
| pod_a_kethrani | look, hand, talk | Look: describes the insectoid. Hand: release mechanism (noise +20). Talk: it chitters, can't understand yet |
| pod_b_vyss | look, hand, talk | Look: describes the amphibian. Hand: release mechanism (noise +20). Talk: bioluminescent pulses, can't understand yet |
| pod_c_crystal | look, hand | Look: describes the living mineral. Hand: release mechanism (noise +25, loudest). Crystal radiates warmth on release |
| specimen_terminal | look, hand, use_item | Look: alien interface. Hand: activates display (your specimen record). Use cipher: read full records |
| catwalk_railing | look, hand | Look: describes the vertical scale. Hand: lean over to see lower levels (reveals maintenance hatch) |
| maintenance_hatch | look, hand, use_item | Initially hidden. Look: sealed hatch. Hand: won't budge. Use glass shard: pry it open → crawl space shortcut |
| nutrient_line | look, hand, take | Look: tube feeding the pods. Hand: disconnect (noise +5). Take: nutrient paste tube |
| security_camera | look, hand, use_item | Look: lens tracking you. Hand: can't reach (too high). Use surgical probe: disable (prevents Curator from tracking you here) |
| wall_markings | look | Look: scratched tally marks (47) and an arrow. Message: *"Someone was here before you. 47 marks. An arrow points toward a ventilation grate high on the wall."* |
| ceiling_cracks | look | Look: faint light filters through. Message: *"Hairline fractures in the ceiling. Natural? Or damage from whatever cracked your pod?"* |
| pod_glass_shard | take | On the floor after breaking out. Improvised cutting/prying tool |

**Items available**:
- `stasis_fluid_vial` — Take from your pod. *Critical path item*: used in Act 3 combination (Energy Dampener) which feeds into Act 5 Countermeasure. If missed here, can be obtained from the morgue (backup source) but that's a more disturbing interaction.
- `pod_glass_shard` — Take from broken glass. Improvised tool. Used for vent grate, pod releases, combination into Reinforced Blade (Act 2).
- `nutrient_paste_tube` — Take from nutrient line. Distraction item + combination ingredient.

**Decisions in this view**:
1. Free specimens (each one individually — can free 0, 1, 2, or 3)
2. Disable the security camera (prevents tracking but takes time)
3. Read the specimen terminal (lore + foreshadowing for neural mapping in Act 5)

**Human playability**: The stasis hold is immediately readable. The player sees pods, sees they're in one, sees others are alive. Every object has a clear visual identity. The specimen terminal is the "optional lore" object that rewards curiosity. The wall markings seed the predecessor storyline that pays off later.

---

#### View 2: Pod Cluster Detail (act1_pod_cluster)

**Objects** (8):
| Object | Verbs | Key Interactions |
|--------|-------|------------------|
| dead_specimen_pod | look | Look: *"A creature like a praying mantis, twice human size. Perfectly preserved. Its compound eyes are clouded. How many worlds has this ship visited?"* |
| pod_control_panel | look, hand | Look: bio-organic buttons. Hand: activates cluster diagnostic. Reveals which pods are active/failed/empty. YOUR pod shows "MALFUNCTION — CONTAINMENT BREACH" |
| nutrient_junction | look, hand, use_item | Look: where nutrient lines converge. Hand: disconnect all (stops feeding to this cluster, noise +10). Use glass shard: cut a specific line (quiet, gets nutrient paste) |
| scratched_message | look | Look: scratched deeper than tally marks. With cipher (Act 4): reads *"They don't see us. They catalog us. Like insects in a jar. I refuse."* — the predecessor's defiance |
| pod_labels | look, use_item | Look: alien script, unreadable. Use cipher: specimen species, origin world, date of capture. YOUR label says you were captured 6 days ago |
| central_node | look, hand, use_item | Look: processing unit connecting pods. Hand: warm to touch. Use surgical probe: extract data crystal containing specimen log — this is *translation cipher fragment 1/4* |
| empty_pod | look, hand | Look: clean, prepped for a new specimen. Hand: climb inside (hiding spot). Inside you find a scrap of fabric — human. The predecessor was held here |
| predecessor_fabric | take | Hidden inside the empty pod. A scrap of jumpsuit with a name patch: "CHEN, L." and a partial code scratched into it. The code is 3 digits of the Act 5 control spire combination |

**Items available**:
- `data_crystal_log` (translation cipher fragment 1/4) — From the central node. Requires surgical probe.
- `predecessor_fabric` — From the empty pod. Contains partial code for Act 5.

**Decisions**: Whether to spend time here vs. moving on. The predecessor storyline rewards players who explore thoroughly.

**Human playability**: This view rewards curiosity. Nothing here is required for progression, but everything here makes later acts easier or richer. The predecessor storyline (Chen, L.) is a breadcrumb trail that spans the entire game. Players who piece together Chen's story across all 5 acts learn the control spire code without solving the Act 5 puzzle.

---

#### View 3: Processing Lab (act1_processing_lab)

**Objects** (10):
| Object | Verbs | Key Interactions |
|--------|-------|------------------|
| examination_table | look, hand | Look: restraints, drainage channels. Hand: restraints click open — they held YOU. Message: *"Your wrists ache. You were strapped here. Recently."* |
| surgical_tool_rack | look, take | Look: bone-like instruments in a rack. Take: surgical probe (the most versatile). Taking triggers tamper alert (subtle — Curator notices on next patrol) |
| specimen_jars | look, hand | Look: samples in fluid. Some tissue, some whole organs. One jar is labeled with YOUR specimen number. Hand: open your jar — it contains a tissue sample. Message: *"They took a piece of you. A biopsy. While you slept."* |
| data_screen | look, hand | Look: processing records. Hand: scroll through. YOUR entry: "Specimen 1,247. Neural mapping: 94% compatible. Flag for extended study." — This becomes critical lore for the Transcendence ending |
| drainage_system | look, hand | Look: channels in the floor for fluid. Hand: reach inside — find a small metal tag. It's your specimen tag with an ID number |
| storage_cabinet | look, hand, use_item | Look: locked cabinet. Hand: won't open. Use glass shard: pry open. Contains: emergency medical kit (healing item) + chemical reagent (crafting ingredient) |
| chemical_reagent_shelf | look, take | Look: alien chemicals in containers. Take: one container of reactive solution. Use: can corrode organic locks (useful in multiple locations) |
| predecessor_notes | look | Hidden behind the data screen (hand on the screen to move it). Scratched text: another piece of Chen's escape plan. If found, provides knowledge of the ventilation system layout |
| ceiling_vent | look, hand, use_item | Look: ventilation grate above. Hand: too high. Use surgical probe: loosen bolts (noise +5). Then hand: pull down grate. Access to ventilation shaft |
| specimen_tag | take | From drainage system. YOUR tag. *Critical path item*: used in Act 5 Proof of Sentience combination |

**Items available**:
- `surgical_probe` — The game's most versatile tool. Fine manipulation, prying, medical use.
- `specimen_tag` — Your ID. Critical for Proof of Sentience (Act 5).
- `chemical_reagent` — Corrodes organic locks. Multiple uses throughout Acts 1-2.
- `emergency_med_kit` — Healing. Single use.

**Decisions**:
1. Take the surgical probe? (Versatile but triggers alert)
2. Read the data screen? (Lore for Transcendence ending)
3. Access the ceiling vent? (Alternate route)

**Human playability**: Every interaction in this room tells you something about what happened to you. The examination table aches. The data screen shows your "neural mapping." The specimen jar has your tissue. This is environmental storytelling that makes the player feel violated and desperate to escape — exactly the emotional state that drives good gameplay decisions.

---

#### View 4: Containment Corridor (act1_containment_corridor)

The hub view connecting all Act 1 locations. Three blast doors and one hidden crawlspace.

**Objects** (9):
| Object | Verbs | Key Interactions |
|--------|-------|------------------|
| blast_door_1 | look, hand, use_item | To Security Hub. Locked. Use containment key card: opens. Use chemical reagent: corrodes lock mechanism (permanent, loud) |
| blast_door_2 | look, hand | To Feeding Station. Unlocked (specimens need to be fed). Hand: opens normally |
| blast_door_3 | look, hand, use_item | To Morgue. Bio-locked (alien biometrics). Use severed neural tendril (from Act 2 or found in morgue approach): bypass. Use chemical reagent: corrodes bio-lock (permanent) |
| corridor_lighting | look, hand | Look: amber emergency strips. Hand: smash a strip (creates darkness in this section, noise +10). Useful for hiding from Curator patrols |
| floor_grating | look, hand | Look: pulsing machinery below. Hand: loose grate (hides a maintenance crawlspace). Noise +5 to remove |
| maintenance_crawlspace | look, hand | Hidden until floor grating removed. Leads to the hydroponics bay in Act 2 (stealth exit) |
| wall_panel | look, hand, use_item | Look: sealed access panel. Hand: won't budge. Use surgical probe: open. Contains: ship schematic fragment (partial map) |
| ventilation_grate_high | look, use_item | Look: grate high on the wall. Predecessor's arrow pointed here. Use glass shard + hand (climb): enter ventilation shaft |
| corridor_alcove | look, hand | Look: recessed area. Hand: step inside. Hiding spot. The Curator walks past alcoves without checking (initially) |

**Decisions**:
- Which door to try first (affects exploration order)
- Whether to create darkness (helps hiding, but you can't see well either)
- Which exit to use for Act 2 transition

**Human playability**: Hub views should be immediately readable as "choice points." Three doors, each visually distinct (one with a card reader, one open, one with a bio-scanner), teach the player about the ship's security tiers. The hiding alcove teaches the hiding mechanic safely — you can practice before you need it.

---

#### View 5: Morgue (act1_morgue)

**Objects** (10):
| Object | Verbs | Key Interactions |
|--------|-------|------------------|
| specimen_drawers | look, hand | Look: wall of drawers. Hand: pull open random drawer — dead alien. Pull another — another species. Pull a specific one (highlighted subtly): a HUMAN. Message: *"The face is preserved. It could be anyone. But the jumpsuit patch reads 'CHEN, L.' — the same name as the fabric scrap."* |
| chen_body | look, hand, take | Only after opening drawer. Look: your predecessor. Hand: search. Take: Chen's journal chip (data crystal with notes from 47 days of captivity) |
| autopsy_slab | look, hand | Look: drainage channels, restraint marks. Hand: find dried fluid underneath — a second stasis fluid source (backup for players who missed it in the hold) |
| recycling_vats | look, hand | Look: where dead specimens are broken down. Hand: reach inside one — find a severed neural tendril (preserved in the recycling fluid, not yet processed). This item bypasses bio-locks |
| chemical_cabinet | look, hand, use_item | Look: chemicals for preservation. Hand: open (unlocked). Take: natron-like preservative (combination ingredient) |
| drainage_floor | look | Look: channels lead to recycling vats. Environmental detail |
| cold_storage_unit | look, hand | Look: large unit humming. Hand: open — blast of cold air. Inside: frozen specimens, including one that looks almost alive. It twitches. (Red herring — it's muscle reflex, not life) |
| predecessor_locker | look, hand, use_item | Look: a small personal locker, human-sized amid alien infrastructure. The Choir gave Chen a locker? Hand: locked with a human combination lock. Use (if you found the code digits from predecessor_fabric + chen_journal): opens. Contains: Chen's modified tool (better than surgical probe), Chen's map of the ship (complete) |
| bio_scanner | look, hand, use_item | Door access. Look: scans for Choir biology. Hand: doesn't recognize you. Use severed neural tendril: bypasses (but tendril is consumed). Use chemical reagent: corrodes permanently |
| overhead_lighting | look | Look: harsh clinical light. No interaction — sets mood |

**Items available**:
- `chen_journal` — Chen's 47-day journal. Contains observations about the Curator's patterns, partial ship map, notes on the Choir, and the remaining digits of the spire code (combined with fabric scrap = complete code for Act 5).
- `severed_neural_tendril` — Bypasses bio-locks. Single use.
- `stasis_fluid_backup` — Backup source of stasis fluid.
- `chens_tool` (optional) — Superior to surgical probe. Only accessible if player found code pieces.

**Human playability**: Finding Chen's body is the emotional gut-punch of Act 1. The player has been following breadcrumbs (tally marks, fabric, scratched messages) and now they find the person who left them. Chen didn't make it. But Chen's journal and tools become YOUR advantage. This is Pattern 26 (Accomplice) with a dead accomplice — guidance from someone who walked this path before you.

The predecessor locker is a reward for thorough exploration across multiple views. Players who found the fabric scrap AND the journal can open it. Players who missed either can't — but it's not required for progression, just a significant advantage (better tool + complete map).

---

#### Views 6-10: Summary

**View 6: Feeding Station** — Introduces the living specimens' conditions. If you freed them, they're here eating. You can observe Choir drones (small worker units) performing routine tasks — learning their behavior before encountering the Curator. Key item: Nutrient paste tube (backup), energy barrier modulator (from the enclosure controls — lets you disable energy barriers elsewhere).

**View 7: Ventilation Shaft** — The predecessor's escape route. Branching paths. One leads to Act 2 (engineering). Another loops back to the stasis hold. A third leads to a dead end where you find another predecessor artifact: a crude map scratched into the wall showing the ship's general layout. Hiding spot (the Curator can't fit in the vents). Key item: ventilation map (if not found earlier from wall markings).

**View 8: Security Hub** — Critical decision point. Camera feeds show the Curator's patrol route (Pattern 24 — Perspective Alignment, watching from the right vantage). The security console hack (sequence puzzle) unlocks the storage locker (containment key card). Decision: disable alarms or keep camera feeds.

**Puzzle: Security Console Hack**
- Widget type: `sequence_puzzle`
- Five bio-organic buttons, each a different color/texture
- The correct sequence is displayed on a smaller diagnostic screen — it's the system's own startup sequence, visible for 10 seconds when you first power the console
- If you missed it: the sequence is also scratched into Chen's journal (if found)
- Fail state: 3 wrong attempts triggers a lockdown alert (noise +30)
- **Playability**: Fair because the solution is shown to you (the startup sequence) before you need it. Observant players catch it immediately. Others need Chen's journal or trial-and-error (with risk).

**View 9: Specimen Archive** — Lore-heavy view. Data crystals on the wall record every species collected. The reading device shows: the Convergence has consumed 1,247 worlds (you are Specimen 1,247 — not a coincidence). One data crystal is different from the others — it's from the planet below, recording the four-armed civilization's communications. This is context for Act 4. Key item: Archive data crystal (lore item that provides context for Act 4 library interactions).

**View 10: Airlock Bay** — The emotional beat that closes Act 1. Your ship is gone. The docking clamps are empty. Through the viewport, the planet is beautiful — you can see the energy siphon beams from here, thin lines of light descending to the surface. Key items: emergency suit helmet (survive vacuum/toxic areas), manual override schematic (knowledge item for Act 2 shuttle bay). Decision: use the manual override to open the airlock? (Vents the bay — dangerous but clears a path to the ship's exterior hull, which connects to the shuttle bay).

---

### Act 1 Level Map

#### Spatial Layout

The containment deck is a self-contained section of the Choir vessel. The Containment Corridor is the central hub, with specimen-related rooms branching south and operational rooms branching to the sides and north. The Airlock Bay sits at the deck's outer hull. Three exits lead to Act 2.

```
                              ┌─────────────────┐
                              │   AIRLOCK BAY    │
                              │    (View 10)     │   N
                              │   4.webp         │   ↑
                              └────────┬─────────┘
                                       │
          ┌────────────────────────────┼──────────────────────────┐
          │                            │                          │
┌─────────┴───────────┐    ┌───────────┴───────────┐    ┌────────┴────────────┐
│   SPECIMEN ARCHIVE  │    │   CONTAINMENT         │    │   SECURITY HUB      │
│      (View 9)       │────│     CORRIDOR           │────│     (View 8)        │
│      13.webp        │    │      (View 4)          │    │     12.webp         │
└─────────────────────┘    │      8.webp            │    └─────────────────────┘
                           └──┬────────┬─────────┬──┘
                              │        │         │
          ┌───────────────────┘        │         └───────────────────┐
          │                            │                             │
┌─────────┴───────────┐    ┌───────────┴───────────┐    ┌───────────┴─────────┐
│   FEEDING STATION   │    │     STASIS HOLD       │    │       MORGUE        │
│      (View 6)       │    │      (View 1)         │    │      (View 5)       │
│      9.webp         │    │      14.webp          │    │      10.webp        │
└─────────────────────┘    └──┬────────────────┬───┘    └─────────────────────┘
                              │                │
                       ┌──────┴──────┐  ┌──────┴──────────┐
                       │ POD CLUSTER │  │  PROCESSING LAB │
                       │  (View 2)   │  │    (View 3)     │
                       │  6.webp     │  │    11.webp      │
                       └─────────────┘  └────────┬────────┘
                                                 │ ceiling vent
                                                 │
                           ┌────────────┐  ┌─────┴────────┐
                           │  (to Act 2 │  │ VENTILATION  │
               ┌───────────│ engineering)│←─│    SHAFT     │
               │           └────────────┘  │   (View 7)   │
               │                           │   15.webp    │
               │  floor    ┌────────────┐  └──────────────┘
               │  grate    │  (to Act 2 │
               └──────────→│ hydroponics)│
             from View 4   └────────────┘
```

#### Image-to-View Mapping

| View | ID | Image | Visual Description |
|------|----|-------|--------------------|
| 1. Stasis Hold | `act1_stasis_hold` | `14.webp` | Amber pods covering walls, broken pod with spilled fluid, glowing green neural pattern |
| 2. Pod Cluster Detail | `act1_pod_cluster` | `6.webp` | 7 amber pods in flower arrangement, green glow center hub, alien script labels |
| 3. Processing Lab | `act1_processing_lab` | `11.webp` | Surgery tables with restraints, specimen jars on shelves, green diagnostic screens |
| 4. Containment Corridor | `act1_containment_corridor` | `8.webp` | Organic pipes, orange ceiling lights, teal/green floor tubes, corridor junctions |
| 5. Morgue | `act1_morgue` | `10.webp` | Body drawers with specimens, cyan fluorescent lighting, autopsy table |
| 6. Feeding Station | `act1_feeding_station` | `9.webp` | Examination area, purple energy barriers, hanging organic mass, holographic screens |
| 7. Ventilation Shaft | `act1_ventilation_shaft` | `15.webp` | Circular red-lit tunnel, claw marks on walls, green light at far end |
| 8. Security Hub | `act1_security_hub` | `12.webp` | Multiple monitors showing other rooms, broken screen, control console |
| 9. Specimen Archive | `act1_specimen_archive` | `13.webp` | Walls of purple/blue crystals, holographic planetary system displays, central pedestal |
| 10. Airlock Bay | `act1_airlock_bay` | `4.webp` | Observation viewport to space, empty docking clamps, space suit, orange door |

Alternate image `7.webp` is a second angle of the Airlock Bay corridor approach.

#### Connection Table

Each row defines a navigable boundary. `Direction` is the screen edge or hotspot the player clicks.

| From View | Direction | To View | Unlock Condition | Notes |
|-----------|-----------|---------|------------------|-------|
| Stasis Hold | North | Containment Corridor | None (open passage) | Main exit from the hold |
| Stasis Hold | West | Pod Cluster Detail | None (same area) | Walk deeper into the hold |
| Stasis Hold | East | Processing Lab | None (adjacent) | Through specimen processing archway |
| Pod Cluster Detail | East | Stasis Hold | None | Return to main hold area |
| Processing Lab | West | Stasis Hold | None | Back to the hold |
| Processing Lab | Up (ceiling vent) | Ventilation Shaft | Glass shard or surgical probe (pry grate) | Alternate route, noise +5 |
| Containment Corridor | South | Stasis Hold | None (open passage) | Back to where you woke up |
| Containment Corridor | West (Blast Door 2) | Feeding Station | None (unlocked) | Specimens need feeding |
| Containment Corridor | East (Blast Door 1) | Security Hub | Containment key card OR chemical reagent | Key card = quiet; reagent = permanent + loud |
| Containment Corridor | Southeast (Blast Door 3) | Morgue | Severed neural tendril OR chemical reagent | Bio-locked; tendril consumed on use |
| Containment Corridor | North (passage) | Specimen Archive | None | Leads toward outer hull |
| Containment Corridor | Down (floor grate) | **ACT 2** (Hydroponics) | None (hidden, hand to remove, noise +5) | Maintenance crawl — medium exit |
| Containment Corridor | Up (high vent grate) | Ventilation Shaft | Glass shard + climb | Arrow on wall hints at this |
| Feeding Station | East | Containment Corridor | None | Return through Blast Door 2 |
| Security Hub | West | Containment Corridor | None (from inside) | Return through Blast Door 1 |
| Security Hub | — (elevator) | **ACT 2** (Bridge) | Containment key card + console hack | Elevator hack — loud exit |
| Morgue | Northwest | Containment Corridor | None (from inside) | Return through Blast Door 3 |
| Specimen Archive | South | Containment Corridor | None | Back to hub |
| Specimen Archive | North | Airlock Bay | None | Continues toward hull |
| Airlock Bay | South | Specimen Archive | None | Back toward interior |
| Airlock Bay | — (airlock override) | Ship exterior (Act 2) | Manual override | Vents the bay — dangerous |
| Ventilation Shaft | Branch A | **ACT 2** (Engineering) | Ventilation map + tool | Quiet exit — predecessor's route |
| Ventilation Shaft | Branch B | Stasis Hold | None | Loops back (dead end awareness) |
| Ventilation Shaft | Branch C | Dead end | — | Predecessor's scratched map found here |

#### Act 1 Exits to Act 2

Three possible exits, each landing the player in a different Act 2 starting location:

```
EXIT 1: VENTILATION SHAFT ──→ Engineering (quiet, needs map + tool)
EXIT 2: ELEVATOR HACK     ──→ Bridge (loud, Curator knows where you went)
EXIT 3: MAINTENANCE CRAWL  ──→ Hydroponics (medium, always available if found)
```

#### Navigation Hotspot Design

Click targets for scene transitions follow classic point-and-click conventions:

- **Doorways and corridors**: Visible openings in the background image. The cursor changes to a directional arrow when hovering over a travelable boundary.
- **Blast doors**: Distinct door sprites with card readers / bio-scanners visible. Locked doors show a "locked" cursor until the unlock condition is met.
- **Vertical transitions** (vents, floor grates): Highlighted with subtle animation (e.g., air currents for vents, glow under grates). Cursor changes to up-arrow or down-arrow.
- **Hidden exits**: Not visible until discovered. The maintenance crawlspace appears only after removing the floor grate. The ceiling vent becomes clickable after loosening bolts.

Each view defines its hotspots in the scenario JSON as boundary objects with `travel_to` targets:

```json
{
  "id": "exit_north_corridor",
  "name": "Corridor entrance",
  "position": { "x": 0.45, "y": 0.05, "width": 0.10, "height": 0.15 },
  "verbs": {
    "hand": {
      "travel_to": "act1_containment_corridor",
      "message": "You step into the dimly lit corridor. Orange emergency strips pulse overhead."
    },
    "look": {
      "message": "A corridor stretches ahead, lined with pulsing organic conduits. Emergency lighting casts everything in amber."
    }
  }
}
```

---

## Act 2: The Hive — Detailed Breakdown

### Pacing Shift

Act 2 is where the game opens up. Act 1 was linear (wake up, explore containment, find a way out). Act 2 is a web — 10 views with multiple connection paths, 3 possible objectives (shuttle repair, sabotage, intel gathering), and the Choir's operational decks introduce new enemy types (maintenance drones alongside the Curator).

### Front-Loaded Mechanic: The Memory Fragments

Starting in Act 2, the player begins experiencing **Memory Fragments** — involuntary flashes from the stasis process. The neural mapping wasn't just analysis; it created echoes of other specimens' memories in your mind. These manifest as brief visual/text interrupts:

- **Fragment 1** (entering the bridge): A flash of four-armed hands operating a console. The gesture sequence is the same one needed for the Act 4 library data access.
- **Fragment 2** (entering engineering): A vision of the reactor from INSIDE — you feel the heartbeat. You understand instinctively that the reactor is alive. This knowledge lets you interact with it differently (calm it vs. overload it).
- **Fragment 3** (entering hive quarters): A Choir memory. You see through eyeless senses — resonance, vibration, temperature. You feel the pull of the Convergence's commands. For a moment, you understand the Choir's obedience. This gives you the ability to record resonance patterns.
- **Fragment 4** (entering the data core): A vision of the Convergence itself — vast, ancient, consuming a star. The vision is overwhelming and the player blacks out briefly (2 seconds, screen dark). When you come back, you know something: the Convergence is afraid. Of what, you don't know yet.

**Playability evaluation**: Memory Fragments are disguised tutorials and clues. They feel like narrative flavor but each one contains actionable information. Players who pay attention learn gesture sequences, reactor behavior, Choir communication, and the Convergence's vulnerability. Players who skip them can still progress but miss shortcuts and insights. This is Pattern 8 (Knowledge Gate) delivered as story.

---

### Key View Details

#### View 11: Navigation Bridge

**The Star Map** is the centerpiece. It's interactive — players can rotate it, zoom in on systems. Each consumed system has a data entry: species, technology level, time to consume, outcome. The pattern is clear: the Convergence targets technologically advanced worlds (they produce more energy). Earth-level technology is flagged as "low-yield, minimal resistance." The planet below is flagged as "high-yield, significant resistance — containment protocols active."

**Key decision**: The bridge has a ship-wide intercom. You can:
1. Broadcast a false alarm (draws the Curator to a distant section, giving you 3 minutes of freedom — Pattern 13, Distraction Window)
2. Access the ship's manifest (learn what's in each section)
3. Download navigation data to the navigation chip (required for shuttle launch and escape ending)

**Playability**: The star map is a spectacle moment — it communicates the scale of the threat without any text. Seeing 1,247 red dots (consumed worlds) hits differently when you know your specimen number is 1,247. The intercom decision is a clear risk/reward: the false alarm helps short-term but the Curator will know someone used the intercom.

#### View 12: Engineering

**The Reactor** is alive. It breathes. If you have Memory Fragment 2 (entered this room), you can "talk" to it — not in words, but through touch. Place your hand on a specific membrane and you feel its rhythm. Match the rhythm by pressing bio-organic buttons in sequence, and the reactor trusts you. It dims its output to one section at a time — you choose which area of the ship loses power (this is the Act 2 sabotage mechanic implemented as a relationship with a living machine).

**Puzzle: Reactor Resonance**
- Widget type: `sequence_puzzle`
- Feel the heartbeat (pulses shown visually), then press buttons in the same rhythm
- Memory Fragment 2 gives you the rhythm. Without it, you must observe for 30 seconds
- Success: reactor responds to your commands. You can dim power to any ship section
- Failure: reactor surges, steam vents (noise +25), burns are possible

**Key items**: Power cell (from a charging station), coolant flask (from the cooling system), shuttle fuel line (from a storage rack).

#### View 16: Shuttle Bay

**The Shuttle Repair** is Act 2's primary objective. Three shuttles: one destroyed, one damaged (missing power cell), one locked (Choir biometric). The damaged shuttle needs:
1. Power cell (from engineering)
2. Shuttle fuel line (from engineering)
3. Navigation chip (from bridge)

**Puzzle: Shuttle Launch Sequence**
- Widget type: `keypad` (3-step startup sequence)
- Step 1: Install power cell (use_item on power bay)
- Step 2: Connect fuel line (use_item on fuel port)
- Step 3: Enter navigation coordinates (keypad — coordinates from the bridge star map)
- The coordinates are the planet's orbital position, visible on the bridge's viewport display

**The Escape Sequence**: Once the shuttle is ready, launching it is a **Ticking Clock Decision** (Pattern 14). The launch sequence takes 30 seconds. The Curator is alerted by the bay door opening. You have to:
- Start the launch sequence (hand on shuttle controls)
- Wait 30 seconds while the bay door opens and the shuttle warms up
- The Curator arrives in approximately 25 seconds
- You must either: hide in the shuttle (and hope it launches in time), set a distraction (nutrient paste in the corridor), or have an ally distraction (freed Kethrani creates havoc)

**Human playability**: The shuttle repair is a satisfying multi-step chain where each component was found in a different part of Act 2. The launch sequence is tense but fair — 30 seconds with a 25-second Curator arrival means you have a 5-second margin. Players who set distractions have more margin. Players who freed the Kethrani have the easiest time (it fights the Curator directly, buying you unlimited time).

---

## Act 3: Descent — Key Design Notes

### Landing Variation

Where you land depends on how you left the ship:

| Method | Landing Zone | Starting Condition |
|--------|-------------|-------------------|
| Repaired shuttle | Near city gates (skip 3 wasteland views) | Shuttle intact, full inventory |
| Escape pod | Random wasteland (must traverse all of Act 3) | Pod destroyed, lose 1 random item |
| Choir shuttle (stolen) | Anywhere (player choice) | Best equipment, but Curator follows in 2nd shuttle |

This is the first major divergence point — players who took the Choir shuttle are playing a fundamentally different Act 3 (they have Choir tech but the Curator is active on the surface).

### The Echo Compassion System

Echoes are the souls of the dead civilization, trapped in energy loops. The player's relationship with them is tracked by a hidden `echo_compassion` flag (0-5 scale):

| Level | How Achieved | Effect |
|-------|-------------|--------|
| 0 | Default / exploited Echoes | Echoes hostile. Block paths, trigger noise, alert Watcher |
| 1 | Helped 1 Echo | Echoes neutral. Environmental hazards only |
| 2 | Helped 2 Echoes | Echoes occasionally point toward items |
| 3 | Helped 3 Echoes | Echoes guide you to hidden paths. UNLOCKS: Resonance ending |
| 4 | Helped 4 Echoes | Echoes protect you from the Watcher (brief interference) |
| 5 | Helped all available Echoes | Echoes actively assist in Act 5. Warning system against threats |

**Helping an Echo** means using the Echo Stabilizer to stop their loop, then communicating (Echo Communicator or Vyss translator) to understand what they need. Each Echo has a personal request:
- The Mother: find her child's toy in the residential block (Act 4)
- The Soldier: retrieve their squad's flag from the bunker
- The Scientist: complete their unfinished equation (solve a simple math puzzle)
- The Artist: witness their final painting (look at a specific wall in the city)
- The Elder: ring the temple bell (Act 4 temple interaction)

**Playability evaluation**: This is KQ5-style "acts of kindness that pay off hours later." The player has no idea that helping Echoes leads to anything — it just seems like the right thing to do. Players who take the time are rewarded with a hidden ending and gameplay assistance. Players who don't are playing a harder but still completable game.

---

## Act 4: The Dead City — Key Design Notes

### The Liminal Horror Peak

Act 4 is where the liminal horror hits hardest. The city is intact, lights on, food on tables, but empty. The player experiences:
- Doors that open before you touch them (the city's AI recognizes "inhabitants")
- Holographic welcome messages playing to empty streets
- A child's toy that rolls across the floor on its own (Echo activity)
- Music playing in an empty concert hall
- A meal still warm on a table in a restaurant (how? It's been centuries)

These aren't puzzles — they're atmosphere. But they serve a gameplay purpose: they tell you the city's systems still work. If the power station is brought online, these systems become tools.

### The Power Routing Puzzle

**Widget type**: `toggle_panel` (Myst Machine pattern)

The city has 4 power districts. The power station can supply 2 at a time (limited power). The player chooses which 2 to activate:

| District | What It Powers | What You Gain |
|----------|---------------|---------------|
| **Knowledge** (Library + Archive) | Data access, holographic records | Translation cipher fragment 4, weapon schematics, full lore |
| **Transit** (Railway + Elevators) | Fast travel, deep tunnel access | Quick movement, railway entrance to nexus |
| **Defense** (Weapon Vault + War Room) | Security systems, vault access | Direct access to weapon core, tactical intel |
| **Residential** (Homes + Temple) | Personal systems, temple resonance | Echo interactions, prophet's crystal, personal items |

**Playability**: This is a genuine strategic decision. Players pursuing the Destroy ending need Defense + Knowledge. Players pursuing the Signal ending need Knowledge + Transit (to reach the nexus comm array). Players pursuing the Resonance ending need Residential + Knowledge (for Echo interactions). No combination blocks any ending entirely, but each makes certain endings harder or easier.

**Note**: Players CAN switch the power routing by returning to the power station, but switching takes time and alerts the Watcher each time.

---

## Act 5: The Nexus — Key Design Notes

### Convergence of All Choices

Act 5 is where every previous decision pays off or costs. The nexus is the most dangerous environment but also the most flexible — multiple paths to multiple endings.

**Who is with you?**
- Freed Kethrani (if survived Act 2-3): scouts ahead, warns of dangers
- Freed Vyss (if survived): translates nexus inscriptions in real-time
- Crystal Entity (if freed): absorbs dangerous energy, acts as shield
- Curator (if Proof of Sentience used): reluctant ally, opens Choir-locked doors
- Coherent Echo allies (if compassion level 3+): guide through the nexus, protect from Echoes

**What tools do you have?**
The Act 5 item matrix (what's available depends on cumulative decisions):

| Item/Combination | Required Decisions | Ending It Enables |
|------------------|-------------------|-------------------|
| The Countermeasure | Stasis fluid (1) + mineral (3) + crystal (2) + core (4) + siphon (3) | Destroy, Sabotage+Escape |
| Galactic Broadcast | Comm schematics (2) + interface (4) + array (5) | Signal |
| Proof of Sentience | Specimen tag (1) + black box (2) + Curator's device (5) | Curator ally path |
| Neural Bridge | Bio extract (2) + energy sample (5) + core module (5) | Transcendence |
| Orbital Weapon | Overcharge (3) + grid controller (4) | Kamikaze |
| Resonance Network | Echo Communicator (4) + prophet's crystal (4) + 3+ Echoes helped | Resonance (hidden) |

### The Core Confrontation

The final view before choosing an ending. You stand before the Convergence's local intelligence — a crystalline consciousness that perceives you.

It speaks in visions:
1. **First vision**: consumed worlds, spinning, dying — its "resume." It shows you what it's done.
2. **Second vision**: heat death, entropy, the universe going cold — its motivation. It consumes to survive.
3. **Third vision** (only if you have the prophet's crystal): your possible futures. Each ending you've unlocked plays as a brief flash. The player sees the consequences before choosing.
4. **Fourth vision** (only if Echo compassion 3+): the resonance — harmony, balance, a path the Convergence never considered. It didn't know there was another way.

**Playability**: This is not a puzzle. It's the emotional climax. The visions serve as a "here are your options" summary delivered in-world. Players who've gathered more items and helped more beings see more futures and have more choices. The game rewards thoroughness with narrative richness.

---

## Deep Dependency Chain Summary

### Chain 1: The Countermeasure (longest chain in the game)
```
Act 1, View 1:  Take stasis fluid vial from broken pod ─────────────┐
Act 2, View 17: Take bio-garden fiber from hydroponics ──┐           │
Act 1, View 1:  Take pod glass shard ────────────────────┼→ C1 Blade │
Act 2, View 16: Take choir resonance crystal ────────────────────┐   │
Act 3, View 23: Extract siphon crystal (loud or quiet) ─────┐   │   │
Act 3, View 22: Take wasteland mineral ─────────────────┐   │   │   │
                                                         │   │   │   │
                                              ┌──────────┘   │   │   │
                                              ▼              │   │   │
                                    C4 Energy Dampener ──────┤   │   │
                                              │              │   │   │
Act 4, View 40: Obtain weapon core ──────────────────────────┤   │   │
                                              │              │   │   │
                                    ┌─────────┘              │   │   │
                                    ▼                        ▼   │   │
                          C8 Primed Weapon Core              │   │   │
                                    │                        │   │   │
                                    └──────────┬─────────────┘   │   │
                                               ▼                 │   │
                                    ★ THE COUNTERMEASURE ★       │   │
                                                                 │   │
10 hours between finding stasis fluid and using it ──────────────┘   │
First item (pod glass shard) used in Act 2 combination ──────────────┘
```

### Chain 2: The Predecessor's Legacy (discovery chain)
```
Act 1, View 1:  Wall markings (tally marks, arrow) ──── context
Act 1, View 2:  Predecessor fabric (name: CHEN, L., 3 digits) ──── partial code
Act 1, View 3:  Predecessor notes (behind screen, vent layout) ──── knowledge
Act 1, View 5:  Chen's body (journal chip) ──── full story + remaining digits
Act 1, View 5:  Chen's locker (if code found) ──── superior tool + ship map
Act 3, View 27: Chen's bunker graffiti (found in military bunker) ──── planet intel
Act 4, View 35: Chen's message in residential block ──── Chen was HERE, somehow
Act 5, View 45: Control spire code (all Chen's digits assembled) ──── bypass the hardest puzzle
```

Players who follow Chen's entire trail across the game learn that Chen made it much further than expected — and left tools at every stage. The control spire code is the ultimate payoff: a puzzle that takes 20 minutes to solve normally is bypassed entirely if you found all of Chen's clues.

### Chain 3: The Compassion Thread
```
Act 1: Free Crystal Entity (+1 ally, -25 noise tolerance)
Act 1: Free Kethrani (+1 ally, -20 noise)
Act 1: Free Vyss (+1 ally, -20 noise, +translator)
Act 3: Help Echo 1 (The Soldier, flag quest)
Act 3: Help Echo 2 (The Scientist, equation)
Act 4: Help Echo 3 (The Mother, toy quest)
Act 4: Help Echo 4 (The Artist, witness art)
Act 4: Help Echo 5 (The Elder, ring bell)
Act 5: All 3 freed specimens + 3+ helped Echoes + prophet's crystal
     → RESONANCE ENDING AVAILABLE
```

This chain has NO explicit signposting. The game never tells you "helping Echoes leads to a reward." It's pure emergent narrative — players who are kind because they want to be, not because the game told them to, discover an ending that players chasing efficiency will never see.

---

## Pacing Analysis

### Engagement Curve

```
Tension
  ▲
  │                                                    ████
  │                                              ████ ████
  │                                         ████ ████ ████
  │                    ████            ████ ████ ████ ████
  │              ████ ████      ████ ████ ████ ████ ████
  │         ████ ████ ████ ████ ████ ████ ████ ████ ████
  │    ████ ████ ████ ████ ████ ████ ████ ████ ████ ████
  │████ ████ ████ ████ ████ ████ ████ ████ ████ ████ ████
  └──────────────────────────────────────────────────────→ Time
   Pod  Free  Lab  Hub  Escape  Bridge  Shuttle  Crash  City  Nexus
   Break Spec       Morgue      Engine  Launch   Wastl  Power Core

  ●Hooks ●Choices ●Puzzles ●Revelations ●Crisis ●Climax
```

### Pattern Distribution (ensuring even engagement)

| Pattern | Act 1 | Act 2 | Act 3 | Act 4 | Act 5 | Total |
|---------|-------|-------|-------|-------|-------|-------|
| Gateway Puzzle | 2 | 1 | 1 | 0 | 0 | 4 |
| Dependency Chain | 3 | 4 | 3 | 5 | 4 | 19 |
| The Fork | 2 | 3 | 2 | 3 | 6 | 16 |
| Progressive Reveal | 3 | 3 | 2 | 3 | 2 | 13 |
| False Summit | 1 | 1 | 0 | 1 | 1 | 4 |
| Dual-Purpose Item | 2 | 3 | 2 | 2 | 1 | 10 |
| Nested Secret | 1 | 0 | 1 | 2 | 1 | 5 |
| Knowledge Gate | 2 | 3 | 1 | 3 | 2 | 11 |
| Revelation Tool | 0 | 1 | 2 | 2 | 1 | 6 |
| Cross-Reference | 1 | 1 | 1 | 2 | 2 | 7 |
| Noise Tradeoff | 3 | 2 | 2 | 1 | 1 | 9 |
| Evidence Gamble | 2 | 2 | 1 | 2 | 1 | 8 |
| Distraction Window | 1 | 2 | 2 | 1 | 2 | 8 |
| Ticking Clock | 1 | 2 | 1 | 1 | 3 | 8 |
| Bait and Punish | 1 | 1 | 1 | 1 | 1 | 5 |
| Sound Masking | 1 | 2 | 1 | 1 | 1 | 6 |
| Trap Setting | 0 | 1 | 2 | 1 | 1 | 5 |
| Red Herring | 1 | 1 | 1 | 1 | 1 | 5 |
| Emergent Combo | 1 | 3 | 3 | 4 | 4 | 15 |
| Multi-Path Solution | 2 | 3 | 3 | 3 | 7 | 18 |
| Rule Subversion | 0 | 1 | 1 | 1 | 2 | 5 |
| Myst Machine | 0 | 1 | 0 | 1 | 1 | 3 |
| Power Routing | 0 | 1 | 0 | 1 | 1 | 3 |
| Perspective Alignment | 0 | 1 | 1 | 1 | 1 | 4 |
| Moral Fork | 3 | 2 | 3 | 2 | 7 | 17 |
| Accomplice | 1 | 0 | 2 | 3 | 3 | 9 |
| Point of No Return | 0 | 1 | 0 | 1 | 1 | 3 |
| Camouflage | 2 | 1 | 1 | 1 | 0 | 5 |
| Echo (distant) | 1 | 2 | 2 | 2 | 3 | 10 |
| Decay Clock | 1 | 1 | 1 | 1 | 1 | 5 |

**Key observation**: Moral Fork and Multi-Path Solution are the most frequent patterns because they drive replayability. Dependency Chain and Progressive Reveal are next because they're the scaffolding of a 10-hour experience. The engaging "spectacle" patterns (Ticking Clock, Distraction Window, Noise Tradeoff) are heaviest in Acts 1-2 to hook the player, then distributed evenly through 3-5.

---

## Puzzle Playability Evaluations

### Evaluation Criteria
Each puzzle is rated on:
- **Signposting** (1-5): How clearly does the environment communicate the solution?
- **Logic** (1-5): How intuitive is the solution chain?
- **Fairness** (1-5): Can the puzzle be solved without trial-and-error?
- **Engagement** (1-5): Is solving this puzzle interesting/satisfying?

### Act 1 Puzzles

| Puzzle | Signpost | Logic | Fair | Engage | Notes |
|--------|----------|-------|------|--------|-------|
| Pod Escape | 5 | 5 | 5 | 4 | Glass is cracked. Push it. Perfect gateway |
| Specimen Release | 4 | 4 | 5 | 5 | Manual release visible. Choice is the engagement |
| Lab Cabinet Lock | 3 | 4 | 4 | 3 | Glass shard as pry tool is logical |
| Security Sequence | 4 | 5 | 4 | 4 | Solution shown during startup. Fair window |
| Morgue Bio-Lock | 3 | 3 | 3 | 4 | Neural tendril solution is less obvious. Chemical reagent backup helps |
| Chen's Locker | 2 | 4 | 3 | 5 | Code requires cross-referencing two items. Very satisfying when solved |
| Ventilation Access | 4 | 4 | 5 | 3 | Predecessor's arrow points to it. Surgical probe is obvious tool |

### Act 2 Puzzles

| Puzzle | Signpost | Logic | Fair | Engage | Notes |
|--------|----------|-------|------|--------|-------|
| Bridge Access | 3 | 3 | 4 | 3 | Resonance tones learned from data core. Indirect but logical |
| Reactor Resonance | 4 | 5 | 4 | 5 | Match the heartbeat. Memory fragment helps. Very satisfying |
| Shuttle Repair | 5 | 5 | 5 | 4 | Three components, three locations. Clear dependency chain |
| Shuttle Launch | 4 | 4 | 4 | 5 | Coordinates from bridge. Timed sequence is exciting |
| Comm Frequency | 3 | 3 | 3 | 3 | Dial puzzle, solution from star charts. Moderately signposted |
| Data Core Access | 2 | 3 | 3 | 4 | Requires neural tendril interface. Less obvious but dramatic |

### Act 3 Puzzles

| Puzzle | Signpost | Logic | Fair | Engage | Notes |
|--------|----------|-------|------|--------|-------|
| Crystal Extraction | 5 | 5 | 5 | 4 | Two clear methods (loud/quiet). Player chooses approach |
| Bunker Door Code | 3 | 3 | 3 | 4 | Cross-reference journal + schematics. Harder but has backup hints |
| Echo Field Nav | 2 | 2 | 3 | 5 | Perspective alignment. Tricky but visually stunning. Echo stabilizer helps |
| City Gate Auth | 3 | 4 | 4 | 4 | Use echo stabilizer to "become a memory." Logical once you understand Echoes |
| Echo Help Puzzles | 4 | 4 | 5 | 5 | Each Echo's request is simple and clear. The reward is hidden |

### Act 4 Puzzles

| Puzzle | Signpost | Logic | Fair | Engage | Notes |
|--------|----------|-------|------|--------|-------|
| Power Routing | 5 | 5 | 5 | 5 | Toggle panel, clear labels. Strategic choice, not logic puzzle |
| Library Sequence | 4 | 4 | 4 | 3 | Crystal activation order from index hologram |
| Weapon Vault | 2 | 3 | 3 | 5 | Hardest puzzle. Multi-item solution. Crystal Entity bypasses if freed |
| Temple Resonance | 3 | 3 | 3 | 4 | Frequency from murals. Child Echo bypasses if allied |
| Echo Chamber | 3 | 3 | 3 | 5 | Time-split room. Interact with correct timeline. Stressful but fair |

### Act 5 Puzzles

| Puzzle | Signpost | Logic | Fair | Engage | Notes |
|--------|----------|-------|------|--------|-------|
| Conduit Crossing | 4 | 4 | 4 | 5 | Timing-based. Visual pattern clear. Tense |
| Control Spire Code | 2 | 3 | 3 | 4 | Cross-reference puzzle OR Chen's code bypasses entirely |
| Weapon Assembly | 3 | 4 | 4 | 5 | Follow blueprint. Order matters. Scientist Echo guides if allied |
| Array Calibration | 3 | 3 | 3 | 3 | Frequency from schematics + star charts |
| Core Confrontation | 5 | 5 | 5 | 5 | Not a puzzle — a choice. All options clearly presented |

**Overall assessment**: No puzzle scores below 2 on any axis. The hardest puzzles (weapon vault, control spire code) all have bypass routes for players who made specific earlier decisions. The game is never unfair — it's challenging because of strategic depth, not puzzle obscurity.

---

## Replayability Matrix

A player's first playthrough sees approximately 60-70% of the game's content. Subsequent playthroughs reveal:

| Playthrough | What's New |
|-------------|-----------|
| 1st (any path) | Core story, one ending, 60-70% of views/items |
| 2nd (different Act 1 choices) | Different allies, different Act 3 landing, different puzzles (weapon vault with/without Crystal Entity), new ending |
| 3rd (full compassion path) | Resonance ending, all Echo stories, full predecessor trail |
| 4th (sabotage path) | Ship sabotage consequences, hostile Curator throughout, unique Act 5 dynamics |
| 5th (speedrun/efficiency) | Escape ending in ~3 hours, minimal items, maximum tension |

**Conservative estimate**: 5 meaningfully different playthroughs, each 4-10 hours depending on exploration level. Total unique content: ~40 hours across all paths.
