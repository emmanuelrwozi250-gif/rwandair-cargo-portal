export const dynamic = 'force-dynamic'

import { requirePortalProfile } from '@/lib/portal'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import ReportsView from '@/components/portal/ReportsView'
import type { AgentBooking } from '@/types'

export default async function PortalReports() {
  const { accountId } = await requirePortalProfile()
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('agent_bookings').select('*').eq('account_id', accountId)
    .order('departure_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--wb-blue)' }}>Reports</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--wb-gray-500)' }}>Volume summary by month — filter, chart, and export.</p>
      <ReportsView bookings={(data as AgentBooking[]) ?? []} />
    </div>
  )
}
