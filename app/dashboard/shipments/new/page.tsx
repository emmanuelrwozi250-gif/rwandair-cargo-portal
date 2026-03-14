'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TopBar from '@/components/dashboard/TopBar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import WaterShipmentForm from '@/components/shipments/WaterShipmentForm'
import { INCOTERMS } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

type Mode = 'air' | 'water' | null

export default function NewShipmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<Mode>(null)

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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, transport_mode: 'air' }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to create shipment')
        return
      }

      router.push(`/dashboard/shipments/${result.shipment.id}`)
    } finally {
      setLoading(false)
    }
  }

  // Mode selector
  if (mode === null) {
    return (
      <div>
        <TopBar
          title="New Shipment"
          subtitle="Choose your freight type"
          actions={
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          }
        />

        <div className="p-8 max-w-2xl">
          <p className="text-sm text-gray-600 mb-6">Select how your cargo will be transported.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setMode('air')}
              className="text-left p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-[#02284d] hover:shadow-md transition-all group"
            >
              <div className="text-4xl mb-3">✈️</div>
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#02284d]">Air Freight</h3>
              <p className="text-sm text-gray-500 mt-1">
                Fast and reliable cargo transport via air. Ideal for perishables, flowers, and time-sensitive exports.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setMode('water')}
              className="text-left p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-[#02284d] hover:shadow-md transition-all group"
            >
              <div className="text-4xl mb-3">🚢</div>
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#02284d]">Sea & Water Freight</h3>
              <p className="text-sm text-gray-500 mt-1">
                Cost-effective cargo transport via inland lakes, ocean, or coastal routes. Ideal for bulk and containerised goods.
              </p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'water') {
    return (
      <div>
        <TopBar
          title="New Shipment"
          subtitle="Sea & Water Freight"
          actions={
            <button
              type="button"
              onClick={() => setMode(null)}
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Change Freight Type
            </button>
          }
        />
        <div className="p-8 max-w-2xl">
          <WaterShipmentForm onBack={() => setMode(null)} />
        </div>
      </div>
    )
  }

  // Air freight form
  return (
    <div>
      <TopBar
        title="New Shipment"
        subtitle="Air Freight"
        actions={
          <button
            type="button"
            onClick={() => setMode(null)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Change Freight Type
          </button>
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
                  min={new Date().toISOString().split('T')[0]}
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
                <Button type="submit" loading={loading} size="lg">
                  Create Shipment
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => setMode(null)}>
                  Back
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
