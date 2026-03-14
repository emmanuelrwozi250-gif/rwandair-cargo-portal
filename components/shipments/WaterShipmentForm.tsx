'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { INCOTERMS, LAKE_NAMES, CONTAINER_TYPES } from '@/lib/utils'
import { WaterPort } from '@/types'

interface WaterShipmentFormProps {
  onBack: () => void
}

export default function WaterShipmentForm({ onBack }: WaterShipmentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ports, setPorts] = useState<WaterPort[]>([])
  const [portsLoading, setPortsLoading] = useState(false)

  const [waterType, setWaterType] = useState<'inland_lake' | 'ocean' | 'coastal'>('inland_lake')
  const [selectedLake, setSelectedLake] = useState('')

  const [formData, setFormData] = useState({
    product_type: '',
    quantity: '',
    weight_kg: '',
    buyer_name: '',
    invoice_value_usd: '',
    incoterm: '',
    destination_country: '',
    // Inland lake fields
    lake_name: '',
    port_of_loading: '',
    port_of_discharge: '',
    vessel_operator: '',
    preferred_departure_date: '',
    // Ocean/Coastal fields
    ocean_port_of_loading: '',
    ocean_port_of_discharge: '',
    container_type: '',
    shipping_line: '',
    ocean_preferred_departure_date: '',
    port_cutoff_date: '',
  })

  useEffect(() => {
    loadPorts()
  }, [])

  const loadPorts = async () => {
    setPortsLoading(true)
    try {
      const res = await fetch('/api/water-ports')
      const data = await res.json()
      setPorts(data.ports || [])
    } catch {
      // silently fail
    } finally {
      setPortsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const lakeMapping: Record<string, string> = {
    Victoria: 'Lake Victoria',
    Tanganyika: 'Lake Tanganyika',
    Malawi: 'Lake Malawi',
    Other: '',
  }

  const lakePorts = ports.filter(
    (p) => p.port_type === 'lake' && (selectedLake ? p.lake_or_sea === lakeMapping[selectedLake] : true)
  )

  const oceanPorts = ports.filter((p) => p.port_type === 'ocean' || p.port_type === 'coastal')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const isInland = waterType === 'inland_lake'
    const isOcean = waterType === 'ocean' || waterType === 'coastal'

    // Validate port cutoff before departure for ocean/coastal
    if (isOcean && formData.port_cutoff_date && formData.ocean_preferred_departure_date) {
      if (formData.port_cutoff_date >= formData.ocean_preferred_departure_date) {
        setError('Port cut-off date must be before the preferred departure date.')
        setLoading(false)
        return
      }
    }

    const payload = {
      transport_mode: 'water',
      water_type: waterType,
      product_type: formData.product_type,
      quantity: formData.quantity,
      weight_kg: formData.weight_kg,
      buyer_name: formData.buyer_name,
      invoice_value_usd: formData.invoice_value_usd,
      incoterm: formData.incoterm,
      destination_country: formData.destination_country,
      destination_airport: '',
      lake_name: isInland ? formData.lake_name : undefined,
      port_of_loading: isInland ? formData.port_of_loading : formData.ocean_port_of_loading,
      port_of_discharge: isInland ? formData.port_of_discharge : formData.ocean_port_of_discharge,
      vessel_operator: isInland ? formData.vessel_operator : formData.shipping_line,
      preferred_departure_date: isInland ? formData.preferred_departure_date : formData.ocean_preferred_departure_date,
      container_type: isOcean ? formData.container_type : 'N/A',
      port_cutoff_date: isOcean ? formData.port_cutoff_date : undefined,
    }

    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <form onSubmit={handleSubmit}>
        {/* Water Type Selection */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-[#02284d] uppercase tracking-wide mb-4">
            Freight Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { value: 'inland_lake' as const, label: 'Inland Lake Trade', desc: 'Lake Victoria, Tanganyika, Malawi' },
              { value: 'ocean' as const, label: 'Ocean Freight', desc: 'Mombasa, Dar es Salaam, Djibouti' },
              { value: 'coastal' as const, label: 'Coastal Trade', desc: 'Zanzibar and coastal routes' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setWaterType(option.value)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  waterType === option.value
                    ? 'border-[#02284d] bg-[#02284d]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className={`text-sm font-semibold ${waterType === option.value ? 'text-[#02284d]' : 'text-gray-800'}`}>
                  {option.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>

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
                placeholder="e.g. Arabica Coffee Beans, Fresh Fish"
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
              placeholder="e.g. 5000.00"
              required
            />
            <Input
              id="buyer_name"
              label="Buyer Name"
              value={formData.buyer_name}
              onChange={(e) => handleChange('buyer_name', e.target.value)}
              placeholder="e.g. East Africa Trading Co."
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
              placeholder="e.g. 15000.00"
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
            <Input
              id="destination_country"
              label="Destination Country"
              value={formData.destination_country}
              onChange={(e) => handleChange('destination_country', e.target.value)}
              placeholder="e.g. Uganda, DRC, Rwanda"
              required
            />
          </div>
        </div>

        {/* Inland Lake Fields */}
        {waterType === 'inland_lake' && (
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-[#02284d] uppercase tracking-wide mb-4">
              Inland Lake Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                id="lake_name"
                label="Lake"
                value={formData.lake_name}
                onChange={(e) => {
                  handleChange('lake_name', e.target.value)
                  setSelectedLake(e.target.value)
                  handleChange('port_of_loading', '')
                  handleChange('port_of_discharge', '')
                }}
                options={LAKE_NAMES.map((l) => ({ value: l, label: `Lake ${l}` }))}
                placeholder="Select lake"
                required
              />
              <Select
                id="port_of_loading"
                label="Port of Loading"
                value={formData.port_of_loading}
                onChange={(e) => handleChange('port_of_loading', e.target.value)}
                options={lakePorts.map((p) => ({ value: p.port_name, label: `${p.port_name} (${p.country})` }))}
                placeholder={portsLoading ? 'Loading ports...' : 'Select port of loading'}
                required
              />
              <Select
                id="port_of_discharge"
                label="Port of Discharge"
                value={formData.port_of_discharge}
                onChange={(e) => handleChange('port_of_discharge', e.target.value)}
                options={lakePorts.map((p) => ({ value: p.port_name, label: `${p.port_name} (${p.country})` }))}
                placeholder={portsLoading ? 'Loading ports...' : 'Select port of discharge'}
                required
              />
              <Input
                id="vessel_operator"
                label="Vessel Operator"
                value={formData.vessel_operator}
                onChange={(e) => handleChange('vessel_operator', e.target.value)}
                placeholder="e.g. Victoria Marine Services"
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
        )}

        {/* Ocean / Coastal Fields */}
        {(waterType === 'ocean' || waterType === 'coastal') && (
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-[#02284d] uppercase tracking-wide mb-4">
              {waterType === 'ocean' ? 'Ocean Freight' : 'Coastal Trade'} Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                id="ocean_port_of_loading"
                label="Port of Loading"
                value={formData.ocean_port_of_loading}
                onChange={(e) => handleChange('ocean_port_of_loading', e.target.value)}
                options={oceanPorts.map((p) => ({ value: p.port_name, label: `${p.port_name} (${p.country})` }))}
                placeholder={portsLoading ? 'Loading ports...' : 'Select port of loading'}
                required
              />
              <Input
                id="ocean_port_of_discharge"
                label="Port of Discharge"
                value={formData.ocean_port_of_discharge}
                onChange={(e) => handleChange('ocean_port_of_discharge', e.target.value)}
                placeholder="e.g. Rotterdam, Hamburg, Jebel Ali"
                required
              />
              <Select
                id="container_type"
                label="Container Type"
                value={formData.container_type}
                onChange={(e) => handleChange('container_type', e.target.value)}
                options={CONTAINER_TYPES.map((c) => ({ value: c, label: c }))}
                placeholder="Select container type"
                required
              />
              <Input
                id="shipping_line"
                label="Shipping Line / Vessel Operator"
                value={formData.shipping_line}
                onChange={(e) => handleChange('shipping_line', e.target.value)}
                placeholder="e.g. Maersk, MSC, CMA CGM"
              />
              <Input
                id="ocean_preferred_departure_date"
                label="Preferred Departure Date"
                type="date"
                value={formData.ocean_preferred_departure_date}
                onChange={(e) => handleChange('ocean_preferred_departure_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              <Input
                id="port_cutoff_date"
                label="Port Cut-off Date"
                type="date"
                value={formData.port_cutoff_date}
                onChange={(e) => handleChange('port_cutoff_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                max={formData.ocean_preferred_departure_date || undefined}
              />
            </div>
            {formData.port_cutoff_date && formData.ocean_preferred_departure_date && formData.port_cutoff_date >= formData.ocean_preferred_departure_date && (
              <p className="mt-2 text-xs text-red-600">Port cut-off date must be before the preferred departure date.</p>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <Button type="submit" loading={loading} size="lg">
              Create Water Shipment
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={onBack}>
              Back
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
