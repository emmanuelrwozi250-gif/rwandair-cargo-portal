/**
 * Imigongo — traditional Rwandan geometric pattern used as watermark texture.
 * Single-color only. Never used as a full-color graphic.
 */
interface ImigongoPatternProps {
  className?: string
  /** Fill color */
  color?: string
  /** Overall opacity (the pattern is meant to be very subtle) */
  opacity?: number
  id?: string
}

export default function ImigongoPattern({
  className = '',
  color = '#00529b',
  opacity = 0.04,
  id = 'imigongo',
}: ImigongoPatternProps) {
  const patternId = `${id}-pattern`
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          {/* Diamond / chevron motifs characteristic of Imigongo */}
          <polygon
            points="30,2 58,30 30,58 2,30"
            fill="none"
            stroke={color}
            strokeWidth="1"
            strokeOpacity={opacity * 10}
          />
          <polygon
            points="30,12 48,30 30,48 12,30"
            fill={color}
            fillOpacity={opacity * 4}
          />
          <line x1="2" y1="30" x2="30" y2="2"  stroke={color} strokeWidth="0.5" strokeOpacity={opacity * 8} />
          <line x1="30" y1="2" x2="58" y2="30" stroke={color} strokeWidth="0.5" strokeOpacity={opacity * 8} />
          <line x1="58" y1="30" x2="30" y2="58" stroke={color} strokeWidth="0.5" strokeOpacity={opacity * 8} />
          <line x1="30" y1="58" x2="2" y2="30"  stroke={color} strokeWidth="0.5" strokeOpacity={opacity * 8} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}
