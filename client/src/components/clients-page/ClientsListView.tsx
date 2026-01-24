import { AlertTriangle, Eye, CalendarPlus, ArrowUpDown } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/shared/lib/utils";
import type { EnrichedClient } from "@/types/client";

interface ClientsListViewProps {
  clients: EnrichedClient[];
}

// Formatar data para exibição
function formatMeetingDate(date: Date): string {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
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
    const hasAddress = client.address && (
      client.address.street?.trim() || 
      client.address.city?.trim() || 
      client.address.state?.trim() || 
      client.address.zipCode?.trim()
    );
    return !hasCpf && !hasPhone && !hasAddress;
  };

  // Determinar classe de borda lateral para linha
  const getRowBorderClass = (client: EnrichedClient) => {
    // Borda vermelha se cadastro incompleto (prioridade máxima)
    if (isIncompleteRegistration(client)) return 'border-l-[4px] border-l-[#e07a7a]';
    
    if (client.urgentTasksCount > 0) return 'border-l-[4px] border-l-[#e07a7a]';
    if (client.meetingDelayStatus === 'critical') return 'border-l-[4px] border-l-[#e07a7a]';
    if (client.meetingDelayStatus === 'warning') return 'border-l-[4px] border-l-[#dcb092]';
    return '';
  };

  // Cor do texto de data
  const getDateColor = (client: EnrichedClient) => {
    if (client.meetingDelayStatus === 'critical') return 'text-[#e07a7a]';
    if (client.meetingDelayStatus === 'warning') return 'text-[#dcb092]';
    return 'text-[#ededed]';
  };

  // Badge de dias
  const getDaysBadge = (days: number, status: 'ok' | 'warning' | 'critical') => {
    const colors = {
      ok: 'bg-[#1a2e1a] text-[#6ecf8e]',
      warning: 'bg-[#422c24] text-[#dcb092]',
      critical: 'bg-[#3d2626] text-[#e07a7a]',
    };
    return (
      <span className={cn("px-2 py-0.5 rounded text-xs font-medium", colors[status])}>
        {days} dias
      </span>
    );
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_120px] gap-3 px-4 py-3 bg-[#141414] border-b border-[#2a2a2a]">
        <div className="flex items-center gap-1 text-[11px] font-medium text-[#8c8c8c] uppercase tracking-wide cursor-pointer hover:text-[#ededed]">
          Cliente
          <ArrowUpDown className="w-3 h-3" />
        </div>
        <div className="flex items-center gap-1 text-[11px] font-medium text-[#8c8c8c] uppercase tracking-wide cursor-pointer hover:text-[#ededed]">
          AUM
          <ArrowUpDown className="w-3 h-3" />
        </div>
        <div className="text-[11px] font-medium text-[#8c8c8c] uppercase tracking-wide">
          Status
        </div>
        <div className="flex items-center gap-1 text-[11px] font-medium text-[#8c8c8c] uppercase tracking-wide cursor-pointer hover:text-[#ededed]">
          Última Reunião
          <ArrowUpDown className="w-3 h-3" />
        </div>
        <div className="text-[11px] font-medium text-[#8c8c8c] uppercase tracking-wide">
          Consultor
        </div>
        <div className="text-[11px] font-medium text-[#8c8c8c] uppercase tracking-wide">
          Telefone
        </div>
        <div className="text-[11px] font-medium text-[#8c8c8c] uppercase tracking-wide">
          Cidade
        </div>
        <div className="text-[11px] font-medium text-[#8c8c8c] uppercase tracking-wide">
          Cliente Desde
        </div>
        <div className="text-[11px] font-medium text-[#8c8c8c] uppercase tracking-wide">
          Dias sem Reunião
        </div>
        <div className="text-[11px] font-medium text-[#8c8c8c] uppercase tracking-wide">
          Tasks Urgentes
        </div>
        <div className="text-[11px] font-medium text-[#8c8c8c] uppercase tracking-wide">
          Ações
        </div>
      </div>

      {/* Body */}
      {clients.map((client) => (
        <div
          key={client.id}
          className={cn(
            "grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_120px] gap-3 px-4 py-3 items-center border-b border-[#252525] cursor-pointer hover:bg-[#1f1f1f] transition-colors",
            getRowBorderClass(client)
          )}
          onClick={() => handleRowClick(client.id)}
          data-testid={`row-client-${client.id}`}
        >
          {/* Cliente */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#333333] flex items-center justify-center text-xs font-semibold text-[#8c8c8c]">
              {client.initials}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium text-[#ededed] truncate">{client.name}</span>
              <span className="text-xs text-[#8c8c8c] truncate">{client.emails[client.primaryEmailIndex]}</span>
            </div>
          </div>

          {/* AUM */}
          <div className="text-[14px] font-semibold text-[#6ecf8e]">
            {client.aumFormatted}
          </div>

          {/* Status */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#1a2e1a] text-[#6ecf8e]">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {client.status}
            </span>
          </div>

          {/* Última Reunião */}
          <div className={cn("text-[14px]", getDateColor(client))}>
            {client.lastMeeting ? formatMeetingDate(client.lastMeeting) : '-'}
          </div>

          {/* Consultor */}
          <div className="text-[13px] text-[#ededed]">
            {client.advisor}
          </div>

          {/* Telefone */}
          <div className="text-[13px] text-[#ededed]">
            {client.phone}
          </div>

          {/* Cidade */}
          <div className="text-[13px] text-[#ededed]">
            {client.cityState}
          </div>

          {/* Cliente Desde */}
          <div className="text-[13px] text-[#ededed]">
            {client.clientSince}
          </div>

          {/* Dias sem Reunião */}
          <div>
            {getDaysBadge(client.daysSinceLastMeeting, client.meetingDelayStatus)}
          </div>

          {/* Tasks Urgentes */}
          <div>
            {client.urgentTasksCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-[#e07a7a]">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-bold text-sm">{client.urgentTasksCount}</span>
              </span>
            ) : isIncompleteRegistration(client) ? (
              <span className="inline-flex items-center gap-1 text-[#e07a7a]">
                <AlertTriangle className="w-4 h-4" />
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#6ecf8e]">
                <span className="font-medium text-sm">0</span>
              </span>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 justify-end">
            {client.urgentTasksCount > 0 || client.meetingDelayStatus !== 'ok' ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle schedule
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-[#3a5a3a] text-[#6ecf8e] rounded-md text-xs font-semibold hover:bg-[#1a2e1a] hover:border-[#6ecf8e] transition-colors"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                Agendar
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation(`/clients/${client.id}`);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-[#333333] text-[#8c8c8c] hover:bg-[#333333] hover:text-[#ededed] transition-colors"
                title="Ver detalhes"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}

      {clients.length === 0 && (
        <div className="px-4 py-12 text-center text-[#8c8c8c]">
          Nenhum cliente encontrado
        </div>
      )}
    </div>
  );
}
