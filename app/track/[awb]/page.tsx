'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Thermometer, Droplets, Zap, MapPin, Clock,
  Download, MessageCircle, AlertTriangle, CheckCircle,
  ArrowLeft, Plane, Package, Shield
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useToast } from '@/components/ui/Toast'

// ─── Types ────────────────────────────────────────────────────────────────────
type CommodityType = 'flowers' | 'seafood' | 'pharma' | 'general'

const COMMODITY_MAP: Record<string, CommodityType> = {
  'fresh-cut roses': 'flowers',
  'roses':           'flowers',
  'tulips':          'flowers',
  'cut flowers':     'flowers',
  'fresh seafood':   'seafood',
  'seafood':         'seafood',
  'pharmaceutical':  'pharma',
  'pharma':          'pharma',
}

function getCommodityType(commodity: string): CommodityType {
  const key = commodity.toLowerCase()
  for (const [k, v] of Object.entries(COMMODITY_MAP)) {
    if (key.includes(k)) return v
  }
  return 'general'
}

// ─── Mock shipment data ───────────────────────────────────────────────────────
const MOCK_SHIPMENTS: Record<string, {
  awb: string
  origin: string
  destination: string
  commodity: string
  commodityType: CommodityType
  weightKg: number
  client: string
  flightNumber: string
  status: string
  timeline: { stage: string; timestamp: string; location: string; done: boolean; active: boolean }[]
  sensors: { tempC: number; humidityPct: number; shockEvents: number; altitudeFt: number; aiConfidence: number }
  etaHours: number
  whatsappActive: boolean
  whatsappLog: { message: string; time: string }[]
  alert?: { type: string; message: string; recommendation: string }
}> = {
  '459-40100001': {
    awb: '459-40100001',
    origin: 'KGL', destination: 'LHR',
    commodity: 'Fresh-cut roses', commodityType: 'flowers',
    weightKg: 3000,
    client: 'Kigali Flowers Ltd',
    flightNumber: 'WB401',
    status: 'IN_TRANSIT',
    timeline: [
      { stage: 'Collected',         timestamp: 'Mar 20, 14:30',      location: 'Kigali Cold-store',    done: true,  active: false },
      { stage: 'Customs cleared',   timestamp: 'Mar 20, 17:45',      location: 'KGL Customs, Rwanda',   done: true,  active: false },
      { stage: 'Departed origin',   timestamp: 'Mar 20, 22:18',      location: 'KGL Kigali Intl.',      done: true,  active: false },
      { stage: 'In transit',        timestamp: 'Mar 21, 04:12',      location: '33,000ft over Sudan',   done: false, active: true  },
      { stage: 'Arrived hub',       timestamp: 'Est. Mar 21, 07:10', location: 'LHR Terminal 4',        done: false, active: false },
      { stage: 'Departed hub',      timestamp: '—',                  location: '—',                     done: false, active: false },
      { stage: 'Delivered',         timestamp: 'Est. Mar 21, 08:30', location: 'LHR Cargo Centre',      done: false, active: false },
    ],
    sensors: { tempC: 4.2, humidityPct: 68, shockEvents: 0, altitudeFt: 33000, aiConfidence: 0.94 },
    etaHours: 3,
    whatsappActive: true,
    whatsappLog: [
      { message: '✅ Booking confirmed AWB: 459-40100001. KGL → LHR, Dep: Today 22:15.', time: '14:32' },
      { message: '✈️ Your cargo departed KGL on time. Flight WB401. ETA LHR: Mar 21, 07:50 local. Temp: 4.2°C ✓', time: '22:20' },
      { message: '📡 Temp check: 4.1°C ✓. Humidity: 68% ✓. Shock events: 0. Over Sudan, all nominal.', time: '02:15' },
    ],
  },
  '459-53104200': {
    awb: '459-53104200',
    origin: 'EBB', destination: 'DXB',
    commodity: 'Fresh seafood', commodityType: 'seafood',
    weightKg: 320,
    client: 'Lake Victoria Exports',
    flightNumber: 'WB531',
    status: 'DELAYED',
    timeline: [
      { stage: 'Collected',       timestamp: 'Mar 20, 10:00', location: 'Entebbe Port', done: true, active: false },
      { stage: 'Customs cleared', timestamp: 'Mar 20, 13:20', location: 'EBB Customs',  done: true, active: false },
      { stage: 'Departed origin', timestamp: 'Mar 20, 16:45', location: 'EBB Entebbe',  done: true, active: false },
      { stage: 'In transit',      timestamp: 'Mar 20, 20:00', location: 'KGL Hub',      done: false, active: true },
      { stage: 'Arrived hub',     timestamp: '—',             location: '—',            done: false, active: false },
      { stage: 'Departed hub',    timestamp: '—',             location: '—',            done: false, active: false },
      { stage: 'Delivered',       timestamp: '—',             location: '—',            done: false, active: false },
    ],
    sensors: { tempC: 2.8, humidityPct: 85, shockEvents: 1, altitudeFt: 0, aiConfidence: 0.71 },
    etaHours: 8,
    whatsappActive: true,
    whatsappLog: [
      { message: '✅ Booking confirmed AWB: 459-53104200. EBB → DXB. Dep: Today 16:45.', time: '10:05' },
      { message: '⚠️ Connecting flight EK-812 delayed 3h. Updated ETA: +3h. AI reroute recommendation available.', time: '19:30' },
    ],
    alert: {
      type: 'DELAY_RISK',
      message: 'Connecting flight EK-812 delayed 3h. This shipment will lose est. 18% market value (~$940) if delay confirmed.',
      recommendation: 'Reroute via KGL tonight — 4h faster. Alternative space confirmed on WB531.',
    },
  },
}

// ─── Document definitions ─────────────────────────────────────────────────────
function getDocuments(commodityType: CommodityType) {
  return [
    { name: 'Airway Bill (AWB)', ready: true },
    { name: 'Customs Declaration', ready: true },
    { name: 'Temperature Certificate', ready: commodityType === 'flowers' || commodityType === 'seafood' },
    { name: 'Carbon Certificate', ready: true },
    { name: 'Phytosanitary Certificate', ready: commodityType === 'flowers' },
    { name: 'Packing List', ready: true },
  ]
}

// ─── IoT sensor cell ─────────────────────────────────────────────────────────
function SensorCell({ icon: Icon, label, value, unit, ok, description }: {
  icon: typeof Thermometer
  label: string
  value: string | number
  unit?: string
  ok: boolean
  description: string
}) {
  return (
    <div className="p-4 rounded-xl text-center"
         aria-label={`${label}: ${value}${unit ?? ''} — ${description}`}
         style={{ background: ok ? 'var(--wb-green-light)' : '#fff1f0', border: `1px solid ${ok ? '#94c94344' : '#ef444444'}` }}>
      <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: ok ? 'var(--wb-green)' : '#ef4444' }} aria-hidden="true" />
      <p className="text-xs mb-1" style={{ color: 'var(--wb-gray-500)' }}>{label}</p>
      <p className="font-bold text-lg" style={{ color: ok ? '#3d6b10' : '#b91c1c' }}>
        {value}{unit}
      </p>
      <span className="text-xs font-semibold" style={{ color: ok ? 'var(--wb-green)' : '#ef4444' }}>
        {ok ? '✓ OK' : '⚠ Alert'}
      </span>
    </div>
  )
}

// ─── Notification preferences panel ──────────────────────────────────────────
type NotifChannel = 'whatsapp' | 'email' | 'sms'

function NotificationPanel({ awb }: { awb: string }) {
  const { addToast } = useToast()
  const [channels, setChannels] = useState<Record<NotifChannel, boolean>>({
    whatsapp: true,
    email:    false,
    sms:      false,
  })
  const [contact, setContact] = useState({ whatsapp: '+250 7XX XXX XXX', email: '', sms: '' })
  const [editing, setEditing] = useState(false)
  const [events, setEvents] = useState({
    departure:  true,
    delay:      true,
    customs:    true,
    arrival:    true,
    tempAlert:  false,
  })

  function toggle(ch: NotifChannel) {
    setChannels(prev => ({ ...prev, [ch]: !prev[ch] }))
  }

  function save() {
    setEditing(false)
    addToast(`Notification preferences saved for ${awb}`, 'success')
  }

  const CHANNEL_DEFS: { key: NotifChannel; label: string; color: string; placeholder: string }[] = [
    { key: 'whatsapp', label: 'WhatsApp', color: '#25D366', placeholder: '+250 7XX XXX XXX' },
    { key: 'email',    label: 'Email',    color: 'var(--wb-sky)', placeholder: 'name@company.com' },
    { key: 'sms',      label: 'SMS',      color: 'var(--wb-blue)', placeholder: '+44 7XXX XXX XXX' },
  ]

  const EVENT_LABELS: Record<string, string> = {
    departure:  'Departure confirmed',
    delay:      'Flight delays',
    customs:    'Customs updates',
    arrival:    'Arrival & delivery',
    tempAlert:  'Temperature alerts',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold" style={{ color: 'var(--wb-blue)' }}>Notification Preferences</p>
        <button
          onClick={() => editing ? save() : setEditing(true)}
          className="text-xs font-bold px-3 py-1 rounded-lg transition-all"
          style={{
            background: editing ? 'var(--wb-blue)' : 'var(--wb-sky-light)',
            color: editing ? 'white' : 'var(--wb-sky)',
          }}>
          {editing ? 'Save' : 'Edit'}
        </button>
      </div>

      {/* Channel toggles */}
      <div className="space-y-2 mb-3">
        {CHANNEL_DEFS.map(({ key, label, color, placeholder }) => (
          <div key={key}>
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggle(key)}
                  aria-pressed={channels[key]}
                  className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0"
                  style={{ background: channels[key] ? color : 'var(--wb-gray-200)' }}>
                  <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                        style={{ left: channels[key] ? '18px' : '2px' }} />
                </button>
                <span className="text-xs font-semibold" style={{ color: channels[key] ? color : 'var(--wb-gray-500)' }}>
                  {label}
                </span>
              </div>
              {channels[key] && (
                <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                      style={{ background: 'rgba(148,201,67,0.12)', color: '#4a7c20' }}>
                  Active
                </span>
              )}
            </div>
            {channels[key] && editing && (
              <input
                type={key === 'email' ? 'email' : 'tel'}
                value={contact[key]}
                onChange={e => setContact(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full rounded-lg px-3 py-2 text-xs outline-none mt-0.5"
                style={{ border: '1px solid var(--wb-gray-200)', color: 'var(--wb-gray-900)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Event triggers */}
      {editing && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--wb-gray-200)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--wb-gray-500)' }}>
            Notify me about:
          </p>
          <div className="space-y-1.5">
            {Object.entries(EVENT_LABELS).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={events[key as keyof typeof events]}
                  onChange={() => setEvents(prev => ({ ...prev, [key]: !prev[key as keyof typeof events] }))}
                  className="rounded"
                />
                <span className="text-xs" style={{ color: 'var(--wb-gray-900)' }}>{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Not found state ──────────────────────────────────────────────────────────
function TrackNotFound({ awb }: { awb: string }) {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState(awb)

  function handleTrack() {
    const trimmed = searchInput.trim()
    if (trimmed) router.push(`/track/${trimmed}`)
  }

  return (
    <>
      <Navbar />
      <div className="pt-16" style={{ background: 'var(--wb-blue)', minHeight: '100vh' }}>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-8"
                style={{ color: 'rgba(255,255,255,0.6)' }}>
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <Package className="w-16 h-16 mx-auto mb-6" style={{ color: 'rgba(255,255,255,0.2)' }} aria-hidden="true" />
          <h2 className="text-white mb-3">Shipment not found</h2>
          <p className="mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
            No shipment found for AWB <strong className="text-white">{awb}</strong>. Please check the number and try again, or contact our cargo desk.
          </p>
          <div className="flex items-center gap-0 rounded-full overflow-hidden max-w-sm mx-auto"
               style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)' }}>
            <input
              type="text"
              placeholder="Enter AWB number…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTrack()}
              aria-label="AWB number"
              className="flex-1 bg-transparent px-5 py-3 text-sm text-white placeholder-white/40 outline-none"
            />
            <button
              onClick={handleTrack}
              className="px-5 py-3 text-sm font-bold shrink-0"
              style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)' }}
            >
              Track
            </button>
          </div>
          <p className="mt-8 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Need help? Call <a href="tel:+250788177000" className="text-white font-semibold hover:underline">+250 788 177 000</a> or email <a href="mailto:cargo@rwandair.com" className="text-white font-semibold hover:underline">cargo@rwandair.com</a>
          </p>
        </div>
      </div>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TrackPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const awb = (params?.awb as string) || ''
  const [searchInput, setSearchInput] = useState(awb)
  const [alertDismissed, setAlertDismissed] = useState(false)

  const rawShipment = MOCK_SHIPMENTS[awb] ?? null
  if (!rawShipment) return <TrackNotFound awb={awb} />

  const shipment = { ...rawShipment }
  const isDelayed = shipment.status === 'DELAYED'
  const docs = getDocuments(shipment.commodityType)

  function handleApproveReroute() {
    setAlertDismissed(true)
    addToast('Reroute approved — cargo redirected via KGL. ETA updated, WhatsApp confirmation sent.', 'success')
  }

  function handleDeclineReroute() {
    setAlertDismissed(true)
    addToast('Reroute declined. Current routing maintained.', 'info')
  }

  function handleDownload(docName: string) {
    // Generate a simple text-based AWB document
    const content = [
      `RwandAir Cargo — ${docName}`,
      '─'.repeat(50),
      `AWB Number:    ${shipment.awb}`,
      `Origin:        ${shipment.origin}`,
      `Destination:   ${shipment.destination}`,
      `Commodity:     ${shipment.commodity}`,
      `Weight:        ${shipment.weightKg.toLocaleString()} kg`,
      `Client:        ${shipment.client}`,
      `Flight:        ${shipment.flightNumber}`,
      `Status:        ${shipment.status}`,
      '─'.repeat(50),
      `Generated: ${new Date().toISOString()}`,
      'RwandAir Ltd · cargo@rwandair.com · +250 788 177 000',
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${shipment.awb}_${docName.replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
    addToast(`${docName} downloaded.`, 'success')
  }

  function handleTrack() {
    const trimmed = searchInput.trim()
    if (trimmed) router.push(`/track/${trimmed}`)
  }

  return (
    <>
      <Navbar />
      <div className="pt-16" style={{ background: 'var(--wb-gray-50)', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: 'var(--wb-blue)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-5"
                  style={{ color: 'rgba(255,255,255,0.6)' }}>
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <h1 className="text-white mb-1" style={{ fontSize: '1.75rem' }}>
                  Track Shipment
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 300 }}>
                  AWB: <strong className="text-white">{awb}</strong> · {shipment.commodity} · {shipment.weightKg.toLocaleString()}kg
                </p>
              </div>
              {/* Search */}
              <div className="flex items-center gap-0 rounded-full overflow-hidden"
                   style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleTrack()}
                       className="px-4 py-2 text-sm bg-transparent text-white placeholder-white/40 outline-none"
                       placeholder="Enter AWB…"
                       aria-label="Search AWB number" />
                <button onClick={handleTrack}
                        className="px-4 py-2 text-sm font-bold"
                        style={{ background: 'var(--wb-sky)', color: 'white' }}>
                  Track
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Alert banner */}
          {shipment.alert && !alertDismissed && (
            <div className="mb-6 p-5 rounded-2xl flex flex-wrap items-start gap-4"
                 style={{ background: '#fff9e6', border: '1.5px solid #f59e0b66' }}
                 role="alert">
              <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" style={{ color: '#d97706' }} aria-hidden="true" />
              <div className="flex-1">
                <p className="font-bold text-sm mb-1" style={{ color: '#92400e' }}>
                  VALUE-LOSS ALERT — {shipment.commodity} ({shipment.origin}→{shipment.destination}, {shipment.weightKg}kg)
                </p>
                <p className="text-sm" style={{ color: '#78350f' }}>{shipment.alert.message}</p>
                <p className="text-xs mt-1 font-semibold" style={{ color: '#d97706' }}>
                  AI recommendation: {shipment.alert.recommendation}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleApproveReroute}
                  className="px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: 'var(--wb-green)', color: 'white' }}
                  aria-label="Approve reroute — estimated saving $940">
                  Approve reroute
                </button>
                <button
                  onClick={handleDeclineReroute}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'white', border: '1px solid var(--wb-gray-200)', color: 'var(--wb-gray-500)' }}
                  aria-label="Decline reroute recommendation">
                  Decline
                </button>
              </div>
            </div>
          )}

          {/* Status badge */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold"
                  style={{
                    background: isDelayed ? '#fff9e6' : 'var(--wb-green-light)',
                    color: isDelayed ? '#d97706' : '#3d6b10',
                    border: `1px solid ${isDelayed ? '#f59e0b44' : '#94c94344'}`,
                  }}
                  aria-label={`Status: ${isDelayed ? 'Delay risk detected' : 'In transit — on schedule'}`}>
              {isDelayed
                ? <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                : <CheckCircle className="w-4 h-4" aria-hidden="true" />}
              {isDelayed ? 'Delay risk detected' : 'In transit — on schedule'}
            </span>
            <span className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>
              Flight {shipment.flightNumber} · ETA in ~{shipment.etaHours}h
            </span>
            {shipment.whatsappActive && (
              <span className="flex items-center gap-1 text-xs font-semibold"
                    style={{ color: '#25D366' }}>
                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" /> WhatsApp updates active
              </span>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-2xl p-6 mb-6"
               style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
            <h3 className="mb-6" style={{ color: 'var(--wb-blue)' }}>Shipment Timeline</h3>
            <div className="relative" role="list" aria-label="Shipment timeline">
              {/* Track line */}
              <div className="absolute top-4 left-4 right-4 h-0.5"
                   style={{ background: 'var(--wb-gray-200)' }} aria-hidden="true" />
              <div className="relative flex justify-between">
                {shipment.timeline.map((step, i) => (
                  <div key={i} className="flex flex-col items-center" style={{ flex: 1 }} role="listitem">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center z-10 mb-2 transition-all"
                         aria-label={`${step.stage}: ${step.done ? 'completed' : step.active ? 'active' : 'upcoming'}`}
                         style={{
                           background: step.done ? 'var(--wb-blue)' : step.active ? 'var(--wb-sky)' : 'var(--wb-gray-200)',
                           border: step.active ? '3px solid rgba(30,162,220,0.3)' : 'none',
                           animation: step.active ? 'hubPulse 2s ease-in-out infinite' : 'none',
                         }}>
                      {step.done
                        ? <CheckCircle className="w-4 h-4 text-white" aria-hidden="true" />
                        : step.active
                        ? <Plane className="w-4 h-4 text-white" aria-hidden="true" />
                        : <div className="w-3 h-3 rounded-full bg-white" aria-hidden="true" />
                      }
                    </div>
                    <p className="text-center text-xs font-semibold" style={{
                      color: step.done || step.active ? 'var(--wb-blue)' : 'var(--wb-gray-500)',
                      lineHeight: 1.3
                    }}>
                      {step.stage}
                    </p>
                    {(step.done || step.active) && (
                      <>
                        <p className="text-xs text-center mt-1" style={{ color: 'var(--wb-gray-500)', fontSize: '10px' }}>
                          {step.timestamp}
                        </p>
                        <p className="text-xs text-center" style={{ color: 'var(--wb-sky)', fontSize: '10px' }}>
                          {step.location}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* IoT Sensor panel */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl p-6 mb-6"
                   style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 style={{ color: 'var(--wb-blue)' }}>Live IoT Sensor Data</h3>
                  <span className="flex items-center gap-1.5 text-xs font-semibold"
                        style={{ color: 'var(--wb-sky)' }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--wb-sky)' }} aria-hidden="true" />
                    Demo data
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <SensorCell icon={Thermometer} label="Temperature" value={shipment.sensors.tempC} unit="°C"
                              ok={shipment.sensors.tempC >= 2 && shipment.sensors.tempC <= 8}
                              description="Target: 2–8°C" />
                  <SensorCell icon={Droplets} label="Humidity" value={shipment.sensors.humidityPct} unit="%"
                              ok={shipment.sensors.humidityPct >= 60 && shipment.sensors.humidityPct <= 80}
                              description="Target: 60–80%" />
                  <SensorCell icon={Zap} label="Shock events" value={shipment.sensors.shockEvents} unit=""
                              ok={shipment.sensors.shockEvents === 0}
                              description="Target: 0" />
                  <SensorCell icon={MapPin} label="Altitude" value={`${(shipment.sensors.altitudeFt / 1000).toFixed(0)}k`} unit="ft"
                              ok={true}
                              description="Current altitude" />
                  <SensorCell icon={Shield} label="AI confidence" value={`${Math.round(shipment.sensors.aiConfidence * 100)}%`} unit=""
                              ok={shipment.sensors.aiConfidence > 0.85}
                              description="Target: >85%" />
                </div>
              </div>

              {/* Documents */}
              <div className="rounded-2xl p-6"
                   style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                <h3 className="mb-4" style={{ color: 'var(--wb-blue)' }}>Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {docs.map(doc => (
                    <div key={doc.name}
                         className="flex items-center justify-between p-3 rounded-xl"
                         style={{ background: 'var(--wb-gray-50)', border: '1px solid var(--wb-gray-200)' }}>
                      <span className="text-sm font-semibold" style={{ color: 'var(--wb-gray-900)' }}>
                        {doc.name}
                      </span>
                      {doc.ready ? (
                        <button
                          onClick={() => handleDownload(doc.name)}
                          className="flex items-center gap-1 text-xs font-bold"
                          style={{ color: 'var(--wb-sky)', background: 'none', border: 'none', cursor: 'pointer' }}
                          aria-label={`Download ${doc.name}`}>
                          <Download className="w-3.5 h-3.5" aria-hidden="true" /> Download
                        </button>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>Pending</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notification prefs + WhatsApp log */}
            <div>
              <div className="rounded-2xl p-6 sticky top-24 space-y-5"
                   style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>

                {/* Notification preferences */}
                <NotificationPanel awb={shipment.awb} />

                {/* WhatsApp message log */}
                <div style={{ borderTop: '1px solid var(--wb-gray-200)', paddingTop: '1.25rem' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageCircle className="w-4 h-4" style={{ color: '#25D366' }} aria-hidden="true" />
                    <p className="text-sm font-bold" style={{ color: 'var(--wb-blue)' }}>Update History</p>
                  </div>
                  <div className="space-y-3" aria-label="WhatsApp message history" role="log">
                    {shipment.whatsappLog.map((msg, i) => (
                      <div key={i} className="flex justify-end">
                        <div className="wa-bubble px-3 py-2 max-w-xs">
                          <p className="text-xs leading-relaxed" style={{ color: '#111' }}>{msg.message}</p>
                          <p className="text-right text-xs mt-1" style={{ color: '#aaa' }}>
                            <time>{msg.time}</time>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipment summary */}
                <div className="space-y-2 pt-4" style={{ borderTop: '1px solid var(--wb-gray-200)' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--wb-gray-500)' }}>
                    Shipment summary
                  </p>
                  {[
                    ['Client', shipment.client],
                    ['Origin', shipment.origin],
                    ['Destination', shipment.destination],
                    ['Commodity', shipment.commodity],
                    ['Weight', `${shipment.weightKg.toLocaleString()}kg`],
                    ['Flight', shipment.flightNumber],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span style={{ color: 'var(--wb-gray-500)' }}>{k}</span>
                      <span className="font-semibold" style={{ color: 'var(--wb-gray-900)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
