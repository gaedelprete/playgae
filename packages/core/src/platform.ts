import bridge from '@playgama/bridge'

/**
 * Wrapper sottile sul Playgama Bridge. Fuori da Playgama (dev locale) il Bridge
 * ripiega su una piattaforma "mock", quindi il codice di gioco non deve mai
 * controllare dove gira. Tutti i metodi sono sicuri anche se un modulo non è supportato.
 */
export const platform = {
  async init(): Promise<void> {
    try {
      await bridge.initialize()
    } catch (e) {
      console.warn('[platform] bridge init failed, continuo senza SDK', e)
    }
  },

  /** Lingua a 2 lettere (es. "it", "en"). */
  get language(): string {
    try {
      return (bridge.platform.language || 'en').slice(0, 2).toLowerCase()
    } catch {
      return (navigator.language || 'en').slice(0, 2).toLowerCase()
    }
  },

  setLoadingProgress(percent: number): void {
    try { bridge.setGameLoadingProgress(Math.round(percent)) } catch { /* noop */ }
  },

  /** Da chiamare quando il gioco è giocabile (fine caricamento). */
  gameReady(): void {
    try { bridge.platform.sendMessage(bridge.PLATFORM_MESSAGE.GAME_READY) } catch { /* noop */ }
  },
  gameplayStarted(): void {
    try { bridge.platform.sendMessage(bridge.PLATFORM_MESSAGE.GAMEPLAY_STARTED) } catch { /* noop */ }
  },
  gameplayStopped(): void {
    try { bridge.platform.sendMessage(bridge.PLATFORM_MESSAGE.GAMEPLAY_STOPPED) } catch { /* noop */ }
  },

  /** Interstitial: risolve quando l'annuncio è chiuso/fallito/non disponibile. */
  showInterstitial(): Promise<void> {
    return new Promise((resolve) => {
      try {
        if (!bridge.advertisement.isInterstitialSupported) return resolve()
        const { INTERSTITIAL_STATE, EVENT_NAME } = bridge
        const handler = (state: string) => {
          if (state === INTERSTITIAL_STATE.CLOSED || state === INTERSTITIAL_STATE.FAILED) {
            bridge.advertisement.off(EVENT_NAME.INTERSTITIAL_STATE_CHANGED, handler)
            resolve()
          }
        }
        bridge.advertisement.on(EVENT_NAME.INTERSTITIAL_STATE_CHANGED, handler)
        bridge.advertisement.showInterstitial()
      } catch { resolve() }
    })
  },

  /** Rewarded: risolve true se il giocatore ha ottenuto la ricompensa. */
  showRewarded(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        if (!bridge.advertisement.isRewardedSupported) return resolve(false)
        const { REWARDED_STATE, EVENT_NAME } = bridge
        let rewarded = false
        const handler = (state: string) => {
          if (state === REWARDED_STATE.REWARDED) rewarded = true
          if (state === REWARDED_STATE.CLOSED || state === REWARDED_STATE.FAILED) {
            bridge.advertisement.off(EVENT_NAME.REWARDED_STATE_CHANGED, handler)
            resolve(rewarded)
          }
        }
        bridge.advertisement.on(EVENT_NAME.REWARDED_STATE_CHANGED, handler)
        bridge.advertisement.showRewarded()
      } catch { resolve(false) }
    })
  },

  /** Notifica pausa/ripresa e mute richiesti dalla piattaforma. */
  onPauseChange(cb: (paused: boolean) => void): void {
    try {
      bridge.on(bridge.EVENT_NAME.PAUSE_STATE_CHANGED, (p: boolean) => cb(!!p))
    } catch { /* noop */ }
  },
  onAudioChange(cb: (enabled: boolean) => void): void {
    try {
      bridge.on(bridge.EVENT_NAME.AUDIO_STATE_CHANGED, (e: boolean) => cb(!!e))
    } catch { /* noop */ }
  },
}
