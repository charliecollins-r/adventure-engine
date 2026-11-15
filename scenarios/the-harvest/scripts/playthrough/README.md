# Act 1 playthrough harness

Plays The Harvest Act 1 end to end in a real browser (Playwright) against the dev server, in the order a
human would: every room, every LOOK, the side content, the maze, both close-ups and the ending. It writes
every in-game response to `full_log.json` and screenshots to `shots/`.

```bash
cd client && npm run dev                      # in another terminal (http://localhost:5173)
cd scenarios/the-harvest/scripts/playthrough
node full.cjs                                 # main playthrough -> shots/01_*.png ... and full_log.json
node extras.cjs                               # intro, all 13 maze ducts, both vent deaths
node walk.cjs                                 # click-to-walk in every walking view
node prisoner.cjs                             # the caged prisoner's story
node noise.cjs                                # brute-force guard, noise thresholds, hiding, caught
cd ../.. && python3 scripts/build_walkthrough_images.py scripts/playthrough/shots walkthrough
```

`lib.cjs` drives the UI: right-click cycles verbs, `A(g, verb, objectId)` clicks the rendered hotspot via its
`data-object-id`, `U(g, itemName, objectId)` uses an inventory item on an object, `combine` crafts. Rooms are
entered through their doors (not the dev panel), so on-enter effects such as the cat's second-visit
appearance fire as they do for a player. A `null` response for a MOVE means the move worked silently.

`shots/` and `full_log.json` are outputs; they are git-ignored.
