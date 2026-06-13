import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { generateRatingToken } from '@/lib/rating-tokens'
import { sendRatingRequestEmail } from '@/lib/email'

export const runtime = 'nodejs'

// Hourly Vercel cron (see vercel.json). Finds shipments delivered more than
// 24h ago that have no rating invitation yet, then emails a single-use,
// 7-day token link. Idempotent: one request per shipment reference.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ skipped: 'supabase not configured' })
  }

  const admin = getAdminClient()
  const cutoff = new Date(Date.now() - 24 * 3600_000).toISOString()
  const floor  = new Date(Date.now() - 14 * 86_400_000).toISOString() // don't chase ancient deliveries

  const { data: delivered, error } = await admin
    .from('shipments')
    .select('id, shipment_id, destination_airport, destination_country, updated_at, exporters ( email, company_name )')
    .eq('status', 'Delivered')
    .lt('updated_at', cutoff)
    .gt('updated_at', floor)
    .limit(50)

  if (error) {
    console.error('[cron/rating-requests] query error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!delivered?.length) return NextResponse.json({ sent: 0 })

  const refs = delivered.map(s => s.shipment_id)
  const { data: existing } = await admin
    .from('rating_requests')
    .select('awb')
    .in('awb', refs)
  const alreadySent = new Set((existing ?? []).map(r => r.awb))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rwandair-cargo-portal-nnvj.vercel.app'
  let sent = 0

  for (const shipment of delivered) {
    if (alreadySent.has(shipment.shipment_id)) continue
    const exporter = Array.isArray(shipment.exporters) ? shipment.exporters[0] : shipment.exporters
    if (!exporter?.email) continue

    const route = shipment.destination_airport
      ? `KGL → ${shipment.destination_airport}`
      : `KGL → ${shipment.destination_country}`
    const { token, tokenHash, expiresAt } = generateRatingToken()

    const { error: insErr } = await admin.from('rating_requests').insert({
      awb: shipment.shipment_id,
      route,
      delivery_date: shipment.updated_at?.slice(0, 10) ?? null,
      email: exporter.email,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
    })
    if (insErr) {
      console.error('[cron/rating-requests] insert error:', insErr.message)
      continue
    }

    try {
      if (process.env.RESEND_API_KEY) {
        await sendRatingRequestEmail({
          email: exporter.email,
          awb: shipment.shipment_id,
          route,
          rateUrl: `${appUrl}/rate?awb=${encodeURIComponent(shipment.shipment_id)}&token=${token}`,
        })
      }
      sent++
    } catch (err) {
      console.error('[cron/rating-requests] email error:', err)
    }
  }

  return NextResponse.json({ sent, scanned: delivered.length })
}
