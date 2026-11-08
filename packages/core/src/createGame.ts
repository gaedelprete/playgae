import Phaser from 'phaser'
import { platform } from './platform'
import { PreloadScene } from './PreloadScene'

export interface GameOptions {
  /** Logical design resolution (e.g. 720x1280 portrait, 1280x720 landscape). */
  width: number
  height: number
  backgroundColor?: string
  /** Game scenes; the first one starts after preload. */
  scenes: Phaser.Types.Scenes.SceneType[]
  /** Called by PreloadScene to load assets (images, audio…). */
  preload?: (scene: Phaser.Scene) => void
  physics?: Phaser.Types.Core.PhysicsConfig
}

/** Starts the game: Bridge init → Phaser with FIT scaling → preload → first scene → gameReady. */
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
