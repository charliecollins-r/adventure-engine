# The Harvest — Act 1 Walkthrough

> You wake up in a shattered stasis pod aboard an alien harvesting ship. Your goal: escape the containment deck through the ventilation system and reach the Airlock Bay. Along the way you'll scavenge tools, crack a security code, override the ship's locks, survive two lethal hazards, and discover what the Choir have planned for your world.

---

## How to Beat Act 1 (The Short Version)

If you just want to get through it, here's the cheat sheet:

1. **Stasis Hold** — HAND everything: broken pod (glass shard), tag hook (specimen tag), cataloguer robot (learn code **7319**). Pet the cat in the corridor (cat hair).
2. **Processing Lab** — HAND the sample jars (empty jar) and instrument rack (surgical probe). LOOK at the lab screens (security sequence). HAND the lab terminal keypad with the code to unlock it.
3. **Go back to Stasis Hold** — USE the empty jar on the drainage channel (stasis fluid vial).
4. **Security Hub** — HAND the console, which takes you to the closeup. HAND the keypad (enters code + sequence to activate). HAND the lever (override all locks, +20 noise). HAND the drawer (key card). HAND the emergency cabinet (helmet).
5. **Feeding Station** — HAND the dispenser (nutrient paste). TALK to the prisoner (choose your dialogue).
6. **Morgue** — HAND the neural tendril.
7. **Specimen Archive** — HAND the misplaced crystal. USE it on the reading device. LOOK at the holographic display.
8. **Back to Corridor** — The vent grate is now unlocked. Go through.
9. **Vent Maze** — HAND wall scratches (map). Go LEFT at junction. You need the helmet for the gas and the probe to jam the fan.
10. **Airlock Bay** — USE the key card on the override panel. LOOK at the viewport.

That's Act 1. Read on for details, optional content, item uses, and how not to die.

---

## Debug / Dev Mode

Having trouble finding hotspots or want to jump between rooms? Add `?dev` to the URL:

```
http://localhost:5173/?dev
```

This gives you:

- **DevPanel** (right side) — Five tabs:
  - **Views** — Click any room name to teleport there instantly
  - **Objects** — See every hotspot's position, size, and visibility state
  - **Character** — Preview character sprites with facing/animation controls
  - **Sprites** — Browse all sprite sheets with live animation
  - **Export** — Copy view data for pasting into the editor
- **Debug outlines** — All hotspot boxes become visible on the game view (gold borders for interactive objects, blue for navigation)
- **Intro skip** — The opening text and standup animation are bypassed

The dev panel is your best friend when you can't figure out what's clickable.

---

## Deck Map

```
                    ┌──────────────┐
                    │ STASIS HOLD  │ ← START
                    │  ◆◆◆ ✦ 🐈    │   (3 items + code 7319)
                    └──────┬───────┘
                           │ Dark Archway
                    ┌──────┴───────┐
      Left Door ┌───│  CONTAINMENT │───┐ Right Door
                │   │  CORRIDOR    │   │
                │   │   (hub)      │   │
                │   └───┬──┬───────┘   │
                │       │  │ Far End   │
        ┌───────┴────┐  │  │   ┌───────┴──────┐
        │ PROCESSING │  │  │   │ SECURITY     │
        │ LAB        │  │  │   │ HUB          │
        │  ◆◆ ✧ ✦    │  │  │   │  ◆◆ ✧✧ ✦     │
        └────────────┘  │  │   └──────────────┘
                        │  │
           Floor Vent ──┘  │
          (locked until    │
           security        │
           override)       │
                    ┌──────┴───────┐
      Left     ┌───│  FEEDING     │───┐ Right
      Passage  │   │  STATION     │   │ Passage
               │   │  ◆ ♦         │   │
               │   └──────────────┘   │
               │                      │
        ┌──────┴───────┐       ┌──────┴──────┐
        │ MORGUE       │       │ SPECIMEN    │
        │  ◆ ✧         │       │ ARCHIVE     │
        └──────────────┘       │  ◆ ✧✧ ✦     │
                               └─────────────┘

                   ┌──────────────┐
                   │ VENT ENTRY   │ ← via corridor floor vent
                   │  ◆           │
                   └──────┬───────┘
                          │
                   ┌──────┴───────┐
          Left ┌───│ VENT JUNCTION│───┐ Right
               │   └──────────────┘   │
        ┌──────┴───────┐       ┌──────┴──────┐
        │ GAS CHAMBER  │       │ COLLAPSED   │
        │  ☠ (helmet)  │       │ SECTION     │
        └──────┬───────┘       │ ◆◆ (dead    │
               │               │  end, opt.)  │
        ┌──────┴───────┐       └─────────────┘
        │ FAN ROOM     │
        │  ☠ (probe)   │
        └──────┬───────┘
               │
        ┌──────┴───────┐
        │ EXIT PASSAGE │
        │  ✧ (stars!)  │
        └──────┬───────┘
               │
        ┌──────┴───────┐
        │ AIRLOCK BAY  │ ← ACT 1 END
        │  ✧✧ ✦        │
        └──────────────┘

  ◆ = collectible item    ✧ = knowledge flag
  ✦ = puzzle/gate          ♦ = NPC dialogue
  ☠ = lethal hazard
```

---

## Puzzle Chain

Here's what unlocks what — the dependency tree for Act 1:

```
HAND Cataloguer Robot (Stasis Hold)
  └─► learn code 7319
       └─► HAND Lab Terminal Keypad (Processing Lab closeup)
            └─► terminal unlocked
                 └─► LOOK terminal data screens (optional lore)

LOOK Lab Screens (Processing Lab)
  └─► learn security sequence
       └─► HAND Security Keypad (Security Hub closeup)
            └─► console activated
                 └─► HAND Override Lever (Security Hub closeup)
                      └─► security_locks_overridden (+20 noise)
                           └─► Corridor floor vent opens
                                └─► Ventilation maze accessible

HAND Sample Jars (Processing Lab)
  └─► empty sample jar
       └─► USE jar ON Drainage Channel (Stasis Hold)
            └─► stasis fluid vial

HAND Emergency Cabinet (Security Hub)
  └─► emergency suit helmet
       └─► survive Gas Chamber (vent maze)

HAND Instrument Rack (Processing Lab)
  └─► surgical probe
       └─► USE probe ON Fan Mechanism (Fan Room)
            └─► fan jammed (probe consumed!)
                 └─► path to Exit Passage

HAND Key Card Drawer (Security Hub closeup)
  └─► containment key card
       └─► USE card ON Airlock Override Panel
            └─► airlock controls open
```

---

## Room-by-Room Walkthrough

### 1. Stasis Hold (Start)

You wake up cold, confused, and surrounded by alien specimen pods. Time to scavenge.

**Pick up three items:**
- **HAND the Broken Pod** — Snap off a shard of razor-sharp pod glass. *(Gets: pod glass shard)*
- **HAND the Specimen Tag Hook** — Tear off your identification tag. *(Gets: specimen tag)*
- **HAND the Cataloguer Robot** — This takes you to a closeup view of the spider-legged drone's specimen jars. **HAND the data plates** — every plate shares the same section code: **7-3-1-9**. Memorize this. *(Sets: lab_code_known)*

> **Don't miss this**: LOOKing at the cataloguer only hints at the codes. You have to HAND it (lean in, study the plates) to actually learn the code.

**Don't grab the drainage channel yet** — you need an empty jar from the Processing Lab first. You'll come back for it.

**Also here**: LOOK at the occupied pods and walkway railing for atmosphere. The cataloguer closeup has five interactive specimen objects to examine.

MOVE through the **Dark Archway** to reach the corridor.

---

### 2. Containment Corridor (Hub)

The central hallway with five exits. No critical items, but:

- **HAND the Black Cat** — A stray shadow cat is wandering the corridor. Pet it to collect some fur. *(Gets: cat hair; cat disappears)*
- **LOOK at the Drag Marks** — Story context about things being dragged down the corridor.
- **LOOK at the Emergency Panel** — The cracked CRT monitor flashing CRITICAL.

> The **floor vent** (bottom-left area) is sealed until you override security. You'll come back later.

Head to the **Processing Lab** (left door) first.

---

### 3. Processing Lab

Two items and two key knowledge flags here.

- **HAND the Sample Jars** — Grab an empty specimen jar from the rack. You'll need this to collect stasis fluid. *(Gets: empty sample jar)*
- **HAND the Instrument Rack** — Take the surgical probe — a thin, flexible instrument. This is your most important tool. *(Gets: surgical probe)*
- **LOOK at the Lab Startup Display** — Watch the screens cycle through routines. You spot a security system startup sequence — a five-button pattern. *(Sets: security_sequence_known)*

The lab display also takes you to a **Lab Terminal closeup** with a keypad:
- **HAND the Lab Terminal Keypad** (requires knowing code 7319) — Enter the code. Terminal unlocks, giving you access to processing data on the side screens. *(Sets: terminal_unlocked)*
- **LOOK the data screens** — Optional but reveals integration schedules and Earth specimen records.
- **USE specimen tag ON right data screen** — Your tag ID pulls up your full record. *(Sets: full_record_known)*

**Now go back to the Stasis Hold** (Corridor → Dark Archway):
- **USE the empty jar ON the Pod Drainage Channel** — Fill the jar with amber stasis fluid. *(Transforms: empty jar → stasis fluid vial)*

Return to the Corridor and head to the **Security Hub** (right door).

---

### 4. Security Hub

The security hub has the console, an emergency cabinet, and a key card drawer. HANDing the console takes you to the **Security Console closeup** view.

**In the closeup:**
- **HAND the Keypad** (requires both code 7319 AND security sequence) — The console activates. *(Sets: security_hub_accessed)*
- **HAND the Override Lever** (requires console active) — Pull it. Every containment lock on the deck clicks open. The Curator *will* notice. *(Sets: security_locks_overridden; +20 noise)*
- **HAND the Drawer** — Pull out a bio-organic key card. *(Gets: containment key card)*

Use "Back to Security Hub" to return to the main view.

**Back in the main Security Hub:**
- **HAND the Emergency Equipment Cabinet** — Smash the cracked glass, grab an oversized alien helmet. The atmosphere seals still work. You'll need this for the vent maze gas. *(Gets: emergency suit helmet)*

> **Puzzle chain recap**: Cataloguer (code 7319) + Lab screens (security sequence) → Security keypad → Override lever → Vent grate opens. If you skipped either knowledge step, the keypad just beeps and adds noise.

Head to the **Feeding Station** (corridor, far end).

---

### 5. Feeding Station (Secondary Hub)

The second hub room with three exits: Morgue (left), Specimen Archive (right), and back to Corridor.

- **HAND the Nutrient Dispenser** — Collect a tube of grey nutrient paste. Gross, but useful. *(Gets: nutrient paste tube)*
- **TALK to the Caged Prisoner** — A four-armed alien behind an energy barrier. This triggers the **dialogue choice system** — a modal pops up with four options (see Dialogue Branching section below). *(Sets: prisoner_spoken, prisoner_bond)*

**Optional item use:**
- **USE nutrient paste ON the prisoner** — Feed them through the barrier. Strengthens your bond. *(Sets: prisoner_fed; consumes paste; +5 noise)*

Head to the **Morgue** (left passage).

---

### 6. Morgue

- **HAND the Neural Tendril Sample** — Pick up a severed length of bio-electric neural tendril. Warm and slightly damp. *(Gets: severed neural tendril)*
- **LOOK at the Dead Goblin** — A creature like you, dead in a drawer. Surgical marks everywhere. You're not the first. *(Sets: dead_goblin_seen)*

**Also here**: Morgue drawers, autopsy slab, recycling vats, chemical cabinet — all with LOOK flavor text that builds the horror.

Return to Feeding Station, head to the **Specimen Archive** (right passage).

---

### 7. Specimen Archive

- **HAND the Misplaced Crystal** — A data crystal misfiled among specimen records. *(Gets: data crystal — personal log)*
- **USE the crystal ON the Reading Device** — Select the crystal from your inventory, click the reader. Alien text, diagrams, planetary data flood the display. *(Sets: archive_accessed)*
- **LOOK at the Holographic Display** — Miniature planets drift overhead, almost all branded with the Convergence symbol. The Choir have been doing this to worlds across the galaxy. *(Sets: convergence_history_known)*

**Optional item uses:**
- **USE stasis fluid vial ON the reading device** — Enhances the reader's biological interface. *(Sets: reader_enhanced; consumes vial)*
- **USE specimen tag ON the reading device** — Pull up your species classification. *(Sets: specimen_classification_known)*
- **USE neural tendril ON the holographic display** — The tendril interfaces with the display, revealing the Convergence heading — Earth. *(Sets: convergence_destination_known; consumes tendril)*

Return to Corridor. The **floor vent** is now unlocked (you overrode security earlier). MOVE through it.

---

### 8. Ventilation Shaft Entry

- **HAND the Wall Scratches** — Trace a map scratched by a previous escapee. Shows a junction: LEFT (helmet symbol) leads to the airlock, RIGHT is a dead end. *(Gets: ventilation map)*

**Also here**: Old Remains (bones of whoever scratched the map), Maintenance Hatch.

Continue forward to the **Vent Junction**.

---

### 9. Vent Junction

A T-intersection. If you have the map, LOOK at the junction markings for directions.

- **LEFT** = correct path (through gas chamber + fan room → airlock)
- **RIGHT** = dead end with optional loot (see Optional Content below)

**Go LEFT** into the Gas Chamber.

---

### 10. Gas-Filled Passage ☠

**THIS ROOM WILL KILL YOU** without the Emergency Suit Helmet.

The room is flooded with toxic gas from a cracked bio-pipe. If you try to MOVE forward or touch anything without the helmet equipped, you die. Game over. Reload.

With the helmet on, you're safe. **MOVE forward** to the Fan Room.

---

### 11. Fan Chamber ☠

**THIS ROOM WILL ALSO KILL YOU** if you walk into the fan.

A massive spinning fan blocks the passage. Do NOT try to MOVE through it yet.

- **LOOK at the Fan Mechanism** — Exposed gears with a narrow gap. Something thin and strong could jam it...
- **USE the Surgical Probe ON the Fan Mechanism** — The probe jams the gears. Fan stops. Probe is destroyed. *(Consumes: surgical probe; Sets: fan_jammed)*
- **MOVE through the jammed Fan** — Squeeze between the stilled blades.

> The probe is permanently consumed here. This is its final and most important use.

---

### 12. Exit Passage

A quiet moment. Almost there.

- **LOOK at the Crack in Wall** — Stars. Your first view outside the ship. Beautiful and terrifying — you're in orbit above a planet.

**MOVE through the Exit Hatch** to drop into the Airlock Bay.

---

### 13. Airlock Bay (Act 1 End)

- **USE the Containment Key Card ON the Airlock Override Panel** — The card interfaces with the bio-lock and opens the override panel.
- **LOOK at the Empty Docking Clamps** — Your ship, the Outrider, was jettisoned. The clamps are empty. No easy way home. *(Sets: outrider_gone_known)*
- **LOOK at the Viewport** — The planet below is beautiful from orbit. Energy beams descend from the ship to the surface. The Convergence is already feeding. *(Sets: airlock_visited)*

Congratulations — you've escaped the containment deck. Act 2 begins.

---

## Where You Can Die (3 Deaths)

| Location | How You Die | How to Survive |
|----------|------------|----------------|
| Gas-Filled Passage | MOVE forward or touch anything without helmet | Get the Emergency Suit Helmet from the Security Hub cabinet BEFORE entering the vents |
| Gas-Filled Passage | Going back through the gas without helmet (same check) | Same — have the helmet |
| Fan Chamber | MOVE into the spinning fan before jamming it | USE the Surgical Probe on the Fan Mechanism first |

There are no other deaths in Act 1. You cannot softlock yourself — every item and flag is obtainable regardless of order (except the stasis fluid, which requires the empty jar).

---

## Optional Content

### Vent Maze — Collapsed Section (Right at Junction)

If you go RIGHT at the vent junction instead of left, you reach a dead-end room with a Choir engineer skeleton. Two hidden items here:

1. **HAND the Skeleton** — Take the **Crew Datapad** from their grip. Contains Act 2 lore about the Choir's internal hierarchy. *(Gets: crew datapad)*
2. **HAND the Skeleton again** — Search deeper. Find a **Choir Access Chip** hidden in a uniform pocket. *(Gets: choir access chip)*

**Why bother?** In Act 2, the Shuttle Bay has a bio-resonance security lock. With the chip: instant silent bypass. Without it: you have to guess the right frequency (1-in-3 odds, wrong guesses add +15 noise each). This chip rewards thorough exploration.

### Item Uses for Extra Lore

These aren't required to beat Act 1, but they deepen the story:

| Item | Use On | What Happens |
|------|--------|-------------|
| Pod Glass Shard | Corridor Organic Growth | Cut open the growth, find scratched message from previous prisoner |
| Cat Hair | Processing Lab Examination Tables | DNA analysis reveals the cat was "processed" by the Choir |
| Stasis Fluid Vial | Specimen Archive Reading Device | Enhances the biological interface |
| Specimen Tag | Reading Device | Reveals your species classification |
| Specimen Tag | Lab Terminal Data (right screen) | Pulls up your full specimen record |
| Neural Tendril | Specimen Archive Holographic Display | Reveals the Convergence is heading to Earth |
| Nutrient Paste | Caged Prisoner | Feed the prisoner, strengthens your bond |

---

## Prisoner Dialogue Branching

When you TALK to the caged prisoner, a dialogue modal appears with four choices. **You can only pick one per playthrough.** Each sets a different `prisoner_bond` value and may unlock bonus knowledge.

| Choice | Bond Value | Extra Knowledge | What Happens |
|--------|-----------|----------------|--------------|
| "We're both prisoners here, aren't we?" | `empathy` | — | Emotional connection. The creature mirrors your gestures. Foundation of trust for Act 2. |
| "Do you know a way out of here?" | `pragmatic` | `airlock_hinted` | The creature maps the ship layout with gestures, pointing toward the airlock. |
| "What are they? The ones who put us here?" | `knowledge` | `choir_nature_known` | The creature reveals the Choir ARE the ship — the vessel is alive. |
| [Say nothing — just nod] | `silent` | — | Respectful silence. The creature nods back. Least info, but no missteps. |

The `prisoner_bond` value carries into Act 2 and affects all future interactions with this character.

---

## Item Checklist (12 Total)

| # | Item | Where | How | Required? |
|---|------|-------|-----|-----------|
| 1 | Pod Glass Shard | Stasis Hold | HAND Broken Pod | Optional (lore use) |
| 2 | Specimen Tag | Stasis Hold | HAND Specimen Tag Hook | Optional (lore use) |
| 3 | Empty Sample Jar | Processing Lab | HAND Sample Jars | Yes (needed for stasis fluid) |
| 4 | Surgical Probe | Processing Lab | HAND Instrument Rack | **Yes** (jam the fan) |
| 5 | Stasis Fluid Vial | Stasis Hold | USE empty jar ON Drainage Channel | Optional (lore use) |
| 6 | Containment Key Card | Security Hub closeup | HAND Drawer | **Yes** (airlock override) |
| 7 | Emergency Suit Helmet | Security Hub | HAND Emergency Cabinet | **Yes** (survive gas) |
| 8 | Nutrient Paste Tube | Feeding Station | HAND Nutrient Dispenser | Optional (feed prisoner) |
| 9 | Severed Neural Tendril | Morgue | HAND Neural Tendril | Optional (lore use) |
| 10 | Data Crystal | Specimen Archive | HAND Misplaced Crystal | Optional (lore use) |
| 11 | Ventilation Map | Vent Entry | HAND Wall Scratches | Recommended (maze navigation) |
| 12 | Cat Hair | Corridor | HAND Black Cat | Optional (lore use) |
| — | Crew Datapad *(opt.)* | Collapsed Section | HAND Skeleton | Optional (Act 2 lore) |
| — | Choir Access Chip *(opt.)* | Collapsed Section | HAND Skeleton again | Optional (Act 2 shortcut) |

> **Minimum required items**: Surgical Probe, Containment Key Card, Emergency Suit Helmet. Everything else is for lore, world-building, or Act 2 advantages.

---

## Knowledge Flags

| Flag | How to Get It | What It Does |
|------|-------------|-------------|
| `lab_code_known` | HAND Cataloguer data plates | Needed for lab terminal keypad |
| `security_sequence_known` | LOOK Lab Startup Display | Needed for security console keypad |
| `terminal_unlocked` | HAND Lab Terminal Keypad (with code) | Opens lab data screens |
| `security_hub_accessed` | HAND Security Keypad (with code + sequence) | Activates console |
| `security_locks_overridden` | HAND Override Lever | **Opens vent grate + all doors** |
| `ventilation_map_found` | HAND Wall Scratches | Shows maze directions |
| `fan_jammed` | USE probe ON Fan Mechanism | Opens path through fan |
| `dead_goblin_seen` | LOOK Dead Goblin (Morgue) | Story flag |
| `prisoner_spoken` | TALK Caged Prisoner | Story flag |
| `convergence_history_known` | LOOK Holographic Display | Story flag |
| `airlock_visited` | LOOK Viewport (Airlock Bay) | Story flag |
| `outrider_gone_known` | LOOK Docking Clamps | Story flag |
| `cat_petted` | HAND Black Cat | Story flag |
| `growth_cut_open` | USE glass shard ON organic growth | Story flag |
| `cat_fate_known` | USE cat hair ON examination tables | Story flag |
| `convergence_destination_known` | USE tendril ON holographic display | Story flag (Earth!) |
| `prisoner_fed` | USE paste ON prisoner | Bond flag |

---

## Common Stuck Points

**"The security console won't activate"**
You need TWO things: the code 7319 (HAND the cataloguer's data plates in Stasis Hold) AND the security sequence (LOOK at the lab screens in Processing Lab). The console closeup keypad checks for both.

**"How do I get stasis fluid?"**
You can't just HAND the drainage channel. First grab an empty jar from the Processing Lab (HAND the sample jars), then come back and USE the jar on the drainage channel.

**"How do I use inventory items?"**
Click an item in your inventory tray at the bottom — it highlights with a gold border. Then click any world object to USE the item on it. If it works, you'll get a response. If not, you'll get a "that doesn't work" message.

**"I can't reach the Morgue or Archive"**
They're off the Feeding Station, not the Corridor. Corridor → far end → Feeding Station → left for Morgue, right for Archive.

**"I can't get into the vents"**
The vent grate in the corridor floor is locked until you pull the override lever in the Security Hub closeup. Override security first.

**"Which way at the vent junction?"**
LEFT leads to the airlock (through gas + fan). RIGHT is a dead end with optional loot. The ventilation map (from wall scratches) tells you this if you LOOK at the junction markings.

**"I keep dying in the vents"**
Two items save your life: the **helmet** (Security Hub cabinet) for the gas, and the **surgical probe** (Processing Lab instrument rack) for the fan. Get BOTH before entering the vents.

---

*Last updated: November 2026. All steps verified against scenario.json.*
