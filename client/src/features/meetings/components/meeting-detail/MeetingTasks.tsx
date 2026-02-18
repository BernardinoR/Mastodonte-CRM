import { useState, useMemo } from "react";
import { CheckSquare, Plus, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { DateInput } from "@/shared/components/ui/date-input";
import { EditableCell } from "@/shared/components/ui/editable-cell";
import { AssigneeSelector } from "@features/tasks/components/task-editors";
import { abbreviateName } from "@/shared/components/ui/task-assignees";
import { useTasks, useInlineTaskEdit, TaskDetailModal } from "@features/tasks";
import { useCurrentUser } from "@features/users";
import { useInlineEdit } from "@/shared/hooks/useInlineEdit";
import { useInlineMeetingTasks } from "@features/meetings/hooks/useInlineMeetingTasks";
import {
  UI_CLASSES,
  TASK_STATUS_BADGE_COLORS,
  TASK_PRIORITY_BADGE_COLORS,
} from "@features/tasks/lib/statusConfig";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Task, TaskPriority, TaskStatus } from "@features/tasks";

interface MeetingTasksProps {
  meetingId: number;
  clientId: string;
  clientName: string;
}

const statusColors = TASK_STATUS_BADGE_COLORS;
const priorityColors = TASK_PRIORITY_BADGE_COLORS;
const statusOptions: TaskStatus[] = ["To Do", "In Progress", "Done"];
const priorityOptions: TaskPriority[] = ["Urgente", "Importante", "Normal", "Baixa"];

export function MeetingTasks({ meetingId, clientId, clientName }: MeetingTasksProps) {
  const { tasks: allTasks, updateTask } = useTasks();
  const { data: currentUserData } = useCurrentUser();

  const meetingTasks = useMemo(
    () => allTasks.filter((t) => t.meetingId === meetingId),
    [allTasks, meetingId],
  );

  const inlineProps = useInlineMeetingTasks({
    meetingId,
    clientId,
    clientName,
    defaultAssignee: currentUserData?.user?.name || undefined,
  });

  const titleEdit = useInlineEdit<Task>({
    onSave: (id, title) => updateTask(id, { title }),
    getId: (task) => task.id,
    getValue: (task) => task.title,
  });

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
  const detailTask = useMemo(() => {
    if (!detailTaskId) return null;
    return meetingTasks.find((t) => t.id === detailTaskId) || null;
  }, [detailTaskId, meetingTasks]);

  const handleRowClick = (taskId: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("[data-popover-trigger]") ||
      target.closest("button") ||
      target.closest("[data-radix-popper-content-wrapper]") ||
      target.closest("input") ||
      titleEdit.editingId
    ) {
      return;
    }
    setDetailTaskId(taskId);
  };

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

  const renderInlineAddRow = () => (
    <tr
      ref={setNewTaskRowRef}
      tabIndex={-1}
      className="group/row border-b border-[#262626]"
      onKeyDown={handleKeyDown}
      onBlur={handleNewTaskRowBlur}
    >
      <td className="px-4 py-3">
        <input
          type="text"
          placeholder="Nome da tarefa"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border-b border-[#2eaadc] bg-transparent text-xs font-semibold text-white placeholder:text-[#555] focus:outline-none"
          autoFocus
        />
      </td>
      <td className="px-4 py-3">
        <Popover open={newStatusPopoverOpen} onOpenChange={setNewStatusPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="inline-block cursor-pointer">
              <Badge
                className={`${statusColors[newTaskStatus]} cursor-pointer text-[10px] transition-opacity hover:opacity-80`}
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
              <div className="px-3 py-1.5 text-xs text-gray-500">Outras opcoes</div>
              <div className="pb-1">
                {statusOptions
                  .filter((s) => s !== newTaskStatus)
                  .map((s) => (
                    <div
                      key={s}
                      className={UI_CLASSES.dropdownItem}
                      onClick={() => handleNewStatusChange(s)}
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
            <div className="inline-block cursor-pointer">
              <Badge
                className={`${priorityColors[newTaskPriority]} cursor-pointer text-[10px] transition-opacity hover:opacity-80`}
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
              <div className="px-3 py-1.5 text-xs text-gray-500">Outras opcoes</div>
              <div className="pb-1">
                {priorityOptions
                  .filter((p) => p !== newTaskPriority)
                  .map((p) => (
                    <div
                      key={p}
                      className={UI_CLASSES.dropdownItem}
                      onClick={() => handleNewPriorityChange(p)}
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
            <div className="-mx-1 inline-flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-xs text-gray-400 transition-colors hover:bg-[#262626]">
              <CalendarIcon className="h-3 w-3" />
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
              <div className="inline-flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 text-xs transition-colors hover:bg-[#262626]">
                {newTaskAssignees.length === 0 ? (
                  <span className="text-[#555]">+ Responsavel</span>
                ) : (
                  <span className="text-gray-400">
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
            className="rounded p-1 opacity-0 transition-all hover:bg-red-500/10 group-hover/row:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-[18px] w-[18px] text-gray-400" />
          <h3 className="text-sm font-bold text-white">Tarefas Vinculadas</h3>
        </div>
        <button
          onClick={handleStartAddTask}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2eaadc] transition-colors hover:text-[#3bc0f0]"
        >
          <Plus className="h-3.5 w-3.5" />
          Nova Tarefa
        </button>
      </div>

      {meetingTasks.length === 0 && !isAddingTask ? (
        <div className="overflow-hidden rounded-lg border border-[#262626] bg-[#161616]">
          <div className="p-6 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              Nenhuma tarefa vinculada a esta reunião
            </p>
            <div
              className="cursor-pointer text-sm text-[#2eaadc] hover:underline"
              onClick={handleStartAddTask}
            >
              + Nova tarefa
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#262626] bg-[#161616]">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-xs">
              <thead>
                <tr className="border-b border-[#262626]">
                  <th className="w-[280px] px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Tarefa
                  </th>
                  <th className="w-[100px] px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="w-[100px] px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Prioridade
                  </th>
                  <th className="w-[110px] px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Prazo
                  </th>
                  <th className="w-[150px] px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Responsavel
                  </th>
                </tr>
              </thead>
              <tbody>
                {meetingTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="group/row cursor-pointer border-b border-[#262626] transition-colors hover:bg-[#1a1a1a]"
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
                        className="[&>input]:text-xs [&>input]:font-semibold [&>span]:font-semibold"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Popover
                        open={statusPopoverOpen === task.id}
                        onOpenChange={(open) => setStatusPopoverOpen(open ? task.id : null)}
                      >
                        <PopoverTrigger asChild data-popover-trigger>
                          <div className="inline-block cursor-pointer">
                            <Badge
                              className={`${statusColors[task.status]} cursor-pointer text-[10px] transition-opacity hover:opacity-80`}
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
                            <div className="px-3 py-1.5 text-xs text-gray-500">Outras opcoes</div>
                            <div className="pb-1">
                              {statusOptions
                                .filter((s) => s !== task.status)
                                .map((s) => (
                                  <div
                                    key={s}
                                    className={UI_CLASSES.dropdownItem}
                                    onClick={() => handleStatusChange(task.id, s)}
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
                          <div className="inline-block cursor-pointer">
                            <Badge
                              className={`${priorityColors[task.priority]} cursor-pointer text-[10px] transition-opacity hover:opacity-80`}
                            >
                              {task.priority}
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
                                  <Badge className={`${priorityColors[task.priority]} text-xs`}>
                                    {task.priority}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="px-3 py-1.5 text-xs text-gray-500">Outras opcoes</div>
                            <div className="pb-1">
                              {priorityOptions
                                .filter((p) => p !== task.priority)
                                .map((p) => (
                                  <div
                                    key={p}
                                    className={UI_CLASSES.dropdownItem}
                                    onClick={() => handlePriorityChange(task.id, p)}
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
                          <div className="-mx-1 inline-flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-xs text-gray-400 transition-colors hover:bg-[#262626]">
                            <CalendarIcon className="h-3 w-3" />
                            {format(task.dueDate, "dd MMM yyyy", { locale: ptBR })}
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
                            onChange={(date) => {
                              if (date) handleDateChange(task.id, date);
                            }}
                            className="font-semibold"
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
                            <div className="inline-flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 text-xs transition-colors hover:bg-[#262626]">
                              <span className="text-gray-400">
                                {task.assignees.length > 0
                                  ? task.assignees.map((a) => abbreviateName(a)).join(", ")
                                  : "—"}
                              </span>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-64 p-0"
                            side="bottom"
                            align="start"
                            sideOffset={6}
                          >
                            <AssigneeSelector
                              selectedAssignees={task.assignees}
                              onSelect={(assignee) => handleAddAssignee(task.id, assignee)}
                              onRemove={(assignee) => handleRemoveAssignee(task.id, assignee)}
                            />
                          </PopoverContent>
                        </Popover>
                        <button
                          onClick={() => handleDeleteClick(task.id, task.title)}
                          className="rounded p-1 opacity-0 transition-all hover:bg-red-500/10 group-hover/row:opacity-100"
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
          </div>
        </div>
      )}

      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          open={!!detailTask}
          onOpenChange={(open) => {
            if (!open) setDetailTaskId(null);
          }}
          onUpdateTask={updateTask}
        />
      )}

      <AlertDialog
        open={!!deleteConfirmOpen}
        onOpenChange={(open) => !open && setDeleteConfirmOpen(null)}
      >
        <AlertDialogContent className="border-[#3a3a3a] bg-[#2a2a2a]">
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
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
