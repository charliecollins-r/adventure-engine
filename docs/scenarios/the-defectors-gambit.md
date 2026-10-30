# The Defector's Gambit — Scenario Documentation

## Story Synopsis

East Berlin, 1963. You awaken handcuffed to a cast iron radiator in a Stasi safe house. Your head throbs; your wrist aches. Through the wall, you hear a voice — Oberst Klaus Dietrich, Stasi intelligence officer, chess enthusiast, and philosopher — on the telephone. He has questions about your contacts in the West. Answer them and your network dies. Stay silent and you die. Find a third option before he returns.

Dietrich is no brute. He is methodical, intellectual, coldly polite. He quotes Schiller and Kant between interrogation questions and plays chess against himself. He respects worthy opponents — which makes him more dangerous, not less. His safe house is a bureaucratic fortress: filing cabinets of dossiers, a concealed radio room, a propaganda poster hiding a wall safe, and enough paperwork to drown in. The Stasi's greatest weapon was always its paperwork, and that same bureaucracy might be your escape.

The room holds three paths out: spy tradecraft (radio a coded message to your CIA handler), bureaucratic subversion (forge your own transfer papers and walk out the front door), or brute force (break through the window bars or a weakened wall). Each demands different skills and carries different risks.

**Difficulty**: Hard | **Estimated Time**: 15 minutes | **Patterns Used**: 25

---

## Image Descriptions

### Background Images (4 total)

1. **`backgrounds/interrogation_room.png`** — A stark concrete interrogation room in an East Berlin Stasi safe house, circa 1963. Bare bulb hanging from the ceiling, swinging slightly. A heavy metal table bolted to the floor in the center with two chairs — one plain (yours) and one cushioned (Dietrich's). On the table: an overflowing ashtray, a telephone (black rotary Bakelite). Against one wall: a cast iron radiator with a handcuff attached to it. A locked steel door with a small window. A barred window on the opposite wall (iron bars, dirty glass, glimpse of a grey Berlin street). A large propaganda poster ("Die Mauer schützt den Frieden!" — The Wall protects the peace) on the south wall. A filing cabinet (steel, 3 drawers, padlocked). A coat rack near the door with Dietrich's heavy grey overcoat. A floor vent with screws. A wall mirror (large, institutional). A leather briefcase on the floor by Dietrich's chair. The room feels oppressive, institutional, Cold War austere — concrete, steel, bare fluorescent fallback lighting. Papers, files, the trappings of bureaucratic control.

2. **`backgrounds/filing_cabinet_closeup.png`** — Close-up of the filing cabinet area. Three drawers labeled in German: "AKTIV" (top), "ARCHIV" (middle), "OPERATIV" (bottom). A padlock on the cabinet. On top of the cabinet: a paper tray with blank forms, a heavy desk lamp (with a thick convex lens that could be unscrewed), and an Olympia typewriter (East German model). Behind and beside the cabinet, partially hidden: access to a radio alcove. The drawers contain manila folders, each labeled with case numbers. The desk lamp casts a warm circle on the papers. Cold War-era office equipment — functional, heavy, no-nonsense.

3. **`backgrounds/radio_equipment_closeup.png`** — A concealed radio alcove behind the filing cabinet area. A military radio transceiver (Soviet-made R-105M or similar), chunky with a large frequency dial showing MHz markings. A Morse key (brass telegraph key on a wooden base). A shelf with a codebook (leather-bound, spine marked "FUNKBETRIEB"), logbooks, and loose papers with frequency tables. An antenna cable running up the wall. A radio logbook open to a page of frequency assignments. The equipment is functional but aging — vacuum tube era, dials and switches, amber power indicator. The alcove feels secret, tight, operational.

4. **`backgrounds/window_wall_closeup.png`** — Close-up of the barred window wall. Heavy iron bars set into concrete — old, but solid. The window glass behind them is dirty, showing a grey Berlin street. On the window ledge: scratched graffiti from previous detainees (including a date: "19-08-61" — the day after the Berlin Wall went up). Below the window: a section of wall with a hairline crack running through the plaster. The heating pipe from the radiator runs along the wall, bolted at intervals — one section looks looser than the rest. A patch of plaster is crumbling, suggesting the wall might be weaker here. The overall feel is Cold War despair — grey concrete, iron bars, small glimpses of freedom outside.

---

## Game Flow

### Phase 1: Interrogation
You start handcuffed to the radiator. Dietrich is on a phone call in the next room — you have a window. His check interval is long (90s) and noise threshold is high (70). This is your setup time.

**Immediate goal**: Free yourself from the handcuffs.

1. **Look around** — examine everything reachable from the radiator (limited: radiator, handcuffs, your chair, Dietrich's chair if you stretch)
2. **Hand Dietrich's chair** → reach under it → find hairpin on the floor (Gateway Puzzle)
3. **Use hairpin on handcuffs/radiator** → pick the lock → free (noise: 8)

### Phase 2: Unattended
Dietrich's interval drops to 55s, threshold to 50. The room is now fully explorable.

**Three parallel paths open** (The Fork):

**Path A — The Signal** (radio extraction):
- Search Dietrich's coat → find keys
- Unlock filing cabinet → get cipher sheet from bottom drawer
- Access radio room → find frequency from logbook or codebook
- Power on radio, tune to 4.725 MHz
- Encode and transmit distress message → extraction incoming

**Path B — The Forgery** (bureaucratic escape):
- Get your dossier from filing cabinet → study Dietrich's handwriting
- Get transfer forms, rubber stamp, ink pad from drawers
- Open briefcase (combo 8-1-3, from window ledge inscription "19-08-61") → get Dietrich's pen
- Forge transfer papers: combine forms + pen → stamp with ink pad
- Unlock door with keys → walk out with papers

**Path C — The Breach** (physical escape):
- Loosen heating pipe after freeing from radiator
- Remove pipe section → heavy improvised tool
- Break window bars OR breach cracked wall section
- Optional: distract guard via telephone first, then escape through door

### Phase 3: Escape Attempt
Triggered when you unlock the door, breach the wall, or loosen window bars. Dietrich's interval drops to 25s, threshold to 20. Footsteps in the corridor — the clock is ticking.

### Key Events (Timed)
- **120s** — Guard change: brief distraction window, two voices arguing in the corridor
- **180s** — Dietrich's phone call ends: shorter check intervals possible
- **300s** — Power outage from Western sabotage: 3 seconds of darkness, then emergency lighting (power_outage flag enables certain actions)
- **Evidence triggers** — Dietrich notices empty handcuffs, open cabinet, removed poster, etc.

---

## Items & Dynamics

| Item | How Obtained | Primary Use | Hidden Use |
|------|-------------|-------------|------------|
| **Hairpin** | Under Dietrich's chair | Pick handcuff lock | Also picks simple cabinet locks |
| **Your Dossier** | Filing cabinet top drawer | Study Dietrich's handwriting for forgery | Learn what Stasi knows about you |
| **Cipher Sheet** | Filing cabinet bottom drawer | Encode radio transmission | One-time pad, consumed on use |
| **Transfer Forms** | Filing cabinet middle drawer | Base for forgery | Blank bureaucratic forms |
| **Dietrich's Keys** | Coat rack pockets | Unlock cabinet, door | Multiple keys for multiple locks |
| **Lighter** | Coat rack pockets | Burn evidence, light in dark | Dual-Purpose: also used during power outage |
| **Cigarette Case** | Coat rack pockets | Examine: monogram "K.D." | Contains clue to briefcase code |
| **Microfilm** | Wall safe behind poster | Intelligence evidence | Readable only with magnifying lens |
| **Desk Lamp Lens** | Unscrew from desk lamp | Magnify microfilm | Revelation Tool |
| **Ink Pad** | Filing cabinet middle drawer | Stamp forged papers | Official Stasi district seal |
| **Rubber Stamp** | Filing cabinet middle drawer | Stamp forged papers | Must combine with ink pad |
| **Codebook** | Radio room shelf or safe | Radio frequencies and call signs | Knowledge Gate for radio path |
| **Pen** | Dietrich's briefcase | Fill out transfer forms | Required for forgery |
| **Pipe Section** | Loosen from heating pipe | Break bars or wall | Heavy blunt tool |
| **Forged Papers** | Combine: forms + pen + stamp | Walk out the front door | Multi-step combination chain |

### Key Dynamics

- **Bureaucracy as Weapon (Rule Subversion)**: The entire forgery path uses the Stasi's own systems against them. Their obsession with forms, stamps, and procedures becomes your escape route. Turn the machine on itself.
- **Evidence Gamble**: Every major action leaves evidence — open cabinet, removed poster, empty handcuffs. Dietrich notices each one and escalates. Closing/replacing things (Camouflage) buys time.
- **Decay Clock**: Dietrich's on-visit effects relock the cabinet and can discover your actions. The longer you take, the more evidence accumulates and the more suspicious he becomes.
- **Nested Secret (Microfilm)**: Poster → safe → microfilm → need lens to read → reveals dead drop location and intelligence. Multiple layers of discovery.
- **Knowledge Gate (Radio Frequency)**: You can't use the radio without knowing the frequency (4.725 MHz). Found in the radio logbook OR the codebook from the safe. Information, not items, gates progress.
- **Distraction Window**: Guard change at 120s and power outage at 300s create timed windows for loud actions.
- **Cross-Reference Deduction (Briefcase Code)**: The briefcase combo (8-1-3) comes from the window ledge inscription "19-08-61" (August 19, 1961 — the day the Berlin Wall construction began). The player must recognize the date and extract the digits — 8, 1, 3 (day reversed to match dial format, based on cigarette case clue).

---

## Puzzle Breakdown

### 1. Handcuffs (Gateway Puzzle)
- Reach Dietrich's chair → find hairpin under it
- Use hairpin on handcuffs → pick lock (noise: 8)
- No prerequisites, builds confidence

### 2. Filing Cabinet (Dependency Chain)
- Need Dietrich's keys from coat OR hairpin to pick lock
- Three drawers, each contains critical items:
  - Top (AKTIV): your dossier — handwriting samples for forgery
  - Middle (ARCHIV): transfer forms, stamp, ink pad
  - Bottom (OPERATIV): cipher sheet for radio encoding
- Evidence: Dietrich notices if unlocked on visit

### 3. Wall Safe (Combination Lock — 1961)
- Poster must be removed first (hand on poster → peel corner → remove)
- Puzzle widget: 4-dial combination lock, solution [1, 9, 6, 1]
- Clue: "19-08-61" scratched on window ledge (Berlin Wall construction date)
- Contains: microfilm, codebook, pistol (moral choice)
- Evidence: Dietrich notices removed poster immediately

### 4. Briefcase (Combination Lock — 813)
- Puzzle widget: 3-dial combination lock, solution [8, 1, 3]
- Clue: Derived from "19-08-61" + cigarette case monogram context
- Contains: Dietrich's fountain pen (critical for forgery path)

### 5. Radio Transmission (Sequence Puzzle)
- Puzzle widget: cipher_decode sequence — must complete steps in order
- Steps: Power on → Set frequency 4.725 → Encode with cipher → Tap Morse key → Confirm
- Requires: cipher_sheet + knows_radio_frequency flag
- Reward: extraction_incoming flag → win condition

### 6. Forgery Chain (Multi-Step Combination)
- Combination 1: transfer_forms + pen → forged_papers (requires studying handwriting from dossier)
- Combination 2: forged_papers + ink_pad → stamped papers (requires rubber_stamp found)
- Then: use keys on door + walk through with papers
- 4-step chain, each step adds authenticity

### 7. Physical Breach
- Loosen heating pipe → remove pipe section
- Window path: pipe on bars → bars bend → glass breaks → climb out
- Wall path: expose crack → widen → breach plaster → escape
- Both are loud (noise: 30-40) but fast

---

## Pattern Usage

| # | Pattern | How It's Used |
|---|---------|---------------|
| 1 | **Gateway Puzzle** | Hairpin under chair → pick handcuffs |
| 2 | **Dependency Chain** | Keys → cabinet → forms → pen → forgery → stamp → escape (6 steps) |
| 3 | **The Fork** | Radio, forgery, and breach paths are independent |
| 4 | **Progressive Reveal** | Each drawer and room area reveals more of the operation |
| 5 | **False Summit** | Door unlocks... but a guard is outside (need distraction or papers) |
| 6 | **Dual-Purpose Item** | Lighter: burn evidence AND provide light during power outage |
| 7 | **Nested Secret** | Poster → safe → microfilm → lens → decoded intelligence |
| 8 | **Knowledge Gate** | Radio frequency (4.725 MHz) gates transmission |
| 9 | **Revelation Tool** | Desk lamp lens magnifies microfilm to reveal hidden intelligence |
| 10 | **Cross-Reference Deduction** | Briefcase code from window date + cigarette case context |
| 11 | **Noise Tradeoff** | Pick lock quietly vs. break pipe loudly |
| 12 | **Evidence Gamble** | Every opened drawer / removed poster is evidence for Dietrich |
| 13 | **Distraction Window** | Guard change (120s) and power outage (300s) create action windows |
| 14 | **Ticking Clock Decision** | During power outage: grab safe contents OR escape through door? |
| 15 | **Bait and Punish** | Obvious telephone seems useful but alerts guards when used wrong |
| 17 | **Trap Setting** | Rig the room before Dietrich returns (overturned chair, darkness) |
| 18 | **Red Herring** | Telephone appears to be an escape tool but actually has limited use |
| 19 | **Emergent Combination** | Transfer forms + pen + stamp = functional forged papers |
| 20 | **Multi-Path Solution** | 5 distinct win conditions across 3 solution paths |
| 21 | **Rule Subversion** | Use Stasi bureaucracy against itself — forge your own transfer |
| 22 | **Myst Machine** | Radio system — power, tune, encode, transmit (multi-step control) |
| 25 | **Moral Fork** | Pistol in safe — use it (violent escape) or leave it (clean escape) |
| 26 | **Accomplice** | Floor vent → contact with ally in building (limited communication) |
| 28 | **Camouflage** | Relock cabinet, replace poster to hide evidence |
| 30 | **Decay Clock** | Dietrich relocks cabinet and notices changes on visits |

---

## Killer Profile: Oberst Klaus Dietrich

**Background**: Stasi intelligence officer, career bureaucrat with a philosophical bent. He rose through the ranks not through brutality but through patience and intellect. He plays chess against himself, quotes German Romantics, and views interrogation as a form of intellectual discourse. He respects worthy opponents — which makes him more dangerous, not less. His coldness is cerebral, not emotional.

**Personality**: Coldly polite, intellectual, methodical. Speaks in measured sentences with occasional literary references. Never raises his voice — his control IS the threat. He addresses you formally, almost respectfully, even as he prepares to destroy your network.

**Base Behavior**:
- Check interval: 65s base, 90s in Phase 1, 55s in Phase 2, 25s in Phase 3
- Noise threshold: 55 investigate, 30 curious, 80 immediate
- Decay: 1.2/sec
- Thoroughness: 0.45 base, 0.75 with evidence
- Search order: sequential (methodical, room by room)

**Dialogue Samples**:
- Approach: "Let us continue our conversation." / "Schiller wrote: 'Against stupidity, the gods themselves contend in vain.' Let's see if you're an exception."
- Search: "I know you're here. The building is sealed." / "Every fugitive makes the same mistake — they confuse movement with progress."
- Evidence: "Interesting. You've been busy." / "Resourceful. I expected no less from a Western operative."
- Clear: "Behaving yourself. Good. We'll resume shortly." / "I'll be back. Don't go anywhere."
- Catch: "Checkmate. As I said — patience." / "You played well. Not well enough."

**Special Behaviors**:
- **phone_distraction**: Dietrich receives an urgent call, creating a window
- **power_chaos**: During power outage, Dietrich is briefly disoriented
- **evidence_alert**: Escalates to aggressive mode on finding significant evidence

**On-Visit Effects**:
- Open filing cabinet → relocked with message "You hear the cabinet drawer slam shut, the click of a padlock"
- Removed poster → Dietrich notices and becomes highly suspicious

---

## Solution Paths

### Path 1: The Signal (10-11 steps)
Send a coded distress message to your CIA handler via radio. Spy tradecraft — quiet, precise, professional.

1. Find hairpin under Dietrich's chair
2. Pick handcuff lock with hairpin
3. Search Dietrich's coat → find keys
4. Unlock filing cabinet with keys
5. Open bottom drawer (OPERATIV) → get cipher sheet
6. Navigate to radio closeup
7. Find radio frequency: examine radio logbook (4.725 MHz) OR get codebook from safe/shelf
8. Power on radio transceiver
9. Tune frequency dial to 4.725 MHz
10. Use cipher sheet on radio → encode and transmit message
11. OR complete cipher_decode sequence puzzle
12. **Win**: Extraction team arrives

### Path 2: The Forgery (10 steps)
Forge prisoner transfer papers and walk out the front door. Turn Stasi bureaucracy against itself.

1. Find hairpin, pick handcuffs
2. Search coat → keys
3. Unlock filing cabinet
4. Open top drawer → get your dossier (study Dietrich's handwriting)
5. Open middle drawer → get transfer forms, stamp, ink pad
6. Open briefcase (combination 8-1-3) → get Dietrich's pen
7. Combine transfer_forms + pen → partially forged papers
8. Combine forged_papers + ink_pad (with stamp) → fully stamped papers
9. Unlock door with Dietrich's keys
10. **Win**: Walk through door with forged papers

### Path 3: The Breach (6-7 steps)
Break out through window or wall. Loud, fast, desperate.

1. Find hairpin, pick handcuffs
2. Loosen heating pipe section near window
3. Remove pipe section → heavy improvised lever
4. Navigate to window closeup
5. **Window route**: Break bars with pipe → break glass → climb out
6. **Wall route**: Widen crack → breach plaster section → escape
7. Optional: Use telephone to distract guard → escape through door instead

---

## Image Generation Prompts

Copy-paste these prompts into **Google Gemini (free tier)** to generate background images. Generate at 1920x1080 when resolution options are available. Generate 3-4 variations and pick the most atmospheric one.

**Style consistency keywords** (include in every prompt for this scenario): `Cold War espionage, 1963 East Berlin, Stasi interrogation, stark concrete and steel, oppressive institutional, bare bulb lighting, grey and austere`

### `backgrounds/interrogation_room.png`
> **Gemini Prompt**: `Game background art, 16:9 aspect ratio, 1920x1080. Stark concrete interrogation room in a 1963 East Berlin Stasi safe house. Bare bulb hanging from the ceiling swinging slightly. A heavy metal table bolted to the floor in the center with two chairs, one plain and one cushioned. On the table: an overflowing ashtray and a black rotary Bakelite telephone. Against one wall: a cast iron radiator with handcuffs attached. A locked steel door with a small window. A barred window on the opposite wall with iron bars, dirty glass, and a glimpse of a grey Berlin street. A large German propaganda poster on one wall. A steel 3-drawer filing cabinet with a padlock. A coat rack near the door with a heavy grey overcoat. A floor vent with screws. A large institutional wall mirror. A leather briefcase on the floor. Papers and files scattered. Oppressive Cold War atmosphere, concrete and steel, bare fluorescent fallback lighting. Cold War espionage, Stasi aesthetic, grey and austere. No text, no UI, no characters.`

### `backgrounds/filing_cabinet_closeup.png`
> **Gemini Prompt**: `Game background art, 16:9 aspect ratio, 1920x1080. Close-up of a steel filing cabinet area in a 1963 Stasi interrogation room. Three drawers labeled in German: AKTIV (top), ARCHIV (middle), OPERATIV (bottom). A padlock on the cabinet. On top: a paper tray with blank forms, a heavy desk lamp with a thick convex lens, and an East German Olympia typewriter. Behind and beside the cabinet, partially hidden: a radio alcove visible in the shadows. The drawers contain manila folders with case numbers. The desk lamp casts a warm circle on the papers. Cold War-era office equipment, functional, heavy, no-nonsense. Stasi bureaucratic aesthetic, warm lamp light contrasting cold room. No text, no UI, no characters.`

### `backgrounds/radio_equipment_closeup.png`
> **Gemini Prompt**: `Game background art, 16:9 aspect ratio, 1920x1080. A concealed radio alcove behind filing cabinets in a Stasi safe house. A military Soviet-made radio transceiver, chunky with a large frequency dial showing MHz markings. A brass Morse telegraph key on a wooden base. A shelf with a leather-bound codebook, logbooks, and loose papers with frequency tables. An antenna cable running up the wall. A radio logbook open to a page of frequency assignments. Vacuum tube era equipment with dials, switches, and an amber power indicator light. The alcove feels secret, tight, and operational. Cold War espionage, covert communications, amber glow. No text, no UI, no characters.`

### `backgrounds/window_wall_closeup.png`
> **Gemini Prompt**: `Game background art, 16:9 aspect ratio, 1920x1080. Close-up of a barred window wall in a 1963 East Berlin Stasi interrogation room. Heavy iron bars set into concrete, old but solid. Dirty window glass behind them showing a grey Berlin street. Scratched graffiti from previous detainees on the window ledge including a date. Below the window: a section of wall with a hairline crack running through the plaster. A heating pipe from a radiator runs along the wall, bolted at intervals with one section looking looser than the rest. Crumbling plaster suggesting structural weakness. Cold War despair, grey concrete, iron bars, small glimpses of freedom outside. No text, no UI, no characters.`

---

## JSON Scenario

See: [`examples/the-defectors-gambit.json`](../../examples/the-defectors-gambit.json)
