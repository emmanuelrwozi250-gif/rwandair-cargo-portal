'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star, BadgeCheck, ChevronRight } from 'lucide-react'
import { STATIC_TESTIMONIALS, CARGO_TYPE_COLORS } from '@/lib/testimonials'
import type { RatingAggregates } from '@/types'

interface TopReview {
  id: string
  route: string | null
  cargoType: string
  overall: number
  comment: string | null
  reviewer: string
  company: string | null
}

// Homepage testimonials (Feature 5c): live top-3 verified reviews once they
// exist, founding static quotes until then.
export default function LiveTestimonials() {
  const [reviews, setReviews] = useState<TopReview[] | null>(null)
  const [aggregates, setAggregates] = useState<RatingAggregates | null>(null)

  useEffect(() => {
    fetch('/api/reviews?page=1')
      .then(r => r.json())
      .then(d => {
        setAggregates(d.aggregates ?? null)
        const withComments = (d.reviews ?? []).filter((r: TopReview) => r.comment)
        setReviews(
          [...withComments].sort((a: TopReview, b: TopReview) => b.overall - a.overall).slice(0, 3)
        )
      })
      .catch(() => setReviews([]))
  }, [])

  const live = (aggregates?.count ?? 0) > 0 && (reviews?.length ?? 0) > 0

  return (
    <section className="py-20" style={{ background: 'var(--wb-gray-50)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Customer Stories</p>
          <h2 style={{ color: 'var(--wb-blue)' }}>Africa moves with us</h2>
          {live && aggregates && (
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full"
               style={{ background: 'white', border: '1px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }}>
              <Star className="w-4 h-4" style={{ color: 'var(--wb-yellow)', fill: 'var(--wb-yellow)' }} aria-hidden="true" />
              {aggregates.overall.toFixed(1)} / 5 · {aggregates.count} verified shipment{aggregates.count === 1 ? '' : 's'}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {live
            ? reviews!.map(r => {
                const tc = CARGO_TYPE_COLORS[r.cargoType] ?? CARGO_TYPE_COLORS.General
                const excerpt = r.comment!.length > 120 ? `${r.comment!.slice(0, 117)}…` : r.comment!
                return (
                  <div key={r.id} className="rounded-2xl p-8 flex flex-col gap-4"
                       style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex" role="img" aria-label={`${r.overall} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className="w-4 h-4" aria-hidden="true"
                                style={{
                                  color: s <= r.overall ? 'var(--wb-yellow)' : 'var(--wb-gray-200)',
                                  fill: s <= r.overall ? 'var(--wb-yellow)' : 'none',
                                }} />
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--wb-green-light)', color: '#4a7c20' }}>
                        <BadgeCheck className="w-3 h-3" aria-hidden="true" /> Verified
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--wb-gray-500)' }}>
                      &ldquo;{excerpt}&rdquo;
                    </p>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--wb-blue)' }}>
                        {r.reviewer}{r.company ? ` — ${r.company}` : ''}
                      </p>
                      {r.route && <p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>{r.route}</p>}
                    </div>
                    <span className="self-start text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: tc.bg, color: tc.color }}>
                      {r.cargoType}
                    </span>
                  </div>
                )
              })
            : STATIC_TESTIMONIALS.map(({ quote, name, company, country, badge, badgeColor, badgeBg }) => (
                <div key={name} className="rounded-2xl p-8 flex flex-col gap-4"
                     style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                  <svg width="28" height="20" viewBox="0 0 28 20" fill="none" aria-hidden="true">
                    <path d="M0 20V12C0 5.373 4.477 1.12 13.43 0l1.14 2.16C9.38 3.44 6.9 6.04 6.28 10H12V20H0zm16 0V12c0-6.627 4.477-10.88 13.43-12L30.57 2.16C25.38 3.44 22.9 6.04 22.28 10H28V20H16z"
                          fill="var(--wb-yellow)" fillOpacity="0.5"/>
                  </svg>
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

        <div className="text-center mt-8">
          <Link href="/reviews" className="inline-flex items-center gap-1 text-sm font-bold"
                style={{ color: 'var(--wb-sky)' }}>
            Read all reviews <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
