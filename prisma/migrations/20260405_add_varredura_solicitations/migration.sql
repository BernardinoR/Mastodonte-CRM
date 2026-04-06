-- CreateTable
CREATE TABLE "varredura_solicitations" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "conta_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "varredura_solicitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "varredura_solicitations_user_id_conta_id_date_key" ON "varredura_solicitations"("user_id", "conta_id", "date");

-- AddForeignKey
ALTER TABLE "varredura_solicitations" ADD CONSTRAINT "varredura_solicitations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "varredura_solicitations" ADD CONSTRAINT "varredura_solicitations_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "contas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS
ALTER TABLE "varredura_solicitations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "varredura_solicitations_select" ON "varredura_solicitations"
  FOR SELECT TO authenticated
  USING ("user_id" = public.clerk_user_id() OR public.is_admin());

CREATE POLICY "varredura_solicitations_insert" ON "varredura_solicitations"
  FOR INSERT TO authenticated
  WITH CHECK ("user_id" = public.clerk_user_id());

CREATE POLICY "varredura_solicitations_delete" ON "varredura_solicitations"
  FOR DELETE TO authenticated
  USING ("user_id" = public.clerk_user_id() OR public.is_admin());
