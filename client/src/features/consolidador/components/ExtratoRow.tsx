import type { Extrato, ExtratoStatus, ExtratoCollectionMethod } from "../types/extrato";
import { statusStyles } from "../lib/extratoStatusConfig";
import { ExtratoStatusBadge } from "./ExtratoStatusBadge";
import { CollectionMethodBadge } from "./CollectionMethodBadge";
import { ExtratoActionButtons } from "./ExtratoActionButtons";

interface ExtratoRowProps {
  extrato: Extrato;
  onConsolidar?: (extrato: Extrato) => void;
  onStatusChange?: (extratoId: string, status: ExtratoStatus) => void;
  onMethodChange?: (extratoId: string, method: ExtratoCollectionMethod) => void;
  onSync?: (extrato: Extrato) => Promise<void>;
  labelField?: "institution" | "client";
}

export function ExtratoRow({
  extrato,
  onConsolidar,
  onStatusChange,
  onMethodChange,
  onSync,
  labelField = "institution",
}: ExtratoRowProps) {
  const style = statusStyles[extrato.status];

  return (
    <div className="group flex items-center gap-4 rounded-lg px-5 py-2 hover:bg-white/5">
      <span className={`h-2 w-2 flex-shrink-0 rounded-full ${style.dot}`} />
      <span className="w-48 text-sm font-medium text-zinc-300">
        {labelField === "client" ? extrato.clientName : extrato.institution}
      </span>
      <span className="w-16 text-xs text-zinc-600">{extrato.accountType}</span>
      <CollectionMethodBadge
        method={extrato.collectionMethod}
        onMethodChange={(method) => onMethodChange?.(extrato.id, method)}
      />
      <ExtratoStatusBadge
        extrato={extrato}
        onStatusChange={(status) => onStatusChange?.(extrato.id, status)}
      />
      <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
        <ExtratoActionButtons
          onConsolidar={() => onConsolidar?.(extrato)}
          onSync={onSync ? () => onSync(extrato) : undefined}
        />
      </div>
    </div>
  );
}
