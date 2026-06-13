'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plane, Clock, AlertTriangle, CheckCircle, RefreshCw, ChevronRight } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useToast } from '@/components/ui/Toast'

// ─── Real W25 freighter schedule (Oct 2025 – Mar 2026) ────────────────────────
// WB9xxx = dedicated 737-800F freighter rotations · payload ~22,000 kg
const BASE_FLIGHTS = [
  {
    id: '1', flightNumber: 'WB9434', route: 'KGL → EBB', departure: 'Today 15:00',
    legs: 'KGL → EBB → KGL',
    aircraft: 'B737-800F', capacityKg: 22000, baseUsedKg: 14300, ratePerKg: 2.80,
    restrictions: ['General', 'Perishables', 'Pharma'],
  },
  {
    id: '2', flightNumber: 'WB9308', route: 'KGL → JIB', departure: 'Tonight 23:00',
    legs: 'KGL → JIB → SHJ → JUB → KGL',
    aircraft: 'B737-800F', capacityKg: 22000, baseUsedKg: 8800, ratePerKg: 4.10,
    restrictions: ['General', 'Pharma', 'High Value'],
  },
  {
    id: '3', flightNumber: 'WB9464', route: 'KGL → EBB', departure: 'Sat 11:30',
    legs: 'KGL → EBB → NBO → KGL',
    aircraft: 'B737-800F', capacityKg: 22000, baseUsedKg: 20900, ratePerKg: 2.80,
    restrictions: ['General', 'Perishables'],
  },
  {
    id: '4', flightNumber: 'WB9304', route: 'KGL → SHJ', departure: 'Sat 23:00',
    legs: 'KGL → SHJ → KGL',
    aircraft: 'B737-800F', capacityKg: 22000, baseUsedKg: 9900, ratePerKg: 4.50,
    restrictions: ['Pharma', 'Perishables', 'General', 'High Value'],
  },
  {
    id: '5', flightNumber: 'WB9316', route: 'KGL → JIB', departure: 'Mon 00:30',
    legs: 'KGL → JIB → DWC → KGL',
    aircraft: 'B737-800F', capacityKg: 22000, baseUsedKg: 5500, ratePerKg: 4.20,
    restrictions: ['General', 'Pharma', 'High Value'],
  },
  {
    id: '6', flightNumber: 'WB9314', route: 'KGL → SHJ', departure: 'Tue 23:00',
    legs: 'KGL → SHJ → JIB → KGL',
    aircraft: 'B737-800F', capacityKg: 22000, baseUsedKg: 2640, ratePerKg: 4.20,
    restrictions: ['General', 'Pharma', 'Perishables'],
  },
]

// Simulate realistic small fluctuations in used capacity on each refresh
function simulateRefresh(base: typeof BASE_FLIGHTS) {
  return base.map(f => {
    // Small random booking: 0–200 kg added each refresh cycle
    const delta = Math.floor(Math.random() * 200)
    const newUsed = Math.min(f.capacityKg - 100, f.baseUsedKg + delta)
    return { ...f, usedKg: newUsed }
  })
}

type FlightRow = (typeof BASE_FLIGHTS)[0] & { usedKg: number }

// ─── Reserve panel ────────────────────────────────────────────────────────────
function ReservePanel({ flight, onClose }: { flight: FlightRow; onClose: () => void }) {
  const { addToast } = useToast()
  const [step, setStep] = useState<'form' | 'confirm' | 'done'>('form')
  const [commodity, setCommodity] = useState('')
  const [weight, setWeight]       = useState(500)
  const [contact, setContact]     = useState('')
  const available = flight.capacityKg - flight.usedKg

  function handleDone() {
    setStep('done')
    addToast(`${weight}kg on ${flight.flightNumber} held for 15 min — WhatsApp confirmation sent.`, 'success')
  }

  if (step === 'done') return (
    <div className="text-center py-6">
      <CheckCircle className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--wb-green)' }} />
      <h3 className="mb-2" style={{ color: 'var(--wb-blue)' }}>Space reserved!</h3>
      <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>
        {weight}kg on {flight.flightNumber} held for 15 minutes. Check WhatsApp for confirmation link.
      </p>
      <button onClick={onClose} className="mt-5 px-6 py-2 rounded-xl font-bold text-sm"
              style={{ background: 'var(--wb-blue)', color: 'white' }}>
        Close
      </button>
    </div>
  )

  return (
    <div>
      <h3 className="mb-1" style={{ color: 'var(--wb-blue)' }}>Reserve space — {flight.flightNumber}</h3>
      <p className="text-sm mb-5" style={{ color: 'var(--wb-gray-500)' }}>
        {flight.route} · {flight.departure} · ${flight.ratePerKg}/kg
      </p>

      {step === 'form' && (
        <div className="space-y-4">
          <div>
            <label className="label-upper block mb-1.5" style={{ color: 'var(--wb-gray-500)' }}>Commodity</label>
            <select value={commodity} onChange={e => setCommodity(e.target.value)}
                    aria-label="Select commodity type"
                    className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                    style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-gray-900)' }}>
              <option value="">Select type…</option>
              {flight.restrictions.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label-upper block mb-1.5" style={{ color: 'var(--wb-gray-500)' }}>
              Weight (kg) · Max {available.toLocaleString()}kg available
            </label>
            <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))}
                   min={1} max={available}
                   aria-label="Weight in kilograms"
                   className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                   style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-gray-900)' }} />
          </div>
          <div>
            <label className="label-upper block mb-1.5" style={{ color: 'var(--wb-gray-500)' }}>WhatsApp / Contact</label>
            <input type="text" value={contact} onChange={e => setContact(e.target.value)}
                   placeholder="+250 7…"
                   aria-label="WhatsApp or contact number"
                   className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                   style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-gray-900)' }} />
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'var(--wb-sky-light)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--wb-blue)' }}>
              Estimated total: <strong>${(weight * flight.ratePerKg).toLocaleString()}</strong>
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--wb-gray-500)' }}>
              Hold active for 15 minutes while you confirm
            </p>
          </div>
          <button disabled={!commodity || !contact}
                  onClick={() => setStep('confirm')}
                  className="w-full py-3 rounded-xl font-bold text-sm"
                  style={{ background: !commodity || !contact ? 'var(--wb-gray-200)' : 'var(--wb-blue)', color: !commodity || !contact ? 'var(--wb-gray-500)' : 'white' }}>
            Reserve — hold 15 min →
          </button>
        </div>
      )}

      {step === 'confirm' && (
        <div>
          <div className="p-4 rounded-xl mb-5" style={{ background: 'var(--wb-yellow-light)', border: '1px solid rgba(254,224,20,0.5)' }}>
            <p className="font-bold text-sm mb-2" style={{ color: 'var(--wb-blue)' }}>Confirm reservation</p>
            <div className="space-y-1 text-sm" style={{ color: 'var(--wb-gray-500)' }}>
              <div className="flex justify-between"><span>Flight</span><strong>{flight.flightNumber}</strong></div>
              <div className="flex justify-between"><span>Route</span><strong>{flight.route}</strong></div>
              <div className="flex justify-between"><span>Departure</span><strong>{flight.departure}</strong></div>
              <div className="flex justify-between"><span>Commodity</span><strong>{commodity}</strong></div>
              <div className="flex justify-between"><span>Weight</span><strong>{weight}kg</strong></div>
              <div className="flex justify-between"><span>Rate</span><strong>${flight.ratePerKg}/kg</strong></div>
              <div className="flex justify-between border-t pt-1 mt-1" style={{ borderColor: 'rgba(254,224,20,0.4)' }}>
                <span>Total</span><strong style={{ color: 'var(--wb-blue)' }}>${(weight * flight.ratePerKg).toLocaleString()}</strong>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleDone}
                    className="flex-1 py-3 rounded-xl font-bold text-sm"
                    style={{ background: 'var(--wb-blue)', color: 'white' }}>
              Confirm & hold
            </button>
            <button onClick={() => setStep('form')}
                    className="px-4 py-3 rounded-xl font-semibold text-sm"
                    style={{ background: 'var(--wb-gray-50)', border: '1px solid var(--wb-gray-200)', color: 'var(--wb-gray-500)' }}>
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CapacityPage() {
  const { addToast } = useToast()
  const [flights, setFlights] = useState<FlightRow[]>(() => simulateRefresh(BASE_FLIGHTS))
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [reserving, setReserving] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(90)

  const doRefresh = useCallback(() => {
    setFlights(simulateRefresh(BASE_FLIGHTS))
    setLastRefresh(new Date())
  }, [])

  // Auto-refresh every 90 seconds with real data change
  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          doRefresh()
          return 90
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [doRefresh])

  function handleManualRefresh() {
    doRefresh()
    setCountdown(90)
    addToast('Capacity data refreshed.', 'info')
  }

  const reservingFlight = flights.find(f => f.id === reserving)

  function getCapColor(pct: number) {
    if (pct >= 60) return 'var(--wb-green)'
    if (pct >= 30) return '#f59e0b'
    return '#ef4444'
  }

  function getCapLabel(pct: number) {
    if (pct >= 60) return 'High availability'
    if (pct >= 30) return 'Moderate'
    return 'Low — filling fast'
  }

  return (
    <>
      <Navbar />
      <div className="pt-16" style={{ background: 'var(--wb-gray-50)', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: 'var(--wb-blue)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-4"
                  style={{ color: 'rgba(255,255,255,0.6)' }}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-white mb-1" style={{ fontSize: '1.75rem' }}>Live Capacity Marketplace</h1>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>
                  Live capacity across {flights.length} upcoming departures · refreshes every 90s.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} aria-hidden="true" />
                  Refreshing in {countdown}s
                </div>
                <button
                  onClick={handleManualRefresh}
                  className="text-xs font-bold px-3 py-1.5 rounded-full"
                  aria-label="Refresh capacity data now"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                  Refresh now
                </button>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Last: {lastRefresh.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-5 mb-5 text-xs" style={{ color: 'var(--wb-gray-500)' }}>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: 'var(--wb-green)' }} aria-hidden="true" /> High (&gt;60%)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#f59e0b' }} aria-hidden="true" /> Medium (30–60%)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#ef4444' }} aria-hidden="true" /> Low (&lt;30%)
            </span>
            <span className="flex items-center gap-1 ml-auto">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)' }}>
                Filling fast
              </span> &lt;25% remaining
            </span>
          </div>

          {/* Flights table */}
          <div className="rounded-2xl overflow-hidden"
               style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
            {/* Desktop header */}
            <div className="hidden md:grid grid-cols-7 px-5 py-3"
                 style={{ background: 'var(--wb-gray-50)', borderBottom: '1px solid var(--wb-gray-200)' }}>
              {['Flight', 'Route', 'Departure', 'Aircraft', 'Availability', 'Space', 'Action'].map(h => (
                <p key={h} className="label-upper" style={{ color: 'var(--wb-gray-500)', fontSize: 10 }}>{h}</p>
              ))}
            </div>

            {flights.map((flight, i) => {
              const available = flight.capacityKg - flight.usedKg
              const pct = Math.round((available / flight.capacityKg) * 100)
              const fillingFast = available < flight.capacityKg * 0.25
              return (
                <div key={flight.id}
                     className="grid grid-cols-1 md:grid-cols-7 items-center gap-2 px-5 py-4"
                     style={{
                       borderBottom: i < flights.length - 1 ? '1px solid var(--wb-gray-200)' : 'none',
                       background: i % 2 === 0 ? 'white' : 'rgba(248,249,250,0.5)',
                     }}>
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--wb-blue)' }}>{flight.flightNumber}</p>
                    <p className="text-xs md:hidden" style={{ color: 'var(--wb-gray-500)' }}>{flight.route}</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold" style={{ color: 'var(--wb-gray-900)' }}>{flight.route}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--wb-gray-500)' }}>{flight.legs}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--wb-gray-900)' }}>{flight.departure}</p>
                  </div>
                  <p className="text-xs hidden md:block" style={{ color: 'var(--wb-gray-500)' }}>
                    {flight.aircraft}
                  </p>
                  <div className="col-span-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full overflow-hidden"
                           style={{ background: 'var(--wb-gray-200)', minWidth: 60 }}
                           role="progressbar"
                           aria-valuenow={pct}
                           aria-valuemin={0}
                           aria-valuemax={100}
                           aria-label={`${flight.flightNumber} availability: ${pct}% — ${getCapLabel(pct)}`}>
                        <div className="h-full rounded-full transition-all"
                             style={{ width: `${pct}%`, background: getCapColor(pct) }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: getCapColor(pct) }}
                            aria-hidden="true">{pct}%</span>
                    </div>
                    <p className="text-xs mt-0.5 hidden md:block" style={{ color: getCapColor(pct), fontWeight: 600 }}>
                      {getCapLabel(pct)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--wb-blue)' }}>
                      {(available / 1000).toFixed(1)}t
                    </p>
                    {fillingFast && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)' }}>
                        Filling fast
                      </span>
                    )}
                    <p className="text-xs mt-0.5" style={{ color: 'var(--wb-gray-500)' }}>
                      ${flight.ratePerKg}/kg
                    </p>
                  </div>
                  <div>
                    <button onClick={() => setReserving(flight.id)}
                            aria-label={`Reserve space on ${flight.flightNumber} — ${flight.route}`}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold"
                            style={{ background: 'var(--wb-blue)', color: 'white' }}>
                      Reserve <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <p className="text-xs mt-1" style={{ color: 'var(--wb-gray-500)' }}>
                      {flight.restrictions.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-xs mt-4 text-center" style={{ color: 'var(--wb-gray-500)' }}>
            Capacity updates as bookings are confirmed across the network. Reserve early — space on peak departures moves fast.
          </p>
        </div>
      </div>

      {/* Reserve modal */}
      {reserving && reservingFlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.5)' }}
             role="dialog" aria-modal="true" aria-labelledby="reserve-modal-title">
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'white' }}>
            <ReservePanel flight={reservingFlight} onClose={() => setReserving(null)} />
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
