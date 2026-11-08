export type Cell = 'X' | 'O' | null
export type Board = Cell[]

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

export function newBoard(): Board {
  return Array<Cell>(9).fill(null)
}

export function winner(b: Board): { player: 'X' | 'O'; line: number[] } | null {
  for (const line of LINES) {
    const [a, c, d] = line as [number, number, number]
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { player: b[a]!, line }
  }
  return null
}

export const isFull = (b: Board): boolean => b.every(Boolean)

function minimax(b: Board, turn: 'X' | 'O', me: 'X' | 'O', depth: number): number {
  const w = winner(b)
  if (w) return w.player === me ? 10 - depth : depth - 10
  if (isFull(b)) return 0
  const next = turn === 'X' ? 'O' : 'X'
  const scores: number[] = []
  b.forEach((c, i) => {
    if (c) return
    b[i] = turn
    scores.push(minimax(b, next, me, depth + 1))
    b[i] = null
  })
  return turn === me ? Math.max(...scores) : Math.min(...scores)
}

/** AI move. `mistakeChance` (0..1) makes it beatable: with that probability it plays randomly. */
export function aiMove(b: Board, me: 'X' | 'O', mistakeChance = 0, rng: () => number = Math.random): number {
  const free = b.flatMap((c, i) => (c ? [] : [i]))
  if (free.length === 0) return -1
  if (rng() < mistakeChance) return free[Math.floor(rng() * free.length)]!
  const other = me === 'X' ? 'O' : 'X'
  let best = -Infinity
  let bestMoves: number[] = []
  for (const i of free) {
    b[i] = me
    const s = minimax(b, other, me, 1)
    b[i] = null
    if (s > best) { best = s; bestMoves = [i] } else if (s === best) bestMoves.push(i)
  }
  return bestMoves[Math.floor(rng() * bestMoves.length)]!
}

/** Probability that the AI plays a random move, per level (index 0 = level 1). Level 5 never blunders. */
export const LEVEL_MISTAKES = [0.6, 0.4, 0.25, 0.1, 0] as const
export const MAX_LEVEL = LEVEL_MISTAKES.length

export const mistakeChanceFor = (level: number): number =>
  LEVEL_MISTAKES[Math.min(Math.max(level, 1), MAX_LEVEL) - 1]!

export type Outcome = 'win' | 'draw' | 'lose'

export interface Progress {
  /** Current difficulty level (1..MAX_LEVEL). */
  level: number
  /** Highest level ever reached. */
  bestLevel: number
  /** Current and best consecutive wins. */
  streak: number
  bestStreak: number
}

export const newProgress = (): Progress => ({ level: 1, bestLevel: 1, streak: 0, bestStreak: 0 })

/** Normalizes a saved value (possibly missing or from an older version) into a valid Progress. */
export function sanitizeProgress(raw: Partial<Progress> | null | undefined): Progress {
  const p = newProgress()
  if (!raw || typeof raw !== 'object') return p
  const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback)
  p.level = Math.min(Math.max(num(raw.level, 1), 1), MAX_LEVEL)
  p.bestLevel = Math.min(Math.max(num(raw.bestLevel, p.level), p.level), MAX_LEVEL)
  p.streak = num(raw.streak, 0)
  p.bestStreak = Math.max(num(raw.bestStreak, 0), p.streak)
  return p
}

/** Wins raise the level, losses lower it, draws keep it. Returns a new object. */
export function applyOutcome(p: Progress, outcome: Outcome): Progress {
  let { level, streak } = p
  if (outcome === 'win') { level = Math.min(level + 1, MAX_LEVEL); streak += 1 }
  else { streak = 0; if (outcome === 'lose') level = Math.max(level - 1, 1) }
  return {
    level,
    bestLevel: Math.max(p.bestLevel, level),
    streak,
    bestStreak: Math.max(p.bestStreak, streak),
  }
}
