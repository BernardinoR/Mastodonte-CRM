import { useCallback } from "react";
import type { Task, TaskStatus } from "../types/task";
import { useUsers } from "@features/users";
import { useTasks } from "../contexts/TasksContext";

interface UseQuickAddTaskProps {
  tasks: Task[];
  onSetEditingTaskId: (taskId: string) => void;
}

interface UseQuickAddTaskReturn {
  handleQuickAdd: (status: TaskStatus) => Promise<void>;
  handleQuickAddTop: (status: TaskStatus) => Promise<void>;
  handleQuickAddAfter: (afterTaskId: string) => Promise<void>;
}

export function useQuickAddTask({
  tasks,
  onSetEditingTaskId,
}: UseQuickAddTaskProps): UseQuickAddTaskReturn {
  const { currentUser } = useUsers();
  const { createTaskAndReturn } = useTasks();
  
  const handleQuickAdd = useCallback(async (status: TaskStatus) => {
    const statusTasks = tasks.filter(t => t.status === status);
    const maxOrder = statusTasks.reduce((max, t) => Math.max(max, t.order), -1);
    
    const defaultAssignee = currentUser?.name || "";
    
    // Create task (aguarda resposta do servidor)
    const newTask = await createTaskAndReturn({
      title: "Nova tarefa",
      status,
      priority: "Normal",
      assignees: defaultAssignee ? [defaultAssignee] : [],
      dueDate: new Date(),
      order: maxOrder + 1,
    });
    
    if (newTask) {
      onSetEditingTaskId(newTask.id);
    }
  }, [tasks, onSetEditingTaskId, currentUser, createTaskAndReturn]);

  const handleQuickAddTop = useCallback(async (status: TaskStatus) => {
    const statusTasks = tasks.filter(t => t.status === status);
    const minOrder = statusTasks.reduce((min, t) => Math.min(min, t.order), 1);
    
    const defaultAssignee = currentUser?.name || "";
    
    // Create task (aguarda resposta do servidor)
    const newTask = await createTaskAndReturn({
      title: "Nova tarefa",
      status,
      priority: "Normal",
      assignees: defaultAssignee ? [defaultAssignee] : [],
      dueDate: new Date(),
      order: minOrder - 1,
    });
    
    if (newTask) {
      onSetEditingTaskId(newTask.id);
    }
  }, [tasks, onSetEditingTaskId, currentUser, createTaskAndReturn]);

  const handleQuickAddAfter = useCallback(async (afterTaskId: string) => {
    const afterTask = tasks.find(t => t.id === afterTaskId);
    if (!afterTask) return;
    
    const defaultAssignee = currentUser?.name || "";
    
    // Create task (aguarda resposta do servidor)
    const newTask = await createTaskAndReturn({
      title: "Nova tarefa",
      status: afterTask.status,
      priority: "Normal",
      assignees: defaultAssignee ? [defaultAssignee] : [],
      dueDate: new Date(),
      order: afterTask.order + 0.5,
    });
    
    if (newTask) {
      onSetEditingTaskId(newTask.id);
    }
  }, [tasks, onSetEditingTaskId, currentUser, createTaskAndReturn]);

  return { handleQuickAdd, handleQuickAddTop, handleQuickAddAfter };
}
