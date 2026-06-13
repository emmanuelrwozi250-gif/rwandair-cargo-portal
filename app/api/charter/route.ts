import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { rateLimit, rateLimited, sameOrigin, forbiddenOrigin, EMAIL_REGEX } from '@/lib/public-forms'

export const runtime = 'nodejs'

const ADMIN_EMAIL = 'cargobooking@rwandair.com'
const FROM_EMAIL = 'RwandAir Cargo <no-reply@cargo.rwandair.com>'

// Charter request — email only, no DB record.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return forbiddenOrigin()
  if (!rateLimit(req, 'charter', 5)) return rateLimited()

  let b: Record<string, unknown>
  try { b = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  const s = (k: string) => String(b[k] ?? '').trim()
  const origin = s('origin'), destination = s('destination'), cargoType = s('cargoType')
  const description = s('description'), weight = s('weight'), volume = s('volume')
  const dateRange = s('dateRange'), name = s('name'), company = s('company')
  const email = s('email').toLowerCase(), phone = s('phone'), requirements = s('requirements')

  const missing: string[] = []
  if (!origin) missing.push('origin')
  if (!destination) missing.push('destination')
  if (!cargoType) missing.push('cargo type')
  if (!name) missing.push('full name')
  if (!EMAIL_REGEX.test(email)) missing.push('a valid email')
  if (!phone) missing.push('phone')
  if (missing.length) {
    return NextResponse.json({ error: `Please provide: ${missing.join(', ')}.` }, { status: 422 })
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const esc = (x: string) => x.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      const rows = [
        ['Origin', origin], ['Destination', destination], ['Cargo type', cargoType],
        ['Description', description || '—'], ['Est. weight', weight ? `${weight} kg` : '—'],
        ['Est. volume', volume ? `${volume} CBM` : '—'], ['Preferred dates', dateRange || '—'],
        ['Contact', `${name}${company ? `, ${company}` : ''}`], ['Email', email], ['Phone', phone],
        ['Special requirements', requirements || '—'],
      ]
      const tableHtml = rows.map(([k, v]) =>
        `<tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">${k}</td><td style="padding:6px 12px">${esc(v)}</td></tr>`).join('')

      // Internal notification
      await resend.emails.send({
        from: FROM_EMAIL, to: ADMIN_EMAIL, replyTo: email,
        subject: `Charter request — ${origin} → ${destination} (${cargoType})`,
        html: `<div style="font-family:Inter,Arial,sans-serif;max-width:600px"><h2 style="color:#02284d">New charter request</h2>
          <table style="border-collapse:collapse;width:100%">${tableHtml}</table></div>`,
        text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
      })

      // Requester confirmation
      await resend.emails.send({
        from: FROM_EMAIL, to: email,
        subject: 'We\'ve received your charter request — RwandAir Cargo',
        html: `<div style="font-family:Inter,Arial,sans-serif;max-width:600px">
          <h2 style="color:#02284d">Thank you, ${esc(name)}</h2>
          <p style="color:#475569">We've received your charter enquiry for <strong>${esc(origin)} → ${esc(destination)}</strong>
          and our charter team will respond within <strong>2 business days</strong>.</p>
          <p style="color:#94a3b8;font-size:12px">Built to Move Africa · From Africa, For the World</p></div>`,
      })
    } catch (err) {
      console.error('[charter] email error:', err)
    }
  }

  return NextResponse.json({ success: true })
}
