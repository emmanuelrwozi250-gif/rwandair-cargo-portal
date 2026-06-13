import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireApiProfile } from '@/lib/portal-api'
import { sameOrigin, forbiddenOrigin, EMAIL_REGEX } from '@/lib/public-forms'

export const runtime = 'nodejs'

function serviceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Invite a sub-user to the agency account (owner only).
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return forbiddenOrigin()
  const auth = await requireApiProfile()
  if ('error' in auth) return auth.error
  if (auth.profile.account_role !== 'owner') {
    return NextResponse.json({ error: 'Only the account owner can manage the team.' }, { status: 403 })
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Team management is temporarily unavailable.' }, { status: 503 })
  }

  let body: { email?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL_REGEX.test(email)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 422 })

  const admin = serviceClient()
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email, email_confirm: true,
    user_metadata: { company_name: auth.profile.company_name },
  })
  if (createErr) {
    if (/already|exists|registered/i.test(createErr.message)) {
      return NextResponse.json({ error: 'That email already has an account.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Could not invite that user.' }, { status: 500 })
  }

  if (created.user) {
    // Link the new account as a member under this agency, mirroring approval status.
    await admin.from('profiles').update({
      company_name: auth.profile.company_name,
      account_role: 'member',
      parent_id: auth.accountId,
      status: auth.profile.status,
    }).eq('id', created.user.id)

    // Send them a magic link to set up access.
    await admin.auth.admin.generateLink({ type: 'magiclink', email })
  }

  return NextResponse.json({ success: true })
}

// Remove a sub-user (owner only).
export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req)) return forbiddenOrigin()
  const auth = await requireApiProfile()
  if ('error' in auth) return auth.error
  if (auth.profile.account_role !== 'owner') {
    return NextResponse.json({ error: 'Only the account owner can manage the team.' }, { status: 403 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 })

  const admin = serviceClient()
  // Only allow removing members of THIS account.
  const { data: member } = await admin.from('profiles').select('id, parent_id').eq('id', id).maybeSingle()
  if (!member || member.parent_id !== auth.accountId) {
    return NextResponse.json({ error: 'Not a member of your account.' }, { status: 403 })
  }
  await admin.auth.admin.deleteUser(id) // cascades the profile row
  return NextResponse.json({ success: true })
}
