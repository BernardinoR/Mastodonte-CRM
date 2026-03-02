import type { Extrato } from "../types/extrato";
import { statusStyles } from "../lib/extratoStatusConfig";
import { ExtratoStatusBadge } from "./ExtratoStatusBadge";
import { CollectionMethodBadge } from "./CollectionMethodBadge";
import { ExtratoActionButtons } from "./ExtratoActionButtons";

interface ExtratoRowProps {
  extrato: Extrato;
  onConsolidar?: (id: string) => void;
}

export function ExtratoRow({ extrato, onConsolidar }: ExtratoRowProps) {
  const dotColor = statusStyles[extrato.status].dot;

  return (
    <div className="flex items-center gap-4 rounded px-4 py-2 hover:bg-white/5">
      <span className={`h-2 w-2 flex-shrink-0 rounded-full ${dotColor}`} />
      <span className="min-w-[140px] text-sm font-medium text-white">{extrato.institution}</span>
      <span className="min-w-[70px] text-xs text-gray-500">{extrato.accountType}</span>
      <CollectionMethodBadge method={extrato.collectionMethod} />
      <ExtratoStatusBadge status={extrato.status} />
      <div className="ml-auto">
        <ExtratoActionButtons
          showConsolidar={extrato.status === "Recebido"}
          onConsolidar={() => onConsolidar?.(extrato.id)}
        />
      </div>
    </div>
  );
}
