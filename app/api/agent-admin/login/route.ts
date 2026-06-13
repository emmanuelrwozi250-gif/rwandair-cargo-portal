import { NextRequest, NextResponse } from 'next/server'
import { checkPassword, adminToken, ADMIN_COOKIE } from '@/lib/agent-admin'
import { rateLimit, rateLimited, sameOrigin, forbiddenOrigin } from '@/lib/public-forms'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return forbiddenOrigin()
  if (!rateLimit(req, 'agent-admin-login', 8)) return rateLimited()

  let body: { password?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const token = adminToken()
  if (!token) return NextResponse.json({ error: 'Admin access is not configured.' }, { status: 503 })

  if (typeof body.password !== 'string' || !checkPassword(body.password)) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    path: '/', maxAge: 60 * 60 * 8, // 8-hour admin session
  })
  return res
}

// Sign out
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}
