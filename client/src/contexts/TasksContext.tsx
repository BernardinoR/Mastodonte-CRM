import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@clerk/clerk-react";
import type { Task, TaskStatus, TaskPriority, TaskHistoryEvent } from "@/types/task";
import { useClients } from "@/contexts/ClientsContext";

// API response types
interface ApiTaskAssignee {
  userId: number;
  user: { id: number; name: string | null };
}

interface ApiTaskHistory {
  id: string;
  type: string;
  content: string;
  authorId: number | null;
  createdAt: string;
  author: { name: string | null } | null;
}

interface ApiTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  order: number;
  clientId: string | null;
  meetingId: number | null;
  creatorId: number | null;
  createdAt: string;
  updatedAt: string;
  assignees: ApiTaskAssignee[];
  history: ApiTaskHistory[];
  client: { id: string; name: string; emails: string[]; phone: string | null } | null;
  creator: { name: string | null } | null;
}

// Map API task to frontend Task type
function mapApiTaskToTask(apiTask: ApiTask): Task {
  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description || undefined,
    priority: (apiTask.priority as TaskPriority) || "Normal",
    status: (apiTask.status as TaskStatus) || "To Do",
    dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : new Date(),
    order: apiTask.order,
    clientId: apiTask.clientId || undefined,
    clientName: apiTask.client?.name,
    clientEmail: apiTask.client?.emails?.[0],
    clientPhone: apiTask.client?.phone || undefined,
    assignees: apiTask.assignees.map(a => a.user.name || "Unknown"),
    history: apiTask.history.map(h => ({
      id: h.id,
      type: h.type as TaskHistoryEvent["type"],
      content: h.content,
      author: h.author?.name || "Sistema",
      timestamp: new Date(h.createdAt),
    })),
  };
}

interface CreateTaskData {
  title: string;
  clientId?: string;
  clientName?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignees?: string[];
  dueDate?: Date;
  order?: number;
}

interface TasksContextType {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setTasksWithHistory: (fn: (prev: Task[]) => Task[]) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addTask: (task: Task) => void;
  createTask: (data: CreateTaskData) => void;
  createTaskAndReturn: (data: CreateTaskData) => Promise<Task | null>;
  getTasksByClient: (clientNameOrId: string) => Task[];
  addTaskHistory: (taskId: string, type: string, content: string) => Promise<void>;
  deleteTaskHistory: (taskId: string, eventId: string) => Promise<void>;
  refetchTasks: () => Promise<void>;
  undo: () => void;
  canUndo: boolean;
}

const TasksContext = createContext<TasksContextType | null>(null);

const MAX_HISTORY = 20;

export function TasksProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  const { clients } = useClients();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<Task[][]>([]);

  // Keep ref updated
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  // Helper to get auth headers
  const getAuthHeaders = useCallback(async (contentType?: string): Promise<Record<string, string>> => {
    const token = await getTokenRef.current();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    return headers;
  }, []);

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const headers = await getAuthHeaders();
      const response = await fetch("/api/tasks", {
        headers,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      
      const data = await response.json();
      const mappedTasks = (data.tasks || []).map(mapApiTaskToTask);
      setTasks(mappedTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const refetchTasks = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  // History management (local undo functionality)
  const setTasksWithHistory = useCallback((updater: (prev: Task[]) => Task[]) => {
    setTasks(prevTasks => {
      const deepCopy = prevTasks.map(task => ({
        ...task,
        assignees: [...task.assignees],
        history: task.history ? [...task.history] : undefined,
      }));
      historyRef.current.push(deepCopy);
      if (historyRef.current.length > MAX_HISTORY) {
        historyRef.current.shift();
      }
      return updater(prevTasks);
    });
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.length > 0) {
      const previousState = historyRef.current.pop();
      if (previousState) {
        setTasks(previousState);
      }
    }
  }, []);

  const canUndo = historyRef.current.length > 0;

  // Keyboard shortcut for undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo]);

  // Update task (local + API)
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    // Optimistic update
    setTasksWithHistory(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );

    // API update
    try {
      const headers = await getAuthHeaders("application/json");
      const apiUpdates: Record<string, unknown> = {};
      
      if (updates.title !== undefined) apiUpdates.title = updates.title;
      if (updates.description !== undefined) apiUpdates.description = updates.description;
      if (updates.priority !== undefined) apiUpdates.priority = updates.priority;
      if (updates.status !== undefined) apiUpdates.status = updates.status;
      if (updates.dueDate !== undefined) apiUpdates.dueDate = updates.dueDate?.toISOString();
      if (updates.order !== undefined) apiUpdates.order = updates.order;
      if (updates.clientId !== undefined) apiUpdates.clientId = updates.clientId;

      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify(apiUpdates),
      });
    } catch (err) {
      console.error("Error updating task:", err);
    }
  }, [setTasksWithHistory, getAuthHeaders]);

  // Delete task (local + API)
  const deleteTask = useCallback(async (taskId: string) => {
    setTasksWithHistory(prevTasks => prevTasks.filter(task => task.id !== taskId));

    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  }, [setTasksWithHistory, getAuthHeaders]);

  // Add task (local only - for compatibility)
  const addTask = useCallback((task: Task) => {
    setTasksWithHistory(prevTasks => [...prevTasks, task]);
  }, [setTasksWithHistory]);

  // Create task and return it (API + local)
  const createTaskAndReturn = useCallback(async (data: CreateTaskData): Promise<Task | null> => {
    try {
      const headers = await getAuthHeaders("application/json");
      
      // Find client by name if clientId not provided
      let clientId = data.clientId;
      if (!clientId && data.clientName) {
        const client = clients.find(c => c.name.toLowerCase() === data.clientName?.toLowerCase());
        clientId = client?.id;
      }

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          title: data.title,
          priority: data.priority || "Normal",
          status: data.status || "To Do",
          dueDate: data.dueDate?.toISOString() || new Date().toISOString(),
          clientId: clientId || null,
          order: data.order ?? 0,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newTask = mapApiTaskToTask(result.task);
        
        // Add assignees from request (stored as names)
        if (data.assignees) {
          newTask.assignees = data.assignees;
        }
        
        setTasks(prev => [...prev, newTask]);
        return newTask;
      }
      return null;
    } catch (err) {
      console.error("Error creating task:", err);
      return null;
    }
  }, [getAuthHeaders, clients]);

  // Create task (API + local) - fire and forget version
  const createTask = useCallback(async (data: CreateTaskData) => {
    await createTaskAndReturn(data);
  }, [createTaskAndReturn]);

  // Get tasks by client
  const getTasksByClient = useCallback((clientNameOrId: string) => {
    return tasks.filter(task => 
      task.clientId === clientNameOrId ||
      task.clientName?.toLowerCase() === clientNameOrId.toLowerCase()
    );
  }, [tasks]);

  // Add history event to task
  const addTaskHistory = useCallback(async (taskId: string, type: string, content: string) => {
    try {
      const headers = await getAuthHeaders("application/json");
      const response = await fetch(`/api/tasks/${taskId}/history`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ type, content }),
      });

      if (response.ok) {
        const result = await response.json();
        const newEvent: TaskHistoryEvent = {
          id: result.historyEvent.id,
          type: result.historyEvent.type as TaskHistoryEvent["type"],
          content: result.historyEvent.content,
          author: "Você",
          timestamp: new Date(result.historyEvent.createdAt),
        };

        setTasks(prev => prev.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              history: [newEvent, ...(task.history || [])],
            };
          }
          return task;
        }));
      }
    } catch (err) {
      console.error("Error adding task history:", err);
    }
  }, [getAuthHeaders]);

  // Delete history event from task
  const deleteTaskHistory = useCallback(async (taskId: string, eventId: string) => {
    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/tasks/${taskId}/history/${eventId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      setTasks(prev => prev.map(task => {
        if (task.id === taskId && task.history) {
          return {
            ...task,
            history: task.history.filter(h => h.id !== eventId),
          };
        }
        return task;
      }));
    } catch (err) {
      console.error("Error deleting task history:", err);
    }
  }, [getAuthHeaders]);

  return (
    <TasksContext.Provider value={{
      tasks,
      isLoading,
      error,
      setTasks,
      setTasksWithHistory,
      updateTask,
      deleteTask,
      addTask,
      createTask,
      createTaskAndReturn,
      getTasksByClient,
      addTaskHistory,
      deleteTaskHistory,
      refetchTasks,
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
