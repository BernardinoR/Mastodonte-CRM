import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { TaskContactButtons, TaskDescription, TaskHistory } from "@/components/task-detail";
import { format, isBefore, startOfDay, differenceInDays } from "date-fns";
import { parseLocalDate } from "@/lib/date-utils";
import { DateInput } from "@/components/ui/date-input";
import { PriorityBadge, StatusBadge, PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/components/ui/task-badges";
import { TaskClientPopover, TaskAssigneesPopover } from "@/components/task-popovers";
import type { Task, TaskHistoryEvent, TaskStatus, TaskPriority } from "@/types/task";
import { STATUS_CONFIG, PRIORITY_CONFIG, UI_CLASSES, UI_COLORS } from "@/lib/statusConfig";
import { cn } from "@/lib/utils";

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
  const dueDateObj = typeof dueDate === 'string' ? parseLocalDate(dueDate) : dueDate;
  return isBefore(startOfDay(dueDateObj), today);
}

function getDaysSinceLastUpdate(history?: TaskHistoryEvent[]): string {
  if (!history || history.length === 0) {
    return "Sem atualizações";
  }
  
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
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
  const [description, setDescription] = useState(task?.description || "");
  const [newComment, setNewComment] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task?.title || "");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [priorityPopoverOpen, setPriorityPopoverOpen] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
  const [assigneesPopoverOpen, setAssigneesPopoverOpen] = useState(false);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [noteType, setNoteType] = useState<"note" | "email" | "call" | "whatsapp">("note");
  
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const datePopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
      setTitleValue(task.title || "");
    }
  }, [task]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
      titleInputRef.current.style.height = 'auto';
      titleInputRef.current.style.height = titleInputRef.current.scrollHeight + 'px';
    }
  }, [editingTitle]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitleValue(e.target.value);
    if (titleInputRef.current) {
      titleInputRef.current.style.height = 'auto';
      titleInputRef.current.style.height = titleInputRef.current.scrollHeight + 'px';
    }
  }, []);

  const handleTitleSave = useCallback(() => {
    if (!task) return;
    if (titleValue.trim() && titleValue !== task.title) {
      onUpdateTask(task.id, { title: titleValue.trim() });
    } else {
      setTitleValue(task.title);
    }
    setEditingTitle(false);
  }, [titleValue, task, onUpdateTask]);

  const handleClientSelect = useCallback((client: string) => {
    if (!task) return;
    onUpdateTask(task.id, { clientName: client === "_none" ? undefined : client });
    setClientPopoverOpen(false);
  }, [task, onUpdateTask]);

  const handleClientClick = useCallback(() => {
    if (task?.clientName) {
      onOpenChange(false);
      navigate(`/clients/${encodeURIComponent(task.clientName)}`);
    }
  }, [task, navigate, onOpenChange]);

  const handleDateChange = useCallback((date: Date | undefined) => {
    if (!task) return;
    if (date) {
      onUpdateTask(task.id, { dueDate: date });
      setDatePopoverOpen(false);
    }
  }, [task, onUpdateTask]);

  const handlePriorityChange = useCallback((priority: TaskPriority | "_none") => {
    if (!task) return;
    // Fechar o popover primeiro para evitar conflito com re-render do trigger
    setPriorityPopoverOpen(false);
    // Pequeno delay para o popover fechar completamente antes de atualizar o estado
    setTimeout(() => {
      onUpdateTask(task.id, { priority: priority === "_none" ? undefined : priority });
    }, 50);
  }, [task, onUpdateTask]);

  const handleStatusChange = useCallback((status: TaskStatus) => {
    if (!task) return;
    if (status === task.status) {
      setStatusPopoverOpen(false);
      return;
    }
    
    // Criar evento de histórico para mudança de status
    const statusChangeEvent: TaskHistoryEvent = {
      id: `h-${task.id}-status-${Date.now()}`,
      type: "status_change",
      content: `Status alterado de '${task.status}' para '${status}'`,
      author: task.assignees[0] || "Sistema",
      timestamp: new Date(),
    };
    
    onUpdateTask(task.id, { 
      status,
      history: [...(task.history || []), statusChangeEvent],
    });
    setStatusPopoverOpen(false);
  }, [task, onUpdateTask]);

  const handleAddAssignee = useCallback((assignee: string) => {
    if (!task) return;
    if (!task.assignees.includes(assignee)) {
      onUpdateTask(task.id, { assignees: [...task.assignees, assignee] });
    }
  }, [task, onUpdateTask]);

  const handleRemoveAssignee = useCallback((assignee: string) => {
    if (!task) return;
    onUpdateTask(task.id, { assignees: task.assignees.filter(a => a !== assignee) });
  }, [task, onUpdateTask]);

  if (!task) return null;

  const statusConfig = STATUS_CONFIG[task.status];
  const priorityConfig = task.priority ? PRIORITY_CONFIG[task.priority] : null;

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      onUpdateTask(task.id, { description });
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const eventTypeMap = {
      note: "comment",
      email: "email",
      call: "call",
      whatsapp: "whatsapp",
    } as const;

    const newEvent: TaskHistoryEvent = {
      id: `event-${Date.now()}`,
      type: eventTypeMap[noteType] as TaskHistoryEvent["type"],
      content: newComment.trim(),
      author: "Você",
      timestamp: new Date(),
    };

    const currentHistory = task.history || [];
    onUpdateTask(task.id, {
      history: [...currentHistory, newEvent],
    });
    setNewComment("");
    setNoteType("note");
  };

  const handleSetNoteType = (type: "note" | "email" | "call" | "whatsapp") => {
    setNoteType(type);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!task.history) return;
    const updatedHistory = task.history.filter(event => event.id !== eventId);
    onUpdateTask(task.id, { history: updatedHistory });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        hideCloseButton
        className={cn(
          "max-w-[1200px] w-[90vw] h-[85vh] p-0 overflow-hidden",
          UI_CLASSES.card,
          "border-l-[6px]"
        )}
        style={{
          borderLeftColor: isTurboModeActive && turboActionPerformed 
            ? UI_COLORS.taskBorderDone 
            : isTaskOverdue(task.dueDate) 
              ? UI_COLORS.taskBorderRed 
              : UI_COLORS.taskBorderBlue
        }}
      >
        <VisuallyHidden>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>Detalhes da tarefa {task.title}</DialogDescription>
        </VisuallyHidden>
        
        <div className="flex h-full min-h-0">
          <div className="flex-[1.5] pt-8 px-8 pl-10 pb-4 flex flex-col overflow-hidden min-h-0">
            <div className="flex items-center justify-between mb-5">
              <div className="flex-1 max-w-[50%]">
                {editingTitle ? (
                  <textarea
                    ref={titleInputRef}
                    value={titleValue}
                    onChange={handleTitleChange}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleTitleSave();
                      }
                      if (e.key === "Escape") {
                        setTitleValue(task.title);
                        setEditingTitle(false);
                      }
                    }}
                    rows={1}
                    className="text-lg font-extrabold text-white uppercase tracking-wide bg-transparent border-none outline-none resize-none overflow-hidden px-2 py-0.5 -ml-2 w-full"
                    style={{ fontSize: '1.125rem', lineHeight: '1.75rem' }}
                    data-testid="input-modal-title"
                  />
                ) : (
                  <h2 
                    className="text-lg font-extrabold text-white uppercase tracking-wide cursor-pointer px-2 py-0.5 -ml-2 rounded-md hover:bg-gray-700/80 transition-colors"
                    onClick={() => setEditingTitle(true)}
                    data-testid="text-modal-title"
                  >
                    {task.title || "Sem título"}
                  </h2>
                )}
              </div>
              <span className={UI_CLASSES.clientBadge}>
                {getDaysSinceLastUpdate(task.history)}
              </span>
            </div>

            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <div 
                  className="flex items-center gap-2 text-white font-semibold mb-3 cursor-pointer w-fit px-2 py-0.5 -ml-2 rounded-md hover:bg-gray-700/80 transition-colors"
                  data-testid="button-modal-date"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>{format(new Date(task.dueDate), "dd/MM/yyyy")}</span>
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

            <div className="mb-4">
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

            <TaskContactButtons 
              clientEmail={task.clientEmail} 
              clientPhone={task.clientPhone} 
            />

            <div className="flex gap-3 mb-8">
              <Popover open={priorityPopoverOpen} onOpenChange={setPriorityPopoverOpen}>
                <PopoverTrigger asChild>
                  {task.priority ? (
                    <div className="cursor-pointer" data-testid="button-modal-priority">
                      <PriorityBadge 
                        priority={task.priority}
                        dotSize="md"
                        className="!px-3 !py-1.5 !text-sm !gap-1.5 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <span 
                      className="inline-flex px-4 py-1.5 rounded-full cursor-pointer text-sm text-muted-foreground hover:text-foreground hover:bg-gray-700/80"
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
                            onClick={(e) => { e.stopPropagation(); handlePriorityChange("_none"); }}
                          >
                            <PriorityBadge priority={task.priority} />
                            <span className="text-xs text-gray-500 ml-auto">Clique para remover</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="px-3 py-1.5 text-xs text-gray-500">
                      {task.priority ? "Outras opções" : "Selecionar prioridade"}
                    </div>
                    <div className="pb-1">
                      {PRIORITY_OPTIONS.filter(p => p !== task.priority).map(p => (
                        <div
                          key={p}
                          className={UI_CLASSES.dropdownItem}
                          onClick={(e) => { e.stopPropagation(); handlePriorityChange(p); }}
                        >
                          <PriorityBadge priority={p} />
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                <PopoverTrigger asChild>
                  <div className="cursor-pointer" data-testid="button-modal-status">
                    <StatusBadge 
                      status={task.status}
                      dotSize="md"
                      className="!px-3 !py-1.5 !text-sm !gap-1.5 cursor-pointer"
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6}>
                  <div className="w-full">
                    <div className={cn("border-b", UI_CLASSES.border)}>
                      <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                      <div className="px-3 py-1">
                        <div className={cn("flex items-center gap-2 px-2 py-1.5 rounded-md", UI_CLASSES.selectedItem)}>
                          <StatusBadge status={task.status} />
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
                    <div className="pb-1">
                      {STATUS_OPTIONS.filter(s => s !== task.status).map(s => (
                        <div
                          key={s}
                          className={UI_CLASSES.dropdownItem}
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(s); }}
                        >
                          <StatusBadge status={s} />
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <TaskDescription
              description={description}
              onChange={setDescription}
              onSave={handleDescriptionBlur}
            />

            <div className={cn("mt-auto pt-4 pb-4 border-t", UI_CLASSES.borderLight)}>
              <label className={cn("block text-xs font-bold uppercase mb-2", UI_CLASSES.labelText)}>
                Responsáveis
              </label>
              <TaskAssigneesPopover
                id={task.id}
                assignees={task.assignees}
                isOpen={assigneesPopoverOpen}
                onOpenChange={setAssigneesPopoverOpen}
                onAddAssignee={handleAddAssignee}
                onRemoveAssignee={handleRemoveAssignee}
                variant="modal"
              />
            </div>
          </div>

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
