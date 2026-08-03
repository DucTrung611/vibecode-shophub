-- AlterTable
-- password_hash becomes nullable (Google-only accounts have no password);
-- google_id is added as a nullable unique column linking a user to their Google account.
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;
ALTER TABLE "users" ADD COLUMN "google_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
