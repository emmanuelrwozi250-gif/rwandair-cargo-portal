import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { hashRatingToken } from '@/lib/rating-tokens'
import { sendLowScoreAlertEmail } from '@/lib/email'
import { rateLimit, rateLimited, sameOrigin, forbiddenOrigin } from '@/lib/public-forms'
import type { ReviewCargoType } from '@/types'

export const runtime = 'nodejs'

const CARGO_TYPES: ReviewCargoType[] = ['Perishables', 'Pharma', 'General', 'Courier']
const SCORE_KEYS = ['booking', 'ontime', 'condition', 'communication', 'overall'] as const

interface RateBody {
  token: string
  scores: Record<(typeof SCORE_KEYS)[number], number>
  comment?: string
  cargoType?: string
  displayConsent?: boolean
  fullNameConsent?: boolean
  reviewerName?: string
  reviewerCompany?: string
}

function validScore(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 5
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return forbiddenOrigin()
  if (!rateLimit(req, 'rate-submit', 10)) return rateLimited()

  let body: RateBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.token || typeof body.token !== 'string') {
    return NextResponse.json({ error: 'Missing rating token' }, { status: 400 })
  }
  if (!body.scores || !SCORE_KEYS.every(k => validScore(body.scores[k]))) {
    return NextResponse.json({ error: 'Please rate all five categories (1–5 stars).' }, { status: 422 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'The rating service is temporarily unavailable.' }, { status: 503 })
  }

  const admin = getAdminClient()

  // ── Atomically consume the single-use token ─────────────────────────────────
  // The used_at IS NULL guard means a second submission with the same token
  // matches zero rows — no double reviews even under concurrent requests.
  const { data: request, error: useErr } = await admin
    .from('rating_requests')
    .update({ used_at: new Date().toISOString() })
    .eq('token_hash', hashRatingToken(body.token))
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .select('id, awb, route')
    .maybeSingle()

  if (useErr) {
    console.error('[rate] token consume error:', useErr.message)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
  if (!request) {
    return NextResponse.json(
      { error: 'This rating link is invalid, expired, or has already been used.' },
      { status: 410 }
    )
  }

  const displayConsent = body.displayConsent === true
  const cargoType = CARGO_TYPES.includes(body.cargoType as ReviewCargoType)
    ? (body.cargoType as ReviewCargoType)
    : 'General'

  const { data: rating, error: insErr } = await admin
    .from('ratings')
    .insert({
      request_id: request.id,
      awb: request.awb,
      route: request.route,
      cargo_type: cargoType,
      score_booking: body.scores.booking,
      score_ontime: body.scores.ontime,
      score_condition: body.scores.condition,
      score_communication: body.scores.communication,
      score_overall: body.scores.overall,
      comment: body.comment?.trim().slice(0, 2000) || null,
      display_consent: displayConsent,
      full_name_consent: displayConsent && body.fullNameConsent === true,
      reviewer_name: body.reviewerName?.trim().slice(0, 120) || null,
      reviewer_company: body.reviewerCompany?.trim().slice(0, 160) || null,
    })
    .select('id, score_overall')
    .single()

  if (insErr || !rating) {
    console.error('[rate] insert error:', insErr?.message)
    return NextResponse.json({ error: 'Could not save your rating. Please try again.' }, { status: 500 })
  }

  // 1–2 star overall → internal service-recovery alert (best-effort)
  if (rating.score_overall <= 2 && process.env.RESEND_API_KEY) {
    try {
      await sendLowScoreAlertEmail({
        awb: request.awb,
        route: request.route,
        score_overall: rating.score_overall,
        comment: body.comment,
      })
    } catch (err) {
      console.error('[rate] low-score alert error:', err)
    }
  }

  return NextResponse.json({ success: true, discountCode: 'THANKYOU5' })
}
