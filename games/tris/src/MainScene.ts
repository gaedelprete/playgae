import Phaser from 'phaser'
import { platform, storage, createI18n } from '@playgae/core'
import { aiMove, isFull, newBoard, winner, type Board } from './logic'

const t = createI18n({
  en: { you: 'Your turn', thinking: '…', win: 'You win!', lose: 'You lose', draw: 'Draw', again: 'Play again', score: 'Wins {w} · Draws {d} · Losses {l}' },
  it: { you: 'Tocca a te', thinking: '…', win: 'Hai vinto!', lose: 'Hai perso', draw: 'Pareggio', again: 'Rigioca', score: 'Vittorie {w} · Pareggi {d} · Sconfitte {l}' },
})

const SIZE = 192
const ORIGIN_X = 720 / 2 - (3 * SIZE) / 2
const ORIGIN_Y = 1280 / 2 - (3 * SIZE) / 2 - 40
// L'AI sbaglia ogni tanto, così si può vincere.
const AI_MISTAKE = 0.25

interface Stats { w: number; d: number; l: number }

export class MainScene extends Phaser.Scene {
  private board: Board = newBoard()
  private busy = false
  private marks: Phaser.GameObjects.Text[] = []
  private status!: Phaser.GameObjects.Text
  private scoreText!: Phaser.GameObjects.Text
  private stats: Stats = { w: 0, d: 0, l: 0 }
  private overlay: Phaser.GameObjects.GameObject[] = []

  constructor() {
    super('Main')
  }

  async create(): Promise<void> {
    this.stats = await storage.get<Stats>('stats', { w: 0, d: 0, l: 0 })
    this.drawGrid()
    this.status = this.add.text(360, 140, '', { fontSize: '56px', color: '#fff' }).setOrigin(0.5)
    this.scoreText = this.add.text(360, 1180, '', { fontSize: '30px', color: '#9aa' }).setOrigin(0.5)
    this.startRound()
  }

  private drawGrid(): void {
    const g = this.add.graphics({ lineStyle: { width: 8, color: 0x6c63ff } })
    for (let i = 1; i < 3; i++) {
      g.lineBetween(ORIGIN_X + i * SIZE, ORIGIN_Y + 16, ORIGIN_X + i * SIZE, ORIGIN_Y + 3 * SIZE - 16)
      g.lineBetween(ORIGIN_X + 16, ORIGIN_Y + i * SIZE, ORIGIN_X + 3 * SIZE - 16, ORIGIN_Y + i * SIZE)
    }
    for (let i = 0; i < 9; i++) {
      const cx = ORIGIN_X + (i % 3) * SIZE + SIZE / 2
      const cy = ORIGIN_Y + Math.floor(i / 3) * SIZE + SIZE / 2
      this.add.rectangle(cx, cy, SIZE, SIZE, 0xffffff, 0.001)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.playerMove(i))
    }
  }

  private startRound(): void {
    this.overlay.forEach((o) => o.destroy())
    this.overlay = []
    this.marks.forEach((m) => m.destroy())
    this.marks = []
    this.board = newBoard()
    this.busy = false
    this.status.setText(t('you'))
    this.refreshScore()
    platform.gameplayStarted()
  }

  private refreshScore(): void {
    this.scoreText.setText(t('score', { w: this.stats.w, d: this.stats.d, l: this.stats.l }))
  }

  private place(i: number, who: 'X' | 'O'): void {
    this.board[i] = who
    const cx = ORIGIN_X + (i % 3) * SIZE + SIZE / 2
    const cy = ORIGIN_Y + Math.floor(i / 3) * SIZE + SIZE / 2
    const mark = this.add.text(cx, cy, who, {
      fontSize: '140px', fontStyle: 'bold', color: who === 'X' ? '#ffd166' : '#06d6a0',
    }).setOrigin(0.5).setScale(0)
    this.tweens.add({ targets: mark, scale: 1, duration: 160, ease: 'Back.Out' })
    this.marks.push(mark)
  }

  private playerMove(i: number): void {
    if (this.busy || this.board[i]) return
    this.busy = true
    this.place(i, 'X')
    if (this.checkEnd()) return
    this.status.setText(t('thinking'))
    this.time.delayedCall(450, () => {
      this.place(aiMove(this.board, 'O', AI_MISTAKE), 'O')
      if (this.checkEnd()) return
      this.status.setText(t('you'))
      this.busy = false
    })
  }

  private checkEnd(): boolean {
    const w = winner(this.board)
    if (!w && !isFull(this.board)) return false
    let msg: string
    if (!w) { this.stats.d++; msg = t('draw') }
    else if (w.player === 'X') { this.stats.w++; msg = t('win') }
    else { this.stats.l++; msg = t('lose') }
    void storage.set('stats', this.stats)
    this.status.setText(msg)
    this.refreshScore()
    platform.gameplayStopped()
    this.time.delayedCall(700, () => this.showReplay())
    return true
  }

  private showReplay(): void {
    const btn = this.add.text(360, 1050, t('again'), {
      fontSize: '48px', color: '#fff', backgroundColor: '#6c63ff', padding: { x: 36, y: 18 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    btn.on('pointerdown', async () => {
      await platform.showInterstitial()
      this.startRound()
    })
    this.overlay.push(btn)
  }
}
