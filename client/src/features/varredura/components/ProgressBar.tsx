import { CheckCircle, Mail } from "lucide-react";

export function ProgressBar({
  checkedDirect,
  totalDirect,
  solicitedManager,
  totalManager,
}: {
  checkedDirect: number;
  totalDirect: number;
  solicitedManager: number;
  totalManager: number;
}) {
  const total = totalDirect + totalManager;
  const done = checkedDirect + solicitedManager;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const directPct = total > 0 ? (checkedDirect / total) * 100 : 0;
  const managerPct = total > 0 ? (solicitedManager / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-2" data-testid="progress-bar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-[#8c8c8c]">
            <CheckCircle className="h-3.5 w-3.5 text-[#6ecf8e]" />
            <span className="text-[#6ecf8e] font-semibold">{checkedDirect}</span>
            <span>/ {totalDirect} diretos</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[#8c8c8c]">
            <Mail className="h-3.5 w-3.5 text-[#6db1d4]" />
            <span className="text-[#6db1d4] font-semibold">{solicitedManager}</span>
            <span>/ {totalManager} solicitados</span>
          </span>
        </div>
        <span className="text-xs font-bold text-[#ededed]">{pct}%</span>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-[#252525]">
        <div
          className="h-full bg-[#6ecf8e] transition-all duration-300"
          style={{ width: `${directPct}%` }}
        />
        <div
          className="h-full bg-[#6db1d4] transition-all duration-300"
          style={{ width: `${managerPct}%` }}
        />
      </div>
    </div>
  );
}
