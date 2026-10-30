# The Dollmaker's Workshop — Scenario Documentation

## Story Synopsis

You awaken in the basement workshop of Madame Voss — an elderly dollmaker who creates eerily lifelike porcelain replicas of real people. You're tied to a chair in her workshop, surrounded by shelves of dolls with painted-on stares. At your size — barely a third the height of a human — the dolls are nearly life-sized, their glassy eyes level with yours. The workbench towers above like a fortress wall, and Voss's sculpting tools look like siege weapons. Somewhere above, she hums a lullaby while preparing materials for her next creation: you.

Madame Voss isn't violent by nature. She's gentle, patient, maternal — and completely insane. She believes she's giving her subjects immortality through her art. Her dolls are so realistic because she uses real people as models, holding them captive while she sculpts, then... well, the workshop has a coal furnace, and some of the dolls have a warmth to their porcelain that seems unnatural.

The basement is layered with secrets: a chemical cabinet full of dangerous supplies, a dumbwaiter shaft to the kitchen above, a sub-basement where another captive languishes, and a furnace that serves multiple purposes. The workshop is both prison and puzzle box — Voss has lived here for decades, and every surface hides something.

**Difficulty**: Hard | **Estimated Time**: 15 minutes | **Patterns Used**: 30 (all)

> **Note**: The antagonist mechanic (Madame Voss) is optional. This scenario works as a pure point-and-click adventure if the antagonist AI is disabled in the scenario configuration.

---

## Image Descriptions & Generation Prompts

### How to Use These Prompts

Each entry below includes the filename and a ready-to-paste prompt for **Google Gemini (free tier)**. Tips for best results:
- Use Gemini's image generation (Imagen 3 via Gemini)
- Specify "game background art" and "16:9 aspect ratio" in every prompt
- Request "no text, no UI elements, no characters" to keep backgrounds clean
- If a result is too bright or friendly, add "dark atmosphere, muted colors, unsettling"
- Generate at **1920x1080** or the closest available resolution
- **Style note for this scenario**: For visual cohesion, all prompts include gothic horror Victorian dollmaker basement styling — warm dim lighting, porcelain dolls, oil-stained wood and stone

---

### Background Images (5 views)

**1. `backgrounds/workshop_main.png`** — A dimly lit basement workshop, roughly 20x30 feet. Stone walls, low ceiling with exposed beams. Dominating features: shelves of porcelain dolls along one wall (dozens, all sizes, eerily realistic faces), a heavy workbench in the center, a coal furnace in one corner (iron, Victorian-era, with visible controls), a chemical cabinet (glass-fronted, locked, bottles of colored liquids), two doors (one chained cellar door leading out, one inner locked door behind it), a boarded window high on one wall, a dumbwaiter shaft (wooden, pulley-operated) in the far wall. Scattered: glass eyes in jars, armature wire, paint pots, fabric scraps. A sewing machine on a side table. A pipe with a valve near the ceiling. A fuse box on the wall. Your chair with torn binding ropes on the floor. Lighting: a single swinging bulb, warm but weak.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Dimly lit basement workshop roughly 20x30 feet. Stone walls, low ceiling with exposed wooden beams. Shelves of eerily realistic porcelain dolls along one wall, dozens of them in all sizes with painted-on stares. A heavy wooden workbench in the center. A Victorian cast iron coal furnace in one corner with visible controls. A glass-fronted locked chemical cabinet with colored liquid bottles. A chained cellar door and a locked inner door behind it. A boarded-up window high on the wall. A wooden pulley-operated dumbwaiter shaft in the far wall. Scattered glass eyes in jars, armature wire, paint pots, fabric scraps. A sewing machine on a side table. A pipe with valve near the ceiling. A fuse box on the wall. A chair with torn binding ropes on the floor. Single swinging warm bulb overhead. Gothic horror, Victorian dollmaker basement, creepy atmosphere. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**2. `backgrounds/workbench_closeup.png`** — Close-up of the central workbench. Surface covered in: Voss's leather-bound journal (thick, dog-eared), a small handheld mirror with a cracked glass, coils of armature wire, a stained cloth rag, a half-full paint bucket of white primer, scattered porcelain fragments, tiny paintbrushes, and sculpting tools. The journal is the centerpiece — it contains entries about Voss's "creations" and, critically, the combination code for the chemical cabinet hidden in her meticulous notes. Behind the bench: more doll parts, glass eyes, a few family photographs yellowed with age.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Close-up of a heavy wooden workbench in a Victorian dollmaker's workshop. Surface covered with: a thick leather-bound journal with dog-eared pages, a small handheld mirror with cracked glass, coils of armature wire, a stained cloth rag, a half-full bucket of white primer paint, scattered porcelain fragments, tiny paintbrushes, and sculpting tools. Behind the bench: doll parts, glass eyes, yellowed family photographs. The bench is oil-stained and well-used. Warm dim lighting from a single overhead bulb. Gothic horror, Victorian craftsman aesthetic, creepy. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**3. `backgrounds/furnace_closeup.png`** — Close-up of the coal furnace area. The furnace is cast iron, Victorian industrial design, with a loading door, ash grate, and temperature controls (sequence of levers). Next to it: a coal bin (full of black chunks), and in the floor near the furnace base, a metal grate leading to a sub-basement (you can see darkness below, hear scratching). The furnace controls are a sequence puzzle — the correct startup sequence vents heat safely, wrong sequence creates dangerous fumes. Pipes lead from the furnace up through the ceiling. The stone floor around the furnace is warm, stained with ash and something darker.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Close-up of a Victorian cast iron coal furnace in a basement workshop. The furnace has a loading door, ash grate, and a sequence of control levers. Next to it: a coal bin full of black chunks. In the floor near the furnace base, a metal grate leading to darkness below. Pipes lead from the furnace up through the ceiling. The stone floor around the furnace is warm, stained with ash and something darker. Orange glow from furnace embers, otherwise dim. Gothic horror, industrial Victorian, ominous. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**4. `backgrounds/doll_shelf_closeup.png`** — Close-up of the doll shelves. Rows of porcelain dolls, each in a different pose and outfit. Most are standard (creepy but mass-produced looking). One stands out — "The Different Doll" — slightly larger, positioned centrally, with a small keyhole in its back. A music box sits next to it (ornate, brass, with a sequence of colored buttons). Under UV light, one of the dolls has numbers painted in invisible ink. The shelves are old wood, dusty except where Voss cleans around her favorites. Some dolls have cracked faces. One has its eyes scratched out.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Close-up of shelves of porcelain dolls in a Victorian workshop. Rows of eerily realistic dolls in different poses and outfits. Most are standard but creepy with painted-on stares. One doll in the center is slightly larger and more prominent with a small keyhole visible in its back. An ornate brass music box with colored buttons sits next to it. Old dusty wooden shelves. Some dolls have cracked faces, one has its eyes scratched out. Warm dim lighting from below casting unsettling shadows on the doll faces. Gothic horror, deeply unsettling, Victorian. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**5. `backgrounds/dumbwaiter_closeup.png`** — Close-up of the dumbwaiter shaft. A wooden platform on ropes and pulleys, designed to carry food/supplies between floors. The platform is old, rickety — it couldn't hold a person's weight without reinforcement. The shaft goes up into darkness (kitchen above). Scratches on the shaft wall — previous captives tried to climb. A rope pulley mechanism. The wooden walls of the shaft are thin; you can hear Voss's humming more clearly here. The platform can be reinforced with rope from the music box puzzle.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Close-up of an old wooden dumbwaiter shaft inside a Victorian basement. A rickety wooden platform on ropes and pulleys. The shaft goes up into darkness toward the kitchen above. Scratch marks on the wooden shaft walls from previous escape attempts. A rope pulley mechanism. The thin wooden walls of the shaft. Dim lighting from below, darkness above. Gothic horror, claustrophobic, Victorian domestic architecture. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

---

## Game Flow

### Phase 1: Trapped
You start tied to a chair. Voss checks every 70 seconds with high noise tolerance (75). She's calm, nurturing, singing while she works above.

**Immediate actions**:
1. **Hand the binding ropes** — struggle free (noise: 15, Gateway Puzzle)
2. **Take glass eyes** from the jar — first item, multiple uses
3. **Explore the workbench** — find journal, mirror, wire, rag

### Phase 2: Free
Voss's interval drops to 45s, threshold to 50. She's noticed you're quieter than expected.

**Three major puzzle chains run in parallel**:

**Chain A — The Cellar Door** (acid + keypad):
- Read journal → get cabinet combination (3-8-1)
- Open chemical cabinet → get UV flashlight, acid, lacquer thinner
- Use UV on walls → find hidden number (19)
- Use UV on special doll → find number (41)
- Examine mirror → find number (42)
- Cross-reference all clues → deduce keypad code (4219)
- Use acid on cellar door chain → dissolve it
- PULL the door (not push — Rule Subversion, learned from ally)
- Enter keypad code → escape through inner door

**Chain B — The Dumbwaiter** (music box + rope):
- Solve music box sequence → get rope coil + cylinder
- Find doll key from shelf (disarm bell trap first — Bait and Punish)
- Look at dumbwaiter scratches with mirror (Perspective Alignment)
- Reinforce platform with rope
- Ride up to kitchen → escape

**Chain C — The Savior** (free the sub-basement captive):
- Open pipe valve (Echo — water flows to furnace area grate)
- Loosen furnace grate with water
- Build trust with captive below through talk interactions
- Use rope on grate → free them (Moral Fork — uses the rope, blocking dumbwaiter path)
- Must use cellar door path afterward

### Phase 3: Hunted
Triggered by bell trap, chemical reaction, or evidence. Voss becomes frantic, check interval 20s, threshold 20.

---

## Items & Dynamics

| Item | How Obtained | Primary Use | Notes |
|------|-------------|-------------|-------|
| **Glass Eyes** | Jar on shelf | Throw for distraction noise | Gateway item |
| **Bent Wire** | Workbench armature | Pick simple locks, disarm traps | Multi-purpose tool |
| **Journal Page** | Voss's journal | Cabinet combo 3-8-1 | Knowledge Gate |
| **Small Mirror** | Workbench | Perspective Alignment (numbers), check around corners | Dual-Purpose |
| **UV Flashlight** | Chemical cabinet | Reveal invisible writing on walls + dolls | Revelation Tool |
| **Hydrochloric Acid** | Chemical cabinet | Dissolve cellar door chain | Dangerous, high noise |
| **Lacquer Thinner** | Chemical cabinet | Combine with rag for sedative | Chemical puzzle |
| **Cloth Rag** | Workbench | Combine with thinner → chloroform rag | Pass to ally |
| **Chloroform Rag** | Combination: thinner + rag | Sedate Voss (Emergent Combination) | Powerful but risky |
| **Doll Key** | Shelf (trapped with bell) | Open special doll → get scroll | Bait and Punish |
| **Rolled Paper** | Inside special doll | Contains partial code | Nested Secret |
| **Rope Coil** | Music box puzzle reward | Reinforce dumbwaiter OR free captive | Moral Fork |
| **Lockpick Set** | Key cabinet drawer | Open complex locks | Alternative to acid |
| **Coal Chunk** | Coal bin | Fuel furnace, throw for noise | Environmental tool |
| **Music Box Cylinder** | Music box puzzle | Insert in music box to complete sequence | Puzzle key |
| **Working Fuse** | Fuse box area | Power systems | — |
| **Paint Bucket** | Workbench | Set as trap (Voss slips) | Trap Setting |

### Key Dynamics

- **Revelation Tool (UV Flashlight)**: The most powerful item. Once obtained, re-examine EVERYTHING — walls have hidden messages from previous captives, dolls have numbers in invisible ink, the workbench has hidden notes. This transforms the entire room.
- **Cross-Reference Deduction**: The keypad code (4219) isn't written anywhere. The player must mentally combine: UV wall number (19), UV doll number (41), mirror number (42), and journal date context to deduce it. The player's brain is the puzzle.
- **Rule Subversion**: The cellar door PULLS open, not pushes. Every instinct says push. The ally through the furnace grate tells you this if you build trust. Without this knowledge, you waste time pushing.
- **Bait and Punish**: The shiny key on the shelf is rigged with a bell. Taking it without disarming the trap alerts Voss immediately. Using bent wire to disable the bell first avoids the trap.
- **Echo Pattern**: Opening the pipe valve makes water flow through the furnace area, loosening the floor grate to the sub-basement. Action in one area produces effects in another.

---

## Puzzle Breakdown

### 1. Binding Ropes (Gateway)
- Hand the ropes → struggle free
- Noise: 15, but no prerequisites
- Teaches: interactions have noise costs

### 2. Chemical Cabinet (Combination Lock — 3-8-1)
- Journal contains the code hidden in dated entries
- Puzzle widget: 3-dial combination lock
- Reward: UV flashlight, acid, lacquer thinner
- Close cabinet after (Camouflage) to hide evidence from Voss

### 3. UV Revelation Chain
- UV on walls → number 19
- UV on special doll → number 41
- Mirror examination → number 42
- Cross-reference → keypad code 4219

### 4. Cellar Door Escape
- Use acid on chain (noise: 15, Point of No Return — acid is consumed)
- Hand door → learn it doesn't push (fail message: "It doesn't budge")
- Talk to ally → learn to PULL (Rule Subversion)
- Pull door → reveals inner door with keypad
- Enter 4219 → escape

### 5. Bell Trap Key (Bait and Punish)
- Shiny key on shelf looks easy to grab
- Taking it triggers bell alarm → instant Phase 3 (Hunted)
- Using bent wire first disarms the trap
- Reward: ornate key that opens the special doll

### 6. Music Box Sequence
- Special doll opens with key → reveals music box sequence
- Sequence puzzle widget: play notes in correct order (learned from Voss's lullaby)
- Reward: rope coil + music box cylinder

### 7. Furnace Sequence (Myst Machine)
- Furnace startup requires correct lever sequence
- Wrong sequence: dangerous fumes (noise + damage)
- Correct sequence: furnace provides heat, opens furnace-area access
- Knowledge Gate: sequence learned from examining furnace controls carefully

### 8. Dumbwaiter Reinforcement
- Platform is too weak alone
- Use rope coil → reinforce
- Use mirror on scratches → Perspective Alignment reveals safe path
- Ride up → escape to kitchen

---

## Pattern Usage

| # | Pattern | How It's Used |
|---|---------|---------------|
| 1 | **Gateway Puzzle** | Binding ropes — struggle free, no items needed |
| 2 | **Dependency Chain** | Journal → cabinet code → UV light → wall numbers → keypad code (5 steps) |
| 3 | **The Fork** | Cellar door path and dumbwaiter path are independent chains |
| 4 | **Progressive Reveal** | UV flashlight reveals hidden content throughout the entire room |
| 5 | **False Summit** | Cellar door opens → reveals SECOND locked door behind it |
| 6 | **Dual-Purpose Item** | Mirror: check corners AND reveals a hidden number |
| 7 | **Nested Secret** | Shelf key → doll → paper → music box → rope (4 layers) |
| 8 | **Knowledge Gate** | Lullaby pattern gates music box sequence; journal gates cabinet code |
| 9 | **Revelation Tool** | UV flashlight reveals invisible writing everywhere |
| 10 | **Cross-Reference Deduction** | Keypad code requires combining 3 separate number sources |
| 11 | **Noise Tradeoff** | Acid on chain (loud, instant) vs. lockpick (quiet, slower) |
| 12 | **Evidence Gamble** | Open cabinet is visible evidence for Voss |
| 13 | **Distraction Window** | Glass eyes thrown to distract; furnace ignition draws attention |
| 14 | **Ticking Clock Decision** | When Voss is distracted, two time-sensitive things compete |
| 15 | **Bait and Punish** | Bell-trapped key on shelf — obvious grab triggers alarm |
| 16 | **Sound Masking** | Sewing machine or furnace noise covers actions |
| 17 | **Trap Setting** | Paint bucket spill makes Voss slip |
| 18 | **Red Herring** | Some chemicals seem useful but aren't; pushing the cellar door |
| 19 | **Emergent Combination** | Lacquer thinner + rag = improvised sedative |
| 20 | **Multi-Path Solution** | 3 distinct escape paths |
| 21 | **Rule Subversion** | Door pulls instead of pushes — breaking the expected rule |
| 22 | **Myst Machine** | Furnace startup sequence — multi-step environmental puzzle |
| 23 | **Power Routing** | Fuse routing — limited fuses for multiple systems |
| 24 | **Perspective Alignment** | Mirror reveals pattern in dumbwaiter scratches |
| 25 | **Moral Fork** | Free the sub-basement captive (uses rope) or escape alone |
| 26 | **Accomplice** | Sub-basement captive — trade items through grate, share knowledge |
| 27 | **Point of No Return** | Using acid on the chain — it's consumed, committed to door path |
| 28 | **Camouflage** | Close cabinet after raiding to hide evidence |
| 29 | **Echo** | Pipe valve → water → loosened grate (action in one area affects another) |
| 30 | **Decay Clock** | Voss relocks things on visits; restocks shelves; adds restraints |

---

## Killer Profile: Madame Voss

**Background**: Elderly dollmaker, possibly 70+. Has run this workshop for decades. Her dolls are sold at high-end collectors' markets. The basement is her private studio where she creates her "special" pieces — the ones modeled on real, captive people. She genuinely believes she's granting immortality through art.

**Personality**: Gentle, maternal, softly-spoken. Hums lullabies constantly. Calls her victims "little ones" and "dear." The horror comes from the disconnect between her kindness and her actions.

**Base Behavior**:
- Phase 1: Check every 70s, threshold 75 (relaxed, trusting)
- Phase 2: Check every 45s, threshold 50 (concerned, watchful)
- Phase 3: Check every 20s, threshold 20 (frantic, desperate)
- Thoroughness: 0.3 → 0.6 with evidence

**Dialogue Samples**:
- Approach: "Hush now, little one. Madame Voss is here." / "Just a quick peek at my newest subject."
- Search: "Come out, dear. The glaze won't set itself." / "You mustn't run. The kiln is almost ready."
- Evidence: "Oh my... someone's been touching my things." / "The cabinet was closed when I left. Wasn't it?"
- Catch: "There you are, little one. Let's get you back in the chair. We have so much work to do together."

