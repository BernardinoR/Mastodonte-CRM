import { Zap, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MeetingDecision } from "@/types/meeting";

interface MeetingDecisionsProps {
  decisions: MeetingDecision[];
}

export function MeetingDecisions({ decisions }: MeetingDecisionsProps) {
  if (decisions.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <Zap className="w-[18px] h-[18px] text-[#a78bfa]" />
        <h2 className="text-sm font-semibold text-[#ededed]">Decisões e Pontos de Atenção</h2>
      </div>

      <div className="flex flex-col gap-3">
        {decisions.map((decision) => (
          <div 
            key={decision.id}
            className={cn(
              "flex items-start gap-3 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg",
              decision.type === "warning" 
                ? "border-l-[3px] border-l-[#f59e0b]" 
                : "border-l-[3px] border-l-[#a78bfa]"
            )}
          >
            {decision.type === "warning" ? (
              <AlertTriangle className="w-[18px] h-[18px] text-[#f59e0b] flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-[18px] h-[18px] text-[#a78bfa] flex-shrink-0" />
            )}
            <p 
              className="text-sm text-[#ededed] leading-[1.5]"
              dangerouslySetInnerHTML={{ __html: decision.content }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

