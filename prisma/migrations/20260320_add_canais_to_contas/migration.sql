-- AlterTable
ALTER TABLE "contas" ADD COLUMN "canais" TEXT[] DEFAULT ARRAY['WhatsApp', 'Email']::TEXT[];
