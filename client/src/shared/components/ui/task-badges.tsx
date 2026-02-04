import { memo } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { getStatusConfig, getPriorityConfig } from "@features/tasks/lib/statusConfig";
import type { TaskStatus, TaskPriority } from "@features/tasks";

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
  showDot?: boolean;
  size?: "sm" | "md";
  dotSize?: "sm" | "md" | "lg";
  "data-testid"?: string;
}

export const PriorityBadge = memo(function PriorityBadge({
  priority,
  className,
  showDot = true,
  size = "sm",
  dotSize = "sm",
  "data-testid": dataTestId,
}: PriorityBadgeProps) {
  const config = getPriorityConfig(priority);

  const dotSizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1 rounded-full font-normal",
        config.bgColor,
        config.textColor,
        config.borderColor,
        size === "sm" && "px-2 py-[2px] text-[10px] md:text-[11px]",
        size === "md" && "px-2.5 py-0.5 text-xs",
        className,
      )}
      data-testid={dataTestId}
    >
      {showDot && <span className={cn(dotSizeClasses[dotSize], "rounded-full", config.dotColor)} />}
      {priority}
    </Badge>
  );
});

interface StatusBadgeProps {
  status: TaskStatus;
  label?: string;
  className?: string;
  showDot?: boolean;
  size?: "sm" | "md";
  dotSize?: "sm" | "md" | "lg";
  "data-testid"?: string;
}

export const StatusBadge = memo(function StatusBadge({
  status,
  label,
  className,
  showDot = true,
  size = "sm",
  dotSize = "sm",
  "data-testid": dataTestId,
}: StatusBadgeProps) {
  const config = getStatusConfig(status);

  const dotSizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1 rounded-full font-normal",
        config.bgColor,
        config.textColor,
        config.borderColor,
        size === "sm" && "px-2 py-[2px] text-[10px] md:text-[11px]",
        size === "md" && "px-2.5 py-0.5 text-xs",
        className,
      )}
      data-testid={dataTestId}
    >
      {showDot && <span className={cn(dotSizeClasses[dotSize], "rounded-full", config.dotColor)} />}
      {label ?? status}
    </Badge>
  );
});

export const PRIORITY_OPTIONS: TaskPriority[] = ["Urgente", "Importante", "Normal", "Baixa"];
export const STATUS_OPTIONS: TaskStatus[] = ["To Do", "In Progress", "Done"];
