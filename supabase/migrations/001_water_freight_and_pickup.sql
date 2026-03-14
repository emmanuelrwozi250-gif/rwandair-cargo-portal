-- Extend shipments table with water freight fields
ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS transport_mode text NOT NULL DEFAULT 'air' CHECK (transport_mode IN ('air', 'water')),
  ADD COLUMN IF NOT EXISTS water_type text CHECK (water_type IN ('inland_lake', 'ocean', 'coastal')),
  ADD COLUMN IF NOT EXISTS vessel_name text,
  ADD COLUMN IF NOT EXISTS voyage_number text,
  ADD COLUMN IF NOT EXISTS port_of_loading text,
  ADD COLUMN IF NOT EXISTS port_of_discharge text,
  ADD COLUMN IF NOT EXISTS lake_name text CHECK (lake_name IN ('Victoria', 'Tanganyika', 'Malawi', 'Other')),
  ADD COLUMN IF NOT EXISTS vessel_operator text,
  ADD COLUMN IF NOT EXISTS port_cutoff_date date,
  ADD COLUMN IF NOT EXISTS bill_of_lading_number text,
  ADD COLUMN IF NOT EXISTS container_number text,
  ADD COLUMN IF NOT EXISTS container_type text CHECK (container_type IN ('20ft', '40ft', '40ft HC', 'LCL', 'Bulk', 'N/A'));

-- Extend the shipment_status ENUM with water freight statuses.
-- IMPORTANT: The schema uses a PostgreSQL ENUM type (shipment_status), not a TEXT+CHECK column.
-- New values must be added via ALTER TYPE, not by dropping/adding a CHECK constraint.
ALTER TYPE shipment_status ADD VALUE IF NOT EXISTS 'Port In';
ALTER TYPE shipment_status ADD VALUE IF NOT EXISTS 'Vessel Departed';
ALTER TYPE shipment_status ADD VALUE IF NOT EXISTS 'Port of Discharge';

-- Water ports reference table
CREATE TABLE IF NOT EXISTS water_ports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  port_name text NOT NULL,
  port_type text NOT NULL CHECK (port_type IN ('lake', 'ocean', 'coastal')),
  lake_or_sea text,
  country text NOT NULL,
  is_active boolean DEFAULT true
);

INSERT INTO water_ports (port_name, port_type, lake_or_sea, country) VALUES
  ('Kisumu Port', 'lake', 'Lake Victoria', 'Kenya'),
  ('Port Bell', 'lake', 'Lake Victoria', 'Uganda'),
  ('Jinja Port', 'lake', 'Lake Victoria', 'Uganda'),
  ('Mwanza Port', 'lake', 'Lake Victoria', 'Tanzania'),
  ('Bukoba Port', 'lake', 'Lake Victoria', 'Tanzania'),
  ('Kigoma Port', 'lake', 'Lake Tanganyika', 'Tanzania'),
  ('Kalemie Port', 'lake', 'Lake Tanganyika', 'DRC'),
  ('Mpulungu Port', 'lake', 'Lake Tanganyika', 'Zambia'),
  ('Bujumbura Port', 'lake', 'Lake Tanganyika', 'Burundi'),
  ('Monkey Bay Port', 'lake', 'Lake Malawi', 'Malawi'),
  ('Mombasa Port', 'ocean', 'Indian Ocean', 'Kenya'),
  ('Dar es Salaam Port', 'ocean', 'Indian Ocean', 'Tanzania'),
  ('Zanzibar Port', 'coastal', 'Indian Ocean', 'Tanzania'),
  ('Djibouti Port', 'ocean', 'Red Sea', 'Djibouti'),
  ('Maputo Port', 'ocean', 'Indian Ocean', 'Mozambique')
ON CONFLICT DO NOTHING;

-- Vessel operators reference table
CREATE TABLE IF NOT EXISTS vessel_operators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_name text NOT NULL,
  operator_type text CHECK (operator_type IN ('lake_ferry', 'shipping_line', 'coastal_vessel')),
  primary_corridor text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Extend the document_type ENUM with water freight document types.
-- Same reason as above — must use ALTER TYPE, not a CHECK constraint.
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'Bill of Lading';
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'Inland Waterway Bill';
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'Certificate of Origin';
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'Cargo Manifest';
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'Vessel Booking Confirmation';
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'Port Health Certificate';

-- Transporters table
CREATE TABLE IF NOT EXISTS transporters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_person text NOT NULL,
  phone text NOT NULL,
  email text,
  city text NOT NULL,
  country text NOT NULL,
  vehicle_types text[],
  max_weight_kg decimal,
  is_active boolean DEFAULT true,
  rating decimal DEFAULT 0,
  total_pickups integer DEFAULT 0,
  on_time_rate decimal DEFAULT 0,
  admin_notes text,
  created_at timestamptz DEFAULT now()
);

-- Pickup requests table
CREATE TABLE IF NOT EXISTS pickup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_id text UNIQUE NOT NULL DEFAULT '',
  shipment_id uuid REFERENCES shipments(id) ON DELETE CASCADE,
  exporter_id uuid REFERENCES exporters(id),
  pickup_address text NOT NULL,
  pickup_city text NOT NULL,
  pickup_country text NOT NULL,
  pickup_contact_name text NOT NULL,
  pickup_contact_phone text NOT NULL,
  destination_terminal text NOT NULL,
  destination_type text NOT NULL CHECK (destination_type IN ('airport_cargo', 'lake_port', 'ocean_port')),
  cargo_description text,
  number_of_pieces integer,
  total_weight_kg decimal,
  required_pickup_date date NOT NULL,
  required_pickup_time_by text,
  cargo_cutoff_time text,
  special_handling_notes text,
  transporter_id uuid REFERENCES transporters(id),
  status text NOT NULL DEFAULT 'Requested' CHECK (status IN (
    'Requested', 'Transporter Assigned', 'En Route to Pickup',
    'Cargo Collected', 'En Route to Terminal', 'Delivered to Terminal', 'Cancelled'
  )),
  estimated_pickup_time text,
  actual_pickup_time timestamptz,
  actual_delivery_time timestamptz,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS for water_ports (public read)
ALTER TABLE water_ports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "water_ports_read" ON water_ports;
CREATE POLICY "water_ports_read" ON water_ports FOR SELECT USING (true);

-- RLS for transporters (admin only write, no exporter access)
ALTER TABLE transporters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "transporters_admin_all" ON transporters;
CREATE POLICY "transporters_admin_all" ON transporters FOR ALL USING (true);

-- RLS for pickup_requests
ALTER TABLE pickup_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pickup_requests_exporter_own" ON pickup_requests;
DROP POLICY IF EXISTS "pickup_requests_exporter_insert" ON pickup_requests;
DROP POLICY IF EXISTS "pickup_requests_admin_all" ON pickup_requests;

CREATE POLICY "pickup_requests_exporter_own" ON pickup_requests
  FOR SELECT USING (
    exporter_id IN (SELECT id FROM exporters WHERE user_id = auth.uid())
  );
CREATE POLICY "pickup_requests_exporter_insert" ON pickup_requests
  FOR INSERT WITH CHECK (
    exporter_id IN (SELECT id FROM exporters WHERE user_id = auth.uid())
  );
CREATE POLICY "pickup_requests_admin_all" ON pickup_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Auto-increment pickup_id function
CREATE OR REPLACE FUNCTION generate_pickup_id()
RETURNS TRIGGER AS $$
DECLARE
  year_str text;
  seq_num integer;
BEGIN
  year_str := to_char(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO seq_num FROM pickup_requests
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  NEW.pickup_id := 'PKP-' || year_str || '-' || LPAD(seq_num::text, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_pickup_id ON pickup_requests;
CREATE TRIGGER set_pickup_id
  BEFORE INSERT ON pickup_requests
  FOR EACH ROW
  WHEN (NEW.pickup_id = '' OR NEW.pickup_id IS NULL)
  EXECUTE FUNCTION generate_pickup_id();
