import { PickupRequest } from '@/types'
import { PickupStatusBadge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { PICKUP_STATUSES } from '@/lib/utils'
import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PickupStatusCardProps {
  pickup: PickupRequest
}

export default function PickupStatusCard({ pickup }: PickupStatusCardProps) {
  const allStatuses = PICKUP_STATUSES.filter((s) => s !== 'Cancelled')
  const currentIndex = allStatuses.indexOf(pickup.status as typeof allStatuses[number])
  const isCancelled = pickup.status === 'Cancelled'
  const isDelivered = pickup.status === 'Delivered to Terminal'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Pickup ID</p>
          <p className="text-sm font-mono font-semibold text-gray-900">{pickup.pickup_id}</p>
        </div>
        <PickupStatusBadge status={pickup.status} />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
        <div>
          <dt className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pickup Address</dt>
          <dd className="text-sm text-gray-900 mt-0.5">{pickup.pickup_address}, {pickup.pickup_city}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500 font-medium uppercase tracking-wide">Destination Terminal</dt>
          <dd className="text-sm text-gray-900 mt-0.5">{pickup.destination_terminal}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500 font-medium uppercase tracking-wide">Required Pickup Date</dt>
          <dd className="text-sm text-gray-900 mt-0.5">
            {formatDate(pickup.required_pickup_date)}
            {pickup.required_pickup_time_by && ` by ${pickup.required_pickup_time_by}`}
          </dd>
        </div>
        {pickup.total_weight_kg && (
          <div>
            <dt className="text-xs text-gray-500 font-medium uppercase tracking-wide">Weight</dt>
            <dd className="text-sm text-gray-900 mt-0.5">{Number(pickup.total_weight_kg).toLocaleString()} kg</dd>
          </div>
        )}
        {pickup.number_of_pieces && (
          <div>
            <dt className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pieces</dt>
            <dd className="text-sm text-gray-900 mt-0.5">{pickup.number_of_pieces}</dd>
          </div>
        )}
      </div>

      {/* Transporter */}
      {pickup.transporter && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1">Assigned Transporter</p>
          <p className="text-sm font-medium text-blue-800">
            {pickup.transporter.company_name}
            <span className="font-normal text-blue-600 ml-2">· {pickup.transporter.phone}</span>
          </p>
          {pickup.estimated_pickup_time && (
            <p className="text-xs text-blue-600 mt-1">
              Estimated arrival: {pickup.estimated_pickup_time}
            </p>
          )}
        </div>
      )}

      {/* Success Banner */}
      {isDelivered && (
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-900">Cargo Delivered to Terminal</p>
            <p className="text-xs text-green-700 mt-0.5">
              Your cargo has been successfully delivered to the terminal.
              {pickup.actual_delivery_time && ` Delivered at ${new Date(pickup.actual_delivery_time).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}.`}
            </p>
          </div>
        </div>
      )}

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm font-semibold text-red-900">Pickup Cancelled</p>
          <p className="text-xs text-red-700 mt-0.5">This pickup request has been cancelled. Please contact support if you need assistance.</p>
          {pickup.admin_notes && (
            <p className="text-xs text-red-600 mt-1">Note: {pickup.admin_notes}</p>
          )}
        </div>
      )}

      {/* Status Timeline */}
      {!isCancelled && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pickup Progress</p>
          <div className="flex flex-col gap-0">
            {allStatuses.map((status, index) => {
              const isCompleted = index < currentIndex
              const isCurrent = index === currentIndex

              return (
                <div key={status} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0',
                        isCompleted && 'bg-green-500',
                        isCurrent && 'bg-[#02284d] ring-4 ring-[#02284d]/20',
                        !isCompleted && !isCurrent && 'bg-gray-200'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-3.5 w-3.5 text-white" />
                      ) : (
                        <div className={cn('h-2 w-2 rounded-full', isCurrent ? 'bg-[#FBE115]' : 'bg-gray-400')} />
                      )}
                    </div>
                    {index < allStatuses.length - 1 && (
                      <div className={cn('w-px h-6 mt-0.5', isCompleted ? 'bg-green-300' : 'bg-gray-200')} />
                    )}
                  </div>
                  <div className="pb-2">
                    <p className={cn('text-sm font-medium', isCurrent ? 'text-[#02284d]' : isCompleted ? 'text-gray-900' : 'text-gray-400')}>
                      {status}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
