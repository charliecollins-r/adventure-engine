# The Harvest — Act 1 Walkthrough

> You wake up in a shattered stasis pod aboard an alien harvesting ship. Your goal: escape the containment deck through the ventilation system and reach the Airlock Bay. Along the way you'll scavenge tools, crack a security code, override the ship's locks, survive two lethal hazards, and discover what the Choir have planned for your world.

---

## How to Beat Act 1 (The Short Version)

If you just want to get through it, here's the cheat sheet:

1. **Stasis Hold** — HAND the broken pod (glass shard) and the tag hook (specimen tag). The cataloguer robot's specimen displays hold the **four-glyph code**, but they're across a gap in the walkway. Don't jump; HAND on the gap kills you. Pet the cat in the corridor (cat hair).
2. **Processing Lab** — HAND the sample jars (empty jar) and the instrument rack (surgical probe). USE the probe ON the restraint straps (restraint strap; you keep the probe). LOOK at the lab screens (security sequence).
3. **Morgue** (Corridor → Feeding Station → left) — HAND the carcass hook jammed in the open drawer (and the neural tendril, for lore).
4. **Combine** the restraint strap and the carcass hook in your inventory (click one, then the other) → **grappling line**.
5. **Back to Stasis Hold** — USE the grappling line ON the gap, then LOOK (or HAND) the cataloguer robot to learn the code: **fern, double curl, sprouting snake, thorny branch**. USE the empty jar ON the drainage channel (stasis fluid vial).
6. **Security Hub** — HAND the console, which opens the closeup. HAND the keypad (code + sequence activate it), HAND the lever (override all locks, +20 noise), HAND the drawer (key card). Back in the room, HAND the emergency cabinet (helmet).
7. **Feeding Station** — HAND the dispenser (nutrient paste). TALK to the prisoner (choose your dialogue).
8. **Specimen Archive** — HAND the misplaced crystal. USE it on the reading device. LOOK at the holographic display.
9. **Back to Corridor** — The vent grate is now unlocked. Go through.
10. **Vent Maze** — HAND the wall scratches (map), then LOOK at the map in your inventory. From the junction go **WEST** (left), then **straight ahead four times** to the gas chamber. You need the helmet for the gas and the probe to jam the fan.
11. **Airlock Bay** — USE the key card on the override panel. LOOK at the viewport.

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
                    │  ◆◆◆ ✦ 🐈    │   (3 items + glyph code)
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
USE Surgical Probe ON Restraint Straps (Processing Lab) ─► Restraint Strap
HAND Carcass Hook (Morgue, open drawer) ─────────────────► Carcass Hook
  └─► COMBINE strap + hook ─► Grappling Line
       └─► USE Grappling Line ON walkway gap (Stasis Hold) ─► gap crossed
            └─► LOOK / HAND Cataloguer Robot
  └─► learn the four-glyph code
       └─► HAND Lab Terminal Keypad (Processing Lab closeup), enter the code
            └─► terminal unlocked, emergency override ARMED
                 └─► HAND red Override Button (Security Hub closeup)
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

HAND Key Card Drawer (Security Hub wall)
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
- **LOOK at the Torn Railing (the gap)** — The cataloguer robot, which holds the code you need, is across a gap in the walkway over the drainage pit. The far side has a solid railing. *Don't HAND the gap: you jump, slip, and die.*

> **Come back later**: you'll need a **grappling line** to cross (see the Processing Lab and Morgue). Once across, **LOOK or HAND the Cataloguer Robot**. It takes you to a closeup of its specimen jars and every specimen display shows the same four characters in the same order: **fern, double curl, sprouting snake, thorny branch**. *(Sets: gap_crossed, then lab_code_known)*

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
- **USE the Surgical Probe ON the Restraint Straps** — The straps are far too strong to tear (HAND tells you so) and your glass shard just skates off them, but a Choir instrument cuts Choir material cleanly. You get a long strap and **keep the probe**. *(Gets: restraint strap; Sets: restraint_strap_cut)*
- **LOOK at the Lab Data Screens** — The screens cycle through processing routines, and you lean in to the **Lab Terminal closeup** with its keypad:
- **HAND the Lab Terminal Keypad** — A keypad overlay opens: eight keys etched with alien glyphs, four display slots. Press the four characters from the specimen displays in order (**fern, double curl, sprouting snake, thorny branch**). Wrong entries buzz and add a little noise; every 6th wrong try sets off a louder alarm (+8 noise). Brute force is possible but miserable (4,096 codes). The terminal unlocks *(Sets: terminal_unlocked)*, the side screens open up, and a line of red script reports that **the emergency override at the Security Console is now armed**.
- **LOOK the data screens** — Optional but reveals integration schedules and Earth specimen records.
- **USE specimen tag ON right data screen** — Your tag ID pulls up your full record. *(Sets: full_record_known)*

**Now go back to the Stasis Hold** (Corridor → Dark Archway):
- **USE the empty jar ON the Pod Drainage Channel** — Fill the jar with amber stasis fluid. *(Transforms: empty jar → stasis fluid vial)*

Return to the Corridor and head to the **Security Hub** (right door).

---

### 4. Security Hub

The security hub has the console, an emergency cabinet, and a key card drawer unit on the right wall.

- **HAND the Key Card Drawer** — Pull a bio-organic key card out of the jammed drawer. You need it for the airlock at the end of the act. *(Gets: containment key card)*
- **LOOK at the console** — Opens the **Security Console closeup**. *(Sets: security_hub_accessed)*

**In the closeup:**
- **The red Emergency Override button** is dark until you unlock the lab terminal. Pressing it before then does nothing. Once it's armed (glowing), HAND it: every containment lock on the deck clicks open, including the corridor floor vent. The Curator *will* notice. *(Sets: security_locks_overridden; +20 noise)*
- **LOOK at the surveillance feeds** — shows the Curator's patrol. *(Sets: curator_location_known)*

Use "Back to Security Hub" to return to the main view.

**Also in the main Security Hub:**
- **HAND the Emergency Equipment Cabinet** — Smash the cracked glass, grab an oversized alien helmet. The atmosphere seals still work. You'll need this for the vent maze gas. *(Gets: emergency suit helmet)*

> **Puzzle chain recap**: Cross the gap → glyph code from the specimen displays → Lab terminal → Emergency Override button armed → press it → the vent grate opens. You can try to brute-force the lab keypad instead of crossing the gap, but it's noisy and slow.

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

- **HAND the Carcass Hook** — A barbed bio-metal hook jammed into the lip of the open drawer at upper left. The Choir use them to drag bodies out. It has an eyelet at the top, perfect for tying a line to. *(Gets: carcass hook)*
- **HAND the Neural Tendril Sample** — Pick up a severed length of bio-electric neural tendril. Warm and slightly damp. *(Gets: severed neural tendril; optional lore)*

**Make the grappling line:** open your inventory, click the **Restraint Strap**, then click the **Carcass Hook**. You knot the strap through the hook's eyelet. *(Gets: grappling line; uses up strap and hook)*

Then head back to the **Stasis Hold** and **USE the Grappling Line ON the gap**. The hook bites the far railing, you shimmy across, and the line stays rigged there. Now LOOK at the cataloguer for the four-glyph code.
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

- **HAND the Wall Scratches** — Trace a map scratched by a previous escapee. *(Gets: ventilation map)* LOOK at the map in your inventory to see it: the whole duct maze, north at the top, with arrows along the route out.

**Also here**: Old Remains (bones of whoever scratched the map), Maintenance Hatch.

Continue forward to the **Vent Junction**.

---

### 9. Vent Junction and the Air Ducts (the maze)

The junction is the entrance to a maze of near-identical ducts, KQ-style. **The camera always faces north**: the left opening is west, the right opening is east, straight ahead is north, and the bottom edge of the screen takes you back south. That's why the map (drawn north-up) matches the screens exactly.

- **The way through:** from the junction go **WEST** (left tunnel), then **straight ahead** ×4 to reach the Gas-Filled Passage.
- **Ways to get lost:**
  - A loop. Taking the left opening one screen into the west route sends you round in a circle back onto it.
  - The east tunnel. It winds the long way round and also reaches the gas, but it's longer. Along it is a plain dead end (a sealed grate) and the side branch to the Collapsed Section, the optional reward room (see Optional Content).
- **Stuck?** The ? hint in every duct screen tells you which way your map points from there, once you have the map.

```
        EXIT
        FAN ☠
        GAS ☠
         F ───── N       L (dead end)
 D ───── E       M ───── K       COLL ✦
 C ───── B               H ───── I
         A ───── J ───── G
               ENTRY
```

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

## Where You Can Die (4 Deaths)

| Location | How You Die | How to Survive |
|----------|------------|----------------|
| Stasis Hold | HAND the walkway gap (you try to jump it) | Cross with the Grappling Line instead |
| Gas-Filled Passage | MOVE forward or touch anything without helmet | Get the Emergency Suit Helmet from the Security Hub cabinet BEFORE entering the vents |
| Gas-Filled Passage | Going back through the gas without helmet (same check) | Same — have the helmet |
| Fan Chamber | MOVE into the spinning fan before jamming it | USE the Surgical Probe on the Fan Mechanism first |

There are no other deaths in Act 1. You cannot softlock yourself. That's verified by an exhaustive search over every reachable game state with the real engine (`tools/softlock-search.mjs`): every reachable state can still finish the act. Order is flexible; the strap and hook can be collected in either order, and the stasis fluid just needs the empty jar first.

---

## Optional Content

### Vent Maze — Collapsed Section (east side of the maze)

From the junction go EAST (right), straight ahead once, then right, then straight ahead: a dead-end room with a Choir engineer skeleton (the X on your map). Two hidden items here:

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

## Item Checklist (15 Total)

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
| 13 | Restraint Strap | Processing Lab | USE surgical probe ON Restraint Straps | **Yes** (grappling line) |
| 14 | Carcass Hook | Morgue | HAND Carcass Hook (open drawer) | **Yes** (grappling line) |
| 15 | Grappling Line | Inventory | COMBINE strap + hook | **Yes** (cross the gap; consumed) |
| — | Crew Datapad *(opt.)* | Collapsed Section | HAND Skeleton | Optional (Act 2 lore) |
| — | Choir Access Chip *(opt.)* | Collapsed Section | HAND Skeleton again | Optional (Act 2 shortcut) |

> **Minimum required items**: Surgical Probe, Restraint Strap + Carcass Hook (→ Grappling Line), Containment Key Card, Emergency Suit Helmet. Everything else is for lore, world-building, or Act 2 advantages.

---

## Knowledge Flags

| Flag | How to Get It | What It Does |
|------|-------------|-------------|
| `gap_crossed` | USE Grappling Line ON the gap | Lets you reach the cataloguer robot |
| `lab_code_known` | LOOK/HAND Cataloguer Robot (after crossing) | You've seen the glyph code (fern, double curl, sprouting snake, thorny branch); used by hints |
| `restraint_strap_cut` | USE surgical probe ON Restraint Straps | Strap obtained |
| `carcass_hook_taken` | HAND Carcass Hook (Morgue) | Hook obtained |
| `terminal_unlocked` | HAND Lab Terminal Keypad (with code) | Opens lab data screens; arms the Emergency Override button |
| `security_hub_accessed` | LOOK Security Console (opens the closeup) | Corridor panel becomes readable; hints |
| `security_locks_overridden` | HAND the armed Emergency Override button | **Opens vent grate + all doors** |
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

**"The override button on the security console does nothing"**
It's dark because nothing has armed it. Get the four-glyph code (fern, double curl, sprouting snake, thorny branch: cross the Stasis Hold gap with the grappling line, then LOOK at the cataloguer robot), enter it on the lab terminal keypad in the Processing Lab, then come back and press the now-glowing button.

**"How do I reach the cataloguer robot / get across the gap?"**
Don't jump (HAND kills you). Build a grappling line: cut a restraint strap free in the Processing Lab with the surgical probe, pull the carcass hook out of the open morgue drawer, then combine them in your inventory (click one, then the other). USE the line on the gap.

**"How do I get stasis fluid?"**
You can't just HAND the drainage channel. First grab an empty jar from the Processing Lab (HAND the sample jars), then come back and USE the jar on the drainage channel.

**"How do I use inventory items?"**
Click an item in your inventory tray at the bottom — it highlights with a gold border. Then click any world object to USE the item on it. If it works, you'll get a response. If not, you'll get a "that doesn't work" message.

**"I can't reach the Morgue or Archive"**
They're off the Feeding Station, not the Corridor. Corridor → far end → Feeding Station → left for Morgue, right for Archive.

**"I can't get into the vents"**
The vent grate in the corridor floor is locked until you press the armed Emergency Override button in the Security Hub closeup. Arm it from the lab terminal first.

**"Which way at the vent junction?"**
LEFT leads to the airlock (through gas + fan). RIGHT is a dead end with optional loot. The ventilation map (from wall scratches) tells you this if you LOOK at the junction markings.

**"I keep dying in the vents"**
Two items save your life: the **helmet** (Security Hub cabinet) for the gas, and the **surgical probe** (Processing Lab instrument rack) for the fan. Get BOTH before entering the vents.

---

*Last updated: November 2026. All steps verified against scenario.json.*
