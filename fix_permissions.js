// Fix Supabase permissions via API
const SUPABASE_URL = 'https://jbnarypjwtfjbscoqfgh.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibmFyeXBqd3RmamJzY29xZmdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODgyMTczOCwiZXhwIjoyMTA0Mzk3NzM4fQ.vcOv7F7Ti_59lR2yKSdLwUXWP5iBcDJVFzIVGBlhk0s';

const sql = `
-- Grant base permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all for now" ON orders;
DROP POLICY IF EXISTS "Allow read for all" ON orders;
DROP POLICY IF EXISTS "Allow insert for service_role" ON orders;
DROP POLICY IF EXISTS "Allow update for service_role" ON orders;

-- Create clean policies
CREATE POLICY "anon_select_orders" ON orders
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "service_role_all_orders" ON orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
`;

async function fixPermissions() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    });
    
    console.log('Response:', response.status);
    const data = await response.text();
    console.log('Data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

fixPermissions();
