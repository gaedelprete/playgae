# playgae — framework per giochi HTML5 su Playgama

Monorepo pnpm. Stack: **Phaser 3 + TypeScript + Vite**, SDK **@playgama/bridge**.

## Struttura
- `packages/core` (`@playgae/core`): `createGame`, `platform` (Bridge: ads, pause, lingua, gameReady), `storage` (salvataggi), `createI18n`, PreloadScene.
- `packages/vite-config`: `defineGameConfig()` (base `./`, Bridge incluso in locale).
- `games/<slug>/`: un gioco = `src/`, `public/` (asset), `game.json` (nome, versione, stato, note), `CHANGELOG.md`. `games/_template` è il punto di partenza (non toccarlo per un gioco specifico).
- `scripts/`: `new-game`, `pack-game`, `run`. `releases/`: zip pronti (gitignored).

## Comandi
- `pnpm new <slug> "Titolo"` crea un gioco dal template
- `pnpm dev <slug>` / `pnpm build <slug>`
- `pnpm release <slug>` build + `releases/<slug>-<versione>.zip` (index.html in radice)
- `pnpm test` (Vitest), `pnpm typecheck`
- Nota: la porta 5173 è spesso occupata da altri progetti Vite; usa `npx vite --port 5199` dentro `games/<slug>`. Non usare `pkill vite`.

## Convenzioni
- Logica di gioco in file TS puri (`logic.ts`) con test Vitest; Phaser solo per rendering/input.
- Salvataggi solo via `storage`, mai `localStorage`. Testi via `createI18n` (en + it almeno).
- Risoluzione di design fissa (es. 720x1280 portrait o 1280x720 landscape), scaling FIT già gestito.
- Chiamare `platform.gameplayStarted()/gameplayStopped()` a inizio/fine partita; interstitial solo tra partite (`platform.showInterstitial()`), rewarded su azione volontaria.
- Nessun link esterno, audio solo dopo input utente, pause/mute gestiti da `createGame`.
- Ad ogni modifica a un gioco: aggiorna `CHANGELOG.md` e la versione in `game.json`.

## Regole Playgama (checklist prima del release)
Zip < ~20 MB, `index.html` in radice, nessuna richiesta di rete esterna, funziona su mobile touch + desktop, nessun errore in console, ads non invasive.

## Giochi
- `tris`: Tris vs AI (minimax con errori), v0.1.0, vedi `games/tris/game.json`.
Idee: Puzzle Bubble (griglia esagonale), gioco "sputare dal tetto" (arcade a traiettoria).

Il README.md traccia giochi fatti e idee: aggiornalo quando crei o modifichi un gioco.
