import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseLocalDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { PriorityBadge, StatusBadge, PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/components/ui/task-badges";
import type { TaskPriority, TaskStatus } from "@/types/task";

interface TaskDatePopoverProps {
  id: string;
  dateValue: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDateChange: (date: Date | undefined) => void;
  onStopPropagation: () => void;
  popoverRef?: React.RefObject<HTMLDivElement>;
}

export const TaskDatePopover = memo(function TaskDatePopover({
  id,
  dateValue,
  isOpen,
  onOpenChange,
  onDateChange,
  onStopPropagation,
  popoverRef,
}: TaskDatePopoverProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onStopPropagation();
  }, [onStopPropagation]);

  const handleInteractOutside = useCallback((e: any) => {
    const originalTarget = e.detail?.originalEvent?.target as HTMLElement | null;
    const target = originalTarget || (e.target as HTMLElement);
    if (popoverRef?.current?.contains(target) || target?.closest('.rdp')) {
      e.preventDefault();
    }
  }, [popoverRef]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      onDateChange(date);
      onOpenChange(false);
    }
  }, [onDateChange, onOpenChange]);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <span 
          className="inline-flex items-center gap-1.5 font-medium cursor-pointer px-2 py-0.5 rounded-full hover:bg-gray-700/80 hover:text-foreground text-[13px]"
          onClick={handleClick}
          data-testid={`text-date-${id}`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          {format(parseLocalDate(dateValue), "dd/MM/yyyy", { locale: ptBR })}
        </span>
      </PopoverTrigger>
      <PopoverContent 
        ref={popoverRef}
        className="w-auto p-0 bg-[#1a1a1a] border-[#2a2a2a]" 
        side="bottom" 
        align="start" 
        sideOffset={6} 
        avoidCollisions={true} 
        collisionPadding={8}
        onInteractOutside={handleInteractOutside}
        onPointerDownOutside={handleInteractOutside}
        onFocusOutside={handleInteractOutside}
      >
        <DateInput
          value={dateValue}
          onChange={handleDateSelect}
          className="font-semibold"
          dataTestId={`input-date-${id}`}
          hideIcon
          commitOnInput={false}
        />
      </PopoverContent>
    </Popover>
  );
});

interface TaskPriorityPopoverProps {
  id: string;
  priority: TaskPriority | undefined;
  isEditing: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPriorityChange: (priority: TaskPriority | "_none") => void;
  onStopPropagation: () => void;
}

export const TaskPriorityPopover = memo(function TaskPriorityPopover({
  id,
  priority,
  isEditing,
  isOpen,
  onOpenChange,
  onPriorityChange,
  onStopPropagation,
}: TaskPriorityPopoverProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onStopPropagation();
  }, [onStopPropagation]);

  const handlePrioritySelect = useCallback((p: TaskPriority | "_none") => {
    onPriorityChange(p);
    onOpenChange(false);
  }, [onPriorityChange, onOpenChange]);

  if (!priority && !isEditing) return null;

  return (
    <div className={cn("flex items-center gap-1.5 text-xs md:text-sm", isEditing && "-mx-2")}>
      {priority ? (
        <div className={cn(
          "inline-flex items-center gap-1 rounded-full",
          isEditing ? "px-2 py-0.5 group/edit-priority hover:bg-gray-700/80" : ""
        )}>
          <Popover open={isOpen} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
              <div onClick={handleClick}>
                <PriorityBadge 
                  priority={priority}
                  className="cursor-pointer hover:bg-muted/50"
                  data-testid={`badge-priority-${id}`}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6} avoidCollisions={true} collisionPadding={8}>
              <div className="w-full">
                <div className="border-b border-[#2a2a2a]">
                  <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                  <div className="px-3 py-1">
                    <div 
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer bg-[#2a2a2a] rounded-md group"
                      onClick={(e) => { e.stopPropagation(); handlePrioritySelect("_none"); }}
                    >
                      <PriorityBadge priority={priority} />
                      <X className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
                <div className="pb-1">
                  {PRIORITY_OPTIONS.filter(p => p !== priority).map(p => (
                    <div
                      key={p}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                      onClick={() => handlePrioritySelect(p)}
                    >
                      <PriorityBadge priority={p} />
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {isEditing && (
            <Button
              size="icon"
              variant="ghost"
              className="h-4 w-4 text-muted-foreground hover:text-foreground hidden group-hover/edit-priority:inline-flex"
              onClick={(e) => {
                e.stopPropagation();
                handlePrioritySelect("_none");
              }}
              data-testid={`button-clear-priority-${id}`}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      ) : (
        <Popover open={isOpen} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            <span 
              className="inline-flex px-2 py-0.5 rounded-full cursor-pointer text-muted-foreground hover:text-foreground hover:bg-gray-700/80"
              onClick={handleClick}
              data-testid={`badge-priority-${id}`}
            >
              + Adicionar Prioridade
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6} avoidCollisions={true} collisionPadding={8}>
            <div className="w-full">
              <div className="px-3 py-1.5 text-xs text-gray-500">Selecionar prioridade</div>
              <div className="pb-1">
                {PRIORITY_OPTIONS.map(p => (
                  <div
                    key={p}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                    onClick={() => handlePrioritySelect(p)}
                  >
                    <PriorityBadge priority={p} />
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
});

interface TaskStatusPopoverProps {
  id: string;
  status: TaskStatus;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (status: TaskStatus) => void;
  onStopPropagation: () => void;
}

export const TaskStatusPopover = memo(function TaskStatusPopover({
  id,
  status,
  isOpen,
  onOpenChange,
  onStatusChange,
  onStopPropagation,
}: TaskStatusPopoverProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onStopPropagation();
  }, [onStopPropagation]);

  const handleStatusSelect = useCallback((s: TaskStatus) => {
    onStatusChange(s);
    onOpenChange(false);
  }, [onStatusChange, onOpenChange]);

  return (
    <div className="flex items-center gap-1.5 text-xs md:text-sm">
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <div onClick={handleClick}>
            <StatusBadge 
              status={status}
              className="cursor-pointer hover:bg-muted/50"
              data-testid={`badge-status-${id}`}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6} avoidCollisions={true} collisionPadding={8}>
          <div className="w-full">
            <div className="border-b border-[#2a2a2a]">
              <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
              <div className="px-3 py-1">
                <div className="flex items-center gap-2 px-2 py-1.5 bg-[#2a2a2a] rounded-md">
                  <StatusBadge status={status} />
                </div>
              </div>
            </div>
            <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
            <div className="pb-1">
              {STATUS_OPTIONS.filter(s => s !== status).map(s => (
                <div
                  key={s}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                  onClick={() => handleStatusSelect(s)}
                >
                  <StatusBadge status={s} />
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});
