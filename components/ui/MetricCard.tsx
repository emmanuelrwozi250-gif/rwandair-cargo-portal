import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: string
  accent?: boolean
  className?: string
}

export default function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  accent,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm p-5',
        accent && 'border-[#02284d] bg-[#02284d]',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn('text-xs font-medium uppercase tracking-wide', accent ? 'text-blue-200' : 'text-gray-500')}>
            {label}
          </p>
          <p className={cn('text-2xl font-bold mt-1', accent ? 'text-white' : 'text-gray-900')}>
            {value}
          </p>
          {trend && <p className="text-xs text-green-600 mt-1 font-medium">{trend}</p>}
        </div>
        {Icon && (
          <div className={cn('p-2.5 rounded-lg', accent ? 'bg-white/10' : 'bg-[#02284d]/8')}>
            <Icon className={cn('h-5 w-5', accent ? 'text-[#FBE115]' : 'text-[#02284d]')} />
          </div>
        )}
      </div>
    </div>
  )
}
