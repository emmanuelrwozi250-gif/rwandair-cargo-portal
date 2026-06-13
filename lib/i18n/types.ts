export const LOCALES = ['en', 'fr', 'ar'] as const
export type Locale = typeof LOCALES[number]

export const RTL_LOCALES: Locale[] = ['ar']

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
}

// Plain-text labels for the switcher (no flags).
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
  ar: 'AR',
}

// Retained for backwards-compat with any remaining imports; no longer rendered.
export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  ar: '🇸🇦',
}
