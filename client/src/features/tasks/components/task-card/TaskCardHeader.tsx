import { useRef, useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Pencil, Trash2, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { TaskStatus } from "../../types/task";

interface TaskCardHeaderProps {
  id: string;
  title: string;
  status: TaskStatus;
  isEditing: boolean;
  isCompact: boolean;
  titleRef: React.RefObject<HTMLDivElement>;
  onTitleEdit: (e: React.FocusEvent<HTMLDivElement>) => void;
  onEditClick: (e: React.MouseEvent) => void;
  onCloseEditing: () => void;
  onDeleteClick: () => void;
}

export function TaskCardHeader({
  id,
  title,
  status,
  isEditing,
  isCompact,
  titleRef,
  onTitleEdit,
  onEditClick,
  onCloseEditing,
  onDeleteClick,
}: TaskCardHeaderProps) {
  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isEditing && e.key === "Enter") {
        e.preventDefault();
        (e.target as HTMLDivElement).blur();
      }
    },
    [isEditing],
  );

  const handleTitleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isEditing) {
        e.stopPropagation();
      }
    },
    [isEditing],
  );

  const handleDeleteButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDeleteClick();
    },
    [onDeleteClick],
  );

  const handleEditButtonClick = useCallback(
    (e: React.MouseEvent) => {
      if (isEditing) {
        e.stopPropagation();
        onCloseEditing();
      } else {
        onEditClick(e);
      }
    },
    [isEditing, onCloseEditing, onEditClick],
  );

  if (isCompact && !isEditing) {
    return null;
  }

  return (
    <div className="space-y-1 p-3 md:p-4">
      <div className="flex items-start justify-between gap-2">
        <div
          ref={titleRef}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={onTitleEdit}
          onClick={handleTitleClick}
          onKeyDown={handleTitleKeyDown}
          className={cn(
            "flex-1 text-xs font-bold leading-tight md:text-sm",
            isEditing &&
              "-mx-2 -my-1 cursor-text rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500/50",
            isEditing &&
              status === "In Progress" &&
              "bg-[#1a2535] hover:bg-[#1e2a3d] focus:bg-[#1e2a3d]",
            isEditing &&
              status === "Done" &&
              "bg-[rgb(25,32,28)] hover:bg-[rgb(30,38,33)] focus:bg-[rgb(30,38,33)]",
            isEditing && status === "To Do" && "bg-[#2a2a2a] hover:bg-[#333333] focus:bg-[#333333]",
          )}
          data-testid={`text-tasktitle-${id}`}
        >
          {title}
        </div>
        <div className="flex gap-1">
          {isEditing && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDeleteButtonClick}
              data-testid={`button-delete-${id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8 shrink-0",
              !isEditing &&
                "pointer-events-none opacity-0 transition-opacity focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary group-hover/task-card:pointer-events-auto group-hover/task-card:opacity-100",
            )}
            onClick={handleEditButtonClick}
            data-testid={`button-edit-${id}`}
          >
            {isEditing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <Separator className="mt-2 bg-[#64635E]" />
    </div>
  );
}
