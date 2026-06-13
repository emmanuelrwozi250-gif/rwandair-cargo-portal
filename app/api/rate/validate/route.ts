import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { hashRatingToken } from '@/lib/rating-tokens'
import { rateLimit, rateLimited } from '@/lib/public-forms'

export const runtime = 'nodejs'

// Validates a rating token and returns the shipment context for pre-population.
export async function GET(req: NextRequest) {
  if (!rateLimit(req, 'rate-validate', 30)) return rateLimited()

  const token = req.nextUrl.searchParams.get('token') ?? ''
  if (token.length < 16) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }

  const admin = getAdminClient()
  const { data: request } = await admin
    .from('rating_requests')
    .select('id, awb, route, delivery_date, expires_at, used_at')
    .eq('token_hash', hashRatingToken(token))
    .maybeSingle()

  if (!request) return NextResponse.json({ error: 'invalid' }, { status: 404 })
  if (request.used_at) return NextResponse.json({ error: 'used' }, { status: 410 })
  if (new Date(request.expires_at) < new Date()) return NextResponse.json({ error: 'expired' }, { status: 410 })

  return NextResponse.json({
    awb: request.awb,
    route: request.route,
    deliveryDate: request.delivery_date,
  })
}
