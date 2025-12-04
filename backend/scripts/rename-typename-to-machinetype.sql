-- Manual migration: Rename type_name to machine_type in cassette_types table
-- This preserves all existing data

BEGIN;

-- Rename column
ALTER TABLE cassette_types 
RENAME COLUMN type_name TO machine_type;

-- Add comment to clarify purpose
COMMENT ON COLUMN cassette_types.machine_type IS 'Machine type compatibility: SR or VS';

COMMIT;

-- Verify the change
SELECT id, type_code, machine_type, description 
FROM cassette_types 
ORDER BY type_code;

