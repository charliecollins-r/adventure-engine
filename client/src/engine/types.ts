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

export interface Setting {
  initial_view: string;
  ambient_text: string;
  room_style: RoomStyle;
  ambient_audio?: string | string[];
}

export interface View {
  id: string;
  background_key: string;
  background_file?: string;
  objects: string[];
  back_label?: string;
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
  messages?: string[];
  visible?: boolean;
  when?: Condition[];
  then?: Effect[];
  else?: Effect[];
}

export interface Interaction {
  verb: string;
  item?: string;
  when: Condition[];
  then: Effect[];
  noise?: number;
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
