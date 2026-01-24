import { useRef, useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { 
  Mail, Phone, MessageCircle, RefreshCw, User, Sparkles, 
  FileText, Paperclip, Image, X, SquarePen 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import { UI_CLASSES } from "../../lib/statusConfig";
import type { TaskHistoryEvent } from "../../types/task";

type NoteType = "note" | "email" | "call" | "whatsapp";

interface TaskHistoryProps {
  history: TaskHistoryEvent[];
  newComment: string;
  noteType: NoteType;
  hoveredEventId: string | null;
  onNewCommentChange: (value: string) => void;
  onNoteTypeChange: (type: NoteType) => void;
  onAddComment: () => void;
  onDeleteEvent: (eventId: string) => void;
  onEventHover: (eventId: string | null) => void;
}

const formatEventTime = (date: Date) => {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

const getEventIcon = (type: TaskHistoryEvent["type"]) => {
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
};

export function TaskHistory({
  history,
  newComment,
  noteType,
  hoveredEventId,
  onNewCommentChange,
  onNoteTypeChange,
  onAddComment,
  onDeleteEvent,
  onEventHover,
}: TaskHistoryProps) {
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const handleCommentKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onAddComment();
    }
  }, [onAddComment]);

  const getPlaceholder = () => {
    switch (noteType) {
      case "email": return "Resumo do email...";
      case "call": return "Resumo da ligação...";
      case "whatsapp": return "Resumo do WhatsApp...";
      default: return "Escreva uma nota...";
    }
  };

  return (
    <div className={cn("flex-1 flex flex-col min-h-0 overflow-hidden", UI_CLASSES.historyPanel)}>
      <div className={cn("p-5 flex justify-between items-center flex-shrink-0", UI_CLASSES.borderLight, "border-b")}>
        <span className="text-white font-bold">Histórico</span>
        <span className={cn("text-sm", UI_CLASSES.labelText)}>
          {history.length} atualizações
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
        {history.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">Nenhuma atualização ainda</p>
            <p className="text-xs mt-1">Adicione um comentário abaixo</p>
          </div>
        ) : (
          history.map((event, index) => (
            <div key={event.id} className="flex gap-3 relative">
              {index < history.length - 1 && (
                <div 
                  className={cn("absolute left-[14px] top-[30px] bottom-[-20px] w-0.5", UI_CLASSES.historyTimeline)}
                  style={{ zIndex: 0 }}
                />
              )}
              
              <div 
                className={cn(
                  "w-[30px] h-[30px] rounded-full z-[1] flex items-center justify-center flex-shrink-0 text-xs cursor-pointer hover:bg-red-900/50 hover:border-red-700 transition-colors",
                  UI_CLASSES.historyIcon
                )}
                onMouseEnter={() => onEventHover(event.id)}
                onMouseLeave={() => onEventHover(null)}
                onClick={() => onDeleteEvent(event.id)}
                data-testid={`button-delete-event-${event.id}`}
              >
                {hoveredEventId === event.id ? (
                  <X className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  getEventIcon(event.type)
                )}
              </div>
              
              <div className={cn("p-3 rounded-lg text-gray-400 text-sm w-full", UI_CLASSES.historyEvent)}>
                <div className={cn("flex justify-between text-xs mb-1.5", UI_CLASSES.labelText)}>
                  <span className="font-bold text-white">{event.author}</span>
                  <span>{formatEventTime(event.timestamp)}</span>
                </div>
                <p className="leading-relaxed">{event.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={cn("p-4 flex-shrink-0", UI_CLASSES.panel, UI_CLASSES.borderLight, "border-t")}>
        <div className={cn("rounded-lg p-3", UI_CLASSES.commentInput)}>
          <Textarea
            ref={commentInputRef}
            value={newComment}
            onChange={(e) => onNewCommentChange(e.target.value)}
            onKeyDown={handleCommentKeyDown}
            placeholder={getPlaceholder()}
            className="bg-transparent border-0 text-white resize-none min-h-[32px] focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:outline-none !ring-0 !ring-offset-0 p-0 text-sm"
            data-testid="textarea-new-comment"
          />
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-1">
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
              <div className={cn("w-px h-4 mx-1", UI_CLASSES.historyTimeline)} />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onNoteTypeChange("note")}
                className={cn(
                  "w-7 h-7",
                  noteType === "note" ? "text-gray-200 bg-gray-500/20" : "text-gray-500 hover:text-gray-300"
                )}
                data-testid="button-note-note"
              >
                <SquarePen className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onNoteTypeChange("email")}
                className={cn(
                  "w-7 h-7",
                  noteType === "email" ? "text-blue-400 bg-blue-500/20" : "text-gray-500 hover:text-gray-300"
                )}
                data-testid="button-note-email"
              >
                <Mail className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onNoteTypeChange("call")}
                className={cn(
                  "w-7 h-7",
                  noteType === "call" ? "text-red-400 bg-red-500/20" : "text-gray-500 hover:text-red-400"
                )}
                data-testid="button-note-call"
              >
                <Phone className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onNoteTypeChange("whatsapp")}
                className={cn(
                  "w-7 h-7",
                  noteType === "whatsapp" ? "text-emerald-400 bg-emerald-500/20" : "text-gray-500 hover:text-gray-300"
                )}
                data-testid="button-note-whatsapp"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
            <Button
              size="sm"
              onClick={onAddComment}
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
  );
}
