import { useCallback, useMemo } from "react";
import type { TaskStatus, TaskPriority } from "../types/task";
import { useTasks } from "../contexts/TasksContext";
import { useInlineFieldEdit, createPopoverAdapter } from "@/shared/hooks/useInlineFieldEdit";

export function useInlineTaskEdit() {
  const { updateTask, deleteTask } = useTasks();

  // Configuração dos campos
  const fields = useMemo(() => [
    { name: "status" as const },
    { name: "priority" as const },
    { name: "date" as const, updateKey: "dueDate" },
    { name: "assignee" as const },
  ], []);

  // Hook genérico
  const {
    popoverStates,
    openPopover,
    closePopover,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    datePopoverRef,
    handleFieldChange,
    handleDateChange: handleGenericDateChange,
    handleAddAssignee,
    handleRemoveAssignee,
    handleDeleteClick: handleGenericDeleteClick,
    handleConfirmDelete: handleGenericConfirmDelete,
    handleInteractOutside,
  } = useInlineFieldEdit({
    fields,
    onUpdate: updateTask,
    onDelete: deleteTask,
    hasDateField: true,
    deleteConfirmKeys: { id: "taskId", title: "taskTitle" },
  });

  // Handlers específicos mantendo a API original
  const handleStatusChange = useCallback((taskId: string, status: TaskStatus) => {
    handleFieldChange("status", taskId, status);
  }, [handleFieldChange]);

  const handlePriorityChange = useCallback((taskId: string, priority: TaskPriority | "_none") => {
    if (priority === "_none") {
      updateTask(taskId, { priority: undefined });
      closePopover("priority");
    } else {
      handleFieldChange("priority", taskId, priority);
    }
  }, [handleFieldChange, updateTask, closePopover]);

  const handleDateChange = useCallback((taskId: string, date: Date | undefined) => {
    handleGenericDateChange("date", taskId, date);
  }, [handleGenericDateChange]);

  const handleDeleteClick = useCallback((taskId: string, taskTitle: string) => {
    handleGenericDeleteClick(taskId, taskTitle);
  }, [handleGenericDeleteClick]);

  const handleConfirmDelete = useCallback(() => {
    handleGenericConfirmDelete();
  }, [handleGenericConfirmDelete]);

  // Adaptadores para manter API original com setters individuais
  const setStatusPopoverOpen = useMemo(
    () => createPopoverAdapter("status", openPopover, closePopover),
    [openPopover, closePopover]
  );
  const setPriorityPopoverOpen = useMemo(
    () => createPopoverAdapter("priority", openPopover, closePopover),
    [openPopover, closePopover]
  );
  const setDatePopoverOpen = useMemo(
    () => createPopoverAdapter("date", openPopover, closePopover),
    [openPopover, closePopover]
  );
  const setAssigneePopoverOpen = useMemo(
    () => createPopoverAdapter("assignee", openPopover, closePopover),
    [openPopover, closePopover]
  );

  return {
    // Estados - mantendo API original
    statusPopoverOpen: popoverStates.status,
    setStatusPopoverOpen,
    priorityPopoverOpen: popoverStates.priority,
    setPriorityPopoverOpen,
    datePopoverOpen: popoverStates.date,
    setDatePopoverOpen,
    assigneePopoverOpen: popoverStates.assignee,
    setAssigneePopoverOpen,
    deleteConfirmOpen: deleteConfirmOpen ? {
      taskId: deleteConfirmOpen.id,
      taskTitle: deleteConfirmOpen.title,
    } : null,
    setDeleteConfirmOpen: (value: { taskId: string; taskTitle: string } | null) => {
      setDeleteConfirmOpen(value ? { id: value.taskId, title: value.taskTitle } : null);
    },
    datePopoverRef,

    // Handlers - mantendo API original
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
