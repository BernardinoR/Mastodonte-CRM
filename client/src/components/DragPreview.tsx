import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfDay, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TaskStatus, TaskPriority } from "@/types/task";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/statusConfig";

interface DragPreviewProps {
  id: string;
  title: string;
  clientName?: string;
  priority?: TaskPriority;
  status: TaskStatus;
  assignees: string[];
  dueDate: Date;
  selectedCount?: number;
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const DragPreview = memo(function DragPreview({
  id,
  title,
  clientName,
  priority,
  status,
  assignees,
  dueDate,
  selectedCount = 0,
}: DragPreviewProps) {
  const today = startOfDay(new Date());
  const isOverdue = isBefore(startOfDay(dueDate), today);
  const formattedDate = format(dueDate, "dd MMM yyyy", { locale: ptBR });
  
  const statusConfig = STATUS_CONFIG[status];
  const priorityConfig = priority ? PRIORITY_CONFIG[priority] : null;
  
  return (
    <div className="opacity-95 rotate-2 scale-105 relative" style={{ willChange: 'transform' }}>
      {selectedCount > 1 && (
        <>
          <div className="absolute inset-0 transform translate-x-3 translate-y-3 rounded-lg bg-[#1a1a1a] border border-[#404040] opacity-40" />
          <div className="absolute inset-0 transform translate-x-1.5 translate-y-1.5 rounded-lg bg-[#222222] border border-[#383838] opacity-60" />
        </>
      )}
      <div className="relative">
        {selectedCount > 1 && (
          <div className="absolute -top-3 -right-3 z-20 bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg border-2 border-blue-400">
            {selectedCount}
          </div>
        )}
        <Card
          className={cn(
            "cursor-grabbing border shadow-2xl",
            isOverdue && "border-l-[3px] border-l-red-900 dark:border-l-red-700",
            status === "To Do" && "bg-[#262626] border-[#363636]",
            status === "In Progress" && "bg-[#243041] border-[#344151]",
            status === "Done" && "bg-[rgb(35,43,38)] border-[rgb(45,55,48)]"
          )}
        >
          <CardHeader className="p-4 space-y-1">
            <div className="font-bold text-sm leading-tight">
              {title}
            </div>
            <Separator className="mt-2 bg-[#64635E]" />
          </CardHeader>

          <CardContent className="p-4 pt-0 space-y-2">
            <div className="flex items-center text-[10px] md:text-xs font-semibold text-foreground">
              <CalendarIcon className="w-3 h-3 mr-1.5 text-muted-foreground" />
              {formattedDate}
            </div>
            
            {clientName && (
              <div className="flex items-center text-[10px] md:text-xs text-muted-foreground">
                <User className="w-3 h-3 mr-1.5" />
                {clientName}
              </div>
            )}
            
            {priorityConfig && (
              <div className="flex items-center gap-1.5">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: priorityConfig.dotColor }}
                />
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  {priorityConfig.label}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: statusConfig.dotColor }}
              />
              <span className="text-[10px] md:text-xs text-muted-foreground">
                {statusConfig.label}
              </span>
            </div>
            
            {assignees.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Responsáveis
                </div>
                <div className="flex -space-x-1.5">
                  {assignees.slice(0, 3).map((name, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded-full bg-gray-600 border-2 border-[#262626] flex items-center justify-center text-[8px] font-medium text-white"
                    >
                      {getInitials(name)}
                    </div>
                  ))}
                  {assignees.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-[#262626] flex items-center justify-center text-[8px] font-medium text-white">
                      +{assignees.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
