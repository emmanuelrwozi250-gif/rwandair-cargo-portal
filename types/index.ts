export type UserRole = 'exporter' | 'admin'

export type ExporterStatus = 'pending' | 'approved' | 'rejected'

export type ExportCategory = 'Coffee' | 'Produce' | 'Processed' | 'Other'

export type TransportMode = 'air' | 'water'

export type WaterType = 'inland_lake' | 'ocean' | 'coastal'

export type LakeName = 'Victoria' | 'Tanganyika' | 'Malawi' | 'Other'

export type ContainerType = '20ft' | '40ft' | '40ft HC' | 'LCL' | 'Bulk' | 'N/A'

export type DestinationType = 'airport_cargo' | 'lake_port' | 'ocean_port'

export type WaterShipmentStatus =
  | 'Draft'
  | 'Documents Pending'
  | 'Booking Requested'
  | 'Space Confirmed'
  | 'Port In'
  | 'Vessel Departed'
  | 'Port of Discharge'
  | 'Delivered'
  | 'Closed'

export type AirShipmentStatus =
  | 'Draft'
  | 'Documents Pending'
  | 'Booking Requested'
  | 'Space Confirmed'
  | 'In Transit'
  | 'Delivered'
  | 'Closed'

// ShipmentStatus is the union of both
export type ShipmentStatus = AirShipmentStatus | WaterShipmentStatus

export type PickupStatus =
  | 'Requested'
  | 'Transporter Assigned'
  | 'En Route to Pickup'
  | 'Cargo Collected'
  | 'En Route to Terminal'
  | 'Delivered to Terminal'
  | 'Cancelled'

export type Incoterm = 'EXW' | 'FOB' | 'CIF' | 'DAP' | 'DDP' | 'Other'

export type DocumentType =
  | 'Commercial Invoice'
  | 'Packing List'
  | 'Phytosanitary Certificate'
  | 'Export License'
  | 'Bill of Lading'
  | 'Inland Waterway Bill'
  | 'Certificate of Origin'
  | 'Cargo Manifest'
  | 'Vessel Booking Confirmation'
  | 'Port Health Certificate'
  | 'Other'

export interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface Exporter {
  id: string
  user_id: string
  company_name: string
  business_registration_number: string
  export_license_number: string
  contact_person: string
  email: string
  phone: string
  export_category: ExportCategory
  primary_export_destination: string
  status: ExporterStatus
  created_at: string
}

export interface Shipment {
  id: string
  shipment_id: string
  exporter_id: string
  product_type: string
  quantity: number
  weight_kg: number
  destination_country: string
  destination_airport: string
  preferred_departure_date: string
  buyer_name: string
  invoice_value_usd: number
  incoterm: Incoterm
  status: ShipmentStatus
  // Water freight fields
  transport_mode: TransportMode
  water_type?: WaterType
  vessel_name?: string
  voyage_number?: string
  port_of_loading?: string
  port_of_discharge?: string
  lake_name?: LakeName
  vessel_operator?: string
  port_cutoff_date?: string
  bill_of_lading_number?: string
  container_number?: string
  container_type?: ContainerType
  created_at: string
  updated_at: string
  exporters?: Exporter
}

export interface Document {
  id: string
  shipment_id: string
  document_type: DocumentType
  file_url: string
  file_name: string
  uploaded_at: string
}

export interface StatusLog {
  id: string
  shipment_id: string
  previous_status: ShipmentStatus | null
  new_status: ShipmentStatus
  changed_by: string
  note: string | null
  changed_at: string
  users?: {
    email: string
    role: UserRole
  }
}

export interface Notification {
  id: string
  user_id: string
  message: string
  read: boolean
  created_at: string
}

export interface PickupRequest {
  id: string
  pickup_id: string
  shipment_id: string
  exporter_id: string
  pickup_address: string
  pickup_city: string
  pickup_country: string
  pickup_contact_name: string
  pickup_contact_phone: string
  destination_terminal: string
  destination_type: DestinationType
  cargo_description?: string
  number_of_pieces?: number
  total_weight_kg?: number
  required_pickup_date: string
  required_pickup_time_by?: string
  cargo_cutoff_time?: string
  special_handling_notes?: string
  transporter_id?: string
  transporter?: Transporter
  status: PickupStatus
  estimated_pickup_time?: string
  actual_pickup_time?: string
  actual_delivery_time?: string
  admin_notes?: string
  created_at: string
  updated_at: string
}

export interface Transporter {
  id: string
  company_name: string
  contact_person: string
  phone: string
  email?: string
  city: string
  country: string
  vehicle_types?: string[]
  max_weight_kg?: number
  is_active: boolean
  rating: number
  total_pickups: number
  on_time_rate: number
  admin_notes?: string
  created_at: string
}

export interface WaterPort {
  id: string
  port_name: string
  port_type: 'lake' | 'ocean' | 'coastal'
  lake_or_sea?: string
  country: string
  is_active: boolean
}
