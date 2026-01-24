import { memo, useCallback } from "react";
import { useLocation } from "wouter";
import { Card } from "@/shared/components/ui/card";
import { ContextMenu, ContextMenuTrigger } from "@/shared/components/ui/context-menu";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { calculateIsOverdue } from "../lib/task-utils";
import { useTaskCardEditing } from "../hooks/useTaskCardEditing";
import { useTaskAssignees } from "../hooks/useTaskAssignees";
import { useTaskContextMenu } from "../hooks/useTaskContextMenu";
import { useTaskCardDialogs } from "../hooks/useTaskCardDialogs";
import { useTaskCardFieldHandlers } from "../hooks/useTaskCardFieldHandlers";
import { TaskCardDialogs } from "./task-card-dialogs";
import { TaskCardContextMenu } from "./task-context-menu";
import { TaskCardQuickDetails, TaskCardHeader, TaskCardContent } from "./task-card";
import type { TaskStatus, TaskPriority, TaskUpdates, SyncStatus } from "../types/task";

export interface TaskCardProps {
  id: string;
  title: string;
  clientId?: string;
  clientName?: string;
  priority?: TaskPriority;
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

const arePropsEqual = (prev: TaskCardProps, next: TaskCardProps): boolean => {
  if (prev.id !== next.id) return false;
  if (prev.title !== next.title) return false;
  if (prev.clientId !== next.clientId) return false;
  if (prev.clientName !== next.clientName) return false;
  if (prev.priority !== next.priority) return false;
  if (prev.status !== next.status) return false;
  if (prev.dueDate?.getTime() !== next.dueDate?.getTime()) return false;
  if (prev.description !== next.description) return false;
  if (prev.syncStatus !== next.syncStatus) return false;
  if (prev.isSelected !== next.isSelected) return false;
  if (prev.selectedCount !== next.selectedCount) return false;
  if (prev.isDragActive !== next.isDragActive) return false;
  if (prev.initialEditMode !== next.initialEditMode) return false;
  if (prev.isCompact !== next.isCompact) return false;
  
  if (prev.assignees.length !== next.assignees.length) return false;
  for (let i = 0; i < prev.assignees.length; i++) {
    if (prev.assignees[i] !== next.assignees[i]) return false;
  }
  
  const prevNotes = prev.notes || [];
  const nextNotes = next.notes || [];
  if (prevNotes.length !== nextNotes.length) return false;
  for (let i = 0; i < prevNotes.length; i++) {
    if (prevNotes[i] !== nextNotes[i]) return false;
  }
  
  return true;
};

export const TaskCard = memo(function TaskCard({
  id, title, clientId, clientName, priority, status, assignees, dueDate, description, notes,
  syncStatus,
  isSelected = false, selectedCount = 0, isDragActive = false,
  initialEditMode = false, isCompact = false,
  onSelect, onUpdate, onDelete, onFinishEditing, onOpenDetail, onRetrySync,
  onBulkUpdate, onBulkDelete, onBulkAppendTitle, onBulkReplaceTitle,
  onBulkAddAssignee, onBulkSetAssignees, onBulkRemoveAssignee, onEditStateChange,
}: TaskCardProps) {
  const [, navigate] = useLocation();
  
  const {
    isEditing, editedTask, setEditedTask, activePopover, setActivePopover,
    cardRef, titleRef, clickTimeoutRef, handleUpdate, handleTitleEdit,
    handleEditClick, handleCloseEditing, isJustClosedEdit, stableAssignees,
  } = useTaskCardEditing({
    id, title, clientName, priority, status, assignees, dueDate, description,
    onUpdate, onFinishEditing, initialEditMode,
  });
  
  const updateAssigneesInEditedTask = useCallback((newAssignees: string[]) => {
    setEditedTask(prev => ({ ...prev, assignees: newAssignees }));
  }, [setEditedTask]);
  
  const { addAssignee, removeAssignee, handleContextAdd, handleContextRemove, handleContextSetSingle } = useTaskAssignees({
    taskId: id, assignees: editedTask.assignees, selectedCount, onUpdate,
    onBulkAddAssignee, onBulkRemoveAssignee, onBulkSetAssignees,
    updateEditedTask: updateAssigneesInEditedTask,
  });

  const {
    handleContextPriorityChange, handleContextStatusChange, handleContextDelete,
    handleContextClientChange, handleContextDateChange, handleReplaceTitleSubmit, handleAppendTitleSubmit,
  } = useTaskContextMenu({
    id, title, selectedCount, onUpdate, onDelete, onBulkUpdate, onBulkDelete, onBulkReplaceTitle, onBulkAppendTitle,
  });
  
  const {
    showDetails, setShowDetails, showDeleteConfirm, setShowDeleteConfirm,
    showReplaceTitleDialog, setShowReplaceTitleDialog, showAppendTitleDialog, setShowAppendTitleDialog,
    showBulkDatePicker, setShowBulkDatePicker, newTitleText, setNewTitleText,
    appendTitleText, setAppendTitleText, datePopoverContentRef,
    handleDelete, onReplaceTitleSubmit, onAppendTitleSubmit, onContextDateChange, openDetails,
  } = useTaskCardDialogs({
    id, isEditing, activePopover, onDelete, onEditStateChange, onOpenDetail,
    handleReplaceTitleSubmit, handleAppendTitleSubmit, handleContextDateChange,
  });

  const { handleDateChange, handlePriorityChange, handleStatusChange, handleClientChange } = useTaskCardFieldHandlers({
    handleUpdate, setActivePopover,
  });

  const handleCardClick = useCallback((e: React.MouseEvent) => {
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
    const isInteractive = target.closest('button') || target.closest('[contenteditable]') ||
      target.closest('[role="combobox"]') || target.closest('[data-radix-collection-item]');
    
    if (!isInteractive && !isJustClosedEdit()) {
      clickTimeoutRef.current = setTimeout(() => {
        if (!isEditing) openDetails();
        clickTimeoutRef.current = null;
      }, 250);
    }
  }, [onSelect, id, isEditing, isJustClosedEdit, openDetails, clickTimeoutRef]);

  const isOverdue = calculateIsOverdue(isEditing, editedTask.dueDate, dueDate);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Card
            ref={cardRef}
            className={cn(
              "group/task-card cursor-pointer transition-all hover-elevate active-elevate-2 border",
              !isEditing && "select-none",
              isEditing && "ring-2 ring-primary shadow-lg",
              isSelected && !isEditing && "ring-2 ring-blue-500 shadow-lg",
              isOverdue && "border-l-[3px] border-l-red-900 dark:border-l-red-700",
              status === "To Do" && "bg-[#262626] border-[#363636]",
              status === "In Progress" && "bg-[#243041] border-[#344151]",
              status === "Done" && "bg-[rgb(35,43,38)] border-[rgb(45,55,48)]"
            )}
            onClick={handleCardClick}
            onDoubleClick={handleEditClick}
            data-testid={`card-task-${id}`}
          >
            {(!isCompact || isEditing) && (
              <TaskCardHeader
                id={id} title={title} status={status} isEditing={isEditing} isCompact={isCompact}
                titleRef={titleRef} onTitleEdit={handleTitleEdit} onEditClick={handleEditClick}
                onCloseEditing={handleCloseEditing} onDeleteClick={() => setShowDeleteConfirm(true)}
              />
            )}

            <TaskCardContent
              id={id} title={title} clientId={clientId} clientName={clientName} priority={priority} status={status}
              isEditing={isEditing} isCompact={isCompact} editedTask={editedTask}
              stableAssignees={stableAssignees} activePopover={activePopover}
              setActivePopover={setActivePopover} datePopoverContentRef={datePopoverContentRef}
              clickTimeoutRef={clickTimeoutRef} onDateChange={handleDateChange}
              onClientChange={handleClientChange} onPriorityChange={handlePriorityChange}
              onStatusChange={handleStatusChange} onAddAssignee={addAssignee}
              onRemoveAssignee={removeAssignee} onEditClick={handleEditClick} onNavigate={navigate}
            />
            
            {/* Indicador de erro de sincronização */}
            {syncStatus === "error" && (
              <div className="px-3 pb-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetrySync?.(id);
                  }}
                  className="flex items-center gap-1.5 text-red-400 text-xs hover:text-red-300 transition-colors"
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>Erro ao salvar</span>
                  <RefreshCw className="w-3 h-3 ml-1" />
                  <span>Tentar novamente</span>
                </button>
              </div>
            )}
          </Card>
        </ContextMenuTrigger>
        <TaskCardContextMenu
          selectedCount={selectedCount} currentDate={editedTask.dueDate}
          currentClient={editedTask.clientName || ""} currentAssignees={editedTask.assignees || []}
          onShowReplaceTitleDialog={() => setShowReplaceTitleDialog(true)}
          onShowAppendTitleDialog={() => setShowAppendTitleDialog(true)}
          onDateChange={handleContextDateChange} onClientChange={handleContextClientChange}
          onPriorityChange={handleContextPriorityChange} onStatusChange={handleContextStatusChange}
          onAddAssignee={handleContextAdd} onRemoveAssignee={handleContextRemove}
          onSetSingleAssignee={handleContextSetSingle} onDelete={handleContextDelete}
        />
      </ContextMenu>
      <TaskCardQuickDetails
        id={id} title={title} description={editedTask.description} notes={notes}
        open={showDetails} onOpenChange={setShowDetails} onUpdate={onUpdate}
        onDelete={() => setShowDeleteConfirm(true)}
      />
      <TaskCardDialogs
        id={id} dueDate={dueDate} selectedCount={selectedCount}
        showDeleteConfirm={showDeleteConfirm} setShowDeleteConfirm={setShowDeleteConfirm}
        showReplaceTitleDialog={showReplaceTitleDialog} setShowReplaceTitleDialog={setShowReplaceTitleDialog}
        showAppendTitleDialog={showAppendTitleDialog} setShowAppendTitleDialog={setShowAppendTitleDialog}
        showBulkDatePicker={showBulkDatePicker} setShowBulkDatePicker={setShowBulkDatePicker}
        newTitleText={newTitleText} setNewTitleText={setNewTitleText}
        appendTitleText={appendTitleText} setAppendTitleText={setAppendTitleText}
        onDelete={handleDelete} onReplaceTitleSubmit={onReplaceTitleSubmit}
        onAppendTitleSubmit={onAppendTitleSubmit} onContextDateChange={onContextDateChange}
      />
    </>
  );
}, arePropsEqual);
