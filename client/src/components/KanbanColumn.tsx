import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KanbanColumnProps {
  title: string;
  count: number;
  children: React.ReactNode;
  color?: string;
}

export function KanbanColumn({ title, count, children, color = "text-foreground" }: KanbanColumnProps) {
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
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
