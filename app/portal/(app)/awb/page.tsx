export const dynamic = 'force-dynamic'

import { requirePortalProfile } from '@/lib/portal'
import AwbForm from '@/components/portal/AwbForm'

export default async function PortalAwb() {
  const { profile } = await requirePortalProfile()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--wb-blue)' }}>Generate an eAWB</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--wb-gray-500)' }}>
        Issue a 459-prefix air waybill instantly. The PDF downloads in IATA format and is saved to your account.
      </p>
      <AwbForm companyName={profile.company_name} />
    </div>
  )
}
