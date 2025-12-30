import { FileText, User, AlertCircle, Home, Plane, CreditCard, Building, AlertTriangle, Truck, Briefcase, Heart, Star, Target } from "lucide-react";
import type { MeetingClientContext, MeetingHighlight } from "@/types/meeting";
import { MeetingSummaryEditor } from "./MeetingSummaryEditor";

interface MeetingSummaryProps {
  summary: string;
  clientName: string;
  clientContext: MeetingClientContext;
  highlights: MeetingHighlight[];
  meetingDate: Date;
  isEditing?: boolean;
  onSave?: (data: {
    summary: string;
    clientContext: MeetingClientContext;
    highlights: MeetingHighlight[];
  }) => void;
  onCancelEdit?: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  "alert-circle": AlertCircle,
  "home": Home,
  "plane": Plane,
  "credit-card": CreditCard,
  "building": Building,
  "alert-triangle": AlertTriangle,
  "truck": Truck,
  "briefcase": Briefcase,
  "heart": Heart,
  "star": Star,
  "target": Target,
};

export function MeetingSummary({ 
  summary, 
  clientName, 
  clientContext, 
  highlights,
  meetingDate,
  isEditing = false,
  onSave,
  onCancelEdit,
}: MeetingSummaryProps) {
  // Render editor when in editing mode
  if (isEditing && onSave && onCancelEdit) {
    return (
      <MeetingSummaryEditor
        clientName={clientName}
        meetingDate={meetingDate}
        initialSummary={summary}
        initialClientContext={clientContext}
        initialHighlights={highlights}
        onSave={onSave}
        onCancel={onCancelEdit}
      />
    );
  }

  // Render view mode
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <FileText className="w-[18px] h-[18px] text-[#8c8c8c]" />
        <h2 className="text-sm font-semibold text-[#ededed]">Resumo da Reunião</h2>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[10px] p-6">
        <p 
          className="text-sm text-[#a0a0a0] leading-[1.7]"
          dangerouslySetInnerHTML={{ __html: summary }}
        />

        {/* Client Context */}
        {clientContext.points.length > 0 && (
          <div className="mt-5 pt-5 border-t border-[#2a2a2a]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#a78bfa] uppercase tracking-wider mb-3">
              <User className="w-3.5 h-3.5" />
              Contexto da Cliente - {clientName}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clientContext.points.map((point) => {
                const IconComponent = iconMap[point.icon] || AlertCircle;
                return (
                  <div 
                    key={point.id}
                    className="flex items-start gap-2.5 p-3 bg-[#202020] rounded-lg"
                  >
                    <IconComponent className="w-4 h-4 text-[#6db1d4] flex-shrink-0 mt-0.5" />
                    <span className="text-[0.8125rem] text-[#b0b0b0] leading-[1.5]">
                      {point.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="mt-5 pt-5 border-t border-[#2a2a2a] flex flex-wrap gap-2.5">
            {highlights.map((highlight) => {
              const IconComponent = iconMap[highlight.icon] || Building;
              return (
                <span 
                  key={highlight.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#252730] border border-[#363842] rounded-md text-xs text-[#ededed]"
                >
                  <IconComponent 
                    className={`w-3 h-3 ${highlight.type === "warning" ? "text-[#f59e0b]" : "text-[#6ecf8e]"}`} 
                  />
                  {highlight.text}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
