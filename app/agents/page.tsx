import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  Zap, Headphones, Layers, CreditCard, FileCheck, Plug, BarChart3,
  Check, Minus, ChevronRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'For Freight Agents — Allocations, Credit, API Access',
  description:
    'The cargo platform built for freight professionals: priority capacity allocation, net credit terms, instant AWB issuance, and API access via cargo.one, WebCargo, CargoAi, or direct REST.',
  alternates: { canonical: '/agents' },
}

const AGENT_FEATURES = [
  {
    icon: Headphones,
    title: 'Dedicated rate desk',
    desc: 'Direct line and email to a named rate desk — quotes answered by people who can commit space.',
    color: '#16A1DC', bg: 'rgba(28,163,219,0.08)',
  },
  {
    icon: Layers,
    title: 'Priority capacity allocation',
    desc: 'First call on freighter space, including peak season. Your allocation, protected.',
    color: '#00529C', bg: 'rgba(4,84,155,0.07)',
  },
  {
    icon: CreditCard,
    title: 'Net credit terms',
    desc: '15 to 30-day terms subject to approval. Consolidated monthly invoicing, no per-booking friction.',
    color: '#94C944', bg: 'rgba(45,125,70,0.08)',
  },
  {
    icon: FileCheck,
    title: 'Real-time AWB issuance',
    desc: '459-prefix air waybills issued instantly from the portal or your own system.',
    color: '#7C3AED', bg: 'rgba(124,58,237,0.07)',
  },
  {
    icon: Plug,
    title: 'API access',
    desc: 'Book via cargo.one, WebCargo, CargoAi — or integrate our direct REST API into your TMS.',
    color: '#F97316', bg: 'rgba(249,115,22,0.07)',
  },
  {
    icon: BarChart3,
    title: 'Consolidation matching',
    desc: 'A dashboard that pairs your loose cargo with compatible lots — with margin transparency.',
    color: '#0891B2', bg: 'rgba(8,145,178,0.07)',
  },
]

const TIER_ROWS: { label: string; values: [string | boolean, string | boolean, string | boolean] }[] = [
  { label: 'Volume / month',  values: ['Any', '5t+', '20t+'] },
  { label: 'Credit terms',    values: ['Prepaid', '15 days', '30 days'] },
  { label: 'Rate access',     values: ['Portal rates', 'Negotiated', 'Dedicated desk'] },
  { label: 'AWB issuance',    values: ['Manual', 'Same-day', 'Instant'] },
  { label: 'API access',      values: [false, 'Read-only', 'Full'] },
  { label: 'SLA',             values: ['Standard', '4h response', '1h response'] },
]

function TierCell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-4 h-4 mx-auto" style={{ color: '#4a7c20' }} aria-label="Included" />
  if (value === false) return <Minus className="w-4 h-4 mx-auto" style={{ color: 'var(--wb-gray-200)' }} aria-label="Not included" />
  return <span className="text-sm font-semibold" style={{ color: 'var(--wb-blue)' }}>{value}</span>
}

const API_SNIPPET = [
  { t: '// POST /v1/bookings', c: '#6B7280' },
  { t: '{', c: '#E5E7EB' },
  { t: '  "origin": "KGL",', c: '#93C5FD' },
  { t: '  "destination": "SHJ",', c: '#93C5FD' },
  { t: '  "pieces": 12,', c: '#FBBF24' },
  { t: '  "weight_kg": 1840,', c: '#FBBF24' },
  { t: '  "commodity": "PHARMACEUTICAL",', c: '#93C5FD' },
  { t: '  "flight": "WB9304",', c: '#93C5FD' },
  { t: '  "awb": "auto"   // instant 459-XXXXXXXX', c: '#6B7280' },
  { t: '}', c: '#E5E7EB' },
]

export default function AgentsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 pb-16" style={{ background: 'var(--neutral-light)' }}>

        {/* ── Hero: direct and commercial ── */}
        <div className="py-20" style={{
          backgroundImage: "linear-gradient(rgba(0,82,156,0.88), rgba(0,42,84,0.92)), url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1600&q=80&fit=crop')",
          backgroundSize: 'cover', backgroundPosition: 'center',
          backgroundColor: 'var(--brand-blue)',
        }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Freight Agents &amp; Forwarders</p>
            <h1 className="text-white mb-4" style={{ fontSize: 'clamp(28px,4vw,56px)', fontWeight: 800, lineHeight: 1.05 }}>
              The cargo platform built<br />for freight professionals
            </h1>
            <p className="mb-8" style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, maxWidth: '560px' }}>
              Allocations, credit lines, priority booking, and API access — all in one place.
              Priority capacity. Instant AWB. 30-day credit. Built for volume.
            </p>
            <Link href="/agents/register"
                  className="inline-flex items-center gap-2 font-bold text-sm"
                  style={{ background: 'var(--wb-yellow)', color: 'var(--brand-blue)', padding: '14px 28px', borderRadius: '8px' }}>
              <Zap className="w-4 h-4" aria-hidden="true" /> Apply for agent access
            </Link>
            <p className="mt-6 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Your clients&apos; cargo. KGL to AMS in 14 hours. Guaranteed cold-chain.
            </p>
          </div>
        </div>

        {/* ── What agents get: 6-item grid ── */}
        <section className="py-16" style={{ background: 'white' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>What agents get</p>
              <h2 style={{ color: 'var(--wb-blue)' }}>Capability, not promises</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {AGENT_FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
                <div key={title} className="rounded-2xl p-6"
                     style={{ background: 'var(--neutral-light)', border: '1px solid var(--wb-gray-200)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: bg }}>
                    <Icon className="w-5 h-5" style={{ color }} aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-sm mb-1.5" style={{ color: 'var(--wb-blue)' }}>{title}</h3>
                  <p className="text-sm" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Agent tiers comparison ── */}
        <section className="py-16" style={{ background: 'var(--neutral-light)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Agent tiers</p>
              <h2 style={{ color: 'var(--wb-blue)' }}>Grow into better terms</h2>
            </div>

            <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid var(--wb-gray-200)' }}>
              <table className="w-full text-left" style={{ background: 'white', minWidth: 560 }}>
                <caption className="sr-only">Comparison of Standard, Silver and Gold agent tiers</caption>
                <thead>
                  <tr style={{ background: 'var(--wb-blue)' }}>
                    <th scope="col" className="px-5 py-4 text-sm font-bold text-white">Tier</th>
                    <th scope="col" className="px-5 py-4 text-sm font-bold text-center text-white">Standard</th>
                    <th scope="col" className="px-5 py-4 text-sm font-bold text-center" style={{ color: '#E5E7EB' }}>
                      Silver
                    </th>
                    <th scope="col" className="px-5 py-4 text-sm font-bold text-center" style={{ color: 'var(--wb-yellow)' }}>
                      Gold
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TIER_ROWS.map(({ label, values }, i) => (
                    <tr key={label} style={{ background: i % 2 ? 'var(--wb-gray-50)' : 'white' }}>
                      <th scope="row" className="px-5 py-3.5 text-sm font-semibold" style={{ color: 'var(--wb-gray-500)' }}>
                        {label}
                      </th>
                      {values.map((v, j) => (
                        <td key={j} className="px-5 py-3.5 text-center">
                          <TierCell value={v} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs mt-3 text-center" style={{ color: 'var(--wb-gray-500)' }}>
              Tier review is automatic each quarter based on flown volume. Credit terms subject to approval.
            </p>
          </div>
        </section>

        {/* ── API teaser ── */}
        <section className="py-16" style={{ background: 'white' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Integrations</p>
                <h2 style={{ color: 'var(--wb-blue)' }}>Book from your own stack</h2>
                <p className="mt-4 text-sm" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.7 }}>
                  Live on the platforms you already use, or integrate directly: REST API with instant
                  AWB issuance, live capacity, and webhook status updates.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['cargo.one', 'WebCargo', 'CargoAi', 'Flexport', 'CargoWise'].map(name => (
                    <span key={name} className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ background: 'var(--wb-gray-50)', border: '1px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }}>
                      {name}
                    </span>
                  ))}
                </div>
                <Link href="/api-docs"
                      className="inline-flex items-center gap-1 mt-6 text-sm font-bold"
                      style={{ color: 'var(--wb-sky)' }}>
                  View full API docs <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>

              {/* Dark code snippet */}
              <div className="rounded-2xl overflow-hidden" style={{ background: '#0B1220', border: '1px solid #1E293B' }}>
                <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: '1px solid #1E293B' }}>
                  {['#EF4444', '#F59E0B', '#22C55E'].map(c => (
                    <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} aria-hidden="true" />
                  ))}
                  <span className="ml-2 text-xs font-mono" style={{ color: '#64748B' }}>booking-request.json</span>
                </div>
                <pre className="p-5 text-xs sm:text-sm font-mono leading-relaxed overflow-x-auto" aria-label="Sample API booking request">
                  {API_SNIPPET.map(({ t, c }, i) => (
                    <span key={i} style={{ color: c, display: 'block' }}>{t}</span>
                  ))}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ── Registration CTA ── */}
        <section className="py-16" style={{ background: 'var(--neutral-light)' }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="mb-3" style={{ color: 'var(--wb-blue)' }}>Ready to move volume through Kigali?</h2>
            <p className="text-sm mb-7" style={{ color: 'var(--wb-gray-500)' }}>
              Apply in 2 minutes. Our commercial team responds within 24 hours.
            </p>
            <Link href="/agents/register"
                  className="inline-flex items-center gap-2 font-bold text-sm"
                  style={{ background: 'var(--wb-yellow)', color: 'var(--brand-blue)', padding: '14px 32px', borderRadius: '8px' }}>
              <Zap className="w-4 h-4" aria-hidden="true" /> Apply for agent access
            </Link>
          </div>
        </section>
      </main>

      {/* ── Sticky existing-agent bar ── */}
      <div className="sticky bottom-0 inset-x-0 z-40 no-print"
           style={{ background: 'var(--wb-blue-dark)', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Already an agent?
          </p>
          <Link href="/dashboard"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold shrink-0"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(28,163,219,0.6)', color: 'white' }}>
            Log in to your portal <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <Footer />
    </>
  )
}
