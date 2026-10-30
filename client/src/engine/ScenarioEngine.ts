import type {
  Scenario,
  View,
  ScenarioObject,
  Item,
  Condition,
  Effect,
  Interaction,
  InteractionResult,
  GameOverResult,
} from './types';

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
  private viewHistory: string[];
  private _gameOver: GameOverResult | null;
  private _currentPhaseId: string | null;
  private _isHiding: boolean;

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

    const obj = this.objectIndex.get(objectId);
    if (!obj) {
      return { success: false, messages: [`You don't see that here.`], noiseGenerated: 0 };
    }

    const actualVerb = verb === 'use' && itemId ? 'use_item' : verb;

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
    this._currentViewId = viewId;
    this._messages = [];
  }

  navigateBack(): void {
    const previous = this.viewHistory.pop();
    if (previous) {
      this._currentViewId = previous;
      this._messages = [];
    }
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

  private evaluateConditions(conditions: Condition[]): boolean {
    if (conditions.length === 0) return true;

    for (const c of conditions) {
      if (!this.evaluateCondition(c)) return false;
    }
    return true;
  }

  private evaluateCondition(c: Condition): boolean {
    switch (c.type) {
      case 'flag_is':
        return this.flags[c.flag!] === c.value;
      case 'flag_not':
        return this.flags[c.flag!] !== c.value;
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
          }
          break;

        case 'remove_item':
          if (e.item) {
            this.inventory = this.inventory.filter(id => id !== e.item);
          }
          break;

        case 'set_view':
          if (e.view) {
            this.viewHistory.push(this._currentViewId);
            this._currentViewId = e.view;
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

        case 'game_over':
          this._gameOver = {
            won: e.result === 'win',
            conditionId: 'effect_triggered',
            text: e.reason ?? (e.result === 'win' ? 'You win!' : 'Game over.'),
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
          if (e.effects) {
            const delayMs = (e.seconds ?? 0) * 1000;
            const delayedEffects = e.effects;
            setTimeout(() => {
              const delayMessages = this.applyEffects(delayedEffects);
              this._messages.push(...delayMessages);
              this.checkGameEndConditions();
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

        case 'visual_cue':
        case 'play_sound':
        case 'trigger_event':
          break;
      }
    }

    return messages;
  }

  private checkGameEndConditions(): void {
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
