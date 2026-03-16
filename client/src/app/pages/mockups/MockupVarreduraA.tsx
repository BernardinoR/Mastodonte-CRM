import { useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Card } from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
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
} from "@/shared/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  ArrowDownUp,
  Layers,
  Search,
  Calendar,
  Bell,
  Settings,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  MessageSquare,
  Mail,
  LogOut,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { SidebarProvider } from "@/shared/components/ui/sidebar";

type InstitutionStatus = "verificado" | "pendente" | "solicitado";

interface Institution {
  name: string;
  status: InstitutionStatus;
  enabled: boolean;
  dotColor: string;
}

interface ManagerClient {
  initials: string;
  name: string;
  status: InstitutionStatus;
  description: string;
}

interface ManagerGroup {
  name: string;
  clientCount: number;
  pendingCount: number;
  dotColor: string;
  clients: ManagerClient[];
}

const directAccessInstitutions: Institution[] = [
  { name: "XP", status: "pendente", enabled: false, dotColor: "bg-orange-500" },
  { name: "BTG", status: "verificado", enabled: true, dotColor: "bg-orange-500" },
  { name: "Avenue", status: "verificado", enabled: true, dotColor: "bg-orange-500" },
  { name: "Warren", status: "pendente", enabled: false, dotColor: "bg-pink-400" },
  { name: "Inter", status: "pendente", enabled: false, dotColor: "bg-orange-500" },
  { name: "Guide", status: "pendente", enabled: false, dotColor: "bg-orange-500" },
  { name: "Safra", status: "pendente", enabled: false, dotColor: "bg-orange-500" },
  { name: "Modal", status: "pendente", enabled: false, dotColor: "bg-orange-500" },
];

const managerGroups: ManagerGroup[] = [
  {
    name: "Itau Personnalite",
    clientCount: 4,
    pendingCount: 2,
    dotColor: "bg-orange-500",
    clients: [
      { initials: "AS", name: "Ana Souza", status: "solicitado", description: "Aguardando resposta do gerente..." },
      { initials: "RM", name: "Roberto Mendes", status: "pendente", description: "Pronto para envio" },
      { initials: "JP", name: "Joao Pereira", status: "pendente", description: "Pronto para envio" },
      { initials: "MO", name: "Maria Oliveira", status: "solicitado", description: "Aguardando resposta do gerente..." },
    ],
  },
  {
    name: "Bradesco Prime",
    clientCount: 2,
    pendingCount: 2,
    dotColor: "bg-red-500",
    clients: [
      { initials: "CF", name: "Carlos Ferreira", status: "pendente", description: "Pronto para envio" },
      { initials: "LG", name: "Lucia Gomes", status: "pendente", description: "Pronto para envio" },
    ],
  },
];

const statusConfig: Record<InstitutionStatus, { label: string; className: string; dotColor?: string }> = {
  verificado: { label: "VERIFICADO", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", dotColor: "bg-emerald-400" },
  pendente: { label: "PENDENTE", className: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  solicitado: { label: "SOLICITADO", className: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
};

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: false },
  { icon: Users, label: "Clientes", active: false },
  { icon: CheckSquare, label: "Tarefas", active: false },
  { icon: ArrowDownUp, label: "Varredura", active: true, badge: 2 },
  { icon: Layers, label: "Consolidador", active: false },
];

function StatusBadge({ status, showDot }: { status: InstitutionStatus; showDot?: boolean }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border ${config.className}`}
      data-testid={`badge-status-${status}`}
    >
      {showDot && config.dotColor && <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />}
      {config.label}
    </span>
  );
}

function MockupSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-sidebar-accent flex items-center justify-center">
            <svg
              width="18"
              height="18"
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
          </div>
        </div>
        <div className="mt-1.5">
          <p className="text-[11px] font-bold tracking-[0.15em] text-sidebar-foreground uppercase">Mastodonte</p>
          <p className="text-[10px] text-muted-foreground">Financial Advisory</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    data-active={item.active}
                    data-testid={`nav-mockup-${item.label.toLowerCase()}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                    {item.badge && (
                      <Badge variant="outline" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary/15 text-primary border-primary/25">
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div
          className="flex items-center gap-3 rounded-md p-2"
          data-testid="user-card-mockup"
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-sm">RB</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" data-testid="text-username-mockup">
              Rafael Bernardino
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-[10px] font-semibold tracking-wide text-blue-400 uppercase">Consultor</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function InstitutionCard({ institution }: { institution: Institution }) {
  return (
    <Card className="p-4 flex flex-col justify-between gap-4" data-testid={`card-institution-${institution.name.toLowerCase()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${institution.dotColor}`} />
          <span className="font-semibold text-sm text-foreground">{institution.name}</span>
        </div>
        <Switch checked={institution.enabled} className="scale-75" />
      </div>
      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={institution.status} showDot={institution.status === "verificado"} />
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground cursor-default tracking-wide" data-testid={`link-access-${institution.name.toLowerCase()}`}>
          ACESSAR <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </Card>
  );
}

function ManagerGroupCard({ group }: { group: ManagerGroup }) {
  const [expanded, setExpanded] = useState(group.name === "Itau Personnalite");

  return (
    <Card className="overflow-visible" data-testid={`card-manager-${group.name.toLowerCase().replace(/\s/g, "-")}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 p-4 text-left"
        data-testid={`button-toggle-${group.name.toLowerCase().replace(/\s/g, "-")}`}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`w-2.5 h-2.5 rounded-full ${group.dotColor}`} />
          <span className="font-semibold text-foreground">{group.name}</span>
          <span className="text-sm text-muted-foreground">{group.clientCount} clientes</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border bg-amber-500/15 text-amber-400 border-amber-500/20">
            {group.pendingCount} PENDENTES
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {expanded && (
        <div className="border-t border-border">
          {group.clients.map((client, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 px-5 py-3 ${idx < group.clients.length - 1 ? "border-b border-border" : ""}`}
              data-testid={`row-client-${client.initials.toLowerCase()}`}
            >
              <div className="w-8 h-8 shrink-0 rounded-md bg-muted flex items-center justify-center">
                <span className="text-[10px] font-semibold text-muted-foreground">{client.initials}</span>
              </div>
              <span className="font-medium text-sm text-foreground w-36 shrink-0">{client.name}</span>
              <StatusBadge status={client.status} />
              <span className="text-sm text-muted-foreground italic flex-1 truncate ml-2">{client.description}</span>
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <span className="text-emerald-500 cursor-default" data-testid={`button-whatsapp-${client.initials.toLowerCase()}`}>
                  <MessageSquare className="w-4 h-4" />
                </span>
                <span className="text-muted-foreground cursor-default" data-testid={`button-email-${client.initials.toLowerCase()}`}>
                  <Mail className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="flex flex-col items-end gap-1.5" data-testid="progress-bar">
      <div className="flex items-baseline gap-2 text-xs">
        <span className="text-muted-foreground tracking-wider uppercase font-semibold text-[10px]">Progresso da Carteira</span>
        <span className="text-foreground font-bold text-sm">{current} / {total}</span>
        <span className="text-muted-foreground uppercase text-[10px] tracking-wider">Verificadas</span>
      </div>
      <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function MockupVarreduraA() {
  const style = {
    "--sidebar-width": "14rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background antialiased" data-testid="mockup-varredura-a">
        <MockupSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex items-center justify-between px-6 h-12 border-b border-border shrink-0" data-testid="header-mockup">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Mastodonte</span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-foreground font-medium">Varredura de Saldo</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-1.5 mr-2">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Buscar ativos...</span>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground" data-testid="button-calendar-mockup">
                <Calendar className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground" data-testid="button-notifications-mockup">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground" data-testid="button-settings-mockup">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 space-y-6" data-testid="main-content-mockup">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">Varredura de Saldo</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Acompanhamento Mensal de Ativos</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <Button variant="outline" className="gap-2 text-sm" data-testid="button-date-picker">
                  <Calendar className="w-4 h-4" />
                  13 de marco de 2026
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
                <ProgressBar current={2} total={4} />
              </div>
            </div>

            <section>
              <h2 className="text-[11px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-3" data-testid="text-section-direct">
                Acesso Direto ({directAccessInstitutions.length})
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {directAccessInstitutions.map((inst) => (
                  <InstitutionCard key={inst.name} institution={inst} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-[11px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-3" data-testid="text-section-manager">
                Via Gerente ({managerGroups.length})
              </h2>
              <div className="space-y-3">
                {managerGroups.map((group) => (
                  <ManagerGroupCard key={group.name} group={group} />
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
