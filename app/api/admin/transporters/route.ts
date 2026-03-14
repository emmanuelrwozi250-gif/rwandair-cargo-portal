export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const supabaseAdmin = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: userData } = await supabaseAdmin.from('users').select('role').eq('id', user.id).single()
    if (userData?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await supabaseAdmin
      .from('transporters')
      .select('*')
      .order('company_name')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ transporters: data || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const supabaseAdmin = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: userData } = await supabaseAdmin.from('users').select('role').eq('id', user.id).single()
    if (userData?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const {
      company_name,
      contact_person,
      phone,
      email,
      city,
      country,
      vehicle_types,
      max_weight_kg,
      admin_notes,
    } = body

    const { data, error } = await supabaseAdmin
      .from('transporters')
      .insert({
        company_name,
        contact_person,
        phone,
        email: email || null,
        city,
        country,
        vehicle_types: vehicle_types || null,
        max_weight_kg: max_weight_kg ? parseFloat(max_weight_kg) : null,
        admin_notes: admin_notes || null,
        is_active: true,
        rating: 0,
        total_pickups: 0,
        on_time_rate: 0,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true, transporter: data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
