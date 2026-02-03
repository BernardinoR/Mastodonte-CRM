# Skill: Criar Fundação do Design System

## Objetivo
Criar a página `/style-guides` como documentação viva do design system existente no projeto.

## Contexto Importante
O projeto JÁ possui:
- **TailwindCSS** configurado com tema completo (cores, tipografia, sombras, radius)
- **CSS variables** HSL-based em `client/src/index.css` (light + dark mode)
- **52 componentes shadcn/ui** já instalados em `@/shared/components/ui/`

NÃO é necessário:
- Instalar Tailwind ou shadcn
- Criar variáveis CSS do zero
- Instalar componentes base

## Passo a Passo

### 1. Criar a Feature `style-guides`

Estrutura de diretórios:
```
client/src/features/style-guides/
├── pages/
│   └── StyleGuides.tsx
└── index.ts
```

### 2. Criar o barrel export

**Arquivo:** `client/src/features/style-guides/index.ts`
```ts
export { default as StyleGuides } from "./pages/StyleGuides";
```

### 3. Adicionar rota no App.tsx

**Arquivo:** `client/src/app/App.tsx`

Na função `AuthenticatedRouter`, adicionar antes da rota `NotFound`:
```tsx
<Route path="/style-guides" component={StyleGuides} />
```

Import no topo:
```tsx
import { StyleGuides } from "@features/style-guides";
```

### 4. Criar a página StyleGuides.tsx

**Arquivo:** `client/src/features/style-guides/pages/StyleGuides.tsx`

A página deve documentar visualmente:

#### Seção 1: Paleta de Cores
Exibir swatches para todas as variáveis CSS existentes:
- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--card`, `--card-foreground`, `--card-border`
- `--popover`, `--popover-foreground`, `--popover-border`
- `--sidebar`, `--sidebar-foreground`, `--sidebar-border`, `--sidebar-primary`, `--sidebar-accent`
- `--border`, `--input`, `--ring`
- `--chart-1` a `--chart-5`

Cada swatch: quadrado colorido + nome da variável + valor HSL.

#### Seção 2: Tipografia
- Fontes: `--font-sans` (Inter), `--font-serif`, `--font-mono`
- Tamanhos: demonstrar `text-xs` até `text-4xl`
- Pesos: demonstrar `font-normal`, `font-medium`, `font-semibold`, `font-bold`

#### Seção 3: Elevação e Sombras
- Variáveis: `--shadow-2xs` até `--shadow-2xl`
- Variáveis: `--elevate-1`, `--elevate-2`
- Classes utilitárias: `hover-elevate`, `active-elevate`, `toggle-elevate`
- Demonstrar cards com cada nível de sombra

#### Seção 4: Espaçamento e Border Radius
- `--radius` (0.5rem)
- `--spacing` (0.25rem)
- Demonstrar variações de border-radius do Tailwind

#### Seção 5: Componentes Disponíveis
Listar todos os 52 componentes shadcn/ui já instalados, organizados por categoria:

**Layout & Navegação:**
accordion, breadcrumb, carousel, collapsible, navigation-menu, pagination, resizable, scroll-area, separator, sidebar, tabs

**Formulários & Inputs:**
button, calendar, checkbox, date-input, form, input, input-otp, label, radio-group, searchable-multi-select, select, slider, switch, textarea, toggle, toggle-group

**Feedback & Overlay:**
alert, alert-dialog, dialog, drawer, hover-card, popover, sheet, toast, toaster, tooltip

**Data Display:**
avatar, badge, card, chart, context-menu, dropdown-menu, menubar, progress, skeleton, table

**Utilitários:**
aspect-ratio, command, editable-cell, expandable-filter-bar, task-assignees, task-badges

Para cada componente, mostrar:
- Nome do componente
- Import path: `@/shared/components/ui/[nome]`
- Exemplo visual inline (pelo menos para os principais: Button, Card, Badge, Input, Select, Dialog, Table, Tabs)

#### Seção 6: Padrões de Uso
- Como usar `useToast()` de `@/shared/hooks/use-toast`
- Variantes de toast: `default` e `destructive`
- Pattern de loading com `Skeleton`
- Pattern de confirmação com `AlertDialog`

### 5. Layout da Página

Usar o seguinte layout:
```tsx
<div className="p-6 space-y-12 max-w-6xl mx-auto">
  <header>
    <h1 className="text-3xl font-bold">Style Guides</h1>
    <p className="text-muted-foreground mt-2">
      Documentação viva do design system. Consulte antes de criar qualquer UI.
    </p>
  </header>
  {/* Seções aqui */}
</div>
```

## Resultado Esperado
- Página acessível em `http://localhost:5173/style-guides`
- Documentação visual completa do design system existente
- Referência rápida para todos os 52 componentes disponíveis
- Exemplos visuais de cores, tipografia, sombras e componentes

## Checklist de Verificação
- [ ] Feature criada em `client/src/features/style-guides/`
- [ ] Rota adicionada em `client/src/app/App.tsx` com Wouter
- [ ] Todas as variáveis CSS de `client/src/index.css` documentadas
- [ ] 52 componentes listados com import paths corretos
- [ ] Nenhuma referência a Next.js, app router ou server actions
- [ ] Página usa apenas componentes de `@/shared/components/ui/`
