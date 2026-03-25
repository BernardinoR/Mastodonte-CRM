import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import type {
  ClientExtratoGroup as ClientExtratoGroupType,
  Extrato,
  ExtratoStatus,
  ExtratoCollectionMethod,
} from "../types/extrato";
import { ExtratoRow } from "./ExtratoRow";
import { getInstitutionColor } from "@/features/clients/lib/institutionColors";
import { getClientAvatarColor } from "../lib/avatarColors";

interface ClientExtratoGroupProps {
  group: ClientExtratoGroupType;
  isExpanded: boolean;
  onToggle: () => void;
  onConsolidar?: (extrato: Extrato) => void;
  onStatusChange?: (extratoId: string, status: ExtratoStatus) => void;
  onMethodChange?: (extratoId: string, method: ExtratoCollectionMethod) => void;
  onSync?: (extrato: Extrato) => Promise<void>;
  pendingMonthsMap?: Map<string, string[]>;
  onBatchStatusChange?: (contaId: string, months: string[], status: ExtratoStatus) => void;
  labelField?: "institution" | "client";
  groupBy?: "client" | "institution";
}

export function ClientExtratoGroup({
  group,
  isExpanded,
  onToggle,
  onConsolidar,
  onStatusChange,
  onMethodChange,
  onSync,
  pendingMonthsMap,
  onBatchStatusChange,
  labelField = "institution",
  groupBy = "client",
}: ClientExtratoGroupProps) {
  const colors =
    groupBy === "institution"
      ? getInstitutionColor(group.clientName)
      : getClientAvatarColor(group.clientName);
  return (
    <div className="border-b border-white/5">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger className="flex w-full items-center gap-4 rounded-lg px-4 py-3 hover:bg-white/5">
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? "" : "-rotate-90"}`}
          />
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${colors.bg}`}>
            <span className={`text-xs font-bold ${colors.text}`}>{group.clientInitials}</span>
          </div>
          <span className="text-base font-bold text-white">{group.clientName}</span>
          {group.pendingCount > 0 && (
            <span className="rounded bg-red-950/40 px-2.5 py-1 text-[10px] font-bold uppercase text-red-500">
              {group.pendingCount} PENDENTE{group.pendingCount > 1 ? "S" : ""}
            </span>
          )}
          <span className="ml-auto text-xs text-zinc-600">
            {group.extratos.length} extrato{group.extratos.length > 1 ? "s" : ""}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-1 space-y-0 pl-12">
            {group.extratos.map((extrato) => (
              <ExtratoRow
                key={extrato.id}
                extrato={extrato}
                onConsolidar={onConsolidar}
                onStatusChange={onStatusChange}
                onMethodChange={onMethodChange}
                onSync={onSync}
                pendingMonths={pendingMonthsMap?.get(extrato.contaId)}
                onBatchStatusChange={onBatchStatusChange}
                labelField={labelField}
                groupBy={groupBy}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
