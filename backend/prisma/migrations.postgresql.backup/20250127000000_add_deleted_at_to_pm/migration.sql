-- AlterTable
ALTER TABLE "preventive_maintenances" ADD COLUMN "deleted_at" TIMESTAMP(3),
ADD COLUMN "deleted_by" UUID;

-- AddForeignKey
ALTER TABLE "preventive_maintenances" ADD CONSTRAINT "preventive_maintenances_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "hitachi_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "preventive_maintenances_deleted_at_idx" ON "preventive_maintenances"("deleted_at");

