import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { sendUrgentFeedbackAlertEmail } from '@/lib/email'
import { rateLimit, rateLimited, sameOrigin, forbiddenOrigin, EMAIL_REGEX } from '@/lib/public-forms'
import type { FeedbackCategory } from '@/types'

export const runtime = 'nodejs'

const CATEGORIES: FeedbackCategory[] = [
  'Booking & Pricing', 'Operations & Handling', 'Tracking & Communication',
  'Website & Digital Tools', 'New Route / Destination Request', 'Other',
]

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return forbiddenOrigin()
  if (!rateLimit(req, 'feedback')) return rateLimited()

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const category = body.category as FeedbackCategory
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Please choose a feedback category.' }, { status: 422 })
  }
  if (message.length < 20) {
    return NextResponse.json({ error: 'Please tell us a little more (minimum 20 characters).' }, { status: 422 })
  }
  if (email && !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'That email address doesn\'t look right.' }, { status: 422 })
  }

  const record = {
    category,
    message: message.slice(0, 4000),
    urgent: body.urgent === true,
    name: typeof body.name === 'string' ? body.name.trim().slice(0, 120) || null : null,
    email: email || null,
    awb_ref: typeof body.awbRef === 'string' ? body.awbRef.trim().slice(0, 20) || null : null,
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { error } = await getAdminClient().from('feedback').insert(record)
    if (error) {
      console.error('[feedback] insert error:', error.message)
      return NextResponse.json({ error: 'Could not save your feedback. Please try again.' }, { status: 500 })
    }
  }

  // Urgent flag → same-day review alert to the cargo desk (best-effort)
  if (record.urgent && process.env.RESEND_API_KEY) {
    try {
      await sendUrgentFeedbackAlertEmail(record)
    } catch (err) {
      console.error('[feedback] urgent alert error:', err)
    }
  }

  return NextResponse.json({ success: true })
}
