import { useState, useMemo } from "react";
import { subMonths } from "date-fns";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Task } from "@/types/task";

interface TasksCompletedCardProps {
  tasks: Task[];
}

export function TasksCompletedCard({ tasks }: TasksCompletedCardProps) {
  const [period, setPeriod] = useState<"year" | "12m">("year");
  
  // Filtrar tasks por período
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const cutoff = period === "year" 
      ? new Date(now.getFullYear(), 0, 1)  // Início do ano
      : subMonths(now, 12);                 // Últimos 12 meses
    
    return tasks.filter(t => {
      const taskDate = new Date(t.dueDate);
      return taskDate >= cutoff;
    });
  }, [tasks, period]);
  
  const done = filteredTasks.filter(t => t.status === "Done").length;
  const total = filteredTasks.length;
  
  return (
    <Card 
      className="p-4 bg-[#202020] border-[#333333]"
      data-testid="card-tasks-completed"
    >
      <div 
        className="text-2xl font-bold text-foreground" 
        data-testid="text-tasks-count"
      >
        <span className="text-white">{done}</span>
        <span className="text-[#666]">/{total}</span>
      </div>
      <div 
        className="text-xs text-muted-foreground mt-1" 
        data-testid="text-tasks-label"
      >
        Tasks Concluídas
      </div>
      
      {/* Toggle Ano | 12M */}
      <ToggleGroup
        type="single"
        value={period}
        onValueChange={(value) => {
          if (value) setPeriod(value as "year" | "12m");
        }}
        className="mt-2.5 h-7 gap-0"
        size="sm"
        variant="outline"
      >
        <ToggleGroupItem
          value="year"
          aria-label="Ano"
          data-testid="button-period-year"
          className="text-[11px] px-2.5 h-7 rounded-l-md rounded-r-none border-r-0"
        >
          Ano
        </ToggleGroupItem>
        <ToggleGroupItem
          value="12m"
          aria-label="12M"
          data-testid="button-period-12m"
          className="text-[11px] px-2.5 h-7 rounded-r-md rounded-l-none"
        >
          12M
        </ToggleGroupItem>
      </ToggleGroup>
    </Card>
  );
}

