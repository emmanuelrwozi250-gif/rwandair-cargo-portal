import { cookies } from 'next/headers'
import { LOCALES, translations, type Locale, type TranslationKey } from './index'

// Read the locale cookie in server components (set by LanguageProvider).
export async function getLocale(): Promise<Locale> {
  const c = await cookies()
  const val = c.get('rwb-locale')?.value as Locale | undefined
  return val && LOCALES.includes(val) ? val : 'en'
}

// Returns a translator bound to the request's locale, for server components.
export async function getServerT(): Promise<(key: TranslationKey) => string> {
  const locale = await getLocale()
  return (key) => translations[locale]?.[key] ?? translations.en[key] ?? key
}
