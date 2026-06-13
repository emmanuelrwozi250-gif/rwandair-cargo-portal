'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import TopBar from '@/components/dashboard/TopBar'
import { Rating } from '@/types'
import { Loader2, Star, Flag, Eye, EyeOff } from 'lucide-react'

export default function AdminReviewsPage() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'flagged' | 'hidden' | 'low'>('all')

  useEffect(() => {
    loadRatings()
  }, [])

  const loadRatings = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/reviews')
    if (res.ok) {
      const data = await res.json()
      setRatings(data.ratings || [])
    }
    setLoading(false)
  }

  const update = async (id: string, updates: { is_published?: boolean; is_flagged?: boolean }) => {
    setBusyId(id)
    await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    await loadRatings()
    setBusyId(null)
  }

  const visible = ratings.filter(r => {
    if (filter === 'flagged') return r.is_flagged
    if (filter === 'hidden') return !r.is_published
    if (filter === 'low') return r.score_overall <= 2
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Reviews Moderation" />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex gap-2">
            {([['all', 'All'], ['flagged', 'Flagged'], ['hidden', 'Hidden'], ['low', '1–2 stars']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${
                        filter === key
                          ? 'bg-[#02284d] text-white border-[#02284d]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}>
                {label}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">{visible.length} review{visible.length === 1 ? '' : 's'}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : visible.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-20">No reviews in this view.</p>
        ) : (
          <div className="space-y-3">
            {visible.map(r => (
              <div key={r.id}
                   className={`bg-white rounded-xl border p-5 ${r.is_flagged ? 'border-red-300' : 'border-gray-200'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= r.score_overall ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </span>
                      <span className="font-mono text-xs text-gray-500">{r.awb}</span>
                      {r.route && <span className="text-xs text-gray-500">{r.route}</span>}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{r.cargo_type}</span>
                      {!r.display_consent && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          No public consent
                        </span>
                      )}
                      {r.is_flagged && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">Flagged</span>
                      )}
                      {!r.is_published && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Hidden</span>
                      )}
                    </div>
                    {r.comment && <p className="text-sm text-gray-700 mt-2">&ldquo;{r.comment}&rdquo;</p>}
                    <p className="text-xs text-gray-400 mt-2">
                      {r.reviewer_name || 'Anonymous'}{r.reviewer_company ? ` — ${r.reviewer_company}` : ''} ·{' '}
                      booking {r.score_booking} / ontime {r.score_ontime} / condition {r.score_condition} / comms {r.score_communication} ·{' '}
                      {new Date(r.created_at).toLocaleString('en-GB')}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => update(r.id, { is_flagged: !r.is_flagged })}
                            disabled={busyId === r.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border disabled:opacity-50 ${
                              r.is_flagged
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}>
                      <Flag className="w-3.5 h-3.5" /> {r.is_flagged ? 'Unflag' : 'Flag'}
                    </button>
                    <button onClick={() => update(r.id, { is_published: !r.is_published })}
                            disabled={busyId === r.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border disabled:opacity-50 ${
                              r.is_published
                                ? 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                : 'bg-green-50 text-green-700 border-green-200'
                            }`}>
                      {r.is_published
                        ? <><EyeOff className="w-3.5 h-3.5" /> Hide</>
                        : <><Eye className="w-3.5 h-3.5" /> Publish</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
