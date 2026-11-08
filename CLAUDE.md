# playgae — framework for HTML5 games on Playgama

pnpm monorepo. Stack: **Phaser 3 + TypeScript + Vite**, **@playgama/bridge** SDK.

## Language rule
All support files (README, CLAUDE.md, skills, changelogs, game.json notes, script output, code comments, commit messages) must be written in **English**. Only in-game player-facing text is localized via `createI18n`.

## Layout
- `packages/core` (`@playgae/core`): `createGame`, `platform` (Bridge: ads, pause, language, gameReady), `storage` (saves), `createI18n`, PreloadScene.
- `packages/vite-config`: `defineGameConfig()` (relative base, Bridge bundled locally).
- `games/<slug>/`: one game = `src/`, `public/` (assets, `playgama-bridge-config.json`), `game.json` (name, version, status, notes), `CHANGELOG.md`. `games/_template` is the starting point (do not edit it for a specific game).
- `scripts/`: `new-game`, `pack-game`, `run`. `releases/`: ready zips (gitignored).

## Commands
- `pnpm new <slug> "Title"` creates a game from the template
- `pnpm dev <slug>` / `pnpm build <slug>`
- `pnpm release <slug>` builds and writes `releases/<slug>-<version>.zip` (index.html at root)
- `pnpm test` (Vitest), `pnpm typecheck`
- Port 5173 is often used by other Vite projects: run `npx vite --port 5199` inside `games/<slug>`. Chrome tools may fail on `localhost`; use the LAN IP. Never `pkill vite`.

## Conventions
- Game logic in pure TS files (`logic.ts`) with Vitest tests; Phaser only for rendering/input.
- Saves only via `storage`, never `localStorage`. Player text via `createI18n` (at least en + it).
- Fixed design resolution (e.g. 720x1280 portrait or 1280x720 landscape); FIT scaling is already handled.
- Call `platform.gameplayStarted()/gameplayStopped()` at round start/end; interstitials only between rounds (`platform.showInterstitial()`), rewarded ads only on voluntary action.
- No external links, audio only after user input; pause/mute handled by `createGame`.
- On every game change: update `CHANGELOG.md`, bump the version in `game.json`, and update `README.md` (games table and ideas).

## Playgama checklist (before release)
Zip under ~20 MB, `index.html` at root, no external network requests, works on touch mobile and desktop, no console errors, non-intrusive ads. Regenerate `playgama-bridge-config.json` with the Playgama config editor.

## Games
See the table in `README.md`.
