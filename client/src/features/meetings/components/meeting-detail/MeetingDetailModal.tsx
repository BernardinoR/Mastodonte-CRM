import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Calendar, Clock, Video, Pencil } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import {
  MeetingTypeFilterContent,
  MeetingStatusFilterContent,
  MeetingLocationFilterContent,
} from "@shared/components/filter-bar/MeetingFilterContent";
import { SingleAssigneeSelector } from "@features/tasks/components/task-editors/AssigneeSelector";
import { useUsers } from "@features/users";
import { useClients } from "@features/clients";
import { MeetingSummary } from "./MeetingSummary";
import { MeetingAgenda } from "./MeetingAgenda";
import { MeetingDecisions } from "./MeetingDecisions";
import { MeetingTasks } from "./MeetingTasks";
import { MeetingAttachments } from "./MeetingAttachments";
import { AIGenerateButton, type GenerateOption } from "./AIGenerateButton";
import { useAISummary, type AIResponse } from "@features/meetings/hooks/useAISummary";
import { MEETING_STATUS_BADGE_COLORS } from "@features/tasks/lib/statusConfig";
import type {
  MeetingDetail,
  MeetingClientContext,
  MeetingHighlight,
  MeetingAgendaItem,
  MeetingDecision,
} from "@features/meetings/types/meeting";
import {
  type MeetingType,
  type MeetingStatus,
  type MeetingLocation,
} from "@shared/config/meetingConfig";
import { DateInput } from "@/shared/components/ui/date-input";

interface MeetingDetailModalProps {
  meeting: MeetingDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateMeeting?: (meetingId: string, updates: Partial<MeetingDetail>) => void;
}

export function MeetingDetailModal({
  meeting,
  open,
  onOpenChange,
  onUpdateMeeting,
}: MeetingDetailModalProps) {
  const [localMeeting, setLocalMeeting] = useState<MeetingDetail | null>(meeting);
  const { isLoading: isAILoading, processWithAI } = useAISummary();
  const { getUserByName } = useUsers();
  const { getClientByName } = useClients();

  // Estados para edicao do titulo
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");

  // Estados para popovers de badges
  const [typePopoverOpen, setTypePopoverOpen] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);

  // Estados para popovers de metadados
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);

  // Estados para edicao inline do horario
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editingTimeValue, setEditingTimeValue] = useState("");

  // Estado para popover de responsavel
  const [responsiblePopoverOpen, setResponsiblePopoverOpen] = useState(false);

  // Update local meeting when prop changes (ID, type, or status)
  useEffect(() => {
    if (meeting) {
      if (!localMeeting || localMeeting.id !== meeting.id) {
        setLocalMeeting(meeting);
      } else if (
        localMeeting.type !== meeting.type ||
        localMeeting.status !== meeting.status ||
        localMeeting.name !== meeting.name
      ) {
        setLocalMeeting((prev) => (prev ? { ...prev, ...meeting } : meeting));
      }
    }
  }, [meeting, localMeeting]);

  // Handle summary update
  const handleSummaryUpdate = useCallback(
    (data: {
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
    },
    [localMeeting, onUpdateMeeting],
  );

  // Handle agenda update
  const handleAgendaUpdate = useCallback(
    (agenda: MeetingAgendaItem[]) => {
      if (!localMeeting) return;

      const updated = { ...localMeeting, agenda };
      setLocalMeeting(updated);

      if (onUpdateMeeting) {
        onUpdateMeeting(localMeeting.id, { agenda });
      }
    },
    [localMeeting, onUpdateMeeting],
  );

  // Handle decisions update
  const handleDecisionsUpdate = useCallback(
    (decisions: MeetingDecision[]) => {
      if (!localMeeting) return;

      const updated = { ...localMeeting, decisions };
      setLocalMeeting(updated);

      if (onUpdateMeeting) {
        onUpdateMeeting(localMeeting.id, { decisions });
      }
    },
    [localMeeting, onUpdateMeeting],
  );

  // Handle AI generation
  const handleAIGenerate = useCallback(
    async (text: string, options: GenerateOption[]) => {
      if (!localMeeting) return;

      const result = await processWithAI(
        text,
        localMeeting.clientName,
        format(localMeeting.date, "yyyy-MM-dd"),
        options,
      );

      if (result) {
        applyAIResult(result, options);
      }
    },
    [localMeeting, processWithAI],
  );

  // Apply AI result to sections
  const applyAIResult = (result: AIResponse, options: GenerateOption[]) => {
    if (!localMeeting) return;

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

    if (options.includes("agenda") && result.agenda) {
      const applyAgenda = (window as any).__applyAgendaAIData;
      if (applyAgenda) {
        const formattedAgenda = result.agenda.map((item, index) => ({
          id: crypto.randomUUID(),
          number: index + 1,
          title: item.title,
          status: item.status,
          subitems: item.subitems.map((sub) => ({
            id: crypto.randomUUID(),
            title: sub.title,
            description: sub.description,
          })),
        }));
        applyAgenda(formattedAgenda);
      }
    }

    if (options.includes("decisions") && result.decisions) {
      const applyDecisions = (window as any).__applyDecisionsAIData;
      if (applyDecisions) {
        const formattedDecisions = result.decisions.map((d) => ({
          id: crypto.randomUUID(),
          title: d.title,
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
  const handleTypeChange = useCallback(
    (type: MeetingType) => {
      if (!localMeeting) return;
      const updated = { ...localMeeting, type };
      setLocalMeeting(updated);
      onUpdateMeeting?.(localMeeting.id, { type });
      setTypePopoverOpen(false);
    },
    [localMeeting, onUpdateMeeting],
  );

  // Handler para mudar status
  const handleStatusChange = useCallback(
    (status: MeetingStatus) => {
      if (!localMeeting) return;
      const updated = { ...localMeeting, status };
      setLocalMeeting(updated);
      onUpdateMeeting?.(localMeeting.id, { status });
      setStatusPopoverOpen(false);
    },
    [localMeeting, onUpdateMeeting],
  );

  // Handler para mudar data
  const handleDateChange = useCallback(
    (date: Date | undefined) => {
      if (!localMeeting || !date) return;
      const updated = { ...localMeeting, date };
      setLocalMeeting(updated);
      onUpdateMeeting?.(localMeeting.id, { date });
      setDatePopoverOpen(false);
    },
    [localMeeting, onUpdateMeeting],
  );

  // Handler para mudar local
  const handleLocationChange = useCallback(
    (location: MeetingLocation) => {
      if (!localMeeting) return;
      const updated = { ...localMeeting, location };
      setLocalMeeting(updated);
      onUpdateMeeting?.(localMeeting.id, { location });
      setLocationPopoverOpen(false);
    },
    [localMeeting, onUpdateMeeting],
  );

  // Handler para iniciar edicao do horario
  const handleStartEditTime = useCallback(() => {
    if (!localMeeting) return;
    setEditingTimeValue(`${localMeeting.startTime} - ${localMeeting.endTime}`);
    setIsEditingTime(true);
  }, [localMeeting]);

  // Handler para mascara do horario (HH:MM - HH:MM)
  const handleTimeInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    let formatted = "";

    for (let i = 0; i < value.length && i < 8; i++) {
      if (i === 2 || i === 6) formatted += ":";
      if (i === 4) formatted += " - ";
      formatted += value[i];
    }

    setEditingTimeValue(formatted);
  }, []);

  // Handler para salvar horario
  const handleSaveTime = useCallback(() => {
    if (!localMeeting) return;

    const match = editingTimeValue.match(/^(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})$/);
    if (match) {
      const startTime = `${match[1]}:${match[2]}`;
      const endTime = `${match[3]}:${match[4]}`;

      const updated = { ...localMeeting, startTime, endTime };
      setLocalMeeting(updated);
      onUpdateMeeting?.(localMeeting.id, { startTime, endTime });
    }

    setIsEditingTime(false);
  }, [localMeeting, editingTimeValue, onUpdateMeeting]);

  // Handler para mudar responsavel
  const handleResponsibleChange = useCallback(
    (name: string) => {
      if (!localMeeting) return;
      const user = getUserByName(name);
      const responsible = {
        name,
        initials:
          user?.initials ||
          name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
      };

      const currentAssignees = localMeeting.assignees || [];
      const assignees = [name, ...currentAssignees.slice(1)];

      const updated = { ...localMeeting, responsible, assignees };
      setLocalMeeting(updated);
      onUpdateMeeting?.(localMeeting.id, { responsible, assignees });
      setResponsiblePopoverOpen(false);
    },
    [localMeeting, onUpdateMeeting, getUserByName],
  );

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!meeting || !localMeeting) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        hideCloseButton
        className={cn(
          "max-h-[90vh] w-[90vw] max-w-[1200px] overflow-hidden p-0",
          "border-[#262626] bg-[#111]",
        )}
      >
        <VisuallyHidden>
          <DialogTitle>{localMeeting.name}</DialogTitle>
          <DialogDescription>Detalhes da reuniao {localMeeting.name}</DialogDescription>
        </VisuallyHidden>

        <div className="flex h-full max-h-[90vh] flex-col">
          {/* Modal Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#262626] bg-[#0f1115] p-6 pb-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded border border-[#333] bg-[#262626] text-gray-500">
                <FileText className="h-5 w-5" />
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
                    className="mb-2.5 w-full border-b border-[#2eaadc] bg-transparent text-xl font-bold tracking-tight text-white focus:outline-none"
                  />
                ) : (
                  <div className="group/title mb-2.5 flex items-center gap-2">
                    <h1 className="text-xl font-bold leading-none tracking-tight text-white">
                      {localMeeting.name}
                    </h1>
                    <button
                      onClick={() => {
                        setIsEditingName(true);
                        setEditingName(localMeeting.name);
                      }}
                      className="rounded p-1 opacity-0 transition-opacity hover:bg-[#333] group-hover/title:opacity-100"
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {/* Badge Tipo - Clicavel */}
                  <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
                    <PopoverTrigger asChild>
                      <button type="button">
                        <span className="inline-flex cursor-pointer items-center rounded border border-[#333] bg-[#262626] px-2.5 py-1 text-xs text-gray-400 transition-opacity hover:opacity-80">
                          {localMeeting.type}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6}>
                      <MeetingTypeFilterContent
                        selectedValues={[localMeeting.type as MeetingType]}
                        onToggle={handleTypeChange}
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Badge Status - Clicavel */}
                  <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                    <PopoverTrigger asChild>
                      <div className="inline-block cursor-pointer">
                        <Badge
                          className={`${MEETING_STATUS_BADGE_COLORS[localMeeting.status] || MEETING_STATUS_BADGE_COLORS["Agendada"]} cursor-pointer text-xs transition-opacity hover:opacity-80`}
                        >
                          {localMeeting.status}
                        </Badge>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6}>
                      <MeetingStatusFilterContent
                        selectedValues={[localMeeting.status as MeetingStatus]}
                        onToggle={handleStatusChange}
                      />
                    </PopoverContent>
                  </Popover>

                  <span className="inline-flex items-center rounded border border-[#333] bg-[#262626] px-2.5 py-1 text-xs text-purple-400">
                    Cliente: {localMeeting.clientName}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AIGenerateButton onGenerate={handleAIGenerate} isLoading={isAILoading} />
            </div>
          </div>

          {/* Meta Info Bar */}
          <div className="flex items-center justify-between border-b border-[#262626] bg-[#111] px-6 py-4">
            <div className="grid w-full max-w-2xl grid-cols-3 gap-12">
              {/* Data */}
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-4 rounded-lg border-r border-[#262626] pr-8 transition-colors hover:bg-[#1a1a1a]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#262626] bg-[#1c1c1c]">
                      <Calendar className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Data
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {format(localMeeting.date, "dd MMM yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto border-[#262626] bg-[#1a1a1a] p-0"
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

              {/* Horario */}
              <div
                className="flex cursor-pointer items-center gap-4 rounded-lg border-r border-[#262626] pr-8 transition-colors hover:bg-[#1a1a1a]"
                onClick={!isEditingTime ? handleStartEditTime : undefined}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#262626] bg-[#1c1c1c]">
                  <Clock className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Horario
                  </span>
                  {isEditingTime ? (
                    <input
                      type="text"
                      value={editingTimeValue}
                      onChange={handleTimeInputChange}
                      onBlur={handleSaveTime}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTime();
                        if (e.key === "Escape") setIsEditingTime(false);
                      }}
                      autoFocus
                      placeholder="00:00 - 00:00"
                      className="w-[110px] border-b border-[#2eaadc] bg-transparent text-xs font-semibold text-white focus:outline-none"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-white">
                      {localMeeting.startTime} - {localMeeting.endTime}
                    </span>
                  )}
                </div>
              </div>

              {/* Local */}
              <Popover open={locationPopoverOpen} onOpenChange={setLocationPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-4 rounded-lg transition-colors hover:bg-[#1a1a1a]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#262626] bg-[#1c1c1c]">
                      <Video className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Local
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {localMeeting.location}
                      </span>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6}>
                  <MeetingLocationFilterContent
                    selectedValues={[localMeeting.location as MeetingLocation]}
                    onToggle={handleLocationChange}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Responsavel */}
            <div className="ml-auto flex items-center border-l border-[#262626] pl-8">
              <Popover open={responsiblePopoverOpen} onOpenChange={setResponsiblePopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-2 rounded border border-[#333] bg-[#262626] py-1 pl-1 pr-3 transition-colors hover:bg-[#333]"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-[#383838] text-[10px] font-bold text-white">
                      {localMeeting.responsible.initials}
                    </div>
                    <span className="text-xs font-bold text-white">
                      {localMeeting.responsible.name}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-64 border-[#262626] bg-[#1a1a1a] p-0"
                  side="bottom"
                  align="end"
                  sideOffset={6}
                >
                  <SingleAssigneeSelector
                    selectedAssignee={localMeeting.responsible.name}
                    onSelect={handleResponsibleChange}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="flex-1 overflow-y-auto bg-[#111] p-6">
            {localMeeting.status === "Realizada" ? (
              <div className="space-y-6">
                <MeetingSummary
                  summary={localMeeting.summary}
                  clientName={localMeeting.clientName}
                  clientContext={localMeeting.clientContext}
                  highlights={localMeeting.highlights}
                  onUpdate={handleSummaryUpdate}
                />

                <MeetingAgenda agenda={localMeeting.agenda} onUpdate={handleAgendaUpdate} />

                <MeetingDecisions
                  decisions={localMeeting.decisions}
                  onUpdate={handleDecisionsUpdate}
                />

                <MeetingTasks
                  meetingId={Number(localMeeting.id)}
                  clientId={getClientByName(localMeeting.clientName)?.id || ""}
                  clientName={localMeeting.clientName}
                />

                <MeetingAttachments meetingId={Number(localMeeting.id)} />
              </div>
            ) : (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                <div className="text-lg text-gray-500">
                  {localMeeting.status === "Agendada"
                    ? "Esta reuniao esta agendada. O conteudo estara disponivel apos sua realizacao."
                    : "Esta reuniao foi cancelada."}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-[#262626] bg-[#0f1115] p-4">
            <button
              onClick={handleClose}
              className="rounded border border-[#333] bg-[#262626] px-5 py-1.5 text-xs font-medium text-gray-300 transition-all hover:bg-[#333]"
            >
              Fechar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
