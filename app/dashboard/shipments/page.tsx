export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/supabase-admin'
import TopBar from '@/components/dashboard/TopBar'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Shipment } from '@/types'
import { Package } from 'lucide-react'

export default async function ShipmentsPage() {
  const supabaseAdmin = getAdminClient()
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: exporter } = await supabaseAdmin
    .from('exporters')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!exporter) redirect('/login')

  const { data: shipments } = await supabaseAdmin
    .from('shipments')
    .select('*')
    .eq('exporter_id', exporter.id)
    .order('created_at', { ascending: false })

  const allShipments = (shipments || []) as Shipment[]

  return (
    <div>
      <TopBar
        title="My Shipments"
        subtitle={`${allShipments.length} shipment${allShipments.length !== 1 ? 's' : ''}`}
        actions={
          <Link
            href="/dashboard/shipments/new"
            className="bg-[#02284d] text-[#FBE115] px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#01193a] transition-colors"
          >
            + New Shipment
          </Link>
        }
      />

      <div className="p-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {allShipments.length === 0 ? (
            <div className="py-16 text-center">
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm font-medium">No shipments yet</p>
              <Link
                href="/dashboard/shipments/new"
                className="mt-4 inline-flex bg-[#02284d] text-[#FBE115] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#01193a] transition-colors"
              >
                Create your first shipment
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Shipment ID', 'Product', 'Destination', 'Weight', 'Value', 'Status', 'Departure', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-xs font-medium text-gray-900">
                        {shipment.shipment_id}
                      </td>
                      <td className="px-6 py-3.5 text-gray-700">{shipment.product_type}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">{shipment.destination_country}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">
                        {Number(shipment.weight_kg).toLocaleString()} kg
                      </td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">
                        ${Number(shipment.invoice_value_usd).toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={shipment.status} />
                      </td>
                      <td className="px-6 py-3.5 text-gray-400 text-xs">
                        {formatDate(shipment.preferred_departure_date)}
                      </td>
                      <td className="px-6 py-3.5">
                        <Link
                          href={`/dashboard/shipments/${shipment.id}`}
                          className="text-xs font-medium text-[#02284d] hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
