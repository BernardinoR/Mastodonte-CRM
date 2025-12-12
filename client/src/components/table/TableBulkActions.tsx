import { memo, useState, useCallback } from "react";
import { CalendarIcon, X, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { UI_CLASSES } from "@/lib/statusConfig";
import { PriorityBadge, StatusBadge, PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/components/ui/task-badges";
import { DateInput } from "@/components/ui/date-input";
import { ClientSelector, AssigneeSelector } from "@/components/task-editors";
import type { TaskStatus, TaskPriority } from "@/types/task";

interface TableBulkActionsProps {
  selectedCount: number;
  onStatusChange: (status: TaskStatus) => void;
  onPriorityChange: (priority: TaskPriority | "_none") => void;
  onDateChange: (date: Date | undefined) => void;
  onClientChange: (clientName: string | undefined) => void;
  onAssigneesChange: (assignees: string[]) => void;
  onClearSelection: () => void;
}

export const TableBulkActions = memo(function TableBulkActions({
  selectedCount,
  onStatusChange,
  onPriorityChange,
  onDateChange,
  onClientChange,
  onAssigneesChange,
  onClearSelection,
}: TableBulkActionsProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [assigneesOpen, setAssigneesOpen] = useState(false);

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

  const handleClientSelect = useCallback((client: string) => {
    onClientChange(client === "_none" ? undefined : client);
    setClientOpen(false);
  }, [onClientChange]);

  const handleAssigneeAdd = useCallback((assignee: string) => {
    onAssigneesChange([assignee]);
  }, [onAssigneesChange]);

  return (
    <div 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-lg z-50" 
      data-testid="bulk-actions-bar"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <span className="text-sm font-medium text-primary whitespace-nowrap" data-testid="text-selected-count">
        {selectedCount} selecionado{selectedCount > 1 ? "s" : ""}
      </span>
      
      <div className="w-px h-5 bg-border" />
      
      <div className="flex items-center gap-1">
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-sm" 
              data-testid="button-bulk-status"
              onPointerDown={(e) => e.stopPropagation()}
            >
              Status
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn("w-48 p-1 z-[60]", UI_CLASSES.popover)} side="top" align="start">
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-sm" 
              data-testid="button-bulk-priority"
              onPointerDown={(e) => e.stopPropagation()}
            >
              Prioridade
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn("w-48 p-1 z-[60]", UI_CLASSES.popover)} side="top" align="start">
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-sm" 
              data-testid="button-bulk-date"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
              Data
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn("w-auto p-0 z-[60]", UI_CLASSES.popover)} side="top" align="start">
            <DateInput
              value=""
              onChange={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
        
        <Popover open={clientOpen} onOpenChange={setClientOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-sm" 
              data-testid="button-bulk-client"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              Cliente
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn("w-80 p-0 z-[60]", UI_CLASSES.popover)} side="top" align="start">
            <ClientSelector 
              selectedClient={null}
              onSelect={handleClientSelect}
            />
          </PopoverContent>
        </Popover>
        
        <Popover open={assigneesOpen} onOpenChange={setAssigneesOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-sm" 
              data-testid="button-bulk-assignees"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Responsáveis
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn("w-64 p-0 z-[60]", UI_CLASSES.popover)} side="top" align="start">
            <AssigneeSelector
              selectedAssignees={[]}
              onSelect={handleAssigneeAdd}
              onRemove={() => {}}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="w-px h-5 bg-border" />
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7 text-muted-foreground hover:text-foreground" 
        onClick={onClearSelection}
        data-testid="button-clear-selection"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
});
