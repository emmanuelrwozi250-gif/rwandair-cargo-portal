import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { rateLimit, rateLimited, sameOrigin, forbiddenOrigin, EMAIL_REGEX } from '@/lib/public-forms'

export const runtime = 'nodejs'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'cargobooking@rwandair.com'
const FROM_EMAIL = 'RwandAir Cargo <no-reply@cargo.rwandair.com>'

// Callback request for shipments outside standard self-serve parameters.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return forbiddenOrigin()
  if (!rateLimit(req, 'quote-callback', 6)) return rateLimited()

  let b: Record<string, unknown>
  try {
    b = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = String(b.name ?? '').trim()
  const email = String(b.email ?? '').trim().toLowerCase()
  const phone = String(b.phone ?? '').trim()
  const note = String(b.note ?? '').trim()
  const context = String(b.context ?? '').trim()

  if (!name) return NextResponse.json({ error: 'Please enter your name.' }, { status: 422 })
  if (!EMAIL_REGEX.test(email)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 422 })
  if (!phone) return NextResponse.json({ error: 'Please enter a phone number.' }, { status: 422 })

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const esc = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        replyTo: email,
        subject: `Quote callback request — ${name}`,
        text: [
          `Name:    ${name}`,
          `Email:   ${email}`,
          `Phone:   ${phone}`,
          `Shipment: ${context || '—'}`,
          `Note:    ${note || '—'}`,
        ].join('\n'),
        html: `<div style="font-family:Inter,Arial,sans-serif">
          <h2 style="color:#02284d">Quote callback request</h2>
          <p><strong>Name:</strong> ${esc(name)}<br/>
          <strong>Email:</strong> ${esc(email)}<br/>
          <strong>Phone:</strong> ${esc(phone)}<br/>
          <strong>Shipment:</strong> ${esc(context || '—')}</p>
          <p>${esc(note || '—')}</p>
        </div>`,
      })
    } catch (err) {
      console.error('[quote-callback] email error:', err)
    }
  }

  return NextResponse.json({ success: true })
}
