import { memo, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select";
import { UI_CLASSES } from "@/lib/statusConfig";
import { StatusBadge, PriorityBadge } from "@/components/ui/task-badges";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  STATUS_OPTIONS, 
  PRIORITY_OPTIONS, 
  type TaskStatus, 
  type TaskPriority 
} from "@/types/task";
import { DateRangeFilterContent, type DateFilterValue, formatDateFilterLabel } from "./DateRangeFilterContent";

export type FilterType = "date" | "status" | "priority" | "task" | "assignee" | "client";

export interface ActiveFilter {
  id: string;
  type: FilterType;
  value: string | string[] | DateFilterValue;
}

export { formatDateFilterLabel };
export type { DateFilterValue };

interface FilterPopoverContentProps {
  filter: ActiveFilter;
  onUpdateFilter: (id: string, value: string | string[] | DateFilterValue) => void;
  availableAssignees: string[];
  availableClients: string[];
}

const StatusFilterContent = memo(function StatusFilterContent({
  selectedValues,
  onToggle,
}: {
  selectedValues: string[];
  onToggle: (status: TaskStatus) => void;
}) {
  const selectedStatuses = useMemo(() => 
    STATUS_OPTIONS.filter(s => selectedValues.includes(s)),
    [selectedValues]
  );
  
  const unselectedStatuses = useMemo(() => 
    STATUS_OPTIONS.filter(s => !selectedValues.includes(s)),
    [selectedValues]
  );

  return (
    <div className="w-full">
      {selectedStatuses.length > 0 && (
        <>
          <div className={cn("border-b", UI_CLASSES.border)}>
            <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
            <div className="px-2 pb-2 space-y-1">
              {selectedStatuses.map((status) => (
                <div
                  key={status}
                  onClick={() => onToggle(status)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md group",
                    UI_CLASSES.selectedItem
                  )}
                  data-testid={`option-filter-status-${status.toLowerCase().replace(" ", "-")}`}
                >
                  <StatusBadge status={status} size="sm" dotSize="md" />
                  <X className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      {unselectedStatuses.length > 0 && (
        <>
          <div className="px-3 py-1.5 text-xs text-gray-500">
            {selectedStatuses.length > 0 ? "Selecione mais" : "Selecionar status"}
          </div>
          <div className="px-1 pb-1">
            {unselectedStatuses.map((status) => (
              <div
                key={status}
                onClick={() => onToggle(status)}
                className={UI_CLASSES.dropdownItem}
                data-testid={`option-filter-status-${status.toLowerCase().replace(" ", "-")}`}
              >
                <StatusBadge status={status} size="sm" dotSize="md" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

const PriorityFilterContent = memo(function PriorityFilterContent({
  selectedValues,
  onToggle,
}: {
  selectedValues: string[];
  onToggle: (priority: TaskPriority) => void;
}) {
  const selectedPriorities = useMemo(() => 
    PRIORITY_OPTIONS.filter(p => selectedValues.includes(p)),
    [selectedValues]
  );
  
  const unselectedPriorities = useMemo(() => 
    PRIORITY_OPTIONS.filter(p => !selectedValues.includes(p)),
    [selectedValues]
  );

  return (
    <div className="w-full">
      {selectedPriorities.length > 0 && (
        <>
          <div className={cn("border-b", UI_CLASSES.border)}>
            <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
            <div className="px-2 pb-2 space-y-1">
              {selectedPriorities.map((priority) => (
                <div
                  key={priority}
                  onClick={() => onToggle(priority)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md group",
                    UI_CLASSES.selectedItem
                  )}
                  data-testid={`option-filter-priority-${priority.toLowerCase()}`}
                >
                  <PriorityBadge priority={priority} size="sm" dotSize="md" />
                  <X className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      {unselectedPriorities.length > 0 && (
        <>
          <div className="px-3 py-1.5 text-xs text-gray-500">
            {selectedPriorities.length > 0 ? "Selecione mais" : "Selecionar prioridade"}
          </div>
          <div className="px-1 pb-1">
            {unselectedPriorities.map((priority) => (
              <div
                key={priority}
                onClick={() => onToggle(priority)}
                className={UI_CLASSES.dropdownItem}
                data-testid={`option-filter-priority-${priority.toLowerCase()}`}
              >
                <PriorityBadge priority={priority} size="sm" dotSize="md" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

const TaskFilterContent = memo(function TaskFilterContent({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="p-2">
      <Input
        type="text"
        placeholder="Buscar por nome da tarefa..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 bg-[#1a1a1a] border-[#333] text-gray-200 placeholder:text-gray-500"
        data-testid="input-filter-task"
      />
    </div>
  );
});

export const FilterPopoverContent = memo(function FilterPopoverContent({
  filter,
  onUpdateFilter,
  availableAssignees,
  availableClients,
}: FilterPopoverContentProps) {
  const handleDateChange = useCallback((value: DateFilterValue) => {
    onUpdateFilter(filter.id, value);
  }, [filter.id, onUpdateFilter]);

  const handleStatusToggle = useCallback((status: TaskStatus) => {
    const currentValues = filter.value as string[];
    const newValues = currentValues.includes(status)
      ? currentValues.filter(s => s !== status)
      : [...currentValues, status];
    onUpdateFilter(filter.id, newValues);
  }, [filter.id, filter.value, onUpdateFilter]);

  const handlePriorityToggle = useCallback((priority: TaskPriority | "none") => {
    const currentValues = filter.value as string[];
    const newValues = currentValues.includes(priority)
      ? currentValues.filter(p => p !== priority)
      : [...currentValues, priority];
    onUpdateFilter(filter.id, newValues);
  }, [filter.id, filter.value, onUpdateFilter]);

  const handleTaskChange = useCallback((value: string) => {
    onUpdateFilter(filter.id, value);
  }, [filter.id, onUpdateFilter]);

  const handleAssigneeChange = useCallback((newSelection: string[]) => {
    onUpdateFilter(filter.id, newSelection);
  }, [filter.id, onUpdateFilter]);

  const handleClientChange = useCallback((newSelection: string[]) => {
    onUpdateFilter(filter.id, newSelection);
  }, [filter.id, onUpdateFilter]);

  switch (filter.type) {
    case "date":
      return (
        <DateRangeFilterContent
          value={(filter.value as DateFilterValue) || { type: "all" }}
          onChange={handleDateChange}
        />
      );
    
    case "status":
      return (
        <StatusFilterContent
          selectedValues={filter.value as string[]}
          onToggle={handleStatusToggle}
        />
      );
    
    case "priority":
      return (
        <PriorityFilterContent
          selectedValues={filter.value as string[]}
          onToggle={handlePriorityToggle}
        />
      );
    
    case "task":
      return (
        <TaskFilterContent
          value={filter.value as string}
          onChange={handleTaskChange}
        />
      );
    
    case "assignee":
      return (
        <SearchableMultiSelect
          items={availableAssignees}
          selectedItems={filter.value as string[]}
          onSelectionChange={handleAssigneeChange}
          placeholder="Buscar responsável..."
          selectedLabel="Responsável selecionado"
          availableLabel="Selecione mais"
          emptyMessage="Nenhum responsável encontrado"
          itemType="user"
        />
      );
    
    case "client":
      return (
        <SearchableMultiSelect
          items={availableClients}
          selectedItems={filter.value as string[]}
          onSelectionChange={handleClientChange}
          placeholder="Vincule ou crie uma página..."
          selectedLabel="Cliente selecionado"
          availableLabel="Selecione mais"
          emptyMessage="Nenhum cliente encontrado"
          itemType="client"
        />
      );
    
    default:
      return null;
  }
});
