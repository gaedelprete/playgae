// Uso: pnpm dev <gioco> | pnpm build <gioco>
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'

const [cmd, game] = process.argv.slice(2)
const games = readdirSync('games').filter((g) => !g.startsWith('_'))
if (!game || !existsSync(`games/${game}`)) {
  console.error(`Uso: pnpm ${cmd} <gioco>\nGiochi disponibili: ${games.join(', ') || '(nessuno, usa pnpm new <nome>)'}`)
  process.exit(1)
}
const r = spawnSync('pnpm', ['--dir', `games/${game}`, cmd], { stdio: 'inherit' })
process.exit(r.status ?? 1)
