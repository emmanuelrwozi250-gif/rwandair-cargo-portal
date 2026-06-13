'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Trash2, ShieldCheck } from 'lucide-react'
import type { Profile } from '@/types'

export default function TeamManager({
  members,
  isOwner,
  ownerEmail,
}: {
  members: Profile[]
  isOwner: boolean
  ownerEmail: string
}) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  async function invite(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError(''); setOk('')
    try {
      const res = await fetch('/api/portal/team', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d?.error || 'Invite failed')
      setOk(`Invited ${email.trim()}`); setEmail(''); router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not invite.')
    } finally { setBusy(false) }
  }

  async function remove(id: string) {
    if (!confirm('Remove this team member?')) return
    const res = await fetch(`/api/portal/team?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  return (
    <div className="space-y-6">
      {isOwner && (
        <form onSubmit={invite} className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
          <h2 className="font-bold mb-1" style={{ color: 'var(--wb-blue)' }}>Invite a team member</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--wb-gray-500)' }}>
            Sub-users get full portal access except billing and team management.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                   placeholder="colleague@company.com" autoComplete="off"
                   className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none"
                   style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }} />
            <button type="submit" disabled={busy}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm shrink-0"
                    style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)', opacity: busy ? 0.7 : 1 }}>
              <UserPlus className="w-4 h-4" aria-hidden="true" /> {busy ? 'Inviting…' : 'Invite'}
            </button>
          </div>
          {error && <p role="alert" className="text-xs mt-2" style={{ color: '#dc2626' }}>{error}</p>}
          {ok && <p className="text-xs mt-2" style={{ color: '#4a7c20' }}>{ok}</p>}
        </form>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--wb-gray-50)', color: 'var(--wb-gray-500)' }} className="text-left text-xs">
              <th className="px-5 py-3 font-semibold">Member</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              {isOwner && <th className="px-5 py-3 font-semibold text-right">Action</th>}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderTop: '1px solid var(--wb-gray-200)' }}>
              <td className="px-5 py-3 font-semibold" style={{ color: 'var(--wb-blue)' }}>{ownerEmail}</td>
              <td className="px-5 py-3">
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,82,156,0.08)', color: '#00529C' }}>
                  <ShieldCheck className="w-3 h-3" aria-hidden="true" /> Owner
                </span>
              </td>
              {isOwner && <td className="px-5 py-3 text-right" style={{ color: 'var(--wb-gray-500)' }}>—</td>}
            </tr>
            {members.map(m => (
              <tr key={m.id} style={{ borderTop: '1px solid var(--wb-gray-200)' }}>
                <td className="px-5 py-3" style={{ color: 'var(--wb-gray-900)' }}>{m.email}</td>
                <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--wb-gray-50)', color: 'var(--wb-gray-500)' }}>Member</span></td>
                {isOwner && (
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => remove(m.id)} aria-label={`Remove ${m.email}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                            style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
