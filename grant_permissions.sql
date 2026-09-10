-- Grant all permissions to service_role
GRANT ALL ON orders TO service_role;
GRANT ALL ON customers TO service_role;
GRANT ALL ON products TO service_role;
GRANT ALL ON batches TO service_role;
GRANT ALL ON waitlist TO service_role;
GRANT ALL ON newsletter TO service_role;
GRANT ALL ON order_status_history TO service_role;
GRANT ALL ON inventory_movements TO service_role;

-- Also grant on sequences (for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
