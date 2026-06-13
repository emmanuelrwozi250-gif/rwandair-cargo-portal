import { NextRequest, NextResponse } from 'next/server'
import { requireApiProfile } from '@/lib/portal-api'
import { sameOrigin, forbiddenOrigin } from '@/lib/public-forms'

export const runtime = 'nodejs'

// Update notification preferences for the signed-in user.
export async function PATCH(req: NextRequest) {
  if (!sameOrigin(req)) return forbiddenOrigin()
  const auth = await requireApiProfile()
  if ('error' in auth) return auth.error

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const updates: Record<string, unknown> = {}
  for (const k of ['notify_departure', 'notify_arrival', 'notify_exception'] as const) {
    if (typeof body[k] === 'boolean') updates[k] = body[k]
  }
  if (typeof body.whatsapp_number === 'string') {
    updates.whatsapp_number = body.whatsapp_number.trim().slice(0, 32) || null
  }
  if (!Object.keys(updates).length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

  const { error } = await auth.supabase.from('profiles').update(updates).eq('id', auth.userId)
  if (error) {
    console.error('[portal/notifications] update:', error.message)
    return NextResponse.json({ error: 'Could not save preferences.' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}

// Mark all notifications read.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return forbiddenOrigin()
  const auth = await requireApiProfile()
  if ('error' in auth) return auth.error
  await auth.supabase.from('agent_notifications').update({ read: true }).eq('account_id', auth.accountId).eq('read', false)
  return NextResponse.json({ success: true })
}
