import { MessageCircle, Mail } from "lucide-react";

interface ExtratoActionButtonsProps {
  onWhatsApp?: () => void;
  onEmail?: () => void;
  onConsolidar?: () => void;
}

export function ExtratoActionButtons({
  onWhatsApp,
  onEmail,
  onConsolidar,
}: ExtratoActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
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
