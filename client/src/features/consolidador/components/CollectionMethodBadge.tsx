import type { ExtratoCollectionMethod } from "../types/extrato";
import { EXTRATO_METHOD_BADGE_COLORS } from "../lib/extratoStatusConfig";
import { Badge } from "@/shared/components/ui/badge";

interface CollectionMethodBadgeProps {
  method: ExtratoCollectionMethod;
}

export function CollectionMethodBadge({ method }: CollectionMethodBadgeProps) {
  return (
    <Badge className={`${EXTRATO_METHOD_BADGE_COLORS[method]} text-[10px] font-bold`}>
      {method}
    </Badge>
  );
}
