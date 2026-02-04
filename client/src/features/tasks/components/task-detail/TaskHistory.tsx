import { useRef, useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Mail,
  Phone,
  MessageCircle,
  RefreshCw,
  User,
  Sparkles,
  FileText,
  Paperclip,
  Image,
  X,
  SquarePen,
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
      return <Mail className="h-3.5 w-3.5 text-blue-400" />;
    case "call":
      return <Phone className="h-3.5 w-3.5 text-red-400" />;
    case "whatsapp":
      return <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />;
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

  const handleCommentKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onAddComment();
      }
    },
    [onAddComment],
  );

  const getPlaceholder = () => {
    switch (noteType) {
      case "email":
        return "Resumo do email...";
      case "call":
        return "Resumo da ligação...";
      case "whatsapp":
        return "Resumo do WhatsApp...";
      default:
        return "Escreva uma nota...";
    }
  };

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", UI_CLASSES.historyPanel)}>
      <div
        className={cn(
          "flex flex-shrink-0 items-center justify-between p-5",
          UI_CLASSES.borderLight,
          "border-b",
        )}
      >
        <span className="font-bold text-white">Histórico</span>
        <span className={cn("text-sm", UI_CLASSES.labelText)}>{history.length} atualizações</span>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        {history.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <p className="text-sm">Nenhuma atualização ainda</p>
            <p className="mt-1 text-xs">Adicione um comentário abaixo</p>
          </div>
        ) : (
          history.map((event, index) => (
            <div key={event.id} className="relative flex gap-3">
              {index < history.length - 1 && (
                <div
                  className={cn(
                    "absolute bottom-[-20px] left-[14px] top-[30px] w-0.5",
                    UI_CLASSES.historyTimeline,
                  )}
                  style={{ zIndex: 0 }}
                />
              )}

              <div
                className={cn(
                  "z-[1] flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-xs transition-colors hover:border-red-700 hover:bg-red-900/50",
                  UI_CLASSES.historyIcon,
                )}
                onMouseEnter={() => onEventHover(event.id)}
                onMouseLeave={() => onEventHover(null)}
                onClick={() => onDeleteEvent(event.id)}
                data-testid={`button-delete-event-${event.id}`}
              >
                {hoveredEventId === event.id ? (
                  <X className="h-3.5 w-3.5 text-red-400" />
                ) : (
                  getEventIcon(event.type)
                )}
              </div>

              <div
                className={cn(
                  "w-full rounded-lg p-3 text-sm text-gray-400",
                  UI_CLASSES.historyEvent,
                )}
              >
                <div className={cn("mb-1.5 flex justify-between text-xs", UI_CLASSES.labelText)}>
                  <span className="font-bold text-white">{event.author}</span>
                  <span>{formatEventTime(event.timestamp)}</span>
                </div>
                <p className="leading-relaxed">{event.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        className={cn("flex-shrink-0 p-4", UI_CLASSES.panel, UI_CLASSES.borderLight, "border-t")}
      >
        <div className={cn("rounded-lg p-3", UI_CLASSES.commentInput)}>
          <Textarea
            ref={commentInputRef}
            value={newComment}
            onChange={(e) => onNewCommentChange(e.target.value)}
            onKeyDown={handleCommentKeyDown}
            placeholder={getPlaceholder()}
            className="min-h-[32px] resize-none border-0 bg-transparent p-0 text-sm text-white !ring-0 !ring-offset-0 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            data-testid="textarea-new-comment"
          />
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-gray-500 hover:text-gray-300"
                data-testid="button-attach-file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-gray-500 hover:text-gray-300"
                data-testid="button-attach-image"
              >
                <Image className="h-4 w-4" />
              </Button>
              <div className={cn("mx-1 h-4 w-px", UI_CLASSES.historyTimeline)} />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onNoteTypeChange("note")}
                className={cn(
                  "h-7 w-7",
                  noteType === "note"
                    ? "bg-gray-500/20 text-gray-200"
                    : "text-gray-500 hover:text-gray-300",
                )}
                data-testid="button-note-note"
              >
                <SquarePen className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onNoteTypeChange("email")}
                className={cn(
                  "h-7 w-7",
                  noteType === "email"
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-gray-500 hover:text-gray-300",
                )}
                data-testid="button-note-email"
              >
                <Mail className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onNoteTypeChange("call")}
                className={cn(
                  "h-7 w-7",
                  noteType === "call"
                    ? "bg-red-500/20 text-red-400"
                    : "text-gray-500 hover:text-red-400",
                )}
                data-testid="button-note-call"
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onNoteTypeChange("whatsapp")}
                className={cn(
                  "h-7 w-7",
                  noteType === "whatsapp"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-gray-500 hover:text-gray-300",
                )}
                data-testid="button-note-whatsapp"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="sm"
              onClick={onAddComment}
              disabled={!newComment.trim()}
              className="bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
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
