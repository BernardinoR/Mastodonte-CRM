import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import type { ClientExtratoGroup as ClientExtratoGroupType, Extrato } from "../types/extrato";
import { ExtratoRow } from "./ExtratoRow";

const clientColors: Record<string, { bg: string; text: string; border: string }> = {
  AS: { bg: "bg-blue-900/50", text: "text-blue-300", border: "border-blue-800" },
  RM: { bg: "bg-purple-900/50", text: "text-purple-300", border: "border-purple-800" },
  JP: { bg: "bg-green-900/50", text: "text-green-300", border: "border-green-800" },
  MO: { bg: "bg-rose-900/50", text: "text-rose-300", border: "border-rose-800" },
  CS: { bg: "bg-amber-900/50", text: "text-amber-300", border: "border-amber-800" },
  FL: { bg: "bg-teal-900/50", text: "text-teal-300", border: "border-teal-800" },
  PA: { bg: "bg-indigo-900/50", text: "text-indigo-300", border: "border-indigo-800" },
  BC: { bg: "bg-pink-900/50", text: "text-pink-300", border: "border-pink-800" },
  LF: { bg: "bg-cyan-900/50", text: "text-cyan-300", border: "border-cyan-800" },
  DR: { bg: "bg-orange-900/50", text: "text-orange-300", border: "border-orange-800" },
};

interface ClientExtratoGroupProps {
  group: ClientExtratoGroupType;
  isExpanded: boolean;
  onToggle: () => void;
  onConsolidar?: (extrato: Extrato) => void;
  labelField?: "institution" | "client";
}

export function ClientExtratoGroup({
  group,
  isExpanded,
  onToggle,
  onConsolidar,
  labelField = "institution",
}: ClientExtratoGroupProps) {
  const colors = clientColors[group.clientInitials] || {
    bg: "bg-gray-900/50",
    text: "text-gray-300",
    border: "border-gray-700",
  };
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex w-full items-center gap-4 rounded-lg px-4 py-3 hover:bg-white/5">
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? "" : "-rotate-90"}`}
        />
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${colors.border} ${colors.bg}`}
        >
          <span className={`text-xs font-bold ${colors.text}`}>{group.clientInitials}</span>
        </div>
        <span className="text-base font-bold text-white">{group.clientName}</span>
        {group.pendingCount > 0 && (
          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400">
            {group.pendingCount} PENDENTE{group.pendingCount > 1 ? "S" : ""}
          </span>
        )}
        <span className="ml-auto text-sm text-gray-500">
          {group.extratos.length} extrato{group.extratos.length > 1 ? "s" : ""}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-6 flex flex-col gap-0.5 border-l border-[#2f3542] pl-5">
          {group.extratos.map((extrato) => (
            <ExtratoRow
              key={extrato.id}
              extrato={extrato}
              onConsolidar={onConsolidar}
              labelField={labelField}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
