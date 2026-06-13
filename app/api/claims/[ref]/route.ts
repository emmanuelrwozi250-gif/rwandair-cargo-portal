import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { rateLimit, rateLimited } from '@/lib/public-forms'

export const runtime = 'nodejs'

const REF_REGEX = /^WB-CLM-\d{8}-\d{4}$/

// Public status lookup by reference — returns status + timeline, never PII.
export async function GET(req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  if (!rateLimit(req, 'claim-lookup', 30)) return rateLimited()

  const { ref } = await params
  const claimRef = decodeURIComponent(ref).trim().toUpperCase()
  if (!REF_REGEX.test(claimRef)) {
    return NextResponse.json({ error: 'Invalid claim reference format (expected WB-CLM-YYYYMMDD-XXXX).' }, { status: 400 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Lookup is temporarily unavailable.' }, { status: 503 })
  }

  const admin = getAdminClient()
  const { data: claim } = await admin
    .from('claims')
    .select('id, claim_ref, claim_type, status, awb, created_at')
    .eq('claim_ref', claimRef)
    .maybeSingle()

  if (!claim) {
    return NextResponse.json(
      { error: 'We couldn\'t find that claim reference. Please check the number and try again, or contact our cargo desk.' },
      { status: 404 }
    )
  }

  const { data: events } = await admin
    .from('claim_events')
    .select('status, note, created_at')
    .eq('claim_id', claim.id)
    .order('created_at', { ascending: true })

  return NextResponse.json({
    claimRef: claim.claim_ref,
    claimType: claim.claim_type,
    status: claim.status,
    awb: claim.awb,
    createdAt: claim.created_at,
    timeline: events ?? [],
  })
}
