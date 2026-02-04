import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { parseLocalDate } from "@/shared/lib/date-utils";
import type { TaskStatus, TaskPriority, TaskUpdates } from "../types/task";

const globalJustClosedEditRef = { current: false };
let globalCooldownTimeout: NodeJS.Timeout | null = null;

function activateCooldown() {
  if (globalCooldownTimeout) {
    clearTimeout(globalCooldownTimeout);
  }
  globalJustClosedEditRef.current = true;
  globalCooldownTimeout = setTimeout(() => {
    globalJustClosedEditRef.current = false;
    globalCooldownTimeout = null;
  }, 300);
}

export interface EditedTaskData {
  title: string;
  clientName: string;
  priority: string;
  status: TaskStatus;
  assignees: string[];
  dueDate: string;
  description: string;
}

interface UseTaskCardEditingProps {
  id: string;
  title: string;
  clientName?: string;
  priority?: TaskPriority;
  status: TaskStatus;
  assignees: string[];
  dueDate: Date;
  description?: string;
  onUpdate: (taskId: string, updates: TaskUpdates) => void;
  onFinishEditing?: (taskId: string) => void;
  initialEditMode?: boolean;
}

interface UseTaskCardEditingReturn {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  editedTask: EditedTaskData;
  setEditedTask: React.Dispatch<React.SetStateAction<EditedTaskData>>;
  activePopover: "date" | "priority" | "status" | "client" | "assignee" | null;
  setActivePopover: (value: "date" | "priority" | "status" | "client" | "assignee" | null) => void;
  cardRef: React.RefObject<HTMLDivElement>;
  titleRef: React.RefObject<HTMLDivElement>;
  clickTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  handleUpdate: (
    field: string,
    value: string | string[] | TaskStatus | TaskPriority | undefined,
  ) => void;
  handleSave: () => void;
  handleTitleEdit: (e: React.FocusEvent<HTMLDivElement>) => void;
  handleEditClick: (e: React.MouseEvent) => void;
  isJustClosedEdit: () => boolean;
  safeAssignees: string[];
  stableAssignees: string[];
}

export function useTaskCardEditing({
  id,
  title,
  clientName,
  priority,
  status,
  assignees,
  dueDate,
  description,
  onUpdate,
  onFinishEditing,
  initialEditMode = false,
}: UseTaskCardEditingProps): UseTaskCardEditingReturn {
  const safeAssignees = useMemo(() => {
    if (!assignees) return [];
    return Array.isArray(assignees) ? assignees : [assignees].filter(Boolean);
  }, [assignees]);

  const assigneesKey = useMemo(() => safeAssignees.join(","), [safeAssignees]);

  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [editedTask, setEditedTask] = useState<EditedTaskData>(() => ({
    title,
    clientName: clientName || "",
    priority: priority || "",
    status,
    assignees: [...safeAssignees],
    dueDate: format(dueDate, "yyyy-MM-dd"),
    description: description || "",
  }));
  const [activePopover, setActivePopover] = useState<
    "date" | "priority" | "status" | "client" | "assignee" | null
  >(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<EditedTaskData | null>(null);
  const latestDraftRef = useRef<EditedTaskData>(editedTask);
  const prevInitialEditModeRef = useRef(initialEditMode);

  // Sync isEditing with initialEditMode prop changes
  // Always honor prop transitions from parent
  useEffect(() => {
    // Only sync when prop actually changed
    if (prevInitialEditModeRef.current !== initialEditMode) {
      const wasEditing = prevInitialEditModeRef.current;
      prevInitialEditModeRef.current = initialEditMode;
      setIsEditing(initialEditMode);

      // If transitioning from editing to not editing, notify parent
      if (wasEditing && !initialEditMode && onFinishEditing) {
        onFinishEditing(id);
      }
    }
  }, [initialEditMode, onFinishEditing, id]);

  useEffect(() => {
    setEditedTask((prev) => {
      const newAssignees = safeAssignees;
      const newDueDate = format(dueDate, "yyyy-MM-dd");

      if (
        prev.title === title &&
        prev.clientName === (clientName || "") &&
        prev.priority === (priority || "") &&
        prev.status === status &&
        prev.assignees.join(",") === newAssignees.join(",") &&
        prev.dueDate === newDueDate &&
        prev.description === (description || "")
      ) {
        return prev;
      }

      const newData = {
        title,
        clientName: clientName || "",
        priority: priority || "",
        status,
        assignees: [...newAssignees],
        dueDate: newDueDate,
        description: description || "",
      };
      latestDraftRef.current = newData;
      return newData;
    });
  }, [title, clientName, priority, status, assigneesKey, dueDate, description, safeAssignees]);

  const flushUpdate = useCallback(
    (data: EditedTaskData) => {
      const parsedDueDate = data.dueDate ? parseLocalDate(data.dueDate) : dueDate;

      onUpdate(id, {
        title: data.title,
        clientName: data.clientName || undefined,
        priority: (data.priority as TaskPriority) || undefined,
        status: data.status as TaskStatus,
        assignees: data.assignees,
        dueDate: parsedDueDate,
      });

      lastSavedRef.current = { ...data };
    },
    [id, onUpdate, dueDate],
  );

  const handleUpdate = useCallback(
    (field: string, value: string | string[] | TaskStatus | TaskPriority | undefined) => {
      setEditedTask((prev) => {
        const updated = { ...prev, [field]: value };
        latestDraftRef.current = updated;

        if (pendingUpdateRef.current) {
          clearTimeout(pendingUpdateRef.current);
        }

        const isTitleEdit = field === "title";
        const isTextFieldEdit = isTitleEdit || field === "description";
        const debounceTime = isTextFieldEdit ? 300 : 0;

        if (debounceTime > 0) {
          pendingUpdateRef.current = setTimeout(() => {
            flushUpdate(updated);
            pendingUpdateRef.current = null;
          }, debounceTime);
        } else {
          flushUpdate(updated);
        }

        return updated;
      });
    },
    [flushUpdate],
  );

  const handleSave = useCallback(() => {
    // Clear any pending debounced updates
    if (pendingUpdateRef.current) {
      clearTimeout(pendingUpdateRef.current);
      pendingUpdateRef.current = null;
    }

    // Read the current title directly from the DOM if titleRef is available
    // This ensures we get the latest value even if onBlur hasn't fired yet
    const dataToSave = { ...latestDraftRef.current };
    if (titleRef.current) {
      const currentTitle = titleRef.current.textContent || "";
      dataToSave.title = currentTitle;
    }

    // If title is empty, set it to "Sem título"
    if (!dataToSave.title.trim()) {
      dataToSave.title = "Sem título";
    }

    latestDraftRef.current = dataToSave;
    setEditedTask(dataToSave);

    // Always flush the latest draft to ensure data is saved
    flushUpdate(dataToSave);

    setActivePopover(null);
    setIsEditing(false);

    // Always notify parent that editing is finished
    if (onFinishEditing) {
      onFinishEditing(id);
    }
  }, [flushUpdate, onFinishEditing, id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      const path = event.composedPath();
      const isPortal = path.some((element) => {
        if (element instanceof HTMLElement) {
          return (
            element.hasAttribute("data-radix-portal") ||
            element.hasAttribute("data-popover-portal") ||
            element.getAttribute("role") === "dialog" ||
            element.getAttribute("role") === "listbox" ||
            element.getAttribute("role") === "menu" ||
            element.classList.contains("date-input-calendar-popover") ||
            element.hasAttribute("data-radix-popper-content-wrapper") ||
            element.classList.contains("rdp")
          );
        }
        return false;
      });

      if (isEditing && cardRef.current && !cardRef.current.contains(target) && !isPortal) {
        activateCooldown();

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        handleSave();
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside, true);
      document.addEventListener("click", handleClickOutside, true);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside, true);
        document.removeEventListener("click", handleClickOutside, true);
      };
    }
  }, [isEditing, handleSave]);

  useEffect(() => {
    return () => {
      if (pendingUpdateRef.current) {
        clearTimeout(pendingUpdateRef.current);
      }
    };
  }, []);

  const handleTitleEdit = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      const newTitle = e.currentTarget.textContent || "";
      if (newTitle !== editedTask.title) {
        handleUpdate("title", newTitle);
      }
    },
    [editedTask.title, handleUpdate],
  );

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    setIsEditing(true);
  }, []);

  const isJustClosedEdit = useCallback(() => {
    return globalJustClosedEditRef.current;
  }, []);

  const stableAssignees = useMemo(
    () => [...editedTask.assignees],
    [editedTask.assignees.join(",")],
  );

  return {
    isEditing,
    setIsEditing,
    editedTask,
    setEditedTask,
    activePopover,
    setActivePopover,
    cardRef,
    titleRef,
    clickTimeoutRef,
    handleUpdate,
    handleSave,
    handleTitleEdit,
    handleEditClick,
    isJustClosedEdit,
    safeAssignees,
    stableAssignees,
  };
}
