# Vent Maze Design — Act 1

> **Superseded by v6 "The Colony" (built).** The maze in the game is now v6: design doc https://claude.ai/artifact/TXbhA8E6UQGPiDsts5uGkS, interactive map https://claude.ai/artifact/GQf44LikYYCK5Knym4wD5Y, built by `scripts/build_vent_maze_v6.py` + `scripts/vent_story_v6.py` from `scripts/vent_maze_v6_grid.json`. This page describes v3 and is kept for its conventions (fixed compass, frames, fairness).

## Overview

The vents between the Containment Corridor and the Airlock Bay are a **King's Quest desert–style labyrinth**: 48 near-identical duct screens on a fixed compass, with five painted landmark rooms (Junction, Gas Chamber, Fan Chamber, Collapsed Section, Exit Passage) inside it. It is meant to be genuinely hard: the shortest way out is 18 duct moves through 6 loops and past 6 dead ends, and three side ducts are **purge ducts** that kill you. The scratched **ventilation map** from the Vent Entry shows the whole grid, north-up, but no route and no "you are here": like KQ's desert, you keep track of your own turns.

> **v3 (current).** v2 was a 13-cell maze whose map drew arrows along the route and whose hints named the next turn in every duct. v3 keeps the special rooms and their puzzles and replaces the grid. The layout is generated, not hand-drawn: `scripts/design_vent_maze.py` searches seeded layouts that the five duct frames can show and keeps the hardest by score, writing `scripts/vent_maze_grid.json`. `build_vent_maze.py`, `draw_vent_map.py`, `build_walkthrough_images.py` and the playthrough harness all read that file.

**Fairness.** Every duct you can see opens into another (the design search rejects openings that lead nowhere), every connection is two-way, and wandering can't soft-lock (exhaustive search: 0 soft-locked states). The purge ducts are the only new deaths, and each is telegraphed twice: LOOK at the opening ("scalding air gusts out… the metal around its mouth is scorched black") and a small skull on the map. The duct hints say how to read the map (count turns from the junction; ahead is north) but never which way to go.

**Why it's built this way.** The duct art has five frames: ahead+left, ahead+right, left only, right only and a dead end (back is always possible). So a generic duct can't be a straight corridor or a crossroads, and side passages come in pairs. The search works inside those rules, which is why the maze reads as columns joined by short cross-ducts. More frame types (a straight duct, a T-junction) would allow bigger loops; see the frame prompts below.

## Navigation Convention (fixed compass, like KQ1 / KQ6's catacombs)

The camera **always faces north**. Inside every maze screen:

| Screen position | Compass | Nav hotspot (960×720 JSON space) |
|-----------------|---------|----------------------------------|
| Tunnel continuing straight ahead (center) | **North** | `(380,210)` 220×255, or `(360,210)` on mirrored (RF/RT) frames |
| Round opening in the left wall | **West** | `(95,187)` 205×347 (same as the Junction's left opening) |
| Round opening in the right wall | **East** | `(660,187)` 205×347 (the West box mirrored) |
| Bottom edge (behind the viewer, not painted) | **South** | `(150,660)` 660×60 |

Walking west through the left opening puts you in the next cell **still facing north**, so the passage you came through is now on your right. That's the classic KQ rule, and it means the in-game map (drawn north-up) matches the screens exactly: forward on screen = up on the map. Every connection is two-way: if a cell has a West opening, its western neighbour has an East opening.

Character standing spot in the generic cells: `(560, 650)` on left-handed frames, `(400, 650)` on mirrored frames, `(480, 650)` in the dead end; always facing up, clear of the forward mouth. (These are the values `build_vent_maze.py` writes; `docs/ART_GUIDE.md` → Step 7 explains how they were measured.)

## Maze Graph (v3)

Run `python3 scripts/design_vent_maze.py` to print the current layout (ASCII, north up, ☠ = purge). The walkthrough's `walkthrough/vent_maze_route.webp` draws it with the way out in gold. Cells are named by column letter and row number (`A1`…`G7`, view `act1_vent_maze_a1` etc.); the special rooms keep their names (`J`, `GAS`, `FAN`, `EXIT`, `COLL`, `ENTRY`).

> The v2 notes below (cells, map, names) describe the previous 13-cell layout and are kept for history; the conventions (fixed compass, nav box geometry, character spots, frames) are unchanged in v3.

## v2 (historical)

### Cells

| Cell | Grid | Openings | Frame | Notes |
|------|------|----------|-------|-------|
| ENTRY | (2,0) | N, S→corridor | `act1_ventilation_shaft.webp` (existing) | Map pickup |
| J | (2,1) | W, E, S | `act1_vent_junction.webp` (special) | Scratched symbols; map marks WEST |
| A | (1,1) | N, E | right + forward (RF) | |
| B | (1,2) | N, W, S | left + forward (LF) | Loop entrance |
| C | (0,2) | N, E | RF | Loop |
| D | (0,3) | E, S | right turn (RT) | Loop |
| E | (1,3) | N, W, S | LF | Loop rejoins |
| F | (1,4) | N, E, S | RF | East arm rejoins |
| GAS | (1,5) | N, S | `act1_vent_gas_chamber.webp` (special) | North without helmet = death (existing) |
| FAN | (1,6) | N (blocked by fan), S | `act1_vent_fan_room.webp` (special) | Jam with probe (existing) |
| EXIT | (1,7) | hatch, S | `act1_vent_exit.webp` (special) | Hatch → Airlock Bay |
| G | (3,1) | N, W | LF | |
| H | (3,2) | N, E, S | RF | Branch to the reward |
| I | (4,2) | N, W | LF | |
| COLL | (4,3) | S | `act1_vent_collapsed.webp` (special) | Optional reward |
| K | (3,3) | N, W, S | LF | |
| L | (3,4) | S | dead end (DE) | |
| M | (2,3) | N, E | RF | |
| N | (2,4) | W, S | left turn (LT) | |

**Frames needed:** LF ×5, RF ×5, LT ×1, RT ×1, DE ×1. We generate **three images** (LF, LT, DE); RF and RT are horizontal mirrors of LF and LT (`convert lf.webp -flop rf.webp`). A plain straight tunnel (ST) is optional, for future layouts.

### The map

`ventilation_map` (from the Vent Entry's wall scratches) becomes essential. LOOKing at it in inventory shows a `show_closeup` of the map, rendered procedurally from the grid above so it is accurate by construction: crude claw-scratched lines on a metal plate, north-up, with the Junction's symbol, a skull over the gas, a fan glyph, an X where the skeleton lies, and arrows along the true route. The Junction markings and per-cell hints also read the map. Without it, a cell's hint is "These tunnels all look the same. Something to map them with would help." With it, the hint says "Your map says: go west / north / east from here."

### Room names

Every generic cell shows the same room label ("Air Ducts") so the player can't use labels to orient. Special rooms keep their own names.

### Soft-lock and fairness

- All edges are bidirectional, and nothing in the generic cells consumes or blocks. The worst outcome of being lost is wasted time.
- The deaths are unchanged (gas without helmet ×2, fan). The maze adds none.
- After implementation, re-run `tools/validate-scenario.mjs` and `tools/softlock-search.mjs` (goal `state:airlock_override_panel!=locked`).

### Special-room art review (backgrounds delivered)

All five painted rooms match the shared tube style and their brief. Their hotspots were refit to the art and checked in-game:

- **Junction:** side openings moved inward onto the painted tunnel mouths.
- **Gas Chamber:** forward nav moved from the ceiling onto the tunnel's vanishing point; corpse box enlarged to cover the skeleton's legs.
- **Fan Chamber:** fan box tightened to the disc, mechanism box fitted, and the character moved left so he isn't in front of the hub.
- **Collapsed Section:** skeleton box covers skull to feet, scratches box moved up onto the painted marks, and the character stands left of the skeleton's feet.
- **Exit Passage:** crack and hatch boxes fitted, the character moved out of the hatch onto the floor at lower left, and the starlight and hatch-glow lights moved onto the crack and hatch.

## Room Details (v1 puzzle content, still current)

> Navigation targets mentioned below are from v1. **Routing now follows the v2 Maze Graph above**; puzzles, objects and text in the special rooms are unchanged.

### 1. Vent Entry (`act1_ventilation_shaft` — repurposed)
**Existing room**, minimally changed. Remove the direct nav to airlock. Add nav forward to Junction.

- **Objects kept**: wall_scratches (gives map), vent_old_remains, vent_maintenance_hatch
- **Objects removed**: shaft_branches (replaced by actual branches), nav to airlock
- **Objects added**: nav forward to junction
- **Nav back**: to corridor (existing)
- **Character**: same position (499, 595) facing up
- **Hints**: Updated to reference the maze ahead

### 2. Junction (`act1_vent_junction`)
**New room.** A T-shaped intersection where the vent splits left and right. Dim red emergency lights. Organic walls pulse faintly.

- **Nav left**: to Gas Leak Chamber
- **Nav right**: to Collapsed Section  
- **Nav back**: to Vent Entry (down/behind)
- **Objects**:
  - `junction_markings` — scratches on wall. Without map: "meaningless scratches." With map: "The map marks LEFT as the correct path — an arrow pointing left with a small symbol like a helmet. RIGHT is marked with deep warning gouges."
  - `junction_pipes` — overhead pipes, decorative/lore
  - `junction_air_current` — feel the air. Left side = warm chemical smell (gas hint). Right = stale/dead (dead end hint)
- **Character**: x:480, y:500, facing up
- **Background**: Dark T-junction, red emergency lights, left tunnel has faint yellow-green haze, right tunnel looks collapsed/narrower

### 3. Gas Leak Chamber (`act1_vent_gas_chamber`)
**Hazard room.** Yellow-green toxic gas visibly fills this section. Entering without the helmet = death after a warning beat.

- **Entry behavior**: On entering, if player does NOT have `emergency_suit_helmet`:
  1. Show warning message: "Acrid yellow-green gas fills this section of the vent. Your eyes water immediately. Every breath burns."
  2. Second interaction (trying to proceed forward): game_over — "The toxic gas overwhelms you. Your vision blurs, your lungs seize. You collapse in the vent shaft, another specimen who didn't make it."
  
  Actually, simpler approach using the engine: The nav INTO this room works unconditionally. But the room's `ambient_text` warns of gas. Moving FORWARD requires the helmet. Moving forward without it = game_over.

- **With helmet**: Messages acknowledge the helmet protecting you. Can proceed forward to Fan Room.
- **Nav forward**: to Fan Room (gated — see above)
- **Nav back**: to Junction
- **Objects**:
  - `gas_source` — cracked bio-pipe leaking yellowish vapors. Look: describes alien chemical leak. Hand: "You're not touching that without protection."
  - `gas_vent_corpse` — another dead creature in the gas. Look: "A larger specimen than the remains in the entry shaft. This one got further." Hand without helmet: triggers death. Hand with helmet: can examine, find `vent_access_code` note (optional lore for Act 2 setup)
  - `nav_forward` — to fan room. Without helmet: game_over. With helmet: proceed.
  - `nav_back` — to junction
- **Character**: x:480, y:500, facing up
- **Ambient lighting**: sickly yellow-green glow
- **Background**: Same vent tunnel style but flooded with yellowish-green haze, dead creature visible, cracked pipe on wall

### 4. Fan Room (`act1_vent_fan_room`)
**Hazard room.** A massive ventilation fan blocks the passage. Moving through while active = instant death. Can be disabled.

- **Objects**:
  - `vent_fan` — huge spinning fan blocking passage. States: "spinning" (default), "jammed"
    - Look (spinning): "A massive ventilation fan spins at lethal speed, its blades a blur of dark metal. The wind from it pushes you back. No creature could pass through alive."
    - Look (jammed): "The fan blades are locked in place, jammed by the surgical probe wedged into the mechanism. You can squeeze between the stilled blades."
    - Hand (spinning): "You'd lose your arm. The blades are moving far too fast."
    - Hand (jammed): "The blades are solid even when still. But there's enough gap to squeeze through."
    - Move (spinning): game_over — "You push into the fan's wind. A blade catches you before you even register the impact. Your adventure ends here."
    - Move (jammed): "You carefully squeeze between the jammed fan blades."
  - `fan_mechanism` — the motor housing/mechanism on the wall
    - Look: "The fan's drive mechanism is exposed — bio-organic muscle tissue wrapped around a metal axle. A narrow gap in the housing could accept a tool to jam the gears."
    - Hand: "The mechanism is too strong to stop by hand."
    - use_item (surgical_probe): Sets fan state to "jammed", removes surgical_probe. "You wedge the surgical probe into the mechanism's gears. Metal grinds against bio-tissue — the fan stutters, shudders, and locks. The probe is bent beyond recovery, but the blades are stopped."
    - use_item (other): "That won't fit in the mechanism gap."
  - `nav_forward` — through fan to Exit Passage. Gated by fan state "jammed".
  - `nav_back` — to Gas Leak Chamber
- **Character**: x:480, y:450, facing up
- **Ambient lighting**: Red with strobing effect from fan shadows
- **Background**: Vent tunnel with massive industrial fan filling the passage, blades visible, mechanism housing on the right wall
- **Hints**: "The fan mechanism has an exposed gap. Something long and thin might jam it." → (after jamming) "The fan is stopped. You can squeeze through."

### 5. Collapsed Section (`act1_vent_collapsed`)
**Dead end.** The right branch from Junction leads here — a partially caved-in section with lore and an optional item.

- **Objects**:
  - `collapse_debris` — fallen ceiling/wall panels. Look: "The ceiling has caved in, blocking the passage completely. Organic wall material has grown over the rubble like scar tissue — this happened long ago."
  - `collapsed_skeleton` — remains of a previous escapee
    - Look: "A skeletal figure sits propped against the rubble. Too large for a human — this was a Choir crew member. They were trying to escape their own ship. In their hands, a datapad still faintly glows."
    - Hand: Picks up `crew_datapad` item. "You carefully extract the datapad from the skeleton's grip. The screen still holds a faint charge."
  - `collapse_scratches` — more wall scratches. Look (no map): "More scratches. Random panic?" Look (with map): "These match the warning marks on your map. Whoever scratched the map knew this was a dead end."
  - `nav_back` — to Junction
- **New item**: `crew_datapad` — "A Choir-make datapad recovered from a dead crew member in the vents. The screen shows their last log entry: coordinates, a security override frequency, and a half-finished farewell. This could be useful in the operational decks." (Act 2 setup item, gives lore context)
- **Character**: x:480, y:500, facing right (looking at skeleton)
- **No forward nav** — dead end
- **Background**: Collapsed vent tunnel, rubble blocking passage, skeleton sitting against debris, faint datapad glow

### 6. Exit Passage (`act1_vent_exit`)
**Final stretch.** After the fan room, a clear passage leading down to the airlock bay. Brief, with one atmospheric moment.

- **Objects**:
  - `exit_viewport` — a gap in the vent wall showing stars/space. Look: "Through a crack in the vent wall, you see stars. The first time you've seen outside the ship. The void is beautiful and terrifying."
  - `exit_hatch` — the vent opening into airlock bay
    - Look: "The vent shaft opens into a large chamber below. You can see docking clamps and the curved hull of the airlock bay. Freedom — or at least the next step toward it."
    - Move: set_view to act1_airlock_bay + message
  - `nav_to_airlock` — to Airlock Bay
  - `nav_back` — to Fan Room
- **Character**: x:480, y:450, facing down (looking out)
- **Background**: Vent tunnel opening to a larger space, visible stars through wall crack, hatch opening below

## Key Design Decisions

### Death Fairness
1. **Gas Chamber**: Player has SEEN the helmet in the suit locker (Airlock Bay isn't reached yet, but the helmet comes from the Security Hub's key card drawer → suit locker). Actually, the helmet comes from `act1_security_hub` suit area. The gas smell is hinted at the Junction (air_current object). The map explicitly marks the left path with a helmet symbol. Three layers of warning.

2. **Fan Room**: The fan is obviously lethal (visual + description). The mechanism is examinable before attempting to pass. The surgical probe has been in inventory since the Processing Lab. The hint system guides toward the solution. Only walking directly into spinning blades kills — and the description screams danger.

3. **Collapsed Section**: Not deadly, just a dead end. Rewards exploration with lore item.

### Map Integration
At every junction/decision point, examining `junction_markings` (or similar) gives different text based on `has_item: ventilation_map`:
- **Without map**: Vague, unhelpful descriptions
- **With map**: Clear directional guidance, hazard warnings, correct path indication

### Item Gates
- `ventilation_map` — obtained in Vent Entry (wall_scratches). Makes navigation informed vs. blind.
- `emergency_suit_helmet` — obtained from Security Hub. Required to pass Gas Chamber alive.
- `surgical_probe` — obtained from Processing Lab. Required to jam fan. **Consumed** (removed from inventory).

### Surgical Probe Sacrifice
The probe is consumed when jamming the fan. This is the probe's ultimate purpose — it was useful earlier in Act 1 (cutting the restraint strap free in the Processing Lab, flavour uses) but its final destiny is saving your life in the vent maze. Players who used it carefully will have it; it's not missable.

Wait — checking: the probe is NOT consumed in any current interaction. It's used as a tool but kept. The fan room is where it gets sacrificed. This is good design — the player has had it for a while and has used it as a tool, so losing it here feels earned, not punishing.

## Ventilation Map Behavior at Each Room

| Room | Without Map | With Map |
|------|------------|----------|
| Vent Entry | "The shaft branches ahead into darkness." | "Your map shows a junction ahead. Left leads to the airlock eventually. Right is marked as a dead end." |
| Junction | "Scratches on the wall. Could mean anything." | "The map marks LEFT with a helmet symbol — hazardous but correct. RIGHT is gouged with deep warning marks — dead end." |
| Gas Chamber | (dying or dead) | "The map shows this section as passable with protection. Beyond it, one more obstacle before the exit." |
| Fan Room | "The vent continues past the fan somehow." | "The map shows the exit passage just beyond this fan. Almost there." |
| Collapsed Section | "Just rubble. Nothing useful." | "Your map confirms this is a dead end. The mapmaker marked it with frustration gouges." |
| Exit Passage | "The shaft opens ahead." | "The map shows the airlock bay below. You made it through." |

## Background Image Prompts (Gemini)

These prompts are matched to the current hotspot layout in `scenario.json` (positions are given as fractions of the frame), and they reuse the look of the existing Vent Entry background. **Attach `backgrounds/act1_ventilation_shaft.webp` as a reference image** in Gemini with each prompt so the palette and tube construction match. Save each result as the filename shown, keeping a 16:9 aspect ratio (1376×768 or 1920×1080 both work).

### Vent Junction — `backgrounds/act1_vent_junction.webp`
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.

Same environment as the attached reference image: the interior of a cylindrical alien ventilation tube built from concentric ribbed bands of grown bio-metal, oxblood and rust-red with dark umber gaps between the ribs, glowing red emergency strip lights set into the ribs, thick pipes running along the floor edges, faint teal-green light in the far distance, deep shadowy vignette at the frame edges, claw-scratch marks gouged into the ribs. Keep the same brushwork, palette and lighting as the reference.

A T-junction where the tube ends at a curved ribbed back wall and splits into two side tunnels. LEFT side tunnel: a round dark opening on the left wall occupying the left fifth of the frame, from about 30% to 70% down, with a faint sickly yellow-green haze drifting out of it. RIGHT side tunnel: a matching but narrower, darker opening on the right wall in the right fifth of the frame at the same height, its mouth partly choked with fallen debris, no light inside. CENTER of the back wall (the middle third of the frame, upper half): a cluster of crude claw-scratched marks, arrows and symbols gouged by a previous escapee. A band of dripping overhead pipes runs across the very top of the frame. The tube floor in the lower center is open and clear, slightly damp, with a few drifting dust motes showing air currents.

Low camera angle looking UP from knee-height, standing at the junction with the back wall straight ahead and the two tunnel mouths on either side. Saturated colors despite the dark mood — crimson emergency light, poisonous yellow-green glow spilling from the left tunnel, deep purple-black shadow in the right tunnel. No text, no UI elements, no people, no living creatures.
```

### Gas-Filled Passage — `backgrounds/act1_vent_gas_chamber.webp`
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.

Same environment as the attached reference image: the interior of a cylindrical alien ventilation tube built from concentric ribbed bands of grown bio-metal, oxblood and rust-red with dark umber gaps between the ribs, glowing red emergency strip lights set into the ribs, thick pipes running along the floor edges, faint teal-green light in the far distance, deep shadowy vignette at the frame edges, claw-scratch marks gouged into the ribs. Keep the same brushwork, palette and lighting as the reference.

A straight stretch of the tube flooded with toxic yellow-green gas. The tunnel recedes straight ahead to a vanishing point HIGH in the frame (upper center, about 15% down), fading into thick glowing murk. LEFT wall (left quarter of the frame, from about 20% to 70% down): a thick bio-organic pipe split open lengthwise like torn flesh, venting luminous yellow-green vapor that billows across the scene. RIGHT side, lower middle (from about 60% to 85% across, 40% to 75% down): the slumped, partially dissolved skeletal remains of a large alien creature lying against the tube wall, bones stained yellow by the gas. The floor in the lower center is clear and wet with chemical condensation. Red emergency strips glow orange where they shine through the green fog.

Low camera angle looking UP from knee-height down the length of the gassed tunnel. Saturated colors despite the dark mood — vivid yellow-green gas clouds, red emergency light turning to orange halos inside the haze, deep purple shadows on the ribbed walls. No text, no UI elements, no people, no living creatures (the skeletal remains described above are part of the scenery).
```

### Fan Chamber — `backgrounds/act1_vent_fan_room.webp`
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.

Same environment as the attached reference image: the interior of a cylindrical alien ventilation tube built from concentric ribbed bands of grown bio-metal, oxblood and rust-red with dark umber gaps between the ribs, glowing red emergency strip lights set into the ribs, thick pipes running along the floor edges, faint teal-green light in the far distance, deep shadowy vignette at the frame edges, claw-scratch marks gouged into the ribs. Keep the same brushwork, palette and lighting as the reference.

The tube is completely blocked by a MASSIVE ventilation fan facing the viewer. The fan disc is centered horizontally and spans from about 20% to 80% across the frame and from about 10% to 75% down: five broad dark iron blades on a central hub, painted as a motion blur with curved speed streaks, a heavy circular housing ring fused into the ribbed walls. The tunnel beyond is only hinted at through the blur. RIGHT wall (right fifth of the frame, from about 30% to 65% down): the fan's exposed drive mechanism, bio-organic muscle tissue wrapped around a metal axle, glistening and straining, with a clearly visible narrow gap in its housing. The tube floor in front of the fan (bottom quarter of the frame) is open, with dust and debris streaking toward the viewer in the wind. Red emergency light from above casts blade shadows across the walls.

Low camera angle looking UP from knee-height — the fan looms like a spinning wall. Saturated colors despite the dark mood — deep crimson emergency light, dark iron blades with bright gleaming edges, warm brown-purple muscle tissue on the mechanism. No text, no UI elements, no people, no living creatures.
```

### Collapsed Section — `backgrounds/act1_vent_collapsed.webp`
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.

Same environment as the attached reference image: the interior of a cylindrical alien ventilation tube built from concentric ribbed bands of grown bio-metal, oxblood and rust-red with dark umber gaps between the ribs, glowing red emergency strip lights set into the ribs, thick pipes running along the floor edges, faint teal-green light in the far distance, deep shadowy vignette at the frame edges, claw-scratch marks gouged into the ribs. Keep the same brushwork, palette and lighting as the reference.

A dead end. The tube ahead has caved in: a wall of fallen ceiling ribs, broken panels and rubble fills the middle of the frame (from about 30% to 75% across, 15% to 65% down), with the ship's living bio-material grown OVER the rubble like old scar tissue, showing the collapse happened long ago. Seated on the floor and propped against the right side of the rubble (from about 57% to 77% across, 35% to 75% down) is the SKELETON of a tall alien crew member: long angular limbs, elongated skull, far larger than a human. In its bony hands it holds a small datapad whose cold blue-white screen glow lights its skull and ribs. LEFT wall (from about 10% to 30% across, 40% to 70% down): desperate claw-scratch marks. One weak red emergency light remains, low on the left. The floor in the lower center is clear.

Low camera angle looking UP from knee-height — the seated skeleton still towers over the viewer. Saturated colors despite the dark mood — cool blue-white datapad glow against warm red emergency light, deep purple shadows in the rubble. No text, no UI elements, no people, no living creatures (the skeleton described above is part of the scenery).
```

### Exit Passage — `backgrounds/act1_vent_exit.webp`
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.

Same environment as the attached reference image: the interior of a cylindrical alien ventilation tube built from concentric ribbed bands of grown bio-metal, oxblood and rust-red with dark umber gaps between the ribs, glowing red emergency strip lights set into the ribs, thick pipes running along the floor edges, faint teal-green light in the far distance, deep shadowy vignette at the frame edges, claw-scratch marks gouged into the ribs. Keep the same brushwork, palette and lighting as the reference.

The last stretch of the tube, cleaner and more maintained: smoother grey-silver metal bands begin to replace the organic ribs. LEFT wall (from about 5% to 25% across, 20% to 63% down): a jagged crack through the hull wall showing deep black space full of bright stars, letting in a shaft of cool blue starlight across the tube. CENTER of the floor, in the lower middle of the frame (from about 36% to 64% across, 62% to 90% down): a rectangular hatch opening in the tube floor, glowing warm amber from the large chamber below, through which you can glimpse the top of docking clamps and the curved hull of an airlock bay. Clear flat floor surrounds the hatch, especially just beyond it in the middle of the frame. The tube continues out of frame behind the viewer.

Low camera angle from knee-height looking slightly DOWN toward the hatch opening, with the star crack to the left — a moment of wonder after the claustrophobic maze. Saturated colors despite the dark mood — cool blue starlight cutting across warm red emergency strips and the amber glow rising from the hatch, silver-grey metal, deep purple shadows. No text, no UI elements, no people, no living creatures.
```

## Maze Frame Prompts (Gemini / Nano Banana)

These are **edits of the Junction background**, so every generic screen shares its exact camera, geometry, and lighting. Cuts between screens should feel seamless, and the side openings land on the same nav hotspots. **Attach `backgrounds/act1_vent_junction.webp` as the reference image** for each. Generate LF, LT and DE (ST is optional); RF and RT are made by mirroring (`convert act1_vent_maze_lf.webp -flop act1_vent_maze_rf.webp`), so avoid anything that reads wrong when flipped (text, numbers).

Acceptance checks for each frame:
- Openings sit where the nav hotspots are: left opening about 10–31% across and 25–74% down; forward tunnel centered at about 40–62% across and 22–58% down.
- The floor in the lower center is clear for the character.
- The frame is anonymous. If Gemini adds a landmark (a skeleton, writing, a glowing panel), regenerate. Landmarks defeat the maze.

### Left + Forward (LF) — `backgrounds/act1_vent_maze_lf.webp` · mirror → `act1_vent_maze_rf.webp`
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.

EDIT the attached reference image (the vent T-junction chamber). Keep EVERYTHING identical — the exact camera position and height, the ribbed oxblood-and-rust chamber shape, the curved ceiling with its row of glowing red strip lights and dripping overhead pipe, the rusty floor pipes curving in at the bottom-left and bottom-right corners, the open damp floor in the center, the brushwork, palette and lighting — and change ONLY the following:
1) The flat back wall in the center (where the scratched symbols are) is replaced by the dark round mouth of a tunnel continuing STRAIGHT AHEAD, receding into darkness with a faint teal-green glow far away; the mouth spans the middle of the frame from about 40% to 62% across and 22% to 58% down. 2) The round opening in the LEFT wall stays exactly where it is, but its inside is plain darkness (no yellow-green haze). 3) The RIGHT wall where the right-hand opening was is now solid curved ribbed wall, continuous with the rest of the chamber — no opening at all.

Make it look like an ordinary, anonymous stretch of the same duct system: no scratched symbols, arrows or writing anywhere, no debris, no gas or haze, no unique landmarks — it must be indistinguishable from other generic duct screens. Low camera angle from knee-height. Saturated colors despite the dark mood — crimson emergency light, rust and oxblood ribs, deep purple-black shadows inside openings. No text, no UI elements, no people, no creatures.
```

### Left turn (LT) — `backgrounds/act1_vent_maze_lt.webp` · mirror → `act1_vent_maze_rt.webp`
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.

EDIT the attached reference image (the vent T-junction chamber). Keep EVERYTHING identical — the exact camera position and height, the ribbed oxblood-and-rust chamber shape, the curved ceiling with its row of glowing red strip lights and dripping overhead pipe, the rusty floor pipes curving in at the bottom-left and bottom-right corners, the open damp floor in the center, the brushwork, palette and lighting — and change ONLY the following:
1) The flat back wall in the center becomes plain, unmarked ribbed wall (remove all scratched symbols and arrows) — no way forward. 2) The round opening in the LEFT wall stays exactly where it is, but its inside is plain darkness (no yellow-green haze). 3) The RIGHT wall where the right-hand opening was is now solid curved ribbed wall, continuous with the rest of the chamber — no opening at all.

Make it look like an ordinary, anonymous stretch of the same duct system: no scratched symbols, arrows or writing anywhere, no debris, no gas or haze, no unique landmarks — it must be indistinguishable from other generic duct screens. Low camera angle from knee-height. Saturated colors despite the dark mood — crimson emergency light, rust and oxblood ribs, deep purple-black shadows inside openings. No text, no UI elements, no people, no creatures.
```

### Dead end (DE) — `backgrounds/act1_vent_maze_de.webp`
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.

EDIT the attached reference image (the vent T-junction chamber). Keep EVERYTHING identical — the exact camera position and height, the ribbed oxblood-and-rust chamber shape, the curved ceiling with its row of glowing red strip lights and dripping overhead pipe, the rusty floor pipes curving in at the bottom-left and bottom-right corners, the open damp floor in the center, the brushwork, palette and lighting — and change ONLY the following:
1) The flat back wall in the center becomes plain, unmarked ribbed wall with a heavy rusted grate bolted over a small sealed vent in its middle — no way forward. 2) BOTH round side openings are gone: the left and right walls are solid curved ribbed wall, continuous with the rest of the chamber. The space should feel like a sealed, airless dead end, with a few old claw scratches low on the left wall from something that tried to get out.

Make it look like an ordinary, anonymous stretch of the same duct system: no scratched symbols, arrows or writing anywhere, no debris, no gas or haze, no unique landmarks — it must be indistinguishable from other generic duct screens. Low camera angle from knee-height. Saturated colors despite the dark mood — crimson emergency light, rust and oxblood ribs, deep purple-black shadows inside openings. No text, no UI elements, no people, no creatures.
```

### Optional: Straight (ST) — `backgrounds/act1_vent_maze_st.webp`
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.

EDIT the attached reference image (the vent T-junction chamber). Keep EVERYTHING identical — the exact camera position and height, the ribbed oxblood-and-rust chamber shape, the curved ceiling with its row of glowing red strip lights and dripping overhead pipe, the rusty floor pipes curving in at the bottom-left and bottom-right corners, the open damp floor in the center, the brushwork, palette and lighting — and change ONLY the following:
1) The flat back wall in the center is replaced by the dark round mouth of a tunnel continuing STRAIGHT AHEAD, receding into darkness with a faint teal-green glow far away; the mouth spans the middle of the frame from about 40% to 62% across and 22% to 58% down. 2) BOTH round side openings are gone: the left and right walls are solid curved ribbed wall.

Make it look like an ordinary, anonymous stretch of the same duct system: no scratched symbols, arrows or writing anywhere, no debris, no gas or haze, no unique landmarks — it must be indistinguishable from other generic duct screens. Low camera angle from knee-height. Saturated colors despite the dark mood — crimson emergency light, rust and oxblood ribs, deep purple-black shadows inside openings. No text, no UI elements, no people, no creatures.
```

## v2 Implementation (done)

- **Frames:** `backgrounds/act1_vent_maze_{lf,lt,de}.webp` (generated as edits of the junction art), plus `act1_vent_maze_{rf,rt}.webp`, which are horizontal mirrors of LF and LT.
- **Views:** `act1_vent_maze_<cell>` for cells a–n (lower case; no `j`, which is the junction). All are named "Air Ducts" so the room label gives nothing away.
- **Each cell** has:
  - `flicker` room animation;
  - red ceiling and floor lights, plus a teal glow in the forward tunnel when the cell has a north exit;
  - the character at `(560,650)` (`(400,650)` on mirrored frames, `(480,650)` in the dead end), facing up.
- **Nav objects:** `nav_vent_maze_<cell>_<north|south|east|west>`, using the standard boxes from the Navigation Convention. The north box shifts to `(360,210)` on mirrored frames. The south strip is `(150,660)` 660×60.
- **Dead end `l`:** has `vent_maze_sealed_grate`.
- **Special rooms re-routed:**
  - Junction west → cell `a`; junction east → cell `g`;
  - Gas Chamber south → cell `f`;
  - Collapsed Section south → cell `i`.
- **Map:** LOOKing at `ventilation_map` shows `closeups/vent_map.webp`. It is drawn by `scenarios/the-harvest/scripts/draw_vent_map.py` (Python 3 + Pillow + NumPy) from the same grid as the table above. If the layout changes, edit the `CELLS` and `ROUTE` tables in that script and re-run `python3 scripts/draw_vent_map.py closeups/vent_map.webp` from the scenario folder.
- **Hints:** in every cell, the map hint names the direction of a shortest path to the Gas Chamber.
- **Verified:**
  - `validate-scenario.mjs`: clean except two known missing assets;
  - `softlock-search.mjs`: 15,287 states at the time of the maze build (27,371 now, after the Act 1 security simplification), 0 soft-locks, and the shortest win goes junction → W → N×4 → gas;
  - browser walk of the west route, the C–D loop, the dead end, the east arm to the Collapsed Section, and the east route to the gas.

## Implementation Notes (v1, kept for history)

- Reuse `act1_ventilation_shaft` as the entry room (just modify nav objects)
- All new views follow `act1_vent_*` naming convention
- Nav objects follow existing convention: `nav_{from}_to_{to}`
- Character placement consistent: x around 480, y around 450-550
- Ambient lighting per room: red base for all, yellow-green for gas, strobing for fan
- The `crew_datapad` item is Act 2 setup — examining it in Act 1 gives lore, actual use comes later
- Surgical probe consumption is a one-way gate — once used on the fan, it's gone
- Total new views: 5 (junction, gas, fan, collapsed, exit). Entry room modified.
- Total new objects: ~18-20
- Total new items: 1 (crew_datapad)
