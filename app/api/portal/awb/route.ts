import { NextRequest, NextResponse } from 'next/server'
import { requireApiProfile } from '@/lib/portal-api'
import { sameOrigin, forbiddenOrigin } from '@/lib/public-forms'

export const runtime = 'nodejs'

// Deterministic-ish 459-prefix AWB serial with a check digit (serial mod 7).
function generateAwbNumber(): string {
  let serial = ''
  for (let i = 0; i < 7; i++) serial += Math.floor(Math.random() * 10)
  const check = (parseInt(serial, 10) % 7).toString()
  return `459-${serial}${check}`
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return forbiddenOrigin()
  const auth = await requireApiProfile()
  if ('error' in auth) return auth.error

  let b: Record<string, unknown>
  try { b = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const shipper = (b.shipper && typeof b.shipper === 'object') ? b.shipper as Record<string, string> : {}
  const consignee = (b.consignee && typeof b.consignee === 'object') ? b.consignee as Record<string, string> : {}

  if (!shipper.name || !consignee.name) {
    return NextResponse.json({ error: 'Shipper and consignee names are required.' }, { status: 422 })
  }
  if (!str(b.commodity)) return NextResponse.json({ error: 'Commodity is required.' }, { status: 422 })

  const awbNumber = generateAwbNumber()
  const { data, error } = await auth.supabase.from('eawbs').insert({
    account_id: auth.accountId,
    booking_id: str(b.bookingId) || null,
    awb_number: awbNumber,
    shipper,
    consignee,
    commodity: str(b.commodity),
    pieces: Number(b.pieces) || null,
    weight_kg: Number(b.weightKg) || null,
    dimensions: str(b.dimensions) || null,
    special_handling: Array.isArray(b.specialHandling) ? (b.specialHandling as string[]).slice(0, 12) : [],
  }).select('*').single()

  if (error) {
    console.error('[portal/awb] insert:', error.message)
    return NextResponse.json({ error: 'Could not generate the AWB. Please try again.' }, { status: 500 })
  }
  return NextResponse.json({ awb: data })
}
