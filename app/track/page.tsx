'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import dynamicImport from 'next/dynamic'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Search, CheckCircle, Circle, ChevronRight, Info, X } from 'lucide-react'

// Mapbox GL touches window — load client-only to keep SSR safe.
const ShipmentMap = dynamicImport(() => import('@/components/track/ShipmentMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-2xl flex items-center justify-center" style={{ background: 'var(--wb-sky-light)', minHeight: 'clamp(360px, 60vh, 640px)' }}>
      <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>Loading map…</p>
    </div>
  ),
})

const AWB_RE = /^459-?\d{8}$/

const MILESTONES = [
  'Shipment received',
  'Accepted',
  'Departed',
  'In transit',
  'Arrived',
  'Available for collection',
]

// Map the tracking API status → milestone index
function stageFromStatus(status: string, timelineLen: number): number {
  const s = (status || '').toUpperCase()
  if (/DELIVER|AVAILABLE|COLLECT/.test(s)) return 5
  if (/ARRIV|CUSTOM|DISCHARGE|PORT/.test(s)) return 4
  if (/TRANSIT|DELAY|FLIGHT|AIR/.test(s)) return 3
  if (/DEPART|LOADED/.test(s)) return 2
  if (/ACCEPT|COLLECTED|RECEIVED AT/.test(s)) return 1
  if (/RECEIV|BOOK/.test(s)) return 0
  return Math.min(5, Math.max(0, timelineLen - 1))
}

interface TrackData {
  origin: string
  destination: string
  stage: number
  status: string
}

export default function TrackPage() {
  const [awb, setAwb] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [data, setData] = useState<TrackData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const lookup = useCallback(async (raw: string) => {
    const value = raw.trim()
    if (!AWB_RE.test(value)) { setError('Please enter a valid AWB number (e.g. 459-12345678)'); return }
    const normalized = value.includes('-') ? value : `${value.slice(0, 3)}-${value.slice(3)}`
    setError(''); setLoading(true); setData(null); setSubmitted(normalized)
    try {
      const res = await fetch(`/api/track/${normalized}`)
      const d = await res.json()
      const shipment = d.shipment ?? {}
      setData({
        origin: (shipment.origin ?? 'KGL').toUpperCase(),
        destination: (shipment.destination ?? 'LHR').toUpperCase(),
        status: shipment.status ?? 'IN_TRANSIT',
        stage: stageFromStatus(shipment.status ?? '', (d.timeline ?? []).length),
      })
    } catch {
      setError('We couldn\'t reach the tracking service. Please try again, or contact our cargo desk.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Deep link: /track?awb=459-12345678 (navbar quick-track)
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('awb')
    if (param) { setAwb(param); lookup(param) }
  }, [lookup])

  const fraction = data ? data.stage / (MILESTONES.length - 1) : 0

  return (
    <>
      <Navbar />
      <main className="pt-16" style={{ background: 'var(--neutral-light)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">

            {/* Left panel — input + milestone timeline (stacks above map on mobile) */}
            <aside className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
              <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--wb-blue)' }}>Track your shipment</h1>
              <p className="text-sm mb-4" style={{ color: 'var(--wb-gray-500)' }}>Enter your air waybill to see live milestones.</p>

              <form onSubmit={e => { e.preventDefault(); lookup(awb) }} className="flex gap-2 mb-6">
                <input value={awb} onChange={e => { setAwb(e.target.value); setError('') }}
                       inputMode="numeric" placeholder="459-12345678" aria-label="AWB number"
                       aria-invalid={!!error}
                       className="flex-1 px-4 py-2.5 rounded-lg text-sm font-mono outline-none"
                       style={{ border: error ? '1.5px solid #dc2626' : '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }} />
                <button type="submit" aria-label="Track" className="px-4 py-2.5 rounded-lg shrink-0" style={{ background: 'var(--wb-blue)', color: 'white' }}>
                  <Search className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>
              {error && <p role="alert" className="flex items-center gap-1 text-xs -mt-4 mb-4" style={{ color: '#dc2626' }}><X className="w-3 h-3" aria-hidden="true" /> {error}</p>}

              {loading && <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }} role="status">Locating shipment…</p>}

              {data && (
                <>
                  <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid var(--wb-gray-200)' }}>
                    <div>
                      <p className="font-mono font-bold text-sm" style={{ color: 'var(--wb-blue)' }}>{submitted}</p>
                      <p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>{data.origin} → {data.destination}</p>
                    </div>
                    <Link href={`/track/${submitted}`} className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--wb-sky)' }}>
                      Full detail <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>

                  {/* Milestone timeline */}
                  <ol className="space-y-1">
                    {MILESTONES.map((m, i) => {
                      const done = i <= data.stage
                      const current = i === data.stage
                      return (
                        <li key={m} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            {done
                              ? <CheckCircle className="w-5 h-5 shrink-0" style={{ color: current ? 'var(--wb-sky)' : 'var(--wb-green)' }} aria-hidden="true" />
                              : <Circle className="w-5 h-5 shrink-0" style={{ color: 'var(--wb-gray-200)' }} aria-hidden="true" />}
                            {i < MILESTONES.length - 1 && <span className="w-px flex-1 my-1" style={{ background: i < data.stage ? 'var(--wb-green)' : 'var(--wb-gray-200)', minHeight: 18 }} aria-hidden="true" />}
                          </div>
                          <span className="text-sm pb-3 font-semibold" style={{ color: current ? 'var(--wb-blue)' : done ? 'var(--wb-gray-900)' : 'var(--wb-gray-500)' }}>
                            {m}{current && <span className="ml-2 text-xs font-normal" style={{ color: 'var(--wb-sky)' }}>· current</span>}
                          </span>
                        </li>
                      )
                    })}
                  </ol>

                  <p className="flex items-start gap-1.5 text-xs mt-4 pt-4" style={{ borderTop: '1px solid var(--wb-gray-200)', color: 'var(--wb-gray-500)', lineHeight: 1.5 }}>
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                    Map position is indicative of the milestone reached. Precise live aircraft position requires ATC data integration.
                  </p>
                </>
              )}
            </aside>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden" style={{ minHeight: 'clamp(360px, 60vh, 640px)' }}>
              {data
                ? <ShipmentMap origin={data.origin} destination={data.destination} fraction={fraction} />
                : (
                  <div className="w-full h-full rounded-2xl flex items-center justify-center text-center p-8"
                       style={{ background: 'linear-gradient(135deg,#e4f5fc,#f8f9fa)', border: '1px solid var(--wb-gray-200)', minHeight: 'clamp(360px, 60vh, 640px)' }}>
                    <p className="text-sm max-w-xs" style={{ color: 'var(--wb-gray-500)' }}>
                      Enter an air waybill to plot its route and current milestone across the network.
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
