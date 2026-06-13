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

// Re-export the pure constants/validators (defined in a server-free module so
// client components can import them without pulling in next/headers).
export { VOLUME_TIERS, PRODUCT_TYPES, IATA_REGEX, FIATA_REGEX, validateIataFiata } from './portal-constants'
