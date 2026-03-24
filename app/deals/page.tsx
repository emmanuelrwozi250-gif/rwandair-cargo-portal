'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Zap, Clock, CheckCircle, X } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useToast } from '@/components/ui/Toast'

const SESSION_KEY = 'wb_deals_start'

// ─── Real deals based on actual W25 freighter schedule ────────────────────────
const INITIAL_DEALS = [
  {
    id: 'D-881',
    flight: 'WB9308', route: 'KGL → JIB → SHJ',
    departure: 'Tonight 23:00',
    availableKg: 1320,
    discountPct: 28,
    ratePerKg: 2.95,
    standardRatePerKg: 4.10,
    commodityTypes: ['General cargo', 'Pharma'],
    expiresInSeconds: 9753,
    urgency: 'high' as const,
  },
  {
    id: 'D-879',
    flight: 'WB9304', route: 'KGL → SHJ',
    departure: 'Sat 23:00',
    availableKg: 2100,
    discountPct: 19,
    ratePerKg: 3.64,
    standardRatePerKg: 4.50,
    commodityTypes: ['General cargo', 'High Value'],
    expiresInSeconds: 18340,
    urgency: 'medium' as const,
  },
  {
    id: 'D-876',
    flight: 'WB9316', route: 'KGL → JIB → DWC',
    departure: 'Mon 00:30',
    availableKg: 1650,
    discountPct: 15,
    ratePerKg: 3.57,
    standardRatePerKg: 4.20,
    commodityTypes: ['General cargo', 'Perishables'],
    expiresInSeconds: 43200,
    urgency: 'low' as const,
  },
  {
    id: 'D-872',
    flight: 'WB9314', route: 'KGL → SHJ → JIB',
    departure: 'Tue 23:00',
    availableKg: 1980,
    discountPct: 22,
    ratePerKg: 3.28,
    standardRatePerKg: 4.20,
    commodityTypes: ['Pharma', 'General cargo', 'Perishables'],
    expiresInSeconds: 72000,
    urgency: 'low' as const,
  },
]

// ─── Countdown formatter ──────────────────────────────────────────────────────
function formatCountdown(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
  return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
}

// ─── Deal card ────────────────────────────────────────────────────────────────
function DealCard({ deal, timeLeft, onGrab }: {
  deal: typeof INITIAL_DEALS[0]
  timeLeft: number
  onGrab: () => void
}) {
  const urgencyColor = deal.urgency === 'high' ? '#ef4444' : deal.urgency === 'medium' ? '#f59e0b' : 'var(--wb-sky)'
  const expired = timeLeft === 0

  return (
    <div className="relative rounded-2xl overflow-hidden transition-all card-lift"
         style={{
           background: 'white',
           border: deal.urgency === 'high'
             ? '2px solid rgba(239,68,68,0.3)'
             : '1px solid var(--wb-gray-200)',
           opacity: expired ? 0.5 : 1,
         }}>
      {/* Urgency indicator */}
      <div className="absolute top-0 left-0 right-0 h-1"
           style={{ background: urgencyColor, opacity: 0.7 }} aria-hidden="true" />

      <div className="p-6 pt-7">
        {/* Badge row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)' }}>
            <Zap className="w-3 h-3" aria-hidden="true" /> LAST-MINUTE DEAL
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: 'var(--wb-green-light)', color: '#3d6b10' }}>
            SAVE {deal.discountPct}%
          </span>
          {expired && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: '#fff1f0', color: '#b91c1c', border: '1px solid #ef444433' }}>
              EXPIRED
            </span>
          )}
        </div>

        {/* Flight info */}
        <p className="font-bold text-base mb-1" style={{ color: 'var(--wb-blue)' }}>
          {deal.flight} — {deal.route}
        </p>
        <p className="text-sm mb-4" style={{ color: 'var(--wb-gray-500)' }}>
          {deal.departure} · {deal.availableKg.toLocaleString()}kg remaining
        </p>

        {/* Commodity types */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {deal.commodityTypes.map(t => (
            <span key={t} className="px-2 py-0.5 rounded-full text-xs"
                  style={{ background: 'var(--wb-sky-light)', color: 'var(--wb-sky)' }}>
              {t}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 mb-5">
          <div>
            <p className="price-unit">RATE</p>
            <p className="price-large" style={{ fontSize: 36 }}>${deal.ratePerKg.toFixed(2)}</p>
            <p className="price-label">/kg</p>
          </div>
          <div className="mb-1 ml-2">
            <p className="text-xs line-through" style={{ color: 'var(--wb-gray-500)' }}>
              ${deal.standardRatePerKg.toFixed(2)}/kg standard
            </p>
            <p className="text-sm font-bold" style={{ color: 'var(--wb-green)' }}>
              Save ${((deal.standardRatePerKg - deal.ratePerKg) * deal.availableKg).toLocaleString()} if you fill it
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2 p-3 rounded-xl mb-5"
             role="timer"
             aria-label={expired ? 'Offer expired' : `Expires in ${formatCountdown(timeLeft)}`}
             style={{
               background: expired ? 'var(--wb-gray-50)' : timeLeft < 600 ? '#fff1f0' : 'var(--wb-gray-50)',
               border: `1px solid ${expired ? 'var(--wb-gray-200)' : timeLeft < 600 ? '#ef444433' : 'var(--wb-gray-200)'}`,
             }}>
          <Clock className="w-4 h-4 shrink-0" aria-hidden="true"
                 style={{ color: expired ? 'var(--wb-gray-500)' : timeLeft < 600 ? '#ef4444' : 'var(--wb-gray-500)' }} />
          <span className="font-mono font-bold text-sm"
                style={{ color: expired ? 'var(--wb-gray-500)' : timeLeft < 600 ? '#ef4444' : 'var(--wb-gray-900)' }}>
            {expired ? 'Offer expired' : `Expires in ${formatCountdown(timeLeft)}`}
          </span>
        </div>

        <button
          onClick={onGrab}
          disabled={expired}
          aria-label={expired ? 'This deal has expired' : `Grab space on ${deal.flight} — ${deal.route}`}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
          style={{
            background: expired ? 'var(--wb-gray-200)' : 'var(--wb-blue)',
            color: expired ? 'var(--wb-gray-500)' : 'white',
          }}>
          {expired ? 'Offer expired' : 'Grab this space →'}
        </button>
      </div>
    </div>
  )
}

// ─── Grab modal ───────────────────────────────────────────────────────────────
function GrabModal({ deal, onClose, onConfirm }: {
  deal: typeof INITIAL_DEALS[0]
  onClose: () => void
  onConfirm: (weight: number) => void
}) {
  const [done, setDone] = useState(false)
  const [weight, setWeight] = useState(Math.min(500, deal.availableKg))
  const [contact, setContact] = useState('')

  function handleConfirm() {
    setDone(true)
    onConfirm(weight)
  }

  if (done) return (
    <div className="text-center py-6">
      <CheckCircle className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--wb-green)' }} />
      <h3 className="mb-2" style={{ color: 'var(--wb-blue)' }}>Space grabbed!</h3>
      <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>
        {weight.toLocaleString()}kg on {deal.flight} reserved at ${deal.ratePerKg}/kg. Check WhatsApp for payment link.
      </p>
      <button onClick={onClose} className="mt-5 px-6 py-2 rounded-xl font-bold text-sm"
              style={{ background: 'var(--wb-blue)', color: 'white' }}>Close</button>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h3 style={{ color: 'var(--wb-blue)' }}>Grab deal — {deal.flight}</h3>
        <button onClick={onClose} aria-label="Close"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--wb-gray-500)' }}>
          <X className="w-5 h-5" />
        </button>
      </div>
      <p className="text-sm mb-5" style={{ color: 'var(--wb-gray-500)' }}>
        {deal.route} · {deal.departure} · ${deal.ratePerKg}/kg
      </p>
      <div className="space-y-4">
        <div>
          <label className="label-upper block mb-1.5" style={{ color: 'var(--wb-gray-500)' }}>
            Weight (kg) · Max {deal.availableKg.toLocaleString()}kg
          </label>
          <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))}
                 min={1} max={deal.availableKg}
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
        <div className="p-3 rounded-xl" style={{ background: 'var(--wb-yellow-light)', border: '1px solid rgba(254,224,20,0.4)' }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--wb-gray-500)' }}>Total at deal rate</span>
            <strong style={{ color: 'var(--wb-blue)' }}>${(weight * deal.ratePerKg).toLocaleString()}</strong>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span style={{ color: 'var(--wb-gray-500)' }}>Standard rate would be</span>
            <span className="line-through" style={{ color: 'var(--wb-gray-500)' }}>
              ${(weight * deal.standardRatePerKg).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold mt-1">
            <span style={{ color: 'var(--wb-green)' }}>You save</span>
            <span style={{ color: 'var(--wb-green)' }}>
              ${((deal.standardRatePerKg - deal.ratePerKg) * weight).toLocaleString()}
            </span>
          </div>
        </div>
        <button onClick={handleConfirm} disabled={!contact}
                className="w-full py-3 rounded-xl font-bold text-sm"
                aria-label="Confirm booking"
                style={{ background: !contact ? 'var(--wb-gray-200)' : 'var(--wb-yellow)', color: !contact ? 'var(--wb-gray-500)' : 'var(--wb-blue)' }}>
          Confirm & book →
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DealsPage() {
  const { addToast } = useToast()
  const [grabbingDeal, setGrabbingDeal] = useState<string | null>(null)
  // Persist countdown start across page reloads using sessionStorage
  const [startEpoch] = useState<number>(() => {
    if (typeof window === 'undefined') return Date.now()
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) return parseInt(stored, 10)
    const now = Date.now()
    sessionStorage.setItem(SESSION_KEY, String(now))
    return now
  })
  const [, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const elapsed = Math.floor((Date.now() - startEpoch) / 1000)
  const dealObj = INITIAL_DEALS.find(d => d.id === grabbingDeal)

  // Active deals count (not expired)
  const activeDeals = INITIAL_DEALS.filter(d => Math.max(0, d.expiresInSeconds - elapsed) > 0)

  function handleConfirmGrab(weight: number) {
    const deal = dealObj
    if (!deal) return
    addToast(`${weight.toLocaleString()}kg on ${deal.flight} booked at $${deal.ratePerKg}/kg — WhatsApp link sent.`, 'success')
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
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-6 h-6" style={{ color: 'var(--wb-yellow)' }} aria-hidden="true" />
              <h1 className="text-white" style={{ fontSize: '1.75rem' }}>Last-Minute Deals</h1>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>
              Discounted empty belly space on tonight&apos;s departures — offers expire fast.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold" style={{ color: 'var(--wb-blue)' }}>
              {activeDeals.length} active deal{activeDeals.length !== 1 ? 's' : ''}
              {activeDeals.length < INITIAL_DEALS.length && (
                <span className="ml-2 text-xs font-normal" style={{ color: 'var(--wb-gray-500)' }}>
                  ({INITIAL_DEALS.length - activeDeals.length} expired)
                </span>
              )}
            </p>
            <p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>
              Countdowns persist across reloads — prices locked until timer expires
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INITIAL_DEALS.map(deal => {
              const timeLeft = Math.max(0, deal.expiresInSeconds - elapsed)
              return (
                <DealCard key={deal.id} deal={deal} timeLeft={timeLeft} onGrab={() => setGrabbingDeal(deal.id)} />
              )
            })}
          </div>

          {/* Info footer */}
          <div className="mt-8 p-5 rounded-2xl"
               style={{ background: 'var(--wb-sky-light)', border: '1px solid rgba(30,162,220,0.2)' }}>
            <p className="font-semibold text-sm mb-1" style={{ color: 'var(--wb-blue)' }}>About last-minute deals</p>
            <p className="text-sm" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.65 }}>
              These are unsold belly freight spots on confirmed departures. RwandAir releases them at discounted rates to maximize aircraft utilization.
              Prices are fixed — no negotiation. Offers expire automatically. All commodities subject to airline acceptance.
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--wb-gray-500)' }}>
              <strong>Demo note:</strong> This page uses simulated deal data. Countdowns persist within the browser session.
            </p>
          </div>
        </div>
      </div>

      {/* Grab modal */}
      {grabbingDeal && dealObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.5)' }}
             role="dialog" aria-modal="true" aria-labelledby="grab-modal-title">
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'white' }}>
            <GrabModal
              deal={dealObj}
              onClose={() => setGrabbingDeal(null)}
              onConfirm={handleConfirmGrab}
            />
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
