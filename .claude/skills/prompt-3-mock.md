# Skill: Criar Mock de Tela

## Objetivo

Criar um mock visual completo de uma nova tela, com dados fake hardcoded, sem lógica de negócio nem chamadas de API.

## Contexto Importante

### Stack do Projeto

- **Framework:** React + TypeScript + Vite
- **Router:** Wouter (`<Route>`, `<Switch>`)
- **UI:** shadcn/ui (52 componentes) em `@/shared/components/ui/`
- **Estilo:** TailwindCSS com tema configurado (variáveis CSS HSL)
- **Auth:** Clerk (`<SignedIn>`, `<SignedOut>`)
- **URL dev:** `http://localhost:5173`
- **Abordagem:** Responsivo (NÃO mobile-first)

### Estrutura de Features

Seguir o padrão existente em `client/src/features/`:

```
client/src/features/[nome-da-feature]/
├── components/        # Componentes da feature
├── hooks/             # Hooks customizados
├── pages/             # Páginas/views
│   └── [NomeDaPagina].tsx
├── types/             # Tipos TypeScript
├── contexts/          # Contextos React (se necessário)
└── index.ts           # Barrel export
```

### Design System

- SEMPRE consultar a página `/style-guides` antes de criar qualquer UI
- NUNCA usar cores hardcoded — usar variáveis CSS ou classes Tailwind do tema
- SEMPRE importar componentes de `@/shared/components/ui/`

## Passo a Passo

### 1. Buscar Referências

Antes de criar o mock:

- Consultar a página `/style-guides` para referência visual
- Verificar componentes existentes em features similares
- Analisar padrões de layout já usados no projeto

### 2. Criar a Estrutura da Feature

**Diretório:** `client/src/features/[nome]/`

Criar os arquivos necessários:

```
pages/[NomeDaPagina].tsx   # Página principal
components/[...]           # Sub-componentes (se necessário)
types/index.ts             # Tipos (se necessário)
index.ts                   # Barrel export
```

### 3. Criar o Barrel Export

**Arquivo:** `client/src/features/[nome]/index.ts`

```ts
export { default as NomeDaPagina } from "./pages/NomeDaPagina";
```

### 4. Adicionar Rota

**Arquivo:** `client/src/app/App.tsx`

Na função `AuthenticatedRouter`, adicionar antes da rota `NotFound`:

```tsx
<Route path="/[nome]" component={NomeDaPagina} />
```

Import no topo:

```tsx
import { NomeDaPagina } from "@features/[nome]";
```

### 5. Criar a Página Mock

**Arquivo:** `client/src/features/[nome]/pages/[NomeDaPagina].tsx`

#### Regras do Mock:

- **Dados FAKE** hardcoded (arrays/objetos constantes no topo do arquivo)
- **Visual COMPLETO** e polido — deve parecer a versão final
- **SEM lógica de negócio** — nenhuma chamada de API, nenhum useEffect para fetch
- **SEM state management** — sem TanStack Query, sem Context API
- **Comentários `// TODO:`** onde a implementação real vai entrar
- **Responsivo** — funcionar em diferentes larguras de tela

#### Estrutura da Página:

```tsx
// Dados fake para mock
const MOCK_DATA = [
  { id: 1, name: "Item 1", status: "active" },
  { id: 2, name: "Item 2", status: "pending" },
  // ...
];

export default function NomeDaPagina() {
  // TODO: Substituir por useQuery quando implementar
  const data = MOCK_DATA;

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Título da Página</h1>
          <p className="text-muted-foreground">Descrição breve</p>
        </div>
        {/* TODO: Ações reais */}
        <Button>Ação Principal</Button>
      </header>

      {/* Conteúdo principal */}
      {/* TODO: Implementar com dados reais */}
    </div>
  );
}
```

### 6. Componentes Recomendados

Usar componentes do design system conforme necessário:

- **Layout:** `Card`, `Tabs`, `Separator`, `ScrollArea`
- **Ações:** `Button`, `DropdownMenu`, `Dialog`
- **Dados:** `Table`, `Badge`, `Avatar`, `Skeleton`
- **Formulários:** `Input`, `Select`, `Checkbox`, `Form`
- **Feedback:** `Alert`, `Tooltip`

### 7. Padrões de Layout

Seguir layouts existentes no projeto:

- **Página de listagem:** Header + Toolbar/Filtros + Table/Cards
- **Página de detalhes:** Header com ações + Grid de informações + Seções
- **Dashboard:** Grid de cards com métricas + Gráficos + Tabelas resumo

## Resultado Esperado

- Mock acessível em `http://localhost:5173/[nome]`
- Visual completo e profissional
- Dados fake realistas
- Nenhuma dependência de API ou backend
- Pronto para aprovação do usuário antes da implementação

## Checklist de Verificação

- [ ] Feature criada em `client/src/features/[nome]/`
- [ ] Barrel export em `index.ts`
- [ ] Rota adicionada em `App.tsx` com Wouter
- [ ] Dados fake hardcoded (sem fetch/API)
- [ ] Visual completo (não é wireframe)
- [ ] Componentes importados de `@/shared/components/ui/`
- [ ] Cores e estilos do design system (sem hardcoded)
- [ ] Comentários `// TODO:` onde vai a implementação real
- [ ] Responsivo (não mobile-first)
- [ ] Nenhuma referência a Next.js, app router ou server actions
