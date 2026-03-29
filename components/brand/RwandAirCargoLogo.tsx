// Official RwandAir Cargo logo — served from /public/rwandair-cargo-logo.svg
// Extracted directly from the brand PDF (page 2, transparent background).
// Do NOT hand-edit the SVG; regenerate from the source PDF if the brand changes.

import Image from 'next/image'

// Aspect ratio of the official logo: 2834.65 × 1133.86 ≈ 2.5 : 1
const ASPECT = 2834.65 / 1133.86

export function RwandAirCargoLogoMark({ size = 48 }: { size?: number }) {
  const w = Math.round(size * ASPECT)
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

export default function RwandAirCargoLogo({
  size = 40,
  variant: _variant = 'light',
}: {
  size?: number
  variant?: 'light' | 'dark'
}) {
  return <RwandAirCargoLogoMark size={size} />
}
