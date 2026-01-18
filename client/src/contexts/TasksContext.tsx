import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@clerk/clerk-react";
import type { Task, TaskStatus, TaskPriority, TaskHistoryEvent } from "@/types/task";
import { useClients } from "@/contexts/ClientsContext";
import { useUsers } from "@/contexts/UsersContext";

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
  createTaskAndReturn: (data: CreateTaskData) => Task;
  retryTaskSync: (taskId: string) => void;
  getTasksByClient: (clientNameOrId: string) => Task[];
  addTaskHistory: (taskId: string, type: string, content: string) => void;
  deleteTaskHistory: (taskId: string, eventId: string) => void;
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
  const { teamUsers, currentUser } = useUsers();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<Task[][]>([]);
  
  // Guardar dados de criação pendentes para retry
  const pendingCreateData = useRef<Map<string, CreateTaskData>>(new Map());
  
  // Debounce para updates - acumular edições rápidas
  const pendingUpdates = useRef<Map<string, Partial<Task>>>(new Map());
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

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

  // Flush pending updates to API
  const flushUpdate = useCallback(async (taskId: string) => {
    const updates = pendingUpdates.current.get(taskId);
    if (!updates) return;
    
    pendingUpdates.current.delete(taskId);
    debounceTimers.current.delete(taskId);
    
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
      
      // Converter assignees (nomes) para assigneeIds (IDs numéricos)
      if (updates.assignees !== undefined) {
        const assigneeIds: number[] = [];
        for (const name of updates.assignees) {
          const user = teamUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
          if (user) {
            assigneeIds.push(user.id);
          }
        }
        apiUpdates.assigneeIds = assigneeIds;
      }

      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify(apiUpdates),
      });
    } catch (err) {
      console.error("Error updating task:", err);
    }
  }, [getAuthHeaders, teamUsers]);

  // Update task (local + API com debounce)
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    // Update local imediato
    setTasksWithHistory(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
    
    // Ignorar tasks temporárias (ainda não criadas na API)
    if (taskId.startsWith("temp-")) return;
    
    // Acumular updates
    const currentUpdates = pendingUpdates.current.get(taskId) || {};
    pendingUpdates.current.set(taskId, { ...currentUpdates, ...updates });
    
    // Cancelar timer anterior se existir
    const existingTimer = debounceTimers.current.get(taskId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Debounce - enviar após 500ms sem novas edições
    const timer = setTimeout(() => {
      flushUpdate(taskId);
    }, 500);
    debounceTimers.current.set(taskId, timer);
  }, [setTasksWithHistory, flushUpdate]);

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

  // Sync task to API (background)
  const syncTaskToApi = useCallback(async (tempId: string, data: CreateTaskData) => {
    try {
      const headers = await getAuthHeaders("application/json");
      
      // Find client by name if clientId not provided
      let clientId = data.clientId;
      if (!clientId && data.clientName) {
        const client = clients.find(c => c.name.toLowerCase() === data.clientName?.toLowerCase());
        clientId = client?.id;
      }

      // Convert assignee names to IDs
      const assigneeIds: number[] = [];
      if (data.assignees && data.assignees.length > 0) {
        for (const name of data.assignees) {
          const user = teamUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
          if (user) {
            assigneeIds.push(user.id);
          }
        }
      } else if (currentUser) {
        assigneeIds.push(currentUser.id);
      }

      const requestBody = {
        title: data.title,
        priority: data.priority || "Normal",
        status: data.status || "To Do",
        dueDate: data.dueDate?.toISOString() || new Date().toISOString(),
        clientId: clientId || null,
        order: data.order ?? 0,
        assigneeIds: assigneeIds.length > 0 ? assigneeIds : undefined,
      };

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        const realTaskId = result.task.id;
        
        // Converter histórico da API para formato do frontend
        const apiHistory: TaskHistoryEvent[] = (result.task.history || []).map((h: ApiTaskHistory) => ({
          id: h.id,
          type: h.type as TaskHistoryEvent["type"],
          content: h.content,
          author: h.author?.name || "Sistema",
          timestamp: new Date(h.createdAt),
        }));
        
        // Pegar histórico pendente (adicionado localmente enquanto task era temp)
        let pendingHistory: TaskHistoryEvent[] = [];
        setTasks(prev => {
          const tempTask = prev.find(t => t.id === tempId);
          if (tempTask?.history) {
            // Pegar eventos de histórico que foram adicionados localmente (com ID temp-)
            pendingHistory = tempTask.history.filter(h => h.id.startsWith("temp-"));
          }
          // Mesclar histórico da API com pendente local
          return prev.map(t => 
            t.id === tempId 
              ? { ...t, id: realTaskId, _tempId: tempId, history: [...apiHistory, ...pendingHistory], syncStatus: undefined } 
              : t
          );
        });
        
        pendingCreateData.current.delete(tempId);
        
        // Sincronizar histórico pendente com o ID real da task
        for (const historyEvent of pendingHistory) {
          try {
            const historyResponse = await fetch(`/api/tasks/${realTaskId}/history`, {
              method: "POST",
              headers,
              credentials: "include",
              body: JSON.stringify({ type: historyEvent.type, content: historyEvent.content }),
            });
            
            if (historyResponse.ok) {
              const historyResult = await historyResponse.json();
              // Atualizar ID do histórico
              setTasks(prev => prev.map(t => {
                if (t.id === realTaskId && t.history) {
                  return {
                    ...t,
                    history: t.history.map(h => 
                      h.id === historyEvent.id 
                        ? { ...h, id: historyResult.historyEvent.id, syncStatus: undefined }
                        : h
                    ),
                  };
                }
                return t;
              }));
            }
          } catch (err) {
            console.error("Error syncing pending history:", err);
          }
        }
      } else {
        // Marcar como erro
        setTasks(prev => prev.map(t => 
          t.id === tempId ? { ...t, syncStatus: "error" as const } : t
        ));
      }
    } catch {
      // Marcar como erro
      setTasks(prev => prev.map(t => 
        t.id === tempId ? { ...t, syncStatus: "error" as const } : t
      ));
    }
  }, [getAuthHeaders, clients, teamUsers, currentUser]);

  // Retry sync for failed task
  const retryTaskSync = useCallback((taskId: string) => {
    const data = pendingCreateData.current.get(taskId);
    if (!data) return;
    
    // Marcar como pending novamente
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, syncStatus: "pending" as const } : t
    ));
    
    // Tentar novamente
    syncTaskToApi(taskId, data);
  }, [syncTaskToApi]);

  // Create task and return it (optimistic - instantâneo)
  const createTaskAndReturn = useCallback((data: CreateTaskData): Task => {
    const tempId = `temp-${Date.now()}`;
    
    // Resolver assignees localmente
    const assigneeNames = data.assignees?.length 
      ? data.assignees 
      : currentUser ? [currentUser.name] : [];
    
    // Criar tarefa local imediatamente
    const tempTask: Task = {
      id: tempId,
      title: data.title,
      priority: data.priority || "Normal",
      status: data.status || "To Do",
      dueDate: data.dueDate || new Date(),
      order: data.order ?? 0,
      assignees: assigneeNames,
      history: [],
      syncStatus: "pending",
    };
    
    // Guardar dados para retry
    pendingCreateData.current.set(tempId, data);
    
    // Adicionar imediatamente à lista
    setTasks(prev => [...prev, tempTask]);
    
    // Sync em background (sem await)
    syncTaskToApi(tempId, data);
    
    return tempTask; // Retorna instantaneamente
  }, [currentUser, syncTaskToApi]);

  // Create task (fire and forget version)
  const createTask = useCallback((data: CreateTaskData) => {
    createTaskAndReturn(data);
  }, [createTaskAndReturn]);

  // Get tasks by client
  const getTasksByClient = useCallback((clientNameOrId: string) => {
    return tasks.filter(task => 
      task.clientId === clientNameOrId ||
      task.clientName?.toLowerCase() === clientNameOrId.toLowerCase()
    );
  }, [tasks]);

  // Add history event to task (optimistic)
  const addTaskHistory = useCallback((taskId: string, type: string, content: string) => {
    const tempId = `temp-history-${Date.now()}`;
    
    // Verificar se task ainda não foi sincronizada
    const isTaskTemp = taskId.startsWith("temp-");
    
    // Criar evento local imediatamente
    const tempEvent: TaskHistoryEvent = {
      id: tempId,
      type: type as TaskHistoryEvent["type"],
      content,
      author: "Você",
      timestamp: new Date(),
      // Se task é temp, histórico fica local até task sincronizar
      syncStatus: isTaskTemp ? undefined : "pending",
    };
    
    // Adicionar localmente
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          history: [tempEvent, ...(task.history || [])],
        };
      }
      return task;
    }));
    
    // Não sincronizar se task ainda é temporária
    if (isTaskTemp) {
      console.log("[addTaskHistory] Task ainda não sincronizada, histórico mantido localmente");
      return;
    }
    
    // Sync em background
    (async () => {
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
          // Substituir ID temporário pelo real
          setTasks(prev => prev.map(task => {
            if (task.id === taskId && task.history) {
              return {
                ...task,
                history: task.history.map(h => 
                  h.id === tempId 
                    ? { ...h, id: result.historyEvent.id, syncStatus: undefined }
                    : h
                ),
              };
            }
            return task;
          }));
        } else {
          // Marcar como erro
          setTasks(prev => prev.map(task => {
            if (task.id === taskId && task.history) {
              return {
                ...task,
                history: task.history.map(h => 
                  h.id === tempId ? { ...h, syncStatus: "error" as const } : h
                ),
              };
            }
            return task;
          }));
        }
      } catch {
        // Marcar como erro
        setTasks(prev => prev.map(task => {
          if (task.id === taskId && task.history) {
            return {
              ...task,
              history: task.history.map(h => 
                h.id === tempId ? { ...h, syncStatus: "error" as const } : h
              ),
            };
          }
          return task;
        }));
      }
    })();
  }, [getAuthHeaders]);

  // Delete history event from task (optimistic)
  const deleteTaskHistory = useCallback((taskId: string, eventId: string) => {
    // Remover localmente imediatamente
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && task.history) {
        return {
          ...task,
          history: task.history.filter(h => h.id !== eventId),
        };
      }
      return task;
    }));
    
    // Ignorar eventos temporários (ainda não criados na API)
    if (eventId.startsWith("temp-")) return;
    
    // Sync em background (silencioso - item já foi removido da UI)
    (async () => {
      try {
        const headers = await getAuthHeaders();
        await fetch(`/api/tasks/${taskId}/history/${eventId}`, {
          method: "DELETE",
          headers,
          credentials: "include",
        });
      } catch {
        // Silencioso - item já foi removido da UI
      }
    })();
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
      retryTaskSync,
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
