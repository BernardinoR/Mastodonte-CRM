import { useState, useMemo, useCallback } from 'react';
import { 
  Task, 
  TaskStatus, 
  TaskPriority,
  FilterType,
  TypedActiveFilter,
  DateFilterValue,
  FilterValueMap,
  DEFAULT_FILTER_VALUES,
  createTypedFilter,
  isDateFilter,
  isStatusFilter,
  isPriorityFilter,
  isTaskFilter,
  isAssigneeFilter,
  isClientFilter
} from '@/types/task';
import { parseLocalDate } from '@/lib/date-utils';
import { startOfDay, isBefore, isAfter, isSameDay, endOfDay } from 'date-fns';

type SortField = "priority" | "dueDate" | "title" | "status";
type SortDirection = "asc" | "desc";

interface SortOption {
  field: SortField;
  direction: SortDirection;
}

interface UseTaskFiltersReturn {
  viewMode: "board" | "table";
  setViewMode: (mode: "board" | "table") => void;
  
  sorts: SortOption[];
  setSorts: (sorts: SortOption[]) => void;
  
  activeFilters: TypedActiveFilter[];
  addFilter: (type: FilterType) => void;
  updateFilter: <T extends FilterType>(id: string, type: T, value: FilterValueMap[T]) => void;
  removeFilter: (id: string) => void;
  
  availableAssignees: string[];
  availableClients: string[];
  
  resetFilters: () => void;
  
  filteredTasks: Task[];
  todoTasks: Task[];
  inProgressTasks: Task[];
  doneTasks: Task[];
}

const ALL_STATUSES: TaskStatus[] = ["To Do", "In Progress", "Done"];
const ALL_PRIORITIES: (TaskPriority | "none")[] = ["Urgente", "Importante", "Normal", "Baixa", "none"];

const PRIORITY_ORDER: Record<string, number> = {
  "Urgente": 1,
  "Importante": 2,
  "Normal": 3,
  "Baixa": 4,
  "undefined": 5,
};

const STATUS_ORDER: Record<string, number> = {
  "To Do": 1,
  "In Progress": 2,
  "Done": 3,
};

export function useTaskFilters(tasks: Task[]): UseTaskFiltersReturn {
  const [viewMode, setViewMode] = useState<"board" | "table">("board");
  const [sorts, setSorts] = useState<SortOption[]>([]);
  const [activeFilters, setActiveFilters] = useState<TypedActiveFilter[]>([]);

  const availableAssignees = useMemo(() => {
    const assignees = new Set<string>();
    tasks.forEach(task => {
      task.assignees.forEach(a => assignees.add(a));
    });
    return Array.from(assignees).sort();
  }, [tasks]);

  const availableClients = useMemo(() => {
    const clients = new Set<string>();
    tasks.forEach(task => {
      if (task.clientName) clients.add(task.clientName);
    });
    return Array.from(clients).sort();
  }, [tasks]);

  const addFilter = useCallback((type: FilterType) => {
    const newFilter = createTypedFilter(type);
    setActiveFilters(prev => [...prev, newFilter]);
  }, []);

  const updateFilter = useCallback(<T extends FilterType>(id: string, type: T, value: FilterValueMap[T]) => {
    setActiveFilters(prev => 
      prev.map(f => f.id === id ? { ...f, type, value } as TypedActiveFilter : f)
    );
  }, []);

  const removeFilter = useCallback((id: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== id));
  }, []);

  const resetFilters = useCallback(() => {
    setSorts([]);
    setActiveFilters([]);
  }, []);

  const filteredTasks = useMemo(() => {
    const today = startOfDay(new Date());

    let result = tasks.filter((task) => {
      for (const filter of activeFilters) {
        if (isDateFilter(filter)) {
          const dateFilterValue = filter.value;
          
          if (dateFilterValue.type === "all") {
            continue;
          }
          
          const taskDate = task.dueDate ? 
            (typeof task.dueDate === 'string' ? parseLocalDate(task.dueDate) : startOfDay(task.dueDate)) 
            : null;
          
          if (dateFilterValue.type === "preset") {
            switch (dateFilterValue.preset) {
              case "today":
                if (!taskDate || !isSameDay(taskDate, today)) return false;
                break;
              case "overdue":
                if (!taskDate || !isBefore(taskDate, today)) return false;
                break;
              case "no-date":
                if (taskDate) return false;
                break;
            }
          } else if (dateFilterValue.type === "relative" || dateFilterValue.type === "range") {
            if (dateFilterValue.startDate && dateFilterValue.endDate) {
              const startDate = startOfDay(dateFilterValue.startDate);
              const endDate = endOfDay(dateFilterValue.endDate);
              
              if (!taskDate) return false;
              if (isBefore(taskDate, startDate) || isAfter(taskDate, endDate)) return false;
            } else if (dateFilterValue.startDate) {
              const startDate = startOfDay(dateFilterValue.startDate);
              if (!taskDate || isBefore(taskDate, startDate)) return false;
            }
          }
        } else if (isStatusFilter(filter)) {
          const statusValues = filter.value;
          if (statusValues.length > 0 && statusValues.length < ALL_STATUSES.length) {
            if (!statusValues.includes(task.status)) return false;
          }
        } else if (isPriorityFilter(filter)) {
          const priorityValues = filter.value;
          if (priorityValues.length > 0 && priorityValues.length < ALL_PRIORITIES.length) {
            const taskPriority = task.priority || "none";
            if (!priorityValues.includes(taskPriority as TaskPriority | "none")) return false;
          }
        } else if (isTaskFilter(filter)) {
          const taskSearch = filter.value.toLowerCase();
          if (taskSearch) {
            if (!task.title.toLowerCase().includes(taskSearch)) return false;
          }
        } else if (isAssigneeFilter(filter)) {
          const assigneeValues = filter.value;
          if (assigneeValues.length > 0) {
            const hasMatch = task.assignees.some(a => assigneeValues.includes(a));
            if (!hasMatch) return false;
          }
        } else if (isClientFilter(filter)) {
          const clientValues = filter.value;
          if (clientValues.length > 0) {
            if (!task.clientName || !clientValues.includes(task.clientName)) return false;
          }
        }
      }
      
      return true;
    });

    if (sorts.length > 0) {
      result = [...result].sort((a, b) => {
        for (const sort of sorts) {
          let comparison = 0;
          
          switch (sort.field) {
            case "priority":
              const aPriority = PRIORITY_ORDER[a.priority || "undefined"] || 3;
              const bPriority = PRIORITY_ORDER[b.priority || "undefined"] || 3;
              comparison = aPriority - bPriority;
              break;
            case "dueDate":
              const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
              const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
              comparison = aDate - bDate;
              break;
            case "title":
              comparison = a.title.localeCompare(b.title);
              break;
            case "status":
              comparison = (STATUS_ORDER[a.status] || 0) - (STATUS_ORDER[b.status] || 0);
              break;
          }
          
          if (comparison !== 0) {
            return sort.direction === "desc" ? -comparison : comparison;
          }
        }
        return 0;
      });
    }

    return result;
  }, [tasks, sorts, activeFilters]);

  const todoTasks = useMemo(() => {
    const filtered = filteredTasks.filter((task) => task.status === "To Do");
    if (sorts.length === 0) {
      return filtered.sort((a, b) => a.order - b.order);
    }
    return filtered;
  }, [filteredTasks, sorts]);

  const inProgressTasks = useMemo(() => {
    const filtered = filteredTasks.filter((task) => task.status === "In Progress");
    if (sorts.length === 0) {
      return filtered.sort((a, b) => a.order - b.order);
    }
    return filtered;
  }, [filteredTasks, sorts]);

  const doneTasks = useMemo(() => {
    const filtered = filteredTasks.filter((task) => task.status === "Done");
    if (sorts.length === 0) {
      return filtered.sort((a, b) => a.order - b.order);
    }
    return filtered;
  }, [filteredTasks, sorts]);

  return {
    viewMode,
    setViewMode,
    sorts,
    setSorts,
    activeFilters,
    addFilter,
    updateFilter,
    removeFilter,
    availableAssignees,
    availableClients,
    resetFilters,
    filteredTasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
  };
}
