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
import { useUsers, useCurrentUser } from "@features/users";
import { supabase } from "@/shared/lib/supabase";
import { safeRemoveChannel } from "@/shared/lib/safeRemoveChannel";
import { useVisibilityChange } from "@/shared/hooks";
import { parseLocalDate, formatLocalDate } from "@/shared/lib/date-utils";

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
  meeting: {
    id: number;
    title: string;
    date: string;
    type: string;
    client: { name: string } | null;
  } | null;
  creator: { name: string | null } | null;
}

function sortHistoryDesc(events: TaskHistoryEvent[]): TaskHistoryEvent[] {
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
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
    dueDate: row.due_date ? parseLocalDate(row.due_date.substring(0, 10)) : new Date(),
    order: row.order,
    clientId: row.client_id || undefined,
    clientName: row.client?.name,
    clientEmail: row.client?.emails?.[0],
    clientPhone: row.client?.phone || undefined,
    meetingId: row.meeting_id || undefined,
    meeting: row.meeting
      ? {
          id: row.meeting.id,
          title: row.meeting.title,
          date: new Date(row.meeting.date),
          type: row.meeting.type,
          clientName: row.meeting.client?.name,
        }
      : undefined,
    assignees: (row.task_assignees || []).map((a) => a.user?.name || "Unknown"),
    history: sortHistoryDesc(
      (row.task_history || []).map((h) => ({
        id: h.id,
        type: h.type as TaskHistoryEvent["type"],
        content: h.content,
        author: h.author?.name || "Sistema",
        timestamp: new Date(h.created_at),
      })),
    ),
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
  meeting:meetings!meeting_id(id, title, date, type, client:clients!client_id(name)),
  creator:users!creator_id(name)
`;

// ============================================
// Context
// ============================================

interface CreateTaskData {
  title: string;
  clientId?: string;
  clientName?: string;
  meetingId?: number;
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
  updateTask: (
    taskId: string,
    updates: Partial<Task>,
    options?: { skipLocalState?: boolean },
  ) => void;
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
  const { data: currentUserData } = useCurrentUser();
  const activeRole = currentUserData?.user?.activeRole ?? null;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<Task[][]>([]);

  // Guardar dados de criação pendentes para retry
  const pendingCreateData = useRef<Map<string, CreateTaskData>>(new Map());

  // Debounce para updates - acumular edições rápidas
  const pendingUpdates = useRef<Map<string, Partial<Task>>>(new Map());
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Track recently flushed task IDs to avoid processing our own realtime events
  const recentlyFlushedRef = useRef<Set<string>>(new Set());
  const realtimeFetchTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Fetch tasks from Supabase
  const fetchTasks = useCallback(async () => {
    // Flush all pending debounced updates before fetching so we don't overwrite them
    Array.from(debounceTimers.current.entries()).forEach(([taskId, timer]) => {
      clearTimeout(timer);
      debounceTimers.current.delete(taskId);
    });
    const flushPromises: Promise<void>[] = [];
    Array.from(pendingUpdates.current.keys()).forEach((taskId) => {
      if (flushUpdateRef.current) {
        flushPromises.push(flushUpdateRef.current(taskId));
      }
    });
    if (flushPromises.length > 0) {
      await Promise.all(flushPromises);
    }

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

  // Refs to stabilize activeRole effect and avoid spurious refetches
  const fetchTasksRef = useRef(fetchTasks);
  fetchTasksRef.current = fetchTasks;
  const prevActiveRoleRef = useRef(activeRole);

  // Load tasks on mount and when active role actually changes value
  useEffect(() => {
    if (prevActiveRoleRef.current !== activeRole) {
      prevActiveRoleRef.current = activeRole;
      fetchTasksRef.current();
    }
  }, [activeRole]);

  // Initial load on mount
  useEffect(() => {
    fetchTasksRef.current();
  }, []);

  // ============================================
  // Real-time handler for cross-user sync
  // ============================================
  const handleRealtimeTaskChange = useCallback((taskId: string, eventType: string) => {
    // Skip our own changes
    if (recentlyFlushedRef.current.has(taskId)) {
      console.debug("[Realtime] Skipping own change for task:", taskId);
      return;
    }
    // Skip tasks with pending local updates
    if (pendingUpdates.current.has(taskId)) {
      console.debug("[Realtime] Skipping task with pending updates:", taskId);
      return;
    }

    console.log("[Realtime] Processing event:", eventType, "for task:", taskId);

    if (eventType === "DELETE") {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      return;
    }

    // Debounce multiple rapid events for the same task
    const existing = realtimeFetchTimers.current.get(taskId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      realtimeFetchTimers.current.delete(taskId);
      const updatedTask = await fetchSingleTaskRef.current?.(taskId);
      if (!updatedTask) {
        console.warn(
          "[Realtime] Could not fetch updated task:",
          taskId,
          "- may be RLS or network issue",
        );
        return;
      }

      setTasks((prev) => {
        const idx = prev.findIndex((t) => t.id === taskId);
        if (idx >= 0) {
          const newTasks = [...prev];
          newTasks[idx] = updatedTask;
          return newTasks;
        }
        // New task (created by another user)
        return [updatedTask, ...prev];
      });
    }, 300);

    realtimeFetchTimers.current.set(taskId, timer);
  }, []);

  const handleRealtimeRef = useRef(handleRealtimeTaskChange);
  handleRealtimeRef.current = handleRealtimeTaskChange;

  // Real-time subscription for cross-user sync (with reconnection logic)
  const reconnectAttemptsRef = useRef(0);
  const tasksChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const unmountedRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const createTasksChannel = useCallback(() => {
    const MAX_BACKOFF = 30_000;

    const channel = supabase
      .channel(`tasks-realtime-${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, (payload) => {
        console.debug("[Realtime] Event received on tasks table:", payload.eventType);
        const taskId =
          (payload.new as Record<string, unknown>)?.id ||
          (payload.old as Record<string, unknown>)?.id;
        if (taskId) handleRealtimeRef.current?.(taskId as string, payload.eventType);
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "task_assignees" },
        (payload) => {
          console.debug("[Realtime] Event received on task_assignees table:", payload.eventType);
          const taskId =
            (payload.new as Record<string, unknown>)?.task_id ||
            (payload.old as Record<string, unknown>)?.task_id;
          if (taskId) handleRealtimeRef.current?.(taskId as string, "UPDATE");
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "task_history" },
        (payload) => {
          console.debug("[Realtime] Event received on task_history table:", payload.eventType);
          const taskId =
            (payload.new as Record<string, unknown>)?.task_id ||
            (payload.old as Record<string, unknown>)?.task_id;
          if (taskId) handleRealtimeRef.current?.(taskId as string, "UPDATE");
        },
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("[Realtime] Connected to tasks channel");
          reconnectAttemptsRef.current = 0;
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          const label =
            status === "CHANNEL_ERROR"
              ? "Channel error"
              : status === "TIMED_OUT"
                ? "Subscription timed out"
                : "Channel closed";
          console.warn(`[Realtime] ${label}:`, err?.message ?? "");

          if (unmountedRef.current) return;

          // Remove the failed channel and schedule a reconnect
          safeRemoveChannel(channel);
          if (tasksChannelRef.current === channel) tasksChannelRef.current = null;

          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), MAX_BACKOFF);
          console.log(
            `[Realtime] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`,
          );
          reconnectTimerRef.current = setTimeout(() => {
            if (!unmountedRef.current) {
              tasksChannelRef.current = createTasksChannel();
            }
          }, delay);
        }
      });

    tasksChannelRef.current = channel;
    return channel;
  }, []);

  useEffect(() => {
    unmountedRef.current = false;
    createTasksChannel();

    return () => {
      unmountedRef.current = true;
      clearTimeout(reconnectTimerRef.current);
      safeRemoveChannel(tasksChannelRef.current);
      tasksChannelRef.current = null;
      // Clear any pending realtime fetch timers
      realtimeFetchTimers.current.forEach((timer) => clearTimeout(timer));
      realtimeFetchTimers.current.clear();
    };
  }, [createTasksChannel]);

  // Tear down channel when tab is hidden, recreate + refetch when visible
  useVisibilityChange({
    onHidden: () => {
      clearTimeout(reconnectTimerRef.current);
      safeRemoveChannel(tasksChannelRef.current);
      tasksChannelRef.current = null;
    },
    onVisible: () => {
      if (!tasksChannelRef.current) {
        createTasksChannel();
      }
      fetchTasksRef.current();
    },
  });

  const refetchTasks = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  // Fetch a single task with all relations (used by realtime handler)
  const fetchSingleTask = useCallback(async (taskId: string): Promise<Task | null> => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(TASK_SELECT)
        .eq("id", taskId)
        .single();

      if (error || !data) {
        console.warn("[Realtime] fetchSingleTask failed for", taskId, error?.message);
        return null;
      }
      return mapDbRowToTask(data as DbTask);
    } catch {
      return null;
    }
  }, []);

  const fetchSingleTaskRef = useRef(fetchSingleTask);
  fetchSingleTaskRef.current = fetchSingleTask;

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

  // Ref to flushUpdate so fetchTasks can call it without dependency issues
  const flushUpdateRef = useRef<(taskId: string) => Promise<void>>();

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
        if (updates.dueDate !== undefined)
          apiUpdates.dueDate = updates.dueDate ? formatLocalDate(updates.dueDate) : null;
        if (updates.order !== undefined) apiUpdates.order = updates.order;
        if (updates.clientId !== undefined) apiUpdates.clientId = updates.clientId;
        if (updates.meetingId !== undefined) apiUpdates.meetingId = updates.meetingId;

        // Task field updates via Supabase
        const dbUpdates = mapTaskUpdatesToDb(apiUpdates);
        if (Object.keys(dbUpdates).length > 0) {
          await supabase.from("tasks").update(dbUpdates).eq("id", taskId);
        }

        // Mark as recently flushed to ignore our own realtime events
        recentlyFlushedRef.current.add(taskId);
        setTimeout(() => {
          recentlyFlushedRef.current.delete(taskId);
        }, 2000);

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

  // Keep ref in sync with latest flushUpdate
  flushUpdateRef.current = flushUpdate;

  // Update task (local + Supabase com debounce)
  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>, options?: { skipLocalState?: boolean }) => {
      // Update local imediato (skip se drag já fez isso)
      if (!options?.skipLocalState) {
        setTasksWithHistory((prevTasks) =>
          prevTasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
        );
      }

      // Acumular updates (inclusive para tasks temporárias)
      const currentUpdates = pendingUpdates.current.get(taskId) || {};
      pendingUpdates.current.set(taskId, { ...currentUpdates, ...updates });

      // Não flush tasks temporárias (serão flushed após sync)
      if (taskId.startsWith("temp-")) return;

      // Cancelar timer anterior se existir
      const existingTimer = debounceTimers.current.get(taskId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Status and date changes: flush immediately to prevent race conditions
      if (updates.status !== undefined || updates.dueDate !== undefined) {
        flushUpdate(taskId);
        return;
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
        // Mark as recently flushed to ignore our own realtime events
        recentlyFlushedRef.current.add(taskId);
        setTimeout(() => {
          recentlyFlushedRef.current.delete(taskId);
        }, 2000);

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
      if (!currentUser) {
        console.error("Cannot create task: current user not loaded");
        setTasks((prev) =>
          prev.map((t) => (t.id === tempId ? { ...t, syncStatus: "error" as const } : t)),
        );
        return;
      }

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
            due_date: data.dueDate ? formatLocalDate(data.dueDate) : formatLocalDate(new Date()),
            client_id: clientId || null,
            meeting_id: data.meetingId || null,
            creator_id: currentUser.id,
            order: data.order ?? 0,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        const realTaskId = created.id;

        // Mark as recently flushed to ignore our own realtime events
        recentlyFlushedRef.current.add(realTaskId);
        setTimeout(() => {
          recentlyFlushedRef.current.delete(realTaskId);
        }, 2000);

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

        // Re-fetch da task completa com todas as relações (meeting, client, assignees)
        const { data: fullRow } = await supabase
          .from("tasks")
          .select(TASK_SELECT)
          .eq("id", realTaskId)
          .single();

        // Pegar histórico pendente (adicionado localmente enquanto task era temp)
        let pendingHistory: TaskHistoryEvent[] = [];
        // Pegar edições pendentes feitas durante estado temp
        const pendingEdits = pendingUpdates.current.get(tempId);

        setTasks((prev) => {
          const tempTask = prev.find((t) => t.id === tempId);
          if (tempTask?.history) {
            pendingHistory = tempTask.history.filter((h) => h.id.startsWith("temp-"));
          }
          const mapped = fullRow ? mapDbRowToTask(fullRow as DbTask) : null;
          return prev.map((t) =>
            t.id === tempId
              ? {
                  ...t, // Keep local state (order, priority, dueDate, status, title etc.)
                  ...(pendingEdits || {}), // Apply pending edits
                  id: realTaskId, // Update to real ID
                  _tempId: tempId,
                  syncStatus: undefined, // Mark as synced
                  // Only bring DB-enrichment fields from mapped (fields not present on optimistic task):
                  ...(mapped
                    ? {
                        clientEmail: mapped.clientEmail,
                        clientPhone: mapped.clientPhone,
                        meeting: mapped.meeting,
                        assignees: mapped.assignees,
                      }
                    : {}),
                  history: sortHistoryDesc([...(mapped?.history || apiHistory), ...pendingHistory]),
                }
              : t,
          );
        });

        // Flush edições pendentes para API com ID real
        if (pendingEdits) {
          pendingUpdates.current.delete(tempId);
          pendingUpdates.current.set(realTaskId, pendingEdits);
          flushUpdate(realTaskId);
        }

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

  // Create task and return it (optimistic - retorna imediatamente com temp ID)
  const createTaskAndReturn = useCallback(
    (data: CreateTaskData): Promise<Task | null> => {
      if (!currentUser) {
        console.error("Cannot create task: current user not loaded");
        return Promise.resolve(null);
      }

      // Gerar temp ID compatível com verificações existentes
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      // Resolver client info localmente
      let resolvedClientId = data.clientId;
      let resolvedClientName = data.clientName;
      if (!resolvedClientId && data.clientName) {
        const client = clients.find((c) => c.name.toLowerCase() === data.clientName?.toLowerCase());
        resolvedClientId = client?.id;
        resolvedClientName = client?.name || data.clientName;
      } else if (resolvedClientId && !resolvedClientName) {
        const client = clients.find((c) => c.id === resolvedClientId);
        resolvedClientName = client?.name;
      }

      // Resolver nomes de assignees
      const resolvedAssignees =
        data.assignees && data.assignees.length > 0 ? data.assignees : [currentUser.name];

      // Criar task optimística
      const optimisticTask: Task = {
        id: tempId,
        title: data.title,
        clientId: resolvedClientId,
        clientName: resolvedClientName,
        priority: data.priority || "Normal",
        status: data.status || "To Do",
        taskType: data.taskType || "Tarefa",
        assignees: resolvedAssignees,
        dueDate: data.dueDate || new Date(),
        order: data.order ?? 0,
        meetingId: data.meetingId,
        syncStatus: "pending",
        _tempId: tempId,
      };

      // Adicionar ao state imediatamente (com suporte a undo)
      setTasksWithHistory((prev) => [...prev, optimisticTask]);

      // Guardar dados para retry
      pendingCreateData.current.set(tempId, data);

      // Sync em background
      syncTaskToApi(tempId, data);

      return Promise.resolve(optimisticTask);
    },
    [clients, currentUser, setTasksWithHistory, syncTaskToApi],
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
          // Mark as recently flushed to ignore our own realtime events
          recentlyFlushedRef.current.add(taskId);
          setTimeout(() => {
            recentlyFlushedRef.current.delete(taskId);
          }, 2000);

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
        // Mark as recently flushed to ignore our own realtime events
        recentlyFlushedRef.current.add(taskId);
        setTimeout(() => {
          recentlyFlushedRef.current.delete(taskId);
        }, 2000);

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
