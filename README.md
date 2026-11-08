# playgae

Monorepo per sviluppare piccoli giochi HTML5 da rilasciare su [Playgama](https://playgama.com).
Stack: **Phaser 3 + TypeScript + Vite**, SDK **@playgama/bridge**, pnpm workspaces.

## Comandi

| Comando | Cosa fa |
|---|---|
| `pnpm install` | Installa le dipendenze |
| `pnpm new <slug> "Titolo"` | Crea un nuovo gioco da `games/_template` |
| `pnpm dev <slug>` | Avvia il gioco in locale (se la 5173 è occupata: `npx vite --port 5199` in `games/<slug>`) |
| `pnpm build <slug>` | Build in `games/<slug>/dist` |
| `pnpm release <slug>` | Build + zip in `releases/<slug>-<versione>.zip` |
| `pnpm test` / `pnpm typecheck` | Test Vitest e controllo TypeScript |

Struttura: `packages/core` (codice condiviso: avvio, ads, salvataggi, i18n), `packages/vite-config`, `games/<slug>` (un gioco), `scripts/`.
Convenzioni e checklist Playgama in [CLAUDE.md](CLAUDE.md).

## Giochi realizzati

| Gioco | Slug | Versione | Stato | Orientamento | Note |
|---|---|---|---|---|---|
| Tris | `tris` | 0.1.0 | In sviluppo (giocabile) | Portrait | Tris vs AI minimax con errori; statistiche salvate; IT/EN |

### Tris
Tris classico contro il computer. L'AI usa minimax ma sbaglia con il 25% di probabilità, così si può vincere. Le statistiche (vittorie, pareggi, sconfitte) sono salvate tramite il Bridge, l'interstitial compare tra una partita e l'altra. Da fare: controllare a fondo la schermata di fine partita, suoni, livelli di difficoltà, config Bridge reale generata dal config editor.

## Idee da sviluppare

| Gioco | Genere | Meccanica chiave | Complessità | Priorità |
|---|---|---|---|---|
| Puzzle Bubble | Puzzle | Mira e lancio di bolle su griglia esagonale, gruppi da 3+ | Media | Alta |
| Sputo dal tetto | Arcade | Timing e traiettoria: sputare dal tetto della scuola sui passanti | Media | Media |

### Puzzle Bubble
Clone del classico: si lancia una bolla colorata verso l'alto, si agganciano gruppi di almeno 3 dello stesso colore per farli scoppiare, e le bolle rimaste senza appoggio cadono. Logica a griglia esagonale in TS puro e testabile (aggancio, ricerca dei gruppi, bolle orfane); Phaser per rendering, mira e input touch. Ogni tot tiri il soffitto scende. Estensioni: livelli, bonus, rewarded per bolle extra.

### Sputo dal tetto
Arcade a traiettoria ispirato al vecchio gioco in cui due personaggi sputavano dal tetto della scuola. Il giocatore sceglie forza e momento dello sputo con un tocco, mentre i passanti attraversano in basso a velocità diverse; si fa punteggio colpendoli, con penalità se arriva la figura autoritaria. Usa Arcade Physics di Phaser per la caduta. Da definire con cura grafica e personaggi originali, per evitare di riprodurre personaggi con diritti d'autore.
