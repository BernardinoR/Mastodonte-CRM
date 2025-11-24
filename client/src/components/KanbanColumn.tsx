import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDroppable } from "@dnd-kit/core";

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
  color?: string;
  borderColor?: string;
}

export function KanbanColumn({ id, title, count, children, color = "text-foreground", borderColor }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div className="flex-1 min-w-[320px]">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className={`text-xs font-semibold uppercase tracking-wide ${color}`}>
          {title}
        </h2>
        <Badge variant="secondary" className="text-xs">
          {count}
        </Badge>
      </div>
      <div 
        ref={setNodeRef}
        className={`space-y-3 min-h-[400px] p-2 rounded-lg transition-colors ${
          borderColor ? `border-2 ${borderColor}` : ''
        } ${
          isOver ? `bg-accent/20 border-dashed ${!borderColor ? 'border-2 border-accent' : ''}` : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}
