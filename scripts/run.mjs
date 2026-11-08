// Usage: pnpm dev <game> | pnpm build <game>
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'

const [cmd, game] = process.argv.slice(2)
const games = readdirSync('games').filter((g) => !g.startsWith('_'))
if (!game || !existsSync(`games/${game}`)) {
  console.error(`Usage: pnpm ${cmd} <game>\nAvailable games: ${games.join(', ') || '(none, use pnpm new <name>)'}`)
  process.exit(1)
}
const r = spawnSync('pnpm', ['--dir', `games/${game}`, cmd], { stdio: 'inherit' })
process.exit(r.status ?? 1)
