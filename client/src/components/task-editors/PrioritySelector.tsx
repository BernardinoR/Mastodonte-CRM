import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskPriority, PRIORITY_OPTIONS } from "@/types/task";
import { PRIORITY_CONFIG } from "@/lib/statusConfig";

interface PrioritySelectorProps {
  currentPriority: TaskPriority | undefined;
  onSelect: (priority: TaskPriority) => void;
  isBulk?: boolean;
}

export function PrioritySelector({ currentPriority, onSelect, isBulk = false }: PrioritySelectorProps) {
  return (
    <div className="py-1">
      {isBulk && (
        <div className="px-3 py-1.5 text-xs text-gray-500">
          Definir prioridade para todos
        </div>
      )}
      {PRIORITY_OPTIONS.map((priority) => {
        const config = PRIORITY_CONFIG[priority];
        const isSelected = priority === currentPriority;
        
        return (
          <div
            key={priority}
            className={cn(
              "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
              isSelected ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]"
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
                "text-[10px] px-1.5 py-0 h-5 border font-normal flex items-center gap-1",
                config.bgColor,
                config.borderColor,
                config.textColor
              )}
            >
              <Circle className={cn("w-1.5 h-1.5 fill-current", config.dotColor)} />
              {config.label}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
