import type { ExtratoStatus } from "../types/extrato";
import { statusStyles } from "../lib/extratoStatusConfig";

interface ExtratoStatusBadgeProps {
  status: ExtratoStatus;
}

export function ExtratoStatusBadge({ status }: ExtratoStatusBadgeProps) {
  const style = statusStyles[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${style.bg} ${style.text} ${style.border}`}
    >
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}
