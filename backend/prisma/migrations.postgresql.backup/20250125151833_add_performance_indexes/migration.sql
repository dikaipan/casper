-- Migration: Add performance indexes for large dataset (10k+ cassettes)
-- These indexes will significantly improve query performance for filtering and sorting

-- Indexes for cassettes table
CREATE INDEX IF NOT EXISTS "cassettes_customerBankId_idx" ON "cassettes"("customer_bank_id");
CREATE INDEX IF NOT EXISTS "cassettes_machineId_idx" ON "cassettes"("machine_id");
CREATE INDEX IF NOT EXISTS "cassettes_status_idx" ON "cassettes"("status");
CREATE INDEX IF NOT EXISTS "cassettes_cassetteTypeId_idx" ON "cassettes"("cassette_type_id");
CREATE INDEX IF NOT EXISTS "cassettes_customerBankId_status_idx" ON "cassettes"("customer_bank_id", "status");
CREATE INDEX IF NOT EXISTS "cassettes_machineId_status_idx" ON "cassettes"("machine_id", "status");
CREATE INDEX IF NOT EXISTS "cassettes_createdAt_idx" ON "cassettes"("created_at");

-- Indexes for repair_tickets table
CREATE INDEX IF NOT EXISTS "repair_tickets_cassetteId_status_idx" ON "repair_tickets"("cassette_id", "status");
CREATE INDEX IF NOT EXISTS "repair_tickets_receivedAtRc_idx" ON "repair_tickets"("received_at_rc");
CREATE INDEX IF NOT EXISTS "repair_tickets_status_idx" ON "repair_tickets"("status");

-- Indexes for problem_tickets table
CREATE INDEX IF NOT EXISTS "problem_tickets_cassetteId_status_idx" ON "problem_tickets"("cassette_id", "status");
CREATE INDEX IF NOT EXISTS "problem_tickets_machineId_status_idx" ON "problem_tickets"("machine_id", "status");
CREATE INDEX IF NOT EXISTS "problem_tickets_reportedBy_idx" ON "problem_tickets"("reported_by");
CREATE INDEX IF NOT EXISTS "problem_tickets_createdAt_idx" ON "problem_tickets"("created_at");
CREATE INDEX IF NOT EXISTS "problem_tickets_status_idx" ON "problem_tickets"("status");
CREATE INDEX IF NOT EXISTS "problem_tickets_reportedAt_idx" ON "problem_tickets"("reported_at");

-- Indexes for ticket_cassette_details table
CREATE INDEX IF NOT EXISTS "ticket_cassette_details_cassetteId_idx" ON "ticket_cassette_details"("cassette_id");

-- Indexes for pm_cassette_details table
CREATE INDEX IF NOT EXISTS "pm_cassette_details_cassetteId_status_idx" ON "pm_cassette_details"("cassette_id", "status");
CREATE INDEX IF NOT EXISTS "pm_cassette_details_pmId_idx" ON "pm_cassette_details"("pm_id");

