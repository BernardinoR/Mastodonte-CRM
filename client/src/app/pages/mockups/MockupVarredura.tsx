import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Layers,
  ArrowDownUp,
  LogOut,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
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
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

type InstitutionStatus = "verificado" | "pendente" | "solicitado";

interface Institution {
  name: string;
  initials: string;
  status: InstitutionStatus;
  method: "Automático" | "Manual";
}

interface ManagerClient {
  initials: string;
  name: string;
  status: InstitutionStatus;
  accountType: string;
}

interface ManagerGroup {
  name: string;
  initials: string;
  clientCount: number;
  clients: ManagerClient[];
}

const directAccessInstitutions: Institution[] = [
  { name: "XP Investimentos", initials: "XP", status: "verificado", method: "Automático" },
  { name: "BTG Pactual", initials: "BT", status: "verificado", method: "Automático" },
  { name: "Avenue", initials: "AV", status: "verificado", method: "Automático" },
  { name: "Warren", initials: "WR", status: "pendente", method: "Manual" },
  { name: "Inter", initials: "IN", status: "pendente", method: "Manual" },
  { name: "Guide", initials: "GI", status: "solicitado", method: "Manual" },
  { name: "Safra", initials: "SF", status: "pendente", method: "Manual" },
  { name: "Modal", initials: "MM", status: "pendente", method: "Manual" },
];

const managerGroups: ManagerGroup[] = [
  {
    name: "Itau Personnalite",
    initials: "IP",
    clientCount: 4,
    clients: [
      { initials: "AS", name: "Ana Souza", status: "solicitado", accountType: "Principal" },
      { initials: "RM", name: "Roberto Mendes", status: "pendente", accountType: "Principal" },
      { initials: "JP", name: "Joao Pereira", status: "pendente", accountType: "Holding" },
      { initials: "MO", name: "Maria Oliveira", status: "solicitado", accountType: "Principal" },
    ],
  },
  {
    name: "Bradesco Prime",
    initials: "BP",
    clientCount: 2,
    clients: [
      { initials: "CF", name: "Carlos Ferreira", status: "pendente", accountType: "Principal" },
      { initials: "LG", name: "Lucia Gomes", status: "pendente", accountType: "Principal" },
    ],
  },
];

const STATUS_CONFIG: Record<
  InstitutionStatus,
  { label: string; color: string; bg: string; border: string; borderActive: string; dot: string; gradient: string; Icon: typeof CheckCircle }
> = {
  verificado: {
    label: "Verificado",
    color: "text-[#6ecf8e]",
    bg: "bg-[rgba(110,207,142,0.1)]",
    border: "border-[rgba(110,207,142,0.2)]",
    borderActive: "border-[#6ecf8e]",
    dot: "bg-[#6ecf8e]",
    gradient: "bg-gradient-to-br from-[rgba(110,207,142,0.1)] to-[rgba(110,207,142,0.03)]",
    Icon: CheckCircle,
  },
  pendente: {
    label: "Pendente",
    color: "text-[#dcb092]",
    bg: "bg-[rgba(220,176,146,0.1)]",
    border: "border-[rgba(220,176,146,0.2)]",
    borderActive: "border-[#dcb092]",
    dot: "bg-[#dcb092]",
    gradient: "bg-gradient-to-br from-[rgba(220,176,146,0.1)] to-[rgba(220,176,146,0.03)]",
    Icon: AlertTriangle,
  },
  solicitado: {
    label: "Solicitado",
    color: "text-[#6db1d4]",
    bg: "bg-[rgba(109,177,212,0.1)]",
    border: "border-[rgba(109,177,212,0.2)]",
    borderActive: "border-[#6db1d4]",
    dot: "bg-[#6db1d4]",
    gradient: "bg-gradient-to-br from-[rgba(109,177,212,0.1)] to-[rgba(109,177,212,0.03)]",
    Icon: Clock,
  },
};

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
            <Badge variant="outline" className="mt-1 h-4 px-1.5 py-0 text-[10px] bg-[rgba(109,177,212,0.15)] text-[#6db1d4] border-[rgba(109,177,212,0.3)]">
              Consultor
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-[#8c8c8c]" data-testid="button-logout-mockup">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

function SummaryCards() {
  const verified = directAccessInstitutions.filter((i) => i.status === "verificado").length;
  const pending = directAccessInstitutions.filter((i) => i.status === "pendente").length +
    managerGroups.reduce((s, g) => s + g.clients.filter((c) => c.status === "pendente").length, 0);
  const solicited = directAccessInstitutions.filter((i) => i.status === "solicitado").length +
    managerGroups.reduce((s, g) => s + g.clients.filter((c) => c.status === "solicitado").length, 0);
  const total = directAccessInstitutions.length + managerGroups.reduce((s, g) => s + g.clientCount, 0);

  const cards = [
    { label: "Pendentes", value: pending, ...STATUS_CONFIG.pendente },
    { label: "Solicitados", value: solicited, ...STATUS_CONFIG.solicitado },
    { label: "Verificados", value: verified, ...STATUS_CONFIG.verificado },
    { label: "Total Contas", value: total, color: "text-[#ededed]", bg: "bg-[rgba(237,237,237,0.05)]", border: "border-[rgba(237,237,237,0.1)]", gradient: "bg-gradient-to-br from-[rgba(237,237,237,0.06)] to-[rgba(237,237,237,0.02)]", dot: "bg-[#ededed]", Icon: Shield, borderActive: "", },
  ];

  return (
    <div className="flex gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`relative flex flex-1 flex-col gap-1.5 overflow-hidden rounded-xl border p-3 px-4 ${c.gradient} ${c.border}`}
          data-testid={`stat-${c.label.toLowerCase()}`}
        >
          <div
            className={`absolute left-0 right-0 top-0 h-[3px] ${c.dot.replace("bg-", "bg-")}`}
            style={{ opacity: 0.6 }}
          />
          <c.Icon className={`h-4 w-4 opacity-80 ${c.color}`} />
          <span className={`text-lg font-bold ${c.color}`}>{c.value}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-[#8c8c8c]">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

function InstitutionCard({ institution }: { institution: Institution }) {
  const sc = STATUS_CONFIG[institution.status];
  const isAuto = institution.method === "Automático";

  return (
    <div
      className={`group relative flex flex-col gap-3 overflow-hidden rounded-xl border p-4 transition-all hover:translate-y-[-1px] ${sc.gradient} ${sc.border}`}
      data-testid={`card-institution-${institution.name.toLowerCase().replace(/\s/g, "-")}`}
    >
      <div className={`absolute left-0 right-0 top-0 h-[2px] ${sc.dot}`} style={{ opacity: 0.5 }} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-md ${sc.bg}`}>
            <span className={`text-xs font-bold ${sc.color}`}>{institution.initials}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#ededed]">{institution.name}</span>
            <span className="flex items-center gap-1 text-[10px] text-[#8c8c8c]">
              {isAuto ? <Zap className="h-2.5 w-2.5 text-[#6ecf8e]" /> : <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />}
              {institution.method}
            </span>
          </div>
        </div>
        <span
          className="flex items-center gap-1 text-[10px] font-medium text-[#555] opacity-0 transition-opacity group-hover:opacity-100"
          data-testid={`link-access-${institution.initials.toLowerCase()}`}
        >
          <ExternalLink className="h-3 w-3" />
        </span>
      </div>

      <div className="flex items-center gap-2">
        <sc.Icon className={`h-3 w-3 ${sc.color}`} />
        <span className={`text-[11px] font-semibold ${sc.color}`}>{sc.label}</span>
      </div>
    </div>
  );
}

function ManagerGroupCard({ group }: { group: ManagerGroup }) {
  const [expanded, setExpanded] = useState(group.name === "Itau Personnalite");
  const pendingCount = group.clients.filter((c) => c.status === "pendente").length;
  const solicitedCount = group.clients.filter((c) => c.status === "solicitado").length;

  return (
    <div
      className="overflow-hidden rounded-xl border border-[#3a3a3a] bg-[#1a1a1a]"
      data-testid={`card-manager-${group.name.toLowerCase().replace(/\s/g, "-")}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#222222]"
        data-testid={`button-toggle-${group.name.toLowerCase().replace(/\s/g, "-")}`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[rgba(109,177,212,0.1)]">
          <span className="text-[10px] font-bold text-[#6db1d4]">{group.initials}</span>
        </div>
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-[#ededed]">{group.name}</span>
          <span className="text-xs text-[#666]">{group.clientCount} clientes</span>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[rgba(220,176,146,0.1)] px-2 py-0.5 text-[10px] font-semibold text-[#dcb092]">
              {pendingCount}
            </span>
          )}
          {solicitedCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[rgba(109,177,212,0.1)] px-2 py-0.5 text-[10px] font-semibold text-[#6db1d4]">
              {solicitedCount}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-[#555]" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-[#555]" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-[#2a2a2a]">
          {group.clients.map((client, idx) => {
            const sc = STATUS_CONFIG[client.status];
            return (
              <div
                key={idx}
                className={`group/row flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#1e1e1e] ${
                  idx < group.clients.length - 1 ? "border-b border-[#252525]" : ""
                }`}
                data-testid={`row-client-${client.initials.toLowerCase()}`}
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${sc.dot}`} />
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#252525]">
                  <span className="text-[9px] font-bold text-[#999]">{client.initials}</span>
                </div>
                <span className="w-40 shrink-0 text-sm font-medium text-[#ccc]">{client.name}</span>
                <span className="text-xs text-[#555]">{client.accountType}</span>
                <span className={`ml-auto inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-semibold ${sc.bg} ${sc.color}`}>
                  <sc.Icon className="h-3 w-3" />
                  {sc.label}
                </span>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover/row:opacity-100">
                  <button
                    className="flex h-7 w-7 items-center justify-center rounded-md text-[#555] hover:bg-[#333] hover:text-[#6ecf8e]"
                    data-testid={`button-whatsapp-${client.initials.toLowerCase()}`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="flex h-7 w-7 items-center justify-center rounded-md text-[#555] hover:bg-[#333] hover:text-[#6db1d4]"
                    data-testid={`button-email-${client.initials.toLowerCase()}`}
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VarreduraContent() {
  return (
    <div className="flex flex-col gap-6 px-8 pb-32 pt-6">
      <h1 className="text-3xl font-bold text-[#ededed]" data-testid="text-page-title">Varredura de Saldo</h1>

      <SummaryCards />

      <section>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#666]" data-testid="text-section-direct">
            Acesso Direto
          </h2>
          <span className="inline-flex items-center rounded-md bg-[rgba(110,207,142,0.1)] px-2 py-0.5 text-[10px] font-bold text-[#6ecf8e]">
            {directAccessInstitutions.filter((i) => i.status === "verificado").length}/{directAccessInstitutions.length}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {directAccessInstitutions.map((inst) => (
            <InstitutionCard key={inst.name} institution={inst} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#666]" data-testid="text-section-manager">
            Via Gerente
          </h2>
          <span className="inline-flex items-center rounded-md bg-[rgba(220,176,146,0.1)] px-2 py-0.5 text-[10px] font-bold text-[#dcb092]">
            {managerGroups.reduce((s, g) => s + g.clients.filter((c) => c.status !== "verificado").length, 0)} pendentes
          </span>
        </div>
        <div className="space-y-3">
          {managerGroups.map((group) => (
            <ManagerGroupCard key={group.name} group={group} />
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
          <header className="flex items-center justify-between border-b border-[#2a2a2a] p-3">
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
          <main className="flex-1 overflow-auto bg-[#121212]">
            <VarreduraContent />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
