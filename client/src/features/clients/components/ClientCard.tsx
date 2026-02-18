import { Calendar, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import type { Client, EnrichedClient } from "@features/clients";
import { cn } from "@/shared/lib/utils";
import { toast } from "@/shared/hooks/use-toast";
import { useCopyToClipboard } from "@/shared/hooks";
import { useCurrentUser } from "@features/users";
import { supabase } from "@/shared/lib/supabase";
import { buildSchedulingMessage, buildWhatsAppSchedulingUrl } from "../lib/schedulingMessage";
import { formatPhone } from "@/shared/lib/formatters";

interface ClientCardProps {
  client: Client | EnrichedClient;
  isCompact?: boolean;
  onSchedule?: (client: Client | EnrichedClient) => void;
}

// Type guard para verificar se é EnrichedClient
function isEnrichedClient(client: Client | EnrichedClient): client is EnrichedClient {
  return "aum" in client && "daysSinceLastMeeting" in client;
}

// Formatar data para exibição no formato "1 Dez 2025"
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
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function ClientCard({ client, isCompact = false, onSchedule }: ClientCardProps) {
  const {
    id,
    name,
    initials,
    emails,
    phone,
    status,
    advisor,
    clientSince,
    address,
    lastMeeting,
    cpf,
  } = client;
  const email = emails[client.primaryEmailIndex] || emails[0];
  const [, setLocation] = useLocation();
  const { data: currentUserData } = useCurrentUser();
  const calendarLink = currentUserData?.user?.calendarLink;

  // Dados enriquecidos (se disponíveis)
  const enriched = isEnrichedClient(client) ? client : null;

  // Verificar se o cadastro está incompleto
  const isIncompleteRegistration = () => {
    const hasCpf = cpf && cpf.trim().length > 0;
    const hasPhone = phone && phone.trim().length > 0;
    const hasAddress =
      address &&
      (address.street?.trim() ||
        address.city?.trim() ||
        address.state?.trim() ||
        address.zipCode?.trim());
    return !hasCpf && !hasPhone && !hasAddress;
  };

  const incomplete = isIncompleteRegistration();

  // Determinar classe de borda lateral
  const getBorderClass = () => {
    // Borda vermelha completa se cadastro incompleto
    if (incomplete) return "border-[#e07a7a]";

    if (!enriched) return "";
    if (enriched.urgentTasksCount > 0) return "border-l-[4px] border-l-[#e07a7a]";
    if (enriched.meetingDelayStatus === "critical") return "border-l-[4px] border-l-[#e07a7a]";
    if (enriched.meetingDelayStatus === "warning") return "border-l-[4px] border-l-[#dcb092]";
    return "";
  };

  const handleCardClick = () => {
    setLocation(`/clients/${id}`);
  };

  const copy = useCopyToClipboard();

  const handleScheduleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!calendarLink) {
      toast({
        title: "Link de agendamento não configurado",
        description: "Configure seu link do Google Calendar no seu perfil",
        variant: "destructive",
      });
      return;
    }

    if (!phone) {
      onSchedule?.(client);
      return;
    }

    // Record scheduling message sent
    try {
      await supabase
        .from("clients")
        .update({ scheduling_message_sent_at: new Date().toISOString() })
        .eq("id", id);
    } catch (err) {
      console.error("Error recording scheduling sent:", err);
    }

    // Open WhatsApp with pre-formatted message
    const message = buildSchedulingMessage(name, calendarLink);
    const url = buildWhatsAppSchedulingUrl(phone, message);
    window.open(url, "_blank");
  };

  // Cor do indicador de dias
  const getDaysIndicatorColor = () => {
    if (!enriched) return "text-[#8c8c8c]";
    if (enriched.meetingDelayStatus === "critical") return "text-[#e07a7a]";
    if (enriched.meetingDelayStatus === "warning") return "text-[#dcb092]";
    return "text-[#8c8c8c]";
  };

  // Cidade/Estado formatado
  const cityState =
    address?.city && address?.state
      ? `${address.city}/${address.state}`
      : enriched?.cityState || "";

  return (
    <div
      className={cn(
        "cursor-pointer rounded-xl border border-[#3a3a3a] bg-[#1a1a1a] p-5 transition-all",
        "hover:translate-y-[-2px] hover:border-[#444444] hover:bg-[#222222] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]",
        getBorderClass(),
      )}
      data-testid={`card-client-${id}`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div
        className={cn(
          "mb-4 flex items-start gap-3 border-b border-[#3a3a3a] pb-4",
          isCompact && "mb-0 border-b-0 pb-0",
        )}
      >
        {/* Avatar */}
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#2a2a2a] text-sm font-semibold text-[#8c8c8c]">
          {initials}
        </div>

        {/* Info */}
        <div className="flex min-h-[52px] min-w-0 flex-1 flex-col gap-0">
          <div className="m-0 p-0 text-[15px] font-semibold leading-[1.3] text-[#ededed]">
            {name}
          </div>
          <div
            className="m-0 -mx-1 -my-0.5 inline-block cursor-pointer rounded p-0 px-1 py-0.5 text-xs leading-[1.3] text-[#6c6c6c] transition-colors hover:bg-[rgba(176,176,176,0.1)] hover:text-[#b0b0b0]"
            onClick={(e) => {
              e.stopPropagation();
              copy(email, "Email");
            }}
          >
            {email}
          </div>
        </div>

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1a2e1a] px-2.5 py-1 text-[11px] font-semibold text-[#6ecf8e]">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {status}
        </span>
      </div>

      {/* Body - Grid de campos (oculto no modo compacto) */}
      <div
        className={cn(
          "mt-4 grid grid-cols-2 gap-x-6 gap-y-4 transition-all",
          isCompact && "mt-0 max-h-0 overflow-hidden opacity-0",
        )}
      >
        {/* AUM Total */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#5c5c5c]">
            AUM Total
          </span>
          <span className="text-[14px] font-semibold text-[#6ecf8e]">
            {enriched?.aumFormatted || "R$ 0"}
          </span>
        </div>

        {/* Telefone */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#5c5c5c]">
            Telefone
          </span>
          <span
            className="-mx-1 inline-block cursor-pointer whitespace-nowrap rounded px-1 py-0.5 text-[14px] font-medium text-[#ededed] transition-colors hover:bg-[rgba(176,176,176,0.1)] hover:text-[#b0b0b0]"
            onClick={(e) => {
              e.stopPropagation();
              copy(phone, "Telefone");
            }}
          >
            {formatPhone(phone)}
          </span>
        </div>

        {/* Última Reunião */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#5c5c5c]">
            Última Reunião
          </span>
          <span className="text-[14px] font-medium text-[#ededed]">
            {lastMeeting ? formatMeetingDate(lastMeeting) : "-"}
          </span>
        </div>

        {/* Consultor */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#5c5c5c]">
            Consultor
          </span>
          <span className="block truncate text-[14px] font-medium text-[#ededed]">{advisor}</span>
        </div>

        {/* Cidade */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#5c5c5c]">
            Cidade
          </span>
          <span className="text-[14px] font-medium text-[#ededed]">{cityState || "-"}</span>
        </div>

        {/* Cliente Desde */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#5c5c5c]">
            Cliente Desde
          </span>
          <span className="text-[14px] font-medium text-[#ededed]">{clientSince}</span>
        </div>
      </div>

      {/* Footer (oculto no modo compacto) */}
      <div
        className={cn(
          "mt-4 flex items-center justify-between border-t border-[#3a3a3a] pt-4 transition-all",
          isCompact && "mt-0 max-h-0 overflow-hidden border-t-0 pt-0 opacity-0",
        )}
      >
        {/* Indicadores */}
        <div className="flex min-w-[100px] items-center gap-4">
          {/* Dias desde última reunião */}
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[13px] font-semibold",
              getDaysIndicatorColor(),
            )}
          >
            <Calendar className="h-4 w-4" />
            {enriched?.daysSinceLastMeeting !== undefined
              ? `${enriched.daysSinceLastMeeting}d`
              : "-"}
          </span>

          {/* Cadastro incompleto */}
          {incomplete && (
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#e07a7a]">
              <AlertTriangle className="h-4 w-4" />
            </span>
          )}

          {/* Tasks urgentes */}
          {enriched && enriched.urgentTasksCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#e07a7a]">
              <AlertTriangle className="h-4 w-4" />
              {enriched.urgentTasksCount}
            </span>
          )}
        </div>

        {/* Botão Agendar */}
        <button
          onClick={handleScheduleClick}
          className="rounded-lg border border-[#3a5a3a] bg-transparent px-4 py-2 text-xs font-semibold text-[#6ecf8e] transition-colors hover:border-[#6ecf8e] hover:bg-[#1a2e1a]"
        >
          Agendar
        </button>
      </div>
    </div>
  );
}
