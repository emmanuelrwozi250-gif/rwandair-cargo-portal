export const dynamic = 'force-dynamic'

import { requirePortalProfile } from '@/lib/portal'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import NotificationPrefs from '@/components/portal/NotificationPrefs'
import TotpEnroll from '@/components/portal/TotpEnroll'
import { Bell } from 'lucide-react'
import type { AgentNotification } from '@/types'

const TYPE_COLORS: Record<string, string> = {
  departure: '#16A1DC', arrival: '#4a7c20', exception: '#B45309', deal: '#7C3AED', account: '#00529C', info: '#6c757d',
}

export default async function PortalNotifications() {
  const { profile, accountId } = await requirePortalProfile()
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('agent_notifications').select('*').eq('account_id', accountId)
    .order('created_at', { ascending: false }).limit(100)
  const notes = (data as AgentNotification[]) ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--wb-blue)' }}>Notifications</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* History */}
        <section className="lg:col-span-2 rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
          <h2 className="font-bold mb-4" style={{ color: 'var(--wb-blue)' }}>History</h2>
          {notes.length === 0 ? (
            <div className="py-10 text-center">
              <Bell className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--wb-gray-200)' }} aria-hidden="true" />
              <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>No notifications yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {notes.map(n => (
                <li key={n.id} className="flex gap-3" style={{ opacity: n.read ? 0.6 : 1 }}>
                  <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: TYPE_COLORS[n.type] ?? '#6c757d' }} aria-hidden="true" />
                  <div>
                    <p className="text-sm" style={{ color: 'var(--wb-gray-900)' }}>{n.message}</p>
                    <time className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>
                      {new Date(n.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Preferences + security */}
        <div className="space-y-6">
          <NotificationPrefs profile={profile} />
          <TotpEnroll />
        </div>
      </div>
    </div>
  )
}
