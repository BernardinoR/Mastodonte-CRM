import { memo } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { getStatusConfig, getPriorityConfig } from "@/lib/statusConfig";
import type { TaskStatus, TaskPriority } from "@/types/task";

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
        "rounded-full font-normal flex items-center gap-1",
        config.bgColor,
        config.textColor,
        config.borderColor,
        size === "sm" && "text-[10px] md:text-[11px] px-2 py-[2px]",
        size === "md" && "text-xs px-2.5 py-0.5",
        className
      )}
      data-testid={dataTestId}
    >
      {showDot && (
        <span className={cn(dotSizeClasses[dotSize], "rounded-full", config.dotColor)} />
      )}
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
        "rounded-full font-normal flex items-center gap-1",
        config.bgColor,
        config.textColor,
        config.borderColor,
        size === "sm" && "text-[10px] md:text-[11px] px-2 py-[2px]",
        size === "md" && "text-xs px-2.5 py-0.5",
        className
      )}
      data-testid={dataTestId}
    >
      {showDot && (
        <span className={cn(dotSizeClasses[dotSize], "rounded-full", config.dotColor)} />
      )}
      {label ?? status}
    </Badge>
  );
});

export const PRIORITY_OPTIONS: TaskPriority[] = ["Urgente", "Importante", "Normal", "Baixa"];
export const STATUS_OPTIONS: TaskStatus[] = ["To Do", "In Progress", "Done"];
