# Skill: Adicionar Novo Componente ao Design System

## Objetivo

Instalar e documentar um novo componente shadcn/ui no projeto.

## Contexto Importante

### Componentes JÁ Instalados (52)

Antes de instalar, SEMPRE verifique se o componente já existe em `client/src/shared/components/ui/`:

accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button,
calendar, card, carousel, chart, checkbox, collapsible, command, context-menu,
date-input, dialog, drawer, dropdown-menu, editable-cell, expandable-filter-bar,
form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination,
popover, progress, radio-group, resizable, scroll-area, searchable-multi-select,
select, separator, sheet, sidebar, skeleton, slider, switch, table, tabs,
task-assignees, task-badges, textarea, toast, toaster, toggle, toggle-group, tooltip

### Path dos Componentes

- **Diretório:** `client/src/shared/components/ui/`
- **Import alias:** `@/shared/components/ui/[nome]`

## Passo a Passo

### 1. Verificar se já existe

```bash
ls client/src/shared/components/ui/ | grep [nome-do-componente]
```

Se já existe, pule para o passo 4 (documentar).

### 2. Instalar o componente

```bash
npx shadcn@latest add [nome-do-componente]
```

O shadcn está configurado para instalar em `client/src/shared/components/ui/`.

### 3. Verificar instalação

Confirmar que o arquivo foi criado em `client/src/shared/components/ui/[nome].tsx`.

### 4. Atualizar a página Style Guides

**Arquivo:** `client/src/features/style-guides/pages/StyleGuides.tsx`

Adicionar na seção apropriada:

- **Nome** do componente
- **Import path:** `@/shared/components/ui/[nome]`
- **Exemplo visual** demonstrando as variantes principais
- **Código de exemplo** mostrando uso típico

### 5. Categorização

Classificar o componente em uma das categorias:

- **Layout & Navegação:** elementos de estrutura e navegação
- **Formulários & Inputs:** campos de entrada e controles de formulário
- **Feedback & Overlay:** alertas, modais, popovers
- **Data Display:** exibição de dados e informações
- **Utilitários:** componentes auxiliares

### 6. Exemplo Visual

Criar um exemplo inline na página `/style-guides` que mostre:

- Estado padrão
- Variantes disponíveis (se houver: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`)
- Tamanhos disponíveis (se houver: `sm`, `default`, `lg`, `icon`)
- Estado disabled (quando aplicável)

## Resultado Esperado

- Componente instalado em `@/shared/components/ui/[nome]`
- Página `/style-guides` atualizada com o novo componente
- Exemplo visual e código de uso documentados

## Checklist de Verificação

- [ ] Verificado que o componente NÃO existia antes
- [ ] Componente instalado via `npx shadcn@latest add`
- [ ] Arquivo existe em `client/src/shared/components/ui/`
- [ ] Import path usa `@/shared/components/ui/[nome]`
- [ ] Página `/style-guides` atualizada com exemplo visual
- [ ] Componente categorizado corretamente
- [ ] Nenhuma referência a Next.js ou `/components/ui/`
