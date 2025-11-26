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
  customIcon?: React.ReactNode;
  showDropPlaceholder?: boolean;
}

export function KanbanColumn({ id, title, count, children, color = "text-foreground", borderColor, backgroundColor, icon: Icon, customIcon, showDropPlaceholder }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div 
      className={cn(
        "flex-1 min-w-[320px] rounded-lg transition-all duration-200",
        borderColor && `border-2 ${borderColor}`,
        backgroundColor,
        isOver && "border-dashed",
        isOver && !borderColor && "border-2 border-accent"
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
        {/* Drop placeholder - animated slot for incoming card */}
        {showDropPlaceholder && (
          <div 
            className={cn(
              "h-[120px] rounded-lg border-2 border-dashed transition-all duration-300 ease-out",
              "bg-accent/5 border-accent/40",
              "animate-in fade-in-0 zoom-in-95"
            )}
          />
        )}
        {children}
      </div>
    </div>
  );
}
