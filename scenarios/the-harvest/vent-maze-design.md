# Vent Maze Design — Act 1

## Overview

The single `act1_ventilation_shaft` room becomes a **6-room maze** between the corridor and the airlock bay. The maze rewards preparation (getting the map and helmet beforehand) and punishes blind rushing with fair-but-lethal hazards.

## Maze Graph

```
                    Containment Corridor
                          │ (vent_cover, gated by security_locks_overridden)
                          ▼
                   ┌─────────────┐
                   │  VENT ENTRY │  ← wall scratches (ventilation_map)
                   │  (existing) │  ← vent_old_remains, maintenance_hatch
                   └──────┬──────┘
                          │ (forward/up)
                          ▼
                   ┌─────────────┐
                   │  JUNCTION   │  ← T-junction, LEFT or RIGHT
                   └──┬──────┬───┘
            LEFT ◄────┘      └────► RIGHT
                 ▼                    ▼
        ┌────────────┐       ┌────────────────┐
        │  GAS LEAK  │       │ COLLAPSED      │
        │  CHAMBER   │       │ SECTION        │
        │  ☠ hazard  │       │ (dead end +    │
        │  (helmet)  │       │  lore/item)    │
        └─────┬──────┘       └────────────────┘
              │ (forward)
              ▼
        ┌────────────┐
        │  FAN ROOM  │
        │  ☠ hazard  │
        │  (probe)   │
        └─────┬──────┘
              │ (forward)
              ▼
        ┌────────────┐
        │   EXIT     │
        │  PASSAGE   │
        └─────┬──────┘
              │
              ▼
          Airlock Bay
```

## Room Details

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
The probe is consumed when jamming the fan. This is the probe's ultimate purpose — it was useful for item uses in Act 1 (security keypad prying, etc.) but its final destiny is saving your life in the vent maze. Players who used it carefully will have it; it's not missable.

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

### Vent Junction (act1_vent_junction)
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.

Interior of an alien spaceship ventilation shaft T-junction. The walls are dark bio-organic metal — ribbed like the inside of a throat, glistening with moisture. The shaft splits LEFT and RIGHT. Red emergency strip-lights line the floor. The left tunnel has a faint yellow-green haze drifting from it. The right tunnel is narrower, darker, partially blocked by debris. Crude scratch marks cover the wall at the junction — arrows and symbols scratched by claws. Overhead pipes drip condensation. The atmosphere is claustrophobic, oppressive. Warm color palette: deep reds, dark purples, sickly greens in the left tunnel.

Low camera angle looking UP from knee-height — you are a small creature standing at the junction, tunnels stretching away at eye level in both directions. Saturated colors despite the dark mood — rich crimson emergency lights, deep purple shadows, poisonous yellow-green haze. No text, no UI elements, no characters.
```

### Gas Leak Chamber (act1_vent_gas_chamber)  
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.

Interior of an alien spaceship ventilation shaft filled with toxic yellow-green gas. The gas billows from a cracked bio-organic pipe on the left wall, the pipe's dark flesh split open and leaking luminous vapor. The vent tunnel continues forward into the haze. On the right side, the skeletal remains of a large alien creature slumped against the wall, partially dissolved by the gas. Emergency red lights barely penetrate the toxic fog, creating an eerie orange-green glow where the colors mix. The floor is wet with condensation from the chemical reaction. Visibility is low — the far end of the tunnel fades into poisonous murk.

Low camera angle looking UP from knee-height — the gas hangs at chest level for a standing human, but fills the view for our small protagonist. Saturated colors despite the dark mood — vivid yellow-green gas clouds, deep red emergency lights creating orange halos in the haze, dark purple shadows on the bio-organic walls. No text, no UI elements, no characters.
```

### Fan Room (act1_vent_fan_room)
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.

Interior of an alien spaceship ventilation shaft with a MASSIVE industrial fan blocking the passage. The fan fills the entire tunnel cross-section — five dark metal blades radiating from a central hub. The blades are a blur of motion (painted with motion streaks). On the right wall, the fan's drive mechanism is exposed — bio-organic muscle tissue wrapped around a metal axle, pulsing with effort, with a narrow gap visible in the housing. Red emergency lights cast dramatic shadows that strobe as the blades pass. Wind effect visible — dust and particles streaming toward the viewer. The tunnel continues beyond the fan, visible through the blur of the blades. The bio-organic walls vibrate from the fan's force.

Low camera angle looking UP from knee-height — the fan is enormous from this perspective, filling the tunnel like a wall of spinning death. Saturated colors despite the dark mood — deep crimson emergency lights, dark iron blade metal with gleaming edges, warm brown-purple of the bio-organic mechanism housing. No text, no UI elements, no characters.
```

### Collapsed Section (act1_vent_collapsed)
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.

Interior of a collapsed alien spaceship ventilation shaft — a dead end. Ceiling panels and bio-organic wall material have caved in, creating a wall of rubble blocking the tunnel. The organic ship material has grown OVER the rubble like scar tissue — this collapse happened long ago and the living ship partially healed around it. Propped against the rubble sits the SKELETON of a large alien creature (Choir species — tall, angular bones, elongated skull), holding a faintly glowing datapad in its bony hands. The blue-white glow of the datapad screen illuminates the skeleton's face. Scratch marks on the walls near the skeleton — final desperate markings. One dim emergency light still works, casting deep red shadows.

Low camera angle looking UP from knee-height — the skeleton towers even while seated, emphasizing the alien scale. Saturated colors despite the dark mood — the cool blue-white glow of the datapad contrasting with warm red emergency light and deep purple shadows in the collapsed rubble. No text, no UI elements, no characters.
```

### Exit Passage (act1_vent_exit)
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients, NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.

Interior of an alien spaceship ventilation shaft opening into a larger space. The vent tunnel slopes downward toward a rectangular hatch opening in the floor, through which you can see the ceiling of a large chamber below (the airlock bay). Through a crack in the vent wall on the left, STARS are visible — pinpoints of light in the black void of space, the first view of the outside. The crack lets in cool blue starlight that cuts across the warm red emergency lighting. The hatch opening below shows industrial docking equipment and the curved interior hull. The vent walls here are cleaner — less organic growth, more maintained metal, as this section connects to operational areas.

Low camera angle looking DOWN toward the hatch opening — the stars visible through the wall crack create a moment of wonder after the claustrophobic maze. Saturated colors despite the dark mood — cool blue starlight mixing with warm red emergency strips, silver-gray metal of the cleaner vent section, deep purple shadows. No text, no UI elements, no characters.
```

## Implementation Notes

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
