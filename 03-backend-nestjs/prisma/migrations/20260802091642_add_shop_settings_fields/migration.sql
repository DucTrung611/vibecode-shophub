-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "banner_url" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "detail_address" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "notification_settings" JSONB,
ADD COLUMN     "payment_settings" JSONB,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "shipping_settings" JSONB,
ADD COLUMN     "ward" TEXT;
