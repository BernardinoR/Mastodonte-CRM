import { memo, useCallback } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useDroppable } from "@dnd-kit/core";
import { LucideIcon, Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { TaskStatus } from "../types/task";

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
  color?: string;
  borderColor?: string;
  backgroundColor?: string;
  icon?: LucideIcon;
  customIcon?: React.ReactNode;
  onAddTask?: (status: TaskStatus) => void;
  onAddTaskTop?: (status: TaskStatus) => void;
  addButtonTextColor?: string;
  addButtonHoverBgColor?: string;
  isCompact?: boolean;
}

export const KanbanColumn = memo(function KanbanColumn({ 
  id, 
  title, 
  count, 
  children, 
  color = "text-foreground", 
  borderColor, 
  backgroundColor, 
  icon: Icon, 
  customIcon,
  onAddTask,
  onAddTaskTop,
  addButtonTextColor,
  addButtonHoverBgColor,
  isCompact = false,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const handleAddClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddTask) {
      onAddTask(id as TaskStatus);
    }
  }, [onAddTask, id]);

  const handleAddTopClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddTaskTop) {
      onAddTaskTop(id as TaskStatus);
    }
  }, [onAddTaskTop, id]);

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex-1 flex flex-col",
        isCompact ? "min-w-[200px] max-w-[300px]" : "min-w-[200px] max-w-[340px]"
      )}
    >
      <div 
        className={cn(
          "w-full rounded-lg transition-all duration-200",
          borderColor && `border-2 ${borderColor}`,
          backgroundColor,
          isOver && "ring-2 ring-accent ring-inset"
        )}
      >
        <div className="flex items-center justify-between p-3 pb-2">
          <div className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${color}`}>
            {customIcon ? customIcon : Icon && <Icon className="w-4 h-4" />}
            <span>{title}</span>
            <Badge variant="secondary" className="text-xs ml-1">
              {count}
            </Badge>
          </div>
          {onAddTaskTop && (
            <button
              className="flex items-center justify-center w-6 h-6 rounded transition-colors"
              style={{
                color: addButtonTextColor,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                if (addButtonHoverBgColor) {
                  e.currentTarget.style.backgroundColor = addButtonHoverBgColor;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={handleAddTopClick}
              data-testid={`button-add-task-top-${id}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        <div 
          className={cn(
            "space-y-3 p-2 pt-0 pb-3 transition-colors duration-200",
            isOver && "bg-accent/10"
          )}
        >
          {children}
          
          {onAddTask && (
            <button
              className="w-full flex items-center justify-start gap-2 h-9 px-3 rounded-md transition-colors"
              style={{
                color: addButtonTextColor,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                if (addButtonHoverBgColor) {
                  e.currentTarget.style.backgroundColor = addButtonHoverBgColor;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={handleAddClick}
              data-testid={`button-add-task-${id}`}
            >
              <Plus className="w-4 h-4" />
              <span>Nova task</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
