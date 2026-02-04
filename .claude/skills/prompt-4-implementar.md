# Skill: Implementar Mock Aprovado

## Objetivo

Transformar um mock aprovado em implementação funcional completa, conectando com a API backend, state management e funcionalidades reais.

## Contexto Importante

### Stack de Implementação

| Aspecto     | Tecnologia                                                 |
| ----------- | ---------------------------------------------------------- |
| API         | Express REST API (`server/routes.ts`)                      |
| Auth        | Clerk (`<SignedIn>`, `useAuth()`, `useUser()`)             |
| State       | TanStack Query (`useQuery`, `useMutation`) + React Context |
| Toast       | `useToast()` de `@/shared/hooks/use-toast`                 |
| Loading     | `Skeleton` de `@/shared/components/ui/skeleton`            |
| Confirmação | `AlertDialog` de `@/shared/components/ui/alert-dialog`     |
| Formulários | React Hook Form + Zod (via `@/shared/components/ui/form`)  |

### Paths do Projeto

- **Hooks:** `client/src/features/[nome]/hooks/`
- **Contextos:** `client/src/features/[nome]/contexts/`
- **Componentes:** `client/src/features/[nome]/components/`
- **API routes:** `server/routes.ts`
- **UI components:** `@/shared/components/ui/`
- **Toast hook:** `@/shared/hooks/use-toast`
- **Query client:** `@/shared/lib/queryClient`

## Passo a Passo

### 1. Analisar o Mock

- Identificar todos os `// TODO:` no mock
- Listar quais endpoints de API são necessários
- Identificar estados: loading, error, empty, success
- Mapear interações do usuário (CRUD, filtros, navegação)

### 2. Verificar/Criar Endpoints API

**Arquivo:** `server/routes.ts`

Verificar se os endpoints necessários já existem. Se não:

```ts
// GET - Listar
app.get("/api/[recurso]", async (req, res) => { ... });

// GET - Detalhes
app.get("/api/[recurso]/:id", async (req, res) => { ... });

// POST - Criar
app.post("/api/[recurso]", async (req, res) => { ... });

// PATCH - Atualizar
app.patch("/api/[recurso]/:id", async (req, res) => { ... });

// DELETE - Excluir
app.delete("/api/[recurso]/:id", async (req, res) => { ... });
```

### 3. Criar Hooks com TanStack Query

**Diretório:** `client/src/features/[nome]/hooks/`

#### Hook de Query (leitura):

```ts
import { useQuery } from "@tanstack/react-query";

export function use[Recurso]() {
  return useQuery({
    queryKey: ["[recurso]"],
    queryFn: async () => {
      const response = await fetch("/api/[recurso]");
      if (!response.ok) throw new Error("Erro ao carregar dados");
      return response.json();
    },
  });
}
```

#### Hook de Mutation (escrita):

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";

export function useCreate[Recurso]() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Create[Recurso]Input) => {
      const response = await fetch("/api/[recurso]", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao criar");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["[recurso]"] });
      toast({ title: "Sucesso", description: "[Recurso] criado com sucesso" });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
```

### 4. Implementar Loading States

Substituir dados fake por estados de loading:

```tsx
import { Skeleton } from "@/shared/components/ui/skeleton";

function DataTable() {
  const { data, isLoading, error } = use[Recurso]();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Erro ao carregar dados: {error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!data?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum item encontrado.
      </div>
    );
  }

  return (/* renderizar dados */);
}
```

### 5. Implementar Feedback com Toast

```tsx
import { useToast } from "@/shared/hooks/use-toast";

// Sucesso
toast({
  title: "Sucesso",
  description: "Operação realizada com sucesso",
});

// Erro
toast({
  title: "Erro",
  description: "Algo deu errado",
  variant: "destructive",
});
```

### 6. Implementar Confirmação de Exclusão

Usar `AlertDialog` para ações destrutivas:

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive" size="sm">
      Excluir
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
      <AlertDialogDescription>Esta ação não pode ser desfeita. Tem certeza?</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>;
```

### 7. Criar Contexto (se necessário)

**Arquivo:** `client/src/features/[nome]/contexts/[Nome]Context.tsx`

Criar contexto apenas se múltiplos componentes precisam compartilhar estado:

```tsx
import { createContext, useContext, ReactNode } from "react";

interface [Nome]ContextType {
  // estado compartilhado
}

const [Nome]Context = createContext<[Nome]ContextType | null>(null);

export function [Nome]Provider({ children }: { children: ReactNode }) {
  // lógica de estado
  return (
    <[Nome]Context.Provider value={/* valor */}>
      {children}
    </[Nome]Context.Provider>
  );
}

export function use[Nome]Context() {
  const context = useContext([Nome]Context);
  if (!context) throw new Error("use[Nome]Context must be used within [Nome]Provider");
  return context;
}
```

### 8. Substituir Dados Mock

Localizar todos os `// TODO:` no mock e:

1. Remover arrays/objetos de dados fake
2. Substituir por chamadas `useQuery`
3. Adicionar loading states (`Skeleton`)
4. Adicionar tratamento de erro (`Alert`)
5. Adicionar estados vazios
6. Conectar ações com `useMutation`

### 9. Padrão Completo de CRUD

Para cada operação:

- **Create:** Dialog/Sheet com formulário → `useMutation` → toast sucesso → invalidate queries
- **Read:** `useQuery` → loading skeleton → error alert → empty state → dados
- **Update:** Dialog/inline edit → `useMutation` → toast sucesso → invalidate queries
- **Delete:** `AlertDialog` confirmação → `useMutation` → toast sucesso → invalidate queries

## Resultado Esperado

- Mock transformado em implementação funcional
- Conexão real com API backend
- Loading states em todas as operações assíncronas
- Tratamento de erro com feedback visual
- Confirmação antes de ações destrutivas
- Cache invalidation correta via TanStack Query

## Checklist de Verificação

- [ ] Todos os `// TODO:` do mock resolvidos
- [ ] Endpoints API criados/verificados em `server/routes.ts`
- [ ] Hooks com TanStack Query em `features/[nome]/hooks/`
- [ ] Loading states com `Skeleton` em todas as queries
- [ ] Tratamento de erro com `Alert` variant destructive
- [ ] Estados vazios para listas sem dados
- [ ] Toast de sucesso em todas as mutations (`useToast`)
- [ ] Toast de erro em todas as mutations (variant `destructive`)
- [ ] `AlertDialog` para confirmação de exclusão
- [ ] Invalidação de cache após mutations (`queryClient.invalidateQueries`)
- [ ] Nenhum dado fake restante
- [ ] Nenhuma referência a Next.js, server actions ou app router
- [ ] Componentes importados de `@/shared/components/ui/`
- [ ] Toast importado de `@/shared/hooks/use-toast`
