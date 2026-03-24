export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null
  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase not configured — allow access in dev
  }

  if (user === null && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    redirect('/login')
  }

  return <>{children}</>
}
