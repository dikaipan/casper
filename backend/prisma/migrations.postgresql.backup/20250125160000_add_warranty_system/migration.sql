-- CreateEnum
CREATE TYPE "WarrantyType" AS ENUM ('MA', 'MS', 'IN_WARRANTY', 'OUT_WARRANTY');

-- CreateTable
CREATE TABLE "warranty_configurations" (
    "id" UUID NOT NULL,
    "customer_bank_id" UUID NOT NULL,
    "warranty_type" "WarrantyType" NOT NULL,
    "warranty_period_days" INTEGER NOT NULL,
    "max_warranty_claims" INTEGER DEFAULT 1,
    "warranty_extension_days" INTEGER,
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "auto_approve_first_claim" BOOLEAN NOT NULL DEFAULT true,
    "free_repair_on_warranty" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warranty_configurations_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "repair_tickets" ADD COLUMN     "warranty_type" "WarrantyType",
ADD COLUMN     "warranty_period_days" INTEGER,
ADD COLUMN     "warranty_start_date" TIMESTAMP(3),
ADD COLUMN     "warranty_end_date" TIMESTAMP(3),
ADD COLUMN     "warranty_claimed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "warranty_claim_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_warranty_repair" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "original_repair_id" UUID,
ADD COLUMN     "warranty_claim_reason" TEXT;

-- CreateIndex
CREATE INDEX "warranty_configurations_customer_bank_id_idx" ON "warranty_configurations"("customer_bank_id");

-- CreateIndex
CREATE INDEX "warranty_configurations_warranty_type_idx" ON "warranty_configurations"("warranty_type");

-- CreateIndex
CREATE INDEX "warranty_configurations_is_active_idx" ON "warranty_configurations"("is_active");

-- CreateIndex
CREATE INDEX "repair_tickets_warranty_type_idx" ON "repair_tickets"("warranty_type");

-- CreateIndex
CREATE INDEX "repair_tickets_warranty_end_date_idx" ON "repair_tickets"("warranty_end_date");

-- CreateIndex
CREATE INDEX "repair_tickets_is_warranty_repair_idx" ON "repair_tickets"("is_warranty_repair");

-- CreateIndex
CREATE INDEX "repair_tickets_original_repair_id_idx" ON "repair_tickets"("original_repair_id");

-- CreateUniqueConstraint
CREATE UNIQUE INDEX "warranty_configurations_customer_bank_id_warranty_type_key" ON "warranty_configurations"("customer_bank_id", "warranty_type");

-- AddForeignKey
ALTER TABLE "warranty_configurations" ADD CONSTRAINT "warranty_configurations_customer_bank_id_fkey" FOREIGN KEY ("customer_bank_id") REFERENCES "customers_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_original_repair_id_fkey" FOREIGN KEY ("original_repair_id") REFERENCES "repair_tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

