import { useState, useCallback, useRef, useEffect, memo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Pause, 
  RotateCcw,
  Rocket,
  Calendar as CalendarIcon,
  CheckCircle2,
  Zap,
  User,
  Mail,
  Phone,
  MessageCircle,
  RefreshCw,
  Sparkles,
  FileText,
  SquarePen
} from "lucide-react";
import { format, isBefore, startOfDay, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseLocalDate } from "@/lib/date-utils";
import { DateInput } from "@/components/ui/date-input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Task, TaskHistoryEvent, TaskStatus, TaskPriority } from "@/types/task";
import { STATUS_CONFIG, PRIORITY_CONFIG, UI_CLASSES, getStatusConfig, getPriorityConfig } from "@/lib/statusConfig";
import { cn } from "@/lib/utils";
import type { UseTurboModeReturn } from "@/hooks/useTurboMode";

const STATUS_OPTIONS: TaskStatus[] = ["To Do", "In Progress", "Done"];
const PRIORITY_OPTIONS: TaskPriority[] = ["Urgente", "Importante", "Normal", "Baixa"];

interface TurboModeOverlayProps {
  turboMode: UseTurboModeReturn;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  availableClients: string[];
  availableAssignees: string[];
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

function getEventIcon(type: TaskHistoryEvent["type"]) {
  const iconClass = "w-3.5 h-3.5 text-gray-400";
  switch (type) {
    case "comment":
      return <SquarePen className={iconClass} />;
    case "email":
      return <Mail className="w-3.5 h-3.5 text-blue-400" />;
    case "call":
      return <Phone className="w-3.5 h-3.5 text-red-400" />;
    case "whatsapp":
      return <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />;
    case "status_change":
      return <RefreshCw className={iconClass} />;
    case "assignee_change":
      return <User className={iconClass} />;
    case "created":
      return <Sparkles className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
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
    "bg-blue-600", "bg-green-600", "bg-purple-600", "bg-orange-600",
    "bg-pink-600", "bg-cyan-600", "bg-indigo-600", "bg-rose-600"
  ];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

export const TurboModeOverlay = memo(function TurboModeOverlay({
  turboMode,
  onUpdateTask,
  availableClients,
  availableAssignees,
}: TurboModeOverlayProps) {
  const { 
    state, 
    currentTask, 
    totalTasks, 
    completedInSession,
    exitTurboMode, 
    goToNext, 
    goToPrevious,
    markActionPerformed,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime
  } = turboMode;

  const task = currentTask;

  const [description, setDescription] = useState(task?.description || "");
  const [newComment, setNewComment] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task?.title || "");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [priorityPopoverOpen, setPriorityPopoverOpen] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
  const [assigneesPopoverOpen, setAssigneesPopoverOpen] = useState(false);
  const [noteType, setNoteType] = useState<"note" | "email" | "call" | "whatsapp">("note");
  
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);
  const previousTaskIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
      setTitleValue(task.title || "");
      setNewComment("");
      
      if (previousTaskIdRef.current !== task.id) {
        previousTaskIdRef.current = task.id;
      }
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
    markActionPerformed();
  }, [task, onUpdateTask, markActionPerformed]);

  const handleDateChange = useCallback((date: Date | undefined) => {
    if (!task) return;
    if (date) {
      onUpdateTask(task.id, { dueDate: date });
      setDatePopoverOpen(false);
      markActionPerformed();
    }
  }, [task, onUpdateTask, markActionPerformed]);

  const handleAssigneeToggle = useCallback((assignee: string) => {
    if (!task) return;
    const currentAssignees = task.assignees || [];
    const newAssignees = currentAssignees.includes(assignee)
      ? currentAssignees.filter(a => a !== assignee)
      : [...currentAssignees, assignee];
    onUpdateTask(task.id, { assignees: newAssignees });
    markActionPerformed();
  }, [task, onUpdateTask, markActionPerformed]);

  const handleStatusChange = useCallback((newStatus: TaskStatus) => {
    if (!task) return;
    
    const historyEvent: TaskHistoryEvent = {
      id: `history-${Date.now()}`,
      type: "status_change",
      content: `Status alterado de "${task.status}" para "${newStatus}"`,
      author: "Você",
      timestamp: new Date(),
    };
    
    onUpdateTask(task.id, { 
      status: newStatus,
      history: [...(task.history || []), historyEvent]
    });
    setStatusPopoverOpen(false);
    markActionPerformed();
  }, [task, onUpdateTask, markActionPerformed]);

  const handlePriorityChange = useCallback((newPriority: TaskPriority) => {
    if (!task) return;
    onUpdateTask(task.id, { priority: newPriority });
    setPriorityPopoverOpen(false);
    markActionPerformed();
  }, [task, onUpdateTask, markActionPerformed]);

  const handleDescriptionChange = useCallback((newDescription: string) => {
    setDescription(newDescription);
    if (task) {
      onUpdateTask(task.id, { description: newDescription });
    }
  }, [task, onUpdateTask]);

  const handleAddComment = useCallback(() => {
    if (!task || !newComment.trim()) return;
    
    const historyEvent: TaskHistoryEvent = {
      id: `history-${Date.now()}`,
      type: noteType === "note" ? "comment" : noteType,
      content: newComment.trim(),
      author: "Você",
      timestamp: new Date(),
    };
    
    onUpdateTask(task.id, { 
      history: [...(task.history || []), historyEvent]
    });
    setNewComment("");
    markActionPerformed();
    
    setTimeout(() => {
      historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [task, newComment, noteType, onUpdateTask, markActionPerformed]);

  if (!state.isActive || !task) return null;

  const isOverdue = task.dueDate && isTaskOverdue(task.dueDate);
  const progress = totalTasks > 0 ? ((state.currentIndex + 1) / totalTasks) * 100 : 0;
  const timerProgress = (state.timerSeconds / (25 * 60)) * 100;
  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = task.priority ? getPriorityConfig(task.priority) : null;

  return (
    <Dialog open={state.isActive} onOpenChange={(open) => !open && exitTurboMode()}>
      <DialogContent 
        className="max-w-4xl h-[90vh] p-0 flex flex-col gap-0 overflow-hidden"
        data-testid="turbo-mode-overlay"
      >
        <VisuallyHidden>
          <DialogTitle>Modo Turbo</DialogTitle>
        </VisuallyHidden>
        
        {state.showCompletionAnimation && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-emerald-500/20 pointer-events-none">
            <div className="flex flex-col items-center gap-4 animate-bounce">
              <CheckCircle2 className="w-24 h-24 text-emerald-500" />
              <span className="text-2xl font-bold text-emerald-500">Concluído!</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 px-4 py-3 border-b bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-500">
              <Rocket className="w-4 h-4" />
              <span className="text-sm font-semibold">Modo Turbo</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">
                {state.currentIndex + 1} / {totalTasks} tarefas
              </span>
              {completedInSession > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({completedInSession} concluídas)
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted overflow-hidden">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-amber-500/30 transition-all duration-1000"
                style={{ width: `${timerProgress}%` }}
              />
              <span className={cn(
                "relative text-lg font-mono font-bold tabular-nums",
                state.timerSeconds <= 60 && "text-red-500 animate-pulse"
              )}>
                {formatTime(state.timerSeconds)}
              </span>
            </div>
            
            <Button
              size="icon"
              variant="ghost"
              onClick={state.timerRunning ? pauseTimer : startTimer}
              data-testid="turbo-timer-toggle"
            >
              {state.timerRunning ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              onClick={resetTimer}
              data-testid="turbo-timer-reset"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              onClick={exitTurboMode}
              data-testid="turbo-exit"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="w-full h-1 bg-muted">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          <Button
            size="icon"
            variant="ghost"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur shadow-lg hover-elevate"
            onClick={goToPrevious}
            disabled={state.currentIndex === 0}
            data-testid="turbo-prev"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-3">
                  <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Badge 
                        variant="outline"
                        className={cn(
                          "cursor-pointer rounded-full font-normal flex items-center gap-1 shrink-0",
                          statusConfig.bgColor,
                          statusConfig.textColor,
                          statusConfig.borderColor
                        )}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dotColor)} />
                        {task.status}
                      </Badge>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-48 p-1">
                      {STATUS_OPTIONS.map((s) => {
                        const config = getStatusConfig(s);
                        return (
                          <button
                            key={s}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover-elevate",
                              task.status === s && "bg-accent"
                            )}
                            onClick={() => handleStatusChange(s)}
                          >
                            <span className={cn("w-2 h-2 rounded-full", config.dotColor)} />
                            {s}
                          </button>
                        );
                      })}
                    </PopoverContent>
                  </Popover>

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
                      className="flex-1 text-2xl font-semibold bg-transparent border-none outline-none resize-none overflow-hidden leading-tight"
                      rows={1}
                    />
                  ) : (
                    <h2 
                      className="flex-1 text-2xl font-semibold cursor-text leading-tight"
                      onClick={() => setEditingTitle(true)}
                    >
                      {task.title}
                    </h2>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={cn(
                          "gap-2",
                          isOverdue && "border-red-500/50 text-red-500"
                        )}
                        data-testid="turbo-date-picker"
                      >
                        <CalendarIcon className="w-4 h-4" />
                        {task.dueDate ? format(new Date(task.dueDate), "dd/MM/yyyy") : "Sem data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-3">
                      <DateInput
                        value={new Date(task.dueDate)}
                        onChange={handleDateChange}
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover open={priorityPopoverOpen} onOpenChange={setPriorityPopoverOpen}>
                    <PopoverTrigger asChild>
                      {priorityConfig ? (
                        <Badge 
                          variant="outline"
                          className={cn(
                            "cursor-pointer rounded-full font-normal flex items-center gap-1",
                            priorityConfig.bgColor,
                            priorityConfig.textColor,
                            priorityConfig.borderColor
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", priorityConfig.dotColor)} />
                          {task.priority}
                        </Badge>
                      ) : (
                        <Button variant="outline" size="sm">Sem prioridade</Button>
                      )}
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-40 p-1">
                      {PRIORITY_OPTIONS.map((p) => {
                        const config = getPriorityConfig(p);
                        return (
                          <button
                            key={p}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover-elevate",
                              task.priority === p && "bg-accent"
                            )}
                            onClick={() => handlePriorityChange(p)}
                          >
                            <span className={cn("w-2 h-2 rounded-full", config.dotColor)} />
                            {p}
                          </button>
                        );
                      })}
                    </PopoverContent>
                  </Popover>

                  <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <User className="w-4 h-4" />
                        {task.clientName || "Sem cliente"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-48 p-1">
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover-elevate text-muted-foreground"
                        onClick={() => handleClientSelect("_none")}
                      >
                        Sem cliente
                      </button>
                      {availableClients.map((client) => (
                        <button
                          key={client}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover-elevate",
                            task.clientName === client && "bg-accent"
                          )}
                          onClick={() => handleClientSelect(client)}
                        >
                          {client}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>

                  <Popover open={assigneesPopoverOpen} onOpenChange={setAssigneesPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <User className="w-4 h-4" />
                        {task.assignees.length > 0 
                          ? `${task.assignees.length} responsável(is)` 
                          : "Sem responsável"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-56 p-1">
                      {availableAssignees.map((assignee) => (
                        <button
                          key={assignee}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover-elevate",
                            task.assignees.includes(assignee) && "bg-accent"
                          )}
                          onClick={() => handleAssigneeToggle(assignee)}
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className={cn("text-xs text-white", getAvatarColor(assignee))}>
                              {getInitials(assignee)}
                            </AvatarFallback>
                          </Avatar>
                          {assignee}
                          {task.assignees.includes(assignee) && (
                            <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-500" />
                          )}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>

                {(task.clientEmail || task.clientPhone) && (
                  <div className="flex gap-3">
                    {task.clientEmail && (
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(task.clientEmail)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-400 ${UI_CLASSES.contactBtn} hover:text-white transition-colors`}
                        onClick={markActionPerformed}
                        data-testid="turbo-email-client"
                      >
                        <Mail className="w-4 h-4" />
                        Enviar Email
                      </a>
                    )}
                    {task.clientPhone && (
                      <>
                        <a
                          href={`tel:${task.clientPhone}`}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-400 ${UI_CLASSES.contactBtn} hover:text-white transition-colors`}
                          onClick={markActionPerformed}
                          data-testid="turbo-call-client"
                        >
                          <Phone className="w-4 h-4" />
                          Ligar
                        </a>
                        <button
                          onClick={() => {
                            const phone = task.clientPhone!.replace(/\D/g, "");
                            window.location.href = `whatsapp://send?phone=${phone}`;
                            markActionPerformed();
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-400 ${UI_CLASSES.contactBtn} hover:text-white transition-colors`}
                          data-testid="turbo-whatsapp-client"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Descrição</h3>
                  <Textarea
                    value={description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    placeholder="Adicione detalhes..."
                    className="min-h-[100px] resize-none text-base"
                    data-testid="turbo-description"
                  />
                </div>
              </div>
            </div>

            <div 
              className={cn(
                "w-80 border-l flex flex-col transition-colors duration-500",
                state.actionPerformed 
                  ? "bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 border-emerald-500/30" 
                  : "bg-muted/30"
              )}
            >
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="text-sm font-medium">Histórico</h3>
                <span className="text-xs text-muted-foreground">
                  {getDaysSinceLastUpdate(task.history)}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-3">
                  {(task.history || []).map((event) => (
                    <div key={event.id} className="flex gap-2">
                      <div className="flex-shrink-0 mt-1">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground break-words">{event.content}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {event.author} • {format(new Date(event.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div ref={historyEndRef} />
              </div>

              <div className="p-3 border-t space-y-2">
                <div className="flex gap-1">
                  {(["note", "email", "call", "whatsapp"] as const).map((type) => (
                    <Button
                      key={type}
                      size="sm"
                      variant={noteType === type ? "default" : "ghost"}
                      className="flex-1 text-xs"
                      onClick={() => setNoteType(type)}
                    >
                      {type === "note" && "Nota"}
                      {type === "email" && "Email"}
                      {type === "call" && "Ligação"}
                      {type === "whatsapp" && "WhatsApp"}
                    </Button>
                  ))}
                </div>
                <Textarea
                  placeholder="Adicionar nota..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  className="min-h-[80px] resize-none text-sm"
                  data-testid="turbo-comment-input"
                />
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  data-testid="turbo-add-comment"
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full shadow-lg",
              state.actionPerformed 
                ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                : "bg-background/80 backdrop-blur hover-elevate"
            )}
            onClick={goToNext}
            disabled={state.currentIndex === totalTasks - 1}
            data-testid="turbo-next"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
