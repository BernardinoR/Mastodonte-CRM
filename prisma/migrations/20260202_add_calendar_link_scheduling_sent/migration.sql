-- AlterTable: Add calendar_link to users
ALTER TABLE "users" ADD COLUMN "calendar_link" TEXT;

-- AlterTable: Add scheduling_message_sent_at to clients
ALTER TABLE "clients" ADD COLUMN "scheduling_message_sent_at" TIMESTAMP(3);
