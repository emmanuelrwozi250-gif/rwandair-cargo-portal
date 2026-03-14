import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ShipmentStatus, AirShipmentStatus, WaterShipmentStatus, TransportMode } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatWeight(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}t`
  }
  return `${kg.toFixed(0)}kg`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function getStatusColor(status: ShipmentStatus): string {
  const colors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-700 border-gray-200',
    'Documents Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Booking Requested': 'bg-blue-100 text-blue-800 border-blue-200',
    'Space Confirmed': 'bg-green-100 text-green-800 border-green-200',
    // Air-only
    'In Transit': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    // Water-only
    'Port In': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Vessel Departed': 'bg-teal-100 text-teal-800 border-teal-200',
    'Port of Discharge': 'bg-purple-100 text-purple-800 border-purple-200',
    // Shared
    Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Closed: 'bg-gray-200 text-gray-600 border-gray-300',
  }
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'
}

export function getStatusDotColor(status: ShipmentStatus): string {
  const colors: Record<string, string> = {
    Draft: 'bg-gray-400',
    'Documents Pending': 'bg-yellow-500',
    'Booking Requested': 'bg-blue-500',
    'Space Confirmed': 'bg-green-500',
    'In Transit': 'bg-indigo-500',
    'Port In': 'bg-indigo-500',
    'Vessel Departed': 'bg-teal-500',
    'Port of Discharge': 'bg-purple-500',
    Delivered: 'bg-emerald-500',
    Closed: 'bg-gray-500',
  }
  return colors[status] || 'bg-gray-400'
}

export const AIR_STATUSES: AirShipmentStatus[] = [
  'Draft',
  'Documents Pending',
  'Booking Requested',
  'Space Confirmed',
  'In Transit',
  'Delivered',
  'Closed',
]

export const WATER_STATUSES: WaterShipmentStatus[] = [
  'Draft',
  'Documents Pending',
  'Booking Requested',
  'Space Confirmed',
  'Port In',
  'Vessel Departed',
  'Port of Discharge',
  'Delivered',
  'Closed',
]

// Legacy alias kept for backward compat
export const SHIPMENT_STATUSES = AIR_STATUSES

export function getStatusesForMode(mode: TransportMode): ShipmentStatus[] {
  return mode === 'water' ? WATER_STATUSES : AIR_STATUSES
}

export const DOCUMENT_TYPES = [
  'Commercial Invoice',
  'Packing List',
  'Phytosanitary Certificate',
  'Export License',
  'Bill of Lading',
  'Inland Waterway Bill',
  'Certificate of Origin',
  'Cargo Manifest',
  'Vessel Booking Confirmation',
  'Port Health Certificate',
  'Other',
] as const

export const WATER_DOCUMENT_TYPES_INLAND = [
  'Commercial Invoice',
  'Inland Waterway Bill',
  'Cargo Manifest',
  'Packing List',
  'Export License',
] as const

export const WATER_DOCUMENT_TYPES_OCEAN = [
  'Commercial Invoice',
  'Bill of Lading',
  'Certificate of Origin',
  'Packing List',
  'Vessel Booking Confirmation',
  'Export License',
] as const

export const INCOTERMS = ['EXW', 'FOB', 'CIF', 'DAP', 'DDP', 'Other'] as const

export const EXPORT_CATEGORIES = ['Coffee', 'Produce', 'Processed', 'Other'] as const

export const LAKE_NAMES = ['Victoria', 'Tanganyika', 'Malawi', 'Other'] as const

export const CONTAINER_TYPES = ['20ft', '40ft', '40ft HC', 'LCL', 'Bulk', 'N/A'] as const

export const PICKUP_STATUSES = [
  'Requested',
  'Transporter Assigned',
  'En Route to Pickup',
  'Cargo Collected',
  'En Route to Terminal',
  'Delivered to Terminal',
  'Cancelled',
] as const

export function getWaterStatusColor(status: WaterShipmentStatus): string {
  const colors: Record<WaterShipmentStatus, string> = {
    Draft: 'bg-gray-100 text-gray-700 border-gray-200',
    'Documents Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Booking Requested': 'bg-blue-100 text-blue-800 border-blue-200',
    'Space Confirmed': 'bg-green-100 text-green-800 border-green-200',
    'Port In': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Vessel Departed': 'bg-teal-100 text-teal-800 border-teal-200',
    'Port of Discharge': 'bg-purple-100 text-purple-800 border-purple-200',
    Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Closed: 'bg-gray-200 text-gray-600 border-gray-300',
  }
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'
}

export function getPickupStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Requested: 'bg-gray-100 text-gray-700 border-gray-200',
    'Transporter Assigned': 'bg-blue-100 text-blue-800 border-blue-200',
    'En Route to Pickup': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Cargo Collected': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'En Route to Terminal': 'bg-teal-100 text-teal-800 border-teal-200',
    'Delivered to Terminal': 'bg-green-100 text-green-800 border-green-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
  }
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'
}
