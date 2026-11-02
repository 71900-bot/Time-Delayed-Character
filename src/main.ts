import Phaser from 'phaser';
import { HUD_BOTTOM, HUD_TOP, MAP_COLUMNS, MAP_ROWS, TILE } from './constants';
import { LEVELS } from './levels';
import { GameScene } from './GameScene';

const width = Math.max(MAP_COLUMNS, ...LEVELS.map(({ rows }) => Math.max(...rows.map((row) => row.length)))) * TILE;
const height = Math.max(MAP_ROWS, ...LEVELS.map(({ rows }) => rows.length)) * TILE + HUD_TOP + HUD_BOTTOM;

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#26343a',
  width,
  height,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [GameScene],
});
