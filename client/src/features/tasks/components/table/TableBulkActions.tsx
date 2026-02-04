import { memo, useState, useCallback } from "react";
import { CalendarIcon, X, Users, Building2, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { DateInput } from "@/shared/components/ui/date-input";
import { cn } from "@/shared/lib/utils";
import { UI_CLASSES } from "../../lib/statusConfig";
import {
  PriorityBadge,
  StatusBadge,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "@/shared/components/ui/task-badges";
import { ClientSelector, AssigneeSelector } from "../task-editors";
import type { TaskStatus, TaskPriority } from "../../types/task";

interface TableBulkActionsProps {
  selectedCount: number;
  selectedAssignees: string[];
  onStatusChange: (status: TaskStatus) => void;
  onPriorityChange: (priority: TaskPriority | "_none") => void;
  onDateChange: (date: Date | undefined) => void;
  onClientChange: (clientName: string | undefined) => void;
  onAddAssignee: (assignee: string) => void;
  onRemoveAssignee: (assignee: string) => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export const TableBulkActions = memo(function TableBulkActions({
  selectedCount,
  selectedAssignees,
  onStatusChange,
  onPriorityChange,
  onDateChange,
  onClientChange,
  onAddAssignee,
  onRemoveAssignee,
  onDelete,
  onClearSelection,
}: TableBulkActionsProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [assigneesOpen, setAssigneesOpen] = useState(false);

  const handleStatusSelect = useCallback(
    (status: TaskStatus) => {
      onStatusChange(status);
      setStatusOpen(false);
    },
    [onStatusChange],
  );

  const handlePrioritySelect = useCallback(
    (priority: TaskPriority | "_none") => {
      onPriorityChange(priority);
      setPriorityOpen(false);
    },
    [onPriorityChange],
  );

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      onDateChange(date);
      setDateOpen(false);
    },
    [onDateChange],
  );

  const handleClientSelect = useCallback(
    (client: string) => {
      onClientChange(client === "_none" ? undefined : client);
      setClientOpen(false);
    },
    [onClientChange],
  );

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-background/95 px-5 py-2.5 shadow-lg backdrop-blur-sm"
      data-testid="bulk-actions-bar"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <span
        className="whitespace-nowrap text-sm font-medium text-primary"
        data-testid="text-selected-count"
      >
        {selectedCount} selecionado{selectedCount > 1 ? "s" : ""}
      </span>

      <div className="h-5 w-px bg-border" />

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
          <PopoverContent
            className={cn("z-[60] w-48 p-1", UI_CLASSES.popover)}
            side="top"
            align="start"
          >
            {STATUS_OPTIONS.map((s) => (
              <div
                key={s}
                className={cn("cursor-pointer rounded-md px-2 py-1.5", UI_CLASSES.dropdownItem)}
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
          <PopoverContent
            className={cn("z-[60] w-48 p-1", UI_CLASSES.popover)}
            side="top"
            align="start"
          >
            {PRIORITY_OPTIONS.map((p) => (
              <div
                key={p}
                className={cn("cursor-pointer rounded-md px-2 py-1.5", UI_CLASSES.dropdownItem)}
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
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              Data
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className={cn("z-[60] w-auto p-0", UI_CLASSES.popover)}
            side="top"
            align="start"
          >
            <DateInput
              value={new Date()}
              onChange={(date) => {
                if (date) {
                  handleDateSelect(date);
                }
              }}
              hideIcon={true}
              commitOnInput={false}
              dataTestId="bulk-date-input"
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
              <Building2 className="mr-1.5 h-3.5 w-3.5" />
              Cliente
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className={cn("z-[60] w-80 p-0", UI_CLASSES.popover)}
            side="top"
            align="start"
          >
            <ClientSelector selectedClient={null} onSelect={handleClientSelect} />
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
              <Users className="mr-1.5 h-3.5 w-3.5" />
              Responsáveis
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className={cn("z-[60] w-64 p-0", UI_CLASSES.popover)}
            side="top"
            align="start"
          >
            <AssigneeSelector
              selectedAssignees={selectedAssignees}
              onSelect={onAddAssignee}
              onRemove={onRemoveAssignee}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="h-5 w-px bg-border" />

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={onDelete}
        data-testid="button-bulk-delete"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
        onClick={onClearSelection}
        data-testid="button-clear-selection"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
});
