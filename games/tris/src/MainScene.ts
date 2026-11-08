import Phaser from 'phaser'
import { platform, storage, createI18n } from '@playgae/core'
import {
  aiMove, applyOutcome, isFull, mistakeChanceFor, newBoard, newProgress, sanitizeProgress, winner,
  MAX_LEVEL, type Board, type Outcome, type Progress,
} from './logic'

const t = createI18n({
  en: {
    you: 'Your turn', thinking: '…', win: 'You win!', lose: 'You lose', draw: 'Draw', again: 'Play again',
    score: 'Wins {w} · Draws {d} · Losses {l}',
    level: 'Level {l} / {m}', best: 'Best level {b} · Best streak {s}',
    howTitle: 'How to play',
    howBody: 'You are X. Tap an empty cell to place your mark.\n\nLine up three in a row, column or diagonal to win.\n\nEvery win makes the computer smarter. A loss makes it easier.',
    gotIt: 'Got it',
  },
  it: {
    you: 'Tocca a te', thinking: '…', win: 'Hai vinto!', lose: 'Hai perso', draw: 'Pareggio', again: 'Rigioca',
    score: 'Vittorie {w} · Pareggi {d} · Sconfitte {l}',
    level: 'Livello {l} / {m}', best: 'Miglior livello {b} · Miglior serie {s}',
    howTitle: 'Come si gioca',
    howBody: 'Tu sei X. Tocca una casella vuota per mettere il tuo segno.\n\nAllinea tre segni in riga, colonna o diagonale per vincere.\n\nOgni vittoria rende il computer più furbo. Una sconfitta lo rende più facile.',
    gotIt: 'Ho capito',
  },
})

const W = 720
const H = 1280
const SIZE = 192
const ORIGIN_X = W / 2 - (3 * SIZE) / 2
const ORIGIN_Y = H / 2 - (3 * SIZE) / 2 - 40

interface Stats { w: number; d: number; l: number }
interface Settings { muted: boolean; tutorialDone: boolean }

export class MainScene extends Phaser.Scene {
  private board: Board = newBoard()
  private busy = false
  private modal = false
  private marks: Phaser.GameObjects.Text[] = []
  private status!: Phaser.GameObjects.Text
  private scoreText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private bestText!: Phaser.GameObjects.Text
  private muteIcon!: Phaser.GameObjects.Graphics
  private stats: Stats = { w: 0, d: 0, l: 0 }
  private progress: Progress = newProgress()
  private settings: Settings = { muted: false, tutorialDone: false }
  private overlay: Phaser.GameObjects.GameObject[] = []
  private music?: Phaser.Sound.BaseSound

  constructor() {
    super('Main')
  }

  async create(): Promise<void> {
    this.stats = await storage.get<Stats>('stats', { w: 0, d: 0, l: 0 })
    this.progress = sanitizeProgress(await storage.get<Partial<Progress> | null>('progress', null))
    this.settings = { muted: false, tutorialDone: false, ...(await storage.get<Partial<Settings>>('settings', {})) }

    this.drawGrid()
    this.status = this.add.text(W / 2, 170, '', { fontSize: '56px', color: '#fff' }).setOrigin(0.5)
    this.levelText = this.add.text(W / 2, 90, '', { fontSize: '36px', color: '#ffd166' }).setOrigin(0.5)
    this.scoreText = this.add.text(W / 2, 1180, '', { fontSize: '30px', color: '#9aa' }).setOrigin(0.5)
    this.bestText = this.add.text(W / 2, 1225, '', { fontSize: '26px', color: '#778' }).setOrigin(0.5)
    this.createButtons()
    this.applyMute()
    this.game.registry.events.on('changedata-platformAudio', () => this.applyMute())

    this.startRound()
    if (!this.settings.tutorialDone) this.showTutorial()
  }

  // ---- audio -------------------------------------------------------------

  private applyMute(): void {
    const platformOn = this.game.registry.get('platformAudio') !== false
    const muted = this.settings.muted || !platformOn
    this.sound.mute = muted
    this.drawMuteIcon(muted)
  }

  private sfx(key: string): void {
    if (this.cache.audio.exists(key)) this.sound.play(key, { volume: 0.8 })
  }

  /** Browsers only allow audio after a user gesture, so music starts on the first tap. */
  private ensureMusic(): void {
    if (this.music || !this.cache.audio.exists('music')) return
    this.music = this.sound.add('music', { loop: true, volume: 0.5 })
    this.music.play()
  }

  // ---- buttons -----------------------------------------------------------

  private createButtons(): void {
    this.muteIcon = this.add.graphics()
    this.add.rectangle(W - 60, 70, 90, 90, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.ensureMusic()
        this.settings.muted = !this.settings.muted
        void storage.set('settings', this.settings)
        this.applyMute()
      })

    this.add.text(60, 70, '?', {
      fontSize: '48px', fontStyle: 'bold', color: '#fff', backgroundColor: '#3a3a5c', padding: { x: 22, y: 8 },
    }).setOrigin(0.5)
    this.add.rectangle(60, 70, 90, 90, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { this.ensureMusic(); if (!this.modal) this.showTutorial() })
  }

  private drawMuteIcon(muted: boolean): void {
    const g = this.muteIcon
    const x = W - 60
    const y = 70
    g.clear()
    g.fillStyle(0x3a3a5c, 1).fillRoundedRect(x - 40, y - 40, 80, 80, 14)
    g.fillStyle(0xffffff, 1)
    g.fillRect(x - 24, y - 8, 12, 16)
    g.fillTriangle(x - 12, y - 8, x + 4, y - 22, x + 4, y + 22)
    g.fillTriangle(x - 12, y + 8, x - 12, y - 8, x + 4, y + 22)
    if (muted) {
      g.lineStyle(6, 0xff5d73, 1)
      g.lineBetween(x + 12, y - 14, x + 30, y + 14)
      g.lineBetween(x + 30, y - 14, x + 12, y + 14)
    } else {
      g.lineStyle(5, 0xffffff, 1)
      g.beginPath()
      g.arc(x + 4, y, 16, -0.9, 0.9)
      g.strokePath()
      g.beginPath()
      g.arc(x + 4, y, 28, -0.9, 0.9)
      g.strokePath()
    }
  }

  // ---- tutorial ----------------------------------------------------------

  private showTutorial(): void {
    this.modal = true
    const items: Phaser.GameObjects.GameObject[] = []
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75).setInteractive()
    const panel = this.add.rectangle(W / 2, H / 2, 600, 640, 0x2a2a48).setStrokeStyle(6, 0x6c63ff)
    const title = this.add.text(W / 2, H / 2 - 250, t('howTitle'), { fontSize: '52px', fontStyle: 'bold', color: '#ffd166' }).setOrigin(0.5)
    const body = this.add.text(W / 2, H / 2 - 20, t('howBody'), {
      fontSize: '34px', color: '#fff', align: 'center', wordWrap: { width: 520 },
    }).setOrigin(0.5)
    const ok = this.add.text(W / 2, H / 2 + 250, t('gotIt'), {
      fontSize: '44px', color: '#fff', backgroundColor: '#6c63ff', padding: { x: 36, y: 16 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    items.push(dim, panel, title, body, ok)
    ok.on('pointerdown', () => {
      this.ensureMusic()
      items.forEach((o) => o.destroy())
      this.modal = false
      if (!this.settings.tutorialDone) {
        this.settings.tutorialDone = true
        void storage.set('settings', this.settings)
      }
    })
  }

  // ---- board -------------------------------------------------------------

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
    this.refreshTexts()
    platform.gameplayStarted()
  }

  private refreshTexts(): void {
    this.scoreText.setText(t('score', { w: this.stats.w, d: this.stats.d, l: this.stats.l }))
    this.levelText.setText(t('level', { l: this.progress.level, m: MAX_LEVEL }))
    this.bestText.setText(t('best', { b: this.progress.bestLevel, s: this.progress.bestStreak }))
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
    this.sfx(who === 'X' ? 'place' : 'ai')
  }

  private playerMove(i: number): void {
    if (this.busy || this.modal || this.board[i]) return
    this.ensureMusic()
    this.busy = true
    this.place(i, 'X')
    if (this.checkEnd()) return
    this.status.setText(t('thinking'))
    this.time.delayedCall(450, () => {
      this.place(aiMove(this.board, 'O', mistakeChanceFor(this.progress.level)), 'O')
      if (this.checkEnd()) return
      this.status.setText(t('you'))
      this.busy = false
    })
  }

  private checkEnd(): boolean {
    const w = winner(this.board)
    if (!w && !isFull(this.board)) return false
    let msg: string
    let outcome: Outcome
    if (!w) { this.stats.d++; msg = t('draw'); outcome = 'draw' }
    else if (w.player === 'X') { this.stats.w++; msg = t('win'); outcome = 'win' }
    else { this.stats.l++; msg = t('lose'); outcome = 'lose' }
    this.progress = applyOutcome(this.progress, outcome)
    void storage.set('stats', this.stats)
    void storage.set('progress', this.progress)
    this.sfx(outcome)
    this.status.setText(msg)
    this.refreshTexts()
    platform.gameplayStopped()
    this.time.delayedCall(700, () => this.showReplay())
    return true
  }

  private showReplay(): void {
    const btn = this.add.text(W / 2, 1050, t('again'), {
      fontSize: '48px', color: '#fff', backgroundColor: '#6c63ff', padding: { x: 36, y: 18 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    btn.on('pointerdown', async () => {
      btn.disableInteractive()
      // Sound and gameplay stay paused while the ad is on screen.
      this.sound.pauseAll()
      await platform.showInterstitial()
      this.sound.resumeAll()
      this.startRound()
    })
    this.overlay.push(btn)
  }
}
