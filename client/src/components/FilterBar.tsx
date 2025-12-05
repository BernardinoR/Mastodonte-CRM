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
  Check,
  Flag,
  Trash2,
  Search,
  Filter,
  ChevronUp,
  GripVertical,
  User,
  Briefcase,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/statusConfig";
import type { TaskStatus, TaskPriority } from "@/types/task";
import type { FilterType, ActiveFilter } from "@/hooks/useTaskFilters";
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
  // Dynamic filters
  activeFilters: ActiveFilter[];
  onAddFilter: (type: FilterType) => void;
  onUpdateFilter: (id: string, value: string | string[]) => void;
  onRemoveFilter: (id: string) => void;
  // Available options
  availableAssignees: string[];
  availableClients: string[];
  // Legacy filters (for compatibility)
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
  dueDate: "Data",
  title: "Título",
  status: "Status",
};

const FILTER_TYPE_CONFIG: Record<FilterType, { label: string; icon: typeof Calendar }> = {
  date: { label: "Data", icon: Calendar },
  status: { label: "Status", icon: CheckSquare },
  priority: { label: "Prioridade", icon: Flag },
  task: { label: "Tarefa", icon: FileText },
  assignee: { label: "Responsável", icon: Briefcase },
  client: { label: "Cliente", icon: User },
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
  activeFilters,
  onAddFilter,
  onUpdateFilter,
  onRemoveFilter,
  availableAssignees,
  availableClients,
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
  const [filterBarExpanded, setFilterBarExpanded] = useState(false);
  const [addSortPopoverOpen, setAddSortPopoverOpen] = useState(false);
  const [addFilterPopoverOpen, setAddFilterPopoverOpen] = useState(false);
  const [openFilterPopovers, setOpenFilterPopovers] = useState<Record<string, boolean>>({});
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [clientFilterSearch, setClientFilterSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleToggleFilterBar = useCallback(() => {
    setFilterBarExpanded(prev => !prev);
  }, []);

  const handleOpenFilterPopover = useCallback((id: string, open: boolean) => {
    setOpenFilterPopovers(prev => ({ ...prev, [id]: open }));
  }, []);

  const availableFilterTypes = useMemo(() => {
    const filters = activeFilters || [];
    const usedTypes = new Set(filters.map(f => f.type));
    return (Object.keys(FILTER_TYPE_CONFIG) as FilterType[]).filter(t => !usedTypes.has(t));
  }, [activeFilters]);

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
    const filters = activeFilters || [];
    return filters.length > 0 ||
           sorts.length > 0 ||
           searchQuery.length > 0;
  }, [activeFilters, sorts, searchQuery]);

  const activeFilterCount = useMemo(() => {
    const filters = activeFilters || [];
    return filters.length;
  }, [activeFilters]);

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
        <span>Kanban</span>
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
        <span>Lista</span>
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

        {/* Sort Toggle Button */}
        <button
          onClick={handleToggleFilterBar}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full transition-colors relative",
            filterBarExpanded || sorts.length > 0
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

        {/* Filter Toggle Button */}
        <button
          onClick={handleToggleFilterBar}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full transition-colors relative",
            filterBarExpanded || activeFilterCount > 0
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

      {/* Filter Bar - Expands below when sort or filter button is clicked */}
      {filterBarExpanded && (
        <div 
          className="flex items-center gap-2 px-2 py-2 bg-[#0d0d0d] rounded-lg border border-[#1a1a1a]"
          data-testid="filter-bar"
        >
          {/* Sort Button with Full Sort Management Popover */}
          <Popover open={addSortPopoverOpen} onOpenChange={setAddSortPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-1.5 px-3 h-8 text-sm rounded-md transition-colors",
                  sorts.length > 0
                    ? "bg-[#1a1a1a] text-gray-200 border border-[#333]"
                    : "text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]"
                )}
                data-testid="button-add-sort"
              >
                {sorts.length > 0 ? (
                  <>
                    <ArrowUpDown className="w-4 h-4" />
                    <span>{sorts.length} {sorts.length === 1 ? "ordenação" : "ordenações"}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Adicionar ordenação</span>
                  </>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
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

              {/* Add More Sorts */}
              {availableSortFields.length > 0 && (
                <div className="border-t border-[#2a2a2a] p-1">
                  <div className="px-2 py-1.5 text-xs text-gray-500 uppercase">Ordenar por</div>
                  {availableSortFields.map((field) => (
                    <button
                      key={field}
                      onClick={() => handleAddSort(field)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] rounded transition-colors"
                      data-testid={`button-add-sort-${field}`}
                    >
                      <Plus className="w-3.5 h-3.5 text-gray-500" />
                      {SORT_FIELD_LABELS[field]}
                    </button>
                  ))}
                </div>
              )}

              {/* Clear All Sorts */}
              {sorts.length > 0 && (
                <div className="border-t border-[#2a2a2a] p-2">
                  <button
                    onClick={handleClearAllSorts}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-400 hover:bg-[#2a2a2a] rounded transition-colors"
                    data-testid="button-clear-sorts"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir ordenação
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Vertical Divider between Sort and Filters */}
          <div className="h-6 w-px bg-[#333]" />

          {/* Dynamic Filter Badges */}
          {(activeFilters || []).map((filter) => {
            const config = FILTER_TYPE_CONFIG[filter.type];
            const Icon = config.icon;
            
            const getFilterLabel = () => {
              switch (filter.type) {
                case "date":
                  const dateValue = filter.value as string;
                  if (dateValue === "all") return config.label;
                  return DATE_FILTER_OPTIONS.find(o => o.value === dateValue)?.label || config.label;
                case "status":
                  const statusValues = filter.value as TaskStatus[];
                  if (statusValues.length === ALL_STATUSES.length) return config.label;
                  return statusValues.join(", ");
                case "priority":
                  const priorityValues = filter.value as (TaskPriority | "none")[];
                  if (priorityValues.length === ALL_PRIORITIES.length) return config.label;
                  return priorityValues.map(p => p === "none" ? "Sem" : p).join(", ");
                case "task":
                  return (filter.value as string) || config.label;
                case "assignee":
                  const assigneeValues = filter.value as string[];
                  if (assigneeValues.length === 0) return config.label;
                  return assigneeValues.join(", ");
                case "client":
                  const clientValues = filter.value as string[];
                  if (clientValues.length === 0) return config.label;
                  return clientValues.join(", ");
                default:
                  return config.label;
              }
            };
            
            const hasValue = () => {
              switch (filter.type) {
                case "date":
                  return (filter.value as string) !== "all";
                case "status":
                  return (filter.value as string[]).length < ALL_STATUSES.length;
                case "priority":
                  return (filter.value as string[]).length < ALL_PRIORITIES.length;
                case "task":
                  return !!(filter.value as string);
                case "assignee":
                case "client":
                  return (filter.value as string[]).length > 0;
                default:
                  return false;
              }
            };

            return (
              <Popover 
                key={filter.id} 
                open={openFilterPopovers[filter.id] || false} 
                onOpenChange={(open) => handleOpenFilterPopover(filter.id, open)}
              >
                <PopoverTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-3 h-8 text-sm rounded-md transition-colors cursor-pointer",
                      hasValue()
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-[#1a1a1a] text-gray-300 border border-[#333]"
                    )}
                    data-testid={`button-filter-${filter.type}-${filter.id}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="max-w-[150px] truncate">{getFilterLabel()}</span>
                    <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFilter(filter.id);
                      }}
                      className="ml-1 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                      data-testid={`button-remove-filter-${filter.id}`}
                    >
                      <X className="w-3 h-3" />
                    </span>
                  </div>
                </PopoverTrigger>
                <PopoverContent 
                  className={cn(
                    "p-1",
                    filter.type === "client" ? "w-64 p-0" : "w-56"
                  )} 
                  align="start"
                >
                  {filter.type === "date" && (
                    <>
                      {DATE_FILTER_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onUpdateFilter(filter.id, option.value);
                            handleOpenFilterPopover(filter.id, false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors",
                            (filter.value as string) === option.value
                              ? "bg-purple-500/20 text-purple-300"
                              : "text-gray-300 hover:bg-[#2a2a2a]"
                          )}
                          data-testid={`option-filter-date-${option.value}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </>
                  )}
                  {filter.type === "status" && (
                    <>
                      {ALL_STATUSES.map((status) => {
                        const statusConfig = STATUS_CONFIG[status];
                        const currentValues = filter.value as TaskStatus[];
                        return (
                          <div
                            key={status}
                            onClick={() => {
                              const newValues = currentValues.includes(status)
                                ? currentValues.filter(s => s !== status)
                                : [...currentValues, status];
                              onUpdateFilter(filter.id, newValues);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] rounded transition-colors cursor-pointer"
                            data-testid={`option-filter-status-${status.toLowerCase().replace(' ', '-')}`}
                          >
                            <Checkbox 
                              checked={currentValues.includes(status)}
                              className="h-4 w-4 pointer-events-none"
                            />
                            <div className={cn("w-2 h-2 rounded-full", statusConfig.dotColor)} />
                            <span>{status}</span>
                          </div>
                        );
                      })}
                    </>
                  )}
                  {filter.type === "priority" && (
                    <>
                      {ALL_PRIORITIES.map((priority) => {
                        const priorityConfig = priority !== "none" ? PRIORITY_CONFIG[priority] : null;
                        const label = priority === "none" ? "Sem prioridade" : priority;
                        const currentValues = filter.value as (TaskPriority | "none")[];
                        return (
                          <div
                            key={priority}
                            onClick={() => {
                              const newValues = currentValues.includes(priority)
                                ? currentValues.filter(p => p !== priority)
                                : [...currentValues, priority];
                              onUpdateFilter(filter.id, newValues);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] rounded transition-colors cursor-pointer"
                            data-testid={`option-filter-priority-${priority === "none" ? "none" : priority.toLowerCase()}`}
                          >
                            <Checkbox 
                              checked={currentValues.includes(priority)}
                              className="h-4 w-4 pointer-events-none"
                            />
                            {priorityConfig && (
                              <div className={cn("w-2 h-2 rounded-full", priorityConfig.dotColor)} />
                            )}
                            <span>{label}</span>
                          </div>
                        );
                      })}
                    </>
                  )}
                  {filter.type === "task" && (
                    <div className="p-2">
                      <Input
                        type="text"
                        placeholder="Buscar por nome da tarefa..."
                        value={filter.value as string}
                        onChange={(e) => onUpdateFilter(filter.id, e.target.value)}
                        className="h-8 bg-[#1a1a1a] border-[#333] text-gray-200 placeholder:text-gray-500"
                        data-testid="input-filter-task"
                      />
                    </div>
                  )}
                  {filter.type === "assignee" && (
                    <>
                      {availableAssignees.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          Nenhum responsável encontrado
                        </div>
                      ) : (
                        availableAssignees.map((assignee) => {
                          const currentValues = filter.value as string[];
                          return (
                            <div
                              key={assignee}
                              onClick={() => {
                                const newValues = currentValues.includes(assignee)
                                  ? currentValues.filter(a => a !== assignee)
                                  : [...currentValues, assignee];
                                onUpdateFilter(filter.id, newValues);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] rounded transition-colors cursor-pointer"
                              data-testid={`option-filter-assignee-${assignee}`}
                            >
                              <Checkbox 
                                checked={currentValues.includes(assignee)}
                                className="h-4 w-4 pointer-events-none"
                              />
                              <User className="w-3.5 h-3.5 text-gray-500" />
                              <span>{assignee}</span>
                            </div>
                          );
                        })
                      )}
                    </>
                  )}
                  {filter.type === "client" && (() => {
                    const currentValues = filter.value as string[];
                    const selectedClients = availableClients.filter(c => currentValues.includes(c));
                    const unselectedClients = availableClients.filter(c => 
                      !currentValues.includes(c) && 
                      c.toLowerCase().includes(clientFilterSearch.toLowerCase())
                    );
                    
                    return (
                      <div className="w-full">
                        <div className="px-3 py-2.5 border-b border-[#2a2a2a]">
                          <Input
                            value={clientFilterSearch}
                            onChange={(e) => setClientFilterSearch(e.target.value)}
                            placeholder="Vincule ou crie uma página..."
                            className="bg-transparent border-0 text-sm text-gray-400 placeholder:text-gray-500 focus-visible:ring-0 p-0 h-auto"
                            onClick={(e) => e.stopPropagation()}
                            data-testid="input-filter-client-search"
                          />
                        </div>
                        
                        {selectedClients.length > 0 && (
                          <div className="border-b border-[#2a2a2a]">
                            <div className="px-3 py-1.5 text-xs text-gray-500">
                              Cliente selecionado
                            </div>
                            <div className="px-3 py-1">
                              {selectedClients.map((client) => (
                                <div 
                                  key={client}
                                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer bg-[#2a2a2a] rounded-md mb-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newValues = currentValues.filter(c => c !== client);
                                    onUpdateFilter(filter.id, newValues);
                                  }}
                                  data-testid={`option-filter-client-selected-${client}`}
                                >
                                  <Check className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-foreground">{client}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="px-3 py-1.5 text-xs text-gray-500">
                          Selecione mais
                        </div>
                        
                        <div 
                          className="max-h-52 overflow-y-auto"
                          onWheel={(e) => e.stopPropagation()}
                        >
                          {unselectedClients.length === 0 ? (
                            <div className="px-3 py-4 text-sm text-gray-500 text-center">
                              Nenhum cliente encontrado
                            </div>
                          ) : (
                            unselectedClients.map((client, index) => (
                              <div
                                key={client}
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newValues = [...currentValues, client];
                                  onUpdateFilter(filter.id, newValues);
                                }}
                                data-testid={`option-filter-client-${index}`}
                              >
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-foreground flex-1">{client}</span>
                                <Plus className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </PopoverContent>
              </Popover>
            );
          })}

          {/* Add Filter Button */}
          {availableFilterTypes.length > 0 && (
            <Popover open={addFilterPopoverOpen} onOpenChange={setAddFilterPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  className="flex items-center gap-1.5 px-3 h-8 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a] rounded-md transition-colors"
                  data-testid="button-add-filter"
                >
                  <Plus className="w-4 h-4" />
                  <span>Filtrar</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1" align="start">
                {availableFilterTypes.map((type) => {
                  const config = FILTER_TYPE_CONFIG[type];
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        onAddFilter(type);
                        setAddFilterPopoverOpen(false);
                        setFilterBarExpanded(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] rounded transition-colors"
                      data-testid={`button-add-filter-${type}`}
                    >
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span>{config.label}</span>
                    </button>
                  );
                })}
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
    </div>
  );
}
