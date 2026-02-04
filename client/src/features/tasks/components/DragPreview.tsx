import { memo } from "react";
import { cn } from "@/shared/lib/utils";
import { format, startOfDay, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TaskStatus, TaskPriority, TaskType } from "../types/task";
import { PRIORITY_CONFIG, getTaskTypeConfig } from "../lib/statusConfig";
import { getInitials } from "@/shared/components/ui/task-assignees";

interface DragPreviewProps {
  id: string;
  title: string;
  clientName?: string;
  priority?: TaskPriority;
  taskType?: TaskType;
  status: TaskStatus;
  assignees: string[];
  dueDate: Date;
  selectedCount?: number;
}

const PRIORITY_DOT_STYLES: Record<string, string> = {
  Urgente: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]",
  Importante: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]",
  Normal: "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]",
  Baixa: "bg-gray-500",
};

export const DragPreview = memo(function DragPreview({
  title,
  clientName,
  priority,
  taskType,
  status,
  assignees,
  dueDate,
  selectedCount = 0,
}: DragPreviewProps) {
  const today = startOfDay(new Date());
  const isOverdue = isBefore(startOfDay(dueDate), today) && status !== "Done";
  const formattedDate = format(dueDate, "dd MMM", { locale: ptBR });

  const priorityConfig = priority ? PRIORITY_CONFIG[priority] : null;
  const priorityDotStyle = priority
    ? PRIORITY_DOT_STYLES[priority] || "bg-gray-500"
    : "bg-gray-500";
  const typeConfig = taskType ? getTaskTypeConfig(taskType) : null;

  const firstAssignee = assignees[0];
  const assigneeInitials = firstAssignee ? getInitials(firstAssignee) : null;

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
        <div
          className={cn(
            "cursor-grabbing rounded-lg border border-[#333333] bg-[#202020] p-4 shadow-2xl",
            isOverdue && "border-l-[3px] border-l-red-700",
          )}
        >
          {/* Row 1: Title + Type badge */}
          <div className="mb-2.5 flex items-start gap-2">
            <div className="min-w-0 flex-1 text-sm font-semibold leading-tight text-gray-200">
              {title}
            </div>
            {typeConfig && (
              <span
                className={cn(
                  "shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold",
                  typeConfig.className,
                )}
              >
                {typeConfig.label}
              </span>
            )}
          </div>

          {/* Row 2: Client + Date */}
          <div className="mb-2.5 flex items-center gap-2">
            {clientName && (
              <span className="truncate rounded border border-[#333333] bg-[#2a2a2a] px-2 py-0.5 text-[10px] text-gray-400">
                {clientName}
              </span>
            )}
            <span
              className={cn(
                "flex shrink-0 items-center gap-1 text-[11px]",
                isOverdue ? "text-red-400" : "text-gray-500",
              )}
            >
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {formattedDate}
            </span>
          </div>

          {/* Row 3: Priority + Avatar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className={cn("h-2 w-2 shrink-0 rounded-full", priorityDotStyle)} />
              <span className="text-[11px] text-gray-400">{priorityConfig?.label || "Normal"}</span>
            </div>
            {assigneeInitials && (
              <div className="flex h-6 w-6 items-center justify-center rounded border border-[#333333] bg-[#333] text-[10px] font-bold text-gray-300">
                {assigneeInitials}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
