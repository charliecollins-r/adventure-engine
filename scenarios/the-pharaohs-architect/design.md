# The Pharaoh's Architect — Scenario Documentation

## Story Synopsis

You awaken in the antechamber of a sealed Egyptian tomb — not a pharaoh's burial site, but the secret workshop of his architect. You were exploring the ruins when a hidden mechanism sealed you inside. The air is stale, sealed for millennia, and dust motes drift in faint light filtering from cracks above.

You're small — a goblin-sized creature barely a third the height of the humans who built this place. The tomb's architecture is monumental, built for beings much larger than you: doorways tower overhead, sarcophagi are cliffs to climb, and hieroglyphs that would be at ankle-height for a human are at your eye level. Your size lets you squeeze into ventilation shafts, crawl beneath mechanisms, and spot details in the stonework that a larger explorer would step right over.

Your captor isn't human — it's Khepri, an ancient mechanical guardian. A bronze scarab automaton the size of a large dog, running on clockwork gears and counterweight mechanisms, it has patrolled these corridors for over three thousand years. Its purpose: protect the architect's secrets from tomb robbers. It cannot be reasoned with, bribed, or intimidated. It follows its programming with relentless precision.

The tomb is vast — 24 interconnected chambers spanning an antechamber, hall of pillars, scarab chamber, weighing room, burial chamber, workshop, water channels, an observatory, a treasury, and the exit corridor. Five cartouche seals are scattered throughout, and placing them all in the exit door is the primary escape route. But the architect built emergency exits for himself — shortcuts and backdoors that a clever explorer might discover.

**Difficulty**: Hard | **Estimated Time**: 25 minutes | **Patterns Used**: 30 (all) | **Flagship scenario** — 24 views, 134 objects, 30 items, 7 combinations

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
- **Style consistency keywords** for this scenario: `ancient Egyptian tomb interior, warm torchlight and golden hues, carved stone walls with hieroglyphs, sand and dust, archaeological adventure, dark atmospheric`
- For 24 views, maintain consistent stone texture and lighting across all chambers
- Closeup views: take the main room prompt and add "Extreme closeup detail view of [specific element], filling the frame, highly detailed texture"

---

### Background Images (24 views)

This is the flagship scenario with 24 distinct views organized into interconnected chambers.

**1. `backgrounds/antechamber.png`** — The entry chamber. Cracked stone walls covered in faded hieroglyphs. A sealed stone door to the north, torch sconces (unlit), scattered clay shards on the floor, and the collapsed entrance behind you. Faint light from ceiling cracks. A pedestal with a scarab motif. The architect's mark — a compass and square symbol — is carved above the north door.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. The entry chamber of an ancient Egyptian tomb. Cracked stone walls covered in faded hieroglyphs. A sealed stone door to the north with a compass and square symbol carved above it. Unlit torch sconces on the walls. Scattered clay shards on the floor. A collapsed entrance behind the viewer. Faint light filtering from ceiling cracks illuminating dust motes. A stone pedestal with a scarab beetle motif. Ancient, weathered, millennia-old. Warm golden and amber tones from the faint light. Archaeological adventure atmosphere. No text, no UI, no characters.`

**2. `backgrounds/hall_of_pillars.png`** — A grand hall with massive stone columns covered in inscriptions. Each pillar tells part of the tomb's story. Sand drifts across the floor. Passages lead to the scarab chamber and weighing room. Oil lamps on the walls (unlit). A stone door with cartouche slots.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. A grand hall inside an Egyptian tomb with massive stone columns covered in carved inscriptions. Sand drifts across the floor between the pillars. Passages visible leading to other chambers. Unlit oil lamps on the walls. A stone door with cartouche-shaped slots carved into it. The columns are monumental, each telling part of a story through their carvings. Warm amber light filtering from above. Ancient, grand, mysterious. Archaeological adventure. No text, no UI, no characters.`

**3. `backgrounds/scarab_chamber.png`** — A circular room dominated by a mosaic floor depicting a giant scarab beetle. The mosaic tiles are interactive — pressing them in sequence reveals hidden compartments. A floor mechanism with visible bronze gears. Alcoves in the walls hold offerings.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. A circular room in an Egyptian tomb dominated by an elaborate mosaic floor depicting a giant scarab beetle in colorful tiles of blue, gold, and green. The mosaic tiles are slightly raised, looking interactive. A floor mechanism with visible bronze gears is partially exposed. Alcoves in the curved walls hold ancient offerings: small statues, dried flowers, ceramic jars. Stone walls with carved beetle motifs. Warm torchlight ambiance. Ancient Egyptian, mysterious, intricate. No text, no UI, no characters.`

**4. `backgrounds/weighing_room.png`** — The Hall of Judgment recreation. A large balance scale dominates the center, with the Feather of Ma'at on one side. Wall paintings depict the weighing of hearts ceremony. A stone bench with ritual items. Passages to the burial chamber.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. The Hall of Judgment recreation inside an Egyptian tomb. A large ornate balance scale dominates the center, with a white feather on one side. Wall paintings depict the ancient Egyptian weighing of hearts ceremony with Anubis and other deities. A stone bench with ritual items. Passages lead to other chambers. The scale is made of bronze and wood, ancient but functional. Gold and lapis lazuli accents. Warm torchlight. Solemn, sacred, archaeological. No text, no UI, no characters.`

**5. `backgrounds/burial_chamber.png`** — The architect's burial chamber (not the pharaoh's). A stone sarcophagus in the center, treasure alcoves along the walls, a death mask on the sarcophagus lid. Hieroglyphic prayers cover every surface. Gold and lapis lazuli inlays catch the light.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. An Egyptian architect's burial chamber. A stone sarcophagus in the center with a golden death mask on its lid. Treasure alcoves along the walls containing golden objects and lapis lazuli items. Hieroglyphic prayers cover every surface of the walls and ceiling. Gold and blue inlays catch warm torchlight. The chamber is intimate and sacred, richly decorated. Ancient Egyptian burial art style. Warm golden lighting. Archaeological adventure. No text, no UI, no characters.`

**6. `backgrounds/workshop.png`** — The architect's secret workspace. Drafting tools, blueprints on papyrus pinned to walls, a workbench with compass and chisel, copper wire spools, a forge for small metalwork. This is where the architect designed the tomb's mechanisms. Blueprints reveal the tomb's hidden passages.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. An ancient Egyptian architect's secret workshop inside a tomb. Drafting tools on a stone workbench: a compass, chisel, and measuring instruments. Papyrus blueprints pinned to the walls showing tomb cross-sections and mechanical designs. Copper wire spools on shelves. A small forge for metalwork in the corner. The room reveals the architect's genius through his tools and plans. Functional, cluttered with purposeful work. Warm amber lighting. Ancient Egyptian craftsmanship. No text, no UI, no characters.`

**7. `backgrounds/water_channel.png`** — An underground irrigation system. Stone channels carry water (or did millennia ago). A brass valve mechanism, sluice gates, and an irrigation mechanism with interlocking gears. The water channel connects to the observatory through ancient plumbing.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. An underground irrigation system inside an Egyptian tomb. Stone channels carved into the floor, some with traces of ancient water staining. A brass valve mechanism with a wheel handle. Sluice gates made of bronze. An irrigation mechanism with interlocking gears visible in the wall. The channels connect to passages leading to other chambers. Damp stone surfaces. Cool blue-green tones mixed with warm amber from distant torchlight. Ancient engineering, functional, mysterious. No text, no UI, no characters.`

**8. `backgrounds/observatory.png`** — A chamber with a ceiling shaft open to the sky. Star charts painted on the dome ceiling. A lens apparatus on a stone pedestal that can focus light. Astronomical instruments. The ceiling shaft provides the only natural light in the tomb.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. A chamber inside an Egyptian tomb with a ceiling shaft open to the night sky showing stars. Star charts painted on the domed ceiling with constellations mapped in gold paint on dark blue. A crystal lens apparatus on a stone pedestal that can focus light. Ancient astronomical instruments on a table. The ceiling shaft provides dramatic natural starlight that creates a beam through the room. Ancient Egyptian astronomy meets architectural genius. Blue and gold tones. Mystical, scientific, beautiful. No text, no UI, no characters.`

**9. `backgrounds/treasury.png`** — A vault filled with gold, jewels, and ceremonial objects. A locked treasure chest, piles of gold coins, ivory wands, and ushabti figures. The wealth is staggering but mostly decorative — the real treasures are the tools and knowledge hidden among the glitter.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. A treasure vault inside an Egyptian tomb. A locked ornate treasure chest in the center. Piles of gold coins and golden objects. Ivory wands and ushabti figurines on shelves. Jeweled ceremonial objects. The wealth is staggering and glitters in warm torchlight. Gold, lapis lazuli, turquoise, and ivory everywhere. A sense of overwhelming richness. Some items are clearly more functional than decorative if you look closely. Warm golden lighting reflecting off treasure. Ancient Egyptian grandeur. No text, no UI, no characters.`

**10. `backgrounds/exit_corridor.png`** — A long corridor leading to the final door. Five cartouche-shaped slots are carved into the door — each must hold the correct seal to open it. An emergency release mechanism is hidden behind one of the slots. The corridor narrows as it approaches the exit, creating claustrophobia.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. A long narrow corridor inside an Egyptian tomb leading to a massive final door. Five cartouche-shaped slots are carved into the door face, each empty and waiting for a seal. The corridor narrows as it approaches the exit, creating claustrophobia. Stone walls with hieroglyphic warnings. Dim torchlight from behind the viewer, the door barely illuminated. The door is massive, ancient, sealed for millennia. Ominous, climactic, ancient Egyptian. No text, no UI, no characters.`

### Closeup Views

For the 14 additional closeup views (hieroglyphs, pillar inscriptions, scarab mosaic, floor mechanism, scales, sarcophagus, treasure alcove, workbench, blueprint wall, irrigation mechanism, star chart, lens apparatus, treasure chest, final door), use this template:

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. Extreme closeup detail view of [ELEMENT NAME] inside an ancient Egyptian tomb. [SPECIFIC DETAILS FROM THE MAIN VIEW DESCRIPTION]. Filling the frame, highly detailed texture and surface. Warm torchlight ambiance matching the wider chamber. Ancient, weathered, millennia-old stone and metal. No text, no UI, no characters.`

Replace `[ELEMENT NAME]` and `[SPECIFIC DETAILS]` with the relevant content from the main view descriptions above.

---

## Game Flow

### Phase 1: Awakening
You start in the antechamber. Khepri patrols at long intervals (75 seconds) with high noise tolerance (70). The guardian is distant, performing its ancient routine.

**Immediate goal**: Explore the antechamber and find a way deeper into the tomb.
1. **Examine clay shards** — piece together the architect's journal fragments
2. **Study hieroglyphs** — learn about the five cartouche seals
3. **Find the copper chisel** — first tool, enables new interactions
4. **Open the north door** — progress to the hall of pillars

### Phase 2: Exploration
Khepri's interval drops to 50s, threshold to 50. The tomb opens up into interconnected chambers. Multiple puzzle chains run in parallel.

**Key discovery chains**:

**The Five Seals**: Cartouche seals are hidden throughout the tomb — in the scarab chamber mosaic, the weighing room scales, the burial chamber sarcophagus, the workshop blueprints, and the treasury chest. Each requires solving a local puzzle to obtain.

**The Workshop Route**: Finding the architect's workshop reveals blueprints showing emergency exits and the tomb's mechanical secrets. The compass and chisel combine into a precision tool for fine stonework.

**The Observatory Route**: The star chart and lens apparatus can redirect light to reveal hidden passages and activate ancient mechanisms.

**Combination Crafting**: Seven item combinations create specialized tools:
- Oil Flask + Linen Strip = Oil-Soaked Fuse (for burning through obstacles)
- Bronze Gear + Sand = Sabotaged Gear (jam Khepri's mechanisms)
- Copper Wire + Bronze Gear = Tripwire Trap (delay the guardian)
- Natron Pouch + Oil Flask = Corrosive Paste (dissolve bronze fittings)
- Crystal Lens + Bronze Mirror = Light Redirector (focus beams)
- Reed Pen + Papyrus Scroll = Forged Decree (bluff the guardian)
- Architect's Compass + Copper Chisel = Precision Tool (fine carving)

### Phase 3: Guardian Alert
Triggered by evidence discovery or direct encounter. Khepri's interval drops to 30s, threshold to 30. The automaton becomes actively hunting.

### Phase 4: Final Trial
Triggered when approaching the exit corridor. The final puzzles must be solved under maximum pressure. Khepri's interval drops to 20s.

---

## Items & Dynamics

| Item | How Obtained | Primary Use |
|------|-------------|-------------|
| **Clay Shard** | Antechamber floor | Contains partial combination code |
| **Copper Chisel** | Antechamber tools | Carve stone, combine with compass |
| **Linen Strip** | Burial wrappings | Combine with oil for fuse |
| **Bronze Gear** | Floor mechanism | Multiple combinations |
| **Architect's Papyrus** | Workshop | Combine with pen for decree |
| **Crystal Lens** | Observatory | Combine with mirror for redirector |
| **Golden Scarab Amulet** | Scarab chamber | Key to certain passages |
| **Feather of Ma'at** | Weighing room | Balance the scales puzzle |
| **Heart Scarab** | Sarcophagus | Weighing room puzzle component |
| **Architect's Compass** | Workshop bench | Combine with chisel |
| **Reed Pen** | Workshop | Combine with papyrus |
| **Sacred Oil Flask** | Temple alcove | Multiple combinations |
| **Bronze Mirror** | Burial chamber | Combine with lens |
| **5 Cartouche Seals** | Various chambers | Place in exit door |
| **Copper Wire** | Workshop | Combine with gear for tripwire |
| **Fine Sand** | Floor deposits | Combine with gear to sabotage |
| **Golden Ushabti** | Treasury | Ceremonial, trade value |
| **Ivory Wand** | Treasury | Ritual interactions |
| **Natron Pouch** | Burial supplies | Combine with oil for paste |
| **7 Crafted Items** | Combinations | Specialized tools (see above) |

### Key Dynamics

- **Mechanical Guardian**: Khepri cannot be killed or permanently stopped — only delayed, tricked, or avoided. The sabotaged gear and tripwire trap slow it; the forged decree confuses its recognition systems briefly.
- **Five-Seal Collection**: The primary win condition requires finding all 5 cartouche seals scattered across the tomb. Each is behind its own puzzle.
- **Architect's Emergency Exit**: A hidden release behind the third cartouche slot — the architect's personal escape route. Requires the precision tool to access.
- **Light Mechanics**: The observatory's lens apparatus and the light redirector can illuminate hidden passages and activate light-sensitive mechanisms throughout the tomb.
- **Water Channel System**: The irrigation mechanism connects distant chambers and can flood or drain areas to reveal hidden content.

---

## Puzzle Breakdown

### 1. Antechamber Escape (Gateway)
- Examine clay shards for initial knowledge
- Find copper chisel
- Use chisel on north door mechanism
- Result: Access to hall of pillars

### 2. Scarab Mosaic Sequence
- Puzzle widget: sequence puzzle on the mosaic floor
- Press tiles in correct order (learned from hieroglyph study)
- Reward: Cartouche Seal 1 + access to floor mechanism

### 3. Weighing Room Scales
- Place heart scarab and feather of Ma'at on the scales
- Balance must be exact (Knowledge Gate — learn weights from inscriptions)
- Reward: Cartouche Seal 2

### 4. Star Alignment Dial
- Puzzle widget: dial mechanism in the observatory
- Align stars to match the ceiling chart
- Reward: Activates lens apparatus, reveals hidden passage

### 5. Water Valve Toggle Panel
- Puzzle widget: toggle panel controlling irrigation
- Route water to specific channels (linked toggles — Myst Machine pattern)
- Reward: Reveals submerged cartouche seal, drains flooded passages

### 6. Treasury Chest Keypad
- Puzzle widget: combination lock on the treasure chest
- Code derived from cross-referencing clay shard numbers with hieroglyph dates
- Reward: Cartouche Seal 4 + golden ushabti

### 7. Exit Door Combination
- Puzzle widget: the final door requires either all 5 seals or the emergency code
- Code from clay shard (alternative win condition)
- Five-seal placement is the primary solution

---

## Pattern Usage

| # | Pattern | How It's Used |
|---|---------|---------------|
| 1 | **Gateway Puzzle** | Antechamber — chisel on north door, no complex prerequisites |
| 2 | **Dependency Chain** | Hieroglyphs → mosaic sequence → seal → exit door (multi-step) |
| 3 | **The Fork** | Five-seal path, architect's escape, and combination bypass are independent |
| 4 | **Progressive Reveal** | Each chamber opened reveals more of the architect's story |
| 5 | **False Summit** | Placing 4 seals — realize you need the 5th from the treasury |
| 6 | **Dual-Purpose Item** | Clay shard: historical fragment AND combination code |
| 7 | **Nested Secret** | Sarcophagus → death mask → hidden compartment → heart scarab |
| 8 | **Knowledge Gate** | Hieroglyph translations gate mosaic sequence and scale weights |
| 9 | **Revelation Tool** | Light redirector reveals hidden inscriptions and passages |
| 10 | **Cross-Reference Deduction** | Treasury code from combining clay shard dates with hieroglyphs |
| 11 | **Noise Tradeoff** | Chisel stone (loud, fast) vs. carefully work mechanism (quiet, slow) |
| 12 | **Evidence Gamble** | Opened sarcophagus is obvious evidence for Khepri |
| 13 | **Distraction Window** | Oil-soaked fuse ignition draws Khepri to investigate |
| 14 | **Ticking Clock Decision** | When Khepri investigates fuse, multiple time-sensitive options |
| 15 | **Bait and Punish** | Obvious gold pile in treasury triggers Khepri proximity alert |
| 16 | **Sound Masking** | Water channel flow covers actions in nearby chambers |
| 17 | **Trap Setting** | Tripwire trap delays Khepri's patrol route |
| 18 | **Red Herring** | Decorative treasures seem important but aren't needed for escape |
| 19 | **Emergent Combination** | 7 item combinations creating specialized tools |
| 20 | **Multi-Path Solution** | 3 distinct win conditions with different requirements |
| 21 | **Rule Subversion** | Forged decree — using the tomb's own authority against its guardian |
| 22 | **Myst Machine** | Water valve toggle panel — linked environmental controls |
| 23 | **Power Routing** | Water channel routing — limited flow, choose which areas to activate |
| 24 | **Perspective Alignment** | Star chart alignment reveals hidden passages from specific angles |
| 25 | **Moral Fork** | Take the golden ushabti (greed, alerts Khepri) or leave it |
| 26 | **Accomplice** | The architect's spirit in inscriptions — guidance from the dead |
| 27 | **Point of No Return** | Entering the exit corridor — Khepri blocks retreat |
| 28 | **Camouflage** | Replace sarcophagus lid after searching; reset mechanisms |
| 29 | **Echo** | Water channel activation affects distant chambers |
| 30 | **Decay Clock** | Khepri resets mechanisms and removes items on patrol |

---

## Killer Profile: Khepri

**Background**: A bronze scarab automaton designed by the architect himself to guard his tomb for eternity. Running on clockwork gears and counterweight mechanisms, Khepri has patrolled these corridors for over three thousand years. It cannot be reasoned with, bribed, or intimidated — it follows its programming with absolute precision.

**Personality**: Mechanical, relentless, alien. Khepri doesn't speak — it clicks, whirs, and scrapes. Its "intelligence" is purely mechanical pattern-matching. It investigates disturbances, recognizes displaced objects, and returns things to their original positions.

**Base Behavior**:
- Phase 1 (Awakening): Check every 75s, threshold 70
- Phase 2 (Exploration): Check every 50s, threshold 50
- Phase 3 (Guardian Alert): Check every 30s, threshold 30
- Phase 4 (Final Trial): Check every 20s, threshold 20
- Thoroughness: 0.3 → 0.7 with evidence

**Dialogue Samples**:
- Approach: *CLICK-CLICK-WHIRR. Bronze legs scrape against stone. The guardian is near.*
- Search: *The scarab's antennae sweep the air, detecting vibrations. Gears grind as it turns methodically.*
- Evidence: *Khepri's eye-lenses focus on the disturbed area. Internal mechanisms accelerate. CLICK-CLICK-CLICK.*
- Catch: *The automaton's mandibles lock around your ankle. Bronze is cold and unyielding. You are dragged back to the antechamber.*

**On-Visit Effects**:
- Replaces displaced items to original positions
- Resets activated mechanisms
- Seals opened passages if evidence is found

---

## Solution Paths

### Path 1: The Five Seals (Primary — 12+ steps)
Collect all five cartouche seals from across the tomb and place them in the exit door. Requires exploring most chambers and solving multiple puzzles.

### Path 2: The Architect's Escape (8 steps)
Discover the architect's emergency release behind the third cartouche slot. Requires the precision tool (compass + chisel combination) and knowledge from the workshop blueprints.

### Path 3: Combination Bypass (6 steps)
Enter the combination code from the clay shard on the exit door's hidden lock. Requires cross-referencing the shard with hieroglyph dates. The fastest path if you can deduce the code.

