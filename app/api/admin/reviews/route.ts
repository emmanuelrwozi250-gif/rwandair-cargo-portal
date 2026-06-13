export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase-server'

async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const supabaseAdmin = getAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const { data: userData } = await supabaseAdmin.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  return { supabaseAdmin }
}

export async function GET() {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) return auth.error

    const { data, error } = await auth.supabaseAdmin
      .from('ratings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ratings: data || [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) return auth.error

    const body = await request.json()
    const { id, is_published, is_flagged } = body
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing rating id' }, { status: 400 })
    }

    const updates: Record<string, boolean> = {}
    if (typeof is_published === 'boolean') updates.is_published = is_published
    if (typeof is_flagged === 'boolean') updates.is_flagged = is_flagged
    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const { data, error } = await auth.supabaseAdmin
      .from('ratings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, rating: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
