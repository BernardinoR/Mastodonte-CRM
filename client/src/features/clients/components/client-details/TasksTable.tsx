/**
 * Componente de tabela de tarefas extraído para melhor organização e reutilização
 */
import { useState, useMemo } from "react";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { DateInput } from "@/shared/components/ui/date-input";
import { AssigneeSelector } from "@features/tasks/components/task-editors";
import { abbreviateName } from "@/shared/components/ui/task-assignees";
import { EditableCell } from "@/shared/components/ui/editable-cell";
import { useTasks } from "@features/tasks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  UI_CLASSES,
  TASK_STATUS_BADGE_COLORS,
  TASK_PRIORITY_BADGE_COLORS,
} from "@features/tasks/lib/statusConfig";
import { TaskDetailModal } from "@features/tasks";
import type { Task as GlobalTask, TaskPriority, TaskStatus } from "@features/tasks";
import { useInlineTaskEdit } from "@features/tasks";
import { useInlineEdit } from "@/shared/hooks/useInlineEdit";
import { usePaginatedList } from "@/shared/hooks/usePaginatedList";
import type { useInlineClientTasks } from "@features/clients";
import { sortTasksByDateAndPriority } from "@features/tasks/lib/sorting-utils";

export interface TasksTableProps {
  tasks: GlobalTask[];
  inlineProps: ReturnType<typeof useInlineClientTasks>;
}

const statusColors = TASK_STATUS_BADGE_COLORS;
const priorityColors = TASK_PRIORITY_BADGE_COLORS;

const statusOptions: TaskStatus[] = ["To Do", "In Progress", "Done"];
const priorityOptions: TaskPriority[] = ["Urgente", "Importante", "Normal", "Baixa"];

export function TasksTable({ tasks, inlineProps }: TasksTableProps) {
  // Ordenar tasks por data (mais recente primeiro) e prioridade (Urgente primeiro)
  const sortedTasks = useMemo(() => {
    return sortTasksByDateAndPriority(tasks);
  }, [tasks]);

  // Hook de paginação genérico
  const {
    visibleItems: visibleTasks,
    hasMore,
    remainingCount,
    loadMore,
  } = usePaginatedList(sortedTasks, 5);

  // Hook de edição inline genérico para o título
  const { updateTask } = useTasks();
  const titleEdit = useInlineEdit<GlobalTask>({
    onSave: (id, title) => updateTask(id, { title }),
    getId: (task) => task.id,
    getValue: (task) => task.title,
  });

  const {
    isAddingTask,
    newTaskTitle,
    setNewTaskTitle,
    newTaskPriority,
    newTaskStatus,
    newTaskDueDate,
    newTaskAssignees,
    newStatusPopoverOpen,
    setNewStatusPopoverOpen,
    newPriorityPopoverOpen,
    setNewPriorityPopoverOpen,
    newDatePopoverOpen,
    setNewDatePopoverOpen,
    newAssigneePopoverOpen,
    setNewAssigneePopoverOpen,
    setNewTaskRowRef,
    handleStartAddTask,
    handleKeyDown,
    handleCancelAddTask,
    handleNewStatusChange,
    handleNewPriorityChange,
    handleNewDateChange,
    handleNewAddAssignee,
    handleNewRemoveAssignee,
    handleNewTaskRowBlur,
    newDatePopoverRef,
    handleNewDatePopoverInteractOutside,
  } = inlineProps;

  const {
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
  } = useInlineTaskEdit();

  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const detailTask = detailTaskId ? tasks.find((t) => t.id === detailTaskId) : null;

  const handleRowClick = (taskId: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("[data-popover-trigger]") ||
      target.closest("button") ||
      target.closest('[role="dialog"]') ||
      target.closest("[data-radix-popper-content-wrapper]") ||
      target.closest("input") ||
      titleEdit.editingId
    ) {
      return;
    }
    setDetailTaskId(taskId);
  };

  const renderInlineAddRow = () => (
    <tr
      ref={setNewTaskRowRef}
      tabIndex={-1}
      className="group/row border-b border-[#333333]"
      onKeyDown={handleKeyDown}
      onBlur={handleNewTaskRowBlur}
    >
      <td className="px-4 py-3">
        <input
          type="text"
          placeholder="Nome da tarefa"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="w-full border-b border-[#2eaadc] bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
          autoFocus
          data-testid="input-new-task-title"
        />
      </td>
      <td className="px-4 py-3">
        <Popover open={newStatusPopoverOpen} onOpenChange={setNewStatusPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="inline-block cursor-pointer" data-testid="select-new-task-status">
              <Badge
                className={`${statusColors[newTaskStatus]} cursor-pointer text-xs transition-opacity hover:opacity-80`}
              >
                {newTaskStatus}
              </Badge>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className={`w-44 p-0 ${UI_CLASSES.popover}`}
            side="bottom"
            align="start"
            sideOffset={6}
          >
            <div className="w-full">
              <div className={`border-b ${UI_CLASSES.border}`}>
                <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                <div className="px-3 py-1">
                  <div
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${UI_CLASSES.selectedItem}`}
                  >
                    <Badge className={`${statusColors[newTaskStatus]} text-xs`}>
                      {newTaskStatus}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
              <div className="pb-1">
                {statusOptions
                  .filter((s) => s !== newTaskStatus)
                  .map((s) => (
                    <div
                      key={s}
                      className={UI_CLASSES.dropdownItem}
                      onClick={() => handleNewStatusChange(s)}
                      data-testid={`option-new-task-status-${s}`}
                    >
                      <Badge className={`${statusColors[s]} text-xs`}>{s}</Badge>
                    </div>
                  ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </td>
      <td className="px-4 py-3">
        <Popover open={newPriorityPopoverOpen} onOpenChange={setNewPriorityPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="inline-block cursor-pointer" data-testid="select-new-task-priority">
              <Badge
                className={`${priorityColors[newTaskPriority]} cursor-pointer text-xs transition-opacity hover:opacity-80`}
              >
                {newTaskPriority}
              </Badge>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className={`w-44 p-0 ${UI_CLASSES.popover}`}
            side="bottom"
            align="start"
            sideOffset={6}
          >
            <div className="w-full">
              <div className={`border-b ${UI_CLASSES.border}`}>
                <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                <div className="px-3 py-1">
                  <div
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${UI_CLASSES.selectedItem}`}
                  >
                    <Badge className={`${priorityColors[newTaskPriority]} text-xs`}>
                      {newTaskPriority}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
              <div className="pb-1">
                {priorityOptions
                  .filter((p) => p !== newTaskPriority)
                  .map((p) => (
                    <div
                      key={p}
                      className={UI_CLASSES.dropdownItem}
                      onClick={() => handleNewPriorityChange(p)}
                      data-testid={`option-new-task-priority-${p}`}
                    >
                      <Badge className={`${priorityColors[p]} text-xs`}>{p}</Badge>
                    </div>
                  ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </td>
      <td className="px-4 py-3">
        <Popover open={newDatePopoverOpen} onOpenChange={setNewDatePopoverOpen}>
          <PopoverTrigger asChild>
            <div
              className="-mx-1 inline-flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-foreground transition-colors hover:bg-[#2c2c2c]"
              data-testid="select-new-task-date"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
              {format(newTaskDueDate, "dd/MM/yyyy", { locale: ptBR })}
            </div>
          </PopoverTrigger>
          <PopoverContent
            ref={newDatePopoverRef}
            className={`w-auto p-0 ${UI_CLASSES.popover}`}
            side="bottom"
            align="start"
            sideOffset={6}
            onInteractOutside={handleNewDatePopoverInteractOutside}
            onPointerDownOutside={handleNewDatePopoverInteractOutside}
            onFocusOutside={handleNewDatePopoverInteractOutside}
          >
            <DateInput
              value={format(newTaskDueDate, "yyyy-MM-dd")}
              onChange={(date) => {
                if (date) handleNewDateChange(date);
              }}
              className="font-semibold"
              dataTestId="input-date-new-task"
              hideIcon
              commitOnInput={false}
            />
          </PopoverContent>
        </Popover>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Popover open={newAssigneePopoverOpen} onOpenChange={setNewAssigneePopoverOpen}>
            <PopoverTrigger asChild>
              <div
                className="inline-flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-[#2c2c2c]"
                data-testid="select-new-task-assignee"
              >
                {newTaskAssignees.length === 0 ? (
                  <span className="text-sm text-muted-foreground">+ Responsável</span>
                ) : (
                  <span className="text-sm text-foreground">
                    {newTaskAssignees.map((a) => abbreviateName(a)).join(", ")}
                  </span>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" side="bottom" align="start" sideOffset={6}>
              <AssigneeSelector
                selectedAssignees={newTaskAssignees}
                onSelect={(assignee) => handleNewAddAssignee(assignee)}
                onRemove={(assignee) => handleNewRemoveAssignee(assignee)}
              />
            </PopoverContent>
          </Popover>
          <button
            onClick={handleCancelAddTask}
            className="rounded p-1 opacity-0 transition-all hover:bg-[#3a2020] group-hover/row:opacity-100"
            data-testid="button-cancel-new-task"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );

  if (tasks.length === 0 && !isAddingTask) {
    return (
      <div className="p-6 text-center">
        <p className="mb-3 text-sm text-muted-foreground">
          Nenhuma tarefa encontrada para este cliente
        </p>
        <div
          className="cursor-pointer text-sm text-[#2eaadc] hover:underline"
          onClick={handleStartAddTask}
          data-testid="button-add-task-empty"
        >
          + Nova tarefa
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-[#333333]">
              <th className="w-[280px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tarefa
              </th>
              <th className="w-[100px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </th>
              <th className="w-[100px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Prioridade
              </th>
              <th className="w-[110px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Prazo
              </th>
              <th className="w-[180px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Responsável
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleTasks.map((task) => (
              <tr
                key={task.id}
                className="group/row cursor-pointer border-b border-[#333333] transition-colors hover:bg-[#2c2c2c]"
                onClick={(e) => handleRowClick(task.id, e)}
              >
                <td className="px-4 py-3">
                  <EditableCell
                    value={task.title}
                    isEditing={titleEdit.isEditing(task.id)}
                    editValue={titleEdit.editingValue}
                    onEditValueChange={titleEdit.setEditingValue}
                    onStartEdit={(e) => titleEdit.startEdit(task, e)}
                    onSave={titleEdit.save}
                    onKeyDown={titleEdit.handleKeyDown}
                    inputTestId={`input-task-title-${task.id}`}
                    buttonTestId={`button-edit-task-title-${task.id}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <Popover
                    open={statusPopoverOpen === task.id}
                    onOpenChange={(open) => setStatusPopoverOpen(open ? task.id : null)}
                  >
                    <PopoverTrigger asChild data-popover-trigger>
                      <div
                        className="inline-block cursor-pointer"
                        data-testid={`cell-task-status-${task.id}`}
                      >
                        <Badge
                          className={`${statusColors[task.status]} cursor-pointer text-xs transition-opacity hover:opacity-80`}
                        >
                          {task.status}
                        </Badge>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className={`w-44 p-0 ${UI_CLASSES.popover}`}
                      side="bottom"
                      align="start"
                      sideOffset={6}
                    >
                      <div className="w-full">
                        <div className={`border-b ${UI_CLASSES.border}`}>
                          <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                          <div className="px-3 py-1">
                            <div
                              className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${UI_CLASSES.selectedItem}`}
                            >
                              <Badge className={`${statusColors[task.status]} text-xs`}>
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
                        <div className="pb-1">
                          {statusOptions
                            .filter((s) => s !== task.status)
                            .map((s) => (
                              <div
                                key={s}
                                className={UI_CLASSES.dropdownItem}
                                onClick={() => handleStatusChange(task.id, s)}
                                data-testid={`option-task-status-${task.id}-${s}`}
                              >
                                <Badge className={`${statusColors[s]} text-xs`}>{s}</Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </td>
                <td className="px-4 py-3">
                  <Popover
                    open={priorityPopoverOpen === task.id}
                    onOpenChange={(open) => setPriorityPopoverOpen(open ? task.id : null)}
                  >
                    <PopoverTrigger asChild data-popover-trigger>
                      <div
                        className="inline-block cursor-pointer"
                        data-testid={`cell-task-priority-${task.id}`}
                      >
                        <Badge
                          className={`${priorityColors[task.priority || "Normal"]} cursor-pointer text-xs transition-opacity hover:opacity-80`}
                        >
                          {task.priority || "Normal"}
                        </Badge>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className={`w-44 p-0 ${UI_CLASSES.popover}`}
                      side="bottom"
                      align="start"
                      sideOffset={6}
                    >
                      <div className="w-full">
                        <div className={`border-b ${UI_CLASSES.border}`}>
                          <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                          <div className="px-3 py-1">
                            <div
                              className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${UI_CLASSES.selectedItem}`}
                            >
                              <Badge
                                className={`${priorityColors[task.priority || "Normal"]} text-xs`}
                              >
                                {task.priority || "Normal"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
                        <div className="pb-1">
                          {priorityOptions
                            .filter((p) => p !== (task.priority || "Normal"))
                            .map((p) => (
                              <div
                                key={p}
                                className={UI_CLASSES.dropdownItem}
                                onClick={() => handlePriorityChange(task.id, p)}
                                data-testid={`option-task-priority-${task.id}-${p}`}
                              >
                                <Badge className={`${priorityColors[p]} text-xs`}>{p}</Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </td>
                <td className="px-4 py-3">
                  <Popover
                    open={datePopoverOpen === task.id}
                    onOpenChange={(open) => setDatePopoverOpen(open ? task.id : null)}
                  >
                    <PopoverTrigger asChild data-popover-trigger>
                      <div
                        className="-mx-1 inline-flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-foreground transition-colors hover:bg-[#2c2c2c]"
                        data-testid={`cell-task-date-${task.id}`}
                      >
                        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        {format(task.dueDate, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      ref={datePopoverRef}
                      className={`w-auto p-0 ${UI_CLASSES.popover}`}
                      side="bottom"
                      align="start"
                      sideOffset={6}
                      onInteractOutside={handleInteractOutside}
                      onPointerDownOutside={handleInteractOutside}
                      onFocusOutside={handleInteractOutside}
                    >
                      <DateInput
                        value={format(task.dueDate, "yyyy-MM-dd")}
                        onChange={(date) => handleDateChange(task.id, date)}
                        className="font-semibold"
                        dataTestId={`input-date-task-${task.id}`}
                        hideIcon
                        commitOnInput={false}
                      />
                    </PopoverContent>
                  </Popover>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Popover
                      open={assigneePopoverOpen === task.id}
                      onOpenChange={(open) => setAssigneePopoverOpen(open ? task.id : null)}
                    >
                      <PopoverTrigger asChild data-popover-trigger>
                        <div
                          className="inline-flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-[#2c2c2c]"
                          data-testid={`cell-task-assignee-${task.id}`}
                        >
                          {(task.assignees?.length || 0) === 0 ? (
                            <span className="text-sm text-muted-foreground">+ Responsável</span>
                          ) : (
                            <span className="text-sm text-foreground">
                              {task.assignees?.map((a) => abbreviateName(a)).join(", ")}
                            </span>
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-64 p-0"
                        side="bottom"
                        align="start"
                        sideOffset={6}
                      >
                        <AssigneeSelector
                          selectedAssignees={task.assignees || []}
                          onSelect={(assignee) =>
                            handleAddAssignee(task.id, task.assignees || [], assignee)
                          }
                          onRemove={(assignee) =>
                            handleRemoveAssignee(task.id, task.assignees || [], assignee)
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <button
                      onClick={() => handleDeleteClick(task.id, task.title)}
                      className="rounded p-1 opacity-0 transition-all hover:bg-[#3a2020] group-hover/row:opacity-100"
                      data-testid={`button-delete-task-${task.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {isAddingTask && renderInlineAddRow()}
          </tbody>
        </table>
        <div className="flex items-center justify-between">
          {!isAddingTask && (
            <div
              className="cursor-pointer px-4 py-3 text-sm text-[#2eaadc] transition-colors hover:bg-[#2c2c2c]"
              onClick={handleStartAddTask}
              data-testid="button-add-task-table"
            >
              + Nova tarefa
            </div>
          )}
          {isAddingTask && <div />}
          {hasMore && (
            <div
              className="cursor-pointer px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-[#2c2c2c] hover:text-foreground"
              onClick={loadMore}
              data-testid="button-load-more-tasks"
            >
              Carregar mais +{Math.min(5, remainingCount)}
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={!!deleteConfirmOpen}
        onOpenChange={(open) => !open && setDeleteConfirmOpen(null)}
      >
        <AlertDialogContent className="border-[#333333] bg-[#252525]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir tarefa?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir a tarefa "{deleteConfirmOpen?.taskTitle}"? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#444444] bg-[#333333] text-foreground hover:bg-[#3a3a3a]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              data-testid="button-confirm-delete-task"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          open={true}
          onOpenChange={(open) => !open && setDetailTaskId(null)}
          onUpdateTask={(taskId, updates) => updateTask(taskId, updates)}
        />
      )}
    </>
  );
}
