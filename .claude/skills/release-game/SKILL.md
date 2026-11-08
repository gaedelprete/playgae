---
name: release-game
description: Package a game into a zip for Playgama. Use when the user wants to release or upload a game.
---
1. Run `pnpm typecheck && pnpm test`.
2. Run `pnpm release <slug>` to get `releases/<slug>-<version>.zip`.
3. Verify: index.html at root, size under 20 MB, no external URLs in the build (`grep -r "http" games/<slug>/dist --include=*.html`).
4. Report the zip path; the user uploads it to Playgama from their own account.
