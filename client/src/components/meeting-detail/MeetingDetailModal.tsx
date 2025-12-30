import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  X, 
  Calendar, 
  Clock, 
  Video, 
  Timer,
  Edit2,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { MeetingSummary } from "./MeetingSummary";
import { MeetingAgenda } from "./MeetingAgenda";
import { MeetingDecisions } from "./MeetingDecisions";
import { MeetingTasks } from "./MeetingTasks";
import { MeetingParticipants } from "./MeetingParticipants";
import { MeetingAttachments } from "./MeetingAttachments";
import type { MeetingDetail, MeetingClientContext, MeetingHighlight } from "@/types/meeting";

interface MeetingDetailModalProps {
  meeting: MeetingDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateMeeting?: (meetingId: string, updates: Partial<MeetingDetail>) => void;
}

const typeColors: Record<string, string> = {
  "Reunião Mensal": "bg-[#203828] text-[#6ecf8e]",
  "Reunião Anual": "bg-[#203828] text-[#6ecf8e]",
  "Política de Investimento": "bg-[#422c24] text-[#dcb092]",
  "Patrimônio Previdencial": "bg-[#38273f] text-[#d09cdb]",
  "Mensal": "bg-[#203828] text-[#6ecf8e]",
  "Follow-up": "bg-[#422c24] text-[#dcb092]",
  "Especial": "bg-[#38273f] text-[#d09cdb]",
};

const statusColors: Record<string, string> = {
  "Agendada": "bg-[#243041] text-[#6db1d4]",
  "Realizada": "bg-[#203828] text-[#6ecf8e]",
  "Cancelada": "bg-[#3d2626] text-[#e07a7a]",
};

export function MeetingDetailModal({ 
  meeting, 
  open, 
  onOpenChange,
  onUpdateMeeting,
}: MeetingDetailModalProps) {
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [localMeeting, setLocalMeeting] = useState<MeetingDetail | null>(meeting);

  // Update local meeting when prop changes
  if (meeting && localMeeting?.id !== meeting.id) {
    setLocalMeeting(meeting);
    setIsEditingSummary(false);
  }

  if (!meeting || !localMeeting) return null;

  const handleSaveSummary = (data: {
    summary: string;
    clientContext: MeetingClientContext;
    highlights: MeetingHighlight[];
  }) => {
    // Update local state
    setLocalMeeting({
      ...localMeeting,
      summary: data.summary,
      clientContext: data.clientContext,
      highlights: data.highlights,
    });

    // Call parent update if provided
    if (onUpdateMeeting) {
      onUpdateMeeting(localMeeting.id, {
        summary: data.summary,
        clientContext: data.clientContext,
        highlights: data.highlights,
      });
    }

    // Exit edit mode
    setIsEditingSummary(false);
  };

  const handleCancelEdit = () => {
    setIsEditingSummary(false);
  };

  const handleClose = () => {
    setIsEditingSummary(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        hideCloseButton
        className={cn(
          "max-w-[1200px] w-[90vw] max-h-[90vh] p-0 overflow-hidden",
          "bg-[#121212] border-[#333333]"
        )}
      >
        <VisuallyHidden>
          <DialogTitle>{localMeeting.name}</DialogTitle>
          <DialogDescription>Detalhes da reunião {localMeeting.name}</DialogDescription>
        </VisuallyHidden>
        
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Modal Header */}
          <div className="px-8 py-6 border-b border-[#333333] flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#252730] border border-[#363842] rounded-[10px] flex items-center justify-center text-[#8c8c8c] flex-shrink-0">
                <FileText className="w-[22px] h-[22px]" />
              </div>
              <div>
                <h1 className="text-[1.375rem] font-semibold text-white mb-2.5">
                  {localMeeting.name}
                </h1>
                <div className="flex gap-2 flex-wrap">
                  <Badge className={cn(typeColors[localMeeting.type] || "bg-[#333333] text-[#a0a0a0]", "text-xs")}>
                    ● {localMeeting.type}
                  </Badge>
                  <Badge className={cn(statusColors[localMeeting.status], "text-xs flex items-center gap-1.5")}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {localMeeting.status}
                  </Badge>
                  <Badge className="bg-[#2d2640] text-[#a78bfa] text-xs">
                    Cliente: {localMeeting.clientName}
                  </Badge>
                  {isEditingSummary && (
                    <Badge className="bg-[#422c24] text-[#f59e0b] text-xs">
                      Modo Edição
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#8c8c8c] hover:bg-[#252730] hover:text-[#ededed] transition-all"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Meta Info Bar */}
          <div className="px-8 py-4 bg-[#171717] border-b border-[#333333] flex items-center gap-8 flex-wrap">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#8c8c8c]" />
              <div className="flex flex-col">
                <span className="text-[0.625rem] font-medium uppercase tracking-wider text-[#64666E]">
                  Data
                </span>
                <span className="text-sm font-medium text-[#ededed]">
                  {format(localMeeting.date, "dd MMM yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>

            <div className="w-px h-8 bg-[#333333]" />

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#8c8c8c]" />
              <div className="flex flex-col">
                <span className="text-[0.625rem] font-medium uppercase tracking-wider text-[#64666E]">
                  Horário
                </span>
                <span className="text-sm font-medium text-[#ededed]">
                  {localMeeting.startTime} - {localMeeting.endTime}
                </span>
              </div>
            </div>

            <div className="w-px h-8 bg-[#333333]" />

            <div className="flex items-center gap-2.5">
              <Video className="w-4 h-4 text-[#8c8c8c]" />
              <div className="flex flex-col">
                <span className="text-[0.625rem] font-medium uppercase tracking-wider text-[#64666E]">
                  Local
                </span>
                <span className="text-sm font-medium text-[#ededed]">
                  {localMeeting.location}
                </span>
              </div>
            </div>

            <div className="w-px h-8 bg-[#333333]" />

            <div className="flex items-center gap-2.5">
              <Timer className="w-4 h-4 text-[#8c8c8c]" />
              <div className="flex flex-col">
                <span className="text-[0.625rem] font-medium uppercase tracking-wider text-[#64666E]">
                  Duração
                </span>
                <span className="text-sm font-medium text-[#ededed]">
                  {localMeeting.duration}
                </span>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2.5">
              <span className="text-[0.625rem] font-medium uppercase tracking-wider text-[#64666E]">
                Responsável:
              </span>
              <div className="w-8 h-8 bg-[#2563eb] rounded-full flex items-center justify-center text-xs font-semibold text-white">
                {localMeeting.responsible.initials}
              </div>
              <span className="text-sm font-medium text-[#ededed]">
                {localMeeting.responsible.name}
              </span>
            </div>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <MeetingSummary 
              summary={localMeeting.summary}
              clientName={localMeeting.clientName}
              clientContext={localMeeting.clientContext}
              highlights={localMeeting.highlights}
              meetingDate={localMeeting.date}
              isEditing={isEditingSummary}
              onSave={handleSaveSummary}
              onCancelEdit={handleCancelEdit}
            />

            {!isEditingSummary && (
              <>
                <MeetingAgenda agenda={localMeeting.agenda} />

                <MeetingDecisions decisions={localMeeting.decisions} />

                <MeetingTasks tasks={localMeeting.linkedTasks} />

                <MeetingParticipants participants={localMeeting.participants} />

                <MeetingAttachments attachments={localMeeting.attachments} />
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-8 py-4 bg-[#171717] border-t border-[#333333] flex items-center justify-end gap-3">
            <button 
              onClick={handleClose}
              className="px-4 py-2.5 bg-[#252730] border border-[#363842] rounded-lg text-[#ededed] text-sm font-medium hover:bg-[#2a2d38] hover:border-[#4a4f5c] transition-all"
            >
              Fechar
            </button>
            {isEditingSummary ? (
              <button 
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#333333] rounded-lg text-[#ededed] text-sm font-medium hover:bg-[#444444] transition-all"
              >
                <Eye className="w-4 h-4" />
                Voltar para Visualização
              </button>
            ) : (
              <button 
                onClick={() => setIsEditingSummary(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7c3aed] rounded-lg text-white text-sm font-medium hover:bg-[#6d28d9] transition-all"
              >
                <Edit2 className="w-4 h-4" />
                Editar Reunião
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
