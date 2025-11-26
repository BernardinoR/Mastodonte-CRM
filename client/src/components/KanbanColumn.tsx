import { Badge } from "@/components/ui/badge";
import { useDroppable } from "@dnd-kit/core";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
  color?: string;
  borderColor?: string;
  backgroundColor?: string;
  icon?: LucideIcon;
}

export function KanbanColumn({ id, title, count, children, color = "text-foreground", borderColor, backgroundColor, icon: Icon }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div 
      className={cn(
        "flex-1 min-w-[320px] rounded-lg transition-colors",
        borderColor && `border-2 ${borderColor}`,
        backgroundColor,
        isOver && "border-dashed",
        isOver && !borderColor && "border-2 border-accent"
      )}
    >
      <div className="flex items-center justify-between p-3 pb-2">
        <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${color}`}>
          {Icon && <Icon className="w-4 h-4" />}
          <span>{title}</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {count}
        </Badge>
      </div>
      <div 
        ref={setNodeRef}
        className={cn(
          "space-y-3 min-h-[400px] p-2 pt-0 transition-colors",
          isOver && "bg-accent/20"
        )}
      >
        {children}
      </div>
    </div>
  );
}
