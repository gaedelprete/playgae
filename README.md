# playgae

Monorepo for building small HTML5 games to release on [Playgama](https://playgama.com).
Stack: **Phaser 3 + TypeScript + Vite**, **@playgama/bridge** SDK, pnpm workspaces.

## Commands

| Command | What it does |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm new <slug> "Title"` | Create a new game from `games/_template` |
| `pnpm dev <slug>` | Run a game locally (if 5173 is taken: `npx vite --port 5199` inside `games/<slug>`) |
| `pnpm build <slug>` | Build into `games/<slug>/dist` |
| `pnpm release <slug>` | Build + zip into `releases/<slug>-<version>.zip` |
| `pnpm test` / `pnpm typecheck` | Vitest tests and TypeScript check |

Layout: `packages/core` (shared code: startup, ads, saves, i18n), `packages/vite-config`, `games/<slug>` (one game each), `scripts/`.
Conventions and the Playgama checklist live in [CLAUDE.md](CLAUDE.md).

## Games built

| Game | Slug | Version | Status | Orientation | Notes |
|---|---|---|---|---|---|
| Tris | `tris` | 0.2.0 | In development (playable) | Portrait | Tic-tac-toe vs minimax AI with 5 levels; tutorial; music + sfx + mute; saved stats; IT/EN |

### Tris
Classic tic-tac-toe against the computer. The AI uses minimax with a mistake chance that shrinks over 5 levels: wins raise the level, losses lower it. Level, best streak and win/draw/loss stats are saved through the Bridge, and an interstitial shows between rounds. Includes a first-run tutorial and a mute button. To do: replace the placeholder audio with produced ogg/mp3 files, check the end-of-game screen thoroughly, a real Bridge config from the config editor.

## Game ideas

| Game | Genre | Key mechanic | Complexity | Priority |
|---|---|---|---|---|
| Puzzle Bubble | Puzzle | Aim and shoot bubbles on a hex grid, match 3+ | Medium | High |
| Rooftop Spit | Arcade | Timing and trajectory: spit from a school roof onto passers-by | Medium | Medium |

### Puzzle Bubble
Classic clone: shoot a colored bubble upward and attach it to the grid; groups of 3+ of the same color pop, and bubbles left without support fall. Hex-grid logic (attach, group search, orphan detection) in pure, testable TS; Phaser handles rendering, aiming and touch input. The ceiling drops every few shots. Extensions: levels, power-ups, a rewarded ad for extra bubbles.

### Rooftop Spit
Arcade trajectory game inspired by the old title where two characters spit from a school roof. The player picks power and release moment with a tap while pedestrians cross below at different speeds; points for hits, a penalty when the authority figure shows up. Uses Phaser Arcade Physics for the fall. Needs original characters and art to avoid copyrighted ones.
