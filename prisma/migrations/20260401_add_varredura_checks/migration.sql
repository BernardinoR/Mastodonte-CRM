-- CreateTable
CREATE TABLE "varredura_checks" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "varredura_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "varredura_checks_user_id_institution_id_date_key" ON "varredura_checks"("user_id", "institution_id", "date");

-- AddForeignKey
ALTER TABLE "varredura_checks" ADD CONSTRAINT "varredura_checks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "varredura_checks" ADD CONSTRAINT "varredura_checks_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS
ALTER TABLE "varredura_checks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "varredura_checks_select" ON "varredura_checks"
  FOR SELECT TO authenticated
  USING ("user_id" = public.clerk_user_id() OR public.is_admin());

CREATE POLICY "varredura_checks_insert" ON "varredura_checks"
  FOR INSERT TO authenticated
  WITH CHECK ("user_id" = public.clerk_user_id());

CREATE POLICY "varredura_checks_delete" ON "varredura_checks"
  FOR DELETE TO authenticated
  USING ("user_id" = public.clerk_user_id() OR public.is_admin());
