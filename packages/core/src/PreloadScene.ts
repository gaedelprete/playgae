import Phaser from 'phaser'
import { platform } from './platform'

/** Loading scene: progress bar, reports progress to the Bridge, then starts the next scene. */
export class PreloadScene extends Phaser.Scene {
  constructor(private loadAssets?: (scene: Phaser.Scene) => void) {
    super('Preload')
  }

  preload(): void {
    const { width, height } = this.scale
    const bar = this.add.rectangle(width / 2 - width * 0.3, height / 2, 0, 12, 0xffffff).setOrigin(0, 0.5)
    this.load.on('progress', (p: number) => {
      bar.width = width * 0.6 * p
      platform.setLoadingProgress(p * 100)
    })
    this.loadAssets?.(this)
  }

  create(): void {
    platform.setLoadingProgress(100)
    platform.gameReady()
    const next = this.scene.manager.scenes[1]
    if (next) this.scene.start(next.scene.key)
  }
}
