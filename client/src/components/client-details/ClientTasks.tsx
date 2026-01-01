/**
 * Componente principal de tarefas do cliente
 * Orquestra a tabela de tarefas
 */
import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Task as GlobalTask } from "@/types/task";
import type { useInlineClientTasks } from "@/hooks/useInlineClientTasks";
import { TasksTable } from "./TasksTable";

export interface ClientTasksProps {
  tasks: GlobalTask[];
  inlineProps: ReturnType<typeof useInlineClientTasks>;
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
