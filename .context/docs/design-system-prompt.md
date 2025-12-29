# CRM Mastodonte - Design System Completo

> **Documento para uso como prompt em IAs de design/mockup**
> Última atualização: Dezembro 2025

## Visão Geral do Produto

**Nome**: CRM Mastodonte  
**Tipo**: CRM especializado em Wealth Management  
**Público-Alvo**: Consultores de investimentos, assessores financeiros e gestores de patrimônio  
**Propósito**: Gerenciar relacionamento com clientes de alta renda, acompanhar patrimônio (AUM), organizar reuniões periódicas e controlar tasks de atendimento

### Contexto de Negócio - Wealth Management

O CRM foi desenvolvido especificamente para o mercado de gestão de patrimônio, onde:

- **Clientes** são investidores com patrimônio significativo (AUM - Assets Under Management)
- **Reuniões** são encontros periódicos (mensais, anuais, follow-ups) para revisão de carteira
- **Tasks** incluem atividades como rebalanceamento de carteira, envio de relatórios, prospecção
- **Métricas-chave**: AUM total, quantidade de reuniões, taxa de conversão de prospects
- **Comunicação**: Integração com WhatsApp para grupos de atendimento por cliente

### Fluxo Principal
```
Cliente → Reunião → Task
```

### Entidades Principais

| Entidade | Descrição |
|----------|-----------|
| **Cliente** | Investidor com dados pessoais, AUM, status (Ativo/Prospect/Distrato), consultor responsável |
| **Reunião** | Encontro agendado com tipo (Mensal/Anual/Follow-up/Patrimônio), status, pauta e resumo |
| **Task** | Atividade com prioridade, status, prazo, responsável e vínculo com cliente |
| **Grupo WhatsApp** | Canal de comunicação vinculado ao cliente |
| **Usuário** | Membro da equipe com roles (Administrador/Consultor/Alocador/Concierge) |

**Inspiração Visual**: Linear + Notion + Asana (híbrido)  
**Tema Padrão**: Dark Mode

---

## 1. PALETA DE CORES

### 1.1 Cores Base (Dark Mode - Padrão)

```css
/* Backgrounds - Escala de cinzas escuros */
--background: #0d0d0d;              /* Fundo principal da aplicação */
--card: #121212;                    /* Cards padrão */
--popover: #171717;                 /* Popovers e dropdowns */
--sidebar: #141414;                 /* Sidebar de navegação */
--muted: #212121;                   /* Áreas secundárias */

/* Cores específicas do sistema (hex direto) */
#1a1a1a   /* Popover background */
#1E1F24   /* Panel background (histórico, sidebars) */
#202020   /* Card background alternativo */
#252730   /* Card background principal */
#2a2a2a   /* Hover state */
#2c2c2c   /* Hover state alternativo */
#333333   /* Element background, borders */
#363842   /* Borders claras */

/* Borders */
--border: #212121;
--card-border: #1c1c1c;
--border-light: #363842;

/* Text */
--foreground: #ededed;              /* Texto principal (branco suave) */
--muted-foreground: #8c8c8c;        /* Texto secundário */
#64666E   /* Labels */
#9B9A97   /* Texto light */
#a0a0a0   /* Texto desabilitado */
```

### 1.2 Cores de Acento e Funcionais

```css
/* Primary - Azul */
--primary: #2563eb;                 /* Botões primários */
#2eaadc   /* Links, acentos, bordas de foco */
#4281dc   /* Borda esquerda de cards (padrão) */

/* Semantic Colors */
#6ecf8e   /* Verde - Sucesso, Done, Ativo */
#6db1d4   /* Azul claro - Info, In Progress */
#dcb092   /* Laranja - Warning, Importante */
#e07a7a   /* Vermelho - Error, Urgente */
#a78bfa   /* Roxo - Prospect, Especial */
```

### 1.3 Sistema de Status - Tasks

| Status | Background | Text |
|--------|------------|------|
| To Do | `#333333` | `#a0a0a0` |
| In Progress | `#243041` | `#6db1d4` |
| Done | `#203828` | `#6ecf8e` |

### 1.4 Sistema de Prioridade - Tasks

| Prioridade | Background | Text |
|------------|------------|------|
| Urgente | `#3d2626` | `#e07a7a` |
| Importante | `#422c24` | `#dcb092` |
| Normal | `#333333` | `#a0a0a0` |
| Baixa | `#1c3847` | `#6db1d4` |

### 1.5 Sistema de Status - Clientes

| Status | Background | Text |
|--------|------------|------|
| Ativo | `#203828` | `#6ecf8e` |
| Prospect | `#2a2a38` | `#a78bfa` |
| Distrato | `#382020` | `#f87171` |

### 1.6 Sistema de Status - Reuniões

| Status | Background | Text |
|--------|------------|------|
| Agendada | `#243041` | `#6db1d4` |
| Realizada | `#203828` | `#6ecf8e` |
| Cancelada | `#3d2626` | `#e07a7a` |

### 1.7 Tipos de Reunião

| Tipo | Background | Text |
|------|------------|------|
| Mensal / Anual | `#203828` | `#6ecf8e` |
| Follow-up / Política | `#422c24` | `#dcb092` |
| Especial / Patrimônio | `#38273f` | `#d09cdb` |

### 1.8 Roles de Usuário

| Role | Background | Text |
|------|------------|------|
| Administrador | `bg-red-500/20` | `text-red-400` |
| Consultor | `bg-blue-500/20` | `text-blue-400` |
| Alocador | `bg-orange-500/20` | `text-orange-400` |
| Concierge | `bg-purple-500/20` | `text-purple-400` |

### 1.9 Bordas Coloridas de Task Cards

```css
/* Borda esquerda de 6px */
Padrão (azul):     rgb(66, 129, 220)   /* #4281dc */
Atrasada (vermelho): rgb(185, 28, 28)  /* #b91c1c */
Concluída (verde):  rgb(16, 185, 129)  /* #10b981 */
```

---

## 2. TIPOGRAFIA

### 2.1 Font Family

```css
font-family: Inter, system-ui, sans-serif;
```

**CDN para carregar:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### 2.2 Hierarquia de Texto

| Uso | Tailwind Classes | Exemplo |
|-----|------------------|---------|
| Títulos de Página | `text-2xl font-semibold` | Nome do cliente, "Dashboard" |
| Títulos de Seção | `text-lg font-semibold` | "Reuniões", "Tasks" |
| Subtítulos | `text-base font-semibold` | Headers de modal |
| Títulos de Card | `text-base font-medium` | Nome da task |
| Corpo de Texto | `text-sm font-normal` | Descrições, notas |
| Metadata | `text-xs font-normal` | Datas, IDs |
| Labels | `text-xs font-medium uppercase tracking-wide` | Headers de tabela, form labels |

### 2.3 Cores de Texto

```css
/* Principal */
text-foreground      /* #ededed - Títulos, texto principal */
text-white           /* #ffffff - Ênfase máxima */

/* Secundário */
text-muted-foreground /* #8c8c8c - Subtextos */
text-gray-400        /* Labels, metadata */
text-gray-500        /* Placeholders */
```

---

## 3. LAYOUT E ESPAÇAMENTO

### 3.1 Grid System Principal

```
┌────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌────────────────────────────────────────┐│
│ │          │ │                                        ││
│ │ SIDEBAR  │ │          MAIN CONTENT                  ││
│ │          │ │                                        ││
│ │  w-64    │ │      flex-1 max-w-7xl mx-auto         ││
│ │ (256px)  │ │           px-6 ou px-8                ││
│ │          │ │                                        ││
│ └──────────┘ └────────────────────────────────────────┘│
└────────────────────────────────────────────────────────┘
```

### 3.2 Container Widths

```css
/* Sidebar */
width: 16rem (256px) - w-64

/* Main Content */
max-width: 72rem (1152px) - max-w-6xl
/* ou */
max-width: 80rem (1280px) - max-w-7xl

/* Forms/Modals pequenos */
max-width: 42rem (672px) - max-w-2xl

/* Modals grandes (TaskDetail) */
max-width: 75rem (1200px) - max-w-[1200px]
width: 90vw
height: 85vh
```

### 3.3 Spacing Scale (Tailwind)

```css
/* Unidades base - múltiplos de 4px */
1 = 0.25rem (4px)
2 = 0.5rem (8px)
3 = 0.75rem (12px)
4 = 1rem (16px)
6 = 1.5rem (24px)
8 = 2rem (32px)
12 = 3rem (48px)
16 = 4rem (64px)

/* Uso comum */
Padding interno de cards: p-4, p-6
Padding de células de tabela: py-3 px-4
Espaço entre seções: space-y-6, space-y-8, mb-8
Gaps em grids/flex: gap-2, gap-3, gap-4, gap-6
Margens de página: p-6, px-6, px-8
```

### 3.4 Border Radius

```css
/* Escala */
sm: 3px (0.1875rem)  /* Badges pequenos */
md: 6px (0.375rem)   /* Botões, inputs */
lg: 9px (0.5625rem)  /* Cards principais */
xl: 12px             /* Modals */
full: 9999px         /* Avatares, pills */

/* Default */
--radius: 0.5rem (8px)
```

---

## 4. COMPONENTES UI

### 4.1 Cards

```jsx
/* Card padrão shadcn */
<Card className="rounded-xl border bg-card border-card-border shadow-sm">
  <CardContent className="p-6">
    {/* conteúdo */}
  </CardContent>
</Card>

/* Card do sistema (tabelas, seções) */
<div className="bg-[#202020] border border-[#333333] rounded-lg overflow-hidden">
  {/* conteúdo */}
</div>

/* Card com borda colorida (TaskCard) */
<div className="bg-[#252730] border border-[#363842] rounded-xl border-l-[6px]"
     style={{ borderLeftColor: '#4281dc' }}>
  {/* conteúdo */}
</div>
```

### 4.2 Badges

```jsx
/* Badge padrão */
<span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold">
  {label}
</span>

/* Badge com dot indicator (status/priority) */
<span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-[#243041] text-[#6db1d4]">
  <span className="w-2 h-2 rounded-full bg-blue-500" />
  In Progress
</span>

/* Badge outline (client status) */
<span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium bg-green-500/10 text-green-500 border-green-500/20">
  Ativo
</span>
```

### 4.3 Botões

```jsx
/* Tamanhos */
default: "min-h-9 px-4 py-2"        /* Padrão */
sm: "min-h-8 px-3 text-xs"          /* Pequeno */
lg: "min-h-10 px-8"                 /* Grande */
icon: "h-9 w-9"                     /* Apenas ícone */

/* Variantes */
default: "bg-primary text-primary-foreground"           /* Azul sólido */
secondary: "bg-secondary text-secondary-foreground"     /* Cinza */
outline: "border bg-transparent"                        /* Contorno */
ghost: "hover:bg-accent"                               /* Transparente */
destructive: "bg-destructive text-destructive-foreground" /* Vermelho */

/* Botão de ação em hover (lixeira, editar) */
<button className="p-1 rounded hover:bg-[#3a2020] transition-all opacity-0 group-hover/row:opacity-100">
  <Trash2 className="w-3.5 h-3.5 text-red-400" />
</button>

/* Botão de link/texto */
<span className="text-sm text-[#2eaadc] hover:underline cursor-pointer">
  + Adicionar
</span>
```

### 4.4 Inputs

```jsx
/* Input inline (edição na tabela) */
<input className="bg-transparent border-b border-[#2eaadc] text-sm text-foreground font-medium placeholder:text-muted-foreground focus:outline-none w-full" />

/* Input em formulário */
<input className="w-full bg-[#252525] border border-[#333333] rounded-md p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#2eaadc]" />

/* Textarea */
<textarea className="w-full min-h-[120px] bg-[#252525] border border-[#333333] rounded-md p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#2eaadc] resize-none" />
```

### 4.5 Popovers/Dropdowns

```jsx
/* Container */
<div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg">
  {/* Seção: Item selecionado */}
  <div className="border-b border-[#2a2a2a]">
    <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
    <div className="px-3 py-1">
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[#2a2a2a]">
        {selectedItem}
      </div>
    </div>
  </div>
  
  {/* Seção: Outras opções */}
  <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
  <div className="pb-1">
    {options.map(option => (
      <div className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors">
        {option}
      </div>
    ))}
  </div>
</div>
```

### 4.6 Tabelas

```jsx
<div className="overflow-x-auto">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-[#333333]">
        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Coluna
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-[#333333] hover:bg-[#2c2c2c] transition-colors group/row cursor-pointer">
        <td className="py-3 px-4 text-foreground font-medium">
          {conteudo}
        </td>
      </tr>
    </tbody>
  </table>
  
  {/* Footer com ações */}
  <div className="flex items-center justify-between">
    <div className="py-3 px-4 text-sm text-[#2eaadc] hover:bg-[#2c2c2c] cursor-pointer">
      + Adicionar item
    </div>
    <div className="py-3 px-4 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
      Carregar mais
    </div>
  </div>
</div>
```

### 4.7 Modais/Dialogs

```jsx
/* Modal padrão (AlertDialog) */
<div className="bg-[#252525] border border-[#333333] rounded-lg p-6 max-w-md">
  <h2 className="text-lg font-semibold text-foreground mb-2">Título</h2>
  <p className="text-sm text-muted-foreground mb-6">Descrição</p>
  <div className="flex justify-end gap-3">
    <button className="bg-[#333333] border border-[#444444] text-foreground hover:bg-[#3a3a3a] px-4 py-2 rounded-md">
      Cancelar
    </button>
    <button className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md">
      Confirmar
    </button>
  </div>
</div>

/* Modal grande com duas colunas (TaskDetailModal) */
<div className="max-w-[1200px] w-[90vw] h-[85vh] bg-[#252730] border border-[#363842] rounded-xl border-l-[6px] overflow-hidden">
  <div className="flex h-full">
    {/* Coluna principal - 60% */}
    <div className="flex-[1.5] p-8 flex flex-col overflow-y-auto">
      {/* Header editável */}
      <h2 className="text-2xl font-bold text-white mb-4">{titulo}</h2>
      
      {/* Metadata */}
      <div className="flex items-center gap-4 mb-6">
        <Badge />
        <Date />
        <Assignees />
      </div>
      
      {/* Conteúdo */}
      <div className="flex-1">
        {/* Descrição, formulários, etc */}
      </div>
    </div>
    
    {/* Sidebar - 40% */}
    <div className="flex-1 bg-[#1E1F24] border-l border-[#363842] p-6 overflow-y-auto">
      {/* Timeline, histórico, comentários */}
    </div>
  </div>
</div>
```

### 4.8 Avatares

```jsx
/* Avatar com iniciais */
<div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-sm font-medium text-white">
  AB
</div>

/* Avatar stack (múltiplos) */
<div className="flex -space-x-2">
  <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-[#27282F]" />
  <div className="w-8 h-8 rounded-full bg-slate-500 border-2 border-[#27282F]" />
  <div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-[#27282F]" />
</div>
```

---

## 5. ESTRUTURA DE PÁGINAS

### 5.1 Sidebar de Navegação

```jsx
<aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
  {/* Header */}
  <div className="p-4 border-b border-sidebar-border flex items-center gap-2">
    <Logo className="w-7 h-7" />
    <span className="text-lg font-bold tracking-tight">Mastodonte</span>
  </div>
  
  {/* Menu */}
  <nav className="flex-1 p-2">
    <MenuItem icon={LayoutDashboard} label="Dashboard" href="/" />
    <MenuItem icon={Users} label="Clientes" href="/clients" />
    <MenuItem icon={Calendar} label="Reuniões" href="/meetings" />
    <MenuItem icon={CheckSquare} label="Tarefas" href="/tasks" />
  </nav>
  
  {/* Footer */}
  <div className="p-4 border-t border-sidebar-border">
    <UserCard />
    <LogoutButton />
  </div>
</aside>
```

### 5.2 Página de Listagem

```jsx
<main className="p-6 max-w-6xl mx-auto">
  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-semibold">Clientes</h1>
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Novo Cliente
    </Button>
  </div>
  
  {/* Filtros */}
  <div className="flex items-center gap-4 mb-6">
    <SearchInput />
    <FilterDropdown />
  </div>
  
  {/* Lista/Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map(item => <ItemCard />)}
  </div>
</main>
```

### 5.3 Página de Detalhe (Cliente)

```jsx
<main className="p-6 max-w-6xl mx-auto">
  {/* Back link */}
  <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
    <ArrowLeft className="w-4 h-4" />
    Voltar para Clientes
  </a>
  
  {/* Header do cliente */}
  <header className="mb-8">
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{clientName}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span>CPF: {cpf}</span>
          <span>Tel: {phone}</span>
          <Badge>{status}</Badge>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">Editar</Button>
        <Button>Nova Reunião</Button>
      </div>
    </div>
  </header>
  
  {/* Stats cards - Métricas típicas de Wealth Management */}
  <div className="grid grid-cols-4 gap-4 mb-8">
    <StatCard label="AUM Total" value="R$ 2,8M" change="+3.1%" />
    <StatCard label="Reuniões 2025" value="4" change="+1 vs 2024" />
    <StatCard label="Tasks Concluídas" value="7" change="100% no prazo" />
    <StatCard label="Indicações" value="1" change="Em prospecção" />
  </div>
  
  {/* Outras métricas comuns em Wealth Management:
    - Rentabilidade da carteira vs benchmark
    - Captação líquida do período
    - NPS do cliente
    - Tempo desde última reunião
    - Taxa de conversão de prospects
  */}
  
  {/* Seções */}
  <div className="space-y-8">
    <Section title="Tasks" icon={CheckSquare}>
      <TasksTable tasks={clientTasks} />
    </Section>
    
    <Section title="Reuniões" icon={Calendar}>
      <MeetingsTable meetings={clientMeetings} />
    </Section>
    
    <Section title="WhatsApp" icon={MessageCircle}>
      <WhatsAppTable groups={whatsappGroups} />
    </Section>
  </div>
</main>
```

### 5.4 Kanban Board

```jsx
<main className="h-[calc(100vh-4rem)] p-6 overflow-hidden">
  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-semibold">Tarefas</h1>
    <div className="flex gap-4">
      <ViewToggle />
      <Button>Nova Tarefa</Button>
    </div>
  </div>
  
  {/* Kanban */}
  <div className="flex gap-6 h-full overflow-x-auto pb-6">
    {/* Coluna To Do */}
    <div className="flex-1 min-w-[320px] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-gray-500" />
        <h3 className="text-sm font-medium uppercase">A Fazer</h3>
        <span className="text-xs text-muted-foreground bg-[#333] px-2 py-0.5 rounded">
          {count}
        </span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto">
        {tasks.map(task => <TaskCard />)}
      </div>
    </div>
    
    {/* Coluna In Progress */}
    <div className="flex-1 min-w-[320px] flex flex-col">
      {/* ... */}
    </div>
    
    {/* Coluna Done */}
    <div className="flex-1 min-w-[320px] flex flex-col">
      {/* ... */}
    </div>
  </div>
</main>
```

---

## 6. PADRÕES DE INTERAÇÃO

### 6.1 Hover States

```css
/* Card/Row hover */
hover:bg-[#2c2c2c] transition-colors

/* Link hover */
hover:text-[#2eaadc] hover:underline

/* Button hover - sistema elevate */
.hover-elevate::after { background-color: rgba(255,255,255, 0.03); }

/* Icon button hover */
hover:bg-[#333] rounded transition-colors
```

### 6.2 Focus States

```css
/* Input focus */
focus:outline-none focus:border-[#2eaadc]

/* Button focus */
focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
```

### 6.3 Estados de Seleção

```css
/* Item selecionado em lista */
bg-[#2a2a2a] rounded-md

/* Multi-select (Kanban) */
ring-2 ring-blue-500 ring-offset-2 ring-offset-[#1a1a1a]
```

### 6.4 Reveal on Hover

```jsx
/* Botões que aparecem no hover da row */
<tr className="group/row">
  <td>
    <button className="opacity-0 group-hover/row:opacity-100 transition-opacity">
      <Trash2 className="w-3.5 h-3.5 text-red-400" />
    </button>
  </td>
</tr>
```

### 6.5 Edição Inline

```jsx
/* Campo alternando entre view e edit */
{isEditing ? (
  <input 
    className="bg-transparent border-b-2 border-[#2eaadc] outline-none text-foreground"
    autoFocus
    onBlur={handleSave}
    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
  />
) : (
  <span 
    className="cursor-pointer px-1.5 py-0.5 -mx-1.5 rounded-md hover:bg-[#2c2c2c] transition-colors"
    onClick={() => setIsEditing(true)}
  >
    {value}
  </span>
)}
```

---

## 7. ÍCONES

### 7.1 Biblioteca

**Lucide React** - https://lucide.dev

```jsx
import { 
  // Navegação
  LayoutDashboard, Users, Calendar, CheckSquare, ArrowLeft,
  
  // Ações
  Plus, Trash2, Edit, X, Check, ChevronDown, ChevronRight,
  
  // Comunicação
  Mail, Phone, MessageCircle,
  
  // Conteúdo
  FileText, Paperclip, ListChecks,
  
  // Status
  AlertCircle, CheckCircle2, Clock,
  
  // Misc
  Settings, LogOut, Shield, User
} from "lucide-react";
```

### 7.2 Tamanhos Padrão

```css
/* Inline com texto */
w-4 h-4

/* Em botões */
w-5 h-5

/* Proeminente (headers) */
w-6 h-6

/* Pequeno (dentro de badges) */
w-3.5 h-3.5
```

---

## 8. ANIMAÇÕES E TRANSIÇÕES

### 8.1 Transições Padrão

```css
/* Cores e opacity */
transition-colors: 150ms ease
transition-opacity: 150ms ease

/* Todas as propriedades */
transition-all: 200ms ease
```

### 8.2 Entrada de Modais

```css
/* Fade in + scale */
@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
animation: modalEnter 0.2s ease-out;
```

### 8.3 Accordion

```css
animation: accordion-down 0.2s ease-out;
animation: accordion-up 0.2s ease-out;
```

### 8.4 Scrollbar

```css
/* Scrollbar fina e escura */
scrollbar-width: thin;
scrollbar-color: #4b5563 transparent;

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #6b7280;
}
```

---

## 9. RESPONSIVIDADE

### 9.1 Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop small */
xl: 1280px  /* Desktop */
2xl: 1536px /* Desktop large */
```

### 9.2 Comportamento por Breakpoint

| Breakpoint | Sidebar | Kanban | Grid |
|------------|---------|--------|------|
| < md | Colapsada/hamburger | 1 coluna scroll | 1 coluna |
| md - lg | Colapsável | 2 colunas scroll | 2 colunas |
| lg+ | Fixa 256px | 3 colunas | 3-4 colunas |

---

## 10. TEMPLATE DE PROMPT PARA MOCKUPS

Use este template ao solicitar novos mockups:

```
Crie um mockup para a tela de [NOME DA TELA] do CRM Mastodonte.

CONTEXTO:
- CRM especializado em Wealth Management para consultores de investimentos
- Usuários: assessores financeiros, gestores de patrimônio, equipes de atendimento
- Clientes são investidores de alta renda com AUM (Assets Under Management)
- Fluxo principal: Cliente → Reunião → Task
- Design system: Linear + Notion (dark mode)
- Font: Inter (Google Fonts)

VOCABULÁRIO DO DOMÍNIO:
- AUM: Assets Under Management (patrimônio gerenciado)
- Prospect: cliente em prospecção
- Distrato: cliente que encerrou relacionamento
- Reunião Mensal/Anual: revisões periódicas de carteira
- Follow-up: acompanhamento pós-reunião
- Consultor: profissional responsável pelo cliente

CORES PRINCIPAIS:
- Background: #0d0d0d a #121212
- Cards: #202020 a #252730
- Borders: #333333
- Accent azul: #2eaadc
- Success verde: #6ecf8e
- Warning laranja: #dcb092
- Error vermelho: #e07a7a

LAYOUT:
- Sidebar fixa à esquerda (256px)
- Conteúdo principal centralizado (max-width 1152px)
- Cards com border-radius 9px
- Espaçamentos múltiplos de 4px

ELEMENTOS DA TELA:
1. [Listar elementos específicos]
2. [Tabelas, cards, formulários]
3. [Ações e botões necessários]

INTERAÇÕES:
- [Descrever comportamentos esperados]
- [Hovers, clicks, modais]

REFERÊNCIA:
- Badges coloridos para status
- Botões aparecem em hover das rows
- Edição inline com borda azul
- Modais com duas colunas para detalhes
```

---

## 11. CHECKLIST DE CONSISTÊNCIA

Ao criar novas telas, verificar:

- [ ] Background escuro (#0d0d0d base)
- [ ] Font Inter em todos os textos
- [ ] Hierarquia de texto respeitada (2xl > lg > base > sm > xs)
- [ ] Espaçamentos múltiplos de 4px
- [ ] Badges usando cores do sistema de status
- [ ] Hover states em todos elementos clicáveis
- [ ] Border-radius consistente (9px cards, 6px botões)
- [ ] Ícones Lucide React nos tamanhos corretos
- [ ] Transições suaves (150-200ms)
- [ ] Scrollbar estilizada (6px, cinza)
- [ ] Bordas usando #333333 ou #363842
- [ ] Texto principal #ededed, secundário #8c8c8c
- [ ] Links e acentos em #2eaadc

---

*Documento gerado para uso como referência de design e prompt para IAs de mockup.*

