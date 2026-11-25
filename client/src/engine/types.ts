export interface Metadata {
  id: string;
  title: string;
  description: string;
  author: string;
  difficulty: string;
  estimated_minutes: number;
  tags: string[];
  version: string;
  patterns_used?: string[];
  /** A short credits line shown on the scenario's main-menu card, e.g. "Voices by ElevenLabs (elevenlabs.io)". */
  credits?: string;
}

export interface RoomStyle {
  background_color: string;
  wall_color: string;
  floor_color: string;
}

export interface SoundEffects {
  room_transition?: string;
  item_pickup?: string;
  intro_voice?: string;
  discovery?: string;
  /** Played whenever an action raises the noise level by 3 or more (a clang, an alarm). */
  noise?: string;
  /** Played when two items are combined successfully. Default: item_pickup. */
  combine?: string;
  /** Played when the game ends in a death (game_over result "lose"); the music fades out under it. */
  death?: string;
  /** Played when the game ends in a win (game_over result "win" or a win condition). */
  win?: string;
  [key: string]: string | undefined;
}

export interface LightSource {
  x: number;
  y: number;
  radius: number;
  color: [number, number, number];
  pulse_speed: number;
  pulse_amount: number;
  alpha: number;
  phase?: number;
}

export interface AmbientLighting {
  lights: LightSource[];
  flicker?: boolean;
}

export interface Setting {
  initial_view: string;
  ambient_text: string;
  room_style: RoomStyle;
  ambient_audio?: string | string[];
  intro_text?: string[];
  /** Animated intro cinematic: painted scenes with sprites, lights, particles, narration and sound. Replaces intro_text when present. */
  intro_scenes?: IntroScene[];
  sounds?: SoundEffects;
  /** Death screens offer "Undo last move" (back to just before the fatal action). Default true. */
  allow_undo?: boolean;
  /** Noise points that fade each time the player goes to another room (set_view). Default 0. */
  noise_decay?: number;
  /** Smallest rise in noise that plays setting.sounds.noise. Default 3. */
  noise_sound_min?: number;
  /** Total points available; shows "Score: x of max" in the title bar and on the end screen. */
  max_score?: number;
  /** Background music, on its own channel: it keeps playing across rooms until a view asks for a different track. */
  music?: string;
  /** Music volume, 0..1. Default 0.3. */
  music_volume?: number;
  /** How the game opens after the intro: the eyes open (fade from black), sounds.intro_voice describes the room,
   *  and the player stands up (the `standup` sprite set) as the voice ends. */
  wake?: {
    /** Seconds of black before the eyes start to open. Default 0.2. */
    hold_seconds?: number;
    /** Seconds the eyes take to open. Default: the whole voice (or 4 s without one). */
    fade_seconds?: number;
    /** Seconds of black and stillness before the voice starts. Default 0. */
    voice_delay?: number;
    /** The eyes open halfway, flutter shut, then open for real. Default false. */
    blink?: boolean;
  };
  /** Optional first-play tutorial: short tips that advance when the player does the thing. Skippable. */
  tutorial?: Tutorial;
  /** The game clock: seconds of play (it stops during the intro, dialogue, puzzle widgets, close-ups and death screens).
   *  Patrols run on it. `show: true` puts the elapsed time (m:ss) in the title bar, so players can learn a patrol's rhythm. */
  clock?: { show?: boolean };
  /** TEMPORARY testing aid: a title-bar button that runs these effects (e.g. hand over everything and jump to a later
   *  section). Remove from the scenario before release. */
  dev_skip?: { label: string; effects: Effect[] };
  /** Buttons beside the verbs for things the player does to himself (hold your breath and listen, squeeze the lung-sac).
   *  Each runs its effects like an interaction; shown while `when` holds. See SCENARIO_SCHEMA → Player actions. */
  actions?: PlayerAction[];
  /** Named cinematics, in the same format as intro_scenes, that the play_cutscene effect plays in the middle of the
   *  game (full screen, skippable). See SCENARIO_SCHEMA → Cutscenes and a playable prologue. */
  cutscenes?: Record<string, IntroScene[]>;
  /** A playable opening before the real start: after the intro cinematic the game begins in `view` (not initial_view),
   *  with no wake-up. The prologue ends with a play_cutscene effect that has `wake: true` (the wake-up staging then plays
   *  in whatever view its `then` effects lead to). While it runs, the clock is stopped and a "Skip intro" button jumps
   *  straight to initial_view and the wake-up. Skipped entirely with ?skipIntro, ?view or ?dev. */
  prologue?: { view: string; skip_label?: string };
}

/** A HUD button that runs effects (setting.actions). */
export interface PlayerAction {
  id: string;
  label: string;
  /** Tooltip. */
  title?: string;
  /** Shown only while these hold. */
  when?: Condition[];
  effects: Effect[];
}

/** A counter shown on the HUD (breath, a lung-sac, a countdown). See SCENARIO_SCHEMA → Meters. */
export interface Meter {
  id: string;
  label?: string;
  max: number;
  /** Starting value. Default max. */
  initial?: number;
  /** Drawn on the HUD while these hold. Default: while active_when holds. */
  visible_when?: Condition[];
  /** cost_per_move is taken (and on_empty can fire) only while these hold. Default always. */
  active_when?: Condition[];
  /** Taken each time the player goes to another view (set_view), after the move; close-ups (views with a back_label) are free. */
  cost_per_move?: number;
  /** HUD look: "pips" (one dot per point, default) or "bar". */
  style?: 'pips' | 'bar';
  color?: string;
  /** A message and/or sound when the value drops to `at` or below. */
  warnings?: { at: number; message?: string; sound?: string }[];
  /** Runs once when the value reaches 0 while active (again only after it has been refilled). */
  on_empty?: Effect[];
}

/** A rhythm on the game clock (a lung breathing, vents firing). See SCENARIO_SCHEMA → Cycles. */
export interface Cycle {
  id: string;
  /** The phases in order; the cycle's period is the sum of their seconds. */
  phases: { id: string; seconds: number; sound?: string; message?: string }[];
  /** Seconds added to the clock before working out the phase (to put cycles out of step). */
  offset?: number;
  /** Runs only while these hold (otherwise cycle_is is false for every phase). */
  when?: Condition[];
  /** A phase's sound and message are given only while the player is in one of these views (default: never). */
  views?: string[];
}

/** Something that hunts the player from behind walls, one step per move, and can only reach him at marked views.
 *  See SCENARIO_SCHEMA → Pursuers. */
export interface Pursuer {
  id: string;
  name?: string;
  /** It hunts only while these hold. */
  when?: Condition[];
  /** The views it hunts in; leaving them resets it to start_distance. */
  zone: string[];
  /** Views it can reach into (grates). */
  strike_views: string[];
  /** Moves it needs to reach you when you enter the zone. */
  start_distance: number;
  /** Where it falls back to after it reaches into an empty grate or you hold your breath through its hum. Default start_distance. */
  reset_distance?: number;
  /** Seconds between the hum and the strike. Default 4. */
  strike_seconds?: number;
  /** A flag the player sets to move silently (holding his breath): that move doesn't bring it closer, and set during
   *  a hum it loses you. The engine clears it after it is used. */
  silent_flag?: string;
  hum_sound?: string;
  hum_message?: string;
  /** Said when it loses you (you held your breath, or left the grate in time). */
  lost_message?: string;
  on_strike: Effect[];
}

/** The rhythm widget (widget_type "rhythm"): call and response in long and short presses. */
export interface RhythmConfig {
  title?: string;
  prompt?: string;
  /** Phrases she breathes, in order: "L" long, "S" short (e.g. "LSL"). */
  phrases: string[];
  /** Extra phrases added while their conditions hold. */
  extra_phrases?: { when: Condition[]; pattern: string }[];
  /** Milliseconds per beat. Default 700. */
  beat_ms?: number;
  /** A press held at least this long counts as long. Default 300. */
  long_ms?: number;
  /** Mistakes allowed per phrase before the attempt fails. Default 3. */
  max_errors?: number;
  /** After this many failed attempts she breathes slower (beat_ms × slow_factor). */
  slow_after?: number;
  slow_factor?: number;
  /** While these hold, the next beat is shown during your answer (a friend humming it). */
  hint_when?: Condition[];
  /** setting.sounds keys or files for her long and short beats. */
  long_sound?: string;
  short_sound?: string;
}

/** A point or offset in the 960x720 authoring space. */
export type XY = [number, number];

/** One line of intro narration or dialogue. */
export interface IntroLine {
  text: string;
  /** Spoken audio for the line; the line lasts as long as the clip. Without one it lasts 0.06 s per character (3 s minimum). */
  voice?: string;
  /** "narration" (default, gold), "radio" (a transmission: italic, cool colour; the voice gets a radio filter) or "card" (large, centred). */
  style?: 'narration' | 'radio' | 'card';
  /** Radio voices only: how degraded the signal is, 0 (clean) to 1 (barely there). Default 0.3. */
  static?: number;
  /** Seconds of silence before this line. Default 0.4. */
  pause?: number;
}

/** An animated sprite placed in an intro scene (bottom-centre anchored, like object sprites). */
export interface IntroSprite {
  file: string;
  frame_width: number;
  frame_height: number;
  columns: number;
  /** Which row of the sheet to play. Default 0. */
  row?: number;
  /** Frame order to play (column indices), e.g. [0,0,0,1,0,0,2]. Default: every column in order. */
  frames?: number[];
  frame_rate: number;
  /** false: play once and hold the last frame. Default true. */
  loop?: boolean;
  scale: number;
  /** Feet (bottom-centre) in 960x720 coordinates. */
  at: XY;
  /** Glide to another spot (and optionally another scale) over `seconds`, eased. */
  move?: { to: XY; scale?: number; seconds: number; delay?: number };
  /** Gentle floating: bob up and down by `amount` px every `period` seconds. */
  bob?: { amount: number; period: number };
  /** Fixed rotation in degrees (e.g. -90 to lay a figure down). */
  rotate?: number;
  /** Continuous rotation in degrees per second (tumbling). */
  spin?: number;
  flip?: boolean;
  /** When its clock starts: "start" (default), "line:N" (when line N, 1-based, appears) or "end" (when the last line is done).
   *  delay/until/move/spin all count from this moment, so the action stays in step with the voices. */
  cue?: IntroCue;
  /** Hide it (fading out over `fade`) once this cue is reached. */
  until_cue?: IntroCue;
  /** Seconds after its cue before it appears, and when it disappears. */
  delay?: number;
  until?: number;
  /** Fade in/out time in seconds. Default 0.4. */
  fade?: number;
  opacity?: number;
  /** CSS filter applied to the sprite (e.g. "sepia(0.6) brightness(0.9)" to sit it inside amber fluid). */
  filter?: string;
}

/** A moment in an intro scene: "start", "line:N" (line N appears, 1-based) or "end" (all lines done). */
export type IntroCue = string;

/** A sound placed on an intro scene's timeline. */
export interface IntroSound {
  file: string;
  /** When to play it (default "start"), plus `delay` seconds. */
  cue?: IntroCue;
  delay?: number;
  /** 0..1, default 0.9. Loops are ducked under voices; one-shots are not. */
  volume?: number;
  loop?: boolean;
}

/** Procedural effects drawn over an intro scene. Areas are [x, y, width, height] in 960x720 coordinates. */
export type IntroEffect = { cue?: IntroCue } & (
  | { type: 'particles'; motion: 'rise' | 'fall' | 'drift' | 'twinkle'; area: [number, number, number, number];
      count: number; size?: number; color: [number, number, number]; alpha?: number; speed?: number; delay?: number }
  | { type: 'shade'; color?: [number, number, number]; from: number; to: number; seconds: number;
      direction?: 'down' | 'up' | 'none'; area?: [number, number, number, number]; delay?: number }
  | { type: 'sweep'; area: [number, number, number, number]; color: [number, number, number]; period: number;
      alpha?: number; delay?: number }
  | { type: 'sparks'; at: XY; color?: [number, number, number]; every: number; delay?: number; until?: number }
  | { type: 'shake'; amount: number; delay?: number; until?: number }
  /** A sagging line (a tether, a cable) from a fixed point to a point or to a sprite (its feet plus `offset`, which
   *  is in sprite pixels, scaled with it), so it follows the sprite as it bobs. Drawn behind the sprites. */
  | { type: 'rope'; from: XY; to?: XY; to_sprite?: number; offset?: XY; sag?: number; color?: [number, number, number];
      width?: number; delay?: number; until?: number });
// every effect also takes `cue` (see IntroCue): its delay/until count from that moment


export interface IntroCamera {
  /** zoom 1 = the whole picture; x/y shift the view (960x720 units). Interpolated (eased) over `seconds`. */
  from?: { zoom?: number; x?: number; y?: number };
  to?: { zoom?: number; x?: number; y?: number };
  seconds?: number;
}

/** One shot of the intro cinematic. */
export interface IntroScene {
  /** Painted background (any 16:9 size). Omit for black, where lines are shown large and centred. */
  background?: string;
  camera?: IntroCamera;
  sprites?: IntroSprite[];
  ambient_lighting?: AmbientLighting;
  effects?: IntroEffect[];
  lines?: IntroLine[];
  /** One-shot sound when the scene starts, and a sound looped while it lasts (a loop carries on into the next scene if it uses the same file). */
  sound?: string;
  loop?: string;
  /** More sounds, each on a cue (see IntroSound). */
  sounds?: IntroSound[];
  /** Music: a file switches track (crossfaded; the same file keeps playing across scenes), null fades it out, omitted keeps whatever is playing. */
  music?: string | null;
  /** false: play the track once (a scored cue that builds to an ending). Default true. */
  music_loop?: boolean;
  /** Music volume 0..1, default 0.5. Music is ducked under voices. */
  music_volume?: number;
  /** Minimum seconds on screen (it also lasts until its lines are done). */
  hold?: number;
  /** Seconds to stay after the last line is done, before the transition. Default 1. */
  tail?: number;
  /** Seconds the scene takes to fade in. Default 0.7 (1 after a flash; 3.5 for the first scene, out of black). */
  fade_in?: number;
  /** How this scene hands over to the next: fade through black (default), cut, or a white flash. */
  transition?: 'fade' | 'cut' | 'flash';
}

/** What finishes a tutorial step. `next` shows a button; the rest advance when the player does it. */
export type TutorialTrigger =
  | 'next' | 'verb_changed' | 'walked' | 'looked' | 'handled' | 'talked'
  | 'item_taken' | 'items_opened' | 'item_selected' | 'hint_used';

export interface TutorialStep {
  text: string;
  done_when: TutorialTrigger;
  /** "only": a prologue tip, dropped once the prologue is over (played or skipped). "if_skipped": shown only to a
   *  player who skipped the prologue (it repeats what the prologue taught). Default: always. */
  prologue?: 'only' | 'if_skipped';
  /** A spoken version of the tip, played once when it first shows (after any line already being spoken). */
  voice?: string;
  /** The tip waits (hidden) until these hold, e.g. a view_is, so tips can follow the player from a prologue into the game. */
  when?: Condition[];
}

export interface Tutorial {
  steps: TutorialStep[];
}

export interface View {
  id: string;
  name?: string;
  background_key: string;
  background_file?: string;
  background_fit?: 'cover' | 'contain';
  /** The idle line under the picture in this view (shown when there is no message), instead of setting.ambient_text; "" for none. */
  ambient_text?: string;
  objects: string[];
  back_label?: string;
  room_animation?: string;
  hints?: ViewHint[];
  character?: CharacterPlacement;
  ambient_lighting?: AmbientLighting;
  /** Lighting that replaces ambient_lighting while its conditions hold (the first match wins), e.g. red alarm strobes. */
  lighting_variants?: { when: Condition[]; lighting: AmbientLighting }[];
  ambient_audio?: string | string[];
  /** Music for this view (overrides setting.music; null = no music here). The same track carries on across rooms. */
  music?: string | null;
  /** Sound played on entering this view: a path or sounds key, or null/"" for silence. Default: setting.sounds.room_transition. */
  enter_sound?: string | null;
  /** Turns on click-to-walk for this view. See docs/WALKABLE_AREAS.md. */
  walk_area?: WalkArea;
  /** Other floors for this view, chosen by state: the first whose `when` matches replaces walk_area
   *  (e.g. a ledge reached by climbing across a line). */
  walk_area_variants?: { when: Condition[]; walk_area: WalkArea }[];
  /** Effects run each time the player enters this view with set_view (after any meter cost): refills, a draught's line. */
  on_enter?: Effect[];
  /** This view's square on a grid map ([column, row], row 0 at the top = north). The sense effect uses it to name directions. */
  map_xy?: XY;
}

/** An [x, y] point in 960x720 authoring space. */
export type PointXY = [number, number];

export type Facing = 'down' | 'left' | 'right' | 'up';

export interface WalkArea {
  /** Outline of the floor the character can walk on, in order around the edge. At least 3 points. */
  floor: PointXY[];
  /** Areas inside the floor the character must walk around. */
  blocked?: PointXY[][];
  /** Draw the character at `far` x scale when his feet are at far_y and `near` x at near_y; blend between. */
  depth_scale?: { far_y: number; far: number; near_y: number; near: number };
  /** Footsteps for this view (e.g. a carpet), or false for silent walking. Default: character.footsteps. */
  footsteps?: Footsteps | false;
  /** Draw the character at this size here (multiplies depth_scale): a tiny figure crossing a vast place. Default 1. */
  scale?: number;
  /** How the character moves on this floor, overriding character.walk_motion ("smooth" for drifting in space). */
  motion?: 'paced' | 'stepped' | 'smooth';
  /** Walking speed multiplier on this floor (on top of the scale, which already slows a small figure). Default 1. */
  speed?: number;
  /** Shadows on the floor: standing still inside one hides you from sensing patrols. */
  shadows?: PointXY[][];
}

/** Where the character stands (feet, bottom-center) and which way he faces. */
export interface StandPoint {
  x: number;
  y: number;
  facing?: Facing;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Visual {
  color: string;
  label: string;
  animation?: string;
}

export interface Condition {
  type: string;
  flag?: string;
  value?: string;
  object?: string;
  state?: string;
  item?: string;
  view?: string;
  phase?: string;
  threshold?: number;
  count?: number;
  conditions?: Condition[];
  widget?: string;
  /** patrol_near: the patrol's id. True while it is about to come into, or is in, the room the player is in. */
  patrol?: string;
  /** meter_below / meter_above: the meter's id (compared with `threshold`). */
  meter?: string;
  /** cycle_is: the cycle's id (with `phase`). */
  cycle?: string;
  /** pursuer_near: the pursuer's id; true while it is `threshold` moves or fewer from reaching you. */
  pursuer?: string;
}

export interface DialogueChoice {
  label: string;
  when?: Condition[];
  then: Effect[];
}

export interface Effect {
  type: string;
  /** set_view: where the character appears in the new view (walking views). */
  at?: StandPoint;
  /** traverse: the route the character is carried along (960x720 feet positions), ignoring the floor. */
  path?: PointXY[];

  text?: string;
  flag?: string;
  value?: string;
  object?: string;
  state?: string;
  item?: string;
  into?: string;
  view?: string;
  phase?: string;
  amount?: number;
  result?: string;
  reason?: string;
  /** game_over: heading for the end screen. */
  title?: string;
  seconds?: number;
  effects?: Effect[];
  cue?: string;
  image?: string;
  messages?: string[];
  visible?: boolean;
  when?: Condition[];
  then?: Effect[];
  else?: Effect[];
  sprite_set?: string;
  facing?: 'down' | 'left' | 'right' | 'up';
  x?: number;
  y?: number;
  frame?: number;
  flip_h?: boolean;
  prompt?: string;
  choices?: DialogueChoice[];
  /** play_sound: a setting.sounds key or path. set_view: the transition sound for this move (null = silent).
   *  game_over: this death's own sound (a key or path), instead of setting.sounds.death. */
  sound?: string | null;
  /** add_score: points to add; with `id`, awarded only once per id. */
  points?: number;
  id?: string;
  voice?: string;
  widget?: string;
  /** meter_add / meter_set / meter_transfer: the meter. */
  meter?: string;
  /** meter_transfer: the meter to fill. */
  to?: string;
  /** pursuer_divert / pursuer_reset: the pursuer. */
  pursuer?: string;
  /** show_closeup: images drawn over the close-up while their conditions hold (map layers). */
  layers?: { image: string; when?: Condition[] }[];
  /** set_checkpoint: the death screen offers no "Undo last move" while this checkpoint is set (restart from it instead). */
  no_undo?: boolean;
  /** play_cutscene: the setting.cutscenes entry to play. */
  cutscene?: string;
  /** play_cutscene: after it, play the wake-up staging (setting.wake) in the view its `then` effects lead to,
   *  and end the prologue. */
  wake?: boolean;
  /** message: how the line is delivered. "radio": a transmission (RADIO tag, cool italic text; the voice gets a
   *  band-pass radio filter). "comms": the player talking over his suit radio (a light helmet-mic filter on the voice). */
  style?: 'radio' | 'comms';
  /** message with style "radio": how degraded the signal is, 0 (clean) to 1. Default 0.3. */
  static?: number;
  /** sense: how many screens away it reaches, plus a bigger reach while conditions hold. */
  radius?: number;
  bonus?: { when: Condition[]; radius: number };
  /** sense: what can be sensed: views where something is, or a patrol (where it is right now). */
  kinds?: { label: string; views?: string[]; patrol?: string }[];
}

export interface Interaction {
  verb: string;
  item?: string;
  when: Condition[];
  then: Effect[];
  response?: string;
  noise?: number;
}

export interface ObjectSprite {
  file: string;
  frame_width: number;
  frame_height: number;
  columns: number;
  rows: number;
  frame_rate: number;
  scale: number;
  /** false: play the frames once and hold the last one (restart it with the play_animation effect). Default true. */
  loop?: boolean;
  /** true: draw the sheet mirrored left-to-right (a figure drawn facing right then faces left). Default false. */
  flip?: boolean;
  /** Frames follow a cycle instead of frame_rate: the first row's frames are spread over the cycle's period. */
  sync_cycle?: string;
  /** A still frame chosen by state: the first entry whose conditions hold (overrides animation). */
  frame_when?: { when: Condition[]; frame: number }[];
}

export interface ScenarioObject {
  id: string;
  name: string;
  description: string;
  position: Position;
  size: Size;
  visual: Visual;
  initial_state: string;
  initially_visible: boolean;
  hiding_spot?: boolean;
  sprite?: ObjectSprite;
  shadow?: CharacterShadow;
  interactions: Interaction[];
  /** Where the character stands to Hand/Use/Move this object in a walking view; false = interact from where he is. */
  walk_to?: StandPoint | false;
  /** Walking views, sprite objects: "floor" = always under the character (rugs, grates), "front" = always over him, default sorted by base. */
  layer?: 'floor' | 'sorted' | 'front';
}

export interface ItemExamine {
  verb: string;
  when: Condition[];
  then: Effect[];
}

export interface WearableOverlay {
  slot: string;
  sprite_file: string;
  frame_width: number;
  frame_height: number;
  offset_x: number;
  offset_y: number;
  scale?: number;
  auto_equip?: boolean;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  icon_file?: string;
  examine: ItemExamine[];
  wearable?: WearableOverlay;
}

export interface Combination {
  items: string[];
  result: string;
  consumes: boolean;
  message: string;
  noise?: number;
  conditions?: Condition[];
}

export interface KeypadKey {
  value: string;
  label?: string;
  image?: string;
}

export interface PuzzleWidgetConfig {
  positions?: string[];
  solution?: string | string[] | number[] | boolean[] | null;
  initial_position?: string;
  keys?: (string | KeypadKey)[];
  code_length?: number;
  columns?: number;
  title?: string;
  prompt?: string;
  fail_text?: string[];
  [key: string]: unknown;
}

export interface PuzzleWidget {
  id: string;
  widget_type: string;
  presentation?: 'overlay' | 'inline';
  position?: Position;
  size?: Size;
  view?: string;
  initially_visible?: boolean;
  config: PuzzleWidgetConfig;
  on_solve: Effect[];
  on_fail?: Effect[];
  max_attempts?: number;
  on_max_fail?: Effect[];
  noise_per_interaction?: number;
}

export interface WidgetSubmitResult {
  solved: boolean;
  feedback: string | null;
  messages: string[];
}

export interface KillerOverrides {
  check_interval_seconds?: number;
  interval_variance_seconds?: number;
  noise_threshold_curious?: number;
  noise_threshold_investigate?: number;
  noise_threshold_immediate?: number;
  [key: string]: unknown;
}

export interface Phase {
  id: string;
  name: string;
  starts_when: Condition[];
  on_enter: Effect[];
  ambient_text?: string;
  killer_overrides?: KillerOverrides;
}

export interface ScenarioEvent {
  id: string;
  trigger: {
    type: string;
    seconds?: number;
    [key: string]: unknown;
  };
  one_shot: boolean;
  effects: Effect[];
}

export interface KillerBaseBehavior {
  check_interval_seconds: number;
  interval_variance_seconds: number;
  noise_threshold_curious: number;
  noise_threshold_investigate: number;
  noise_threshold_immediate: number;
  noise_decay_per_second: number;
  warning_duration_seconds: number;
  search_duration_seconds: number;
}

export interface KillerSearchBehavior {
  thoroughness: number;
  evidence_flags: string[];
  thoroughness_on_evidence: number;
  search_order: string;
}

export interface Killer {
  name: string;
  description: string;
  base_behavior: KillerBaseBehavior;
  search_behavior: KillerSearchBehavior;
  personality: Record<string, unknown>;
  on_visit_effects?: Effect[];
  special_behaviors?: Record<string, unknown>[];
}

export interface WinCondition {
  id: string;
  description: string;
  conditions?: Condition[];
}

export interface LoseCondition {
  id: string;
  description: string;
  conditions?: Condition[];
}

export interface ViewHint {
  text: string;
  when: Condition[];
}

export interface SpriteSet {
  file: string;
  columns: number;
  rows: number;
  frame_rate?: number;
  directions?: ('down' | 'left' | 'right' | 'up')[];
  loop?: boolean;
  /** Sprite set to use while walking when this set is current. Default: a set named "walk". */
  walk?: string;
  /** "top": the character's point is the top-centre of the frame (hands on a rope he hangs from), not the feet.
   *  For hanging and climbing poses used with the traverse effect. No shadow is drawn. Default "feet". */
  anchor?: 'feet' | 'top';
  /** This sheet's own frame size and scale, when it differs from character.frame_width/frame_height/scale
   *  (a spacesuit sheet drawn at another size). */
  frame_width?: number;
  frame_height?: number;
  scale?: number;
  /** Bob gently up and down while this set is shown (floating in space, treading water): pixels and seconds per bob. */
  bob?: { amount: number; period: number };
}

export interface CharacterShadow {
  offset_x?: number;
  offset_y?: number;
  width?: number;
  height?: number;
  opacity?: number;
  color?: string;
  skew_x?: number;
}

export interface CharacterConfig {
  sprite_sets: Record<string, SpriteSet>;
  frame_width: number;
  frame_height: number;
  scale?: number;
  shadow?: CharacterShadow;
  /** Walking speed in 960x720 pixels per second at normal scale. Default 150. */
  walk_speed?: number;
  /** Walking views: "sorted" (default) draws him in front of or behind sprite objects by where his feet are; "front" always draws him on top. */
  draw_order?: 'sorted' | 'front';
  /** Sounds played while he walks. A view's walk_area.footsteps overrides this (false = silent there). */
  footsteps?: Footsteps;
  /**
   * How he moves while the walk cycle plays.
   * "paced" (default): continuous movement that slows as each foot plants and speeds up mid-stride, on the
   * same clock as the walk frames and footsteps, so it reads as steps without jumping.
   * "stepped": classic Sierra, the position jumps one stride each time the walk frame changes.
   * "smooth": constant speed, frames and footsteps on their own timers.
   */
  walk_motion?: 'paced' | 'stepped' | 'smooth';
  /** "paced" only: how strongly speed swells and dips within a stride, 0 (constant) to 0.95. Default 0.6. */
  walk_pulse?: number;
}

export interface Footsteps {
  /** Step sounds, picked in random order (never the same one twice in a row). */
  sounds: string[];
  /** Seconds between steps in "smooth" walk_motion. With "paced" or "stepped" motion a step plays on the first frame of each half of the walk cycle. Default: 2 / frame_rate. */
  interval?: number;
  /** 0..1, default 0.4. */
  volume?: number;
}

export interface CharacterPlacement {
  x: number;
  y: number;
  facing?: 'down' | 'left' | 'right' | 'up';
  sprite_set: string;
  frame?: number;
  flip_h?: boolean;
  object_id?: string;
  shadow?: CharacterShadow;
}

export interface Hint {
  id: string;
  after_seconds: number;
  condition: Condition;
  text: string;
}

export interface SolutionPath {
  id: string;
  name: string;
  description: string;
  steps: string[];
}

export interface Scenario {
  schema_version: string;
  metadata: Metadata;
  setting: Setting;
  views: View[];
  flags: Record<string, string>;
  items: Item[];
  combinations?: Combination[];
  objects: ScenarioObject[];
  puzzle_widgets?: PuzzleWidget[];
  phases?: Phase[];
  events?: ScenarioEvent[];
  killer?: Killer;
  win_conditions?: WinCondition[];
  lose_conditions?: LoseCondition[];
  hints?: Hint[];
  solution_paths?: SolutionPath[];
  character?: CharacterConfig;
  /** Patrolling units on the game clock (setting.clock): each sweeps a fixed route of rooms on a fixed cycle. */
  patrols?: Patrol[];
  /** HUD counters (breath). */
  meters?: Meter[];
  /** Rhythms on the game clock. */
  cycles?: Cycle[];
  /** Hunters behind walls. */
  pursuers?: Pursuer[];
}

/** One leg of a patrol: the room it sweeps and when. */
export interface PatrolStop {
  /** The room (and any close-ups that belong to it): being in any of these views counts as being in its way. */
  views: string[];
  /** Seconds into the sweep it comes in and leaves. */
  enter: number;
  leave: number;
  /** Its route across the room (960x720 feet positions), walked at an even pace from enter to leave. */
  path?: PointXY[];
  /** Draw it mirrored on this leg (a sheet drawn facing right then walks left). */
  flip?: boolean;
  /** Fade it out over the last second of the leg (it ends its sweep here). */
  fade_out?: boolean;
  /** Overrides the patrol's warn_message for this room. */
  warn_message?: string;
  /** Shown to a player next door while it walks through this room (with the patrol's nearby_sound). */
  nearby_message?: string;
  /** Sensing: instead of noticing anyone in the room, it notices the player only within `radius` (960x720 units) of
   *  where it is drawn, only while he walks (if only_while_moving), not while masked_when holds (the wind), and not
   *  while he stands in one of the floor's shadows. */
  sense?: { radius: number; only_while_moving?: boolean; masked_when?: Condition[] };
  /** Besides hiding: while these hold you are safe from it in this room (you are up on a ledge it passes under). */
  safe_when?: Condition[];
}

export interface Patrol {
  id: string;
  name?: string;
  /** It patrols only while these hold. */
  when?: Condition[];
  /** Seconds between the starts of two sweeps. */
  period: number;
  /** Game-clock time of the first sweep. Default: one period in. */
  first_at?: number;
  stops: PatrolStop[];
  /** Seconds of warning before it comes into the room you are in. Default 5. */
  warn_seconds?: number;
  /** Played (setting.sounds key or file) when it is about to come into your room. */
  warn_sound?: string;
  warn_message?: string;
  /** Played when it comes into your room. */
  enter_sound?: string;
  /** Played when it comes into a room next door to yours (any room with an exit into yours): you hear it pass.
   *  Usually a quieter, muffled version of enter_sound. */
  nearby_sound?: string;
  /** Seconds it takes to notice you once you are in its room and not hidden. Default 1.5. */
  notice_seconds?: number;
  /** How it looks while it walks through your room. */
  sprite?: ObjectSprite;
  shadow?: CharacterShadow;
  /** What happens when it notices you (usually a game_over). */
  on_caught: Effect[];
}

export interface GameOverResult {
  won: boolean;
  conditionId: string;
  text: string;
  /** Heading for the end screen (game_over effect `title`); default "Game Over" / "You Escaped". */
  title?: string;
  /** This ending's own sound (game_over effect `sound`), played instead of setting.sounds.death / win. */
  sound?: string;
}

export interface InteractionResult {
  success: boolean;
  messages: string[];
  noiseGenerated: number;
}
