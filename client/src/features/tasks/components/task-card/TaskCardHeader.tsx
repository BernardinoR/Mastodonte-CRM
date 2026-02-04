import { useCallback } from "react";
import { cn } from "@/shared/lib/utils";
import type { TaskStatus, TaskType } from "../../types/task";
import { getTaskTypeConfig } from "../../lib/statusConfig";

interface TaskCardHeaderProps {
  id: string;
  title: string;
  status: TaskStatus;
  taskType?: TaskType;
  isEditing: boolean;
  titleRef: React.RefObject<HTMLDivElement>;
  onTitleEdit: (e: React.FocusEvent<HTMLDivElement>) => void;
}

export function TaskCardHeader({
  id,
  title,
  status,
  taskType,
  isEditing,
  titleRef,
  onTitleEdit,
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

  const typeConfig = taskType ? getTaskTypeConfig(taskType) : null;
  const isDone = status === "Done";

  return (
    <div className="p-4 pb-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <div
            ref={titleRef}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={onTitleEdit}
            onClick={handleTitleClick}
            onKeyDown={handleTitleKeyDown}
            className={cn(
              "min-w-0 flex-1 text-sm font-semibold leading-tight text-gray-200",
              isDone && !isEditing && "text-gray-400 line-through decoration-gray-600",
              isEditing &&
                "-mx-2 -my-1 cursor-text rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500/50",
              isEditing && "bg-[#2a2a2a] hover:bg-[#333333] focus:bg-[#333333]",
            )}
            data-testid={`text-tasktitle-${id}`}
          >
            {title}
          </div>
          {typeConfig && (
            <span
              className={cn(
                "shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold",
                typeConfig.className,
              )}
            >
              {typeConfig.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
