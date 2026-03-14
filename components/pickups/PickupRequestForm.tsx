'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Shipment, PickupRequest, DestinationType } from '@/types'
import { X } from 'lucide-react'

interface PickupRequestFormProps {
  shipmentId: string
  shipment: Shipment
  onSuccess: (pickup: PickupRequest) => void
  onClose: () => void
}

export default function PickupRequestForm({ shipmentId, shipment, onSuccess, onClose }: PickupRequestFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isWater = shipment.transport_mode === 'water'

  const getDefaultTerminal = () => {
    if (!isWater) {
      return shipment.destination_airport
        ? `${shipment.destination_airport} Cargo Terminal`
        : 'Airport Cargo Terminal'
    }
    return shipment.port_of_loading || 'Port Terminal'
  }

  const getDefaultDestinationType = (): DestinationType => {
    if (!isWater) return 'airport_cargo'
    if (shipment.water_type === 'inland_lake') return 'lake_port'
    return 'ocean_port'
  }

  const [formData, setFormData] = useState({
    pickup_address: '',
    pickup_city: '',
    pickup_country: '',
    pickup_contact_name: '',
    pickup_contact_phone: '',
    destination_terminal: getDefaultTerminal(),
    number_of_pieces: '',
    total_weight_kg: String(shipment.weight_kg || ''),
    required_pickup_date: '',
    required_pickup_time_by: '',
    cargo_cutoff_time: '',
    special_handling_notes: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate pickup date vs departure date
    if (shipment.preferred_departure_date && formData.required_pickup_date > shipment.preferred_departure_date) {
      setError('Required pickup date must be on or before the shipment departure date.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/pickups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipment_id: shipmentId,
          pickup_address: formData.pickup_address,
          pickup_city: formData.pickup_city,
          pickup_country: formData.pickup_country,
          pickup_contact_name: formData.pickup_contact_name,
          pickup_contact_phone: formData.pickup_contact_phone,
          destination_terminal: formData.destination_terminal,
          destination_type: getDefaultDestinationType(),
          number_of_pieces: formData.number_of_pieces || undefined,
          total_weight_kg: formData.total_weight_kg || undefined,
          required_pickup_date: formData.required_pickup_date,
          required_pickup_time_by: formData.required_pickup_time_by || undefined,
          cargo_cutoff_time: formData.cargo_cutoff_time || undefined,
          special_handling_notes: formData.special_handling_notes || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to submit pickup request')
        return
      }

      onSuccess(result.pickup)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Request Cargo Pickup</h2>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{shipment.shipment_id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Pickup Location */}
          <div>
            <h3 className="text-xs font-semibold text-[#02284d] uppercase tracking-wide mb-3">Pickup Location</h3>
            <div className="space-y-3">
              <Input
                id="pickup_address"
                label="Pickup Address"
                value={formData.pickup_address}
                onChange={(e) => handleChange('pickup_address', e.target.value)}
                placeholder="e.g. 123 Industrial Area, Plot 45"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="pickup_city"
                  label="City"
                  value={formData.pickup_city}
                  onChange={(e) => handleChange('pickup_city', e.target.value)}
                  placeholder="e.g. Nairobi"
                  required
                />
                <Input
                  id="pickup_country"
                  label="Country"
                  value={formData.pickup_country}
                  onChange={(e) => handleChange('pickup_country', e.target.value)}
                  placeholder="e.g. Kenya"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold text-[#02284d] uppercase tracking-wide mb-3">Contact at Pickup</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="pickup_contact_name"
                label="Contact Person"
                value={formData.pickup_contact_name}
                onChange={(e) => handleChange('pickup_contact_name', e.target.value)}
                placeholder="e.g. John Kamau"
                required
              />
              <Input
                id="pickup_contact_phone"
                label="Phone"
                value={formData.pickup_contact_phone}
                onChange={(e) => handleChange('pickup_contact_phone', e.target.value)}
                placeholder="+254 700 000 000"
                required
              />
            </div>
          </div>

          {/* Destination */}
          <div>
            <h3 className="text-xs font-semibold text-[#02284d] uppercase tracking-wide mb-3">Destination</h3>
            <Input
              id="destination_terminal"
              label="Destination Terminal"
              value={formData.destination_terminal}
              onChange={(e) => handleChange('destination_terminal', e.target.value)}
              placeholder="e.g. JKIA Cargo Terminal"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Type: {getDefaultDestinationType() === 'airport_cargo' ? 'Airport Cargo' : getDefaultDestinationType() === 'lake_port' ? 'Lake Port' : 'Ocean Port'}
            </p>
          </div>

          {/* Cargo Info */}
          <div>
            <h3 className="text-xs font-semibold text-[#02284d] uppercase tracking-wide mb-3">Cargo Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="number_of_pieces"
                label="Number of Pieces"
                type="number"
                min="1"
                value={formData.number_of_pieces}
                onChange={(e) => handleChange('number_of_pieces', e.target.value)}
                placeholder="e.g. 25"
              />
              <Input
                id="total_weight_kg"
                label="Total Weight (kg)"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.total_weight_kg}
                onChange={(e) => handleChange('total_weight_kg', e.target.value)}
                placeholder="e.g. 1500"
              />
            </div>
          </div>

          {/* Timing */}
          <div>
            <h3 className="text-xs font-semibold text-[#02284d] uppercase tracking-wide mb-3">Timing</h3>
            <div className="space-y-3">
              <Input
                id="required_pickup_date"
                label="Required Pickup Date"
                type="date"
                value={formData.required_pickup_date}
                onChange={(e) => handleChange('required_pickup_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                max={shipment.preferred_departure_date || undefined}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="required_pickup_time_by"
                  label="Required Time By"
                  type="time"
                  value={formData.required_pickup_time_by}
                  onChange={(e) => handleChange('required_pickup_time_by', e.target.value)}
                />
                <Input
                  id="cargo_cutoff_time"
                  label="Cargo Cut-off Time"
                  value={formData.cargo_cutoff_time}
                  onChange={(e) => handleChange('cargo_cutoff_time', e.target.value)}
                  placeholder="e.g. 14:00"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Special Handling Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={formData.special_handling_notes}
              onChange={(e) => handleChange('special_handling_notes', e.target.value)}
              placeholder="e.g. Fragile items, cold chain required, forklift access needed..."
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#02284d] resize-none h-20"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>
              Submit Pickup Request
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
