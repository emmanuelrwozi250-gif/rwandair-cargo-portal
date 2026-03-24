// Barrel file — re-exports from split modules.
// Keeping this file means all existing `@/lib/i18n` imports continue to work.
// The actual data lives in lib/i18n/ (types.ts + translations.ts) so that
// editing translations no longer forces a Full Refresh in Next.js dev mode.
export * from './i18n/index'
