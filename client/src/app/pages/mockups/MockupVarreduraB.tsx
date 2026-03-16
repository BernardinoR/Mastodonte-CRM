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
  CircleCheck,
  Clock,
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

const statusConfig: Record<InstitutionStatus, { label: string; className: string }> = {
  verificado: { label: "VERIFICADO", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
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

function StatusBadge({ status }: { status: InstitutionStatus }) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-semibold tracking-wider uppercase ${config.className}`}
      data-testid={`badge-status-${status}`}
    >
      {config.label}
    </Badge>
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
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    data-active={item.active}
                    data-testid={`nav-mockup-${item.label.toLowerCase()}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
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
          className="mb-3 flex items-center gap-3 rounded-md p-2"
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
  const isVerified = institution.status === "verificado";
  return (
    <Card
      className={`p-4 flex flex-col justify-between gap-4 ${isVerified ? "border-emerald-500/20" : ""}`}
      data-testid={`card-institution-${institution.name.toLowerCase()}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${institution.dotColor}`} />
          <span className="font-semibold text-sm text-foreground">{institution.name}</span>
        </div>
        <Switch checked={institution.enabled} className="scale-75" />
      </div>
      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={institution.status} />
        <span className="flex items-center gap-1 text-xs text-muted-foreground cursor-default tracking-wide" data-testid={`link-access-${institution.name.toLowerCase()}`}>
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
          <Badge variant="outline" className="text-[10px] font-semibold tracking-wider uppercase bg-amber-500/15 text-amber-400 border-amber-500/20">
            {group.pendingCount} PENDENTES
          </Badge>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {expanded && (
        <div className="border-t border-border">
          {group.clients.map((client, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 px-4 py-3 ${idx < group.clients.length - 1 ? "border-b border-border" : ""}`}
              data-testid={`row-client-${client.initials.toLowerCase()}`}
            >
              <div className="w-8 h-8 shrink-0 rounded-md bg-muted flex items-center justify-center">
                <span className="text-[10px] font-semibold text-muted-foreground">{client.initials}</span>
              </div>
              <div className="w-36 shrink-0">
                <span className="font-medium text-sm text-foreground">{client.name}</span>
              </div>
              <StatusBadge status={client.status} />
              <span className="text-sm text-muted-foreground italic flex-1 truncate ml-2">{client.description}</span>
              <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500" data-testid={`button-whatsapp-${client.initials.toLowerCase()}`}>
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" data-testid={`button-email-${client.initials.toLowerCase()}`}>
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ProgressIndicator({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  const remaining = total - current;
  return (
    <div className="flex flex-col items-end gap-2" data-testid="progress-bar">
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <CircleCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-semibold">{current} verificadas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-400 font-semibold">{remaining} pendentes</span>
        </div>
      </div>
      <div className="w-72 h-1.5 bg-muted rounded-full overflow-hidden flex">
        <div className="h-full bg-emerald-500 rounded-l-full transition-all" style={{ width: `${pct}%` }} />
        <div className="h-full bg-amber-500/40 rounded-r-full flex-1" />
      </div>
    </div>
  );
}

export default function MockupVarreduraB() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background antialiased" data-testid="mockup-varredura-b">
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
                <ProgressIndicator current={2} total={4} />
              </div>
            </div>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase" data-testid="text-section-direct">
                  Acesso Direto ({directAccessInstitutions.length})
                </h2>
                <span className="text-[10px] text-muted-foreground/60">
                  {directAccessInstitutions.filter(i => i.status === "verificado").length} de {directAccessInstitutions.length} verificadas
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {directAccessInstitutions.map((inst) => (
                  <InstitutionCard key={inst.name} institution={inst} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3" data-testid="text-section-manager">
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
