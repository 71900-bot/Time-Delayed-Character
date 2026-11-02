import Phaser from 'phaser';
import { COLORS, TILE } from './constants';

const T = TILE;

/** Where the eyes sit on the player, relative to its center. */
export const EYES = {
  left: { x: -4.5, y: -3.5 },
  right: { x: 4.5, y: -3.5 },
  pupilDip: 0.8,
};

export interface PlayerFigure {
  container: Phaser.GameObjects.Container;
  pupils: Phaser.GameObjects.Image[];
}

/** Draws every sprite once into textures, so the game needs no image files. */
export function createTextures(scene: Phaser.Scene): void {
  const g = scene.add.graphics();

  // Clocktower floors: alternating timber planks with visible seams.
  g.clear();
  g.fillStyle(COLORS.floorA, 1);
  g.fillRoundedRect(1, 1, T - 2, T - 2, 7);
  g.lineStyle(1, COLORS.floorSeam, 0.9);
  g.lineBetween(4, 14, T - 4, 14);
  g.lineBetween(4, 27, T - 4, 27);
  g.lineBetween(14, 2, 14, 14);
  g.lineBetween(27, 15, 27, 27);
  g.lineBetween(11, 28, 11, T - 2);
  g.lineStyle(1, COLORS.floorHighlight, 0.75);
  g.lineBetween(5, 15, T - 5, 15);
  g.generateTexture('floorA', T, T);

  g.clear();
  g.fillStyle(COLORS.floorB, 1);
  g.fillRoundedRect(1, 1, T - 2, T - 2, 7);
  g.lineStyle(1, COLORS.floorSeam, 0.9);
  g.lineBetween(4, 14, T - 4, 14);
  g.lineBetween(4, 27, T - 4, 27);
  g.lineBetween(24, 2, 24, 14);
  g.lineBetween(12, 15, 12, 27);
  g.lineBetween(29, 28, 29, T - 2);
  g.lineStyle(1, COLORS.floorHighlight, 0.65);
  g.lineBetween(5, 15, T - 5, 15);
  g.generateTexture('floorB', T, T);

  g.clear();
  g.fillStyle(COLORS.shaft, 1);
  g.fillRect(0, 0, T, T);
  g.lineStyle(1, COLORS.shaftAccent, 0.55);
  g.lineBetween(6, 0, 6, T);
  g.lineBetween(T - 8, 0, T - 8, T);
  g.generateTexture('shaft', T, T);

  g.clear();
  g.fillStyle(COLORS.catwalkEdge, 1);
  g.fillRect(0, 13, T, 17);
  g.fillStyle(COLORS.catwalk, 1);
  g.fillRect(0, 10, T, 14);
  g.fillStyle(COLORS.catwalkTop, 1);
  g.fillRect(0, 10, T, 3);
  g.lineStyle(1, COLORS.catwalkEdge, 1);
  g.lineBetween(0, 25, T, 25);
  g.generateTexture('catwalk', T, T);

  // Tower walls: cool stone blocks with small brass anchor details.
  g.clear();
  g.fillStyle(COLORS.wallTop, 1);
  g.fillRoundedRect(2, 2, T - 4, T - 4, 9);
  g.fillStyle(COLORS.wall, 1);
  g.fillRoundedRect(2, 8, T - 4, T - 10, 9);
  g.lineStyle(2, COLORS.wallOutline, 1);
  g.strokeRoundedRect(2, 2, T - 4, T - 4, 9);
  g.lineStyle(1, COLORS.wallDetail, 1);
  g.lineBetween(8, 18, T - 8, 18);
  g.fillStyle(0xc49a5a, 0.9);
  g.fillCircle(8, 8, 1.5);
  g.fillCircle(T - 8, T - 8, 1.5);
  g.generateTexture('wall', T, T);

  // Wooden ladder: a walkable connector between clocktower floors.
  g.clear();
  g.lineStyle(4, 0x704321, 1);
  g.lineBetween(10, 2, 10, T - 2);
  g.lineBetween(T - 10, 2, T - 10, T - 2);
  g.lineStyle(3, 0xc08a4b, 1);
  for (let y = 7; y < T; y += 8) g.lineBetween(10, y, T - 10, y);
  g.generateTexture('ladder', T, T);

  // Pressure plate: a big friendly button with a rim and a shine.
  g.clear();
  g.fillStyle(COLORS.plateRim, 1);
  g.fillEllipse(T / 2, T / 2 + 4, T - 12, T - 16);
  g.fillStyle(COLORS.plate, 1);
  g.fillEllipse(T / 2, T / 2 - 2, T - 18, T - 22);
  g.fillStyle(COLORS.plateSheen, 0.4);
  g.fillCircle(T / 2 - 5, T / 2 - 8, 3);
  g.generateTexture('plate', T, T);

  // Door: wooden panel with planks and a knob.
  g.clear();
  g.fillStyle(COLORS.door, 1);
  g.fillRoundedRect(4, 2, T - 8, T - 4, 7);
  g.lineStyle(2, COLORS.doorPlank, 1);
  g.lineBetween(9, T / 3, T - 9, T / 3);
  g.lineBetween(9, (2 * T) / 3, T - 9, (2 * T) / 3);
  g.strokeRoundedRect(4, 2, T - 8, T - 4, 7);
  g.fillStyle(COLORS.knob, 1);
  g.fillCircle(T - 13, T / 2, 3.5);
  g.generateTexture('door', T, T);

  // Spikes: three mean triangles.
  g.clear();
  g.fillStyle(COLORS.spike, 1);
  g.lineStyle(3, COLORS.spikeOutline, 1);
  const spikes: readonly [number, number][] = [
    [T * 0.3, 13],
    [T * 0.5, 18],
    [T * 0.7, 13],
  ];
  for (const [cx, h] of spikes) {
    g.beginPath();
    g.moveTo(cx - 6, T - 4);
    g.lineTo(cx, T - 4 - h);
    g.lineTo(cx + 6, T - 4);
    g.closePath();
    g.fillPath();
    g.strokePath();
  }
  g.generateTexture('spike', T, T);

  g.clear();
  g.fillStyle(0x69db7c, 1);
  g.lineStyle(3, 0x2b6f3a, 1);
  for (const [cx, h] of spikes) {
    g.beginPath();
    g.moveTo(cx - 6, T - 4);
    g.lineTo(cx, T - 4 - h);
    g.lineTo(cx + 6, T - 4);
    g.closePath();
    g.fillPath();
    g.strokePath();
  }
  g.generateTexture('safeClockSpike', T, T);

  // Exit: golden star on a soft glow.
  g.clear();
  g.fillStyle(COLORS.exitGlow, 0.7);
  g.fillCircle(T / 2, T / 2, T * 0.46);
  g.fillStyle(COLORS.exit, 1);
  g.lineStyle(2.5, COLORS.exitOutline, 1);
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? T * 0.34 : T * 0.15;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const px = T / 2 + r * Math.cos(a);
    const py = T / 2 + r * Math.sin(a);
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.fillPath();
  g.strokePath();
  g.generateTexture('exit', T, T);

  // Player body: coral rounded square with a smile.
  g.clear();
  g.fillStyle(COLORS.playerBody, 1);
  g.fillRoundedRect(0, 0, T - 12, T - 12, 11);
  g.lineStyle(3, COLORS.playerOutline, 1);
  g.strokeRoundedRect(1.5, 1.5, T - 15, T - 15, 10);
  g.lineStyle(2.2, COLORS.playerOutline, 1);
  g.beginPath();
  g.arc(T / 2 - 6, T / 2 - 2, 4.5, Math.PI * 0.15, Math.PI * 0.85, false);
  g.strokePath();
  g.generateTexture('playerBody', T - 12, T - 12);

  // Eye and pupil.
  g.clear();
  g.fillStyle(COLORS.eye, 1);
  g.fillCircle(4, 4, 4);
  g.generateTexture('eye', 8, 8);

  g.clear();
  g.fillStyle(COLORS.pupil, 1);
  g.fillCircle(3, 3, 3);
  g.generateTexture('pupil', 6, 6);

  // Soft shadow blob that sits under characters.
  g.clear();
  g.fillStyle(COLORS.shadow, 0.13);
  g.fillEllipse(18, 7, 36, 14);
  g.generateTexture('shadow', 36, 14);

  // Ghost: rounded body, wavy bottom, face baked in.
  g.clear();
  g.fillStyle(COLORS.ghost, 1);
  g.fillRoundedRect(6, 3, T - 12, T - 18, { tl: 13, tr: 13, bl: 3, br: 3 });
  for (let i = 0; i < 3; i++) {
    g.fillCircle(6 + (T - 12) * (0.2 + 0.3 * i), T - 16, 4.5);
  }
  g.fillStyle(COLORS.ghostFace, 1);
  g.fillCircle(T * 0.4, T * 0.42, 2.6);
  g.fillCircle(T * 0.6, T * 0.42, 2.6);
  g.fillEllipse(T / 2, T * 0.56, 6, 8);
  g.generateTexture('ghost', T, T);

  g.destroy();
}

/** Builds the player figure: shadow, body, eyes, pupils — inside one container. */
export function makePlayerFigure(scene: Phaser.Scene, x: number, y: number): PlayerFigure {
  const { left, right, pupilDip } = EYES;
  const shadow = scene.add.image(0, 15, 'shadow');
  const body = scene.add.image(0, 0, 'playerBody');
  const eyeL = scene.add.image(left.x, left.y, 'eye');
  const eyeR = scene.add.image(right.x, right.y, 'eye');
  const pupilL = scene.add.image(left.x, left.y + pupilDip, 'pupil');
  const pupilR = scene.add.image(right.x, right.y + pupilDip, 'pupil');
  const container = scene.add.container(x, y, [shadow, body, eyeL, eyeR, pupilL, pupilR]);
  return { container, pupils: [pupilL, pupilR] };
}
