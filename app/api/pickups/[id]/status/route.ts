export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  sendPickupEnRouteEmail,
  sendPickupCargoCollectedEmail,
  sendPickupDeliveredToTerminalEmail,
  sendPickupCancelledEmail,
  sendTransporterAssignedEmail,
} from '@/lib/email'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createServerSupabaseClient()
    const supabaseAdmin = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: userData } = await supabaseAdmin.from('users').select('role').eq('id', user.id).single()
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { new_status, admin_notes } = await request.json()

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('pickup_requests')
      .select('*, transporter:transporters(*), exporter:exporters(user_id, email)')
      .eq('id', id)
      .single()

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Pickup not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {
      status: new_status,
      updated_at: new Date().toISOString(),
    }

    if (admin_notes) updateData.admin_notes = admin_notes
    if (new_status === 'Cargo Collected') {
      updateData.actual_pickup_time = new Date().toISOString()
    }
    if (new_status === 'Delivered to Terminal') {
      updateData.actual_delivery_time = new Date().toISOString()
    }

    const { data: pickup, error } = await supabaseAdmin
      .from('pickup_requests')
      .update(updateData)
      .eq('id', id)
      .select('*, transporter:transporters(*)')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const exporterEmail = (existing.exporter as { email?: string } | null)?.email || ''

    try {
      if (new_status === 'En Route to Pickup') {
        await sendPickupEnRouteEmail(pickup, exporterEmail)
      } else if (new_status === 'Cargo Collected') {
        await sendPickupCargoCollectedEmail(pickup, exporterEmail)
      } else if (new_status === 'Delivered to Terminal') {
        await sendPickupDeliveredToTerminalEmail(pickup, exporterEmail)
      } else if (new_status === 'Cancelled') {
        await sendPickupCancelledEmail(pickup, exporterEmail)
      } else if (new_status === 'Transporter Assigned' && existing.transporter) {
        await sendTransporterAssignedEmail(pickup, existing.transporter as Parameters<typeof sendTransporterAssignedEmail>[1], exporterEmail)
      }
    } catch (emailErr) {
      console.error('Pickup status email error:', emailErr)
    }

    return NextResponse.json({ success: true, pickup })
  } catch (err) {
    console.error('Pickup status update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
