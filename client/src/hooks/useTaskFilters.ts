import { useState, useMemo, useCallback } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { parseLocalDate } from '@/lib/date-utils';
import { startOfDay, startOfWeek, startOfMonth, subWeeks, isBefore, isAfter, isSameDay } from 'date-fns';

type SortField = "priority" | "dueDate" | "title" | "status";
type SortDirection = "asc" | "desc";

interface SortOption {
  field: SortField;
  direction: SortDirection;
}

// Dynamic filter types
export type FilterType = "date" | "status" | "priority" | "task" | "assignee" | "client";

export interface ActiveFilter {
  id: string;
  type: FilterType;
  value: string | string[];
}

interface UseTaskFiltersReturn {
  // View mode
  viewMode: "board" | "table";
  setViewMode: (mode: "board" | "table") => void;
  
  // Sorting
  sorts: SortOption[];
  setSorts: (sorts: SortOption[]) => void;
  
  // Dynamic filters
  activeFilters: ActiveFilter[];
  addFilter: (type: FilterType) => void;
  updateFilter: (id: string, value: string | string[]) => void;
  removeFilter: (id: string) => void;
  
  // Legacy filters (for compatibility)
  statusFilter: TaskStatus[];
  setStatusFilter: (statuses: TaskStatus[]) => void;
  priorityFilter: (TaskPriority | "none")[];
  setPriorityFilter: (priorities: (TaskPriority | "none")[]) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  
  // Available options for filters
  availableAssignees: string[];
  availableClients: string[];
  
  // Reset
  resetFilters: () => void;
  
  // Filtered and sorted results
  filteredTasks: Task[];
  todoTasks: Task[];
  inProgressTasks: Task[];
  doneTasks: Task[];
  
  // Legacy support
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (assignee: string) => void;
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
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>(ALL_STATUSES);
  const [priorityFilter, setPriorityFilter] = useState<(TaskPriority | "none")[]>(ALL_PRIORITIES);
  const [dateFilter, setDateFilter] = useState("all");
  
  // Dynamic filters
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  
  // Legacy filters (kept for compatibility)
  const [searchQuery, setSearchQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  // Extract available assignees and clients from tasks
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

  // Dynamic filter management
  const addFilter = useCallback((type: FilterType) => {
    const id = `${type}-${Date.now()}`;
    let defaultValue: string | string[] = "";
    
    switch (type) {
      case "date":
        defaultValue = "all";
        break;
      case "status":
        defaultValue = [...ALL_STATUSES];
        break;
      case "priority":
        defaultValue = [...ALL_PRIORITIES];
        break;
      case "task":
        defaultValue = "";
        break;
      case "assignee":
        defaultValue = [];
        break;
      case "client":
        defaultValue = [];
        break;
    }
    
    setActiveFilters(prev => [...prev, { id, type, value: defaultValue }]);
  }, []);

  const updateFilter = useCallback((id: string, value: string | string[]) => {
    setActiveFilters(prev => 
      prev.map(f => f.id === id ? { ...f, value } : f)
    );
  }, []);

  const removeFilter = useCallback((id: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== id));
  }, []);

  const resetFilters = useCallback(() => {
    setSorts([]);
    setStatusFilter(ALL_STATUSES);
    setPriorityFilter(ALL_PRIORITIES);
    setDateFilter("all");
    setActiveFilters([]);
    setSearchQuery("");
    setAssigneeFilter("all");
  }, []);

  const filteredTasks = useMemo(() => {
    const today = startOfDay(new Date());
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const monthStart = startOfMonth(today);
    const twoWeeksAgo = subWeeks(today, 2);
    const eightWeeksAgo = subWeeks(today, 8);

    let result = tasks.filter((task) => {
      // Apply dynamic filters
      for (const filter of activeFilters) {
        switch (filter.type) {
          case "date": {
            const dateValue = filter.value as string;
            if (dateValue !== "all") {
              const taskDate = task.dueDate ? 
                (typeof task.dueDate === 'string' ? parseLocalDate(task.dueDate) : startOfDay(task.dueDate)) 
                : null;
              
              switch (dateValue) {
                case "today":
                  if (!taskDate || !isSameDay(taskDate, today)) return false;
                  break;
                case "week":
                  if (!taskDate || isBefore(taskDate, weekStart)) return false;
                  break;
                case "2weeks":
                  if (!taskDate || isBefore(taskDate, twoWeeksAgo)) return false;
                  break;
                case "month":
                  if (!taskDate || isBefore(taskDate, monthStart)) return false;
                  break;
                case "8weeks":
                  if (!taskDate || isBefore(taskDate, eightWeeksAgo)) return false;
                  break;
                case "overdue":
                  if (!taskDate || !isBefore(taskDate, today)) return false;
                  break;
                case "no-date":
                  if (taskDate) return false;
                  break;
              }
            }
            break;
          }
          case "status": {
            const statusValues = filter.value as TaskStatus[];
            if (statusValues.length > 0 && statusValues.length < ALL_STATUSES.length) {
              if (!statusValues.includes(task.status)) return false;
            }
            break;
          }
          case "priority": {
            const priorityValues = filter.value as (TaskPriority | "none")[];
            if (priorityValues.length > 0 && priorityValues.length < ALL_PRIORITIES.length) {
              const taskPriority = task.priority || "none";
              if (!priorityValues.includes(taskPriority as TaskPriority | "none")) return false;
            }
            break;
          }
          case "task": {
            const taskSearch = (filter.value as string).toLowerCase();
            if (taskSearch) {
              if (!task.title.toLowerCase().includes(taskSearch)) return false;
            }
            break;
          }
          case "assignee": {
            const assigneeValues = filter.value as string[];
            if (assigneeValues.length > 0) {
              const hasMatch = task.assignees.some(a => assigneeValues.includes(a));
              if (!hasMatch) return false;
            }
            break;
          }
          case "client": {
            const clientValues = filter.value as string[];
            if (clientValues.length > 0) {
              if (!task.clientName || !clientValues.includes(task.clientName)) return false;
            }
            break;
          }
        }
      }
      
      // Legacy status filter (for compatibility)
      if (statusFilter.length < ALL_STATUSES.length && !statusFilter.includes(task.status)) {
        return false;
      }
      
      // Legacy priority filter (for compatibility)
      const taskPriority = task.priority || "none";
      if (priorityFilter.length < ALL_PRIORITIES.length && !priorityFilter.includes(taskPriority as TaskPriority | "none")) {
        return false;
      }
      
      // Legacy date filter (for compatibility)
      if (dateFilter !== "all") {
        const taskDate = task.dueDate ? 
          (typeof task.dueDate === 'string' ? parseLocalDate(task.dueDate) : startOfDay(task.dueDate)) 
          : null;
        
        switch (dateFilter) {
          case "today":
            if (!taskDate || !isSameDay(taskDate, today)) return false;
            break;
          case "week":
            if (!taskDate || isBefore(taskDate, weekStart)) return false;
            break;
          case "2weeks":
            if (!taskDate || isBefore(taskDate, twoWeeksAgo)) return false;
            break;
          case "month":
            if (!taskDate || isBefore(taskDate, monthStart)) return false;
            break;
          case "8weeks":
            if (!taskDate || isBefore(taskDate, eightWeeksAgo)) return false;
            break;
          case "overdue":
            if (!taskDate || !isBefore(taskDate, today)) return false;
            break;
          case "no-date":
            if (taskDate) return false;
            break;
        }
      }
      
      // Legacy search filter
      if (searchQuery) {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.clientName && task.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
        if (!matchesSearch) return false;
      }
      
      // Legacy assignee filter
      if (assigneeFilter !== "all") {
        const matchesAssignee = task.assignees.some(a => 
          a.toLowerCase().includes(assigneeFilter.toLowerCase())
        );
        if (!matchesAssignee) return false;
      }
      
      return true;
    });

    // Apply sorting
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
  }, [tasks, statusFilter, priorityFilter, dateFilter, searchQuery, assigneeFilter, sorts, activeFilters]);

  const todoTasks = useMemo(() => {
    const filtered = filteredTasks.filter((task) => task.status === "To Do");
    // If no sorts applied, use default order
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
    // Dynamic filters
    activeFilters,
    addFilter,
    updateFilter,
    removeFilter,
    // Legacy filters (for compatibility)
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    dateFilter,
    setDateFilter,
    // Available options
    availableAssignees,
    availableClients,
    // Reset
    resetFilters,
    filteredTasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
    // Legacy support
    searchQuery,
    setSearchQuery,
    assigneeFilter,
    setAssigneeFilter,
  };
}
