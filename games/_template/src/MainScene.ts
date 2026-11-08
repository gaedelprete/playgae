import Phaser from 'phaser'
import { platform } from '@playgae/core'

export class MainScene extends Phaser.Scene {
  constructor() {
    super('Main')
  }

  create(): void {
    const { width, height } = this.scale
    this.add.text(width / 2, height / 2, 'Hello Playgama', { fontSize: '48px', color: '#fff' }).setOrigin(0.5)
    platform.gameplayStarted()
  }
}
