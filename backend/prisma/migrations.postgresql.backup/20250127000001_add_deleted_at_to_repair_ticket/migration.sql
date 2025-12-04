-- AlterTable
ALTER TABLE "repair_tickets" ADD COLUMN "deleted_at" TIMESTAMP(3),
ADD COLUMN "deleted_by" UUID;

-- AddForeignKey
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "hitachi_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "repair_tickets_deleted_at_idx" ON "repair_tickets"("deleted_at");

