import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  MessageSquare,
  Mail,
} from "lucide-react";
import type { ManagerGroup, VarreduraStatus } from "../types/varredura";
import { getInstitutionColor } from "@/features/clients/lib/institutionColors";
import { useToast } from "@/shared/hooks/use-toast";
import {
  buildSweepMessage,
  buildSweepWhatsAppUrl,
  buildSweepMailtoUrl,
} from "../utils/sweepMessage";

const STATUS_CONFIG: Record<
  VarreduraStatus,
  { label: string; color: string; bg: string; dot: string; Icon: typeof CheckCircle }
> = {
  verificado: {
    label: "Verificado",
    color: "text-[#6ecf8e]",
    bg: "bg-[rgba(110,207,142,0.1)]",
    dot: "bg-[#6ecf8e]",
    Icon: CheckCircle,
  },
  pendente: {
    label: "Pendente",
    color: "text-[#dcb092]",
    bg: "bg-[rgba(220,176,146,0.1)]",
    dot: "bg-[#dcb092]",
    Icon: AlertTriangle,
  },
  solicitado: {
    label: "Solicitado",
    color: "text-[#6db1d4]",
    bg: "bg-[rgba(109,177,212,0.1)]",
    dot: "bg-[#6db1d4]",
    Icon: Clock,
  },
};

export function ManagerGroupCard({
  group,
  defaultExpanded = false,
  onStatusChange,
}: {
  group: ManagerGroup;
  defaultExpanded?: boolean;
  onStatusChange?: (contaId: string) => void;
}) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const color = getInstitutionColor(group.institutionName);
  const pendingCount = group.clients.filter((c) => c.status === "pendente").length;
  const solicitedCount = group.clients.filter((c) => c.status === "solicitado").length;

  return (
    <div
      className="overflow-hidden rounded-xl border border-[#3a3a3a] bg-[#1a1a1a]"
      data-testid={`card-manager-${group.institutionName.toLowerCase().replace(/\s/g, "-")}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#222222]"
        data-testid={`button-toggle-${group.institutionName.toLowerCase().replace(/\s/g, "-")}`}
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${color.bg} ${color.border}`}
        >
          <span className={`text-[10px] font-bold ${color.text}`}>{group.initials}</span>
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-[#ededed]">{group.institutionName}</span>
          <span className="text-xs text-[#666]">{group.clients.length} clientes</span>
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
                key={client.contaId}
                className={`group/row flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#1e1e1e] ${
                  idx < group.clients.length - 1 ? "border-b border-[#252525]" : ""
                }`}
                data-testid={`row-client-${client.clientInitials.toLowerCase()}`}
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${sc.dot}`} />
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#252525]">
                  <span className="text-[9px] font-bold text-[#999]">{client.clientInitials}</span>
                </div>
                <span className="w-40 shrink-0 text-sm font-medium text-[#ccc]">
                  {client.clientName}
                </span>
                <span className="text-xs text-[#555]">{client.accountName}</span>
                <div className="invisible ml-auto flex shrink-0 items-center gap-1 group-hover/row:visible">
                  {(client.whatsappGroupLink || client.phone) && (
                    <button
                      onClick={() => {
                        const msg = buildSweepMessage(client, group.institutionName);
                        if (client.whatsappIsGroup && client.whatsappGroupLink) {
                          navigator.clipboard.writeText(msg);
                          toast({ title: "Mensagem copiada!" });
                          window.open(client.whatsappGroupLink, "_blank");
                        } else {
                          window.open(buildSweepWhatsAppUrl(client.phone!, msg), "_blank");
                        }
                        if (client.status !== "verificado") onStatusChange?.(client.contaId);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[#555] hover:bg-[#333] hover:text-[#6ecf8e]"
                      data-testid={`button-whatsapp-${client.clientInitials.toLowerCase()}`}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {client.email && (
                    <button
                      onClick={() => {
                        window.open(
                          buildSweepMailtoUrl(client.email!, client, group.institutionName),
                        );
                        if (client.status !== "verificado") onStatusChange?.(client.contaId);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[#555] hover:bg-[#333] hover:text-[#6db1d4]"
                      data-testid={`button-email-${client.clientInitials.toLowerCase()}`}
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-semibold ${sc.bg} ${sc.color}`}
                >
                  <sc.Icon className="h-3 w-3" />
                  {sc.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
