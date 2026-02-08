import { useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/components/ui/tooltip";
import { getInitials } from "@/shared/components/ui/task-assignees";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useUsers } from "@/features/users";
import { useLocation } from "wouter";
import { format, startOfDay, isBefore } from "date-fns";
import { parseLocalDate } from "@/shared/lib/date-utils";
import { ptBR } from "date-fns/locale";
import { DateInput } from "@/shared/components/ui/date-input";
import { ClientSelector, AssigneeSelector } from "../task-editors";
import { PRIORITY_CONFIG } from "../../lib/statusConfig";
import { UI_CLASSES } from "../../lib/statusConfig";
import { PRIORITY_OPTIONS } from "../../types/task";
import type { TaskStatus, TaskPriority, TaskType } from "../../types/task";

type PopoverType = "date" | "priority" | "status" | "client" | "assignee" | null;

const PRIORITY_DOT_STYLES: Record<string, string> = {
  Urgente: "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]",
  Importante: "bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]",
  Normal: "bg-blue-400",
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
  isEditing: boolean;
  editedTask: {
    dueDate: string;
    clientId?: string;
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
}

export function TaskCardContent({
  id,
  clientId,
  clientName,
  priority,
  status,
  isEditing,
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
}: TaskCardContentProps) {
  const [, navigate] = useLocation();

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
  const dateValue = editedTask.dueDate ? parseLocalDate(editedTask.dueDate) : null;
  const formattedDate = dateValue ? format(dateValue, "dd MMM", { locale: ptBR }) : null;
  const isOverdue = dateValue
    ? isBefore(startOfDay(dateValue), startOfDay(new Date())) && status !== "Done"
    : false;

  // Assignee avatar stack
  const { getUserByName } = useUsers();
  const maxVisible = 2;
  const displayAssignees = stableAssignees.slice(0, maxVisible);
  const remainingCount = Math.max(0, stableAssignees.length - maxVisible);

  return (
    <div className="px-4 pb-4 pt-2">
      {/* Row 2: Client Popover + Date Popover */}
      <div className="mb-3 flex items-center gap-2">
        {/* Client: has client + not editing = navigate, otherwise = popover */}
        {clientName && !isEditing ? (
          <span
            className="cursor-pointer truncate rounded border border-[#333333] bg-[#2a2a2a] px-2 py-0.5 text-[11px] font-medium text-gray-400 transition-colors hover:bg-[#333333]"
            onClick={(e) => {
              e.stopPropagation();
              cancelClickTimeout();
              const resolvedClientId = editedTask.clientId || clientId;
              if (resolvedClientId) {
                navigate(`/clients/${resolvedClientId}`);
              }
            }}
            data-testid={`trigger-client-${id}`}
          >
            {clientName}
          </span>
        ) : (
          <Popover
            open={activePopover === "client"}
            onOpenChange={(open) => setActivePopover(open ? "client" : null)}
          >
            <PopoverTrigger asChild>
              <span
                className={cn(
                  "cursor-pointer truncate rounded border border-dashed px-2 py-0.5 text-[11px] font-medium transition-colors",
                  isEditing
                    ? cn(
                        "border-blue-500/40",
                        clientName
                          ? "bg-[#2a2a2a] text-gray-400 hover:bg-[#333333]"
                          : "text-gray-500 hover:border-blue-400/60 hover:text-gray-400",
                      )
                    : "border-[#444444] text-gray-500 hover:border-gray-400 hover:text-gray-400",
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
        )}

        {/* Date Popover */}
        <Popover
          open={activePopover === "date"}
          onOpenChange={(open) => setActivePopover(open ? "date" : null)}
        >
          <PopoverTrigger asChild>
            <span
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-1 text-[11px] transition-colors hover:text-gray-300",
                isOverdue ? "font-medium text-red-400" : "text-gray-400",
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

      {/* Row 3: Priority Popover + Avatar/Assignee Popover */}
      <div className="flex items-end justify-between">
        {/* Priority Popover */}
        <Popover
          open={activePopover === "priority"}
          onOpenChange={(open) => setActivePopover(open ? "priority" : null)}
        >
          <PopoverTrigger asChild>
            <div
              className={cn(
                "flex cursor-pointer items-center gap-2 transition-colors",
                activePopover === "priority"
                  ? "-ml-1 rounded border border-[#333333] bg-[#2a2a2a] p-1"
                  : "",
              )}
              onClick={(e) => {
                e.stopPropagation();
                cancelClickTimeout();
              }}
              data-popover-trigger
              data-testid={`trigger-priority-${id}`}
            >
              <div className={cn("h-2 w-2 shrink-0 rounded-full", priorityDotStyle)} />
              <span
                className={cn(
                  "font-jakarta text-[11px] font-medium",
                  activePopover === "priority" ? "text-gray-300" : "text-gray-400",
                )}
              >
                {priorityLabel}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-40 rounded-lg border border-[#333333] bg-[#202020] p-1 shadow-2xl"
            side="bottom"
            align="start"
            sideOffset={6}
          >
            <div className="flex flex-col">
              {PRIORITY_OPTIONS.map((option) => {
                const isSelected = priority === option;
                const dotStyle = PRIORITY_DOT_STYLES[option] || "bg-gray-500";
                return (
                  <button
                    key={option}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 font-jakarta text-xs transition-colors",
                      isSelected
                        ? "bg-[#2a2a2a] text-white"
                        : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPriorityChange(option);
                      setActivePopover(null);
                    }}
                    data-testid={`priority-option-${option}`}
                  >
                    <div className={cn("h-2 w-2 shrink-0 rounded-full", dotStyle)} />
                    <span>{option}</span>
                    {isSelected && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-1.5">
          {/* Assignee Popover */}
          <Popover
            open={activePopover === "assignee"}
            onOpenChange={(open) => setActivePopover(open ? "assignee" : null)}
          >
            <PopoverTrigger asChild>
              <div
                className="flex cursor-pointer -space-x-2"
                onClick={(e) => {
                  e.stopPropagation();
                  cancelClickTimeout();
                }}
                data-popover-trigger
                data-testid={`trigger-assignee-${id}`}
              >
                {stableAssignees.length === 0 ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded border border-dashed border-[#444444] text-[10px] font-bold text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-400">
                    +
                  </div>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex -space-x-2">
                        {displayAssignees.map((assignee, index) => {
                          const user = getUserByName(assignee);
                          const color = user?.avatarColor || "bg-gray-600";
                          const initials = user?.initials || getInitials(assignee);
                          return (
                            <div
                              key={index}
                              className={cn(
                                "relative flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold text-white ring-2 ring-[#202020] transition-colors hover:z-30",
                                color,
                              )}
                              style={{ zIndex: displayAssignees.length - index }}
                            >
                              {initials}
                            </div>
                          );
                        })}
                        {remainingCount > 0 && (
                          <div
                            className="relative flex h-6 w-6 items-center justify-center rounded border border-[#333333] bg-[#2A2A2A] text-[10px] font-bold text-gray-400 ring-2 ring-[#202020] transition-colors hover:z-30"
                            style={{ zIndex: 0 }}
                          >
                            +{remainingCount}
                          </div>
                        )}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="z-[100]">
                      {stableAssignees.join(", ")}
                    </TooltipContent>
                  </Tooltip>
                )}
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
