import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { rateLimit, rateLimited, sameOrigin, forbiddenOrigin } from '@/lib/public-forms'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return forbiddenOrigin()
  if (!rateLimit(req, 'nps')) return rateLimited()

  let body: { score?: unknown; reason?: unknown; source?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const score = body.score
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > 10) {
    return NextResponse.json({ error: 'Score must be a whole number from 0 to 10.' }, { status: 422 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ success: true }) // accept silently in unconfigured envs
  }

  const { error } = await getAdminClient().from('nps_responses').insert({
    score,
    reason: typeof body.reason === 'string' ? body.reason.trim().slice(0, 1000) || null : null,
    source: body.source === 'drawer' ? 'drawer' : 'page',
  })

  if (error) {
    console.error('[nps] insert error:', error.message)
    return NextResponse.json({ error: 'Could not record your response. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
