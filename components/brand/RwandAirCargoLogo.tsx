// RwandAir Cargo logo mark — precise SVG recreation of the official brand mark.
// Mark: blue ellipse + sky-blue arc sweeping over the top + green arc at bottom +
//       yellow sun with 24 rays + cream elliptical highlight.

function sunPath(cx: number, cy: number, innerR: number, outerR: number, n = 24): string {
  const pts: string[] = []
  for (let i = 0; i < n * 2; i++) {
    const a = (i * Math.PI) / n - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join('L')}Z`
}

// Icon-only mark. Size = width in px; height auto-scales from 100:90 aspect ratio.
export function RwandAirCargoLogoMark({ size = 48 }: { size?: number }) {
  const W = 100, H = 90
  const cx = 54, cy = 48   // blue ellipse centre

  return (
    <svg
      width={size}
      height={Math.round(size * H / W)}
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Green exterior bottom swoosh — short arc along lower-right */}
      <path
        d="M 23,70 A 40,30 0 0 1 87,56"
        fill="none"
        stroke="#94c943"
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/*
        Sky-blue exterior top swoosh — large CCW arc from lower-left,
        sweeping UP and OVER the top of the mark, ending upper-right.
        large-arc=1, sweep=0 (CCW in SVG screen coords)
      */}
      <path
        d="M 11,62 A 48,38 0 1 0 83,29"
        fill="none"
        stroke="#1ea2dc"
        strokeWidth="11"
        strokeLinecap="round"
      />

      {/* Main blue ellipse body — sits on top of both swooshes */}
      <ellipse cx={cx} cy={cy} rx={35} ry={27} fill="#00509E" />

      {/* Sun — 24 sharp pointed rays */}
      <path d={sunPath(cx, cy, 10, 23, 24)} fill="#F2DE0E" />

      {/* Sun centre disc */}
      <circle cx={cx} cy={cy} r={10} fill="#F2DE0E" />

      {/* Cream elliptical highlight — upper-left of sun disc (3D sphere effect) */}
      <ellipse
        cx={cx - 3.5}
        cy={cy - 4}
        rx={6}
        ry={4.5}
        fill="#FFFBCC"
        opacity={0.8}
      />
    </svg>
  )
}

// Full logotype: mark + "RwandAir CARGO" on one line (matches official logo layout).
export default function RwandAirCargoLogo({
  size = 40,
  variant = 'light',
}: {
  size?: number
  variant?: 'light' | 'dark'
}) {
  const airColor   = variant === 'light' ? 'white'    : '#00509E'
  const cargoColor = variant === 'light' ? '#F2DE0E'  : '#00509E'
  const fs         = Math.round(size * 0.56)

  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.28) }}
      aria-label="RwandAir Cargo"
    >
      <RwandAirCargoLogoMark size={size} />
      <div style={{ lineHeight: 1, userSelect: 'none', whiteSpace: 'nowrap' }}>
        <span style={{
          fontFamily: "'Lato', sans-serif",
          fontWeight: 900,
          fontStyle: 'italic',
          fontSize: fs,
          color: airColor,
          letterSpacing: '-0.01em',
        }}>
          RwandAir
        </span>
        <span style={{
          fontFamily: "'Lato', sans-serif",
          fontWeight: 900,
          fontStyle: 'italic',
          fontSize: fs,
          color: cargoColor,
          letterSpacing: '0.02em',
          marginLeft: '0.12em',
        }}>
          CARGO
        </span>
      </div>
    </div>
  )
}
