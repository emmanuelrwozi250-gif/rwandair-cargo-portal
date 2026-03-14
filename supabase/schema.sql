-- ============================================================
-- ALTITUDE PLATFORM — SUPABASE SCHEMA
-- Run this in the Supabase SQL editor to set up the database
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('exporter', 'admin');
CREATE TYPE exporter_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE export_category AS ENUM ('Coffee', 'Produce', 'Processed', 'Other');
CREATE TYPE shipment_status AS ENUM (
  'Draft',
  'Documents Pending',
  'Booking Requested',
  'Space Confirmed',
  'In Transit',
  'Delivered',
  'Closed'
);
CREATE TYPE incoterm_type AS ENUM ('EXW', 'FOB', 'CIF', 'DAP', 'DDP', 'Other');
CREATE TYPE document_type AS ENUM (
  'Commercial Invoice',
  'Packing List',
  'Phytosanitary Certificate',
  'Export License',
  'Other'
);

-- ============================================================
-- USERS TABLE (mirrors auth.users)
-- ============================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'exporter',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EXPORTERS TABLE
-- ============================================================
CREATE TABLE public.exporters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  business_registration_number TEXT NOT NULL,
  export_license_number TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  export_category export_category NOT NULL,
  primary_export_destination TEXT NOT NULL,
  status exporter_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SHIPMENTS TABLE
-- ============================================================
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id TEXT NOT NULL UNIQUE,
  exporter_id UUID NOT NULL REFERENCES public.exporters(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  weight_kg DECIMAL(10, 2) NOT NULL,
  destination_country TEXT NOT NULL,
  destination_airport TEXT NOT NULL,
  preferred_departure_date DATE NOT NULL,
  buyer_name TEXT NOT NULL,
  invoice_value_usd DECIMAL(12, 2) NOT NULL,
  incoterm incoterm_type NOT NULL,
  status shipment_status NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-generate shipment_id sequence
CREATE SEQUENCE shipment_seq START 1;

CREATE OR REPLACE FUNCTION generate_shipment_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.shipment_id := 'ALT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('shipment_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_shipment_id
  BEFORE INSERT ON public.shipments
  FOR EACH ROW
  WHEN (NEW.shipment_id IS NULL OR NEW.shipment_id = '')
  EXECUTE FUNCTION generate_shipment_id();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- DOCUMENTS TABLE
-- ============================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STATUS LOGS TABLE
-- ============================================================
CREATE TABLE public.status_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  previous_status shipment_status,
  new_status shipment_status NOT NULL,
  changed_by UUID REFERENCES public.users(id),
  note TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- USERS policies
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (id = auth.uid() OR get_user_role() = 'admin');

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- EXPORTERS policies
CREATE POLICY "Exporters can read own profile" ON public.exporters
  FOR SELECT USING (user_id = auth.uid() OR get_user_role() = 'admin');

CREATE POLICY "Exporters can insert own profile" ON public.exporters
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Exporters can update own profile" ON public.exporters
  FOR UPDATE USING (user_id = auth.uid() OR get_user_role() = 'admin');

CREATE POLICY "Admin can update exporter status" ON public.exporters
  FOR UPDATE USING (get_user_role() = 'admin');

-- SHIPMENTS policies
CREATE POLICY "Exporters can read own shipments" ON public.shipments
  FOR SELECT USING (
    exporter_id IN (SELECT id FROM public.exporters WHERE user_id = auth.uid())
    OR get_user_role() = 'admin'
  );

CREATE POLICY "Exporters can insert own shipments" ON public.shipments
  FOR INSERT WITH CHECK (
    exporter_id IN (SELECT id FROM public.exporters WHERE user_id = auth.uid() AND status = 'approved')
  );

CREATE POLICY "Exporters can update own draft shipments" ON public.shipments
  FOR UPDATE USING (
    (exporter_id IN (SELECT id FROM public.exporters WHERE user_id = auth.uid()) AND status = 'Draft')
    OR get_user_role() = 'admin'
  );

-- DOCUMENTS policies
CREATE POLICY "Exporters can read own documents" ON public.documents
  FOR SELECT USING (
    shipment_id IN (
      SELECT s.id FROM public.shipments s
      JOIN public.exporters e ON s.exporter_id = e.id
      WHERE e.user_id = auth.uid()
    )
    OR get_user_role() = 'admin'
  );

CREATE POLICY "Exporters can insert own documents" ON public.documents
  FOR INSERT WITH CHECK (
    shipment_id IN (
      SELECT s.id FROM public.shipments s
      JOIN public.exporters e ON s.exporter_id = e.id
      WHERE e.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can insert documents" ON public.documents
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

-- STATUS LOGS policies
CREATE POLICY "Exporters can read own status logs" ON public.status_logs
  FOR SELECT USING (
    shipment_id IN (
      SELECT s.id FROM public.shipments s
      JOIN public.exporters e ON s.exporter_id = e.id
      WHERE e.user_id = auth.uid()
    )
    OR get_user_role() = 'admin'
  );

CREATE POLICY "Authenticated users can insert status logs" ON public.status_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- NOTIFICATIONS policies
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- STORAGE BUCKET FOR DOCUMENTS
-- ============================================================
-- Run separately in the Supabase dashboard or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('shipment-documents', 'shipment-documents', false);

-- Storage policies (run after creating bucket)
-- CREATE POLICY "Exporters can upload own documents"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'shipment-documents' AND auth.uid() IS NOT NULL);
--
-- CREATE POLICY "Exporters can read own documents"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'shipment-documents' AND auth.uid() IS NOT NULL);

-- ============================================================
-- SEED ADMIN USER
-- ============================================================
-- After creating an admin user via Supabase Auth, run:
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@altitudeafrica.com';

-- ============================================================
-- USEFUL INDEXES
-- ============================================================
CREATE INDEX idx_shipments_exporter_id ON public.shipments(exporter_id);
CREATE INDEX idx_shipments_status ON public.shipments(status);
CREATE INDEX idx_shipments_created_at ON public.shipments(created_at DESC);
CREATE INDEX idx_documents_shipment_id ON public.documents(shipment_id);
CREATE INDEX idx_status_logs_shipment_id ON public.status_logs(shipment_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_exporters_user_id ON public.exporters(user_id);
CREATE INDEX idx_exporters_status ON public.exporters(status);
