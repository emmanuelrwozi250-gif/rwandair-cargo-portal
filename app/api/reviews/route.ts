import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Rating, RatingAggregates, ReviewCargoType } from '@/types'

export const runtime = 'nodejs'

const PAGE_SIZE = 20
const CARGO_TYPES: ReviewCargoType[] = ['Perishables', 'Pharma', 'General', 'Courier']

// Public reviews feed: published + consented only (also enforced by RLS).
// Reviewer identity is reduced to initials unless full-name consent was given —
// GDPR Art. 5 data minimisation happens here, server-side.
export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return NextResponse.json({ aggregates: null, reviews: [], total: 0 })
  }
  const supabase = createClient(url, key)

  const params = req.nextUrl.searchParams
  const route = params.get('route')?.trim() || null
  const cargoType = params.get('cargoType') as ReviewCargoType | null
  const from = params.get('from') // ISO date
  const to = params.get('to')
  const page = Math.max(1, Number(params.get('page')) || 1)

  // ── Aggregates over the full published set (unfiltered) ────────────────────
  const { data: allScores } = await supabase
    .from('ratings')
    .select('score_booking, score_ontime, score_condition, score_communication, score_overall')
    .eq('is_published', true)
    .eq('display_consent', true)

  const count = allScores?.length ?? 0
  const avg = (k: keyof NonNullable<typeof allScores>[number]) =>
    count ? Math.round((allScores!.reduce((s, r) => s + (r[k] as number), 0) / count) * 10) / 10 : 0

  const aggregates: RatingAggregates = {
    count,
    overall: avg('score_overall'),
    booking: avg('score_booking'),
    ontime: avg('score_ontime'),
    condition: avg('score_condition'),
    communication: avg('score_communication'),
  }

  // ── Filtered, paginated review cards ────────────────────────────────────────
  let query = supabase
    .from('ratings')
    .select('id, awb, route, cargo_type, score_overall, comment, reviewer_name, reviewer_company, full_name_consent, created_at', { count: 'exact' })
    .eq('is_published', true)
    .eq('display_consent', true)
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (route) query = query.ilike('route', `%${route}%`)
  if (cargoType && CARGO_TYPES.includes(cargoType)) query = query.eq('cargo_type', cargoType)
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', `${to}T23:59:59Z`)

  const { data, count: total, error } = await query
  if (error) {
    console.error('[reviews] query error:', error.message)
    return NextResponse.json({ aggregates, reviews: [], total: 0 })
  }

  const reviews = (data as Rating[] | null)?.map(r => {
    const initials = r.reviewer_name
      ? r.reviewer_name.split(/\s+/).map(p => p[0]?.toUpperCase()).filter(Boolean).join('.') + '.'
      : 'Verified shipper'
    return {
      id: r.id,
      route: r.route,
      cargoType: r.cargo_type,
      overall: r.score_overall,
      comment: r.comment,
      reviewer: r.full_name_consent && r.reviewer_name ? r.reviewer_name : initials,
      company: r.reviewer_company ?? null,
      date: r.created_at,
      verified: true, // every row originates from an AWB-tied, token-gated invitation
    }
  }) ?? []

  return NextResponse.json({ aggregates, reviews, total: total ?? 0, pageSize: PAGE_SIZE })
}
