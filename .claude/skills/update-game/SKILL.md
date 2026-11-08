---
name: update-game
description: Update an existing game in games/. Use when the user wants to modify, improve or fix a finished game.
---
1. Read `games/<slug>/game.json`, `CHANGELOG.md` and the code in `src/`.
2. Apply the changes; new logic gets tests in `logic.test.ts`.
3. Bump the semver version in `game.json`, add a `CHANGELOG.md` entry, update `README.md`.
4. Run `pnpm typecheck && pnpm test`; if ready, use the release-game skill.
All support files must be in English.
