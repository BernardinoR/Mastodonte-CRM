import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { CalendarIcon, User } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { format, startOfDay, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TaskStatus, TaskPriority } from "../types/task";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../lib/statusConfig";

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
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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
    <div
      className="relative rotate-2 scale-105 opacity-95"
      style={{
        willChange: "transform",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        perspective: 1000,
      }}
    >
      {selectedCount > 1 && (
        <>
          <div className="absolute inset-0 translate-x-3 translate-y-3 transform rounded-lg border border-[#404040] bg-[#1a1a1a] opacity-40" />
          <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 transform rounded-lg border border-[#383838] bg-[#222222] opacity-60" />
        </>
      )}
      <div className="relative">
        {selectedCount > 1 && (
          <div className="absolute -right-3 -top-3 z-20 rounded-full border-2 border-blue-400 bg-blue-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
            {selectedCount}
          </div>
        )}
        <Card
          className={cn(
            "cursor-grabbing border shadow-2xl",
            isOverdue && "border-l-[3px] border-l-red-900 dark:border-l-red-700",
            status === "To Do" && "border-[#363636] bg-[#262626]",
            status === "In Progress" && "border-[#344151] bg-[#243041]",
            status === "Done" && "border-[rgb(45,55,48)] bg-[rgb(35,43,38)]",
          )}
        >
          <CardHeader className="space-y-1 p-4">
            <div className="text-sm font-bold leading-tight">{title}</div>
            <Separator className="mt-2 bg-[#64635E]" />
          </CardHeader>

          <CardContent className="space-y-2 p-4 pt-0">
            <div className="flex items-center text-[10px] font-semibold text-foreground md:text-xs">
              <CalendarIcon className="mr-1.5 h-3 w-3 text-muted-foreground" />
              {formattedDate}
            </div>

            {clientName && (
              <div className="flex items-center text-[10px] text-muted-foreground md:text-xs">
                <User className="mr-1.5 h-3 w-3" />
                {clientName}
              </div>
            )}

            {priorityConfig && (
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: priorityConfig.dotColor }}
                />
                <span className="text-[10px] text-muted-foreground md:text-xs">
                  {priorityConfig.label}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: statusConfig.dotColor }}
              />
              <span className="text-[10px] text-muted-foreground md:text-xs">
                {statusConfig.label}
              </span>
            </div>

            {assignees.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:text-xs">
                  Responsáveis
                </div>
                <div className="flex -space-x-1.5">
                  {assignees.slice(0, 3).map((name, idx) => (
                    <div
                      key={idx}
                      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#262626] bg-gray-600 text-[8px] font-medium text-white"
                    >
                      {getInitials(name)}
                    </div>
                  ))}
                  {assignees.length > 3 && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#262626] bg-gray-700 text-[8px] font-medium text-white">
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
