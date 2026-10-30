# The Wizard's Apprentice — Scenario Documentation

## Story Synopsis

You're a small goblin-like apprentice — barely a third the height of the wizard Fizzlepop — visiting his tower to deliver a basket of cookies from the village bakery. When you stepped inside, a gust of wind blew the front door shut — and the enchanted lock clicked! Fizzlepop went out to buy potion ingredients and won't be back until dinnertime. The tower is warm, cozy, and full of wonders. You just need to find the spare key (or figure out the magic word) to open the door and get home before lunch!

Everything in the tower is built for a full-sized wizard, so it's all wonderfully oversized. Shelves are unreachable without a step stool, the cauldron rim is at your eye level, potions on the high shelf require creative solutions, and the cat is nearly your size. Your small stature turns every room into an adventure playground — you can crawl under furniture to find hidden items, peek into gaps behind bookshelves, and squeeze into spaces Fizzlepop hasn't cleaned in decades.

There's nothing scary here. The "danger" is a mischievous enchanted broom named Bristle who sweeps the tower while Fizzlepop is away. If Bristle catches you making too much mess, it'll sweep you right back to the front hall! Bristle isn't mean — it's just doing its job. You can hear it coming by the swish-swish-swish sound.

**Difficulty**: Easy | **Estimated Time**: 15 minutes | **Patterns Used**: 9

> **Note**: The antagonist mechanic is optional. This scenario works as a pure point-and-click adventure if the antagonist AI (Bristle) is disabled in the scenario configuration — the tower becomes a peaceful exploration puzzle with no time pressure at all.

---

## Image Descriptions & Generation Prompts

### Background Images (8 views)

1. **`backgrounds/front_hall.png`** — A cozy circular entrance hall inside a wizard's stone tower. A big wooden front door (locked, with a big iron keyhole and a cheerful "Welcome!" mat). A coat rack with a pointy wizard hat and a purple cloak. A round rug with a star pattern. A spiral staircase going up. A little table with a guest book and a quill pen. Warm torchlight. Colorful tapestries on the curved stone walls showing friendly dragons and dancing fairies. A cat napping on a cushion. Everything is inviting, warm, whimsical — nothing scary at all. Storybook illustration style.

2. **`backgrounds/kitchen.png`** — A warm, cluttered wizard's kitchen. A big wooden table with mixing bowls and wooden spoons. Open shelves with colorful jars of candy, herbs, and mysterious (but friendly) ingredients labeled in fun handwriting: "Giggle Dust," "Rainbow Sprinkles," "Moonbeam Sugar." A stone fireplace with a bubbling cauldron (smells like hot chocolate). A sink with dripping faucets. A cookie jar on a high shelf. A recipe book on a stand, open to a page. A window with cheerful checkered curtains. Storybook illustration style.

3. **`backgrounds/library.png`** — A round room filled with bookshelves from floor to ceiling. A rolling ladder on a track. A comfy reading chair with a patchwork quilt. A globe that glows softly. Books of all sizes and colors — some float gently in the air. A desk with a magnifying glass and stacked scrolls. A painting of Fizzlepop (a cheerful elderly wizard with a big white beard and twinkling eyes) on the wall. A telescope pointing through a round window. Storybook illustration style.

4. **`backgrounds/potion_room.png`** — A small, colorful laboratory. Shelves of glass bottles filled with glowing liquids in every color — pink, blue, green, gold. A workbench with a mortar and pestle, a set of brass scales, and a bubbling test tube rack. A chalkboard on the wall with a half-finished potion recipe. A funny sign that reads: "Do NOT mix the purple and the orange. Trust me." A cabinet with a little lock. Storybook illustration style.

5. **`backgrounds/garden_balcony.png`** — A sunny stone balcony with a magical garden. Flower pots with plants that wave and bob gently. A birdbath where tiny paper birds splash. A sundial in the center covered in rune markings. A watering can shaped like an elephant. A view of rolling green hills and a village in the valley below. Bunting and fairy lights strung along the railing. Storybook illustration style.

6. **`backgrounds/bedroom.png`** — Fizzlepop's cozy bedroom at the top of the tower. A four-poster bed with a starry canopy. A nightstand with a glowing orb lamp. A wardrobe slightly ajar, colorful robes visible inside. A fluffy rug shaped like a cloud. A music box on the nightstand. Slippers by the bed. A framed photo of Fizzlepop and a young apprentice (that's you!). A treasure chest at the foot of the bed. Storybook illustration style.

7. **`backgrounds/recipe_closeup.png`** — Closeup of the open recipe book in the kitchen. The page reads: "Fizzlepop's Famous Unlocking Charm — For when you lock yourself out (again!)." Below it: three ingredient illustrations — a Moonbeam Sugar crystal (sparkly), a Giggle Dust pinch (pink cloud), and a Rainbow Sprinkle (multicolored). At the bottom, in smaller text: "Stir three times clockwise, say the magic word!" The magic word is partially smudged but you can make out: "A-L-O-H-O-M-O-R-_" with the last letter smudged.

8. **`backgrounds/chalkboard_closeup.png`** — Closeup of the chalkboard in the potion room. The recipe reads in chalk: "Unlocking Potion (backup method) — Mix: 1 Moonbeam Sugar + 1 Giggle Dust + 1 Rainbow Sprinkle. Stir clockwise. Pour on any lock." Below it in different handwriting (Fizzlepop's notes): "The magic word is ALOHOMORA. Don't forget again!!" with a little smiley face drawn next to it.

---

## Game Flow

### Phase 1: Arrival
You start in the front hall. Bristle sweeps at very long intervals (120 seconds) and tolerates a lot of mess (noise threshold 80). The broom is far away, cleaning upstairs.

**Immediate goal**: Explore the hall and find a way deeper into the tower.
1. **Look at the front door** — it's locked, you need a key or magic to open it
2. **Look at the guest book** — learn Fizzlepop went out for ingredients
3. **Pet the cat** — the cat purrs and moves, revealing a shiny coin underneath
4. **Take the coin** — your first item (Gateway Puzzle)
5. **Go upstairs** — spiral staircase leads to the rest of the tower

### Phase 2: Exploration
Bristle's interval drops to 80s, threshold to 60. The tower opens up to explore.

**Two parallel discovery paths** (The Fork):

**Path A — The Spare Key**:
- Find the key is hidden in the treasure chest in the bedroom
- The chest has a combination lock: 3 pictures (star, moon, sun)
- The clue to the combination is on the sundial in the garden (star-moon-sun order shown by rune markings)
- Open the chest → get the spare key → use on front door → escape!

**Path B — The Unlocking Charm**:
- Find the recipe book in the kitchen — learn about the unlocking charm
- Gather three ingredients from around the tower: Moonbeam Sugar (kitchen shelf), Giggle Dust (potion room), Rainbow Sprinkle (garden)
- Combine them in the cauldron
- Learn the magic word "ALOHOMORA" from the chalkboard in the potion room
- Use the potion on the door and speak the magic word → escape!

### Phase 3: Almost There!
Triggered when you have either the spare key or the unlocking potion. Bristle becomes more active (interval 50s, threshold 40). Swishing sounds get closer!

---

## Items & Dynamics

| Item | How Obtained | Primary Use |
|------|-------------|-------------|
| **Shiny Coin** | Under the cat on the cushion | Use in garden wishing well (red herring — fun but not needed) |
| **Cookie** | From the cookie basket you brought | Give to Bristle to distract it |
| **Moonbeam Sugar** | Kitchen high shelf (use stool) | Unlocking charm ingredient |
| **Giggle Dust** | Potion room cabinet (need to figure out the little lock) | Unlocking charm ingredient |
| **Rainbow Sprinkle** | Garden balcony flower pot | Unlocking charm ingredient |
| **Unlocking Potion** | Combine 3 ingredients in cauldron | Use on front door (Path B) |
| **Spare Key** | Bedroom treasure chest | Use on front door (Path A) |
| **Magnifying Glass** | Library desk | Read tiny text / examine rune markings on sundial (Dual-Purpose) |
| **Fizzlepop's Note** | Inside the guest book | Contains the cabinet combination hint |
| **Step Stool** | Kitchen corner | Reach the high shelf for Moonbeam Sugar |

### Key Dynamics

- **Bristle the Broom**: Not scary at all — just sweeps you back to the front hall if it catches you making a mess. You can hear it coming (swish-swish-swish). Hiding behind furniture works. Giving it a cookie distracts it for a while.
- **Two Win Paths**: Find the spare key (puzzle-focused) or brew the unlocking charm (exploration + gathering). Both are equally valid.
- **No Fail State**: Bristle doesn't hurt you — just sends you back to start. No time limit. No scary moments. The worst that happens is "Oops, back to the front hall!"
- **Friendly Atmosphere**: Everything in the tower is warm and inviting. Objects have playful descriptions. The cat purrs. The plants wave. The books float gently.

---

## Puzzle Breakdown

### 1. Pet the Cat (Gateway Puzzle)
- **Look** at cat → "A fluffy orange cat napping on a cushion. It looks very comfy!"
- **Hand** cat → Cat purrs, stretches, and moves → reveals shiny coin underneath
- **Take** coin → First item collected!
- Result: Builds confidence, teaches the interaction verbs

### 2. Kitchen High Shelf (Dependency Chain)
- **Look** at high shelf → "Jars of ingredients on a shelf too high to reach."
- **Look** at step stool → "A little wooden step stool in the corner."
- **Take** step stool → Add to inventory
- **Use** step stool on high shelf → Now you can reach! Take Moonbeam Sugar.
- Result: Moonbeam Sugar ingredient

### 3. Potion Cabinet Lock (Knowledge Gate)
- The cabinet in the potion room has a small lock
- **Look** at cabinet → "A little wooden cabinet with a tiny padlock. There's a number dial with 3 digits."
- The combination (1-2-3) is written in Fizzlepop's note found in the guest book: "P.S. — Cabinet code is still 1-2-3. I really should change that!"
- **Puzzle Widget**: 3-digit combination lock, solution [1, 2, 3]
- Result: Giggle Dust ingredient

### 4. Sundial Runes (Knowledge Gate + Perspective)
- The sundial in the garden has rune markings showing three symbols in order
- **Look** at sundial → "A stone sundial with strange rune markings. Three symbols carved around the edge."
- **Use** magnifying glass on sundial → "Through the glass, you can read them clearly: a Star, then a Moon, then a Sun. They're numbered 1, 2, 3!"
- This is the combination for the bedroom treasure chest

### 5. Treasure Chest Combo (Dependency Chain)
- **Puzzle Widget**: sequence puzzle with 3 symbols (star, moon, sun)
- Must know the order from the sundial
- Solution: Star → Moon → Sun
- Result: Spare Key!

### 6. The Cauldron Brew (Emergent Combination)
- Have all three ingredients (Moonbeam Sugar + Giggle Dust + Rainbow Sprinkle)
- **Use** each ingredient on cauldron → ingredients disappear, cauldron bubbles!
- After all three: the cauldron produces the Unlocking Potion
- Result: Unlocking Potion item

### 7. The Front Door (Multi-Path Solution)
- **Path A**: Use spare key on front door → "Click! The lock turns! You're free!"
- **Path B**: Use unlocking potion on front door + know magic word → "The potion fizzes on the lock. You say 'ALOHOMORA!' and the door swings open!"
- Both paths lead to a cheerful win screen

---

## Pattern Usage

| # | Pattern | How It's Used |
|---|---------|---------------|
| 1 | **Gateway Puzzle** | Pet the cat → find the coin. No prerequisites, instant reward |
| 2 | **Dependency Chain** | Step stool → high shelf → Moonbeam Sugar; Sundial clue → chest combo → spare key |
| 4 | **Progressive Reveal** | Each room discovered reveals more of the tower and new items |
| 6 | **Dual-Purpose Item** | Magnifying glass: read sundial runes AND read tiny recipe text |
| 8 | **Knowledge Gate** | Cabinet code from Fizzlepop's note; Chest combo from sundial; Magic word from chalkboard |
| 18 | **Red Herring** | Shiny coin seems important but the wishing well just gives a fun message |
| 19 | **Emergent Combination** | Three ingredients combined in cauldron = Unlocking Potion |
| 20 | **Multi-Path Solution** | Spare key path vs. unlocking charm path — both work! |
| 3 | **The Fork** | Key path and potion path are independent branches |

---

## Killer Profile: Bristle the Enchanted Broom

**Background**: Bristle is Fizzlepop's enchanted cleaning broom. It's been keeping the tower tidy for years and takes its job VERY seriously. It doesn't mean any harm — it just can't stand a mess!

**Personality**: Fussy, bustling, and a little huffy. Bristle doesn't speak — it communicates with swishing sounds, indignant bristle-ruffling, and the occasional dramatic sweep. Think of a very dedicated housekeeper who tuts when you track mud inside.

**Base Behavior**:
- Phase 1 (Arrival): Check every 120s, threshold 80
- Phase 2 (Exploration): Check every 80s, threshold 60
- Phase 3 (Almost There!): Check every 50s, threshold 40
- Thoroughness: 0.2 → 0.4 (it's not very thorough — easy to hide from!)

**Dialogue Samples** (sound effects, not words):
- Approach: *Swish-swish-swish. You hear Bristle sweeping closer, its straw bristles scraping the stone floor.*
- Search: *Bristle pokes into corners, its handle tilting left and right like a curious dog sniffing around.*
- Evidence: *Bristle finds the mess and ruffles its bristles indignantly. SWISH SWISH SWISH!*
- Catch: *Bristle sweeps around your feet in excited circles and herds you back to the front hall. "Back to where you started!" seems to be the message.*

**On-Visit Effects**:
- Puts displaced items back (closes opened cabinets, replaces moved stools)
- Sweeps up any crumbs or spills
- Does NOT take items from your inventory — that would be mean!

---

## Solution Paths

### Path 1: The Spare Key (Primary — 7 steps)
1. Explore the tower, find the garden balcony
2. Look at the sundial, use magnifying glass to read runes (Star-Moon-Sun)
3. Go to the bedroom
4. Solve the treasure chest sequence puzzle (Star → Moon → Sun)
5. Take the spare key
6. Go back to the front hall
7. Use spare key on front door → Win!

### Path 2: The Unlocking Charm (8 steps)
1. Find the recipe book in the kitchen, read the recipe
2. Take the step stool, use on high shelf → get Moonbeam Sugar
3. Find Fizzlepop's note in the guest book → learn cabinet code (1-2-3)
4. Go to potion room, open cabinet with code → get Giggle Dust
5. Go to garden, take Rainbow Sprinkle from flower pot
6. Use all three ingredients on the cauldron → get Unlocking Potion
7. Read the chalkboard in potion room → learn magic word "ALOHOMORA"
8. Use Unlocking Potion on front door → Win!

---

## Image Generation Prompts

Use these prompts with Google Gemini (free model) to generate the background images. The target art style is **1990s Sierra On-Line adventure games** — specifically **King's Quest V** and **King's Quest VI** — hand-painted, lush, richly detailed backgrounds with painterly textures and warm atmospheric lighting. For this kids scenario, lean toward the brighter, more whimsical end of the KQ aesthetic (think the village scenes in KQ5 or the Isle of Wonder in KQ6). Request **1920x1080 resolution**, **16:9 aspect ratio**. Generate 3-4 variations and pick the most charming one.

### `backgrounds/front_hall.png`
> A cozy circular entrance hall inside a wizard's stone tower, hand-painted in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, painterly lush detailed backgrounds. A big wooden front door with an iron keyhole and a welcome mat. A coat rack with a pointy purple wizard hat and a purple cloak. A round rug with a yellow star pattern on the floor. A spiral stone staircase going up on one side. A little wooden table with a book and quill pen. Warm orange torchlight from wall sconces. Colorful tapestries on the curved stone walls showing friendly dragons and dancing fairies. A fluffy orange cat napping on a cushion near the door. Everything is inviting, warm, and whimsical with a children's book feel. Soft lighting, no scary elements. 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. No text, no UI, no characters.

### `backgrounds/kitchen.png`
> A warm cluttered wizard's kitchen inside a stone tower, hand-painted in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, painterly lush detailed backgrounds. A big wooden table with mixing bowls and wooden spoons. Open shelves with colorful jars of candy and herbs with fun handwritten labels. A stone fireplace with a bubbling black cauldron giving off gentle steam. A ceramic sink with brass faucets. A cookie jar on a high shelf out of reach. An open recipe book on a wooden stand. A window with cheerful red-and-white checkered curtains showing a sunny day. A small wooden step stool in the corner. Warm inviting colors, soft lighting, children's book warmth with Sierra adventure game painterly detail. 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. No text, no UI, no characters.

### `backgrounds/library.png`
> A round tower room filled with bookshelves from floor to ceiling, hand-painted in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, painterly lush detailed backgrounds. A wooden rolling ladder on a brass track. A comfy red reading chair with a colorful patchwork quilt draped over it. A glowing golden globe on a stand. Books of all sizes and colors, some floating gently in the air with sparkles. A wooden desk with a magnifying glass and rolled scrolls. A framed portrait of a cheerful elderly wizard with a big white beard and twinkling blue eyes wearing a purple pointed hat. A brass telescope pointing through a round window. Warm magical atmosphere, soft golden lighting, children's book warmth with Sierra adventure game painterly detail. 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. No text, no UI, no characters.

### `backgrounds/potion_room.png`
> A small colorful wizard's laboratory inside a stone tower, hand-painted in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, painterly lush detailed backgrounds. Shelves of glass bottles filled with glowing liquids in pink, blue, green, and gold. A wooden workbench with a brass mortar and pestle, a set of tiny scales, and a rack of bubbling test tubes. A green chalkboard on the wall with chalk writing and a little drawn smiley face. A small wooden cabinet with a tiny padlock. A funny handmade sign reading "Do NOT mix the purple and the orange." Bright cheerful colors, magical glow effects, no scary elements, children's book warmth with Sierra adventure game painterly detail. 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. No text, no UI, no characters.

### `backgrounds/garden_balcony.png`
> A sunny stone balcony with a magical garden on top of a wizard's tower, hand-painted in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, painterly lush detailed backgrounds. Flower pots with friendly plants that appear to wave and bob. A stone birdbath where tiny colorful paper birds splash. A stone sundial in the center with carved rune markings. A watering can shaped like a cute elephant. A beautiful view of rolling green hills and a small village with thatched roofs in the valley below. Colorful bunting and fairy lights strung along the stone railing. Blue sky with fluffy white clouds. Bright cheerful colors, warm sunlight, children's book warmth with Sierra adventure game painterly detail. 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. No text, no UI, no characters.

### `backgrounds/bedroom.png`
> A cozy wizard's bedroom at the top of a stone tower, hand-painted in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, painterly lush detailed backgrounds. A four-poster wooden bed with a dark blue canopy decorated with silver stars and moons. A wooden nightstand with a softly glowing crystal orb lamp. A tall wardrobe slightly open showing colorful robes inside. A fluffy white rug shaped like a cloud on the stone floor. A small music box on the nightstand. Purple slippers by the bed. A framed photo on the wall of a cheerful old wizard with a young child. A wooden treasure chest with brass fittings at the foot of the bed. Warm cozy atmosphere, soft purple and gold tones, children's book warmth with Sierra adventure game painterly detail. 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. No text, no UI, no characters.

### `backgrounds/recipe_closeup.png`
> Closeup of an open recipe book on a wooden stand, hand-painted in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, painterly lush detailed backgrounds. The page shows a title "Unlocking Charm" in decorative handwriting. Below are three ingredient illustrations: a sparkly white crystal labeled with a crescent moon, a pink fluffy cloud of powder, and a multicolored sprinkle. Decorative borders with tiny stars and swirls around the page edges. Old parchment paper texture. Warm lighting. The book looks well-loved with slightly worn pages. Children's book illustration style. 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. No text, no UI, no characters.

### `backgrounds/chalkboard_closeup.png`
> Closeup of a green chalkboard on a stone wall, hand-painted in the style of 1990s Sierra On-Line adventure games like King's Quest V and King's Quest VI, painterly lush detailed backgrounds. Written in white and colored chalk: a potion recipe with three ingredient names and a mixing instruction. At the bottom in messier handwriting, the word "ALOHOMORA" is written in big yellow chalk letters with a little chalk smiley face drawn next to it and underlined twice. Chalk dust around the edges. A wooden frame around the chalkboard. A small chalk tray at the bottom with broken pieces of colored chalk. Warm lighting from the side. Children's book illustration style. 16:9 aspect ratio, 1920x1080. Low camera angle, as if viewed by a small creature at knee-height, emphasizing the towering scale of the environment. No text, no UI, no characters.

---

## JSON Scenario

See: [`examples/the-wizards-apprentice.json`](../../examples/the-wizards-apprentice.json)
