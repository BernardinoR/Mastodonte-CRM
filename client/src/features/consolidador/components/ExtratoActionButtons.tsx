import { useState } from "react";
import { MessageCircle, Mail, RefreshCw } from "lucide-react";

interface ExtratoActionButtonsProps {
  onWhatsApp?: () => void;
  onEmail?: () => void;
  onConsolidar?: () => void;
  onSync?: () => Promise<void>;
}

export function ExtratoActionButtons({
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
      <button
        onClick={onWhatsApp}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-green-400 transition-colors hover:border-green-500/30 hover:bg-green-500/10"
        title="WhatsApp"
      >
        <MessageCircle className="h-[18px] w-[18px]" />
      </button>
      <button
        onClick={onEmail}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-blue-400 transition-colors hover:border-blue-500/30 hover:bg-blue-500/10"
        title="Email"
      >
        <Mail className="h-[18px] w-[18px]" />
      </button>
      <button
        onClick={onConsolidar}
        className="h-7 rounded-lg border border-white/10 px-4 py-0.5 text-xs font-bold text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
      >
        Consolidar
      </button>
    </div>
  );
}
