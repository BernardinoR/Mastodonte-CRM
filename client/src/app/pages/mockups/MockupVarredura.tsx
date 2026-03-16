import { useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Card } from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  ArrowDownUp,
  Building2,
  Search,
  Calendar,
  Bell,
  Settings,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  MessageSquare,
  Mail,
} from "lucide-react";

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

const statusBadgeConfig: Record<InstitutionStatus, { label: string; className: string }> = {
  verificado: { label: "VERIFICADO", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  pendente: { label: "PENDENTE", className: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  solicitado: { label: "SOLICITADO", className: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
};

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: false },
  { icon: Users, label: "Clientes", active: false },
  { icon: CheckSquare, label: "Tarefas", active: false },
  { icon: ArrowDownUp, label: "Varredura", active: true, badge: 2 },
  { icon: Building2, label: "Consolidador", active: false },
];

function StatusBadge({ status }: { status: InstitutionStatus }) {
  const config = statusBadgeConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border ${config.className}`}
      data-testid={`badge-status-${status}`}
    >
      {config.label}
    </span>
  );
}

function MockupSidebar() {
  return (
    <div className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col h-full shrink-0" data-testid="sidebar-mockup">
      <div className="p-4 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            M
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs font-bold tracking-wider text-sidebar-foreground">MASTODONTE</p>
          <p className="text-[10px] text-muted-foreground">Financial Advisory</p>
        </div>
      </div>
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map((item) => (
          <div
            key={item.label}
            data-testid={`nav-mockup-${item.label.toLowerCase()}`}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-default ${
              item.active
                ? "bg-sidebar-accent text-sidebar-foreground"
                : "text-muted-foreground"
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-muted text-xs font-medium">RB</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">Rafael Bernardino</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[10px] text-primary font-semibold tracking-wide">CONSULTOR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
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
        <StatusBadge status={institution.status} />
        <span className="flex items-center gap-1 text-xs text-muted-foreground cursor-default" data-testid={`link-access-${institution.name.toLowerCase()}`}>
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
              className={`flex items-center gap-3 px-4 py-3 ${idx < group.clients.length - 1 ? "border-b border-border" : ""}`}
              data-testid={`row-client-${client.initials.toLowerCase()}`}
            >
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-semibold">
                  {client.initials}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm text-foreground w-36 shrink-0">{client.name}</span>
              <StatusBadge status={client.status} />
              <span className="text-sm text-muted-foreground italic flex-1 truncate ml-2">{client.description}</span>
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <span className="text-muted-foreground cursor-default" data-testid={`button-whatsapp-${client.initials.toLowerCase()}`}>
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
    <div className="flex flex-col items-end gap-1" data-testid="progress-bar">
      <div className="flex items-center gap-2 text-xs flex-wrap justify-end">
        <span className="text-muted-foreground tracking-wider uppercase font-semibold">Progresso da Carteira</span>
        <span className="text-foreground font-bold">{current} / {total}</span>
        <span className="text-muted-foreground uppercase text-[10px] tracking-wider">Verificadas</span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function MockupVarredura() {
  return (
    <div className="flex h-screen bg-background antialiased" data-testid="mockup-varredura">
      <MockupSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0" data-testid="header-mockup">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Mastodonte</span>
            <span>/</span>
            <span className="text-foreground font-medium">Varredura de Saldo</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-1.5">
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Buscar ativos...</span>
            </div>
            <span className="text-muted-foreground" data-testid="button-calendar-mockup">
              <Calendar className="w-5 h-5" />
            </span>
            <span className="text-muted-foreground" data-testid="button-notifications-mockup">
              <Bell className="w-5 h-5" />
            </span>
            <span className="text-muted-foreground" data-testid="button-settings-mockup">
              <Settings className="w-5 h-5" />
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6" data-testid="main-content-mockup">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">Varredura de Saldo</h1>
              <p className="text-sm text-muted-foreground mt-1">Acompanhamento Mensal de Ativos</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2 border border-border rounded-md px-3 py-1.5 text-sm text-foreground">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>13 de marco de 2026</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </div>
              <ProgressBar current={2} total={4} />
            </div>
          </div>

          <section>
            <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3" data-testid="text-section-direct">
              Acesso Direto ({directAccessInstitutions.length})
            </h2>
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
  );
}
