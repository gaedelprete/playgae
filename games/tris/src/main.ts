import { createGame } from '@playgae/core'
import { MainScene } from './MainScene'

createGame({
  width: 720,
  height: 1280,
  scenes: [MainScene],
  preload: (scene) => {
    scene.load.audio('music', 'audio/music.ogg')
    scene.load.audio('place', 'audio/place.ogg')
    scene.load.audio('ai', 'audio/ai.ogg')
    scene.load.audio('win', 'audio/win.ogg')
    scene.load.audio('lose', 'audio/lose.ogg')
    scene.load.audio('draw', 'audio/draw.ogg')
  },
})
