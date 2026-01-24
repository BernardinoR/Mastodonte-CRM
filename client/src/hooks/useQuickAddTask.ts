import { useCallback } from "react";
import type { Task, TaskStatus } from "@/types/task";
import { useUsers } from "@features/users";
import { useTasks } from "@/contexts/TasksContext";

interface UseQuickAddTaskProps {
  tasks: Task[];
  onSetEditingTaskId: (taskId: string) => void;
}

interface UseQuickAddTaskReturn {
  handleQuickAdd: (status: TaskStatus) => void;
  handleQuickAddTop: (status: TaskStatus) => void;
  handleQuickAddAfter: (afterTaskId: string) => void;
}

export function useQuickAddTask({
  tasks,
  onSetEditingTaskId,
}: UseQuickAddTaskProps): UseQuickAddTaskReturn {
  const { currentUser } = useUsers();
  const { createTaskAndReturn } = useTasks();
  
  const handleQuickAdd = useCallback((status: TaskStatus) => {
    const statusTasks = tasks.filter(t => t.status === status);
    const maxOrder = statusTasks.reduce((max, t) => Math.max(max, t.order), -1);
    
    const defaultAssignee = currentUser?.name || "";
    
    // Create task (optimistic - instantâneo)
    const newTask = createTaskAndReturn({
      title: "Nova tarefa",
      status,
      priority: "Normal",
      assignees: defaultAssignee ? [defaultAssignee] : [],
      dueDate: new Date(),
      order: maxOrder + 1,
    });
    
    onSetEditingTaskId(newTask.id);
  }, [tasks, onSetEditingTaskId, currentUser, createTaskAndReturn]);

  const handleQuickAddTop = useCallback((status: TaskStatus) => {
    const statusTasks = tasks.filter(t => t.status === status);
    const minOrder = statusTasks.reduce((min, t) => Math.min(min, t.order), 1);
    
    const defaultAssignee = currentUser?.name || "";
    
    // Create task (optimistic - instantâneo)
    const newTask = createTaskAndReturn({
      title: "Nova tarefa",
      status,
      priority: "Normal",
      assignees: defaultAssignee ? [defaultAssignee] : [],
      dueDate: new Date(),
      order: minOrder - 1,
    });
    
    onSetEditingTaskId(newTask.id);
  }, [tasks, onSetEditingTaskId, currentUser, createTaskAndReturn]);

  const handleQuickAddAfter = useCallback((afterTaskId: string) => {
    const afterTask = tasks.find(t => t.id === afterTaskId);
    if (!afterTask) return;
    
    const defaultAssignee = currentUser?.name || "";
    
    // Create task (optimistic - instantâneo)
    const newTask = createTaskAndReturn({
      title: "Nova tarefa",
      status: afterTask.status,
      priority: "Normal",
      assignees: defaultAssignee ? [defaultAssignee] : [],
      dueDate: new Date(),
      order: afterTask.order + 0.5,
    });
    
    onSetEditingTaskId(newTask.id);
  }, [tasks, onSetEditingTaskId, currentUser, createTaskAndReturn]);

  return { handleQuickAdd, handleQuickAddTop, handleQuickAddAfter };
}
