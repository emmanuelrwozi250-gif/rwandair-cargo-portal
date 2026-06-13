'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { Lock, Check, X, Loader2, ShieldCheck } from 'lucide-react'

interface Registration {
  id: string
  email: string
  company_name: string
  country: string | null
  volume_tier: string | null
  iata_fiata_code: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  pending:  { color: '#B45309', bg: 'rgba(245,158,11,0.12)' },
  approved: { color: '#4a7c20', bg: 'rgba(148,201,67,0.15)' },
  rejected: { color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
}

export default function AgentAdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const [regs, setRegs] = useState<Registration[]>([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending'>('pending')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/agent-admin/registrations')
    if (res.status === 401) { setAuthed(false); setLoading(false); return }
    if (res.ok) {
      const d = await res.json()
      setRegs(d.registrations ?? [])
      setAuthed(true)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoggingIn(true); setLoginError('')
    try {
      const res = await fetch('/api/agent-admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.error || 'Login failed') }
      setPassword(''); await load()
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed')
    } finally { setLoggingIn(false) }
  }

  async function decide(id: string, action: 'approve' | 'reject') {
    if (action === 'reject' && !confirm('Reject this application?')) return
    setBusyId(id)
    await fetch('/api/agent-admin/decision', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    await load()
    setBusyId(null)
  }

  async function signOut() {
    await fetch('/api/agent-admin/login', { method: 'DELETE' })
    setAuthed(false); setRegs([])
  }

  // ── Password gate ──
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--neutral-light)' }}>
        <form onSubmit={login} className="w-full max-w-sm rounded-2xl p-8" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--wb-sky-light)' }}>
            <Lock className="w-5 h-5" style={{ color: 'var(--wb-sky)' }} aria-hidden="true" />
          </div>
          <h1 className="text-lg font-bold mb-1" style={{ color: 'var(--wb-blue)' }}>Agent approvals</h1>
          <p className="text-sm mb-5" style={{ color: 'var(--wb-gray-500)' }}>Enter the admin password to continue.</p>
          <input type="password" value={password} onChange={e => { setPassword(e.target.value); setLoginError('') }}
                 placeholder="Admin password" autoComplete="current-password" required
                 className="w-full px-4 py-3 rounded-lg text-sm outline-none mb-3"
                 style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }} />
          {loginError && <p role="alert" className="text-xs mb-3" style={{ color: '#dc2626' }}>{loginError}</p>}
          <button type="submit" disabled={loggingIn}
                  className="w-full py-3 rounded-full font-bold text-sm" style={{ background: 'var(--wb-blue)', color: 'white', opacity: loggingIn ? 0.7 : 1 }}>
            {loggingIn ? 'Checking…' : 'Sign in'}
          </button>
        </form>
      </div>
    )
  }

  const visible = regs.filter(r => filter === 'all' ? true : r.status === 'pending')

  return (
    <div className="min-h-screen" style={{ background: 'var(--neutral-light)' }}>
      <header className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between" style={{ background: 'var(--brand-blue)' }}>
        <span className="font-bold" style={{ color: 'var(--wb-yellow)' }}>RwandAir Cargo · Agent approvals</span>
        <button onClick={signOut} className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>Sign out</button>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-2">
            {(['pending', 'all'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold border capitalize"
                      style={filter === f
                        ? { background: 'var(--wb-blue)', color: 'white', borderColor: 'var(--wb-blue)' }
                        : { background: 'white', color: 'var(--wb-blue)', borderColor: 'var(--wb-gray-200)' }}>
                {f === 'pending' ? 'Pending' : 'All'}
              </button>
            ))}
          </div>
          <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>{visible.length} application{visible.length === 1 ? '' : 's'}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--wb-gray-500)' }} /></div>
        ) : visible.length === 0 ? (
          <p className="text-center text-sm py-20" style={{ color: 'var(--wb-gray-500)' }}>No applications in this view.</p>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--wb-gray-50)', color: 'var(--wb-gray-500)' }} className="text-left text-xs">
                  <th className="px-4 py-3 font-semibold">Company</th>
                  <th className="px-4 py-3 font-semibold">Country</th>
                  <th className="px-4 py-3 font-semibold">Volume</th>
                  <th className="px-4 py-3 font-semibold">Applied</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Decision</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(r => (
                  <tr key={r.id} style={{ borderTop: '1px solid var(--wb-gray-200)' }}>
                    <td className="px-4 py-3">
                      <p className="font-semibold" style={{ color: 'var(--wb-blue)' }}>{r.company_name || '—'}</p>
                      <p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>{r.email}{r.iata_fiata_code ? ` · ${r.iata_fiata_code}` : ''}</p>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--wb-gray-900)' }}>{r.country ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--wb-gray-900)' }}>{r.volume_tier ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--wb-gray-500)' }}>{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize" style={{ color: STATUS_STYLE[r.status].color, background: STATUS_STYLE[r.status].bg }}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {r.status !== 'approved' && (
                          <button onClick={() => decide(r.id, 'approve')} disabled={busyId === r.id}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                                  style={{ background: 'var(--wb-green-light)', color: '#4a7c20' }}>
                            <Check className="w-3.5 h-3.5" aria-hidden="true" /> Approve
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button onClick={() => decide(r.id, 'reject')} disabled={busyId === r.id}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                                  style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                            <X className="w-3.5 h-3.5" aria-hidden="true" /> Reject
                          </button>
                        )}
                        {r.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: '#4a7c20' }}>
                            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> Active
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
