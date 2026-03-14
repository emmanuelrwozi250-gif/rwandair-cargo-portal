import { cn } from '@/lib/utils'
import { getStatusColor, getWaterStatusColor, getPickupStatusColor } from '@/lib/utils'
import { ShipmentStatus, ExporterStatus, WaterShipmentStatus } from '@/types'

interface StatusBadgeProps {
  status: ShipmentStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStatusColor(status),
        className
      )}
    >
      {status}
    </span>
  )
}

interface ExporterStatusBadgeProps {
  status: ExporterStatus
  className?: string
}

export function ExporterStatusBadge({ status, className }: ExporterStatusBadgeProps) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colors[status],
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

interface WaterStatusBadgeProps {
  status: WaterShipmentStatus
  className?: string
}

export function WaterStatusBadge({ status, className }: WaterStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getWaterStatusColor(status),
        className
      )}
    >
      {status}
    </span>
  )
}

interface PickupStatusBadgeProps {
  status: string
  className?: string
}

export function PickupStatusBadge({ status, className }: PickupStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getPickupStatusColor(status),
        className
      )}
    >
      {status}
    </span>
  )
}
