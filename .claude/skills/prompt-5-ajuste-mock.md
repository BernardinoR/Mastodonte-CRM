# Skill: Ajustar Mock Existente

## Objetivo

Ajustar um mock existente com base no feedback do usuário, mantendo os dados fake e sem adicionar implementação real.

## Contexto Importante

### Regras do Mock (manter)

- Dados fake hardcoded — NÃO adicionar chamadas de API
- Visual completo e polido
- SEM lógica de negócio
- SEM TanStack Query, fetch ou mutations
- Comentários `// TODO:` para implementação futura

### Stack de Referência

- **Componentes UI:** `@/shared/components/ui/`
- **Design System:** Consultar página `/style-guides`
- **Path da página:** `client/src/features/[nome]/pages/[NomeDaPagina].tsx`
- **Sub-componentes:** `client/src/features/[nome]/components/`

## Passo a Passo

### 1. Identificar o Mock

Localizar o arquivo do mock em:

```
client/src/features/[nome]/pages/[NomeDaPagina].tsx
```

### 2. Entender o Feedback

Analisar o que o usuário pediu para ajustar:

- **Layout:** reorganizar seções, mudar grid, ajustar espaçamentos
- **Componentes:** trocar componente, adicionar novo, remover existente
- **Dados:** ajustar dados fake, adicionar campos, mudar formato
- **Visual:** cores, tamanhos, ícones, alinhamento
- **UX:** adicionar filtros, ordenação, paginação (tudo visual/fake)

### 3. Consultar o Design System

Antes de fazer qualquer ajuste visual:

- Verificar componentes disponíveis em `/style-guides`
- Usar variáveis CSS do tema (nunca cores hardcoded)
- Manter consistência com o resto do projeto

### 4. Aplicar Ajustes

#### Para mudanças de layout:

- Usar classes Tailwind do tema configurado
- Manter responsividade
- Seguir padrões de espaçamento existentes (`p-6`, `space-y-6`, `gap-4`)

#### Para novos componentes:

- Importar de `@/shared/components/ui/`
- Verificar se o componente já está instalado (52 componentes disponíveis)
- Se não estiver instalado, usar `npx shadcn@latest add [componente]`

#### Para ajustes de dados fake:

- Manter dados realistas e representativos
- Cobrir edge cases visuais (texto longo, lista vazia, muitos itens)
- Incluir variedade nos dados (diferentes status, datas, etc.)

#### Para extrair sub-componentes:

Se a página ficou grande, extrair componentes:

```
client/src/features/[nome]/components/[SubComponente].tsx
```

### 5. Manter Comentários TODO

Preservar e atualizar os `// TODO:` existentes:

```tsx
{
  /* TODO: Substituir por useQuery quando implementar */
}
{
  /* TODO: Conectar com endpoint real */
}
{
  /* TODO: Adicionar lógica de filtro */
}
```

### 6. Verificar Consistência

- O ajuste mantém o padrão visual do resto do mock?
- As cores e espaçamentos seguem o design system?
- Os componentes são do shadcn/ui?
- O layout funciona em diferentes larguras de tela?

## Tipos Comuns de Ajuste

### Trocar layout de tabela para cards:

```tsx
// De: <Table>...</Table>
// Para: grid de <Card>
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {MOCK_DATA.map((item) => (
    <Card key={item.id}>...</Card>
  ))}
</div>
```

### Adicionar filtros visuais (fake):

```tsx
const [filter, setFilter] = useState("all");
// Filtrar localmente nos dados fake
const filtered = MOCK_DATA.filter((item) => (filter === "all" ? true : item.status === filter));
```

### Adicionar barra de busca (fake):

```tsx
const [search, setSearch] = useState("");
const filtered = MOCK_DATA.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
```

### Adicionar tabs:

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

<Tabs defaultValue="all">
  <TabsList>
    <TabsTrigger value="all">Todos</TabsTrigger>
    <TabsTrigger value="active">Ativos</TabsTrigger>
  </TabsList>
  <TabsContent value="all">...</TabsContent>
  <TabsContent value="active">...</TabsContent>
</Tabs>;
```

## Resultado Esperado

- Mock atualizado conforme feedback do usuário
- Visual ajustado mantendo consistência com o design system
- Dados fake preservados (sem implementação real)
- Pronto para nova rodada de aprovação

## Checklist de Verificação

- [ ] Feedback do usuário atendido completamente
- [ ] Dados continuam fake/hardcoded
- [ ] Nenhuma chamada de API adicionada
- [ ] Comentários `// TODO:` preservados/atualizados
- [ ] Componentes de `@/shared/components/ui/`
- [ ] Cores e estilos do design system (sem hardcoded)
- [ ] Layout responsivo mantido
- [ ] Nenhuma referência a Next.js, app router ou server actions
- [ ] Consistência visual com o resto do projeto
