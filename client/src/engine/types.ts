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
  sounds?: SoundEffects;
  /** Optional first-play tutorial: short tips that advance when the player does the thing. Skippable. */
  tutorial?: Tutorial;
}

/** What finishes a tutorial step. `next` shows a button; the rest advance when the player does it. */
export type TutorialTrigger =
  | 'next' | 'verb_changed' | 'walked' | 'looked' | 'handled' | 'talked'
  | 'item_taken' | 'items_opened' | 'item_selected' | 'hint_used';

export interface TutorialStep {
  text: string;
  done_when: TutorialTrigger;
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
  objects: string[];
  back_label?: string;
  room_animation?: string;
  hints?: ViewHint[];
  character?: CharacterPlacement;
  ambient_lighting?: AmbientLighting;
  ambient_audio?: string | string[];
  /** Turns on click-to-walk for this view. See docs/WALKABLE_AREAS.md. */
  walk_area?: WalkArea;
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
  sound?: string;
  voice?: string;
  widget?: string;
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
}

export interface GameOverResult {
  won: boolean;
  conditionId: string;
  text: string;
  /** Heading for the end screen (game_over effect `title`); default "Game Over" / "You Escaped". */
  title?: string;
}

export interface InteractionResult {
  success: boolean;
  messages: string[];
  noiseGenerated: number;
}
