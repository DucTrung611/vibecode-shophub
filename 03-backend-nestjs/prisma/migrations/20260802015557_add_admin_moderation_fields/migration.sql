-- CreateEnum
CREATE TYPE "moderation_action" AS ENUM ('approve', 'request_changes', 'remove');

-- AlterEnum
ALTER TYPE "product_status" ADD VALUE 'flagged';

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "commission_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "flag_reason" TEXT,
ADD COLUMN     "moderated_at" TIMESTAMP(3),
ADD COLUMN     "moderated_by" INTEGER;

-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "business_license_url" TEXT,
ADD COLUMN     "documents" JSONB,
ADD COLUMN     "rejection_reason" TEXT;

-- CreateTable
CREATE TABLE "product_moderation_logs" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "action" "moderation_action" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_moderation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_moderation_logs_product" ON "product_moderation_logs"("product_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_moderated_by_fkey" FOREIGN KEY ("moderated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_moderation_logs" ADD CONSTRAINT "product_moderation_logs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_moderation_logs" ADD CONSTRAINT "product_moderation_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
