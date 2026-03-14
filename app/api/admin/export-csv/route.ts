export const dynamic = "force-dynamic"
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

    const { data: shipments } = await supabaseAdmin
      .from('shipments')
      .select('*, exporters(company_name)')
      .order('created_at', { ascending: false })

    if (!shipments) return NextResponse.json({ error: 'No data' }, { status: 404 })

    const headers = [
      'Shipment ID',
      'Exporter Company',
      'Product',
      'Weight (kg)',
      'Invoice Value (USD)',
      'Destination Country',
      'Destination Airport',
      'Incoterm',
      'Status',
      'Preferred Departure',
      'Created Date',
      // Water freight fields
      'Transport Mode',
      'Water Type',
      'Port of Loading',
      'Port of Discharge',
      'Lake Name',
      'Vessel Name',
      'Voyage Number',
      'Vessel Operator',
      'Container Type',
      'Container Number',
      'Bill of Lading Number',
      'Port Cutoff Date',
    ]

    const rows = shipments.map((s) => [
      s.shipment_id,
      (s.exporters as { company_name: string })?.company_name || '',
      s.product_type,
      s.weight_kg,
      s.invoice_value_usd,
      s.destination_country,
      s.destination_airport || '',
      s.incoterm,
      s.status,
      s.preferred_departure_date,
      new Date(s.created_at).toISOString().split('T')[0],
      // Water freight fields
      s.transport_mode || 'air',
      s.water_type || '',
      s.port_of_loading || '',
      s.port_of_discharge || '',
      s.lake_name || '',
      s.vessel_name || '',
      s.voyage_number || '',
      s.vessel_operator || '',
      s.container_type || '',
      s.container_number || '',
      s.bill_of_lading_number || '',
      s.port_cutoff_date || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="altitude-shipments-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
