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

// ── Claims ────────────────────────────────────────────────────────────────────

export type ClaimType = 'Loss' | 'Damage' | 'Delay' | 'Shortage' | 'Pilferage'

export type ClaimStatus = 'Received' | 'Under Review' | 'Resolved' | 'Rejected'

export type ClaimRelationship = 'shipper' | 'consignee' | 'agent'

export type ContactMethod = 'email' | 'whatsapp' | 'phone'

export interface Claim {
  id: string
  claim_ref: string
  claim_type: ClaimType
  status: ClaimStatus
  awb: string
  flight_number?: string
  origin?: string
  destination?: string
  delivery_date?: string
  declared_value_usd?: number
  description: string
  claim_value_usd?: number
  file_urls: { name: string; path: string }[]
  good_condition_confirmed: boolean
  claimant_name: string
  claimant_company?: string
  claimant_email: string
  claimant_phone: string
  relationship: ClaimRelationship
  preferred_contact: ContactMethod
  time_limit_warning?: string
  created_at: string
  updated_at: string
}

export interface ClaimEvent {
  id: string
  claim_id: string
  status: ClaimStatus
  note?: string
  created_at: string
}

// ── Ratings & Reviews ─────────────────────────────────────────────────────────

export type ReviewCargoType = 'Perishables' | 'Pharma' | 'General' | 'Courier'

export interface Rating {
  id: string
  request_id?: string
  awb: string
  route?: string
  cargo_type: ReviewCargoType
  score_booking: number
  score_ontime: number
  score_condition: number
  score_communication: number
  score_overall: number
  comment?: string
  display_consent: boolean
  full_name_consent: boolean
  reviewer_name?: string
  reviewer_company?: string
  is_published: boolean
  is_flagged: boolean
  created_at: string
}

export interface RatingAggregates {
  count: number
  overall: number
  booking: number
  ontime: number
  condition: number
  communication: number
}

// ── Feedback ──────────────────────────────────────────────────────────────────

export type FeedbackCategory =
  | 'Booking & Pricing'
  | 'Operations & Handling'
  | 'Tracking & Communication'
  | 'Website & Digital Tools'
  | 'New Route / Destination Request'
  | 'Other'

export interface FeatureRequest {
  id: string
  title: string
  request_count: number
  is_visible: boolean
  sort_order: number
}

// ── News & Updates ────────────────────────────────────────────────────────────

export type ArticleCategory =
  | 'Route News'
  | 'Service Alerts'
  | 'Trade Intelligence'
  | 'Company News'
  | 'Compliance Updates'

export interface Article {
  id: string
  slug: string
  title: string
  category: ArticleCategory
  published_at: string
  author_name: string
  author_role: string
  hero_image_url?: string
  hero_image_alt?: string
  summary: string
  body: string
  tags: string[]
  is_service_alert: boolean
  related_routes: string[]
  is_published: boolean
  useful_yes: number
  useful_no: number
  created_at: string
  updated_at: string
}

// ── Agent Portal (parallel account system) ──────────────────────────────────

export type AgentStatus = 'registered' | 'pending' | 'approved' | 'rejected'
export type AccountRole = 'owner' | 'member'

export interface Profile {
  id: string
  email: string
  company_name: string
  country?: string
  iata_fiata_code?: string
  volume_tier?: string
  product_types: string[]
  preferred_routes: string[]
  status: AgentStatus
  account_role: AccountRole
  parent_id?: string | null
  credit_balance_usd: number
  payment_due_date?: string | null
  notify_departure: boolean
  notify_arrival: boolean
  notify_exception: boolean
  whatsapp_number?: string | null
  created_at: string
  updated_at: string
}

export interface AgentBooking {
  id: string
  account_id: string
  created_by?: string | null
  flight_number?: string
  route: string
  origin: string
  destination: string
  departure_at?: string | null
  product_type: string
  pieces?: number | null
  weight_kg?: number | null
  charges_usd?: number | null
  status: string
  awb_number?: string | null
  created_at: string
}

export interface Eawb {
  id: string
  account_id: string
  booking_id?: string | null
  awb_number: string
  shipper: Record<string, string>
  consignee: Record<string, string>
  commodity?: string
  pieces?: number | null
  weight_kg?: number | null
  dimensions?: string
  special_handling: string[]
  created_at: string
}

export interface AgentInvoice {
  id: string
  account_id: string
  period_start: string
  period_end: string
  total_shipments: number
  total_weight_kg: number
  total_charges_usd: number
  due_date?: string | null
  created_at: string
}

export interface AgentNotification {
  id: string
  account_id: string
  type: string
  message: string
  read: boolean
  created_at: string
}

export interface ContractRate {
  id: string
  account_id: string
  route: string
  product_type: string
  rate_usd_per_kg: number
  valid_until?: string | null
  created_at: string
}
