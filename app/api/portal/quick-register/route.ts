import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, rateLimited, sameOrigin, forbiddenOrigin, EMAIL_REGEX } from '@/lib/public-forms'

export const runtime = 'nodejs'

// Lightweight quote-wall registration: email + company only, instant account,
// no approval. Returns a magic-link token_hash the client verifies immediately
// (no email round-trip) to establish a session — then the quote reveals rates.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return forbiddenOrigin()
  if (!rateLimit(req, 'quick-register', 8)) return rateLimited()

  let body: { email?: unknown; company?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const company = typeof body.company === 'string' ? body.company.trim() : ''
  if (!EMAIL_REGEX.test(email)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 422 })
  if (company.length < 2) return NextResponse.json({ error: 'Please enter your company name.' }, { status: 422 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Registration is temporarily unavailable.' }, { status: 503 })
  }

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

  // Create the account (email pre-confirmed so there's no email step).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { company_name: company },
  })

  if (createErr) {
    // Already registered → ask them to sign in rather than silently failing.
    if (/already|exists|registered/i.test(createErr.message)) {
      return NextResponse.json({ exists: true }, { status: 200 })
    }
    console.error('[quick-register] createUser:', createErr.message)
    return NextResponse.json({ error: 'Could not create your account. Please try again.' }, { status: 500 })
  }

  // Enrich the auto-created profile row (trigger inserts a bare row on signup).
  if (created.user) {
    await admin.from('profiles')
      .update({ company_name: company, status: 'registered' })
      .eq('id', created.user.id)
  }

  // Generate a magic link and hand the token_hash to the client to verify now.
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({ type: 'magiclink', email })
  if (linkErr || !link?.properties?.hashed_token) {
    console.error('[quick-register] generateLink:', linkErr?.message)
    return NextResponse.json({ error: 'Account created — please sign in to continue.', exists: true }, { status: 200 })
  }

  return NextResponse.json({ tokenHash: link.properties.hashed_token })
}
