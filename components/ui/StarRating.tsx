'use client'

import { useRef } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  label: string
  value: number          // 0 = unrated, 1–5
  onChange: (value: number) => void
  size?: number          // icon size in px; tap target is always ≥48px
  error?: boolean
}

// Accessible 1–5 star selector: radiogroup semantics, arrow-key navigation,
// 48px minimum tap targets per WCAG 2.5.8.
export default function StarRating({ label, value, onChange, size = 30, error }: StarRatingProps) {
  const groupRef = useRef<HTMLDivElement>(null)

  function handleKey(e: React.KeyboardEvent, star: number) {
    let next: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(5, (value || star) + 1)
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(1, (value || star) - 1)
    if (e.key === ' ' || e.key === 'Enter') next = star
    if (next !== null) {
      e.preventDefault()
      onChange(next)
      groupRef.current
        ?.querySelector<HTMLButtonElement>(`button[data-star="${next}"]`)
        ?.focus()
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 py-1">
      <span id={`star-label-${label.replace(/\s+/g, '-')}`}
            className="text-sm font-semibold"
            style={{ color: error ? '#dc2626' : 'var(--wb-blue)' }}>
        {label}
      </span>
      <div ref={groupRef} role="radiogroup"
           aria-labelledby={`star-label-${label.replace(/\s+/g, '-')}`}
           className="flex">
        {[1, 2, 3, 4, 5].map(star => {
          const filled = star <= value
          return (
            <button
              key={star}
              type="button"
              role="radio"
              data-star={star}
              aria-checked={value === star}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
              tabIndex={star === (value || 1) ? 0 : -1}
              onClick={() => onChange(star)}
              onKeyDown={e => handleKey(e, star)}
              className="flex items-center justify-center rounded-lg transition-transform hover:scale-110 focus-visible:scale-110"
              style={{ width: 48, height: 48 }}
            >
              <Star
                style={{
                  width: size,
                  height: size,
                  color: filled ? 'var(--wb-yellow)' : 'var(--wb-gray-200)',
                  fill: filled ? 'var(--wb-yellow)' : 'none',
                  transition: 'color 120ms ease, fill 120ms ease',
                }}
                aria-hidden="true"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
