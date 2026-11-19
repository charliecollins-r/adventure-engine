# Vent maze v4 backgrounds

Painted from the Gemini runbook in the "Maze Revamp" doc (https://claude.ai/artifact/7LhBgnhSsfArfXRavecXa7).
They are wired into the game by the maze generator v4 (`scripts/design_vent_maze.py` / `scripts/build_vent_maze.py`);
until then the game still uses the v3 frames in `backgrounds/`.

| File | Runbook step | Openings (camera faces north) |
|------|--------------|-------------------------------|
| `maze_z1_deadend.webp` | 1 | none (the way back only) |
| `maze_z1_straight.webp` | 2 | ahead |
| `maze_z1_t.webp` | 3 | left, right |
| `maze_z1_cross.webp` | 4 | ahead, left, right |
| `maze_junction.webp` | 5 | left, right (haze and rubble removed) |
| `maze_z2_deadend.webp` | 6 | The Gut: none |
| `maze_z2_straight.webp` | 7 | The Gut: ahead |
| `maze_z2_bend.webp` | 8 | The Gut: left |
| `maze_z2_aheadside.webp` | 9 | The Gut: ahead, left |
| `maze_z2_t.webp` | 10 | The Gut: left, right |
| `maze_z2_cross.webp` | 11 | The Gut: ahead, left, right |
| `maze_z3_deadend.webp` | 12 | The Purge Core: none |
| `maze_z3_straight.webp` | 13 | The Purge Core: ahead |
| `maze_z3_bend.webp` | 14 | The Purge Core: left |
| `maze_z3_aheadside.webp` | 15 | The Purge Core: ahead, left |
| `maze_z3_t.webp` | 16 | The Purge Core: left, right |
| `maze_z3_cross.webp` | 17 | The Purge Core: ahead, left, right |
| `maze_camp.webp` | 18 | The Escapee's Camp (zone 2): a dead end |
| `maze_valve_closed.webp` | 19 | The Heart Valve, closed (zone 2): a heart valve (three leaflets in a cartilage ring); no way on until it opens |
| `maze_valve_open.webp` | 20 | The Heart Valve, open (zone 2): ahead |
| `maze_nursery.webp` | 21 | The Nursery (zone 2): a dead end; the glowing sacs are lower right |
| `maze_cache.webp` | 22 | The Collector's Cache (zone 3): a dead end; the membrane alcove is in the back wall |

The v3 frames `act1_vent_maze_lf/rf/lt/rt.webp` remain the ahead+side and bend screens; right-handed ones are mirrors.
Every v4 frame is an edit of `act1_vent_maze_lf.webp` with the same camera, ceiling, floor and pipes, so one hotspot
and floor geometry fits them all.
| `maze_grate_office.webp` | 23 | Looking down through the grate into the Curator's office (zone 3) |
| `maze_shaft.webp` | 24 | The Vertical Shaft (zone 2): the hole in the floor; the rope knuckle is on the right wall |

The sealed-back lips (runbook steps 25-27) are raw blue-screen pictures in `sprites/raw/maze_back_sealed.png`
(zone 1), `maze_z2_back_sealed.png` (the Gut) and `maze_z3_back_sealed.png` (the Purge Core). The generator keys them, squashes them to about half height and
sets them into the bottom edge of every duct screen with no way back (checked by eye over the straight screens).
