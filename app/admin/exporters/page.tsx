'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import TopBar from '@/components/dashboard/TopBar'
import { ExporterStatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { Exporter } from '@/types'
import { CheckCircle, XCircle, Loader2, Filter } from 'lucide-react'

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminExportersPage() {
  const supabase = createClient()
  const [exporters, setExporters] = useState<Exporter[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [rejectNote, setRejectNote] = useState<{ id: string; note: string } | null>(null)
  const [selectedExporter, setSelectedExporter] = useState<Exporter | null>(null)

  useEffect(() => {
    loadExporters()
  }, [filter])

  const loadExporters = async () => {
    setLoading(true)
    let query = supabase.from('exporters').select('*').order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query
    setExporters((data || []) as Exporter[])
    setLoading(false)
  }

  const handleApprove = async (exporterId: string) => {
    setActionLoading(exporterId)
    setActionError('')
    try {
      const response = await fetch(`/api/admin/exporters/${exporterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })
      if (response.ok) {
        loadExporters()
        setSelectedExporter(null)
      } else {
        const result = await response.json()
        setActionError(result.error || 'Failed to approve exporter')
      }
    } catch {
      setActionError('Network error. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (exporterId: string, note?: string) => {
    setActionLoading(exporterId)
    setActionError('')
    try {
      const response = await fetch(`/api/admin/exporters/${exporterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', note }),
      })
      if (response.ok) {
        loadExporters()
        setRejectNote(null)
        setSelectedExporter(null)
      } else {
        const result = await response.json()
        setActionError(result.error || 'Failed to reject exporter')
      }
    } catch {
      setActionError('Network error. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const filters: { label: string; value: FilterStatus }[] = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'All', value: 'all' },
  ]

  return (
    <div>
      <TopBar title="Exporters" subtitle="Manage exporter registrations and approvals" />

      <div className="p-8">
        {actionError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center justify-between">
            <span>{actionError}</span>
            <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-600 ml-3 font-bold">×</button>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-[#02284d] text-[#FBE115]'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#02284d]/30'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-[#02284d]" />
            </div>
          ) : exporters.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No {filter === 'all' ? '' : filter} exporters found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Company', 'Contact', 'Category', 'Destination', 'Status', 'Submitted', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {exporters.map((exp) => (
                    <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div>
                          <p className="font-medium text-gray-900">{exp.company_name}</p>
                          <p className="text-xs text-gray-400">{exp.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-gray-600">{exp.contact_person}</td>
                      <td className="px-6 py-3.5">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                          {exp.export_category}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">{exp.primary_export_destination}</td>
                      <td className="px-6 py-3.5">
                        <ExporterStatusBadge status={exp.status} />
                      </td>
                      <td className="px-6 py-3.5 text-xs text-gray-400">{formatDate(exp.created_at)}</td>
                      <td className="px-6 py-3.5">
                        {exp.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(exp.id)}
                              disabled={actionLoading === exp.id}
                              className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === exp.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectNote({ id: exp.id, note: '' })}
                              disabled={actionLoading === exp.id}
                              className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </button>
                            <button
                              onClick={() => setSelectedExporter(exp)}
                              className="text-xs text-gray-500 hover:text-gray-900 underline"
                            >
                              Details
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reject modal */}
      {rejectNote && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Reject Exporter</h3>
            <p className="text-sm text-gray-600 mb-4">
              Optionally provide a reason for rejection. This will be included in the email to the exporter.
            </p>
            <textarea
              value={rejectNote.note}
              onChange={(e) => setRejectNote({ ...rejectNote, note: e.target.value })}
              placeholder="e.g. Incomplete documentation provided..."
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#02284d] resize-none h-24"
            />
            <div className="flex gap-3 mt-4">
              <Button
                variant="danger"
                onClick={() => handleReject(rejectNote.id, rejectNote.note)}
                loading={actionLoading === rejectNote.id}
              >
                Confirm Rejection
              </Button>
              <Button variant="outline" onClick={() => setRejectNote(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedExporter && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">{selectedExporter.company_name}</h3>
              <button onClick={() => setSelectedExporter(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Contact', value: selectedExporter.contact_person },
                { label: 'Email', value: selectedExporter.email },
                { label: 'Phone', value: selectedExporter.phone },
                { label: 'Category', value: selectedExporter.export_category },
                { label: 'Destination', value: selectedExporter.primary_export_destination },
                { label: 'Reg. Number', value: selectedExporter.business_registration_number },
                { label: 'License', value: selectedExporter.export_license_number },
                { label: 'Applied', value: formatDate(selectedExporter.created_at) },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs text-gray-400 uppercase tracking-wide">{item.label}</dt>
                  <dd className="font-medium text-gray-900 mt-0.5">{item.value}</dd>
                </div>
              ))}
            </div>
            {selectedExporter.status === 'pending' && (
              <div className="flex gap-3 mt-6">
                <Button onClick={() => handleApprove(selectedExporter.id)} loading={actionLoading === selectedExporter.id}>
                  Approve
                </Button>
                <Button variant="danger" onClick={() => { setSelectedExporter(null); setRejectNote({ id: selectedExporter.id, note: '' }) }}>
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
