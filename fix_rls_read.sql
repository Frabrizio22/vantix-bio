-- Allow anon key to READ orders (for admin dashboard)
-- Service role can still do everything

DROP POLICY IF EXISTS "Allow all for now" ON orders;

CREATE POLICY "Allow read for all" ON orders
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert for service_role" ON orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update for service_role" ON orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
