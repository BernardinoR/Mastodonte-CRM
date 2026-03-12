-- CreateEnum
CREATE TYPE "Moeda" AS ENUM ('Real', 'Dolar', 'Euro');

-- CreateTable
CREATE TABLE "institutions" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "currency" "Moeda" NOT NULL DEFAULT 'Real',
  "attachment_count" INTEGER NOT NULL DEFAULT 1,
  "reference_file" TEXT
);

-- Seed institutions from existing data
INSERT INTO "institutions" ("name")
SELECT DISTINCT "institution" FROM "contas";

-- Add institution_id column and populate from existing data
ALTER TABLE "contas" ADD COLUMN "institution_id" INTEGER;
UPDATE "contas" SET "institution_id" = i."id" FROM "institutions" i WHERE "contas"."institution" = i."name";
ALTER TABLE "contas" ALTER COLUMN "institution_id" SET NOT NULL;

-- Drop old column and add FK constraint
ALTER TABLE "contas" DROP COLUMN "institution";
ALTER TABLE "contas" ADD CONSTRAINT "contas_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed all known institutions (ON CONFLICT for any already inserted from contas)
INSERT INTO "institutions" ("name") VALUES
  ('Avenue'), ('BB'), ('Bradesco'), ('BTG'), ('C6'), ('Fidelity'),
  ('IB'), ('Itaú'), ('Santander'), ('Smart'), ('Toro'), ('Warren'), ('XP')
ON CONFLICT ("name") DO NOTHING;

-- RLS: read-only for authenticated users (managed by developer, no insert/update/delete via client)
ALTER TABLE "institutions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "institutions_select" ON "institutions" FOR SELECT TO authenticated USING (true);
