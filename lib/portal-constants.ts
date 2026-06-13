// Pure constants + validators with no server imports — safe for client
// components. Server-only helpers (requirePortalProfile) live in lib/portal.ts.

export const VOLUME_TIERS = [
  'Under 1 tonne/month',
  '1–5 tonnes/month',
  '5–20 tonnes/month',
  '20t+ /month',
]

export const PRODUCT_TYPES = ['General', 'Fresh', 'Pharma', 'Valuables', 'DG', 'Live']

// IATA = 7 numeric digits; FIATA = alphanumeric (commonly with a country prefix).
export const IATA_REGEX = /^\d{7}$/
export const FIATA_REGEX = /^[A-Za-z0-9]{4,12}$/

export function validateIataFiata(code: string): boolean {
  const c = code.trim()
  return IATA_REGEX.test(c) || FIATA_REGEX.test(c)
}
