# The Harvest — Act 1 Level Design

## Navigation Map

```
                                    [POD CLUSTER]
                                    (close-up from
                                     Stasis Hold)
                                         |
                                         | (zoom)
                                         |
[STASIS HOLD] ←——— archway ———→ [CONTAINMENT CORRIDOR]
  (START)                          |        |        |
                              left door  far end  right door
                                  |        |        |
                          [PROCESSING   [FEEDING  [SECURITY
                             LAB]      STATION]     HUB]
                              |           |           |
                          passage    vent grate    archway
                              |           |           |
                          [MORGUE]  [VENTILATION  [SPECIMEN
                                      SHAFT]      ARCHIVE]
                                        |
                                    forward
                                        |
                                  [AIRLOCK BAY]
                                    (END)
```

## Room-by-Room Design

### 1. Stasis Hold (START)
**Background**: `act1_stasis_hold.webp`
**Purpose**: Wake up, establish setting, gather first items.
**Mood**: Dread + wonder. Hundreds of specimens in amber pods. You were one of them.

**Key Visual Features**:
- Lower-left: Broken stasis pod (player's), amber fluid pooling
- Both walls: Tiered racks of occupied amber pods with creatures
- Right wall: Green bioluminescent neural network pulsing
- Upper-center: Dark archway between pod rows (exit to corridor)
- Metal catwalk/railing running through middle

**Interactive Objects**:
| Object | Position (960x720) | What It Does |
|--------|-------------------|-------------|
| broken_pod | (200, 500) | Look: establish story. Hand: find specimen tag. |
| pod_drainage_channel | (200, 650) | Look: amber fluid. Hand: collect stasis fluid vial. |
| occupied_pods | (480, 250) | Look: zooms to Pod Cluster close-up. |
| specimen_tag_hook | (320, 560) | Look/Hand: find specimen tag near pod. |

**Navigation**:
| Exit | Position | Destination |
|------|----------|-------------|
| Archway (upper-center) | (400, 150) | Containment Corridor |

**Items Found Here**: stasis_fluid_vial, pod_glass_shard, specimen_tag

---

### 2. Pod Cluster (CLOSE-UP from Stasis Hold)
**Background**: `act1_pod_cluster.webp`
**Purpose**: Examine specimens, find the preserved insect (puzzle item), read alien labels.
**Type**: Close-up view (not a navigable room). Accessed by looking at occupied_pods.

**Key Visual Features**:
- 7 amber pods in flower/radial arrangement around green central hub
- Each pod contains a different creature with alien script label
- Bottom: Organic control panel with bumpy buttons

**Interactive Objects**:
| Object | Position (960x720) | What It Does |
|--------|-------------------|-------------|
| pod_labels | (550, 100) | Look: alien text, can't read it yet. |
| pod_cluster_controls | (480, 620) | Hand: cycle pod display. |
| preserved_insect | (200, 250) | Hand: take preserved insect specimen. |

**Navigation**: Back button returns to Stasis Hold.

---

### 3. Containment Corridor (HUB)
**Background**: `act1_containment_corridor.webp`
**Purpose**: Central hub connecting to all branches. No puzzles — pure navigation.
**Mood**: Claustrophobic. Long organic tunnel with amber lights, metal grating floor.

**Key Visual Features**:
- One-point perspective looking down a tunnel
- Left wall: Heavy sealed door (leads to Processing Lab)
- Right wall: Door with translucent panels (leads to Security Hub)
- Far end: Corridor recedes into darkness (leads to Feeding Station)
- Floor: Metal grating with green-glowing tubes underneath
- Ceiling: Curved organic tunnel, dense pipes, 3 amber light fixtures

**Interactive Objects**:
| Object | Position (960x720) | What It Does |
|--------|-------------------|-------------|
| corridor_pipes | (480, 80) | Look: "Organic conduits pulse with green fluid." |
| floor_grating | (480, 580) | Look: "Green-glowing tubes hum underneath." |

**Navigation**:
| Exit | Position | Destination | Visual Feature |
|------|----------|-------------|---------------|
| Behind camera | (480, 680) | Stasis Hold | Where you came from |
| Left door | (120, 300) | Processing Lab | Heavy sealed door on left wall |
| Right door | (700, 300) | Security Hub | Translucent-paneled door on right |
| Far end | (480, 180) | Feeding Station | Dark end of corridor |

---

### 4. Processing Lab
**Background**: `act1_processing_lab.webp`
**Purpose**: Find surgical probe, examine specimen jars and holographic displays, discover what the ship does to specimens.
**Mood**: Clinical horror. Examination tables with organic restraints. They process living things here.

**Key Visual Features**:
- Foreground: Examination table with bone/organic surgical instruments scattered
- Middle: 3-4 examination tables with restraint straps
- Left wall: Shelves of specimen jars (amber liquid, creatures)
- Upper-left: Large green holographic screen (insect anatomy)
- Upper-right: Large green holographic screen (brain/organ anatomy)
- Back center: Large dark archway (exit to Containment Corridor)

**Interactive Objects**:
| Object | Position (960x720) | What It Does |
|--------|-------------------|-------------|
| examination_tables | (480, 450) | Look: describe restraints. Hand: find nothing useful. |
| instrument_rack | (450, 620) | Hand: take surgical probe. |
| sample_jars | (80, 300) | Look: describe preserved specimens. |
| lab_startup_display | (280, 170) | Look/Hand: read alien research data. |

**Navigation**:
| Exit | Position | Destination | Visual Feature |
|------|----------|-------------|---------------|
| Back archway | (480, 180) | Containment Corridor | Large dark archway center-back |
| Right passage | (880, 380) | Morgue | Hint of passage on far right |

---

### 5. Morgue
**Background**: `act1_morgue.webp`
**Purpose**: Find the neural tendril sample, discover what happens to "processed" specimens.
**Mood**: Cold dread. Blue-lit. Things died here. Things were... recycled.

**Key Visual Features**:
- Left wall: Grid of morgue drawers (6x8), several pulled open showing alien remains
- Right wall: Same drawer grid, fewer open
- Center: Metal autopsy slab/table on pedestal
- Back: Large cylindrical recycling vats with tubes to ceiling
- Lower-left foreground: Large open drawer with dark silhouette inside
- Cold teal/cyan overhead lighting

**Interactive Objects**:
| Object | Position (960x720) | What It Does |
|--------|-------------------|-------------|
| morgue_drawers | (130, 300) | Look: describe contents. Hand: open more drawers. |
| autopsy_slab | (500, 400) | Look: describe surgical marks. |
| recycling_vats | (550, 160) | Look: describe processing. Hand: too hot to touch. |
| neural_tendril_sample | (130, 530) | Hand: take severed neural tendril from open drawer. |

**Navigation**:
| Exit | Position | Destination |
|------|----------|-------------|
| Behind camera | (480, 680) | Processing Lab |

---

### 6. Security Hub
**Background**: `act1_security_hub.webp`
**Purpose**: Find containment key card, observe other rooms through monitors, discover the ship's surveillance system.
**Mood**: Voyeuristic unease. You're watching the monitors — but who watches you?

**Key Visual Features**:
- Back wall: 5 monitors in organic frames showing different rooms
  - Far left: Specimen jars (Processing Lab feed)
  - Left: Corridor view
  - Center: Red circular view (Ventilation Shaft feed)
  - Center-right: CRACKED monitor (spider-web pattern)
  - Far right: Archive room with crystal shelves (Specimen Archive feed)
- Center-foreground: Large organic control console with buttons/tubes
- Left: Bone/organic ergonomic chair
- Dense green indicator lights on walls

**Interactive Objects**:
| Object | Position (960x720) | What It Does |
|--------|-------------------|-------------|
| security_console | (480, 470) | Hand: access security systems. |
| cracked_screen | (540, 200) | Look: "Spider-web cracks. Whatever hit this was angry." |
| key_card_drawer | (350, 560) | Hand: find containment key card (gated by flag). |

**Navigation**:
| Exit | Position | Destination | Visual Feature |
|------|----------|-------------|---------------|
| Behind camera | (480, 680) | Containment Corridor | Behind you |
| Right side | (860, 340) | Specimen Archive | Right monitor shows archive |

---

### 7. Specimen Archive
**Background**: `act1_specimen_archive.webp`
**Purpose**: Find data crystal and personal log, learn about the Convergence's collection of worlds.
**Mood**: Cathedral awe. This is a library of consumed worlds.

**Key Visual Features**:
- Both walls: Floor-to-ceiling purple/blue glowing crystal containers in grid slots
- Center: Ornate organic pedestal projecting holographic planet displays
- Floating holograms: Earth, Mars-like planet, world maps, alien text
- Right side: Large arched doorway/passage
- Two small benches flanking the pedestal

**Interactive Objects**:
| Object | Position (960x720) | What It Does |
|--------|-------------------|-------------|
| crystal_rack | (100, 300) | Look: thousands of data crystals. Hand: too high to reach most. |
| personal_log_crystal | (200, 480) | Hand: take data crystal from lower shelf. |
| reading_device | (480, 500) | Hand: insert crystal to read logs. |
| holographic_display | (480, 200) | Look: planets being cataloged. Earth is among them. |

**Navigation**:
| Exit | Position | Destination | Visual Feature |
|------|----------|-------------|---------------|
| Right archway | (850, 350) | Security Hub | Large arched passage |

---

### 8. Feeding Station
**Background**: `act1_feeding_station.webp`
**Purpose**: Find nutrient paste tube, understand the feeding/extraction system, access ventilation shaft.
**Mood**: Visceral disgust. This is where they feed... or feed ON... the specimens.

**Key Visual Features**:
- Left wall: 3 alcoves with purple energy barrier enclosures, green monitors above each
- Center-right: Large bulbous organic feeding apparatus hanging from ceiling
- Right foreground: Feeding bench/chair with tubes
- Far right: Green monitor screens showing specimen data
- Far left: Dark passage/door visible behind alcoves (exit to corridor)
- Small console/panel on lower-left wall

**Interactive Objects**:
| Object | Position (960x720) | What It Does |
|--------|-------------------|-------------|
| nutrient_dispenser | (620, 340) | Hand: dispense nutrient paste tube. |
| feeding_troughs | (400, 530) | Look: describe feeding mechanism. |
| energy_barrier_enclosures | (200, 300) | Look: specimens held behind barriers. Hand: barrier shocks. |

**Navigation**:
| Exit | Position | Destination | Visual Feature |
|------|----------|-------------|---------------|
| Far left passage | (40, 380) | Containment Corridor | Dark door behind alcoves |
| Floor vent | (480, 680) | Ventilation Shaft | Vent grate in floor |

---

### 9. Ventilation Shaft
**Background**: `act1_ventilation_shaft.webp`
**Purpose**: Alternate route, find ventilation map, discover claw marks (foreshadowing).
**Mood**: Claustrophobic terror. Red emergency lights. Something has been scratching the walls.

**Key Visual Features**:
- Cylindrical tunnel with concentric ring ribbing
- Red/orange emergency lighting strips
- Claw marks/scratches on left and right walls
- Pipes and cables running along floor
- Teal-green lit opening at far end (exit to Airlock Bay)
- Linear — one direction forward, one back

**Interactive Objects**:
| Object | Position (960x720) | What It Does |
|--------|-------------------|-------------|
| wall_scratches | (200, 340) | Look: "Deep gouges. Something with claws tried to escape." |
| shaft_branches | (500, 300) | Look: describe the junction ahead. |

**Navigation**:
| Exit | Position | Destination | Visual Feature |
|------|----------|-------------|---------------|
| Behind (bottom) | (480, 680) | Feeding Station | Where you entered |
| Forward (center) | (480, 300) | Airlock Bay | Teal-green lit opening |

---

### 10. Airlock Bay (END)
**Background**: `act1_airlock_bay.webp` / `act1_airlock_bay_alt.webp`
**Purpose**: Endgame. Use collected items to open the airlock and escape.
**Mood**: Hope + vertigo. Earth visible through the viewport. Freedom is one door away.

**Key Visual Features**:
- Left: Large viewport showing Earth from orbit
- Center: Massive hexagonal airlock door with orange-glowing seam lines
- Left of door: Locking mechanism/override control panel
- Right: Space suit standing in alcove/locker
- Floor: Metal grating with tracks leading to blast door

**Interactive Objects**:
| Object | Position (960x720) | What It Does |
|--------|-------------------|-------------|
| airlock_viewport | (150, 300) | Look: "Earth. You're in orbit. You have to get down there." |
| blast_doors | (500, 320) | Hand/Use: locked. Need key card + override sequence. |
| airlock_override_panel | (370, 460) | Hand/Use: access override (needs key card first). |
| suit_locker | (810, 330) | Hand: take emergency suit helmet. |
| empty_docking_clamps | (500, 580) | Look: "Heavy clamps. Something used to dock here." |

**Navigation**:
| Exit | Position | Destination |
|------|----------|-------------|
| Behind camera | (480, 680) | Ventilation Shaft |

---

## Puzzle Flow

```
START: Wake in Stasis Hold
  │
  ├─ Take: specimen_tag (from broken pod)
  ├─ Take: pod_glass_shard (from broken pod)
  ├─ Take: stasis_fluid_vial (from drainage channel)
  │
  ├─ Zoom: Pod Cluster (from occupied_pods)
  │   └─ Take: preserved_insect (to use later)
  │
  └─ Move: to Containment Corridor
      │
      ├─ LEFT → Processing Lab
      │   ├─ Take: surgical_probe (from instrument rack)
      │   ├─ Read: lab displays (learn about the ship)
      │   └─ → Morgue
      │       ├─ Take: neural_tendril_sample
      │       └─ Examine: recycling vats, drawers
      │
      ├─ RIGHT → Security Hub
      │   ├─ Take: containment_key_card (from drawer, gated)
      │   ├─ Examine: monitors (see other rooms)
      │   └─ → Specimen Archive
      │       ├─ Take: data_crystal / personal_log_crystal
      │       ├─ Use: reading_device (insert crystal)
      │       └─ Examine: holographic display (Earth!)
      │
      └─ FAR END → Feeding Station
          ├─ Take: nutrient_paste_tube
          ├─ Examine: energy barriers, feeding apparatus
          └─ → Ventilation Shaft
              ├─ Examine: claw marks (foreshadowing)
              ├─ Find: ventilation_map (scratched on wall)
              └─ → Airlock Bay (END)
                  ├─ Take: emergency_suit_helmet (from suit locker)
                  ├─ Use: containment_key_card on override_panel
                  ├─ Use: surgical_probe on blast_doors
                  └─ WIN: blast_doors open → escape
```

---

## Background Regeneration Prompts (Gemini / Imagen 3)

Each prompt follows the standard formula. Use these to regenerate backgrounds that better align with the hotspot layout described above.

### Common Prefix
```
2D gouache illustration, game background art in the style of 1990s Sierra On-Line
King's Quest V and King's Quest VI. Visible brushstrokes, soft color gradients,
NOT photorealistic, NOT 3D rendered. 16:9 aspect ratio, 1920x1080.
```

### Common Suffix
```
Low camera angle looking UP from knee-height. Saturated colors despite dark mood.
No text, no UI elements, no characters.
```

### 1. Stasis Hold
```
[PREFIX]
Interior of a massive alien bio-mechanical stasis chamber. Walls lined floor-to-ceiling
with rows of amber-lit stasis pods containing various alien creatures (insects, reptiles,
tentacled organisms) in suspended animation fluid. A CRACKED OPEN pod lies in the
lower-left foreground, broken glass and amber fluid pooling on the organic-metal floor.
Metal catwalk/railing runs horizontally through the middle of the scene. The right wall
features a large glowing GREEN BIOLUMINESCENT NEURAL NETWORK of pulsing veins embedded
in the organic wall surface. Upper-center-left: a CLEARLY VISIBLE DARK ARCHWAY between
the pod racks leading to a corridor — this is the only exit and must be prominent.
Color palette: deep amber/gold pods, dark green-black organic walls, bright green neural
network veins, teal floor grating.
[SUFFIX] — looking up at towering pod racks from the floor near the broken pod.
```

### 2. Pod Cluster (Close-Up)
```
[PREFIX]
EXTREME CLOSE-UP of a circular flower-petal arrangement of 7 alien stasis pods mounted
on a bio-mechanical wall panel. Each pod is a rounded amber-lit capsule containing a
different preserved specimen (a bee/wasp, a tentacled creature, a crustacean, an insect,
a fish, a leaf/plant form, an amphibian). Alien script labels beneath each pod in
green-glowing text. A central green-glowing hub node connects all 7 pods with organic
tubes. At the bottom: an organic CONTROL PANEL with bumpy mushroom-like buttons.
The entire view is a wall-mounted display — NO floor, NO doors, NO room visible.
Just the specimen display panel filling the frame.
Color palette: amber pod glow, dark green-black organic frame, green bioluminescent
accents, alien text in green.
[SUFFIX] — looking straight at the wall panel from arm's reach.
```

### 3. Containment Corridor
```
[PREFIX]
Long organic-mechanical corridor viewed from one end, strong ONE-POINT PERSPECTIVE
looking down its length. Curved tubular ceiling with dense organic pipes. THREE AMBER
LIGHT FIXTURES on the ceiling. Metal grating floor with GREEN-GLOWING TUBES visible
underneath through the grate. LEFT WALL: a CLEARLY VISIBLE HEAVY SEALED DOOR (armored,
industrial hatch with wheel lock) at about 1/3 of the way down. RIGHT WALL: a CLEARLY
VISIBLE DOOR WITH TRANSLUCENT PANELS (slightly different style, with small windows)
at about 1/3 of the way down. FAR END: corridor darkens and recedes into shadow —
another passage continues. Behind the viewer (not shown): the stasis hold entrance.
Color palette: amber ceiling lights, dark green-teal organic walls, green floor glow,
rust-brown pipe accents.
[SUFFIX] — standing at one end looking down the corridor's full length.
```

### 4. Processing Lab
```
[PREFIX]
Alien surgical laboratory. FOREGROUND (bottom): examination table with scattered
bone-white surgical instruments (scalpels, probes, clamps — organic/grown, not metal).
MIDDLE: 3-4 examination tables with organic restraint straps arranged in rows, lit by
overhead white lights. LEFT WALL: shelves of SPECIMEN JARS filled with amber liquid
containing small preserved creatures. UPPER-LEFT: large GREEN HOLOGRAPHIC SCREEN
displaying alien insect anatomy diagram with alien text. UPPER-RIGHT: large GREEN
HOLOGRAPHIC SCREEN displaying alien brain/organ anatomy. BACK CENTER: CLEARLY VISIBLE
LARGE DARK ARCHWAY leading out to a corridor — this is the main exit and must be
prominent and unmistakable. FAR RIGHT: a SMALLER SIDE PASSAGE partially visible at
the right edge, leading to another room.
Color palette: cold blue-white surgical lighting, green holographic screens, amber
specimen jars, bone-white instruments, dark organic walls.
[SUFFIX] — from the floor near the closest examination table, looking up at the tables
and archway beyond.
```

### 5. Morgue
```
[PREFIX]
Cold alien morgue/cold storage. LEFT WALL: floor-to-ceiling grid of rectangular
specimen drawers (6 rows x 8 columns), several PULLED OPEN showing alien remains
inside (organic tissue, partial specimens). RIGHT WALL: same drawer grid, fewer open,
one drawer on the lower-right has something visible. CENTER: metal AUTOPSY SLAB on a
pedestal with overhead surgical lights. BACK CENTER: two large CYLINDRICAL RECYCLING
VATS/TANKS with tubes connecting to the ceiling, faintly glowing. LOWER-LEFT
FOREGROUND: one large open drawer pulled way out, showing a DARK SILHOUETTE of
something humanoid inside. Floor: metal grating. The only exit is BEHIND THE CAMERA
(not visible).
Color palette: COLD TEAL/CYAN overhead lighting (this room should feel distinctly
colder than others), dark drawer grid, stainless autopsy slab, green glow from vats.
[SUFFIX] — from knee-height near the open foreground drawer, looking across to the
vats at the back.
```

### 6. Security Hub
```
[PREFIX]
Small alien control room/surveillance station. BACK WALL: 5 MONITOR SCREENS embedded
in organic framework showing different camera feeds. From left to right: (1) specimen
jars on shelves, (2) a corridor view, (3) red circular ventilation shaft view, (4)
CRACKED/BROKEN screen with spider-web fracture pattern, (5) a room with glowing
blue-purple crystal shelves. CENTER-FOREGROUND: large organic CONTROL CONSOLE covered
in buttons, tubes, and biological switches. LEFT: organic ERGONOMIC CHAIR that looks
grown, not built. Dense organic pipes and small GREEN INDICATOR LIGHTS on all walls.
Floor: metal grating. The only entrance is BEHIND THE CAMERA (not visible). The right
side of the room, past the rightmost monitor, has a DARK PASSAGE visible leading
somewhere else.
Color palette: teal-green monitor glow, dark organic walls, amber-brown console,
green indicator lights, red glow from the center monitor.
[SUFFIX] — from floor level looking up at the wall of monitors and the console.
```

### 7. Specimen Archive
```
[PREFIX]
Grand cathedral-like alien chamber. BOTH WALLS: floor-to-ceiling racks of GLOWING
PURPLE-BLUE DATA CRYSTALS stored in grid-like slots — hundreds of crystals of
various shapes. CENTER: ornate organic PEDESTAL DEVICE on a cross-shaped floor mount,
projecting multiple HOLOGRAPHIC DISPLAYS floating in the air above it — showing
PLANETS (Earth clearly visible, plus Mars-like world, gas giant), STAR MAPS with
routes, and alien text/data. Two small STONE BENCHES flanking the pedestal. RIGHT
SIDE: a LARGE ARCHED DOORWAY/PASSAGE leading to another area — the only exit, clearly
visible. Floor: metal grating with root-like organic structures. The light in this
room is predominantly purple-blue from the crystals.
Color palette: purple-blue crystal glow dominant, holographic teal/green projections,
dark organic walls, bone-white pedestal.
[SUFFIX] — from the floor looking up at the floating holographic displays and the
crystal walls towering above.
```

### 8. Feeding Station
```
[PREFIX]
Alien feeding/extraction bay. LEFT WALL: 3 RECTANGULAR ALCOVES separated by pillars,
each containing a PURPLE ENERGY BARRIER (crackling electric/plasma field) with small
green monitor screens above each alcove showing specimen data. A DARK PASSAGE/DOOR
visible at the FAR LEFT behind the alcoves — this is an exit and should be clearly
visible. CENTER-RIGHT: large BULBOUS ORGANIC FEEDING APPARATUS suspended from ceiling
by multiple tubes — looks like a bloated biological organ/sac. RIGHT FOREGROUND:
feeding BENCH/CHAIR with tubes attached, plus green MONITOR SCREENS on the right wall.
Floor: organic grating with tube networks. The floor near the center-bottom has a
VENTILATION GRATE that could be pried open.
Color palette: purple energy barrier glow, green monitors, dark olive-green organic
walls, amber tube accents.
[SUFFIX] — from floor level looking up at the feeding apparatus hanging above.
```

### 9. Ventilation Shaft
```
[PREFIX]
Looking straight down a CYLINDRICAL VENTILATION SHAFT/TUNNEL. Concentric circular
RIBBED STRUCTURAL RINGS receding into the distance. RED/ORANGE EMERGENCY LIGHTING
STRIPS along the ribs. Pipes and cables running along the bottom of the shaft. CLAW
MARKS/DEEP SCRATCHES gouged into the walls on both left and right sides. The shaft
is LINEAR — no branches, no T-junctions, just a straight tube. At the FAR END: a
TEAL-GREEN LIT OPENING where the shaft exits into a larger room. Dark, claustrophobic.
Strong circular perspective.
Color palette: RED emergency lighting dominant, dark metallic tunnel walls, teal-green
exit glow at far end, deep scratches revealing lighter material underneath.
[SUFFIX] — from inside the shaft looking down its length toward the green-lit exit.
```

### 10. Airlock Bay
```
[PREFIX]
Alien airlock chamber. LEFT: large VIEWPORT/WINDOW showing EARTH from orbit — blue
planet with white clouds, clearly identifiable, beautiful against black space. CENTER:
massive HEXAGONAL/OCTAGONAL AIRLOCK BLAST DOOR with ORANGE-GLOWING SEAM LINES around
its border, heavy industrial locking mechanisms. LEFT OF DOOR: a CONTROL PANEL /
OVERRIDE MECHANISM mounted on the wall with levers and buttons. RIGHT: a SPACE SUIT
standing in an ALCOVE/LOCKER — full suit mounted on a frame, helmet attached, ready
to wear. Floor: metal grating with TRACKS/RAILS leading to the blast door. The only
entrance is BEHIND THE CAMERA (not visible). Dense organic pipes on ceiling.
Color palette: blue Earth light through viewport, orange airlock door glow, dark
green-grey walls, metallic floor, suit alcove shadow.
[SUFFIX] — from floor level looking up at the massive blast door with Earth visible
through the window to the left.
```
