// Context & Hooks
export { TasksProvider, useTasks } from './contexts/TasksContext';

// Page
export { default as Tasks } from './pages/Tasks';

// Types
export * from './types/task';

// Main Components
export { TaskCard } from './components/TaskCard';
export { TaskDetailModal } from './components/TaskDetailModal';
export { TaskTableView } from './components/TaskTableView';
export { NewTaskDialog } from './components/NewTaskDialog';
export { SortableTaskCard } from './components/SortableTaskCard';
export { DragPreview } from './components/DragPreview';
export { FilterBar } from './components/FilterBar';
export { KanbanColumn } from './components/KanbanColumn';
export { TurboModeOverlay } from './components/TurboModeOverlay';
export { TurboSummaryModal } from './components/TurboSummaryModal';

// Task Card sub-components
export * from './components/task-card';
export * from './components/task-detail';
export * from './components/task-editors';
export * from './components/table/TableHeader';
export * from './components/table/TaskTableRow';
export * from './components/table/TableBulkActions';
export * from './components/filter-bar/FilterPopoverContent';

// Hooks
export { useTaskFilters } from './hooks/useTaskFilters';
export { useTaskSelection } from './hooks/useTaskSelection';
export { useTaskDrag } from './hooks/useTaskDrag';
export { useTaskHistory } from './hooks/useTaskHistory';
export { useTaskCardEditing } from './hooks/useTaskCardEditing';
export { useTaskCardFieldHandlers } from './hooks/useTaskCardFieldHandlers';
export { useTaskCardDialogs } from './hooks/useTaskCardDialogs';
export { useTaskContextMenu } from './hooks/useTaskContextMenu';
export { useInlineTaskEdit } from './hooks/useInlineTaskEdit';
export { useQuickAddTask } from './hooks/useQuickAddTask';
export { useTaskAssignees } from './hooks/useTaskAssignees';
export { useTaskBulkActions } from './hooks/useTaskBulkActions';
export { useTaskUrlParams, buildTasksUrl } from './hooks/useTaskUrlParams';
export { usePomodoroTimer } from './hooks/usePomodoroTimer';
export { useTurboMode } from './hooks/useTurboMode';
export { useTurboNavigation } from './hooks/useTurboNavigation';
export { useAudioNotification } from './hooks/useAudioNotification';
export { useWhatsAppGroups } from './hooks/useWhatsAppGroups';

// Lib/Utils
export * from './lib/taskUtils';
export * from './lib/task-utils';
export * from './lib/sortUtils';
export * from './lib/statusConfig';
export * from './lib/dndSensors';
export * from './lib/turboModeConfig';
