import { useState } from "react";
import { MessageCircle, Mail, RefreshCw, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

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
