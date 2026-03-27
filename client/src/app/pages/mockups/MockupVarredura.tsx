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
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
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
  initial: string;
  status: InstitutionStatus;
  enabled: boolean;
}

interface ManagerClient {
  initials: string;
  name: string;
  status: InstitutionStatus;
  description: string;
}

interface ManagerGroup {
  name: string;
  initial: string;
  clientCount: number;
  pendingCount: number;
  clients: ManagerClient[];
}

const directAccessInstitutions: Institution[] = [
  { name: "XP", initial: "X", status: "pendente", enabled: false },
  { name: "BTG", initial: "B", status: "verificado", enabled: true },
  { name: "Avenue", initial: "A", status: "verificado", enabled: true },
  { name: "Warren", initial: "W", status: "pendente", enabled: false },
  { name: "Inter", initial: "I", status: "pendente", enabled: false },
  { name: "Guide", initial: "G", status: "pendente", enabled: false },
  { name: "Safra", initial: "S", status: "pendente", enabled: false },
  { name: "Modal", initial: "M", status: "pendente", enabled: false },
];

const managerGroups: ManagerGroup[] = [
  {
    name: "Itau Personnalite",
    initial: "IP",
    clientCount: 4,
    pendingCount: 2,
    clients: [
      { initials: "AS", name: "Ana Souza", status: "solicitado", description: "Aguardando resposta do gerente..." },
      { initials: "RM", name: "Roberto Mendes", status: "pendente", description: "Pronto para envio" },
      { initials: "JP", name: "Joao Pereira", status: "pendente", description: "Pronto para envio" },
      { initials: "MO", name: "Maria Oliveira", status: "solicitado", description: "Aguardando resposta do gerente..." },
    ],
  },
  {
    name: "Bradesco Prime",
    initial: "BP",
    clientCount: 2,
    pendingCount: 2,
    clients: [
      { initials: "CF", name: "Carlos Ferreira", status: "pendente", description: "Pronto para envio" },
      { initials: "LG", name: "Lucia Gomes", status: "pendente", description: "Pronto para envio" },
    ],
  },
];

const statusConfig: Record<InstitutionStatus, { label: string; textColor: string; bgColor: string; borderColor: string; Icon: typeof CheckCircle }> = {
  verificado: { label: "VERIFICADO", textColor: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/20", Icon: CheckCircle },
  pendente: { label: "PENDENTE", textColor: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/20", Icon: AlertTriangle },
  solicitado: { label: "SOLICITADO", textColor: "text-sky-400", bgColor: "bg-sky-500/10", borderColor: "border-sky-500/20", Icon: Clock },
};

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Tarefas", url: "/tasks", icon: CheckSquare },
  { title: "Consolidador", url: "/consolidador", icon: Layers },
  { title: "Varredura", url: "/varredura", icon: ArrowDownUp },
];

function StatusBadge({ status }: { status: InstitutionStatus }) {
  const c = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${c.textColor} ${c.bgColor} ${c.borderColor}`}
      data-testid={`badge-status-${status}`}
    >
      <c.Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

function MockupSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="5" y="25" width="8" height="20" rx="2" fill="currentColor" />
            <rect x="18" y="15" width="8" height="30" rx="2" fill="currentColor" />
            <path
              d="M31 15H39V30C39 38 47 38 47 30"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
            />
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
                  <SidebarMenuButton
                    data-active={item.title === "Varredura"}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
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
        <div
          className="mb-3 flex items-center gap-3 rounded-md p-2 hover:bg-sidebar-accent"
          data-testid="user-card-mockup"
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-sm">RB</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" data-testid="text-username-mockup">
              Rafael Bernardino
            </p>
            <Badge
              variant="outline"
              className="mt-1 h-4 px-1.5 py-0 text-[10px] bg-blue-500/20 text-blue-400 border-blue-500/30"
            >
              Consultor
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          data-testid="button-logout-mockup"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

function InstitutionCard({ institution }: { institution: Institution }) {
  const [enabled, setEnabled] = useState(institution.enabled);
  const sc = statusConfig[institution.status];

  return (
    <div
      className={`group flex flex-col gap-3 rounded-lg border p-4 transition-colors ${
        enabled
          ? "border-border/60 bg-card"
          : "border-border/30 bg-card/40"
      } hover:border-border`}
      data-testid={`card-institution-${institution.name.toLowerCase()}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-7 w-7 items-center justify-center rounded-md ${sc.bgColor}`}>
            <span className={`text-xs font-bold ${sc.textColor}`}>{institution.initial}</span>
          </div>
          <span className="text-sm font-semibold text-foreground">{institution.name}</span>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className="transition-colors"
          data-testid={`toggle-${institution.name.toLowerCase()}`}
        >
          {enabled ? (
            <ToggleRight className="h-6 w-6 text-emerald-400" />
          ) : (
            <ToggleLeft className="h-6 w-6 text-muted-foreground/50" />
          )}
        </button>
      </div>
      <div className="flex items-center justify-between">
        <StatusBadge status={institution.status} />
        <span
          className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 transition-colors group-hover:text-muted-foreground"
          data-testid={`link-access-${institution.name.toLowerCase()}`}
        >
          Acessar <ExternalLink className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}

function ManagerGroupCard({ group }: { group: ManagerGroup }) {
  const [expanded, setExpanded] = useState(group.name === "Itau Personnalite");

  return (
    <div
      className="overflow-hidden rounded-lg border border-border/60"
      data-testid={`card-manager-${group.name.toLowerCase().replace(/\s/g, "-")}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 bg-card/60 px-4 py-3.5 text-left transition-colors hover:bg-card"
        data-testid={`button-toggle-${group.name.toLowerCase().replace(/\s/g, "-")}`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-500/10">
          <span className="text-[10px] font-bold text-orange-400">{group.initial}</span>
        </div>
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-foreground">{group.name}</span>
          <span className="text-xs text-muted-foreground/60">{group.clientCount} clientes</span>
          {group.pendingCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-400">
              <AlertTriangle className="h-3 w-3" />
              {group.pendingCount} pendentes
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground/50" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground/50" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border/40">
          {group.clients.map((client, idx) => {
            const sc = statusConfig[client.status];
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02] ${
                  idx < group.clients.length - 1 ? "border-b border-border/30" : ""
                }`}
                data-testid={`row-client-${client.initials.toLowerCase()}`}
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${sc.bgColor}`}>
                  <span className={`text-[9px] font-bold ${sc.textColor}`}>{client.initials}</span>
                </div>
                <span className="w-36 shrink-0 text-sm font-medium text-foreground">{client.name}</span>
                <StatusBadge status={client.status} />
                <span className="ml-2 flex-1 truncate text-xs italic text-muted-foreground/60">{client.description}</span>
                <div className="flex shrink-0 items-center gap-1.5 ml-auto">
                  <button
                    className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-500/60 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
                    data-testid={`button-whatsapp-${client.initials.toLowerCase()}`}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-muted hover:text-muted-foreground"
                    data-testid={`button-email-${client.initials.toLowerCase()}`}
                  >
                    <Mail className="h-4 w-4" />
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
  const verified = directAccessInstitutions.filter(i => i.status === "verificado").length;
  const pending = directAccessInstitutions.filter(i => i.status === "pendente").length;
  const managerPending = managerGroups.reduce((s, g) => s + g.pendingCount, 0);
  const solicitados = managerGroups.reduce((s, g) => s + g.clients.filter(c => c.status === "solicitado").length, 0);
  const total = directAccessInstitutions.length + managerGroups.reduce((s, g) => s + g.clientCount, 0);

  const summaryItems = [
    { label: "Pendentes", value: pending + managerPending, textColor: "text-orange-400", bgColor: "bg-orange-950/30", borderColor: "border-orange-500/30", Icon: AlertTriangle },
    { label: "Solicitados", value: solicitados, textColor: "text-sky-400", bgColor: "bg-sky-950/30", borderColor: "border-sky-500/30", Icon: Clock },
    { label: "Verificados", value: verified, textColor: "text-emerald-400", bgColor: "bg-emerald-950/30", borderColor: "border-emerald-500/30", Icon: CheckCircle },
  ];

  return (
    <div className="flex flex-col gap-6 px-8 pb-32 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white" data-testid="text-page-title">
          Varredura de Saldo
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {summaryItems.map((item) => (
          <button
            key={item.label}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-1.5 text-[11px] font-black uppercase transition-all hover:brightness-125 ${item.textColor} ${item.bgColor} ${item.borderColor}`}
            data-testid={`filter-${item.label.toLowerCase()}`}
          >
            <item.Icon className="h-4 w-4" />
            {item.value} {item.label}
          </button>
        ))}
        <div className="h-6 w-px bg-border" />
        <span className="text-xs text-muted-foreground">
          {verified} / {total} verificadas
        </span>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all"
            style={{ width: `${Math.round((verified / total) * 100)}%` }}
          />
        </div>
      </div>

      <section>
        <div className="flex items-center gap-3 py-3">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground" data-testid="text-section-direct">
            Acesso Direto
          </h2>
          <span className="text-xs text-muted-foreground/50">{directAccessInstitutions.length}</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {directAccessInstitutions.map((inst) => (
            <InstitutionCard key={inst.name} institution={inst} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 py-3">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground" data-testid="text-section-manager">
            Via Gerente
          </h2>
          <span className="text-xs text-muted-foreground/50">{managerGroups.length}</span>
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
