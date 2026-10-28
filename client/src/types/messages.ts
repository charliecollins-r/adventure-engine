export const MessageType = {
  CREATE_GAME: 'CREATE_GAME',
  JOIN_GAME: 'JOIN_GAME',
  SELECT_ROLE: 'SELECT_ROLE',
  PLAYER_MOVE: 'PLAYER_MOVE',
  PLAYER_INTERACT: 'PLAYER_INTERACT',
  GAME_STATE: 'GAME_STATE',
  PLAYER_JOINED: 'PLAYER_JOINED',
  PLAYER_LEFT: 'PLAYER_LEFT',
  INTERACTION_RESULT: 'INTERACTION_RESULT',
  NOISE_ALERT: 'NOISE_ALERT',
  INVENTORY_UPDATE: 'INVENTORY_UPDATE',
  OBJECT_UPDATE: 'OBJECT_UPDATE',
  GAME_OVER: 'GAME_OVER',
  ERROR: 'ERROR',
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface GameMessage {
  type: MessageType;
  payload: Record<string, unknown>;
}

export interface PlayerState {
  playerId: string;
  roleId: string | null;
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

export interface GameStateData {
  roomCode?: string;
  noiseLevel: number;
  suspicionLevel?: number;
  killerUpstairs: boolean;
  killerActivity?: string;
  powerOn: boolean;
  gameOver: boolean;
  winner?: string;
  gameOverReason?: string;
  inventory: string[];
  sceneObjects: Record<string, SceneObject>;
  puzzleStates: Record<string, string>;
  players: Record<string, PlayerState>;
  availableRoles?: Array<{ id: string; name: string; description: string }>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export const ROLES: Role[] = [
  { id: 'captive', name: 'The Captive', description: 'Trapped upstairs. Find a way to escape before it\'s too late.' },
  { id: 'killer', name: 'The Killer', description: 'Keep your captive contained. Don\'t let anyone find out.' },
];
