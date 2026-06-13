'use client'

import { useCallback, useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Star, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { STATIC_TESTIMONIALS, CARGO_TYPE_COLORS } from '@/lib/testimonials'
import type { RatingAggregates } from '@/types'

interface ReviewCard {
  id: string
  route: string | null
  cargoType: string
  overall: number
  comment: string | null
  reviewer: string
  company: string | null
  date: string
  verified: boolean
}

const CARGO_FILTERS = ['All', 'Perishables', 'Pharma', 'General', 'Courier'] as const

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} aria-hidden="true"
              style={{
                width: size, height: size,
                color: s <= Math.round(value) ? 'var(--wb-yellow)' : 'var(--wb-gray-200)',
                fill: s <= Math.round(value) ? 'var(--wb-yellow)' : 'none',
              }} />
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const [aggregates, setAggregates] = useState<RatingAggregates | null>(null)
  const [reviews, setReviews] = useState<ReviewCard[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [loading, setLoading] = useState(true)

  const [routeFilter, setRouteFilter] = useState('')
  const [routeInput, setRouteInput] = useState('')
  const [cargoFilter, setCargoFilter] = useState<(typeof CARGO_FILTERS)[number]>('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (routeFilter) params.set('route', routeFilter)
    if (cargoFilter !== 'All') params.set('cargoType', cargoFilter)
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
    try {
      const res = await fetch(`/api/reviews?${params}`)
      const data = await res.json()
      setAggregates(data.aggregates)
      setReviews(data.reviews ?? [])
      setTotal(data.total ?? 0)
      setPageSize(data.pageSize ?? 20)
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [page, routeFilter, cargoFilter, fromDate, toDate])

  useEffect(() => { load() }, [load])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasAnyReviews = (aggregates?.count ?? 0) > 0
  const filtersActive = routeFilter || cargoFilter !== 'All' || fromDate || toDate

  const CATEGORY_CARDS: { label: string; key: keyof RatingAggregates }[] = [
    { label: 'Booking experience', key: 'booking' },
    { label: 'On-time delivery', key: 'ontime' },
    { label: 'Cargo condition', key: 'condition' },
    { label: 'Communication', key: 'communication' },
  ]

  return (
    <>
      <Navbar />
      <main className="pt-16" style={{ background: 'var(--neutral-light)' }}>

        {/* Hero with aggregate score */}
        <div className="py-14" style={{ background: 'var(--wb-blue-dark)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Verified Reviews</p>
            <h1 className="text-white mb-4" style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800 }}>
              What shippers say about us
            </h1>
            <p className="mb-0" style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: '560px' }}>
              Every review below is tied to a real, delivered air waybill. No anonymous submissions,
              no cherry-picking.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ── Aggregate score cards ── */}
          {hasAnyReviews && aggregates && (
            <section aria-label="Aggregate scores" className="mb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Overall — the Trustpilot-style trust metric */}
                <div className="rounded-2xl p-6 sm:col-span-2 lg:col-span-1 flex flex-col justify-center"
                     style={{ background: 'var(--wb-blue)', color: 'white' }}>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="font-black leading-none" style={{ fontSize: 52, color: 'var(--wb-yellow)' }}>
                      {aggregates.overall.toFixed(1)}
                    </span>
                    <span className="text-lg font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>/ 5</span>
                  </div>
                  <Stars value={aggregates.overall} size={20} />
                  <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    from <strong>{aggregates.count}</strong> verified shipment{aggregates.count === 1 ? '' : 's'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                  {CATEGORY_CARDS.map(({ label, key }) => (
                    <div key={key} className="rounded-2xl p-5"
                         style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                      <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--wb-gray-500)' }}>{label}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold" style={{ color: 'var(--wb-blue)' }}>
                          {(aggregates[key] as number).toFixed(1)}
                        </span>
                        <Stars value={aggregates[key] as number} size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Filter bar ── */}
          {hasAnyReviews && (
            <section aria-label="Filter reviews" className="rounded-2xl p-4 mb-8 flex flex-wrap items-end gap-3"
                     style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
              <div className="flex-1 min-w-[160px]">
                <label htmlFor="routeFilter" className="block text-xs font-semibold mb-1" style={{ color: 'var(--wb-gray-500)' }}>
                  Route
                </label>
                <input id="routeFilter" type="text" value={routeInput}
                       onChange={e => setRouteInput(e.target.value)}
                       onBlur={() => { setPage(1); setRouteFilter(routeInput) }}
                       onKeyDown={e => { if (e.key === 'Enter') { setPage(1); setRouteFilter(routeInput) } }}
                       placeholder="e.g. KGL → LHR"
                       className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                       style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }} />
              </div>
              <div>
                <span className="block text-xs font-semibold mb-1" style={{ color: 'var(--wb-gray-500)' }}>Cargo type</span>
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Cargo type filter">
                  {CARGO_FILTERS.map(ct => (
                    <button key={ct} role="radio" aria-checked={cargoFilter === ct}
                            onClick={() => { setPage(1); setCargoFilter(ct) }}
                            className="px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                            style={cargoFilter === ct
                              ? { background: 'var(--wb-blue)', color: 'white' }
                              : { background: 'var(--wb-gray-50)', color: 'var(--wb-blue)', border: '1px solid var(--wb-gray-200)' }}>
                      {ct}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="fromDate" className="block text-xs font-semibold mb-1" style={{ color: 'var(--wb-gray-500)' }}>From</label>
                <input id="fromDate" type="date" value={fromDate}
                       onChange={e => { setPage(1); setFromDate(e.target.value) }}
                       className="px-3 py-2 rounded-lg text-sm outline-none"
                       style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }} />
              </div>
              <div>
                <label htmlFor="toDate" className="block text-xs font-semibold mb-1" style={{ color: 'var(--wb-gray-500)' }}>To</label>
                <input id="toDate" type="date" value={toDate}
                       onChange={e => { setPage(1); setToDate(e.target.value) }}
                       className="px-3 py-2 rounded-lg text-sm outline-none"
                       style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }} />
              </div>
            </section>
          )}

          {/* ── Review cards / states ── */}
          {loading ? (
            <p className="text-sm text-center py-16" style={{ color: 'var(--wb-gray-500)' }} role="status">
              Loading reviews…
            </p>
          ) : !hasAnyReviews ? (
            /* Empty state: founding testimonials until the first verified reviews land */
            <section aria-label="Customer testimonials">
              <p className="text-sm text-center mb-8 px-4 py-3 rounded-xl max-w-xl mx-auto"
                 style={{ background: 'var(--wb-yellow-light)', border: '1px solid rgba(251,225,21,0.5)', color: 'var(--wb-gray-900)' }}>
                Verified reviews are on their way — every delivered shipment receives a rating
                invitation. <strong>Be the first to leave a verified review.</strong> Meanwhile,
                here&apos;s what early customers told us:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {STATIC_TESTIMONIALS.map(({ quote, name, company, country, badge, badgeColor, badgeBg }) => (
                  <div key={name} className="rounded-2xl p-7 flex flex-col gap-4"
                       style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                    <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--wb-gray-500)' }}>
                      &ldquo;{quote}&rdquo;
                    </p>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--wb-blue)' }}>{name}</p>
                      <p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>{company} · {country}</p>
                    </div>
                    <span className="self-start text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: badgeBg, color: badgeColor }}>
                      {badge}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-center py-16" style={{ color: 'var(--wb-gray-500)' }}>
              No reviews match {filtersActive ? 'these filters' : 'yet'} — try widening the search.
            </p>
          ) : (
            <>
              <p className="text-sm mb-4" style={{ color: 'var(--wb-gray-500)' }} aria-live="polite">
                Showing {reviews.length} of {total} review{total === 1 ? '' : 's'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {reviews.map(r => {
                  const tc = CARGO_TYPE_COLORS[r.cargoType] ?? CARGO_TYPE_COLORS.General
                  return (
                    <article key={r.id} className="rounded-2xl p-6 flex flex-col gap-3"
                             style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                      <div className="flex items-center justify-between gap-3">
                        <Stars value={r.overall} />
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
                              style={{ background: 'var(--wb-green-light)', color: '#4a7c20' }}>
                          <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" /> Verified shipment
                        </span>
                      </div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--wb-gray-500)' }}>
                        {r.route ?? 'RwandAir Cargo'} ·{' '}
                        {new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {r.comment && (
                        <p className="text-sm flex-1" style={{ color: 'var(--wb-gray-900)', lineHeight: 1.65 }}>
                          &ldquo;{r.comment}&rdquo;
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-3 mt-1">
                        <p className="text-sm font-bold" style={{ color: 'var(--wb-blue)' }}>
                          {r.reviewer}{r.company ? ` — ${r.company}` : ''}
                        </p>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                              style={{ background: tc.bg, color: tc.color }}>
                          {r.cargoType}
                        </span>
                      </div>
                    </article>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Review pages" className="flex items-center justify-center gap-3 mt-10">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                          aria-label="Previous page"
                          className="p-2.5 rounded-full disabled:opacity-40"
                          style={{ border: '1.5px solid var(--wb-gray-200)', background: 'white', color: 'var(--wb-blue)' }}>
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <span className="text-sm font-semibold" style={{ color: 'var(--wb-gray-500)' }}>
                    Page {page} of {totalPages}
                  </span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                          aria-label="Next page"
                          className="p-2.5 rounded-full disabled:opacity-40"
                          style={{ border: '1.5px solid var(--wb-gray-200)', background: 'white', color: 'var(--wb-blue)' }}>
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
