export const dynamic = 'force-dynamic'

import { requirePortalProfile } from '@/lib/portal'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import InvoiceList from '@/components/portal/InvoiceList'
import type { AgentInvoice } from '@/types'

export default async function PortalInvoices() {
  const { profile, accountId } = await requirePortalProfile()
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('agent_invoices').select('*').eq('account_id', accountId)
    .order('period_start', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--wb-blue)' }}>Invoices</h1>
      <InvoiceList invoices={(data as AgentInvoice[]) ?? []} profile={profile} />
    </div>
  )
}
