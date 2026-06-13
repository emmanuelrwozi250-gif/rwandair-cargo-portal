export const dynamic = 'force-dynamic'

import { requirePortalProfile } from '@/lib/portal'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import BookingsTable from '@/components/portal/BookingsTable'
import type { AgentBooking } from '@/types'

export default async function PortalBookings() {
  const { profile, accountId } = await requirePortalProfile()
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('agent_bookings').select('*').eq('account_id', accountId)
    .order('departure_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--wb-blue)' }}>Bookings</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--wb-gray-500)' }}>Filter, expand for detail, and manage each booking.</p>
      <BookingsTable bookings={(data as AgentBooking[]) ?? []} companyName={profile.company_name} />
    </div>
  )
}
