---
status: active
generated: 2026-02-01
agents:
  - type: "database-specialist"
    role: "Corrigir políticas RLS e funções auxiliares no Supabase"
  - type: "backend-specialist"
    role: "Ajustar integração Clerk-Supabase JWT"
  - type: "security-auditor"
    role: "Validar políticas de segurança RLS"
phases:
  - id: "phase-1"
    name: "Diagnóstico - Problema de autenticação 401"
    prevc: "P"
  - id: "phase-2"
    name: "Correção das políticas RLS"
    prevc: "E"
  - id: "phase-3"
    name: "Validação"
    prevc: "V"
---

# Corrigir Autenticação Supabase e Políticas RLS

> **Problema reportado:** Ao entrar no Mastodonte, nenhum cliente ou tarefa aparece para o usuário Rafael Bernardino (admin).

## Diagnóstico Completo

### Evidência dos Logs do Supabase

**TODAS as requisições da API retornam `401 Unauthorized`:**

```
GET  | 401 | /rest/v1/clients?select=*,owner:users!owner_id(id,name)...
GET  | 401 | /rest/v1/tasks?select=*,task_assignees(...)...
POST | 401 | /rest/v1/tasks?select=id
POST | 401 | /rest/v1/clients?select=*...
DELETE | 401 | /rest/v1/tasks?id=eq.temp-...
```

### Causa Raiz Identificada

O problema **NÃO é RLS** - é **autenticação JWT**. O token JWT do Clerk está sendo **rejeitado** pelo PostgREST do Supabase antes mesmo das políticas RLS serem avaliadas.

### Fluxo Atual (Quebrado)

```
1. Clerk gera JWT com template 'supabase' → getToken({ template: 'supabase' })
2. Token injetado no header Authorization: Bearer ${clerkToken}
3. PostgREST recebe o token → REJEITA com 401
4. Nenhum dado retorna
```

### Possíveis Causas do 401

1. **Template JWT 'supabase' não existe no Clerk** → `getToken()` retorna `null`
2. **JWT Secret do Supabase não configurado no Clerk** → Token assinado com chave errada
3. **Claim `role` ausente no JWT** → PostgREST não consegue determinar o role
4. **JWT Secret alterado no Supabase** → Incompatibilidade com configuração do Clerk

### Estado Atual dos Dados

| Recurso | Quantidade | Proprietário |
|---------|-----------|-------------|
| Users | 2 (Rafael=admin, Tayane=alocador) | - |
| Clients | 8 | 7 com owner_id=1 (Rafael) |
| Tasks | 12 | Todos com creator_id=1 (Rafael) |

### Estado Atual das Políticas RLS

As políticas **existem e estão logicamente corretas**, mas não estão sendo alcançadas por causa do 401:

| Tabela | RLS Ativo | Políticas |
|--------|-----------|-----------|
| clients | ✅ | select, insert, update, delete |
| tasks | ✅ | select, insert, update, delete |
| users | ✅ | select, update_admin, update_self |
| groups | ✅ | select, insert, update, delete |
| task_assignees | ✅ | select, insert, update, delete |
| task_history | ✅ | select, insert, delete |
| whatsapp_groups | ✅ | select, insert, update, delete |
| meetings | ❌ | Nenhuma |

### Funções Auxiliares RLS (Existentes)

```sql
-- Extrai ID interno do usuário a partir do JWT do Clerk
clerk_user_id() → SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'

-- Verifica se é admin
is_admin() → SELECT 'administrador' = ANY(roles) FROM users WHERE clerk_id = auth.jwt()->>'sub'

-- Obtém group_id do usuário
user_group_id() → SELECT group_id FROM users WHERE clerk_id = auth.jwt()->>'sub'
```

### Problemas Secundários nas Políticas (para corrigir depois da auth)

1. **Políticas aplicadas a `PUBLIC`** em vez de `authenticated` - permite que requests anônimos tentem avaliar as policies
2. **`tasks_select` usa `true`** - correto para colaboração, mas deveria ser `TO authenticated`
3. **`task_assignees` todas com `true`** - sem restrição nenhuma, nem autenticação

---

## Plano de Ação

### Fase 1 — Verificar e Corrigir Autenticação JWT

**Objetivo:** Garantir que o token Clerk é aceito pelo Supabase PostgREST.

**Passos:**

1. **Verificar configuração do JWT Template no Clerk**
   - Acessar Clerk Dashboard → JWT Templates
   - Verificar se template "supabase" existe
   - Se não existir, criar com:
     ```json
     {
       "sub": "{{user.id}}",
       "role": "authenticated",
       "iss": "https://[sua-app].clerk.accounts.dev",
       "aud": "authenticated"
     }
     ```
   - **Signing Key**: Deve ser o **JWT Secret** do Supabase (Settings → API → JWT Secret)

2. **Verificar JWT Secret do Supabase**
   - Supabase Dashboard → Settings → API → JWT Secret
   - Copiar o secret e configurar no Clerk JWT Template como signing algorithm HS256

3. **Testar token manualmente**
   - No frontend, adicionar log temporário:
     ```typescript
     const token = await getToken({ template: 'supabase' })
     console.log('Clerk token:', token ? 'exists' : 'NULL')
     ```
   - Se `null`, o template não existe ou está mal configurado

### Fase 2 — Ajustar Políticas RLS para Segurança

**Objetivo:** Restringir políticas ao role `authenticated` e corrigir edge cases.

**Migration SQL a aplicar:**

```sql
-- =============================================
-- Fase 2: Recriar políticas com TO authenticated
-- =============================================

-- USERS
DROP POLICY IF EXISTS "users_select" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;
DROP POLICY IF EXISTS "users_update_self" ON users;

CREATE POLICY "users_select" ON users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "users_update_admin" ON users
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "users_update_self" ON users
  FOR UPDATE TO authenticated
  USING (clerk_id = auth.jwt()->>'sub')
  WITH CHECK (clerk_id = auth.jwt()->>'sub');

-- GROUPS
DROP POLICY IF EXISTS "groups_select" ON groups;
DROP POLICY IF EXISTS "groups_insert" ON groups;
DROP POLICY IF EXISTS "groups_update" ON groups;
DROP POLICY IF EXISTS "groups_delete" ON groups;

CREATE POLICY "groups_select" ON groups
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "groups_insert" ON groups
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "groups_update" ON groups
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "groups_delete" ON groups
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- CLIENTS
DROP POLICY IF EXISTS "clients_select" ON clients;
DROP POLICY IF EXISTS "clients_insert" ON clients;
DROP POLICY IF EXISTS "clients_update" ON clients;
DROP POLICY IF EXISTS "clients_delete" ON clients;

CREATE POLICY "clients_select" ON clients
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR owner_id = public.clerk_user_id()
    OR (
      public.user_group_id() IS NOT NULL
      AND owner_id IN (
        SELECT id FROM users WHERE group_id = public.user_group_id()
      )
    )
  );

CREATE POLICY "clients_insert" ON clients
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = public.clerk_user_id());

CREATE POLICY "clients_update" ON clients
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR owner_id = public.clerk_user_id()
    OR (
      public.user_group_id() IS NOT NULL
      AND owner_id IN (
        SELECT id FROM users WHERE group_id = public.user_group_id()
      )
    )
  );

CREATE POLICY "clients_delete" ON clients
  FOR DELETE TO authenticated
  USING (public.is_admin() OR owner_id = public.clerk_user_id());

-- TASKS
DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_insert" ON tasks;
DROP POLICY IF EXISTS "tasks_update" ON tasks;
DROP POLICY IF EXISTS "tasks_delete" ON tasks;

CREATE POLICY "tasks_select" ON tasks
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "tasks_insert" ON tasks
  FOR INSERT TO authenticated
  WITH CHECK (creator_id = public.clerk_user_id());

CREATE POLICY "tasks_update" ON tasks
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "tasks_delete" ON tasks
  FOR DELETE TO authenticated
  USING (public.is_admin() OR creator_id = public.clerk_user_id());

-- TASK_ASSIGNEES
DROP POLICY IF EXISTS "task_assignees_select" ON task_assignees;
DROP POLICY IF EXISTS "task_assignees_insert" ON task_assignees;
DROP POLICY IF EXISTS "task_assignees_update" ON task_assignees;
DROP POLICY IF EXISTS "task_assignees_delete" ON task_assignees;

CREATE POLICY "task_assignees_select" ON task_assignees
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "task_assignees_insert" ON task_assignees
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "task_assignees_update" ON task_assignees
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "task_assignees_delete" ON task_assignees
  FOR DELETE TO authenticated
  USING (true);

-- TASK_HISTORY
DROP POLICY IF EXISTS "task_history_select" ON task_history;
DROP POLICY IF EXISTS "task_history_insert" ON task_history;
DROP POLICY IF EXISTS "task_history_delete" ON task_history;

CREATE POLICY "task_history_select" ON task_history
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "task_history_insert" ON task_history
  FOR INSERT TO authenticated
  WITH CHECK (author_id = public.clerk_user_id());

CREATE POLICY "task_history_delete" ON task_history
  FOR DELETE TO authenticated
  USING (author_id = public.clerk_user_id() OR public.is_admin());

-- WHATSAPP_GROUPS
DROP POLICY IF EXISTS "whatsapp_groups_select" ON whatsapp_groups;
DROP POLICY IF EXISTS "whatsapp_groups_insert" ON whatsapp_groups;
DROP POLICY IF EXISTS "whatsapp_groups_update" ON whatsapp_groups;
DROP POLICY IF EXISTS "whatsapp_groups_delete" ON whatsapp_groups;

CREATE POLICY "whatsapp_groups_select" ON whatsapp_groups
  FOR SELECT TO authenticated
  USING (client_id IN (SELECT id FROM clients));

CREATE POLICY "whatsapp_groups_insert" ON whatsapp_groups
  FOR INSERT TO authenticated
  WITH CHECK (client_id IN (SELECT id FROM clients));

CREATE POLICY "whatsapp_groups_update" ON whatsapp_groups
  FOR UPDATE TO authenticated
  USING (client_id IN (SELECT id FROM clients));

CREATE POLICY "whatsapp_groups_delete" ON whatsapp_groups
  FOR DELETE TO authenticated
  USING (client_id IN (SELECT id FROM clients));
```

### Fase 3 — Validação

**Passos:**

1. Fazer login com Rafael Bernardino (admin)
2. Verificar que clientes aparecem (todos os 8)
3. Verificar que tarefas aparecem (todas as 12)
4. Testar criação de novo cliente
5. Testar criação de nova tarefa
6. Fazer login com Tayane (alocador) - verificar acesso limitado
7. Verificar logs do Supabase - devem retornar 200

## Critérios de Sucesso

- [ ] Requisições ao Supabase retornam 200 (não 401)
- [ ] Admin vê todos os clientes e tarefas
- [ ] Políticas RLS restritas ao role `authenticated`
- [ ] Usuário não-admin vê apenas dados permitidos
- [ ] INSERT de clientes e tarefas funciona corretamente
