import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Profile } from '@/types'

// Server-side gate for /portal/*. Returns the signed-in user's profile, or
// redirects to /portal/login when unauthenticated. The owner account id
// (self for owners, parent for sub-users) is what portal data is keyed on.
export async function requirePortalProfile(): Promise<{ profile: Profile; accountId: string; userId: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) redirect('/portal/login')

  const p = profile as Profile
  return { profile: p, accountId: p.parent_id ?? p.id, userId: user.id }
}

export const VOLUME_TIERS = [
  'Under 1 tonne/month',
  '1–5 tonnes/month',
  '5–20 tonnes/month',
  '20t+ /month',
]

export const PRODUCT_TYPES = ['General', 'Fresh', 'Pharma', 'Valuables', 'DG', 'Live']

// IATA = 7 numeric digits; FIATA = alphanumeric (commonly with a country prefix).
export const IATA_REGEX = /^\d{7}$/
export const FIATA_REGEX = /^[A-Za-z0-9]{4,12}$/

export function validateIataFiata(code: string): boolean {
  const c = code.trim()
  return IATA_REGEX.test(c) || FIATA_REGEX.test(c)
}
