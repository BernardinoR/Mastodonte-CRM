import { memo, useMemo, useState, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { TaskCard, TaskCardProps } from "./TaskCard";

interface SortableTaskCardProps extends Omit<TaskCardProps, 'onEditStateChange'> {
  isDragActive?: boolean;
}

export const SortableTaskCard = memo(function SortableTaskCard({
  isDragActive = false,
  ...props
}: SortableTaskCardProps) {
  // Track if child TaskCard is currently in edit mode
  const [isChildEditing, setIsChildEditing] = useState(false);
  
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging 
  } = useSortable({
    id: props.id,
    disabled: isChildEditing, // Disable drag when editing
  });
  
  const sortableStyle = useMemo(() => ({
    transform: transform 
      ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)` 
      : undefined,
    transition,
  }), [transform, transition]);

  // Only hide for drag if not editing
  const shouldHideForDrag = !isChildEditing && (isDragging || (isDragActive && props.isSelected));

  // Callback to receive edit state from TaskCard
  const handleEditStateChange = useCallback((isEditing: boolean) => {
    setIsChildEditing(isEditing);
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={{
        ...sortableStyle,
        opacity: shouldHideForDrag ? 0 : 1,
        pointerEvents: shouldHideForDrag ? 'none' : 'auto',
        contain: 'layout style paint',
        willChange: transform ? 'transform' : 'auto',
      }}
      data-task-card
      {...attributes}
      {...(isChildEditing ? {} : listeners)} // Only attach listeners when not editing
    >
      <TaskCard 
        {...props} 
        onEditStateChange={handleEditStateChange}
      />
    </div>
  );
}, (prev, next) => {
  if (prev.id !== next.id) return false;
  if (prev.title !== next.title) return false;
  if (prev.clientName !== next.clientName) return false;
  if (prev.priority !== next.priority) return false;
  if (prev.status !== next.status) return false;
  if (prev.dueDate?.getTime() !== next.dueDate?.getTime()) return false;
  if (prev.description !== next.description) return false;
  if (prev.isSelected !== next.isSelected) return false;
  if (prev.selectedCount !== next.selectedCount) return false;
  if (prev.isDragActive !== next.isDragActive) return false;
  if (prev.initialEditMode !== next.initialEditMode) return false;
  
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
});
