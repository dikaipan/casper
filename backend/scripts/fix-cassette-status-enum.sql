-- Fix CassetteStatus enum in PostgreSQL
-- This script ensures 'BAD' is in the enum

-- First, check if enum exists and has BAD
DO $$
BEGIN
    -- Check if BAD exists in enum
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'BAD' 
        AND enumtypid = (
            SELECT oid 
            FROM pg_type 
            WHERE typname = 'CassetteStatus'
        )
    ) THEN
        -- Add BAD to enum if it doesn't exist
        ALTER TYPE "CassetteStatus" ADD VALUE IF NOT EXISTS 'BAD';
        RAISE NOTICE 'Added BAD to CassetteStatus enum';
    ELSE
        RAISE NOTICE 'BAD already exists in CassetteStatus enum';
    END IF;
END $$;

-- Verify all enum values
SELECT enumlabel as "CassetteStatus Values"
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'CassetteStatus'
)
ORDER BY enumsortorder;

