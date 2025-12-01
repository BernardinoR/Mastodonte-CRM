import { memo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDroppable } from "@dnd-kit/core";
import { LucideIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types/task";

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
  addButtonBgColor?: string;
  addButtonHoverBgColor?: string;
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
  addButtonBgColor,
  addButtonHoverBgColor,
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

  return (
    <div 
      className={cn(
        "w-[340px] shrink-0 rounded-lg transition-all duration-200",
        borderColor && `border-2 ${borderColor}`,
        backgroundColor,
        isOver && "border-dashed border-accent"
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
      </div>
      <div 
        ref={setNodeRef}
        className={cn(
          "space-y-3 p-2 pt-0 pb-3 transition-colors duration-200",
          isOver && "bg-accent/10"
        )}
      >
        {children}
        
        {onAddTask && (
          <button
            className="w-full flex items-center justify-start text-muted-foreground hover:text-foreground gap-2 h-9 px-3 rounded-md transition-colors"
            style={{
              backgroundColor: addButtonBgColor,
              ...(addButtonHoverBgColor && { '--hover-bg': addButtonHoverBgColor } as React.CSSProperties),
            }}
            onMouseEnter={(e) => {
              if (addButtonHoverBgColor) {
                e.currentTarget.style.backgroundColor = addButtonHoverBgColor;
              }
            }}
            onMouseLeave={(e) => {
              if (addButtonBgColor) {
                e.currentTarget.style.backgroundColor = addButtonBgColor;
              }
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
  );
});
