// Uso: pnpm release <gioco>  → releases/<slug>-<versione>.zip con index.html in radice
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, mkdirSync, rmSync, statSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

const slug = process.argv[2]
if (!slug || !existsSync(`games/${slug}`)) { console.error('Uso: pnpm release <gioco>'); process.exit(1) }

const meta = JSON.parse(readFileSync(`games/${slug}/game.json`, 'utf8'))
const run = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

run('pnpm', ['--dir', `games/${slug}`, 'build'])

const dist = resolve(`games/${slug}/dist`)
if (!existsSync(join(dist, 'index.html'))) { console.error('dist/index.html mancante'); process.exit(1) }

mkdirSync('releases', { recursive: true })
const out = resolve(`releases/${slug}-${meta.version}.zip`)
rmSync(out, { force: true })
run('zip', ['-r', '-q', '-X', out, '.'], dist)

const size = (statSync(out).size / 1024 / 1024).toFixed(2)
const files = (function count(d) { return readdirSync(d, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(join(d, e.name)) : 1), 0) })(dist)
console.log(`\n✔ ${out}\n  ${size} MB, ${files} file`)
if (Number(size) > 20) console.warn('⚠ Zip > 20 MB: valuta di ottimizzare gli asset')
