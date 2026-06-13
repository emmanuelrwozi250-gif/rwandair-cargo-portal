'use client'

import { useState } from 'react'
import { track } from '@vercel/analytics'
import { CheckCircle, Mail } from 'lucide-react'
import { ARTICLE_CATEGORIES } from '@/lib/news'

const ALL_CATEGORIES = Object.keys(ARTICLE_CATEGORIES)

export default function SubscribeBox() {
  const [email, setEmail] = useState('')
  const [categories, setCategories] = useState<string[]>(ALL_CATEGORIES)
  const [format, setFormat] = useState<'digest' | 'instant'>('digest')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function toggleCategory(cat: string) {
    setCategories(c => (c.includes(cat) ? c.filter(x => x !== cat) : [...c, cat]))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/news/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), categories, format }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Subscription failed')
      track('news_subscribed', { format })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div role="status" className="rounded-2xl p-6 text-center"
           style={{ background: 'var(--wb-green-light)', border: '1px solid rgba(148,201,67,0.4)' }}>
        <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#4a7c20' }} aria-hidden="true" />
        <p className="text-sm font-bold" style={{ color: '#4a7c20' }}>You&apos;re subscribed</p>
        <p className="text-xs mt-1" style={{ color: 'var(--wb-gray-500)' }}>
          Confirmation on its way to {email}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-2xl p-6"
          style={{ background: 'var(--wb-blue)', color: 'white' }}>
      <div className="flex items-center gap-2 mb-1">
        <Mail className="w-4 h-4" style={{ color: 'var(--wb-yellow)' }} aria-hidden="true" />
        <p className="font-bold text-sm">Subscribe for updates</p>
      </div>
      <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
        Route news, alerts and trade intelligence — straight to your inbox.
      </p>

      <label htmlFor="sub-email" className="sr-only">Email address</label>
      <input id="sub-email" type="email" required value={email}
             onChange={e => setEmail(e.target.value)}
             placeholder="you@company.com"
             className="w-full px-4 py-2.5 rounded-lg text-sm outline-none mb-3"
             style={{ background: 'white', color: 'var(--wb-blue)', border: 'none' }} />

      <fieldset className="mb-3">
        <legend className="text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Topics
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {ALL_CATEGORIES.map(cat => {
            const on = categories.includes(cat)
            return (
              <button key={cat} type="button" aria-pressed={on}
                      onClick={() => toggleCategory(cat)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full transition-colors"
                      style={on
                        ? { background: 'var(--wb-yellow)', color: 'var(--wb-blue)' }
                        : { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)' }}>
                {cat}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="mb-4">
        <legend className="sr-only">Delivery format</legend>
        <div className="flex gap-3">
          {([['digest', 'Daily digest'], ['instant', 'Instant alerts']] as const).map(([val, label]) => (
            <label key={val} className="flex items-center gap-1.5 text-xs cursor-pointer"
                   style={{ color: 'rgba(255,255,255,0.75)' }}>
              <input type="radio" name="format" value={val} checked={format === val}
                     onChange={() => setFormat(val)}
                     className="accent-[#FBE115]" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p role="alert" className="text-xs mb-2" style={{ color: '#FCA5A5' }}>{error}</p>}

      <button type="submit" disabled={busy || !categories.length}
              className="w-full py-2.5 rounded-lg font-bold text-sm transition-opacity disabled:opacity-60"
              style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)' }}>
        {busy ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  )
}
