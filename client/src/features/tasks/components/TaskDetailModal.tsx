import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Calendar as CalendarIcon, Pencil, Plus } from "lucide-react";
import { TaskContactButtons, TaskDescription, TaskHistory, TaskMeetingLink } from "./task-detail";
import { format, isBefore, startOfDay, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateInput } from "@/shared/components/ui/date-input";
import {
  PriorityBadge,
  StatusBadge,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "@/shared/components/ui/task-badges";
import { TaskClientPopover } from "./task-popovers";
import { AssigneeSelector } from "./task-editors";
import type { Task, TaskHistoryEvent, TaskStatus, TaskPriority, TaskType } from "../types/task";
import { TASK_TYPE_OPTIONS } from "../types/task";
import {
  UI_CLASSES,
  UI_COLORS,
  MODAL_STATUS_BADGE_STYLES,
  MODAL_PRIORITY_BADGE_STYLES,
  getTaskTypeConfig,
} from "../lib/statusConfig";
import { cn } from "@/shared/lib/utils";
import { useClients } from "@features/clients";
import { useTasks } from "../contexts/TasksContext";
import { getInitials, getAvatarColor } from "@/shared/components/ui/task-assignees";
import { useUsers } from "@features/users";
import { parseLocalDate } from "@/shared/lib/date-utils";

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  isTurboModeActive?: boolean;
  turboActionPerformed?: boolean;
}

function isTaskOverdue(dueDate: string | Date): boolean {
  const today = startOfDay(new Date());
  const dueDateObj = typeof dueDate === "string" ? parseLocalDate(dueDate) : dueDate;
  return isBefore(startOfDay(dueDateObj), today);
}

function getDaysSinceLastUpdate(history?: TaskHistoryEvent[]): string {
  if (!history || history.length === 0) {
    return "Sem atualizações";
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const lastUpdate = new Date(sortedHistory[0].timestamp);
  const today = startOfDay(new Date());
  const days = differenceInDays(today, startOfDay(lastUpdate));

  if (days === 0) {
    return "Atualizado hoje";
  } else if (days === 1) {
    return "1 dia desde a última atualização";
  } else {
    return `${days} dias desde a última atualização`;
  }
}

export function TaskDetailModal({
  task,
  open,
  onOpenChange,
  onUpdateTask,
  isTurboModeActive = false,
  turboActionPerformed = false,
}: TaskDetailModalProps) {
  const [, navigate] = useLocation();
  const { getFullClientData } = useClients();
  const { addTaskHistory, deleteTaskHistory } = useTasks();
  const { getUserByName } = useUsers();
  const [description, setDescription] = useState(task?.description || "");
  const [newComment, setNewComment] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task?.title || "");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [priorityPopoverOpen, setPriorityPopoverOpen] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
  const [assigneesPopoverOpen, setAssigneesPopoverOpen] = useState(false);
  const [typePopoverOpen, setTypePopoverOpen] = useState(false);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [noteType, setNoteType] = useState<"note" | "email" | "call" | "whatsapp">("note");

  const titleInputRef = useRef<HTMLInputElement>(null);
  const datePopoverRef = useRef<HTMLDivElement>(null);
  const prevTaskRef = useRef<{ id: string; title: string; description: string } | null>(null);

  const linkedClientData = useMemo(() => {
    if (task?.clientId) {
      return getFullClientData(task.clientId);
    }
    return null;
  }, [task?.clientId, getFullClientData]);

  const linkedClient = linkedClientData?.client;
  const whatsappGroups = linkedClientData?.whatsappGroups || [];
  const clientMeetings = linkedClientData?.meetings || [];

  useEffect(() => {
    if (task) {
      const newDesc = task.description || "";
      const newTitle = task.title || "";

      if (
        !prevTaskRef.current ||
        prevTaskRef.current.id !== task.id ||
        prevTaskRef.current.title !== newTitle ||
        prevTaskRef.current.description !== newDesc
      ) {
        prevTaskRef.current = { id: task.id, title: newTitle, description: newDesc };
        setDescription(newDesc);
        setTitleValue(newTitle);
      }
    }
  }, [task]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  const handleTitleSave = useCallback(() => {
    if (!task) return;
    if (titleValue.trim() && titleValue !== task.title) {
      onUpdateTask(task.id, { title: titleValue.trim() });
    } else {
      setTitleValue(task.title);
    }
    setEditingTitle(false);
  }, [titleValue, task, onUpdateTask]);

  const handleClientSelect = useCallback(
    (clientId: string, clientName: string) => {
      if (!task) return;
      if (clientId === "_none") {
        onUpdateTask(task.id, { clientId: undefined, clientName: undefined });
      } else {
        onUpdateTask(task.id, { clientId, clientName });
      }
      setClientPopoverOpen(false);
    },
    [task, onUpdateTask],
  );

  const handleClientClick = useCallback(() => {
    if (task?.clientId) {
      onOpenChange(false);
      navigate(`/clients/${task.clientId}`);
    } else if (task?.clientName) {
      onOpenChange(false);
      navigate(`/clients/${encodeURIComponent(task.clientName)}`);
    }
  }, [task, navigate, onOpenChange]);

  const handleDateChange = useCallback(
    (date: Date | undefined) => {
      if (!task) return;
      if (date) {
        onUpdateTask(task.id, { dueDate: date });
        setDatePopoverOpen(false);
      }
    },
    [task, onUpdateTask],
  );

  const handlePriorityChange = useCallback(
    (priority: TaskPriority | "_none") => {
      if (!task) return;
      setPriorityPopoverOpen(false);
      setTimeout(() => {
        onUpdateTask(task.id, { priority: priority === "_none" ? undefined : priority });
      }, 50);
    },
    [task, onUpdateTask],
  );

  const handleStatusChange = useCallback(
    (status: TaskStatus) => {
      if (!task) return;
      if (status === task.status) {
        setStatusPopoverOpen(false);
        return;
      }

      onUpdateTask(task.id, { status });
      addTaskHistory(
        task.id,
        "status_change",
        `Status alterado de '${task.status}' para '${status}'`,
      );
      setStatusPopoverOpen(false);
    },
    [task, onUpdateTask, addTaskHistory],
  );

  const handleTypeChange = useCallback(
    (type: TaskType) => {
      if (!task) return;
      onUpdateTask(task.id, { taskType: type });
      setTypePopoverOpen(false);
    },
    [task, onUpdateTask],
  );

  const handleAddAssignee = useCallback(
    (assignee: string) => {
      if (!task) return;
      if (!task.assignees.includes(assignee)) {
        onUpdateTask(task.id, { assignees: [...task.assignees, assignee] });
      }
    },
    [task, onUpdateTask],
  );

  const handleRemoveAssignee = useCallback(
    (assignee: string) => {
      if (!task) return;
      onUpdateTask(task.id, { assignees: task.assignees.filter((a) => a !== assignee) });
    },
    [task, onUpdateTask],
  );

  const handleLinkMeeting = useCallback(
    (meetingId: number) => {
      if (!task) return;
      const found = clientMeetings.find((m) => String(meetingId) === m.id);
      onUpdateTask(task.id, {
        meetingId,
        meeting: found
          ? {
              id: meetingId,
              title: found.name,
              date: found.date,
              type: found.type,
            }
          : undefined,
      });
    },
    [task, onUpdateTask, clientMeetings],
  );

  const handleUnlinkMeeting = useCallback(() => {
    if (!task) return;
    onUpdateTask(task.id, { meetingId: null, meeting: undefined });
  }, [task, onUpdateTask]);

  if (!task) return null;

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      onUpdateTask(task.id, { description });
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !task) return;

    const eventTypeMap = {
      note: "comment",
      email: "email",
      call: "call",
      whatsapp: "whatsapp",
    } as const;

    addTaskHistory(task.id, eventTypeMap[noteType], newComment.trim());
    setNewComment("");
    setNoteType("note");
  };

  const handleSetNoteType = (type: "note" | "email" | "call" | "whatsapp") => {
    setNoteType(type);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!task) return;
    deleteTaskHistory(task.id, eventId);
  };

  const taskTypeConfig = getTaskTypeConfig(task.taskType || "Tarefa");
  const statusBadgeStyle = MODAL_STATUS_BADGE_STYLES[task.status];
  const priorityBadgeStyle = task.priority ? MODAL_PRIORITY_BADGE_STYLES[task.priority] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        onEscapeKeyDown={(e) => e.stopPropagation()}
        onPointerDownOutside={(e) => e.stopPropagation()}
        className={cn(
          "h-[85vh] w-[90vw] max-w-[1200px] overflow-hidden rounded-xl p-0",
          UI_CLASSES.modalContainer,
          "border-l-[6px]",
          isTurboModeActive && turboActionPerformed && "turbo-border-green-pulse",
        )}
        style={{
          borderLeftColor:
            isTurboModeActive && turboActionPerformed
              ? UI_COLORS.taskBorderDone
              : isTaskOverdue(task.dueDate)
                ? UI_COLORS.taskBorderRed
                : UI_COLORS.taskBorderBlue,
        }}
      >
        <VisuallyHidden>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>Detalhes da tarefa {task.title}</DialogDescription>
        </VisuallyHidden>

        <div className="flex h-full min-h-0">
          {/* Left Panel */}
          <div className="flex min-h-0 flex-[1.5] flex-col overflow-y-auto px-8 pb-4 pl-10 pt-8">
            {/* 1. Task Type Badge + Updated timestamp */}
            <div className="mb-4 flex items-center justify-between">
              <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
                <PopoverTrigger asChild>
                  <span
                    className={cn(
                      "inline-flex cursor-pointer items-center rounded-md px-2.5 py-1 text-xs font-semibold transition-colors hover:opacity-80",
                      taskTypeConfig.className,
                    )}
                    data-testid="button-modal-type"
                  >
                    {taskTypeConfig.label}
                  </span>
                </PopoverTrigger>
                <PopoverContent
                  className={cn("w-48 p-0", UI_CLASSES.popover)}
                  side="bottom"
                  align="start"
                  sideOffset={6}
                >
                  <div className="w-full">
                    <div className="px-3 py-1.5 text-xs text-gray-500">Tipo de tarefa</div>
                    <div className="pb-1">
                      {TASK_TYPE_OPTIONS.map((t) => {
                        const cfg = getTaskTypeConfig(t);
                        return (
                          <div
                            key={t}
                            className={cn(
                              UI_CLASSES.dropdownItem,
                              t === (task.taskType || "Tarefa") && "bg-[#333333]",
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTypeChange(t);
                            }}
                          >
                            <span
                              className={cn(
                                "rounded-md px-2 py-0.5 text-xs font-semibold",
                                cfg.className,
                              )}
                            >
                              {cfg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <span className={cn(UI_CLASSES.clientBadge, "shrink-0 whitespace-nowrap")}>
                {getDaysSinceLastUpdate(task.history)}
              </span>
            </div>

            {/* 2. Title */}
            <div className="group/title mb-4">
              {editingTitle ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleTitleSave();
                    }
                    if (e.key === "Escape") {
                      setTitleValue(task.title);
                      setEditingTitle(false);
                    }
                  }}
                  autoFocus
                  placeholder="Nome da tarefa..."
                  className="w-full border-b border-[#2eaadc] bg-transparent text-3xl font-bold tracking-tight text-white placeholder:text-gray-500 focus:outline-none"
                  data-testid="input-modal-title"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <h2
                    className="min-w-0 text-3xl font-bold tracking-tight text-white"
                    data-testid="text-modal-title"
                  >
                    {task.title || "Sem título"}
                  </h2>
                  <button
                    onClick={() => setEditingTitle(true)}
                    className="shrink-0 rounded p-1.5 opacity-0 transition-all hover:bg-[#333333] group-hover/title:opacity-100"
                    data-testid="button-edit-modal-title"
                  >
                    <Pencil className="h-4 w-4 text-gray-400 hover:text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* 3. Date + Client inline */}
            <div className="mb-5 flex items-center gap-6">
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <div
                    className="flex cursor-pointer items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
                    data-testid="button-modal-date"
                  >
                    <CalendarIcon className="h-[18px] w-[18px]" />
                    <span>{format(task.dueDate, "dd MMM yyyy", { locale: ptBR })}</span>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  ref={datePopoverRef}
                  className={cn("w-auto p-0", UI_CLASSES.popover)}
                  side="bottom"
                  align="start"
                  sideOffset={6}
                >
                  <DateInput
                    value={task.dueDate}
                    onChange={handleDateChange}
                    className="font-semibold"
                    dataTestId="input-modal-date"
                    hideIcon
                    commitOnInput={false}
                  />
                </PopoverContent>
              </Popover>

              <TaskClientPopover
                id={task.id}
                clientName={task.clientName || null}
                isOpen={clientPopoverOpen}
                onOpenChange={setClientPopoverOpen}
                onClientChange={handleClientSelect}
                onNavigate={handleClientClick}
                variant="modal"
              />
            </div>

            {/* 4. Status + Priority badges (semi-transparent) */}
            <div className="mb-5 flex flex-wrap gap-3">
              <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                <PopoverTrigger asChild>
                  <div
                    className={cn(
                      "flex h-7 shrink-0 cursor-pointer items-center justify-center rounded border px-3 text-xs font-semibold uppercase tracking-wide transition-colors",
                      statusBadgeStyle.bg,
                      statusBadgeStyle.border,
                      statusBadgeStyle.text,
                    )}
                    data-testid="button-modal-status"
                  >
                    {task.status}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6}>
                  <div className="w-full">
                    <div className={cn("border-b", UI_CLASSES.border)}>
                      <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                      <div className="px-3 py-1">
                        <div
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1.5",
                            UI_CLASSES.selectedItem,
                          )}
                        >
                          <StatusBadge status={task.status} />
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
                    <div className="pb-1">
                      {STATUS_OPTIONS.filter((s) => s !== task.status).map((s) => (
                        <div
                          key={s}
                          className={UI_CLASSES.dropdownItem}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(s);
                          }}
                        >
                          <StatusBadge status={s} />
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover open={priorityPopoverOpen} onOpenChange={setPriorityPopoverOpen}>
                <PopoverTrigger asChild>
                  {priorityBadgeStyle ? (
                    <div
                      className={cn(
                        "flex h-7 shrink-0 cursor-pointer items-center justify-center rounded border px-3 text-xs font-semibold uppercase tracking-wide transition-colors",
                        priorityBadgeStyle.bg,
                        priorityBadgeStyle.border,
                        priorityBadgeStyle.text,
                      )}
                      data-testid="button-modal-priority"
                    >
                      {task.priority}
                    </div>
                  ) : (
                    <span
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-[#333333] px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-gray-500 hover:text-gray-300"
                      data-testid="button-modal-priority"
                    >
                      + Prioridade
                    </span>
                  )}
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6}>
                  <div className="w-full">
                    {task.priority && (
                      <div className={cn("border-b", UI_CLASSES.border)}>
                        <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                        <div className="px-3 py-1">
                          <div
                            className={UI_CLASSES.dropdownItemSelected}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePriorityChange("_none");
                            }}
                          >
                            <PriorityBadge priority={task.priority} />
                            <span className="ml-auto text-xs text-gray-500">
                              Clique para remover
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="px-3 py-1.5 text-xs text-gray-500">
                      {task.priority ? "Outras opções" : "Selecionar prioridade"}
                    </div>
                    <div className="pb-1">
                      {PRIORITY_OPTIONS.filter((p) => p !== task.priority).map((p) => (
                        <div
                          key={p}
                          className={UI_CLASSES.dropdownItem}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePriorityChange(p);
                          }}
                        >
                          <PriorityBadge priority={p} />
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* 5. Quick Actions */}
            <TaskContactButtons
              clientEmail={
                linkedClient?.emails?.[linkedClient.primaryEmailIndex] ||
                linkedClient?.emails?.[0] ||
                task.clientEmail
              }
              clientPhone={linkedClient?.phone || task.clientPhone}
              clientName={linkedClient?.name || task.clientName}
              clientId={task.clientId}
              whatsappGroups={whatsappGroups}
            />

            {/* 6. Description */}
            <TaskDescription
              description={description}
              onChange={setDescription}
              onSave={handleDescriptionBlur}
            />

            {/* 7. Reunião de Origem + 8. Responsáveis — alinhados ao fundo */}
            <div className="mt-auto">
              <div className="mb-4">
                <TaskMeetingLink
                  meeting={task.meeting}
                  clientMeetings={clientMeetings}
                  onNavigate={(meetingId) => {
                    onOpenChange(false);
                    navigate(`/clients/${task.clientId}?meetingId=${meetingId}`);
                  }}
                  onLink={handleLinkMeeting}
                  onUnlink={handleUnlinkMeeting}
                />
              </div>

              {/* 8. Responsáveis */}
              <div className={cn("border-t pb-4 pt-4", "border-[#333333]")}>
                <label className={UI_CLASSES.sectionLabel}>Responsáveis</label>
                <div className="flex flex-wrap items-center gap-2">
                  {task.assignees.map((assignee, idx) => {
                    const user = getUserByName(assignee);
                    const avatarColor = user?.avatarColor || getAvatarColor(idx);
                    return (
                      <div
                        key={idx}
                        className={UI_CLASSES.assigneeChip}
                        onClick={() => handleRemoveAssignee(assignee)}
                      >
                        <Avatar className={cn("h-6 w-6 rounded after:rounded", avatarColor)}>
                          <AvatarFallback className="rounded bg-transparent text-[10px] font-bold text-white">
                            {user?.initials || getInitials(assignee)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold tracking-wide text-white">
                          {assignee}
                        </span>
                      </div>
                    );
                  })}
                  <Popover open={assigneesPopoverOpen} onOpenChange={setAssigneesPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        className={UI_CLASSES.assigneeAddBtn}
                        data-testid={`button-edit-assignees-${task.id}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" side="top" align="start" sideOffset={6}>
                      <AssigneeSelector
                        selectedAssignees={task.assignees}
                        onSelect={handleAddAssignee}
                        onRemove={handleRemoveAssignee}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - History */}
          <TaskHistory
            history={task.history || []}
            newComment={newComment}
            noteType={noteType}
            hoveredEventId={hoveredEventId}
            onNewCommentChange={setNewComment}
            onNoteTypeChange={handleSetNoteType}
            onAddComment={handleAddComment}
            onDeleteEvent={handleDeleteEvent}
            onEventHover={setHoveredEventId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
