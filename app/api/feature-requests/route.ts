import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

// Public read-only board — top requested features/routes, curated monthly
// by the cargo desk (rows maintained in the feature_requests table).
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return NextResponse.json({ requests: [] })

  const { data, error } = await createClient(url, key)
    .from('feature_requests')
    .select('id, title, request_count, sort_order')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
    .limit(5)

  if (error) {
    console.error('[feature-requests] query error:', error.message)
    return NextResponse.json({ requests: [] })
  }
  return NextResponse.json(
    { requests: data ?? [] },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } }
  )
}
