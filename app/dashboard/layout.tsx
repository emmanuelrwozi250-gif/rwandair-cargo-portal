import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/supabase-admin'
import AppShell from '@/components/dashboard/AppShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabaseAdmin = getAdminClient()
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'exporter') redirect('/admin')

  const { data: exporter } = await supabaseAdmin
    .from('exporters')
    .select('company_name, email, status')
    .eq('user_id', user.id)
    .single()

  // Pending approval state
  if (!exporter || exporter.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10">
            <div className="h-14 w-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="h-7 w-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Account Under Review</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your account is under review. You will receive an email once approved.
              This usually takes 1–2 business days.
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Questions? Email us at{' '}
              <a href="mailto:support@altitudeafrica.com" className="text-[#02284d]">
                support@altitudeafrica.com
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (exporter.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10">
            <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Application Not Approved</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your exporter application was not approved. Please contact our team for more information.
            </p>
            <a href="mailto:support@altitudeafrica.com" className="text-sm text-[#02284d] font-medium mt-4 inline-block">
              support@altitudeafrica.com
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AppShell role="exporter" companyName={exporter.company_name} email={user.email}>
      {children}
    </AppShell>
  )
}
