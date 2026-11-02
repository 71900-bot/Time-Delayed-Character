# Game Demo Runbook

[Watch the captioned gameplay demo](./Time-Delayed-Character-Demo.mp4) (about
20 seconds). The presenter script below follows the same sequence.

## Before the demo

1. In the project folder, run `npm run dev`.
2. Open the local URL printed by Vite and maximize the browser window.
3. Keep the game on the opening level, **Clocktower Entrance**.

Controls: **Arrow keys or WASD** move one tile; **R** restarts the current level.
Tap and release a direction for each move, waiting for the hop animation to
finish before the next tap.

## Short presenter summary

> “This is a grid-based clocktower puzzle. I move with the arrow keys or WASD,
> climbing ladders and avoiding hazards as I try to reach the star. Every move
> is recorded, and when the level's step counter runs out, that route becomes
> my Echo. The Echo repeats those moves while I continue playing. I use its
> position to hold a pressure button and open the gate, then make my way to the
> exit. Each level changes the route and adds new challenges.”

## Walkthrough (about 1-2 minutes)

### 1. Introduce the puzzle

At the intro card, say:

> “This is a clocktower puzzle about cooperating with an earlier version of
> yourself. Every move is recorded, and after twelve moves that route becomes
> an Echo. The Echo replays while I keep moving.”

Press any key to dismiss the card. Point out the player at the lower right, the
ladder, the green button on the middle catwalk, and the gate near the star.

### 2. Record a route that ends on the button

Tap these directions in order:

1. **Left** twice
2. **Up** five times
3. **Down** once
4. **Up** once
5. **Left** three times

That is 12 moves. The player ends on the green button, and the Echo appears at
the start of the recorded route.

Say:

> “The Echo is a replay of those exact moves, not a second character I control.
> I still have to plan what it will be doing while I move.”

### 3. Let the Echo replay onto the button

Starting on the button, alternate **Left, Right** six times (12 moves total).
The player returns to the button every other move. The Echo follows the
recording and reaches the button at the end of this sequence; pause to show the
button pressed and the gate open.

Say:

> “Now the Echo and I are on the button together. The game checks the Echo’s
> position on each move, so timing and route planning matter.”

### 4. Reach the exit

With the Echo holding the button, tap:

1. **Left** five times to the ladder
2. **Up** three times to the upper walkway
3. **Left** four times to the star

The Echo runs out of movement and stays on the button, keeping the gate open
while the player reaches the exit.

## Presenter script for a short video

> “Welcome to Clocktower Echoes. Move across the walkways and climb ladders to
> reach the star. Every move is recorded. After twelve steps, that route becomes
> an Echo that replays while you keep moving. Guide the Echo onto the pressure
> button, and the gate opens. The Echo stays there long enough for you to climb
> to the exit. Each level adds new routes and hazards, so plan your moves—and
> let your past self help.”
