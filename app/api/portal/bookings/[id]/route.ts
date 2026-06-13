import { NextRequest, NextResponse } from 'next/server'
import { requireApiProfile } from '@/lib/portal-api'
import { sameOrigin, forbiddenOrigin } from '@/lib/public-forms'

export const runtime = 'nodejs'

const HOUR = 3600_000

// Amend (>48h before departure) or cancel (>72h before departure) a booking.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return forbiddenOrigin()
  const auth = await requireApiProfile()
  if ('error' in auth) return auth.error
  const { id } = await params

  let b: Record<string, unknown>
  try { b = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { data: booking } = await auth.supabase
    .from('agent_bookings').select('*').eq('id', id).eq('account_id', auth.accountId).maybeSingle()
  if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })

  const hoursToDeparture = booking.departure_at
    ? (new Date(booking.departure_at).getTime() - Date.now()) / HOUR
    : Infinity

  const action = b.action
  if (action === 'cancel') {
    if (hoursToDeparture < 72) {
      return NextResponse.json({ error: 'Cancellation closes 72h before departure — contact the cargo desk.' }, { status: 409 })
    }
    await auth.supabase.from('agent_bookings').update({ status: 'Cancelled' }).eq('id', id)
    return NextResponse.json({ success: true })
  }

  if (action === 'amend') {
    if (hoursToDeparture < 48) {
      return NextResponse.json({ error: 'Amendments close 48h before departure — contact the cargo desk.' }, { status: 409 })
    }
    const updates: Record<string, unknown> = {}
    if (typeof b.pieces === 'number') updates.pieces = b.pieces
    if (typeof b.weight_kg === 'number') updates.weight_kg = b.weight_kg
    if (typeof b.product_type === 'string') updates.product_type = b.product_type
    if (!Object.keys(updates).length) return NextResponse.json({ error: 'Nothing to amend.' }, { status: 400 })
    await auth.supabase.from('agent_bookings').update(updates).eq('id', id)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
}
