import { describe, it, expect } from 'vitest'
import {
  aiMove, newBoard, winner, isFull, type Board,
  applyOutcome, mistakeChanceFor, newProgress, sanitizeProgress, MAX_LEVEL, LEVEL_MISTAKES,
} from './logic'

describe('tris logic', () => {
  it('detects wins', () => {
    const b = newBoard()
    b[0] = b[1] = b[2] = 'X'
    expect(winner(b)).toEqual({ player: 'X', line: [0, 1, 2] })
  })

  it('AI wins when it can', () => {
    const b: Board = ['O', 'O', null, 'X', 'X', null, null, null, null]
    expect(aiMove(b, 'O')).toBe(2)
  })

  it('AI blocks', () => {
    const b: Board = ['X', 'X', null, null, 'O', null, null, null, null]
    expect(aiMove(b, 'O')).toBe(2)
  })

  it('perfect AI vs perfect AI is a draw', () => {
    const b = newBoard()
    let turn: 'X' | 'O' = 'X'
    while (!winner(b) && !isFull(b)) {
      b[aiMove(b, turn)] = turn
      turn = turn === 'X' ? 'O' : 'X'
    }
    expect(winner(b)).toBeNull()
  })
})

describe('levels', () => {
  it('mistake chance strictly decreases with the level and ends at zero', () => {
    for (let i = 1; i < LEVEL_MISTAKES.length; i++) {
      expect(LEVEL_MISTAKES[i]).toBeLessThan(LEVEL_MISTAKES[i - 1]!)
    }
    expect(mistakeChanceFor(MAX_LEVEL)).toBe(0)
  })

  it('clamps out-of-range levels', () => {
    expect(mistakeChanceFor(0)).toBe(LEVEL_MISTAKES[0])
    expect(mistakeChanceFor(99)).toBe(0)
  })

  it('a win raises the level and streak, up to the cap', () => {
    let p = newProgress()
    for (let i = 0; i < 10; i++) p = applyOutcome(p, 'win')
    expect(p.level).toBe(MAX_LEVEL)
    expect(p.bestLevel).toBe(MAX_LEVEL)
    expect(p.streak).toBe(10)
    expect(p.bestStreak).toBe(10)
  })

  it('a loss lowers the level (min 1) and resets the streak but keeps the bests', () => {
    let p = newProgress()
    p = applyOutcome(applyOutcome(p, 'win'), 'win')
    expect(p.level).toBe(3)
    p = applyOutcome(p, 'lose')
    expect(p).toEqual({ level: 2, bestLevel: 3, streak: 0, bestStreak: 2 })
    p = applyOutcome(applyOutcome(p, 'lose'), 'lose')
    expect(p.level).toBe(1)
  })

  it('a draw keeps the level and resets the streak', () => {
    const p = applyOutcome(applyOutcome(newProgress(), 'win'), 'draw')
    expect(p.level).toBe(2)
    expect(p.streak).toBe(0)
  })

  it('sanitizes missing or corrupt saves', () => {
    expect(sanitizeProgress(undefined)).toEqual(newProgress())
    expect(sanitizeProgress({ level: 99, bestLevel: -3, streak: 'x' as unknown as number })).toEqual({
      level: MAX_LEVEL, bestLevel: MAX_LEVEL, streak: 0, bestStreak: 0,
    })
  })
})
