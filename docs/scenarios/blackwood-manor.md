# Blackwood Manor — Scenario Documentation

## Overview

**The flagship mega-scenario.** A 10-hour adventure spanning a massive Victorian estate with 50+ rooms across five acts. Items discovered in the first hour become critical in the final act. Multi-layered combination chains, deep cross-referencing puzzles, red herrings that punish carelessness, and multiple endings based on moral choices made throughout.

**Difficulty**: Expert | **Estimated Time**: 8-12 hours | **Patterns Used**: 30 (all, many used multiple times)

> **Note**: The antagonist mechanic (Mrs. Whitmore) is optional. This scenario works as a pure point-and-click adventure if the antagonist AI is disabled in the scenario configuration — the puzzle box of Blackwood Manor stands on its own.

---

## Story Synopsis

**England, 1893.** You are Evelyn Cross — an investigative journalist of unusual cunning but diminutive stature. Standing barely a third the height of a grown human, you navigate a world built for beings three times your size. Doorknobs are at shoulder height, bookshelves tower like cliff faces, and a dining table might as well be a stage. Three weeks ago, you received a letter — unsigned, on heavy cream stock with a black wax seal — inviting you to Blackwood Manor to "uncover the truth about Lord Edmund Blackwood's disappearance."

Lord Blackwood was a Victorian polymath: industrialist, inventor, occultist, collector. Twenty years ago, he vanished from his estate during a storm. No body was found. His fortune was never claimed. The estate has been maintained since by a skeleton staff led by **Mrs. Agnes Whitmore**, the head housekeeper — a woman of terrifying competence who has kept the house in pristine condition for two decades, "awaiting the master's return."

You arrived at dusk. The front doors closed behind you with a mechanical click. Mrs. Whitmore appeared from the shadows: *"Ah. The journalist. Lord Blackwood left instructions for guests. You're to solve the house, dear. Every room is a test. Prove yourself worthy, and the doors will open. Fail... and I'm afraid you'll be staying. Permanently."*

The house is a puzzle box. Blackwood designed it that way — a brilliant paranoid's final masterpiece. Five wings, three floors, a basement, grounds, and something hidden beneath it all. Each wing was built around a theme of Blackwood's obsessions: knowledge, art, nature, industry, and the occult.

And somewhere in the walls, through hidden passages and peepholes, Mrs. Whitmore watches. She doesn't chase you — she *manages* you. She relocks doors, confiscates exposed tools, adjusts the house's mechanisms, and if she catches you somewhere you shouldn't be, she escorts you back to the foyer and resets your progress in that wing. She is patient, methodical, and absolutely tireless.

The deeper you go, the more you realize: Blackwood didn't disappear. He descended. And what he found down there changed him.

---

## Estate Map

```
                        ┌─────────────────────┐
                        │    OBSERVATORY       │  Floor 3
                        │    (Tower)           │
                        └──────────┬──────────┘
                                   │
┌──────────────┐  ┌────────────────┤────────────────┐  ┌──────────────┐
│  EAST WING   │  │                │                │  │  WEST WING   │
│              │  │  UPPER LANDING │                │  │              │  Floor 2
│  Library     │──│  Gallery       │  Music Room    │──│  Master Suite│
│  Study       │  │  Guest Rooms   │  Sitting Room  │  │  Guest Room  │
│  Lab         │  │                │                │  │  Nursery     │
└──────┬───────┘  └────────┬───────┴────────┬───────┘  └──────┬───────┘
       │                   │                │                  │
┌──────┴───────┐  ┌────────┴────────────────┴───────┐  ┌──────┴───────┐
│  EAST WING   │  │         GRAND HALL              │  │  WEST WING   │
│              │  │                                  │  │              │  Floor 1
│  Library     │──│  Foyer    Dining    Parlor      │──│  Conserv.    │
│  (ground)    │  │  Hallway  Room      Room        │  │  Kitchen     │
└──────────────┘  └────────────┬────────────────────┘  └──────────────┘
                               │
                  ┌────────────┴────────────────────┐
                  │         BASEMENT                 │  Below
                  │  Wine Cellar  │  Workshop        │
                  │  Furnace Room │  Store Room      │
                  │  Servant Qtrs │  Coal Chute      │
                  └───────────────┼──────────────────┘
                                  │
                  ┌───────────────┴──────────────────┐
                  │      HIDDEN WING (Sub-Basement)  │  Deep Below
                  │  Antechamber │ Ritual Chamber    │
                  │  Blackwood's │ The Machine       │
                  │  Study       │ Escape Tunnel     │
                  └─────────────────────────────────┘
```

---

## Image Descriptions & Generation Prompts

### How to Use These Prompts

Each entry below includes the filename and a ready-to-paste prompt for **Google Gemini (free tier)**. Tips for best results:
- Use Gemini's image generation (Imagen 3 via Gemini)
- Specify "game background art" and "16:9 aspect ratio" in every prompt
- Request "no text, no UI elements, no characters" to keep backgrounds clean
- If a result is too bright or friendly, add "dark atmosphere, muted colors, unsettling"
- Generate at **1920x1080** or the closest available resolution
- **Style consistency for this scenario**: Victorian Gothic, 1893 England, candlelight and gaslight, dark wood paneling, heavy furniture, shadows, ornate but oppressive architecture

---

### Act 1: The Grand Hall

**1. `backgrounds/act1_grand_foyer.png`** — The grand foyer of a Victorian manor house. A sweeping marble floor with a black-and-white checkerboard pattern. A grand staircase with a carved oak banister ascending to a locked iron gate at the landing. A crystal chandelier hanging from a high ceiling. A coat rack, an umbrella stand, a console table with a brass bell and a guest book. A grandfather clock against one wall. Heavy oak doors (the front entrance) behind. The room is dimly lit by gaslight fixtures and the chandelier's faint glow. Everything is immaculately maintained but oppressively silent.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Grand foyer of a Victorian Gothic manor house, 1893 England. Sweeping black-and-white checkerboard marble floor. A grand oak staircase with carved banister ascending to an iron gate at the landing. A crystal chandelier hanging from a high ornate ceiling. A console table with a brass bell, a coat rack, an umbrella stand. A grandfather clock against the wall. Heavy oak front doors behind. Gaslight wall fixtures casting warm pools of light amid deep shadows. Dark wood paneling, ornate moldings, oppressively silent grandeur. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**2. `backgrounds/act1_dining_room.png`** — A formal Victorian dining room. A long mahogany table set for one — candelabra with dripping candles, china place setting, crystal wine glass. A china cabinet (glass-fronted, locked) against one wall. A sideboard with crystal decanters of port and brandy. A dumbwaiter shaft in the corner. Above the fireplace: a large oil portrait of a stern Victorian gentleman (Lord Blackwood). The fireplace is cold. Heavy velvet curtains frame tall windows showing darkness outside.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Formal Victorian dining room in a Gothic manor, 1893. Long mahogany dining table set for one person with candelabra, fine china, crystal wine glass. A locked glass-fronted china cabinet against one wall. A sideboard with crystal decanters. A dumbwaiter shaft visible in one corner. Above a cold stone fireplace: a large oil portrait of a stern Victorian gentleman. Heavy dark velvet curtains frame tall windows showing darkness outside. Candlelight and dim gaslight. Dark, formal, unsettling emptiness. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**3. `backgrounds/act1_parlor.png`** — A Victorian parlor. A cold fireplace with an ornate marble mantel. A bookshelf with leather-bound volumes. A writing desk with inkwell and blotter. A chess table with a game in progress — pieces frozen mid-play. A second grandfather clock (showing a different time from the foyer). A locked glass display case. A Persian rug. Gaslight sconces casting warm circles on dark wallpaper with a damask pattern.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Victorian parlor in a Gothic manor house, 1893. A cold ornate marble fireplace. A bookshelf of leather-bound volumes. A writing desk with inkwell and blotter. A chess table with a game frozen in progress. A grandfather clock against one wall. A locked glass display case. A Persian rug on dark hardwood floor. Gaslight wall sconces casting warm circles on dark damask wallpaper. Shadows gather in corners. Intimate, claustrophobic, every surface hides something. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**4. `backgrounds/act1_hallway.png`** — A long hallway connecting the main rooms. Dark oak paneling on the lower walls, portraits of the Blackwood family line above — stern faces spanning generations. A suit of armor standing guard beside a locked door. A hat rack. A barometer on the wall. Two locked doors at the far end (East Wing and West Wing). A single gaslight fixture provides dim illumination. The carpet runner is deep red, worn by decades of footsteps.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Long hallway in a Victorian Gothic manor, 1893. Dark oak paneled lower walls with family portraits in gilt frames above — stern Victorian faces spanning generations. A suit of armor standing guard beside a heavy locked door. A hat rack with a top hat. A barometer on the wall. Two imposing locked doors at the far end. A single gaslight fixture casting dim light. Deep red carpet runner worn by decades of footsteps. Shadows stretch between pools of light. Oppressive, watchful atmosphere. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

### Act 2: The East Wing — Knowledge

**5. `backgrounds/act2_library.png`** — A two-story library. Floor-to-ceiling bookshelves crammed with thousands of volumes. A rolling ladder on a brass rail. A reading alcove with a leather armchair and a lamp. A marble bust of Blackwood with one eye socket empty. A card catalog with dozens of drawers. A locked rare books case behind glass. A fireplace with cold ashes. The upper level is accessible via the rolling ladder, with more shelves and a telescope pointing out a window.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Grand two-story Victorian library in a Gothic manor, 1893. Floor-to-ceiling dark wood bookshelves crammed with leather-bound volumes on both levels. A brass rolling ladder on a rail. A reading alcove with a leather armchair and a green-shaded desk lamp. A marble bust on a pedestal with one eye socket conspicuously empty. A card catalog cabinet with dozens of small drawers. A locked glass rare books case. A cold fireplace with ashes. An upper gallery level with more books and a telescope at a window. Warm lamplight against deep shadows. Scholarly, mysterious, vast. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**6. `backgrounds/act2_study.png`** — Blackwood's private study. A massive oak desk dominates the room — drawers with brass pulls, a typewriter, stacks of correspondence. A wall of framed letters and documents. A safe concealed behind a painting. A phonograph on a side table (missing its needle). Blackwood's personal journal on the desk (locked with a small clasp). The room feels recently occupied despite twenty years of absence — Whitmore has maintained it perfectly.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Victorian gentleman's private study in a Gothic manor, 1893. A massive carved oak desk with brass drawer pulls, a typewriter, and stacks of correspondence. A wall of framed letters and documents. An oil painting on one wall (concealing a safe behind it). A phonograph on a side table. A locked leather journal on the desk. Bookshelves, ink bottles, a magnifying glass. The room is immaculately maintained despite decades of disuse. Gaslight and a desk lamp. Intellectual, obsessive, haunted by its absent owner. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**7. `backgrounds/act2_chemistry_lab.png`** — A Victorian chemistry laboratory converted from a sitting room. Wooden benches hold beakers, burners, bottles of reagents with handwritten labels. A distillation apparatus with coiled glass tubing. A deep porcelain sink. A locked iron chemical safe. A chalkboard on the wall with half-erased equations. A ventilation hood. The elegant wallpaper and ceiling moldings contrast sharply with the industrial equipment.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Victorian chemistry laboratory in a converted sitting room of a Gothic manor, 1893. Wooden benches holding glass beakers, Bunsen burners, and bottles of reagents with handwritten labels. A distillation apparatus with coiled glass tubing. A deep porcelain sink. A locked iron chemical safe. A chalkboard on the wall with half-erased chemical equations. A ventilation hood. Elegant Victorian wallpaper and ceiling moldings contrast with harsh scientific equipment. Cold analytical lighting from gas jets. Scientific, unsettling, secrets in every bottle. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**8. `backgrounds/act2_servants_stair.png`** — A narrow servants' back staircase. Dark, cramped, winding between floors. Bare plaster walls. A single gaslight at each landing. The stairs creak. A locked door at the bottom leads to the basement. A vent grate near the ceiling whispers with air currents. The servants' world — functional, hidden, connecting the elegant rooms above via unseen passages.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Narrow Victorian servants' back staircase in a Gothic manor, 1893. Dark cramped winding stairs between floors. Bare plaster walls, worn wooden steps. A single gaslight fixture at the landing casting a pool of warm light. A locked heavy door at the bottom of the stairs. A metal vent grate near the ceiling. Functional, hidden, the unseen passages connecting the elegant rooms above. Claustrophobic, dim, creaking atmosphere. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**9. `backgrounds/act2_east_corridor.png`** — The East Wing corridor. Connects the library, study, and laboratory. Dark oak doors on either side, each with brass nameplates. A gas lamp mounted on the wall. A vent grate near the ceiling. A locked door at the far end leads to the upper floor. The corridor is narrow and the ceiling feels low — this wing was designed for work, not entertaining.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. East Wing corridor in a Victorian Gothic manor, 1893. Dark oak doors on either side with brass nameplates. A gas lamp on the wall casting amber light. A metal vent grate near the ceiling. A locked door at the far end. Narrow corridor with lower ceilings than the grand hall, designed for work not entertaining. Dark wood paneling, patterned carpet runner. Functional, scholarly, slightly oppressive atmosphere. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

### Act 3: The West Wing — Art & Memory

**10. `backgrounds/act3_conservatory.png`** — A glass-walled Victorian conservatory. Exotic plants — some alive, many dead and brown. A dry stone fountain. An empty ornate birdcage. Stained glass panels in the upper windows depicting allegorical scenes. A stone bench. A locked garden door leads to the grounds. Sunlight would stream in by day, but at night the glass walls are dark mirrors. Iron framework holds the glass panes.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Victorian glass conservatory in a Gothic manor at night, 1893. Glass walls and ceiling in iron framework. Exotic potted plants, some alive and green, many dead and brown. A dry stone fountain in the center. An ornate empty birdcage. Stained glass panels in upper windows depicting allegorical scenes. A stone bench. A locked wooden garden door. At night the glass walls are dark mirrors reflecting the interior. Moonlight and interior gaslight create eerie reflections. Beautiful, melancholy, nature trapped in glass. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**11. `backgrounds/act3_kitchen.png`** — A massive Victorian industrial kitchen. An enormous cast-iron stove (cold). Hanging copper pots from ceiling racks. A large wooden worktable in the center. A pantry door (locked). A knife block (one knife conspicuously missing). A mortar and pestle. A spice rack with labeled jars. A cold box (early refrigerator). Stone floors, whitewashed walls. Everything clean and orderly — Whitmore's domain.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Massive Victorian industrial kitchen in a Gothic manor, 1893. An enormous cast-iron stove cold and dark. Copper pots hanging from ceiling racks. A large central wooden worktable. A locked pantry door. A knife block with one knife conspicuously missing. A mortar and pestle on a shelf. A spice rack with labeled jars. A primitive cold box. Stone floors, whitewashed walls, scrubbed clean. Everything immaculately orderly. Cold, functional, the housekeeper's domain. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**12. `backgrounds/act3_gallery.png`** — A long gallery room of paintings and sculptures. Oil paintings line both walls in gilt frames — portraits, landscapes, allegorical scenes. Marble sculptures on pedestals. One sculpture is a rotating figure that can be turned. A locked glass display case in the center contains miniature scale models of the estate's rooms. Brass plates identify each artwork with title and date. Gaslight illuminates the paintings in warm pools.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Long Victorian art gallery in a Gothic manor, 1893. Oil paintings in ornate gilt frames line both walls — portraits, landscapes, allegorical scenes. Marble sculptures on pedestals along the center. One rotating sculptural figure on a pedestal. A locked glass display case containing miniature scale models of rooms. Brass plates beneath each artwork. Gaslight wall fixtures casting warm pools on the paintings, deep shadows between. Polished hardwood floor. Grand, cultured, every artwork hides a clue. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**13. `backgrounds/act3_music_room.png`** — A Victorian music room. A grand piano dominates one corner. A harp near the window. A phonograph on a table (missing its needle). Sheet music scattered on stands. A pipe organ with pull-stops against the far wall. A metronome on the piano. The walls are padded with acoustic fabric in deep burgundy. A comfortable chair for listening.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Victorian music room in a Gothic manor, 1893. A grand piano dominating one corner. A harp near a tall window. A phonograph on a side table. Sheet music scattered on stands. A large pipe organ with ornate pull-stops against the far wall. A metronome on the piano. Walls padded with deep burgundy acoustic fabric. A comfortable listening chair. Musical instruments catch the gaslight. Elegant, resonant, frozen mid-performance. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**14. `backgrounds/act3_master_bedroom.png`** — Blackwood's private bedroom chamber. A large four-poster bed with heavy dark curtains. A vanity with an oval mirror, jewel box, and personal effects. A writing bureau. A wardrobe (locked). A fireplace with a carved mantle displaying photographs and mementos. Behind a Japanese folding screen: photography darkroom equipment — trays, tongs, hanging clips, chemicals (missing developer). The room is personal, intimate, preserved exactly as he left it.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Victorian master bedroom in a Gothic manor, 1893. A large four-poster bed with heavy dark velvet curtains. A vanity table with an oval mirror and personal effects. A writing bureau. A locked wardrobe. A carved marble fireplace mantle with framed photographs. Behind a Japanese folding screen in the corner: a makeshift photography darkroom with developing trays and hanging clips. The room is personal and intimate, preserved exactly as its owner left it twenty years ago. Gaslight and candlelight. Haunted, melancholy, obsessively maintained. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**15. `backgrounds/act3_nursery.png`** — A Victorian nursery, heartbreakingly preserved. A white crib with lace trim. Wooden toys on the floor — a rocking horse, building blocks, a toy soldier. A music box on a shelf. A bookshelf of children's books. On the wall: a growth chart with dates and heights, ending abruptly. Wallpaper with faded teddy bears. Everything is clean, dusted, maintained as if the child might return any moment. The saddest room in the house.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Victorian nursery in a Gothic manor, 1893, heartbreakingly preserved. A white wooden crib with lace trim. A rocking horse, wooden building blocks, a toy soldier on the floor. A music box on a shelf. A small bookshelf of colorful children's books. On the wall: a growth chart with penciled dates ending abruptly. Faded teddy bear wallpaper. Everything clean and dusted as if the child might return. Soft warm light from a night lamp. Deeply sad, tender, innocent room in a dark house. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

### Act 4: The Basement & Grounds — Industry & Nature

**16. `backgrounds/act4_wine_cellar.png`** — A stone wine cellar. Arched stone ceiling. Racks of dusty bottles stretching into shadow. A locked vintage cabinet at the far end. An old wooden cask on a stand. The floor has a drainage grate. The walls are damp stone, glistening. Cool, dark, the air smells of oak and time. A single bare bulb (electric — Blackwood was an early adopter) provides harsh light.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Victorian wine cellar beneath a Gothic manor, 1893. Arched stone ceiling and walls. Wooden racks of dusty wine bottles stretching into deep shadow. A locked vintage cabinet at the far end. An old wooden wine cask on a stand. A drainage grate in the stone floor. Damp glistening stone walls. A single early electric bulb provides harsh light contrasting with deep shadows. Cool, dark, ancient. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**17. `backgrounds/act4_workshop.png`** — Blackwood's engineering workshop. A metalworking bench with a vise. A small forge (cold) with a bellows. A lathe and a drill press. Casting molds for keys and gears. Bins of raw materials — brass, lead, iron, copper. A locked cabinet of precision tools. The room is utilitarian, industrial — this is where Blackwood built things. Soot marks on the ceiling above the forge.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Victorian engineering workshop in a manor basement, 1893. A metalworking bench with a heavy iron vise. A small forge with bellows, cold and dark. A lathe and drill press. Casting molds and a crucible on a workbench. Bins of raw metal: brass, lead, iron, copper. A locked tool cabinet. Industrial, utilitarian, soot marks on the ceiling above the forge. This is where a genius inventor built things. Bare stone walls, functional lighting. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**18. `backgrounds/act4_furnace_room.png`** — The estate's heating system. A massive coal furnace dominates the room, a hulking iron beast with pipes radiating in every direction. Gauges and valves on a control panel. Heavy soot covers everything. The air is thick and hard to breathe. A coal chute leads up and out to the grounds. Steam hisses from joints. The furnace is the heart of the house — and its pipes reach everywhere, including places that shouldn't exist.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Victorian furnace room in a manor basement, 1893. A massive cast-iron coal furnace dominates the room, a hulking industrial beast with pipes radiating in every direction to the ceiling and walls. Pressure gauges and brass valve wheels on a control panel. Heavy black soot covering every surface. Steam hissing from pipe joints. A coal chute leading upward. Amber light from the furnace grates. Oppressive heat, industrial, the thundering heart of the house. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**19. `backgrounds/act4_observatory.png`** — An observatory at the top of the manor's tower. Accessed via a hidden passage. A large brass telescope on a rotating mount. Star charts pinned to the walls. A sextant on a table. The domed roof can be opened mechanically via a crank. Through the telescope and windows: a panoramic view of the grounds below — greenhouse, well, carriage house, and garden paths visible in the moonlight.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Victorian observatory tower in a Gothic manor at night, 1893. A large brass telescope on a rotating mount in the center. Star charts and astronomical diagrams pinned to curved walls. A sextant and navigation instruments on a table. A domed roof partially open to a starry sky. Through tall windows: moonlit manor grounds visible below with gardens, paths, and outbuildings. Brass fixtures gleam in moonlight. Scholarly, lofty, a window to both sky and secrets below. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**20. `backgrounds/act4_greenhouse.png`** — A Victorian greenhouse on the manor grounds. Glass panes in an iron frame, fogged with humidity. Rows of exotic plants — tropical flowers, carnivorous specimens, a bioluminescent fungus glowing blue-green in a dark corner. A potting bench with tools. Watering cans. One plant labeled in careful handwriting: "Nightshade — handle with care." Moonlight filters through the glass above.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Victorian greenhouse on manor grounds at night, 1893. Glass panes in an iron frame, fogged with humidity. Rows of exotic tropical plants, flowers, and strange specimens. A bioluminescent fungus glowing blue-green in a dark corner. A potting bench with gardening tools. Watering cans. A handwritten label on one plant. Moonlight filtering through the glass roof above. Humid, lush, beautiful but hiding dangerous secrets. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**21. `backgrounds/act4_grounds.png`** — The manor grounds at night. Gravel paths winding between overgrown hedges. A stone sundial at a path junction. Moonlight casts long shadows. The greenhouse glows faintly in the distance. An old stone well with a bucket and rope is visible. The dark bulk of a carriage house stands to one side. The manor itself looms behind, windows glowing amber. A sense of exposure after hours of enclosed rooms.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Victorian manor grounds at night, 1893. Gravel paths winding between overgrown hedges. A stone sundial at a path junction. Full moonlight casting long dramatic shadows. A glass greenhouse glowing faintly in the distance. An old stone well with bucket and rope. A dark carriage house to one side. The Gothic manor itself looming behind with amber-lit windows. Open air after claustrophobic interiors, but exposed and vulnerable. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

### Act 5: The Hidden Wing — The Truth

**22. `backgrounds/act5_antechamber.png`** — A stone staircase descending into an underground antechamber. Gaslight fixtures on the rough-hewn walls still functional. The walls are covered in handwriting — equations, diagrams, obsessive notes scrawled directly onto the stone in ink and chalk. The ravings of a brilliant mind pushed past its limits. A heavy iron door ahead, its surface etched with symbols. The air is cold and smells of stone and machine oil.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Underground stone antechamber beneath a Victorian manor, 1893. A stone staircase descending into a rough-hewn underground space. Gaslight fixtures on the walls still burning. The stone walls are covered in handwritten equations, diagrams, and obsessive notes scrawled directly in ink and chalk — the ravings of a brilliant mind. A heavy iron door ahead etched with arcane symbols. Cold underground air. Descending into madness and revelation. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**23. `backgrounds/act5_ritual_chamber.png`** — A circular underground chamber with arcane symbols inlaid in the stone floor. A cold bronze brazier in the center. An altar with five precisely carved slots, each labeled in Latin. Candle sconces ring the walls. A crystal-locked door on the far wall, sealed with a luminous crystalline mechanism. The room feels ancient — older than the manor above. Blackwood didn't build this room. He found it.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Circular underground ritual chamber beneath a Victorian manor, 1893. Arcane symbols and geometric patterns inlaid in the stone floor. A cold bronze brazier in the center. A stone altar with five precisely carved slots. Candle sconces ringing the curved stone walls. A sealed door on the far wall locked with a luminous crystalline mechanism that glows faintly. The chamber feels ancient, predating the manor above it. Occult, ominous, the convergence of all paths. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**24. `backgrounds/act5_machine_room.png`** — The heart of Blackwood's obsession. A massive Victorian contraption of brass, copper, glass, and strange crystals fills the chamber. Steam pipes feed it from above. Electrical coils crackle with residual charge. Spinning governors and gear assemblies. Multiple control panels with dials, levers, and gauges. A central viewing port — a thick glass lens that looks into... somewhere else. The machine is inert but hums with potential. This is what twenty years of isolation built.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Massive Victorian machine in an underground chamber, 1893. An enormous contraption of brass, copper pipes, glass chambers, and strange glowing crystals filling the room. Steam pipes feeding in from the ceiling. Electrical coils crackling with residual energy. Spinning governors and intricate gear assemblies. Multiple control panels with brass dials, iron levers, and pressure gauges. A central viewing port with a thick glass lens. The machine is inert but hums with latent power. Steampunk, occult science, the magnum opus of a mad genius. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

**25. `backgrounds/act5_escape_tunnel.png`** — A rough stone tunnel leading away from the machine room. Timber supports at intervals. A rail track on the floor for a mining cart (long gone). The tunnel branches — one way leads to the carriage house (blocked by rubble unless cleared), the other to an exterior exit. Emergency gaslight fixtures line one wall. The tunnel is the way out — or a dead end, depending on your choices.

> **Gemini Prompt**: `Hand-painted game background art in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, 16:9 aspect ratio, 1920x1080. Rough stone escape tunnel beneath a Victorian manor, 1893. Timber support beams at intervals. A narrow rail track on the floor for a mining cart long gone. The tunnel branches ahead into darkness. Emergency gaslight fixtures along one wall providing dim amber light. Rubble partially blocking one passage. Stone walls hewn from bedrock. Claustrophobic, urgent, the final passage between imprisonment and freedom. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. Painterly style, lush detailed backgrounds, rich colors, atmospheric. No text, no UI, no characters.`

---

## Act Structure

### Act 1: The Grand Hall (Est. 1.5-2 hours)
**Phase**: `arrival` — Mrs. Whitmore checks every 90s, threshold 75. She's welcoming, even helpful. For now.

**Available rooms** (8 views + closeups):
- **Grand Foyer** — Entry point. Marble floor, grand staircase (locked gate at top), coat rack, umbrella stand, guest book, grandfather clock, chandelier, a letter on the console table
- **Foyer Closeup** — The console table: Blackwood's welcome letter, a brass bell, a small locked box, a feather quill with dried ink
- **Dining Room** — Long table set for one, candelabra, china cabinet (locked), sideboard with decanters, a dumbwaiter shaft, a painting of Blackwood over the fireplace
- **Dining Room Closeup** — The place setting: a dinner plate with an engraved message around the rim, cutlery (the butter knife is loose), a crystal wine glass, a napkin with embroidered initials
- **Parlor** — Fireplace (cold), bookshelf with select volumes, writing desk, chess set (mid-game position), a grandfather clock (different time than the foyer one), a locked display case
- **Parlor Closeup** — The chess set: the pieces' positions encode a message. The writing desk has a blotter with reversed text impressions
- **Hallway** — Connects foyer to dining/parlor. Portraits of the Blackwood family line. A suit of armor. A hat rack. A barometer. Doors to East Wing (locked) and West Wing (locked)
- **Hallway Closeup** — The family portraits: each has a nameplate with dates. One portrait has been slashed. Behind it: a wall safe

**Items found in Act 1** (critical later):
| Item | Where Found | Seems Like | Actually Needed For |
|------|-------------|-----------|-------------------|
| **Butter Knife** | Dining room cutlery | Useless eating utensil | Act 4: Pry open a panel in the workshop |
| **Candle Stub** | Candelabra (take one) | Light source | Act 3: Make a wax impression of a key. Act 5: Light the ritual chamber brazier |
| **Quill Pen** | Foyer console | Dried up, useless | Act 5: Combine with ink to forge Blackwood's signature |
| **Glass Eye** | Found behind slashed portrait | Creepy oddity | Act 2: Fits in a bust's empty socket in the library, opens secret compartment |
| **Dinner Plate** | Dining room | Just a plate | Examine: rim engraving is a cipher key used in Act 3 |
| **Chess Knight** | Take from the chess set | Game piece | Act 4: Weighted with lead — fits a specific balance mechanism in the workshop |
| **Brass Bell** | Foyer console | Summon Mrs. Whitmore (bad idea) | Act 5: Specific resonant frequency shatters a crystal lock in the ritual chamber |
| **Napkin** | Dining room | Cloth scrap | Act 2: Combine with chemical to make a filter cloth for the lab |
| **Clock Hand** | Grandfather clock (foyer — remove minute hand) | Thin metal rod | Act 3: Use as a record needle for the phonograph in the music room |
| **Barometer Glass** | Hallway barometer (cracked, remove the lens) | Curved glass | Act 4: Combine with candle to create a focused light for the darkroom |

**Puzzles in Act 1**:
1. **Gateway**: The locked box on the console. The welcome letter says "Your first test is before you." The box has a 4-letter word lock. Answer: "GUEST" (engraved on the dinner plate rim). Inside: a master hallway key.
2. **Wall Safe**: Behind the slashed portrait. 3-number combination. Derived from the two grandfather clocks — the difference in their times (foyer says 8:15, parlor says 11:42 — the combination is the differences: 3-2-7). Inside: East Wing key.
3. **China Cabinet**: The chess set position encodes which piece to move to checkmate. Moving the correct piece on the set triggers a click — the china cabinet unlocks. Inside: a crystal decanter of port wine (needed in Act 2 for a chemical reaction).
4. **Dumbwaiter**: Can be used to send items between floors. Taking the dumbwaiter rope would let you climb, but it's bolted. For now, note it exists — it becomes critical in Act 3.

**Act 1 Goal**: Get the East Wing key from the wall safe. This requires the clock puzzle (Knowledge Gate + Cross-Reference Deduction).

---

### Act 2: The East Wing — Knowledge (Est. 2-3 hours)
**Phase**: `exploring` — Whitmore checks every 60s, threshold 55. She's noticed you've progressed. Mildly impressed, mostly concerned.

**Available rooms** (10 views + closeups):
- **Library (Ground Floor)** — Two-story room. Thousands of books. Rolling ladder. A reading alcove. A bust of Blackwood (one eye missing). A card catalog. A locked rare books case. A fireplace with cold ashes
- **Library Closeup** — The card catalog: cross-referencing books reveals hidden patterns. The bust with the missing eye
- **Library (Upper Level)** — Accessed via rolling ladder. Rare books visible behind glass. A telescope pointing at the conservatory. A hidden compartment behind a specific book
- **Study** — Blackwood's private study. A massive desk with many drawers (mostly locked). A typewriter. A wall of correspondence. A safe behind a painting (different from hallway safe). A phonograph (no needle). Blackwood's personal journal (locked with a key)
- **Study Closeup** — The desk: a blotter with ink impressions, a drawer that's slightly ajar (contains a magnifying glass), a letter half-typed in the typewriter
- **Chemistry Laboratory** — Converted from a sitting room. Benches with beakers, burners, reagent bottles. A distillation apparatus. A sink. A locked chemical safe. A chalkboard with half-erased equations. A ventilation hood
- **Lab Closeup** — The reagent shelf: labeled bottles of various chemicals. The chalkboard equations. A set of pH test papers
- **Lab Supply Closet** — Small room off the lab. Rubber tubing, glass vessels, filter paper, a Bunsen burner, protective goggles, an apron with stains
- **Servants' Stair (East)** — Back staircase connecting floors. Narrow, dark. Leads up to the gallery level and down to the basement (basement door locked from the other side)
- **East Corridor** — Connects library, study, lab. Has a locked door to the upper floor. A gas lamp on the wall. A vent grate near the ceiling

**Items found in Act 2**:
| Item | Where Found | Immediate Use | Late-Game Use |
|------|-------------|-------------|---------------|
| **Magnifying Glass** | Study desk drawer | Read fine print, examine things closely | Act 4: Focus light beam in the greenhouse, Act 5: Read micro-text on the machine |
| **Torn Letter (3 pieces)** | Study (1), Library (1), Lab (1) | Reassemble to learn about Blackwood's final experiment | The reassembled letter contains coordinates for Act 5 |
| **Glass Eye** (placed) | From Act 1, placed in bust | Opens compartment: rare book key | — |
| **Rare Book** | Behind locked glass | Knowledge Gate: contains the chemical safe combination encoded in poetry | The book itself is needed in Act 5 ritual |
| **Hydrochloric Acid** | Chemical safe | Dissolve the lock on the West Wing door | — |
| **Litmus Papers** | Lab supply closet | Test chemical solutions | Act 4: Test the wine cellar bottles to find the correct vintage |
| **Rubber Tubing** | Lab supply closet | Siphon liquids | Act 4: Connect gas lines in the workshop |
| **Filter Cloth** | Combine: napkin + lab chemical | Filter impurities from solutions | Act 5: Filter the ritual mixture |
| **Developer Solution** | Created in lab from reagents | — | Act 3: Develop photographs in the darkroom (master bedroom) |
| **Goggles** | Lab supply closet | Protect eyes during chemistry | Act 4: See through smoke in the furnace room |
| **Blackwood's Journal Key** | Inside the rare book (Nested Secret — book → hollow pages → key) | Unlock journal | — |
| **Blackwood's Journal** | Study desk (unlocked with key) | Read: reveals his obsession, experiment details, hints about the hidden wing | Contains the forging reference for Act 5 |

**Puzzles in Act 2**:
1. **The Bust's Eye**: Place the glass eye from Act 1. The bust's head rotates to reveal a hidden compartment with the rare books case key.
2. **Card Catalog Cross-Reference**: Three catalog entries, when cross-referenced, reveal the book that contains the chemical safe combination. The book is a poetry volume — the combination is hidden in the first letter of each stanza (acrostic: 7-4-1-9).
3. **Chemical Safe** (combination_lock widget): 4-digit code 7419 from the acrostic.
4. **Torn Letter Reassembly**: Three fragments found in different rooms. Reassembling them (examining all three triggers a combination event) reveals that Blackwood was building a machine to "pierce the veil between worlds."
5. **Developer Solution Synthesis**: Combine specific reagents from the lab (Knowledge Gate — the chalkboard equations tell you: silver nitrate + port wine + heat = developer). This requires the crystal decanter from Act 1.
6. **West Wing Access**: The West Wing door is locked with a heavy chain. Use hydrochloric acid to dissolve it (Point of No Return — acid is consumed, high noise).

**Act 2 Goal**: Access the West Wing. Requires the acid from the chemical safe, which requires the combination from the rare book, which requires the key from the bust, which requires the glass eye from Act 1.

**Dependency chain**: Glass eye → bust → rare book key → rare book → acrostic → chemical safe → acid → West Wing door. **7 steps.**

---

### Act 3: The West Wing — Art & Memory (Est. 2-3 hours)
**Phase**: `committed` — Whitmore checks every 45s, threshold 40. She's impressed but wary. She starts actively relocking things and confiscating tools left in the open.

**Available rooms** (12 views + closeups):
- **Conservatory** — Glass-walled garden room. Exotic plants (some alive, most dead). A fountain (dry). A birdcage (empty). Stained glass windows depicting scenes. A stone bench. A locked garden door to the grounds
- **Conservatory Closeup** — The stained glass: each panel tells part of a story. One panel has a removable piece
- **Kitchen** — Industrial Victorian kitchen. A massive stove (cold), hanging copper pots, a pantry (locked), a knife block (one knife missing — Whitmore has it), a mortar and pestle, a spice rack, a cold box (early refrigerator)
- **Kitchen Closeup** — The spice rack: some bottles contain unusual substances. The mortar and pestle show residue of something ground recently
- **Upper Landing** — Connects to upper rooms. A suit of armor (different from hallway). A window overlooking the grounds. Locked doors to master suite, nursery, guest rooms. A painting that's slightly crooked
- **Gallery** — A long room of paintings and sculptures. Each artwork has a brass plate with title and date. One sculpture is a rotating figure on a pedestal (can be turned). A locked display case with miniature rooms (dollhouse-scale models of the estate's rooms)
- **Gallery Closeup** — The miniature rooms: exact scale models. One model room shows a detail not visible in the real room — a hidden compartment location
- **Music Room** — A grand piano, a harp, a phonograph (needs a needle), sheet music scattered about, an organ with pull-stops, a metronome. The walls are padded for acoustics
- **Music Room Closeup** — The sheet music: multiple pieces. One is annotated in Blackwood's hand with numbers above certain notes
- **Master Bedroom** — Blackwood's private chamber. A four-poster bed, a vanity with mirror, a writing bureau, a wardrobe (locked), a fireplace with a mantle. Behind a screen: a private darkroom (photography equipment, trays, chemicals missing developer)
- **Master Bedroom Closeup** — The vanity: a jewel box (locked), a hand mirror, a hairbrush with gray hairs, a letter from "E" (Blackwood's wife, long dead)
- **Nursery** — A child's room. A crib, toys, a rocking horse, a music box, a bookshelf of children's books. Everything preserved as if the child just left. On the wall: a growth chart with dates and heights. This room is deeply sad — Blackwood's child died young
- **Sitting Room (West)** — A ladies' sitting room. Embroidery frame (half-finished), a sewing basket, a writing desk with correspondence, a small bookshelf, a window seat

**Items found in Act 3**:
| Item | Where Found | Immediate Use | Late-Game Use |
|------|-------------|-------------|---------------|
| **Stained Glass Piece** | Conservatory window (removable panel) | Examine: depicts a key | Act 5: Combine with magnifying glass to project a pattern that opens the machine's panel |
| **Mortar & Pestle** | Kitchen | Grind substances | Act 5: Grind ritual components |
| **Wax Impression** | Make: press candle stub into the nursery music box key slot | Create a key template | Act 4: Cast a key in the workshop to open Blackwood's wardrobe |
| **Developed Photograph** | Darkroom: use developer solution on exposed plate found in master bedroom | Reveals hidden room behind the gallery | Also shows the machine's activation sequence |
| **Sheet Music (annotated)** | Music room | Numbers + notes = a frequency sequence | Act 5: The frequencies open the crystal lock when played on the brass bell |
| **Phonograph Recording** | Music room: use clock hand as needle on phonograph | Plays Blackwood's voice: a confession and instructions | Contains a spoken passphrase for the hidden wing door |
| **Jewel Box Contents** | Vanity jewel box (key from miniature room model) | A locket with a photograph, a ring, a small key | The ring fits a slot in the machine. The small key opens the coal chute |
| **Music Box Melody** | Nursery music box | Sad lullaby. The melody is the organ sequence | The melody played on the organ opens a passage behind the pipes |
| **Growth Chart** | Nursery wall (remove it) | Behind it: a child's drawing of "Papa's secret stairs" showing a hidden passage location | — |
| **Crooked Painting Key** | Behind the crooked painting on the upper landing | Opens the garden door in the conservatory | — |
| **Embroidery Pattern** | Sitting room embroidery frame | Examine: the pattern is a map of the estate grounds with an X marked | Reveals the well location where a critical key was hidden |
| **Miniature Room Key** | Inside the rotating gallery sculpture (turn it to the correct angle — Perspective Alignment) | Opens the display case with miniature rooms | — |

**Puzzles in Act 3**:
1. **Organ Sequence** (sequence_puzzle widget): Play the nursery music box melody on the organ. The pipes shift, revealing a passage to the observatory tower. 
2. **Darkroom Development**: Use developer solution from Act 2 on the exposed photographic plate in the master bedroom darkroom. Requires focused light (barometer glass + candle = focused light tool from Act 1 items).
3. **Gallery Miniatures**: The miniature estate rooms are exact models. One shows a hidden compartment in the master bedroom that isn't visible IRL. Examining the miniature bedroom closeup reveals a panel behind the headboard. Going to the real bedroom and interacting with the headboard (guided by this knowledge) reveals the jewel box key.
4. **Phonograph Message**: Using the clock hand from Act 1 as a needle, the phonograph plays a recording of Blackwood explaining that "the truth lies below, where knowledge, art, nature, and industry converge. Speak my daughter's name at the iron door." This is the passphrase for the hidden wing.
5. **West Wing Upper Access**: Locked doors opened by various means — hairpin from Act 2 for simple locks, acid residue for one, the miniature room reveals key locations for others.
6. **Dumbwaiter Puzzle**: The dumbwaiter connects the dining room (Act 1), kitchen (Act 3), and basement (Act 4). Items can be sent between floors via the dumbwaiter. A heavy item must be placed in the dumbwaiter to counterweight it for the player to use it to access the basement from above.

**Act 3 Goal**: Access the basement via the servants' stair (key from sitting room correspondence) or the dumbwaiter, AND discover the observatory (via organ passage). The observatory gives a view of the entire estate and reveals the grounds layout, which hints at Act 4's goals.

---

### Act 4: The Basement & Grounds — Industry & Nature (Est. 2-3 hours)
**Phase**: `hunted` — Whitmore checks every 30s, threshold 30. She's genuinely alarmed now. She knows you're getting close to Blackwood's secrets.

**Available rooms** (14 views + closeups):
- **Wine Cellar** — Racks of bottles. Temperature-controlled (mechanical system). A locked vintage cabinet. An old wooden cask. The floor has a drainage grate. The walls are damp stone
- **Wine Cellar Closeup** — The bottles: labels with years. Some bottles contain things other than wine (hidden items in specific vintages, identifiable by testing with litmus papers from Act 2)
- **Workshop** — Blackwood's engineering workshop. A metalworking bench, a forge (cold), a lathe, a drill press, molds for casting, bins of raw materials (brass, lead, iron, copper). A locked cabinet of precision tools
- **Workshop Closeup** — The casting bench: molds for keys, gears, and unusual shapes. A crucible. Flux and solder
- **Furnace Room** — The estate's heating system. A massive coal furnace, pipe network, gauges, valves. Heavy soot. Hard to see without goggles. The coal chute exits to the grounds
- **Furnace Closeup** — The gauge panel: pressure readings. One pipe has a valve that, when turned, diverts steam to a specific location
- **Store Room** — Bulk supplies. Boxes, crates, cleaning supplies. A false wall (tapped hollow) hiding the entrance to the hidden wing
- **Servants' Quarters** — Mrs. Whitmore's room. A cot, a wardrobe (her things), a desk with a diary, a key ring (she carries duplicates — these are the originals), photos of staff from decades ago. This room is risky to enter — if she catches you here, it's immediate phase escalation
- **Observatory Tower** — Accessed from Act 3. A telescope, star charts, a sextant. The roof opens mechanically. Looking down through the telescope reveals details of the grounds: the well, the greenhouse, the carriage house, and a marker that doesn't match any known structure (the hidden wing's external vent)
- **Greenhouse** — Glass structure on the grounds. Tropical plants, a potting bench, a watering system, exotic flowers. One plant is labelled in Blackwood's hand: "Nightshade — handle with care." The greenhouse is accessed via the conservatory garden door or the coal chute exit
- **Greenhouse Closeup** — The exotic plants: several have unusual properties. The nightshade, a bioluminescent fungus, a plant with sap that acts as invisible ink developer
- **Garden/Grounds** — The estate exterior. A path connecting greenhouse, well, carriage house. Overgrown but maintained paths. A sundial. A stone bench with carved text
- **Well** — An old stone well. Deep. A bucket on a rope. Looking down: glint of metal. The embroidery map from Act 3 marks this spot
- **Carriage House** — An old carriage, a workbench with carriage repair tools, a gasoline lantern (early model), straw bales, a trapdoor (locked, leads to a tunnel connecting to the hidden wing's escape route)

**Items found in Act 4**:
| Item | Where Found | Purpose |
|------|-------------|---------|
| **Cast Key** | Workshop: pour melted lead into mold using wax impression from Act 3 | Opens Blackwood's wardrobe → contains his evening coat with hidden pockets |
| **Evening Coat Contents** | Blackwood's wardrobe | Hidden pockets contain: a cipher wheel, a small portrait of his daughter (named "Lily"), and a key to the hidden wing's false wall |
| **Cipher Wheel** | In the evening coat | Decodes the dinner plate rim inscription from Act 1 → reveals the machine's shutdown sequence |
| **Vintage Bottle (correct one)** | Wine cellar: use litmus from Act 2 to find the bottle with pH anomaly | Contains not wine but a chemical component for the ritual mixture |
| **Lead Weight** | Workshop: the chess knight from Act 1 can be melted down (it's solid lead) OR used as-is for the balance mechanism | Balance mechanism in the store room false wall |
| **Well Key** | Retrieved from the well using the bucket | Opens the carriage house trapdoor |
| **Gasoline** | Carriage house lantern (siphon with rubber tubing from Act 2) | Fuel for fire-based puzzles, Act 5: fuel the machine's ignition |
| **Nightshade Extract** | Greenhouse: extract with mortar & pestle from Act 3 | Act 5: Poison component for the ritual OR sedative for Whitmore |
| **Bioluminescent Sap** | Greenhouse: harvest from fungus | Creates a glow-in-the-dark marking — replaces UV light for this scenario |
- **Whitmore's Diary** | Servants' quarters desk | Reveals: she knows where Blackwood is. She's been feeding him. He's alive. She's loyal beyond sanity |
| **Original Key Ring** | Servants' quarters wardrobe | Master keys to almost everything... but taking them means Whitmore will know and escalate immediately (Evidence Gamble) |
| **Precision Tools** | Workshop cabinet (opened with cast key mechanism) | For fine work on the machine in Act 5 |
| **Steam Valve Wheel** | Furnace room (detach from pipe) | Operates the hidden wing door mechanism |

**Puzzles in Act 4**:
1. **Key Casting** (multi-step): Use candle wax impression from Act 3 → place in workshop mold → melt lead from chess knight (or raw lead) in forge → pour → cool → extract cast key. A 5-step crafting chain using items from Acts 1, 3, and 4.
2. **Wine Bottle Selection**: 47 bottles, one is different. Use litmus papers from Act 2 to test bottles. The correct one has alkaline contents (not acidic wine). Opening it reveals a chemical, not wine.
3. **False Wall Discovery**: The store room wall sounds hollow when tapped (hand interaction). The balance mechanism beside it requires a specific weight (the lead chess knight). Placing it opens the false wall → stairs descend to the hidden wing. But the door at the bottom is iron and requires a spoken passphrase.
4. **Furnace Pressure Puzzle** (toggle_panel widget): Redirect steam through specific pipes by toggling valves. The correct configuration pressurizes the hidden wing door's hydraulic lock. Requires goggles from Act 2 to see through the soot.
5. **Coal Chute Escape**: The coal chute connects the furnace room to the outside grounds. Requires the small key from the jewel box (Act 3) to unlock the exterior grate. Creates a crucial shortcut between interior and grounds.
6. **Well Retrieval**: Lower the bucket, retrieve the well key. Simple, but the noise attracts attention (20 noise). During hunted phase, this is risky.
7. **Carriage House Tunnel**: The trapdoor leads to a tunnel that connects to the hidden wing's escape route — but from the wrong end. It's blocked from this side by rubble. Clearing it requires gasoline (controlled explosion, massive noise) OR patience and the butter knife from Act 1 to pry stones loose over time (multiple interactions, low noise each).

**Act 4 Goal**: Open the hidden wing entrance. Requires: (1) false wall discovered, (2) balance weight placed, (3) steam pressure correct, (4) passphrase spoken at the iron door (Blackwood's daughter's name: "Lily" — learned from the evening coat portrait + phonograph recording from Act 3).

---

### Act 5: The Hidden Wing — The Truth (Est. 1.5-2 hours)
**Phase**: `endgame` — Whitmore checks every 20s, threshold 15. She's desperate. She knows you've found the hidden wing. She will do anything to stop you now — not because she's evil, but because she truly believes Blackwood must not be disturbed.

**Available rooms** (8 views + closeups):
- **Hidden Antechamber** — A stone staircase descends to an underground space. Gaslight fixtures (functional). The walls are covered in Blackwood's handwriting — equations, diagrams, ravings. A heavy door ahead
- **Blackwood's Private Study** — A second study, underground. More personal than the one above. Letters to his dead wife. Letters to his dead daughter. A wall of diagrams showing "The Machine." A desk with ink, pens, and half-finished documents
- **Private Study Closeup** — The desk: fresh ink (he's been here recently). A document requiring a forged signature. The diagrams show the machine's operation
- **Ritual Chamber** — A circular room with symbols on the floor. A brazier (cold). An altar with slots for five components. The crystal lock on the far door (needs a specific resonant frequency to shatter). Candle sconces around the walls
- **Ritual Chamber Closeup** — The altar: five slots labeled in Latin. Each requires a specific item to be placed
- **The Machine Room** — The heart of Blackwood's madness. A massive Victorian contraption of brass, copper, glass, and strange crystals. Steam pipes, electrical coils, spinning governors. Multiple control panels. A viewing port. The machine is inert — it needs to be activated (or shut down permanently)
- **Machine Room Closeup** — The control panels: a startup sequence (learned from the developed photograph from Act 3), an emergency shutdown sequence (decoded from the dinner plate cipher from Act 1), and an overload mechanism
- **Blackwood's Cell** — A small room off the machine room. A cot, a desk, food trays (recently used). This is where Blackwood has been living for 20 years. But he's not here right now...
- **Escape Tunnel** — Leads from the machine room to the carriage house (if the rubble was cleared) or to an exterior exit (if the correct valves are turned). The final escape route

**Items found in Act 5**:
| Item | Where Found | Purpose |
|------|-------------|---------|
| **Blackwood's Final Letter** | His cell desk | The truth: the machine partially worked. He glimpsed "the other side." It changed him. He can't leave. He's addicted to looking through the viewing port |
| **Forged Document** | Combine: quill pen (Act 1) + fresh ink (study) + Blackwood's signature reference (journal, Act 2) | Legal transfer of the estate to you, bypassing the house's puzzle requirement |
| **Ritual Components** | Various: vintage bottle chemical (Act 4), nightshade extract (Act 4), filtered mixture (filter cloth + chemical combination), bioluminescent sap (Act 4), candle wax (Act 1 candle melted at brazier) | Five altar slots |
| **Charged Crystal** | Machine room: if machine is activated | The "prize" — what Blackwood was after. A crystal that glows with otherworldly light |

**Puzzles in Act 5**:
1. **Crystal Lock** (final use of brass bell): The bell from Act 1, struck at the resonant frequency derived from the annotated sheet music (Act 3), shatters the crystal lock. This requires the player to have been paying attention to a seemingly useless item for 6+ hours of gameplay.
2. **Ritual Altar**: Place five components in the correct slots (labeled in Latin — the rare book from Act 2 contains a translation guide). The components come from Acts 1, 2, 3, 4, and 5 respectively, proving you explored thoroughly.
3. **Machine Activation/Shutdown** (dial widget): The startup sequence from the developed photograph. The shutdown sequence from the cipher-decoded dinner plate. The overload sequence from Blackwood's journal. Three options, three outcomes.
4. **The Forged Document**: Crafted from the quill pen (Act 1), fresh ink (Act 5), paper (Act 5), and Blackwood's signature style (studied in journal, Act 2). Present to the house's recognition system (the front door mechanism reads it) for a "legal" exit.
5. **The Escape Tunnel**: If rubble was cleared in Act 4, this is a straightforward exit. If not, the emergency valve system (steam valve wheel from Act 4) opens an exterior vent.

---

## Win Conditions (5 endings)

### Ending 1: "The Heir" (Good Ending)
**Conditions**: Complete the ritual, activate the machine, see what Blackwood saw, then shut it down with the emergency sequence. Take Blackwood's final letter. Exit through the front door with the forged document.
**Result**: You leave with the truth and legal claim to the estate. Blackwood remains below, and Whitmore continues her vigil. You publish the story... or don't. The choice is yours.
**Difficulty**: Requires thorough exploration of all five acts and all combination chains.

### Ending 2: "The Destroyer" 
**Conditions**: Overload the machine. Set it to self-destruct. Escape through the tunnel before it blows.
**Result**: The machine is destroyed. Blackwood is freed from his obsession (or killed in the explosion — ambiguous). The estate's puzzle systems fail and all doors open. You walk out the front.
**Difficulty**: Requires reaching the machine room and knowing the overload sequence. Moderate.

### Ending 3: "The Successor"
**Conditions**: Complete the ritual, activate the machine, look through the viewing port. Choose to stay.
**Result**: You understand what Blackwood found. The pull is irresistible. You sit in his chair. Whitmore brings you tea. A new letter is sent, inviting the next journalist... 
**Difficulty**: Requires full ritual completion. Intentional "bad" ending that's narratively satisfying.

### Ending 4: "The Thief"
**Conditions**: Take Whitmore's master key ring. Open the front door directly. Leave.
**Result**: Fast exit, but you never learn the truth. The story you write is incomplete. And Whitmore's diary suggests she won't let this stand...
**Difficulty**: Easiest, but requires getting into Whitmore's quarters (risky) and surviving the immediate phase escalation.

### Ending 5: "The Merciful"
**Conditions**: Sedate Whitmore with nightshade extract in her tea. Find Blackwood. Convince him to leave (requires specific dialogue choices AND having his daughter's locket AND his wife's letter). Walk out together.
**Result**: The most humane ending. Blackwood sees the locket, remembers who he was. He agrees to leave. Whitmore wakes to an empty house. The estate is closed permanently.
**Difficulty**: Hardest ending. Requires items from all five acts, specific sequence of events, and correct dialogue choices.

---

## Item Combination Chains

### Multi-Layer Combinations (items that combine into items that combine again):

```
Act 1: Candle Stub ──────────────────┐
Act 3: Nursery Music Box Key Slot ───┤
                                     ├→ Wax Impression
Act 4: Workshop Mold + Lead ─────────┤
                                     └→ Cast Key → Opens Wardrobe → Evening Coat → Cipher Wheel
                                                                                         │
Act 1: Dinner Plate (rim cipher) ────────────────────────────────────────────────────────┘
                                                                                         │
                                                                                    Decoded Message
                                                                                    (Machine shutdown)
```

```
Act 1: Quill Pen ──────────┐
Act 5: Fresh Ink ──────────┤
Act 2: Journal Signature ──┤→ Forged Document → Front Door Exit
Act 5: Paper ──────────────┘
```

```
Act 2: Napkin ──────────────────┐
Act 2: Lab Chemical ────────────┤→ Filter Cloth
Act 4: Vintage Bottle Chemical ─┤→ Filtered Ritual Mixture → Ritual Altar Slot
```

```
Act 1: Barometer Glass ────┐
Act 1: Candle Stub ────────┤→ Focused Light Tool → Darkroom Development (Act 3)
                                                  → Greenhouse Plant Study (Act 4)
```

```
Act 1: Clock Hand ─────────────→ Phonograph Needle → Plays Recording → "Lily" passphrase
```

### Items That Seem Useless Until Late:

| Item | Hours Until Useful | Why It Seems Useless |
|------|-------------------|---------------------|
| Butter Knife | 6-8 hours | It's a butter knife. Who takes a butter knife? |
| Brass Bell | 8-10 hours | Ringing it summons Whitmore (bad). Seems like a trap. |
| Dinner Plate | 7-9 hours | It's a plate. The rim engraving seems decorative. |
| Chess Knight | 5-7 hours | A game piece. Small and heavy. |
| Barometer Glass | 4-6 hours | A cracked lens from a barometer. |
| Napkin | 3-5 hours | A cloth napkin with embroidered initials. |

---

## Killer Profile: Mrs. Agnes Whitmore

**Background**: Head housekeeper of Blackwood Manor for 40 years. Started as a maid at age 16. Rose through the ranks. When Blackwood vanished, she was the only staff member who stayed. The others fled when strange sounds began coming from below. She stayed because she is loyal to the bone — loyal to the house, to the family, to the master's wishes. She has maintained the estate in perfect condition for 20 years, cleaning rooms no one enters, setting a table no one sits at, and descending to the hidden wing nightly to bring Blackwood his meals.

**Personality**: Crisp, proper, controlled. She speaks formally, calls you "dear" in a way that's simultaneously maternal and threatening. She doesn't shout. She doesn't run. She walks with purpose and speaks with authority. The most frightening thing about her is her patience — she has been doing this for twenty years. She can wait you out.

**Base Behavior by Phase**:
| Phase | Interval | Threshold | Thoroughness | Notes |
|-------|----------|-----------|-------------|-------|
| `arrival` | 90s | 75 | 0.2 | Welcoming. Almost helpful. |
| `exploring` | 60s | 55 | 0.35 | Concerned. Watching more carefully. |
| `committed` | 45s | 40 | 0.5 | Actively relocking doors, confiscating visible tools. |
| `hunted` | 30s | 30 | 0.65 | Alarmed. Will escort you to foyer if caught. |
| `endgame` | 20s | 15 | 0.8 | Desperate. Physically blocks passage to hidden wing. |

**On-Visit Effects**:
- Open drawers/cabinets → she closes them
- Tools left on surfaces → she confiscates them (they go to a "confiscated" box in the servants' quarters)
- Open doors she locked → she relocks them (but can't relock acid-dissolved chains)
- In `committed` phase: she straightens things you've moved, making it harder to tell what's been searched
- In `hunted` phase: she starts locking additional doors she hadn't before
- In `endgame`: she stands guard at the hidden wing entrance if she knows you've found it

**Dialogue**:
- Approach: "Just making my rounds, dear." / "Good housekeeping waits for no one."
- Search: "I know this house better than I know my own face." / "Everything has its place. Including guests."
- Evidence: "Someone has been in the silver. Tsk tsk." / "Lord Blackwood wouldn't approve of this disorder."
- Catch: "There you are, dear. I think you've wandered quite far enough. Back to the foyer, if you please."
- Catch in servants' quarters: "My PRIVATE quarters? That is UNACCEPTABLE." (Immediate phase escalation)
- Endgame: "You mustn't go down there. I WON'T let you go down there. The master is not to be disturbed."

**Special Behavior — The Escort**:
When Whitmore catches you in `hunted` or `endgame` phase, instead of a game over, she escorts you back to the foyer and confiscates any visible items. This is NOT a death — it's a setback. You lose time and must re-explore. Items in your inventory are safe (she doesn't search you), but anything you were holding in your hand or had set down is taken to the confiscated box.

This is critical to the 10-hour experience: death isn't common, but setbacks compound. Getting caught in Act 4 might cost you 20 minutes of re-traversal, which is a real cost in a timed killer scenario.

---

## Pattern Usage (30 patterns, many used multiple times)

| # | Pattern | Uses in This Scenario |
|---|---------|----------------------|
| 1 | **Gateway Puzzle** | Act 1: locked box with word lock "GUEST" |
| 2 | **Dependency Chain** | Glass eye → bust → key → rare book → code → safe → acid → West Wing (7 steps); Wax impression → mold → cast key → wardrobe → cipher wheel → decoded message (6 steps) |
| 3 | **The Fork** | Five acts have multiple independent sub-chains; 5 endings are independent paths |
| 4 | **Progressive Reveal** | Each act reveals more of Blackwood's story; UV/bioluminescent sap reveals hidden text |
| 5 | **False Summit** | Opening the West Wing chain → reveals the door is also chained; finding the false wall → the iron door requires a passphrase; activating the machine → still need to choose an ending |
| 6 | **Dual-Purpose Item** | Butter knife (eat/pry), candle stub (light/wax impression/ritual), chess knight (game piece/lead weight/meltable), brass bell (summon Whitmore/shatter crystal), dinner plate (decoration/cipher key), barometer glass (lens/focused light tool) |
| 7 | **Nested Secret** | Rare book → hollow pages → journal key → journal → experiment details; Music box → melody → organ sequence → passage → observatory; Evening coat → hidden pockets → cipher wheel + portrait + key |
| 8 | **Knowledge Gate** | Card catalog acrostic → chemical safe code; Sheet music annotation → crystal lock frequency; Chalkboard equations → developer formula; Poetry book → Latin translations for ritual; Phonograph recording → "Lily" passphrase |
| 9 | **Revelation Tool** | Bioluminescent sap from Act 4 greenhouse — apply to surfaces to reveal hidden writing. Magnifying glass for fine details. Developer solution for photographs |
| 10 | **Cross-Reference Deduction** | Wall safe code = difference between two clocks; Chemical safe code = acrostic across poems; Machine shutdown = cipher-decoded plate inscription; Ritual slots = Latin labels decoded via rare book |
| 11 | **Noise Tradeoff** | Acid on chain (loud) vs. picking the lock (slow, quiet); Well bucket retrieval (noisy) vs. waiting for Whitmore to be far away; Rubble explosion (massive) vs. prying with butter knife (many quiet interactions) |
| 12 | **Evidence Gamble** | Taking Whitmore's keys = instant escalation; Leaving tools out = confiscation; Opening the false wall = Whitmore learns you found the hidden wing |
| 13 | **Distraction Window** | Ring the brass bell to summon Whitmore to foyer → window to explore elsewhere; Break something in the kitchen → she investigates → window in the basement |
| 14 | **Ticking Clock Decision** | When Whitmore is distracted, multiple time-sensitive things compete: explore the servants' quarters, access the wine cellar, use the coal chute |
| 15 | **Bait and Punish** | The obvious front door key (Whitmore's ring) triggers immediate phase escalation; the "easy" wine cellar vintage (first bottle you test) is wrong and makes noise |
| 16 | **Sound Masking** | Furnace running masks basement noise; Kitchen running water masks nearby actions; Music room instruments mask upper floor movement |
| 17 | **Trap Setting** | Nightshade in Whitmore's tea; Lock a door behind her to slow her route; Move the suit of armor to block a corridor |
| 18 | **Red Herring** | Half the library books seem important but aren't; the typewriter letter seems crucial but is a draft of mundane correspondence; several chemicals in the lab do nothing useful; the dead plants in the conservatory seem relevant but are just dead |
| 19 | **Emergent Combination** | Candle + barometer glass = focused light; Napkin + chemical = filter cloth; Rubber tubing = siphon tool; Quill + ink + signature knowledge = forged document |
| 20 | **Multi-Path Solution** | 5 distinct endings; multiple ways to access most areas (key vs. lockpick vs. acid); multiple ways to handle Whitmore |
| 21 | **Rule Subversion** | The brass bell (summon killer item) becomes the escape tool (crystal shatter); the chess knight (game piece) is a lead weight for a balance mechanism; the machine (Blackwood's prison) becomes the key to understanding/ending |
| 22 | **Myst Machine** | The furnace valve panel (toggle_panel); The machine control panels (multiple dial widgets) |
| 23 | **Power Routing** | Furnace steam routing — limited pressure, choose which systems to power |
| 24 | **Perspective Alignment** | Gallery sculpture rotation reveals hidden angles; Observatory telescope reveals ground details; Miniature room models reveal real room secrets |
| 25 | **Moral Fork** | Sedate Whitmore (efficient but drugging an old woman); Save Blackwood (hardest path); Destroy the machine (decisive but violent); Take the keys and leave (selfish but safe); Become the next watcher (tragic) |
| 26 | **Accomplice** | Blackwood himself (if you reach him and gain trust); his recordings/writings throughout act as a ghostly guide |
| 27 | **Point of No Return** | Acid on the West Wing chain (consumed); entering the hidden wing (Whitmore learns and escalates); activating the machine (can't un-see what's through the viewing port) |
| 28 | **Camouflage** | Close doors after entering; push drawers back in; replace books on shelves; cover your tracks to keep Whitmore's suspicion low |
| 29 | **Echo** | Dumbwaiter connects 3 floors (send items between acts); furnace steam affects hidden wing door hydraulics; organ passage connects to observatory |
| 30 | **Decay Clock** | Whitmore relocks, confiscates, resets. In later phases she actively undoes your work. The longer you take, the more she's cleaned up after you |

---

## Scale Summary

| Metric | Count | Comparison |
|--------|-------|-----------|
| Views | ~50 (25 rooms + 25 closeups) | Pharaoh had 24 |
| Objects | ~180 | Pharaoh had 134 |
| Items | ~50 base + ~18 combinations = ~68 | Pharaoh had 30 |
| Combinations | ~18 | Pharaoh had 7 |
| Phases | 5 | Most scenarios have 3-4 |
| Events | ~20 | Most have 5-8 |
| Puzzle Widgets | ~8 | Pharaoh had 5 |
| Win Conditions | 5 | Most have 3 |
| Hiding Spots | ~12 (every wing has options) | Most have 3-5 |
| Hints | ~25 | Most have 8-10 |
| Dependency Chain Max | 7 steps (longest) | Most max at 4-5 |
| Cross-Act Item Uses | 10+ items from Act 1 used in Acts 3-5 | Unique to this scenario |
| Estimated Play Time | 8-12 hours | Others are 10-20 min |
| JSON Size Estimate | ~300-400 KB | Pharaoh was 151 KB |

---

## JSON Scenario

See: `examples/blackwood-manor.json` *(to be generated)*
