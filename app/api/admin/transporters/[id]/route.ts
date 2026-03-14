export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createServerSupabaseClient()
    const supabaseAdmin = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: userData } = await supabaseAdmin.from('users').select('role').eq('id', user.id).single()
    if (userData?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()

    // Allow updating any field including is_active for deactivation
    const allowedFields = [
      'company_name',
      'contact_person',
      'phone',
      'email',
      'city',
      'country',
      'vehicle_types',
      'max_weight_kg',
      'is_active',
      'admin_notes',
      'rating',
      'total_pickups',
      'on_time_rate',
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('transporters')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true, transporter: data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
