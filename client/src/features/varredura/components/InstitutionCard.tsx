import { ExternalLink, CheckCircle, Clock } from "lucide-react";
import { getInstitutionColor } from "@/features/clients/lib/institutionColors";

interface InstitutionCardProps {
  institutionName: string;
  initials: string;
  checked: boolean;
  onToggle: () => void;
}

export function InstitutionCard({
  institutionName,
  initials,
  checked,
  onToggle,
}: InstitutionCardProps) {
  const color = getInstitutionColor(institutionName);

  return (
    <div
      className="group rounded-xl border border-[#3a3a3a] bg-[#1a1a1a] p-4 transition-colors hover:bg-[#1e1e1e]"
      data-testid={`card-institution-${initials.toLowerCase()}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${color.bg} ${color.text} ${color.border}`}
          >
            {initials}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-[#ededed]">{institutionName}</span>
            {checked ? (
              <span className="flex items-center gap-1 text-[11px] font-medium text-[#6ecf8e]">
                <CheckCircle className="h-3 w-3" />
                Verificado
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-medium text-[#8c8c8c]">
                <Clock className="h-3 w-3" />
                Pendente
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onToggle}
          className="relative mt-0.5 flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors"
          style={{
            backgroundColor: checked ? "rgba(110,207,142,0.25)" : "#2c2c2c",
          }}
          data-testid={`toggle-${initials.toLowerCase()}`}
        >
          <span
            className="block h-3.5 w-3.5 rounded-full transition-all duration-200"
            style={{
              backgroundColor: checked ? "#6ecf8e" : "#555",
              transform: checked ? "translateX(14px)" : "translateX(0)",
            }}
          />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#2a2a2a] pt-3">
        <button
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-[#8c8c8c] transition-colors hover:bg-[#2c2c2c] hover:text-[#ededed]"
          data-testid={`button-access-${initials.toLowerCase()}`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Acessar
        </button>
      </div>
    </div>
  );
}
