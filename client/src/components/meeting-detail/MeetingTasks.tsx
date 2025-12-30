import { useState } from "react";
import { CheckSquare, Plus, Calendar, User, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { MeetingLinkedTask } from "@/types/meeting";

interface MeetingTasksProps {
  tasks: MeetingLinkedTask[];
}

export function MeetingTasks({ tasks }: MeetingTasksProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(
    new Set(tasks.filter(t => t.completed).map(t => t.id))
  );

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
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
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CheckSquare className="w-[18px] h-[18px] text-[#8c8c8c]" />
          <h2 className="text-sm font-semibold text-[#ededed]">Tasks Vinculadas</h2>
          <span className="bg-[#333333] text-[#8c8c8c] text-xs font-medium px-2 py-0.5 rounded">
            {tasks.length}
          </span>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-dashed border-[#333333] rounded-md text-[#2eaadc] text-[0.8125rem] font-medium hover:bg-[#1c3847] hover:border-[#2eaadc] transition-all">
          <Plus className="w-3.5 h-3.5" />
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
                "flex items-center gap-3.5 px-4 py-3.5 bg-[#252730] border border-[#363842] rounded-lg cursor-pointer transition-all hover:bg-[#2a2d38] hover:border-[#4a4f5c]",
                "border-l-4",
                isCompleted 
                  ? "border-l-[#10b981]" 
                  : task.priority === "Importante" 
                    ? "border-l-[#f59e0b]" 
                    : "border-l-[#4281dc]"
              )}
              onClick={() => toggleTask(task.id)}
            >
              <div 
                className={cn(
                  "w-[18px] h-[18px] border-2 rounded flex items-center justify-center flex-shrink-0 transition-all",
                  isCompleted 
                    ? "bg-[#10b981] border-[#10b981]" 
                    : "border-[#444]"
                )}
              >
                {isCompleted && <Check className="w-3 h-3 text-[#121212]" />}
              </div>

              <div className="flex-1 min-w-0">
                <div 
                  className={cn(
                    "text-sm font-medium mb-1",
                    isCompleted ? "text-[#8c8c8c] line-through" : "text-[#ededed]"
                  )}
                >
                  {task.title}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#8c8c8c]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(task.dueDate, "dd MMM yyyy", { locale: ptBR })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {task.assignee}
                  </span>
                </div>
              </div>

              <Badge 
                className={cn(
                  "text-[0.6875rem]",
                  task.priority === "Importante" 
                    ? "bg-[#422c24] text-[#f59e0b]" 
                    : "bg-[#333333] text-[#a0a0a0]"
                )}
              >
                {task.priority}
              </Badge>

              <div 
                className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[0.625rem] font-semibold text-white"
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

