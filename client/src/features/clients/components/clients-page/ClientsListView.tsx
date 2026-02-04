import { AlertTriangle, Eye, CalendarPlus, ArrowUpDown } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/shared/lib/utils";
import type { EnrichedClient } from "@features/clients";

interface ClientsListViewProps {
  clients: EnrichedClient[];
}

// Formatar data para exibição
function formatMeetingDate(date: Date): string {
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function ClientsListView({ clients }: ClientsListViewProps) {
  const [, setLocation] = useLocation();

  const handleRowClick = (clientId: string) => {
    setLocation(`/clients/${clientId}`);
  };

  // Verificar se o cadastro está incompleto
  const isIncompleteRegistration = (client: EnrichedClient) => {
    const hasCpf = client.cpf && client.cpf.trim().length > 0;
    const hasPhone = client.phone && client.phone.trim().length > 0;
    const hasAddress =
      client.address &&
      (client.address.street?.trim() ||
        client.address.city?.trim() ||
        client.address.state?.trim() ||
        client.address.zipCode?.trim());
    return !hasCpf && !hasPhone && !hasAddress;
  };

  // Determinar classe de borda lateral para linha
  const getRowBorderClass = (client: EnrichedClient) => {
    // Borda vermelha se cadastro incompleto (prioridade máxima)
    if (isIncompleteRegistration(client)) return "border-l-[4px] border-l-[#e07a7a]";

    if (client.urgentTasksCount > 0) return "border-l-[4px] border-l-[#e07a7a]";
    if (client.meetingDelayStatus === "critical") return "border-l-[4px] border-l-[#e07a7a]";
    if (client.meetingDelayStatus === "warning") return "border-l-[4px] border-l-[#dcb092]";
    return "";
  };

  // Cor do texto de data
  const getDateColor = (client: EnrichedClient) => {
    if (client.meetingDelayStatus === "critical") return "text-[#e07a7a]";
    if (client.meetingDelayStatus === "warning") return "text-[#dcb092]";
    return "text-[#ededed]";
  };

  // Badge de dias
  const getDaysBadge = (days: number, status: "ok" | "warning" | "critical") => {
    const colors = {
      ok: "bg-[#1a2e1a] text-[#6ecf8e]",
      warning: "bg-[#422c24] text-[#dcb092]",
      critical: "bg-[#3d2626] text-[#e07a7a]",
    };
    return (
      <span className={cn("rounded px-2 py-0.5 text-xs font-medium", colors[status])}>
        {days} dias
      </span>
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
      {/* Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_120px] gap-3 border-b border-[#2a2a2a] bg-[#141414] px-4 py-3">
        <div className="flex cursor-pointer items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-[#8c8c8c] hover:text-[#ededed]">
          Cliente
          <ArrowUpDown className="h-3 w-3" />
        </div>
        <div className="flex cursor-pointer items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-[#8c8c8c] hover:text-[#ededed]">
          AUM
          <ArrowUpDown className="h-3 w-3" />
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-[#8c8c8c]">Status</div>
        <div className="flex cursor-pointer items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-[#8c8c8c] hover:text-[#ededed]">
          Última Reunião
          <ArrowUpDown className="h-3 w-3" />
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-[#8c8c8c]">
          Consultor
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-[#8c8c8c]">
          Telefone
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-[#8c8c8c]">Cidade</div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-[#8c8c8c]">
          Cliente Desde
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-[#8c8c8c]">
          Dias sem Reunião
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-[#8c8c8c]">
          Tasks Urgentes
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-[#8c8c8c]">Ações</div>
      </div>

      {/* Body */}
      {clients.map((client) => (
        <div
          key={client.id}
          className={cn(
            "grid cursor-pointer grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_120px] items-center gap-3 border-b border-[#252525] px-4 py-3 transition-colors hover:bg-[#1f1f1f]",
            getRowBorderClass(client),
          )}
          onClick={() => handleRowClick(client.id)}
          data-testid={`row-client-${client.id}`}
        >
          {/* Cliente */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#333333] text-xs font-semibold text-[#8c8c8c]">
              {client.initials}
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-sm font-medium text-[#ededed]">{client.name}</span>
              <span className="truncate text-xs text-[#8c8c8c]">
                {client.emails[client.primaryEmailIndex]}
              </span>
            </div>
          </div>

          {/* AUM */}
          <div className="text-[14px] font-semibold text-[#6ecf8e]">{client.aumFormatted}</div>

          {/* Status */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1a2e1a] px-2.5 py-1 text-[11px] font-semibold text-[#6ecf8e]">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {client.status}
            </span>
          </div>

          {/* Última Reunião */}
          <div className={cn("text-[14px]", getDateColor(client))}>
            {client.lastMeeting ? formatMeetingDate(client.lastMeeting) : "-"}
          </div>

          {/* Consultor */}
          <div className="text-[13px] text-[#ededed]">{client.advisor}</div>

          {/* Telefone */}
          <div className="text-[13px] text-[#ededed]">{client.phone}</div>

          {/* Cidade */}
          <div className="text-[13px] text-[#ededed]">{client.cityState}</div>

          {/* Cliente Desde */}
          <div className="text-[13px] text-[#ededed]">{client.clientSince}</div>

          {/* Dias sem Reunião */}
          <div>{getDaysBadge(client.daysSinceLastMeeting, client.meetingDelayStatus)}</div>

          {/* Tasks Urgentes */}
          <div>
            {client.urgentTasksCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-[#e07a7a]">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-bold">{client.urgentTasksCount}</span>
              </span>
            ) : isIncompleteRegistration(client) ? (
              <span className="inline-flex items-center gap-1 text-[#e07a7a]">
                <AlertTriangle className="h-4 w-4" />
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#6ecf8e]">
                <span className="text-sm font-medium">0</span>
              </span>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-2">
            {client.urgentTasksCount > 0 || client.meetingDelayStatus !== "ok" ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle schedule
                }}
                className="flex items-center gap-1.5 rounded-md border border-[#3a5a3a] bg-transparent px-3 py-1.5 text-xs font-semibold text-[#6ecf8e] transition-colors hover:border-[#6ecf8e] hover:bg-[#1a2e1a]"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                Agendar
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation(`/clients/${client.id}`);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#333333] text-[#8c8c8c] transition-colors hover:bg-[#333333] hover:text-[#ededed]"
                title="Ver detalhes"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}

      {clients.length === 0 && (
        <div className="px-4 py-12 text-center text-[#8c8c8c]">Nenhum cliente encontrado</div>
      )}
    </div>
  );
}
