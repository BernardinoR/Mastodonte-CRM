-- Atualiza todos os ExtratoStatus "Pendente" de contas "Automático" para "Recebido"
UPDATE "extrato_statuses"
SET
  status = 'Recebido',
  "received_at" = NOW(),
  "updated_at" = NOW()
WHERE
  "conta_id" IN (SELECT id FROM "contas" WHERE type = 'Automático')
  AND status = 'Pendente';
