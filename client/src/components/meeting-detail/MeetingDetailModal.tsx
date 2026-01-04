import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  FileText, 
  X, 
  Calendar, 
  Clock, 
  Video, 
  Timer,
  Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MeetingTypeFilterContent, MeetingStatusFilterContent } from "@/components/filter-bar/MeetingFilterContent";
import { MeetingSummary } from "./MeetingSummary";
import { MeetingAgenda } from "./MeetingAgenda";
import { MeetingDecisions } from "./MeetingDecisions";
import { MeetingTasks } from "./MeetingTasks";
import { MeetingParticipants } from "./MeetingParticipants";
import { MeetingAttachments } from "./MeetingAttachments";
import { AIGenerateButton, type GenerateOption } from "./AIGenerateButton";
import { useAISummary, type AIResponse } from "@/hooks/useAISummary";
import type { MeetingDetail, MeetingClientContext, MeetingHighlight, MeetingAgendaItem, MeetingDecision } from "@/types/meeting";
import { 
  MEETING_TYPE_COLORS, 
  MEETING_STATUS_COLORS, 
  MEETING_FALLBACK_COLOR,
  MEETING_TYPE_OPTIONS,
  MEETING_STATUS_OPTIONS,
  MEETING_LOCATION_OPTIONS,
  type MeetingType,
  type MeetingStatus,
  type MeetingLocation
} from "@shared/config/meetingConfig";
import { DateInput } from "@/components/ui/date-input";

interface MeetingDetailModalProps {
  meeting: MeetingDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateMeeting?: (meetingId: string, updates: Partial<MeetingDetail>) => void;
}

// Usar constantes centralizadas
const typeColors = MEETING_TYPE_COLORS;
const statusColors = MEETING_STATUS_COLORS;

export function MeetingDetailModal({ 
  meeting, 
  open, 
  onOpenChange,
  onUpdateMeeting,
}: MeetingDetailModalProps) {
  const [localMeeting, setLocalMeeting] = useState<MeetingDetail | null>(meeting);
  const { isLoading: isAILoading, processWithAI } = useAISummary();

  // Estados para edição do título
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");

  // Estados para popovers de badges
  const [typePopoverOpen, setTypePopoverOpen] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);

  // Estados para popovers de metadados
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);

  // Update local meeting when prop changes (ID, type, or status)
  useEffect(() => {
    if (meeting) {
      if (!localMeeting || localMeeting.id !== meeting.id) {
        // Meeting changed completely
        setLocalMeeting(meeting);
      } else if (
        localMeeting.type !== meeting.type ||
        localMeeting.status !== meeting.status ||
        localMeeting.name !== meeting.name
      ) {
        // Update specific fields that might have changed from table
        setLocalMeeting(prev => prev ? { ...prev, ...meeting } : meeting);
      }
    }
  }, [meeting, localMeeting]);

  // Handle summary update
  const handleSummaryUpdate = useCallback((data: {
    summary: string;
    clientContext: MeetingClientContext;
    highlights: MeetingHighlight[];
  }) => {
    if (!localMeeting) return;
    
    const updated = {
      ...localMeeting,
      summary: data.summary,
      clientContext: data.clientContext,
      highlights: data.highlights,
    };
    setLocalMeeting(updated);
    
    if (onUpdateMeeting) {
      onUpdateMeeting(localMeeting.id, {
        summary: data.summary,
        clientContext: data.clientContext,
        highlights: data.highlights,
      });
    }
  }, [localMeeting, onUpdateMeeting]);

  // Handle agenda update
  const handleAgendaUpdate = useCallback((agenda: MeetingAgendaItem[]) => {
    if (!localMeeting) return;
    
    const updated = { ...localMeeting, agenda };
    setLocalMeeting(updated);
    
    if (onUpdateMeeting) {
      onUpdateMeeting(localMeeting.id, { agenda });
    }
  }, [localMeeting, onUpdateMeeting]);

  // Handle decisions update
  const handleDecisionsUpdate = useCallback((decisions: MeetingDecision[]) => {
    if (!localMeeting) return;
    
    const updated = { ...localMeeting, decisions };
    setLocalMeeting(updated);
    
    if (onUpdateMeeting) {
      onUpdateMeeting(localMeeting.id, { decisions });
    }
  }, [localMeeting, onUpdateMeeting]);

  // Handle AI generation
  const handleAIGenerate = useCallback(async (text: string, options: GenerateOption[]) => {
    if (!localMeeting) return;

    const result = await processWithAI(
      text,
      localMeeting.clientName,
      format(localMeeting.date, "yyyy-MM-dd"),
      options
    );

    if (result) {
      applyAIResult(result, options);
    }
  }, [localMeeting, processWithAI]);

  // Apply AI result to sections
  const applyAIResult = (result: AIResponse, options: GenerateOption[]) => {
    if (!localMeeting) return;

    // Apply to summary section via window method
    if (options.includes("summary") && result.summary) {
      const applySummary = (window as any).__applySummaryAIData;
      if (applySummary) {
        applySummary({
          summary: result.summary,
          clientContext: result.clientContext,
          highlights: result.highlights,
        });
      }
    }

    // Apply to agenda section via window method
    if (options.includes("agenda") && result.agenda) {
      const applyAgenda = (window as any).__applyAgendaAIData;
      if (applyAgenda) {
        const formattedAgenda = result.agenda.map((item, index) => ({
          id: crypto.randomUUID(),
          number: index + 1,
          title: item.title,
          status: item.status,
          subitems: item.subitems.map(sub => ({
            id: crypto.randomUUID(),
            title: sub.title,
            description: sub.description,
          })),
        }));
        applyAgenda(formattedAgenda);
      }
    }

    // Apply to decisions section via window method
    if (options.includes("decisions") && result.decisions) {
      const applyDecisions = (window as any).__applyDecisionsAIData;
      if (applyDecisions) {
        const formattedDecisions = result.decisions.map(d => ({
          id: crypto.randomUUID(),
          content: d.content,
          type: d.type,
        }));
        applyDecisions(formattedDecisions);
      }
    }
  };

  // Handler para salvar nome
  const handleSaveName = useCallback(() => {
    if (!localMeeting || !editingName.trim()) return;
    const updated = { ...localMeeting, name: editingName };
    setLocalMeeting(updated);
    onUpdateMeeting?.(localMeeting.id, { name: editingName });
    setIsEditingName(false);
  }, [localMeeting, editingName, onUpdateMeeting]);

  // Handler para mudar tipo
  const handleTypeChange = useCallback((type: MeetingType) => {
    if (!localMeeting) return;
    const updated = { ...localMeeting, type };
    setLocalMeeting(updated);
    onUpdateMeeting?.(localMeeting.id, { type });
    setTypePopoverOpen(false);
  }, [localMeeting, onUpdateMeeting]);

  // Handler para mudar status
  const handleStatusChange = useCallback((status: MeetingStatus) => {
    if (!localMeeting) return;
    const updated = { ...localMeeting, status };
    setLocalMeeting(updated);
    onUpdateMeeting?.(localMeeting.id, { status });
    setStatusPopoverOpen(false);
  }, [localMeeting, onUpdateMeeting]);

  // Handler para mudar data
  const handleDateChange = useCallback((date: Date | undefined) => {
    if (!localMeeting || !date) return;
    const updated = { ...localMeeting, date };
    setLocalMeeting(updated);
    onUpdateMeeting?.(localMeeting.id, { date });
    setDatePopoverOpen(false);
  }, [localMeeting, onUpdateMeeting]);

  // Handler para mudar local
  const handleLocationChange = useCallback((location: MeetingLocation) => {
    if (!localMeeting) return;
    const updated = { ...localMeeting, location };
    setLocalMeeting(updated);
    onUpdateMeeting?.(localMeeting.id, { location });
    setLocationPopoverOpen(false);
  }, [localMeeting, onUpdateMeeting]);

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!meeting || !localMeeting) return null;

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
                {isEditingName ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") setIsEditingName(false);
                    }}
                    autoFocus
                    className="text-[1.375rem] font-semibold text-white bg-transparent border-b border-[#2eaadc] focus:outline-none mb-2.5 w-full"
                  />
                ) : (
                  <div className="group/title flex items-center gap-2 mb-2.5">
                    <h1 className="text-[1.375rem] font-semibold text-white">
                      {localMeeting.name}
                    </h1>
                    <button 
                      onClick={() => { setIsEditingName(true); setEditingName(localMeeting.name); }}
                      className="opacity-0 group-hover/title:opacity-100 p-1 rounded hover:bg-[#3a3a3a] transition-opacity"
                    >
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {/* Badge Tipo - Clicável */}
                  <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
                    <PopoverTrigger asChild>
                      <button type="button">
                        <Badge className={cn(typeColors[localMeeting.type] || "bg-[#333333] text-[#a0a0a0]", "text-xs cursor-pointer hover:opacity-80 transition-opacity")}>
                          ● {localMeeting.type}
                        </Badge>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6}>
                      <MeetingTypeFilterContent
                        selectedValues={[localMeeting.type as MeetingType]}
                        onToggle={handleTypeChange}
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Badge Status - Clicável */}
                  <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button type="button">
                        <Badge className={cn(statusColors[localMeeting.status], "text-xs flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity")}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {localMeeting.status}
                        </Badge>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6}>
                      <MeetingStatusFilterContent
                        selectedValues={[localMeeting.status as MeetingStatus]}
                        onToggle={handleStatusChange}
                      />
                    </PopoverContent>
                  </Popover>

                  <Badge className="bg-[#2d2640] text-[#a78bfa] text-xs">
                    Cliente: {localMeeting.clientName}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AIGenerateButton
                onGenerate={handleAIGenerate}
                isLoading={isAILoading}
              />
              <button 
                onClick={handleClose}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#8c8c8c] hover:bg-[#252730] hover:text-[#ededed] transition-all"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>

          {/* Meta Info Bar */}
          <div className="px-8 py-4 bg-[#171717] border-b border-[#333333] flex items-center gap-8 flex-wrap">
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <button 
                  type="button"
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 -mx-2 -my-1.5 hover:bg-[#252525] transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#8c8c8c]" />
                  <div className="flex flex-col text-left">
                    <span className="text-[0.625rem] font-medium uppercase tracking-wider text-[#64666E]">
                      Data
                    </span>
                    <span className="text-sm font-medium text-[#ededed]">
                      {format(localMeeting.date, "dd MMM yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-0 bg-[#1a1a1a] border-[#2a2a2a]" 
                side="bottom" 
                align="start" 
                sideOffset={6}
              >
                <DateInput
                  value={localMeeting.date}
                  onChange={handleDateChange}
                  hideIcon
                  commitOnInput={false}
                />
              </PopoverContent>
            </Popover>

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

            <Popover open={locationPopoverOpen} onOpenChange={setLocationPopoverOpen}>
              <PopoverTrigger asChild>
                <button 
                  type="button"
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 -mx-2 -my-1.5 hover:bg-[#252525] transition-colors cursor-pointer"
                >
                  <Video className="w-4 h-4 text-[#8c8c8c]" />
                  <div className="flex flex-col text-left">
                    <span className="text-[0.625rem] font-medium uppercase tracking-wider text-[#64666E]">
                      Local
                    </span>
                    <span className="text-sm font-medium text-[#ededed]">
                      {localMeeting.location}
                    </span>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-48 p-1 bg-[#1a1a1a] border-[#2a2a2a]" 
                side="bottom" 
                align="start" 
                sideOffset={6}
              >
                <div className="flex flex-col">
                  {MEETING_LOCATION_OPTIONS.map((location) => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => handleLocationChange(location)}
                      className={cn(
                        "px-3 py-2 text-sm text-left rounded-md transition-colors",
                        "hover:bg-[#252525]",
                        localMeeting.location === location 
                          ? "text-[#2eaadc] bg-[#1c3847]" 
                          : "text-[#ededed]"
                      )}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

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
          <div className="flex-1 overflow-y-auto p-8">
            {localMeeting.status === "Realizada" ? (
              <div className="space-y-8">
                <MeetingSummary 
                  summary={localMeeting.summary}
                  clientName={localMeeting.clientName}
                  clientContext={localMeeting.clientContext}
                  highlights={localMeeting.highlights}
                  onUpdate={handleSummaryUpdate}
                />

                <MeetingAgenda 
                  agenda={localMeeting.agenda}
                  onUpdate={handleAgendaUpdate}
                />

                <MeetingDecisions 
                  decisions={localMeeting.decisions}
                  onUpdate={handleDecisionsUpdate}
                />

                <MeetingTasks tasks={localMeeting.linkedTasks} />

                <MeetingParticipants participants={localMeeting.participants} />

                <MeetingAttachments attachments={localMeeting.attachments} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <div className="text-[#8c8c8c] text-lg">
                  {localMeeting.status === "Agendada" 
                    ? "Esta reunião está agendada. O conteúdo estará disponível após sua realização."
                    : "Esta reunião foi cancelada."}
                </div>
              </div>
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
