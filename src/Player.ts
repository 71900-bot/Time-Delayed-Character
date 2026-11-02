import Phaser from 'phaser';
import { MOVE_MS } from './constants';
import { Point, tileCenterX, tileCenterY } from './levels';
import { EYES, PlayerFigure, makePlayerFigure } from './art';

export class Player {
  tile: Point;
  private figure: PlayerFigure;
  private moving = false;

  constructor(
    private scene: Phaser.Scene,
    start: Point,
  ) {
    this.tile = { ...start };
    this.figure = makePlayerFigure(scene, tileCenterX(start.x), tileCenterY(start.y));
  }

  get isMoving(): boolean {
    return this.moving;
  }

  /**
   * The logical tile changes immediately so game rules (plates, spikes, exit)
   * can be evaluated at once; the figure then hops over for smoothness.
   */
  moveTo(tile: Point): void {
    const dx = Math.sign(tile.x - this.tile.x);
    const dy = Math.sign(tile.y - this.tile.y);
    this.tile = { ...tile };
    this.moving = true;

    // Cartoon hop: squash & stretch, and the eyes look where we're going.
    this.scene.tweens.add({
      targets: this.figure.container,
      scaleX: 1.18,
      scaleY: 0.84,
      duration: 80,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });
    this.figure.pupils.forEach((pupil, i) => {
      const base = i === 0 ? EYES.left : EYES.right;
      this.scene.tweens.add({
        targets: pupil,
        x: base.x + dx * 2,
        y: base.y + EYES.pupilDip + dy * 2,
        duration: 90,
      });
    });
    this.scene.tweens.add({
      targets: this.figure.container,
      x: tileCenterX(tile.x),
      y: tileCenterY(tile.y),
      duration: MOVE_MS,
      onComplete: () => {
        this.moving = false;
      },
    });
  }

  /** Back to the start tile, killing any animation still in flight. */
  reset(start: Point): void {
    this.scene.tweens.killTweensOf(this.figure.container);
    this.figure.pupils.forEach((pupil, i) => {
      this.scene.tweens.killTweensOf(pupil);
      const base = i === 0 ? EYES.left : EYES.right;
      pupil.setPosition(base.x, base.y + EYES.pupilDip);
    });
    this.figure.container.setScale(1);
    this.moving = false;
    this.tile = { ...start };
    this.figure.container.setPosition(tileCenterX(this.tile.x), tileCenterY(this.tile.y));
  }
}
