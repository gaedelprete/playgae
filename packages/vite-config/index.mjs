import { defineConfig } from 'vite'
import playgamaBridge from '@playgama/bridge/vite'

/** Shared Vite config: relative base (the game lives in a subfolder on Playgama),
 *  Bridge SDK bundled locally in the build (no external requests). */
export function defineGameConfig(overrides = {}) {
  return defineConfig({
    base: './',
    plugins: [playgamaBridge({ mode: 'local' })],
    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 2000,
    },
    server: { host: true },
    ...overrides,
  })
}
