import { 
  Calendar,
  AlertTriangle
} from "lucide-react";
import { useLocation } from "wouter";
import { useCallback } from "react";
import type { Client, EnrichedClient } from "@features/clients";
import { cn } from "@/shared/lib/utils";
import { toast } from "@/shared/hooks/use-toast";

interface ClientCardProps {
  client: Client | EnrichedClient;
  isCompact?: boolean;
  onSchedule?: (client: Client | EnrichedClient) => void;
}

// Type guard para verificar se é EnrichedClient
function isEnrichedClient(client: Client | EnrichedClient): client is EnrichedClient {
  return 'aum' in client && 'daysSinceLastMeeting' in client;
}

// Formatar data para exibição no formato "1 Dez 2025"
function formatMeetingDate(date: Date): string {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const d = new Date(date);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function ClientCard({ client, isCompact = false, onSchedule }: ClientCardProps) {
  const { id, name, initials, emails, phone, status, advisor, clientSince, address, lastMeeting, cpf } = client;
  const email = emails[client.primaryEmailIndex] || emails[0];
  const [, setLocation] = useLocation();

  // Dados enriquecidos (se disponíveis)
  const enriched = isEnrichedClient(client) ? client : null;

  // Verificar se o cadastro está incompleto
  const isIncompleteRegistration = () => {
    const hasCpf = cpf && cpf.trim().length > 0;
    const hasPhone = phone && phone.trim().length > 0;
    const hasAddress = address && (
      address.street?.trim() || 
      address.city?.trim() || 
      address.state?.trim() || 
      address.zipCode?.trim()
    );
    return !hasCpf && !hasPhone && !hasAddress;
  };

  const incomplete = isIncompleteRegistration();

  // Determinar classe de borda lateral
  const getBorderClass = () => {
    // Borda vermelha completa se cadastro incompleto
    if (incomplete) return 'border-[#e07a7a]';
    
    if (!enriched) return '';
    if (enriched.urgentTasksCount > 0) return 'border-l-[4px] border-l-[#e07a7a]';
    if (enriched.meetingDelayStatus === 'critical') return 'border-l-[4px] border-l-[#e07a7a]';
    if (enriched.meetingDelayStatus === 'warning') return 'border-l-[4px] border-l-[#dcb092]';
    return '';
  };

  const handleCardClick = () => {
    setLocation(`/clients/${id}`);
  };

  const handleCopyClick = useCallback((e: React.MouseEvent, value: string, label: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    toast({
      title: 'Copiado!',
      description: `${label} copiado para a área de transferência`,
    });
  }, []);

  const handleScheduleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSchedule?.(client);
  };

  // Cor do indicador de dias
  const getDaysIndicatorColor = () => {
    if (!enriched) return 'text-[#8c8c8c]';
    if (enriched.meetingDelayStatus === 'critical') return 'text-[#e07a7a]';
    if (enriched.meetingDelayStatus === 'warning') return 'text-[#dcb092]';
    return 'text-[#8c8c8c]';
  };

  // Cidade/Estado formatado
  const cityState = address?.city && address?.state 
    ? `${address.city}/${address.state}` 
    : enriched?.cityState || '';

  return (
    <div 
      className={cn(
        "bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 cursor-pointer transition-all",
        "hover:bg-[#1f1f1f] hover:border-[#3a3a3a] hover:translate-y-[-2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]",
        getBorderClass()
      )}
      data-testid={`card-client-${id}`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className={cn(
        "flex items-start gap-3 pb-4 mb-4 border-b border-[#2a2a2a]",
        isCompact && "border-b-0 pb-0 mb-0"
      )}>
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-[#2a2a2a] flex items-center justify-center text-sm font-semibold text-[#8c8c8c] flex-shrink-0">
          {initials}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-0 min-h-[52px]">
          <div className="text-[15px] font-semibold text-[#ededed] leading-[1.3] m-0 p-0">{name}</div>
          <div 
            className="text-xs text-[#6c6c6c] leading-[1.3] m-0 p-0 cursor-pointer hover:text-[#b0b0b0] hover:bg-[rgba(176,176,176,0.1)] rounded px-1 py-0.5 -mx-1 -my-0.5 transition-colors inline-block"
            onClick={(e) => handleCopyClick(e, email, 'Email')}
          >
            {email}
          </div>
        </div>
        
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#1a2e1a] text-[#6ecf8e]">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {status}
        </span>
      </div>

      {/* Body - Grid de campos (oculto no modo compacto) */}
      <div className={cn(
        "grid grid-cols-2 gap-x-6 gap-y-4 mt-4 transition-all",
        isCompact && "max-h-0 opacity-0 overflow-hidden mt-0"
      )}>
        {/* AUM Total */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-[#5c5c5c] uppercase tracking-wide">
            AUM Total
          </span>
          <span className="text-[14px] font-semibold text-[#6ecf8e]">
            {enriched?.aumFormatted || 'R$ 0'}
          </span>
        </div>

        {/* Telefone */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-[#5c5c5c] uppercase tracking-wide">
            Telefone
          </span>
          <span 
            className="text-[14px] font-medium text-[#ededed] cursor-pointer hover:text-[#b0b0b0] hover:bg-[rgba(176,176,176,0.1)] rounded px-1 py-0.5 -mx-1 transition-colors inline-block whitespace-nowrap"
            onClick={(e) => handleCopyClick(e, phone, 'Telefone')}
          >
            {phone}
          </span>
        </div>

        {/* Última Reunião */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-[#5c5c5c] uppercase tracking-wide">
            Última Reunião
          </span>
          <span className="text-[14px] font-medium text-[#ededed]">
            {lastMeeting ? formatMeetingDate(lastMeeting) : '-'}
          </span>
        </div>

        {/* Consultor */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-[#5c5c5c] uppercase tracking-wide">
            Consultor
          </span>
          <span className="text-[14px] font-medium text-[#ededed] truncate block">
            {advisor}
          </span>
        </div>

        {/* Cidade */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-[#5c5c5c] uppercase tracking-wide">
            Cidade
          </span>
          <span className="text-[14px] font-medium text-[#ededed]">
            {cityState || '-'}
          </span>
        </div>

        {/* Cliente Desde */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-[#5c5c5c] uppercase tracking-wide">
            Cliente Desde
          </span>
          <span className="text-[14px] font-medium text-[#ededed]">
            {clientSince}
          </span>
        </div>
      </div>

      {/* Footer (oculto no modo compacto) */}
      <div className={cn(
        "flex items-center justify-between pt-4 border-t border-[#2a2a2a] mt-4 transition-all",
        isCompact && "max-h-0 opacity-0 overflow-hidden pt-0 mt-0 border-t-0"
      )}>
        {/* Indicadores */}
        <div className="flex items-center gap-4 min-w-[100px]">
          {/* Dias desde última reunião */}
          <span className={cn("inline-flex items-center gap-1 text-[13px] font-semibold", getDaysIndicatorColor())}>
            <Calendar className="w-4 h-4" />
            {enriched?.daysSinceLastMeeting !== undefined ? `${enriched.daysSinceLastMeeting}d` : '-'}
          </span>

          {/* Cadastro incompleto */}
          {incomplete && (
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#e07a7a]">
              <AlertTriangle className="w-4 h-4" />
            </span>
          )}

          {/* Tasks urgentes */}
          {enriched && enriched.urgentTasksCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#e07a7a]">
              <AlertTriangle className="w-4 h-4" />
              {enriched.urgentTasksCount}
            </span>
          )}
        </div>

        {/* Botão Agendar */}
        <button
          onClick={handleScheduleClick}
          className="px-4 py-2 rounded-lg border border-[#3a5a3a] bg-transparent text-[#6ecf8e] text-xs font-semibold hover:bg-[#1a2e1a] hover:border-[#6ecf8e] transition-colors"
        >
          Agendar
        </button>
      </div>
    </div>
  );
}
