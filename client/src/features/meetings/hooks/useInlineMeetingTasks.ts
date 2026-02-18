import { useState, useRef, useCallback, useEffect } from "react";
import type { TaskStatus, TaskPriority } from "@features/tasks";
import { useTasks } from "@features/tasks";

export interface UseInlineMeetingTasksOptions {
  meetingId: number;
  clientId: string;
  clientName: string;
  defaultAssignee?: string;
}

export function useInlineMeetingTasks(options: UseInlineMeetingTasksOptions) {
  const { meetingId, clientId, clientName, defaultAssignee } = options;
  const { createTask } = useTasks();

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("Normal");
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("To Do");
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date>(new Date());
  const [newTaskAssignees, setNewTaskAssignees] = useState<string[]>([]);

  const [newStatusPopoverOpen, setNewStatusPopoverOpen] = useState(false);
  const [newPriorityPopoverOpen, setNewPriorityPopoverOpen] = useState(false);
  const [newDatePopoverOpen, setNewDatePopoverOpen] = useState(false);
  const [newAssigneePopoverOpen, setNewAssigneePopoverOpen] = useState(false);

  const isSavingRef = useRef(false);
  const newTaskRowElementRef = useRef<HTMLTableRowElement | null>(null);
  const newTaskTitleRef = useRef(newTaskTitle);
  const newDatePopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    newTaskTitleRef.current = newTaskTitle;
  }, [newTaskTitle]);

  useEffect(() => {
    if (isAddingTask && defaultAssignee && newTaskAssignees.length === 0) {
      setNewTaskAssignees([defaultAssignee]);
    }
  }, [isAddingTask, defaultAssignee, newTaskAssignees.length]);

  const setNewTaskRowRef = useCallback((element: HTMLTableRowElement | null) => {
    newTaskRowElementRef.current = element;
  }, []);

  const resetNewTaskForm = useCallback(() => {
    setNewTaskTitle("");
    setNewTaskPriority("Normal");
    setNewTaskStatus("To Do");
    setNewTaskDueDate(new Date());
    setNewTaskAssignees(defaultAssignee ? [defaultAssignee] : []);
    setNewStatusPopoverOpen(false);
    setNewPriorityPopoverOpen(false);
    setNewDatePopoverOpen(false);
    setNewAssigneePopoverOpen(false);
  }, [defaultAssignee]);

  const commitNewTask = useCallback(() => {
    const title = newTaskTitleRef.current;
    if (!title.trim()) return;
    if (isSavingRef.current) return;

    isSavingRef.current = true;

    createTask({
      title: title.trim(),
      clientId,
      clientName,
      meetingId,
      priority: newTaskPriority,
      status: newTaskStatus,
      assignees: newTaskAssignees,
      dueDate: newTaskDueDate,
    });

    resetNewTaskForm();
    setIsAddingTask(false);

    setTimeout(() => {
      isSavingRef.current = false;
    }, 100);
  }, [
    newTaskPriority,
    newTaskStatus,
    newTaskAssignees,
    newTaskDueDate,
    clientId,
    clientName,
    meetingId,
    createTask,
    resetNewTaskForm,
  ]);

  const handleNewStatusChange = useCallback((status: TaskStatus) => {
    setNewTaskStatus(status);
    setNewStatusPopoverOpen(false);
  }, []);

  const handleNewPriorityChange = useCallback((priority: TaskPriority) => {
    setNewTaskPriority(priority);
    setNewPriorityPopoverOpen(false);
  }, []);

  const handleNewDateChange = useCallback((date: Date) => {
    setNewTaskDueDate(date);
    setNewDatePopoverOpen(false);
  }, []);

  const handleNewDatePopoverInteractOutside = useCallback(
    (e: CustomEvent<{ originalEvent?: Event }>) => {
      const originalTarget = e.detail?.originalEvent?.target as HTMLElement | null;
      const target = originalTarget || (e.target as HTMLElement);
      if (newDatePopoverRef.current?.contains(target) || target?.closest(".rdp")) {
        e.preventDefault();
      }
    },
    [],
  );

  const handleNewAddAssignee = useCallback((assignee: string) => {
    setNewTaskAssignees((prev) => (prev.includes(assignee) ? prev : [...prev, assignee]));
  }, []);

  const handleNewRemoveAssignee = useCallback((assignee: string) => {
    setNewTaskAssignees((prev) => prev.filter((a) => a !== assignee));
  }, []);

  const handleStartAddTask = useCallback(() => {
    resetNewTaskForm();
    setIsAddingTask(true);
  }, [resetNewTaskForm]);

  const handleCancelAddTask = useCallback(() => {
    setIsAddingTask(false);
    resetNewTaskForm();
  }, [resetNewTaskForm]);

  const handleSaveTask = useCallback(() => {
    commitNewTask();
  }, [commitNewTask]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && newTaskTitleRef.current.trim()) {
        e.preventDefault();
        commitNewTask();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancelAddTask();
      }
    },
    [commitNewTask, handleCancelAddTask],
  );

  const handleNewTaskRowBlur = useCallback(
    (e: React.FocusEvent) => {
      if (
        newStatusPopoverOpen ||
        newPriorityPopoverOpen ||
        newDatePopoverOpen ||
        newAssigneePopoverOpen
      ) {
        return;
      }

      const relatedTarget = e.relatedTarget as Node | null;
      const isInsideRow = newTaskRowElementRef.current?.contains(relatedTarget);
      const isInsidePopover = relatedTarget?.parentElement?.closest(
        "[data-radix-popper-content-wrapper]",
      );

      if (!isInsideRow && !isInsidePopover) {
        setTimeout(() => {
          if (newTaskTitleRef.current.trim() && !isSavingRef.current) {
            commitNewTask();
          }
        }, 150);
      }
    },
    [
      newStatusPopoverOpen,
      newPriorityPopoverOpen,
      newDatePopoverOpen,
      newAssigneePopoverOpen,
      commitNewTask,
    ],
  );

  return {
    isAddingTask,
    newTaskTitle,
    setNewTaskTitle,
    newTaskPriority,
    setNewTaskPriority,
    newTaskStatus,
    setNewTaskStatus,
    newTaskDueDate,
    setNewTaskDueDate,
    newTaskAssignees,
    setNewTaskAssignees,

    newStatusPopoverOpen,
    setNewStatusPopoverOpen,
    newPriorityPopoverOpen,
    setNewPriorityPopoverOpen,
    newDatePopoverOpen,
    setNewDatePopoverOpen,
    newAssigneePopoverOpen,
    setNewAssigneePopoverOpen,

    setNewTaskRowRef,
    newDatePopoverRef,

    handleStartAddTask,
    handleCancelAddTask,
    handleSaveTask,
    handleKeyDown,
    handleNewStatusChange,
    handleNewPriorityChange,
    handleNewDateChange,
    handleNewAddAssignee,
    handleNewRemoveAssignee,
    handleNewTaskRowBlur,
    handleNewDatePopoverInteractOutside,
  };
}
