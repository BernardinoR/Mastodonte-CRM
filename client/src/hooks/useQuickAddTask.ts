import { useCallback } from "react";
import type { Task, TaskStatus, TaskHistoryEvent } from "@/types/task";
import { MOCK_USERS } from "@/lib/mock-users";

interface UseQuickAddTaskProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onSetEditingTaskId: (taskId: string) => void;
}

interface UseQuickAddTaskReturn {
  handleQuickAdd: (status: TaskStatus) => void;
  handleQuickAddTop: (status: TaskStatus) => void;
  handleQuickAddAfter: (afterTaskId: string) => void;
}

function generateUniqueId(existingIds: Set<string>): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  let id = `task-${timestamp}-${random}`;
  
  while (existingIds.has(id)) {
    const newRandom = Math.random().toString(36).substring(2, 9);
    id = `task-${timestamp}-${newRandom}`;
  }
  
  return id;
}

export function useQuickAddTask({
  tasks,
  onAddTask,
  onSetEditingTaskId,
}: UseQuickAddTaskProps): UseQuickAddTaskReturn {
  const handleQuickAdd = useCallback((status: TaskStatus) => {
    const existingIds = new Set(tasks.map(t => t.id));
    const newId = generateUniqueId(existingIds);
    
    const statusTasks = tasks.filter(t => t.status === status);
    const maxOrder = statusTasks.reduce((max, t) => Math.max(max, t.order), -1);
    
    const defaultAssignee = MOCK_USERS[0]?.name || "";
    
    const createdEvent: TaskHistoryEvent = {
      id: `h-${newId}-created`,
      type: "created",
      content: "Tarefa criada",
      author: defaultAssignee || "Sistema",
      timestamp: new Date(),
    };
    
    const newTask: Task = {
      id: newId,
      title: "",
      status,
      assignees: defaultAssignee ? [defaultAssignee] : [],
      dueDate: new Date(),
      order: maxOrder + 1,
      notes: [],
      history: [createdEvent],
    };
    
    onAddTask(newTask);
    onSetEditingTaskId(newTask.id);
  }, [tasks, onAddTask, onSetEditingTaskId]);

  const handleQuickAddTop = useCallback((status: TaskStatus) => {
    const existingIds = new Set(tasks.map(t => t.id));
    const newId = generateUniqueId(existingIds);
    
    const statusTasks = tasks.filter(t => t.status === status);
    const minOrder = statusTasks.reduce((min, t) => Math.min(min, t.order), 1);
    
    const defaultAssignee = MOCK_USERS[0]?.name || "";
    
    const createdEvent: TaskHistoryEvent = {
      id: `h-${newId}-created`,
      type: "created",
      content: "Tarefa criada",
      author: defaultAssignee || "Sistema",
      timestamp: new Date(),
    };
    
    const newTask: Task = {
      id: newId,
      title: "",
      status,
      assignees: defaultAssignee ? [defaultAssignee] : [],
      dueDate: new Date(),
      order: minOrder - 1,
      notes: [],
      history: [createdEvent],
    };
    
    onAddTask(newTask);
    onSetEditingTaskId(newTask.id);
  }, [tasks, onAddTask, onSetEditingTaskId]);

  const handleQuickAddAfter = useCallback((afterTaskId: string) => {
    const existingIds = new Set(tasks.map(t => t.id));
    const newId = generateUniqueId(existingIds);
    
    const afterTask = tasks.find(t => t.id === afterTaskId);
    if (!afterTask) return;
    
    const defaultAssignee = MOCK_USERS[0]?.name || "";
    
    const createdEvent: TaskHistoryEvent = {
      id: `h-${newId}-created`,
      type: "created",
      content: "Tarefa criada",
      author: defaultAssignee || "Sistema",
      timestamp: new Date(),
    };
    
    const newTask: Task = {
      id: newId,
      title: "",
      status: afterTask.status,
      assignees: defaultAssignee ? [defaultAssignee] : [],
      dueDate: new Date(),
      order: afterTask.order + 0.5,
      notes: [],
      history: [createdEvent],
    };
    
    onAddTask(newTask);
    onSetEditingTaskId(newTask.id);
  }, [tasks, onAddTask, onSetEditingTaskId]);

  return { handleQuickAdd, handleQuickAddTop, handleQuickAddAfter };
}
