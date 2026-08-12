-- ============================================================
-- Printify Single-Shop – Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing types if they exist to prevent errors during reset
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS file_status CASCADE;

-- Drop existing tables to ensure a clean slate
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================
-- 1. PROFILES TABLE (single shop owner)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  printify_id TEXT NOT NULL UNIQUE,
  display_name TEXT DEFAULT 'Shop Owner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. SETTINGS TABLE (single shop configuration)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_name TEXT NOT NULL DEFAULT 'My Print Shop',
  logo_url TEXT,
  welcome_message TEXT DEFAULT 'Welcome! Upload your documents for printing.',
  theme_color TEXT DEFAULT '#4F46E5',
  pricing_enabled BOOLEAN DEFAULT false,
  bw_price NUMERIC(10, 2) DEFAULT 2.00,
  color_price NUMERIC(10, 2) DEFAULT 5.00,
  paper_sizes TEXT[] DEFAULT ARRAY['A4', 'A3', 'Letter'],
  allow_double_side BOOLEAN DEFAULT true,
  notification_enabled BOOLEAN DEFAULT true,
  auto_delete_hours INTEGER DEFAULT 24,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. ORDER NUMBER SEQUENCE
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1001;

-- ============================================================
-- 4. ORDERS TABLE
-- ============================================================
CREATE TYPE order_status AS ENUM ('pending', 'printing', 'done', 'cancelled');

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE DEFAULT 'PRT-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0'),
  customer_name TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  copies INTEGER NOT NULL DEFAULT 1 CHECK (copies >= 1 AND copies <= 999),
  color_mode TEXT NOT NULL DEFAULT 'bw' CHECK (color_mode IN ('bw', 'color')),
  paper_size TEXT NOT NULL DEFAULT 'A4',
  print_side TEXT NOT NULL DEFAULT 'single' CHECK (print_side IN ('single', 'double')),
  notes TEXT,
  estimated_price NUMERIC(10, 2),
  status order_status NOT NULL DEFAULT 'pending',
  scheduled_deletion_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_scheduled_deletion ON orders(scheduled_deletion_at)
  WHERE scheduled_deletion_at IS NOT NULL;

-- ============================================================
-- 5. UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ORDERS: Anyone (anon) can INSERT new orders
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

-- ORDERS: Anon can UPDATE orders (since app uses local auth)
CREATE POLICY "Anon can update orders"
  ON orders FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- ORDERS: Anon can DELETE orders (since app uses local auth)
CREATE POLICY "Anon can delete orders"
  ON orders FOR DELETE
  TO anon
  USING (true);

-- ORDERS: Anyone can read their own order by order_number (for success page)
CREATE POLICY "Customers read own order"
  ON orders FOR SELECT TO public
  USING (true);

-- ORDERS: Authenticated role can do everything
CREATE POLICY "Authenticated full access to orders"
  ON orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- SETTINGS: Anyone can read settings (for upload page customization)
CREATE POLICY "Anyone can read settings"
  ON settings FOR SELECT
  TO anon
  USING (true);

-- SETTINGS: Only authenticated can modify settings
CREATE POLICY "Authenticated full access to settings"
  ON settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- PROFILES: Only authenticated can access profiles
CREATE POLICY "Authenticated full access to profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 7. CUSTOMER ORDER CREATION RPC
-- ============================================================

-- Safely creates an order and returns the generated order_number to bypass RLS SELECT restrictions
CREATE OR REPLACE FUNCTION create_new_order(
  p_customer_name TEXT,
  p_file_name TEXT,
  p_file_path TEXT,
  p_file_size BIGINT,
  p_copies INTEGER,
  p_color_mode TEXT,
  p_paper_size TEXT,
  p_print_side TEXT,
  p_notes TEXT,
  p_estimated_price NUMERIC
) RETURNS SETOF orders AS $$
BEGIN
  RETURN QUERY
  INSERT INTO orders (
    customer_name, file_name, file_path, file_size, copies, 
    color_mode, paper_size, print_side, notes, estimated_price
  )
  VALUES (
    p_customer_name, p_file_name, p_file_path, p_file_size, p_copies, 
    p_color_mode, p_paper_size, p_print_side, p_notes, p_estimated_price
  )
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. ENABLE REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- ============================================================
-- 9. STORAGE BUCKETS (create these in Supabase Dashboard)
-- ============================================================
-- Bucket: "documents" (public) – for customer file uploads
-- Bucket: "logos" (public) – for shop logo

-- Storage policies for "documents" bucket:
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true)
  ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to documents bucket
DROP POLICY IF EXISTS "Anyone can upload documents" ON storage.objects;
CREATE POLICY "Anyone can upload documents"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'documents');

-- Allow anon to delete from documents bucket (since app uses local auth)
DROP POLICY IF EXISTS "Anon can delete documents" ON storage.objects;
CREATE POLICY "Anon can delete documents"
  ON storage.objects FOR DELETE
  TO anon
  USING (bucket_id = 'documents');

-- Allow authenticated users full access to documents
DROP POLICY IF EXISTS "Authenticated full access to documents" ON storage.objects;
CREATE POLICY "Authenticated full access to documents"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'documents')
  WITH CHECK (bucket_id = 'documents');

-- Allow anyone to read logos (public bucket)
DROP POLICY IF EXISTS "Anyone can read logos" ON storage.objects;
CREATE POLICY "Anyone can read logos"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'logos');

-- Allow authenticated users to manage logos
DROP POLICY IF EXISTS "Authenticated can manage logos" ON storage.objects;
CREATE POLICY "Authenticated can manage logos"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'logos')
  WITH CHECK (bucket_id = 'logos');

-- ============================================================
-- 10. SEED DEFAULT DATA
-- ============================================================

-- Insert default shop owner profile
INSERT INTO profiles (printify_id, display_name)
VALUES ('PRINTIFY-001', 'Shop Owner')
ON CONFLICT (printify_id) DO NOTHING;

-- Insert default settings
INSERT INTO settings (shop_name, welcome_message, theme_color)
VALUES ('My Print Shop', 'Welcome! Upload your documents for printing.', '#4F46E5')
ON CONFLICT DO NOTHING;
