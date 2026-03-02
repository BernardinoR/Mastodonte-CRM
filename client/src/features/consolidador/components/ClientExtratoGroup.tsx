import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import type { ClientExtratoGroup as ClientExtratoGroupType } from "../types/extrato";
import { ExtratoRow } from "./ExtratoRow";

const clientColors: Record<string, { bg: string; border: string }> = {
  AS: { bg: "bg-violet-600", border: "border-violet-800" },
  RM: { bg: "bg-blue-600", border: "border-blue-800" },
  JP: { bg: "bg-emerald-600", border: "border-emerald-800" },
  MO: { bg: "bg-rose-600", border: "border-rose-800" },
  CS: { bg: "bg-amber-600", border: "border-amber-800" },
};

interface ClientExtratoGroupProps {
  group: ClientExtratoGroupType;
  isExpanded: boolean;
  onToggle: () => void;
  onConsolidar?: (id: string) => void;
}

export function ClientExtratoGroup({
  group,
  isExpanded,
  onToggle,
  onConsolidar,
}: ClientExtratoGroupProps) {
  const colors = clientColors[group.clientInitials] || {
    bg: "bg-gray-600",
    border: "border-gray-700",
  };
  const hasPending = group.pendingCount > 0;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 ${
          !hasPending && !isExpanded ? "opacity-60 hover:opacity-100" : ""
        }`}
      >
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? "" : "-rotate-90"}`}
        />
        <Avatar className={`h-6 w-6 rounded-lg border ${colors.border}`}>
          <AvatarFallback
            className={`rounded-lg text-[10px] font-semibold text-white ${colors.bg}`}
          >
            {group.clientInitials}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-bold text-white">{group.clientName}</span>
        {group.pendingCount > 0 && (
          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">
            {group.pendingCount} PENDENTE{group.pendingCount > 1 ? "S" : ""}
          </span>
        )}
        <span className="ml-auto text-xs text-gray-500">
          {group.extratos.length} extrato{group.extratos.length > 1 ? "s" : ""}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-5 flex flex-col gap-0.5 border-l border-[#2f3542] pl-4">
          {group.extratos.map((extrato) => (
            <ExtratoRow key={extrato.id} extrato={extrato} onConsolidar={onConsolidar} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
