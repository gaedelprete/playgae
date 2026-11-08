---
name: release-game
description: Impacchetta un gioco in zip per Playgama. Usare quando l'utente vuole rilasciare/caricare un gioco.
---
1. `pnpm typecheck && pnpm test`.
2. `pnpm release <slug>` → `releases/<slug>-<versione>.zip`.
3. Verifica: index.html in radice, peso < 20 MB, nessun URL esterno nel build (`grep -r "http" games/<slug>/dist --include=*.html`).
4. Riporta all'utente il percorso dello zip; il caricamento su Playgama lo fa lui dal suo account.
