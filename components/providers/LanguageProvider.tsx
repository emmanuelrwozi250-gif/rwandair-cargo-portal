'use client'

import {
  createContext, useContext, useEffect, useState,
  type ReactNode,
} from 'react'
import {
  LOCALES, RTL_LOCALES, LOCALE_NAMES, LOCALE_FLAGS,
  translations,
  type Locale, type TranslationKey,
} from '@/lib/i18n'

export { LOCALES, LOCALE_NAMES, LOCALE_FLAGS }

interface LanguageContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: TranslationKey) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  // Restore saved locale on mount
  useEffect(() => {
    const saved = localStorage.getItem('rwb-locale') as Locale | null
    if (saved && LOCALES.includes(saved)) setLocaleState(saved)
  }, [])

  // Update document lang + dir whenever locale changes
  useEffect(() => {
    const isRTL = RTL_LOCALES.includes(locale)
    document.documentElement.lang = locale
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  }, [locale])

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem('rwb-locale', l)
  }

  function t(key: TranslationKey): string {
    return translations[locale]?.[key] ?? translations['en'][key] ?? key
  }

  const isRTL = RTL_LOCALES.includes(locale)

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
