import { useCallback } from 'react';
import type { TaskStatus, TaskPriority } from '@/types/task';

interface UseTaskContextMenuParams {
  id: string;
  title: string;
  selectedCount: number;
  onUpdate: (taskId: string, updates: any) => void;
  onDelete: (taskId: string) => void;
  onBulkUpdate?: (updates: any) => void;
  onBulkDelete?: () => void;
  onBulkReplaceTitle?: (newTitle: string) => void;
  onBulkAppendTitle?: (suffix: string) => void;
}

interface UseTaskContextMenuReturn {
  handleContextPriorityChange: (newPriority: TaskPriority) => void;
  handleContextStatusChange: (newStatus: TaskStatus) => void;
  handleContextDelete: () => void;
  handleContextClientChange: (newClient: string) => void;
  handleContextDateChange: (newDate: Date) => void;
  handleReplaceTitleSubmit: (newTitleText: string) => void;
  handleAppendTitleSubmit: (appendText: string) => void;
}

export function useTaskContextMenu({
  id,
  title,
  selectedCount,
  onUpdate,
  onDelete,
  onBulkUpdate,
  onBulkDelete,
  onBulkReplaceTitle,
  onBulkAppendTitle,
}: UseTaskContextMenuParams): UseTaskContextMenuReturn {

  const handleContextPriorityChange = useCallback((newPriority: TaskPriority) => {
    if (selectedCount > 1 && onBulkUpdate) {
      onBulkUpdate({ priority: newPriority });
    } else {
      onUpdate(id, { priority: newPriority });
    }
  }, [selectedCount, onBulkUpdate, onUpdate, id]);

  const handleContextStatusChange = useCallback((newStatus: TaskStatus) => {
    if (selectedCount > 1 && onBulkUpdate) {
      onBulkUpdate({ status: newStatus });
    } else {
      onUpdate(id, { status: newStatus });
    }
  }, [selectedCount, onBulkUpdate, onUpdate, id]);

  const handleContextDelete = useCallback(() => {
    if (selectedCount > 1 && onBulkDelete) {
      onBulkDelete();
    } else {
      onDelete(id);
    }
  }, [selectedCount, onBulkDelete, onDelete, id]);

  const handleContextClientChange = useCallback((newClient: string) => {
    if (selectedCount > 1 && onBulkUpdate) {
      onBulkUpdate({ clientName: newClient });
    } else {
      onUpdate(id, { clientName: newClient });
    }
  }, [selectedCount, onBulkUpdate, onUpdate, id]);

  const handleContextDateChange = useCallback((newDate: Date) => {
    if (selectedCount > 1 && onBulkUpdate) {
      onBulkUpdate({ dueDate: newDate });
    } else {
      onUpdate(id, { dueDate: newDate });
    }
  }, [selectedCount, onBulkUpdate, onUpdate, id]);

  const handleReplaceTitleSubmit = useCallback((newTitleText: string) => {
    if (!newTitleText.trim()) return;
    if (selectedCount > 1 && onBulkReplaceTitle) {
      onBulkReplaceTitle(newTitleText.trim());
    } else {
      onUpdate(id, { title: newTitleText.trim() });
    }
  }, [selectedCount, onBulkReplaceTitle, onUpdate, id]);

  const handleAppendTitleSubmit = useCallback((appendText: string) => {
    if (!appendText.trim()) return;
    const textToAppend = appendText.trim();
    const startsWithAlphanumeric = /^[a-zA-Z0-9\u00C0-\u024F]/.test(textToAppend);
    const needsSpace = title.length > 0 && !/\s$/.test(title) && startsWithAlphanumeric;
    const suffix = needsSpace ? " " + textToAppend : textToAppend;
    if (selectedCount > 1 && onBulkAppendTitle) {
      onBulkAppendTitle(textToAppend);
    } else {
      onUpdate(id, { title: title + suffix });
    }
  }, [selectedCount, onBulkAppendTitle, onUpdate, id, title]);

  return {
    handleContextPriorityChange,
    handleContextStatusChange,
    handleContextDelete,
    handleContextClientChange,
    handleContextDateChange,
    handleReplaceTitleSubmit,
    handleAppendTitleSubmit,
  };
}
