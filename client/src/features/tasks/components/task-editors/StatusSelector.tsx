import { Badge } from "@/shared/components/ui/badge";
import { Circle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { TaskStatus, STATUS_OPTIONS } from "../../types/task";
import { STATUS_CONFIG } from "../../lib/statusConfig";

interface StatusSelectorProps {
  currentStatus: TaskStatus;
  onSelect: (status: TaskStatus) => void;
  isBulk?: boolean;
}

export function StatusSelector({ currentStatus, onSelect, isBulk = false }: StatusSelectorProps) {
  return (
    <div className="py-1">
      {isBulk && <div className="px-3 py-1.5 text-xs text-gray-500">Definir status para todos</div>}
      {STATUS_OPTIONS.map((status) => {
        const config = STATUS_CONFIG[status];
        const isSelected = status === currentStatus;

        return (
          <div
            key={status}
            className={cn(
              "flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors",
              isSelected ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(status);
            }}
            data-testid={`option-status-${status.toLowerCase().replace(" ", "-")}`}
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
              {config.labelPt}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
