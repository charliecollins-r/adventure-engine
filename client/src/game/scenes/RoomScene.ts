import Phaser from 'phaser';
import type { GameState, PlayerState, SceneObject } from '../../types/messages';

interface SendMove {
  (x: number, y: number): void;
}

interface SendInteract {
  (objectId: string): void;
}

export class RoomScene extends Phaser.Scene {
  private playerSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private objectSprites: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private targetPositions: Map<string, { x: number; y: number }> = new Map();
  private sendMove: SendMove = () => {};
  private sendInteract: SendInteract = () => {};
  private localPlayerId: string = '';

  constructor() {
    super({ key: 'RoomScene' });
  }

  init(data: { sendMove: SendMove; sendInteract: SendInteract; playerId: string }) {
    this.sendMove = data.sendMove;
    this.sendInteract = data.sendInteract;
    this.localPlayerId = data.playerId;
  }

  preload() {
    const grahamGfx = this.make.graphics({ x: 0, y: 0 });
    grahamGfx.fillStyle(0x4477aa);
    grahamGfx.fillRect(0, 0, 32, 48);
    grahamGfx.fillStyle(0xeeccaa);
    grahamGfx.fillRect(8, 4, 16, 16);
    grahamGfx.generateTexture('graham_sprite', 32, 48);
    grahamGfx.destroy();

    const cedricGfx = this.make.graphics({ x: 0, y: 0 });
    cedricGfx.fillStyle(0x44aa55);
    cedricGfx.fillRect(0, 0, 32, 48);
    cedricGfx.fillStyle(0xeeccaa);
    cedricGfx.fillRect(8, 4, 16, 16);
    cedricGfx.generateTexture('cedric_sprite', 32, 48);
    cedricGfx.destroy();

    const itemGfx = this.make.graphics({ x: 0, y: 0 });
    itemGfx.fillStyle(0xddcc44);
    itemGfx.fillRect(0, 0, 24, 24);
    itemGfx.generateTexture('item_sprite', 24, 24);
    itemGfx.destroy();
  }

  create() {
    this.cameras.main.setBackgroundColor('#5a5a6a');

    const border = this.add.rectangle(512, 384, 960, 700, 0x4a4a5a);
    border.setStrokeStyle(4, 0x3a3a4a);

    this.add.rectangle(512, 720, 960, 20, 0x6a5a4a);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.sendMove(Math.round(pointer.worldX), Math.round(pointer.worldY));
    });
  }

  update(_time: number, delta: number) {
    const lerpFactor = Math.min(1, delta * 0.008);
    this.playerSprites.forEach((container, playerId) => {
      const target = this.targetPositions.get(playerId);
      if (target) {
        container.x += (target.x - container.x) * lerpFactor;
        container.y += (target.y - container.y) * lerpFactor;
      }
    });
  }

  updateFromState(gameState: GameState) {
    for (const [playerId, playerState] of Object.entries(gameState.players)) {
      if (!playerState.characterId || !playerState.connected) {
        const existing = this.playerSprites.get(playerId);
        if (existing) {
          existing.destroy();
          this.playerSprites.delete(playerId);
          this.targetPositions.delete(playerId);
        }
        continue;
      }

      this.targetPositions.set(playerId, { x: playerState.x, y: playerState.y });

      if (!this.playerSprites.has(playerId)) {
        this.createPlayerSprite(playerId, playerState);
      }
    }

    const activePlayers = new Set(
      Object.entries(gameState.players)
        .filter(([, ps]) => ps.characterId && ps.connected)
        .map(([id]) => id)
    );
    this.playerSprites.forEach((container, id) => {
      if (!activePlayers.has(id)) {
        container.destroy();
        this.playerSprites.delete(id);
        this.targetPositions.delete(id);
      }
    });

    this.updateSceneObjects(gameState.sceneObjects);
  }

  private createPlayerSprite(playerId: string, state: PlayerState) {
    const spriteKey = state.characterId === 'graham' ? 'graham_sprite' : 'cedric_sprite';
    const charName = state.characterId === 'graham' ? 'King Graham' : 'Cedric';

    const sprite = this.add.image(0, 0, spriteKey);
    sprite.setOrigin(0.5, 1);

    const label = this.add.text(0, -52, charName, {
      fontSize: '12px',
      color: '#e8c87a',
      backgroundColor: '#00000088',
      padding: { x: 4, y: 2 },
    });
    label.setOrigin(0.5, 1);

    if (playerId === this.localPlayerId) {
      const marker = this.add.triangle(0, -56, 0, 0, 4, -6, 8, 0, 0xe8c87a);
      marker.setOrigin(0.5, 1);
      const container = this.add.container(state.x, state.y, [sprite, label, marker]);
      this.playerSprites.set(playerId, container);
    } else {
      const container = this.add.container(state.x, state.y, [sprite, label]);
      this.playerSprites.set(playerId, container);
    }
  }

  private updateSceneObjects(sceneObjects: Record<string, SceneObject>) {
    for (const [objId, obj] of Object.entries(sceneObjects)) {
      let sprite = this.objectSprites.get(objId);

      if (!obj.visible) {
        if (sprite) {
          sprite.destroy();
          this.objectSprites.delete(objId);
        }
        continue;
      }

      if (!sprite) {
        sprite = this.add.rectangle(obj.x, obj.y, 24, 24, 0xddcc44);
        sprite.setStrokeStyle(2, 0xaa9933);
        if (obj.collectible || obj.type === 'interactive') {
          sprite.setInteractive({ useHandCursor: true });
          sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            pointer.event.stopPropagation();
            this.sendInteract(objId);
          });
        }
        this.objectSprites.set(objId, sprite);
      }

      sprite.setPosition(obj.x, obj.y);
      sprite.setVisible(obj.visible);
    }

    this.objectSprites.forEach((sprite, id) => {
      if (!sceneObjects[id]) {
        sprite.destroy();
        this.objectSprites.delete(id);
      }
    });
  }
}
