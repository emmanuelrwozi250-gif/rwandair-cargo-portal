'use client'

import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Download } from 'lucide-react'
import { PRODUCT_TYPES } from '@/lib/portal-constants'
import type { AgentBooking } from '@/types'

type Metric = 'shipments' | 'weight' | 'spend'
const METRICS: { key: Metric; label: string }[] = [
  { key: 'shipments', label: 'Shipments' },
  { key: 'weight', label: 'Weight (kg)' },
  { key: 'spend', label: 'Spend (USD)' },
]

export default function ReportsView({ bookings }: { bookings: AgentBooking[] }) {
  const [route, setRoute] = useState('')
  const [product, setProduct] = useState('')
  const [metric, setMetric] = useState<Metric>('shipments')

  const rows = useMemo(() => {
    const filtered = bookings.filter(b =>
      (!route || b.route.toLowerCase().includes(route.toLowerCase())) &&
      (!product || b.product_type === product)
    )
    const byMonth = new Map<string, { shipments: number; weight: number; spend: number }>()
    for (const b of filtered) {
      const d = b.departure_at ?? b.created_at
      const key = d ? d.slice(0, 7) : 'unknown'
      const cur = byMonth.get(key) ?? { shipments: 0, weight: 0, spend: 0 }
      cur.shipments += 1
      cur.weight += Number(b.weight_kg ?? 0)
      cur.spend += Number(b.charges_usd ?? 0)
      byMonth.set(key, cur)
    }
    return [...byMonth.entries()]
      .filter(([k]) => k !== 'unknown')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month, ...v }))
  }, [bookings, route, product])

  function exportCsv() {
    const header = 'Month,Shipments,Weight (kg),Spend (USD)'
    const lines = rows.map(r => `${r.month},${r.shipments},${r.weight},${r.spend}`)
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'rwandair-cargo-report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const inputStyle = { border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)' } as const

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-2xl p-4 flex flex-wrap items-end gap-3" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--wb-gray-500)' }}>Route</label>
          <input type="text" value={route} onChange={e => setRoute(e.target.value)} placeholder="All routes" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--wb-gray-500)' }}>Product</label>
          <select value={product} onChange={e => setProduct(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
            <option value="">All</option>{PRODUCT_TYPES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--wb-gray-500)' }}>Metric</label>
          <select value={metric} onChange={e => setMetric(e.target.value as Metric)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
            {METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>
        <button onClick={exportCsv} disabled={rows.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm disabled:opacity-40"
                style={{ background: 'var(--wb-blue)', color: 'white' }}>
          <Download className="w-4 h-4" aria-hidden="true" /> Export CSV
        </button>
      </div>

      {/* Chart */}
      <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
        <h2 className="font-bold mb-4" style={{ color: 'var(--wb-blue)' }}>{METRICS.find(m => m.key === metric)?.label} per month</h2>
        {rows.length === 0 ? (
          <p className="text-sm py-12 text-center" style={{ color: 'var(--wb-gray-500)' }}>
            No booking data yet — your volume summary will chart here as you ship.
          </p>
        ) : (
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6c757d' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6c757d' }} />
                <Tooltip />
                <Bar dataKey={metric} fill="#00529C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Table */}
      {rows.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--wb-gray-50)', color: 'var(--wb-gray-500)' }} className="text-left text-xs">
                <th className="px-5 py-3 font-semibold">Month</th>
                <th className="px-5 py-3 font-semibold text-right">Shipments</th>
                <th className="px-5 py-3 font-semibold text-right">Weight (kg)</th>
                <th className="px-5 py-3 font-semibold text-right">Spend (USD)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.month} style={{ borderTop: '1px solid var(--wb-gray-200)' }}>
                  <td className="px-5 py-3 font-semibold" style={{ color: 'var(--wb-blue)' }}>{r.month}</td>
                  <td className="px-5 py-3 text-right" style={{ color: 'var(--wb-gray-900)' }}>{r.shipments}</td>
                  <td className="px-5 py-3 text-right" style={{ color: 'var(--wb-gray-900)' }}>{r.weight.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right" style={{ color: 'var(--wb-gray-900)' }}>${r.spend.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
