'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import TopBar from '@/components/dashboard/TopBar'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDate, formatCurrency, AIR_STATUSES, WATER_STATUSES } from '@/lib/utils'
import { Shipment, ShipmentStatus } from '@/types'
import { Loader2, Download } from 'lucide-react'

type ModeFilter = 'all' | 'air' | 'water'

export default function AdminShipmentsPage() {
  const supabase = createClient()
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterMode, setFilterMode] = useState<ModeFilter>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [statusModal, setStatusModal] = useState<{
    shipment: Shipment
    newStatus: string
    note: string
  } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    setFilterStatus('all')
  }, [filterMode])

  useEffect(() => {
    loadShipments()
  }, [filterStatus, filterMode])

  const loadShipments = async () => {
    setLoading(true)
    let query = supabase
      .from('shipments')
      .select('*, exporters(company_name, email)')
      .order('created_at', { ascending: false })

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus)
    }
    if (filterMode !== 'all') {
      query = query.eq('transport_mode', filterMode)
    }

    const { data } = await query
    setShipments((data || []) as Shipment[])
    setLoading(false)
  }

  const handleStatusUpdate = async () => {
    if (!statusModal) return
    setActionLoading(true)
    setModalError('')

    try {
      const response = await fetch(`/api/shipments/${statusModal.shipment.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_status: statusModal.newStatus,
          note: statusModal.note,
        }),
      })

      if (response.ok) {
        loadShipments()
        setStatusModal(null)
      } else {
        const result = await response.json()
        setModalError(result.error || 'Failed to update status')
      }
    } catch {
      setModalError('Network error. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const getAdminStatusOptions = (shipment: Shipment): ShipmentStatus[] => {
    if (shipment.transport_mode === 'water') {
      return [
        'Documents Pending',
        'Booking Requested',
        'Space Confirmed',
        'Port In',
        'Vessel Departed',
        'Port of Discharge',
        'Delivered',
        'Closed',
      ]
    }
    return [
      'Documents Pending',
      'Booking Requested',
      'Space Confirmed',
      'In Transit',
      'Delivered',
      'Closed',
    ]
  }

  const currentStatusList = filterMode === 'water' ? WATER_STATUSES : filterMode === 'air' ? AIR_STATUSES : [...new Set([...AIR_STATUSES, ...WATER_STATUSES])]

  const isWaterMode = filterMode === 'water'

  return (
    <div>
      <TopBar
        title="All Shipments"
        subtitle="Manage and update shipment statuses"
        actions={
          <a
            href="/api/admin/export-csv"
            className="inline-flex items-center gap-2 bg-[#02284d] text-[#E4DC1F] px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#01193a] transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        }
      />

      <div className="p-8">
        {/* Mode Tabs */}
        <div className="flex gap-2 mb-4">
          {(['all', 'air', 'water'] as ModeFilter[]).map((m) => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filterMode === m
                  ? 'bg-[#02284d] text-[#E4DC1F]'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#02284d]/30'
              }`}
            >
              {m === 'all' ? 'All' : m === 'air' ? '✈️ Air' : '🚢 Water'}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'all' ? 'bg-[#02284d] text-[#E4DC1F]' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#02284d]/30'
            }`}
          >
            All
          </button>
          {currentStatusList.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status ? 'bg-[#02284d] text-[#E4DC1F]' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#02284d]/30'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-[#02284d]" />
            </div>
          ) : shipments.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No shipments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[
                      'Shipment ID',
                      'Exporter',
                      'Product',
                      'Weight',
                      'Value',
                      isWaterMode ? 'Water Type' : 'Mode',
                      isWaterMode ? 'Port of Loading' : 'Destination',
                      isWaterMode ? 'Port of Discharge' : 'Departure',
                      !isWaterMode ? 'Departure' : null,
                      'Status',
                      'Actions',
                    ].filter(Boolean).map((h) => (
                      <th key={h!} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {shipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-medium text-gray-900 whitespace-nowrap">
                        {shipment.shipment_id}
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 text-xs whitespace-nowrap">
                        {(shipment.exporters as { company_name: string })?.company_name}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 max-w-[120px] truncate">{shipment.product_type}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                        {Number(shipment.weight_kg).toLocaleString()} kg
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                        {formatCurrency(Number(shipment.invoice_value_usd))}
                      </td>
                      {isWaterMode ? (
                        <>
                          <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap capitalize">
                            {shipment.water_type?.replace('_', ' ') || '—'}
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                            {shipment.port_of_loading || '—'}
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                            {shipment.port_of_discharge || '—'}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                              shipment.transport_mode === 'water'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-sky-100 text-sky-700'
                            }`}>
                              {shipment.transport_mode === 'water' ? '🚢' : '✈️'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                            {shipment.transport_mode === 'water'
                              ? (shipment.port_of_loading || shipment.destination_country)
                              : shipment.destination_country}
                          </td>
                          <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                            {formatDate(shipment.preferred_departure_date)}
                          </td>
                        </>
                      )}
                      <td className="px-5 py-3.5">
                        <StatusBadge status={shipment.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() =>
                            setStatusModal({
                              shipment,
                              newStatus: shipment.status,
                              note: '',
                            })
                          }
                          className="text-xs font-medium text-[#02284d] hover:underline whitespace-nowrap"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Update Shipment Status</h3>
            <p className="text-xs text-gray-500 mb-1 font-mono">{statusModal.shipment.shipment_id}</p>
            <p className="text-xs text-gray-400 mb-4">
              {statusModal.shipment.transport_mode === 'water' ? '🚢 Water Freight' : '✈️ Air Freight'}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Status</label>
                <select
                  value={statusModal.newStatus}
                  onChange={(e) => setStatusModal({ ...statusModal, newStatus: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#02284d]"
                >
                  {getAdminStatusOptions(statusModal.shipment).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
                <textarea
                  value={statusModal.note}
                  onChange={(e) => setStatusModal({ ...statusModal, note: e.target.value })}
                  placeholder="Internal note about this status change..."
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#02284d] resize-none h-20"
                />
              </div>
            </div>

            {modalError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {modalError}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <Button
                onClick={handleStatusUpdate}
                loading={actionLoading}
                disabled={statusModal.newStatus === statusModal.shipment.status}
              >
                Update Status
              </Button>
              <Button variant="outline" onClick={() => { setStatusModal(null); setModalError('') }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
