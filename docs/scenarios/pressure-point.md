# Pressure Point — Scenario Documentation

## Story Synopsis

You awaken zip-tied to a chair in a damaged deep-sea research module at 3,012 meters depth — roughly 300 atmospheres of crushing ocean pressure. The hull groans. Water beads on every surface. Beyond the viewport, bioluminescent creatures drift in the eternal dark.

Dr. Yuki Tanaka — the station's marine biologist — has sealed your module and is deliberately flooding it. After 193 days at depth studying deep-sea organisms, she's snapped. She believes the creatures are sentient, that they communicate through pressure changes, and that they need human "subjects" to study in return. You are Subject 7. The previous six didn't make it.

Tanaka isn't raging or theatrical — she's clinically detached, alternating between cold scientific analysis ("Your cortisol levels must be fascinating") and manic reverence for what she calls "the deep ones" and their mysterious leader, "the Mother." She monitors you via intercom and makes periodic checks through the station's interconnected modules.

The station is failing. Module C has already imploded. Module B (where you are) is flooding. Something enormous is rising from below. You have 10 minutes before catastrophic hull failure.

**Difficulty**: Hard | **Estimated Time**: 12 minutes | **Patterns Used**: 29

---

## Image Descriptions

### Background Images (4 total)

1. **`backgrounds/research_lab.png`** — The main research lab module (Module B). A cylindrical pressurized space roughly 30 feet long. Dark steel walls sweating condensation. A heavy bulkhead door with wheel-lock and red status light on the left wall, porthole window showing Tanaka's lab beyond. A large acrylic observation viewport on the right showing the abyss — bioluminescent creatures drift outside. Three sealed cylindrical specimen tanks with murky glowing fluid center-left. A stainless steel lab bench covered in scattered research notes and equipment center-right. A dive equipment locker marked "EMERGENCY EVA" along the left wall. A deck grate in the floor with water pooling beneath. A red-bordered emergency systems panel on the far right wall. Overhead pipe network along the ceiling, some sweating, one with a hairline crack dripping. A supply crate (partially crushed), a dive suit rack (mostly empty), a wall-mounted intercom with blinking light. A spreading puddle of seawater on the deck with faint bioluminescent specks. A ventilation shaft cover near the ceiling, left wall. Color palette: deep dark blues (#040810 to #0a1420), industrial grays, cold steel. Lighting: dim emergency strips, blue-green glow from specimen tanks and viewport creatures, occasional red from warning lights. The atmosphere is claustrophobic, wet, and alien.

2. **`backgrounds/dive_equipment.png`** — Close-up of the dive equipment station inside the opened locker area. A professional deep-sea dive helmet with a visibly cracked polycarbonate visor on a mount. A rack of eight high-pressure breathing tanks — seven gauges in the red (empty), one amber (partial fill). An analog pressure gauge on the bulkhead showing internal vs external pressure. A wall-mounted maintenance toolbox with a stiff latch. A dive suit seal repair kit (small case with patches and adhesive). A handheld EPIRB emergency beacon, inactive. A wall chart showing station depth profile, pressure ratings, and emergency ascent pod requirements. Equipment is professional-grade deep-sea rated. Metal surfaces are pristine titanium and reinforced steel, contrasting with the failing module around them. Lighting: slightly better here — the locker has its own internal LED strip.

3. **`backgrounds/communications_station.png`** — Close-up of the station's communications console. The RCS-4000 radio is the centerpiece — an empty circuit board slot gapes where the main board was ripped out. A cable junction shows a cleanly cut antenna coaxial cable (Tanaka's sabotage). A large frequency tuning dial currently set to 121.5 MHz. A corded radio handset hanging from its cradle. The station logbook sits nearby — water-stained, thick, official. A destroyed circuit board lies in fragments on the console surface. A circular sonar display still glows green with sweeping contacts. The console itself has rows of toggle switches and indicator lights — most dark. When repaired, the console hums with amber-lit dials and bouncing signal meters. Color: dark greens from sonar glow, deep shadows, industrial communications equipment.

4. **`backgrounds/pressure_control.png`** — Close-up of the pressure control station accessed through the emergency panel. A large master pressure gauge dominates — multi-dial display showing hull integrity percentages, internal vs external pressure, and ballast tank status. A ballast control panel with four labeled toggle switches (Tank A, Crossfeed, Tank B, Tank C) behind a safety interlock cover. A heavy red lever labeled "EMERGENCY ASCENT — PULL TO RELEASE" with dual-authorization signage. A row of four motorized flood valves with square-socket manual override wheels — currently wide open, seawater flowing. A digital hull integrity display with section-by-section status. An electronic override keypad panel for entering the emergency code. The room's color is dominated by red warning lights and amber caution indicators. Pipes connect everything. The whole station's survival systems are concentrated here.

---

## Game Flow

### Phase 1: Seepage (0–180 seconds)
The module has minor leaks. Tanaka checks every ~70 seconds with a high noise tolerance (60). This is your exploration window.

**Immediate goal**: Free yourself from the zip ties.

1. **Hand the chair** — struggle against zip ties; they snap, leaving a sharp fragment (Gateway Puzzle, Pattern #1)
2. **Explore the main lab** — lab bench, specimen tanks, storage crate, suit rack, pipes, viewport
3. **Gather essential tools**: multi-tool from suit rack (the key enabler), UV penlight + crew log from lab bench, sealant + cable + code from supply crate
4. Begin working toward one of three escape routes

### Phase 2: Flooding (180–420 seconds)
A pipe splits. Water is visibly rising (ankle-deep). Tanaka checks every ~50 seconds, noise threshold drops to 45. Module C implodes at 300s. The creatures are pressing closer.

**Key milestones by this phase**:
- Radio repair chain should be in progress (comms path)
- Emergency panel should be open via code 0451 (pod/ballast paths)
- Flood valves should be getting shut down (ballast path)

### Phase 3: Critical Pressure (420–600 seconds)
Waist-deep water. Hull integrity dropping below 52%. Tanaka becomes enraged (checks every 25s, threshold 25). Something massive rises from below. This is the endgame.

**Three win conditions emerge** (The Fork, Pattern #3):

**Path A — Radio Rescue** (medium difficulty):
- Repair radio (circuit board + spliced cable) → tune to 156.8 MHz → send mayday
- Survive by sealing hull breaches, hiding, and using distractions
- Rescue arrives by submersible (dramatic but you must outlast the clock)

**Path B — Ascent Pod Escape** (hard):
- Enter code 0451 on emergency keypad → access pod controls
- Fix dive helmet (replacement visor + sealant) → secure air tank
- Enter override code on pod panel → pull manual lever → launch to surface

**Path C — Blow the Ballast** (hard, most dramatic):
- Seal pipe crack → close flood valves with valve key → redirect pipe pressure
- Solve linked-switch ballast toggle puzzle → whole module rockets to surface
- Tanaka surfaces with you, screaming about her ruined specimens

---

## Items & Dynamics

| Item | How Obtained | Primary Use | Secondary Use |
|------|-------------|-------------|---------------|
| **Zip Tie Fragment** | Break free from restraints | Sharp edge for scoring plastic | — |
| **Dive Multi-Tool** | Take from dive suit rack | Open padlock (dive locker), remove bolts (deck grate, vent shaft), splice cable | The universal enabler — needed for 6+ interactions |
| **UV Penlight** | Search lab bench (hand) | Reveal hidden frequency on logbook/crew log | Reveals fluorescent "7" on your wrist |
| **Crew Log Page** | Search lab bench (hand) | Learn about Tanaka's sabotage and hidden frequency hint | Use UV light on it for backup frequency 156.8 |
| **Hull Sealant Tube** | Open supply crate (hand) | Seal cracked ceiling pipe | Combine with visor for helmet repair |
| **Spare Circuit Board** | Found in comms area (storage) | Replace smashed radio board | — |
| **Coaxial Cable Segment** | Open supply crate (hand) | Combine with multi-tool → repaired antenna cable | — |
| **Bioluminescent Sample** | Take from specimen tank sampling port | Combine with flare → creature lure | Shake to agitate viewport creatures |
| **Pressure Wrench** | Open toolbox in dive equipment | Jam bulkhead to lock Tanaka out | — |
| **Replacement Visor** | Open toolbox in dive equipment | Combine with sealant → fix dive helmet | — |
| **Valve Key** | Under deck grate (multi-tool to remove) | Close flood valves | Redirect pipe pressure for ballast blow |
| **Emergency Flare** | Take from air tank rack | Toss into vent shaft to distract Tanaka | Combine with specimen sample → creature lure |
| **Repaired Antenna Cable** | Combine cable segment + multi-tool | Complete radio repair (with circuit board) | — |
| **Creature Lure** | Combine flare + specimen sample | Distract Tanaka (40s) via specimen frenzy | — |

### Key Item Combinations

| Items Combined | Result | Consumes | Noise |
|---------------|--------|----------|-------|
| Cable Segment + Multi-Tool | Repaired Antenna Cable | No (multi-tool retained) | 8 |
| Emergency Flare + Bioluminescent Sample | Creature Lure | Yes (both consumed) | 3 |
| Dive Helmet Visor + Sealant Tube | Fixed Visor (on helmet) | No (sealant retained) | 2 |

---

## Puzzle Breakdown

### 1. Emergency Keypad (Pattern #22 — Myst Machine)
- **Type**: Keypad (4-digit code)
- **Solution**: `0451` (station registry number, found on supply crate)
- **View**: Main (on emergency systems panel)
- **Max Attempts**: 5 (locks out on failure — multi-tool backup path)
- **Unlocks**: Emergency panel → access to pressure control station and pod controls

### 2. Frequency Tuner (Pattern #8 — Knowledge Gate)
- **Type**: Dial with 6 positions
- **Solution**: `156.8` MHz (hidden backup frequency found via UV light on logbook)
- **View**: Comms closeup
- **Requires**: Radio must be repaired first, player must know the frequency
- **Unlocks**: Ability to send mayday on unmonitored frequency

### 3. Ballast Toggles (Pattern #23 — Power Routing)
- **Type**: Toggle panel with 4 linked switches (lights-out mechanic)
- **Solution**: [ON, OFF, ON, ON] (Tank A on, Crossfeed off, Tank B on, Tank C on)
- **Labels**: Tank A, Crossfeed, Tank B, Tank C
- **Linked pairs**: Toggling one switch also toggles its neighbors
- **View**: Pressure control closeup
- **Requires**: Flood valves closed AND pipe pressure redirected
- **Unlocks**: Emergency ballast blow → entire module surfaces

### Cross-Reference Deduction Chain (Pattern #10)
The emergency override code `0451` is found on the supply crate registration stamp ("REG# 0451"). The depth chart tells you the pod release code matches the station registry number. The storage crate label and the depth chart independently reference this same number — the player must connect these.

### UV Light Revelation Chain (Pattern #9 — Revelation Tool)
1. Get UV penlight from lab bench
2. Use on crew log page → reveals hidden fluorescent ink: "BACKUP FREQ 156.8 MHz — Rodriguez"
3. OR use on station logbook in comms area → same revelation
4. Two redundant paths to the same critical knowledge

---

## Pattern Usage

| # | Pattern | How It's Used |
|---|---------|--------------|
| 1 | Gateway Puzzle | Zip tie struggle — the first action, gates all exploration |
| 2 | Dependency Chain | Radio repair: need circuit board AND spliced cable AND frequency knowledge |
| 3 | Fork | Three distinct win conditions branch from a common early game |
| 4 | Progressive Reveal | Specimen tanks, viewport creatures, and sonar reveal escalating threat across phases |
| 5 | False Summit | Repairing radio feels like a win — then you learn rescue is 40 minutes away and the module might not last |
| 6 | Dual-Purpose Item | Sealant: seal hull breach OR fix dive helmet visor. Emergency flare: distract Tanaka via vent OR combine into creature lure. Valve key: close flood valves AND redirect pressure |
| 7 | Nested Secret | Toolbox inside dive locker — multi-tool opens locker, then toolbox inside has pressure wrench and visor |
| 8 | Knowledge Gate | Must know frequency 156.8 before radio is useful; must know code 0451 before keypad works |
| 9 | Revelation Tool | UV penlight reveals hidden messages written in fluorescent ink on documents |
| 10 | Cross-Reference Deduction | Station registry number (crate) = emergency override code (depth chart tells you this) |
| 11 | Noise Tradeoff | Every useful action generates noise — splice cable (8), open locker (18), close valves (25), send mayday (25) |
| 12 | Evidence Gamble | Open locker, remove grate, repair radio — all leave evidence Tanaka detects on her next visit |
| 13 | Distraction Window | Creature lure (40s), flare through vent shaft, sonar ping — multiple distraction methods |
| 14 | Ticking Clock Decision | At critical pressure, you must commit to one escape path — no time to attempt all three |
| 15 | Bait and Punish | Talking to Tanaka through bulkhead door generates 25 noise. Sonar ping scatters creatures but generates 20 noise |
| 16 | Sound Masking | Hull stress events add ambient noise that could mask player actions |
| 17 | Trap Setting | Jam bulkhead with pressure wrench — locks Tanaka out for 60 seconds |
| 18 | Red Herring | Smashed circuit board on console (unfixable, you need the spare). Dive suit repair kit (present but not needed for any win path) |
| 19 | Emergent Combination | Cable + multi-tool = spliced cable. Flare + specimen = creature lure. Visor + sealant = fixed helmet |
| 20 | Multi-Path Solution | Three complete win conditions, each with distinct requirements and difficulty |
| 21 | Rule Subversion | Using Tanaka's own specimens against her (creature lure exploits her obsession) |
| 22 | Myst Machine | Emergency keypad — standalone puzzle widget with code input |
| 23 | Power Routing | Ballast system: close valves → seal leak → redirect pressure → toggle fill pattern. A multi-step mechanical chain |
| 24 | Perspective Alignment | Looking through viewport/sonar shows escalating creature behavior that contextualizes the urgency |
| 25 | Moral Fork | Ballast blow surfaces Tanaka too (she lives, arrested). Pod escape leaves her behind (she dies with the station). Radio rescue — uncertain outcome for her |
| 27 | Point of No Return | Pulling ascent lever or blowing ballast — irreversible actions that end the scenario |
| 28 | Camouflage | Two hiding spots (dive locker, supply crate) when Tanaka checks; camouflaging evidence to avoid detection |
| 29 | Echo | Intercom conversations with Tanaka provide backstory — each exchange reveals more about her madness and the specimens |
| 30 | Decay Clock | Module integrity drops across phases: 87% → 71% → 52%. Water rises from puddle → ankle → waist. Creatures gather. The station is dying |

---

## Killer Dynamics

**Dr. Yuki Tanaka** — Marine Biologist turned captor

| Parameter | Seepage | Flooding | Critical |
|-----------|---------|----------|----------|
| Check Interval | 70s | 50s | 30s |
| Noise Threshold (Investigate) | 60 | 45 | 25 |
| Noise Threshold (Immediate) | 80 | 80 | 60 |

**Personality**: Scientific detachment. Refers to player as "Subject 7." Alternates between clinical observation ("Your cortisol levels must be fascinating") and manic reverence for the deep-sea creatures ("They SPOKE to me"). Her dialogue reveals 6 previous subjects who didn't survive.

**Evidence Flags**: `tanaka_evidence_bulkhead`, `tanaka_evidence_tools`, `tanaka_evidence_comms` — Tanaka's thoroughness increases from 0.35 to 0.65 when she spots evidence of tampering.

**On-Visit Effects**: Tanaka relocks the dive locker if she finds it open, kicks the deck grate closed, and comments on the open ventilation shaft.

**Special Behaviors**:
- **Specimen Frenzy**: Creature lure or flare through vent → 40s distraction
- **Locked Out**: Jam bulkhead with wrench → 60s lockout (she can still flood remotely)
- **Critical Phase Rage**: In phase 3, becomes enraged — checks every 25s, thoroughness 0.75

---

## Events Timeline

| Time | Event | Effect |
|------|-------|--------|
| 60s | Hull Stress Warning | Lights flicker, metallic groan, rivet pops |
| 120s | Creature Appearance | Massive eye slams against viewport — creatures know you're here |
| 150s | Tanaka Check-In | Intercom taunt about cortisol levels and previous subjects |
| 180s | **Phase 2: Flooding** | Pipe splits, water rising, Tanaka announces "Phase two" |
| 300s | Compartment Breach | Module C implodes — station lurches, 30 noise added |
| 360s | Bioluminescent Chorus | All creatures pulse in synchrony — Tanaka says "The Mother is coming" |
| 420s | **Phase 3: Critical** | Hull failing, waist-deep water, creatures pushing against viewports |
| 540s | Final Warning | Something massive pushes against station foundations |
| 600s | **GAME OVER** | Catastrophic hull failure — ocean floods in |

---

## Win & Lose Conditions

### Win Conditions

1. **Radio Rescue** — Repair comms (circuit board + spliced cable), tune to 156.8 MHz, send mayday via handset. Must survive until rescue arrives.
2. **Ascent Pod Escape** — Enter code 0451 on override panel, fix dive helmet (visor + sealant), secure air tank, pull ascent lever. One-person escape pod rockets to surface.
3. **Ballast Blow Surface** — Close all flood valves, seal hull breach, redirect pipe pressure, solve ballast toggle puzzle. Surfaces the entire module — most dramatic ending.

### Lose Conditions

1. **Caught** — Tanaka catches you while not hiding. "There you are, Subject 7. The deep ones were right — you do have remarkable survival instincts. Now, let's begin the real experiment."
2. **Time Limit (600s)** — Hull fails. "The ocean rushes in — a wall of black water and crushing pressure. The last thing you see is the bioluminescent creatures flooding through the breach. Dr. Tanaka's voice: 'The Mother welcomes you, Subject 7.'"

---

## Solution Paths (Detailed)

### Path A: Call for Rescue (Medium)

| Step | Action | Noise | Notes |
|------|--------|-------|-------|
| 1 | Struggle free from zip ties (hand chair) | 20 | Gateway puzzle |
| 2 | Search lab bench (hand) → crew log page + UV penlight | 12 | Dual-purpose items |
| 3 | Take multi-tool from dive suit rack | 3 | The key enabler |
| 4 | Open supply crate (hand) → sealant + cable + code 0451 | 15 | Cross-reference deduction |
| 5 | Combine cable segment + multi-tool → repaired antenna cable | 8 | Emergent combination |
| 6 | Navigate to comms closeup, use circuit board + cable on radio | 15 | Dependency chain complete |
| 7 | Use UV penlight on logbook → learn 156.8 MHz | 0 | Revelation tool |
| 8 | Tune frequency dial to 156.8 | 1 | Knowledge applied |
| 9 | Talk into handset → send mayday | 25 | Rescue confirmed (40 min ETA) |
| 10 | Seal ceiling pipe with sealant | 5 | Buy time |
| 11 | Survive: hide, use distractions, avoid Tanaka | — | Endurance phase |
| **Total** | | **~104** | |

### Path B: Emergency Ascent (Hard)

| Step | Action | Noise | Notes |
|------|--------|-------|-------|
| 1 | Struggle free from zip ties | 20 | Gateway puzzle |
| 2 | Take multi-tool from suit rack | 3 | Essential tool |
| 3 | Open supply crate → sealant + cable + code 0451 | 15 | Registry = override code |
| 4 | Enter 0451 on emergency keypad | 2 | Opens emergency panel |
| 5 | Open dive locker with multi-tool | 18 | Access dive equipment |
| 6 | Navigate to dive equipment closeup | 0 | — |
| 7 | Open toolbox → pressure wrench + replacement visor | 10 | Nested secret |
| 8 | Take air tank + emergency flare from rack | 10 | Air supply secured |
| 9 | Combine visor + sealant on dive helmet | 2 | Helmet repaired |
| 10 | Enter code on override panel | 2 | Electronic authorization |
| 11 | Pull ascent lever (with helmet + air) | 50 | Point of no return — ESCAPE |
| **Total** | | **~132** | |

### Path C: Surface the Module (Hard, Most Dramatic)

| Step | Action | Noise | Notes |
|------|--------|-------|-------|
| 1 | Struggle free from zip ties | 20 | Gateway puzzle |
| 2 | Take multi-tool from suit rack | 3 | Essential tool |
| 3 | Open supply crate → sealant + cable + code 0451 | 15 | Sealant critical for this path |
| 4 | Seal ceiling pipe crack with sealant | 5 | Prerequisite for pressure redirect |
| 5 | Remove deck grate with multi-tool → get valve key | 20 | Hidden item under floor |
| 6 | Enter 0451 on emergency keypad | 2 | Access pressure controls |
| 7 | Navigate to pressure control closeup | 0 | — |
| 8 | Use valve key on flood valves → close all | 25 | Stop the flooding |
| 9 | Use valve key on ceiling pipes → redirect pressure | 30 | Power routing mechanic |
| 10 | Activate ballast panel (safety interlock clears) | 8 | — |
| 11 | Solve ballast toggle puzzle [ON, OFF, ON, ON] | 3 | Linked-switch mechanic |
| 12 | Module surfaces! | 0 | Tanaka surfaces too |
| **Total** | | **~131** | |

---

## Image Generation Prompts

Copy-paste these prompts into **Google Gemini (free tier)** to generate background images. The target art style is **1990s Sierra On-Line adventure games** — specifically **King's Quest V** and **King's Quest VI** — hand-painted, lush, richly detailed backgrounds with painterly textures, atmospheric lighting, and a sense of depth. Generate at 1920x1080 when resolution options are available. Generate 3-4 variations and pick the most atmospheric one. If results look too modern or photorealistic, append: `"painterly style, hand-painted, 1990s adventure game aesthetic"`.

**Style consistency keywords** (include in every prompt for this scenario): `deep-sea horror, underwater research station, dark steel and condensation, bioluminescent blue-green glow, claustrophobic pressurized module, industrial sci-fi`

### `backgrounds/research_lab.png`
> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Interior of a cylindrical deep-sea research module roughly 30 feet long. Dark steel walls sweating with condensation. A heavy bulkhead door with wheel-lock and red status light on the left wall, small porthole window beside it. A large acrylic observation viewport on the right showing the deep ocean abyss with bioluminescent creatures drifting outside. Three sealed cylindrical specimen tanks with murky glowing fluid center-left. A stainless steel lab bench covered in scattered research notes center-right. A dive equipment locker marked EMERGENCY EVA along the left wall. A deck grate in the floor with water pooling beneath. A red-bordered emergency systems panel on the far right wall. Overhead pipe network, some sweating, one with a hairline crack dripping. A spreading puddle of seawater on the deck with faint bioluminescent specks. Deep dark blues, industrial grays, cold steel. Dim emergency lighting strips, blue-green glow from specimen tanks and viewport creatures, occasional red from warning lights. Deep-sea horror, claustrophobic, wet, alien. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

### `backgrounds/dive_equipment.png`
> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Close-up of a deep-sea dive equipment station inside an opened metal locker. A professional deep-sea dive helmet with a visibly cracked polycarbonate visor on a mount. A rack of eight high-pressure breathing tanks, seven gauges in the red and one amber with partial fill. An analog pressure gauge on the bulkhead showing internal vs external pressure. A wall-mounted maintenance toolbox with a stiff latch. A small dive suit seal repair kit case. A handheld emergency beacon device, inactive. A wall chart showing station depth profile and pressure ratings. Professional-grade deep-sea rated equipment in pristine titanium and reinforced steel contrasting with the failing module around it. The locker has its own internal LED strip providing slightly better lighting. Deep-sea industrial, professional, urgent. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

### `backgrounds/communications_station.png`
> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Close-up of a deep-sea research station communications console. A large radio with an empty circuit board slot gaping where the main board was ripped out. A cable junction with a cleanly cut antenna coaxial cable showing deliberate sabotage. A large frequency tuning dial set to 121.5 MHz. A corded radio handset hanging from its cradle. A water-stained station logbook nearby. Destroyed circuit board fragments on the console surface. A circular sonar display glowing green with a sweeping contact line. Rows of toggle switches and indicator lights, most dark. Dark greens from sonar glow, deep shadows, industrial communications equipment. Deep-sea horror, sabotaged technology. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

### `backgrounds/pressure_control.png`
> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Close-up of a deep-sea station pressure control station. A large master pressure gauge with multi-dial display showing hull integrity percentages, internal vs external pressure, and ballast tank status. A ballast control panel with four labeled toggle switches behind a safety interlock cover. A heavy red lever labeled EMERGENCY ASCENT with dual-authorization signage. A row of four motorized flood valves with square-socket manual override wheels, currently wide open with seawater flowing through. A digital hull integrity display. An electronic override keypad panel. Dominated by red warning lights and amber caution indicators. Pipes connecting everything. The survival systems of an underwater station concentrated in one critical area. Deep-sea horror, urgent, industrial red lighting. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`
