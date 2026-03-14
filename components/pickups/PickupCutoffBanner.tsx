import { Shipment } from '@/types'
import { formatDate } from '@/lib/utils'

interface PickupCutoffBannerProps {
  shipment: Shipment
  onRequestPickup: () => void
}

const TERMINAL_STATUSES = [
  'Space Confirmed',
  'Port In',
  'Vessel Departed',
  'Port of Discharge',
  'Delivered',
  'Closed',
]

export default function PickupCutoffBanner({ shipment, onRequestPickup }: PickupCutoffBannerProps) {
  if (TERMINAL_STATUSES.includes(shipment.status)) return null

  if (!shipment.preferred_departure_date) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const departure = new Date(shipment.preferred_departure_date)
  departure.setHours(0, 0, 0, 0)
  const diffMs = departure.getTime() - today.getTime()
  const daysUntilDeparture = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (daysUntilDeparture > 5) return null
  if (daysUntilDeparture <= 0) return null

  const isWater = shipment.transport_mode === 'water'
  const terminal = isWater
    ? (shipment.port_of_loading || 'the port')
    : (shipment.destination_airport ? `${shipment.destination_airport} cargo terminal` : 'the terminal')

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 flex items-start gap-4">
      <div className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold">
        !
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-yellow-900">Cargo pickup not yet arranged</p>
        <p className="text-xs text-yellow-700 mt-0.5">
          You haven't arranged cargo pickup yet. Request a pickup to ensure your cargo reaches {terminal} before the{' '}
          <strong>{formatDate(shipment.preferred_departure_date)}</strong> cut-off.
        </p>
      </div>
      <button
        type="button"
        onClick={onRequestPickup}
        className="flex-shrink-0 bg-yellow-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-yellow-700 transition-colors whitespace-nowrap"
      >
        Request Pickup
      </button>
    </div>
  )
}
