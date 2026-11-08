import { defineConfig } from 'vite'
import playgamaBridge from '@playgama/bridge/vite'

/** Config Vite condivisa: base relativa (il gioco vive in una sottocartella su Playgama),
 *  Bridge SDK incluso localmente nel build (nessuna richiesta esterna). */
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
