import type { Extrato } from "../types/extrato";
import { statusStyles } from "../lib/extratoStatusConfig";
import { ExtratoStatusBadge } from "./ExtratoStatusBadge";
import { CollectionMethodBadge } from "./CollectionMethodBadge";
import { ExtratoActionButtons } from "./ExtratoActionButtons";

interface ExtratoRowProps {
  extrato: Extrato;
  onConsolidar?: (extrato: Extrato) => void;
  labelField?: "institution" | "client";
}

export function ExtratoRow({ extrato, onConsolidar, labelField = "institution" }: ExtratoRowProps) {
  const style = statusStyles[extrato.status];

  return (
    <div className="flex items-center gap-4 rounded-lg px-5 py-2 hover:bg-white/5">
      <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${style.dot} ${style.glow}`} />
      <span className="w-48 text-base font-medium text-white">
        {labelField === "client" ? extrato.clientName : extrato.institution}
      </span>
      <span className="w-16 text-xs text-zinc-600">{extrato.accountType}</span>
      <CollectionMethodBadge method={extrato.collectionMethod} />
      <ExtratoStatusBadge extrato={extrato} />
      <div className="ml-auto">
        <ExtratoActionButtons onConsolidar={() => onConsolidar?.(extrato)} />
      </div>
    </div>
  );
}
