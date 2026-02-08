import { memo, useCallback, useMemo } from "react";
import { Input } from "@/shared/components/ui/input";
import { UI_CLASSES } from "@features/tasks/lib/statusConfig";
import { StatusBadge } from "@/shared/components/ui/task-badges";
import { X, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  type TaskStatus,
  type TaskPriority,
  type FilterType,
  type TypedActiveFilter,
  type DateFilterValue,
  type FilterValueMap,
} from "@features/tasks";
import { AssigneeSelector } from "@features/tasks/components/task-editors/AssigneeSelector";
import { MultiClientSelector } from "@features/tasks/components/task-editors/ClientSelector";
import { DateRangeFilterContent, formatDateFilterLabel } from "./DateRangeFilterContent";

export { formatDateFilterLabel };

interface FilterPopoverContentProps {
  filter: TypedActiveFilter;
  onUpdateFilter: <T extends FilterType>(id: string, type: T, value: FilterValueMap[T]) => void;
  availableAssignees?: string[];
  availableClients?: string[];
}

export const StatusFilterContent = memo(function StatusFilterContent({
  selectedValues,
  onToggle,
}: {
  selectedValues: string[];
  onToggle: (status: TaskStatus) => void;
}) {
  const selectedStatuses = useMemo(
    () => STATUS_OPTIONS.filter((s) => selectedValues.includes(s)),
    [selectedValues],
  );

  const unselectedStatuses = useMemo(
    () => STATUS_OPTIONS.filter((s) => !selectedValues.includes(s)),
    [selectedValues],
  );

  return (
    <div className="w-full">
      {selectedStatuses.length > 0 && (
        <>
          <div className={cn("border-b", UI_CLASSES.border)}>
            <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
            <div className="space-y-1 px-2 pb-2">
              {selectedStatuses.map((status) => (
                <div
                  key={status}
                  onClick={() => onToggle(status)}
                  className={cn(
                    "group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5",
                    UI_CLASSES.selectedItem,
                  )}
                  data-testid={`option-filter-status-${status.toLowerCase().replace(" ", "-")}`}
                >
                  <StatusBadge status={status} size="sm" dotSize="md" />
                  <X className="ml-auto h-3 w-3 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100" />
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

const PRIORITY_DOT_STYLES: Record<string, string> = {
  Urgente: "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]",
  Importante: "bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]",
  Normal: "bg-blue-400",
  Baixa: "bg-gray-500",
};

export const PriorityFilterContent = memo(function PriorityFilterContent({
  selectedValues,
  onToggle,
}: {
  selectedValues: string[];
  onToggle: (priority: TaskPriority) => void;
}) {
  const selectedPriorities = useMemo(
    () => PRIORITY_OPTIONS.filter((p) => selectedValues.includes(p)),
    [selectedValues],
  );

  const unselectedPriorities = useMemo(
    () => PRIORITY_OPTIONS.filter((p) => !selectedValues.includes(p)),
    [selectedValues],
  );

  return (
    <div className="w-full">
      {selectedPriorities.length > 0 && (
        <div className={cn("border-b border-[#333]")}>
          <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
          <div className="space-y-1 px-2 pb-2">
            {selectedPriorities.map((priority) => {
              const dotStyle = PRIORITY_DOT_STYLES[priority] || "bg-gray-500";
              return (
                <button
                  key={priority}
                  className={cn(
                    "group flex w-full items-center gap-2 rounded-md bg-[#2a2a2a] px-2 py-1.5 font-jakarta text-xs text-white transition-colors",
                  )}
                  onClick={() => onToggle(priority)}
                  data-testid={`option-filter-priority-${priority.toLowerCase()}`}
                >
                  <div className={cn("h-2 w-2 shrink-0 rounded-full", dotStyle)} />
                  <span>{priority}</span>
                  <X className="ml-auto h-3 w-3 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {unselectedPriorities.length > 0 && (
        <>
          <div className="px-3 py-1.5 text-xs text-gray-500">
            {selectedPriorities.length > 0 ? "Selecione mais" : "Selecionar prioridade"}
          </div>
          <div className="px-1 pb-1">
            {unselectedPriorities.map((priority) => {
              const dotStyle = PRIORITY_DOT_STYLES[priority] || "bg-gray-500";
              return (
                <button
                  key={priority}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 font-jakarta text-xs text-gray-400 transition-colors hover:bg-[#2a2a2a] hover:text-white",
                  )}
                  onClick={() => onToggle(priority)}
                  data-testid={`option-filter-priority-${priority.toLowerCase()}`}
                >
                  <div className={cn("h-2 w-2 shrink-0 rounded-full", dotStyle)} />
                  <span>{priority}</span>
                </button>
              );
            })}
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
        className="h-8 border-[#333] bg-[#1a1a1a] text-gray-200 placeholder:text-gray-500"
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
  const handleDateChange = useCallback(
    (value: DateFilterValue) => {
      onUpdateFilter(filter.id, "date", value);
    },
    [filter.id, onUpdateFilter],
  );

  const handleStatusToggle = useCallback(
    (status: TaskStatus) => {
      if (filter.type !== "status") return;
      const currentValues = filter.value;
      const newValues = currentValues.includes(status)
        ? currentValues.filter((s) => s !== status)
        : [...currentValues, status];
      onUpdateFilter(filter.id, "status", newValues);
    },
    [filter.id, filter.type, filter.value, onUpdateFilter],
  );

  const handlePriorityToggle = useCallback(
    (priority: TaskPriority) => {
      if (filter.type !== "priority") return;
      const currentValues = filter.value;
      const newValues = currentValues.includes(priority)
        ? currentValues.filter((p) => p !== priority)
        : [...currentValues, priority];
      onUpdateFilter(filter.id, "priority", newValues);
    },
    [filter.id, filter.type, filter.value, onUpdateFilter],
  );

  const handleTaskChange = useCallback(
    (value: string) => {
      onUpdateFilter(filter.id, "task", value);
    },
    [filter.id, onUpdateFilter],
  );

  const handleAssigneeAdd = useCallback(
    (name: string) => {
      if (filter.type !== "assignee") return;
      onUpdateFilter(filter.id, "assignee", [...filter.value, name]);
    },
    [filter.id, filter.type, filter.value, onUpdateFilter],
  );

  const handleAssigneeRemove = useCallback(
    (name: string) => {
      if (filter.type !== "assignee") return;
      onUpdateFilter(
        filter.id,
        "assignee",
        filter.value.filter((v) => v !== name),
      );
    },
    [filter.id, filter.type, filter.value, onUpdateFilter],
  );

  const handleClientAdd = useCallback(
    (name: string) => {
      if (filter.type !== "client") return;
      onUpdateFilter(filter.id, "client", [...filter.value, name]);
    },
    [filter.id, filter.type, filter.value, onUpdateFilter],
  );

  const handleClientRemove = useCallback(
    (name: string) => {
      if (filter.type !== "client") return;
      onUpdateFilter(
        filter.id,
        "client",
        filter.value.filter((v) => v !== name),
      );
    },
    [filter.id, filter.type, filter.value, onUpdateFilter],
  );

  switch (filter.type) {
    case "date":
      return (
        <DateRangeFilterContent
          value={filter.value || { type: "all" }}
          onChange={handleDateChange}
        />
      );

    case "status":
      return <StatusFilterContent selectedValues={filter.value} onToggle={handleStatusToggle} />;

    case "priority":
      return (
        <PriorityFilterContent selectedValues={filter.value} onToggle={handlePriorityToggle} />
      );

    case "task":
      return <TaskFilterContent value={filter.value} onChange={handleTaskChange} />;

    case "assignee":
      return (
        <AssigneeSelector
          selectedAssignees={filter.value}
          onSelect={handleAssigneeAdd}
          onRemove={handleAssigneeRemove}
        />
      );

    case "client":
      return (
        <MultiClientSelector
          selectedClients={filter.value}
          onSelect={handleClientAdd}
          onRemove={handleClientRemove}
        />
      );

    default:
      return null;
  }
});
