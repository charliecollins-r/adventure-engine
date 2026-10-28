import Phaser from 'phaser';
import type { GameStateData } from '../../types/messages';

interface SendMove {
  (x: number, y: number): void;
}

interface SendInteract {
  (objectId: string): void;
}

interface ObjectSpriteConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  label: string;
}

const CAPTIVE_OBJECTS: Record<string, ObjectSpriteConfig> = {
  bed: { x: 180, y: 450, width: 120, height: 60, color: 0x4a3a2a, label: 'Bed' },
  floorboard: { x: 450, y: 550, width: 80, height: 20, color: 0x6a5030, label: 'Loose Board' },
  window: { x: 750, y: 200, width: 80, height: 100, color: 0x2a3a5a, label: 'Window' },
  closet: { x: 100, y: 280, width: 70, height: 120, color: 0x3a2a1a, label: 'Closet' },
  bucket: { x: 600, y: 500, width: 30, height: 35, color: 0x5a5a5a, label: 'Bucket' },
  heating_pipe: { x: 850, y: 350, width: 20, height: 200, color: 0x7a7a7a, label: 'Pipe' },
  door: { x: 500, y: 250, width: 60, height: 110, color: 0x3a2020, label: 'Door' },
  metal_rod: { x: 460, y: 560, width: 40, height: 8, color: 0x8a8a8a, label: 'Metal Rod' },
};

const KILLER_OBJECTS: Record<string, ObjectSpriteConfig> = {
  security_monitors: { x: 200, y: 280, width: 120, height: 80, color: 0x1a2a1a, label: 'Monitors' },
  workbench: { x: 500, y: 450, width: 140, height: 50, color: 0x4a3a20, label: 'Workbench' },
  front_door: { x: 800, y: 300, width: 70, height: 120, color: 0x4a3020, label: 'Front Door' },
  phone: { x: 350, y: 350, width: 25, height: 35, color: 0x2a2a2a, label: 'Phone' },
  light_switch: { x: 100, y: 350, width: 15, height: 25, color: 0xaaaaaa, label: 'Lights' },
  stairs: { x: 650, y: 250, width: 100, height: 140, color: 0x3a2a2a, label: 'Stairs' },
  wall_compartment: { x: 400, y: 200, width: 50, height: 50, color: 0x3a3a3a, label: 'Compartment' },
};

export class RoomScene extends Phaser.Scene {
  private objectSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private sendMove: SendMove = () => {};
  private sendInteract: SendInteract = () => {};
  private role: string = '';

  private noiseBar!: Phaser.GameObjects.Rectangle;
  private suspicionBar?: Phaser.GameObjects.Rectangle;
  private killerWarning?: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private messageTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'RoomScene' });
  }

  init(data: { sendMove: SendMove; sendInteract: SendInteract; playerId: string; role: string }) {
    this.sendMove = data.sendMove;
    this.sendInteract = data.sendInteract;
    this.role = data.role;
  }

  create() {
    if (this.role === 'captive') {
      this.createCaptiveRoom();
    } else {
      this.createKillerRoom();
    }

    this.createHUD();
    this.createObjects();

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.sendMove(Math.round(pointer.worldX), Math.round(pointer.worldY));
    });
  }

  private createCaptiveRoom() {
    this.cameras.main.setBackgroundColor('#1a1a2a');

    // Stone walls
    this.add.rectangle(512, 100, 960, 200, 0x2a2a30);
    this.add.rectangle(512, 100, 960, 200).setStrokeStyle(1, 0x3a3a40);

    // Side walls
    this.add.rectangle(40, 384, 80, 568, 0x28282e);
    this.add.rectangle(984, 384, 80, 568, 0x28282e);

    // Wooden floor with plank lines
    this.add.rectangle(512, 520, 960, 300, 0x3a2a18);
    for (let i = 0; i < 8; i++) {
      const y = 400 + i * 35;
      this.add.rectangle(512, y, 900, 1, 0x2a1a0a);
    }

    // Ceiling
    this.add.rectangle(512, 30, 960, 60, 0x1a1a20);

    // Dim light from above
    const light = this.add.circle(512, 60, 150, 0xffeecc, 0.03);
    light.setBlendMode(Phaser.BlendModes.ADD);
  }

  private createKillerRoom() {
    this.cameras.main.setBackgroundColor('#151510');

    // Concrete walls
    this.add.rectangle(512, 100, 960, 200, 0x2a2820);
    this.add.rectangle(512, 100, 960, 200).setStrokeStyle(1, 0x3a3528);

    // Side walls
    this.add.rectangle(40, 384, 80, 568, 0x262418);
    this.add.rectangle(984, 384, 80, 568, 0x262418);

    // Concrete floor
    this.add.rectangle(512, 520, 960, 300, 0x2a2820);

    // Overhead light glow
    const light = this.add.circle(512, 80, 200, 0xffddaa, 0.05);
    light.setBlendMode(Phaser.BlendModes.ADD);

    // Light fixture
    this.add.rectangle(512, 30, 40, 10, 0x555540);
    this.add.rectangle(512, 40, 4, 30, 0x444430);
  }

  private createHUD() {
    const barWidth = 160;
    const barHeight = 14;
    const hudY = 20;

    // Noise bar (both roles)
    this.add.text(20, hudY - 2, 'NOISE', {
      fontSize: '11px',
      color: '#cc8844',
      fontFamily: 'monospace',
    }).setScrollFactor(0).setDepth(100);

    this.add.rectangle(80 + barWidth / 2, hudY + 6, barWidth, barHeight, 0x1a1a1a)
      .setStrokeStyle(1, 0x3a3020).setScrollFactor(0).setDepth(100);

    this.noiseBar = this.add.rectangle(80, hudY + 6, 0, barHeight - 2, 0xcc6622)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);

    if (this.role === 'killer') {
      const susY = hudY + 24;
      this.add.text(20, susY - 2, 'SUSPICION', {
        fontSize: '11px',
        color: '#cc4444',
        fontFamily: 'monospace',
      }).setScrollFactor(0).setDepth(100);

      this.add.rectangle(100 + barWidth / 2, susY + 6, barWidth, barHeight, 0x1a1a1a)
        .setStrokeStyle(1, 0x3a2020).setScrollFactor(0).setDepth(100);

      this.suspicionBar = this.add.rectangle(100, susY + 6, 0, barHeight - 2, 0xcc2222)
        .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    }

    if (this.role === 'captive') {
      this.killerWarning = this.add.text(512, 80, '', {
        fontSize: '20px',
        color: '#ff2222',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        backgroundColor: '#000000aa',
        padding: { x: 16, y: 8 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(102).setAlpha(0);
    }

    // Status text (top right)
    this.statusText = this.add.text(1004, hudY, '', {
      fontSize: '11px',
      color: '#6a5a4a',
      fontFamily: 'monospace',
      align: 'right',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    // Interaction message (bottom center)
    this.messageText = this.add.text(512, 680, '', {
      fontSize: '14px',
      color: '#e0d0a0',
      fontFamily: '"Georgia", serif',
      backgroundColor: '#000000cc',
      padding: { x: 12, y: 8 },
      align: 'center',
      wordWrap: { width: 600 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102).setAlpha(0);
  }

  private createObjects() {
    const configs = this.role === 'captive' ? CAPTIVE_OBJECTS : KILLER_OBJECTS;

    for (const [objId, cfg] of Object.entries(configs)) {
      const rect = this.add.rectangle(0, 0, cfg.width, cfg.height, cfg.color);
      rect.setStrokeStyle(2, this.brighten(cfg.color, 0x202020));

      const label = this.add.text(0, cfg.height / 2 + 6, cfg.label, {
        fontSize: '10px',
        color: '#8a7a5a',
        fontFamily: 'monospace',
      }).setOrigin(0.5, 0);

      const container = this.add.container(cfg.x, cfg.y, [rect, label]);
      container.setSize(cfg.width, cfg.height);
      container.setInteractive({ useHandCursor: true });

      container.on('pointerover', () => {
        rect.setStrokeStyle(2, 0xccaa44);
        label.setColor('#ccaa44');
      });
      container.on('pointerout', () => {
        rect.setStrokeStyle(2, this.brighten(cfg.color, 0x202020));
        label.setColor('#8a7a5a');
      });
      container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        this.sendInteract(objId);
      });

      this.objectSprites.set(objId, container);
    }
  }

  private brighten(color: number, amount: number): number {
    const r = Math.min(255, ((color >> 16) & 0xff) + ((amount >> 16) & 0xff));
    const g = Math.min(255, ((color >> 8) & 0xff) + ((amount >> 8) & 0xff));
    const b = Math.min(255, (color & 0xff) + (amount & 0xff));
    return (r << 16) | (g << 8) | b;
  }

  updateFromState(gameState: GameStateData) {
    // Update noise bar
    const noiseWidth = (gameState.noiseLevel / 100) * 158;
    this.noiseBar.width = noiseWidth;
    if (gameState.noiseLevel > 70) {
      this.noiseBar.setFillStyle(0xff4422);
    } else if (gameState.noiseLevel > 40) {
      this.noiseBar.setFillStyle(0xcc8822);
    } else {
      this.noiseBar.setFillStyle(0xcc6622);
    }

    // Update suspicion bar (killer only)
    if (this.suspicionBar && gameState.suspicionLevel !== undefined) {
      const susWidth = (gameState.suspicionLevel / 100) * 158;
      this.suspicionBar.width = susWidth;
    }

    // Killer warning (captive only)
    if (this.killerWarning) {
      if (gameState.killerUpstairs) {
        this.killerWarning.setText('THE KILLER IS COMING UPSTAIRS');
        this.killerWarning.setAlpha(1);
      } else {
        this.killerWarning.setAlpha(0);
      }
    }

    // Status text
    const statusLines: string[] = [];
    if (gameState.powerOn === false) {
      statusLines.push('POWER OFF');
    }
    if (this.role === 'killer' && gameState.killerActivity) {
      statusLines.push(gameState.killerActivity);
    }
    this.statusText.setText(statusLines.join('\n'));

    // Update object visibility from server state
    if (gameState.sceneObjects) {
      for (const [objId, obj] of Object.entries(gameState.sceneObjects)) {
        const sprite = this.objectSprites.get(objId);
        if (sprite) {
          sprite.setVisible(obj.visible);
        }
      }
    }
  }

  showMessage(text: string) {
    this.messageText.setText(text);
    this.messageText.setAlpha(1);

    if (this.messageTimer) {
      this.messageTimer.destroy();
    }
    this.messageTimer = this.time.delayedCall(3000, () => {
      this.messageText.setAlpha(0);
    });
  }
}
