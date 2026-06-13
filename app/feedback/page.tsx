'use client'

import { useEffect, useState } from 'react'
import { track } from '@vercel/analytics'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import NpsPulse from '@/components/feedback/NpsPulse'
import {
  Tag, Warehouse, Radar, MonitorSmartphone, Plane, MessageCircle,
  CheckCircle, TrendingUp, X,
} from 'lucide-react'
import type { FeedbackCategory, FeatureRequest } from '@/types'

const CATEGORIES: { key: FeedbackCategory; icon: typeof Tag; short: string }[] = [
  { key: 'Booking & Pricing',               icon: Tag,               short: 'Booking & Pricing' },
  { key: 'Operations & Handling',           icon: Warehouse,         short: 'Operations' },
  { key: 'Tracking & Communication',        icon: Radar,             short: 'Tracking & Comms' },
  { key: 'Website & Digital Tools',         icon: MonitorSmartphone, short: 'Website & Digital' },
  { key: 'New Route / Destination Request', icon: Plane,             short: 'New Route Request' },
  { key: 'Other',                           icon: MessageCircle,     short: 'Other' },
]

export default function FeedbackPage() {
  const [category, setCategory] = useState<FeedbackCategory>('Booking & Pricing')
  const [message, setMessage] = useState('')
  const [urgent, setUrgent] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [awbRef, setAwbRef] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const [requests, setRequests] = useState<FeatureRequest[]>([])

  useEffect(() => {
    fetch('/api/feature-requests')
      .then(r => r.json())
      .then(d => setRequests(d.requests ?? []))
      .catch(() => {})
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (message.trim().length < 20) {
      setError(`Please tell us a little more — at least 20 characters (currently ${message.trim().length}).`)
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message: message.trim(),
          urgent,
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          awbRef: awbRef.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not send your feedback.')
      track('feedback_submitted', { category, urgent })
      setDone(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-16" style={{ background: 'var(--neutral-light)' }}>

        <div className="py-14" style={{ background: 'var(--wb-blue-dark)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Feedback Centre</p>
            <h1 className="text-white mb-4" style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800 }}>
              We want to hear from you
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: '560px' }}>
              Ideas, route requests, praise, problems — everything lands with a real person at
              Kigali, and the best requests end up on the board below.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

          {/* ── Quick NPS pulse ── */}
          <section aria-label="Quick pulse" className="rounded-2xl p-6 sm:p-8"
                   style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
            <NpsPulse source="page" />
          </section>

          {/* ── Category feedback form ── */}
          <section aria-label="Detailed feedback" className="rounded-2xl p-6 sm:p-8"
                   style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
            {done ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--wb-green)' }} aria-hidden="true" />
                <h2 className="mb-3" style={{ color: 'var(--wb-blue)' }}>Thank you</h2>
                <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.7 }}>
                  We review all feedback within 48 hours.
                  {email.trim() && ' Since you left your email, we\'ll follow up personally.'}
                </p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--wb-blue)' }}>
                  Tell us something specific
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--wb-gray-500)' }}>
                  Pick the area it relates to — that routes it straight to the right team.
                </p>

                {/* Category cards */}
                <div role="radiogroup" aria-label="Feedback category"
                     className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                  {CATEGORIES.map(({ key, icon: Icon, short }) => {
                    const active = category === key
                    return (
                      <button key={key} type="button" role="radio" aria-checked={active}
                              onClick={() => setCategory(key)}
                              className="flex flex-col items-start gap-1.5 rounded-xl p-3.5 text-left transition-all"
                              style={{
                                background: active ? 'var(--wb-sky-light)' : 'white',
                                border: active ? '2px solid var(--wb-sky)' : '1.5px solid var(--wb-gray-200)',
                              }}>
                        <Icon className="w-5 h-5" style={{ color: active ? 'var(--wb-sky)' : 'var(--wb-gray-500)' }} aria-hidden="true" />
                        <span className="text-xs font-bold leading-tight" style={{ color: 'var(--wb-blue)' }}>{short}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="space-y-5">
                  <div>
                    <label htmlFor="fb-message" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--wb-blue)' }}>
                      Your feedback<span aria-hidden="true" style={{ color: '#dc2626' }}> *</span>
                    </label>
                    <textarea id="fb-message" rows={5} value={message}
                              onChange={e => { setMessage(e.target.value); setError('') }}
                              placeholder={category === 'New Route / Destination Request'
                                ? 'Which route do you need, how often, and roughly how much volume?'
                                : 'What happened, what would make it better?'}
                              aria-invalid={!!error}
                              className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-y"
                              style={{ border: error ? '1.5px solid #dc2626' : '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)', background: 'white' }} />
                    {error
                      ? <p role="alert" className="flex items-center gap-1 text-xs mt-1" style={{ color: '#dc2626' }}>
                          <X className="w-3 h-3 shrink-0" aria-hidden="true" /> {error}
                        </p>
                      : <p className="text-xs mt-1" style={{ color: 'var(--wb-gray-500)' }}>Minimum 20 characters · {message.trim().length}/20</p>}
                  </div>

                  {/* Urgency toggle */}
                  <div className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
                       style={{ background: 'var(--wb-gray-50)', border: '1px solid var(--wb-gray-200)' }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--wb-blue)' }}>Is this urgent?</p>
                      <p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>
                        Urgent items are flagged to the cargo desk manager for same-day review.
                      </p>
                    </div>
                    <button type="button" role="switch" aria-checked={urgent}
                            aria-label="Mark as urgent"
                            onClick={() => setUrgent(!urgent)}
                            className="relative shrink-0 rounded-full transition-colors"
                            style={{ width: 48, height: 28, background: urgent ? '#dc2626' : 'var(--wb-gray-200)' }}>
                      <span className="absolute top-1 rounded-full bg-white transition-all"
                            style={{ width: 20, height: 20, left: urgent ? 24 : 4 }} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="fb-name" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--wb-blue)' }}>
                        Name <span className="font-normal text-xs" style={{ color: 'var(--wb-gray-500)' }}>(optional)</span>
                      </label>
                      <input id="fb-name" type="text" value={name} onChange={e => setName(e.target.value)}
                             autoComplete="name"
                             className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                             style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)', background: 'white' }} />
                    </div>
                    <div>
                      <label htmlFor="fb-email" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--wb-blue)' }}>
                        Email <span className="font-normal text-xs" style={{ color: 'var(--wb-gray-500)' }}>(for follow-up)</span>
                      </label>
                      <input id="fb-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                             autoComplete="email"
                             className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                             style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)', background: 'white' }} />
                    </div>
                    <div>
                      <label htmlFor="fb-awb" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--wb-blue)' }}>
                        AWB <span className="font-normal text-xs" style={{ color: 'var(--wb-gray-500)' }}>(if relevant)</span>
                      </label>
                      <input id="fb-awb" type="text" value={awbRef} onChange={e => setAwbRef(e.target.value)}
                             placeholder="459-12345678"
                             className="w-full px-4 py-2.5 rounded-lg text-sm font-mono outline-none"
                             style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)', background: 'white' }} />
                    </div>
                  </div>

                  <button type="submit" disabled={busy}
                          className="px-8 py-3 rounded-full font-bold text-sm transition-opacity"
                          style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)', opacity: busy ? 0.7 : 1 }}>
                    {busy ? 'Sending…' : 'Send feedback'}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* ── Feature request board ── */}
          {requests.length > 0 && (
            <section aria-label="Most requested features" className="rounded-2xl p-6 sm:p-8"
                     style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5" style={{ color: 'var(--wb-sky)' }} aria-hidden="true" />
                <h2 className="text-lg font-bold" style={{ color: 'var(--wb-blue)' }}>
                  What you&apos;re asking for most
                </h2>
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--wb-gray-500)' }}>
                Updated monthly by the cargo desk from the feedback above. Yes — it gets read,
                counted, and acted on.
              </p>
              <ol className="space-y-2">
                {requests.map((r, i) => (
                  <li key={r.id} className="flex items-center gap-4 rounded-xl px-4 py-3"
                      style={{ background: 'var(--wb-gray-50)', border: '1px solid var(--wb-gray-200)' }}>
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                          style={{ background: 'var(--wb-blue)', color: 'var(--wb-yellow)' }} aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--wb-blue)' }}>{r.title}</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                          style={{ background: 'var(--wb-sky-light)', color: 'var(--wb-sky)' }}>
                      {r.request_count} requests
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
