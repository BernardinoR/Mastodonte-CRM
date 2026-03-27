import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  CalendarDays,
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
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { getInstitutionColor } from "@/features/clients/lib/institutionColors";

type InstitutionStatus = "verificado" | "pendente" | "solicitado";

interface DirectInstitution {
  name: string;
  initials: string;
  colorKey: string;
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

const directAccessInstitutions: DirectInstitution[] = [
  { name: "XP Investimentos", initials: "XP", colorKey: "XP" },
  { name: "BTG Pactual", initials: "BT", colorKey: "BTG" },
  { name: "Avenue", initials: "AV", colorKey: "Avenue" },
  { name: "Warren", initials: "WR", colorKey: "Warren" },
  { name: "Inter", initials: "IN", colorKey: "IB" },
  { name: "Guide", initials: "GI", colorKey: "Smart" },
  { name: "Safra", initials: "SF", colorKey: "Safra" },
  { name: "Modal", initials: "MM", colorKey: "Singulare" },
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
  { label: string; color: string; bg: string; border: string; dot: string; Icon: typeof CheckCircle }
> = {
  verificado: {
    label: "Verificado",
    color: "text-[#6ecf8e]",
    bg: "bg-[rgba(110,207,142,0.1)]",
    border: "border-[rgba(110,207,142,0.2)]",
    dot: "bg-[#6ecf8e]",
    Icon: CheckCircle,
  },
  pendente: {
    label: "Pendente",
    color: "text-[#dcb092]",
    bg: "bg-[rgba(220,176,146,0.1)]",
    border: "border-[rgba(220,176,146,0.2)]",
    dot: "bg-[#dcb092]",
    Icon: AlertTriangle,
  },
  solicitado: {
    label: "Solicitado",
    color: "text-[#6db1d4]",
    bg: "bg-[rgba(109,177,212,0.1)]",
    border: "border-[rgba(109,177,212,0.2)]",
    dot: "bg-[#6db1d4]",
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

function DaySelector({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  const [open, setOpen] = useState(false);

  const label = useMemo(() => {
    const today = new Date();
    const isToday = value.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = value.toDateString() === yesterday.toDateString();

    if (isToday) return "Hoje";
    if (isYesterday) return "Ontem";
    return format(value, "dd MMM yyyy", { locale: ptBR });
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="inline-flex h-8 items-center gap-2 rounded-lg border border-[rgba(237,237,237,0.1)] bg-[#1a1a1a] px-3 text-sm text-[#8c8c8c] transition-colors hover:border-[rgba(237,237,237,0.2)] hover:text-[#ededed]"
          data-testid="button-day-selector"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          {label}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            if (d) {
              onChange(d);
              setOpen(false);
            }
          }}
          disabled={(d) => d > new Date()}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
}

function ProgressBar({
  checkedDirect,
  totalDirect,
  solicitedManager,
  totalManager,
}: {
  checkedDirect: number;
  totalDirect: number;
  solicitedManager: number;
  totalManager: number;
}) {
  const total = totalDirect + totalManager;
  const done = checkedDirect + solicitedManager;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const directPct = total > 0 ? (checkedDirect / total) * 100 : 0;
  const managerPct = total > 0 ? (solicitedManager / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-2" data-testid="progress-bar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-[#8c8c8c]">
            <CheckCircle className="h-3.5 w-3.5 text-[#6ecf8e]" />
            <span className="text-[#6ecf8e] font-semibold">{checkedDirect}</span>
            <span>/ {totalDirect} diretos</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[#8c8c8c]">
            <Mail className="h-3.5 w-3.5 text-[#6db1d4]" />
            <span className="text-[#6db1d4] font-semibold">{solicitedManager}</span>
            <span>/ {totalManager} solicitados</span>
          </span>
        </div>
        <span className="text-xs font-bold text-[#ededed]">{pct}%</span>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-[#252525]">
        <div
          className="h-full bg-[#6ecf8e] transition-all duration-300"
          style={{ width: `${directPct}%` }}
        />
        <div
          className="h-full bg-[#6db1d4] transition-all duration-300"
          style={{ width: `${managerPct}%` }}
        />
      </div>
    </div>
  );
}

function InstitutionCard({
  institution,
  checked,
  onToggle,
}: {
  institution: DirectInstitution;
  checked: boolean;
  onToggle: () => void;
}) {
  const color = getInstitutionColor(institution.colorKey);

  return (
    <div
      className="group rounded-xl border border-[#3a3a3a] bg-[#1a1a1a] p-4 transition-colors hover:bg-[#1e1e1e]"
      data-testid={`card-institution-${institution.initials.toLowerCase()}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${color.bg} ${color.text} ${color.border}`}>
            {institution.initials}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-[#ededed]">{institution.name}</span>
            {checked ? (
              <span className="flex items-center gap-1 text-[11px] font-medium text-[#6ecf8e]">
                <CheckCircle className="h-3 w-3" />
                Verificado
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-medium text-[#8c8c8c]">
                <Clock className="h-3 w-3" />
                Pendente
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onToggle}
          className="relative mt-0.5 flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors"
          style={{
            backgroundColor: checked ? "rgba(110,207,142,0.25)" : "#2c2c2c",
          }}
          data-testid={`toggle-${institution.initials.toLowerCase()}`}
        >
          <span
            className="block h-3.5 w-3.5 rounded-full transition-all duration-200"
            style={{
              backgroundColor: checked ? "#6ecf8e" : "#555",
              transform: checked ? "translateX(14px)" : "translateX(0)",
            }}
          />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#2a2a2a] pt-3">
        <button
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-[#8c8c8c] transition-colors hover:bg-[#2c2c2c] hover:text-[#ededed]"
          data-testid={`button-access-${institution.initials.toLowerCase()}`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Acessar
        </button>
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
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [checksByDate, setChecksByDate] = useState<Record<string, string[]>>(
    () => {
      const todayKey = new Date().toDateString();
      return { [todayKey]: ["XP", "BT", "AV"] };
    },
  );

  const dateKey = selectedDay.toDateString();
  const checkedInstitutions = useMemo(
    () => new Set(checksByDate[dateKey] ?? []),
    [checksByDate, dateKey],
  );

  const totalDirect = directAccessInstitutions.length;
  const checkedDirect = checkedInstitutions.size;

  const totalManagerClients = managerGroups.reduce((s, g) => s + g.clients.length, 0);
  const solicitedManager = managerGroups.reduce(
    (s, g) => s + g.clients.filter((c) => c.status === "solicitado").length,
    0,
  );

  const toggleInstitution = (initials: string) => {
    setChecksByDate((prev) => {
      const current = prev[dateKey] ?? [];
      const next = current.includes(initials)
        ? current.filter((i) => i !== initials)
        : [...current, initials];
      return { ...prev, [dateKey]: next };
    });
  };

  return (
    <div className="flex flex-col gap-6 px-8 pb-32 pt-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-[#ededed]" data-testid="text-page-title">Varredura de Saldo</h1>
        <div className="h-6 w-px bg-[#333]" />
        <DaySelector value={selectedDay} onChange={setSelectedDay} />
      </div>

      <ProgressBar
        checkedDirect={checkedDirect}
        totalDirect={totalDirect}
        solicitedManager={solicitedManager}
        totalManager={totalManagerClients}
      />

      <section>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#666]" data-testid="text-section-direct">
            Acesso Direto
          </h2>
          <span className="inline-flex items-center rounded-md bg-[rgba(110,207,142,0.1)] px-2 py-0.5 text-[10px] font-bold text-[#6ecf8e]">
            {checkedDirect}/{totalDirect}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {directAccessInstitutions.map((inst) => (
            <InstitutionCard
              key={inst.initials}
              institution={inst}
              checked={checkedInstitutions.has(inst.initials)}
              onToggle={() => toggleInstitution(inst.initials)}
            />
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
