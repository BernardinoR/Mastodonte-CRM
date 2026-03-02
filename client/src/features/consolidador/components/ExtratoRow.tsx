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
  const style = statusStyles[extrato.status];

  return (
    <div className="flex items-center gap-4 rounded-lg px-5 py-3 hover:bg-white/5">
      <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${style.dot} ${style.glow}`} />
      <span className="min-w-[140px] text-base font-medium text-white">{extrato.institution}</span>
      <span className="min-w-[100px] text-sm text-gray-500">{extrato.accountType}</span>
      <span className="min-w-[120px]">
        <CollectionMethodBadge method={extrato.collectionMethod} />
      </span>
      <span className="flex-1">
        <ExtratoStatusBadge status={extrato.status} />
      </span>
      <div className="ml-auto">
        <ExtratoActionButtons onConsolidar={() => onConsolidar?.(extrato.id)} />
      </div>
    </div>
  );
}
