import { memo, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/statusConfig";
import { 
  STATUS_OPTIONS, 
  PRIORITY_OPTIONS, 
  STATUS_LABELS, 
  PRIORITY_LABELS,
  type TaskStatus, 
  type TaskPriority 
} from "@/types/task";

export type FilterType = "date" | "status" | "priority" | "task" | "assignee" | "client";

export interface ActiveFilter {
  id: string;
  type: FilterType;
  value: string | string[];
}

export const DATE_FILTER_OPTIONS = [
  { value: "all", label: "Todas as datas" },
  { value: "today", label: "Hoje" },
  { value: "week", label: "Esta semana" },
  { value: "2weeks", label: "Últimas 2 semanas" },
  { value: "month", label: "Este mês" },
  { value: "8weeks", label: "Últimas 8 semanas" },
  { value: "overdue", label: "Atrasadas" },
  { value: "no-date", label: "Sem data" },
] as const;

interface FilterPopoverContentProps {
  filter: ActiveFilter;
  onUpdateFilter: (id: string, value: string | string[]) => void;
  availableAssignees: string[];
  availableClients: string[];
}

const DateFilterContent = memo(function DateFilterContent({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <>
      {DATE_FILTER_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors cursor-pointer ${
            value === option.value
              ? "bg-[#2a2a2a] text-white"
              : "text-gray-300 hover:bg-[#2a2a2a]"
          }`}
          data-testid={`option-filter-date-${option.value}`}
        >
          {option.label}
        </button>
      ))}
    </>
  );
});

const StatusFilterContent = memo(function StatusFilterContent({
  selectedValues,
  onToggle,
}: {
  selectedValues: string[];
  onToggle: (status: TaskStatus) => void;
}) {
  return (
    <>
      {STATUS_OPTIONS.map((status) => {
        const statusConfig = STATUS_CONFIG[status];
        const label = STATUS_LABELS[status];
        return (
          <div
            key={status}
            onClick={() => onToggle(status)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] rounded transition-colors cursor-pointer"
            data-testid={`option-filter-status-${status.toLowerCase().replace(" ", "-")}`}
          >
            <Checkbox 
              checked={selectedValues.includes(status)}
              className="h-4 w-4 pointer-events-none"
            />
            {statusConfig && (
              <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`} />
            )}
            <span>{label}</span>
          </div>
        );
      })}
    </>
  );
});

const PriorityFilterContent = memo(function PriorityFilterContent({
  selectedValues,
  onToggle,
}: {
  selectedValues: string[];
  onToggle: (priority: TaskPriority | "none") => void;
}) {
  const priorityOptions: Array<{ value: TaskPriority | "none"; label: string }> = [
    { value: "none", label: "Sem prioridade" },
    ...PRIORITY_OPTIONS.map(p => ({
      value: p,
      label: PRIORITY_LABELS[p]
    }))
  ];

  return (
    <>
      {priorityOptions.map(({ value: priority, label }) => {
        const priorityConfig = priority !== "none" ? PRIORITY_CONFIG[priority] : null;
        return (
          <div
            key={priority}
            onClick={() => onToggle(priority)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] rounded transition-colors cursor-pointer"
            data-testid={`option-filter-priority-${priority === "none" ? "none" : priority.toLowerCase()}`}
          >
            <Checkbox 
              checked={selectedValues.includes(priority)}
              className="h-4 w-4 pointer-events-none"
            />
            {priorityConfig && (
              <div className={`w-2 h-2 rounded-full ${priorityConfig.dotColor}`} />
            )}
            <span>{label}</span>
          </div>
        );
      })}
    </>
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
  const handleDateSelect = useCallback((value: string) => {
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
        <DateFilterContent
          value={filter.value as string}
          onSelect={handleDateSelect}
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
