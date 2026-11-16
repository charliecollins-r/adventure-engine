import { facingFromDelta, nearestFloorPoint } from './walkable';
import type {
  Facing,
  StandPoint,
  WalkArea,
  Scenario,
  View,
  ScenarioObject,
  Item,
  Condition,
  Effect,
  Interaction,
  InteractionResult,
  GameOverResult,
  CharacterPlacement,
  DialogueChoice,
  PuzzleWidget,
  WidgetSubmitResult,
  Patrol,
  ObjectSprite,
  CharacterShadow,
} from './types';

/** A patrol unit walking through the room the player is in, for the UI to draw. */
export interface PatrolSighting {
  id: string; sprite?: ObjectSprite; shadow?: CharacterShadow; x: number; y: number; flip: boolean; opacity: number;
}

/** Opaque engine state from ScenarioEngine.snapshot(). */
export interface EngineSnapshot {
  view: string; flags: Record<string, string>; objectStates: Record<string, string>; objectVisibility: Record<string, boolean>;
  objectAnimations: Record<string, string>; inventory: string[]; noise: number; viewHistory: string[];
  gameOver: GameOverResult | null; phase: string | null; hiding: boolean; characterOverride: Partial<CharacterPlacement> | null;
  characterPos: StandPoint | null; posHistory: (StandPoint | null)[]; eventsFired: string[]; eventsActive: string[];
  widgetAttempts: Record<string, number>; solvedWidgets: Record<string, boolean>; equipped: [string, string][];
  score: number; scoredIds: string[]; clock: number;
}

export class ScenarioEngine {
  private scenario: Scenario;
  private _currentViewId: string;
  private flags: Record<string, string>;
  private objectStates: Record<string, string>;
  private objectVisibility: Record<string, boolean>;
  private objectAnimations: Record<string, string>;
  private inventory: string[];
  private _noiseLevel: number;
  private _messages: string[];
  /** Tools (the soft-lock search) set this: delay_then effects then apply at once instead of on a timer. */
  immediateDelays = false;
  /** Called when state changes outside an action (a delay_then firing), so the UI can redraw. */
  private changeListener: (() => void) | null = null;
  private viewHistory: string[];
  private _gameOver: GameOverResult | null;
  private _currentPhaseId: string | null;
  private _isHiding: boolean;
  private _closeupImage: string | null;
  private _characterOverride: Partial<CharacterPlacement> | null;
  /** Where the character stands in the current view after walking or a set_view `at`; null = the view's placement. */
  private _characterPos: StandPoint | null = null;
  /** Character position at each viewHistory entry, so leaving a close-up puts him back where he stood. */
  private posHistory: (StandPoint | null)[] = [];
  private eventsFired = new Set<string>();
  private eventsActive = new Set<string>();
  private _pendingSounds: string[];
  private _dialoguePrompt: string | null;
  private _dialogueChoices: DialogueChoice[];
  private _activeWidgetId: string | null;
  private widgetAttempts: Record<string, number>;
  private solvedWidgets: Record<string, boolean>;
  private equippedItems: Map<string, string>;
  /** Bumped by restore(): delayed effects scheduled before an undo are dropped. */
  private epoch = 0;
  private _score = 0;
  private scoredIds = new Set<string>();
  /** The transition sound chosen by the last set_view (undefined = use the view's default). */
  private _transitionSound: string | null | undefined = undefined;
  /** A traverse effect waiting for the UI to animate it. */
  private _traverse: { path: StandPoint[]; seconds?: number; sprite_set?: string; end: StandPoint } | null = null;
  /** play_animation counters per object: a change restarts that object's sprite from its first frame. */
  private animationRuns: Record<string, number> = {};
  /** Seconds of play (setting.clock); advanced by the UI with advanceClock(). */
  private _clock = 0;
  /** Patrol warnings already given ("patrol:sweep:stop"), so each is given once. */
  private patrolWarned = new Set<string>();
  /** Patrols that have come into the player's room on this leg ("patrol:sweep:stop"). */
  private patrolEntered = new Set<string>();
  /** Seconds each patrol has had the player in plain sight. */
  private patrolSeen: Record<string, number> = {};
  /** Patrol legs already heard from next door ("patrol:sweep:stop"). */
  private patrolHeard = new Set<string>();
  /** Views next door to each view: rooms with an exit (a Move interaction that can set_view) into it. Built on first use. */
  private neighbourIndex: Map<string, Set<string>> | null = null;
  /** Tools (tests, the soft-lock search) can switch patrols off. */
  patrolsEnabled = true;

  private objectIndex: Map<string, ScenarioObject>;
  private itemIndex: Map<string, Item>;

  constructor(scenario: Scenario) {
    this.scenario = scenario;
    this._currentViewId = scenario.setting.initial_view;
    this.flags = { ...scenario.flags };
    this.objectStates = {};
    this.objectVisibility = {};
    this.objectAnimations = {};
    this.inventory = [];
    this._noiseLevel = 0;
    this._messages = [];
    this.viewHistory = [];
    this._gameOver = null;
    this._currentPhaseId = scenario.phases?.[0]?.id ?? null;
    this._isHiding = false;
    this._closeupImage = null;
    this._characterOverride = null;
    this._pendingSounds = [];
    this._dialoguePrompt = null;
    this._dialogueChoices = [];
    this._activeWidgetId = null;
    this.widgetAttempts = {};
    this.solvedWidgets = {};
    this.equippedItems = new Map();

    this.objectIndex = new Map();
    for (const obj of scenario.objects) {
      this.objectIndex.set(obj.id, obj);
      this.objectStates[obj.id] = obj.initial_state;
      this.objectVisibility[obj.id] = obj.initially_visible;
    }

    this.itemIndex = new Map();
    for (const item of scenario.items) {
      this.itemIndex.set(item.id, item);
    }

    if (this._currentPhaseId && scenario.phases?.[0]?.on_enter) {
      this.applyEffects(scenario.phases[0].on_enter);
    }
  }

  get currentViewId(): string {
    return this._currentViewId;
  }

  getScenario(): Scenario {
    return this.scenario;
  }

  getBackgroundFile(): string | undefined {
    return this.getCurrentView().background_file;
  }

  getBackgroundColor(): string {
    return this.scenario.setting.room_style?.background_color ?? '#0a1520';
  }

  getCurrentView(): View {
    const view = this.scenario.views.find(v => v.id === this._currentViewId);
    if (!view) {
      throw new Error(`View not found: ${this._currentViewId}`);
    }
    return view;
  }

  getVisibleObjects(): ScenarioObject[] {
    const view = this.getCurrentView();
    const objects: ScenarioObject[] = [];
    for (const objId of view.objects) {
      if (this.objectVisibility[objId] !== false) {
        const obj = this.objectIndex.get(objId);
        if (obj) {
          const animOverride = this.objectAnimations[objId];
          if (animOverride !== undefined) {
            objects.push({
              ...obj,
              visual: { ...obj.visual, animation: animOverride || undefined },
            });
          } else {
            objects.push(obj);
          }
        }
      }
    }
    return objects;
  }

  getCharacterPlacement(): CharacterPlacement | null {
    const view = this.getCurrentView();
    const base = view.character;
    if (!base) return null;
    const placed = { ...base, ...this._characterOverride };
    if (this._characterPos) {
      placed.x = this._characterPos.x;
      placed.y = this._characterPos.y;
      if (this._characterPos.facing) placed.facing = this._characterPos.facing;
    }
    return placed;
  }

  // ── Walking (docs/WALKABLE_AREAS.md) ──────────────────────────────────────

  /** The current view's walk area, or null if this view doesn't walk (no floor, or no character shown). */
  getWalkArea(): WalkArea | null {
    const view = this.getCurrentView();
    if (!view.walk_area || !view.character || !this.scenario.character) return null;
    const area = view.walk_area_variants?.find((v) => this.evaluateConditions(v.when))?.walk_area ?? view.walk_area;
    if (!Array.isArray(area.floor) || area.floor.length < 3) return null;
    return area;
  }

  /** Record where the character now stands in the current view (called when a walk ends). */
  setCharacterPosition(pos: StandPoint | null): void {
    this._characterPos = pos ? { x: pos.x, y: pos.y, ...(pos.facing ? { facing: pos.facing } : {}) } : null;
  }

  getCharacterPosition(): StandPoint | null {
    return this._characterPos ? { ...this._characterPos } : null;
  }

  /**
   * Is this object a way out (a door, a vent)? True if any of its Move interactions can change the
   * view or end the game. In walking views, Move on an exit walks to it and runs the interaction;
   * Move on anything else just walks to the clicked spot.
   */
  isExit(objectId: string): boolean {
    const obj = this.scenario.objects.find((o) => o.id === objectId);
    if (!obj) return false;
    const leads = (effects: Effect[] | undefined): boolean =>
      (effects ?? []).some((e) => e.type === 'set_view' || e.type === 'game_over' || leads(e.then) || leads(e.else));
    return (obj.interactions ?? []).some((i) => i.verb === 'move' && leads(i.then));
  }

  /** Does this object have any interaction for `verb`? */
  hasInteraction(objectId: string, verb: string): boolean {
    const obj = this.scenario.objects.find((o) => o.id === objectId);
    return !!obj && (obj.interactions ?? []).some((i) => i.verb === verb);
  }

  /** The point to face when looking at or using an object: the centre of its sprite or hotspot. */
  getObjectFocus(objectId: string): { x: number; y: number } | null {
    const obj = this.scenario.objects.find((o) => o.id === objectId);
    if (!obj) return null;
    if (obj.sprite) {
      const h = (obj.sprite.frame_height * (obj.sprite.scale ?? 1)) / 0.75; // screen px -> 720-space
      return { x: obj.position.x, y: obj.position.y - h / 2 };
    }
    return { x: obj.position.x + obj.size.width / 2, y: obj.position.y + obj.size.height / 2 };
  }

  /**
   * Where the character should stand to Hand/Use/Move an object in the current walking view,
   * or null if he should interact from where he is (no walk area, or walk_to: false).
   */
  getApproach(objectId: string): StandPoint | null {
    const area = this.getWalkArea();
    const obj = this.scenario.objects.find((o) => o.id === objectId);
    if (!area || !obj || obj.walk_to === false) return null;
    let stand: { x: number; y: number };
    let facing: Facing | undefined;
    if (obj.walk_to) {
      stand = nearestFloorPoint(area, obj.walk_to);
      facing = obj.walk_to.facing;
    } else {
      const anchor = obj.sprite
        ? { x: obj.position.x, y: obj.position.y }
        : { x: obj.position.x + obj.size.width / 2, y: obj.position.y + obj.size.height };
      stand = nearestFloorPoint(area, anchor);
    }
    if (!facing) {
      const f = this.getObjectFocus(objectId)!;
      facing = facingFromDelta(f.x - stand.x, f.y - stand.y);
    }
    return { x: stand.x, y: stand.y, facing };
  }

  setCharacterOverride(overrides: Partial<CharacterPlacement> | null): void {
    this._characterOverride = overrides;
  }

  getObjectState(objectId: string): string {
    return this.objectStates[objectId] ?? '';
  }

  getInventory(): Item[] {
    return this.inventory
      .map(id => this.itemIndex.get(id))
      .filter((item): item is Item => item !== undefined);
  }

  getInventoryIds(): string[] {
    return [...this.inventory];
  }

  getEquippedItems(): Map<string, string> {
    return new Map(this.equippedItems);
  }

  getEquippedOverlays(): { itemId: string; overlay: import('./types').WearableOverlay }[] {
    const overlays: { itemId: string; overlay: import('./types').WearableOverlay }[] = [];
    for (const [, itemId] of this.equippedItems) {
      const item = this.itemIndex.get(itemId);
      if (item?.wearable) {
        overlays.push({ itemId, overlay: item.wearable });
      }
    }
    return overlays;
  }

  /** Register a callback for state changes that happen outside an action (delayed effects). */
  setChangeListener(fn: (() => void) | null): void {
    this.changeListener = fn;
  }

  getFlags(): Readonly<Record<string, string>> {
    return this.flags;
  }

  getNoiseLevel(): number {
    return this._noiseLevel;
  }

  getMessages(): string[] {
    return [...this._messages];
  }

  isGameOver(): boolean {
    return this._gameOver !== null;
  }

  getGameOverResult(): GameOverResult | null {
    return this._gameOver;
  }

  getCurrentPhaseId(): string | null {
    return this._currentPhaseId;
  }

  getAmbientText(): string {
    if (this._currentPhaseId && this.scenario.phases) {
      const phase = this.scenario.phases.find(p => p.id === this._currentPhaseId);
      if (phase?.ambient_text) {
        return phase.ambient_text;
      }
    }
    return this.scenario.setting.ambient_text;
  }

  getViewStack(): string[] {
    return [...this.viewHistory];
  }

  canGoBack(): boolean {
    return this.viewHistory.length > 0;
  }

  getBackLabel(): string | undefined {
    return this.getCurrentView().back_label;
  }

  getAvailableVerbs(objectId: string): string[] {
    const obj = this.objectIndex.get(objectId);
    if (!obj) return ['look'];

    const verbs = new Set<string>();
    verbs.add('look');

    for (const interaction of obj.interactions) {
      if (this.evaluateConditions(interaction.when)) {
        if (interaction.verb === 'use_item') {
          verbs.add('use');
        } else if (interaction.verb) {
          verbs.add(interaction.verb);
        }
      }
    }

    return Array.from(verbs);
  }

  getUsableItems(objectId: string): string[] {
    const obj = this.objectIndex.get(objectId);
    if (!obj) return [];

    const items: string[] = [];
    for (const interaction of obj.interactions) {
      if (
        interaction.verb === 'use_item' &&
        interaction.item &&
        this.inventory.includes(interaction.item) &&
        this.evaluateConditions(interaction.when)
      ) {
        items.push(interaction.item);
      }
    }
    return items;
  }

  interact(objectId: string, verb: string, itemId?: string): InteractionResult {
    if (this._gameOver) {
      return { success: false, messages: ['The game is over.'], noiseGenerated: 0 };
    }

    this._messages = [];
    this._pendingSounds = [];

    const obj = this.objectIndex.get(objectId);
    if (!obj) {
      return { success: false, messages: [`You don't see that here.`], noiseGenerated: 0 };
    }

    const actualVerb = verb === 'use' && itemId ? 'use_item' : verb;
    // Doing anything physical brings you out of hiding (looking and talking don't).
    if (actualVerb !== 'look' && actualVerb !== 'talk') this._isHiding = false;

    let matched = this.findMatchingInteraction(obj.interactions, actualVerb, itemId);

    if (!matched && verb === 'hand') {
      matched = this.findMatchingInteraction(obj.interactions, 'take', itemId);
    }

    if (!matched) {
      if (verb === 'look') {
        this._messages = [obj.description];
        return { success: true, messages: [obj.description], noiseGenerated: 0 };
      }
      const msg = this.getDefaultFailMessage(verb, obj.name);
      this._messages = [msg];
      return {
        success: false,
        messages: [msg],
        noiseGenerated: 0,
      };
    }

    const response = matched.response;
    if (response && (!matched.then || matched.then.length === 0)) {
      this._messages = [response];
      return { success: true, messages: [response], noiseGenerated: 0 };
    }

    const messages = this.applyEffects(matched.then);
    const noise = matched.noise ?? 0;
    if (noise > 0) {
      this._noiseLevel = Math.min(100, this._noiseLevel + noise);
    }

    this.checkGameEndConditions();

    return { success: true, messages, noiseGenerated: noise };
  }

  navigateToView(viewId: string): void {
    const view = this.scenario.views.find(v => v.id === viewId);
    if (!view) return;

    this.viewHistory.push(this._currentViewId);
    this.posHistory.push(this._characterPos);
    this._currentViewId = viewId;
    this._characterPos = null;
    this._messages = [];
  }

  navigateBack(): void {
    const previous = this.viewHistory.pop();
    const prevPos = this.posHistory.pop() ?? null;
    if (previous) {
      this._currentViewId = previous;
      this._characterPos = prevPos;
      this._messages = [];
    }
  }

  getScore(): number { return this._score; }

  // ── Game clock and patrols ──────────────────────────────────────────────

  /** Seconds of play so far. */
  getClock(): number { return this._clock; }

  isHiding(): boolean { return this._isHiding; }

  /** Come out of hiding (the player starts walking). */
  stopHiding(): void { this._isHiding = false; }

  /** Where a patrol is in its cycle at time t, relative to the room the player is in. */
  private patrolStatus(p: Patrol, t: number = this._clock): {
    sweep: number; u: number; here: boolean; approaching: boolean; stop: number;
  } | null {
    if (!this.patrolsEnabled || !p.period || !p.stops?.length) return null;
    if (!this.evaluateConditions(p.when)) return null;
    const first = p.first_at ?? p.period;
    if (t < first - (p.warn_seconds ?? 5)) return null;
    const warn = p.warn_seconds ?? 5;
    const view = this._currentViewId;
    // The sweep under way, and the next one (whose warning may already have started).
    for (const sweep of [Math.floor((t - first) / p.period), Math.floor((t - first) / p.period) + 1]) {
      if (sweep < 0) continue;
      const u = t - (first + sweep * p.period);
      for (let i = 0; i < p.stops.length; i++) {
        const s = p.stops[i];
        if (!s.views.includes(view)) continue;
        if (u >= s.enter && u < s.leave) return { sweep, u, here: true, approaching: false, stop: i };
        if (u >= s.enter - warn && u < s.enter) return { sweep, u, here: false, approaching: true, stop: i };
      }
    }
    return null;
  }

  /** Is `a` next door to `b` (a room with an exit into the other)? */
  private isNeighbour(a: string, b: string): boolean {
    if (!this.neighbourIndex) {
      const idx = new Map<string, Set<string>>();
      const link = (x: string, y: string) => { if (x === y) return; if (!idx.has(x)) idx.set(x, new Set()); idx.get(x)!.add(y); };
      const targets = (effects: Effect[] | undefined, out: string[]) => {
        for (const e of effects ?? []) {
          if (e.type === 'set_view' && e.view) out.push(e.view);
          targets(e.then, out); targets(e.else, out); targets(e.effects, out);
        }
        return out;
      };
      for (const v of this.scenario.views) {
        for (const id of v.objects ?? []) {
          const o = this.objectIndex.get(id);
          for (const it of o?.interactions ?? []) {
            if (it.verb !== 'move') continue;
            for (const to of targets(it.then, [])) { link(v.id, to); link(to, v.id); }
          }
        }
      }
      this.neighbourIndex = idx;
    }
    return !!this.neighbourIndex.get(a)?.has(b);
  }

  /** The room the player is in: a close-up sub-view (one with a back_label) counts as the room it was opened from. */
  private playerRoom(): string {
    let id = this._currentViewId;
    for (let i = this.viewHistory.length - 1; i >= 0; i--) {
      const v = this.scenario.views.find((x) => x.id === id);
      if (!v?.back_label) break;
      id = this.viewHistory[i];
    }
    return id;
  }

  /** The leg of the sweep under way, if a patrol is walking through some room right now. */
  private patrolLeg(p: Patrol, t: number = this._clock): { sweep: number; stop: number } | null {
    if (!this.patrolsEnabled || !p.period || !p.stops?.length || !this.evaluateConditions(p.when)) return null;
    const first = p.first_at ?? p.period;
    if (t < first) return null;
    const sweep = Math.floor((t - first) / p.period);
    const u = t - (first + sweep * p.period);
    const stop = p.stops.findIndex((s) => u >= s.enter && u < s.leave);
    return stop < 0 ? null : { sweep, stop };
  }

  /**
   * Move the game clock on by `seconds` and run the patrols: a warning (sound + message) when one is
   * about to come into the player's room, its enter sound when it does, and on_caught when it has had
   * him in plain sight for notice_seconds. Returns true when something changed that needs a redraw.
   */
  advanceClock(seconds: number): boolean {
    if (this._gameOver || seconds <= 0) return false;
    this._clock += seconds;
    let changed = false;
    for (const p of this.scenario.patrols ?? []) {
      const st = this.patrolStatus(p);
      // Heard through the wall: it comes into a room next door to the player's.
      if (p.nearby_sound && !st) {
        const leg = this.patrolLeg(p);
        const key = leg && `${p.id}:${leg.sweep}:${leg.stop}`;
        if (leg && key && !this.patrolHeard.has(key)) {
          this.patrolHeard.add(key);
          const room = this.playerRoom();
          const stop = p.stops[leg.stop];
          if (!stop.views.includes(room) && stop.views.some((v) => this.isNeighbour(v, room))) {
            this._pendingSounds.push(this.scenario.setting.sounds?.[p.nearby_sound] ?? p.nearby_sound);
            if (stop.nearby_message) this._messages = [stop.nearby_message];
            changed = true;
          }
        }
      }
      if (!st) { this.patrolSeen[p.id] = 0; continue; }
      const key = `${p.id}:${st.sweep}:${st.stop}`;
      const stop = p.stops[st.stop];
      if (st.approaching && !this.patrolWarned.has(key)) {
        this.patrolWarned.add(key);
        const text = stop.warn_message ?? p.warn_message;
        if (text) this._messages = [text];
        if (p.warn_sound) this._pendingSounds.push(this.scenario.setting.sounds?.[p.warn_sound] ?? p.warn_sound);
        changed = true;
      }
      if (st.here) {
        if (!this.patrolEntered.has(key)) {
          this.patrolEntered.add(key);
          this.patrolWarned.add(key);
          if (p.enter_sound) this._pendingSounds.push(this.scenario.setting.sounds?.[p.enter_sound] ?? p.enter_sound);
          changed = true;
        }
        const safe = this._isHiding || (stop.safe_when?.length ? this.evaluateConditions(stop.safe_when) : false);
        this.patrolSeen[p.id] = safe ? 0 : (this.patrolSeen[p.id] ?? 0) + Math.min(seconds, 0.25); // a jump in the clock never counts as being seen for long
        if (this.patrolSeen[p.id] >= (p.notice_seconds ?? 1.5)) {
          this.patrolSeen[p.id] = 0;
          const msgs = this.applyEffects(p.on_caught ?? []);
          if (msgs.length) this._messages = msgs;
          this.checkGameEndConditions();
          return true;
        }
      } else {
        this.patrolSeen[p.id] = 0;
      }
    }
    return changed;
  }

  /** Patrol units walking through the player's room right now, with where to draw them. */
  getPatrolSightings(): PatrolSighting[] {
    const out: PatrolSighting[] = [];
    for (const p of this.scenario.patrols ?? []) {
      const st = this.patrolStatus(p);
      if (!st?.here) continue;
      const s = p.stops[st.stop];
      const path = s.path?.length ? s.path : [[480, 600] as [number, number]];
      const f = Math.max(0, Math.min(1, (st.u - s.enter) / Math.max(0.001, s.leave - s.enter)));
      // even pace along the whole route
      const lens = path.slice(1).map((q, i) => Math.hypot(q[0] - path[i][0], q[1] - path[i][1]));
      const total = lens.reduce((a, b) => a + b, 0);
      let d = f * total, x = path[0][0], y = path[0][1];
      for (let i = 0; i < lens.length; i++) {
        if (d <= lens[i] || i === lens.length - 1) {
          const k = lens[i] ? Math.min(1, d / lens[i]) : 1;
          x = path[i][0] + (path[i + 1][0] - path[i][0]) * k;
          y = path[i][1] + (path[i + 1][1] - path[i][1]) * k;
          break;
        }
        d -= lens[i];
      }
      const left = s.leave - st.u;
      const opacity = s.fade_out ? Math.max(0, Math.min(1, left)) : 1;
      out.push({ id: p.id, sprite: p.sprite, shadow: p.shadow, x, y, flip: !!s.flip, opacity });
    }
    return out;
  }

  /** The transition sound the last set_view asked for, once (undefined = use the view's default). */
  /** The route of the last traverse effect (for the UI to animate), once. The engine has already moved him to its end. */
  takeTraverse(): { path: StandPoint[]; seconds?: number; sprite_set?: string; end: StandPoint } | null {
    const t = this._traverse; this._traverse = null; return t;
  }

  takeTransitionSound(): string | null | undefined {
    const s = this._transitionSound; this._transitionSound = undefined; return s;
  }

  /** Changes each time play_animation restarts this object's sprite. */
  getAnimationRun(objectId: string): number { return this.animationRuns[objectId] ?? 0; }

  /** The view's lighting now: the first lighting_variants entry whose conditions hold, else ambient_lighting. */
  getLighting(view: { ambient_lighting?: unknown; lighting_variants?: { when: Condition[]; lighting: unknown }[] } = this.getCurrentView()) {
    const v = (view.lighting_variants ?? []).find((x) => this.evaluateConditions(x.when));
    return (v ? v.lighting : view.ambient_lighting) as View['ambient_lighting'];
  }

  combineItems(itemA: string, itemB: string): InteractionResult {
    if (this._gameOver) {
      return { success: false, messages: ['The game is over.'], noiseGenerated: 0 };
    }

    this._messages = [];

    if (!this.inventory.includes(itemA) || !this.inventory.includes(itemB)) {
      return { success: false, messages: ["You don't have those items."], noiseGenerated: 0 };
    }

    const combo = this.scenario.combinations?.find(c => {
      const ids = c.items;
      return (
        (ids[0] === itemA && ids[1] === itemB) ||
        (ids[0] === itemB && ids[1] === itemA)
      );
    });

    if (!combo) {
      return { success: false, messages: ["Those items can't be combined."], noiseGenerated: 0 };
    }

    if (combo.conditions && !this.evaluateConditions(combo.conditions)) {
      return { success: false, messages: ["You can't do that yet."], noiseGenerated: 0 };
    }

    if (combo.consumes) {
      this.inventory = this.inventory.filter(id => id !== itemA && id !== itemB);
    }

    if (!this.inventory.includes(combo.result)) {
      this.inventory.push(combo.result);
    }

    const noise = combo.noise ?? 0;
    if (noise > 0) {
      this._noiseLevel = Math.min(100, this._noiseLevel + noise);
    }

    const messages = combo.message ? [combo.message] : [];
    this._messages = messages;

    this.checkGameEndConditions();

    return { success: true, messages, noiseGenerated: noise };
  }

  examineItem(itemId: string, verb: string = 'look'): InteractionResult {
    if (this._gameOver) {
      return { success: false, messages: ['The game is over.'], noiseGenerated: 0 };
    }

    this._messages = [];

    const item = this.itemIndex.get(itemId);
    if (!item) {
      return { success: false, messages: ['You examine nothing.'], noiseGenerated: 0 };
    }

    if (!this.inventory.includes(itemId)) {
      return { success: false, messages: ["You don't have that."], noiseGenerated: 0 };
    }

    const matched = this.findMatchingInteraction(item.examine, verb);

    if (!matched) {
      return { success: true, messages: [item.description], noiseGenerated: 0 };
    }

    const messages = this.applyEffects(matched.then);

    this.checkGameEndConditions();

    return { success: true, messages, noiseGenerated: 0 };
  }

  showMessage(text: string): void {
    this._messages = [text];
  }

  dismissMessages(): void {
    this._messages = [];
  }

  getCloseupImage(): string | null {
    return this._closeupImage;
  }

  dismissCloseup(): void {
    this._closeupImage = null;
  }

  getDialogue(): { prompt: string; choices: DialogueChoice[] } | null {
    if (!this._dialoguePrompt) return null;
    const available = this._dialogueChoices.filter(
      c => !c.when || this.evaluateConditions(c.when)
    );
    return { prompt: this._dialoguePrompt, choices: available };
  }

  selectDialogueChoice(index: number): string[] {
    const dialogue = this.getDialogue();
    if (!dialogue || index < 0 || index >= dialogue.choices.length) return [];
    const choice = dialogue.choices[index];
    this._dialoguePrompt = null;
    this._dialogueChoices = [];
    this._messages = [];
    const messages = this.applyEffects(choice.then);
    this.checkGameEndConditions();
    return messages;
  }

  dismissDialogue(): void {
    this._dialoguePrompt = null;
    this._dialogueChoices = [];
  }

  getActiveWidget(): PuzzleWidget | null {
    if (!this._activeWidgetId) return null;
    return this.scenario.puzzle_widgets?.find(w => w.id === this._activeWidgetId) ?? null;
  }

  isWidgetSolved(widgetId: string): boolean {
    return !!this.solvedWidgets[widgetId];
  }

  closeWidget(): void {
    this._activeWidgetId = null;
  }

  /** One key press on the active widget: only adds the widget's noise_per_interaction. */
  pressWidgetKey(): void {
    const w = this.getActiveWidget();
    if (w?.noise_per_interaction) this._noiseLevel = Math.min(100, this._noiseLevel + w.noise_per_interaction);
  }

  /**
   * Submit an entry (key values in order) to the active keypad widget.
   * Correct: closes the widget, marks it solved, runs on_solve (messages go to the message panel).
   * Wrong: widget stays open, runs on_fail, returns in-widget feedback; every max_attempts wrong
   * entries runs on_max_fail and resets the counter (never a permanent lock).
   */
  submitWidget(entry: string[]): WidgetSubmitResult {
    const w = this.getActiveWidget();
    if (!w || this._gameOver) return { solved: false, feedback: null, messages: [] };
    const sol = w.config.solution;
    const expected = typeof sol === 'string' ? sol.split('') : (sol ?? []).map(String);
    this._messages = [];
    if (entry.length === expected.length && entry.every((v, i) => v === expected[i])) {
      this._activeWidgetId = null;
      this.solvedWidgets[w.id] = true;
      const messages = this.applyEffects(w.on_solve ?? []);
      this._messages = messages;
      this.checkGameEndConditions();
      return { solved: true, feedback: null, messages };
    }
    const n = (this.widgetAttempts[w.id] ?? 0) + 1;
    const texts = w.config.fail_text ?? [];
    const feedback = texts.length ? texts[(n - 1) % texts.length] : null;
    const messages = this.applyEffects(w.on_fail ?? []);
    if (w.max_attempts && n >= w.max_attempts) {
      messages.push(...this.applyEffects(w.on_max_fail ?? []));
      this.widgetAttempts[w.id] = 0;
    } else {
      this.widgetAttempts[w.id] = n;
    }
    this._messages = messages;
    this.checkGameEndConditions();
    return { solved: false, feedback, messages };
  }

  getPendingSounds(): string[] {
    return this._pendingSounds;
  }

  clearPendingSounds(): void {
    this._pendingSounds = [];
  }

  getHint(): string | null {
    const view = this.getCurrentView();
    if (!view.hints || view.hints.length === 0) return null;

    let best: string | null = null;
    for (const hint of view.hints) {
      if (this.evaluateConditions(hint.when)) {
        best = hint.text;
      }
    }
    return best;
  }

  decayNoise(amount: number): void {
    this._noiseLevel = Math.max(0, this._noiseLevel - amount);
  }

  private findMatchingInteraction(
    interactions: Interaction[],
    verb: string,
    itemId?: string,
  ): Interaction | null {
    for (const interaction of interactions) {
      if (interaction.verb !== verb) continue;
      if (verb === 'use_item' && interaction.item !== itemId) continue;
      if (this.evaluateConditions(interaction.when)) {
        return interaction;
      }
    }
    return null;
  }

  private evaluateConditions(conditions: Condition[] | undefined): boolean {
    if (!conditions || conditions.length === 0) return true;

    for (const c of conditions) {
      if (!this.evaluateCondition(c)) return false;
    }
    return true;
  }

  private evaluateCondition(c: Condition): boolean {
    switch (c.type) {
      case 'flag_is':
        return this.flags[c.flag!] === (c.value ?? 'true');
      case 'flag_not':
        return this.flags[c.flag!] !== (c.value ?? 'true');
      case 'object_state':
        return this.objectStates[c.object!] === c.state;
      case 'has_item':
        return this.inventory.includes(c.item!);
      case 'not_has_item':
        return !this.inventory.includes(c.item!);
      case 'view_is':
        return this._currentViewId === c.view;
      case 'not_in_view':
        return this._currentViewId !== c.view;
      case 'phase_is':
        return this._currentPhaseId === c.phase;
      case 'is_hiding':
        return this._isHiding;
      case 'not_hiding':
        return !this._isHiding;
      case 'all_of':
        return (c.conditions ?? []).every(sub => this.evaluateCondition(sub));
      case 'any_of':
        return (c.conditions ?? []).some(sub => this.evaluateCondition(sub));
      case 'noise_above':
        return this._noiseLevel > (c.threshold ?? 0);
      case 'noise_below':
        return this._noiseLevel < (c.threshold ?? 0);
      case 'item_count':
        return this.inventory.length >= (c.count ?? 0);
      case 'killer_is':
        return false;
      case 'widget_solved':
        return !!(c.widget && this.solvedWidgets[c.widget]);
      case 'patrol_near': {
        const p = this.scenario.patrols?.find((x) => x.id === c.patrol);
        const st = p ? this.patrolStatus(p) : null;
        return !!st && (st.approaching || st.here);
      }
      default:
        return true;
    }
  }

  private applyEffects(effects: Effect[]): string[] {
    const messages: string[] = [];

    for (const e of effects) {
      switch (e.type) {
        case 'message':
          if (e.text) {
            messages.push(e.text);
            this._messages.push(e.text);
            if (e.voice) this._pendingSounds.push(e.voice);
          }
          break;

        case 'random_message':
          if (e.messages && e.messages.length > 0) {
            const text = e.messages[Math.floor(Math.random() * e.messages.length)];
            messages.push(text);
            this._messages.push(text);
          }
          break;

        case 'set_flag':
          if (e.flag) {
            this.flags[e.flag] = e.value ?? 'true';
          }
          break;

        case 'set_state':
          if (e.object && e.state) {
            this.objectStates[e.object] = e.state;
          }
          break;

        case 'add_item':
          if (e.item && !this.inventory.includes(e.item)) {
            this.inventory.push(e.item);
            const itemDef = this.itemIndex.get(e.item);
            if (itemDef?.wearable?.auto_equip) {
              this.equippedItems.set(itemDef.wearable.slot, e.item);
            }
          }
          break;

        case 'remove_item':
          if (e.item) {
            this.inventory = this.inventory.filter(id => id !== e.item);
            for (const [slot, itemId] of this.equippedItems) {
              if (itemId === e.item) {
                this.equippedItems.delete(slot);
                break;
              }
            }
          }
          break;

        case 'equip_item':
          if (e.item && this.inventory.includes(e.item)) {
            const eqItem = this.itemIndex.get(e.item);
            if (eqItem?.wearable) {
              this.equippedItems.set(eqItem.wearable.slot, e.item);
            }
          }
          break;

        case 'unequip_item':
          if (e.item) {
            for (const [slot, itemId] of this.equippedItems) {
              if (itemId === e.item) {
                this.equippedItems.delete(slot);
                break;
              }
            }
          }
          break;

        case 'set_view':
          this._activeWidgetId = null; // moving to another view closes any open puzzle widget
          if (e.view) {
            this.viewHistory.push(this._currentViewId);
    this.posHistory.push(this._characterPos);
            this._currentViewId = e.view;
            this._characterPos = e.at ? { x: e.at.x, y: e.at.y, ...(e.at.facing ? { facing: e.at.facing } : {}) } : null;
            this._transitionSound = 'sound' in e ? (e.sound ?? null) : undefined;
            const decay = this.scenario.setting.noise_decay ?? 0;
            if (decay > 0) this._noiseLevel = Math.max(0, this._noiseLevel - decay);
          }
          break;

        case 'add_score':
          if (e.id && this.scoredIds.has(e.id)) break;
          if (e.id) this.scoredIds.add(e.id);
          this._score += e.points ?? 0;
          break;

        case 'traverse':
          // Carry the character along a fixed route (a rope, a ladder, a ledge), ignoring the floor.
          // State moves to the end at once; the UI animates the route from takeTraverse().
          if (e.path && e.path.length) {
            const path = e.path.map(([x, y]) => ({ x, y }));
            // `at` is where his feet end up when the route is drawn from another point (hands on a rope)
            const last = path[path.length - 1];
            const end = { x: e.at?.x ?? last.x, y: e.at?.y ?? last.y, ...((e.at?.facing ?? e.facing) ? { facing: e.at?.facing ?? e.facing } : {}) };
            this._characterPos = end;
            this._traverse = { path, seconds: e.seconds, sprite_set: e.sprite_set, end };
          }
          break;
        case 'play_animation':
          if (e.object) {
            this.objectVisibility[e.object] = true;
            this.animationRuns[e.object] = (this.animationRuns[e.object] ?? 0) + 1;
          }
          break;

        case 'add_noise':
          this._noiseLevel = Math.min(100, this._noiseLevel + (e.amount ?? 0));
          break;

        case 'set_noise':
          this._noiseLevel = Math.max(0, Math.min(100, e.amount ?? 0));
          break;

        case 'show_object':
          if (e.object) {
            this.objectVisibility[e.object] = true;
          }
          break;

        case 'hide_object':
          if (e.object) {
            this.objectVisibility[e.object] = false;
          }
          break;

        case 'set_animation':
          if (e.object) {
            this.objectAnimations[e.object] = e.value ?? '';
          }
          break;

        case 'show_closeup':
          if (e.image) {
            this._closeupImage = e.image;
          }
          break;

        case 'game_over':
          this._gameOver = {
            won: e.result === 'win',
            conditionId: 'effect_triggered',
            text: e.reason ?? (e.result === 'win' ? 'You win!' : 'Game over.'),
            ...(e.title ? { title: e.title } : {}),
          };
          break;

        case 'advance_phase':
          if (e.phase && this.scenario.phases) {
            this._currentPhaseId = e.phase;
            const phase = this.scenario.phases.find(p => p.id === e.phase);
            if (phase?.on_enter) {
              const phaseMessages = this.applyEffects(phase.on_enter);
              messages.push(...phaseMessages);
            }
          }
          break;

        case 'start_hiding':
          this._isHiding = true;
          break;

        case 'stop_hiding':
          this._isHiding = false;
          break;

        case 'delay_then':
          if (e.effects && this.immediateDelays) {
            messages.push(...this.applyEffects(e.effects));
          } else if (e.effects) {
            const delayMs = (e.seconds ?? 0) * 1000;
            const delayedEffects = e.effects;
            const epoch = this.epoch;
            setTimeout(() => {
              if (epoch !== this.epoch) return;
              const delayMessages = this.applyEffects(delayedEffects);
              this._messages.push(...delayMessages);
              this.checkGameEndConditions();
              this.changeListener?.();
            }, delayMs);
          }
          break;

        case 'conditional_effect':
          if (e.when && this.evaluateConditions(e.when)) {
            if (e.then) {
              const thenMessages = this.applyEffects(e.then);
              messages.push(...thenMessages);
            }
          } else if (e.else) {
            const elseMessages = this.applyEffects(e.else);
            messages.push(...elseMessages);
          }
          break;

        case 'transform_item':
          if (e.item && e.into) {
            const idx = this.inventory.indexOf(e.item);
            if (idx !== -1) {
              this.inventory[idx] = e.into;
            }
          }
          break;

        case 'set_character': {
          const overrides: Partial<CharacterPlacement> = {};
          if (e.sprite_set) overrides.sprite_set = e.sprite_set;
          if (e.facing) overrides.facing = e.facing;
          if (e.x !== undefined) overrides.x = e.x;
          if (e.y !== undefined) overrides.y = e.y;
          if (e.frame !== undefined) overrides.frame = e.frame;
          if (e.flip_h !== undefined) overrides.flip_h = e.flip_h;
          this._characterOverride = { ...this._characterOverride, ...overrides };
          break;
        }

        case 'play_sound':
          if (e.sound) {
            const resolved = this.scenario.setting.sounds?.[e.sound] ?? e.sound;
            this._pendingSounds.push(resolved);
          }
          break;

        case 'show_dialogue':
          if (e.prompt && e.choices) {
            this._dialoguePrompt = e.prompt;
            this._dialogueChoices = e.choices;
          }
          break;

        case 'open_widget':
          if (e.widget && this.scenario.puzzle_widgets?.some(w => w.id === e.widget)) {
            this._activeWidgetId = e.widget;
          }
          break;

        case 'visual_cue':
        case 'trigger_event':
          break;
      }
    }

    return messages;
  }

  /**
   * Condition-triggered events (scenario.events): after every player action, an event whose trigger
   * has just become true runs its effects. one_shot events run at most once; others run again each
   * time their trigger becomes true after having been false. Time-based triggers (time_after,
   * time_before) are not evaluated here.
   */
  private runEvents(): void {
    for (const ev of this.scenario.events ?? []) {
      const t = ev.trigger as Condition | undefined;
      if (!t || typeof t.type !== 'string' || t.type.startsWith('time_')) continue;
      if (ev.one_shot && this.eventsFired.has(ev.id)) continue;
      const on = this.evaluateConditions([t]);
      if (on && !this.eventsActive.has(ev.id)) {
        this.eventsActive.add(ev.id);
        this.eventsFired.add(ev.id);
        this.applyEffects(ev.effects ?? []);
        if (this._gameOver) return;
      } else if (!on) {
        this.eventsActive.delete(ev.id);
      }
    }
  }

  /**
   * Everything a player action can change, as plain data (for "undo last move" after a death).
   * Messages, dialogue, close-ups and open widgets are transient and not included.
   */
  snapshot(): EngineSnapshot {
    return structuredClone({
      view: this._currentViewId, flags: this.flags, objectStates: this.objectStates, objectVisibility: this.objectVisibility,
      objectAnimations: this.objectAnimations, inventory: this.inventory, noise: this._noiseLevel, viewHistory: this.viewHistory,
      gameOver: this._gameOver, phase: this._currentPhaseId, hiding: this._isHiding, characterOverride: this._characterOverride,
      characterPos: this._characterPos, posHistory: this.posHistory, eventsFired: [...this.eventsFired], eventsActive: [...this.eventsActive],
      widgetAttempts: this.widgetAttempts, solvedWidgets: this.solvedWidgets, equipped: [...this.equippedItems],
      score: this._score, scoredIds: [...this.scoredIds], clock: this._clock,
    });
  }

  /** Put the game back exactly as it was when `snapshot()` was taken. */
  restore(snap: EngineSnapshot): void {
    const s = structuredClone(snap);
    this._currentViewId = s.view; this.flags = s.flags; this.objectStates = s.objectStates; this.objectVisibility = s.objectVisibility;
    this.objectAnimations = s.objectAnimations; this.inventory = s.inventory; this._noiseLevel = s.noise; this.viewHistory = s.viewHistory;
    this._gameOver = s.gameOver; this._currentPhaseId = s.phase; this._isHiding = s.hiding; this._characterOverride = s.characterOverride;
    this._characterPos = s.characterPos; this.posHistory = s.posHistory; this.eventsFired = new Set(s.eventsFired); this.eventsActive = new Set(s.eventsActive);
    this.widgetAttempts = s.widgetAttempts; this.solvedWidgets = s.solvedWidgets; this.equippedItems = new Map(s.equipped);
    this._score = s.score; this.scoredIds = new Set(s.scoredIds); this._transitionSound = undefined;
    this._clock = s.clock ?? 0; this.patrolSeen = {};
    this._messages = []; this._pendingSounds = []; this._dialoguePrompt = null; this._dialogueChoices = [];
    this._activeWidgetId = null; this._closeupImage = null;
    this.epoch++;
  }

  private checkGameEndConditions(): void {
    if (this._gameOver) return;
    this.runEvents();
    if (this._gameOver) return;

    for (const wc of this.scenario.win_conditions ?? []) {
      if (wc.conditions && this.evaluateConditions(wc.conditions)) {
        this._gameOver = {
          won: true,
          conditionId: wc.id,
          text: wc.description,
        };
        return;
      }
    }

    for (const lc of this.scenario.lose_conditions ?? []) {
      if (lc.conditions && this.evaluateConditions(lc.conditions)) {
        this._gameOver = {
          won: false,
          conditionId: lc.id,
          text: lc.description,
        };
        return;
      }
    }
  }

  private static pick(pool: string[]): string {
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private getDefaultFailMessage(verb: string, objectName: string): string {
    switch (verb) {
      case 'move':
        return ScenarioEngine.pick([
          `You can't go that way.`,
          `That doesn't lead anywhere.`,
          `There's no passage through ${objectName}.`,
          `${objectName} isn't an exit.`,
        ]);
      case 'hand':
        return ScenarioEngine.pick([
          `You can't do anything useful with ${objectName} right now.`,
          `${objectName} doesn't budge.`,
          `You reach for ${objectName}, but nothing happens.`,
          `Touching ${objectName} accomplishes nothing.`,
          `You prod ${objectName}. Nothing useful comes of it.`,
        ]);
      case 'take':
        return ScenarioEngine.pick([
          `You can't take ${objectName}.`,
          `${objectName} won't come loose.`,
          `You tug at ${objectName}, but it's firmly in place.`,
        ]);
      case 'talk':
        return ScenarioEngine.pick([
          `Talking to ${objectName} doesn't accomplish anything.`,
          `${objectName} has nothing to say.`,
          `You mutter at ${objectName}. Unsurprisingly, no response.`,
          `${objectName} remains silent.`,
        ]);
      case 'use':
      case 'use_item':
        return ScenarioEngine.pick([
          `That doesn't seem to work.`,
          `That combination doesn't do anything useful.`,
          `You try, but nothing happens.`,
          `Those two things don't go together.`,
        ]);
      default:
        return ScenarioEngine.pick([
          `Nothing happens.`,
          `That doesn't do anything.`,
          `Nothing useful comes of that.`,
        ]);
    }
  }
}
