-- Migration: Rename WAITING_PARTS to ON_PROGRESS in RepairTicketStatus enum
-- This makes the status more relevant to the actual repair process

-- Step 1: Rename the enum value
ALTER TYPE "RepairTicketStatus" RENAME VALUE 'WAITING_PARTS' TO 'ON_PROGRESS';

-- Note: This will automatically update all existing records that have WAITING_PARTS to ON_PROGRESS

