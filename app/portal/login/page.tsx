'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import RwandAirCargoLogo from '@/components/brand/RwandAirCargoLogo'

type Phase = 'credentials' | 'totp'

export default function PortalLoginPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Honour ?next= for agent-gated pages (e.g. /capacity, /deals); fall back to dashboard
  function destination() {
    const next = new URLSearchParams(window.location.search).get('next')
    return next && next.startsWith('/') && !next.startsWith('//') ? next : '/portal/dashboard'
  }

  async function finishOrChallenge() {
    const supabase = createClient()
    // Does this account require a second factor to reach aal2?
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal && aal.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const totp = factors?.totp?.[0]
      if (totp) {
        setFactorId(totp.id)
        setPhase('totp')
        return false // need TOTP step
      }
    }
    return true // fully signed in
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(
          signInError.message.toLowerCase().includes('email not confirmed')
            ? 'Please confirm your email before signing in.'
            : signInError.message
        )
        return
      }
      if (!data.user) { setError('Sign in failed. Please try again.'); return }

      const done = await finishOrChallenge()
      if (done) { router.push(destination()); router.refresh() }
    } catch {
      setError('A network error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleTotp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: vErr } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() })
      if (vErr) { setError('That code didn\'t verify. Please try again.'); return }
      router.push(destination())
      router.refresh()
    } catch {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <Link href="/" aria-label="RwandAir Cargo home" style={{ background: 'var(--brand-blue)', padding: '10px 16px', borderRadius: 10 }}>
              <RwandAirCargoLogo size={40} />
            </Link>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Agent Portal</h1>
            <p className="text-gray-500 text-sm mt-1">
              {phase === 'credentials' ? 'Sign in to manage bookings, AWBs and invoices' : 'Enter the 6-digit code from your authenticator app'}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            {phase === 'credentials' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <Input id="email" label="Email address" type="email" value={email}
                       onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required autoComplete="email" />
                <Input id="password" label="Password" type="password" value={password}
                       onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
                {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
                <Button type="submit" className="w-full" loading={loading} size="lg">Sign in</Button>
              </form>
            ) : (
              <form onSubmit={handleTotp} className="space-y-4">
                <Input id="totp" label="Authentication code" inputMode="numeric" value={code}
                       onChange={e => setCode(e.target.value)} placeholder="123456" required autoFocus />
                {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
                <Button type="submit" className="w-full" loading={loading} size="lg">Verify</Button>
                <button type="button" onClick={() => { setPhase('credentials'); setCode(''); setError('') }}
                        className="w-full text-sm text-gray-500 hover:underline">Back</button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Not an agent yet?{' '}
            <Link href="/agents/register" className="text-[#02284d] font-semibold hover:underline">Apply for an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
