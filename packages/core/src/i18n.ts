import { platform } from './platform'

type Dict = Record<string, string>

/** Translations: `createI18n({ en: {...}, it: {...} })`; falls back to "en". */
export function createI18n(dicts: Record<string, Dict>) {
  const lang = dicts[platform.language] ? platform.language : 'en'
  return (key: string, vars: Record<string, string | number> = {}): string => {
    let s = dicts[lang]?.[key] ?? dicts['en']?.[key] ?? key
    for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v))
    return s
  }
}
