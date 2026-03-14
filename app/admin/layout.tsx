export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/supabase-admin'
import AppShell from '@/components/dashboard/AppShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabaseAdmin = getAdminClient()
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') redirect('/dashboard')

  return (
    <AppShell role="admin" email={user.email}>
      {children}
    </AppShell>
  )
}
