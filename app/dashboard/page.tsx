export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/supabase-admin'
import TopBar from '@/components/dashboard/TopBar'
import MetricCard from '@/components/ui/MetricCard'
import { StatusBadge } from '@/components/ui/Badge'
import { PickupStatusBadge } from '@/components/ui/Badge'
import { formatDate, formatCurrency, formatWeight } from '@/lib/utils'
import { Package, TrendingUp, DollarSign, Activity, CheckCircle, Clock, Truck } from 'lucide-react'
import { Shipment } from '@/types'

export default async function DashboardPage() {
  const supabaseAdmin = getAdminClient()
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: exporter } = await supabaseAdmin
    .from('exporters')
    .select('id, company_name')
    .eq('user_id', user.id)
    .single()

  if (!exporter) redirect('/login')

  const { data: shipments } = await supabaseAdmin
    .from('shipments')
    .select('*')
    .eq('exporter_id', exporter.id)
    .order('created_at', { ascending: false })

  const { data: pickups } = await supabaseAdmin
    .from('pickup_requests')
    .select('*, shipments(shipment_id)')
    .eq('exporter_id', exporter.id)
    .order('created_at', { ascending: false })

  const allShipments = (shipments || []) as Shipment[]
  const allPickups = pickups || []

  const totalWeight = allShipments.reduce((sum, s) => sum + Number(s.weight_kg), 0)
  const totalValue = allShipments.reduce((sum, s) => sum + Number(s.invoice_value_usd), 0)
  const activeShipments = allShipments.filter(
    (s) => !['Delivered', 'Closed'].includes(s.status)
  ).length
  const completedShipments = allShipments.filter((s) =>
    ['Delivered', 'Closed'].includes(s.status)
  ).length
  const onTimeRate = completedShipments > 0 ? Math.round((completedShipments / allShipments.length) * 100) : 0

  const activePickups = allPickups.filter(
    (p) => !['Delivered to Terminal', 'Cancelled'].includes(p.status)
  ).length
  const completedPickups = allPickups.filter((p) => p.status === 'Delivered to Terminal').length

  return (
    <div>
      <TopBar
        title={`Welcome, ${exporter.company_name}`}
        subtitle="Manage your export shipments"
        actions={
          <Link
            href="/dashboard/shipments/new"
            className="bg-[#02284d] text-[#E4DC1F] px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#01193a] transition-colors inline-flex items-center gap-2"
          >
            <span>+</span> New Shipment
          </Link>
        }
      />

      <div className="p-8 space-y-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <MetricCard
            label="Total Shipments"
            value={allShipments.length}
            icon={Package}
          />
          <MetricCard
            label="Total Weight"
            value={formatWeight(totalWeight)}
            icon={TrendingUp}
          />
          <MetricCard
            label="Export Value"
            value={formatCurrency(totalValue)}
            icon={DollarSign}
          />
          <MetricCard
            label="Active"
            value={activeShipments}
            icon={Activity}
          />
          <MetricCard
            label="Completed"
            value={completedShipments}
            icon={CheckCircle}
          />
          <MetricCard
            label="On-Time %"
            value={`${onTimeRate}%`}
            icon={Clock}
            accent={onTimeRate >= 90}
          />
          <MetricCard
            label="Active Pickups"
            value={activePickups}
            icon={Truck}
            accent={activePickups > 0}
          />
          <MetricCard
            label="Pickups Done"
            value={completedPickups}
            icon={Truck}
          />
        </div>

        {/* Shipments Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">My Shipments</h2>
            <Link
              href="/dashboard/shipments/new"
              className="text-sm text-[#02284d] font-medium hover:underline"
            >
              + New Shipment
            </Link>
          </div>

          {allShipments.length === 0 ? (
            <div className="py-16 text-center">
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm font-medium">No shipments yet</p>
              <p className="text-gray-400 text-xs mt-1">Create your first shipment to get started</p>
              <Link
                href="/dashboard/shipments/new"
                className="mt-4 inline-flex items-center gap-2 bg-[#02284d] text-[#E4DC1F] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#01193a] transition-colors"
              >
                Create Shipment
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Shipment ID
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Product
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Mode
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Destination
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Departure
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-xs font-medium text-gray-900">
                        {shipment.shipment_id}
                      </td>
                      <td className="px-6 py-3.5 text-gray-700">{shipment.product_type}</td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm">{shipment.transport_mode === 'water' ? '🚢' : '✈️'}</span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-600">
                        {shipment.destination_country}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={shipment.status} />
                      </td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">
                        {formatDate(shipment.preferred_departure_date)}
                      </td>
                      <td className="px-6 py-3.5 text-right">
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

        {/* Pickups Table */}
        {allPickups.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Cargo Pickups</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pickup ID</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Shipment</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pickup Address</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Terminal</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allPickups.map((pickup) => {
                    const shipmentId = (pickup.shipments as { shipment_id?: string } | null)?.shipment_id
                    return (
                      <tr key={pickup.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3.5 font-mono text-xs font-medium text-gray-900">
                          {pickup.pickup_id}
                        </td>
                        <td className="px-6 py-3.5 font-mono text-xs text-gray-600">
                          {shipmentId || '—'}
                        </td>
                        <td className="px-6 py-3.5 text-xs text-gray-600">
                          {pickup.pickup_city}, {pickup.pickup_country}
                        </td>
                        <td className="px-6 py-3.5 text-xs text-gray-500 max-w-[140px] truncate">
                          {pickup.destination_terminal}
                        </td>
                        <td className="px-6 py-3.5 text-xs text-gray-500">
                          {formatDate(pickup.required_pickup_date)}
                        </td>
                        <td className="px-6 py-3.5">
                          <PickupStatusBadge status={pickup.status} />
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Link
                            href={`/dashboard/shipments/${pickup.shipment_id}`}
                            className="text-xs font-medium text-[#02284d] hover:underline"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
