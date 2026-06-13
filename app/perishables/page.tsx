'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Thermometer, Droplets, Zap, Clock, AlertTriangle,
  CheckCircle, ArrowLeft, BarChart2, Phone, Mail, X
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useToast } from '@/components/ui/Toast'
import { useLanguage } from '@/components/providers/LanguageProvider'

// ─── Mock active perishable shipments ─────────────────────────────────────────
const SHIPMENTS_INITIAL = [
  {
    id: '459-40100001', awb: '459-40100001',
    commodity: 'Roses', route: 'KGL → AMS', flight: 'WB401',
    status: 'In transit',
    tempC: 4.2, targetTempMin: 2, targetTempMax: 6,
    humidityPct: 68, shockEvents: 0,
    shelfLifeRemainingDays: 4.6,
    eta: 'Mar 21, 07:50 local',
    coldStore: 'Confirmed — AMS Cargo Centre',
    alert: null as null | { type: string; message: string; recommendation: string },
    rerouteApproved: false,
  },
  {
    id: '459-53104200', awb: '459-53104200',
    commodity: 'Fresh seafood', route: 'EBB → DXB', flight: 'WB531',
    status: 'Delay risk',
    tempC: 2.8, targetTempMin: 0, targetTempMax: 4,
    humidityPct: 85, shockEvents: 1,
    shelfLifeRemainingDays: 1.2,
    eta: 'Est. Mar 21, 18:30 local (delayed +3h)',
    coldStore: 'Pending — DXB Terminal 2',
    alert: {
      type: 'DELAY_RISK',
      message: 'Connecting flight EK-812 delayed 3h. Shipment will lose est. 18% market value (~$940) if delay confirmed.',
      recommendation: 'Reroute via KGL tonight — 4h faster. Alternative space confirmed on WB531.',
    },
    rerouteApproved: false,
  },
  {
    id: '459-20107800', awb: '459-20107800',
    commodity: 'Avocado',  route: 'NBO → LHR', flight: 'WB201',
    status: 'Collected',
    tempC: 6.1, targetTempMin: 5, targetTempMax: 8,
    humidityPct: 72, shockEvents: 0,
    shelfLifeRemainingDays: 8.3,
    eta: 'Mar 22, 09:00 local',
    coldStore: 'Confirmed — LHR Cold Hub',
    alert: null as null | { type: string; message: string; recommendation: string },
    rerouteApproved: false,
  },
  {
    id: '459-40100088', awb: '459-40100088',
    commodity: 'Tulips',   route: 'KGL → CDG', flight: 'WB401',
    status: 'In transit',
    tempC: 3.9, targetTempMin: 2, targetTempMax: 6,
    humidityPct: 74, shockEvents: 0,
    shelfLifeRemainingDays: 5.1,
    eta: 'Mar 21, 08:20 local',
    coldStore: 'Confirmed — CDG Rungis',
    alert: null as null | { type: string; message: string; recommendation: string },
    rerouteApproved: false,
  },
]

// ─── 30-day stats ─────────────────────────────────────────────────────────────
const STATS = [
  { commodity: 'Cut flowers',  onTimePct: 98.4, avgTempDeviation: 0.3, shipments: 142 },
  { commodity: 'Vegetables',   onTimePct: 97.1, avgTempDeviation: 0.6, shipments: 89  },
  { commodity: 'Seafood',      onTimePct: 95.8, avgTempDeviation: 0.4, shipments: 34  },
  { commodity: 'Pharma',       onTimePct: 99.7, avgTempDeviation: 0.1, shipments: 28  },
]

// ─── Contact handler modal ─────────────────────────────────────────────────────
function ContactHandlerModal({ awb, commodity, onClose }: { awb: string; commodity: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.5)' }}
         role="dialog" aria-modal="true" aria-labelledby="contact-handler-title">
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'white' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 id="contact-handler-title" style={{ color: 'var(--wb-blue)' }}>Contact Handler</h3>
          <button onClick={onClose} aria-label="Close dialog"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--wb-gray-500)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--wb-gray-500)' }}>
          Cargo handler for <strong>{commodity}</strong> (AWB: {awb})
        </p>
        <div className="space-y-3">
          <a href="tel:+250788177000"
             className="flex items-center gap-3 p-3 rounded-xl"
             style={{ background: 'var(--wb-sky-light)', color: 'var(--wb-blue)', textDecoration: 'none' }}>
            <Phone className="w-4 h-4 shrink-0" />
            <div>
              <p className="text-sm font-bold">24/7 Cargo Desk</p>
              <p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>+250 788 177 000</p>
            </div>
          </a>
          <a href="mailto:cargo@rwandair.com"
             className="flex items-center gap-3 p-3 rounded-xl"
             style={{ background: 'var(--wb-gray-50)', border: '1px solid var(--wb-gray-200)', color: 'var(--wb-gray-900)', textDecoration: 'none' }}>
            <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--wb-sky)' }} />
            <div>
              <p className="text-sm font-semibold">Email</p>
              <p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>cargo@rwandair.com</p>
            </div>
          </a>
        </div>
        <button onClick={onClose}
                className="w-full mt-5 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: 'var(--wb-blue)', color: 'white' }}>
          Close
        </button>
      </div>
    </div>
  )
}

// ─── Shipment card ────────────────────────────────────────────────────────────
function ShipmentCard({
  s,
  onApproveReroute,
  onDeclineReroute,
  onContactHandler,
}: {
  s: typeof SHIPMENTS_INITIAL[0]
  onApproveReroute: (id: string) => void
  onDeclineReroute: (id: string) => void
  onContactHandler: (id: string) => void
}) {
  const tempOk = s.tempC >= s.targetTempMin && s.tempC <= s.targetTempMax
  const riskColor = s.shelfLifeRemainingDays < 2 ? '#ef4444'
    : s.shelfLifeRemainingDays < 4 ? '#f59e0b'
    : 'var(--wb-green)'

  const statusText = s.rerouteApproved ? 'Rerouted' : s.status
  const headerBg = s.rerouteApproved ? 'var(--wb-green-light)' : s.alert ? '#fff9e6' : 'var(--wb-green-light)'
  const headerColor = s.rerouteApproved ? '#3d6b10' : s.alert ? '#92400e' : '#3d6b10'

  return (
    <div className="rounded-2xl overflow-hidden"
         style={{ background: 'white', border: `1.5px solid ${s.alert && !s.rerouteApproved ? '#f59e0b66' : 'var(--wb-gray-200)'}` }}>
      {/* Header */}
      <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3"
           style={{ background: headerBg, borderBottom: '1px solid var(--wb-gray-200)' }}>
        <div>
          <span className="font-bold text-sm" style={{ color: headerColor }}>
            {s.commodity} — {s.route} | {s.flight}
          </span>
          <span className="ml-3 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: s.rerouteApproved ? 'var(--wb-green)' : s.alert ? '#f59e0b' : 'var(--wb-green)',
                  color: 'white',
                }}>
            {statusText}
          </span>
        </div>
        {s.rerouteApproved
          ? <CheckCircle className="w-5 h-5" style={{ color: 'var(--wb-green)' }} />
          : s.alert
          ? <AlertTriangle className="w-5 h-5" style={{ color: '#d97706' }} />
          : <CheckCircle className="w-5 h-5" style={{ color: 'var(--wb-green)' }} />
        }
      </div>

      {/* Alert */}
      {s.alert && !s.rerouteApproved && (
        <div className="px-5 py-3 text-sm"
             style={{ background: '#fff9e6', borderBottom: '1px solid #f59e0b33' }}>
          <p className="font-semibold mb-0.5" style={{ color: '#92400e' }}>{s.alert.message}</p>
          <p className="text-xs" style={{ color: '#d97706' }}>
            AI recommendation: {s.alert.recommendation}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onApproveReroute(s.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: 'var(--wb-green)', color: 'white' }}
              aria-label="Approve reroute recommendation and save estimated $940">
              Approve reroute — save $940
            </button>
            <button
              onClick={() => onDeclineReroute(s.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'white', border: '1px solid var(--wb-gray-200)', color: 'var(--wb-gray-500)' }}
              aria-label="Decline reroute recommendation">
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Reroute approved confirmation */}
      {s.rerouteApproved && (
        <div className="px-5 py-3 text-sm"
             style={{ background: 'var(--wb-green-light)', borderBottom: '1px solid #94c94333' }}>
          <p className="font-semibold" style={{ color: '#3d6b10' }}>
            ✓ Reroute approved — cargo redirected via KGL. Updated ETA sent via WhatsApp.
          </p>
        </div>
      )}

      {/* Sensor data */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {[
            {
              icon: Thermometer, label: 'Temp',
              value: `${s.tempC}°C`, target: `Target: ${s.targetTempMin}–${s.targetTempMax}°C`,
              ok: tempOk,
            },
            {
              icon: Droplets, label: 'Humidity',
              value: `${s.humidityPct}%`, target: 'Target: 60–80%',
              ok: s.humidityPct >= 60 && s.humidityPct <= 80,
            },
            {
              icon: Zap, label: 'Shock events',
              value: `${s.shockEvents}`, target: 'Target: 0',
              ok: s.shockEvents === 0,
            },
            {
              icon: Clock, label: 'Shelf life left',
              value: `${s.shelfLifeRemainingDays}d`, target: `ETA: ${s.eta}`,
              ok: s.shelfLifeRemainingDays > 3,
            },
          ].map(({ icon: Icon, label, value, target, ok }) => (
            <div key={label} className="p-3 rounded-xl"
                 aria-label={`${label}: ${value} — ${ok ? 'within target range' : 'outside target range'}. ${target}`}
                 style={{ background: ok ? 'var(--wb-green-light)' : '#fff1f0', border: `1px solid ${ok ? '#94c94333' : '#ef444433'}` }}>
              <Icon className="w-4 h-4 mb-1" style={{ color: ok ? 'var(--wb-green)' : '#ef4444' }} aria-hidden="true" />
              <p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>{label}</p>
              <p className="font-bold text-base" style={{ color: ok ? '#3d6b10' : '#b91c1c' }}>{value}</p>
              <p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>{target}</p>
              <span className="text-xs font-bold" style={{ color: ok ? 'var(--wb-green)' : '#ef4444' }}
                    aria-label={ok ? 'OK' : 'Warning'}>
                {ok ? '✓ OK' : '⚠ Alert'}
              </span>
            </div>
          ))}
        </div>

        {/* Shelf-life bar */}
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--wb-gray-500)' }}>
            <span>Shelf life remaining</span>
            <span style={{ color: riskColor, fontWeight: 700 }}>{s.shelfLifeRemainingDays} days</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--wb-gray-200)' }}
               role="progressbar"
               aria-valuenow={s.shelfLifeRemainingDays}
               aria-valuemin={0}
               aria-valuemax={10}
               aria-label={`Shelf life: ${s.shelfLifeRemainingDays} of 10 days remaining`}>
            <div className="h-full rounded-full transition-all"
                 style={{
                   width: `${Math.min(100, (s.shelfLifeRemainingDays / 10) * 100)}%`,
                   background: riskColor,
                 }} />
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"
             style={{ color: 'var(--wb-gray-500)' }}>
          <span>ETA: <strong style={{ color: 'var(--wb-gray-900)' }}>{s.eta}</strong></span>
          <span>Cold-store: <strong style={{ color: s.coldStore.includes('Confirmed') ? 'var(--wb-green)' : '#d97706' }}>
            {s.coldStore}
          </strong></span>
        </div>
        <div className="flex gap-2 mt-3">
          <Link href={`/track/${s.awb}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                style={{ background: 'var(--wb-sky-light)', color: 'var(--wb-sky)' }}>
            View full telemetry →
          </Link>
          <button
            onClick={() => onContactHandler(s.id)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl"
            style={{ background: 'var(--wb-gray-50)', border: '1px solid var(--wb-gray-200)', color: 'var(--wb-gray-500)' }}>
            Contact handler
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PerishablesPage() {
  const { addToast } = useToast()
  const { t } = useLanguage()
  const [liveTime, setLiveTime] = useState(new Date())
  const [shipments, setShipments] = useState(SHIPMENTS_INITIAL)
  const [contactingId, setContactingId] = useState<string | null>(null)

  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  function handleApproveReroute(id: string) {
    setShipments(prev => prev.map(s =>
      s.id === id ? { ...s, rerouteApproved: true, status: 'Rerouted', alert: null } : s
    ))
    addToast('Reroute approved — cargo redirected via KGL. ETA updated by −4h.', 'success')
  }

  function handleDeclineReroute(id: string) {
    setShipments(prev => prev.map(s =>
      s.id === id ? { ...s, alert: null } : s
    ))
    addToast('Reroute declined. Current routing maintained.', 'info')
  }

  function handleContactHandler(id: string) {
    setContactingId(id)
  }

  const contactingShipment = shipments.find(s => s.id === contactingId)

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
                <h1 className="text-white mb-1" style={{ fontSize: '1.75rem' }}>{t('headPerishables')}</h1>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>
                  Live IoT monitoring for {shipments.length} active perishable shipments.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#94c943' }} aria-hidden="true" />
                <span className="text-xs font-semibold text-white">
                  <span className="sr-only">Status: </span>
                  Demo data · Simulates {liveTime.toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Alert count */}
            {shipments.some(s => s.alert) && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                   style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)' }}
                   role="alert">
                <AlertTriangle className="w-4 h-4" style={{ color: '#fbbf24' }} aria-hidden="true" />
                <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>
                  {shipments.filter(s => s.alert).length} value-loss alert requiring action
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Active shipments */}
          <h2 className="mb-5" style={{ color: 'var(--wb-blue)', fontSize: '1.25rem' }}>
            Active Shipments ({shipments.length})
          </h2>
          <div className="space-y-5 mb-10">
            {shipments.map(s => (
              <ShipmentCard
                key={s.id}
                s={s}
                onApproveReroute={handleApproveReroute}
                onDeclineReroute={handleDeclineReroute}
                onContactHandler={handleContactHandler}
              />
            ))}
          </div>

          {/* 30-day performance stats */}
          <div className="rounded-2xl p-6"
               style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 className="w-5 h-5" style={{ color: 'var(--wb-sky)' }} aria-hidden="true" />
              <h2 style={{ color: 'var(--wb-blue)', fontSize: '1.25rem' }}>
                30-Day Cold-Chain Performance
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map(s => (
                <div key={s.commodity} className="p-4 rounded-xl"
                     style={{ background: 'var(--wb-gray-50)', border: '1px solid var(--wb-gray-200)' }}>
                  <p className="label-upper mb-3" style={{ color: 'var(--wb-gray-500)', fontSize: 10 }}>
                    {s.commodity}
                  </p>
                  {/* On-time bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--wb-gray-500)' }}>On-time</span>
                      <span className="font-bold" style={{ color: 'var(--wb-blue)' }}>{s.onTimePct}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'var(--wb-gray-200)' }}
                         role="progressbar"
                         aria-valuenow={s.onTimePct}
                         aria-valuemin={0}
                         aria-valuemax={100}
                         aria-label={`${s.commodity} on-time rate: ${s.onTimePct}%`}>
                      <div className="h-2 rounded-full" style={{ width: `${s.onTimePct}%`, background: 'var(--wb-green)' }} />
                    </div>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>
                    Avg temp deviation: <strong style={{ color: 'var(--wb-blue)' }}>±{s.avgTempDeviation}°C</strong>
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--wb-gray-500)' }}>
                    Shipments: <strong style={{ color: 'var(--wb-blue)' }}>{s.shipments}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact handler modal */}
      {contactingShipment && (
        <ContactHandlerModal
          awb={contactingShipment.awb}
          commodity={contactingShipment.commodity}
          onClose={() => setContactingId(null)}
        />
      )}

      <Footer />
    </>
  )
}
