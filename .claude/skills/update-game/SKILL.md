---
name: update-game
description: Aggiorna un gioco esistente in games/. Usare quando l'utente vuole modificare, migliorare o correggere un gioco già fatto.
---
1. Leggi `games/<slug>/game.json`, `CHANGELOG.md` e il codice in `src/`.
2. Applica le modifiche; logica nuova → test in `logic.test.ts`.
3. Bump versione in `game.json` (semver) e voce in `CHANGELOG.md`.
4. `pnpm typecheck && pnpm test`; se pronto, usa la skill release-game.
