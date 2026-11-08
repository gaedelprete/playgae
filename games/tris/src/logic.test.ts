import { describe, it, expect } from 'vitest'
import { aiMove, newBoard, winner, isFull, type Board } from './logic'

describe('tris logic', () => {
  it('rileva vittorie', () => {
    const b = newBoard()
    b[0] = b[1] = b[2] = 'X'
    expect(winner(b)).toEqual({ player: 'X', line: [0, 1, 2] })
  })

  it("l'AI vince quando può", () => {
    const b: Board = ['O', 'O', null, 'X', 'X', null, null, null, null]
    expect(aiMove(b, 'O')).toBe(2)
  })

  it("l'AI blocca", () => {
    const b: Board = ['X', 'X', null, null, 'O', null, null, null, null]
    expect(aiMove(b, 'O')).toBe(2)
  })

  it("AI perfetta contro AI perfetta pareggia", () => {
    const b = newBoard()
    let turn: 'X' | 'O' = 'X'
    while (!winner(b) && !isFull(b)) {
      b[aiMove(b, turn)] = turn
      turn = turn === 'X' ? 'O' : 'X'
    }
    expect(winner(b)).toBeNull()
  })
})
