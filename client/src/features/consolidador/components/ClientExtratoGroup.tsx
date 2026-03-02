import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import type { ClientExtratoGroup as ClientExtratoGroupType } from "../types/extrato";
import { ExtratoRow } from "./ExtratoRow";

const clientColors: Record<string, string> = {
  AS: "bg-violet-600",
  RM: "bg-blue-600",
  JP: "bg-emerald-600",
  MO: "bg-rose-600",
  CS: "bg-amber-600",
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
  const avatarColor = clientColors[group.clientInitials] || "bg-gray-600";

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5">
        <ChevronRight
          className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
        />
        <Avatar className="h-6 w-6 rounded-lg">
          <AvatarFallback
            className={`rounded-lg text-[10px] font-semibold text-white ${avatarColor}`}
          >
            {group.clientInitials}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-bold text-white">{group.clientName}</span>
        {group.pendingCount > 0 && (
          <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold text-orange-400">
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
