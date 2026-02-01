---
status: draft
generated: 2026-02-01
agents:
  - type: "backend-specialist"
    role: "Criar RLS policies e migrar rotas Express para Supabase direto"
  - type: "frontend-specialist"
    role: "Substituir apiRequest por Supabase client + optimistic updates"
  - type: "database-specialist"
    role: "RLS policies, indexes, e Clerk JWT integration no Supabase"
  - type: "test-writer"
    role: "Testes de regressao e validacao de seguranca RLS"
docs:
  - "architecture.md"
  - "data-flow.md"
  - "security.md"
  - "development-workflow.md"
phases:
  - id: "phase-1"
    name: "Infraestrutura (Clerk JWT + RLS + Supabase Client)"
    prevc: "E"
  - id: "phase-2"
    name: "Migrar rotas CRUD para Supabase direto"
    prevc: "E"
  - id: "phase-3"
    name: "Limpar Express + Validacao"
    prevc: "V"
---

# Migrar CRUD para Supabase Direto - Eliminar Delay de Express

> O banco ja esta no Supabase. O Express adiciona ~150-250ms de overhead em 84% das rotas que sao CRUD puro. Migrar essas rotas para chamadas diretas do browser ao Supabase via RLS elimina esse overhead.

## Task Snapshot
- **Primary goal:** Eliminar o middleware Express das operacoes CRUD, indo de ~300-600ms para ~80-120ms por operacao.
- **Success signal:** Criar/editar cliente e tarefas reflete na UI em <150ms. Express mantido apenas para 5 rotas com logica de negocio.

## Situacao Atual

### O que ja temos no Supabase
- PostgreSQL hospedado em `aws-1-sa-east-1.pooler.supabase.com`
- 8 tabelas: users, groups, clients, whatsapp_groups, meetings, tasks, task_assignees, task_history
- Conexao via Prisma ORM no Express

### O que NAO usamos do Supabase
- Supabase Auth (usamos Clerk)
- Supabase JS Client (browser → banco direto)
- Row Level Security (RLS)
- Realtime subscriptions
- Edge Functions

### Pipeline atual vs proposto
```
HOJE (84% das rotas):
  Browser → apiRequest → Express → Clerk verify → getUserByClerkId → checkAccess → Prisma → PostgreSQL
  ~300-600ms total

PROPOSTO:
  Browser → supabase.from('table').insert() → PostgreSQL (RLS verifica auth inline)
  ~80-120ms total
```

---

## Classificacao das Rotas

### Rotas que MIGRAM para Supabase direto (26 rotas)
| Grupo | Rotas | Operacao |
| --- | --- | --- |
| Clients | GET /api/clients, GET :id, POST, PATCH :id, DELETE :id | CRUD + access filter |
| Tasks | GET /api/tasks, GET :id, POST, PATCH :id, DELETE :id | CRUD |
| Tasks by Client | GET /api/clients/:id/tasks | Filtro por clientId |
| Task History | POST /api/tasks/:id/history, DELETE :eventId | CRUD |
| WhatsApp Groups | GET, POST, PATCH :id, DELETE :id | CRUD |
| Groups | GET, POST, PATCH :id, DELETE :id | CRUD |
| Users | GET /api/users, PATCH :id | CRUD (admin) |
| Profile | PATCH /api/auth/profile | Update proprio perfil |

### Rotas que FICAM no Express (5 rotas)
| Rota | Motivo |
| --- | --- |
| POST /api/auth/me | Logica de primeiro usuario + sync Clerk metadata |
| POST /api/auth/sync | Sync com Clerk SDK (chave secreta) |
| POST /api/invitations | Clerk Invitations API (chave secreta) |
| GET /api/users/team | Formatacao de dados + filtro de grupo |
| POST /api/validate-foundation | Webhook N8N externo |

---

## Plano de Migracao

### PHASE 1: Infraestrutura

#### 1.1 Configurar Clerk JWT no Supabase

Para que o Supabase aceite tokens do Clerk, precisamos configurar um JWT template no Clerk que o Supabase consiga verificar.

**No Clerk Dashboard:**
- Criar JWT Template "supabase" com claims:
```json
{
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "authenticated",
  "aud": "authenticated"
}
```
- Copiar o JWKS endpoint do Clerk

**No Supabase Dashboard:**
- Em Authentication > Settings > JWT Secret, configurar o JWT secret do Clerk
- Ou usar: Project Settings > API > JWT Secret (substituir pelo signing key do Clerk)

**Arquivo novo:** `client/src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper para setar o token do Clerk no client Supabase
export async function setSupabaseToken(getToken: () => Promise<string | null>) {
  const token = await getToken({ template: 'supabase' })
  if (token) {
    supabase.functions.setAuth(token)
    // Ou via global headers:
    supabase.realtime.setAuth(token)
  }
  return supabase
}
```

**Dependencia nova:** `npm install @supabase/supabase-js`

**Variaveis de ambiente novas:**
```
VITE_SUPABASE_URL=https://ypbjlsdhmrgoamkdhthj.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key do projeto Supabase>
```

---

#### 1.2 Criar RLS Policies

Habilitar RLS em todas as tabelas e criar policies que replicam a logica atual do `checkClientAccess` e `requireAdmin`.

**Funcao helper (SQL) - identificar usuario pelo Clerk ID:**
```sql
-- Funcao para extrair clerk_id do JWT e retornar o user
CREATE OR REPLACE FUNCTION auth.clerk_user_id()
RETURNS int AS $$
  SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Funcao para checar se usuario eh admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
  SELECT 'administrador' = ANY(roles)
  FROM users WHERE clerk_id = auth.jwt()->>'sub'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Funcao para pegar group_id do usuario
CREATE OR REPLACE FUNCTION auth.user_group_id()
RETURNS int AS $$
  SELECT group_id FROM users WHERE clerk_id = auth.jwt()->>'sub'
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

**RLS Policy: clients**
```sql
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- SELECT: admin ve tudo, usuario de grupo ve clientes do grupo, senao so os proprios
CREATE POLICY "clients_select" ON clients FOR SELECT USING (
  auth.is_admin()
  OR owner_id = auth.clerk_user_id()
  OR (
    auth.user_group_id() IS NOT NULL
    AND owner_id IN (
      SELECT id FROM users WHERE group_id = auth.user_group_id()
    )
  )
);

-- INSERT: qualquer autenticado, forcando owner_id = usuario atual
CREATE POLICY "clients_insert" ON clients FOR INSERT
  WITH CHECK (owner_id = auth.clerk_user_id());

-- UPDATE: mesma logica do select
CREATE POLICY "clients_update" ON clients FOR UPDATE USING (
  auth.is_admin()
  OR owner_id = auth.clerk_user_id()
  OR (
    auth.user_group_id() IS NOT NULL
    AND owner_id IN (
      SELECT id FROM users WHERE group_id = auth.user_group_id()
    )
  )
);

-- DELETE: mesma logica
CREATE POLICY "clients_delete" ON clients FOR DELETE USING (
  auth.is_admin()
  OR owner_id = auth.clerk_user_id()
);
```

**RLS Policy: tasks**
```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Todos autenticados podem ver tasks (filtro por client eh feito via client RLS + join)
CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (true);
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (
  creator_id = auth.clerk_user_id()
);
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (true);
CREATE POLICY "tasks_delete" ON tasks FOR DELETE USING (
  auth.is_admin() OR creator_id = auth.clerk_user_id()
);
```

**RLS Policy: task_assignees**
```sql
ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_assignees_all" ON task_assignees
  FOR ALL USING (true) WITH CHECK (true);
```

**RLS Policy: task_history**
```sql
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_history_select" ON task_history FOR SELECT USING (true);
CREATE POLICY "task_history_insert" ON task_history FOR INSERT
  WITH CHECK (author_id = auth.clerk_user_id());
CREATE POLICY "task_history_delete" ON task_history FOR DELETE USING (
  author_id = auth.clerk_user_id() OR auth.is_admin()
);
```

**RLS Policy: whatsapp_groups**
```sql
ALTER TABLE whatsapp_groups ENABLE ROW LEVEL SECURITY;
-- Acesso segue o acesso ao cliente (via FK)
CREATE POLICY "whatsapp_groups_all" ON whatsapp_groups
  FOR ALL USING (
    client_id IN (SELECT id FROM clients) -- RLS de clients ja filtra
  );
```

**RLS Policy: groups**
```sql
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "groups_select" ON groups FOR SELECT USING (true);
CREATE POLICY "groups_admin" ON groups FOR ALL USING (auth.is_admin());
```

**RLS Policy: users**
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select" ON users FOR SELECT USING (true);
CREATE POLICY "users_update" ON users FOR UPDATE USING (auth.is_admin());
```

---

#### 1.3 Adicionar Indexes (do plano anterior)

```sql
CREATE INDEX idx_clients_owner_id ON clients(owner_id);
CREATE INDEX idx_clients_active_created ON clients(is_active, created_at);
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_tasks_status_order ON tasks(status, "order");
CREATE INDEX idx_users_group_id ON users(group_id);
CREATE INDEX idx_task_assignees_task_id ON task_assignees(task_id);
```

---

#### 1.4 Trigger para auto-criar historico de task

Substituir a logica que hoje esta no Express (`createTask` em storage.ts):

```sql
CREATE OR REPLACE FUNCTION auto_create_task_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO task_history (id, task_id, type, content, author_id, created_at)
  VALUES (gen_random_uuid(), NEW.id, 'created', 'Task criada', NEW.creator_id, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_after_insert
  AFTER INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_task_history();
```

---

### PHASE 2: Migrar Rotas para Supabase Direto

#### 2.1 Criar hook `useSupabaseAuth`

Integra Clerk token com Supabase client:

```typescript
// client/src/shared/hooks/useSupabaseAuth.ts
import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useSupabaseAuth() {
  const { getToken, isSignedIn } = useAuth()

  useEffect(() => {
    if (!isSignedIn) return

    const syncToken = async () => {
      const token = await getToken({ template: 'supabase' })
      if (token) {
        await supabase.auth.setSession({
          access_token: token,
          refresh_token: '',
        })
      }
    }

    syncToken()
    // Refresh token periodicamente
    const interval = setInterval(syncToken, 50_000)
    return () => clearInterval(interval)
  }, [getToken, isSignedIn])

  return supabase
}
```

---

#### 2.2 Migrar ClientsContext (maior impacto no delay)

**Antes:**
```typescript
const response = await apiRequest("PATCH", `/api/clients/${clientId}`, updates, headers);
```

**Depois:**
```typescript
// Optimistic update + Supabase direto
const updateClientField = useCallback(async (clientId: string, updates: Partial<Client>) => {
  const previous = clients;
  // 1. UI atualiza IMEDIATAMENTE
  setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates } : c));

  // 2. Supabase direto (sem Express, sem middleware)
  const { error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', clientId);

  // 3. Rollback se falhar
  if (error) {
    setClients(previous);
    toast({ title: 'Erro ao salvar', variant: 'destructive' });
  }
}, [clients]);
```

**Rotas eliminadas:** GET/POST/PATCH/DELETE /api/clients, GET /api/clients/:id

---

#### 2.3 Migrar TasksContext

O `createTaskAndReturn` ja faz optimistic update. So precisa trocar o backend:

**Antes (syncTaskToApi):**
```typescript
const response = await fetch("/api/tasks", { method: "POST", body: JSON.stringify(data) });
```

**Depois:**
```typescript
const { data: created, error } = await supabase
  .from('tasks')
  .insert({
    title: data.title,
    priority: data.priority,
    status: data.status,
    due_date: data.dueDate,
    client_id: data.clientId,
    creator_id: currentUserId,
    order: data.order ?? 0,
  })
  .select('id')
  .single();

// Assignees separado (Supabase nao tem nested create)
if (created && data.assigneeIds?.length) {
  await supabase.from('task_assignees').insert(
    data.assigneeIds.map(userId => ({ task_id: created.id, user_id: userId }))
  );
}
// History criado automaticamente pelo trigger
```

**Rotas eliminadas:** GET/POST/PATCH/DELETE /api/tasks, GET /api/tasks/:id, GET /api/clients/:id/tasks

---

#### 2.4 Migrar Task History, WhatsApp Groups, Groups, Users

Mesmo padrao: substituir `apiRequest("POST", "/api/...")` por `supabase.from('table').insert/update/delete`.

**Ordem de migracao (por dependencia):**
1. Groups (sem FK complexa)
2. Users (admin only, RLS simples)
3. Clients (RLS mais complexa - testar bem)
4. WhatsApp Groups (depende de clients RLS)
5. Tasks (depende de clients)
6. Task Assignees (depende de tasks)
7. Task History (depende de tasks)

---

### PHASE 3: Limpar Express + Validacao

#### 3.1 Remover rotas migradas do Express

**Arquivo:** `server/routes.ts`
- Deletar handlers das 26 rotas migradas
- Manter apenas as 5 rotas server-side

**Arquivo:** `server/storage.ts`
- Manter apenas metodos usados pelas 5 rotas restantes:
  - `getUserByClerkId()`, `createUser()`, `updateUser()` (para auth/me e sync)
  - `getUsersByGroupId()`, `getUser()` (para users/team)
- Remover: `createClient`, `updateClient`, `deleteClient`, `createTask`, `updateTask`, etc.

#### 3.2 Remover dependencias nao usadas

Se todas as rotas CRUD forem migradas, avaliar remocao de:
- `@prisma/client` (se nenhuma rota restante usar Prisma)
- Ou manter Prisma apenas para as 5 rotas

#### 3.3 Validacao

1. **Testar RLS policies** - cada role (admin, consultor, alocador) com acesso correto
2. **Testar Clerk JWT no Supabase** - token valido, token expirado, sem token
3. **Medir latencia** - comparar antes/depois com request timing
4. **Testar rollback de optimistic updates** - simular falha de rede
5. **Verificar indexes** - `EXPLAIN ANALYZE` nas queries principais
6. **Security audit** - confirmar que RLS bloqueia acesso cross-tenant

---

## Matriz de Priorizacao

| Step | O que | Impacto no delay | Risco |
| --- | --- | --- | --- |
| 1.1 | Clerk JWT no Supabase | Habilita tudo | Medio (config externa) |
| 1.2 | RLS Policies | Seguranca | Alto (precisa testar bem) |
| 1.3 | Indexes | -30-50% queries | Zero |
| 1.4 | Trigger de historico | Remove logica do Express | Baixo |
| 2.2 | **Migrar Clients** | **-200-400ms** | Medio |
| 2.3 | **Migrar Tasks** | **-200-400ms** | Medio |
| 2.4 | Migrar restante | -100-200ms | Baixo |
| 3.1 | Limpar Express | Manutencao | Baixo |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| RLS policy com bug permite acesso indevido | Media | Critico | Testes extensivos por role antes de migrar frontend |
| Clerk JWT template incorreto | Baixa | Alto | Testar com curl antes de integrar no frontend |
| Performance pior em queries complexas (RLS subquery) | Baixa | Medio | Indexes + EXPLAIN ANALYZE antes de ir para producao |
| Supabase rate limit no plano free | Baixa | Medio | Monitorar usage no dashboard |
| Rollback necessario | Media | Medio | Manter rotas Express funcionando em paralelo ate validar |

### Estrategia de Rollback
Manter as rotas Express funcionando em paralelo durante a migracao. O frontend pode ter um feature flag:
```typescript
const USE_SUPABASE_DIRECT = import.meta.env.VITE_USE_SUPABASE_DIRECT === 'true'
```
Se algo der errado, desliga o flag e volta para Express sem deploy.

---

## Evidence & Follow-up

- Comparar request timing: Express vs Supabase direto (logs do middleware vs Supabase dashboard)
- Dashboard Supabase: monitorar RLS policy execution time
- Testes de seguranca: cada role acessa apenas o que deve
- Metricas: tempo de criacao/edicao de cliente antes/depois
