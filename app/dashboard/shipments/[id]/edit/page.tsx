'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import TopBar from '@/components/dashboard/TopBar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { INCOTERMS } from '@/lib/utils'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Shipment } from '@/types'

export default function EditShipmentPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const shipmentId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [shipment, setShipment] = useState<Shipment | null>(null)

  const [formData, setFormData] = useState({
    product_type: '',
    quantity: '',
    weight_kg: '',
    destination_country: '',
    destination_airport: '',
    preferred_departure_date: '',
    buyer_name: '',
    invoice_value_usd: '',
    incoterm: '',
  })

  useEffect(() => {
    loadShipment()
  }, [shipmentId])

  const loadShipment = async () => {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single()

    if (error || !data) {
      router.push('/dashboard')
      return
    }

    const s = data as Shipment

    if (s.status !== 'Draft') {
      // Only allow editing in Draft status
      router.push(`/dashboard/shipments/${shipmentId}`)
      return
    }

    setShipment(s)
    setFormData({
      product_type: s.product_type,
      quantity: String(s.quantity),
      weight_kg: String(s.weight_kg),
      destination_country: s.destination_country,
      destination_airport: s.destination_airport,
      preferred_departure_date: s.preferred_departure_date,
      buyer_name: s.buyer_name,
      invoice_value_usd: String(s.invoice_value_usd),
      incoterm: s.incoterm,
    })
    setLoading(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/shipments/${shipmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to update shipment')
        return
      }

      router.push(`/dashboard/shipments/${shipmentId}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-[#02284d]" />
      </div>
    )
  }

  if (!shipment) return null

  return (
    <div>
      <TopBar
        title="Edit Shipment"
        subtitle={shipment.shipment_id}
        actions={
          <Link
            href={`/dashboard/shipments/${shipmentId}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shipment
          </Link>
        }
      />

      <div className="p-8 max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit}>
            {/* Cargo Details */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-[#02284d] uppercase tracking-wide mb-4">
                Cargo Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    id="product_type"
                    label="Product Type"
                    value={formData.product_type}
                    onChange={(e) => handleChange('product_type', e.target.value)}
                    placeholder="e.g. Arabica Coffee Beans, Fresh Roses"
                    required
                  />
                </div>
                <Input
                  id="quantity"
                  label="Quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  placeholder="e.g. 100"
                  required
                />
                <Input
                  id="weight_kg"
                  label="Weight (kg)"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.weight_kg}
                  onChange={(e) => handleChange('weight_kg', e.target.value)}
                  placeholder="e.g. 1500.00"
                  required
                />
              </div>
            </div>

            {/* Destination */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-[#02284d] uppercase tracking-wide mb-4">
                Destination
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="destination_country"
                  label="Destination Country"
                  value={formData.destination_country}
                  onChange={(e) => handleChange('destination_country', e.target.value)}
                  placeholder="e.g. Netherlands"
                  required
                />
                <Input
                  id="destination_airport"
                  label="Destination Airport (IATA)"
                  value={formData.destination_airport}
                  onChange={(e) => handleChange('destination_airport', e.target.value)}
                  placeholder="e.g. AMS"
                  required
                />
                <Input
                  id="preferred_departure_date"
                  label="Preferred Departure Date"
                  type="date"
                  value={formData.preferred_departure_date}
                  onChange={(e) => handleChange('preferred_departure_date', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Commercial Details */}
            <div className="p-6">
              <h2 className="text-sm font-semibold text-[#02284d] uppercase tracking-wide mb-4">
                Commercial Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="buyer_name"
                  label="Buyer Name"
                  value={formData.buyer_name}
                  onChange={(e) => handleChange('buyer_name', e.target.value)}
                  placeholder="e.g. Amsterdam Imports BV"
                  required
                />
                <Input
                  id="invoice_value_usd"
                  label="Invoice Value (USD)"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.invoice_value_usd}
                  onChange={(e) => handleChange('invoice_value_usd', e.target.value)}
                  placeholder="e.g. 25000.00"
                  required
                />
                <Select
                  id="incoterm"
                  label="Incoterm"
                  value={formData.incoterm}
                  onChange={(e) => handleChange('incoterm', e.target.value)}
                  options={INCOTERMS.map((t) => ({ value: t, label: t }))}
                  placeholder="Select incoterm"
                  required
                />
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button type="submit" loading={saving} size="lg">
                  Save Changes
                </Button>
                <Link href={`/dashboard/shipments/${shipmentId}`}>
                  <Button type="button" variant="outline" size="lg">
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
