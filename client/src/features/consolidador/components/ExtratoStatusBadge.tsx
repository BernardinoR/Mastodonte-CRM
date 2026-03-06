import type { Extrato } from "../types/extrato";
import { EXTRATO_STATUS_BADGE_COLORS, getStatusElapsedText } from "../lib/extratoStatusConfig";
import { Badge } from "@/shared/components/ui/badge";

interface ExtratoStatusBadgeProps {
  extrato: Extrato;
}

export function ExtratoStatusBadge({ extrato }: ExtratoStatusBadgeProps) {
  const label = getStatusElapsedText(extrato);
  const { status } = extrato;

  return (
    <Badge
      className={`${EXTRATO_STATUS_BADGE_COLORS[status]} rounded-lg border-transparent px-3 py-1 text-[10px] font-bold`}
    >
      {label}
    </Badge>
  );
}
