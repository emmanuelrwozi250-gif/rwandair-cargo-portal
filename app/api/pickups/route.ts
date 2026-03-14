export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { sendPickupRequestedEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const supabaseAdmin = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: exporter } = await supabaseAdmin
      .from('exporters')
      .select('id, status')
      .eq('user_id', user.id)
      .single()

    if (!exporter || exporter.status !== 'approved') {
      return NextResponse.json({ error: 'Exporter account not approved' }, { status: 403 })
    }

    const body = await request.json()
    const {
      shipment_id,
      pickup_address,
      pickup_city,
      pickup_country,
      pickup_contact_name,
      pickup_contact_phone,
      destination_terminal,
      destination_type,
      cargo_description,
      number_of_pieces,
      total_weight_kg,
      required_pickup_date,
      required_pickup_time_by,
      cargo_cutoff_time,
      special_handling_notes,
    } = body

    // Verify shipment belongs to this exporter
    const { data: shipment } = await supabaseAdmin
      .from('shipments')
      .select('id, shipment_id, exporter_id')
      .eq('id', shipment_id)
      .eq('exporter_id', exporter.id)
      .single()

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found or not yours' }, { status: 404 })
    }

    const { data: pickup, error } = await supabaseAdmin
      .from('pickup_requests')
      .insert({
        pickup_id: '',
        shipment_id,
        exporter_id: exporter.id,
        pickup_address,
        pickup_city,
        pickup_country,
        pickup_contact_name,
        pickup_contact_phone,
        destination_terminal,
        destination_type,
        cargo_description: cargo_description || null,
        number_of_pieces: number_of_pieces ? parseInt(number_of_pieces) : null,
        total_weight_kg: total_weight_kg ? parseFloat(total_weight_kg) : null,
        required_pickup_date,
        required_pickup_time_by: required_pickup_time_by || null,
        cargo_cutoff_time: cargo_cutoff_time || null,
        special_handling_notes: special_handling_notes || null,
        status: 'Requested',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Send admin email (non-blocking)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@altitudeafrica.com'
    try {
      await sendPickupRequestedEmail(pickup, shipment.shipment_id, adminEmail)
    } catch (emailErr) {
      console.error('Pickup email error:', emailErr)
    }

    return NextResponse.json({ success: true, pickup })
  } catch (err) {
    console.error('Pickup creation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const supabaseAdmin = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: exporter } = await supabaseAdmin
      .from('exporters')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!exporter) return NextResponse.json({ error: 'Exporter not found' }, { status: 404 })

    const url = new URL(request.url)
    const shipmentId = url.searchParams.get('shipment_id')

    let query = supabaseAdmin
      .from('pickup_requests')
      .select('*, transporter:transporters(*)')
      .eq('exporter_id', exporter.id)
      .order('created_at', { ascending: false })

    if (shipmentId) {
      query = query.eq('shipment_id', shipmentId)
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // If querying by shipment_id return single pickup
    if (shipmentId) {
      return NextResponse.json({ pickup: (data || [])[0] || null })
    }

    return NextResponse.json({ pickups: data || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
