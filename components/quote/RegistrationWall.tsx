'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { X, Lock } from 'lucide-react'

// Lightweight quote-wall: email + company → instant account (no approval) →
// session established via magic-link token verification → rates revealed.
export default function RegistrationWall({
  open,
  onClose,
  onAuthed,
}: {
  open: boolean
  onClose: () => void
  onAuthed: () => void
}) {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [existing, setExisting] = useState(false)

  if (!open) return null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError(''); setExisting(false)
    try {
      const res = await fetch('/api/portal/quick-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), company: company.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Registration failed')

      if (data.exists) { setExisting(true); return }

      if (data.tokenHash) {
        const supabase = createClient()
        const { error: vErr } = await supabase.auth.verifyOtp({ token_hash: data.tokenHash, type: 'magiclink' })
        if (vErr) { setError('Could not start your session. Please sign in instead.'); setExisting(true); return }
        onAuthed()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true"
         aria-label="See your rates">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-2xl p-6 sm:p-8" style={{ background: 'white' }}>
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100">
          <X className="w-5 h-5" style={{ color: 'var(--wb-gray-500)' }} aria-hidden="true" />
        </button>

        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--wb-sky-light)' }}>
          <Lock className="w-5 h-5" style={{ color: 'var(--wb-sky)' }} aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--wb-blue)' }}>See your rates</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--wb-gray-500)' }}>
          Free, instant — just your email and company. No approval needed; your quote opens straight away.
        </p>

        {existing ? (
          <div className="rounded-lg p-4 text-sm" style={{ background: 'var(--wb-sky-light)', border: '1px solid rgba(28,163,219,0.25)', color: 'var(--wb-blue)' }}>
            That email already has an account.{' '}
            <Link href="/portal/login?next=/quote" className="font-bold underline">Sign in to see your rates →</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="rw-email" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--wb-blue)' }}>Email</label>
              <input id="rw-email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                     autoComplete="email" placeholder="you@company.com"
                     className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                     style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }} />
            </div>
            <div>
              <label htmlFor="rw-company" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--wb-blue)' }}>Company name</label>
              <input id="rw-company" type="text" required value={company} onChange={e => setCompany(e.target.value)}
                     autoComplete="organization" placeholder="Your company"
                     className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                     style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }} />
            </div>
            {error && <p role="alert" className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}
            <button type="submit" disabled={busy}
                    className="w-full py-3 rounded-full font-bold text-sm transition-opacity"
                    style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)', opacity: busy ? 0.7 : 1 }}>
              {busy ? 'Opening your quote…' : 'Show my rates'}
            </button>
            <p className="text-xs text-center" style={{ color: 'var(--wb-gray-500)' }}>
              Already registered?{' '}
              <Link href="/portal/login?next=/quote" className="font-semibold underline" style={{ color: 'var(--wb-blue)' }}>Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
