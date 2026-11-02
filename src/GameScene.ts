import Phaser from 'phaser';
import {
  COLORS,
  HINT,
  HUD_ACCENT,
  HUD_BOTTOM,
  HUD_TEXT,
  HUD_TOP,
  INK,
  MAX_GHOST_STEPS,
  TILE,
} from './constants';
import { createTextures } from './art';
import { LEVELS, Level, Point, keyOf, parseLevel, tileCenterX, tileCenterY } from './levels';
import { Ghost } from './Ghost';
import { Player } from './Player';

type GameState = 'playing' | 'dead' | 'won';

interface Plate {
  point: Point;
  sprite: Phaser.GameObjects.Image;
}

interface Door {
  point: Point;
  sprite: Phaser.GameObjects.Image;
}

const FONT = '"Comic Sans MS", "Trebuchet MS", "Segoe UI", sans-serif';

export class GameScene extends Phaser.Scene {
  private level!: Level;
  private levelIndex = 0;
  private player!: Player;
  private mapLayer!: Phaser.GameObjects.Container;
  private ghosts: Ghost[] = [];
  /** Tiles visited this run, one entry per tick: recording[0] is the start. */
  private recording: Point[] = [];
  private tick = 0;
  private segmentSteps = 0;
  private state: GameState = 'playing';
  private doorsOpen = false;
  private introActive = false;
  private plateHintShown = false;
  private campaignComplete = false;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private plates: Plate[] = [];
  private doors: Door[] = [];
  private timedSpikes: { point: Point; sprite: Phaser.GameObjects.Image }[] = [];
  private hudText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;
  private controlsText!: Phaser.GameObjects.Text;
  private overlay?: Phaser.GameObjects.Container;
  private intro?: Phaser.GameObjects.Container;

  constructor() {
    super('game');
  }

  create(): void {
    createTextures(this);
    this.campaignComplete = false;

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,R') as Record<string, Phaser.Input.Keyboard.Key>;

    this.hudText = this.add.text(10, 10, '', {
      fontFamily: FONT,
      fontSize: '13px',
      color: HUD_TEXT,
      fontStyle: 'bold',
    });
    this.objectiveText = this.add
      .text(this.scale.width - 10, 22, '', {
        fontFamily: FONT,
        fontSize: '12px',
        color: HUD_ACCENT,
        fontStyle: 'bold',
        align: 'right',
      })
      .setOrigin(1, 0.5);
    this.controlsText = this.add
      .text(this.scale.width / 2, this.scale.height - HUD_BOTTOM / 2, '', {
        fontFamily: FONT,
        fontSize: '14px',
        color: HUD_TEXT,
      })
      .setOrigin(0.5);

    this.loadLevel(0);
    this.showIntro();
  }

  update(): void {
    if (this.introActive) return;

    if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
      if (this.state === 'playing') this.restart();
      else if (this.state === 'dead') this.restart();
      else if (this.campaignComplete) this.fullReset();
      else this.advanceLevel();
      return;
    }

    if (this.state !== 'playing' || this.player.isMoving) return;

    const dir = this.readDirection();
    if (!dir) return;

    const to = { x: this.player.tile.x + dir.x, y: this.player.tile.y + dir.y };
    if (this.isBlocked(to)) return;

    // One player move = one tick. Everything else (ghosts, doors) follows it,
    // so replays stay deterministic no matter how fast the player moves.
    this.tick += 1;
    this.segmentSteps += 1;
    this.player.moveTo(to);
    this.recording.push({ ...to });

    this.ghosts.forEach((ghost) => ghost.advance());

    this.updateTimedSpikes();
    this.updateDoors();
    this.updateHud();

    if (this.isSpike(to)) this.die();
    else if (to.x === this.level.exit.x && to.y === this.level.exit.y) this.win();
    else if (this.segmentSteps >= LEVELS[this.levelIndex].playerStepsPerEcho) this.recordEcho();
  }

  private buildMap(): void {
    for (let y = 0; y < this.level.height; y++) {
      for (let x = 0; x < this.level.width; x++) {
        const px = tileCenterX(x);
        const py = tileCenterY(y);
        const key = keyOf(x, y);
        if (this.level.walls.has(keyOf(x, y))) {
          this.mapLayer.add(this.add.image(px, py, 'wall'));
        } else if (this.level.voids.has(key)) {
          this.mapLayer.add(this.add.image(px, py, 'shaft'));
        } else if (this.level.platforms.has(key) || this.level.ladders.length > 0) {
          this.mapLayer.add(this.add.image(px, py, 'catwalk'));
        } else {
          this.mapLayer.add(this.add.image(px, py, (x + y) % 2 === 0 ? 'floorA' : 'floorB'));
        }
      }
    }

    for (const ladder of this.level.ladders) {
      this.mapLayer.add(this.add.image(tileCenterX(ladder.x), tileCenterY(ladder.y), 'ladder'));
    }

    const exit = this.add.image(tileCenterX(this.level.exit.x), tileCenterY(this.level.exit.y), 'exit');
    this.mapLayer.add(exit);
    this.tweens.add({ targets: exit, angle: 360, duration: 7000, repeat: -1 });
    this.tweens.add({ targets: exit, alpha: 0.7, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    for (const spike of this.level.spikes) {
      this.mapLayer.add(this.add.image(tileCenterX(spike.x), tileCenterY(spike.y), 'spike'));
    }

    this.timedSpikes = this.level.timedSpikes.map((point) => {
      const sprite = this.add.image(tileCenterX(point.x), tileCenterY(point.y), 'spike');
      this.mapLayer.add(sprite);
      return { point, sprite };
    });
    this.updateTimedSpikes();

    this.plates = this.level.plates.map((point) => {
      const sprite = this.add.image(tileCenterX(point.x), tileCenterY(point.y), 'plate');
      this.mapLayer.add(sprite);
      return { point, sprite };
    });

    // Doors are anchored at the bottom of their tile so they can slide down
    // into the floor when they open.
    this.doors = this.level.doors.map((point) => {
      const sprite = this.add
        .image(tileCenterX(point.x), tileCenterY(point.y) + TILE / 2, 'door')
        .setOrigin(0.5, 1);
      this.mapLayer.add(sprite);
      return { point, sprite };
    });
  }

  private readDirection(): Point | null {
    if (this.cursors.up?.isDown || this.keys.W.isDown) return { x: 0, y: -1 };
    if (this.cursors.down?.isDown || this.keys.S.isDown) return { x: 0, y: 1 };
    if (this.cursors.left?.isDown || this.keys.A.isDown) return { x: -1, y: 0 };
    if (this.cursors.right?.isDown || this.keys.D.isDown) return { x: 1, y: 0 };
    return null;
  }

  private isBlocked(tile: Point): boolean {
    if (tile.x < 0 || tile.y < 0 || tile.x >= this.level.width || tile.y >= this.level.height) return true;
    if (this.level.walls.has(keyOf(tile.x, tile.y))) return true;
    const key = keyOf(tile.x, tile.y);
    if (this.level.voids.has(key) && !this.level.ladders.some((ladder) => ladder.x === tile.x && ladder.y === tile.y)) return true;
    return !this.doorsOpen && this.doors.some((d) => d.point.x === tile.x && d.point.y === tile.y);
  }

  private isSpike(tile: Point): boolean {
    return (
      this.level.spikes.some((spike) => spike.x === tile.x && spike.y === tile.y) ||
      (this.areTimedSpikesActive() &&
        this.level.timedSpikes.some((spike) => spike.x === tile.x && spike.y === tile.y))
    );
  }

  private areTimedSpikesActive(): boolean {
    return this.tick % 4 >= 2;
  }

  private updateTimedSpikes(): void {
    const active = this.areTimedSpikesActive();
    this.timedSpikes.forEach(({ sprite }) => {
      sprite.setTexture(active ? 'spike' : 'safeClockSpike');
      sprite.setAlpha(active ? 1 : 0.85);
    });
  }

  /** Doors open when the required number of plates are occupied. */
  private updateDoors(): void {
    const occupied = (p: Point): boolean =>
      (this.player.tile.x === p.x && this.player.tile.y === p.y) ||
      this.ghosts.some((g) => g.tile.x === p.x && g.tile.y === p.y);

    this.plates.forEach(({ point, sprite }) => {
      const pressed = occupied(point);
      sprite.setPosition(tileCenterX(point.x), tileCenterY(point.y) + (pressed ? 3 : 0));
      sprite.setScale(pressed ? 0.92 : 1);
      sprite.setTint(pressed ? 0xa9d6a9 : 0xffffff);
    });

    const pressedCount = this.plates.filter(({ point }) => occupied(point)).length;
    const open = pressedCount >= LEVELS[this.levelIndex].requiredPlates;
    if (open !== this.doorsOpen) {
      this.doorsOpen = open;
      this.doors.forEach(({ sprite }) => {
        this.tweens.add({
          targets: sprite,
          scaleY: open ? 0.08 : 1,
          alpha: open ? 0.4 : 1,
          duration: 160,
          ease: 'Sine.easeInOut',
        });
      });
      if (open) this.playDoorSparkles();
    }

    const playerOnPlate = this.plates.some(
      ({ point }) => this.player.tile.x === point.x && this.player.tile.y === point.y,
    );
    if (playerOnPlate && this.ghosts.length === 0 && !this.plateHintShown) {
      this.plateHintShown = true;
      this.showPlateHint();
    }
  }

  private playDoorSparkles(): void {
    this.doors.forEach(({ point }) => {
      for (let i = 0; i < 3; i++) {
        const sparkle = this.add
          .image(tileCenterX(point.x) + (i - 1) * 10, tileCenterY(point.y) - 4, 'exit')
          .setScale(0.12)
          .setDepth(2);
        this.mapLayer.add(sparkle);
        this.tweens.add({
          targets: sparkle,
          y: sparkle.y - 16 - (i % 2) * 5,
          scale: 0.32,
          angle: (i - 1) * 35,
          alpha: 0,
          delay: i * 45,
          duration: 360,
          ease: 'Back.easeOut',
          onComplete: () => sparkle.destroy(),
        });
      }
    });
  }

  /** One-time tutorial: the first time you stand on the button, tell the secret. */
  private showPlateHint(): void {
    const plate = this.plates[0];
    if (!plate) return;
    const label = this.add
      .text(
        tileCenterX(plate.point.x),
        tileCenterY(plate.point.y) - 34,
        `Button found! Echo after ${LEVELS[this.levelIndex].playerStepsPerEcho} steps.`,
        {
        fontFamily: FONT,
        fontSize: '13px',
        color: INK,
        fontStyle: 'bold',
        },
      )
      .setOrigin(0.5)
      .setStroke('#ffffff', 5)
      .setScale(0.3);
    this.tweens.add({ targets: label, scale: 1, duration: 240, ease: 'Back.easeOut' });
    this.tweens.add({
      targets: label,
      alpha: 0,
      y: '-=14',
      delay: 3400,
      duration: 700,
      onComplete: () => label.destroy(),
    });
  }

  private updateHud(): void {
    const definition = LEVELS[this.levelIndex];
    const stepsPerEcho = definition.playerStepsPerEcho;
    this.controlsText.setText(
      `Arrows / WASD: move   ·   Echo after ${stepsPerEcho} steps   ·   R: reset`,
    );
    const heldButtons = this.plates.filter(({ point }) =>
      (this.player.tile.x === point.x && this.player.tile.y === point.y) ||
      this.ghosts.some((ghost) => ghost.tile.x === point.x && ghost.tile.y === point.y),
    ).length;
    this.hudText.setText(
      `Level ${this.levelIndex + 1}/${LEVELS.length}  ${definition.name}  Steps ${this.segmentSteps}/${stepsPerEcho}  Echoes ${this.ghosts.length}  Buttons ${heldButtons}/${definition.requiredPlates}`,
    );

    const playerOnUnheldPlate = this.plates.some(
      ({ point }) =>
        this.player.tile.x === point.x &&
        this.player.tile.y === point.y &&
        !this.ghosts.some((ghost) => ghost.tile.x === point.x && ghost.tile.y === point.y),
    );
    const stepsUntilEcho = stepsPerEcho - this.segmentSteps;
    const objective = playerOnUnheldPlate
      ? `Button reached. Echo in ${stepsUntilEcho} steps`
      : this.doorsOpen
        ? 'Button held! Reach the Star'
        : this.ghosts.length === 0
          ? `Find a button  ·  Echo in ${stepsUntilEcho}`
          : definition.requiredPlates > 1
            ? `Hold ${definition.requiredPlates} buttons  ·  Echo in ${stepsUntilEcho}`
            : `Guide an Echo to the button  ·  Echo in ${stepsUntilEcho}`;
    const activeEchoes = this.ghosts.filter((ghost) => ghost.remainingSteps > 0);
    const nextExpiry = activeEchoes.length > 0
      ? Math.min(...activeEchoes.map((ghost) => ghost.remainingSteps))
      : undefined;
    const echoStatus = nextExpiry === undefined
      ? this.ghosts.length > 0 ? 'Echoes holding position' : objective
      : `${objective}  ·  Echo stops in ${nextExpiry}`;
    this.objectiveText.setText(echoStatus);
  }

  /** Restart the level from scratch, discarding the current run and its Echoes. */
  private restart(): void {
    this.ghosts.forEach((ghost) => ghost.destroy());
    this.ghosts = [];
    this.recording = [{ ...this.level.start }];
    this.tick = 0;
    this.segmentSteps = 0;
    this.player.reset(this.level.start);
    this.updateTimedSpikes();
    this.hideOverlay();
    this.updateDoors();
    this.updateHud();
    this.state = 'playing';
  }

  private recordEcho(): void {
    if (this.recording.length < 2) return;
    const echoAlreadyExists = this.ghosts.length > 0;
    if (!echoAlreadyExists) {
      const maxSteps = LEVELS[this.levelIndex].ghostStepLimit ?? MAX_GHOST_STEPS;
      this.ghosts.push(new Ghost(this, this.recording, maxSteps));
    }
    this.recording = [{ ...this.player.tile }];
    this.segmentSteps = 0;
    this.updateDoors();
    this.updateHud();
    const note = this.add
      .text(this.scale.width / 2, HUD_TOP / 2, echoAlreadyExists ? 'Your one Echo is already active.' : 'Echo recorded. Keep moving!', {
        fontFamily: FONT,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#2f9e44',
        stroke: '#ffffff',
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: note,
      alpha: 0,
      y: note.y - 8,
      delay: 350,
      duration: 450,
      onComplete: () => note.destroy(),
    });
  }

  private loadLevel(levelIndex: number): void {
    this.ghosts.forEach((ghost) => ghost.destroy());
    this.ghosts = [];
    this.mapLayer?.each((child: Phaser.GameObjects.GameObject) => this.tweens.killTweensOf(child));
    this.mapLayer?.removeAll(true);
    this.mapLayer?.destroy();
    this.levelIndex = levelIndex;
    this.level = parseLevel(LEVELS[levelIndex].rows);
    const definition = LEVELS[levelIndex];
    if (definition.requiredPlates < 1 || definition.requiredPlates > this.level.plates.length || this.level.doors.length === 0) {
      throw new Error(`Level "${definition.name}" needs a door and enough buttons for its gate rule.`);
    }
    this.recording = [{ ...this.level.start }];
    this.tick = 0;
    this.segmentSteps = 0;
    this.state = 'playing';
    this.doorsOpen = false;
    this.plateHintShown = false;
    this.plates = [];
    this.doors = [];
    this.timedSpikes = [];
    this.mapLayer = this.add.container(0, 0).setDepth(-1);
    this.buildMap();
    if (this.player) this.player.reset(this.level.start);
    else this.player = new Player(this, this.level.start);
    this.hideOverlay();
    this.updateDoors();
    this.updateHud();
  }

  private advanceLevel(): void {
    const nextLevel = this.levelIndex + 1;
    if (nextLevel >= LEVELS.length) return;
    this.loadLevel(nextLevel);
  }

  /** Restart the campaign after its final level. */
  private fullReset(): void {
    this.campaignComplete = false;
    this.loadLevel(0);
  }

  private die(): void {
    this.state = 'dead';
    this.showOverlay('Ouch! Spikes!', 'Press R to try again.', '#e03131');
  }

  private win(): void {
    this.state = 'won';
    if (this.levelIndex === LEVELS.length - 1) {
      this.campaignComplete = true;
      this.showOverlay('Campaign complete!', `You cleared all ${LEVELS.length} levels. Press R to play again.`, '#e67700');
      return;
    }

    const next = LEVELS[this.levelIndex + 1];
    this.showOverlay(
      'Level cleared!',
      `Next: ${next.name}. ${next.hint} Press R to continue.`,
      '#e67700',
    );
  }

  private showOverlay(title: string, subtitle: string, color: string): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const dim = this.add.rectangle(w / 2, h / 2, w, h, COLORS.dim, 0.5);
    const panel = this.add.container(w / 2, h / 2, [
      this.add.rectangle(5, 9, 440, 150, 0x000000, 0.18),
      this.add.rectangle(0, 0, 440, 150, COLORS.panel).setStrokeStyle(5, COLORS.panelOutline),
      this.add.text(0, -38, title, { fontFamily: FONT, fontSize: '26px', fontStyle: 'bold', color }).setOrigin(0.5),
      this.add.text(0, 14, subtitle, {
        fontFamily: FONT,
        fontSize: '15px',
        color: INK,
        align: 'center',
        wordWrap: { width: 400 },
      }).setOrigin(0.5),
    ]);
    panel.setScale(0.6);
    this.tweens.add({ targets: panel, scale: 1, duration: 260, ease: 'Back.easeOut' });
    this.overlay = this.add.container(0, 0, [dim, panel]);
  }

  private hideOverlay(): void {
    this.overlay?.destroy();
    this.overlay = undefined;
  }

  /** Start screen: show the time-loop puzzle as a short sequence of steps. */
  private showIntro(): void {
    this.introActive = true;
    const w = this.scale.width;
    const h = this.scale.height;
    const dim = this.add.rectangle(w / 2, h / 2, w, h, COLORS.dim, 0.55);
    const panel = this.add.container(w / 2, h / 2, [
      this.add.rectangle(6, 10, 500, 270, 0x000000, 0.18),
      this.add.rectangle(0, 0, 500, 270, COLORS.panel).setStrokeStyle(5, COLORS.panelOutline),
      this.add
        .text(0, -105, 'Time-Delayed Character', { fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color: INK })
        .setOrigin(0.5),
    ]);
    const row = (y: number, iconKey: string, iconScale: number, text: string): void => {
      const icon = this.add.image(-225, y, iconKey).setScale(iconScale);
      if (iconKey === 'ghost') icon.setTint(0x74c0fc);
      panel.add(icon);
      panel.add(this.add.text(-205, y, text, { fontFamily: FONT, fontSize: '12px', color: INK }).setOrigin(0, 0.5));
    };
    row(-59, 'playerBody', 0.75, '1. Move with arrows/WASD; ladders connect catwalks.');
    row(-29, 'ghost', 0.5, '2. One Echo appears when the step counter ends.');
    row(1, 'plate', 0.55, '3. You keep moving; no more Echoes are created this level.');
    row(31, 'exit', 0.55, '4. Your Echo stops on its last tile. Use it to hold the button.');
    const footer = this.add
      .text(0, 105, 'Press any key to begin', { fontFamily: FONT, fontSize: '14px', fontStyle: 'bold', color: HINT })
      .setOrigin(0.5);
    panel.add(footer);
    this.tweens.add({ targets: footer, alpha: 0.25, duration: 550, yoyo: true, repeat: -1 });
    panel.setScale(0.6);
    this.tweens.add({ targets: panel, scale: 1, duration: 300, ease: 'Back.easeOut' });
    this.intro = this.add.container(0, 0, [dim, panel]);

    this.input.keyboard!.once('keydown', () => this.hideIntro());
    this.input.once('pointerdown', () => this.hideIntro());
  }

  private hideIntro(): void {
    this.intro?.destroy();
    this.intro = undefined;
    this.introActive = false;
  }
}
