import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { isAdminAuthed } from '@/lib/agent-admin'

export const runtime = 'nodejs'

// All agency registrations (owner accounts) for the approvals table.
export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ registrations: [] })
  }

  const { data, error } = await getAdminClient()
    .from('profiles')
    .select('id, email, company_name, country, volume_tier, iata_fiata_code, status, created_at')
    .eq('account_role', 'owner')
    .in('status', ['pending', 'approved', 'rejected'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[agent-admin/registrations]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ registrations: data ?? [] })
}
