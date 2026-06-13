'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ShieldCheck, ShieldPlus } from 'lucide-react'

// Optional TOTP 2FA enrolment via Supabase MFA. Shows a QR to scan, verifies a
// code to activate, and lets the user remove an existing factor.
export default function TotpEnroll() {
  const [enrolled, setEnrolled] = useState(false)
  const [factorId, setFactorId] = useState('')
  const [qr, setQr] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [phase, setPhase] = useState<'idle' | 'enrolling'>('idle')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    const { data } = await createClient().auth.mfa.listFactors()
    const totp = data?.totp?.find(f => f.status === 'verified')
    setEnrolled(!!totp)
    if (totp) setFactorId(totp.id)
  }
  useEffect(() => { refresh() }, [])

  async function startEnroll() {
    setBusy(true); setError('')
    try {
      const { data, error } = await createClient().auth.mfa.enroll({ factorType: 'totp' })
      if (error) throw error
      setFactorId(data.id)
      setQr(data.totp.qr_code)
      setSecret(data.totp.secret)
      setPhase('enrolling')
    } catch {
      setError('Could not start 2FA setup. Please try again.')
    } finally { setBusy(false) }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const supabase = createClient()
      const { data: ch, error: cErr } = await supabase.auth.mfa.challenge({ factorId })
      if (cErr) throw cErr
      const { error: vErr } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.id, code: code.trim() })
      if (vErr) { setError('That code didn\'t verify. Try the next one.'); return }
      setPhase('idle'); setCode(''); await refresh()
    } catch {
      setError('Verification failed. Please try again.')
    } finally { setBusy(false) }
  }

  async function remove() {
    if (!confirm('Turn off two-factor authentication?')) return
    await createClient().auth.mfa.unenroll({ factorId })
    setEnrolled(false); setFactorId('')
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="w-4 h-4" style={{ color: enrolled ? '#4a7c20' : 'var(--wb-gray-500)' }} aria-hidden="true" />
        <h2 className="font-bold" style={{ color: 'var(--wb-blue)' }}>Two-factor authentication</h2>
      </div>
      <p className="text-sm mb-4" style={{ color: 'var(--wb-gray-500)' }}>
        {enrolled ? 'Active — you\'ll enter a code from your authenticator app at sign-in.' : 'Add a TOTP authenticator app for an extra layer of security.'}
      </p>

      {error && <p role="alert" className="text-xs mb-3" style={{ color: '#dc2626' }}>{error}</p>}

      {enrolled ? (
        <button onClick={remove} className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
          Turn off 2FA
        </button>
      ) : phase === 'idle' ? (
        <button onClick={startEnroll} disabled={busy}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm"
                style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)', opacity: busy ? 0.7 : 1 }}>
          <ShieldPlus className="w-4 h-4" aria-hidden="true" /> Enable 2FA
        </button>
      ) : (
        <form onSubmit={verify} className="space-y-3">
          {qr && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="Scan this QR code with your authenticator app" width={160} height={160}
                 style={{ border: '1px solid var(--wb-gray-200)', borderRadius: 8 }} />
          )}
          {secret && <p className="text-xs font-mono break-all" style={{ color: 'var(--wb-gray-500)' }}>Or enter key: {secret}</p>}
          <input inputMode="numeric" value={code} onChange={e => setCode(e.target.value)} placeholder="6-digit code" required
                 className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                 style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }} />
          <button type="submit" disabled={busy}
                  className="px-5 py-2.5 rounded-full font-bold text-sm"
                  style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)', opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Verifying…' : 'Verify & activate'}
          </button>
        </form>
      )}
    </div>
  )
}
