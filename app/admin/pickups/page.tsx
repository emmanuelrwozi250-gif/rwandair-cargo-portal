'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import TopBar from '@/components/dashboard/TopBar'
import { PickupStatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { PickupRequest, Transporter } from '@/types'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

const FILTER_TABS = [
  'All',
  'Requested',
  'Transporter Assigned',
  'En Route to Pickup',
  'Cargo Collected',
  'En Route to Terminal',
  'Delivered to Terminal',
  'Cancelled',
]

export default function AdminPickupsPage() {
  const supabase = createClient()
  const [pickups, setPickups] = useState<(PickupRequest & { exporters?: { company_name: string }; shipments?: { shipment_id: string } })[]>([])
  const [transporters, setTransporters] = useState<Transporter[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('All')
  const [actionModal, setActionModal] = useState<{
    pickup: PickupRequest
    action: 'assign_transporter' | 'update_status'
    transporterId: string
    estimatedTime: string
    newStatus: string
    note: string
  } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    loadPickups()
    loadTransporters()
  }, [filterStatus])

  const loadPickups = async () => {
    setLoading(true)
    let query = supabase
      .from('pickup_requests')
      .select('*, exporters(company_name), shipments(shipment_id), transporter:transporters(company_name, phone)')
      .order('created_at', { ascending: false })

    if (filterStatus !== 'All') {
      query = query.eq('status', filterStatus)
    }

    const { data } = await query
    setPickups((data || []) as typeof pickups)
    setLoading(false)
  }

  const loadTransporters = async () => {
    const res = await fetch('/api/admin/transporters')
    if (res.ok) {
      const data = await res.json()
      setTransporters(data.transporters || [])
    }
  }

  const openAssignModal = (pickup: PickupRequest) => {
    setModalError('')
    setActionModal({
      pickup,
      action: 'assign_transporter',
      transporterId: '',
      estimatedTime: '',
      newStatus: '',
      note: '',
    })
  }

  const openStatusModal = (pickup: PickupRequest) => {
    setModalError('')
    setActionModal({
      pickup,
      action: 'update_status',
      transporterId: '',
      estimatedTime: '',
      newStatus: pickup.status,
      note: '',
    })
  }

  const handleAction = async () => {
    if (!actionModal) return
    setActionLoading(true)
    setModalError('')

    try {
      const body: Record<string, unknown> = { action: actionModal.action }
      if (actionModal.action === 'assign_transporter') {
        body.transporter_id = actionModal.transporterId
        if (actionModal.estimatedTime) body.estimated_pickup_time = actionModal.estimatedTime
      } else {
        body.new_status = actionModal.newStatus
      }
      if (actionModal.note) body.admin_note = actionModal.note

      const res = await fetch(`/api/admin/pickups/${actionModal.pickup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        loadPickups()
        setActionModal(null)
      } else {
        const data = await res.json()
        setModalError(data.error || 'Action failed')
      }
    } catch {
      setModalError('Network error')
    } finally {
      setActionLoading(false)
    }
  }

  const remainingStatuses = [
    'Transporter Assigned',
    'En Route to Pickup',
    'Cargo Collected',
    'En Route to Terminal',
    'Delivered to Terminal',
    'Cancelled',
  ]

  return (
    <div>
      <TopBar title="Cargo Pickups" subtitle="Manage last-mile cargo pickup requests" />

      <div className="p-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === tab
                  ? 'bg-[#02284d] text-[#E4DC1F]'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#02284d]/30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-[#02284d]" />
            </div>
          ) : pickups.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No pickup requests found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Pickup ID', 'Shipment', 'Exporter', 'Pickup City', 'Terminal', 'Required Date', 'Weight', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pickups.map((pickup) => {
                    const shipmentId = (pickup.shipments as { shipment_id?: string } | null)?.shipment_id
                    return (
                      <tr key={pickup.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-medium text-gray-900 whitespace-nowrap">
                          {pickup.pickup_id}
                        </td>
                        <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                          {shipmentId ? (
                            <Link href={`/admin/shipments?id=${pickup.shipment_id}`} className="text-[#02284d] hover:underline font-mono">
                              {shipmentId}
                            </Link>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-700 whitespace-nowrap">
                          {(pickup.exporters as { company_name?: string } | null)?.company_name || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                          {pickup.pickup_city}, {pickup.pickup_country}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-500 max-w-[140px] truncate">
                          {pickup.destination_terminal}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(pickup.required_pickup_date)}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                          {pickup.total_weight_kg ? `${Number(pickup.total_weight_kg).toLocaleString()} kg` : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <PickupStatusBadge status={pickup.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-2">
                            {pickup.status === 'Requested' && (
                              <button
                                onClick={() => openAssignModal(pickup)}
                                className="text-xs font-medium text-[#02284d] hover:underline whitespace-nowrap"
                              >
                                Assign
                              </button>
                            )}
                            <button
                              onClick={() => openStatusModal(pickup)}
                              className="text-xs font-medium text-gray-500 hover:underline whitespace-nowrap"
                            >
                              Update
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {actionModal.action === 'assign_transporter' ? 'Assign Transporter' : 'Update Pickup Status'}
            </h3>
            <p className="text-xs text-gray-500 mb-4 font-mono">{actionModal.pickup.pickup_id}</p>

            <div className="space-y-4">
              {actionModal.action === 'assign_transporter' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Transporter</label>
                    <select
                      value={actionModal.transporterId}
                      onChange={(e) => setActionModal({ ...actionModal, transporterId: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#02284d]"
                      required
                    >
                      <option value="">Select transporter...</option>
                      {transporters.filter((t) => t.is_active).map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.company_name} · {t.city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Estimated Pickup Time (optional)</label>
                    <input
                      type="text"
                      value={actionModal.estimatedTime}
                      onChange={(e) => setActionModal({ ...actionModal, estimatedTime: e.target.value })}
                      placeholder="e.g. Tomorrow 09:00 AM"
                      className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#02284d]"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Status</label>
                  <select
                    value={actionModal.newStatus}
                    onChange={(e) => setActionModal({ ...actionModal, newStatus: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#02284d]"
                  >
                    {remainingStatuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
                <textarea
                  value={actionModal.note}
                  onChange={(e) => setActionModal({ ...actionModal, note: e.target.value })}
                  placeholder="Internal note..."
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#02284d] resize-none h-16"
                />
              </div>
            </div>

            {modalError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {modalError}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <Button onClick={handleAction} loading={actionLoading}>
                {actionModal.action === 'assign_transporter' ? 'Assign Transporter' : 'Update Status'}
              </Button>
              <Button variant="outline" onClick={() => { setActionModal(null); setModalError('') }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
