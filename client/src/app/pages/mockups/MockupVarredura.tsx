import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  Mail,
  Search,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

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

function InstitutionCard({ institution }: { institution: Institution }) {
  const [enabled, setEnabled] = useState(institution.enabled);
  const sc = statusConfig[institution.status];

  return (
    <div
      className={`group flex flex-col gap-3 rounded-lg border border-zinc-800/60 p-4 transition-colors ${
        enabled ? "bg-zinc-900/60" : "bg-zinc-900/30"
      } hover:border-zinc-700/60`}
      data-testid={`card-institution-${institution.name.toLowerCase()}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-7 w-7 items-center justify-center rounded-md ${sc.bgColor}`}>
            <span className={`text-xs font-bold ${sc.textColor}`}>{institution.initial}</span>
          </div>
          <span className="text-sm font-semibold text-zinc-200">{institution.name}</span>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className="transition-colors"
          data-testid={`toggle-${institution.name.toLowerCase()}`}
        >
          {enabled ? (
            <ToggleRight className="h-6 w-6 text-emerald-400" />
          ) : (
            <ToggleLeft className="h-6 w-6 text-zinc-600" />
          )}
        </button>
      </div>
      <div className="flex items-center justify-between">
        <StatusBadge status={institution.status} />
        <span
          className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-zinc-600 transition-colors group-hover:text-zinc-400"
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
      className="overflow-hidden rounded-lg border border-zinc-800/60"
      data-testid={`card-manager-${group.name.toLowerCase().replace(/\s/g, "-")}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 bg-zinc-900/40 px-4 py-3.5 text-left transition-colors hover:bg-zinc-800/40"
        data-testid={`button-toggle-${group.name.toLowerCase().replace(/\s/g, "-")}`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-500/10">
          <span className="text-[10px] font-bold text-orange-400">{group.initial}</span>
        </div>
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-zinc-200">{group.name}</span>
          <span className="text-xs text-zinc-600">{group.clientCount} clientes</span>
          {group.pendingCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-400">
              <AlertTriangle className="h-3 w-3" />
              {group.pendingCount} pendentes
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-zinc-600" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-600" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-zinc-800/40">
          {group.clients.map((client, idx) => {
            const sc = statusConfig[client.status];
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-800/20 ${
                  idx < group.clients.length - 1 ? "border-b border-zinc-800/30" : ""
                }`}
                data-testid={`row-client-${client.initials.toLowerCase()}`}
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${sc.bgColor}`}>
                  <span className={`text-[9px] font-bold ${sc.textColor}`}>{client.initials}</span>
                </div>
                <span className="w-36 shrink-0 text-sm font-medium text-zinc-300">{client.name}</span>
                <StatusBadge status={client.status} />
                <span className="ml-2 flex-1 truncate text-xs italic text-zinc-600">{client.description}</span>
                <div className="flex shrink-0 items-center gap-1.5 ml-auto">
                  <button
                    className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-500/60 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
                    data-testid={`button-whatsapp-${client.initials.toLowerCase()}`}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button
                    className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-400"
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

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="flex flex-col gap-1.5" data-testid="progress-bar">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums text-zinc-100">{current}</span>
        <span className="text-sm text-zinc-600">/ {total} verificadas</span>
      </div>
      <div className="h-1.5 w-48 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SummaryCards() {
  const verified = directAccessInstitutions.filter(i => i.status === "verificado").length;
  const pending = directAccessInstitutions.filter(i => i.status === "pendente").length;
  const managerPending = managerGroups.reduce((s, g) => s + g.pendingCount, 0);

  const items = [
    { label: "Pendentes", value: pending + managerPending, textColor: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/20", Icon: AlertTriangle },
    { label: "Solicitados", value: managerGroups.reduce((s, g) => s + g.clients.filter(c => c.status === "solicitado").length, 0), textColor: "text-sky-400", bgColor: "bg-sky-500/10", borderColor: "border-sky-500/20", Icon: Clock },
    { label: "Verificados", value: verified, textColor: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/20", Icon: CheckCircle },
  ];

  return (
    <div className="flex items-center gap-2">
      {items.map((item) => (
        <button
          key={item.label}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-[11px] font-bold uppercase transition-all hover:brightness-125 ${item.textColor} ${item.bgColor} ${item.borderColor}`}
          data-testid={`filter-${item.label.toLowerCase()}`}
        >
          <item.Icon className="h-3.5 w-3.5" />
          {item.value} {item.label}
        </button>
      ))}
    </div>
  );
}

export default function MockupVarredura() {
  return (
    <div className="flex h-screen w-full bg-[#111] antialiased" data-testid="mockup-varredura">
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[960px] px-8 py-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-zinc-100" data-testid="text-page-title">
                  Varredura de Saldo
                </h1>
                <p className="mt-1 text-sm text-zinc-600">
                  Acompanhamento mensal de ativos
                  <span className="mx-1.5 text-zinc-700">&middot;</span>
                  <span className="text-zinc-500">Marco 2026</span>
                </p>
              </div>
              <ProgressBar current={2} total={10} />
            </div>

            <SummaryCards />

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
              <input
                type="text"
                placeholder="Buscar instituicao ou cliente..."
                className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/40 pl-9 pr-3 text-sm text-zinc-300 placeholder:text-zinc-700 outline-none transition-colors focus:border-zinc-700"
                data-testid="input-search"
              />
            </div>

            <section>
              <h2 className="mb-3 text-[11px] font-medium uppercase tracking-widest text-zinc-600" data-testid="text-section-direct">
                Acesso Direto ({directAccessInstitutions.length})
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {directAccessInstitutions.map((inst) => (
                  <InstitutionCard key={inst.name} institution={inst} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[11px] font-medium uppercase tracking-widest text-zinc-600" data-testid="text-section-manager">
                Via Gerente ({managerGroups.length})
              </h2>
              <div className="space-y-3">
                {managerGroups.map((group) => (
                  <ManagerGroupCard key={group.name} group={group} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
