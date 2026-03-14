export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  sendTransporterAssignedEmail,
  sendPickupEnRouteEmail,
  sendPickupCargoCollectedEmail,
  sendPickupDeliveredToTerminalEmail,
  sendPickupCancelledEmail,
} from '@/lib/email'
import { Transporter } from '@/types'

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

    const { action, transporter_id, estimated_pickup_time, new_status, admin_note } = await request.json()

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('pickup_requests')
      .select('*, exporter:exporters(email)')
      .eq('id', id)
      .single()

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Pickup not found' }, { status: 404 })
    }

    const exporterEmail = (existing.exporter as { email?: string } | null)?.email || ''

    if (action === 'assign_transporter') {
      if (!transporter_id) {
        return NextResponse.json({ error: 'transporter_id required' }, { status: 400 })
      }

      const { data: transporter } = await supabaseAdmin
        .from('transporters')
        .select('*')
        .eq('id', transporter_id)
        .single()

      if (!transporter) {
        return NextResponse.json({ error: 'Transporter not found' }, { status: 404 })
      }

      const updateData: Record<string, unknown> = {
        transporter_id,
        status: 'Transporter Assigned',
        updated_at: new Date().toISOString(),
      }
      if (estimated_pickup_time) updateData.estimated_pickup_time = estimated_pickup_time
      if (admin_note) updateData.admin_notes = admin_note

      const { data: pickup, error } = await supabaseAdmin
        .from('pickup_requests')
        .update(updateData)
        .eq('id', id)
        .select('*, transporter:transporters(*)')
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      try {
        await sendTransporterAssignedEmail(pickup, transporter as Transporter, exporterEmail)
      } catch (emailErr) {
        console.error('Transporter assigned email error:', emailErr)
      }

      return NextResponse.json({ success: true, pickup })
    }

    if (action === 'update_status') {
      if (!new_status) {
        return NextResponse.json({ error: 'new_status required' }, { status: 400 })
      }

      const updateData: Record<string, unknown> = {
        status: new_status,
        updated_at: new Date().toISOString(),
      }
      if (admin_note) updateData.admin_notes = admin_note
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

      try {
        if (new_status === 'En Route to Pickup') {
          await sendPickupEnRouteEmail(pickup, exporterEmail)
        } else if (new_status === 'Cargo Collected') {
          await sendPickupCargoCollectedEmail(pickup, exporterEmail)
        } else if (new_status === 'Delivered to Terminal') {
          await sendPickupDeliveredToTerminalEmail(pickup, exporterEmail)
        } else if (new_status === 'Cancelled') {
          await sendPickupCancelledEmail(pickup, exporterEmail)
        }
      } catch (emailErr) {
        console.error('Status update email error:', emailErr)
      }

      return NextResponse.json({ success: true, pickup })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Admin pickup action error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
