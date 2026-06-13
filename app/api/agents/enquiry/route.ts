import { NextRequest, NextResponse } from 'next/server'

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
  const routes = Array.isArray(body.routes)
    ? body.routes.filter((r): r is string => typeof r === 'string').slice(0, 20)
    : []
  const hearAbout = typeof body.hearAbout === 'string' ? body.hearAbout.trim().slice(0, 120) : ''

  // ── Persist to Supabase if configured ───────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (supabaseUrl && serviceKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const admin = createClient(supabaseUrl, serviceKey)
      await admin.from('agent_enquiries').insert({
        company_name:    company.trim(),
        iata_code:       iata?.trim() || null,
        contact_name:    contact.trim(),
        email:           email.trim().toLowerCase(),
        phone:           phone.trim(),
        country:         country.trim(),
        monthly_volume:  volume || null,
        primary_routes:  routes,
        hear_about:      hearAbout || null,
        submitted_at:    new Date().toISOString(),
        status:          'new',
      })
    } catch (err) {
      // Log but don't fail — table may not exist yet
      console.error('[agents/enquiry] Supabase insert error:', err)
    }
  }

  // ── Send notification email via Resend if configured ────────────────────────
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: 'RwandAir Cargo Portal <noreply@rwandair-cargo-portal-nnvj.vercel.app>',
          to:   ['cargobooking@rwandair.com'],
          subject: `New Agent Enquiry — ${company}`,
          text: [
            `Company:  ${company}`,
            `IATA:     ${iata || '—'}`,
            `Contact:  ${contact}`,
            `Email:    ${email}`,
            `Phone:    ${phone}`,
            `Country:  ${country}`,
            `Volume:   ${volume || '—'}`,
            `Routes:   ${routes.length ? routes.join('; ') : '—'}`,
            `Heard via: ${hearAbout || '—'}`,
          ].join('\n'),
        }),
      })
      if (!res.ok) console.error('[agents/enquiry] Resend error:', await res.text())
    } catch (err) {
      console.error('[agents/enquiry] Email send error:', err)
    }
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
