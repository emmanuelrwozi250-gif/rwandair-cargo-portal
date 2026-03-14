export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createServerSupabaseClient()
    const supabaseAdmin = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get the exporter profile and verify ownership
    const { data: exporter } = await supabaseAdmin
      .from('exporters')
      .select('id, status')
      .eq('user_id', user.id)
      .single()

    if (!exporter || exporter.status !== 'approved') {
      return NextResponse.json({ error: 'Exporter account not approved' }, { status: 403 })
    }

    // Verify shipment belongs to this exporter and is still in Draft
    const { data: existing } = await supabaseAdmin
      .from('shipments')
      .select('id, status, exporter_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }

    if (existing.exporter_id !== exporter.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (existing.status !== 'Draft') {
      return NextResponse.json(
        { error: 'Shipment can only be edited in Draft status' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      product_type,
      quantity,
      weight_kg,
      destination_country,
      destination_airport,
      preferred_departure_date,
      buyer_name,
      invoice_value_usd,
      incoterm,
    } = body

    const { data: shipment, error } = await supabaseAdmin
      .from('shipments')
      .update({
        product_type,
        quantity: parseInt(quantity),
        weight_kg: parseFloat(weight_kg),
        destination_country,
        destination_airport,
        preferred_departure_date,
        buyer_name,
        invoice_value_usd: parseFloat(invoice_value_usd),
        incoterm,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true, shipment })
  } catch (err) {
    console.error('Shipment update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
