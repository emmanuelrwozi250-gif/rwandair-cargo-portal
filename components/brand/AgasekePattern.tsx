/**
 * Agaseke — concentric circle SVG pattern inspired by Rwanda's woven basket.
 * Used for loading states and section accent backgrounds.
 */
interface AgasekePatternProps {
  className?: string
  color?: string
  opacity?: number
  size?: number
}

export default function AgasekePattern({
  className = '',
  color = '#1ea2dc',
  opacity = 0.08,
  size = 120,
}: AgasekePatternProps) {
  const cx = size / 2
  const cy = size / 2
  const rings = 6
  return (
    <svg
      className={`pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      {Array.from({ length: rings }).map((_, i) => {
        const r = ((i + 1) / rings) * cx * 0.9
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={i % 2 === 0 ? 1.5 : 0.5}
            strokeOpacity={opacity * (1 - i / rings)}
            strokeDasharray={i % 3 === 0 ? '4 4' : undefined}
          />
        )
      })}
      {/* Radial spokes */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const x2 = cx + Math.cos(angle) * cx * 0.88
        const y2 = cy + Math.sin(angle) * cy * 0.88
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth="0.5"
            strokeOpacity={opacity}
          />
        )
      })}
    </svg>
  )
}
