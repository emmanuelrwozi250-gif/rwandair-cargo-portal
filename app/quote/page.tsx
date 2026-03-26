'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Zap, Clock, Shield, Leaf, Upload, ChevronRight,
  AlertTriangle, CheckCircle, Info, ArrowLeft, Scale,
  Thermometer, Star, Heart, Package, Plane, XCircle
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDeparture(isoStr: string): string {
  try {
    const d    = new Date(isoStr)
    const now  = new Date()
    const diff = (d.getTime() - now.getTime()) / 3_600_000
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    if (diff < 10)  return `${time} tonight`
    if (diff < 24)  return `${time} today`
    if (diff < 48)  return `${time} tomorrow`
    return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return isoStr }
}

// ─── Types ────────────────────────────────────────────────────────────────────
type CommodityType = 'GENERAL' | 'PHARMACEUTICAL' | 'PERISHABLE' | 'DANGEROUS_GOODS' | 'LIVE_ANIMALS' | 'HIGH_VALUE'

interface QuoteOption {
  type: 'fastest' | 'cheapest' | 'reliable'
  label: string
  badge: string
  badgeColor: string
  route: string[]
  priceUsd: number
  transitHours: number
  departure: string
  onTimePct: number
  co2Kg: number
  recommended?: boolean
}

interface PerishableRisk {
  shelfLifeRemainingDays: number
  riskLevel: 'low' | 'medium' | 'high'
  recommendation: string
}

// ─── Mock quote generation ────────────────────────────────────────────────────
function generateQuotes(
  origin: string,
  destination: string,
  commodity: CommodityType,
  weightKg: number
): { options: QuoteOption[], perishableRisk?: PerishableRisk } {
  const baseRate = commodity === 'PHARMACEUTICAL' ? 8.5
    : commodity === 'PERISHABLE' ? 7.2
    : commodity === 'HIGH_VALUE' ? 9.0
    : commodity === 'LIVE_ANIMALS' ? 10.0
    : commodity === 'DANGEROUS_GOODS' ? 8.0
    : 5.5

  const basePrice = Math.round(baseRate * weightKg)

  const options: QuoteOption[] = [
    {
      type: 'fastest',
      label: 'FASTEST',
      badge: '⭐ Recommended',
      badgeColor: '#fee014',
      route: [origin, destination],
      priceUsd: Math.round(basePrice * 1.15),
      transitHours: 11,
      departure: '22:15 tonight',
      onTimePct: 96.8,
      co2Kg: Math.round(weightKg * 1.68),
      recommended: true,
    },
    {
      type: 'cheapest',
      label: 'CHEAPEST',
      badge: 'Save 18%',
      badgeColor: '#94c943',
      route: [origin, 'DXB', destination],
      priceUsd: Math.round(basePrice * 0.94),
      transitHours: 16,
      departure: '06:30 tomorrow',
      onTimePct: 93.2,
      co2Kg: Math.round(weightKg * 1.92),
    },
    {
      type: 'reliable',
      label: 'MOST RELIABLE',
      badge: '99.1% on-time',
      badgeColor: '#1ea2dc',
      route: [origin, destination],
      priceUsd: Math.round(basePrice * 1.1),
      transitHours: 11,
      departure: '22:15 tonight',
      onTimePct: 99.1,
      co2Kg: Math.round(weightKg * 1.68),
    },
  ]

  if (commodity === 'PERISHABLE') {
    const bestTransit = 11
    const remaining = 7 - bestTransit / 24
    return {
      options,
      perishableRisk: {
        shelfLifeRemainingDays: Math.round(remaining * 10) / 10,
        riskLevel: remaining > 4 ? 'low' : remaining > 2 ? 'medium' : 'high',
        recommendation: remaining < 2
          ? 'Direct routing only — via-hub options risk spoilage.'
          : 'Direct routing recommended to maximize shelf life on arrival.',
      },
    }
  }
  return { options }
}

// ─── Quote option card ────────────────────────────────────────────────────────
function QuoteCard({
  option,
  selected,
  onSelect,
}: {
  option: QuoteOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className="relative text-left w-full rounded-2xl p-6 transition-all"
      style={{
        background: 'white',
        border: selected
          ? '2px solid var(--wb-yellow)'
          : '1px solid var(--wb-gray-200)',
        boxShadow: selected
          ? '0 0 0 4px rgba(254,224,20,0.12), 0 8px 24px rgba(0,82,155,0.12)'
          : '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {option.recommended && (
        <div className="absolute -top-3 left-6">
          <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)' }}>
            ⭐ Recommended
          </span>
        </div>
      )}

      {/* Label */}
      <p className="label-upper mb-3" style={{ color: 'var(--wb-blue)', fontSize: 10 }}>
        {option.label}
      </p>

      {/* Badge */}
      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-4"
            style={{
              background: `${option.badgeColor}22`,
              color: option.type === 'cheapest' ? '#4a7c20' : option.type === 'reliable' ? '#0a7ea4' : '#8a6d00',
            }}>
        {option.badge}
      </span>

      {/* Price */}
      <div className="mb-1">
        <p className="price-unit">FROM</p>
        <p className="price-large">${option.priceUsd.toLocaleString()}</p>
        <p className="price-label">per shipment</p>
      </div>

      {/* Route details */}
      <div className="mt-4 pt-4 space-y-2 text-sm"
           style={{ borderTop: '1px solid var(--wb-gray-200)', color: 'var(--wb-gray-500)' }}>
        <div className="flex items-center gap-2">
          <span className="font-semibold" style={{ color: 'var(--wb-blue)' }}>
            {option.route.join(' → ')}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Departure:</span>
          <span className="font-semibold text-right" style={{ color: 'var(--wb-gray-900)' }}>
            {option.departure}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Transit time:</span>
          <span className="font-semibold" style={{ color: 'var(--wb-gray-900)' }}>
            {option.transitHours}h
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>On-time:</span>
          <span className="font-semibold" style={{ color: 'var(--wb-green)' }}>
            {option.onTimePct}%
          </span>
        </div>
      </div>

      {/* CO2 */}
      <div className="mt-4 pt-4 space-y-1"
           style={{ borderTop: '1px solid var(--wb-gray-200)' }}>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1" style={{ color: 'var(--wb-gray-500)' }}>
            <Leaf className="w-3.5 h-3.5" style={{ color: 'var(--wb-green)' }} />
            CO₂ est.
          </span>
          <span className="font-semibold" style={{ color: 'var(--wb-gray-900)' }}>
            {option.co2Kg}kg
          </span>
        </div>
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--wb-gray-500)' }}>
          <span>Carbon offset</span>
          <span className="font-semibold" style={{ color: 'var(--wb-green)' }}>Included</span>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-5">
        <div className="w-full py-2.5 rounded-xl text-sm font-bold text-center transition-all"
             style={{
               background: selected ? 'var(--wb-yellow)' : 'var(--wb-sky-light)',
               color: selected ? 'var(--wb-blue)' : 'var(--wb-sky)',
             }}>
          {selected ? '✓ Selected — Proceed to book' : 'Book this option'}
        </div>
      </div>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const ORIGINS = ['KGL', 'EBB', 'NBO', 'DAR', 'LOS', 'JNB', 'ADD']
const DESTINATIONS_LIST = ['LHR', 'CDG', 'BRU', 'DXB', 'SHJ', 'DOH', 'JIB', 'DWC', 'LOS', 'ACC', 'JNB', 'LUN', 'NBO', 'DAR', 'ZNZ', 'MBA']

const WB_PRODUCT_OPTIONS: {
  value: CommodityType
  name: string
  tagline: string
  multiplier: string
  color: string
  bgColor: string
  icon: React.ElementType
}[] = [
  { value: 'GENERAL',         name: 'WB General',   tagline: 'Standard cargo, all routes',      multiplier: 'Standard rate',       color: '#00509E', bgColor: 'rgba(0,80,158,0.07)',    icon: Package },
  { value: 'PERISHABLE',      name: 'WB Fresh',     tagline: 'Cold-chain, flowers & perishables', multiplier: '+31% cold-chain',   color: '#94c943', bgColor: 'rgba(148,201,67,0.1)',  icon: Thermometer },
  { value: 'PHARMACEUTICAL',  name: 'WB Pharma',    tagline: 'GDP-certified, ±2°C / ±8°C',     multiplier: '+55% GDP surcharge',  color: '#1ea2dc', bgColor: 'rgba(30,162,220,0.08)', icon: Shield },
  { value: 'HIGH_VALUE',      name: 'WB Valuables', tagline: 'Vault-secured, security escort',  multiplier: '+64% security',       color: '#f59e0b', bgColor: 'rgba(245,158,11,0.08)', icon: Star },
  { value: 'LIVE_ANIMALS',    name: 'WB Live',      tagline: 'IATA LAR, live animals',          multiplier: '+82% AVI surcharge',  color: '#ec4899', bgColor: 'rgba(236,72,153,0.08)', icon: Heart },
  { value: 'DANGEROUS_GOODS', name: 'WB DG',        tagline: 'Dangerous goods, certified',      multiplier: '+45% DG handling',    color: '#ef4444', bgColor: 'rgba(239,68,68,0.08)',  icon: AlertTriangle },
]

export default function QuotePage() {
  const [origin, setOrigin] = useState('KGL')
  const [destination, setDestination] = useState('LHR')
  const [commodity, setCommodity] = useState<CommodityType>('GENERAL')
  const [weightKg, setWeightKg] = useState(500)
  const [volumetricMode, setVolumetricMode] = useState(false)
  const [length, setLength] = useState(120)
  const [width, setWidth]   = useState(80)
  const [height, setHeight] = useState(100)
  const [quotes, setQuotes] = useState<{ options: QuoteOption[]; perishableRisk?: PerishableRisk } | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)

  const volumetricWeight = Math.ceil((length * width * height) / 6000)
  const chargeableWeight = volumetricMode ? Math.max(weightKg, volumetricWeight) : weightKg

  const OPTION_META: Record<string, { label: string; badge: string; badgeColor: string; recommended?: boolean }> = {
    fastest:  { label: 'FASTEST',       badge: '⭐ Recommended', badgeColor: '#fee014', recommended: true },
    cheapest: { label: 'CHEAPEST',      badge: 'Save 18%',       badgeColor: '#94c943' },
    reliable: { label: 'MOST RELIABLE', badge: '99.1% on-time',  badgeColor: '#1ea2dc' },
  }

  async function handleGetQuote() {
    if (!origin || !destination) return
    setLoading(true)
    setQuotes(null)
    setApiError('')
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, commodityType: commodity, weightKg: chargeableWeight }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to get quote')
      const options: QuoteOption[] = (data.options as Array<{
        type: string; route: string[]; priceUsd: number; transitHours: number;
        departure: string; onTimePct: number; co2Kg: number;
      }>).map(opt => ({
        type: opt.type as QuoteOption['type'],
        route: opt.route,
        priceUsd: opt.priceUsd,
        transitHours: opt.transitHours,
        departure: formatDeparture(opt.departure),
        onTimePct: opt.onTimePct,
        co2Kg: opt.co2Kg,
        ...(OPTION_META[opt.type] ?? { label: opt.type.toUpperCase(), badge: '', badgeColor: '#ccc' }),
      }))
      setQuotes({ options, perishableRisk: data.perishableRisk })
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to get quote. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const risk = quotes?.perishableRisk
  const riskColor = risk?.riskLevel === 'high' ? '#ef4444' : risk?.riskLevel === 'medium' ? '#f59e0b' : '#94c943'

  return (
    <>
      <Navbar />
      <div className="pt-16" style={{ background: 'var(--wb-gray-50)', minHeight: '100vh' }}>
        {/* Page header */}
        <div style={{ background: 'var(--wb-blue)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-4"
                  style={{ color: 'rgba(255,255,255,0.6)' }}>
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
            <h1 className="text-white mb-2" style={{ fontSize: '2rem' }}>Smart Booking Engine</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>
              Get 3 tailored routing options with live pricing and CO₂ estimates in seconds.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Form ─────────────────────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl p-6 sticky top-24"
                   style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                <h3 className="mb-6" style={{ color: 'var(--wb-blue)' }}>Shipment Details</h3>

                <div className="space-y-5">
                  {/* Origin */}
                  <div>
                    <label className="label-upper block mb-1.5"
                           style={{ color: 'var(--wb-gray-500)' }}>
                      Origin Airport
                    </label>
                    <select value={origin} onChange={e => setOrigin(e.target.value)}
                            className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                            style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-gray-900)', background: 'white' }}>
                      {ORIGINS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="label-upper block mb-1.5"
                           style={{ color: 'var(--wb-gray-500)' }}>
                      Destination Airport
                    </label>
                    <select value={destination} onChange={e => setDestination(e.target.value)}
                            className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                            style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-gray-900)', background: 'white' }}>
                      {DESTINATIONS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Commodity — WB branded product selector */}
                  <div>
                    <label className="label-upper block mb-2"
                           style={{ color: 'var(--wb-gray-500)' }}>
                      Product / Cargo Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {WB_PRODUCT_OPTIONS.map(prod => {
                        const Icon = prod.icon
                        const active = commodity === prod.value
                        return (
                          <button
                            key={prod.value}
                            type="button"
                            onClick={() => setCommodity(prod.value)}
                            className="relative text-left rounded-xl p-3 transition-all"
                            style={{
                              background: active ? prod.bgColor : 'var(--wb-gray-50)',
                              border: active ? `2px solid ${prod.color}` : '1.5px solid var(--wb-gray-200)',
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                                   style={{ background: active ? prod.bgColor : 'white', border: `1px solid ${prod.color}40` }}>
                                <Icon className="w-3.5 h-3.5" style={{ color: prod.color }} />
                              </div>
                              <span className="text-xs font-bold" style={{ color: active ? prod.color : 'var(--wb-blue)' }}>
                                {prod.name}
                              </span>
                            </div>
                            <p className="text-xs leading-tight" style={{ color: 'var(--wb-gray-500)' }}>
                              {prod.tagline}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: 'var(--wb-sky)' }}>
                      {WB_PRODUCT_OPTIONS.find(o => o.value === commodity)?.multiplier}
                    </p>
                  </div>

                  {/* Weight */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="label-upper" style={{ color: 'var(--wb-gray-500)' }}>
                        Chargeable Weight
                      </label>
                      <button
                        onClick={() => setVolumetricMode(!volumetricMode)}
                        className="text-xs font-semibold flex items-center gap-1"
                        style={{ color: 'var(--wb-sky)' }}>
                        <Scale className="w-3 h-3" />
                        {volumetricMode ? 'Hide' : 'Add'} dimensions
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" value={weightKg} onChange={e => setWeightKg(Number(e.target.value))}
                             min={1} max={50000}
                             className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                             style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-gray-900)' }} />
                      <span className="text-sm font-bold" style={{ color: 'var(--wb-gray-500)' }}>kg</span>
                    </div>

                    {volumetricMode && (
                      <div className="mt-3 p-4 rounded-xl" style={{ background: 'var(--wb-sky-light)' }}>
                        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--wb-sky)' }}>
                          Dimensions (cm)
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {[['L', length, setLength], ['W', width, setWidth], ['H', height, setHeight]].map(
                            ([label, val, setter]) => (
                              <div key={label as string}>
                                <p className="text-xs mb-1" style={{ color: 'var(--wb-gray-500)' }}>{label as string}</p>
                                <input type="number" value={val as number}
                                       onChange={e => (setter as (v: number) => void)(Number(e.target.value))}
                                       className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                                       style={{ border: '1px solid var(--wb-gray-200)' }} />
                              </div>
                            )
                          )}
                        </div>
                        <p className="text-xs mt-2" style={{ color: 'var(--wb-gray-500)' }}>
                          Volumetric: <strong>{volumetricWeight}kg</strong> ·
                          Chargeable: <strong style={{ color: 'var(--wb-blue)' }}>{chargeableWeight}kg</strong>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Booking window notice */}
                  <div className="rounded-lg px-3 py-2 text-xs flex items-start gap-2"
                       style={{ background: 'var(--wb-sky-light)', color: 'var(--wb-blue)' }}>
                    <span className="shrink-0 mt-0.5">ℹ</span>
                    <span>
                      <strong>Booking windows:</strong> 96h before departure for direct flights · 72h for connecting routes.
                      Max package weight: <strong>80 kg</strong> per piece.
                    </span>
                  </div>

                  {/* Packing list upload */}
                  <div>
                    <label className="label-upper block mb-1.5" style={{ color: 'var(--wb-gray-500)' }}>
                      Upload Packing List (optional)
                    </label>
                    <div className="rounded-xl p-4 text-center cursor-pointer transition-colors"
                         style={{ border: '1.5px dashed var(--wb-gray-200)', background: uploadedFile ? 'var(--wb-green-light)' : 'var(--wb-gray-50)' }}>
                      {uploadedFile ? (
                        <div className="flex items-center justify-center gap-2 text-sm"
                             style={{ color: 'var(--wb-green)' }}>
                          <CheckCircle className="w-4 h-4" />
                          {uploadedFile} — AI extracted ✓
                        </div>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--wb-gray-500)' }} />
                          <p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>
                            PDF or Excel · Claude AI extracts weight, dimensions & commodity
                          </p>
                          <button
                            onClick={() => setUploadedFile('packing_list_roses_500kg.pdf')}
                            className="mt-2 text-xs font-semibold"
                            style={{ color: 'var(--wb-sky)' }}>
                            Simulate upload
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Charter CTA — appears when weight > 5t */}
                  {chargeableWeight > 5000 && (
                    <div className="rounded-xl p-4 flex items-start gap-3"
                         style={{ background: '#fff9e6', border: '1.5px solid rgba(245,158,11,0.3)' }}>
                      <Plane className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#d97706' }} />
                      <div>
                        <p className="text-sm font-bold mb-0.5" style={{ color: '#92400e' }}>
                          Full aircraft charter?
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--wb-gray-500)' }}>
                          Shipments over 5t often benefit from a dedicated charter. Our team can find the best option for you.
                        </p>
                        <a href="mailto:cargobooking@rwandair.com?subject=Charter%20Inquiry"
                           className="inline-flex items-center gap-1 text-xs font-bold mt-2"
                           style={{ color: '#d97706' }}>
                          Request charter inquiry <ChevronRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleGetQuote}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl font-bold text-sm transition-all"
                    style={{
                      background: loading ? 'var(--wb-gray-200)' : 'var(--wb-blue)',
                      color: loading ? 'var(--wb-gray-500)' : 'white',
                    }}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Calculating best routes…
                      </span>
                    ) : 'Get instant quote →'}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Quote results ─────────────────────────────────────────── */}
            <div className="lg:col-span-2">
              {apiError && !loading && (
                <div className="mb-6 p-4 rounded-xl flex items-start gap-3"
                     style={{ background: 'rgba(239,68,68,0.07)', border: '1.5px solid rgba(239,68,68,0.25)' }}>
                  <XCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                  <div>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: '#ef4444' }}>Could not retrieve quotes</p>
                    <p className="text-sm" style={{ color: 'var(--wb-gray-900)' }}>{apiError}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--wb-gray-500)' }}>
                      Please check your route selection and try again, or{' '}
                      <a href="mailto:cargobooking@rwandair.com" style={{ color: 'var(--wb-sky)' }}>email us directly</a>.
                    </p>
                  </div>
                </div>
              )}

              {!quotes && !loading && !apiError && (
                <div className="flex flex-col items-center justify-center py-24 text-center"
                     style={{ border: '2px dashed var(--wb-gray-200)', borderRadius: '1.5rem', color: 'var(--wb-gray-500)' }}>
                  <Zap className="w-12 h-12 mb-4" style={{ color: 'var(--wb-gray-200)' }} />
                  <p className="font-semibold" style={{ color: 'var(--wb-blue)' }}>
                    Fill in your shipment details to get 3 instant quotes
                  </p>
                  <p className="text-sm mt-1">Fastest · Cheapest · Most Reliable</p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin mb-4"
                       style={{ borderColor: 'var(--wb-sky)', borderTopColor: 'transparent' }} />
                  <p className="font-semibold" style={{ color: 'var(--wb-blue)' }}>
                    Checking live capacity across 24 routes…
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--wb-gray-500)' }}>
                    Running AI route optimization + carbon calculation
                  </p>
                </div>
              )}

              {quotes && (
                <>
                  {/* Perishable alert */}
                  {risk && (
                    <div className="mb-6 p-4 rounded-xl flex items-start gap-3"
                         style={{
                           background: risk.riskLevel === 'high' ? '#fff1f0' : risk.riskLevel === 'medium' ? '#fff9e6' : 'var(--wb-green-light)',
                           border: `1.5px solid ${riskColor}44`,
                         }}>
                      <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0"
                                     style={{ color: riskColor }} />
                      <div>
                        <p className="text-sm font-bold mb-0.5" style={{ color: riskColor }}>
                          Perishable cargo — shelf-life alert
                        </p>
                        <p className="text-sm" style={{ color: 'var(--wb-gray-900)' }}>
                          At this transit time, your cargo will have{' '}
                          <strong>{risk.shelfLifeRemainingDays} days</strong> remaining on arrival.
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--wb-gray-500)' }}>
                          {risk.recommendation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Three option cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {quotes.options.map(opt => (
                      <QuoteCard
                        key={opt.type}
                        option={opt}
                        selected={selected === opt.type}
                        onSelect={() => setSelected(opt.type)}
                      />
                    ))}
                  </div>

                  {/* Proceed CTA */}
                  {selected && (
                    <div className="mt-6 p-5 rounded-2xl flex items-center justify-between"
                         style={{ background: 'var(--wb-blue)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div>
                        <p className="text-white font-semibold text-sm">
                          Option selected:{' '}
                          <span style={{ color: 'var(--wb-yellow)' }}>
                            {quotes.options.find(o => o.type === selected)?.label}
                          </span>
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          ${quotes.options.find(o => o.type === selected)?.priceUsd.toLocaleString()} ·{' '}
                          {quotes.options.find(o => o.type === selected)?.route.join(' → ')}
                        </p>
                      </div>
                      <Link href="/dashboard/shipments/new"
                         className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
                         style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)' }}>
                        Proceed to book <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}

                  {/* Info row */}
                  <div className="mt-4 flex flex-wrap gap-4 text-xs" style={{ color: 'var(--wb-gray-500)' }}>
                    <span className="flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" /> Prices include fuel surcharge + security fee
                    </span>
                    <span className="flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5" style={{ color: 'var(--wb-green)' }} />
                      Carbon offsets included via Patch.io
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--wb-green)' }} />
                      Quote valid for 4 hours
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
