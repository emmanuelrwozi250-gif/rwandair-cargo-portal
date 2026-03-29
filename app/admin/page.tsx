export const dynamic = 'force-dynamic'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TopBar from '@/components/dashboard/TopBar'
import MetricCard from '@/components/ui/MetricCard'
import { StatusBadge, ExporterStatusBadge } from '@/components/ui/Badge'
import { formatDate, formatCurrency, formatWeight } from '@/lib/utils'
import { Users, Package, TrendingUp, DollarSign, Clock, AlertCircle, Waves, Truck } from 'lucide-react'

export default async function AdminDashboard() {
  const supabaseAdmin = getAdminClient()
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const [
    { count: totalExporters },
    { count: pendingApprovals },
    { data: shipmentsThisMonth },
    { data: bookingRequests },
    { data: recentExporters },
    { data: waterShipmentsThisMonth },
    { count: pickupsThisMonth },
    { count: pickupsDeliveredThisMonth },
  ] = await Promise.all([
    supabaseAdmin.from('exporters').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('exporters').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin
      .from('shipments')
      .select('weight_kg, invoice_value_usd, transport_mode')
      .gte('created_at', thisMonth.toISOString()),
    supabaseAdmin
      .from('shipments')
      .select('*, exporters(company_name)')
      .eq('status', 'Booking Requested')
      .order('created_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('exporters')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('shipments')
      .select('weight_kg')
      .eq('transport_mode', 'water')
      .gte('created_at', thisMonth.toISOString()),
    supabaseAdmin
      .from('pickup_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thisMonth.toISOString()),
    supabaseAdmin
      .from('pickup_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Delivered to Terminal')
      .gte('created_at', thisMonth.toISOString()),
  ])

  const totalVolume = (shipmentsThisMonth || []).reduce((sum, s) => sum + Number(s.weight_kg), 0)
  const totalValue = (shipmentsThisMonth || [])
    .filter((s: { invoice_value_usd?: unknown; weight_kg?: unknown }) => true)
    .reduce((sum, s: { invoice_value_usd?: unknown }) => sum + Number(s.invoice_value_usd || 0), 0)

  const waterVolume = (waterShipmentsThisMonth || []).reduce((sum, s) => sum + Number(s.weight_kg), 0)
  const waterCount = (waterShipmentsThisMonth || []).length

  return (
    <div>
      <TopBar
        title="Admin Dashboard"
        subtitle="RwandAir Cargo platform overview"
        actions={
          <a
            href="/api/admin/export-csv"
            className="bg-[#02284d] text-[#FBE115] px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#01193a] transition-colors"
          >
            Export CSV
          </a>
        }
      />

      <div className="p-8 space-y-8">
        {/* Core Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            label="Total Exporters"
            value={totalExporters || 0}
            icon={Users}
          />
          <MetricCard
            label="Pending Approvals"
            value={pendingApprovals || 0}
            icon={Clock}
            accent={(pendingApprovals || 0) > 0}
          />
          <MetricCard
            label="Shipments (MTD)"
            value={(shipmentsThisMonth || []).length}
            icon={Package}
          />
          <MetricCard
            label="Volume (MTD)"
            value={formatWeight(totalVolume)}
            icon={TrendingUp}
          />
          <MetricCard
            label="Value (MTD)"
            value={formatCurrency(totalValue)}
            icon={DollarSign}
          />
          <MetricCard
            label="Booking Requests"
            value={bookingRequests?.length || 0}
            icon={AlertCircle}
            accent={(bookingRequests?.length || 0) > 0}
          />
        </div>

        {/* Water & Pickup Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Water Shipments (MTD)"
            value={waterCount}
            icon={Waves}
          />
          <MetricCard
            label="Water Volume (MTD)"
            value={formatWeight(waterVolume)}
            icon={Waves}
          />
          <MetricCard
            label="Pickup Requests (MTD)"
            value={pickupsThisMonth || 0}
            icon={Truck}
          />
          <MetricCard
            label="Pickups Delivered (MTD)"
            value={pickupsDeliveredThisMonth || 0}
            icon={Truck}
            accent={(pickupsDeliveredThisMonth || 0) > 0}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Pending Approvals</h2>
              <Link href="/admin/exporters" className="text-sm text-[#02284d] font-medium hover:underline">
                View all →
              </Link>
            </div>
            {(recentExporters || []).length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">No pending approvals</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {(recentExporters || []).map((exp) => (
                  <div key={exp.id} className="px-6 py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{exp.company_name}</p>
                      <p className="text-xs text-gray-500">{exp.export_category} · {exp.primary_export_destination}</p>
                    </div>
                    <Link
                      href="/admin/exporters"
                      className="text-xs font-medium text-[#02284d] hover:underline"
                    >
                      Review →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Requests */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Booking Requests</h2>
              <Link href="/admin/shipments" className="text-sm text-[#02284d] font-medium hover:underline">
                View all →
              </Link>
            </div>
            {(bookingRequests || []).length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">No pending booking requests</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {(bookingRequests || []).map((shipment) => (
                  <div key={shipment.id} className="px-6 py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono font-medium text-gray-900">{shipment.shipment_id}</p>
                      <p className="text-xs text-gray-500">
                        {(shipment.exporters as { company_name: string })?.company_name} · {shipment.destination_country}
                        {shipment.transport_mode === 'water' && (
                          <span className="ml-1 text-blue-600">· Water</span>
                        )}
                      </p>
                    </div>
                    <Link
                      href="/admin/shipments"
                      className="text-xs font-medium text-[#02284d] hover:underline"
                    >
                      Review →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
