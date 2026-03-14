export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  try {
    const supabaseAdmin = getAdminClient()
    const url = new URL(request.url)
    const portType = url.searchParams.get('type') // 'lake', 'ocean', 'coastal', or null for all
    const lakeOrSea = url.searchParams.get('lake') // e.g. 'Lake Victoria'

    let query = supabaseAdmin.from('water_ports').select('*').eq('is_active', true)

    if (portType) query = query.eq('port_type', portType)
    if (lakeOrSea) query = query.eq('lake_or_sea', lakeOrSea)

    const { data, error } = await query.order('country').order('port_name')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ports: data || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
