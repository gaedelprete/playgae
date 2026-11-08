import bridge from '@playgama/bridge'

/**
 * Thin wrapper over the Playgama Bridge. Outside Playgama (local dev) the Bridge
 * falls back to a "mock" platform, so game code never needs to check where it runs.
 * All methods are safe even if a module is unsupported.
 */
export const platform = {
  async init(): Promise<void> {
    try {
      await bridge.initialize()
    } catch (e) {
      console.warn('[platform] bridge init failed, continuo senza SDK', e)
    }
  },

  /** 2-letter language (e.g. "it", "en"). */
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

  /** Call when the game is playable (loading finished). */
  gameReady(): void {
    try { bridge.platform.sendMessage(bridge.PLATFORM_MESSAGE.GAME_READY) } catch { /* noop */ }
  },
  gameplayStarted(): void {
    try { bridge.platform.sendMessage(bridge.PLATFORM_MESSAGE.GAMEPLAY_STARTED) } catch { /* noop */ }
  },
  gameplayStopped(): void {
    try { bridge.platform.sendMessage(bridge.PLATFORM_MESSAGE.GAMEPLAY_STOPPED) } catch { /* noop */ }
  },

  /** Interstitial: resolves when the ad is closed, failed or unavailable. */
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

  /** Rewarded: resolves true if the player earned the reward. */
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

  /** Pause/resume and mute requests from the platform. */
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
