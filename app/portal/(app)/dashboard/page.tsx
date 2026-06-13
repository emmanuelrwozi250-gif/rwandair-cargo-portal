export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { requirePortalProfile } from '@/lib/portal'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PackageCheck, Plane, FileClock, Wallet, ChevronRight, Clock } from 'lucide-react'
import type { AgentBooking, AgentNotification } from '@/types'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const IN_TRANSIT = ['In Transit', 'Departed', 'Vessel Departed']
const AWB_PENDING = ['Booking Requested', 'Space Confirmed', 'Documents Pending']

export default async function PortalDashboard() {
  const { profile, accountId } = await requirePortalProfile()
  const supabase = await createServerSupabaseClient()

  const [{ data: bookings }, { data: notifications }] = await Promise.all([
    supabase.from('agent_bookings').select('*').eq('account_id', accountId)
      .order('departure_at', { ascending: false }).limit(50),
    supabase.from('agent_notifications').select('*').eq('account_id', accountId)
      .order('created_at', { ascending: false }).limit(8),
  ])

  const list = (bookings as AgentBooking[]) ?? []
  const notes = (notifications as AgentNotification[]) ?? []

  const activeCount   = list.filter(b => b.status !== 'Delivered' && b.status !== 'Closed' && b.status !== 'Cancelled').length
  const inTransit     = list.filter(b => IN_TRANSIT.includes(b.status)).length
  const awbPending    = list.filter(b => AWB_PENDING.includes(b.status)).length

  const cards = [
    { label: 'Active bookings', value: String(activeCount), icon: PackageCheck, color: '#00529C', bg: 'rgba(0,82,156,0.08)' },
    { label: 'In transit',      value: String(inTransit),   icon: Plane,        color: '#16A1DC', bg: 'rgba(28,163,219,0.08)' },
    { label: 'AWBs pending',    value: String(awbPending),  icon: FileClock,    color: '#B45309', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Credit balance',  value: usd(profile.credit_balance_usd), icon: Wallet, color: '#4a7c20', bg: 'rgba(148,201,67,0.15)' },
  ]

  const statusPill = (s: string) => {
    const ok = s === 'Delivered'
    const warn = AWB_PENDING.includes(s)
    const c = ok ? { c: '#4a7c20', b: 'rgba(148,201,67,0.15)' } : warn ? { c: '#B45309', b: 'rgba(245,158,11,0.12)' } : { c: '#00529C', b: 'rgba(0,82,156,0.08)' }
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: c.c, background: c.b }}>{s}</span>
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--wb-blue)' }}>
          Welcome{profile.company_name ? `, ${profile.company_name}` : ''}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--wb-gray-500)' }}>
          {profile.status === 'approved'
            ? 'Approved agent · contract rates active'
            : profile.status === 'pending'
              ? 'Account pending approval · spot rates apply until then'
              : 'Registered account · spot rates'}
        </p>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: bg }}>
              <Icon className="w-4 h-4" style={{ color }} aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--wb-blue)' }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--wb-gray-500)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent bookings */}
        <section className="lg:col-span-2 rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: 'var(--wb-blue)' }}>Recent bookings</h2>
            <Link href="/portal/bookings" className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--wb-sky)' }}>
              All bookings <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
          {list.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--wb-gray-500)' }}>
              No bookings yet. Your bookings will appear here once you start moving cargo through Kigali.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: 'var(--wb-gray-500)' }} className="text-left text-xs">
                    <th className="py-2 font-semibold">Flight</th>
                    <th className="py-2 font-semibold">Route</th>
                    <th className="py-2 font-semibold">Departure</th>
                    <th className="py-2 font-semibold">Status</th>
                    <th className="py-2 font-semibold">AWB</th>
                  </tr>
                </thead>
                <tbody>
                  {list.slice(0, 8).map(b => (
                    <tr key={b.id} style={{ borderTop: '1px solid var(--wb-gray-200)' }}>
                      <td className="py-2.5 font-mono" style={{ color: 'var(--wb-blue)' }}>{b.flight_number ?? '—'}</td>
                      <td className="py-2.5" style={{ color: 'var(--wb-gray-900)' }}>{b.route}</td>
                      <td className="py-2.5" style={{ color: 'var(--wb-gray-500)' }}>
                        {b.departure_at ? new Date(b.departure_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td className="py-2.5">{statusPill(b.status)}</td>
                      <td className="py-2.5 font-mono text-xs" style={{ color: 'var(--wb-gray-500)' }}>{b.awb_number ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Notifications */}
        <section className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
          <h2 className="font-bold mb-4" style={{ color: 'var(--wb-blue)' }}>Notifications</h2>
          {notes.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--wb-gray-500)' }}>You&apos;re all caught up.</p>
          ) : (
            <ul className="space-y-3">
              {notes.map(n => (
                <li key={n.id} className="flex gap-3">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--wb-sky)' }} aria-hidden="true" />
                  <div>
                    <p className="text-sm" style={{ color: 'var(--wb-gray-900)' }}>{n.message}</p>
                    <time className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>
                      {new Date(n.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
