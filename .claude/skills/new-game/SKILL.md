---
name: new-game
description: Create a new Playgama game in the playgae monorepo. Use when the user wants to start a new game.
---
1. Ask for concept, orientation (portrait/landscape) and controls if unclear.
2. Run `pnpm new <slug> "Title"`.
3. Update `game.json` (orientation, notes) and the resolution in `src/main.ts`.
4. Write pure logic in `src/logic.ts` plus tests, then the Phaser scenes. Use `@playgae/core`.
5. Run `pnpm typecheck && pnpm test`, then add the game to the README tables.
All support files must be in English.
