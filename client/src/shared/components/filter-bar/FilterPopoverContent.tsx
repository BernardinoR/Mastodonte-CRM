import { memo, useCallback, useMemo } from "react";
import { Input } from "@/shared/components/ui/input";
import { SearchableMultiSelect } from "@/shared/components/ui/searchable-multi-select";
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
import { DateRangeFilterContent, formatDateFilterLabel } from "./DateRangeFilterContent";

export { formatDateFilterLabel };

interface FilterPopoverContentProps {
  filter: TypedActiveFilter;
  onUpdateFilter: <T extends FilterType>(id: string, type: T, value: FilterValueMap[T]) => void;
  availableAssignees: string[];
  availableClients: string[];
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
  none: "bg-gray-600",
};

const PRIORITY_FILTER_OPTIONS: { value: TaskPriority | "none"; label: string }[] = [
  ...PRIORITY_OPTIONS.map((p) => ({ value: p as TaskPriority | "none", label: p })),
  { value: "none" as const, label: "Sem prioridade" },
];

export const PriorityFilterContent = memo(function PriorityFilterContent({
  selectedValues,
  onToggle,
}: {
  selectedValues: string[];
  onToggle: (priority: TaskPriority | "none") => void;
}) {
  return (
    <div className="flex flex-col">
      {PRIORITY_FILTER_OPTIONS.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        const dotStyle = PRIORITY_DOT_STYLES[option.value] || "bg-gray-500";
        return (
          <button
            key={option.value}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 font-jakarta text-xs transition-colors",
              isSelected
                ? "bg-[#2a2a2a] text-white"
                : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white",
            )}
            onClick={() => onToggle(option.value)}
            data-testid={`option-filter-priority-${option.value.toLowerCase()}`}
          >
            <div className={cn("h-2 w-2 shrink-0 rounded-full", dotStyle)} />
            <span>{option.label}</span>
            {isSelected && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
          </button>
        );
      })}
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
    (priority: TaskPriority | "none") => {
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

  const handleAssigneeChange = useCallback(
    (newSelection: string[]) => {
      onUpdateFilter(filter.id, "assignee", newSelection);
    },
    [filter.id, onUpdateFilter],
  );

  const handleClientChange = useCallback(
    (newSelection: string[]) => {
      onUpdateFilter(filter.id, "client", newSelection);
    },
    [filter.id, onUpdateFilter],
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
        <SearchableMultiSelect
          items={availableAssignees}
          selectedItems={filter.value}
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
          selectedItems={filter.value}
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
