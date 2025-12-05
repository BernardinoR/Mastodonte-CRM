import { useState, useCallback, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  LayoutGrid, 
  List, 
  ChevronDown, 
  ArrowUpDown, 
  X, 
  Plus,
  Calendar,
  CheckSquare,
  Flag,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG, PRIORITY_CONFIG, UI_COLORS } from "@/lib/statusConfig";
import type { TaskStatus, TaskPriority } from "@/types/task";

type ViewMode = "board" | "table";

type SortField = "priority" | "dueDate" | "title" | "status";
type SortDirection = "asc" | "desc";

interface SortOption {
  field: SortField;
  direction: SortDirection;
}

interface FilterBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sorts: SortOption[];
  onSortsChange: (sorts: SortOption[]) => void;
  statusFilter: TaskStatus[];
  onStatusFilterChange: (statuses: TaskStatus[]) => void;
  priorityFilter: (TaskPriority | "none")[];
  onPriorityFilterChange: (priorities: (TaskPriority | "none")[]) => void;
  dateFilter: string;
  onDateFilterChange: (filter: string) => void;
  onReset: () => void;
  onNewTask: () => void;
}

const SORT_FIELD_LABELS: Record<SortField, string> = {
  priority: "Prioridade",
  dueDate: "Data e Hora",
  title: "Título",
  status: "Status",
};

const DATE_FILTER_OPTIONS = [
  { value: "all", label: "Todas as datas" },
  { value: "today", label: "Hoje" },
  { value: "week", label: "Esta semana" },
  { value: "2weeks", label: "Últimas 2 semanas" },
  { value: "month", label: "Este mês" },
  { value: "8weeks", label: "Últimos(as) 8 semanas" },
  { value: "overdue", label: "Atrasadas" },
  { value: "no-date", label: "Sem data" },
];

const ALL_STATUSES: TaskStatus[] = ["To Do", "In Progress", "Done"];
const ALL_PRIORITIES: (TaskPriority | "none")[] = ["Urgente", "Normal", "none"];

export function FilterBar({
  viewMode,
  onViewModeChange,
  sorts,
  onSortsChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  dateFilter,
  onDateFilterChange,
  onReset,
  onNewTask,
}: FilterBarProps) {
  const [sortPopoverOpen, setSortPopoverOpen] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [priorityPopoverOpen, setPriorityPopoverOpen] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const handleAddSort = useCallback((field: SortField) => {
    if (!sorts.find(s => s.field === field)) {
      onSortsChange([...sorts, { field, direction: "asc" }]);
    }
  }, [sorts, onSortsChange]);

  const handleRemoveSort = useCallback((field: SortField) => {
    onSortsChange(sorts.filter(s => s.field !== field));
  }, [sorts, onSortsChange]);

  const handleToggleSortDirection = useCallback((field: SortField) => {
    onSortsChange(sorts.map(s => 
      s.field === field 
        ? { ...s, direction: s.direction === "asc" ? "desc" : "asc" }
        : s
    ));
  }, [sorts, onSortsChange]);

  const handleClearAllSorts = useCallback(() => {
    onSortsChange([]);
  }, [onSortsChange]);

  const handleToggleStatus = useCallback((status: TaskStatus) => {
    if (statusFilter.includes(status)) {
      onStatusFilterChange(statusFilter.filter(s => s !== status));
    } else {
      onStatusFilterChange([...statusFilter, status]);
    }
  }, [statusFilter, onStatusFilterChange]);

  const handleTogglePriority = useCallback((priority: TaskPriority | "none") => {
    if (priorityFilter.includes(priority)) {
      onPriorityFilterChange(priorityFilter.filter(p => p !== priority));
    } else {
      onPriorityFilterChange([...priorityFilter, priority]);
    }
  }, [priorityFilter, onPriorityFilterChange]);

  const availableSortFields = useMemo(() => {
    const usedFields = new Set(sorts.map(s => s.field));
    return (Object.keys(SORT_FIELD_LABELS) as SortField[]).filter(f => !usedFields.has(f));
  }, [sorts]);

  const hasActiveFilters = useMemo(() => {
    return statusFilter.length < ALL_STATUSES.length ||
           priorityFilter.length < ALL_PRIORITIES.length ||
           dateFilter !== "all" ||
           sorts.length > 0;
  }, [statusFilter, priorityFilter, dateFilter, sorts]);

  const getStatusFilterLabel = () => {
    if (statusFilter.length === 0) return "Nenhum";
    if (statusFilter.length === ALL_STATUSES.length) return "Status";
    return statusFilter.join(", ");
  };

  const getPriorityFilterLabel = () => {
    if (priorityFilter.length === 0) return "Nenhuma";
    if (priorityFilter.length === ALL_PRIORITIES.length) return "Prioridade";
    return priorityFilter.map(p => p === "none" ? "Sem prioridade" : p).join(", ");
  };

  const getDateFilterLabel = () => {
    const option = DATE_FILTER_OPTIONS.find(o => o.value === dateFilter);
    return option?.label || "Data e Hora";
  };

  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      {/* View Mode Toggle */}
      <div className="flex items-center rounded-md border border-[#333] bg-[#1a1a1a] p-0.5">
        <button
          onClick={() => onViewModeChange("board")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm transition-colors",
            viewMode === "board"
              ? "bg-[#2a2a2a] text-white"
              : "text-gray-500 hover:text-gray-300"
          )}
          data-testid="button-view-board"
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Quadro</span>
        </button>
        <button
          onClick={() => onViewModeChange("table")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm transition-colors",
            viewMode === "table"
              ? "bg-[#2a2a2a] text-white"
              : "text-gray-500 hover:text-gray-300"
          )}
          data-testid="button-view-table"
        >
          <List className="w-4 h-4" />
          <span>Tabela</span>
        </button>
      </div>

      <div className="w-px h-6 bg-[#333]" />

      {/* Sort Pill */}
      <Popover open={sortPopoverOpen} onOpenChange={setSortPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors border",
              sorts.length > 0
                ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                : "bg-[#1a1a1a] border-[#333] text-gray-400 hover:text-gray-200 hover:border-[#444]"
            )}
            data-testid="button-sort"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sorts.length > 0 ? `${sorts.length} ordenações` : "Ordenar"}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-64 p-0" 
          align="start"
          onWheel={(e) => {
            e.stopPropagation();
            e.currentTarget.scrollTop += e.deltaY;
          }}
        >
          {/* Active sorts */}
          {sorts.length > 0 && (
            <div className="border-b border-[#2a2a2a]">
              {sorts.map((sort) => (
                <div 
                  key={sort.field}
                  className="flex items-center gap-2 px-3 py-2 group"
                  data-testid={`sort-item-${sort.field}`}
                >
                  <button
                    onClick={() => handleToggleSortDirection(sort.field)}
                    className="flex items-center gap-2 flex-1 text-sm hover:text-white transition-colors"
                    data-testid={`button-toggle-sort-${sort.field}`}
                  >
                    <span className="text-gray-300">{SORT_FIELD_LABELS[sort.field]}</span>
                    <span className="text-gray-500 text-xs">
                      {sort.direction === "asc" ? "Crescente" : "Decrescente"}
                    </span>
                  </button>
                  <button
                    onClick={() => handleRemoveSort(sort.field)}
                    className="p-1 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    data-testid={`button-remove-sort-${sort.field}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new sort */}
          {availableSortFields.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1.5 text-xs text-gray-500">Adicionar ordenação</div>
              {availableSortFields.map((field) => (
                <button
                  key={field}
                  onClick={() => handleAddSort(field)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] transition-colors"
                  data-testid={`button-add-sort-${field}`}
                >
                  <Plus className="w-3.5 h-3.5 text-gray-500" />
                  <span>{SORT_FIELD_LABELS[field]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Clear all sorts */}
          {sorts.length > 0 && (
            <div className="border-t border-[#2a2a2a]">
              <button
                onClick={handleClearAllSorts}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[#2a2a2a] transition-colors"
                data-testid="button-clear-sorts"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir ordenação</span>
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Date Filter Pill */}
      <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors border",
              dateFilter !== "all"
                ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                : "bg-[#1a1a1a] border-[#333] text-gray-400 hover:text-gray-200 hover:border-[#444]"
            )}
            data-testid="button-filter-date"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Data e Hora: {getDateFilterLabel()}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-56 p-0" 
          align="start"
          onWheel={(e) => {
            e.stopPropagation();
            e.currentTarget.scrollTop += e.deltaY;
          }}
        >
          <div className="py-1">
            {DATE_FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onDateFilterChange(option.value);
                  setDatePopoverOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                  dateFilter === option.value
                    ? "bg-purple-500/20 text-purple-400"
                    : "text-gray-300 hover:bg-[#2a2a2a]"
                )}
                data-testid={`option-date-${option.value}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Status Filter Pill */}
      <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors border",
              statusFilter.length < ALL_STATUSES.length
                ? "bg-green-500/20 border-green-500/50 text-green-400"
                : "bg-[#1a1a1a] border-[#333] text-gray-400 hover:text-gray-200 hover:border-[#444]"
            )}
            data-testid="button-filter-status"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Status: {getStatusFilterLabel()}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-48 p-0" 
          align="start"
          onWheel={(e) => {
            e.stopPropagation();
            e.currentTarget.scrollTop += e.deltaY;
          }}
        >
          <div className="py-1">
            {ALL_STATUSES.map((status) => {
              const config = STATUS_CONFIG[status];
              return (
                <button
                  key={status}
                  onClick={() => handleToggleStatus(status)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] transition-colors"
                  data-testid={`option-status-${status.toLowerCase().replace(' ', '-')}`}
                >
                  <Checkbox 
                    checked={statusFilter.includes(status)}
                    className="h-4 w-4"
                  />
                  <div 
                    className={cn("w-2 h-2 rounded-full", config.dotColor)}
                  />
                  <span>{status}</span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Priority Filter Pill */}
      <Popover open={priorityPopoverOpen} onOpenChange={setPriorityPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors border",
              priorityFilter.length < ALL_PRIORITIES.length
                ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                : "bg-[#1a1a1a] border-[#333] text-gray-400 hover:text-gray-200 hover:border-[#444]"
            )}
            data-testid="button-filter-priority"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Prioridade: {getPriorityFilterLabel()}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-48 p-0" 
          align="start"
          onWheel={(e) => {
            e.stopPropagation();
            e.currentTarget.scrollTop += e.deltaY;
          }}
        >
          <div className="py-1">
            {ALL_PRIORITIES.map((priority) => {
              const config = priority !== "none" ? PRIORITY_CONFIG[priority] : null;
              const label = priority === "none" ? "Sem prioridade" : priority;
              const testId = priority === "none" ? "none" : priority.toLowerCase();
              return (
                <button
                  key={priority}
                  data-testid={`option-priority-${testId}`}
                  onClick={() => handleTogglePriority(priority)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] transition-colors"
                >
                  <Checkbox 
                    checked={priorityFilter.includes(priority)}
                    className="h-4 w-4"
                  />
                  {config && (
                    <div 
                      className={cn("w-2 h-2 rounded-full", config.dotColor)}
                    />
                  )}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          data-testid="button-reset-filters"
        >
          Redefinir
        </button>
      )}

      {/* New Task Button */}
      <Button
        onClick={onNewTask}
        className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
        data-testid="button-new-task"
      >
        Nova
        <ChevronDown className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
