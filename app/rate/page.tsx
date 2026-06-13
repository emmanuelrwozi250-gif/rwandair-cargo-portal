'use client'

import { useEffect, useState } from 'react'
import { track } from '@vercel/analytics'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StarRating from '@/components/ui/StarRating'
import { CheckCircle, Gift, Plane, X } from 'lucide-react'

type PageState = 'loading' | 'invalid' | 'used' | 'expired' | 'ready' | 'done'

const CATEGORIES = [
  { key: 'booking',       label: 'Booking experience' },
  { key: 'ontime',        label: 'On-time delivery' },
  { key: 'condition',     label: 'Cargo condition on arrival' },
  { key: 'communication', label: 'Communication & updates' },
  { key: 'overall',       label: 'Overall experience' },
] as const

const CARGO_TYPES = ['General', 'Perishables', 'Pharma', 'Courier'] as const

export default function RatePage() {
  const [state, setState] = useState<PageState>('loading')
  const [token, setToken] = useState('')
  const [shipment, setShipment] = useState<{ awb: string; route?: string; deliveryDate?: string } | null>(null)

  const [scores, setScores] = useState<Record<string, number>>({
    booking: 0, ontime: 0, condition: 0, communication: 0, overall: 0,
  })
  const [comment, setComment] = useState('')
  const [cargoType, setCargoType] = useState<(typeof CARGO_TYPES)[number]>('General')
  const [displayConsent, setDisplayConsent] = useState(false)
  const [fullNameConsent, setFullNameConsent] = useState(false)
  const [reviewerName, setReviewerName] = useState('')
  const [reviewerCompany, setReviewerCompany] = useState('')
  const [missing, setMissing] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [discountCode, setDiscountCode] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token') ?? ''
    setToken(t)
    if (!t) { setState('invalid'); return }

    fetch(`/api/rate/validate?token=${encodeURIComponent(t)}`)
      .then(async res => {
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
          setShipment(data)
          setState('ready')
        } else {
          setState(data?.error === 'used' ? 'used' : data?.error === 'expired' ? 'expired' : 'invalid')
        }
      })
      .catch(() => setState('invalid'))
  }, [])

  async function handleSubmit() {
    const unrated = CATEGORIES.filter(c => !scores[c.key]).map(c => c.label)
    setMissing(unrated)
    if (unrated.length) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          scores,
          comment: comment.trim() || undefined,
          cargoType,
          displayConsent,
          fullNameConsent,
          reviewerName: reviewerName.trim() || undefined,
          reviewerCompany: reviewerCompany.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Submission failed')
      track('rating_submitted', { overall: scores.overall, cargoType })
      setDiscountCode(data.discountCode ?? 'THANKYOU5')
      setState('done')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const deadEnd = (title: string, body: string) => (
    <div className="rounded-2xl p-10 text-center" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
      <h2 className="mb-3" style={{ color: 'var(--wb-blue)' }}>{title}</h2>
      <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.7 }}>{body}</p>
      <Link href="/reviews" className="inline-flex px-6 py-3 rounded-full font-bold text-sm"
            style={{ background: 'var(--wb-blue)', color: 'white' }}>
        Read customer reviews
      </Link>
    </div>
  )

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen" style={{ background: 'var(--neutral-light)' }}>
        <div className="py-14" style={{ background: 'var(--wb-blue-dark)' }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Rate our service</p>
            <h1 className="text-white mb-3" style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800 }}>
              How was your shipment?
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
              60 seconds of your time, directly to the people who run the operation.
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {state === 'loading' && (
            <div className="rounded-2xl p-10 text-center" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
              <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>Checking your rating link…</p>
            </div>
          )}

          {state === 'invalid' && deadEnd(
            'This rating link isn\'t valid',
            'Rating links are personal to a delivered shipment. If you received one by email or WhatsApp, please open it directly — or contact our cargo desk if you think something\'s wrong.'
          )}
          {state === 'used' && deadEnd(
            'You\'ve already rated this shipment',
            'Each shipment can be rated once — and yours is in. Thank you for taking the time; your feedback makes us better.'
          )}
          {state === 'expired' && deadEnd(
            'This rating link has expired',
            'Rating links are valid for 7 days after delivery. We\'d still love to hear from you — share your thoughts through our feedback centre anytime.'
          )}

          {state === 'done' && (
            <div className="rounded-2xl p-10 text-center" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
              <CheckCircle className="w-14 h-14 mx-auto mb-5" style={{ color: 'var(--wb-green)' }} aria-hidden="true" />
              <h2 className="mb-3" style={{ color: 'var(--wb-blue)' }}>Your feedback makes us better</h2>
              <p className="text-sm max-w-md mx-auto mb-8" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.7 }}>
                Thank you for flying with us. Every rating is read by the cargo team at Kigali —
                and it shapes how we run tomorrow&apos;s operation.
              </p>
              <div className="inline-flex items-center gap-3 rounded-xl px-6 py-4 mb-8"
                   style={{ background: 'var(--wb-yellow-light)', border: '1px solid rgba(251,225,21,0.6)' }}>
                <Gift className="w-6 h-6 shrink-0" style={{ color: 'var(--wb-blue)' }} aria-hidden="true" />
                <div className="text-left">
                  <p className="text-xs font-semibold" style={{ color: 'var(--wb-gray-500)' }}>
                    5% off your next booking
                  </p>
                  <p className="font-mono font-bold text-lg" style={{ color: 'var(--wb-blue)' }}>{discountCode}</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/quote" className="px-6 py-3 rounded-full font-bold text-sm"
                      style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)' }}>
                  Book your next shipment
                </Link>
                <Link href="/reviews" className="px-6 py-3 rounded-full font-bold text-sm"
                      style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)', background: 'white' }}>
                  Read all reviews
                </Link>
              </div>
            </div>
          )}

          {state === 'ready' && shipment && (
            <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
              {/* Pre-populated shipment context */}
              <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-8"
                   style={{ background: 'var(--wb-sky-light)', border: '1px solid rgba(28,163,219,0.25)' }}>
                <Plane className="w-5 h-5 shrink-0" style={{ color: 'var(--wb-sky)' }} aria-hidden="true" />
                <div className="text-sm">
                  <p className="font-mono font-bold" style={{ color: 'var(--wb-blue)' }}>{shipment.awb}</p>
                  <p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>
                    {shipment.route ?? 'RwandAir Cargo shipment'}
                    {shipment.deliveryDate && ` · delivered ${new Date(shipment.deliveryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </p>
                </div>
              </div>

              {/* Star categories */}
              <div className="divide-y" style={{ borderColor: 'var(--wb-gray-200)' }}>
                {CATEGORIES.map(({ key, label }) => (
                  <StarRating
                    key={key}
                    label={label}
                    value={scores[key]}
                    onChange={v => { setScores(s => ({ ...s, [key]: v })); setMissing(m => m.filter(x => x !== label)) }}
                    error={missing.includes(label)}
                  />
                ))}
              </div>
              {missing.length > 0 && (
                <p role="alert" className="flex items-center gap-1 text-xs mt-3" style={{ color: '#dc2626' }}>
                  <X className="w-3 h-3 shrink-0" aria-hidden="true" />
                  Please rate: {missing.join(', ')}
                </p>
              )}

              {/* Cargo type */}
              <fieldset className="mt-7">
                <legend className="text-sm font-semibold mb-2" style={{ color: 'var(--wb-blue)' }}>
                  What did you ship?
                </legend>
                <div className="flex flex-wrap gap-2">
                  {CARGO_TYPES.map(ct => (
                    <button key={ct} type="button" role="radio" aria-checked={cargoType === ct}
                            onClick={() => setCargoType(ct)}
                            className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                            style={cargoType === ct
                              ? { background: 'var(--wb-blue)', color: 'white' }
                              : { background: 'white', color: 'var(--wb-blue)', border: '1.5px solid var(--wb-gray-200)' }}>
                      {ct}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Free text */}
              <div className="mt-7">
                <label htmlFor="comment" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--wb-blue)' }}>
                  Tell us more <span className="font-normal" style={{ color: 'var(--wb-gray-500)' }}>(optional)</span>
                </label>
                <textarea id="comment" rows={4} value={comment} onChange={e => setComment(e.target.value)}
                          maxLength={2000}
                          placeholder="What stood out — good or bad?"
                          className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-y"
                          style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)', background: 'white' }} />
              </div>

              {/* Consent */}
              <div className="mt-6 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={displayConsent}
                         onChange={e => setDisplayConsent(e.target.checked)}
                         className="mt-0.5 w-4 h-4 shrink-0 accent-[#00529C]" />
                  <span className="text-sm" style={{ color: 'var(--wb-gray-900)', lineHeight: 1.6 }}>
                    I consent to RwandAir Cargo displaying my rating publicly
                    <span className="block text-xs mt-0.5" style={{ color: 'var(--wb-gray-500)' }}>
                      Your name and company will be shown as initials only, unless you also tick the box below.
                    </span>
                  </span>
                </label>

                {displayConsent && (
                  <div className="ml-7 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={fullNameConsent}
                             onChange={e => setFullNameConsent(e.target.checked)}
                             className="mt-0.5 w-4 h-4 shrink-0 accent-[#00529C]" />
                      <span className="text-sm" style={{ color: 'var(--wb-gray-900)' }}>
                        Display my full name and company
                      </span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="reviewerName" className="sr-only">Your name</label>
                        <input id="reviewerName" type="text" value={reviewerName}
                               onChange={e => setReviewerName(e.target.value)}
                               placeholder="Your name" autoComplete="name"
                               className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                               style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)', background: 'white' }} />
                      </div>
                      <div>
                        <label htmlFor="reviewerCompany" className="sr-only">Company</label>
                        <input id="reviewerCompany" type="text" value={reviewerCompany}
                               onChange={e => setReviewerCompany(e.target.value)}
                               placeholder="Company (optional)" autoComplete="organization"
                               className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                               style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)', background: 'white' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {submitError && (
                <div role="alert" className="rounded-lg p-3 text-sm mt-6 flex items-start gap-2"
                     style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.25)', color: '#dc2626' }}>
                  <X className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" /> {submitError}
                </div>
              )}

              <button type="button" onClick={handleSubmit} disabled={submitting}
                      className="w-full mt-8 px-6 py-3.5 rounded-full font-bold text-sm transition-opacity"
                      style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Sending…' : 'Submit rating'}
              </button>
              <p className="text-xs text-center mt-3" style={{ color: 'var(--wb-gray-500)' }}>
                Your identity is stored separately from the public display name. Submit once per shipment.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
