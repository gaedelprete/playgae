import bridge from '@playgama/bridge'

/** Salvataggi chiave/valore via Bridge (cloud su Playgama, localStorage in dev). Mai usare localStorage direttamente. */
export const storage = {
  async get<T>(key: string, fallback: T): Promise<T> {
    try {
      const v = await bridge.storage.get(key, true)
      return v === null || v === undefined ? fallback : (v as T)
    } catch {
      return fallback
    }
  },
  async set(key: string, value: unknown): Promise<void> {
    try { await bridge.storage.set(key, value) } catch { /* noop */ }
  },
  async remove(key: string): Promise<void> {
    try { await bridge.storage.delete(key) } catch { /* noop */ }
  },
}
