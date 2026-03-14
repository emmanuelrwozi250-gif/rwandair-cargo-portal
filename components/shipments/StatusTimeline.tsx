import { cn, getStatusesForMode } from '@/lib/utils'
import { ShipmentStatus, StatusLog, TransportMode } from '@/types'
import { CheckCircle } from 'lucide-react'

interface StatusTimelineProps {
  currentStatus: ShipmentStatus
  logs: StatusLog[]
  transportMode?: TransportMode
}

export default function StatusTimeline({ currentStatus, logs, transportMode = 'air' }: StatusTimelineProps) {
  const statuses = getStatusesForMode(transportMode)
  const currentIndex = statuses.indexOf(currentStatus)

  const getStatusDate = (status: ShipmentStatus) => {
    const log = logs.find((l) => l.new_status === status)
    if (!log) return null
    return new Date(log.changed_at).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="relative">
      {/* Mobile: vertical */}
      <div className="flex flex-col gap-0 md:hidden">
        {statuses.map((status, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const date = getStatusDate(status)

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
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : (
                    <div className={cn('h-2 w-2 rounded-full', isCurrent ? 'bg-[#E4DC1F]' : 'bg-gray-400')} />
                  )}
                </div>
                {index < statuses.length - 1 && (
                  <div className={cn('w-px h-8 mt-0.5', isCompleted ? 'bg-green-300' : 'bg-gray-200')} />
                )}
              </div>
              <div className="pb-4">
                <p className={cn('text-sm font-medium', isCurrent ? 'text-[#02284d]' : isCompleted ? 'text-gray-900' : 'text-gray-400')}>
                  {status}
                </p>
                {date && <p className="text-xs text-gray-400 mt-0.5">{date}</p>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop: horizontal */}
      <div className="hidden md:block overflow-x-auto">
        <div className="flex items-start min-w-max pb-2">
          {statuses.map((status, index) => {
            const isCompleted = index < currentIndex
            const isCurrent = index === currentIndex
            const date = getStatusDate(status)

            return (
              <div key={status} className="flex items-start">
                <div className="flex flex-col items-center w-28">
                  <div
                    className={cn(
                      'h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                      isCompleted && 'bg-green-500',
                      isCurrent && 'bg-[#02284d] ring-4 ring-[#02284d]/20',
                      !isCompleted && !isCurrent && 'bg-gray-200'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <div className={cn('h-2.5 w-2.5 rounded-full', isCurrent ? 'bg-[#E4DC1F]' : 'bg-gray-400')} />
                    )}
                  </div>
                  <div className="text-center mt-2 px-1">
                    <p
                      className={cn(
                        'text-xs font-medium leading-tight',
                        isCurrent ? 'text-[#02284d]' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                      )}
                    >
                      {status}
                    </p>
                    {date && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{date}</p>
                    )}
                  </div>
                </div>
                {index < statuses.length - 1 && (
                  <div
                    className={cn(
                      'h-px w-8 mt-3.5 flex-shrink-0',
                      isCompleted ? 'bg-green-400' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
