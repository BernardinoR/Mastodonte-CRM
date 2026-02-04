import { useState } from "react";
import { CheckSquare, Plus, Calendar, User, Check } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CheckSquare className="h-[18px] w-[18px] text-[#8c8c8c]" />
          <h2 className="text-sm font-semibold text-[#ededed]">Tasks Vinculadas</h2>
          <span className="rounded bg-[#333333] px-2 py-0.5 text-xs font-medium text-[#8c8c8c]">
            {tasks.length}
          </span>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-[#333333] bg-transparent px-3 py-1.5 text-[0.8125rem] font-medium text-[#2eaadc] transition-all hover:border-[#2eaadc] hover:bg-[#1c3847]">
          <Plus className="h-3.5 w-3.5" />
          Nova Task
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {tasks.map((task) => {
          const isCompleted = completedTasks.has(task.id);
          return (
            <div
              key={task.id}
              className={cn(
                "flex cursor-pointer items-center gap-3.5 rounded-lg border border-[#363842] bg-[#252730] px-4 py-3.5 transition-all hover:border-[#4a4f5c] hover:bg-[#2a2d38]",
                "border-l-4",
                isCompleted
                  ? "border-l-[#10b981]"
                  : task.priority === "Importante"
                    ? "border-l-[#f59e0b]"
                    : "border-l-[#4281dc]",
              )}
              onClick={() => toggleTask(task.id)}
            >
              <div
                className={cn(
                  "flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded border-2 transition-all",
                  isCompleted ? "border-[#10b981] bg-[#10b981]" : "border-[#444]",
                )}
              >
                {isCompleted && <Check className="h-3 w-3 text-[#121212]" />}
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "mb-1 text-sm font-medium",
                    isCompleted ? "text-[#8c8c8c] line-through" : "text-[#ededed]",
                  )}
                >
                  {task.title}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#8c8c8c]">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(task.dueDate, "dd MMM yyyy", { locale: ptBR })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {task.assignee}
                  </span>
                </div>
              </div>

              <Badge
                className={cn(
                  "text-[0.6875rem]",
                  task.priority === "Importante"
                    ? "bg-[#422c24] text-[#f59e0b]"
                    : "bg-[#333333] text-[#a0a0a0]",
                )}
              >
                {task.priority}
              </Badge>

              <div
                className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-[0.625rem] font-semibold text-white"
                style={{ backgroundColor: "#2563eb" }}
              >
                {getInitials(task.assignee)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
