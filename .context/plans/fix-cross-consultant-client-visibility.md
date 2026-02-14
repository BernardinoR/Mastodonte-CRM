---
status: active
generated: 2026-02-14
agents:
  - type: "database-specialist"
    role: "Criar migration para active_role e atualizar is_admin()"
  - type: "backend-specialist"
    role: "Criar endpoint PATCH /api/users/active-role"
  - type: "frontend-specialist"
    role: "Implementar toggle de role ativa no header"
phases:
  - id: "phase-1"
    name: "Migration + função RLS"
    prevc: "E"
  - id: "phase-2"
    name: "Backend endpoint + Frontend toggle"
    prevc: "E"
  - id: "phase-3"
    name: "Validação"
    prevc: "V"
---

# Implementar Role Ativa (Alternar Visão Admin/Consultor)

> **Objetivo:** Permitir que admins com múltiplas roles alternem entre visões.
> **Premissa:** Apenas admins terão múltiplas roles. Otimizar para zero overhead em não-admins.

## Diagnóstico Concluído

- **Rafael:** `roles = ["administrador", "consultor"]` → `is_admin()` sempre true → vê tudo
- **Policies RLS:** Corretas (migration 20260210 aplicada)
- **Solução:** Campo `active_role` + `is_admin()` otimizado com short-circuit

## Otimização de Performance

### Função `is_admin()` — short-circuit AND

```sql
-- OTIMIZADO: não-admins curto-circuitam no primeiro AND
SELECT
  'administrador' = ANY(roles)                                    -- 1. É admin?
  AND (active_role IS NULL OR active_role = 'administrador')      -- 2. Só se admin: role ativa?
FROM users WHERE clerk_id = auth.jwt()->>'sub'
```

**Performance por tipo de usuário:**

| Usuário | roles | active_role | Avaliação | Overhead |
|---------|-------|-------------|-----------|----------|
| Nilceu (consultor) | `[consultor]` | NULL | `false AND ...` → **false** (para no 1o check) | **Zero** |
| Tayane (alocador) | `[alocador]` | NULL | `false AND ...` → **false** (para no 1o check) | **Zero** |
| Rafael (admin, modo admin) | `[admin, consultor]` | NULL | `true AND (NULL IS NULL)` → **true** | 1 coluna extra |
| Rafael (admin, modo consultor) | `[admin, consultor]` | `consultor` | `true AND (false OR false)` → **false** | 1 coluna extra |

### `has_group_access()` — NÃO precisa mudar

Só admin terá toggle. Admin não tem role alocador/concierge, então `has_group_access()` já retorna false para ele. Nenhuma mudança necessária.

## Plano de Implementação

### Fase 1 — Migration + Função RLS

**1.1 — Schema Prisma** (`prisma/schema.prisma`)

```prisma
model User {
  // ... campos existentes ...
  activeRole      String?  @map("active_role")
  // ...
}
```

**1.2 — Migration SQL**

```sql
-- 1. Adicionar coluna (nullable, sem default = NULL para todos)
ALTER TABLE users ADD COLUMN active_role TEXT DEFAULT NULL;

-- 2. ÚNICA função que muda: is_admin() com short-circuit
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    'administrador' = ANY(roles)
    AND (active_role IS NULL OR active_role = 'administrador')
  FROM users WHERE clerk_id = auth.jwt()->>'sub'
$$;
```

Apenas 1 coluna nova + 1 função alterada. Nenhuma policy muda.

### Fase 2 — Backend + Frontend

**2.1 — Endpoint** (`server/routes.ts`)

```
PATCH /api/users/active-role
Body: { activeRole: "consultor" | "administrador" | null }
```

Validações:
- User autenticado
- `activeRole` deve estar no array `roles` do user (ou ser null para resetar)
- Atualiza `active_role` via Prisma

**2.2 — Tipos**

- `server/storage.ts`: adicionar `activeRole` ao InsertUser
- `useCurrentUser.ts`: adicionar `activeRole` ao CurrentUser

**2.3 — Frontend Toggle**

Componente visível apenas para users com `roles.length > 1`:
- Mostra role ativa atual
- Dropdown com as roles disponíveis
- Ao trocar: chama endpoint → invalida cache `/api/auth/me` → refetch clientes
- Persistente (salvo no banco)

### Fase 3 — Validação

1. Rafael `active_role = NULL` → vê todos (admin default)
2. Rafael `active_role = "consultor"` → vê apenas seus 5 clientes
3. Rafael `active_role = "administrador"` → vê todos
4. Nilceu (consultor, sem active_role) → nada muda, vê só os dele
5. Tayane (alocador, sem active_role) → nada muda, vê clientes do grupo

## Arquivos a Modificar

| Arquivo | Mudança | Impacto |
|---------|---------|---------|
| `prisma/schema.prisma` | +1 campo `activeRole` | Mínimo |
| Nova migration SQL | 1 coluna + 1 função | Mínimo |
| `server/storage.ts` | tipo InsertUser | Mínimo |
| `server/routes.ts` | +1 endpoint PATCH | Isolado |
| `client/src/features/users/hooks/useCurrentUser.ts` | tipo CurrentUser | Mínimo |
| `client/src/features/users/contexts/UsersContext.tsx` | função switchActiveRole | Isolado |
| Frontend header/sidebar | Toggle (só se roles.length > 1) | Isolado |

## Critérios de Sucesso

- [ ] Campo `active_role` existe na tabela users
- [ ] `is_admin()` usa short-circuit AND (zero overhead para não-admins)
- [ ] `has_group_access()` permanece inalterada
- [ ] Endpoint PATCH /api/users/active-role valida contra array `roles`
- [ ] Toggle visível APENAS para users com múltiplas roles
- [ ] Admin em modo consultor vê apenas seus clientes
- [ ] Não-admins não são afetados (zero regressão, zero overhead)
