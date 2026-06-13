'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Package, CheckCircle, Clock, Users, TrendingDown, ChevronRight, Info } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ConnectivityLines from '@/components/brand/ConnectivityLines'
import { useToast } from '@/components/ui/Toast'
import { useLanguage } from '@/components/providers/LanguageProvider'

// ─── Standard per-kg rates by commodity ──────────────────────────────────────
// Consolidated rate = standard * (1 - savings%)
const STANDARD_RATES: Record<string, number> = {
  'Cut flowers': 7.2,
  'Vegetables':  5.5,
  'Avocado':     5.8,
  'Pharma (GDP)': 9.5,
  'Seafood':     6.8,
  'Roses':       7.2,
  'Mixed veg':   5.5,
  'Tulips':      7.0,
}

function getMemberSaving(member: { commodity: string; weightKg: number }, avgSavings: number) {
  const stdRate = STANDARD_RATES[member.commodity] ?? 5.5
  const consolidatedRate = stdRate * (1 - avgSavings / 100)
  const saving = (stdRate - consolidatedRate) * member.weightKg
  return { saving: Math.round(saving), savingPct: avgSavings }
}

// ─── Mock consolidation groups ────────────────────────────────────────────────
const GROUPS = [
  {
    id: 'CG-4421',
    flight: 'WB9308', route: 'KGL → JIB → SHJ',
    departure: 'Tonight 23:00',
    maxWeightKg: 20000,
    usedWeightKg: 12000,
    remainingKg: 4200,
    status: 'FORMING',
    destination: 'LHR',
    avgSavings: 17,
    members: [
      { origin: 'KGL', shipper: 'Kigali Flowers Ltd', commodity: 'Cut flowers', weightKg: 3000, status: 'Confirmed' },
      { origin: 'EBB', shipper: 'Entebbe Fresh Co.',  commodity: 'Vegetables',   weightKg: 5000, status: 'Confirmed' },
      { origin: 'NBO', shipper: 'Nairobi Agri Exp.',  commodity: 'Avocado',       weightKg: 4000, status: 'Pending'   },
    ],
  },
  {
    id: 'CG-4398',
    flight: 'WB9304', route: 'KGL → SHJ',
    departure: 'Sat 23:00',
    maxWeightKg: 15000,
    usedWeightKg: 4000,
    remainingKg: 8100,
    status: 'FORMING',
    destination: 'DXB',
    avgSavings: 12,
    members: [
      { origin: 'KGL', shipper: 'RwandaPharm Ltd',    commodity: 'Pharma (GDP)', weightKg: 2000, status: 'Confirmed' },
      { origin: 'DAR', shipper: 'Dar Fresh Exports',  commodity: 'Seafood',      weightKg: 2000, status: 'Confirmed' },
    ],
  },
  {
    id: 'CG-4385',
    flight: 'WB9316', route: 'KGL → JIB → DWC',
    departure: 'Mon 00:30',
    maxWeightKg: 12000,
    usedWeightKg: 7500,
    remainingKg: 2800,
    status: 'FORMING',
    destination: 'AMS',
    avgSavings: 22,
    members: [
      { origin: 'KGL', shipper: 'Rwanda Rose Farms',  commodity: 'Roses',        weightKg: 4000, status: 'Confirmed' },
      { origin: 'EBB', shipper: 'Uganda Fresh Ltd',   commodity: 'Mixed veg',    weightKg: 2200, status: 'Confirmed' },
      { origin: 'KGL', shipper: 'Kigali Tulips',      commodity: 'Tulips',       weightKg: 1300, status: 'Pending'   },
    ],
  },
]

// ─── Join form ────────────────────────────────────────────────────────────────
function JoinForm({ group, onClose, onSubmit }: { group: typeof GROUPS[0]; onClose: () => void; onSubmit?: (commodity: string, weight: number) => void }) {
  const [submitted, setSubmitted] = useState(false)
  const [commodity, setCommodity] = useState('')
  const [weight, setWeight] = useState(500)
  const [origin, setOrigin] = useState('KGL')

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--wb-green)' }} />
        <h3 className="mb-2" style={{ color: 'var(--wb-blue)' }}>Join request submitted!</h3>
        <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>
          Your shipment has been added to consolidation {group.id}. A booking confirmation will be sent via WhatsApp.
        </p>
        <div className="mt-4 p-3 rounded-xl text-sm"
             style={{ background: 'var(--wb-green-light)', color: '#3d6b10' }}>
          Estimated saving: <strong>{group.avgSavings}%</strong> vs standard rate
        </div>
        <button onClick={onClose}
                className="mt-5 px-6 py-2 rounded-xl font-bold text-sm"
                style={{ background: 'var(--wb-blue)', color: 'white' }}>
          Close
        </button>
      </div>
    )
  }

  return (
    <div>
      <h3 className="mb-1" style={{ color: 'var(--wb-blue)' }}>Join {group.id}</h3>
      <p className="text-sm mb-5" style={{ color: 'var(--wb-gray-500)' }}>
        {group.flight} · {group.route} · {group.departure}
      </p>
      <div className="space-y-4">
        <div>
          <label className="label-upper block mb-1.5" style={{ color: 'var(--wb-gray-500)' }}>
            Your origin
          </label>
          <select value={origin} onChange={e => setOrigin(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                  style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-gray-900)' }}>
            {['KGL', 'EBB', 'NBO', 'DAR', 'LOS'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="label-upper block mb-1.5" style={{ color: 'var(--wb-gray-500)' }}>Commodity</label>
          <input type="text" value={commodity} onChange={e => setCommodity(e.target.value)}
                 placeholder="e.g. Fresh roses, coffee, avocado…"
                 className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                 style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-gray-900)' }} />
        </div>
        <div>
          <label className="label-upper block mb-1.5" style={{ color: 'var(--wb-gray-500)' }}>Weight (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))}
                 min={1} max={group.remainingKg}
                 className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                 style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-gray-900)' }} />
          <p className="text-xs mt-1" style={{ color: 'var(--wb-gray-500)' }}>
            Max available: {group.remainingKg.toLocaleString()}kg
          </p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'var(--wb-yellow-light)', border: '1px solid rgba(254,224,20,0.4)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--wb-blue)' }}>
            Estimated saving: <span style={{ color: 'var(--wb-green)' }}>~{group.avgSavings}%</span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--wb-gray-500)' }}>
            vs. booking a single shipment at standard rate
          </p>
        </div>
        <button onClick={() => { setSubmitted(true); onSubmit?.(commodity, weight) }} disabled={!commodity}
                className="w-full py-3 rounded-xl font-bold text-sm"
                style={{ background: !commodity ? 'var(--wb-gray-200)' : 'var(--wb-blue)', color: !commodity ? 'var(--wb-gray-500)' : 'white' }}>
          Join consolidation →
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ConsolidatePage() {
  const { addToast } = useToast()
  const { t } = useLanguage()
  const [joiningGroup, setJoiningGroup] = useState<string | null>(null)
  const [commodity, setCommodity] = useState('')
  const [weight, setWeight] = useState(500)
  const [origin, setOrigin] = useState('KGL')
  const [matchResult, setMatchResult] = useState(false)

  const group = joiningGroup ? GROUPS.find(g => g.id === joiningGroup) : null

  return (
    <>
      <Navbar />
      <div className="pt-16" style={{ background: 'var(--wb-gray-50)', minHeight: '100vh' }}>
        {/* Header */}
        <div className="relative overflow-hidden" style={{ background: 'var(--wb-blue)' }}>
          <ConnectivityLines opacity={0.1} animated={false} />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-4"
                  style={{ color: 'rgba(255,255,255,0.6)' }}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <h1 className="text-white mb-2" style={{ fontSize: '1.75rem' }}>{t('headConsolidate')}</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>
              Join an active consolidation group and save up to 25% — space is confirmed tonight.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* AI match banner */}
          {matchResult && (
            <div className="mb-6 p-5 rounded-2xl"
                 style={{ background: 'var(--wb-sky-light)', border: '1.5px solid rgba(30,162,220,0.3)' }}>
              <p className="font-bold text-sm mb-1" style={{ color: 'var(--wb-blue)' }}>
                📦 AI Consolidation Match — 2 active groups match your shipment profile
              </p>
              <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>
                Joining CG-4421 would save you est. <strong style={{ color: 'var(--wb-green)' }}>$1,240</strong> and
                guarantee space on tonight's WB401 flight.
              </p>
              <button onClick={() => setJoiningGroup('CG-4421')}
                      className="mt-3 px-4 py-2 rounded-xl text-sm font-bold"
                      style={{ background: 'var(--wb-blue)', color: 'white' }}>
                View best match →
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Shipment finder form ──────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl p-6 sticky top-24"
                   style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                <h3 className="mb-5" style={{ color: 'var(--wb-blue)' }}>My Shipment</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label-upper block mb-1.5" style={{ color: 'var(--wb-gray-500)' }}>Origin</label>
                    <select value={origin} onChange={e => setOrigin(e.target.value)}
                            className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                            style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-gray-900)' }}>
                      {['KGL', 'EBB', 'NBO', 'DAR', 'LOS'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-upper block mb-1.5" style={{ color: 'var(--wb-gray-500)' }}>Commodity</label>
                    <input type="text" value={commodity} onChange={e => setCommodity(e.target.value)}
                           placeholder="e.g. roses, coffee, avocado…"
                           className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                           style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-gray-900)' }} />
                  </div>
                  <div>
                    <label className="label-upper block mb-1.5" style={{ color: 'var(--wb-gray-500)' }}>Weight (kg)</label>
                    <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))}
                           className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                           style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-gray-900)' }} />
                  </div>
                  <button onClick={() => setMatchResult(true)} disabled={!commodity}
                          className="w-full py-3 rounded-xl font-bold text-sm"
                          style={{ background: !commodity ? 'var(--wb-gray-200)' : 'var(--wb-sky)', color: !commodity ? 'var(--wb-gray-500)' : 'white' }}>
                    Find matching groups →
                  </button>
                </div>

                {/* How it works */}
                <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--wb-gray-200)' }}>
                  <p className="label-upper mb-3" style={{ color: 'var(--wb-gray-500)' }}>How consolidation works</p>
                  <div className="space-y-3 text-xs" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.6 }}>
                    <p>🔗 Multiple shippers with cargo to the same destination combine into one high-yield flight booking via KGL.</p>
                    <p>✈️ RwandAir earns interline revenue from feeder routes (EBB/NBO/DAR → KGL → Europe).</p>
                    <p>💰 Each shipper saves on per-kg rates — avg 17–22% vs booking alone.</p>
                    <p>⏱️ Faster than some direct routes — KGL hub is strategically placed.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Live consolidation board ──────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">
              {GROUPS.map(g => (
                <div key={g.id} className="rounded-2xl overflow-hidden"
                     style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                  {/* Group header */}
                  <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3"
                       style={{ background: 'var(--wb-blue)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div>
                      <span className="text-white font-bold text-sm">Flight: {g.flight} {g.route}</span>
                      <span className="ml-3 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Departs: {g.departure}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full"
                            style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)' }}>
                        {g.remainingKg.toLocaleString()}kg remaining
                      </span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Avg saving: {g.avgSavings}%
                      </span>
                    </div>
                  </div>

                  {/* Member table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: 'var(--wb-gray-50)', borderBottom: '1px solid var(--wb-gray-200)' }}>
                          {['Origin', 'Shipper', 'Cargo', 'Weight', 'Status'].map(h => (
                            <th key={h} className="px-4 py-2 text-left label-upper"
                                style={{ color: 'var(--wb-gray-500)', fontSize: 10 }}>
                              {h}
                            </th>
                          ))}
                          <th className="px-4 py-2 text-right label-upper"
                              style={{ color: 'var(--wb-gray-500)', fontSize: 10 }}>
                            Your saving
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.members.map((m, i) => {
                          const { saving } = getMemberSaving(m, g.avgSavings)
                          return (
                          <tr key={i} style={{ borderBottom: '1px solid var(--wb-gray-200)' }}>
                            <td className="px-4 py-3 font-bold" style={{ color: 'var(--wb-blue)' }}>{m.origin}</td>
                            <td className="px-4 py-3" style={{ color: 'var(--wb-gray-900)' }}>{m.shipper}</td>
                            <td className="px-4 py-3" style={{ color: 'var(--wb-gray-500)' }}>{m.commodity}</td>
                            <td className="px-4 py-3 font-semibold" style={{ color: 'var(--wb-gray-900)' }}>
                              {(m.weightKg / 1000).toFixed(1)}t
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                    style={{
                                      background: m.status === 'Confirmed' ? 'var(--wb-green-light)' : 'var(--wb-yellow-light)',
                                      color: m.status === 'Confirmed' ? '#3d6b10' : '#7a5c00',
                                    }}>
                                {m.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-xs font-bold" style={{ color: 'var(--wb-green)' }}>
                                ~${saving.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                          )
                        })}
                        {/* YOU row */}
                        <tr style={{ background: 'rgba(254,224,20,0.05)', borderBottom: '1px solid var(--wb-gray-200)' }}>
                          <td className="px-4 py-3 font-bold" style={{ color: 'var(--wb-sky)' }}>[YOU]</td>
                          <td className="px-4 py-3 text-sm italic" style={{ color: 'var(--wb-gray-500)' }}>Your shipment</td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--wb-gray-500)' }}>—</td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--wb-gray-500)' }}>?</td>
                          <td className="px-4 py-3">
                            <button onClick={() => setJoiningGroup(g.id)}
                                    className="px-3 py-1 rounded-full text-xs font-bold"
                                    style={{ background: 'var(--wb-sky)', color: 'white' }}>
                              Join →
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs font-bold" style={{ color: 'var(--wb-green)' }}>
                              est. {g.avgSavings}%
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Group footer */}
                  <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3"
                       style={{ background: 'var(--wb-gray-50)', borderTop: '1px solid var(--wb-gray-200)' }}>
                    <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>
                      Combined: <strong>{(g.usedWeightKg / 1000).toFixed(0)}t</strong> → {g.destination} ·
                      Savings per shipper: avg <strong style={{ color: 'var(--wb-green)' }}>{g.avgSavings}%</strong>
                    </p>
                    <button onClick={() => setJoiningGroup(g.id)}
                            className="px-4 py-2 rounded-xl text-sm font-bold"
                            style={{ background: 'var(--wb-blue)', color: 'white' }}>
                      Join this consolidation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Join modal */}
      {joiningGroup && group && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md rounded-2xl p-6"
               style={{ background: 'white' }}>
            <JoinForm
              group={group}
              onClose={() => setJoiningGroup(null)}
              onSubmit={(commodity, weight) =>
                addToast(`${weight}kg of ${commodity} added to ${group.id} — WhatsApp confirmation coming.`, 'success')
              }
            />
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
