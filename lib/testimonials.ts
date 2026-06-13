// Founding testimonials — shown on the homepage and as the /reviews empty
// state until verified reviews accumulate, then replaced by the live feed.
export const STATIC_TESTIMONIALS = [
  {
    quote: 'RwandAir Cargo gets our flowers to Amsterdam in under 14 hours. Cold-chain has never failed us.',
    name: 'Amina K.',
    company: 'Kigali Floriculture Ltd',
    country: 'Rwanda',
    badge: 'Perishables' as const,
    badgeColor: '#94C944',
    badgeBg: 'rgba(45,125,70,0.1)',
  },
  {
    quote: 'The consolidation engine saved us 22% on our last three Dubai shipments.',
    name: 'Jean-Pierre M.',
    company: 'EastAfrica Freight Solutions',
    country: 'Kenya',
    badge: 'General Cargo' as const,
    badgeColor: '#00529C',
    badgeBg: 'rgba(4,84,155,0.08)',
  },
  {
    quote: 'CEIV Pharma certification and real-time temp monitoring gave our procurement team the confidence to approve RwandAir.',
    name: 'Dr. Sarah O.',
    company: 'MedExpress Africa',
    country: 'Uganda',
    badge: 'Pharmaceuticals' as const,
    badgeColor: '#16A1DC',
    badgeBg: 'rgba(28,163,219,0.1)',
  },
]

export const CARGO_TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  Perishables: { color: '#94C944', bg: 'rgba(45,125,70,0.1)' },
  Pharma:      { color: '#16A1DC', bg: 'rgba(28,163,219,0.1)' },
  General:     { color: '#00529C', bg: 'rgba(4,84,155,0.08)' },
  Courier:     { color: '#0891B2', bg: 'rgba(8,145,178,0.07)' },
}
