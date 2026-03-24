/**
 * Rwandan landscape silhouette — layered mountain paths used as footer
 * decoration and section transition elements.
 */
interface RwandaLandscapeProps {
  className?: string
  /** Base blue tone — layers go from dark foreground to light background */
  baseColor?: string
}

export default function RwandaLandscape({
  className = '',
  baseColor = '#00529b',
}: RwandaLandscapeProps) {
  // Hex to RGB helper
  const hex2rgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
  }
  const blend = (hex: string, white: number) => {
    const { r, g, b } = hex2rgb(hex)
    const rr = Math.round(r + (255 - r) * white)
    const gg = Math.round(g + (255 - g) * white)
    const bb = Math.round(b + (255 - b) * white)
    return `rgb(${rr},${gg},${bb})`
  }

  const layers = [
    { path: 'M0,60 C80,20 160,50 240,30 C320,10 400,40 480,25 C560,10 640,35 720,20 L720,120 L0,120 Z', tint: 0 },
    { path: 'M0,80 C60,50 140,70 220,55 C300,40 380,65 460,50 C540,35 620,60 720,45 L720,120 L0,120 Z', tint: 0.25 },
    { path: 'M0,95 C80,75 160,90 240,78 C320,65 400,85 480,72 C560,60 640,80 720,68 L720,120 L0,120 Z', tint: 0.5 },
    { path: 'M0,108 C100,95 200,105 300,98 C400,90 500,102 600,96 C650,93 680,98 720,95 L720,120 L0,120 Z', tint: 0.75 },
  ]

  return (
    <svg
      className={`w-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 720 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {layers.map((layer, i) => (
        <path key={i} d={layer.path} fill={blend(baseColor, layer.tint)} />
      ))}
    </svg>
  )
}
