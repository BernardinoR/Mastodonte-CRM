import { useState } from "react";
import type { ExtratoCollectionMethod } from "../types/extrato";
import { EXTRATO_METHOD_BADGE_COLORS } from "../lib/extratoStatusConfig";
import { Badge } from "@/shared/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover";

const ALL_METHODS: ExtratoCollectionMethod[] = ["Automático", "Manual", "Manual Cliente"];

interface CollectionMethodBadgeProps {
  method: ExtratoCollectionMethod;
  onMethodChange?: (method: ExtratoCollectionMethod) => void;
}

export function CollectionMethodBadge({ method, onMethodChange }: CollectionMethodBadgeProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Badge
          className={`${EXTRATO_METHOD_BADGE_COLORS[method]} cursor-pointer rounded-lg px-3 py-1 text-[11px] font-bold`}
        >
          {method}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="start">
        <div className="flex flex-col">
          {ALL_METHODS.map((m) => (
            <button
              key={m}
              onClick={() => {
                onMethodChange?.(m);
                setOpen(false);
              }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-white/10"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  m === "Automático"
                    ? "bg-emerald-500"
                    : m === "Manual"
                      ? "bg-zinc-500"
                      : "bg-amber-500"
                }`}
              />
              {m}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
