import { useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { getInitials } from "@/shared/components/ui/task-assignees";
import { Pencil } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { format, startOfDay, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateInput } from "@/shared/components/ui/date-input";
import { ClientSelector, AssigneeSelector } from "../task-editors";
import { PrioritySelector } from "../task-editors";
import { PRIORITY_CONFIG } from "../../lib/statusConfig";
import { UI_CLASSES } from "../../lib/statusConfig";
import type { TaskStatus, TaskPriority, TaskType } from "../../types/task";

type PopoverType = "date" | "priority" | "status" | "client" | "assignee" | null;

const PRIORITY_DOT_STYLES: Record<string, string> = {
  Urgente: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]",
  Importante: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]",
  Normal: "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]",
  Baixa: "bg-gray-500",
};

interface TaskCardContentProps {
  id: string;
  title: string;
  clientId?: string;
  clientName?: string;
  priority?: TaskPriority;
  taskType?: TaskType;
  status: TaskStatus;
  editedTask: {
    dueDate: string;
    clientName?: string;
    assignees: string[];
  };
  stableAssignees: string[];
  activePopover: PopoverType;
  setActivePopover: (popover: PopoverType) => void;
  datePopoverContentRef: React.RefObject<HTMLDivElement>;
  clickTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  onDateChange: (date: Date | undefined) => void;
  onClientChange: (clientId: string, clientName: string) => void;
  onPriorityChange: (value: string) => void;
  onAddAssignee: (assignee: string) => void;
  onRemoveAssignee: (assignee: string) => void;
  onEditClick: (e: React.MouseEvent) => void;
}

export function TaskCardContent({
  id,
  clientId,
  clientName,
  priority,
  status,
  editedTask,
  stableAssignees,
  activePopover,
  setActivePopover,
  datePopoverContentRef,
  clickTimeoutRef,
  onDateChange,
  onClientChange,
  onPriorityChange,
  onAddAssignee,
  onRemoveAssignee,
  onEditClick,
}: TaskCardContentProps) {
  const cancelClickTimeout = useCallback(() => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
  }, [clickTimeoutRef]);

  const priorityDotStyle = priority
    ? PRIORITY_DOT_STYLES[priority] || "bg-gray-500"
    : "bg-gray-500";
  const priorityLabel = priority ? PRIORITY_CONFIG[priority]?.label || priority : "Normal";

  // Parse date for display
  const dateValue = editedTask.dueDate ? new Date(editedTask.dueDate) : null;
  const formattedDate = dateValue ? format(dateValue, "dd MMM", { locale: ptBR }) : null;
  const isOverdue = dateValue
    ? isBefore(startOfDay(dateValue), startOfDay(new Date())) && status !== "Done"
    : false;

  // Get first assignee initials for avatar
  const firstAssignee = stableAssignees[0];
  const assigneeInitials = firstAssignee ? getInitials(firstAssignee) : null;

  return (
    <div className="space-y-2.5 px-4 pb-4 pt-3">
      {/* Row 2: Client Popover + Date Popover */}
      <div className="flex items-center gap-2">
        {/* Client Popover */}
        <Popover
          open={activePopover === "client"}
          onOpenChange={(open) => setActivePopover(open ? "client" : null)}
        >
          <PopoverTrigger asChild>
            <span
              className={cn(
                "cursor-pointer truncate rounded border px-2 py-0.5 text-[10px] transition-colors",
                clientName
                  ? "border-[#333333] bg-[#2a2a2a] text-gray-400 hover:bg-[#333]"
                  : "border-dashed border-[#444] text-gray-500 hover:border-gray-400 hover:text-gray-400",
              )}
              onClick={(e) => {
                e.stopPropagation();
                cancelClickTimeout();
              }}
              data-popover-trigger
              data-testid={`trigger-client-${id}`}
            >
              {clientName || "+ Cliente"}
            </span>
          </PopoverTrigger>
          <PopoverContent
            className={cn("w-80 p-0", UI_CLASSES.popover)}
            side="bottom"
            align="start"
            sideOffset={6}
            avoidCollisions={true}
            collisionPadding={8}
          >
            <ClientSelector selectedClient={clientName || null} onSelect={onClientChange} />
          </PopoverContent>
        </Popover>

        {/* Date Popover */}
        <Popover
          open={activePopover === "date"}
          onOpenChange={(open) => setActivePopover(open ? "date" : null)}
        >
          <PopoverTrigger asChild>
            <span
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-1 text-[11px] transition-colors hover:text-gray-300",
                isOverdue ? "text-red-400" : "text-gray-500",
              )}
              onClick={(e) => {
                e.stopPropagation();
                cancelClickTimeout();
              }}
              data-popover-trigger
              data-testid={`trigger-date-${id}`}
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
              {formattedDate || "Sem data"}
            </span>
          </PopoverTrigger>
          <PopoverContent
            ref={datePopoverContentRef}
            className={cn("w-auto p-0", UI_CLASSES.popover)}
            side="bottom"
            align="start"
            sideOffset={6}
            avoidCollisions={true}
            collisionPadding={8}
          >
            <DateInput
              value={editedTask.dueDate}
              onChange={onDateChange}
              hideIcon
              dataTestId={`date-input-${id}`}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Row 3: Priority Popover + Pencil + Avatar/Assignee Popover */}
      <div className="flex items-center justify-between">
        {/* Priority Popover */}
        <Popover
          open={activePopover === "priority"}
          onOpenChange={(open) => setActivePopover(open ? "priority" : null)}
        >
          <PopoverTrigger asChild>
            <div
              className="flex cursor-pointer items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors hover:bg-gray-700/50"
              onClick={(e) => {
                e.stopPropagation();
                cancelClickTimeout();
              }}
              data-popover-trigger
              data-testid={`trigger-priority-${id}`}
            >
              <div className={cn("h-2 w-2 shrink-0 rounded-full", priorityDotStyle)} />
              <span className="text-[11px] text-gray-400">{priorityLabel}</span>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className={cn("w-48 p-0", UI_CLASSES.popover)}
            side="bottom"
            align="start"
            sideOffset={6}
          >
            <PrioritySelector currentPriority={priority} onSelect={(p) => onPriorityChange(p)} />
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-1.5">
          {/* Pencil - visible on hover */}
          <button
            className="flex h-6 w-6 items-center justify-center rounded text-gray-500 opacity-0 transition-all hover:bg-[#333] hover:text-gray-300 group-hover/task-card:opacity-100"
            onClick={onEditClick}
            data-popover-trigger
            data-testid={`button-edit-${id}`}
          >
            <Pencil className="h-3 w-3" />
          </button>

          {/* Assignee Popover */}
          <Popover
            open={activePopover === "assignee"}
            onOpenChange={(open) => setActivePopover(open ? "assignee" : null)}
          >
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "flex h-6 w-6 cursor-pointer items-center justify-center rounded border text-[10px] font-bold transition-colors",
                  assigneeInitials
                    ? "border-[#333333] bg-[#333] text-gray-300 hover:border-gray-500"
                    : "border-dashed border-[#444] text-gray-500 hover:border-gray-400 hover:text-gray-400",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  cancelClickTimeout();
                }}
                data-popover-trigger
                data-testid={`trigger-assignee-${id}`}
              >
                {assigneeInitials || "+"}
              </div>
            </PopoverTrigger>
            <PopoverContent
              className={cn("w-80 p-0", UI_CLASSES.popover)}
              side="bottom"
              align="end"
              sideOffset={6}
              avoidCollisions={true}
              collisionPadding={8}
            >
              <AssigneeSelector
                selectedAssignees={editedTask.assignees}
                onSelect={onAddAssignee}
                onRemove={onRemoveAssignee}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
