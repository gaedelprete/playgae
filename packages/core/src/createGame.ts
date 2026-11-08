import Phaser from 'phaser'
import { platform } from './platform'
import { PreloadScene } from './PreloadScene'

export interface GameOptions {
  /** Risoluzione logica di design (es. 720x1280 verticale, 1280x720 orizzontale). */
  width: number
  height: number
  backgroundColor?: string
  /** Scene del gioco; la prima parte dopo il preload. */
  scenes: Phaser.Types.Scenes.SceneType[]
  /** Chiamata dal PreloadScene per caricare asset (immagini, audio…). */
  preload?: (scene: Phaser.Scene) => void
  physics?: Phaser.Types.Core.PhysicsConfig
}

/** Avvia il gioco: init Bridge → Phaser con scaling FIT → preload → prima scena → gameReady. */
export async function createGame(opts: GameOptions): Promise<Phaser.Game> {
  await platform.init()

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: opts.width,
    height: opts.height,
    backgroundColor: opts.backgroundColor ?? '#1b1b2f',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: opts.physics,
    input: { activePointers: 3 },
    scene: [new PreloadScene(opts.preload), ...opts.scenes],
  })

  platform.onPauseChange((paused) => {
    if (paused) game.pause()
    else game.resume()
  })
  platform.onAudioChange((enabled) => { game.sound.mute = !enabled })

  return game
}
