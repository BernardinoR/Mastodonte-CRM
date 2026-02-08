import { FileText, Calendar, ChevronRight, Building2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UI_CLASSES } from "../../lib/statusConfig";

interface TaskMeetingLinkProps {
  meeting: {
    id: number;
    title: string;
    date: Date;
    type: string;
    clientName?: string;
  };
  onNavigate?: (meetingId: number) => void;
}

export function TaskMeetingLink({ meeting, onNavigate }: TaskMeetingLinkProps) {
  return (
    <div>
      <label className={UI_CLASSES.sectionLabel}>Reunião de Origem</label>
      <div className={UI_CLASSES.meetingLinkCard} onClick={() => onNavigate?.(meeting.id)}>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[#2eaadc]/10">
          <FileText className="h-5 w-5 text-[#2eaadc]" />
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-white">{meeting.title}</span>
            <span className="flex-shrink-0 rounded bg-[#2eaadc]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#2eaadc]">
              {meeting.type}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(meeting.date), "dd/MM/yyyy", { locale: ptBR })}
            </span>
            {meeting.clientName && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {meeting.clientName}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-600 transition-colors group-hover:text-gray-400" />
      </div>
    </div>
  );
}
