'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package, Plane, TrendingUp, CheckCircle, Clock,
  AlertTriangle, Zap, ChevronRight, Phone, Leaf, Info
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ImigongoPattern from '@/components/brand/ImigongoPattern'
import { createClient } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────
interface UiShipment {
  awb: string
  commodity: string
  weightKg: number
  origin: string
  destination: string
  flight: string
  status: string
  departure: string
  eta: string
  statusColor: string
  statusLabel: string
}

// ─── Demo fallback data ───────────────────────────────────────────────────────
const DEMO_SHIPMENTS: UiShipment[] = [
  {
    awb: '459-40100001', commodity: 'Fresh roses', weightKg: 3000,
    origin: 'KGL', destination: 'AMS', flight: 'WB401',
    status: 'IN_TRANSIT', departure: 'Mar 20, 22:15', eta: 'Mar 21, 07:50',
    statusColor: 'var(--wb-sky)', statusLabel: 'In transit',
  },
  {
    awb: '459-53104200', commodity: 'Fresh seafood', weightKg: 320,
    origin: 'EBB', destination: 'DXB', flight: 'WB531',
    status: 'DELAYED', departure: 'Mar 20, 16:45', eta: 'Est. Mar 21, 18:30',
    statusColor: '#f59e0b', statusLabel: 'Delay risk',
  },
  {
    awb: '459-20107800', commodity: 'Coffee (green)', weightKg: 1500,
    origin: 'KGL', destination: 'LHR', flight: 'WB201',
    status: 'DELIVERED', departure: 'Mar 18, 22:15', eta: 'Mar 19, 07:50',
    statusColor: 'var(--wb-green)', statusLabel: 'Delivered ✓',
  },
  {
    awb: '459-40100088', commodity: 'Pharmaceuticals', weightKg: 200,
    origin: 'KGL', destination: 'CDG', flight: 'WB401',
    status: 'BOOKED', departure: 'Mar 22, 22:15', eta: 'Mar 23, 07:50',
    statusColor: 'var(--wb-blue)', statusLabel: 'Booked',
  },
]

// Map Supabase shipment_status enum to UI colours/labels
function mapStatus(raw: string): { statusColor: string; statusLabel: string; status: string } {
  const s = (raw || '').toLowerCase()
  if (s.includes('transit') || s.includes('port in') || s.includes('vessel') || s.includes('discharge'))
    return { status: 'IN_TRANSIT', statusColor: 'var(--wb-sky)', statusLabel: 'In transit' }
  if (s === 'delivered' || s === 'closed')
    return { status: 'DELIVERED', statusColor: 'var(--wb-green)', statusLabel: 'Delivered ✓' }
  if (s.includes('confirm') || s.includes('booking') || s.includes('space'))
    return { status: 'BOOKED', statusColor: 'var(--wb-blue)', statusLabel: 'Booked' }
  // Draft / Documents Pending
  return { status: 'PENDING', statusColor: '#94a3b8', statusLabel: 'Pending' }
}

export default function DashboardPage() {
  const [displayName, setDisplayName] = useState('')
  const [shipments, setShipments] = useState<UiShipment[]>(DEMO_SHIPMENTS)
  const [isDemo, setIsDemo] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      // 1. Get current session / user
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Prefer full_name from metadata, fall back to first part of email
        const meta = user.user_metadata as Record<string, string> | undefined
        const name = meta?.full_name || meta?.name || user.email?.split('@')[0] || ''
        setDisplayName(name ? `, ${name.split(' ')[0]}` : '')

        // 2. Fetch this user's shipments (RLS enforces user scoping)
        const { data: rows } = await supabase
          .from('shipments')
          .select(`
            shipment_id,
            product_type,
            weight_kg,
            destination_country,
            destination_airport,
            preferred_departure_date,
            status,
            transport_mode
          `)
          .order('created_at', { ascending: false })
          .limit(20)

        if (rows && rows.length > 0) {
          const mapped: UiShipment[] = rows.map(r => {
            const { statusColor, statusLabel, status } = mapStatus(String(r.status ?? ''))
            const dest = String(r.destination_airport || r.destination_country || '—')
            const depDate = r.preferred_departure_date
              ? new Date(String(r.preferred_departure_date)).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
              : '—'
            return {
              awb: String(r.shipment_id || '—'),
              commodity: String(r.product_type || '—'),
              weightKg: Number(r.weight_kg) || 0,
              origin: 'KGL',
              destination: dest,
              flight: '—',
              status,
              departure: depDate,
              eta: '—',
              statusColor,
              statusLabel,
            }
          })
          setShipments(mapped)
          setIsDemo(false)
        }
      }

      setLoading(false)
    }

    load()
  }, [])

  // ─── Derived metrics ───────────────────────────────────────────────────────
  const activeCount = shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'BOOKED').length
  const totalWeightKg = shipments.reduce((sum, s) => sum + s.weightKg, 0)
  const totalWeightLabel = totalWeightKg >= 1000 ? `${(totalWeightKg / 1000).toFixed(1)}t` : `${totalWeightKg}kg`
  const deliveredCount = shipments.filter(s => s.status === 'DELIVERED').length
  const onTimePct = deliveredCount > 0 ? '97%' : '—'

  const hasDelay = shipments.some(s => s.status === 'DELAYED')

  const METRICS = [
    { label: 'Active shipments',    value: loading ? '…' : String(activeCount),   icon: Plane,       color: 'var(--wb-sky)'   },
    { label: 'Total shipped (30d)', value: loading ? '…' : totalWeightLabel,       icon: Package,     color: 'var(--wb-blue)'  },
    { label: 'On-time rate',        value: loading ? '…' : onTimePct,              icon: CheckCircle, color: 'var(--wb-green)' },
    { label: 'CO₂ offset',          value: loading ? '…' : `${(shipments.reduce((s, r) => s + r.weightKg, 0) * 0.00168).toFixed(1)}t`, icon: Leaf, color: '#4a7c20' },
  ]

  return (
    <>
      <Navbar />
      <div className="pt-16" style={{ background: 'var(--wb-gray-50)', minHeight: '100vh' }}>
        {/* Header */}
        <div className="relative overflow-hidden" style={{ background: 'var(--wb-blue)' }}>
          <ImigongoPattern color="white" opacity={0.04} />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Client Dashboard
            </p>
            <h1 className="text-white mb-1" style={{ fontSize: '1.75rem' }}>
              Welcome back{displayName}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>
              Track your shipments, view documents, and book new cargo.
            </p>

            {/* Delay alert */}
            {hasDelay && (
              <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full"
                   style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)' }}>
                <AlertTriangle className="w-4 h-4" style={{ color: '#fbbf24' }} />
                <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>
                  1 shipment needs attention — delay risk detected
                </span>
              </div>
            )}

            {/* Demo data notice */}
            {isDemo && !loading && (
              <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full ml-2"
                   style={{ background: 'rgba(28,163,219,0.2)', border: '1px solid rgba(28,163,219,0.4)' }}>
                <Info className="w-4 h-4" style={{ color: '#67d2f0' }} />
                <span className="text-xs font-semibold" style={{ color: '#67d2f0' }}>
                  Sample data — sign in to see your real shipments
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {METRICS.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl p-5"
                   style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>{label}</p>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                       style={{ background: `${color}18` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--wb-blue)' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Zap,     label: 'New quote',           href: '/quote',       bg: 'var(--wb-yellow)', fg: 'var(--wb-blue)' },
              { icon: Package, label: 'Find consolidation',  href: '/consolidate', bg: 'var(--wb-blue)',   fg: 'white' },
              { icon: Phone,   label: 'Contact cargo desk',  href: 'tel:+250788177000', bg: 'var(--wb-sky)', fg: 'white' },
            ].map(({ icon: Icon, label, href, bg, fg }) => (
              <Link key={href} href={href}
                    className="flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                    style={{ background: bg, color: fg }}>
                <Icon className="w-5 h-5" />
                {label}
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Link>
            ))}
          </div>

          {/* Shipments table */}
          <div className="rounded-2xl overflow-hidden mb-8"
               style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
            <div className="px-5 py-4 flex items-center justify-between"
                 style={{ borderBottom: '1px solid var(--wb-gray-200)' }}>
              <h3 style={{ color: 'var(--wb-blue)' }}>
                My Shipments
                {isDemo && !loading && (
                  <span className="ml-2 text-xs font-normal" style={{ color: 'var(--wb-gray-500)' }}>(sample)</span>
                )}
              </h3>
              <Link href="/quote" className="text-xs font-bold"
                    style={{ color: 'var(--wb-sky)' }}>
                + New booking
              </Link>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12 gap-3"
                     style={{ color: 'var(--wb-gray-500)' }}>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm">Loading your shipments…</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'var(--wb-gray-50)', borderBottom: '1px solid var(--wb-gray-200)' }}>
                      {['AWB / Ref', 'Commodity', 'Route', 'Weight', 'Status', 'Departure', 'ETA', ''].map(h => (
                        <th key={h} className="px-5 py-3 text-left label-upper"
                            style={{ color: 'var(--wb-gray-500)', fontSize: 10 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map((s, i) => (
                      <tr key={s.awb + i}
                          style={{ borderBottom: i < shipments.length - 1 ? '1px solid var(--wb-gray-200)' : 'none' }}>
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs font-bold" style={{ color: 'var(--wb-blue)' }}>
                            {s.awb}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: 'var(--wb-gray-900)' }}>
                          {s.commodity}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold" style={{ color: 'var(--wb-blue)' }}>
                          {s.origin} → {s.destination}
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: 'var(--wb-gray-500)' }}>
                          {s.weightKg.toLocaleString()}kg
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                                style={{
                                  background: `${s.statusColor}18`,
                                  color: s.statusColor,
                                }}>
                            {s.statusLabel}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs" style={{ color: 'var(--wb-gray-500)' }}>
                          {s.departure}
                        </td>
                        <td className="px-5 py-4 text-xs" style={{ color: 'var(--wb-gray-500)' }}>
                          {s.eta}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link href={`/track/${s.awb}`}
                                className="text-xs font-bold"
                                style={{ color: 'var(--wb-sky)' }}>
                            Track →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Performance summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-2xl p-5"
                 style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
              <h4 className="mb-4" style={{ color: 'var(--wb-blue)' }}>30-day performance</h4>
              {[
                { label: 'Shipments moved',    value: String(shipments.length),                     pct: 100 },
                { label: 'On-time delivery',   value: onTimePct,                                    pct: 97  },
                { label: 'Cold-chain integrity', value: '99.7%',                                    pct: 99.7 },
              ].map(({ label, value, pct }) => (
                <div key={label} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--wb-gray-500)' }}>{label}</span>
                    <span className="font-bold" style={{ color: 'var(--wb-blue)' }}>{value}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--wb-gray-200)' }}>
                    <div className="h-1.5 rounded-full"
                         style={{ width: `${pct}%`, background: 'var(--wb-green)' }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-5"
                 style={{ background: 'var(--wb-blue)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 className="text-white mb-2" style={{ fontSize: '1rem' }}>Need help?</h4>
              <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
                Our cargo desk team can answer questions about customs, routing, and consolidation — 24/7.
              </p>
              <a href="tel:+250788177000"
                 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                 style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)' }}>
                <Phone className="w-4 h-4" /> Call cargo desk
              </a>
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--wb-yellow)' }}>24/7 Cargo Desk</p>
                <p className="font-bold text-white">+250 788 177 000</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>WhatsApp available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
