import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Pencil } from "lucide-react";
import { TaskContactButtons, TaskDescription, TaskHistory } from "@/components/task-detail";
import { ClientSelector, AssigneeSelector } from "@/components/task-editors";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format, isBefore, startOfDay, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseLocalDate } from "@/lib/date-utils";
import { DateInput } from "@/components/ui/date-input";
import { PriorityBadge, StatusBadge, PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/components/ui/task-badges";
import type { Task, TaskHistoryEvent, TaskStatus, TaskPriority } from "@/types/task";
import { STATUS_CONFIG, PRIORITY_CONFIG, UI_CLASSES } from "@/lib/statusConfig";
import { cn } from "@/lib/utils";

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-zinc-600",
    "bg-zinc-700",
    "bg-slate-600",
    "bg-slate-700",
    "bg-neutral-600",
    "bg-neutral-700",
    "bg-stone-600",
    "bg-gray-600",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
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
    onUpdateTask(task.id, { priority: priority === "_none" ? undefined : priority });
    setPriorityPopoverOpen(false);
  }, [task, onUpdateTask]);

  const handleStatusChange = useCallback((status: TaskStatus) => {
    if (!task) return;
    onUpdateTask(task.id, { status });
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
          borderLeftColor: isTaskOverdue(task.dueDate) ? "rgb(185, 28, 28)" : "rgb(66, 129, 220)"
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
              <span className="bg-[#333] px-2.5 py-1 rounded text-xs text-gray-400">
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
                className="w-auto p-0 bg-[#1a1a1a] border-[#2a2a2a]" 
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

            <div className="flex items-center gap-1 mb-4 group">
              {task.clientName ? (
                <span 
                  className="text-2xl font-semibold text-white leading-tight cursor-pointer px-2 py-0.5 -ml-2 rounded-md hover:bg-gray-700/80 transition-colors"
                  onClick={handleClientClick}
                  data-testid="text-modal-client"
                >
                  {task.clientName}
                </span>
              ) : (
                <span 
                  className="text-2xl font-semibold text-muted-foreground leading-tight px-2 py-0.5 -ml-2"
                  data-testid="text-modal-client"
                >
                  Sem cliente
                </span>
              )}
              <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid="button-edit-client"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-80 p-0 bg-[#1a1a1a] border-[#2a2a2a]" 
                  side="bottom" 
                  align="start" 
                  sideOffset={6}
                >
                  <ClientSelector 
                    selectedClient={task.clientName || null}
                    onSelect={handleClientSelect}
                  />
                </PopoverContent>
              </Popover>
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
                      <div className="border-b border-[#2a2a2a]">
                        <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                        <div className="px-3 py-1">
                          <div 
                            className="flex items-center gap-2 px-2 py-1.5 cursor-pointer bg-[#2a2a2a] rounded-md"
                            onClick={() => handlePriorityChange("_none")}
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
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                          onClick={() => handlePriorityChange(p)}
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
                    <div className="border-b border-[#2a2a2a]">
                      <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                      <div className="px-3 py-1">
                        <div className="flex items-center gap-2 px-2 py-1.5 bg-[#2a2a2a] rounded-md">
                          <StatusBadge status={task.status} />
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
                    <div className="pb-1">
                      {STATUS_OPTIONS.filter(s => s !== task.status).map(s => (
                        <div
                          key={s}
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                          onClick={() => handleStatusChange(s)}
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

            <div className="mt-auto border-t border-[#363842] pt-4 pb-4">
              <label className="block text-[#64666E] text-xs font-bold uppercase mb-2">
                Responsáveis
              </label>
              <Popover open={assigneesPopoverOpen} onOpenChange={setAssigneesPopoverOpen}>
                <PopoverTrigger asChild>
                  <div 
                    className="inline-flex items-center gap-2 px-2 py-1 -ml-2 rounded-md hover:bg-gray-700/80 transition-colors cursor-pointer"
                    data-testid="button-edit-assignees"
                  >
                    {task.assignees.length === 0 ? (
                      <span className="text-gray-500 text-sm">Adicionar responsável...</span>
                    ) : (
                      <>
                        <div className="flex -space-x-2 flex-shrink-0">
                          {task.assignees.slice(0, 3).map((assignee, idx) => (
                            <Avatar key={idx} className={cn("w-7 h-7 border-2 border-[#27282F]", getAvatarColor(assignee))}>
                              <AvatarFallback className="bg-transparent text-white font-medium text-[11px]">
                                {getInitials(assignee)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        {(() => {
                          const MAX_DISPLAY = 3;
                          const displayed = task.assignees.slice(0, MAX_DISPLAY);
                          const remaining = task.assignees.slice(MAX_DISPLAY);
                          
                          return (
                            <div className="flex items-center">
                              <span className="text-gray-300 text-sm">
                                {displayed.join(", ")}
                              </span>
                              {remaining.length > 0 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-gray-400 text-sm whitespace-nowrap ml-1 hover:text-white">
                                      e mais {remaining.length}...
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="bg-[#2a2a2a] border-[#363842] text-white">
                                    <div className="text-sm">
                                      {remaining.join(", ")}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>
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
