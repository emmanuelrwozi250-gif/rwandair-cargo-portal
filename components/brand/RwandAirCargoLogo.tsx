// Official RwandAir Cargo logo assets — extracted from the brand PDF.
// rwandair-cargo-mark.svg  → mark only (globe symbol), viewBox cropped to mark area
// rwandair-cargo-logo.svg  → full logo (mark + "RwandAir CARGO" wordmark)

import Image from 'next/image'

// Mark-only: 545×400 viewBox → aspect ratio 1.363:1
const MARK_ASPECT = 545 / 400

// Full logo: 2834.65×1133.86 viewBox → aspect ratio 2.502:1
const LOGO_ASPECT = 2834.65 / 1133.86

/** Globe mark only — for constrained spaces like the navbar */
export function RwandAirCargoLogoMark({ size = 44 }: { size?: number }) {
  const w = Math.round(size * MARK_ASPECT)
  return (
    <Image
      src="/rwandair-cargo-mark.svg"
      alt="RwandAir Cargo"
      width={w}
      height={size}
      style={{ objectFit: 'contain' }}
      priority
    />
  )
}

/** Full logo: mark + "RwandAir CARGO" wordmark — for footer, login, standalone use */
export default function RwandAirCargoLogo({
  size = 64,
  variant: _variant = 'light',
}: {
  size?: number
  variant?: 'light' | 'dark'
}) {
  const w = Math.round(size * LOGO_ASPECT)
  return (
    <Image
      src="/rwandair-cargo-logo.svg"
      alt="RwandAir Cargo"
      width={w}
      height={size}
      style={{ objectFit: 'contain' }}
      priority
    />
  )
}
