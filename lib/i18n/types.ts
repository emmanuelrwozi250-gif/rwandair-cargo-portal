export const LOCALES = ['en', 'fr', 'ar', 'sw', 'zh', 'hi'] as const
export type Locale = typeof LOCALES[number]

export const RTL_LOCALES: Locale[] = ['ar']

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
  sw: 'Kiswahili',
  zh: '中文',
  hi: 'हिंदी',
}

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  ar: '🇸🇦',
  sw: '🇰🇪',
  zh: '🇨🇳',
  hi: '🇮🇳',
}
