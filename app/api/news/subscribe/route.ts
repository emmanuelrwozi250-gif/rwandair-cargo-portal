import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { sendNewsSubscribeConfirmEmail } from '@/lib/email'
import { rateLimit, rateLimited, sameOrigin, forbiddenOrigin, EMAIL_REGEX } from '@/lib/public-forms'

export const runtime = 'nodejs'

const VALID_CATEGORIES = [
  'Route News', 'Service Alerts', 'Trade Intelligence', 'Company News', 'Compliance Updates',
]

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return forbiddenOrigin()
  if (!rateLimit(req, 'news-subscribe')) return rateLimited()

  let body: { email?: unknown; categories?: unknown; format?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 422 })
  }

  const categories = Array.isArray(body.categories)
    ? body.categories.filter((c): c is string => typeof c === 'string' && VALID_CATEGORIES.includes(c))
    : []
  const format = body.format === 'instant' ? 'instant' : 'digest'

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { error } = await getAdminClient()
      .from('news_subscribers')
      .upsert({ email, categories, format }, { onConflict: 'email' })
    if (error) {
      console.error('[news/subscribe] upsert error:', error.message)
      return NextResponse.json({ error: 'Could not subscribe. Please try again.' }, { status: 500 })
    }
  }

  if (process.env.RESEND_API_KEY) {
    try {
      await sendNewsSubscribeConfirmEmail(email, categories)
    } catch (err) {
      console.error('[news/subscribe] confirm email error:', err)
    }
  }

  return NextResponse.json({ success: true })
}
