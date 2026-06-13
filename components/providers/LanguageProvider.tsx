'use client'

import {
  createContext, useContext, useEffect, useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  LOCALES, RTL_LOCALES, LOCALE_NAMES, LOCALE_FLAGS, LOCALE_LABELS,
  translations,
  type Locale, type TranslationKey,
} from '@/lib/i18n'

export { LOCALES, LOCALE_NAMES, LOCALE_FLAGS, LOCALE_LABELS }

export const LOCALE_COOKIE = 'rwb-locale'

interface LanguageContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: TranslationKey) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readCookieLocale(): Locale | null {
  const m = document.cookie.match(/(?:^|;\s*)rwb-locale=([^;]+)/)
  const val = m?.[1] as Locale | undefined
  return val && LOCALES.includes(val) ? val : null
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [locale, setLocaleState] = useState<Locale>('en')

  // Restore saved locale on mount (cookie, with legacy localStorage fallback)
  useEffect(() => {
    const fromCookie = readCookieLocale()
    const legacy = localStorage.getItem('rwb-locale') as Locale | null
    const saved = fromCookie ?? (legacy && LOCALES.includes(legacy) ? legacy : null)
    if (saved) setLocaleState(saved)
  }, [])

  // Reflect locale on <html> for direction + lang
  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr'
  }, [locale])

  function setLocale(l: Locale) {
    setLocaleState(l)
    // Cookie persistence so server components can localise too
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`
    localStorage.setItem('rwb-locale', l)
    // Re-render server components with the new locale
    router.refresh()
  }

  function t(key: TranslationKey): string {
    return translations[locale]?.[key] ?? translations.en[key] ?? key
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRTL: RTL_LOCALES.includes(locale) }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
