# The Seance Room — Scenario Documentation

## Story Synopsis

You awaken seated at a round table draped in black velvet, wrists bound with silk cord. Candles gutter in the draft. At barely a third the height of a human, you're dwarfed by the Victorian furniture — the table's edge is at your chin, the chair swallows you whole, and the grandfather clock looms like a monolith. Below, an elderly woman chants in a language you don't recognize. Madame Lenore Blackwood believes you are the vessel through which she will summon her dead daughter Eleanor. The ritual begins at midnight. Find a way out before she finishes her preparations.

Lenore isn't a monster — she's a grief-stricken mother who lost her twelve-year-old daughter Eleanor thirty years ago and never recovered. She was once a professional spiritualist medium (a fraud, using hidden bellows, magnets, and trick mirrors), but somewhere along the way she began believing her own deceptions. Now she's convinced that a ritual performed at midnight with a living "vessel" will bring Eleanor back.

The parlor you're trapped in is both a Victorian séance room and a treasure trove of the medium's secret mechanisms. Every prop — the spirit board, the crystal ball, the spirit cabinet — is a fraud device with hidden mechanical tricks. Learning the tricks of Lenore's trade is the key to escape: you can use her own mechanisms to distract her, or simply force your way out through physical means.

The scenario's emotional core is the tension between Lenore's genuine maternal love and her dangerous delusion. She doesn't want to hurt you. She wants to "save" you — by completing a ritual that will erase your consciousness and replace it with Eleanor's spirit.

**Difficulty**: Hard | **Estimated Time**: 12 minutes | **Patterns Used**: 24

> **Note**: The antagonist mechanic (Madame Lenore) is optional. This scenario works as a pure point-and-click adventure if the antagonist AI is disabled in the scenario configuration.

---

## Image Descriptions & Generation Prompts

### Background Images (3 total)

1. **`backgrounds/parlor_main.png`** — A Victorian séance parlor on the second floor of a London townhouse. Burgundy wallpaper with damask pattern. Heavy oak door with ironwork skull motif (locked). Large bay window with heavy drapes, overlooking a moonlit garden two stories below. Marble fireplace with cold ashes. Tall mahogany spirit cabinet with carved vine doors (combination locked). Floor-to-ceiling bookshelf crammed with occult texts. Heavy burgundy curtain concealing an alcove shrine. Grandfather clock reading quarter to midnight. Fainting chaise with faded red upholstery. Brass gas lamp on the wall. Persian rug covering most of the floor. Central round table draped in black velvet with séance implements. The atmosphere is warm candlelight against deep shadow, lavender and age.

2. **`backgrounds/seance_table_closeup.png`** — Close-up of the round séance table. Black velvet surface, perfectly arranged implements: a wooden spirit board (alphabet arc, numbers, YES/NO/GOODBYE), a heart-shaped planchette on the board, a five-armed brass candelabra with colored candles (rose-pink, lily-white, violet-purple, plain white, black), and a large cloudy crystal ball on a brass stand. The silk binding where the player was tied visible at the near edge. Beneath the table, an ornate carved pedestal with serpentine motifs and a barely-visible maintenance panel. Candlelight reflects off polished wood and brass.

3. **`backgrounds/cabinet_closeup.png`** — Interior of the mahogany spirit cabinet, doors thrown open. Upper shelf: séance props (tambourine, speaking trumpet, slate, music box). Lower shelf: bellows mechanism (missing handle), coils of wire, box of magnets. Center: a large oval mirror in a brass frame mounted on a pivot. A hidden panel at the base. Wires and pulleys connect to concealed tracks running to the table. The cabinet is a fraud workshop — every surface hides a mechanism. Through the turned mirror, a dark narrow passage is visible.

---

## The Killer — Madame Lenore Blackwood

**Personality**: Gentle, maternal, delusional. Lenore speaks softly, calls you "dearie," "love," and "child." She doesn't threaten — she soothes. Her catch lines are heartbreaking: "Found you, dear heart. I know you're frightened, but Mother Lenore is here." She genuinely believes the séance will save both you and Eleanor.

**Behavior**:
- **Base check interval**: 55 seconds (±15s variance)
- **Noise thresholds**: Curious at 30, Investigate at 55, Immediate at 80
- **Noise decay**: 1.2 per second
- **Search thoroughness**: 0.35 base, escalating to 0.65 when she finds evidence
- **Evidence flags**: Open cabinet, unlatched window, moved rug, opened curtain, turned mirror, opened flue

**On-visit Effects** (what Lenore does when she comes upstairs):
- **Relatches the window** if you've unlatched it — "The cold air upsets the spirits"
- **Replaces the rug** over the trapdoor and resets related flags — advances to desperate phase
- **Triggers the gas lamp trap** if you've rigged it — she reaches for it and is blinded for 45 seconds

**Special Behaviors**:
- When the ritual convinces her Eleanor has arrived (`lenore_satisfied`), she enters a 120-second prayer trance and won't come upstairs
- When blinded by the gas lamp, she's distracted for 45 seconds
- When she finds evidence of tampering, she enters desperate mode (30s check interval, 0.65 thoroughness)

---

## Environment

### Main Parlor (`main`)
The primary room — a Victorian séance parlor. Contains:
- **Parlor Door** — Locked with a skull-motif mortise lock. Needs the iron key to unlock, then Lenore must be distracted to sneak past
- **Bay Window** — Latched, overlooking a garden. Can be pried with letter opener (quiet) or poker (loud). Drainpipe available for climbing
- **Fireplace** — Cold, with closed flue. Contains candle snuffer, smelling salts, and fireplace poker. Flue can be opened and grate cleared for chimney climbing
- **Spirit Cabinet** — Combination-locked mahogany cabinet. Leads to the cabinet closeup view
- **Bookshelf** — Contains the fraudulent Medium's Art manual among the occult texts
- **Velvet Curtain** — Conceals Eleanor's memorial shrine behind it
- **Grandfather Clock** — Hides Eleanor's diary and a clock gear inside its case
- **Chaise Lounge** — Hiding spot; the letter opener is tucked between cushions
- **Gas Lamp** — Can be rigged with excess gas for a blinding flare trap
- **Portrait Wall** — (Hidden behind curtain) Eleanor's memorial with magnifying lens and phosphor powder behind the portrait
- **Persian Rug** — Covers a trapdoor leading to the medium's secret corridor below

### Seance Table Closeup (`seance_table_closeup`)
The center table up close. Contains:
- **Séance Table** — Reveals magnetic tracks beneath the velvet
- **Planchette** — Contains hidden magnet (fraud evidence)
- **Spirit Board** — Has hidden phosphorescent writing revealed by powder: "ELEANOR SAYS: TURN THE MIRROR"
- **Candelabra** — Five colored candles for the ritual sequence puzzle
- **Crystal Ball** — Faint etchings revealed by magnifying lens or phosphor powder: moon-star-sun-moon symbols
- **Silk Binding** — Your starting constraint. A stage knot that releases with one pull
- **Table Pedestal** — Hidden panel contains the bellows handle

### Cabinet Closeup (`cabinet_closeup`)
Inside the spirit cabinet. Contains:
- **Cabinet Doors** — Combination lock (solution: 7481) or forceable with poker
- **Upper Shelf** — Séance props (fraud evidence)
- **Lower Shelf** — Bellows mechanism, wires, magnets. Bellows can be reconnected here
- **Cabinet Mirror** — Pivots 90° counter-clockwise to reveal a secret passage
- **Cabinet Mechanism** — Wire/pulley system connecting to the table
- **Hidden Bellows Mount** — Where the repaired bellows attaches

---

## Items & Dynamics

| Item | How Obtained | Primary Use | Secondary Use |
|------|-------------|-------------|---------------|
| **Silk Cord** | Free yourself from binding | Examine for amber bead | — |
| **Amber Bead** | Examine silk cord (hand) | Contains miniature portrait of Eleanor — "E.B. 1847-1859" | — |
| **Letter Opener** | From chaise lounge cushions | Pry window latch (quiet, 15 noise) | Cannot pick parlor door lock |
| **Magnifying Lens** | Behind Eleanor's portrait | Read crystal ball etchings (moon, star, sun, moon) | Combine with candle snuffer to read mirror |
| **Eleanor's Diary** | Inside grandfather clock | Reveals candle order (rose→lily→violet→rose), Eleanor's name | Sets `read_ritual_steps` flag |
| **Spiritualist's Manual** | Take from bookshelf (after examining) | Reveals cabinet code (7481), mirror trick, fraud mechanisms | Sets `knows_fraud` and `knows_cabinet_code` |
| **Candle Snuffer** | From fireplace mantle | Reaching tool | Combine with magnifying lens |
| **Phosphorescent Powder** | Behind Eleanor's portrait | Reveal hidden text on spirit board / crystal ball | Sets `knows_fraud` |
| **Iron Key** | From spirit wheel puzzle (cabinet) | Unlock parlor door | — |
| **Clock Gear** | Inside grandfather clock | Combine with bellows handle to repair bellows | — |
| **Smelling Salts** | From fireplace mantle | Overwhelm someone at close range | — |
| **Bellows Handle** | Table pedestal hidden panel | Combine with clock gear to repair bellows | — |
| **Rigged Bellows** | Combine bellows handle + clock gear | Attach in cabinet to pump cold air through table vents (convinces Lenore) | — |
| **Fireplace Poker** | From fireplace | Clear fireplace grate for chimney escape | Force window latch (loud, 30 noise), force cabinet doors (35 noise) |

---

## Combinations

| Items Combined | Result | Consumes? | Noise | Effect |
|---------------|--------|-----------|-------|--------|
| Bellows Handle + Clock Gear | Rigged Bellows | Yes | 8 | Repaired bellows device that pumps cold air through hidden floor tubes |
| Magnifying Lens + Candle Snuffer | Magnifying Lens (kept) | No | 3 | Reveals writing on cabinet mirror: "Turn me to see beyond the veil" (requires `cabinet_closeup` view) |
| Phosphor Powder + Crystal Ball | Phosphor Powder (kept) | No | 2 | Reveals hidden etchings: moon, star, sun, moon symbols (spirit wheel solution) |

---

## Puzzles

### Cabinet Lock (Combination Lock)
- **View**: `cabinet_closeup`
- **Type**: 4-dial combination lock (0-9 each)
- **Solution**: `7-4-8-1` (Eleanor's birth year 1847 reversed)
- **Clue Sources**: The Spiritualist's Manual margin note ("Cabinet combination is Eleanor's birth year reversed — 7481"), plus Eleanor's portrait plaque ("1847-1859")
- **On Solve**: Opens cabinet doors, reveals interior
- **On Fail**: 3 noise per wrong attempt
- **Alternative**: Force open with fireplace poker (35 noise)

### Candle Sequence (Sequence Puzzle)
- **View**: `seance_table_closeup`
- **Type**: Light candles in correct order
- **Steps**: 5 candles available (rose, lily, violet, white, black)
- **Solution**: Rose → Lily → Violet → Rose (4-step sequence)
- **Clue Source**: Eleanor's diary — "The spirits talk when the candles are lit in the right order — rose, then lily, then violet, then rose again"
- **On Solve**: Sets `candles_lit_correctly` flag, visual flicker effect
- **On Fail**: Resets; 5 noise per wrong candle
- **Noise per interaction**: 2

### Spirit Wheel (Dial)
- **View**: `cabinet_closeup`
- **Type**: Rotary dial with 6 symbol positions
- **Positions**: Moon, Star, Sun, Skull, Eye, Hand
- **Initial Position**: Skull
- **Solution**: Moon
- **Clue Source**: Crystal ball etchings (moon, star, sun, moon — first symbol), grandfather clock face (moon symbol at 12)
- **On Solve**: Reveals hidden bellows mounting bracket
- **On Fail**: 2 noise per wrong position

---

## Phases

### Phase 1: Preparation
- **Trigger**: Game start (immediate)
- **Opening text**: You wake bound to the chair, candles guttering, chanting from below
- **Killer behavior**: Relaxed — 90-second check interval, 65 noise threshold
- **Player state**: Hands bound, limited to séance table interactions

### Phase 2: The Ritual
- **Trigger**: Free your hands (`hands_free` = true)
- **Opening text**: The parlor opens up for exploration. Lenore's chanting intensifies
- **Killer behavior**: Alert — 55-second check interval, 50 investigate threshold, 25 curious threshold
- **Player state**: Full mobility, can interact with all room objects

### Phase 3: The Desperate Hour
- **Trigger**: Lenore finds evidence of tampering (`lenore_evidence_seen` = true)
- **Opening text**: Lenore realizes you've been moving about, begins accelerating the ritual
- **Visual**: Red pulse overlay
- **Killer behavior**: Aggressive — 30-second check interval, 30 investigate threshold, 15 curious threshold, 0.7 thoroughness
- **Player state**: Same mobility, but much less time between killer visits

---

## Events

| Event | Trigger | One-Shot? | Effects |
|-------|---------|-----------|---------|
| **Chanting Intensifies** | 120 seconds elapsed | Yes | Lenore's voice grows louder and more emotional. Atmospheric tension. |
| **Candles Flicker** | 200 seconds elapsed | Yes | All candles flicker simultaneously, temperature drops. Visual flicker cue. |
| **Spirit Board Moves** | 300 seconds + hands free | Yes | The planchette moves on its own, spelling "HELP ME." No one is pulling the wires. Sets shake visual cue. |
| **Midnight Warning** | 480 seconds elapsed | Yes | The grandfather clock begins chiming toward midnight. Dim visual cue, clock sound. |
| **Lenore's Prayer Distraction** | `ritual_performed` + `bellows_attached` both true | Yes | Lenore feels "Eleanor's" cold touch (the bellows) and believes her daughter has arrived. Breaks into sobbing prayer. Sets `lenore_distracted` for 120 seconds. |

---

## Win Conditions (5 Escape Routes)

### 1. Door Escape — Through the Parlor Door
- **Requirements**: Iron key + Lenore distracted
- **Steps**: Find iron key (spirit wheel puzzle → hidden compartment), unlock door, distract Lenore (gas lamp trap or ritual), slip downstairs
- **Difficulty**: Medium — requires key and distraction

### 2. Window Escape — Down the Drainpipe
- **Requirements**: Window open (unlatched + opened)
- **Steps**: Pry latch with letter opener (15 noise) or poker (30 noise), open pane, climb down drainpipe
- **Difficulty**: Easy-Medium — no distraction needed but noise risk; Lenore may relatch if she visits

### 3. Chimney Escape — Up the Chimney
- **Requirements**: Flue open + grate cleared
- **Steps**: Open flue lever, clear grate with fireplace poker, climb chimney
- **Difficulty**: Medium — moderate noise (25 for clearing + 30 for climbing)

### 4. Passage Escape — Secret Corridor Behind the Mirror
- **Requirements**: Mirror turned + Lenore distracted
- **Steps**: Open cabinet (combination or force), learn to turn mirror (manual or spirit board message), turn mirror 90° CCW, distract Lenore, escape through passage
- **Difficulty**: Hard — requires knowledge gate (must learn about mirror from manual or spirit board hidden message)

### 5. Trapdoor Escape — Through the Floor
- **Requirements**: Trapdoor opened + Lenore distracted
- **Steps**: Move Persian rug, open trapdoor, distract Lenore, descend through medium's corridor
- **Difficulty**: Medium — but rug is very noisy (18) and Lenore resets it if she visits

---

## Lose Conditions

1. **Caught by Lenore** — Lenore finds you during a search and brings you back to the table for the ritual
2. **Midnight Timer** — If 600 seconds elapse and your hands are still bound, the ritual completes. "The twelfth chime tolls. Lenore stands over you, hands raised. 'Eleanor, come home.' The candles blaze. Something cold passes through you. The world goes dark."

---

## Hints System

| Priority | Hint | Condition |
|----------|------|-----------|
| 1 | The silk binding is a stage knot — try pulling at it | Hands still bound |
| 2 | One bookshelf spine looks more practical than the rest | Hands free, manual not found |
| 2 | The grandfather clock has more inside than just a pendulum | Hands free, clock secret not found |
| 3 | Eleanor's birth year + the manual give the cabinet code | Cabinet closed, manual found |
| 3 | A heavy tool could force the cabinet — at the cost of noise | Cabinet closed, code unknown |
| 3 | The bay window latch is rusted. A thin sharp tool or brute force could work | Window latched, hands free |
| 4 | The spirit board's hidden message and manual mention turning the mirror | Cabinet open, mirror not moved |
| 4 | The chimney could be climbed if the flue were open and grate cleared | Hands free, chimney not reachable |
| 5 | Several escapes need Lenore distracted. Rig the gas lamp, or use the séance mechanisms | Hands free, Lenore not distracted |
| 5 | Eleanor's diary has the candle order. Crystal ball shows the wheel symbol. Bellows for cold touch. Together, simulate Eleanor's spirit | Diary read, Lenore not satisfied |

---

## Solution Paths

### Path 1: The Medium's Trick (Medium Difficulty)
*Use Lenore's own fraud mechanisms to distract her, then escape through the secret passage.*

1. Free yourself from the silk binding (hand on silk_binding — it's a stage knot)
2. Examine the bookshelf, take The Medium's Art manual
3. Read the manual — reveals cabinet code (7481) and mirror trick
4. Enter cabinet code on the combination lock puzzle
5. Explore the cabinet interior — discover the fraud mechanisms
6. Turn the cabinet mirror 90° counter-clockwise — reveals the secret passage
7. Rig the gas lamp as a blinding flare trap
8. Wait for Lenore's next visit — she triggers the gas lamp and is blinded for 45 seconds
9. While blinded, escape through the passage behind the mirror

**Noise Profile**: Moderate — the gas lamp rig is quiet (3), but the overall path involves multiple interactions

### Path 2: Eleanor's Farewell (Hard Difficulty)
*Perform a convincing séance that makes Lenore believe Eleanor's spirit has arrived.*

1. Free yourself from the silk binding
2. Open the grandfather clock — find Eleanor's diary and clock gear
3. Read the diary — learn the candle order (rose, lily, violet, rose) and Eleanor's name
4. Find the bellows handle in the table pedestal's hidden panel
5. Combine bellows handle + clock gear = rigged bellows device
6. Open the spirit cabinet (code 7481 from manual, or force with poker)
7. Attach the rigged bellows to the cabinet's floor mount
8. Light candles in the correct order using the sequence puzzle
9. Speak Eleanor's name over the spirit board (requires candles lit + knows daughter's name)
10. The combined effects (cold air from bellows + correct ritual) trigger the prayer distraction
11. Lenore believes Eleanor has arrived and enters a 120-second prayer trance
12. Escape via any route — door, window, passage, trapdoor, or chimney

**Noise Profile**: Quiet — the most elegant solution, but requires the most puzzle-solving

### Path 3: Breaking Free (Easy Difficulty)
*Brute force — grab a tool, break something, and get out fast.*

1. Free yourself from the silk binding
2. Take the fireplace poker
3. **Either**: Force the bay window latch with the poker (30 noise), open the window, climb down the drainpipe
4. **Or**: Open the flue, clear the grate with the poker (25 noise), climb the chimney
5. Speed is everything — the high noise brings Lenore fast

**Noise Profile**: Loud — simple but risky. No distraction needed for window or chimney escapes, but the noise will trigger killer investigation quickly

---

## Design Patterns Used

| # | Pattern | How It's Applied |
|---|---------|-----------------|
| 1 | Gateway Puzzle | The silk binding — must free hands before anything else |
| 2 | Dependency Chain | Manual → cabinet code → cabinet open → mirror → passage |
| 3 | Fork | Three main solution paths diverge after freeing hands |
| 4 | Progressive Reveal | Each discovery reveals more of Lenore's fraud: magnet tracks, bellows, wires |
| 5 | False Summit | Unlocking the door feels like victory — but Lenore is right downstairs |
| 6 | Dual-Purpose Item | Fireplace poker: clears grate, forces window, forces cabinet |
| 7 | Nested Secret | Clock hides diary → diary reveals candle order → candle order enables ritual |
| 8 | Knowledge Gate | Must learn about mirror from manual or spirit board before turning it |
| 9 | Revelation Tool | Magnifying lens reveals crystal ball etchings; phosphor powder reveals spirit board text |
| 10 | Cross-Reference Deduction | Portrait plaque (1847) + manual ("birth year reversed") = code 7481 |
| 11 | Noise Tradeoff | Poker opens more things but at extreme noise cost vs. letter opener (quiet) |
| 12 | Evidence Gamble | Opening the cabinet or moving the rug creates evidence Lenore detects |
| 13 | Distraction Window | Gas lamp trap gives 45s window; ritual gives 120s window |
| 14 | Ticking Clock Decision | 600-second midnight timer if still bound; midnight warning at 480s |
| 15 | Bait and Punish | Rigging the gas lamp is quiet — but the payoff is explosive when Lenore arrives |
| 17 | Trap Setting | Gas lamp rig: crank gas, pinch burner → next person to turn it up gets blinded |
| 18 | Red Herring | Smelling salts seem useful but have no puzzle function |
| 19 | Emergent Combination | Bellows handle + clock gear = rigged bellows (cross-room components) |
| 20 | Multi-Path Solution | 5 different escape routes with different requirements and difficulty |
| 22 | Myst Machine | The spirit cabinet's wire/pulley system connecting to the table — an intricate mechanism |
| 25 | Moral Fork | Performing the ritual gives Lenore false peace (she thinks Eleanor is back) — escape via compassion or deception |
| 27 | Point of No Return | Moving the rug triggers desperate phase; can't undo evidence |
| 28 | Camouflage | Trapdoor hidden under rug; diary hidden in clock; tools hidden behind portrait |
| 30 | Decay Clock | 600-second total timer; phases escalate killer behavior over time |

---

## Image Generation Prompts

Copy-paste these prompts into **Google Gemini (free tier)** to generate background images. The target art style is **1990s Sierra On-Line adventure games** — specifically **King's Quest V** and **King's Quest VI** — hand-painted, lush, richly detailed backgrounds with painterly textures, atmospheric lighting, and a sense of depth. Generate at 1920x1080 when resolution options are available. Generate 3-4 variations and pick the most atmospheric one. If results look too modern or photorealistic, append: `"painterly style, hand-painted, 1990s adventure game aesthetic"`.

**Style consistency keywords** (include in every prompt for this scenario): `Victorian gothic, séance parlor, candlelight and deep shadow, burgundy and mahogany, occult atmosphere, London townhouse 1860s`

### `backgrounds/parlor_main.png`
> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Victorian séance parlor on the second floor of a London townhouse. Burgundy damask wallpaper. Heavy oak door with ironwork skull motif, locked. Large bay window with heavy drapes overlooking a moonlit garden two stories below. Marble fireplace with cold ashes. Tall mahogany spirit cabinet with carved vine doors. Floor-to-ceiling bookshelf crammed with occult texts. Heavy burgundy curtain concealing an alcove. Grandfather clock reading quarter to midnight. Fainting chaise with faded red upholstery. Brass gas lamp on wall. Persian rug covering most of the floor. Central round table draped in black velvet with séance implements. Warm candlelight against deep shadow, atmosphere of lavender and age. Victorian gothic, occult, mysterious. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

### `backgrounds/seance_table_closeup.png`
> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Close-up of a round Victorian séance table. Black velvet surface with perfectly arranged implements: a wooden spirit board with alphabet arc and numbers and YES/NO/GOODBYE markings, a heart-shaped wooden planchette, a five-armed brass candelabra with colored candles in rose pink, lily white, violet purple, plain white, and black. A large cloudy crystal ball on a brass stand. Silk binding cords visible at the near edge. Beneath the table, an ornate carved pedestal with serpentine motifs. Warm candlelight reflecting off polished wood and brass. Victorian gothic, mystical, intimate. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

### `backgrounds/cabinet_closeup.png`
> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Interior of a mahogany Victorian spirit cabinet with doors thrown open. Upper shelf: séance props including a tambourine, a speaking trumpet, a slate, and a music box. Lower shelf: bellows mechanism missing its handle, coils of wire, box of magnets. Center: a large oval mirror in a brass frame mounted on a pivot. Hidden panel visible at the base. Wires and pulleys connecting to concealed tracks. Through the turned mirror, a dark narrow passage is barely visible. The cabinet is a Victorian fraud workshop, every surface hiding a mechanism. Warm amber lighting, mysterious. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

---

## Schema Notes

- **Views**: 3 views (main, seance_table_closeup, cabinet_closeup) keeping the 1-3 room target
- **Puzzle Widgets**: Uses `puzzle_widgets` (not `puzzle_objects`) — combination_lock, sequence_puzzle, and dial types
- **Condition System**: Uses `view_is` for cabinet-only interactions, `any_of`/`all_of` for compound conditions
- **Killer On-Visit Effects**: Three effects — window relatch, rug replacement (advances phase), and gas lamp trap trigger
- **Flag Initialization**: All 29 flags initialized in the `flags` block
- **Interaction Ordering**: Most specific conditions listed first in each interaction array
