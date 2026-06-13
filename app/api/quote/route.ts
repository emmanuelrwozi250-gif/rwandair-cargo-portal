import { NextRequest, NextResponse } from 'next/server'

// Real W25/S26 RwandAir network transit times (hours, direct + via KGL hub)
const ROUTE_MAP: Record<string, Record<string, { transitHours: number; transitVia: number; flightDirect: string; flightVia: string }>> = {
  KGL: {
    LHR: { transitHours: 9,  transitVia: 14, flightDirect: 'WB710', flightVia: 'WB700' },
    CDG: { transitHours: 9,  transitVia: 14, flightDirect: 'WB700', flightVia: 'WB700/WB701' },
    BRU: { transitHours: 10, transitVia: 15, flightDirect: 'WB700', flightVia: 'WB700/WB701' },
    DXB: { transitHours: 7,  transitVia: 11, flightDirect: 'WB304', flightVia: 'WB9308' },
    SHJ: { transitHours: 7,  transitVia: 11, flightDirect: 'WB9304', flightVia: 'WB9308' },
    DOH: { transitHours: 7,  transitVia: 11, flightDirect: 'WB300', flightVia: 'WB9316' },
    JIB: { transitHours: 5,  transitVia: 8,  flightDirect: 'WB9316', flightVia: 'WB9308' },
    DWC: { transitHours: 10, transitVia: 14, flightDirect: 'WB9316', flightVia: 'WB9314' },
    LOS: { transitHours: 5,  transitVia: 9,  flightDirect: 'WB202', flightVia: 'WB202' },
    ACC: { transitHours: 4,  transitVia: 7,  flightDirect: 'WB220', flightVia: 'WB220' },
    JNB: { transitHours: 4,  transitVia: 7,  flightDirect: 'WB108', flightVia: 'WB102' },
    LUN: { transitHours: 3,  transitVia: 6,  flightDirect: 'WB112', flightVia: 'WB112' },
    NBO: { transitHours: 2,  transitVia: 4,  flightDirect: 'WB452', flightVia: 'WB464' },
    EBB: { transitHours: 2,  transitVia: 3,  flightDirect: 'WB434', flightVia: 'WB9434' },
    DAR: { transitHours: 3,  transitVia: 5,  flightDirect: 'WB442', flightVia: 'WB440' },
    ZNZ: { transitHours: 3,  transitVia: 5,  flightDirect: 'WB444', flightVia: 'WB444' },
    MBA: { transitHours: 3,  transitVia: 6,  flightDirect: 'WB444', flightVia: 'WB444' },
  },
  EBB: {
    LHR: { transitHours: 11, transitVia: 15, flightDirect: 'WB464/WB710', flightVia: 'WB9464/WB710' },
    DXB: { transitHours: 9,  transitVia: 12, flightDirect: 'WB464/WB304', flightVia: 'WB9464/WB304' },
    NBO: { transitHours: 2,  transitVia: 3,  flightDirect: 'WB464', flightVia: 'WB464' },
    JNB: { transitHours: 6,  transitVia: 9,  flightDirect: 'WB435/WB108', flightVia: 'WB435/WB108' },
  },
  NBO: {
    LHR: { transitHours: 12, transitVia: 15, flightDirect: 'WB453/WB710', flightVia: 'WB453/WB710' },
    DXB: { transitHours: 8,  transitVia: 11, flightDirect: 'WB453/WB304', flightVia: 'WB453/WB304' },
    CDG: { transitHours: 12, transitVia: 15, flightDirect: 'WB453/WB700', flightVia: 'WB453/WB700' },
    JNB: { transitHours: 6,  transitVia: 9,  flightDirect: 'WB453/WB108', flightVia: 'WB453/WB108' },
  },
  DAR: {
    LHR: { transitHours: 13, transitVia: 16, flightDirect: 'WB443/WB710', flightVia: 'WB440/WB710' },
    DXB: { transitHours: 10, transitVia: 13, flightDirect: 'WB443/WB304', flightVia: 'WB443/WB304' },
  },
}

const RATE_MULTIPLIERS: Record<string, number> = {
  GENERAL: 1.0, PHARMACEUTICAL: 1.55, PERISHABLE: 1.31,
  DANGEROUS_GOODS: 1.45, LIVE_ANIMALS: 1.82, HIGH_VALUE: 1.64,
}

const VALID_ORIGINS      = Object.keys(ROUTE_MAP)
const VALID_COMMODITIES  = Object.keys(RATE_MULTIPLIERS)
const BASE_RATE_PER_KG   = 3.50
const MAX_WEIGHT_KG      = 100000
const MIN_WEIGHT_KG      = 1

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { origin, destination, commodityType, weightKg } = body as Record<string, unknown>

  // Input validation
  if (!origin || !destination || !commodityType || weightKg === undefined) {
    return NextResponse.json({ error: 'Missing required fields: origin, destination, commodityType, weightKg' }, { status: 400 })
  }
  if (typeof weightKg !== 'number' || weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return NextResponse.json({ error: `weightKg must be a number between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG}` }, { status: 400 })
  }
  if (!VALID_COMMODITIES.includes(String(commodityType))) {
    return NextResponse.json({ error: `Invalid commodityType. Valid values: ${VALID_COMMODITIES.join(', ')}` }, { status: 400 })
  }

  try {
    const multiplier  = RATE_MULTIPLIERS[String(commodityType)] ?? 1.0
    const routeData   = ROUTE_MAP[String(origin)]?.[String(destination)]
    const transitHours = routeData?.transitHours ?? 12
    const transitVia   = routeData?.transitVia   ?? 18
    const flightDirect = routeData?.flightDirect  ?? 'WB—'
    const flightVia    = routeData?.flightVia     ?? 'WB—'
    const basePrice    = Math.round(BASE_RATE_PER_KG * multiplier * weightKg)

    interface QuoteOption {
      type: string; route: string[]; priceUsd: number; transitHours: number;
      departure: string; onTimePct: number;
      flightNumbers: string[]; cutoffHours: number
    }
    interface PerishableRisk {
      shelfLifeRemainingDays: number; riskLevel: string; recommendation: string
    }

    const options: QuoteOption[] = [
      {
        type: 'fastest',
        route: [String(origin), String(destination)],
        priceUsd: Math.round(basePrice * 1.15),
        transitHours,
        departure: new Date(Date.now() + 4 * 3600000).toISOString(),
        onTimePct: 96.8,
        flightNumbers: [flightDirect],
        cutoffHours: 96,
      },
      {
        type: 'cheapest',
        route: [String(origin), 'KGL', String(destination)],
        priceUsd: Math.round(basePrice * 0.94),
        transitHours: transitVia,
        departure: new Date(Date.now() + 8 * 3600000).toISOString(),
        onTimePct: 93.2,
        flightNumbers: flightVia.split('/'),
        cutoffHours: 72,
      },
      {
        type: 'reliable',
        route: [String(origin), String(destination)],
        priceUsd: Math.round(basePrice * 1.10),
        transitHours,
        departure: new Date(Date.now() + 4 * 3600000).toISOString(),
        onTimePct: 99.1,
        flightNumbers: [flightDirect],
        cutoffHours: 96,
      },
    ]

    const response: { options: QuoteOption[]; perishableRisk?: PerishableRisk } = { options }

    if (commodityType === 'PERISHABLE') {
      const shelfLifeRemainingDays = Math.round((7 - transitHours / 24) * 10) / 10
      response.perishableRisk = {
        shelfLifeRemainingDays,
        riskLevel: shelfLifeRemainingDays < 2 ? 'high' : shelfLifeRemainingDays < 4 ? 'medium' : 'low',
        recommendation: shelfLifeRemainingDays < 2
          ? 'Direct routing only — connecting options risk complete spoilage.'
          : 'Direct routing recommended to maximise shelf life on arrival.',
      }
    }

    return NextResponse.json(response)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
