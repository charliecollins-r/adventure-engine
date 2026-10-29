# The Butcher's Debt — Scenario Documentation

## Story Synopsis

You wake on the concrete floor of a walk-in freezer, breath crystallizing in front of you. Beyond the heavy steel door, a butcher whistles while he works. Sal Morano — barrel-chested, fifties, slicked-back hair going gray — thinks you saw something you shouldn't have. In this part of 1970s Chicago, witnesses don't make it to morning. Find a way out before you become tomorrow's special.

Sal's been a butcher for thirty years and a killer for nearly as long. He works for the Ricci crime family, using his shop as a front for disposing of problems. His freezer has held more than cattle. He's methodical, whistles Sinatra, talks to his meat as if it were old friends, and has a twisted sense of humor about "fresh cuts." But he's not invulnerable — he's paranoid about his boss Tony Ricci, sloppy about where he keeps his secrets, and the shop is full of evidence that could put him away forever.

The scenario is a race against two clocks: hypothermia in the freezer (you have about 5 minutes before you die of cold), and Sal's closing routine once you escape. Three paths lead to freedom: gather evidence and call the police, smash your way out through the loading dock, or blackmail the mob with Sal's own secrets.

**Difficulty**: Hard | **Estimated Time**: 15 minutes | **Patterns Used**: 26

---

## Image Descriptions

### Background Images (4 total)

1. **`backgrounds/walk_in_freezer.png`** — A commercial walk-in freezer, roughly 10x12 feet. Stainless steel walls coated in frost. A heavy insulated steel door with interior hinges (important — the hinge pins are accessible from inside). Hanging from ceiling rails: several beef carcasses on steel hooks, with enough space between two to hide a person. A metal shelving unit against one wall with frozen goods. A floor drain with a grate. A ventilation grate near the ceiling. A fuse panel (closed) on the wall by the door. A mop bucket frozen to the floor. Stacked cardboard boxes in a corner (hiding a crowbar behind them). An apron hook with a bloodstained butcher's apron hanging from it. A wall-mounted thermometer showing 28°F. Everything is frosted, cold, industrial. Fluorescent light buzzing overhead. The atmosphere is oppressive cold — you can almost feel it.

2. **`backgrounds/butcher_counter.png`** — The main butcher shop counter area, viewed from behind the counter (the work side). A massive wooden cutting board, scarred and stained dark. A magnetic knife rack on the wall with professional butcher knives. An industrial meat grinder bolted to the counter (capable of running and making tremendous noise). An old-fashioned cash register (the kind with push buttons and a hand crank). An order pad. A wall calendar (October 1973, with handwritten notes). A wall-mounted telephone (rotary, cream-colored, coiled cord). A glass display case with cuts of meat. The floor is covered in sawdust. A folded newspaper on the counter — today's Chicago Tribune. Sinatra plays from a radio somewhere. The shop is period-authentic 1970s — linoleum, wood paneling, tin ceiling. Through a doorway or window you can see the front of the shop is dark (closed for the night).

3. **`backgrounds/back_office.png`** — Sal's cramped back office. A battered metal desk with a locked center drawer. A filing cabinet (4-drawer, olive green, 1970s government-surplus look). A desk phone (black rotary). A leather briefcase under the desk (locked, combination dials). A painting on the wall hiding a wall safe behind it. A coat rack with Sal's overcoat and fedora. A waste basket overflowing with receipts and papers. An open ledger book on the desk (accounts visible). A framed family photo on the desk — Sal with a woman and two children, everyone smiling, a different life. A small window (locked, painted shut, barred from outside). The office is messy in a lived-in way — Sal spends a lot of time here. Cigar ash in an ashtray. A half-empty bottle of Chianti. The filing cabinet has a drawer labeled "PERSONAL."

4. **`backgrounds/loading_dock.png`** — The shop's loading dock / receiving area. A large roll-up door with a heavy padlock and chain (the main way trucks deliver). A chain hoist mounted on a ceiling beam (for moving heavy carcasses). A stack of wooden pallets (tall enough to hide behind). A delivery clipboard hanging from a nail. A circuit breaker box on the wall. A wall-mounted fire extinguisher (red CO2 type). A side door to the alley (locked, but less fortified than the roll-up). A commercial dumpster against one wall. Concrete floor with drain channels. The loading dock opens to a dark alley — freedom. A bare bulb overhead. Cold air seeps in around the roll-up door's edges. Period details: a "NO PARKING — DELIVERIES ONLY" sign, a hand truck leaning against the wall.

---

## Game Flow

### Phase 1: Hypothermia Setting In
You start on the freezer floor. Sal checks every 120 seconds with a high noise threshold (65) — he thinks you're unconscious and out of his hair. But you're dying of cold.

**Timed pressure (events)**:
- 120s: Hypothermia warning — fingers numb, thinking foggy
- 240s: Hypothermia critical — vision tunneling, barely functional
- 330s: Death — game over from cold

**Immediate goal**: Escape the freezer before you freeze.

1. **Take the meat hook** from the hanging rail — your primary tool (Gateway Puzzle)
2. **Take the apron** from the hook, search it — find a crumpled receipt (Hardware receipt, order #1953) — this is the office keypad code (Dual-Purpose Item)
3. **Use meat hook on freezer door hinges** — pry the hinge pins to force the door (noise: 30)
4. **Alternative**: Find the crowbar behind the cardboard boxes for a different approach

### Phase 2: The Shop Floor
You've escaped the freezer. Sinatra croons on the radio. Sal's cleaver hits the cutting block. The clock ticks toward midnight. Check interval drops to 55s, noise threshold 50.

**Three parallel chains open up** (The Fork):

**Chain A — Evidence gathering** (police rescue):
- Read the newspaper → learn Tony Ricci's name and context
- Enter the office code (1953 from the receipt) on the keypad
- In the office: search filing cabinet → Polaroid photos
- Search waste basket → ledger clue (briefcase combo matches order number)
- Open desk drawer (key from under cash register, or force with hook)
- Get the black book — Sal's private ledger of mob activities
- Combine black book + photos → evidence package
- Create a distraction → call 911 from a phone
- Wait for police

**Chain B — Loading dock breakout** (brute force):
- Navigate to loading dock
- Cut chain from the hoist → chain link piece
- Combine crowbar + chain → reinforced pry bar
- Use pry bar on roll-up door padlock → break it
- Open the door → escape into the alley

**Chain C — Blackmail** (the deal with the devil):
- Get the black book from the office
- Learn Tony's phone number from the newspaper
- Create a distraction → call Tony from a phone
- Deliver the ultimatum: you walk, or the book goes to the feds
- Tony sends a car → escape via the alley door

### Phase 3: Closing Time
Triggered when Sal discovers his evidence is missing. Check interval plummets to 20s, threshold 15. He's tearing the shop apart, screaming, completely unhinged.

---

## Items & Dynamics

| Item | How Obtained | Primary Use | Secondary/Hidden Use |
|------|-------------|-------------|---------------------|
| **Meat Hook** | Pull from freezer rail | Pry freezer hinges, force locks | Combine with chain for grapple |
| **Bloodstained Apron** | Apron hook in freezer | Search: reveals hardware receipt | Combine with knife for wrapped blade |
| **Hardware Receipt** | Hidden in apron pocket | Examine: reveals office code 1953 | Dual-Purpose Item |
| **Butcher Knife** | Knife rack on counter | Cut chain, threaten, general tool | Combine with apron for quiet grip |
| **Office Key** | Taped under cash register | Open desk drawer cleanly | — |
| **Black Book** | Desk drawer (key or force) | Evidence for police OR blackmail Tony | Combine with photos for evidence package |
| **Polaroid Photos** | Filing cabinet "PERSONAL" | Evidence (incriminating photos) | Combine with book for evidence package |
| **Chain Link Piece** | Cut from chain hoist | Combine with crowbar for pry bar | Combine with hook for grapple |
| **Ceramic Fuse** | Pull from fuse panel | Kill the lights (distraction) | — |
| **Newspaper** | Counter | Examine: learn Tony's number (555-0134) | Knowledge Gate |
| **Fire Extinguisher** | Loading dock wall | Break alley door lock, create smoke distraction | — |
| **Delivery Schedule** | Loading dock clipboard | Learn delivery truck arrival time | — |
| **Crowbar** | Behind cardboard boxes | Pry, break, leverage | Combine with chain for reinforced bar |
| **Sal's Wallet** | Coat rack in office | Contains personal info | — |
| **Evidence Package** | Combine: book + photos | Call police with assembled case | Win condition |
| **Hook and Chain** | Combine: hook + chain | Grapple, weapon | — |
| **Reinforced Pry Bar** | Combine: crowbar + chain | Break the roll-up door padlock | — |
| **Wrapped Blade** | Combine: knife + apron | Quieter cutting, better grip | — |

### Key Dynamics

- **Hypothermia Clock**: The freezer is a death trap. Three timed events escalate from warning to death at 330 seconds. You MUST escape the freezer quickly — this isn't optional exploration time.
- **Sound Masking**: The meat grinder, when turned on, creates enough ambient noise to cover a phone call. Sal goes to investigate the running grinder, giving you a window (Distraction Window + Sound Masking).
- **Lights Out**: Pulling the main fuse from the fuse panel plunges the shop into darkness. Sal is confused and stumbles around (special behavior: lights_out_confusion). Creates an extended window to act.
- **Evidence Gamble**: Taking the black book or photos from the office leaves visible evidence. When Sal does his next check, he'll notice the forced drawer or missing items and enter Closing Time phase — enraged mode.
- **Sal Talks to Meat**: A timed event has Sal talking to the hanging carcasses, muttering about his problems. Black comedy flavor that also reveals plot details if you're listening through the wall.
- **Delivery Truck**: At 540 seconds, a delivery truck arrives at the loading dock. This creates both opportunity (the dock is briefly accessible) and danger (more people around).

---

## Puzzle Breakdown

### 1. Freezer Escape (Gateway + Ticking Clock)
- **Take meat hook** from rail — your first tool
- **Use meat hook on freezer door** — pry the hinge pins (noise: 30)
- Alternative: use crowbar from behind boxes
- Time pressure: 330 seconds to hypothermia death
- Evidence: Sal notices the open freezer door on his next visit

### 2. Office Keypad (Code: 1953)
- Puzzle widget: 4-digit keypad on butcher counter
- Code source: hardware receipt found in Sal's apron (order #1953)
- Receipt is in the freezer — must be found before escaping
- Dual-Purpose Item: apron is clothing + evidence container

### 3. Briefcase Lock (Combination: 1-9-5-3)
- Puzzle widget: 4-dial combination lock in back office
- Same code as keypad (the receipt order number is Sal's go-to PIN)
- Contains additional evidence or keys
- Waste basket clue connects the numbers

### 4. Circuit Breaker Panel (Toggle Panel)
- Puzzle widget: 4-switch toggle panel at loading dock
- Labels: DOCK LIGHTS, HOIST POWER, ROLL-UP MOTOR, ALARM
- Solution: [off, on, off, on] — hoist power and alarm active, dock lights and roll-up motor off
- Controls dock equipment — needed for the loading dock escape
- Wrong configuration triggers the alarm

### 5. The Evidence Assembly (Cross-Reference)
- Find the black book (desk drawer)
- Find the Polaroid photos (filing cabinet PERSONAL drawer)
- Combine them → evidence package
- Requires understanding what you're looking at (newspaper gives context)
- The assembled evidence makes the police call effective

### 6. The Phone Call (Distraction Required)
- Two phones available: counter wall phone, office desk phone
- Calling requires Sal to be distracted — he can hear you
- Distraction options: turn on meat grinder, pull main fuse, delivery truck arrival
- Police call requires evidence_package assembled
- Tony call requires knowing his number (from newspaper)

### 7. Loading Dock Breakout (Combination Puzzle)
- Roll-up door is padlocked with a heavy chain
- Crowbar alone isn't enough leverage
- Cut chain from hoist → chain link piece
- Combine crowbar + chain → reinforced pry bar
- Use reinforced pry bar on padlock → breaks it
- Emergent Combination pattern

---

## Pattern Usage

| # | Pattern | How It's Used |
|---|---------|---------------|
| 1 | **Gateway Puzzle** | Taking the meat hook and escaping the freezer — no prerequisites |
| 2 | **Dependency Chain** | Receipt → code → office → book → photos → evidence → phone → police (7 steps) |
| 3 | **The Fork** | Police, loading dock, and blackmail paths are largely independent |
| 4 | **Progressive Reveal** | Each area reveals more of Sal's criminal operation |
| 5 | **False Summit** | Escape the freezer — but now you're in Sal's shop, not free |
| 6 | **Dual-Purpose Item** | Apron: wearable disguise + contains the receipt with the office code |
| 7 | **Nested Secret** | Apron → receipt → code → office → drawer → book (layered discovery) |
| 8 | **Knowledge Gate** | Newspaper reveals Tony's number; receipt reveals office code |
| 9 | **Revelation Tool** | Newspaper as context provider — reframes everything you find |
| 10 | **Cross-Reference Deduction** | Evidence package requires combining book + photos + understanding |
| 11 | **Noise Tradeoff** | Meat grinder distraction (loud) vs. fuse pull (quiet but dark) |
| 12 | **Evidence Gamble** | Taking the black book leaves obvious evidence for Sal |
| 13 | **Distraction Window** | Grinder running / fuse pulled / phone call — windows to act |
| 14 | **Ticking Clock Decision** | Hypothermia timer AND Sal's routine compete for attention |
| 15 | **Bait and Punish** | Cash register seems like it should have money/keys — opening it rings the bell |
| 16 | **Sound Masking** | Meat grinder noise covers phone calls and movement |
| 17 | **Trap Setting** | Rig the meat hook on a trip line; mop bucket spill |
| 18 | **Red Herring** | Display case, some filing cabinet drawers, coat rack hat |
| 19 | **Emergent Combination** | Crowbar + chain = reinforced pry bar; knife + apron = wrapped blade |
| 20 | **Multi-Path Solution** | 3 distinct paths: law, force, blackmail |
| 22 | **Myst Machine** | Circuit breaker panel controls interconnected dock systems |
| 25 | **Moral Fork** | Call police (justice) vs. blackmail Tony (survival, morally gray) |
| 27 | **Point of No Return** | Taking the black book triggers eventual Closing Time phase |
| 28 | **Camouflage** | Close the filing cabinet, straighten the office after searching |
| 29 | **Echo** | Pulling the fuse in the freezer kills lights on the shop floor |
| 30 | **Decay Clock** | Sal relocks freezer, notices missing knife, discovers forced drawer on visits |

---

## Killer Profile: Sal Morano

**Background**: Barrel-chested, fifties, slicked-back gray hair. Thirty years a butcher, nearly as long a killer. Works for the Ricci crime family. The shop is a front for disposal. Sal is good at his job — both jobs. He's a blue-collar professional who takes pride in his craft, whether that's cutting a perfect ribeye or making a problem disappear.

**Personality**: Working-class menace. Whistles Sinatra. Talks to the meat like old friends ("You understand me, don't ya, ribeye?"). Has a dark sense of humor about "fresh cuts" and "specialty orders." Genuinely loves his shop. Paranoid about his boss Tony. The scariest thing about Sal is how normal he seems — until he picks up the cleaver with that look in his eye.

**Base Behavior**:
- Phase 1 (Freezer): Check every 120s, threshold 65 (relaxed, thinks you're dying)
- Phase 2 (Shop Floor): Check every 55s, threshold 50 (routine, professional)
- Phase 3 (Closing Time): Check every 20s, threshold 15 (panicked, enraged)
- Thoroughness: 0.45 → 0.75 with evidence
- Search order: nearest (he knows his shop)

**Special Behaviors**:
- **Grinder Distraction**: Running the meat grinder draws Sal to investigate — 25-second window
- **Lights Out Confusion**: Pulling the main fuse disorieves Sal in the dark — extended confusion period
- **Enraged Mode**: When he finds the black book missing, all bets are off

**Dialogue Samples**:
- Approach: "Time to check on my guest..." / "*whistling* Just making the rounds."
- Search: "I know you're in here. I can smell the fear on you." / "Come on out. Let's talk about this like men."
- Evidence: "What the — who's been in my office?!" / "Somebody's been busy. Real busy."
- Catch: "Found you. Now — you wanna know what a butcher does with a problem? He breaks it down into smaller pieces."

**On-Visit Effects**:
- Open freezer door → Sal slams it shut and chains it
- Missing knife from rack → Sal becomes suspicious, picks up his own cleaver
- Forced desk drawer → Triggers Closing Time phase (enraged)

---

## Solution Paths

### Path 1: The Right Thing — Police Rescue (14 steps)
Gather ironclad evidence and call the police. The lawful path — put Sal away for life.

1. Take the meat hook from the freezer rail
2. Take the apron from the hook, search it for the receipt
3. Examine the receipt — learn the office code (1953)
4. Use the meat hook on the freezer door hinges to escape
5. Navigate to the butcher counter
6. Enter code 1953 on the office keypad
7. In the office: search the filing cabinet for Polaroid photos
8. Search the waste basket for the ledger clue (briefcase combo = order number)
9. Use the office key (from under cash register) on the desk drawer — get the black book
10. Alternative: use meat hook to force the desk drawer (noisier, leaves evidence)
11. Combine the black book + Polaroids → evidence package
12. Create a distraction: turn on meat grinder OR pull the main fuse
13. While Sal is distracted, use a phone to call 911
14. Survive until police arrive

### Path 2: The Hard Way — Loading Dock Escape (8 steps)
Smash your way out through the loading dock. The loud, direct path.

1. Take the meat hook from the rail
2. Find the crowbar behind the cardboard boxes
3. Use the meat hook or crowbar on the freezer door to escape
4. Navigate to the loading dock
5. Cut chain from the hoist (use knife or hook on chain_hoist)
6. Combine crowbar + chain → reinforced pry bar
7. Use the reinforced pry bar on the roll-up door padlock
8. Open the unchained roll-up door → escape into the alley

### Path 3: The Deal — Blackmail Escape (10 steps)
Use Sal's own secrets against the mob. The morally gray path — make a deal with the devil.

1. Take the meat hook and escape the freezer
2. Take the newspaper from the counter — learn Tony Ricci's phone number (555-0134)
3. Get the office code from the apron receipt and enter the office
4. Get the black book from the desk drawer
5. Create a distraction to use a phone safely
6. Call Tony (555-0134) from the desk or counter phone with the black book
7. Deliver the ultimatum: you walk, or the book goes to the feds
8. Wait for Tony to send a car
9. Take the fire extinguisher from the loading dock
10. When the car arrives, use the fire extinguisher on the alley door to break out — climb into the waiting Lincoln

---

## JSON Scenario

See: [`examples/the-butchers-debt.json`](../../examples/the-butchers-debt.json)
