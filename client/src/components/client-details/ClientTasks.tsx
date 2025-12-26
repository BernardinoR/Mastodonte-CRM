import { useState } from "react";
import { Link } from "wouter";
import { 
  Calendar as CalendarIcon, 
  CheckCircle2,
  Trash2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DateInput } from "@/components/ui/date-input";
import { AssigneeSelector } from "@/components/task-editors";
import { useTasks } from "@/contexts/TasksContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UI_CLASSES, TASK_STATUS_BADGE_COLORS, TASK_PRIORITY_BADGE_COLORS } from "@/lib/statusConfig";
import { abbreviateName } from "@/components/ui/task-assignees";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import type { Task as GlobalTask, TaskPriority, TaskStatus } from "@/types/task";
import { useInlineTaskEdit } from "@/hooks/useInlineTaskEdit";
import type { useInlineClientTasks } from "@/hooks/useInlineClientTasks";

export interface ClientTasksProps {
  tasks: GlobalTask[];
  inlineProps: ReturnType<typeof useInlineClientTasks>;
}

const statusColors = TASK_STATUS_BADGE_COLORS;
const priorityColors = TASK_PRIORITY_BADGE_COLORS;

const statusOptions: TaskStatus[] = ["To Do", "In Progress", "Done"];
const priorityOptions: TaskPriority[] = ["Urgente", "Importante", "Normal", "Baixa"];

function TasksTable({ 
  tasks, 
  inlineProps 
}: { 
  tasks: GlobalTask[]; 
  inlineProps: ReturnType<typeof useInlineClientTasks>;
}) {
  const [visibleCount, setVisibleCount] = useState(5);

  const visibleTasks = tasks.slice(0, visibleCount);
  const hasMore = tasks.length > visibleCount;
  const remainingCount = tasks.length - visibleCount;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5);
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

  const { updateTask } = useTasks();
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const detailTask = detailTaskId ? tasks.find(t => t.id === detailTaskId) : null;

  const handleRowClick = (taskId: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-popover-trigger]') || 
      target.closest('button') || 
      target.closest('[role="dialog"]') ||
      target.closest('[data-radix-popper-content-wrapper]')
    ) {
      return;
    }
    setDetailTaskId(taskId);
  };

  const renderInlineAddRow = () => (
    <tr
      ref={setNewTaskRowRef}
      tabIndex={-1}
      className="border-b border-[#333333] group/row"
      onKeyDown={handleKeyDown}
      onBlur={handleNewTaskRowBlur}
    >
      <td className="py-3 px-4">
        <input
          type="text"
          placeholder="Nome da tarefa"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="bg-transparent border-b border-[#2eaadc] text-sm text-foreground font-medium placeholder:text-muted-foreground focus:outline-none w-full"
          autoFocus
          data-testid="input-new-task-title"
        />
      </td>
      <td className="py-3 px-4">
        <Popover open={newStatusPopoverOpen} onOpenChange={setNewStatusPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="inline-block cursor-pointer" data-testid="select-new-task-status">
              <Badge className={`${statusColors[newTaskStatus]} text-xs cursor-pointer hover:opacity-80 transition-opacity`}>
                {newTaskStatus}
              </Badge>
            </div>
          </PopoverTrigger>
          <PopoverContent className={`w-44 p-0 ${UI_CLASSES.popover}`} side="bottom" align="start" sideOffset={6}>
            <div className="w-full">
              <div className={`border-b ${UI_CLASSES.border}`}>
                <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                <div className="px-3 py-1">
                  <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${UI_CLASSES.selectedItem}`}>
                    <Badge className={`${statusColors[newTaskStatus]} text-xs`}>
                      {newTaskStatus}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
              <div className="pb-1">
                {statusOptions.filter(s => s !== newTaskStatus).map(s => (
                  <div
                    key={s}
                    className={UI_CLASSES.dropdownItem}
                    onClick={() => handleNewStatusChange(s)}
                    data-testid={`option-new-task-status-${s}`}
                  >
                    <Badge className={`${statusColors[s]} text-xs`}>
                      {s}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </td>
      <td className="py-3 px-4">
        <Popover open={newPriorityPopoverOpen} onOpenChange={setNewPriorityPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="inline-block cursor-pointer" data-testid="select-new-task-priority">
              <Badge className={`${priorityColors[newTaskPriority]} text-xs cursor-pointer hover:opacity-80 transition-opacity`}>
                {newTaskPriority}
              </Badge>
            </div>
          </PopoverTrigger>
          <PopoverContent className={`w-44 p-0 ${UI_CLASSES.popover}`} side="bottom" align="start" sideOffset={6}>
            <div className="w-full">
              <div className={`border-b ${UI_CLASSES.border}`}>
                <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                <div className="px-3 py-1">
                  <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${UI_CLASSES.selectedItem}`}>
                    <Badge className={`${priorityColors[newTaskPriority]} text-xs`}>
                      {newTaskPriority}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
              <div className="pb-1">
                {priorityOptions.filter(p => p !== newTaskPriority).map(p => (
                  <div
                    key={p}
                    className={UI_CLASSES.dropdownItem}
                    onClick={() => handleNewPriorityChange(p)}
                    data-testid={`option-new-task-priority-${p}`}
                  >
                    <Badge className={`${priorityColors[p]} text-xs`}>
                      {p}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </td>
      <td className="py-3 px-4">
        <Popover open={newDatePopoverOpen} onOpenChange={setNewDatePopoverOpen}>
          <PopoverTrigger asChild>
            <div
              className="inline-flex items-center gap-1.5 cursor-pointer rounded px-1 -mx-1 py-0.5 hover:bg-[#2c2c2c] transition-colors text-foreground"
              data-testid="select-new-task-date"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
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
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Popover open={newAssigneePopoverOpen} onOpenChange={setNewAssigneePopoverOpen}>
            <PopoverTrigger asChild>
              <div
                className="inline-flex items-center gap-2 rounded-md cursor-pointer transition-colors hover:bg-[#2c2c2c] px-1 py-0.5"
                data-testid="select-new-task-assignee"
              >
                {newTaskAssignees.length === 0 ? (
                  <span className="text-muted-foreground text-sm">+ Responsável</span>
                ) : (
                  <span className="text-foreground text-sm">
                    {newTaskAssignees.map(a => abbreviateName(a)).join(", ")}
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
            className="p-1 rounded hover:bg-[#3a2020] transition-all opacity-0 group-hover/row:opacity-100"
            data-testid="button-cancel-new-task"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );

  if (tasks.length === 0 && !isAddingTask) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground text-sm mb-3">Nenhuma tarefa encontrada para este cliente</p>
        <div 
          className="text-sm text-[#2eaadc] hover:underline cursor-pointer"
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
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="border-b border-[#333333]">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide w-[280px]">Tarefa</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide w-[100px]">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide w-[100px]">Prioridade</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide w-[110px]">Prazo</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide w-[180px]">Responsável</th>
            </tr>
          </thead>
          <tbody>
            {visibleTasks.map((task) => (
              <tr 
                key={task.id} 
                className="border-b border-[#333333] hover:bg-[#2c2c2c] transition-colors group/row cursor-pointer"
                onClick={(e) => handleRowClick(task.id, e)}
              >
                <td className="py-3 px-4 text-foreground font-medium">{task.title}</td>
                <td className="py-3 px-4">
                  <Popover open={statusPopoverOpen === task.id} onOpenChange={(open) => setStatusPopoverOpen(open ? task.id : null)}>
                    <PopoverTrigger asChild data-popover-trigger>
                      <div className="inline-block cursor-pointer" data-testid={`cell-task-status-${task.id}`}>
                        <Badge className={`${statusColors[task.status]} text-xs cursor-pointer hover:opacity-80 transition-opacity`}>
                          {task.status}
                        </Badge>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className={`w-44 p-0 ${UI_CLASSES.popover}`} side="bottom" align="start" sideOffset={6}>
                      <div className="w-full">
                        <div className={`border-b ${UI_CLASSES.border}`}>
                          <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                          <div className="px-3 py-1">
                            <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${UI_CLASSES.selectedItem}`}>
                              <Badge className={`${statusColors[task.status]} text-xs`}>
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
                        <div className="pb-1">
                          {statusOptions.filter(s => s !== task.status).map(s => (
                            <div
                              key={s}
                              className={UI_CLASSES.dropdownItem}
                              onClick={() => handleStatusChange(task.id, s)}
                              data-testid={`option-task-status-${task.id}-${s}`}
                            >
                              <Badge className={`${statusColors[s]} text-xs`}>
                                {s}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </td>
                <td className="py-3 px-4">
                  <Popover open={priorityPopoverOpen === task.id} onOpenChange={(open) => setPriorityPopoverOpen(open ? task.id : null)}>
                    <PopoverTrigger asChild data-popover-trigger>
                      <div className="inline-block cursor-pointer" data-testid={`cell-task-priority-${task.id}`}>
                        <Badge className={`${priorityColors[task.priority || "Normal"]} text-xs cursor-pointer hover:opacity-80 transition-opacity`}>
                          {task.priority || "Normal"}
                        </Badge>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className={`w-44 p-0 ${UI_CLASSES.popover}`} side="bottom" align="start" sideOffset={6}>
                      <div className="w-full">
                        <div className={`border-b ${UI_CLASSES.border}`}>
                          <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                          <div className="px-3 py-1">
                            <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${UI_CLASSES.selectedItem}`}>
                              <Badge className={`${priorityColors[task.priority || "Normal"]} text-xs`}>
                                {task.priority || "Normal"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
                        <div className="pb-1">
                          {priorityOptions.filter(p => p !== (task.priority || "Normal")).map(p => (
                            <div
                              key={p}
                              className={UI_CLASSES.dropdownItem}
                              onClick={() => handlePriorityChange(task.id, p)}
                              data-testid={`option-task-priority-${task.id}-${p}`}
                            >
                              <Badge className={`${priorityColors[p]} text-xs`}>
                                {p}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </td>
                <td className="py-3 px-4">
                  <Popover open={datePopoverOpen === task.id} onOpenChange={(open) => setDatePopoverOpen(open ? task.id : null)}>
                    <PopoverTrigger asChild data-popover-trigger>
                      <div
                        className="inline-flex items-center gap-1.5 cursor-pointer rounded px-1 -mx-1 py-0.5 hover:bg-[#2c2c2c] transition-colors text-foreground"
                        data-testid={`cell-task-date-${task.id}`}
                      >
                        <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
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
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Popover open={assigneePopoverOpen === task.id} onOpenChange={(open) => setAssigneePopoverOpen(open ? task.id : null)}>
                      <PopoverTrigger asChild data-popover-trigger>
                        <div
                          className="inline-flex items-center gap-2 rounded-md cursor-pointer transition-colors hover:bg-[#2c2c2c] px-1 py-0.5"
                          data-testid={`cell-task-assignee-${task.id}`}
                        >
                          {(task.assignees?.length || 0) === 0 ? (
                            <span className="text-muted-foreground text-sm">+ Responsável</span>
                          ) : (
                            <span className="text-foreground text-sm">
                              {task.assignees?.map(a => abbreviateName(a)).join(", ")}
                            </span>
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0" side="bottom" align="start" sideOffset={6}>
                        <AssigneeSelector
                          selectedAssignees={task.assignees || []}
                          onSelect={(assignee) => handleAddAssignee(task.id, task.assignees || [], assignee)}
                          onRemove={(assignee) => handleRemoveAssignee(task.id, task.assignees || [], assignee)}
                        />
                      </PopoverContent>
                    </Popover>
                    <button
                      onClick={() => handleDeleteClick(task.id, task.title)}
                      className="p-1 rounded hover:bg-[#3a2020] transition-all opacity-0 group-hover/row:opacity-100"
                      data-testid={`button-delete-task-${task.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
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
              className="py-3 px-4 text-sm text-[#2eaadc] hover:bg-[#2c2c2c] cursor-pointer transition-colors"
              onClick={handleStartAddTask}
              data-testid="button-add-task-table"
            >
              + Nova tarefa
            </div>
          )}
          {isAddingTask && <div />}
          {hasMore && (
            <div
              className="py-3 px-4 text-sm text-muted-foreground hover:text-foreground hover:bg-[#2c2c2c] cursor-pointer transition-colors"
              onClick={handleLoadMore}
              data-testid="button-load-more-tasks"
            >
              Carregar mais +{Math.min(5, remainingCount)}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteConfirmOpen} onOpenChange={(open) => !open && setDeleteConfirmOpen(null)}>
        <AlertDialogContent className="bg-[#252525] border-[#333333]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir tarefa?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir a tarefa "{deleteConfirmOpen?.taskTitle}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#333333] border-[#444444] text-foreground hover:bg-[#3a3a3a]">
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

export function ClientTasks({ tasks, inlineProps }: ClientTasksProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Tasks</h2>
        </div>
        <Link href="/tasks" className="text-sm text-[#2eaadc] hover:underline flex items-center gap-1">
          Ver todas →
        </Link>
      </div>
      <Card className="bg-[#202020] border-[#333333] overflow-hidden">
        <TasksTable tasks={tasks} inlineProps={inlineProps} />
      </Card>
    </div>
  );
}
