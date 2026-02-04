import { memo, useCallback } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { TaskStatus } from "../types/task";

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
  accentColor: string;
  isDoneColumn?: boolean;
  onAddTask?: (status: TaskStatus) => void;
  onAddTaskTop?: (status: TaskStatus) => void;
  isCompact?: boolean;
}

export const KanbanColumn = memo(function KanbanColumn({
  id,
  title,
  count,
  children,
  accentColor,
  isDoneColumn = false,
  onAddTask,
  onAddTaskTop,
  isCompact = false,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const handleAddClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onAddTask) {
        onAddTask(id as TaskStatus);
      }
    },
    [onAddTask, id],
  );

  const handleAddTopClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onAddTaskTop) {
        onAddTaskTop(id as TaskStatus);
      }
    },
    [onAddTaskTop, id],
  );

  return (
    <div ref={setNodeRef} className="flex h-full flex-col">
      <div
        className={cn(
          "w-full rounded-xl border-l-2 p-4 transition-all duration-200",
          isOver && "ring-2 ring-inset ring-accent",
        )}
        style={{
          backgroundColor: `color-mix(in srgb, ${accentColor} 3%, transparent)`,
          borderLeftColor: `color-mix(in srgb, ${accentColor} 50%, transparent)`,
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase tracking-wider text-gray-100">
              {title}
            </span>
            <span
              className="flex h-5 min-w-[20px] items-center justify-center rounded px-1.5 font-mono text-xs font-bold"
              style={{
                backgroundColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
                color: accentColor,
              }}
            >
              {count}
            </span>
          </div>
          {onAddTaskTop && (
            <button
              className="flex h-6 w-6 items-center justify-center rounded text-gray-500 transition-colors hover:bg-[#252525] hover:text-white"
              onClick={handleAddTopClick}
              data-testid={`button-add-task-top-${id}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>

        <div
          className={cn(
            "space-y-3 transition-colors duration-200",
            isOver && "bg-accent/10",
            isDoneColumn && "[&>div]:opacity-70 [&>div]:hover:opacity-100",
          )}
        >
          {children}

          {onAddTask && (
            <button
              className="flex h-8 w-full items-center justify-start gap-2 rounded-md px-3 text-xs text-gray-500 transition-colors hover:bg-[#252525] hover:text-white"
              onClick={handleAddClick}
              data-testid={`button-add-task-${id}`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Adicionar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
