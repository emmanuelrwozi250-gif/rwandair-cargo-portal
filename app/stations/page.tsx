'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, CheckCircle, X, MapPin, Thermometer, Shield, Package } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// ─── Station data ─────────────────────────────────────────────────────────────
interface Station {
  code: string
  city: string
  country: string
  region: 'East Africa' | 'West Africa' | 'Southern Africa' | 'Middle East' | 'Europe' | 'Other'
  type: 'Hub' | 'Freighter' | 'Belly'
  handler: string
  handlerPhone: string
  coldStore: boolean
  coldStoreTemp: string
  certifications: string[]
  maxPiecesKg: number
  awbPrefix: string
  localContact: string
}

const STATIONS: Station[] = [
  {
    code: 'KGL', city: 'Kigali', country: 'Rwanda', region: 'East Africa', type: 'Hub',
    handler: 'RwandAir Ground Services',
    handlerPhone: '+250 788 177 000',
    coldStore: true, coldStoreTemp: '2°C – 8°C (GDP), 0°C – 4°C (fresh)',
    certifications: ['IATA CEIV Pharma', 'HACCP', 'IOSA', 'ISAGO', 'EASA'],
    maxPiecesKg: 500,
    awbPrefix: '459',
    localContact: 'cargo@rwandair.com',
  },
  {
    code: 'LHR', city: 'London Heathrow', country: 'United Kingdom', region: 'Europe', type: 'Belly',
    handler: 'Menzies Aviation',
    handlerPhone: '+44 20 8745 2000',
    coldStore: true, coldStoreTemp: '2°C – 8°C (GDP), 0°C – 4°C (fresh)',
    certifications: ['IATA CEIV Pharma', 'UK CAA Approved', 'ISAGO'],
    maxPiecesKg: 500,
    awbPrefix: '459',
    localContact: 'heathrow.cargo@rwandair.com',
  },
  {
    code: 'CDG', city: 'Paris Charles de Gaulle', country: 'France', region: 'Europe', type: 'Belly',
    handler: 'Air France Cargo (subhandler)',
    handlerPhone: '+33 1 41 56 78 00',
    coldStore: true, coldStoreTemp: '2°C – 25°C',
    certifications: ['IATA CEIV Pharma', 'DGCA Approved'],
    maxPiecesKg: 500,
    awbPrefix: '459',
    localContact: 'paris.cargo@rwandair.com',
  },
  {
    code: 'BRU', city: 'Brussels', country: 'Belgium', region: 'Europe', type: 'Belly',
    handler: 'Aviapartner',
    handlerPhone: '+32 2 753 2900',
    coldStore: true, coldStoreTemp: '2°C – 8°C',
    certifications: ['IATA CEIV Pharma', 'HACCP', 'GDP'],
    maxPiecesKg: 500,
    awbPrefix: '459',
    localContact: 'brussels.cargo@rwandair.com',
  },
  {
    code: 'DXB', city: 'Dubai International', country: 'UAE', region: 'Middle East', type: 'Belly',
    handler: 'dnata',
    handlerPhone: '+971 4 211 1111',
    coldStore: true, coldStoreTemp: '2°C – 25°C',
    certifications: ['IATA CEIV Pharma', 'PCAA', 'ISAGO'],
    maxPiecesKg: 500,
    awbPrefix: '459',
    localContact: 'dubai.cargo@rwandair.com',
  },
  {
    code: 'SHJ', city: 'Sharjah', country: 'UAE', region: 'Middle East', type: 'Freighter',
    handler: 'Sharjah Aviation Services',
    handlerPhone: '+971 6 558 1111',
    coldStore: true, coldStoreTemp: '2°C – 8°C (GDP), 0°C – 4°C (fresh)',
    certifications: ['IATA CEIV Pharma', 'HACCP'],
    maxPiecesKg: 1000,
    awbPrefix: '459',
    localContact: 'sharjah.cargo@rwandair.com',
  },
  {
    code: 'DWC', city: 'Dubai Al Maktoum', country: 'UAE', region: 'Middle East', type: 'Freighter',
    handler: 'Dubai World Central Cargo',
    handlerPhone: '+971 4 800 38282',
    coldStore: true, coldStoreTemp: '2°C – 25°C',
    certifications: ['IATA CEIV Fresh', 'GDP'],
    maxPiecesKg: 1000,
    awbPrefix: '459',
    localContact: 'dwc.cargo@rwandair.com',
  },
  {
    code: 'DOH', city: 'Doha', country: 'Qatar', region: 'Middle East', type: 'Belly',
    handler: 'Qatar Aviation Services',
    handlerPhone: '+974 4496 6000',
    coldStore: true, coldStoreTemp: '2°C – 8°C',
    certifications: ['IATA CEIV Pharma'],
    maxPiecesKg: 500,
    awbPrefix: '459',
    localContact: 'doha.cargo@rwandair.com',
  },
  {
    code: 'JIB', city: 'Djibouti', country: 'Djibouti', region: 'East Africa', type: 'Freighter',
    handler: 'Djibouti Aviation Handling',
    handlerPhone: '+253 21 34 1200',
    coldStore: false, coldStoreTemp: '—',
    certifications: ['IATA Member'],
    maxPiecesKg: 500,
    awbPrefix: '459',
    localContact: 'djibouti.cargo@rwandair.com',
  },
  {
    code: 'NBO', city: 'Nairobi Jomo Kenyatta', country: 'Kenya', region: 'East Africa', type: 'Belly',
    handler: 'Swissport Kenya',
    handlerPhone: '+254 20 827 4000',
    coldStore: true, coldStoreTemp: '0°C – 8°C',
    certifications: ['HACCP', 'KEPHIS Certified'],
    maxPiecesKg: 500,
    awbPrefix: '459',
    localContact: 'nairobi.cargo@rwandair.com',
  },
  {
    code: 'EBB', city: 'Entebbe', country: 'Uganda', region: 'East Africa', type: 'Belly',
    handler: 'Entebbe Handling Services',
    handlerPhone: '+256 41 232 2205',
    coldStore: true, coldStoreTemp: '0°C – 8°C',
    certifications: ['UCAA Approved', 'HACCP'],
    maxPiecesKg: 500,
    awbPrefix: '459',
    localContact: 'entebbe.cargo@rwandair.com',
  },
  {
    code: 'LOS', city: 'Lagos Murtala Muhammed', country: 'Nigeria', region: 'West Africa', type: 'Belly',
    handler: 'Skyway Aviation Handling Co.',
    handlerPhone: '+234 1 279 5555',
    coldStore: false, coldStoreTemp: '—',
    certifications: ['NCAA Approved'],
    maxPiecesKg: 500,
    awbPrefix: '459',
    localContact: 'lagos.cargo@rwandair.com',
  },
  {
    code: 'ACC', city: 'Accra Kotoka', country: 'Ghana', region: 'West Africa', type: 'Belly',
    handler: 'Aviance Ghana',
    handlerPhone: '+233 30 277 3321',
    coldStore: false, coldStoreTemp: '—',
    certifications: ['GCAA Approved'],
    maxPiecesKg: 500,
    awbPrefix: '459',
    localContact: 'accra.cargo@rwandair.com',
  },
  {
    code: 'JNB', city: 'Johannesburg O.R. Tambo', country: 'South Africa', region: 'Southern Africa', type: 'Belly',
    handler: 'Swissport South Africa',
    handlerPhone: '+27 11 390 2000',
    coldStore: true, coldStoreTemp: '2°C – 8°C',
    certifications: ['SACAA Approved', 'HACCP'],
    maxPiecesKg: 500,
    awbPrefix: '459',
    localContact: 'joburg.cargo@rwandair.com',
  },
]

const REGIONS = ['All', 'East Africa', 'West Africa', 'Southern Africa', 'Middle East', 'Europe'] as const
const TYPES   = ['All', 'Hub', 'Freighter', 'Belly'] as const

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Hub:       { bg: 'rgba(242,222,14,0.15)', text: '#8a6d00' },
  Freighter: { bg: 'rgba(30,162,220,0.12)', text: '#0a6a9a' },
  Belly:     { bg: 'rgba(0,80,158,0.08)',   text: 'var(--wb-blue)' },
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StationsPage() {
  const [search, setSearch]   = useState('')
  const [region, setRegion]   = useState<typeof REGIONS[number]>('All')
  const [type, setType]       = useState<typeof TYPES[number]>('All')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = STATIONS.filter(s => {
    const matchSearch = !search || [s.code, s.city, s.country, s.handler].some(f =>
      f.toLowerCase().includes(search.toLowerCase())
    )
    const matchRegion = region === 'All' || s.region === region
    const matchType   = type   === 'All' || s.type   === type
    return matchSearch && matchRegion && matchType
  })

  return (
    <>
      <Navbar />
      <div className="pt-16" style={{ background: 'var(--wb-gray-50)', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ background: 'var(--wb-blue)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-4"
                  style={{ color: 'rgba(255,255,255,0.6)' }}>
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
            <h1 className="text-white mb-2" style={{ fontSize: '2rem' }}>Cargo Station Directory</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>
              Handler details, cold-store availability, and certifications across all {STATIONS.length} RwandAir Cargo stations.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            {/* Search */}
            <div className="relative flex-1 min-w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--wb-gray-500)' }} />
              <input
                type="text"
                placeholder="Search airport, city, handler…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ border: '1.5px solid var(--wb-gray-200)', background: 'white', color: 'var(--wb-gray-900)' }}
              />
              {search && (
                <button onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5" style={{ color: 'var(--wb-gray-500)' }} />
                </button>
              )}
            </div>

            {/* Region filter */}
            <div className="flex flex-wrap gap-2">
              {REGIONS.map(r => (
                <button key={r} onClick={() => setRegion(r)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: region === r ? 'var(--wb-blue)' : 'white',
                          color: region === r ? 'white' : 'var(--wb-gray-500)',
                          border: `1px solid ${region === r ? 'var(--wb-blue)' : 'var(--wb-gray-200)'}`,
                        }}>
                  {r}
                </button>
              ))}
            </div>

            {/* Type filter */}
            <div className="flex gap-2">
              {TYPES.map(t => (
                <button key={t} onClick={() => setType(t)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: type === t ? 'var(--wb-sky)' : 'white',
                          color: type === t ? 'white' : 'var(--wb-gray-500)',
                          border: `1px solid ${type === t ? 'var(--wb-sky)' : 'var(--wb-gray-200)'}`,
                        }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm mb-4" style={{ color: 'var(--wb-gray-500)' }}>
            Showing <strong style={{ color: 'var(--wb-blue)' }}>{filtered.length}</strong> of {STATIONS.length} stations
          </p>

          {/* Station cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(s => {
              const tc = TYPE_COLORS[s.type]
              const isExpanded = expanded === s.code
              return (
                <div key={s.code} className="rounded-2xl overflow-hidden"
                     style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                  {/* Card header */}
                  <button
                    className="w-full text-left p-5"
                    onClick={() => setExpanded(isExpanded ? null : s.code)}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-black" style={{ color: 'var(--wb-blue)', fontFamily: 'monospace' }}>
                            {s.code}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: tc.bg, color: tc.text }}>
                            {s.type}
                          </span>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--wb-gray-900)' }}>{s.city}</p>
                        <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--wb-gray-500)' }}>
                          <MapPin className="w-3 h-3 shrink-0" /> {s.country} · {s.region}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center justify-end gap-1 mb-1">
                          {s.coldStore ? (
                            <span className="flex items-center gap-1 text-xs font-semibold"
                                  style={{ color: '#0a6a9a' }}>
                              <Thermometer className="w-3 h-3" /> Cold-store
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>No cold-store</span>
                          )}
                        </div>
                        <p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>
                          {s.certifications.length} cert{s.certifications.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Quick badges */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {s.certifications.slice(0, 3).map(c => (
                        <span key={c} className="text-xs px-2 py-0.5 rounded font-semibold"
                              style={{ background: 'rgba(0,80,158,0.07)', color: 'var(--wb-blue)' }}>
                          {c}
                        </span>
                      ))}
                      {s.certifications.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded" style={{ color: 'var(--wb-gray-500)' }}>
                          +{s.certifications.length - 3} more
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 space-y-4"
                         style={{ borderTop: '1px solid var(--wb-gray-200)' }}>

                      {/* Handler */}
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--wb-gray-500)' }}>
                          Ground Handler
                        </p>
                        <p className="text-sm font-bold" style={{ color: 'var(--wb-gray-900)' }}>{s.handler}</p>
                        <a href={`tel:${s.handlerPhone}`} className="text-sm"
                           style={{ color: 'var(--wb-sky)' }}>{s.handlerPhone}</a>
                      </div>

                      {/* Cold store */}
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--wb-gray-500)' }}>
                          Cold Store
                        </p>
                        {s.coldStore ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#4a7c20' }} />
                            <span className="text-sm" style={{ color: 'var(--wb-gray-900)' }}>
                              Available — {s.coldStoreTemp}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>Not available at this station</span>
                        )}
                      </div>

                      {/* All certs */}
                      <div>
                        <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--wb-gray-500)' }}>
                          Certifications
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {s.certifications.map(c => (
                            <span key={c} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded font-semibold"
                                  style={{ background: 'rgba(0,80,158,0.07)', color: 'var(--wb-blue)' }}>
                              <Shield className="w-2.5 h-2.5 shrink-0" /> {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Limits + contact */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--wb-gray-500)' }}>
                            Max piece weight
                          </p>
                          <p className="text-sm font-bold" style={{ color: 'var(--wb-gray-900)' }}>
                            {s.maxPiecesKg}kg
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--wb-gray-500)' }}>
                            AWB prefix
                          </p>
                          <p className="text-sm font-bold font-mono" style={{ color: 'var(--wb-gray-900)' }}>
                            {s.awbPrefix}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--wb-gray-500)' }}>
                          Local cargo contact
                        </p>
                        <a href={`mailto:${s.localContact}`} className="text-xs"
                           style={{ color: 'var(--wb-sky)' }}>{s.localContact}</a>
                      </div>

                      <Link href="/quote"
                            className="w-full block text-center py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                            style={{ background: 'var(--wb-blue)', color: 'white' }}>
                        Get quote via {s.code}
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Package className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--wb-gray-200)' }} />
              <p className="font-semibold" style={{ color: 'var(--wb-blue)' }}>No stations match your filters</p>
              <button onClick={() => { setSearch(''); setRegion('All'); setType('All') }}
                      className="mt-2 text-sm" style={{ color: 'var(--wb-sky)' }}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
