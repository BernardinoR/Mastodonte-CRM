import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  GripVertical,
  User,
  Briefcase,
  FileText,
  SlidersHorizontal,
  Briefcase as BriefcaseIcon,
  Clock,
  CalendarRange,
  Rocket,
  AlignJustify,
  Rows3
} from "lucide-react";
import { addDays, addWeeks, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { STATUS_OPTIONS, PRIORITY_OPTIONS, type TaskStatus, type TaskPriority, type FilterType, type TypedActiveFilter, type DateFilterValue, type FilterValueMap } from "@/types/task";
import { FilterPopoverContent, formatDateFilterLabel } from "@/components/filter-bar/FilterPopoverContent";
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
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  sorts?: SortOption[];
  onSortsChange?: (sorts: SortOption[]) => void;
  activeFilters?: TypedActiveFilter[];
  onAddFilter?: <T extends FilterType>(type: T, initialValue?: FilterValueMap[T]) => void;
  onUpdateFilter?: <T extends FilterType>(id: string, type: T, value: FilterValueMap[T]) => void;
  onRemoveFilter?: (id: string) => void;
  availableAssignees?: string[];
  availableClients?: string[];
  onReset?: () => void;
  onNewTask?: () => void;
  onTurboMode?: () => void;
  turboModeTaskCount?: number;
  tasks?: Array<{ dueDate: Date; status: string }>;
  activePresetId?: string | null;
  onActivePresetChange?: (presetId: string | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showAssignee?: boolean;
  showPriority?: boolean;
  isCompact?: boolean;
  onCompactModeChange?: (isCompact: boolean) => void;
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

interface FilterPreset {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof Calendar;
  sorts: SortOption[];
  getDateFilter: () => DateFilterValue;
  getStatusFilter?: () => TaskStatus[];
  matchTask: (task: { dueDate: Date; status: string }) => boolean;
}

const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "work",
    label: "Work",
    shortLabel: "W",
    description: "2 semanas atrás até hoje",
    icon: BriefcaseIcon,
    sorts: [
      { field: "priority", direction: "asc" },
      { field: "dueDate", direction: "asc" },
    ],
    getDateFilter: () => ({
      type: "range",
      startDate: addWeeks(startOfDay(new Date()), -2),
      endDate: startOfDay(new Date()),
    }),
    matchTask: (task) => {
      const today = startOfDay(new Date());
      const twoWeeksAgo = addWeeks(today, -2);
      const taskDate = task.dueDate ? startOfDay(new Date(task.dueDate)) : null;
      if (!taskDate) return false;
      return taskDate >= twoWeeksAgo && taskDate <= today;
    },
  },
  {
    id: "overdue",
    label: "Atrasadas",
    shortLabel: "A",
    description: "Vencidas (To Do + In Progress)",
    icon: Clock,
    sorts: [
      { field: "priority", direction: "asc" },
      { field: "dueDate", direction: "asc" },
    ],
    getDateFilter: () => ({
      type: "preset",
      preset: "overdue",
    }),
    getStatusFilter: () => ["To Do", "In Progress"] as TaskStatus[],
    matchTask: (task) => {
      const today = startOfDay(new Date());
      const taskDate = task.dueDate ? startOfDay(new Date(task.dueDate)) : null;
      if (!taskDate) return false;
      return taskDate < today && (task.status === "To Do" || task.status === "In Progress");
    },
  },
  {
    id: "future",
    label: "Tarefas Futuras",
    shortLabel: "F",
    description: "Amanhã até 2 semanas",
    icon: CalendarRange,
    sorts: [
      { field: "priority", direction: "asc" },
      { field: "dueDate", direction: "asc" },
    ],
    getDateFilter: () => ({
      type: "range",
      startDate: addDays(startOfDay(new Date()), 1),
      endDate: addWeeks(startOfDay(new Date()), 2),
    }),
    matchTask: (task) => {
      const today = startOfDay(new Date());
      const tomorrow = addDays(today, 1);
      const twoWeeksAhead = addWeeks(today, 2);
      const taskDate = task.dueDate ? startOfDay(new Date(task.dueDate)) : null;
      if (!taskDate) return false;
      return taskDate >= tomorrow && taskDate <= twoWeeksAhead;
    },
  },
];

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
        <PopoverContent 
          className="w-36 p-1" 
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={16}
          avoidCollisions={true}
        >
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
  viewMode = "board",
  onViewModeChange = () => {},
  sorts = [],
  onSortsChange = () => {},
  activeFilters = [],
  onAddFilter = () => {},
  onUpdateFilter = () => {},
  onRemoveFilter = () => {},
  availableAssignees = [],
  availableClients = [],
  onReset = () => {},
  onNewTask = () => {},
  onTurboMode = () => {},
  turboModeTaskCount = 0,
  tasks = [],
  activePresetId = null,
  onActivePresetChange = () => {},
  isCompact = false,
  onCompactModeChange = () => {},
}: FilterBarProps) {
  const [filterBarExpanded, setFilterBarExpanded] = useState(false);
  const [addSortPopoverOpen, setAddSortPopoverOpen] = useState(false);
  const [addFilterPopoverOpen, setAddFilterPopoverOpen] = useState(false);
  const [openFilterPopovers, setOpenFilterPopovers] = useState<Record<string, boolean>>({});
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [addFilterPopoverKey, setAddFilterPopoverKey] = useState(0);
  const [presetsPopoverOpen, setPresetsPopoverOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculate task counts for each preset - fallback to empty array if tasks undefined
  const presetCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const taskList = tasks || [];
    for (const preset of FILTER_PRESETS) {
      counts[preset.id] = taskList.filter(task => preset.matchTask(task)).length;
    }
    return counts;
  }, [tasks]);

  // Get active preset info
  const activePreset = useMemo(() => {
    return FILTER_PRESETS.find(p => p.id === activePresetId) || null;
  }, [activePresetId]);

  const handleToggleFilterBar = useCallback(() => {
    setFilterBarExpanded(prev => !prev);
  }, []);

  const handleOpenFilterPopover = useCallback((id: string, open: boolean) => {
    setOpenFilterPopovers(prev => ({ ...prev, [id]: open }));
  }, []);

  const handleAddFilterPopoverChange = useCallback((open: boolean) => {
    setAddFilterPopoverOpen(open);
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

  // Clean up popover state when filters are removed
  useEffect(() => {
    const filterIds = new Set((activeFilters || []).map(f => f.id));
    setOpenFilterPopovers(prev => {
      const cleaned: Record<string, boolean> = {};
      for (const id of Object.keys(prev)) {
        if (filterIds.has(id)) {
          cleaned[id] = prev[id];
        }
      }
      return cleaned;
    });
  }, [activeFilters]);

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

  const availableSortFields = useMemo(() => {
    const usedFields = new Set(sorts.map(s => s.field));
    return (Object.keys(SORT_FIELD_LABELS) as SortField[]).filter(f => !usedFields.has(f));
  }, [sorts]);

  const taskFilter = useMemo(() => {
    const filters = activeFilters || [];
    return filters.find(f => f.type === "task");
  }, [activeFilters]);

  const searchQuery = useMemo(() => {
    if (taskFilter && taskFilter.type === "task") {
      return taskFilter.value;
    }
    return "";
  }, [taskFilter]);

  const hasActiveFilters = useMemo(() => {
    const filters = activeFilters || [];
    return filters.length > 0 || sorts.length > 0;
  }, [activeFilters, sorts]);

  const activeFilterCount = useMemo(() => {
    const filters = activeFilters || [];
    return filters.length;
  }, [activeFilters]);

  const handleSearchChange = useCallback((value: string) => {
    if (taskFilter) {
      onUpdateFilter(taskFilter.id, "task", value);
    } else if (value) {
      onAddFilter("task");
    }
  }, [taskFilter, onUpdateFilter, onAddFilter]);

  const handleSearchBlur = useCallback(() => {
    if (!searchQuery) {
      setSearchExpanded(false);
    }
  }, [searchQuery]);

  const handleClearSearch = useCallback(() => {
    if (taskFilter) {
      onRemoveFilter(taskFilter.id);
    }
    setSearchExpanded(false);
  }, [taskFilter, onRemoveFilter]);

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

  const handleApplyPreset = useCallback((preset: FilterPreset) => {
    // Clear existing filters and apply preset
    onReset();
    // Apply sorts
    onSortsChange(preset.sorts);
    // Apply date filter with freshly computed value (avoids stale dates)
    onAddFilter("date", preset.getDateFilter());
    // Apply status filter if preset has one
    if (preset.getStatusFilter) {
      onAddFilter("status", preset.getStatusFilter());
    }
    // Set active preset
    onActivePresetChange(preset.id);
    // Close popover (don't expand filter bar when preset is active)
    setPresetsPopoverOpen(false);
  }, [onReset, onSortsChange, onAddFilter, onActivePresetChange]);

  const handleResetWithPreset = useCallback(() => {
    onReset();
    onActivePresetChange(null);
  }, [onReset, onActivePresetChange]);

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
            onChange={(e) => handleSearchChange(e.target.value)}
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

      {/* Compact Mode Toggle Button */}
      <button
        onClick={() => onCompactModeChange(!isCompact)}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
          isCompact
            ? "bg-blue-500/20 text-blue-400"
            : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]"
        )}
        title={isCompact ? "Modo expandido" : "Modo compacto"}
        data-testid="button-compact-mode"
      >
        {isCompact ? <AlignJustify className="w-4 h-4" /> : <Rows3 className="w-4 h-4" />}
      </button>

      {/* Turbo Mode Button */}
      <button
        onClick={onTurboMode}
        disabled={turboModeTaskCount === 0}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
          turboModeTaskCount > 0
            ? "text-gray-500 hover:text-orange-500 hover:bg-orange-500/20"
            : "text-gray-600 cursor-not-allowed"
        )}
        title={turboModeTaskCount > 0 ? `Modo Turbo: ${turboModeTaskCount} tarefas` : "Nenhuma tarefa pendente"}
        data-testid="button-turbo-mode"
      >
        <Rocket className="w-4 h-4" />
      </button>

        {/* Presets Popover */}
        <Popover open={presetsPopoverOpen} onOpenChange={setPresetsPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
                activePreset
                  ? "bg-amber-500/20 text-amber-400"
                  : presetsPopoverOpen
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]"
              )}
              data-testid="button-presets"
            >
              {activePreset ? (
                <span className="text-sm font-bold">{activePreset.shortLabel}</span>
              ) : (
                <SlidersHorizontal className="w-4 h-4" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-64 p-2 bg-[#1a1a1a] border border-[#333]"
            side="bottom"
            align="end"
            sideOffset={8}
            collisionPadding={16}
            avoidCollisions
          >
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visualizações Rápidas
              </div>
              {FILTER_PRESETS.map((preset) => {
                const PresetIcon = preset.icon;
                const isActive = activePresetId === preset.id;
                const count = presetCounts[preset.id] || 0;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={cn(
                      "flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors group",
                      isActive
                        ? "bg-amber-500/10 border border-amber-500/30"
                        : "hover:bg-[#252525]"
                    )}
                    data-testid={`preset-${preset.id}`}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-md",
                      isActive ? "bg-amber-500/20" : "bg-[#252525] group-hover:bg-[#2a2a2a]"
                    )}>
                      <PresetIcon className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className={cn(
                        "text-sm font-medium",
                        isActive ? "text-amber-300" : "text-gray-200"
                      )}>{preset.label}</span>
                      <span className="text-xs text-gray-500">{preset.description}</span>
                    </div>
                    <span className={cn(
                      "text-xs font-medium px-1.5 py-0.5 rounded",
                      isActive ? "bg-amber-500/20 text-amber-400" : "bg-[#252525] text-gray-400"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort Toggle Button - hide badges when preset is active */}
        <button
          onClick={handleToggleFilterBar}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full transition-colors relative",
            !activePreset && (filterBarExpanded || sorts.length > 0)
              ? "bg-blue-500/20 text-blue-400"
              : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]"
          )}
          data-testid="button-sort"
        >
          <ArrowUpDown className="w-4 h-4" />
          {!activePreset && sorts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-medium flex items-center justify-center">
              {sorts.length}
            </span>
          )}
        </button>

        {/* Filter Toggle Button - hide badges when preset is active */}
        <button
          onClick={handleToggleFilterBar}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full transition-colors relative",
            !activePreset && (filterBarExpanded || activeFilterCount > 0)
              ? "bg-purple-500/20 text-purple-400"
              : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]"
          )}
          data-testid="button-filter"
        >
          <Filter className="w-4 h-4" />
          {!activePreset && activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] font-medium flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Reset Button - also shows when preset is active */}
        {(hasActiveFilters || activePreset) && (
          <button
            onClick={handleResetWithPreset}
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
            <PopoverContent 
              className="w-80 p-0" 
              side="bottom"
              align="start"
              sideOffset={8}
              collisionPadding={16}
              avoidCollisions={true}
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
                  const dateValue = filter.value as DateFilterValue;
                  return formatDateFilterLabel(dateValue);
                case "status":
                  const statusValues = filter.value as TaskStatus[];
                  if (statusValues.length === STATUS_OPTIONS.length) return config.label;
                  return statusValues.join(", ");
                case "priority":
                  const priorityValues = filter.value as (TaskPriority | "none")[];
                  if (priorityValues.length === PRIORITY_OPTIONS.length + 1) return config.label;
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
                  const dateVal = filter.value as DateFilterValue;
                  return dateVal && dateVal.type !== "all";
                case "status":
                  return (filter.value as string[]).length < STATUS_OPTIONS.length;
                case "priority":
                  return (filter.value as string[]).length < PRIORITY_OPTIONS.length + 1;
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
                    (filter.type === "client" || filter.type === "assignee") ? "w-64 p-0" : 
                    filter.type === "date" ? "w-auto p-0" : "w-56"
                  )} 
                  side="bottom"
                  align="start"
                  sideOffset={8}
                  collisionPadding={16}
                  avoidCollisions={true}
                >
                  <FilterPopoverContent
                    filter={filter}
                    onUpdateFilter={onUpdateFilter}
                    availableAssignees={availableAssignees}
                    availableClients={availableClients}
                  />
                </PopoverContent>
              </Popover>
            );
          })}

          {/* Add Filter Button - uses key to force remount after adding filter */}
          {availableFilterTypes.length > 0 && (
            <Popover 
              key={addFilterPopoverKey}
              open={addFilterPopoverOpen} 
              onOpenChange={handleAddFilterPopoverChange}
            >
              <PopoverTrigger asChild>
                <button
                  className="flex items-center gap-1.5 px-3 h-8 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a] rounded-md transition-colors"
                  data-testid="button-add-filter"
                >
                  <Plus className="w-4 h-4" />
                  <span>Filtrar</span>
                </button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-48 p-1" 
                side="bottom"
                align="start"
                sideOffset={8}
                collisionPadding={16}
                avoidCollisions={true}
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                {availableFilterTypes.map((type) => {
                  const config = FILTER_TYPE_CONFIG[type];
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        // Increment key to force Popover remount, preventing event replay
                        setAddFilterPopoverKey(k => k + 1);
                        setAddFilterPopoverOpen(false);
                        onAddFilter(type);
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
