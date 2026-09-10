-- COMPLETE FIX for Supabase permissions
-- Run this entire block in Supabase SQL Editor

-- 1. Grant base permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 2. Drop existing policies
DROP POLICY IF EXISTS "Allow all for now" ON orders;
DROP POLICY IF EXISTS "Allow read for all" ON orders;
DROP POLICY IF EXISTS "Allow insert for service_role" ON orders;
DROP POLICY IF EXISTS "Allow update for service_role" ON orders;

-- 3. Create clean policies
CREATE POLICY "anon_select_orders" ON orders
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "service_role_all_orders" ON orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Verify RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 5. Grant sequence access (for auto-increment)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
