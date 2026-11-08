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

/** Mossa dell'AI. `mistakeChance` (0..1) la rende battibile: con quella probabilità gioca a caso. */
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
