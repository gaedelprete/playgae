// Uso: pnpm new <slug> ["Titolo del gioco"]
import { cpSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const [slug, title = slug] = process.argv.slice(2)
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('Uso: pnpm new <slug-minuscolo-con-trattini> ["Titolo"]')
  process.exit(1)
}
const dest = `games/${slug}`
if (existsSync(dest)) { console.error(`${dest} esiste già`); process.exit(1) }

cpSync('games/_template', dest, { recursive: true })
for (const f of ['package.json', 'index.html', 'game.json']) {
  const p = `${dest}/${f}`
  writeFileSync(p, readFileSync(p, 'utf8')
    .replaceAll('@game/template', `@game/${slug}`)
    .replaceAll('__TITLE__', title)
    .replaceAll('__SLUG__', slug))
}
console.log(`Creato ${dest}. Installo dipendenze…`)
spawnSync('pnpm', ['install'], { stdio: 'inherit' })
console.log(`\nFatto. Avvia con: pnpm dev ${slug}`)
