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
          "space-y-3 min-h-[400px] p-2 pt-0 transition-colors duration-200",
          isOver && "bg-accent/10"
        )}
      >
        {children}
        
        {onAddTask && (
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-2 h-9"
            onClick={handleAddClick}
            data-testid={`button-add-task-${id}`}
          >
            <Plus className="w-4 h-4" />
            <span>Nova página</span>
          </Button>
        )}
      </div>
    </div>
  );
});
