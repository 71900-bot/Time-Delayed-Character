import { HUD_TOP, MAP_COLUMNS, MAP_ROWS, TILE } from './constants';

export interface Point {
  x: number;
  y: number;
}

export interface Level {
  width: number;
  height: number;
  start: Point;
  exit: Point;
  walls: Set<string>;
  plates: Point[];
  doors: Point[];
  spikes: Point[];
  timedSpikes: Point[];
  ladders: Point[];
  voids: Set<string>;
  platforms: Set<string>;
}

export interface LevelDefinition {
  name: string;
  hint: string;
  requiredPlates: number;
  playerStepsPerEcho: number;
  ghostStepLimit?: number;
  rows: string[];
}

/**
 * Level legend:
 *   '#' wall/beam    '.' floor    '@' player start
 *   'E' exit    'P' plate    'D' door         'X' spikes    'T' clock spike    'L' ladder    'V' open shaft    'F' catwalk
 *   '@' player start
 */
export const LEVELS: LevelDefinition[] = [
  {
    name: 'Clocktower Entrance',
    hint: 'Climb the staggered shafts, record the middle button, then open the upper gate.',
    requiredPlates: 1,
    playerStepsPerEcho: 12,
    ghostStepLimit: 20,
    rows: [
      'VVVVVVVVVVVVVVVVVVV',
      'VVEFDFLFFFFFFVVVVVV',
      'VVVVVVLVVVVVVVVVVVV',
      'VVVVVVLVVVVVVVVVVVV',
      'VVVVFFLFFFFPFFLFVVV',
      'VVVVVVVVVVVVVVLVVVV',
      'VVVVVVVVVVVVVVLVVVV',
      'VVVVVVVVVVVVFFLFFFV',
      'VVVVVVVVVVVVVVLVVVV',
      'VVVVVVVVVVVVVFLF@FV',
      'VVVVVVVVVVVVVVVVVVV',
    ],
  },
  {
    name: 'Pendulum Gallery',
    hint: 'Timed spikes turn green on safe beats. Static red spikes are on side routes; avoid them.',
    requiredPlates: 1,
    playerStepsPerEcho: 12,
    rows: [
      'VVVVVVVVVVVVVVVVVVV',
      'VVVEFDFLFFTFFFFVVVV',
      'VVVVVVVLVVVVVVVVVVV',
      'VVVVVVVLVVVVVVVVVVV',
      'VVVVFFFLFTFFPFLFVVV',
      'VVVVVVVVVVVVVVLVVVV',
      'VVVVVVVVVVVVVVLVVVV',
      'VVVVVVVVVVXFFLFFVVV',
      'VVVVVVVVVVVVVVLVVVV',
      'VVVVVVVVVVVVFFL@FV',
      'VVVVVVVVVVVVVVVVVVV',
    ],
  },
  {
    name: 'Gearshaft Floors',
    hint: 'Time the clock spike on the middle catwalk and avoid gears on the upper and lower routes.',
    requiredPlates: 1,
    playerStepsPerEcho: 14,
    rows: [
      'VVVVVVVVVVVVVVVVVVV',
      'VVVEFDFLFFXFFFFVVVV',
      'VVVVVVVLVVVVVVVVVVV',
      'VVVVVVVLVVVVVVVVVVV',
      'VVVVFFFLFFPFTFLFVVV',
      'VVVVVVVVVVVVVVLVVVV',
      'VVVVVVVVVVVVVVLVVVV',
      'VVVVVVVVVVVVXFLFFFV',
      'VVVVVVVVVVVVVVLVVVV',
      'VVVVVVVVVVVVFFL@FV',
      'VVVVVVVVVVVVVVVVVVV',
    ],
  },
  {
    name: 'Twin Lift Platforms',
    hint: 'Time your crossing of the upper clock spike, then avoid the gear on the lower lift.',
    requiredPlates: 1,
    playerStepsPerEcho: 14,
    rows: [
      'VVVVVVVVVVVVVVVVVVV',
      'VVVEFDTLFFFFFFFVVVV',
      'VVVVVVVLVVVVVVVVVVV',
      'VVVVVVVLVVVVVVVVVVV',
      'VVVVFFFLFFPFFFLFVVV',
      'VVVVVVVVVVVVVVLVVVV',
      'VVVVVVVVVVVVVVLVVVV',
      'VVVVVVVVVVVFXFFFFFV',
      'VVVVVVVVVVVVVVLVVVV',
      'VVVVVVVVVVVVFFL@FV',
      'VVVVVVVVVVVVVVVVVVV',
    ],
  },
  {
    name: 'Bell Loft',
    hint: 'Cross the timed middle-floor spike safely, then use an Echo to open both upper doors.',
    requiredPlates: 1,
    playerStepsPerEcho: 16,
    rows: [
      'VVVVVVVVVVVVVVVVVVV',
      'VVVEFDFLFXFFDFFVVVV',
      'VVVVVVVLVVVVVVVVVVV',
      'VVVVVVVLVVVVVVVVVVV',
      'VVVVFFFLFFPFTLFVVV',
      'VVVVVVVVVVVVVVLVVVV',
      'VVVVVVVVVVVVVVLVVVV',
      'VVVVVVVVVVFXFLFFVVV',
      'VVVVVVVVVVVVVVLVVVV',
      'VVVVVVVVVVVVFFL@FV',
      'VVVVVVVVVVVVVVVVVVV',
    ],
  },
  {
    name: 'Clockwork Crown',
    hint: 'Time the middle-floor clock spike and avoid gears on the upper route and lower bridge.',
    requiredPlates: 1,
    playerStepsPerEcho: 18,
    ghostStepLimit: 24,
    rows: [
      'VVVVVVVVVVVVVVVVVVV',
      'VVEFDFLFFFXFFFFFFVV',
      'VVVVVVLVVVVVVVVVVVV',
      'VVVVVVLVVVVVVVVVVVV',
      'VVVVVFLFFFFPFTLFVVV',
      'VVVVVVVVVVVVVVVLVVV',
      'VVVVVVVVVVVVVVVLVVV',
      'VVVVVFFFFFXFTFFLFVV',
      'VVVVVVVVVVVVVVVLVVV',
      'VVVVVVVVVVVVVFFL@FV',
      'VVVVVVVVVVVVVVVVVVV',
    ],
  },
];

export function keyOf(x: number, y: number): string {
  return `${x},${y}`;
}

/** Pixel center of a tile column, for placing sprites. */
export function tileCenterX(x: number): number {
  return x * TILE + TILE / 2;
}

/** Pixel center of a tile row (offset by the top HUD strip). */
export function tileCenterY(y: number): number {
  return HUD_TOP + y * TILE + TILE / 2;
}

const VALID_TILES = new Set(['#', '.', 'V', 'F', '@', 'E', 'P', 'D', 'X', 'T', 'L']);
function fitRows(rows: string[]): string[] {
  const sourceWidth = Math.max(...rows.map((row) => row.length));
  const width = Math.max(MAP_COLUMNS, sourceWidth);
  const height = Math.max(MAP_ROWS, rows.length);
  const scaffold = rows.some((row) => row.includes('V'));
  const filler = scaffold ? 'V' : '#';
  const left = Math.floor((width - sourceWidth) / 2);
  const top = Math.floor((height - rows.length) / 2);

  return Array.from({ length: height }, (_, y) => {
    const source = rows[y - top];
    return source
      ? filler.repeat(left) + source + filler.repeat(width - left - source.length)
      : filler.repeat(width);
  });
}

export function parseLevel(rows: string[]): Level {
  const fittedRows = fitRows(rows);
  const height = fittedRows.length;
  const width = fittedRows[0]?.length ?? 0;
  if (height === 0 || width === 0) {
    throw new Error('Level is empty.');
  }

  const walls = new Set<string>();
  const plates: Point[] = [];
  const doors: Point[] = [];
  const spikes: Point[] = [];
  const timedSpikes: Point[] = [];
  const ladders: Point[] = [];
  const voids = new Set<string>();
  const platforms = new Set<string>();
  const isScaffold = rows.some((row) => row.includes('V'));
  let start: Point | null = null;
  let exit: Point | null = null;

  for (let y = 0; y < height; y++) {
    const row = fittedRows[y];
    if (row.length !== width) {
      throw new Error(`Row ${y} is ${row.length} tiles wide; expected ${width}.`);
    }
    for (let x = 0; x < width; x++) {
      const ch = row[x];
      if (!VALID_TILES.has(ch)) {
        throw new Error(`Unknown tile '${ch}' at (${x}, ${y}).`);
      }
      if (ch === '#') walls.add(keyOf(x, y));
      else if (ch === 'V') voids.add(keyOf(x, y));
      else if (ch === 'F') platforms.add(keyOf(x, y));
      else if (ch === 'P') plates.push({ x, y });
      else if (ch === 'D') doors.push({ x, y });
      else if (ch === 'X') spikes.push({ x, y });
      else if (ch === 'T') timedSpikes.push({ x, y });
      else if (ch === 'L') {
        ladders.push({ x, y });
        voids.add(keyOf(x, y));
      }
      else if (ch === '@') start = { x, y };
      else if (ch === 'E') exit = { x, y };

      if (isScaffold && ['@', 'E', 'P', 'D', 'X', 'T'].includes(ch)) {
        platforms.add(keyOf(x, y));
      }
    }
  }

  if (start === null || exit === null) {
    throw new Error('Level needs a player start (@) and an exit (E).');
  }

  return { width, height, start, exit, walls, plates, doors, spikes, timedSpikes, ladders, voids, platforms };
}
