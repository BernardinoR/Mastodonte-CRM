import { memo, useCallback } from "react";
import { Card } from "@/shared/components/ui/card";
import { ContextMenu, ContextMenuTrigger } from "@/shared/components/ui/context-menu";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { calculateIsOverdue } from "../lib/date-utils";
import { useTaskCardEditing } from "../hooks/useTaskCardEditing";
import { useTaskAssignees } from "../hooks/useTaskAssignees";
import { useTaskContextMenu } from "../hooks/useTaskContextMenu";
import { useTaskCardDialogs } from "../hooks/useTaskCardDialogs";
import { useTaskCardFieldHandlers } from "../hooks/useTaskCardFieldHandlers";
import { TaskCardDialogs } from "./task-card-dialogs";
import { TaskCardContextMenu } from "./task-context-menu";
import { TaskCardQuickDetails, TaskCardHeader, TaskCardContent } from "./task-card";
import type { TaskStatus, TaskPriority, TaskType, TaskUpdates, SyncStatus } from "../types/task";

export interface TaskCardProps {
  id: string;
  title: string;
  clientId?: string;
  clientName?: string;
  priority?: TaskPriority;
  taskType?: TaskType;
  status: TaskStatus;
  assignees: string[];
  dueDate: Date;
  description?: string;
  notes?: string[];
  syncStatus?: SyncStatus;
  isSelected?: boolean;
  selectedCount?: number;
  isDragActive?: boolean;
  initialEditMode?: boolean;
  isCompact?: boolean;
  onSelect?: (taskId: string, shiftKey: boolean, ctrlKey: boolean) => void;
  onUpdate: (taskId: string, updates: TaskUpdates) => void;
  onDelete: (taskId: string) => void;
  onFinishEditing?: (taskId: string) => void;
  onOpenDetail?: (taskId: string) => void;
  onRetrySync?: (taskId: string) => void;
  onBulkUpdate?: (updates: TaskUpdates) => void;
  onBulkDelete?: () => void;
  onBulkAppendTitle?: (suffix: string) => void;
  onBulkReplaceTitle?: (newTitle: string) => void;
  onBulkAddAssignee?: (assignee: string) => void;
  onBulkSetAssignees?: (assignees: string[]) => void;
  onBulkRemoveAssignee?: (assignee: string) => void;
  onEditStateChange?: (isEditing: boolean) => void;
}

// Helper para comparar arrays de strings
const arraysEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

// Chaves primitivas que podem ser comparadas diretamente
const PRIMITIVE_KEYS = [
  "id",
  "title",
  "clientId",
  "clientName",
  "priority",
  "taskType",
  "status",
  "description",
  "syncStatus",
  "isSelected",
  "selectedCount",
  "isDragActive",
  "initialEditMode",
  "isCompact",
] as const;

const arePropsEqual = (prev: TaskCardProps, next: TaskCardProps): boolean => {
  // Comparar propriedades primitivas
  for (const key of PRIMITIVE_KEYS) {
    if (prev[key] !== next[key]) return false;
  }

  // Comparar datas
  if (prev.dueDate?.getTime() !== next.dueDate?.getTime()) return false;

  // Comparar arrays
  if (!arraysEqual(prev.assignees, next.assignees)) return false;
  if (!arraysEqual(prev.notes || [], next.notes || [])) return false;

  return true;
};

export const TaskCard = memo(function TaskCard({
  id,
  title,
  clientId,
  clientName,
  priority,
  taskType,
  status,
  assignees,
  dueDate,
  description,
  notes,
  syncStatus,
  isSelected = false,
  selectedCount = 0,
  isDragActive = false,
  initialEditMode = false,
  isCompact = false,
  onSelect,
  onUpdate,
  onDelete,
  onFinishEditing,
  onOpenDetail,
  onRetrySync,
  onBulkUpdate,
  onBulkDelete,
  onBulkAppendTitle,
  onBulkReplaceTitle,
  onBulkAddAssignee,
  onBulkSetAssignees,
  onBulkRemoveAssignee,
  onEditStateChange,
}: TaskCardProps) {
  const {
    isEditing,
    editedTask,
    setEditedTask,
    activePopover,
    setActivePopover,
    cardRef,
    titleRef,
    clickTimeoutRef,
    handleUpdate,
    handleTitleEdit,
    handleEditClick,
    isJustClosedEdit,
    stableAssignees,
  } = useTaskCardEditing({
    id,
    title,
    clientId,
    clientName,
    priority,
    taskType,
    status,
    assignees,
    dueDate,
    description,
    onUpdate,
    onFinishEditing,
    initialEditMode,
  });

  const updateAssigneesInEditedTask = useCallback(
    (newAssignees: string[]) => {
      setEditedTask((prev) => ({ ...prev, assignees: newAssignees }));
    },
    [setEditedTask],
  );

  const {
    addAssignee,
    removeAssignee,
    handleContextAdd,
    handleContextRemove,
    handleContextSetSingle,
  } = useTaskAssignees({
    taskId: id,
    assignees: editedTask.assignees,
    selectedCount,
    onUpdate,
    onBulkAddAssignee,
    onBulkRemoveAssignee,
    onBulkSetAssignees,
    updateEditedTask: updateAssigneesInEditedTask,
  });

  const {
    handleContextPriorityChange,
    handleContextStatusChange,
    handleContextDelete,
    handleContextClientChange,
    handleContextDateChange,
    handleReplaceTitleSubmit,
    handleAppendTitleSubmit,
  } = useTaskContextMenu({
    id,
    title,
    selectedCount,
    onUpdate,
    onDelete,
    onBulkUpdate,
    onBulkDelete,
    onBulkReplaceTitle,
    onBulkAppendTitle,
  });

  const {
    showDetails,
    setShowDetails,
    showDeleteConfirm,
    setShowDeleteConfirm,
    showReplaceTitleDialog,
    setShowReplaceTitleDialog,
    showAppendTitleDialog,
    setShowAppendTitleDialog,
    showBulkDatePicker,
    setShowBulkDatePicker,
    newTitleText,
    setNewTitleText,
    appendTitleText,
    setAppendTitleText,
    datePopoverContentRef,
    handleDelete,
    onReplaceTitleSubmit,
    onAppendTitleSubmit,
    onContextDateChange,
    openDetails,
  } = useTaskCardDialogs({
    id,
    isEditing,
    activePopover,
    onDelete,
    onEditStateChange,
    onOpenDetail,
    handleReplaceTitleSubmit,
    handleAppendTitleSubmit,
    handleContextDateChange,
  });

  const { handleDateChange, handlePriorityChange, handleStatusChange, handleClientChange } =
    useTaskCardFieldHandlers({
      handleUpdate,
      setActivePopover,
    });

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }

      if ((e.shiftKey || e.ctrlKey || e.metaKey) && onSelect) {
        e.preventDefault();
        e.stopPropagation();
        onSelect(id, e.shiftKey, e.ctrlKey || e.metaKey);
        return;
      }

      if (isEditing) return;

      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest("button") ||
        target.closest("[contenteditable]") ||
        target.closest('[role="combobox"]') ||
        target.closest("[data-radix-collection-item]") ||
        target.closest("[data-popover-trigger]");

      if (!isInteractive && !isJustClosedEdit()) {
        clickTimeoutRef.current = setTimeout(() => {
          if (!isEditing) openDetails();
          clickTimeoutRef.current = null;
        }, 250);
      }
    },
    [onSelect, id, isEditing, isJustClosedEdit, openDetails, clickTimeoutRef],
  );

  const isOverdue = calculateIsOverdue(isEditing, editedTask.dueDate, dueDate);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Card
            ref={cardRef}
            className={cn(
              "group/task-card cursor-pointer select-none rounded-lg border border-[#333333] bg-[#202020] shadow-sm transition-all hover:border-gray-600",
              isSelected && !isEditing && "shadow-lg ring-2 ring-blue-500",
              isOverdue && "border-y border-l-[3px] border-r border-[#333333] border-l-red-700",
              syncStatus === "pending" && "opacity-60",
            )}
            onClick={handleCardClick}
            data-testid={`card-task-${id}`}
          >
            <TaskCardHeader
              id={id}
              title={title}
              status={status}
              taskType={taskType}
              isEditing={isEditing}
              editingTitle={editedTask.title}
              onEditingTitleChange={(value) => setEditedTask((prev) => ({ ...prev, title: value }))}
              onStartTitleEdit={handleEditClick}
              onSaveTitleEdit={() => {
                const titleToSave = editedTask.title.trim() || "Nova tarefa";
                if (titleToSave !== editedTask.title) {
                  setEditedTask((prev) => ({ ...prev, title: titleToSave }));
                }
                handleUpdate("title", titleToSave);
              }}
              onConfirmTitleEdit={() => onFinishEditing?.(id)}
              onTypeChange={(type) => handleUpdate("taskType", type)}
            />

            <TaskCardContent
              id={id}
              title={title}
              clientId={clientId}
              clientName={clientName}
              priority={priority}
              taskType={taskType}
              status={status}
              isEditing={isEditing}
              editedTask={editedTask}
              stableAssignees={stableAssignees}
              activePopover={activePopover}
              setActivePopover={setActivePopover}
              datePopoverContentRef={datePopoverContentRef}
              clickTimeoutRef={clickTimeoutRef}
              onDateChange={handleDateChange}
              onClientChange={handleClientChange}
              onPriorityChange={handlePriorityChange}
              onAddAssignee={addAssignee}
              onRemoveAssignee={removeAssignee}
            />

            {/* Indicador de erro de sincronização */}
            {syncStatus === "error" && (
              <div className="px-3 pb-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetrySync?.(id);
                  }}
                  className="flex items-center gap-1.5 text-xs text-red-400 transition-colors hover:text-red-300"
                >
                  <AlertCircle className="h-3 w-3" />
                  <span>Erro ao salvar</span>
                  <RefreshCw className="ml-1 h-3 w-3" />
                  <span>Tentar novamente</span>
                </button>
              </div>
            )}
          </Card>
        </ContextMenuTrigger>
        <TaskCardContextMenu
          selectedCount={selectedCount}
          currentDate={editedTask.dueDate}
          currentClient={editedTask.clientName || ""}
          currentAssignees={editedTask.assignees || []}
          onShowReplaceTitleDialog={() => setShowReplaceTitleDialog(true)}
          onShowAppendTitleDialog={() => setShowAppendTitleDialog(true)}
          onDateChange={handleContextDateChange}
          onClientChange={handleContextClientChange}
          onPriorityChange={handleContextPriorityChange}
          onStatusChange={handleContextStatusChange}
          onAddAssignee={handleContextAdd}
          onRemoveAssignee={handleContextRemove}
          onSetSingleAssignee={handleContextSetSingle}
          onDelete={handleContextDelete}
        />
      </ContextMenu>
      <TaskCardQuickDetails
        id={id}
        title={title}
        description={editedTask.description}
        notes={notes}
        open={showDetails}
        onOpenChange={setShowDetails}
        onUpdate={onUpdate}
        onDelete={() => setShowDeleteConfirm(true)}
      />
      <TaskCardDialogs
        id={id}
        dueDate={dueDate}
        selectedCount={selectedCount}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        showReplaceTitleDialog={showReplaceTitleDialog}
        setShowReplaceTitleDialog={setShowReplaceTitleDialog}
        showAppendTitleDialog={showAppendTitleDialog}
        setShowAppendTitleDialog={setShowAppendTitleDialog}
        showBulkDatePicker={showBulkDatePicker}
        setShowBulkDatePicker={setShowBulkDatePicker}
        newTitleText={newTitleText}
        setNewTitleText={setNewTitleText}
        appendTitleText={appendTitleText}
        setAppendTitleText={setAppendTitleText}
        onDelete={handleDelete}
        onReplaceTitleSubmit={onReplaceTitleSubmit}
        onAppendTitleSubmit={onAppendTitleSubmit}
        onContextDateChange={onContextDateChange}
      />
    </>
  );
}, arePropsEqual);
