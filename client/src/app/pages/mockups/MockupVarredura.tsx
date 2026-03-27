import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Layers,
  ArrowDownUp,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  MessageSquare,
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users as UsersIcon,
  Building2,
  Filter,
  X,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

type VarreduraStatus = "pendente" | "solicitado" | "verificado";

interface DirectInstitution {
  name: string;
  initials: string;
  status: VarreduraStatus;
  method: "Automático" | "Manual";
}

interface ManagerClient {
  initials: string;
  name: string;
  institution: string;
  status: VarreduraStatus;
  accountType: string;
}

interface ManagerGroup {
  managerName: string;
  managerInitials: string;
  institution: string;
  clients: ManagerClient[];
}

const STATUS_STYLES: Record<VarreduraStatus, { bg: string; text: string; dot: string; border: string }> = {
  pendente: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-500", border: "border-orange-500/20" },
  solicitado: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-500", border: "border-blue-500/20" },
  verificado: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500", border: "border-emerald-500/20" },
};

const METHOD_STYLES: Record<string, string> = {
  "Automático": "bg-emerald-950/20 text-emerald-500 border-emerald-500/20",
  "Manual": "bg-zinc-800 text-zinc-500 border-transparent",
};

const directInstitutions: DirectInstitution[] = [
  { name: "XP Investimentos", initials: "XP", status: "verificado", method: "Automático" },
  { name: "BTG Pactual", initials: "BT", status: "verificado", method: "Automático" },
  { name: "Avenue Securities", initials: "AV", status: "verificado", method: "Automático" },
  { name: "Warren", initials: "WR", status: "pendente", method: "Manual" },
  { name: "Inter", initials: "IN", status: "pendente", method: "Manual" },
  { name: "Guide Investimentos", initials: "GI", status: "pendente", method: "Manual" },
  { name: "Safra", initials: "SF", status: "solicitado", method: "Manual" },
  { name: "Modal Mais", initials: "MM", status: "pendente", method: "Manual" },
];

const managerGroups: ManagerGroup[] = [
  {
    managerName: "Carlos Eduardo",
    managerInitials: "CE",
    institution: "Itau Personnalite",
    clients: [
      { initials: "AS", name: "Ana Souza", institution: "Itau", status: "solicitado", accountType: "Principal" },
      { initials: "RM", name: "Roberto Mendes", institution: "Itau", status: "pendente", accountType: "Principal" },
      { initials: "JP", name: "Joao Pereira", institution: "Itau", status: "pendente", accountType: "Holding" },
      { initials: "MO", name: "Maria Oliveira", institution: "Itau", status: "solicitado", accountType: "Principal" },
    ],
  },
  {
    managerName: "Patricia Lopes",
    managerInitials: "PL",
    institution: "Bradesco Prime",
    clients: [
      { initials: "CF", name: "Carlos Ferreira", institution: "Bradesco", status: "pendente", accountType: "Principal" },
      { initials: "LG", name: "Lucia Gomes", institution: "Bradesco", status: "pendente", accountType: "Principal" },
    ],
  },
  {
    managerName: "Fernando Reis",
    managerInitials: "FR",
    institution: "Santander Select",
    clients: [
      { initials: "TN", name: "Thiago Nascimento", institution: "Santander", status: "verificado", accountType: "Principal" },
    ],
  },
];

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Tarefas", url: "/tasks", icon: CheckSquare },
  { title: "Consolidador", url: "/consolidador", icon: Layers },
  { title: "Varredura", url: "/varredura", icon: ArrowDownUp },
];

function MockupSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="25" width="8" height="20" rx="2" fill="currentColor" />
            <rect x="18" y="15" width="8" height="30" rx="2" fill="currentColor" />
            <path d="M31 15H39V30C39 38 47 38 47 30" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
          </svg>
          <span className="text-lg font-bold tracking-tight">Mastodonte</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton data-active={item.title === "Varredura"} data-testid={`nav-${item.title.toLowerCase()}`}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3 rounded-md p-2 hover:bg-sidebar-accent" data-testid="user-card-mockup">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-sm">RB</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" data-testid="text-username-mockup">Rafael Bernardino</p>
            <Badge variant="outline" className="mt-1 h-4 px-1.5 py-0 text-[10px] bg-blue-500/20 text-blue-400 border-blue-500/30">
              Consultor
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" data-testid="button-logout-mockup">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

function StatusBadge({ status }: { status: VarreduraStatus }) {
  const s = STATUS_STYLES[status];
  const labels: Record<VarreduraStatus, string> = { pendente: "Pendente", solicitado: "Solicitado", verificado: "Verificado" };
  return (
    <Badge className={`${s.bg} ${s.text} cursor-pointer rounded-lg border-transparent px-3 py-1 text-[11px] font-bold`}>
      {labels[status]}
    </Badge>
  );
}

function MethodBadge({ method }: { method: string }) {
  return (
    <Badge className={`${METHOD_STYLES[method]} rounded-lg px-3 py-1 text-[11px] font-bold`}>
      {method}
    </Badge>
  );
}

function DirectInstitutionRow({ inst }: { inst: DirectInstitution }) {
  const s = STATUS_STYLES[inst.status];
  return (
    <div className="group flex items-center gap-4 rounded-lg px-5 py-2 hover:bg-white/5" data-testid={`row-direct-${inst.initials.toLowerCase()}`}>
      <span className={`h-2 w-2 flex-shrink-0 rounded-full ${s.dot}`} />
      <span className="w-48 text-sm font-medium text-zinc-300">{inst.name}</span>
      <MethodBadge method={inst.method} />
      <StatusBadge status={inst.status} />
      <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-white/10 hover:text-zinc-300" data-testid={`button-open-${inst.initials.toLowerCase()}`}>
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ManagerClientRow({ client }: { client: ManagerClient }) {
  const s = STATUS_STYLES[client.status];
  return (
    <div className="group flex items-center gap-4 rounded-lg px-5 py-2 hover:bg-white/5" data-testid={`row-client-${client.initials.toLowerCase()}`}>
      <span className={`h-2 w-2 flex-shrink-0 rounded-full ${s.dot}`} />
      <span className="w-48 text-sm font-medium text-zinc-300">{client.name}</span>
      <span className="w-16 text-xs text-zinc-600">{client.accountType}</span>
      <StatusBadge status={client.status} />
      <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-green-600 hover:bg-white/10 hover:text-green-400" data-testid={`button-whatsapp-${client.initials.toLowerCase()}`}>
          <MessageSquare className="h-3.5 w-3.5" />
        </button>
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-white/10 hover:text-zinc-300" data-testid={`button-email-${client.initials.toLowerCase()}`}>
          <Mail className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ManagerGroupSection({ group }: { group: ManagerGroup }) {
  const [expanded, setExpanded] = useState(group.managerName === "Carlos Eduardo");
  const pendingCount = group.clients.filter((c) => c.status === "pendente").length;
  const colors = { bg: "bg-blue-500/10", text: "text-blue-400" };

  return (
    <div className="border-b border-white/5" data-testid={`group-manager-${group.managerInitials.toLowerCase()}`}>
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger className="flex w-full items-center gap-4 rounded-lg px-4 py-3 hover:bg-white/5">
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${expanded ? "" : "-rotate-90"}`} />
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${colors.bg}`}>
            <span className={`text-xs font-bold ${colors.text}`}>{group.managerInitials}</span>
          </div>
          <span className="text-base font-bold text-white">{group.managerName}</span>
          <span className="text-xs text-zinc-600">{group.institution}</span>
          {pendingCount > 0 && (
            <span className="rounded bg-red-950/40 px-2.5 py-1 text-[10px] font-bold uppercase text-red-500">
              {pendingCount} PENDENTE{pendingCount > 1 ? "S" : ""}
            </span>
          )}
          <span className="ml-auto text-xs text-zinc-600">
            {group.clients.length} cliente{group.clients.length > 1 ? "s" : ""}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-1 space-y-0 pl-12">
            {group.clients.map((client, idx) => (
              <ManagerClientRow key={idx} client={client} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function VarreduraContent() {
  const [activeFilter, setActiveFilter] = useState<VarreduraStatus | null>(null);
  const [groupBy, setGroupBy] = useState<"gerente" | "instituicao">("gerente");

  const pendentes = directInstitutions.filter((i) => i.status === "pendente").length +
    managerGroups.reduce((s, g) => s + g.clients.filter((c) => c.status === "pendente").length, 0);
  const solicitados = directInstitutions.filter((i) => i.status === "solicitado").length +
    managerGroups.reduce((s, g) => s + g.clients.filter((c) => c.status === "solicitado").length, 0);
  const verificados = directInstitutions.filter((i) => i.status === "verificado").length +
    managerGroups.reduce((s, g) => s + g.clients.filter((c) => c.status === "verificado").length, 0);

  const handleFilterClick = (status: VarreduraStatus) => {
    setActiveFilter(activeFilter === status ? null : status);
  };

  return (
    <div className="flex flex-col gap-6 px-8 pb-32 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="mb-2 text-3xl font-bold text-white" data-testid="text-page-title">Varredura de Saldo</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => handleFilterClick("pendente")}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-950/30 px-4 py-1.5 text-[11px] font-black uppercase text-orange-400 transition-all hover:bg-orange-500/20 ${activeFilter === "pendente" ? "ring-2 ring-orange-500/40" : ""}`}
          data-testid="filter-pendentes"
        >
          <AlertTriangle className="h-4 w-4" />
          {pendentes} Pendentes
        </button>
        <button
          onClick={() => handleFilterClick("solicitado")}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-950/30 px-4 py-1.5 text-[11px] font-black uppercase text-blue-400 transition-all hover:bg-blue-500/20 ${activeFilter === "solicitado" ? "ring-2 ring-blue-500/40" : ""}`}
          data-testid="filter-solicitados"
        >
          <Mail className="h-4 w-4" />
          {solicitados} Solicitados
        </button>
        <button
          onClick={() => handleFilterClick("verificado")}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-950/30 px-4 py-1.5 text-[11px] font-black uppercase text-green-400 transition-all hover:bg-green-500/20 ${activeFilter === "verificado" ? "ring-2 ring-green-500/40" : ""}`}
          data-testid="filter-verificados"
        >
          <CheckCircle className="h-4 w-4" />
          {verificados} Verificados
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-9 items-center rounded-xl border border-white/5 bg-[#111] p-0.5">
          <button
            onClick={() => setGroupBy("gerente")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${groupBy === "gerente" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            data-testid="toggle-group-gerente"
          >
            <UsersIcon className="h-3.5 w-3.5" />
            Gerente
          </button>
          <button
            onClick={() => setGroupBy("instituicao")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${groupBy === "instituicao" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            data-testid="toggle-group-instituicao"
          >
            <Building2 className="h-3.5 w-3.5" />
            Instituição
          </button>
        </div>
        {activeFilter && (
          <button
            onClick={() => setActiveFilter(null)}
            className="ml-2 flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white"
            data-testid="button-clear-filters"
          >
            <X className="h-3 w-3" />
            Limpar filtro
          </button>
        )}
      </div>

      <section>
        <div className="flex items-center gap-3 py-3">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500" data-testid="text-section-direct">
            Acesso Direto
          </h2>
          <span className="inline-flex items-center rounded-md bg-emerald-950/30 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
            {directInstitutions.length}
          </span>
        </div>
        <div className="flex flex-col gap-0">
          {directInstitutions
            .filter((i) => !activeFilter || i.status === activeFilter)
            .map((inst) => (
              <DirectInstitutionRow key={inst.name} inst={inst} />
            ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 py-3">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500" data-testid="text-section-manager">
            Via Gerente
          </h2>
          <span className="inline-flex items-center rounded-md bg-orange-500/20 px-2 py-0.5 text-[10px] font-black text-orange-400">
            {managerGroups.reduce((s, g) => s + g.clients.filter((c) => c.status === "pendente" || c.status === "solicitado").length, 0)}
          </span>
        </div>
        <div className="flex flex-col gap-0">
          {managerGroups.map((group) => (
            <ManagerGroupSection key={group.managerName} group={group} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function MockupVarredura() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full" data-testid="mockup-varredura">
        <MockupSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-border p-3">
            <div className="flex flex-wrap items-center gap-1">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <Button size="icon" variant="ghost" data-testid="button-nav-back">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="button-nav-forward">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <VarreduraContent />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
