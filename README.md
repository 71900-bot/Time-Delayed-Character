# Time-Delayed Character

A small cartoon-style, grid-based puzzle game built with **Phaser 3 + TypeScript**
(bundled by Vite — every sprite is drawn in code, no image files).

You control a character on a landscape tile board. Each level has its own step
count; reaching it records the level's only Echo without moving the player.
That Echo replays its route for 20 steps (24 in the final level), then stays on
its last tile. Later step cycles do not create more Echoes.

Cooperate with your past selves: a ghost can hold down a pressure plate to keep
a door open while you walk through it.

## Run it

```
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Controls

- **Arrows / WASD** — move one tile
- **R** — reset the current level and its Echoes

## The campaign

Explore six landscape clocktower levels with multiple floors connected by
ladders. Player step counts increase with the difficulty: 12, 12, 14, 14, 16,
and 18. From level 3 onward, the routes combine timed spikes with static
hazards; later levels add more hazards around the button approach and exit.
Every gate needs one button held by the player or an Echo. Timed spikes turn
green when safe. Dying or pressing R restarts the level and clears its Echoes.

## Code map

| File | Responsibility |
| --- | --- |
| `src/constants.ts` | Tile size, movement timing, cartoon palette |
| `src/art.ts` | Cartoon textures drawn in code (no image assets) |
| `src/levels.ts` | ASCII level data, parser, grid-coordinate helpers |
| `src/Player.ts` | The character you control (tile logic + smooth tween) |
| `src/Ghost.ts` | Replays a recorded run, tick by tick |
| `src/GameScene.ts` | Input, collisions, plates/doors, win/lose states |
| `src/main.ts` | Boots Phaser with a canvas sized to the level |

## Next steps (learning roadmap)

1. **Switches** — wire each door to a specific plate instead of sharing all buttons.
2. **Delta time** — replace tweens with velocity-based movement to learn frame-rate independence.
3. **Hazards** — spikes that toggle every tick, or enemies patrolling on a recorded loop.
4. **Polish** — sprite art, sound, and level-transition animations.
