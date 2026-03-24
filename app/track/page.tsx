'use client'

import { useState, useRef, useId } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Package, CheckCircle, Clock, AlertTriangle,
  ChevronRight, ArrowLeft, X, Plane, Layers
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// ─── Types + mock data ────────────────────────────────────────────────────────
type ShipStatus = 'on_time' | 'delayed' | 'delivered' | 'in_transit' | 'customs'

interface ShipResult {
  awb: string
  valid: boolean
  origin?: string
  destination?: string
  status?: ShipStatus
  statusLabel?: string
  statusIcon?: string
  flight?: string
  eta?: string
  commodity?: string
  weightKg?: number
}

const STATUS_META: Record<ShipStatus, { label: string; icon: string; bg: string; text: string }> = {
  on_time:    { label: 'On Time',      icon: '✓',  bg: 'rgba(45,125,70,0.10)',   text: 'var(--brand-green)' },
  delivered:  { label: 'Delivered',   icon: '📦', bg: 'rgba(45,125,70,0.10)',   text: 'var(--brand-green)' },
  in_transit: { label: 'In Transit',  icon: '✈',  bg: 'rgba(28,163,219,0.12)',  text: 'var(--brand-light-blue)' },
  delayed:    { label: 'Delayed',     icon: '⚠',  bg: 'rgba(239,68,68,0.10)',   text: '#dc2626' },
  customs:    { label: 'Customs Hold',icon: '🕐', bg: 'rgba(245,158,11,0.12)',  text: '#b45309' },
}

const AWB_REGEX = /^\d{3}-?\d{8}$/

const DEMO_AWBS = ['459-40100001', '459-53104200', '459-62008800']

function mockResult(awb: string): ShipResult {
  const trimmed = awb.trim()
  if (!AWB_REGEX.test(trimmed)) {
    return { awb: trimmed, valid: false }
  }
  const statuses: ShipStatus[] = ['on_time', 'delayed', 'delivered', 'in_transit', 'customs']
  const idx = trimmed.charCodeAt(trimmed.length - 1) % statuses.length
  const status = statuses[idx]
  const meta = STATUS_META[status]
  const origins     = ['KGL', 'EBB', 'NBO']
  const dests       = ['LHR', 'CDG', 'DXB', 'SHJ', 'BRU']
  const commodities = ['Cut flowers', 'Pharmaceuticals', 'General cargo', 'Seafood', 'Apparel']
  const o = origins[idx % origins.length]
  const d = dests[idx % dests.length]
  return {
    awb: trimmed.toUpperCase(),
    valid: true,
    origin: o,
    destination: d,
    status,
    statusLabel: meta.label,
    statusIcon: meta.icon,
    flight: `WB${400 + idx * 3}`,
    eta: status === 'delivered' ? 'Delivered' : `${idx + 1}h ${(idx * 17) % 60}m`,
    commodity: commodities[idx % commodities.length],
    weightKg: 120 + idx * 87,
  }
}

function parseAwbs(raw: string): string[] {
  return raw.split(/[\n,;\s]+/).map(s => s.trim()).filter(Boolean)
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-sm">
      <span className="font-bold text-lg" style={{ color }}>{value}</span>
      <span className="ml-1.5 text-xs" style={{ color: 'var(--wb-gray-500)' }}>{label}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: ShipStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: meta.bg, color: meta.text }}
    >
      <span aria-hidden="true">{meta.icon}</span>
      {meta.label}
    </span>
  )
}

function SkeletonRows() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--wb-gray-200)', background: 'var(--wb-gray-50)' }}>
        <div className="h-3 w-48 rounded animate-pulse" style={{ background: 'var(--wb-gray-200)' }} />
      </div>
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3.5"
          style={{ borderBottom: i < 3 ? '1px solid var(--wb-gray-200)' : 'none' }}
        >
          <div className="h-3 w-20 rounded animate-pulse" style={{ background: 'var(--wb-gray-200)' }} />
          <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'var(--wb-gray-200)' }} />
          <div className="h-3 w-16 rounded animate-pulse" style={{ background: 'var(--wb-gray-200)' }} />
          <div className="h-3 w-28 rounded animate-pulse" style={{ background: 'var(--wb-gray-200)' }} />
          <div className="h-3 w-12 rounded animate-pulse ml-auto" style={{ background: 'var(--wb-gray-200)' }} />
          <div className="h-5 w-20 rounded-full animate-pulse" style={{ background: 'var(--wb-gray-200)' }} />
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TrackPage() {
  const router = useRouter()

  // Tab state
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single')

  // Single AWB state
  const [singleAwb, setSingleAwb]     = useState('')
  const [singleTouched, setSingleTouched] = useState(false)
  const [singleSubmitAttempted, setSingleSubmitAttempted] = useState(false)

  // Bulk state
  const [bulkInput, setBulkInput]     = useState('')
  const [results, setResults]         = useState<ShipResult[] | null>(null)
  const [loading, setLoading]         = useState(false)

  const singleInputId  = useId()
  const bulkInputId    = useId()
  const resultsRegionId = useId()
  const singleErrorId  = useId()
  const singleHintId   = useId()

  const singleInputRef = useRef<HTMLInputElement>(null)

  // ── Validation ──────────────────────────────────────────────────────────────
  const singleAwbTrimmed = singleAwb.trim()
  const singleIsInvalid  = singleAwbTrimmed.length > 0 && !AWB_REGEX.test(singleAwbTrimmed)
  const showSingleError  = singleIsInvalid && (singleTouched || singleSubmitAttempted)

  function handleSingle() {
    setSingleSubmitAttempted(true)
    const val = singleAwbTrimmed
    if (!val) {
      singleInputRef.current?.focus()
      return
    }
    if (singleIsInvalid) return
    router.push(`/track/${val}`)
  }

  async function handleBulkTrack() {
    const awbs = parseAwbs(bulkInput)
    if (!awbs.length) return
    setLoading(true)
    setResults(null)
    await new Promise(r => setTimeout(r, 1100))
    setResults(awbs.map(mockResult))
    setLoading(false)
  }

  const valid          = results?.filter(r => r.valid)  ?? []
  const invalid        = results?.filter(r => !r.valid) ?? []
  const detectedCount  = parseAwbs(bulkInput).length

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="pt-16" style={{ background: 'var(--wb-gray-50)', minHeight: '100vh' }}>

        {/* ── Hero header ──────────────────────────────────────────────────── */}
        <div style={{ background: 'var(--brand-blue, var(--wb-blue))' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm mb-5"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
            <h1 className="text-white mb-2" style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Shipment Tracking
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 300, maxWidth: '36rem' }}>
              Track a single AWB for full sensor detail and timeline, or switch to bulk tracking for up to 50 shipments at once.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ── Tab strip ────────────────────────────────────────────────── */}
          <div
            role="tablist"
            aria-label="Tracking mode"
            className="flex gap-1 p-1 rounded-xl mb-8 w-fit"
            style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}
          >
            {(
              [
                { id: 'single', label: 'Single AWB',            icon: <Search className="w-4 h-4" /> },
                { id: 'bulk',   label: 'Bulk Tracking (up to 50)', icon: <Layers className="w-4 h-4" /> },
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={e => {
                  if (e.key === 'ArrowRight') setActiveTab('bulk')
                  if (e.key === 'ArrowLeft')  setActiveTab('single')
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2"
                style={{
                  background:  activeTab === tab.id ? 'var(--brand-blue, var(--wb-blue))' : 'transparent',
                  color:       activeTab === tab.id ? 'white' : 'var(--wb-gray-500)',
                  outline:     'none',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Single AWB tab panel ──────────────────────────────────────── */}
          <div
            id="tabpanel-single"
            role="tabpanel"
            aria-labelledby="tab-single"
            hidden={activeTab !== 'single'}
          >
            {/* Hero card */}
            <div
              className="rounded-2xl p-8 sm:p-10 mx-auto"
              style={{
                background: 'white',
                border: '1px solid var(--wb-gray-200)',
                boxShadow: '0 4px 24px rgba(4,84,155,0.07)',
                maxWidth: '640px',
              }}
            >
              <div className="text-center mb-8">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                  style={{ background: 'rgba(4,84,155,0.08)' }}
                >
                  <Search className="w-6 h-6" style={{ color: 'var(--brand-blue, var(--wb-blue))' }} />
                </div>
                <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--brand-blue, var(--wb-blue))' }}>
                  Track a Shipment
                </h2>
                <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>
                  Full detail: IoT sensors, event timeline, documents and certificates.
                </p>
              </div>

              <div>
                <label
                  htmlFor={singleInputId}
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: 'var(--wb-gray-900)' }}
                >
                  AWB Number
                </label>

                {/* Input row */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      ref={singleInputRef}
                      id={singleInputId}
                      type="text"
                      placeholder="e.g. 459-40100001"
                      value={singleAwb}
                      onChange={e => { setSingleAwb(e.target.value); setSingleSubmitAttempted(false) }}
                      onBlur={() => setSingleTouched(true)}
                      onKeyDown={e => e.key === 'Enter' && handleSingle()}
                      aria-describedby={`${singleHintId} ${showSingleError ? singleErrorId : ''}`}
                      aria-invalid={showSingleError}
                      className="w-full rounded-xl px-4 py-3.5 text-sm font-semibold outline-none transition-all"
                      style={{
                        border: showSingleError
                          ? '1.5px solid #dc2626'
                          : '1.5px solid var(--wb-gray-200)',
                        color: 'var(--wb-gray-900)',
                        background: showSingleError ? '#fff5f5' : 'white',
                      }}
                    />
                  </div>
                  <button
                    onClick={handleSingle}
                    aria-label="Track shipment"
                    className="px-5 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                    style={{ background: 'var(--brand-blue, var(--wb-blue))', color: 'white', flexShrink: 0 }}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                {/* Inline validation error */}
                {showSingleError && (
                  <p
                    id={singleErrorId}
                    role="alert"
                    className="flex items-center gap-1.5 mt-2 text-xs font-semibold"
                    style={{ color: '#dc2626' }}
                  >
                    <X className="w-3.5 h-3.5 shrink-0" />
                    Please enter a valid AWB number (e.g. 459-40100001)
                  </p>
                )}

                {/* Helper text */}
                <p
                  id={singleHintId}
                  className="mt-2 text-xs"
                  style={{ color: 'var(--wb-gray-500)' }}
                >
                  Format: 3-digit airline prefix + 8 digits, with or without dash (e.g.{' '}
                  <span className="font-mono font-semibold">459-40100001</span> or{' '}
                  <span className="font-mono font-semibold">45940100001</span>)
                </p>

                {/* Demo AWBs */}
                <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--wb-gray-200)' }}>
                  <p className="text-xs mb-2.5" style={{ color: 'var(--wb-gray-500)' }}>
                    Try a demo AWB:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DEMO_AWBS.map(a => (
                      <button
                        key={a}
                        onClick={() => router.push(`/track/${a}`)}
                        className="text-xs font-mono px-3 py-1.5 rounded-lg transition-all hover:opacity-80 active:scale-95"
                        style={{ background: 'rgba(28,163,219,0.1)', color: 'var(--brand-light-blue, var(--wb-sky))' }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bulk tracking tab panel ───────────────────────────────────── */}
          <div
            id="tabpanel-bulk"
            role="tabpanel"
            aria-labelledby="tab-bulk"
            hidden={activeTab !== 'bulk'}
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

              {/* Input column */}
              <div className="lg:col-span-2">
                <div
                  className="rounded-2xl p-6"
                  style={{ background: 'white', border: '1px solid var(--wb-gray-200)', boxShadow: '0 2px 12px rgba(4,84,155,0.05)' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold" style={{ color: 'var(--brand-blue, var(--wb-blue))' }}>
                      Bulk Tracking
                    </h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(28,163,219,0.10)', color: 'var(--brand-light-blue, var(--wb-sky))' }}
                    >
                      Up to 50 AWBs
                    </span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: 'var(--wb-gray-500)' }}>
                    Paste AWBs separated by commas, spaces, or new lines.
                  </p>
                  <label htmlFor={bulkInputId} className="sr-only">AWB numbers (one per line)</label>
                  <textarea
                    id={bulkInputId}
                    value={bulkInput}
                    onChange={e => setBulkInput(e.target.value)}
                    placeholder={'459-40100001\n459-53104200\n459-62008800\n...'}
                    rows={9}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                    style={{
                      border: '1.5px solid var(--wb-gray-200)',
                      color: 'var(--wb-gray-900)',
                      fontFamily: 'monospace',
                      lineHeight: 1.7,
                    }}
                  />
                  <div className="flex items-center justify-between mt-1 mb-3">
                    <span className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>
                      {detectedCount} AWB{detectedCount !== 1 ? 's' : ''} detected
                    </span>
                    {bulkInput && (
                      <button
                        onClick={() => { setBulkInput(''); setResults(null) }}
                        className="text-xs flex items-center gap-0.5"
                        style={{ color: 'var(--wb-gray-500)' }}
                      >
                        <X className="w-3 h-3" /> Clear
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleBulkTrack}
                    disabled={loading || !detectedCount}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                    style={{
                      background: loading || !detectedCount ? 'var(--wb-gray-200)' : 'var(--brand-blue, var(--wb-blue))',
                      color:      loading || !detectedCount ? 'var(--wb-gray-500)' : 'white',
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Tracking…
                      </span>
                    ) : `Track ${detectedCount || ''} shipment${detectedCount !== 1 ? 's' : ''}`}
                  </button>
                </div>
              </div>

              {/* Results column */}
              <div
                id={resultsRegionId}
                className="lg:col-span-3"
                aria-live="polite"
                aria-atomic="false"
                aria-label="Tracking results"
              >
                {/* Empty state */}
                {!results && !loading && (
                  <div
                    className="flex flex-col items-center justify-center py-24 text-center"
                    style={{ border: '2px dashed var(--wb-gray-200)', borderRadius: '1.5rem', background: 'white' }}
                  >
                    <Package className="w-12 h-12 mb-4" style={{ color: 'var(--wb-gray-200)' }} />
                    <p className="font-semibold" style={{ color: 'var(--brand-blue, var(--wb-blue))' }}>
                      Enter AWB numbers to see live status
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--wb-gray-500)' }}>
                      Paste up to 50 AWBs on the left to get started
                    </p>
                  </div>
                )}

                {/* Loading skeletons */}
                {loading && (
                  <div aria-busy="true" aria-label="Loading tracking results">
                    <p className="text-xs font-semibold mb-3" style={{ color: 'var(--wb-gray-500)' }}>
                      Fetching live status…
                    </p>
                    <SkeletonRows />
                  </div>
                )}

                {/* Results */}
                {results && !loading && (
                  <div className="space-y-4">
                    {/* Summary bar */}
                    <div
                      className="flex flex-wrap gap-6 p-4 rounded-xl"
                      style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}
                    >
                      <Stat label="Total"      value={results.length} color="var(--brand-blue, var(--wb-blue))" />
                      <Stat label="On track"   value={valid.filter(r => r.status === 'delivered' || r.status === 'on_time').length} color="var(--brand-green, #4a7c20)" />
                      <Stat label="In transit" value={valid.filter(r => r.status === 'in_transit').length} color="var(--brand-light-blue, var(--wb-sky))" />
                      <Stat label="Delayed"    value={valid.filter(r => r.status === 'delayed').length} color="#dc2626" />
                      {invalid.length > 0 && <Stat label="Not found" value={invalid.length} color="#b45309" />}
                    </div>

                    {/* Table */}
                    {valid.length > 0 && (
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}
                      >
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm" aria-label="Shipment tracking results">
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--wb-gray-200)', background: 'var(--wb-gray-50)' }}>
                                {['AWB', 'Route', 'Flight', 'Commodity', 'ETA', 'Status', ''].map(h => (
                                  <th
                                    key={h}
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-semibold"
                                    style={{ color: 'var(--wb-gray-500)', whiteSpace: 'nowrap' }}
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {valid.map((r, i) => {
                                const meta = STATUS_META[r.status!]
                                return (
                                  <tr
                                    key={r.awb}
                                    style={{ borderBottom: i < valid.length - 1 ? '1px solid var(--wb-gray-200)' : 'none' }}
                                  >
                                    <td className="px-4 py-3">
                                      <span
                                        className="font-bold text-xs"
                                        style={{ color: 'var(--brand-blue, var(--wb-blue))', fontFamily: 'monospace' }}
                                      >
                                        {r.awb}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span
                                        className="flex items-center gap-1 text-xs font-semibold whitespace-nowrap"
                                        style={{ color: 'var(--wb-gray-900)' }}
                                      >
                                        {r.origin} <ChevronRight className="w-3 h-3 shrink-0" /> {r.destination}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--wb-gray-500)' }}>
                                      {r.flight}
                                    </td>
                                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--wb-gray-500)' }}>
                                      {r.commodity}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--wb-gray-900)' }}>
                                      {r.eta}
                                    </td>
                                    <td className="px-4 py-3">
                                      <StatusBadge status={r.status!} />
                                    </td>
                                    <td className="px-4 py-3">
                                      <Link
                                        href={`/track/${r.awb}`}
                                        className="inline-flex items-center gap-0.5 text-xs font-bold whitespace-nowrap"
                                        style={{ color: 'var(--brand-light-blue, var(--wb-sky))' }}
                                        aria-label={`View detail for ${r.awb}`}
                                      >
                                        Detail <ChevronRight className="w-3 h-3" />
                                      </Link>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Invalid AWBs */}
                    {invalid.length > 0 && (
                      <div
                        className="rounded-xl p-4"
                        style={{ background: '#fff9e6', border: '1px solid rgba(245,158,11,0.3)' }}
                        role="region"
                        aria-label="Unrecognised AWBs"
                      >
                        <p className="text-sm font-bold mb-2" style={{ color: '#92400e' }}>
                          AWBs not recognised ({invalid.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {invalid.map(r => (
                            <span
                              key={r.awb}
                              className="text-xs px-2 py-1 rounded"
                              style={{ background: 'rgba(245,158,11,0.12)', color: '#b45309', fontFamily: 'monospace' }}
                            >
                              {r.awb}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs mt-2" style={{ color: 'var(--wb-gray-500)' }}>
                          AWBs must be in the format 3-digit airline prefix + 8 digits
                          (e.g. <span className="font-mono font-semibold">459-40100001</span>).
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}
