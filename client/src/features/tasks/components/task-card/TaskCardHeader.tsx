import { useCallback, useState } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Badge } from "@/shared/components/ui/badge";
import type { TaskStatus, TaskType } from "../../types/task";
import { TASK_TYPE_OPTIONS } from "../../types/task";
import { getTaskTypeConfig, UI_CLASSES } from "../../lib/statusConfig";

interface TaskCardHeaderProps {
  id: string;
  title: string;
  status: TaskStatus;
  taskType?: TaskType;
  isEditing: boolean;
  editingTitle: string;
  onEditingTitleChange: (value: string) => void;
  onStartTitleEdit: (e: React.MouseEvent) => void;
  onSaveTitleEdit: () => void;
  onTypeChange?: (taskType: TaskType) => void;
}

export function TaskCardHeader({
  id,
  title,
  status,
  taskType = "Tarefa",
  isEditing,
  editingTitle,
  onEditingTitleChange,
  onStartTitleEdit,
  onSaveTitleEdit,
  onTypeChange,
}: TaskCardHeaderProps) {
  const [typePopoverOpen, setTypePopoverOpen] = useState(false);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSaveTitleEdit();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onSaveTitleEdit();
      }
    },
    [onSaveTitleEdit],
  );

  const handleTypeSelect = useCallback(
    (type: TaskType) => {
      onTypeChange?.(type);
      setTypePopoverOpen(false);
    },
    [onTypeChange],
  );

  const typeConfig = getTaskTypeConfig(taskType);
  const isDone = status === "Done";

  return (
    <div className="p-4 pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="group/title min-w-0 flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => onEditingTitleChange(e.target.value)}
              onBlur={onSaveTitleEdit}
              onKeyDown={handleTitleKeyDown}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="w-full border-b border-[#2eaadc] bg-transparent text-sm font-semibold leading-snug text-gray-200 placeholder:text-muted-foreground focus:outline-none"
              data-testid={`input-tasktitle-${id}`}
            />
          ) : (
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  "text-sm font-semibold leading-snug text-gray-200",
                  isDone && "text-gray-400 line-through decoration-gray-600",
                )}
                data-testid={`text-tasktitle-${id}`}
              >
                {title}
              </h3>
              <button
                onClick={onStartTitleEdit}
                className="rounded p-1 opacity-0 transition-all hover:bg-[#3a3a3a] group-hover/title:opacity-100"
                data-testid={`button-edit-tasktitle-${id}`}
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          )}
        </div>

        <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
          <PopoverTrigger asChild data-popover-trigger>
            <div
              className="inline-block shrink-0 cursor-pointer"
              data-testid={`cell-task-type-${id}`}
            >
              <Badge
                className={cn(
                  "cursor-pointer text-[10px] font-semibold transition-opacity hover:opacity-80",
                  typeConfig.className,
                )}
              >
                {typeConfig.label}
              </Badge>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className={`w-56 p-0 ${UI_CLASSES.popover}`}
            side="bottom"
            align="end"
            sideOffset={6}
          >
            <div className="w-full">
              <div className={`border-b ${UI_CLASSES.border}`}>
                <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                <div className="px-3 py-1">
                  <div
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${UI_CLASSES.selectedItem}`}
                  >
                    <Badge className={cn("text-xs", typeConfig.className)}>
                      {typeConfig.label}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
              <div className="pb-1">
                {TASK_TYPE_OPTIONS.filter((t) => t !== taskType).map((t) => {
                  const config = getTaskTypeConfig(t);
                  return (
                    <div
                      key={t}
                      className={UI_CLASSES.dropdownItem}
                      onClick={() => handleTypeSelect(t)}
                      data-testid={`option-task-type-${id}-${t}`}
                    >
                      <Badge className={cn("text-xs", config.className)}>{config.label}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
