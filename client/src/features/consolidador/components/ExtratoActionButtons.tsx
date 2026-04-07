import { useState } from "react";
import {
  MessageCircle,
  Mail,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import type { VerificationResult } from "../types/extrato";

interface ExtratoActionButtonsProps {
  clientName: string;
  hasWhatsApp?: boolean;
  hasEmail?: boolean;
  contactPhone?: string;
  contactEmail?: string;
  onWhatsApp?: () => void;
  onEmail?: () => void;
  onConsolidar?: () => void;
  onSync?: () => Promise<void>;
  verificationStatus?: VerificationResult;
}

export function ExtratoActionButtons({
  clientName,
  hasWhatsApp,
  hasEmail,
  contactPhone,
  contactEmail,
  onWhatsApp,
  onEmail,
  onConsolidar,
  onSync,
  verificationStatus,
}: ExtratoActionButtonsProps) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    if (!onSync || syncing) return;
    setSyncing(true);
    try {
      await onSync();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {verificationStatus && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-transparent transition-colors ${
                verificationStatus.all_green
                  ? "text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10"
                  : "text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
              }`}
            >
              {verificationStatus.all_green ? (
                <ShieldCheck className="h-4 w-4" />
              ) : (
                <ShieldAlert className="h-4 w-4" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-64 p-0 text-xs" align="center">
            <div className="space-y-0">
              <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
                {verificationStatus.all_green ? (
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                )}
                <span className="font-semibold text-white">Verificação de Dados</span>
              </div>
              <div className="space-y-px px-2 py-2">
                <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      verificationStatus.patrimonio_status === "match"
                        ? "bg-emerald-400"
                        : verificationStatus.patrimonio_status === "no-data"
                          ? "bg-zinc-600"
                          : "bg-red-400"
                    }`}
                  />
                  <span className="flex-1 text-zinc-400">Patrimônio</span>
                  <span
                    className={`font-mono text-[11px] ${
                      verificationStatus.patrimonio_status === "match"
                        ? "text-emerald-400"
                        : verificationStatus.patrimonio_status === "no-data"
                          ? "text-zinc-600"
                          : "text-red-400"
                    }`}
                  >
                    {verificationStatus.patrimonio_status === "match"
                      ? "OK"
                      : verificationStatus.patrimonio_status === "no-data"
                        ? "Sem dados"
                        : `Δ ${verificationStatus.diferenca.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      verificationStatus.unclassified_count === 0 ? "bg-emerald-400" : "bg-red-400"
                    }`}
                  />
                  <span className="flex-1 text-zinc-400">Não classificados</span>
                  <span
                    className={`font-mono text-[11px] ${
                      verificationStatus.unclassified_count === 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {verificationStatus.unclassified_count === 0
                      ? "OK"
                      : verificationStatus.unclassified_count}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      verificationStatus.missing_yield_count === 0 ? "bg-emerald-400" : "bg-red-400"
                    }`}
                  />
                  <span className="flex-1 text-zinc-400">Sem rendimento</span>
                  <span
                    className={`font-mono text-[11px] ${
                      verificationStatus.missing_yield_count === 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {verificationStatus.missing_yield_count === 0
                      ? "OK"
                      : verificationStatus.missing_yield_count}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      verificationStatus.new_asset_count === 0 ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                  <span className="flex-1 text-zinc-400">Ativos novos</span>
                  <span
                    className={`font-mono text-[11px] ${
                      verificationStatus.new_asset_count === 0
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {verificationStatus.new_asset_count === 0
                      ? "OK"
                      : verificationStatus.new_asset_count}
                  </span>
                </div>
              </div>
              {verificationStatus.verified_at && (
                <div className="border-t border-white/5 px-4 py-2 text-[10px] text-zinc-600">
                  {new Date(verificationStatus.verified_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() =>
                window.open(
                  `https://invest-insight-visor.lovable.app/data-management/${encodeURIComponent(clientName)}`,
                  "_blank",
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-purple-400 transition-colors hover:border-purple-500/30 hover:bg-purple-500/10"
            >
              <ExternalLink className="h-[16px] w-[16px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Alocação do cliente
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {onSync && (
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-zinc-400 transition-colors hover:border-zinc-500/30 hover:bg-zinc-500/10 disabled:opacity-50"
          title="Re-sync com Supabase"
        >
          <RefreshCw className={`h-[16px] w-[16px] ${syncing ? "animate-spin" : ""}`} />
        </button>
      )}
      {hasWhatsApp && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onWhatsApp}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-green-400 transition-colors hover:border-green-500/30 hover:bg-green-500/10"
              >
                <MessageCircle className="h-[18px] w-[18px]" />
              </button>
            </TooltipTrigger>
            {contactPhone && (
              <TooltipContent side="top" className="text-xs">
                {contactPhone}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      )}
      {hasEmail && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onEmail}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-blue-400 transition-colors hover:border-blue-500/30 hover:bg-blue-500/10"
              >
                <Mail className="h-[18px] w-[18px]" />
              </button>
            </TooltipTrigger>
            {contactEmail && (
              <TooltipContent side="top" className="text-xs">
                {contactEmail}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      )}
      <button
        onClick={onConsolidar}
        className="h-7 rounded-lg border border-white/10 px-4 py-0.5 text-xs font-bold text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
      >
        Consolidar
      </button>
    </div>
  );
}
