export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { requirePortalProfile } from '@/lib/portal'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Lock } from 'lucide-react'
import type { ContractRate } from '@/types'

const usd = (n: number) => `$${n.toFixed(2)}`

export default async function PortalRates() {
  const { profile, accountId } = await requirePortalProfile()

  if (profile.status !== 'approved') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--wb-blue)' }}>Contract rates</h1>
        <div className="rounded-2xl p-8 text-center" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
          <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--wb-sky-light)' }}>
            <Lock className="w-5 h-5" style={{ color: 'var(--wb-sky)' }} aria-hidden="true" />
          </div>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.7 }}>
            Your contract rates will appear here once your account is approved. Spot rates apply until then —{' '}
            <Link href="/quote" className="font-semibold underline" style={{ color: 'var(--wb-blue)' }}>get an instant quote</Link>.
          </p>
        </div>
      </div>
    )
  }

  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('contract_rates').select('*').eq('account_id', accountId).order('route')
  const rates = (data as ContractRate[]) ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--wb-blue)' }}>Your contract rates</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--wb-gray-500)' }}>Negotiated $/kg by route and product type. These override spot rates in your quotes.</p>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
        {rates.length === 0 ? (
          <p className="text-sm p-8 text-center" style={{ color: 'var(--wb-gray-500)' }}>
            No contract rates loaded yet. Your account manager will publish them here.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--wb-gray-50)', color: 'var(--wb-gray-500)' }} className="text-left text-xs">
                <th className="px-5 py-3 font-semibold">Route</th>
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold text-right">Rate / kg</th>
                <th className="px-5 py-3 font-semibold">Valid until</th>
              </tr>
            </thead>
            <tbody>
              {rates.map(r => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--wb-gray-200)' }}>
                  <td className="px-5 py-3 font-semibold" style={{ color: 'var(--wb-blue)' }}>{r.route}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--wb-gray-900)' }}>{r.product_type}</td>
                  <td className="px-5 py-3 text-right font-bold" style={{ color: 'var(--wb-blue)' }}>{usd(r.rate_usd_per_kg)}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--wb-gray-500)' }}>{r.valid_until ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
