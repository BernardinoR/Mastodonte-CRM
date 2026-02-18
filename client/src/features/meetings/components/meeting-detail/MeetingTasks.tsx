import { useState } from "react";
import { CheckSquare, Plus, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import type { MeetingLinkedTask } from "@features/meetings/types/meeting";

interface MeetingTasksProps {
  tasks: MeetingLinkedTask[];
}

export function MeetingTasks({ tasks }: MeetingTasksProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(
    new Set(tasks.filter((t) => t.completed).map((t) => t.id)),
  );

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-[18px] w-[18px] text-gray-400" />
          <h3 className="text-sm font-bold text-white">Tarefas Vinculadas</h3>
        </div>
        <button className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2eaadc] transition-colors hover:text-[#3bc0f0]">
          <Plus className="h-3.5 w-3.5" />
          Nova Tarefa
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#262626] bg-[#161616]">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_100px_100px_110px_100px] gap-4 bg-[#1a1a1a] px-4 py-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Tarefa
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Status
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Prioridade
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Prazo
          </span>
          <span className="text-right text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Responsavel
          </span>
        </div>

        {/* Table rows */}
        {tasks.map((task) => {
          const isCompleted = completedTasks.has(task.id);
          return (
            <div
              key={task.id}
              className="grid cursor-pointer grid-cols-[1fr_100px_100px_110px_100px] items-center gap-4 border-t border-[#262626] px-4 py-3 transition-colors hover:bg-[#1f1f1f]"
              onClick={() => toggleTask(task.id)}
            >
              {/* Task name */}
              <span
                className={cn(
                  "text-xs font-medium",
                  isCompleted ? "text-gray-500 line-through" : "text-gray-200",
                )}
              >
                {task.title}
              </span>

              {/* Status */}
              <span
                className={cn(
                  "inline-flex w-fit rounded px-2 py-0.5 text-[9px] font-medium",
                  isCompleted
                    ? "bg-[#064e3b]/30 text-emerald-500"
                    : "bg-[#1e293b] text-blue-300",
                )}
              >
                {isCompleted ? "Concluida" : "Em Progresso"}
              </span>

              {/* Priority */}
              <span
                className={cn(
                  "inline-flex w-fit rounded px-2 py-0.5 text-[9px] font-medium",
                  task.priority === "Importante"
                    ? "bg-[#451a03] text-orange-400"
                    : "bg-[#262626] text-gray-400",
                )}
              >
                {task.priority === "Importante" ? "Alta" : "Normal"}
              </span>

              {/* Due date */}
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="h-3 w-3" />
                {format(task.dueDate, "dd MMM yyyy", { locale: ptBR })}
              </span>

              {/* Assignee */}
              <span className="text-right text-xs text-gray-400">{task.assignee}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
