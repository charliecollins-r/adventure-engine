export const MessageType = {
  CREATE_GAME: 'CREATE_GAME',
  JOIN_GAME: 'JOIN_GAME',
  SELECT_CHARACTER: 'SELECT_CHARACTER',
  PLAYER_MOVE: 'PLAYER_MOVE',
  PLAYER_INTERACT: 'PLAYER_INTERACT',
  GAME_STATE: 'GAME_STATE',
  PLAYER_JOINED: 'PLAYER_JOINED',
  PLAYER_LEFT: 'PLAYER_LEFT',
  CHARACTER_SELECTED: 'CHARACTER_SELECTED',
  INVENTORY_UPDATE: 'INVENTORY_UPDATE',
  OBJECT_UPDATE: 'OBJECT_UPDATE',
  ERROR: 'ERROR',
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface GameMessage {
  type: MessageType;
  payload: Record<string, unknown>;
}

export interface PlayerState {
  playerId: string;
  characterId: string | null;
  x: number;
  y: number;
  currentAnimation: string;
  connected: boolean;
}

export interface SceneObject {
  id: string;
  type: 'item' | 'interactive' | 'scenery';
  x: number;
  y: number;
  visible: boolean;
  state: string;
  collectible: boolean;
}

export interface GameState {
  currentScene: string;
  inventory: string[];
  sceneObjects: Record<string, SceneObject>;
  puzzleStates: Record<string, string>;
  players: Record<string, PlayerState>;
}

export interface CharacterProfile {
  id: string;
  name: string;
  spriteKey: string;
}

export const CHARACTERS: CharacterProfile[] = [
  { id: 'graham', name: 'King Graham', spriteKey: 'graham_sprite' },
  { id: 'cedric', name: 'Cedric', spriteKey: 'cedric_sprite' },
];
