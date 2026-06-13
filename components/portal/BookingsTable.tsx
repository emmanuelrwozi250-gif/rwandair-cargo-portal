'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Download, FileText, Pencil, XCircle } from 'lucide-react'
import { generateBookingConfirmationPdf } from '@/lib/portal-pdf'
import { PRODUCT_TYPES } from '@/lib/portal-constants'
import type { AgentBooking } from '@/types'

const HOUR = 3600_000
const STATUSES = ['Booking Requested', 'Space Confirmed', 'In Transit', 'Delivered', 'Cancelled']

export default function BookingsTable({ bookings, companyName }: { bookings: AgentBooking[]; companyName: string }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [route, setRoute] = useState('')
  const [product, setProduct] = useState('')
  const [status, setStatus] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null)

  const filtered = useMemo(() => bookings.filter(b => {
    if (from && (!b.departure_at || b.departure_at < from)) return false
    if (to && (!b.departure_at || b.departure_at > `${to}T23:59:59Z`)) return false
    if (route && !b.route.toLowerCase().includes(route.toLowerCase())) return false
    if (product && b.product_type !== product) return false
    if (status && b.status !== status) return false
    return true
  }), [bookings, from, to, route, product, status])

  function hoursTo(b: AgentBooking) {
    return b.departure_at ? (new Date(b.departure_at).getTime() - Date.now()) / HOUR : Infinity
  }

  async function act(b: AgentBooking, action: 'amend' | 'cancel', body?: Record<string, unknown>) {
    setBusyId(b.id); setMsg(null)
    try {
      const res = await fetch(`/api/portal/bookings/${b.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d?.error || 'Action failed')
      setMsg({ id: b.id, text: action === 'cancel' ? 'Booking cancelled' : 'Booking amended', ok: true })
      router.refresh()
    } catch (err) {
      setMsg({ id: b.id, text: err instanceof Error ? err.message : 'Failed', ok: false })
    } finally { setBusyId(null) }
  }

  const inputStyle = { border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)' } as const

  return (
    <div>
      {/* Filters */}
      <div className="rounded-2xl p-4 mb-5 flex flex-wrap items-end gap-3" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
        <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--wb-gray-500)' }}>From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} /></div>
        <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--wb-gray-500)' }}>To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} /></div>
        <div className="flex-1 min-w-[140px]"><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--wb-gray-500)' }}>Route</label>
          <input type="text" value={route} onChange={e => setRoute(e.target.value)} placeholder="e.g. KGL → LHR" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} /></div>
        <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--wb-gray-500)' }}>Product</label>
          <select value={product} onChange={e => setProduct(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
            <option value="">All</option>{PRODUCT_TYPES.map(p => <option key={p}>{p}</option>)}</select></div>
        <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--wb-gray-500)' }}>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
            <option value="">All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
        {filtered.length === 0 ? (
          <p className="p-10 text-center text-sm" style={{ color: 'var(--wb-gray-500)' }}>
            {bookings.length === 0 ? 'No bookings yet.' : 'No bookings match these filters.'}
          </p>
        ) : (
          <ul>
            {filtered.map(b => {
              const open = expanded === b.id
              const h = hoursTo(b)
              const canAmend = h >= 48 && b.status !== 'Cancelled' && b.status !== 'Delivered'
              const canCancel = h >= 72 && b.status !== 'Cancelled' && b.status !== 'Delivered'
              return (
                <li key={b.id} style={{ borderTop: '1px solid var(--wb-gray-200)' }}>
                  <button onClick={() => setExpanded(open ? null : b.id)} aria-expanded={open}
                          className="w-full flex items-center gap-4 px-5 py-3.5 text-left text-sm">
                    <span className="font-mono font-bold w-20 shrink-0" style={{ color: 'var(--wb-blue)' }}>{b.flight_number ?? '—'}</span>
                    <span className="flex-1" style={{ color: 'var(--wb-gray-900)' }}>{b.route}</span>
                    <span className="hidden sm:block w-24" style={{ color: 'var(--wb-gray-500)' }}>
                      {b.departure_at ? new Date(b.departure_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--wb-gray-50)', color: 'var(--wb-blue)' }}>{b.status}</span>
                    <ChevronDown className="w-4 h-4 shrink-0 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none', color: 'var(--wb-gray-500)' }} aria-hidden="true" />
                  </button>

                  {open && (
                    <div className="px-5 pb-5" style={{ background: 'var(--wb-gray-50)' }}>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-sm">
                        <div><p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>Product</p><p style={{ color: 'var(--wb-blue)' }}>{b.product_type}</p></div>
                        <div><p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>Pieces</p><p style={{ color: 'var(--wb-blue)' }}>{b.pieces ?? '—'}</p></div>
                        <div><p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>Weight</p><p style={{ color: 'var(--wb-blue)' }}>{b.weight_kg ? `${b.weight_kg} kg` : '—'}</p></div>
                        <div><p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>AWB</p><p className="font-mono" style={{ color: 'var(--wb-blue)' }}>{b.awb_number ?? 'Not issued'}</p></div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => generateBookingConfirmationPdf(b, companyName)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'white', border: '1px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }}>
                          <Download className="w-3.5 h-3.5" aria-hidden="true" /> Confirmation PDF
                        </button>
                        {b.awb_number && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'white', border: '1px solid var(--wb-gray-200)', color: 'var(--wb-gray-500)' }}>
                            <FileText className="w-3.5 h-3.5" aria-hidden="true" /> AWB {b.awb_number}
                          </span>
                        )}
                        <button disabled={!canAmend || busyId === b.id}
                                onClick={() => {
                                  const pieces = Number(prompt('New piece count?', String(b.pieces ?? '')) ?? '')
                                  if (pieces > 0) act(b, 'amend', { pieces })
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40"
                                style={{ background: 'var(--wb-sky-light)', color: 'var(--wb-sky)' }}
                                title={canAmend ? 'Amend' : 'Amendments close 48h before departure'}>
                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" /> Amend
                        </button>
                        <button disabled={!canCancel || busyId === b.id}
                                onClick={() => { if (confirm('Cancel this booking?')) act(b, 'cancel') }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40"
                                style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}
                                title={canCancel ? 'Cancel' : 'Cancellation closes 72h before departure'}>
                          <XCircle className="w-3.5 h-3.5" aria-hidden="true" /> Cancel
                        </button>
                      </div>
                      {msg?.id === b.id && (
                        <p className="text-xs mt-2" style={{ color: msg.ok ? '#4a7c20' : '#dc2626' }}>{msg.text}</p>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
