import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Profile } from '@/types'

// Auth helper for portal API routes. Returns the signed-in profile + account
// id, or a NextResponse error to return directly.
export async function requireApiProfile() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (!profile) return { error: NextResponse.json({ error: 'No profile' }, { status: 403 }) }

  const p = profile as Profile
  return { supabase, profile: p, accountId: p.parent_id ?? p.id, userId: user.id }
}
