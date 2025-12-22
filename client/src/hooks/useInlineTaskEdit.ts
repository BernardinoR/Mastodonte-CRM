import { useState, useRef, useCallback } from "react";
import type { TaskStatus, TaskPriority } from "@/types/task";
import { useTasks } from "@/contexts/TasksContext";

export function useInlineTaskEdit() {
  const { updateTask, deleteTask } = useTasks();

  const [statusPopoverOpen, setStatusPopoverOpen] = useState<string | null>(null);
  const [priorityPopoverOpen, setPriorityPopoverOpen] = useState<string | null>(null);
  const [datePopoverOpen, setDatePopoverOpen] = useState<string | null>(null);
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<{ taskId: string; taskTitle: string } | null>(null);

  const datePopoverRef = useRef<HTMLDivElement>(null);

  const handleStatusChange = useCallback((taskId: string, status: TaskStatus) => {
    updateTask(taskId, { status });
    setStatusPopoverOpen(null);
  }, [updateTask]);

  const handlePriorityChange = useCallback((taskId: string, priority: TaskPriority | "_none") => {
    if (priority === "_none") {
      updateTask(taskId, { priority: undefined });
    } else {
      updateTask(taskId, { priority });
    }
    setPriorityPopoverOpen(null);
  }, [updateTask]);

  const handleDateChange = useCallback((taskId: string, date: Date | undefined) => {
    if (date) {
      updateTask(taskId, { dueDate: date });
      setDatePopoverOpen(null);
    }
  }, [updateTask]);

  const handleAddAssignee = useCallback((taskId: string, currentAssignees: string[], assignee: string) => {
    if (!currentAssignees.includes(assignee)) {
      updateTask(taskId, { assignees: [...currentAssignees, assignee] });
    }
  }, [updateTask]);

  const handleRemoveAssignee = useCallback((taskId: string, currentAssignees: string[], assignee: string) => {
    updateTask(taskId, { assignees: currentAssignees.filter(a => a !== assignee) });
  }, [updateTask]);

  const handleDeleteClick = useCallback((taskId: string, taskTitle: string) => {
    setDeleteConfirmOpen({ taskId, taskTitle });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmOpen) {
      deleteTask(deleteConfirmOpen.taskId);
      setDeleteConfirmOpen(null);
    }
  }, [deleteConfirmOpen, deleteTask]);

  const handleInteractOutside = useCallback((e: any) => {
    const originalTarget = e.detail?.originalEvent?.target as HTMLElement | null;
    const target = originalTarget || (e.target as HTMLElement);
    if (datePopoverRef.current?.contains(target) || target?.closest('.rdp')) {
      e.preventDefault();
    }
  }, []);

  return {
    statusPopoverOpen,
    setStatusPopoverOpen,
    priorityPopoverOpen,
    setPriorityPopoverOpen,
    datePopoverOpen,
    setDatePopoverOpen,
    assigneePopoverOpen,
    setAssigneePopoverOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    datePopoverRef,

    handleStatusChange,
    handlePriorityChange,
    handleDateChange,
    handleAddAssignee,
    handleRemoveAssignee,
    handleDeleteClick,
    handleConfirmDelete,
    handleInteractOutside,
  };
}
