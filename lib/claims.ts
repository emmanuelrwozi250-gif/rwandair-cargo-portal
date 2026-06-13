import type { ClaimType } from '@/types'

// IATA Resolution 600a / Montreal Convention 1999 notification time limits,
// counted from the (actual or expected) delivery date.
export const CLAIM_TIME_LIMITS: Record<ClaimType, { days: number; label: string }> = {
  Damage:    { days: 14,  label: 'Damage must be reported within 14 days of delivery' },
  Shortage:  { days: 14,  label: 'Shortage must be reported within 14 days of delivery' },
  Pilferage: { days: 14,  label: 'Pilferage must be reported within 14 days of delivery' },
  Delay:     { days: 21,  label: 'Delay must be reported within 21 days of the date the cargo was placed at your disposal' },
  Loss:      { days: 120, label: 'Loss must be reported within 120 days of the issue date of the air waybill' },
}

export interface TimeLimitCheck {
  withinLimit: boolean
  daysElapsed: number
  daysAllowed: number
  message: string
}

export function checkClaimTimeLimit(
  claimType: ClaimType,
  deliveryDateISO: string,
  now: Date = new Date()
): TimeLimitCheck {
  const limit = CLAIM_TIME_LIMITS[claimType]
  const delivery = new Date(deliveryDateISO)
  const daysElapsed = Math.floor((now.getTime() - delivery.getTime()) / 86_400_000)
  const withinLimit = daysElapsed <= limit.days

  return {
    withinLimit,
    daysElapsed,
    daysAllowed: limit.days,
    message: withinLimit
      ? limit.label
      : `This claim falls outside the IATA notification window (${limit.days} days for ${claimType.toLowerCase()} claims — ${daysElapsed} days have passed). You may still submit it: our claims desk reviews late notifications case by case, but settlement rights under the Montreal Convention may be affected.`,
  }
}

export const MONTREAL_CONVENTION_NOTE =
  'RwandAir Cargo is an IATA member and processes all claims in accordance with the Warsaw Convention as amended by the Montreal Protocol and the Montreal Convention 1999. For cargo, liability is limited under Article 22(3) of the Montreal Convention 1999 (currently 26 Special Drawing Rights per kilogramme) unless a higher value was declared for carriage and any supplementary charges paid.'

export const CLAIM_FILE_LIMITS = {
  maxFiles: 5,
  maxBytes: 5 * 1024 * 1024,
  acceptedMime: ['application/pdf', 'image/jpeg', 'image/png'],
  acceptedLabel: 'PDF, JPG or PNG · max 5 MB each · up to 5 files',
}
