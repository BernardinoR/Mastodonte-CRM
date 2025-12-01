import { useState, useCallback } from "react";

interface UseTaskAssigneesOptions {
  taskId: string;
  assignees: string[];
  selectedCount: number;
  onUpdate: (id: string, updates: { assignees: string[] }) => void;
  onBulkAddAssignee?: (assignee: string) => void;
  onBulkRemoveAssignee?: (assignee: string) => void;
  onBulkSetAssignees?: (assignees: string[]) => void;
  updateEditedTask: (assignees: string[]) => void;
}

export function useTaskAssignees({
  taskId,
  assignees,
  selectedCount,
  onUpdate,
  onBulkAddAssignee,
  onBulkRemoveAssignee,
  onBulkSetAssignees,
  updateEditedTask,
}: UseTaskAssigneesOptions) {
  const [newAssigneeName, setNewAssigneeName] = useState("");

  const addAssigneeWithPersist = useCallback((assignee: string) => {
    const trimmedName = assignee.trim();
    if (!trimmedName) return false;

    const isDuplicate = assignees.some(
      a => a.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (isDuplicate) {
      return false;
    }

    const newAssignees = [...assignees, trimmedName];
    updateEditedTask(newAssignees);
    onUpdate(taskId, { assignees: newAssignees });
    return true;
  }, [taskId, assignees, updateEditedTask, onUpdate]);

  const removeAssigneeWithPersist = useCallback((assigneeToRemove: string) => {
    if (assignees.length <= 1) {
      return false;
    }

    const newAssignees = assignees.filter(a => a !== assigneeToRemove);
    updateEditedTask(newAssignees);
    onUpdate(taskId, { assignees: newAssignees });
    return true;
  }, [taskId, assignees, updateEditedTask, onUpdate]);

  const handleAddFromInput = useCallback(() => {
    if (addAssigneeWithPersist(newAssigneeName)) {
      setNewAssigneeName("");
    }
  }, [newAssigneeName, addAssigneeWithPersist]);

  const handleContextAdd = useCallback((assignee: string) => {
    if (selectedCount > 1 && onBulkAddAssignee) {
      onBulkAddAssignee(assignee);
    } else {
      if (!assignees.includes(assignee)) {
        const newAssignees = [...assignees, assignee];
        updateEditedTask(newAssignees);
        onUpdate(taskId, { assignees: newAssignees });
      }
    }
  }, [taskId, assignees, selectedCount, onBulkAddAssignee, onUpdate, updateEditedTask]);

  const handleContextRemove = useCallback((assignee: string) => {
    if (selectedCount > 1 && onBulkRemoveAssignee) {
      onBulkRemoveAssignee(assignee);
    } else {
      const newAssignees = assignees.filter(a => a !== assignee);
      updateEditedTask(newAssignees);
      onUpdate(taskId, { assignees: newAssignees });
    }
  }, [taskId, assignees, selectedCount, onBulkRemoveAssignee, onUpdate, updateEditedTask]);

  const handleContextSetSingle = useCallback((assignee: string) => {
    if (selectedCount > 1 && onBulkSetAssignees) {
      onBulkSetAssignees([assignee]);
    } else {
      updateEditedTask([assignee]);
      onUpdate(taskId, { assignees: [assignee] });
    }
  }, [taskId, selectedCount, onBulkSetAssignees, onUpdate, updateEditedTask]);

  return {
    newAssigneeName,
    setNewAssigneeName,
    addAssignee: addAssigneeWithPersist,
    removeAssignee: removeAssigneeWithPersist,
    handleAddFromInput,
    handleContextAdd,
    handleContextRemove,
    handleContextSetSingle,
  };
}
