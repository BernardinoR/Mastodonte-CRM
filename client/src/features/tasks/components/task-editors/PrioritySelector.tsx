import { Badge } from "@/shared/components/ui/badge";
import { Circle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { TaskPriority, PRIORITY_OPTIONS } from "../../types/task";
import { PRIORITY_CONFIG } from "../../lib/statusConfig";

interface PrioritySelectorProps {
  currentPriority: TaskPriority | undefined;
  onSelect: (priority: TaskPriority) => void;
  isBulk?: boolean;
}

export function PrioritySelector({
  currentPriority,
  onSelect,
  isBulk = false,
}: PrioritySelectorProps) {
  return (
    <div className="py-1">
      {isBulk && (
        <div className="px-3 py-1.5 text-xs text-gray-500">Definir prioridade para todos</div>
      )}
      {PRIORITY_OPTIONS.map((priority) => {
        const config = PRIORITY_CONFIG[priority];
        const isSelected = priority === currentPriority;

        return (
          <div
            key={priority}
            className={cn(
              "flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors",
              isSelected ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(priority);
            }}
            data-testid={`option-priority-${priority.toLowerCase()}`}
          >
            <Badge
              variant="outline"
              className={cn(
                "flex h-5 items-center gap-1 border px-1.5 py-0 text-[10px] font-normal",
                config.bgColor,
                config.borderColor,
                config.textColor,
              )}
            >
              <Circle className={cn("h-1.5 w-1.5 fill-current", config.dotColor)} />
              {config.label}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
