import { memo, useState, useCallback } from "react";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { UI_CLASSES } from "@/lib/statusConfig";
import { PriorityBadge, StatusBadge, PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/components/ui/task-badges";
import { DateInput } from "@/components/ui/date-input";
import type { TaskStatus, TaskPriority } from "@/types/task";

interface TableBulkActionsProps {
  selectedCount: number;
  onStatusChange: (status: TaskStatus) => void;
  onPriorityChange: (priority: TaskPriority | "_none") => void;
  onDateChange: (date: Date | undefined) => void;
  onClearSelection: () => void;
}

export const TableBulkActions = memo(function TableBulkActions({
  selectedCount,
  onStatusChange,
  onPriorityChange,
  onDateChange,
  onClearSelection,
}: TableBulkActionsProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const handleStatusSelect = useCallback((status: TaskStatus) => {
    onStatusChange(status);
    setStatusOpen(false);
  }, [onStatusChange]);

  const handlePrioritySelect = useCallback((priority: TaskPriority | "_none") => {
    onPriorityChange(priority);
    setPriorityOpen(false);
  }, [onPriorityChange]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    onDateChange(date);
    setDateOpen(false);
  }, [onDateChange]);

  return (
    <div 
      className="flex items-center gap-2 px-4 h-10 bg-primary/10 border-b border-border sticky top-0 z-20" 
      data-testid="bulk-actions-bar"
    >
      <span className="text-sm font-medium text-primary" data-testid="text-selected-count">
        {selectedCount} selecionado{selectedCount > 1 ? "s" : ""}
      </span>
      <div className="flex items-center gap-1 ml-2">
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" data-testid="button-bulk-status">
              Status
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn("w-48 p-1", UI_CLASSES.popover)} side="bottom" align="start">
            {STATUS_OPTIONS.map((s) => (
              <div
                key={s}
                className={cn("px-2 py-1.5 cursor-pointer rounded-md", UI_CLASSES.dropdownItem)}
                onClick={() => handleStatusSelect(s)}
              >
                <StatusBadge status={s} />
              </div>
            ))}
          </PopoverContent>
        </Popover>
        <Popover open={priorityOpen} onOpenChange={setPriorityOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" data-testid="button-bulk-priority">
              Prioridade
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn("w-48 p-1", UI_CLASSES.popover)} side="bottom" align="start">
            {PRIORITY_OPTIONS.map((p) => (
              <div
                key={p}
                className={cn("px-2 py-1.5 cursor-pointer rounded-md", UI_CLASSES.dropdownItem)}
                onClick={() => handlePrioritySelect(p)}
              >
                <PriorityBadge priority={p} />
              </div>
            ))}
          </PopoverContent>
        </Popover>
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" data-testid="button-bulk-date">
              <CalendarIcon className="w-3 h-3 mr-1" />
              Data e Hora
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn("w-auto p-0", UI_CLASSES.popover)} side="bottom" align="start">
            <DateInput
              value=""
              onChange={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 ml-auto" 
        onClick={onClearSelection}
        data-testid="button-clear-selection"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
});
