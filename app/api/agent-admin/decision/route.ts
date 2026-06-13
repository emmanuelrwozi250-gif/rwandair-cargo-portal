import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { isAdminAuthed } from '@/lib/agent-admin'
import { sendAgentApprovedEmail, sendAgentRejectedEmail } from '@/lib/email'
import { sameOrigin, forbiddenOrigin } from '@/lib/public-forms'

export const runtime = 'nodejs'

// Approve or reject an agent registration (+ notify, + cascade to sub-users).
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return forbiddenOrigin()
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { id?: unknown; action?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const id = typeof body.id === 'string' ? body.id : ''
  const action = body.action
  if (!id || (action !== 'approve' && action !== 'reject')) {
    return NextResponse.json({ error: 'Provide an id and a valid action.' }, { status: 422 })
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
  }

  const admin = getAdminClient()
  const status = action === 'approve' ? 'approved' : 'rejected'

  const { data: profile, error } = await admin
    .from('profiles').update({ status }).eq('id', id)
    .select('email, company_name').single()
  if (error || !profile) {
    return NextResponse.json({ error: 'Could not update the account.' }, { status: 500 })
  }

  // Cascade approval status to the agency's sub-users so they share access tier.
  await admin.from('profiles').update({ status }).eq('parent_id', id)

  if (process.env.RESEND_API_KEY) {
    try {
      const opts = { email: profile.email, company: profile.company_name || 'your agency' }
      if (action === 'approve') await sendAgentApprovedEmail(opts)
      else await sendAgentRejectedEmail(opts)
    } catch (err) {
      console.error('[agent-admin/decision] email error:', err)
    }
  }

  return NextResponse.json({ ok: true, status })
}
