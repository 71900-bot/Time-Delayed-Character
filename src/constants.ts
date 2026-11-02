export const TILE = 40;
export const HUD_TOP = 44;
export const HUD_BOTTOM = 56;
export const MAP_COLUMNS = 24;
export const MAP_ROWS = 11;
export const MAX_GHOST_STEPS = 20;

/** Duration of the smooth slide animation between two tiles. */
export const MOVE_MS = 130;

/** UI text colors (CSS strings, for Phaser.Text). */
export const INK = '#4e4337';
export const HINT = '#96876c';
export const HUD_TEXT = '#f2e5c8';
export const HUD_ACCENT = '#ffd166';

/** Cartoon palette (hex numbers, for Graphics/Image). */
export const COLORS = {
  page: 0x26343a,
  floorA: 0xb88a59,
  floorB: 0xa7794b,
  floorSeam: 0x65472e,
  floorHighlight: 0xd0a16a,
  shaft: 0x102c3b,
  shaftAccent: 0x245064,
  catwalk: 0x8c5a2c,
  catwalkTop: 0xd19a50,
  catwalkEdge: 0x52371f,
  wall: 0x60757a,
  wallTop: 0x8d9b97,
  wallOutline: 0x35484d,
  wallDetail: 0x40585d,
  playerBody: 0xff6b6b,
  playerOutline: 0xc92a2a,
  eye: 0xffffff,
  pupil: 0x2b2b2b,
  ghost: 0xffffff,
  ghostFace: 0x334155,
  shadow: 0x000000,
  plateRim: 0x1e7e34,
  plate: 0x37b24d,
  plateSheen: 0xffffff,
  door: 0x8f6235,
  doorPlank: 0x5a3e25,
  knob: 0xffd43b,
  spike: 0xe03131,
  spikeOutline: 0x882626,
  exitGlow: 0xfff3bf,
  exit: 0xffd43b,
  exitOutline: 0xf08c00,
  panel: 0xffffff,
  panelOutline: 0x2b2b2b,
  dim: 0x1f2430,
} as const;
