-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MachineStatus" AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'DECOMMISSIONED', 'UNDER_REPAIR');

-- CreateEnum
CREATE TYPE "PengelolaUserRole" AS ENUM ('TECHNICIAN', 'SUPERVISOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "HitachiUserRole" AS ENUM ('SUPER_ADMIN', 'RC_MANAGER', 'RC_STAFF');

-- CreateEnum
CREATE TYPE "HitachiUserDepartment" AS ENUM ('MANAGEMENT', 'REPAIR_CENTER', 'LOGISTICS');

-- CreateEnum
CREATE TYPE "CassetteTypeCode" AS ENUM ('RB', 'AB', 'URJB');

-- CreateEnum
CREATE TYPE "CassetteStatus" AS ENUM ('OK', 'BAD', 'IN_TRANSIT_TO_RC', 'IN_REPAIR', 'IN_TRANSIT_TO_PENGELOLA', 'SCRAPPED');

-- CreateEnum
CREATE TYPE "CassetteUsageType" AS ENUM ('MAIN', 'BACKUP');

-- CreateEnum
CREATE TYPE "RepairTicketStatus" AS ENUM ('RECEIVED', 'DIAGNOSING', 'WAITING_PARTS', 'COMPLETED', 'SCRAPPED');

-- CreateEnum
CREATE TYPE "ProblemTicketStatus" AS ENUM ('OPEN', 'APPROVED', 'IN_DELIVERY', 'RECEIVED', 'IN_PROGRESS', 'RESOLVED', 'RETURN_SHIPPED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ProblemTicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IdentifierType" AS ENUM ('WSID', 'SERIAL_NUMBER', 'BRANCH_CODE', 'PENGELOLA_ASSIGNMENT');

-- CreateEnum
CREATE TYPE "PreventiveMaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "PreventiveMaintenanceType" AS ENUM ('ROUTINE', 'ON_DEMAND_PENGELOLA', 'ON_DEMAND_HITACHI', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "PreventiveMaintenanceLocation" AS ENUM ('BANK_LOCATION', 'PENGELOLA_LOCATION', 'REPAIR_CENTER');

-- CreateTable
CREATE TABLE "customers_banks" (
    "id" UUID NOT NULL,
    "bank_code" VARCHAR(20) NOT NULL,
    "bank_name" VARCHAR(255) NOT NULL,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "primary_contact_name" VARCHAR(255),
    "primary_contact_email" VARCHAR(255),
    "primary_contact_phone" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengelola" (
    "id" UUID NOT NULL,
    "pengelola_code" VARCHAR(50) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "company_abbreviation" VARCHAR(50) NOT NULL,
    "business_registration_number" VARCHAR(100),
    "address" TEXT,
    "city" VARCHAR(100),
    "province" VARCHAR(100),
    "primary_contact_name" VARCHAR(255),
    "primary_contact_email" VARCHAR(255),
    "primary_contact_phone" VARCHAR(50),
    "website" VARCHAR(255),
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengelola_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_pengelola_assignments" (
    "id" UUID NOT NULL,
    "customer_bank_id" UUID NOT NULL,
    "pengelola_id" UUID NOT NULL,
    "contract_number" VARCHAR(100),
    "contract_start_date" DATE,
    "contract_end_date" DATE,
    "service_scope" TEXT,
    "assigned_branches" JSONB,
    "sla_response_time_hours" INTEGER,
    "sla_resolution_time_hours" INTEGER,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_pengelola_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengelola_users" (
    "id" UUID NOT NULL,
    "pengelola_id" UUID NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "whatsapp_number" VARCHAR(50),
    "role" "PengelolaUserRole" NOT NULL DEFAULT 'TECHNICIAN',
    "employee_id" VARCHAR(100),
    "can_create_tickets" BOOLEAN NOT NULL DEFAULT true,
    "can_close_tickets" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_machines" BOOLEAN NOT NULL DEFAULT false,
    "assigned_branches" JSONB,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengelola_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hitachi_users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "role" "HitachiUserRole" NOT NULL DEFAULT 'RC_STAFF',
    "department" "HitachiUserDepartment" NOT NULL DEFAULT 'REPAIR_CENTER',
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hitachi_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machines" (
    "id" UUID NOT NULL,
    "customer_bank_id" UUID NOT NULL,
    "pengelola_id" UUID NOT NULL,
    "machine_code" VARCHAR(100) NOT NULL,
    "model_name" VARCHAR(255) NOT NULL,
    "serial_number_manufacturer" VARCHAR(255) NOT NULL,
    "physical_location" TEXT NOT NULL,
    "branch_code" VARCHAR(100),
    "city" VARCHAR(100),
    "province" VARCHAR(100),
    "installation_date" DATE,
    "current_wsid" VARCHAR(100),
    "status" "MachineStatus" NOT NULL DEFAULT 'OPERATIONAL',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_identifier_history" (
    "id" UUID NOT NULL,
    "machine_id" UUID NOT NULL,
    "identifier_type" "IdentifierType" NOT NULL,
    "old_value" VARCHAR(255),
    "new_value" VARCHAR(255) NOT NULL,
    "change_reason" TEXT,
    "changed_by" VARCHAR(255) NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "machine_identifier_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cassette_types" (
    "id" UUID NOT NULL,
    "type_code" "CassetteTypeCode" NOT NULL,
    "machine_type" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cassette_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cassettes" (
    "id" UUID NOT NULL,
    "serial_number" VARCHAR(100) NOT NULL,
    "cassette_type_id" UUID NOT NULL,
    "customer_bank_id" UUID NOT NULL,
    "status" "CassetteStatus" NOT NULL DEFAULT 'OK',
    "usage_type" "CassetteUsageType",
    "machine_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cassettes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_tickets" (
    "id" UUID NOT NULL,
    "cassette_id" UUID NOT NULL,
    "reported_issue" TEXT NOT NULL,
    "received_at_rc" TIMESTAMP(3) NOT NULL,
    "repaired_by" UUID,
    "repair_action_taken" TEXT,
    "parts_replaced" JSONB,
    "qc_passed" BOOLEAN,
    "completed_at" TIMESTAMP(3),
    "status" "RepairTicketStatus" NOT NULL DEFAULT 'RECEIVED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repair_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_tickets" (
    "id" UUID NOT NULL,
    "ticket_number" VARCHAR(50) NOT NULL,
    "cassette_id" UUID,
    "machine_id" UUID,
    "reported_by" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "ProblemTicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ProblemTicketStatus" NOT NULL DEFAULT 'OPEN',
    "affected_components" JSONB,
    "resolution_notes" TEXT,
    "wsid" VARCHAR(100),
    "error_code" VARCHAR(50),
    "delivery_method" VARCHAR(50),
    "courier_service" VARCHAR(255),
    "tracking_number" VARCHAR(100),
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_cassette_details" (
    "id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "cassette_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "ProblemTicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "affected_components" JSONB,
    "wsid" VARCHAR(100),
    "error_code" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_cassette_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cassette_deliveries" (
    "id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "cassette_id" UUID NOT NULL,
    "sent_by" UUID NOT NULL,
    "shipped_date" TIMESTAMP(3) NOT NULL,
    "courier_service" VARCHAR(255),
    "tracking_number" VARCHAR(100),
    "estimated_arrival" TIMESTAMP(3),
    "received_at_rc" TIMESTAMP(3),
    "received_by" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sender_address" TEXT,
    "sender_city" VARCHAR(100),
    "sender_contact_name" VARCHAR(255),
    "sender_contact_phone" VARCHAR(50),
    "sender_postal_code" VARCHAR(20),
    "sender_province" VARCHAR(100),
    "use_office_address" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "cassette_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cassette_returns" (
    "id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "cassette_id" UUID NOT NULL,
    "sent_by" UUID NOT NULL,
    "shipped_date" TIMESTAMP(3) NOT NULL,
    "courier_service" VARCHAR(255),
    "tracking_number" VARCHAR(100),
    "estimated_arrival" TIMESTAMP(3),
    "received_at_pengelola" TIMESTAMP(3),
    "received_by" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cassette_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preventive_maintenances" (
    "id" UUID NOT NULL,
    "pm_number" VARCHAR(50) NOT NULL,
    "type" "PreventiveMaintenanceType" NOT NULL DEFAULT 'ROUTINE',
    "location" "PreventiveMaintenanceLocation" NOT NULL DEFAULT 'PENGELOLA_LOCATION',
    "status" "PreventiveMaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "scheduled_time" VARCHAR(10),
    "actual_start_date" TIMESTAMP(3),
    "actual_end_date" TIMESTAMP(3),
    "duration" INTEGER,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "checklist" JSONB,
    "findings" TEXT,
    "actions_taken" TEXT,
    "parts_replaced" JSONB,
    "recommendations" TEXT,
    "next_pm_date" TIMESTAMP(3),
    "next_pm_interval" INTEGER,
    "assigned_engineer" UUID,
    "requested_by_pengelola" UUID,
    "requested_by_hitachi" UUID,
    "requested_by_type" VARCHAR(20),
    "contact_name" VARCHAR(255),
    "contact_phone" VARCHAR(50),
    "location_address" TEXT,
    "location_city" VARCHAR(100),
    "location_province" VARCHAR(100),
    "location_postal_code" VARCHAR(20),
    "notes" TEXT,
    "cancelled_reason" TEXT,
    "cancelled_by" UUID,
    "cancelled_at" TIMESTAMP(3),
    "completed_by" UUID,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preventive_maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_cassette_details" (
    "id" UUID NOT NULL,
    "pm_id" UUID NOT NULL,
    "cassette_id" UUID NOT NULL,
    "checklist" JSONB,
    "findings" TEXT,
    "actions_taken" TEXT,
    "parts_replaced" JSONB,
    "status" VARCHAR(50),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_cassette_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_banks_bank_code_key" ON "customers_banks"("bank_code");

-- CreateIndex
CREATE UNIQUE INDEX "pengelola_pengelola_code_key" ON "pengelola"("pengelola_code");

-- CreateIndex
CREATE UNIQUE INDEX "bank_pengelola_assignments_customer_bank_id_pengelola_id_key" ON "bank_pengelola_assignments"("customer_bank_id", "pengelola_id");

-- CreateIndex
CREATE UNIQUE INDEX "pengelola_users_username_key" ON "pengelola_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "pengelola_users_email_key" ON "pengelola_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hitachi_users_username_key" ON "hitachi_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "hitachi_users_email_key" ON "hitachi_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "machines_machine_code_key" ON "machines"("machine_code");

-- CreateIndex
CREATE UNIQUE INDEX "cassette_types_type_code_key" ON "cassette_types"("type_code");

-- CreateIndex
CREATE UNIQUE INDEX "cassettes_serial_number_key" ON "cassettes"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "problem_tickets_ticket_number_key" ON "problem_tickets"("ticket_number");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_cassette_details_ticket_id_cassette_id_key" ON "ticket_cassette_details"("ticket_id", "cassette_id");

-- CreateIndex
CREATE UNIQUE INDEX "cassette_deliveries_ticket_id_key" ON "cassette_deliveries"("ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "cassette_returns_ticket_id_key" ON "cassette_returns"("ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "preventive_maintenances_pm_number_key" ON "preventive_maintenances"("pm_number");

-- CreateIndex
CREATE UNIQUE INDEX "pm_cassette_details_pm_id_cassette_id_key" ON "pm_cassette_details"("pm_id", "cassette_id");

-- AddForeignKey
ALTER TABLE "bank_pengelola_assignments" ADD CONSTRAINT "bank_pengelola_assignments_customer_bank_id_fkey" FOREIGN KEY ("customer_bank_id") REFERENCES "customers_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_pengelola_assignments" ADD CONSTRAINT "bank_pengelola_assignments_pengelola_id_fkey" FOREIGN KEY ("pengelola_id") REFERENCES "pengelola"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengelola_users" ADD CONSTRAINT "pengelola_users_pengelola_id_fkey" FOREIGN KEY ("pengelola_id") REFERENCES "pengelola"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_customer_bank_id_fkey" FOREIGN KEY ("customer_bank_id") REFERENCES "customers_banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_pengelola_id_fkey" FOREIGN KEY ("pengelola_id") REFERENCES "pengelola"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_identifier_history" ADD CONSTRAINT "machine_identifier_history_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cassettes" ADD CONSTRAINT "cassettes_cassette_type_id_fkey" FOREIGN KEY ("cassette_type_id") REFERENCES "cassette_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cassettes" ADD CONSTRAINT "cassettes_customer_bank_id_fkey" FOREIGN KEY ("customer_bank_id") REFERENCES "customers_banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cassettes" ADD CONSTRAINT "cassettes_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_cassette_id_fkey" FOREIGN KEY ("cassette_id") REFERENCES "cassettes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_repaired_by_fkey" FOREIGN KEY ("repaired_by") REFERENCES "hitachi_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_tickets" ADD CONSTRAINT "problem_tickets_cassette_id_fkey" FOREIGN KEY ("cassette_id") REFERENCES "cassettes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_tickets" ADD CONSTRAINT "problem_tickets_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_tickets" ADD CONSTRAINT "problem_tickets_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "pengelola_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_cassette_details" ADD CONSTRAINT "ticket_cassette_details_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "problem_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_cassette_details" ADD CONSTRAINT "ticket_cassette_details_cassette_id_fkey" FOREIGN KEY ("cassette_id") REFERENCES "cassettes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cassette_deliveries" ADD CONSTRAINT "cassette_deliveries_cassette_id_fkey" FOREIGN KEY ("cassette_id") REFERENCES "cassettes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cassette_deliveries" ADD CONSTRAINT "cassette_deliveries_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "hitachi_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cassette_deliveries" ADD CONSTRAINT "cassette_deliveries_sent_by_fkey" FOREIGN KEY ("sent_by") REFERENCES "pengelola_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cassette_deliveries" ADD CONSTRAINT "cassette_deliveries_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "problem_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cassette_returns" ADD CONSTRAINT "cassette_returns_cassette_id_fkey" FOREIGN KEY ("cassette_id") REFERENCES "cassettes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cassette_returns" ADD CONSTRAINT "cassette_returns_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "pengelola_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cassette_returns" ADD CONSTRAINT "cassette_returns_sent_by_fkey" FOREIGN KEY ("sent_by") REFERENCES "hitachi_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cassette_returns" ADD CONSTRAINT "cassette_returns_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "problem_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preventive_maintenances" ADD CONSTRAINT "preventive_maintenances_assigned_engineer_fkey" FOREIGN KEY ("assigned_engineer") REFERENCES "hitachi_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preventive_maintenances" ADD CONSTRAINT "preventive_maintenances_requested_by_pengelola_fkey" FOREIGN KEY ("requested_by_pengelola") REFERENCES "pengelola_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preventive_maintenances" ADD CONSTRAINT "preventive_maintenances_requested_by_hitachi_fkey" FOREIGN KEY ("requested_by_hitachi") REFERENCES "hitachi_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preventive_maintenances" ADD CONSTRAINT "preventive_maintenances_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "hitachi_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preventive_maintenances" ADD CONSTRAINT "preventive_maintenances_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "hitachi_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_cassette_details" ADD CONSTRAINT "pm_cassette_details_pm_id_fkey" FOREIGN KEY ("pm_id") REFERENCES "preventive_maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_cassette_details" ADD CONSTRAINT "pm_cassette_details_cassette_id_fkey" FOREIGN KEY ("cassette_id") REFERENCES "cassettes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
