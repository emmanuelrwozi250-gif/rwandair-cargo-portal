// RwandAir IATA Code: WB | Hub: Kigali (KGL)
// cargo@rwandair.com | +250738306074

export const AIRPORTS = [
  // Hub
  { code: 'KGL', city: 'Kigali', country: 'Rwanda', region: 'Africa' },
  // East Africa
  { code: 'NBO', city: 'Nairobi', country: 'Kenya', region: 'Africa' },
  { code: 'EBB', city: 'Entebbe', country: 'Uganda', region: 'Africa' },
  { code: 'DAR', city: 'Dar es Salaam', country: 'Tanzania', region: 'Africa' },
  { code: 'JRO', city: 'Kilimanjaro', country: 'Tanzania', region: 'Africa' },
  { code: 'ZNZ', city: 'Zanzibar', country: 'Tanzania', region: 'Africa' },
  { code: 'BJM', city: 'Bujumbura', country: 'Burundi', region: 'Africa' },
  { code: 'ADD', city: 'Addis Ababa', country: 'Ethiopia', region: 'Africa' },
  { code: 'KME', city: 'Kamembe', country: 'Rwanda', region: 'Africa' },
  // Central Africa
  { code: 'FIH', city: 'Kinshasa', country: 'DR Congo', region: 'Africa' },
  // Southern Africa
  { code: 'JNB', city: 'Johannesburg', country: 'South Africa', region: 'Africa' },
  { code: 'HRE', city: 'Harare', country: 'Zimbabwe', region: 'Africa' },
  { code: 'LUN', city: 'Lusaka', country: 'Zambia', region: 'Africa' },
  // West Africa
  { code: 'LOS', city: 'Lagos', country: 'Nigeria', region: 'Africa' },
  { code: 'ACC', city: 'Accra', country: 'Ghana', region: 'Africa' },
  { code: 'ABJ', city: 'Abidjan', country: "Côte d'Ivoire", region: 'Africa' },
  { code: 'BKO', city: 'Bamako', country: 'Mali', region: 'Africa' },
  // Europe
  { code: 'LHR', city: 'London', country: 'United Kingdom', region: 'Europe' },
  { code: 'BRU', city: 'Brussels', country: 'Belgium', region: 'Europe' },
  { code: 'CDG', city: 'Paris', country: 'France', region: 'Europe' },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', region: 'Europe' },
  // Middle East
  { code: 'DXB', city: 'Dubai', country: 'UAE', region: 'Middle East' },
  { code: 'DOH', city: 'Doha', country: 'Qatar', region: 'Middle East' },
  // Asia
  { code: 'BOM', city: 'Mumbai', country: 'India', region: 'Asia' },
  { code: 'CAN', city: 'Guangzhou', country: 'China', region: 'Asia' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', region: 'Asia' },
  // Americas
  { code: 'JFK', city: 'New York', country: 'USA', region: 'Americas' },
  { code: 'IAD', city: 'Washington D.C.', country: 'USA', region: 'Americas' },
];

export const CARGO_TYPES = [
  { value: 'general', label: 'General Cargo', multiplier: 1.0 },
  { value: 'perishable', label: 'Perishable / Cool Chain', multiplier: 1.4 },
  { value: 'pharma', label: 'Pharmaceuticals (CEIV)', multiplier: 1.45 },
  { value: 'dangerous', label: 'Dangerous Goods (IATA)', multiplier: 1.8 },
  { value: 'valuable', label: 'Valuable Cargo', multiplier: 1.6 },
  { value: 'animals', label: 'Live Animals', multiplier: 1.5 },
];

// Base rate (USD/kg) by destination region
const REGION_RATES = {
  Africa: 2.5,
  Europe: 4.0,
  'Middle East': 3.5,
  Asia: 5.0,
  Americas: 6.0,
};

export const generateAWB = () => {
  const num = Math.floor(10000000 + Math.random() * 90000000);
  return `WB-${num}`;
};

export const calculateRate = (originCode, destinationCode, weightKg, cargoTypeValue) => {
  const origin = AIRPORTS.find((a) => a.code === originCode);
  const destination = AIRPORTS.find((a) => a.code === destinationCode);
  if (!origin || !destination) return 0;

  const baseRate = REGION_RATES[destination.region] || 3.0;
  const cargo = CARGO_TYPES.find((c) => c.value === cargoTypeValue) || CARGO_TYPES[0];
  const weight = Math.max(parseFloat(weightKg) || 0, 1);

  // Fuel surcharge: 15% | Security surcharge: $0.25/kg
  const cost = baseRate * weight * cargo.multiplier;
  const fuelSurcharge = cost * 0.15;
  const securitySurcharge = 0.25 * weight;
  const total = cost + fuelSurcharge + securitySurcharge;
  return Math.round(total * 100) / 100;
};

export const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateShort = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const STATUSES = [
  'Booked',
  'Collected',
  'In Transit',
  'Customs Clearance',
  'Out for Delivery',
  'Delivered',
];

export const STATUS_COLORS = {
  Booked: '#6B7280',
  Collected: '#3B82F6',
  'In Transit': '#F59E0B',
  'Customs Clearance': '#8B5CF6',
  'Out for Delivery': '#F97316',
  Delivered: '#10B981',
};

export const hashPassword = (password) => {
  // Simple hash for demo — NOT production-safe
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
};
