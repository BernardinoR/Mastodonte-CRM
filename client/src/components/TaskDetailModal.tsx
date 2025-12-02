import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Mail, Phone, MessageCircle, MessageSquare, RefreshCw, User, Sparkles, FileText, Paperclip, Image, Pencil } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseLocalDate } from "@/lib/date-utils";
import { DateInput } from "@/components/ui/date-input";
import { PriorityBadge, StatusBadge, PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/components/ui/task-badges";
import type { Task, TaskHistoryEvent, TaskStatus, TaskPriority } from "@/types/task";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/statusConfig";
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

export function TaskDetailModal({
  task,
  open,
  onOpenChange,
  onUpdateTask,
}: TaskDetailModalProps) {
  const [description, setDescription] = useState(task?.description || "");
  const [newComment, setNewComment] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingClient, setEditingClient] = useState(false);
  const [titleValue, setTitleValue] = useState(task?.title || "");
  const [clientValue, setClientValue] = useState(task?.clientName || "");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [priorityPopoverOpen, setPriorityPopoverOpen] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const clientInputRef = useRef<HTMLInputElement>(null);
  const datePopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
      setTitleValue(task.title || "");
      setClientValue(task.clientName || "");
    }
  }, [task]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  useEffect(() => {
    if (editingClient && clientInputRef.current) {
      clientInputRef.current.focus();
      clientInputRef.current.select();
    }
  }, [editingClient]);

  const handleTitleSave = useCallback(() => {
    if (!task) return;
    if (titleValue.trim() && titleValue !== task.title) {
      onUpdateTask(task.id, { title: titleValue.trim() });
    } else {
      setTitleValue(task.title);
    }
    setEditingTitle(false);
  }, [titleValue, task, onUpdateTask]);

  const handleClientSave = useCallback(() => {
    if (!task) return;
    if (clientValue !== task.clientName) {
      onUpdateTask(task.id, { clientName: clientValue.trim() || undefined });
    }
    setEditingClient(false);
  }, [clientValue, task, onUpdateTask]);

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

    const newEvent: TaskHistoryEvent = {
      id: `event-${Date.now()}`,
      type: "comment",
      content: newComment.trim(),
      author: "Você",
      timestamp: new Date(),
    };

    const currentHistory = task.history || [];
    onUpdateTask(task.id, {
      history: [...currentHistory, newEvent],
    });
    setNewComment("");
  };

  const formatEventTime = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getEventIcon = (type: TaskHistoryEvent["type"]) => {
    const iconClass = "w-3.5 h-3.5 text-gray-400";
    switch (type) {
      case "comment":
        return <MessageSquare className={iconClass} />;
      case "status_change":
        return <RefreshCw className={iconClass} />;
      case "assignee_change":
        return <User className={iconClass} />;
      case "created":
        return <Sparkles className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        hideCloseButton
        className={cn(
          "max-w-[1200px] w-[90vw] h-[85vh] p-0 overflow-hidden",
          "bg-[#252730] border-[#363842]",
          "border-l-[6px]",
          isTaskOverdue(task.dueDate) ? "border-l-red-700" : "border-l-transparent"
        )}
      >
        <VisuallyHidden>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>Detalhes da tarefa {task.title}</DialogDescription>
        </VisuallyHidden>
        
        <div className="flex h-full min-h-0">
          <div className="flex-[1.5] pt-8 px-8 pl-10 pb-4 flex flex-col overflow-hidden min-h-0">
            <div className="flex items-center justify-between mb-5">
              {editingTitle ? (
                <Input
                  ref={titleInputRef}
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTitleSave();
                    if (e.key === "Escape") {
                      setTitleValue(task.title);
                      setEditingTitle(false);
                    }
                  }}
                  className="text-lg font-extrabold text-white uppercase tracking-wide bg-transparent border-0 border-b border-gray-600 rounded-none focus-visible:ring-0 p-0 h-auto"
                  data-testid="input-modal-title"
                />
              ) : (
                <h2 
                  className="text-lg font-extrabold text-white uppercase tracking-wide cursor-pointer hover:text-gray-300 group flex items-center gap-2"
                  onClick={() => setEditingTitle(true)}
                  data-testid="text-modal-title"
                >
                  {task.title || "Sem título"}
                  <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50" />
                </h2>
              )}
              <span className="bg-[#333] px-2 py-1 rounded text-sm text-gray-400">
                #{task.id.slice(-4)}
              </span>
            </div>

            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <div 
                  className="flex items-center gap-2 text-white font-semibold mb-3 cursor-pointer hover:text-gray-300 group w-fit"
                  data-testid="button-modal-date"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>{format(new Date(task.dueDate), "dd/MM/yyyy")}</span>
                  <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50" />
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

            {editingClient ? (
              <Input
                ref={clientInputRef}
                value={clientValue}
                onChange={(e) => setClientValue(e.target.value)}
                onBlur={handleClientSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleClientSave();
                  if (e.key === "Escape") {
                    setClientValue(task.clientName || "");
                    setEditingClient(false);
                  }
                }}
                placeholder="Nome do cliente..."
                className="text-2xl font-semibold text-white mb-4 bg-transparent border-0 border-b border-gray-600 rounded-none focus-visible:ring-0 p-0 h-auto"
                data-testid="input-modal-client"
              />
            ) : (
              <h1 
                className="text-2xl font-semibold text-white mb-4 leading-tight cursor-pointer hover:text-gray-300 group flex items-center gap-2 w-fit"
                onClick={() => setEditingClient(true)}
                data-testid="text-modal-client"
              >
                {task.clientName || "Adicionar cliente..."}
                <Pencil className="w-4 h-4 opacity-0 group-hover:opacity-50" />
              </h1>
            )}

            <div className="flex gap-3 mb-6">
              {task.clientEmail && (
                <a
                  href={`mailto:${task.clientEmail}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-400 bg-white/5 border border-[#363842] hover:bg-white/10 hover:text-white transition-colors"
                  data-testid="button-email-client"
                >
                  <Mail className="w-4 h-4" />
                  Enviar Email
                </a>
              )}
              {task.clientPhone && (
                <>
                  <a
                    href={`tel:${task.clientPhone}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-400 bg-white/5 border border-[#363842] hover:bg-white/10 hover:text-white transition-colors"
                    data-testid="button-call-client"
                  >
                    <Phone className="w-4 h-4" />
                    Ligar
                  </a>
                  <a
                    href={`https://wa.me/${task.clientPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-400 bg-white/5 border border-[#363842] hover:bg-white/10 hover:text-white transition-colors"
                    data-testid="button-whatsapp-client"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </>
              )}
            </div>

            <div className="flex gap-3 mb-8">
              <Popover open={priorityPopoverOpen} onOpenChange={setPriorityPopoverOpen}>
                <PopoverTrigger asChild>
                  {task.priority ? (
                    <div className="cursor-pointer" data-testid="button-modal-priority">
                      <PriorityBadge 
                        priority={task.priority}
                        className="px-4 py-1.5 text-base gap-1.5 cursor-pointer"
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
                      className="px-4 py-1.5 text-base gap-1.5 cursor-pointer"
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

            <div className="flex-grow">
              <label className="block text-[#64666E] text-xs font-bold uppercase mb-3">
                Descrição
              </label>
              <Textarea
                ref={descriptionRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                placeholder="Adicione detalhes..."
                className="w-full min-h-[100px] bg-transparent border-0 text-gray-300 text-base leading-relaxed resize-none focus:text-white focus-visible:ring-0 p-0"
                data-testid="textarea-description"
              />
            </div>

            <div className="mt-auto border-t border-[#363842] pt-4 pb-4">
              <label className="block text-[#64666E] text-xs font-bold uppercase mb-2">
                Responsáveis
              </label>
              <div className="space-y-2">
                {task.assignees.map((assignee, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className={cn("w-8 h-8", getAvatarColor(assignee))}>
                      <AvatarFallback className="bg-transparent text-white font-bold text-xs">
                        {getInitials(assignee)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white font-medium text-sm">{assignee}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#1E1F24] border-l border-[#363842] flex flex-col min-h-0 overflow-hidden">
            <div className="p-5 border-b border-[#363842] flex justify-between items-center flex-shrink-0">
              <span className="text-white font-bold">Histórico</span>
              <span className="text-sm text-[#64666E]">
                {(task.history?.length || 0)} atualizações
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
              {(!task.history || task.history.length === 0) ? (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">Nenhuma atualização ainda</p>
                  <p className="text-xs mt-1">Adicione um comentário abaixo</p>
                </div>
              ) : (
                task.history.map((event, index) => (
                  <div key={event.id} className="flex gap-3 relative">
                    {index < (task.history?.length || 0) - 1 && (
                      <div 
                        className="absolute left-[14px] top-[30px] bottom-[-20px] w-0.5 bg-[#363842]"
                        style={{ zIndex: 0 }}
                      />
                    )}
                    
                    <div className="w-[30px] h-[30px] rounded-full bg-[#333] border-2 border-[#1E1F24] z-[1] flex items-center justify-center flex-shrink-0 text-xs">
                      {getEventIcon(event.type)}
                    </div>
                    
                    <div className="bg-[#2B2D33] p-3 rounded-lg text-gray-400 text-sm w-full border border-[#363842]">
                      <div className="flex justify-between text-xs text-[#64666E] mb-1.5">
                        <span className="font-bold text-white">{event.author}</span>
                        <span>{formatEventTime(event.timestamp)}</span>
                      </div>
                      <p className="leading-relaxed">{event.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-[#1E1F24] border-t border-[#363842] flex-shrink-0">
              <div className="bg-[#151619] border border-[#363842] rounded-lg p-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva uma nota..."
                  className="bg-transparent border-0 text-white resize-none min-h-[32px] focus-visible:ring-0 p-0 text-sm"
                  data-testid="textarea-new-comment"
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 text-gray-500 hover:text-gray-300"
                      data-testid="button-attach-file"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 text-gray-500 hover:text-gray-300"
                      data-testid="button-attach-image"
                    >
                      <Image className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
                    data-testid="button-add-comment"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
