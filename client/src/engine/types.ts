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
}

export interface DialogueChoice {
  label: string;
  when?: Condition[];
  then: Effect[];
}

export interface Effect {
  type: string;
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
}

export interface ItemExamine {
  verb: string;
  when: Condition[];
  then: Effect[];
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  icon_file?: string;
  examine: ItemExamine[];
}

export interface Combination {
  items: string[];
  result: string;
  consumes: boolean;
  message: string;
  noise?: number;
  conditions?: Condition[];
}

export interface PuzzleWidgetConfig {
  positions?: string[];
  solution?: string;
  initial_position?: string;
  [key: string]: unknown;
}

export interface PuzzleWidget {
  id: string;
  widget_type: string;
  position: Position;
  size: Size;
  view: string;
  initially_visible: boolean;
  config: PuzzleWidgetConfig;
  on_solve: Effect[];
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
}

export interface CharacterShadow {
  offset_x?: number;
  offset_y?: number;
  width?: number;
  height?: number;
  opacity?: number;
  color?: string;
}

export interface CharacterConfig {
  sprite_sets: Record<string, SpriteSet>;
  frame_width: number;
  frame_height: number;
  scale?: number;
  shadow?: CharacterShadow;
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
}

export interface InteractionResult {
  success: boolean;
  messages: string[];
  noiseGenerated: number;
}
