import { createContext, useContext, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import { INITIAL_TASKS, createNewTask } from "@/lib/mock-data";
import { useTaskHistory } from "@/hooks/useTaskHistory";
import { useClients } from "@/contexts/ClientsContext";

interface TasksContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setTasksWithHistory: (fn: (prev: Task[]) => Task[]) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addTask: (task: Task) => void;
  createTask: (data: { title: string; clientId?: string; clientName?: string; priority?: TaskPriority; status?: TaskStatus; assignees?: string[]; dueDate?: Date }) => void;
  getTasksByClient: (clientNameOrId: string) => Task[];
  undo: () => void;
  canUndo: boolean;
}

const TasksContext = createContext<TasksContextType | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const { tasks, setTasks, setTasksWithHistory, undo, canUndo } = useTaskHistory(INITIAL_TASKS);
  const { clients } = useClients();
  const hasBackfilled = useRef(false);
  
  // Backfill legacy tasks that have clientName but no clientId
  // Note: Intentionally uses setTasks (not setTasksWithHistory) because:
  // 1. This is an automatic data migration, not a user action
  // 2. Users should not be able to "undo" the backfill
  // 3. The backfill runs once on initialization
  useEffect(() => {
    if (hasBackfilled.current || clients.length === 0) return;
    
    const tasksNeedingBackfill = tasks.filter(t => t.clientName && !t.clientId);
    if (tasksNeedingBackfill.length === 0) {
      hasBackfilled.current = true;
      return;
    }
    
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.clientName && !task.clientId) {
          const client = clients.find(c => c.name === task.clientName);
          if (client) {
            return { ...task, clientId: client.id };
          }
        }
        return task;
      })
    );
    hasBackfilled.current = true;
  }, [clients, tasks, setTasks]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasksWithHistory(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  }, [setTasksWithHistory]);

  const deleteTask = useCallback((taskId: string) => {
    setTasksWithHistory(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, [setTasksWithHistory]);

  const addTask = useCallback((task: Task) => {
    setTasksWithHistory(prevTasks => [...prevTasks, task]);
  }, [setTasksWithHistory]);

  const createTask = useCallback((data: { 
    title: string; 
    clientId?: string;
    clientName?: string; 
    priority?: TaskPriority; 
    status?: TaskStatus; 
    assignees?: string[]; 
    dueDate?: Date 
  }) => {
    const newTask = createNewTask({
      title: data.title,
      clientId: data.clientId,
      clientName: data.clientName,
      priority: data.priority || "Normal",
      status: data.status || "To Do",
      assignees: data.assignees || ["Rafael Bernardino Silveira"],
      dueDate: data.dueDate || new Date(),
    }, tasks, "Sistema");
    addTask(newTask);
  }, [addTask, tasks]);

  const getTasksByClient = useCallback((clientNameOrId: string) => {
    return tasks.filter(task => 
      task.clientId === clientNameOrId ||
      task.clientName?.toLowerCase() === clientNameOrId.toLowerCase()
    );
  }, [tasks]);

  return (
    <TasksContext.Provider value={{
      tasks,
      setTasks,
      setTasksWithHistory,
      updateTask,
      deleteTask,
      addTask,
      createTask,
      getTasksByClient,
      undo,
      canUndo,
    }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
}
