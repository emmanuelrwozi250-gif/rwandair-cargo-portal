import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { rateLimit, rateLimited, sameOrigin, forbiddenOrigin } from '@/lib/public-forms'

export const runtime = 'nodejs'

// Anonymous "Was this useful?" vote — increments a counter, no PII stored.
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!sameOrigin(req)) return forbiddenOrigin()
  if (!rateLimit(req, 'article-useful', 20)) return rateLimited()

  const { slug } = await params
  let body: { useful?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (typeof body.useful !== 'boolean') {
    return NextResponse.json({ error: 'Missing vote' }, { status: 422 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ success: true })
  }

  const admin = getAdminClient()
  const column = body.useful ? 'useful_yes' : 'useful_no'
  const { data: article } = await admin
    .from('articles')
    .select(`id, ${column}`)
    .eq('slug', slug)
    .maybeSingle()

  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 })

  const current = (article as Record<string, unknown>)[column] as number
  await admin.from('articles').update({ [column]: current + 1 }).eq('slug', slug)

  return NextResponse.json({ success: true })
}
