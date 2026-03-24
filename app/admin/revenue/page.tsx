'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, AlertTriangle, ArrowLeft,
  DollarSign, Plane, Package, BarChart2, CheckCircle
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import ImigongoPattern from '@/components/brand/ImigongoPattern'

// ─── Mock revenue data ────────────────────────────────────────────────────────
const ROUTES = [
  { route: 'KGL → LHR', yieldPerKg: 4.82, loadFactor: 88, trend: +12, target: 85, flightsToday: 1 },
  { route: 'KGL → DXB', yieldPerKg: 4.21, loadFactor: 72, trend: +3,  target: 80, flightsToday: 2 },
  { route: 'KGL → AMS', yieldPerKg: 5.10, loadFactor: 91, trend: +18, target: 85, flightsToday: 1 },
  { route: 'KGL → CDG', yieldPerKg: 4.65, loadFactor: 79, trend: -4,  target: 82, flightsToday: 1 },
  { route: 'KGL → NBO', yieldPerKg: 3.28, loadFactor: 95, trend: +7,  target: 88, flightsToday: 3 },
  { route: 'KGL → JNB', yieldPerKg: 2.91, loadFactor: 34, trend: -15, target: 75, flightsToday: 1 },
]

const CONSOLIDATION_REVENUE = [
  { feeder: 'EBB → KGL', flightsThisMonth: 28, interlinesRev: 142800, avgPerFlight: 5100 },
  { feeder: 'NBO → KGL', flightsThisMonth: 42, interlinesRev: 189400, avgPerFlight: 4510 },
  { feeder: 'DAR → KGL', flightsThisMonth: 18, interlinesRev: 77200,  avgPerFlight: 4290 },
  { feeder: 'LOS → KGL', flightsThisMonth: 12, interlinesRev: 54600,  avgPerFlight: 4550 },
]

const AI_RECOMMENDATIONS = [
  {
    route: 'KGL → LHR',
    type: 'OPPORTUNITY',
    message: 'Demand index +34% above baseline. Recommendation: Increase rate +8% for next 72h.',
    estimatedRevenue: 12400,
    applied: false,
  },
  {
    route: 'KGL → JNB',
    type: 'RISK',
    message: 'Load factor 34% — empty leg risk. Recommendation: Push last-minute deal at 25% discount.',
    estimatedRevenue: 7800,
    applied: false,
  },
  {
    route: 'KGL → DXB',
    type: 'OPPORTUNITY',
    message: 'Pharmaceutical demand rising (+22%). Consider GDP-certified capacity allocation.',
    estimatedRevenue: 8900,
    applied: false,
  },
]

// ─── Route row ────────────────────────────────────────────────────────────────
function RouteRow({ r }: { r: typeof ROUTES[0] }) {
  const aboveTarget = r.loadFactor >= r.target
  const onTrack = r.loadFactor >= r.target * 0.9
  const color = aboveTarget ? 'var(--wb-green)' : onTrack ? '#f59e0b' : '#ef4444'
  const bgColor = aboveTarget ? 'var(--wb-green-light)' : onTrack ? '#fff9e6' : '#fff1f0'

  return (
    <tr>
      <td className="px-5 py-4 font-semibold text-sm" style={{ color: 'var(--wb-blue)' }}>{r.route}</td>
      <td className="px-5 py-4 font-bold text-sm" style={{ color: 'var(--wb-blue)' }}>
        ${r.yieldPerKg.toFixed(2)}/kg
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: 'var(--wb-gray-200)' }}>
            <div className="h-full rounded-full" style={{ width: `${r.loadFactor}%`, background: color }} />
          </div>
          <span className="text-sm font-bold" style={{ color }}>{r.loadFactor}%</span>
        </div>
      </td>
      <td className="px-5 py-4 text-sm" style={{ color: 'var(--wb-gray-500)' }}>{r.target}%</td>
      <td className="px-5 py-4">
        <span className="flex items-center gap-1 text-sm font-bold"
              style={{ color: r.trend > 0 ? 'var(--wb-green)' : '#ef4444' }}>
          {r.trend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {r.trend > 0 ? '+' : ''}{r.trend}%
        </span>
      </td>
      <td className="px-5 py-4">
        <span className="px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: bgColor, color }}>
          {aboveTarget ? '✓ Above target' : onTrack ? '~ Near target' : '⚠ Below target'}
        </span>
      </td>
      <td className="px-5 py-4 text-right">
        <span className="text-xs font-semibold" style={{ color: 'var(--wb-gray-500)' }}>
          {r.flightsToday} today
        </span>
      </td>
    </tr>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RevenueDashboard() {
  const [recommendations, setRecommendations] = useState(AI_RECOMMENDATIONS)

  function applyRec(i: number) {
    setRecommendations(prev => prev.map((r, idx) => idx === i ? { ...r, applied: true } : r))
  }

  const totalInterlinesRev = CONSOLIDATION_REVENUE.reduce((s, r) => s + r.interlinesRev, 0)

  return (
    <>
      <Navbar />
      <div className="pt-16" style={{ background: 'var(--wb-gray-50)', minHeight: '100vh' }}>
        {/* Header */}
        <div className="relative overflow-hidden" style={{ background: 'var(--wb-blue)' }}>
          <ImigongoPattern color="white" opacity={0.04} />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2 py-0.5 rounded text-xs font-bold"
                    style={{ background: '#ef4444', color: 'white' }}>
                INTERNAL
              </span>
              <Link href="/" className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                ← Back to platform
              </Link>
            </div>
            <h1 className="text-white mb-1" style={{ fontSize: '1.75rem' }}>
              Revenue Intelligence Dashboard
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>
              Yield optimization, route profitability, and AI recommendations — RwandAir Cargo Ops only.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Top KPI strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Today's yield",     value: '$4.18/kg', change: '↑ +9% vs last week', positive: true },
              { label: 'Network load factor', value: '81%',    change: 'Target: 85%',         positive: false },
              { label: 'Underpriced lanes', value: '3',       change: 'Action needed',        positive: false },
              { label: 'Empty legs at risk', value: '2',      change: 'Push LM deals',        positive: false },
            ].map(({ label, value, change, positive }) => (
              <div key={label} className="rounded-2xl p-5"
                   style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                <p className="text-xs mb-2" style={{ color: 'var(--wb-gray-500)' }}>{label}</p>
                <p className="text-2xl font-bold mb-1" style={{ color: 'var(--wb-blue)' }}>{value}</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: positive ? 'var(--wb-green-light)' : 'var(--wb-yellow-light)',
                        color: positive ? '#3d6b10' : '#7a5c00',
                      }}>
                  {change}
                </span>
              </div>
            ))}
          </div>

          {/* AI yield recommendations */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--wb-sky)' }} />
              <h2 style={{ color: 'var(--wb-blue)', fontSize: '1.25rem' }}>AI Yield Recommendations</h2>
            </div>
            <div className="space-y-4">
              {recommendations.map((rec, i) => (
                <div key={i} className="rounded-2xl p-5"
                     style={{
                       background: rec.applied ? 'var(--wb-green-light)' : 'white',
                       border: `1.5px solid ${rec.applied ? '#94c94344' : rec.type === 'OPPORTUNITY' ? 'rgba(30,162,220,0.3)' : 'rgba(239,68,68,0.3)'}`,
                     }}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-xs font-bold"
                              style={{
                                background: rec.type === 'OPPORTUNITY' ? 'var(--wb-sky-light)' : '#fff1f0',
                                color: rec.type === 'OPPORTUNITY' ? 'var(--wb-sky)' : '#ef4444',
                              }}>
                          {rec.type === 'OPPORTUNITY' ? '📈 YIELD OPPORTUNITY' : '⚠️ RISK ALERT'} — {rec.route}
                        </span>
                      </div>
                      <p className="text-sm mb-1" style={{ color: 'var(--wb-gray-900)' }}>{rec.message}</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--wb-green)' }}>
                        Estimated incremental revenue: ${rec.estimatedRevenue.toLocaleString()}
                      </p>
                    </div>
                    {rec.applied ? (
                      <div className="flex items-center gap-1.5 text-sm font-semibold"
                           style={{ color: 'var(--wb-green)' }}>
                        <CheckCircle className="w-4 h-4" /> Applied
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => applyRec(i)}
                                className="px-4 py-2 rounded-xl text-sm font-bold"
                                style={{ background: 'var(--wb-blue)', color: 'white' }}>
                          Apply pricing update
                        </button>
                        <button className="px-4 py-2 rounded-xl text-sm font-semibold"
                                style={{ background: 'var(--wb-gray-50)', border: '1px solid var(--wb-gray-200)', color: 'var(--wb-gray-500)' }}>
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Route profitability */}
          <div className="rounded-2xl overflow-hidden mb-8"
               style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
            <div className="px-5 py-4 flex items-center gap-2"
                 style={{ borderBottom: '1px solid var(--wb-gray-200)' }}>
              <BarChart2 className="w-5 h-5" style={{ color: 'var(--wb-sky)' }} />
              <h2 style={{ color: 'var(--wb-blue)', fontSize: '1.25rem' }}>Route Profitability</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--wb-gray-50)', borderBottom: '1px solid var(--wb-gray-200)' }}>
                    {['Route', 'Yield/kg', 'Load factor', 'Target', 'vs Prior period', 'Recommendation', 'Flights'].map(h => (
                      <th key={h} className="px-5 py-3 text-left label-upper"
                          style={{ color: 'var(--wb-gray-500)', fontSize: 10 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROUTES.map((r, i) => (
                    <tr key={r.route}
                        style={{ borderBottom: i < ROUTES.length - 1 ? '1px solid var(--wb-gray-200)' : 'none' }}>
                      <RouteRow r={r} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interline / consolidation revenue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6"
                 style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
              <div className="flex items-center gap-2 mb-5">
                <Package className="w-5 h-5" style={{ color: 'var(--wb-sky)' }} />
                <h2 style={{ color: 'var(--wb-blue)', fontSize: '1.25rem' }}>
                  Interline Revenue (30 days)
                </h2>
              </div>
              <p className="text-3xl font-bold mb-5" style={{ color: 'var(--wb-blue)' }}>
                ${totalInterlinesRev.toLocaleString()}
                <span className="text-sm font-light ml-2" style={{ color: 'var(--wb-gray-500)' }}>
                  from feeder routes
                </span>
              </p>
              <div className="space-y-4">
                {CONSOLIDATION_REVENUE.map(r => (
                  <div key={r.feeder}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold" style={{ color: 'var(--wb-blue)' }}>{r.feeder}</span>
                      <span className="font-bold" style={{ color: 'var(--wb-gray-900)' }}>
                        ${r.interlinesRev.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--wb-gray-200)' }}>
                      <div className="h-full rounded-full"
                           style={{
                             width: `${(r.interlinesRev / totalInterlinesRev) * 100}%`,
                             background: 'var(--wb-sky)',
                           }} />
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--wb-gray-500)' }}>
                      {r.flightsThisMonth} flights · avg ${r.avgPerFlight.toLocaleString()}/flight
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Commodity revenue mix */}
            <div className="rounded-2xl p-6"
                 style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
              <div className="flex items-center gap-2 mb-5">
                <DollarSign className="w-5 h-5" style={{ color: 'var(--wb-sky)' }} />
                <h2 style={{ color: 'var(--wb-blue)', fontSize: '1.25rem' }}>Revenue by Commodity</h2>
              </div>
              <div className="space-y-4">
                {[
                  { commodity: 'Perishables (flowers/veg)', revenue: 842000, pct: 38 },
                  { commodity: 'Pharmaceuticals (GDP)',     revenue: 620000, pct: 28 },
                  { commodity: 'General cargo',             revenue: 440000, pct: 20 },
                  { commodity: 'High value / valuables',    revenue: 198000, pct: 9  },
                  { commodity: 'Live animals (AVI)',         revenue: 110000, pct: 5  },
                ].map(({ commodity, revenue, pct }) => (
                  <div key={commodity}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: 'var(--wb-gray-900)' }}>{commodity}</span>
                      <span className="font-bold" style={{ color: 'var(--wb-blue)' }}>
                        ${(revenue / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--wb-gray-200)' }}>
                      <div className="h-full rounded-full"
                           style={{ width: `${pct}%`, background: 'var(--wb-blue)' }} />
                    </div>
                    <p className="text-xs mt-0.5 text-right" style={{ color: 'var(--wb-gray-500)' }}>{pct}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
