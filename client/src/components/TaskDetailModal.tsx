import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Mail, Phone, MessageCircle, Plus, X, MessageSquare, RefreshCw, User, Sparkles, FileText, Paperclip, Image } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseLocalDate } from "@/lib/date-utils";
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
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
    }
  }, [task]);

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
        
        <div className="flex h-full">
          <div className="flex-[1.5] p-8 pl-10 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-white uppercase tracking-wide">
                {task.title || "Sem título"}
              </h2>
              <span className="bg-[#333] px-2 py-1 rounded text-sm text-gray-400">
                #{task.id.slice(-4)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-white font-semibold mb-3">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(task.dueDate), "dd/MM/yyyy")}</span>
            </div>

            {task.clientName && (
              <h1 className="text-2xl font-semibold text-white mb-4 leading-tight">
                {task.clientName}
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
              {priorityConfig && (
                <Badge
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-semibold",
                    priorityConfig.bgColor,
                    priorityConfig.textColor,
                    "border-0"
                  )}
                >
                  <span className={cn("w-2 h-2 rounded-full mr-2", priorityConfig.dotColor)} />
                  {task.priority}
                </Badge>
              )}
              <Badge
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-semibold",
                  statusConfig.bgColor,
                  statusConfig.textColor,
                  "border-0"
                )}
              >
                {statusConfig.label}
              </Badge>
            </div>

            <div className="mb-6">
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

            <div className="border-t border-[#363842] pt-4 pb-2">
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

          <div className="flex-1 bg-[#1E1F24] border-l border-[#363842] flex flex-col">
            <div className="p-5 border-b border-[#363842] flex justify-between items-center">
              <span className="text-white font-bold">Histórico</span>
              <span className="text-sm text-[#64666E]">
                {(task.history?.length || 0)} atualizações
              </span>
            </div>

            <div className="flex-grow overflow-y-auto p-5 space-y-5">
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

            <div className="p-4 bg-[#1E1F24] border-t border-[#363842]">
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

        <Button
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={() => onOpenChange(false)}
          data-testid="button-close-modal"
        >
          <X className="w-5 h-5" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
