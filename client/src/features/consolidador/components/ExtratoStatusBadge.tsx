import { useState } from "react";
import type { Extrato, ExtratoStatus } from "../types/extrato";
import {
  EXTRATO_STATUS_BADGE_COLORS,
  statusStyles,
  getStatusElapsedText,
} from "../lib/extratoStatusConfig";
import { Badge } from "@/shared/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover";

const SELECTABLE_STATUSES: ExtratoStatus[] = ["Pendente", "Solicitado", "Recebido"];

interface ExtratoStatusBadgeProps {
  extrato: Extrato;
  onStatusChange?: (status: ExtratoStatus) => void;
}

export function ExtratoStatusBadge({ extrato, onStatusChange }: ExtratoStatusBadgeProps) {
  const [open, setOpen] = useState(false);
  const label = getStatusElapsedText(extrato);
  const { status } = extrato;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Badge
          className={`${EXTRATO_STATUS_BADGE_COLORS[status]} cursor-pointer rounded-lg border-transparent px-3 py-1 text-[11px] font-bold`}
        >
          {label}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="start">
        <div className="flex flex-col">
          {SELECTABLE_STATUSES.map((s) => {
            const style = statusStyles[s];
            return (
              <button
                key={s}
                onClick={() => {
                  onStatusChange?.(s);
                  setOpen(false);
                }}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-white/10"
              >
                <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                {s}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
