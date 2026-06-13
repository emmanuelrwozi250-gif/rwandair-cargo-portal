// Quote money model — cargo charge + explicit fuel surcharge + handling fee
// → all-in total. Kept in one place so the card and any future booking flow
// agree on the numbers.

export const FUEL_SURCHARGE_PCT = 0.12 // 12% of cargo charge
export const HANDLING_FEE_USD = 45     // flat per shipment

export interface LineItems {
  cargoUsd: number
  fuelUsd: number
  handlingUsd: number
  allInUsd: number
}

export function computeLineItems(cargoUsd: number): LineItems {
  const fuelUsd = Math.round(cargoUsd * FUEL_SURCHARGE_PCT)
  const handlingUsd = HANDLING_FEE_USD
  return { cargoUsd, fuelUsd, handlingUsd, allInUsd: cargoUsd + fuelUsd + handlingUsd }
}

export const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

// Standard self-serve parameters. Anything outside these needs a human —
// surface the "request callback" path instead of (or alongside) a spot quote.
export const STANDARD_MAX_WEIGHT_KG = 20000
const SPECIAL_COMMODITIES = ['LIVE_ANIMALS', 'DANGEROUS_GOODS', 'HIGH_VALUE']

export function outOfStandardReason(opts: {
  weightKg: number
  commodity: string
  routeKnown: boolean
}): string | null {
  if (opts.weightKg > STANDARD_MAX_WEIGHT_KG)
    return 'This weight is in charter territory — our team will scope the best aircraft and routing for you.'
  if (!opts.routeKnown)
    return 'This routing isn\'t in our standard schedule — our cargo desk will build a tailored option.'
  if (SPECIAL_COMMODITIES.includes(opts.commodity))
    return 'This commodity needs specialist handling — our team will confirm acceptance and the exact rate.'
  return null
}
