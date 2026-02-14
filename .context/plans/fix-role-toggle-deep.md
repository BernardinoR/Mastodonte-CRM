---
status: filled
generated: 2026-02-14
---

# Fix: Role Toggle no Context Menu - Analise Profunda

## Resumo do Problema

Ao clicar com botao direito no user card da sidebar e selecionar uma role (ex: "Consultor"), a role nao muda. O context menu abre corretamente, mas a acao nao surte efeito visivel.

## Rastreamento Completo do Fluxo

```
1. User right-click → ContextMenu abre
2. User seleciona "Consultor" → onSelect handler dispara
3. switchRoleMutation.mutate("consultor") → PATCH /api/users/active-role
4. Backend: valida role, chama storage.updateUser(id, { activeRole })
5. Prisma: UPDATE users SET active_role = 'consultor' WHERE id = X
6. On success: queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] })
7. React Query: refetch GET /api/auth/me
8. Backend: storage.getUserByClerkId(userId) retorna user com activeRole atualizado
9. Frontend: currentUserData atualiza → displayedRole recalcula → badge muda
10. ClientsContext: activeRole muda → useEffect re-executa → fetchClients() do Supabase
11. Supabase RLS: is_admin() checa active_role → filtra clientes conforme role ativa
```

## Causas Raiz Identificadas (4 issues)

### Issue 1: onClick vs onSelect no Radix UI (JA CORRIGIDO)

**Arquivo:** `client/src/app/components/AppSidebar.tsx:216,239`
**Status:** Ja corrigido nesta sessao.

O ContextMenuItem do Radix UI usa onSelect como handler principal. O onClick eh um evento DOM nativo que o Radix pode engolir durante o ciclo de fechamento do menu.

### Issue 2: Mutation sem tratamento de erro (CRITICO)

**Arquivo:** `client/src/app/components/AppSidebar.tsx:75-92`

A mutation NAO tem onError callback. Se a chamada falhar (token expirado, migration nao aplicada, rede), o erro eh engolido silenciosamente. O usuario nao recebe feedback nenhum.

**Fix:** Adicionar onError com console.error para diagnostico.

### Issue 3: Migration pode nao ter sido aplicada ao banco (POTENCIAL)

**Arquivo:** `prisma/migrations/20260214_add_active_role/migration.sql`

A migration esta como ?? (untracked) no git status. Ela faz duas coisas:

1. ALTER TABLE users ADD COLUMN IF NOT EXISTS active_role TEXT DEFAULT NULL
2. CREATE OR REPLACE FUNCTION public.is_admin() — versao atualizada que checa active_role

Se a migration NAO foi aplicada:
- A coluna active_role nao existe → prisma.user.update({ activeRole }) falha
- storage.updateUser retorna null (catch silencioso)
- Backend retorna 404 "User not found"
- Frontend mutation faz throw → onSuccess NAO dispara → nada muda na UI

### Issue 4: fetchClients nao faz re-fetch efetivo (DESIGN ISSUE)

**Arquivo:** `client/src/features/clients/contexts/ClientsContext.tsx:327-374`

A filtragem depende INTEIRAMENTE do Supabase RLS. Se o RLS is_admin() nao foi atualizado (Issue 3), trocar role nao muda nada na lista de clientes.

## Plano de Correcao

### Fase 1: Adicionar tratamento de erro na mutation (AppSidebar.tsx)

- Adicionar onError callback com console.error
- Adicionar estado isPending visual no badge para feedback

### Fase 2: Garantir que a migration foi aplicada

- Verificar e aplicar a migration 20260214_add_active_role ao banco
- npx prisma migrate deploy ou aplicar manualmente via SQL

### Fase 3: Invalidar queries adicionais no onSuccess

- Alem de invalidar /api/auth/me, garantir que clientes re-fetcham
