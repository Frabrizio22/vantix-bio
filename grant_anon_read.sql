-- Grant SELECT permission to anon role (for dashboard read access)
GRANT SELECT ON orders TO anon;
GRANT SELECT ON customers TO anon;
GRANT SELECT ON products TO anon;
GRANT SELECT ON batches TO anon;
