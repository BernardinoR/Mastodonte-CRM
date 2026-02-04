import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Task, TaskStatus, TaskPriority, TaskType, TaskHistoryEvent } from "../types/task";
import { useClients } from "@features/clients";
import { useUsers } from "@features/users";
import { supabase } from "@/shared/lib/supabase";

// ============================================
// Supabase DB row types (snake_case)
// ============================================

interface DbTaskAssignee {
  user_id: number;
  user: { id: number; name: string | null };
}

interface DbTaskHistory {
  id: string;
  type: string;
  content: string;
  author_id: number | null;
  created_at: string;
  author: { name: string | null } | null;
}

interface DbTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  task_type: string;
  due_date: string | null;
  order: number;
  client_id: string | null;
  meeting_id: number | null;
  creator_id: number | null;
  created_at: string;
  updated_at: string;
  task_assignees: DbTaskAssignee[];
  task_history: DbTaskHistory[];
  client: { id: string; name: string; emails: string[]; phone: string | null } | null;
  creator: { name: string | null } | null;
}

// Map Supabase DB row → frontend Task type
function mapDbRowToTask(row: DbTask): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    priority: (row.priority as TaskPriority) || "Normal",
    status: (row.status as TaskStatus) || "To Do",
    taskType: (row.task_type as TaskType) || "Tarefa",
    dueDate: row.due_date ? new Date(row.due_date) : new Date(),
    order: row.order,
    clientId: row.client_id || undefined,
    clientName: row.client?.name,
    clientEmail: row.client?.emails?.[0],
    clientPhone: row.client?.phone || undefined,
    assignees: (row.task_assignees || []).map((a) => a.user?.name || "Unknown"),
    history: (row.task_history || []).map((h) => ({
      id: h.id,
      type: h.type as TaskHistoryEvent["type"],
      content: h.content,
      author: h.author?.name || "Sistema",
      timestamp: new Date(h.created_at),
    })),
  };
}

// Map frontend camelCase update fields → Supabase snake_case
const TASK_FIELD_MAP: Record<string, string> = {
  title: "title",
  description: "description",
  priority: "priority",
  status: "status",
  dueDate: "due_date",
  order: "order",
  clientId: "client_id",
  meetingId: "meeting_id",
  taskType: "task_type",
};

function mapTaskUpdatesToDb(updates: Record<string, unknown>): Record<string, unknown> {
  const dbUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    const dbKey = TASK_FIELD_MAP[key];
    if (dbKey) {
      dbUpdates[dbKey] = value;
    }
  }
  return dbUpdates;
}

// Supabase select query for tasks with relations
const TASK_SELECT = `
  *,
  task_assignees(user_id, user:users!user_id(id, name)),
  task_history(id, type, content, author_id, created_at, author:users!author_id(name)),
  client:clients!client_id(id, name, emails, phone),
  creator:users!creator_id(name)
`;

// ============================================
// Context
// ============================================

interface CreateTaskData {
  title: string;
  clientId?: string;
  clientName?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  taskType?: TaskType;
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
  createTask: (data: CreateTaskData) => Promise<Task | null>;
  createTaskAndReturn: (data: CreateTaskData) => Promise<Task | null>;
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

  // Fetch tasks from Supabase
  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("tasks")
        .select(TASK_SELECT)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const mappedTasks = ((data || []) as DbTask[]).map(mapDbRowToTask);
      setTasks(mappedTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const refetchTasks = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  // History management (local undo functionality)
  const setTasksWithHistory = useCallback((updater: (prev: Task[]) => Task[]) => {
    setTasks((prevTasks) => {
      const deepCopy = prevTasks.map((task) => ({
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
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo]);

  // Flush pending updates to Supabase
  const flushUpdate = useCallback(
    async (taskId: string) => {
      const updates = pendingUpdates.current.get(taskId);
      if (!updates) return;

      pendingUpdates.current.delete(taskId);
      debounceTimers.current.delete(taskId);

      try {
        const apiUpdates: Record<string, unknown> = {};

        if (updates.title !== undefined) apiUpdates.title = updates.title;
        if (updates.description !== undefined) apiUpdates.description = updates.description;
        if (updates.priority !== undefined) apiUpdates.priority = updates.priority;
        if (updates.status !== undefined) apiUpdates.status = updates.status;
        if (updates.taskType !== undefined) apiUpdates.taskType = updates.taskType;
        if (updates.dueDate !== undefined) apiUpdates.dueDate = updates.dueDate?.toISOString();
        if (updates.order !== undefined) apiUpdates.order = updates.order;
        if (updates.clientId !== undefined) apiUpdates.clientId = updates.clientId;

        // Task field updates via Supabase
        const dbUpdates = mapTaskUpdatesToDb(apiUpdates);
        if (Object.keys(dbUpdates).length > 0) {
          await supabase.from("tasks").update(dbUpdates).eq("id", taskId);
        }

        // Assignees update (separate table)
        if (updates.assignees !== undefined) {
          const assigneeIds: number[] = [];
          for (const name of updates.assignees) {
            const user = teamUsers.find((u) => u.name.toLowerCase() === name.toLowerCase());
            if (user) {
              assigneeIds.push(user.id);
            }
          }

          // Delete existing + insert new (atomic via sequential calls)
          await supabase.from("task_assignees").delete().eq("task_id", taskId);
          if (assigneeIds.length > 0) {
            await supabase
              .from("task_assignees")
              .insert(assigneeIds.map((userId) => ({ task_id: taskId, user_id: userId })));
          }
        }
      } catch (err) {
        console.error("Error updating task:", err);
      }
    },
    [teamUsers],
  );

  // Update task (local + Supabase com debounce)
  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      // Update local imediato
      setTasksWithHistory((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
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
    },
    [setTasksWithHistory, flushUpdate],
  );

  // Delete task (local + Supabase)
  const deleteTask = useCallback(
    async (taskId: string) => {
      setTasksWithHistory((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

      try {
        await supabase.from("tasks").delete().eq("id", taskId);
      } catch (err) {
        console.error("Error deleting task:", err);
      }
    },
    [setTasksWithHistory],
  );

  // Add task (local only - for compatibility)
  const addTask = useCallback(
    (task: Task) => {
      setTasksWithHistory((prevTasks) => [...prevTasks, task]);
    },
    [setTasksWithHistory],
  );

  // Sync task to Supabase (background)
  const syncTaskToApi = useCallback(
    async (tempId: string, data: CreateTaskData) => {
      try {
        // Find client by name if clientId not provided
        let clientId = data.clientId;
        if (!clientId && data.clientName) {
          const client = clients.find(
            (c) => c.name.toLowerCase() === data.clientName?.toLowerCase(),
          );
          clientId = client?.id;
        }

        // Convert assignee names to IDs
        const assigneeIds: number[] = [];
        if (data.assignees && data.assignees.length > 0) {
          for (const name of data.assignees) {
            const user = teamUsers.find((u) => u.name.toLowerCase() === name.toLowerCase());
            if (user) {
              assigneeIds.push(user.id);
            }
          }
        } else if (currentUser) {
          assigneeIds.push(currentUser.id);
        }

        // Insert task via Supabase
        const { data: created, error: insertError } = await supabase
          .from("tasks")
          .insert({
            title: data.title,
            priority: data.priority || "Normal",
            status: data.status || "To Do",
            task_type: data.taskType || "Tarefa",
            due_date: data.dueDate?.toISOString() || new Date().toISOString(),
            client_id: clientId || null,
            creator_id: currentUser?.id ?? null,
            order: data.order ?? 0,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        const realTaskId = created.id;

        // Insert assignees
        if (assigneeIds.length > 0) {
          await supabase
            .from("task_assignees")
            .insert(assigneeIds.map((userId) => ({ task_id: realTaskId, user_id: userId })));
        }

        // History is auto-created by trigger, fetch it
        const { data: historyData } = await supabase
          .from("task_history")
          .select("id, type, content, author_id, created_at, author:users!author_id(name)")
          .eq("task_id", realTaskId)
          .order("created_at", { ascending: false });

        // Supabase may return relation as array or object depending on FK inference
        const apiHistory: TaskHistoryEvent[] = (historyData || []).map(
          (h: Record<string, unknown>) => {
            const author = Array.isArray(h.author) ? h.author[0] : h.author;
            return {
              id: h.id as string,
              type: h.type as string as TaskHistoryEvent["type"],
              content: h.content as string,
              author: (author as { name: string | null } | null)?.name || "Sistema",
              timestamp: new Date(h.created_at as string),
            };
          },
        );

        // Pegar histórico pendente (adicionado localmente enquanto task era temp)
        let pendingHistory: TaskHistoryEvent[] = [];
        setTasks((prev) => {
          const tempTask = prev.find((t) => t.id === tempId);
          if (tempTask?.history) {
            pendingHistory = tempTask.history.filter((h) => h.id.startsWith("temp-"));
          }
          return prev.map((t) =>
            t.id === tempId
              ? {
                  ...t,
                  id: realTaskId,
                  _tempId: tempId,
                  history: [...apiHistory, ...pendingHistory],
                  syncStatus: undefined,
                }
              : t,
          );
        });

        pendingCreateData.current.delete(tempId);

        // Sincronizar histórico pendente com o ID real da task
        for (const historyEvent of pendingHistory) {
          try {
            const { data: newHistory, error: histError } = await supabase
              .from("task_history")
              .insert({
                task_id: realTaskId,
                type: historyEvent.type,
                content: historyEvent.content,
                author_id: currentUser?.id ?? null,
              })
              .select("id")
              .single();

            if (!histError && newHistory) {
              setTasks((prev) =>
                prev.map((t) => {
                  if (t.id === realTaskId && t.history) {
                    return {
                      ...t,
                      history: t.history.map((h) =>
                        h.id === historyEvent.id
                          ? { ...h, id: newHistory.id, syncStatus: undefined }
                          : h,
                      ),
                    };
                  }
                  return t;
                }),
              );
            }
          } catch (err) {
            console.error("Error syncing pending history:", err);
          }
        }
      } catch {
        // Marcar como erro
        setTasks((prev) =>
          prev.map((t) => (t.id === tempId ? { ...t, syncStatus: "error" as const } : t)),
        );
      }
    },
    [clients, teamUsers, currentUser],
  );

  // Retry sync for failed task
  const retryTaskSync = useCallback(
    (taskId: string) => {
      const data = pendingCreateData.current.get(taskId);
      if (!data) return;

      // Marcar como pending novamente
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, syncStatus: "pending" as const } : t)),
      );

      // Tentar novamente
      syncTaskToApi(taskId, data);
    },
    [syncTaskToApi],
  );

  // Create task and return it (aguarda resposta do servidor)
  const createTaskAndReturn = useCallback(
    async (data: CreateTaskData): Promise<Task | null> => {
      try {
        // Find client by name if clientId not provided
        let clientId = data.clientId;
        if (!clientId && data.clientName) {
          const client = clients.find(
            (c) => c.name.toLowerCase() === data.clientName?.toLowerCase(),
          );
          clientId = client?.id;
        }

        // Convert assignee names to IDs
        const assigneeIds: number[] = [];
        if (data.assignees && data.assignees.length > 0) {
          for (const name of data.assignees) {
            const user = teamUsers.find((u) => u.name.toLowerCase() === name.toLowerCase());
            if (user) {
              assigneeIds.push(user.id);
            }
          }
        } else if (currentUser) {
          assigneeIds.push(currentUser.id);
        }

        // Insert task via Supabase
        const { data: created, error: insertError } = await supabase
          .from("tasks")
          .insert({
            title: data.title,
            priority: data.priority || "Normal",
            status: data.status || "To Do",
            task_type: data.taskType || "Tarefa",
            due_date: data.dueDate?.toISOString() || new Date().toISOString(),
            client_id: clientId || null,
            creator_id: currentUser?.id ?? null,
            order: data.order ?? 0,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        const realTaskId = created.id;

        // Insert assignees
        if (assigneeIds.length > 0) {
          await supabase
            .from("task_assignees")
            .insert(assigneeIds.map((userId) => ({ task_id: realTaskId, user_id: userId })));
        }

        // Fetch the complete task with relations
        const { data: taskData, error: fetchError } = await supabase
          .from("tasks")
          .select(TASK_SELECT)
          .eq("id", realTaskId)
          .single();

        if (fetchError) throw fetchError;

        const newTask = mapDbRowToTask(taskData as DbTask);

        // Adicionar à lista após confirmação do servidor
        setTasks((prev) => [...prev, newTask]);

        return newTask;
      } catch (err) {
        console.error("Error creating task:", err);
        return null;
      }
    },
    [clients, teamUsers, currentUser],
  );

  // Create task (async version)
  const createTask = useCallback(
    async (data: CreateTaskData): Promise<Task | null> => {
      return createTaskAndReturn(data);
    },
    [createTaskAndReturn],
  );

  // Get tasks by client
  const getTasksByClient = useCallback(
    (clientNameOrId: string) => {
      return tasks.filter(
        (task) =>
          task.clientId === clientNameOrId ||
          task.clientName?.toLowerCase() === clientNameOrId.toLowerCase(),
      );
    },
    [tasks],
  );

  // Add history event to task (optimistic)
  const addTaskHistory = useCallback(
    (taskId: string, type: string, content: string) => {
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
        syncStatus: isTaskTemp ? undefined : "pending",
      };

      // Adicionar localmente
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              history: [tempEvent, ...(task.history || [])],
            };
          }
          return task;
        }),
      );

      // Não sincronizar se task ainda é temporária
      if (isTaskTemp) return;

      // Sync em background via Supabase
      (async () => {
        try {
          const { data: newHistory, error: insertError } = await supabase
            .from("task_history")
            .insert({
              task_id: taskId,
              type,
              content,
              author_id: currentUser?.id ?? null,
            })
            .select("id")
            .single();

          if (!insertError && newHistory) {
            // Substituir ID temporário pelo real
            setTasks((prev) =>
              prev.map((task) => {
                if (task.id === taskId && task.history) {
                  return {
                    ...task,
                    history: task.history.map((h) =>
                      h.id === tempId ? { ...h, id: newHistory.id, syncStatus: undefined } : h,
                    ),
                  };
                }
                return task;
              }),
            );
          } else {
            // Marcar como erro
            setTasks((prev) =>
              prev.map((task) => {
                if (task.id === taskId && task.history) {
                  return {
                    ...task,
                    history: task.history.map((h) =>
                      h.id === tempId ? { ...h, syncStatus: "error" as const } : h,
                    ),
                  };
                }
                return task;
              }),
            );
          }
        } catch {
          setTasks((prev) =>
            prev.map((task) => {
              if (task.id === taskId && task.history) {
                return {
                  ...task,
                  history: task.history.map((h) =>
                    h.id === tempId ? { ...h, syncStatus: "error" as const } : h,
                  ),
                };
              }
              return task;
            }),
          );
        }
      })();
    },
    [currentUser],
  );

  // Delete history event from task (optimistic)
  const deleteTaskHistory = useCallback((taskId: string, eventId: string) => {
    // Remover localmente imediatamente
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && task.history) {
          return {
            ...task,
            history: task.history.filter((h) => h.id !== eventId),
          };
        }
        return task;
      }),
    );

    // Ignorar eventos temporários (ainda não criados)
    if (eventId.startsWith("temp-")) return;

    // Sync em background via Supabase
    (async () => {
      try {
        await supabase.from("task_history").delete().eq("id", eventId);
      } catch {
        // Silencioso - item já foi removido da UI
      }
    })();
  }, []);

  const contextValue = useMemo(
    () => ({
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
    }),
    [
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
    ],
  );

  return <TasksContext.Provider value={contextValue}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
}
