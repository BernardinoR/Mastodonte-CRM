import type { ExtratoCollectionMethod } from "../types/extrato";
import { collectionMethodStyles } from "../lib/extratoStatusConfig";

interface CollectionMethodBadgeProps {
  method: ExtratoCollectionMethod;
}

export function CollectionMethodBadge({ method }: CollectionMethodBadgeProps) {
  const style = collectionMethodStyles[method];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${style}`}
    >
      {method}
    </span>
  );
}
