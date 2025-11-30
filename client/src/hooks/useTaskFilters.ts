import { useState, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';

interface UseTaskFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (assignee: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  filteredTasks: Task[];
  todoTasks: Task[];
  inProgressTasks: Task[];
  doneTasks: Task[];
}

export function useTaskFilters(tasks: Task[]): UseTaskFiltersReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.clientName && task.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesAssignee = assigneeFilter === "all" || 
        task.assignees.some(a => a.toLowerCase().includes(assigneeFilter.toLowerCase()));
      
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      
      return matchesSearch && matchesAssignee && matchesPriority;
    });
  }, [tasks, searchQuery, assigneeFilter, priorityFilter]);

  const todoTasks = useMemo(() => 
    filteredTasks
      .filter((task) => task.status === "To Do")
      .sort((a, b) => a.order - b.order),
    [filteredTasks]
  );

  const inProgressTasks = useMemo(() => 
    filteredTasks
      .filter((task) => task.status === "In Progress")
      .sort((a, b) => a.order - b.order),
    [filteredTasks]
  );

  const doneTasks = useMemo(() => 
    filteredTasks
      .filter((task) => task.status === "Done")
      .sort((a, b) => a.order - b.order),
    [filteredTasks]
  );

  return {
    searchQuery,
    setSearchQuery,
    assigneeFilter,
    setAssigneeFilter,
    priorityFilter,
    setPriorityFilter,
    filteredTasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
  };
}
