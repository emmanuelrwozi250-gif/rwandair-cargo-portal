import { createHash } from 'crypto'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

// Standalone password gate for the agent-approvals admin — intentionally
// separate from the Supabase-role /admin hub (uses ADMIN_PASSWORD env, not auth).
export const ADMIN_COOKIE = 'wb_agent_admin'

export function adminToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw) return null
  return createHash('sha256').update(pw).digest('hex')
}

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD
  return !!pw && input === pw
}

// For route handlers (request cookies)
export function isAdminAuthed(req: NextRequest): boolean {
  const token = adminToken()
  if (!token) return false
  return req.cookies.get(ADMIN_COOKIE)?.value === token
}

// For server components (next/headers)
export async function isAdminAuthedServer(): Promise<boolean> {
  const token = adminToken()
  if (!token) return false
  const c = await cookies()
  return c.get(ADMIN_COOKIE)?.value === token
}
