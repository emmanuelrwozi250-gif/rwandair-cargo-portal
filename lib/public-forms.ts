import { NextRequest, NextResponse } from 'next/server'

// ── AWB helpers ───────────────────────────────────────────────────────────────
// RwandAir prefix 459, 8-digit serial: 459-12345678 (also accepts 45912345678)
export const AWB_REGEX = /^459-\d{8}$/

export function normalizeAwb(raw: string): string | null {
  const cleaned = raw.trim().replace(/\s+/g, '')
  const candidate = /^\d{11}$/.test(cleaned)
    ? `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    : cleaned
  return AWB_REGEX.test(candidate) ? candidate : null
}

// ── Rate limiting ─────────────────────────────────────────────────────────────
// In-memory sliding window per IP. Instances are reused under Fluid Compute so
// this provides real protection; swap for Upstash/Redis if multi-region scale
// ever demands shared state.
const buckets = new Map<string, number[]>()
const WINDOW_MS = 60 * 60 * 1000

export function rateLimit(req: NextRequest, formName: string, max = 5): boolean {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  const key = `${formName}:${ip}`
  const now = Date.now()
  const hits = (buckets.get(key) || []).filter(t => now - t < WINDOW_MS)
  if (hits.length >= max) {
    buckets.set(key, hits)
    return false
  }
  hits.push(now)
  buckets.set(key, hits)
  // Opportunistic cleanup so the map cannot grow unbounded
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (v.every(t => now - t >= WINDOW_MS)) buckets.delete(k)
    }
  }
  return true
}

export function rateLimited(): NextResponse {
  return NextResponse.json(
    { error: 'Too many submissions. Please try again in an hour, or contact our cargo desk.' },
    { status: 429 }
  )
}

// ── Same-origin check (CSRF posture for public JSON forms) ───────────────────
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true // non-browser clients (curl, server-side) have no Origin
  try {
    return new URL(origin).host === req.headers.get('host')
  } catch {
    return false
  }
}

export function forbiddenOrigin(): NextResponse {
  return NextResponse.json({ error: 'Cross-origin form submission rejected.' }, { status: 403 })
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
