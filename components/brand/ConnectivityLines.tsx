'use client'

import { useEffect, useState } from 'react'

interface ConnectivityLinesProps {
  className?: string
  opacity?: number
  animated?: boolean
  /** 'light' draws sky-blue on dark bg; 'dark' draws blue on light bg */
  variant?: 'light' | 'dark'
}

// Bezier control points for organic-feeling lines that bleed off the edges
const LINES = [
  { d: 'M -50 80  C 150 60, 350 120, 600 40', delay: 0 },
  { d: 'M 700 -20 C 550 80, 350 150, 100 200', delay: 0.3 },
  { d: 'M -30 300 C 200 280, 400 200, 750 350', delay: 0.6 },
  { d: 'M 800 250 C 600 180, 300 320, -20 400', delay: 0.9 },
  { d: 'M 100 500 C 300 420, 550 480, 820 380', delay: 1.2 },
  { d: 'M -50 150 C 100 200, 500 100, 780 180', delay: 0.45 },
  { d: 'M 400 -30 C 450 100, 600 200, 780 300', delay: 0.75 },
]

export default function ConnectivityLines({
  className = '',
  opacity = 0.15,
  animated = true,
  variant = 'light',
}: ConnectivityLinesProps) {
  const [visible, setVisible] = useState(!animated)

  useEffect(() => {
    if (animated) {
      const t = setTimeout(() => setVisible(true), 100)
      return () => clearTimeout(t)
    }
  }, [animated])

  const stroke = variant === 'light' ? '#1ea2dc' : '#00529b'

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 750 500"
    >
      {visible &&
        LINES.map((line, i) => (
          <g key={i}>
            <path
              d={line.d}
              fill="none"
              stroke={stroke}
              strokeWidth="0.75"
              strokeOpacity={opacity}
              style={
                animated
                  ? {
                      strokeDasharray: 1000,
                      strokeDashoffset: 0,
                      animation: `dashFlow 2.5s ease ${line.delay}s both`,
                    }
                  : undefined
              }
            />
            {/* Arrow marker at path end */}
            <circle
              cx={getEndX(line.d)}
              cy={getEndY(line.d)}
              r="3"
              fill={stroke}
              fillOpacity={opacity * 2}
              style={
                animated
                  ? { animation: `dashFlow 2.5s ease ${line.delay + 2}s both` }
                  : undefined
              }
            />
          </g>
        ))}
    </svg>
  )
}

// Extract end coordinates from SVG path string
function getEndX(d: string): number {
  const parts = d.trim().split(/\s+/)
  const last = parts[parts.length - 2]
  return parseFloat(last) || 0
}
function getEndY(d: string): number {
  const parts = d.trim().split(/\s+/)
  const last = parts[parts.length - 1]
  return parseFloat(last) || 0
}
