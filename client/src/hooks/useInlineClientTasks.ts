import { useState, useRef, useCallback, useEffect } from "react";
import type { TaskStatus, TaskPriority } from "@/types/task";
import { useTasks } from "@/contexts/TasksContext";

export interface UseInlineClientTasksOptions {
  clientId: string;
  clientName: string;
}

export function useInlineClientTasks(options: UseInlineClientTasksOptions) {
  const { clientId, clientName } = options;
  const { createTask } = useTasks();

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("Normal");
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("To Do");

  const isSavingRef = useRef(false);
  const newTaskRowElementRef = useRef<HTMLTableRowElement | null>(null);
  const newTaskTitleRef = useRef(newTaskTitle);

  useEffect(() => {
    newTaskTitleRef.current = newTaskTitle;
  }, [newTaskTitle]);

  const setNewTaskRowRef = useCallback((element: HTMLTableRowElement | null) => {
    newTaskRowElementRef.current = element;
  }, []);

  const resetNewTaskForm = useCallback(() => {
    setNewTaskTitle("");
    setNewTaskPriority("Normal");
    setNewTaskStatus("To Do");
  }, []);

  const commitNewTask = useCallback(() => {
    const title = newTaskTitleRef.current;
    if (!title.trim()) return;
    if (isSavingRef.current) return;

    isSavingRef.current = true;

    createTask({
      title: title.trim(),
      clientId,
      clientName,
      priority: newTaskPriority,
      status: newTaskStatus,
      assignees: [],
      dueDate: new Date(),
    });

    resetNewTaskForm();
    setIsAddingTask(false);

    setTimeout(() => {
      isSavingRef.current = false;
    }, 100);
  }, [newTaskPriority, newTaskStatus, clientId, clientName, createTask, resetNewTaskForm]);

  const handleStartAddTask = useCallback(() => {
    setIsAddingTask(true);
  }, []);

  const handleCancelAddTask = useCallback(() => {
    setIsAddingTask(false);
    resetNewTaskForm();
  }, [resetNewTaskForm]);

  const handleSaveTask = useCallback(() => {
    commitNewTask();
  }, [commitNewTask]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTaskTitleRef.current.trim()) {
      e.preventDefault();
      commitNewTask();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelAddTask();
    }
  }, [commitNewTask, handleCancelAddTask]);

  return {
    isAddingTask,
    newTaskTitle,
    setNewTaskTitle,
    newTaskPriority,
    setNewTaskPriority,
    newTaskStatus,
    setNewTaskStatus,

    setNewTaskRowRef,

    handleStartAddTask,
    handleCancelAddTask,
    handleSaveTask,
    handleKeyDown,
  };
}
