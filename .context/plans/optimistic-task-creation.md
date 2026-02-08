---
status: active
generated: 2026-02-08
agents:
  - type: "feature-developer"
    role: "Implementar optimistic updates no TasksContext"
  - type: "frontend-specialist"
    role: "Garantir UX consistente com indicadores visuais de sync"
phases:
  - id: "phase-1"
    name: "Discovery & Análise do Fluxo Atual"
    prevc: "P"
  - id: "phase-2"
    name: "Implementação do Optimistic Create"
    prevc: "E"
  - id: "phase-3"
    name: "Validação & Testes"
    prevc: "V"
---

# Optimistic Updates na Criação de Tarefas

> Implementar optimistic updates ao criar novas tarefas para que a UI reflita instantaneamente a nova tarefa antes da confirmação do servidor, melhorando a experiência do usuário com feedback imediato.

## Task Snapshot

- **Primary goal:** Eliminar o delay entre o clique de "criar tarefa" e a tarefa aparecer na UI. A tarefa deve aparecer instantaneamente com um ID temporário, e ser reconciliada com o ID real após o Supabase confirmar.
- **Success signal:** Tarefas aparecem na UI em <50ms após criação (sem esperar round-trip do Supabase). Erros de sync são exibidos inline com opção de retry. Funcionalidade de undo (Ctrl+Z) continua funcionando.

## Análise do Estado Atual

### Fluxo de Criação Atual (Síncrono)
O sistema usa **Context + Supabase direto** (não TanStack Query) para gerenciar tasks.

**Arquivo principal:** `client/src/features/tasks/contexts/TasksContext.tsx`

```
createTaskAndReturn() → Fluxo atual:
1. Resolve clientId (por nome se necessário)
2. Resolve assigneeIds (converte nomes → IDs)
3. INSERT no Supabase (aguarda resposta) ← BOTTLENECK
4. Busca task completa com relações (segundo query) ← BOTTLENECK
5. Adiciona ao state local via setTasks()
6. Retorna task para o chamador
```

**Problema:** Os passos 3 e 4 são bloqueantes. O usuário espera ~200-500ms antes de ver a task na UI.

### Padrões Optimistic Já Existentes no Codebase

| Operação | Optimistic? | Mecanismo | Arquivo:Linha |
|---|---|---|---|
| **updateTask** | Sim | Local imediato + debounce 500ms para API | `TasksContext.tsx:296-323` |
| **deleteTask** | Sim | Remove do state, deleta async | `TasksContext.tsx:326-337` |
| **addTaskHistory** | Sim | Temp ID + replace após sync | `TasksContext.tsx:614-711` |
| **createTask** | **NÃO** | Espera resposta do Supabase | `TasksContext.tsx:514-592` |

### Infraestrutura Já Disponível

O type `Task` já possui campos preparados para optimistic:
```typescript
// client/src/features/tasks/types/task.ts
syncStatus?: SyncStatus;  // "pending" | "error" | undefined (synced)
_tempId?: string;          // ID temporário antes da sync com API
```

O sistema de undo (`setTasksWithHistory`) e a detecção de `temp-` IDs já existem:
```typescript
// TasksContext.tsx:300 - updateTask ignora tasks temporárias
if (taskId.startsWith("temp-")) return;
```

## Arquivos a Modificar

| Arquivo | Mudança | Impacto |
|---|---|---|
| `client/src/features/tasks/contexts/TasksContext.tsx` | Refatorar `createTaskAndReturn` para ser optimistic | **Alto** — core da lógica |
| `client/src/features/tasks/hooks/useQuickAddTask.ts` | Adaptar para receber task imediatamente (sem await bloqueante) | **Médio** |
| `client/src/features/tasks/components/TaskCard.tsx` | Indicador visual de `syncStatus` | **Baixo** |
| `client/src/features/tasks/components/task-card/TaskCardContent.tsx` | Badge/overlay para status de sync | **Baixo** |

## Decisões de Design

### 1. Geração de ID Temporário
- Usar padrão `temp-{timestamp}-{random}` já compatível com a verificação existente `taskId.startsWith("temp-")`
- Após sync, substituir `_tempId` e `id` pelo UUID real retornado pelo Supabase

### 2. Estratégia de Reconciliação
- **Abordagem:** Insert otimista → sync em background → replace ID
- O `_tempId` guarda o ID temporário original para tracking
- Todas as referências ao task (editing, selection) são atualizadas quando o ID real chega

### 3. Tratamento de Erros
- Se o INSERT falhar, marcar `syncStatus: "error"` na task
- Exibir indicador visual (ícone de alerta) no TaskCard
- Oferecer `retryTaskSync` para re-tentar (já existe no context type)
- Manter a task no estado local para o usuário não perder dados

### 4. Integração com Undo
- Usar `setTasksWithHistory` ao adicionar optimisticamente (mantém histórico para Ctrl+Z)
- Se o usuário desfaz antes do sync completar, cancelar/ignorar o resultado do sync

### 5. Indicador Visual
- Tasks com `syncStatus: "pending"` — leve opacity (0.7) + spinner discreto
- Tasks com `syncStatus: "error"` — borda vermelha + ícone de retry
- Tasks sincronizadas (`syncStatus: undefined`) — visual normal

## Working Phases

### Phase 1 — Discovery & Análise (P)

**Steps:**
1. Mapear todos os pontos de chamada de `createTask` e `createTaskAndReturn` no codebase
2. Identificar dependências no ID real da task (ex: `onSetEditingTaskId(newTask.id)`)
3. Validar que o pattern `temp-` não causa conflitos com operações existentes (drag-and-drop, bulk ops, turbo mode)
4. Documentar o contrato de dados para a task optimística

**Outputs:**
- Lista completa de call sites
- Mapa de dependências do task ID
- Decisões registradas

### Phase 2 — Implementação (E)

**Step 1: Refatorar `createTaskAndReturn` no TasksContext**
```
Novo fluxo:
1. Gerar tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
2. Criar objeto Task local com todos os dados conhecidos + syncStatus: "pending"
3. Adicionar ao state via setTasksWithHistory() ← INSTANTÂNEO
4. Retornar task com tempId para o chamador ← INSTANTÂNEO
5. Em background (async IIFE):
   a. Resolver clientId e assigneeIds
   b. INSERT no Supabase
   c. Fetch task completa com relações
   d. Substituir task temp pela task real no state
   e. Se erro → marcar syncStatus: "error"
```

**Step 2: Adaptar `useQuickAddTask`**
- `handleQuickAdd`, `handleQuickAddTop`, `handleQuickAddAfter` passam a receber a task imediatamente
- `onSetEditingTaskId` é chamado com o `tempId` (funciona porque o editing já usa o ID como key)

**Step 3: Adaptar `NewTaskDialog` → `createTask` call**
- Mesma adaptação — a chamada já não precisa ser awaited para UI

**Step 4: Implementar `retryTaskSync`**
- Re-executar o fluxo de sync para tasks com `syncStatus: "error"`
- Reutilizar a mesma lógica de INSERT + reconciliação

**Step 5: Indicadores visuais no TaskCard**
- Adicionar renderização condicional baseada em `syncStatus`
- Spinner discreto para "pending", badge de erro para "error"

**Step 6: Atualizar reconciliação de IDs**
- Quando o ID real chega, atualizar referências no state de editing (`editingTaskId`)
- Garantir que drag-and-drop e seleção funcionam com `temp-` IDs

### Phase 3 — Validação (V)

**Steps:**
1. Testar criação rápida de múltiplas tasks (quick add em sequência)
2. Testar cenário de erro de rede (desconectar e reconectar)
3. Testar undo (Ctrl+Z) durante sync pendente
4. Testar interação com turbo mode
5. Testar drag-and-drop de task com `temp-` ID
6. Verificar que editing inline funciona com task temporária
7. Performance: confirmar que a UI responde em <50ms

## Risk Assessment

| Risk | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Race condition entre undo e sync completion | Média | Alto | Usar flag `aborted` no closure da sync para ignorar resultado se task foi removida |
| Conflito de IDs durante drag-and-drop | Baixa | Médio | Verificar que dnd-kit funciona com IDs string tipo `temp-*` |
| Edição rápida em task temp antes do sync | Média | Médio | `updateTask` já ignora `temp-` IDs — acumular updates e aplicar após reconciliação |
| Múltiplas tasks criadas em <1s | Baixa | Baixo | Cada task tem tempId único com timestamp+random |

## Rollback Plan

- **Trigger:** Se a reconciliação de IDs causar bugs ou perda de dados
- **Ação:** Reverter `createTaskAndReturn` para o fluxo síncrono original (1 commit revert)
- **Impacto em dados:** Nenhum — as tasks já estão no Supabase, apenas a UX muda
- **Tempo estimado:** <30 min

## Evidence & Follow-up

- [ ] Medir tempo de aparecimento da task antes vs depois (target: <50ms)
- [ ] Verificar que nenhum task é perdido em cenários de erro
- [ ] Confirmar que `syncStatus` é limpo corretamente após sync bem-sucedido
- [ ] Testar com conexão lenta (throttle no DevTools)
