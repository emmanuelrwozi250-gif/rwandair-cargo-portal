export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  sendBookingRequestedEmail,
  sendSpaceConfirmedEmail,
  sendInTransitEmail,
  sendDeliveredEmail,
  sendWaterBookingRequestedEmail,
  sendVesselSpaceConfirmedEmail,
  sendPortInEmail,
  sendVesselDepartedEmail,
  sendPortOfDischargeEmail,
} from '@/lib/email'
import { ShipmentStatus } from '@/types'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createServerSupabaseClient()
    const supabaseAdmin = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: userData } = await supabaseAdmin.from('users').select('role').eq('id', user.id).single()
    const role = userData?.role

    const { new_status, note } = await request.json()

    // Get current shipment with exporter info
    const { data: shipment, error: shipmentError } = await supabaseAdmin
      .from('shipments')
      .select('*, exporters(user_id, email, company_name)')
      .eq('id', id)
      .single()

    if (shipmentError || !shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }

    // Exporter can only move to "Booking Requested" from allowed statuses
    if (role === 'exporter') {
      const exporterUserId = (shipment.exporters as { user_id: string } | null)?.user_id
      if (exporterUserId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      if (new_status !== 'Booking Requested') {
        return NextResponse.json({ error: 'Exporters can only request bookings' }, { status: 403 })
      }
    }

    const previousStatus = shipment.status

    // Update status
    const { error: updateError } = await supabaseAdmin
      .from('shipments')
      .update({ status: new_status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })

    // Log the change
    await supabaseAdmin.from('status_logs').insert({
      shipment_id: id,
      previous_status: previousStatus,
      new_status,
      changed_by: user.id,
      note: note || null,
    })

    const updatedShipment = { ...shipment, status: new_status as ShipmentStatus }
    const exporterEmail = (shipment.exporters as { email: string } | null)?.email || ''
    const exporterCompany = (shipment.exporters as { company_name: string } | null)?.company_name || ''
    const isWater = shipment.transport_mode === 'water'

    // Send notifications (non-blocking)
    try {
      if (new_status === 'Booking Requested') {
        if (isWater) {
          await sendWaterBookingRequestedEmail(updatedShipment, exporterCompany, exporterEmail)
        } else {
          await sendBookingRequestedEmail(updatedShipment)
        }
      } else if (new_status === 'Space Confirmed') {
        if (isWater) {
          await sendVesselSpaceConfirmedEmail(updatedShipment, exporterEmail)
        } else {
          await sendSpaceConfirmedEmail(updatedShipment, exporterEmail)
        }
      } else if (new_status === 'In Transit') {
        await sendInTransitEmail(updatedShipment, exporterEmail)
      } else if (new_status === 'Delivered') {
        await sendDeliveredEmail(updatedShipment, exporterEmail)
      } else if (new_status === 'Port In') {
        await sendPortInEmail(updatedShipment, exporterEmail)
      } else if (new_status === 'Vessel Departed') {
        await sendVesselDepartedEmail(updatedShipment, exporterEmail)
      } else if (new_status === 'Port of Discharge') {
        await sendPortOfDischargeEmail(updatedShipment, exporterEmail)
      }
    } catch (emailErr) {
      console.error('Email notification error:', emailErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Status update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
