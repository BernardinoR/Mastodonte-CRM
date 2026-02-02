---
status: draft
generated: 2026-02-02
agents:
  - type: "database-specialist"
    role: "Add calendarLink to User model and schedulingMessageSentAt to Client model"
  - type: "backend-specialist"
    role: "Update API endpoints to handle new fields"
  - type: "frontend-specialist"
    role: "Implement UI for calendar link field and WhatsApp scheduling buttons"
  - type: "feature-developer"
    role: "End-to-end feature implementation across all layers"
docs:
  - "architecture.md"
  - "data-flow.md"
  - "glossary.md"
phases:
  - id: "phase-1"
    name: "Database & Backend"
    prevc: "P"
  - id: "phase-2"
    name: "User Profile - Calendar Link"
    prevc: "E"
  - id: "phase-3"
    name: "WhatsApp Scheduling Buttons"
    prevc: "E"
  - id: "phase-4"
    name: "Meeting Delay Grace Period"
    prevc: "E"
  - id: "phase-5"
    name: "Validation & Testing"
    prevc: "V"
---

# Google Calendar Link + WhatsApp Meeting Scheduling

> Permitir que usuários configurem seu link de agendamento do Google Calendar no perfil. Adicionar botões de agendamento via WhatsApp que abrem conversa com mensagem pré-formatada contendo o link do calendário. Ao pressionar o botão, zerar temporariamente (24h) o status de atraso de reunião mensal do cliente.

## Task Snapshot

- **Primary goal:** Integrar agendamento de reuniões via WhatsApp com link do Google Calendar e grace period de 24h no status de atraso
- **Success signal:** Usuário consegue enviar mensagem de agendamento pelo WhatsApp com link do calendário, e o cliente perde o indicador de atraso por 24h
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Architecture Notes](../docs/architecture.md)
  - [Data Flow](../docs/data-flow.md)

## Codebase Context

### Arquivos Críticos

| Arquivo | Propósito | Mudanças Necessárias |
|---------|-----------|---------------------|
| `prisma/schema.prisma` | Schema do banco | Adicionar `calendarLink` em User, `schedulingMessageSentAt` em Client |
| `server/storage.ts` | Camada de acesso a dados | Atualizar tipos InsertUser |
| `server/routes.ts` | API endpoints | Endpoint para salvar calendarLink |
| `client/src/features/users/pages/Profile.tsx` | Página de perfil | Adicionar campo de link do calendário |
| `client/src/features/clients/components/ClientCard.tsx` | Card do cliente | Modificar botão "Agendar" para abrir WhatsApp |
| `client/src/features/clients/lib/clientUtils.ts` | Utilitários de cliente | Modificar `getMeetingDelayStatus()` para considerar grace period |
| `client/src/features/clients/hooks/useClientsPage.ts` | Hook de enriquecimento | Passar `schedulingMessageSentAt` no enriquecimento |
| `client/src/features/clients/contexts/ClientsContext.tsx` | Estado dos clientes | Carregar e atualizar `schedulingMessageSentAt` |
| `client/src/features/tasks/components/task-detail/TaskContactButtons.tsx` | Botões de contato na task | Adicionar opção de agendar reunião via WhatsApp |

### Estado Atual

- **User Model**: `id, clerkId, email, name, roles, groupId, isActive` — **sem campo de calendar link**
- **Client Model**: `lastMeeting` (DateTime) — **sem campo de schedulingMessageSentAt**
- **WhatsApp**: Abre chat direto sem mensagem pré-formatada (`whatsapp://send?phone=${phone}`)
- **Botão "Agendar"**: Existe no `ClientCard.tsx` (L231-237) — chama `onSchedule?.(client)` callback
- **Delay Logic**: `daysSinceLastMeeting()` + `getMeetingDelayStatus()` em `clientUtils.ts` — thresholds: ok(<30d), warning(30-60d), critical(>60d)

## Agent Lineup

| Agent | Role | Playbook |
|-------|------|----------|
| Database Specialist | Criar migração para novos campos | [database-specialist](../agents/database-specialist.md) |
| Backend Specialist | Atualizar APIs e storage | [backend-specialist](../agents/backend-specialist.md) |
| Frontend Specialist | Implementar UI do perfil e botões | [frontend-specialist](../agents/frontend-specialist.md) |
| Feature Developer | Integração end-to-end | [feature-developer](../agents/feature-developer.md) |

## Risk Assessment

### Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Formato do link Google Calendar muda | Low | Medium | Validação flexível (aceitar qualquer URL calendar.app.google) |
| WhatsApp API `whatsapp://send` não funciona em todos os dispositivos | Medium | High | Fallback para `https://wa.me/` como alternativa |
| Grace period de 24h pode ser abusado | Low | Low | Log de quando o botão foi pressionado, campo visível no admin |

### Assumptions

- O link do Google Calendar será do formato `https://calendar.app.google/...`
- O usuário já tem o WhatsApp instalado no dispositivo
- A mensagem pré-formatada será em português
- O grace period é por clique no botão (não por envio real da mensagem no WhatsApp)

---

## Working Phases

### Phase 1 — Database & Backend

**Objetivo:** Adicionar campos necessários no banco e atualizar APIs.

**Steps:**

1. **Migração Prisma — User.calendarLink**
   ```prisma
   model User {
     // ... campos existentes ...
     calendarLink String? @map("calendar_link")
   }
   ```

2. **Migração Prisma — Client.schedulingMessageSentAt**
   ```prisma
   model Client {
     // ... campos existentes ...
     schedulingMessageSentAt DateTime? @map("scheduling_message_sent_at")
   }
   ```

3. **Atualizar `server/storage.ts`**
   - Adicionar `calendarLink` ao tipo `InsertUser`
   - Garantir que o campo é retornado nas queries de usuário

4. **Atualizar `server/routes.ts`**
   - `PATCH /api/users/:id` — aceitar `calendarLink` no body
   - `GET /api/auth/me` — retornar `calendarLink`
   - `PATCH /api/clients/:id/scheduling-sent` — registrar timestamp de envio de mensagem

5. **Atualizar Supabase (se dados vêm direto)**
   - Verificar se as queries diretas do Supabase no frontend precisam ser atualizadas

**Commit Checkpoint:**
```
feat(db): add calendarLink to User and schedulingMessageSentAt to Client
```

---

### Phase 2 — User Profile - Calendar Link

**Objetivo:** Adicionar campo editável no perfil do usuário para o link do Google Calendar.

**Steps:**

1. **Atualizar `Profile.tsx` — Tab "Perfil"**
   - Adicionar campo de input para "Link do Google Calendar"
   - Placeholder: `https://calendar.app.google/...`
   - Ícone de calendário (Calendar do lucide-react)
   - Botão de salvar (ou salvar inline como o nome)
   - Validação: aceitar URLs que começam com `https://calendar.app.google/`

2. **Atualizar `useCurrentUser.ts`**
   - Incluir `calendarLink` na interface `CurrentUser`
   ```typescript
   export interface CurrentUser {
     // ... campos existentes ...
     calendarLink: string | null;
   }
   ```

3. **Mutation para salvar**
   - Reutilizar o padrão existente de update via Supabase
   - Invalidar cache do TanStack Query após salvar

4. **UX:**
   - Campo aparece abaixo do nome na aba de perfil
   - Label: "Link de agendamento"
   - Descrição: "Cole aqui seu link do Google Calendar para enviar aos clientes"
   - Toast de sucesso ao salvar

**Commit Checkpoint:**
```
feat(users): add Google Calendar link field to user profile
```

---

### Phase 3 — WhatsApp Scheduling Buttons

**Objetivo:** Transformar botões de agendamento para abrir WhatsApp com mensagem pré-formatada.

**Steps:**

1. **Criar helper de mensagem formatada**
   - Local: `client/src/features/clients/lib/schedulingMessage.ts`
   ```typescript
   export function buildSchedulingMessage(
     clientName: string,
     calendarLink: string
   ): string {
     return `Olá ${clientName}! Gostaria de agendar nossa próxima reunião. Por favor, escolha o melhor horário no link abaixo:\n\n${calendarLink}\n\nAguardo seu retorno!`;
   }

   export function buildWhatsAppSchedulingUrl(
     phone: string,
     message: string
   ): string {
     const cleanPhone = phone.replace(/\D/g, '');
     const encodedMessage = encodeURIComponent(message);
     return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
   }
   ```

2. **Modificar botão "Agendar" no `ClientCard.tsx`**
   - Ao clicar no "Agendar":
     - Se o usuário tem `calendarLink` configurado E o cliente tem `phone`:
       - Registrar `schedulingMessageSentAt` no cliente (API call)
       - Abrir URL do WhatsApp com mensagem pré-formatada
     - Se o usuário NÃO tem `calendarLink`:
       - Mostrar tooltip/toast pedindo para configurar no perfil
     - Se o cliente NÃO tem `phone`:
       - Manter comportamento atual (abrir diálogo de agendamento normal)

3. **Adicionar botão de agendar via WhatsApp no `TaskContactButtons.tsx`**
   - Novo item no menu de WhatsApp: "Enviar link de agendamento"
   - Usa o mesmo helper de mensagem formatada
   - Registra `schedulingMessageSentAt` no cliente da task

4. **Adicionar em outros locais de agendamento**
   - `ClientsListView.tsx` — se existir botão de agendar na listagem
   - `MeetingsTable.tsx` / `NewMeetingDialog.tsx` — se aplicável

5. **Registrar o envio (API call)**
   - Ao clicar, fazer `PATCH /api/clients/:id/scheduling-sent`
   - Ou via Supabase direto: `update clients set scheduling_message_sent_at = now()`

**Commit Checkpoint:**
```
feat(clients): add WhatsApp scheduling with pre-formatted message and calendar link
```

---

### Phase 4 — Meeting Delay Grace Period

**Objetivo:** Após enviar mensagem de agendamento, cliente perde indicador de atraso por 24h.

**Steps:**

1. **Atualizar `ClientsContext.tsx`**
   - Carregar campo `schedulingMessageSentAt` ao buscar clientes do Supabase
   - Mapear para o tipo `Client`

2. **Atualizar tipo `Client`**
   ```typescript
   export interface Client {
     // ... campos existentes ...
     schedulingMessageSentAt: Date | null;
   }
   ```

3. **Modificar `clientUtils.ts` — lógica de grace period**
   ```typescript
   export function getMeetingDelayStatus(
     days: number,
     schedulingMessageSentAt?: Date | null
   ): 'ok' | 'warning' | 'critical' {
     // Se mensagem de agendamento foi enviada nas últimas 24h, retornar 'ok'
     if (schedulingMessageSentAt) {
       const hoursSinceSent = (Date.now() - new Date(schedulingMessageSentAt).getTime()) / (1000 * 60 * 60);
       if (hoursSinceSent < 24) return 'ok';
     }

     // Lógica original
     if (days < 0) return 'critical';
     if (days < 30) return 'ok';
     if (days < 60) return 'warning';
     return 'critical';
   }
   ```

4. **Atualizar `useClientsPage.ts`**
   - Passar `schedulingMessageSentAt` para `getMeetingDelayStatus()`
   ```typescript
   const meetingDelayStatus = getMeetingDelayStatus(
     days,
     client.schedulingMessageSentAt
   );
   ```

5. **UI feedback**
   - Quando em grace period, mostrar indicador sutil (ex: ícone de relógio ou texto "Agendamento enviado")
   - O badge de dias pode mostrar "Enviado" ao invés do número de dias durante as 24h

**Commit Checkpoint:**
```
feat(clients): add 24h grace period on meeting delay after scheduling message sent
```

---

### Phase 5 — Validation & Testing

**Steps:**

1. **Testes de fluxo completo:**
   - Usuário configura link no perfil → link salva corretamente
   - Clique no "Agendar" → WhatsApp abre com mensagem correta
   - Após clique → `schedulingMessageSentAt` é atualizado
   - Cliente com atraso → perde indicador após envio → indicador volta após 24h

2. **Edge cases:**
   - Usuário sem calendarLink configurado
   - Cliente sem telefone
   - Telefone em formato incorreto
   - Grace period expirado (>24h)
   - Múltiplos cliques no botão de agendar

3. **Responsividade:**
   - Botão funciona em mobile e desktop
   - WhatsApp link funciona em ambos (`https://wa.me/` é universal)

4. **Documentação:**
   - Atualizar glossário com novos termos
   - Documentar o fluxo de agendamento

**Commit Checkpoint:**
```
test(clients): validate WhatsApp scheduling flow and grace period logic
```

---

## Rollback Plan

### Rollback Triggers
- Bug no cálculo de delay (clientes perdendo indicador incorretamente)
- WhatsApp URL não funcionando em produção
- Migração causando problemas no banco

### Rollback Procedures

#### Database Rollback
- Reverter migração: campos são opcionais (nullable), podem ser ignorados
- Não há risco de perda de dados existentes

#### Code Rollback
- `getMeetingDelayStatus()` continua funcionando sem o segundo parâmetro (é opcional)
- Botão "Agendar" pode voltar ao comportamento anterior removendo a lógica do WhatsApp

---

## Evidence & Follow-up

- [ ] Migração aplicada com sucesso
- [ ] Campo de calendar link visível e funcional no perfil
- [ ] Botão de agendar abre WhatsApp com mensagem correta
- [ ] Grace period funciona (24h)
- [ ] Edge cases validados
- [ ] PR criado e revisado
