export const dynamic = 'force-dynamic'

import { requirePortalProfile } from '@/lib/portal'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import TeamManager from '@/components/portal/TeamManager'
import type { Profile } from '@/types'

export default async function PortalTeam() {
  const { profile, accountId } = await requirePortalProfile()
  const isOwner = profile.account_role === 'owner'
  const supabase = await createServerSupabaseClient()

  // Members of this agency (sub-users), and the owner email for display.
  const { data: members } = await supabase
    .from('profiles').select('*').eq('parent_id', accountId).order('created_at')
  const { data: owner } = await supabase
    .from('profiles').select('email').eq('id', accountId).maybeSingle()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--wb-blue)' }}>Team</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--wb-gray-500)' }}>
        {isOwner ? 'Invite colleagues and manage who can access your agency account.' : 'Members of your agency account.'}
      </p>
      <TeamManager
        members={(members as Profile[]) ?? []}
        isOwner={isOwner}
        ownerEmail={owner?.email ?? profile.email}
      />
    </div>
  )
}
