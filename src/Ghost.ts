import Phaser from 'phaser';
import { MOVE_MS } from './constants';
import { Point, tileCenterX, tileCenterY } from './levels';

export class Ghost {
  /** Position at each step of this Echo segment: recording[0] is its spawn tile. */
  readonly recording: Point[];
  tile: Point;
  private figure: Phaser.GameObjects.Container;
  private stepIndex = 0;
  private stepsUsed = 0;

  constructor(
    private scene: Phaser.Scene,
    recording: Point[],
    private readonly maxSteps: number,
  ) {
    this.recording = recording.map((p) => ({ ...p }));
    this.tile = { ...this.recording[0] };
    const shadow = scene.add.image(0, 15, 'shadow').setAlpha(0.5);
    const body = scene.add.image(0, 0, 'ghost').setAlpha(0.85);
    this.figure = scene.add.container(tileCenterX(this.tile.x), tileCenterY(this.tile.y), [shadow, body]);
    // Gentle floating, so it reads as a spirit rather than a second player.
    scene.tweens.add({ targets: body, y: -5, duration: 850, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  get remainingSteps(): number {
    return Math.max(0, this.maxSteps - this.stepsUsed);
  }

  /** Replay this segment, then freeze on its final tile when the Echo runs out. */
  advance(): boolean {
    if (this.stepsUsed >= this.maxSteps) return true;

    this.stepsUsed += 1;
    const target = this.recording[Math.min(++this.stepIndex, this.recording.length - 1)];
    if (target.x !== this.tile.x || target.y !== this.tile.y) {
      this.tile = { ...target };
      this.scene.tweens.add({
        targets: this.figure,
        x: tileCenterX(target.x),
        y: tileCenterY(target.y),
        duration: MOVE_MS,
      });
    }

    return true;
  }

  /** Rewind to the first recorded position, killing any animation in flight. */
  reset(): void {
    this.scene.tweens.killTweensOf(this.figure);
    this.stepIndex = 0;
    this.stepsUsed = 0;
    this.tile = { ...this.recording[0] };
    this.figure.setPosition(tileCenterX(this.tile.x), tileCenterY(this.tile.y));
  }

  destroy(): void {
    this.scene.tweens.killTweensOf(this.figure);
    this.figure.destroy();
  }
}
