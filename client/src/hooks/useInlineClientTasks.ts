import { useState, useRef, useCallback } from "react";
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
  const blurTimeoutRef = useRef<number | null>(null);
  const [priorityPopoverOpen, setPriorityPopoverOpen] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);

  const setNewTaskRowRef = useCallback((element: HTMLTableRowElement | null) => {
    newTaskRowElementRef.current = element;
  }, []);

  const resetNewTaskForm = useCallback(() => {
    setNewTaskTitle("");
    setNewTaskPriority("Normal");
    setNewTaskStatus("To Do");
    setPriorityPopoverOpen(false);
    setStatusPopoverOpen(false);
  }, []);

  const commitNewTask = useCallback(() => {
    if (!newTaskTitle.trim()) return;
    if (isSavingRef.current) return;

    isSavingRef.current = true;

    createTask({
      title: newTaskTitle.trim(),
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
  }, [newTaskTitle, newTaskPriority, newTaskStatus, clientId, clientName, createTask, resetNewTaskForm]);

  const handleStartAddTask = useCallback(() => {
    setIsAddingTask(true);
  }, []);

  const handleCancelAddTask = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsAddingTask(false);
    resetNewTaskForm();
  }, [resetNewTaskForm]);

  const handleSaveTask = useCallback(() => {
    commitNewTask();
  }, [commitNewTask]);

  const handleNewTaskRowBlur = useCallback((e: React.FocusEvent) => {
    if (priorityPopoverOpen || statusPopoverOpen) return;
    if (!newTaskRowElementRef.current) return;
    
    const relatedTarget = e.relatedTarget as Node | null;
    const isInsideRow = newTaskRowElementRef.current.contains(relatedTarget);
    const isInsidePopover = relatedTarget?.parentElement?.closest('[data-radix-popper-content-wrapper]');
    
    if (!isInsideRow && !isInsidePopover) {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      blurTimeoutRef.current = window.setTimeout(() => {
        if (newTaskTitle.trim() && !isSavingRef.current) {
          commitNewTask();
        } else if (!newTaskTitle.trim()) {
          handleCancelAddTask();
        }
        blurTimeoutRef.current = null;
      }, 150);
    }
  }, [priorityPopoverOpen, statusPopoverOpen, newTaskTitle, commitNewTask, handleCancelAddTask]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      e.preventDefault();
      commitNewTask();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelAddTask();
    }
  }, [newTaskTitle, commitNewTask, handleCancelAddTask]);

  return {
    isAddingTask,
    newTaskTitle,
    setNewTaskTitle,
    newTaskPriority,
    setNewTaskPriority,
    newTaskStatus,
    setNewTaskStatus,

    priorityPopoverOpen,
    setPriorityPopoverOpen,
    statusPopoverOpen,
    setStatusPopoverOpen,

    setNewTaskRowRef,

    handleStartAddTask,
    handleCancelAddTask,
    handleSaveTask,
    handleNewTaskRowBlur,
    handleKeyDown,
  };
}
