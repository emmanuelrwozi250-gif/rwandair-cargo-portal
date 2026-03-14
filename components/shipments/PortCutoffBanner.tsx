interface PortCutoffBannerProps {
  portCutoffDate: string | null
  documentsComplete: boolean
}

export default function PortCutoffBanner({ portCutoffDate, documentsComplete }: PortCutoffBannerProps) {
  if (!portCutoffDate || documentsComplete) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cutoff = new Date(portCutoffDate)
  cutoff.setHours(0, 0, 0, 0)
  const diffMs = cutoff.getTime() - today.getTime()
  const daysUntilCutoff = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (daysUntilCutoff <= 0) return null
  if (daysUntilCutoff > 5) return null

  const isUrgent = daysUntilCutoff <= 3

  return (
    <div
      className={`rounded-xl border px-5 py-4 flex items-start gap-3 ${
        isUrgent
          ? 'bg-red-50 border-red-200'
          : 'bg-yellow-50 border-yellow-200'
      }`}
    >
      <div className={`mt-0.5 h-5 w-5 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${isUrgent ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}`}>
        !
      </div>
      <div>
        <p className={`text-sm font-semibold ${isUrgent ? 'text-red-800' : 'text-yellow-800'}`}>
          {isUrgent ? 'Urgent: ' : 'Warning: '}
          Port cut-off in {daysUntilCutoff} day{daysUntilCutoff === 1 ? '' : 's'}
        </p>
        <p className={`text-xs mt-0.5 ${isUrgent ? 'text-red-700' : 'text-yellow-700'}`}>
          Complete your documentation to avoid missing this vessel.
        </p>
      </div>
    </div>
  )
}
