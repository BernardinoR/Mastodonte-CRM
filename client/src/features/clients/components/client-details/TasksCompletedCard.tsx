import { useState, useMemo } from "react";
import { subMonths } from "date-fns";
import { Card } from "@/shared/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import type { Task } from "@features/tasks";

interface TasksCompletedCardProps {
  tasks: Task[];
}

export function TasksCompletedCard({ tasks }: TasksCompletedCardProps) {
  const [period, setPeriod] = useState<"year" | "12m">("year");

  // Calcular tasks do período atual e anterior
  const { currentTasks, previousTasks, comparisonText, comparisonYear } = useMemo(() => {
    const now = new Date();

    if (period === "year") {
      // Período atual: ano atual
      const currentYear = now.getFullYear();
      const currentYearStart = new Date(currentYear, 0, 1);
      const currentYearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

      // Período anterior: ano anterior completo
      const previousYear = currentYear - 1;
      const previousYearStart = new Date(previousYear, 0, 1);
      const previousYearEnd = new Date(previousYear, 11, 31, 23, 59, 59);

      const current = tasks.filter((t) => {
        const taskDate = new Date(t.dueDate);
        return taskDate >= currentYearStart && taskDate <= currentYearEnd;
      });

      const previous = tasks.filter((t) => {
        const taskDate = new Date(t.dueDate);
        return taskDate >= previousYearStart && taskDate <= previousYearEnd;
      });

      const currentDone = current.filter((t) => t.status === "Done").length;
      const previousDone = previous.filter((t) => t.status === "Done").length;
      const diff = currentDone - previousDone;

      let text = "";
      if (diff > 0) {
        text = `↑ +${diff} vs ${previousYear}`;
      } else if (diff < 0) {
        text = `↓ ${diff} vs ${previousYear}`;
      } else {
        text = `= vs ${previousYear}`;
      }

      return {
        currentTasks: current,
        previousTasks: previous,
        comparisonText: text,
        comparisonYear: previousYear,
      };
    } else {
      // Período atual: últimos 12 meses
      const current12mStart = subMonths(now, 12);
      const current12mEnd = now;

      // Período anterior: 12 meses anteriores aos 12 meses atuais (13-24 meses atrás)
      const previous12mStart = subMonths(now, 24);
      const previous12mEnd = subMonths(now, 12);

      const current = tasks.filter((t) => {
        const taskDate = new Date(t.dueDate);
        return taskDate >= current12mStart && taskDate <= current12mEnd;
      });

      const previous = tasks.filter((t) => {
        const taskDate = new Date(t.dueDate);
        return taskDate >= previous12mStart && taskDate < previous12mEnd;
      });

      const currentDone = current.filter((t) => t.status === "Done").length;
      const previousDone = previous.filter((t) => t.status === "Done").length;
      const diff = currentDone - previousDone;

      // Para 12M, mostrar o ano do início do período anterior
      const previousStartYear = previous12mStart.getFullYear();

      let text = "";
      if (diff > 0) {
        text = `↑ +${diff} vs ${previousStartYear}`;
      } else if (diff < 0) {
        text = `↓ ${diff} vs ${previousStartYear}`;
      } else {
        text = `= vs ${previousStartYear}`;
      }

      return {
        currentTasks: current,
        previousTasks: previous,
        comparisonText: text,
        comparisonYear: previousStartYear,
      };
    }
  }, [tasks, period]);

  const done = currentTasks.filter((t) => t.status === "Done").length;
  const total = currentTasks.length;
  const previousDone = previousTasks.filter((t) => t.status === "Done").length;
  const isPositive = done > previousDone;
  const isEqual = done === previousDone;

  return (
    <Card className="relative border-[#3a3a3a] bg-[#1a1a1a] p-4" data-testid="card-tasks-completed">
      {/* Toggle no canto superior direito */}
      <div className="absolute right-4 top-4">
        <ToggleGroup
          type="single"
          value={period}
          onValueChange={(value) => {
            if (value) setPeriod(value as "year" | "12m");
          }}
          className="h-7 gap-0"
          size="sm"
          variant="outline"
        >
          <ToggleGroupItem
            value="year"
            aria-label="Ano"
            data-testid="button-period-year"
            className="h-7 rounded-l-md rounded-r-none border-r-0 px-2.5 text-[11px]"
          >
            Ano
          </ToggleGroupItem>
          <ToggleGroupItem
            value="12m"
            aria-label="12M"
            data-testid="button-period-12m"
            className="h-7 rounded-l-none rounded-r-md px-2.5 text-[11px]"
          >
            12M
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Conteúdo principal */}
      <div className="text-2xl font-bold text-foreground" data-testid="text-tasks-count">
        <span className="text-white">{done}</span>
        <span className="text-[#666]">/{total}</span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground" data-testid="text-tasks-label">
        Tasks Concluídas
      </div>

      {/* Mensagem de comparação */}
      {comparisonText && (
        <div
          className={`mt-2 text-xs ${
            isPositive ? "text-emerald-400" : isEqual ? "text-muted-foreground" : "text-red-400"
          }`}
          data-testid="text-comparison"
        >
          {comparisonText}
        </div>
      )}
    </Card>
  );
}
