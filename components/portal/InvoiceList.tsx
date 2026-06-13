'use client'

import { Download, Receipt } from 'lucide-react'
import { generateInvoicePdf } from '@/lib/portal-pdf'
import type { AgentInvoice, Profile } from '@/types'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export default function InvoiceList({ invoices, profile }: { invoices: AgentInvoice[]; profile: Profile }) {
  return (
    <div>
      {/* Credit balance */}
      <div className="rounded-2xl p-6 mb-6 flex flex-wrap items-center justify-between gap-4"
           style={{ background: 'var(--wb-blue)', color: 'white' }}>
        <div>
          <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>Credit account balance</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--wb-yellow)' }}>{usd(profile.credit_balance_usd)}</p>
        </div>
        {profile.payment_due_date && (
          <div className="text-right">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Payment due</p>
            <p className="font-bold">{new Date(profile.payment_due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
        {invoices.length === 0 ? (
          <div className="p-10 text-center">
            <Receipt className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--wb-gray-200)' }} aria-hidden="true" />
            <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>No invoices yet. Monthly consolidated invoices appear here.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--wb-gray-50)', color: 'var(--wb-gray-500)' }} className="text-left text-xs">
                <th className="px-5 py-3 font-semibold">Period</th>
                <th className="px-5 py-3 font-semibold text-right">Shipments</th>
                <th className="px-5 py-3 font-semibold text-right">Weight</th>
                <th className="px-5 py-3 font-semibold text-right">Charges</th>
                <th className="px-5 py-3 font-semibold text-right">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderTop: '1px solid var(--wb-gray-200)' }}>
                  <td className="px-5 py-3 font-semibold" style={{ color: 'var(--wb-blue)' }}>
                    {inv.period_start} → {inv.period_end}
                  </td>
                  <td className="px-5 py-3 text-right" style={{ color: 'var(--wb-gray-900)' }}>{inv.total_shipments}</td>
                  <td className="px-5 py-3 text-right" style={{ color: 'var(--wb-gray-900)' }}>{inv.total_weight_kg.toLocaleString()} kg</td>
                  <td className="px-5 py-3 text-right font-bold" style={{ color: 'var(--wb-blue)' }}>{usd(inv.total_charges_usd)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => generateInvoicePdf(inv, profile)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                            style={{ background: 'var(--wb-sky-light)', color: 'var(--wb-sky)' }}>
                      <Download className="w-3.5 h-3.5" aria-hidden="true" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
