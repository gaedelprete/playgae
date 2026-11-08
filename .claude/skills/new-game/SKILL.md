---
name: new-game
description: Crea un nuovo gioco Playgama nel monorepo playgae. Usare quando l'utente vuole iniziare un nuovo gioco.
---
1. Chiedi concept, orientamento (portrait/landscape) e controlli se non chiari.
2. `pnpm new <slug> "Titolo"`.
3. Aggiorna `game.json` (orientation, notes) e la risoluzione in `src/main.ts`.
4. Scrivi la logica pura in `src/logic.ts` + test, poi le scene Phaser. Usa `@playgae/core`.
5. `pnpm typecheck && pnpm test`, poi aggiungi il gioco all'elenco in `CLAUDE.md`.
