import { NextRequest, NextResponse } from 'next/server'
import { sendAgentWelcomeEmail } from '@/lib/email'
import { validateIataFiata } from '@/lib/portal-constants'

export const runtime = 'nodejs'

interface EnquiryBody {
  company: string
  iata?: string
  contact: string
  email: string
  phone: string
  country: string
  volume?: string
  routes?: string[]
  products?: string[]
  hearAbout?: string
}

function validateBody(body: unknown): body is EnquiryBody {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.company === 'string' && b.company.trim().length > 0 &&
    typeof b.contact === 'string' && b.contact.trim().length > 0 &&
    typeof b.email   === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) &&
    typeof b.phone   === 'string' && b.phone.trim().length > 0 &&
    typeof b.country === 'string' && b.country.trim().length > 0
  )
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!validateBody(body)) {
    return NextResponse.json(
      { error: 'Missing required fields: company, contact, email, phone, country' },
      { status: 422 }
    )
  }

  const { company, iata, contact, email, phone, country, volume } = body
  const cleanEmail = email.trim().toLowerCase()
  const routes = Array.isArray(body.routes)
    ? body.routes.filter((r): r is string => typeof r === 'string').slice(0, 20)
    : []
  const products = Array.isArray(body.products)
    ? body.products.filter((p): p is string => typeof p === 'string').slice(0, 10)
    : []
  const hearAbout = typeof body.hearAbout === 'string' ? body.hearAbout.trim().slice(0, 120) : ''

  if (iata && iata.trim() && !validateIataFiata(iata)) {
    return NextResponse.json({ error: 'Enter a valid IATA (7 digits) or FIATA code, or leave it blank.' }, { status: 422 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  let accountCreated = false

  if (supabaseUrl && serviceKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

      // CRM log
      await admin.from('agent_enquiries').insert({
        company_name: company.trim(), iata_code: iata?.trim() || null,
        contact_name: contact.trim(), email: cleanEmail, phone: phone.trim(),
        country: country.trim(), monthly_volume: volume || null,
        primary_routes: routes, hear_about: hearAbout || null,
        submitted_at: new Date().toISOString(), status: 'new',
      })

      // Create a PENDING agent account (owner). Idempotent on existing email.
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: cleanEmail, email_confirm: true, user_metadata: { company_name: company.trim() },
      })
      if (!createErr && created.user) {
        await admin.from('profiles').update({
          company_name: company.trim(),
          country: country.trim(),
          iata_fiata_code: iata?.trim() || null,
          volume_tier: volume || null,
          product_types: products,
          preferred_routes: routes,
          status: 'pending',
          account_role: 'owner',
        }).eq('id', created.user.id)
        accountCreated = true
      }
    } catch (err) {
      console.error('[agents/enquiry] Supabase error:', err)
    }
  }

  // Welcome email to applicant + commercial notification (best-effort)
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    try {
      if (accountCreated) await sendAgentWelcomeEmail({ email: cleanEmail, company: company.trim() })
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: 'RwandAir Cargo <no-reply@cargo.rwandair.com>',
          to: ['cargobooking@rwandair.com'],
          subject: `New agent application — ${company}`,
          text: [
            `Company:  ${company}`, `IATA/FIATA: ${iata || '—'}`, `Contact:  ${contact}`,
            `Email:    ${cleanEmail}`, `Phone:    ${phone}`, `Country:  ${country}`,
            `Volume:   ${volume || '—'}`, `Products: ${products.length ? products.join(', ') : '—'}`,
            `Routes:   ${routes.length ? routes.join('; ') : '—'}`, `Heard via: ${hearAbout || '—'}`,
            `Account created: ${accountCreated ? 'yes (pending)' : 'no (email may already exist)'}`,
          ].join('\n'),
        }),
      }).catch(e => console.error('[agents/enquiry] commercial email:', e))
    } catch (err) {
      console.error('[agents/enquiry] Email send error:', err)
    }
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
