-- Migration: Add type field to repair_tickets table
-- This field stores the type of repair ticket: ROUTINE, ON_DEMAND_PENGELOLA, ON_DEMAND_HITACHI, or EMERGENCY
-- This allows repair tickets created from Preventive Maintenance to preserve their type

-- Step 1: Add type column to repair_tickets table with default value ROUTINE
ALTER TABLE "repair_tickets" 
ADD COLUMN "type" "PreventiveMaintenanceType" NOT NULL DEFAULT 'ROUTINE';

-- Step 2: Add comment to explain the field
COMMENT ON COLUMN "repair_tickets"."type" IS 'Type of repair ticket: ROUTINE, ON_DEMAND_PENGELOLA, ON_DEMAND_HITACHI, or EMERGENCY';

