export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { requirePortalProfile } from '@/lib/portal'
import PortalNav from '@/components/portal/PortalNav'

export const metadata: Metadata = {
  title: 'Agent Portal',
  robots: { index: false, follow: false },
}

export default async function PortalAppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requirePortalProfile()

  return (
    <div className="min-h-screen" style={{ background: 'var(--neutral-light)' }}>
      <PortalNav company={profile.company_name} email={profile.email} />
      <div className="lg:pl-64">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
    </div>
  )
}
