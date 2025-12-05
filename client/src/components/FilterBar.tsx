import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
  Trash2,
  Search,
  Filter,
  ChevronUp,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/statusConfig";
import type { TaskStatus, TaskPriority } from "@/types/task";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
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

interface SortableItemProps {
  sort: SortOption;
  onDirectionChange: (field: SortField, direction: SortDirection) => void;
  onRemove: (field: SortField) => void;
}

function SortableItem({ sort, onDirectionChange, onRemove }: SortableItemProps) {
  const [directionOpen, setDirectionOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sort.field });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-[#1a1a1a] rounded-md border border-[#333] h-9 px-2"
      data-testid={`sort-item-${sort.field}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing"
        data-testid={`drag-handle-${sort.field}`}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <span className="text-sm text-gray-300 min-w-[80px]">
        {SORT_FIELD_LABELS[sort.field]}
      </span>

      <Popover open={directionOpen} onOpenChange={setDirectionOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex items-center gap-1 px-2 h-7 text-sm text-gray-400 hover:text-gray-200 bg-[#2a2a2a] rounded border border-[#404040] transition-colors"
            data-testid={`button-direction-${sort.field}`}
          >
            <span>{sort.direction === "asc" ? "Crescente" : "Decrescente"}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-36 p-1" align="start">
          <button
            onClick={() => {
              onDirectionChange(sort.field, "asc");
              setDirectionOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors",
              sort.direction === "asc" 
                ? "bg-blue-500/20 text-blue-400" 
                : "text-gray-300 hover:bg-[#2a2a2a]"
            )}
            data-testid={`option-direction-asc-${sort.field}`}
          >
            <ChevronUp className="w-3.5 h-3.5" />
            Crescente
          </button>
          <button
            onClick={() => {
              onDirectionChange(sort.field, "desc");
              setDirectionOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors",
              sort.direction === "desc" 
                ? "bg-blue-500/20 text-blue-400" 
                : "text-gray-300 hover:bg-[#2a2a2a]"
            )}
            data-testid={`option-direction-desc-${sort.field}`}
          >
            <ChevronDown className="w-3.5 h-3.5" />
            Decrescente
          </button>
        </PopoverContent>
      </Popover>

      <button
        onClick={() => onRemove(sort.field)}
        className="flex items-center justify-center w-6 h-6 text-gray-500 hover:text-red-400 transition-colors"
        data-testid={`button-remove-sort-${sort.field}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

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
  searchQuery,
  onSearchQueryChange,
  onReset,
  onNewTask,
}: FilterBarProps) {
  const [sortPopoverOpen, setSortPopoverOpen] = useState(false);
  const [addSortPopoverOpen, setAddSortPopoverOpen] = useState(false);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchExpanded]);

  const handleAddSort = useCallback((field: SortField) => {
    if (!sorts.find(s => s.field === field)) {
      onSortsChange([...sorts, { field, direction: "asc" }]);
    }
  }, [sorts, onSortsChange]);

  const handleRemoveSort = useCallback((field: SortField) => {
    onSortsChange(sorts.filter(s => s.field !== field));
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
           sorts.length > 0 ||
           searchQuery.length > 0;
  }, [statusFilter, priorityFilter, dateFilter, sorts, searchQuery]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter.length < ALL_STATUSES.length) count++;
    if (priorityFilter.length < ALL_PRIORITIES.length) count++;
    if (dateFilter !== "all") count++;
    return count;
  }, [statusFilter, priorityFilter, dateFilter]);

  const handleSearchBlur = useCallback(() => {
    if (!searchQuery) {
      setSearchExpanded(false);
    }
  }, [searchQuery]);

  const handleClearSearch = useCallback(() => {
    onSearchQueryChange("");
    setSearchExpanded(false);
  }, [onSearchQueryChange]);

  const handleSetSortDirection = useCallback((field: SortField, direction: SortDirection) => {
    onSortsChange(sorts.map(s => 
      s.field === field ? { ...s, direction } : s
    ));
  }, [sorts, onSortsChange]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sorts.findIndex(s => s.field === active.id);
      const newIndex = sorts.findIndex(s => s.field === over.id);
      onSortsChange(arrayMove(sorts, oldIndex, newIndex));
    }
  }, [sorts, onSortsChange]);

  return (
    <div className="flex flex-col gap-2 mb-4">
      {/* Main Filter Bar */}
      <div className="flex items-center gap-3">
        {/* View Mode Badges */}
        <button
        onClick={() => onViewModeChange("board")}
        className={cn(
          "flex items-center gap-1.5 px-3 h-8 rounded-full text-sm font-medium transition-colors",
          viewMode === "board"
            ? "bg-[#2a2a2a] text-white border border-[#404040]"
            : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]"
        )}
        data-testid="button-view-board"
      >
        <LayoutGrid className="w-4 h-4" />
        <span>Quadro</span>
      </button>
      
      <button
        onClick={() => onViewModeChange("table")}
        className={cn(
          "flex items-center gap-1.5 px-3 h-8 rounded-full text-sm font-medium transition-colors",
          viewMode === "table"
            ? "bg-[#2a2a2a] text-white border border-[#404040]"
            : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]"
        )}
        data-testid="button-view-table"
      >
        <List className="w-4 h-4" />
        <span>Tabela</span>
      </button>

      {/* Spacer - pushes everything after to the right */}
      <div className="flex-1" />

      {/* Search - Expandable with animation */}
      <div 
        className={cn(
          "relative flex items-center h-8 rounded-full overflow-hidden transition-all duration-300 ease-out",
          searchExpanded 
            ? "w-52 bg-[#1a1a1a] border border-[#333] px-3" 
            : "w-8"
        )}
      >
        <button
          onClick={() => !searchExpanded && setSearchExpanded(true)}
          className={cn(
            "flex items-center justify-center shrink-0 transition-colors",
            searchExpanded 
              ? "w-4 h-4 text-gray-500 cursor-default" 
              : "w-8 h-8 rounded-full text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]"
          )}
          data-testid="button-search"
        >
          <Search className="w-4 h-4" />
        </button>
        
        <div className={cn(
          "flex items-center gap-1.5 overflow-hidden transition-all duration-300 ease-out",
          searchExpanded ? "w-full opacity-100 ml-1.5" : "w-0 opacity-0"
        )}>
          <Input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onBlur={handleSearchBlur}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                handleClearSearch();
              }
            }}
            placeholder="Buscar..."
            className="h-7 flex-1 bg-transparent border-0 p-0 text-sm focus-visible:ring-0 placeholder:text-gray-500"
            data-testid="input-search"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-300 shrink-0"
              data-testid="button-clear-search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

        {/* Sort Popover */}
        <Popover open={sortPopoverOpen} onOpenChange={setSortPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full transition-colors relative",
                sorts.length > 0
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]"
              )}
              data-testid="button-sort"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sorts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-medium flex items-center justify-center">
                  {sorts.length}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-80 p-0" 
            align="start"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a2a]">
              <span className="text-sm font-medium text-gray-300">Ordenação</span>
              {sorts.length > 0 && (
                <span className="text-xs text-gray-500">{sorts.length} ordenações</span>
              )}
            </div>

            {/* Sort List with Drag and Drop */}
            <div className="p-2">
              {sorts.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  Nenhuma ordenação aplicada
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sorts.map(s => s.field)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-2">
                      {sorts.map((sort) => (
                        <SortableItem
                          key={sort.field}
                          sort={sort}
                          onDirectionChange={handleSetSortDirection}
                          onRemove={handleRemoveSort}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-[#2a2a2a] p-2 flex flex-col gap-1">
              {/* Add Sort */}
              {availableSortFields.length > 0 && (
                <Popover open={addSortPopoverOpen} onOpenChange={setAddSortPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a] rounded transition-colors"
                      data-testid="button-add-sort"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar ordenação
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-1" align="start" side="right">
                    {availableSortFields.map((field) => (
                      <button
                        key={field}
                        onClick={() => {
                          handleAddSort(field);
                          setAddSortPopoverOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] rounded transition-colors"
                        data-testid={`button-add-sort-${field}`}
                      >
                        {SORT_FIELD_LABELS[field]}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              )}

              {/* Clear All Sorts */}
              {sorts.length > 0 && (
                <button
                  onClick={() => {
                    handleClearAllSorts();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-400 hover:bg-[#2a2a2a] rounded transition-colors"
                  data-testid="button-clear-sorts"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir ordenação
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>

      {/* Filter Icon (aggregated: Date, Status, Priority) */}
      <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full transition-colors relative",
              activeFilterCount > 0
                ? "bg-purple-500/20 text-purple-400"
                : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]"
            )}
            data-testid="button-filter"
          >
            <Filter className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] font-medium flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-72 p-0 max-h-[400px] overflow-y-auto" 
          align="start"
          onWheel={(e) => {
            e.stopPropagation();
            e.currentTarget.scrollTop += e.deltaY;
          }}
        >
          {/* Date Filter Section */}
          <div className="border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 uppercase tracking-wide">
              <Calendar className="w-3.5 h-3.5" />
              Data e Hora
            </div>
            <div className="pb-2">
              {DATE_FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onDateFilterChange(option.value)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors",
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
          </div>

          {/* Status Filter Section */}
          <div className="border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 uppercase tracking-wide">
              <CheckSquare className="w-3.5 h-3.5" />
              Status
            </div>
            <div className="pb-2">
              {ALL_STATUSES.map((status) => {
                const config = STATUS_CONFIG[status];
                return (
                  <div
                    key={status}
                    onClick={() => handleToggleStatus(status)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                    data-testid={`option-status-${status.toLowerCase().replace(' ', '-')}`}
                  >
                    <Checkbox 
                      checked={statusFilter.includes(status)}
                      className="h-4 w-4 pointer-events-none"
                    />
                    <div 
                      className={cn("w-2 h-2 rounded-full", config.dotColor)}
                    />
                    <span>{status}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Filter Section */}
          <div>
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 uppercase tracking-wide">
              <Flag className="w-3.5 h-3.5" />
              Prioridade
            </div>
            <div className="pb-2">
              {ALL_PRIORITIES.map((priority) => {
                const config = priority !== "none" ? PRIORITY_CONFIG[priority] : null;
                const label = priority === "none" ? "Sem prioridade" : priority;
                const testId = priority === "none" ? "none" : priority.toLowerCase();
                return (
                  <div
                    key={priority}
                    data-testid={`option-priority-${testId}`}
                    onClick={() => handleTogglePriority(priority)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                  >
                    <Checkbox 
                      checked={priorityFilter.includes(priority)}
                      className="h-4 w-4 pointer-events-none"
                    />
                    {config && (
                      <div 
                        className={cn("w-2 h-2 rounded-full", config.dotColor)}
                      />
                    )}
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

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
        <button
          onClick={onNewTask}
          className="flex items-center gap-1.5 px-3 h-8 rounded-md text-sm font-medium bg-[#2a2a2a] border border-[#404040] text-white hover:bg-[#333] hover:border-[#505050] transition-colors"
          data-testid="button-new-task"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Tarefa</span>
        </button>
      </div>

    </div>
  );
}
