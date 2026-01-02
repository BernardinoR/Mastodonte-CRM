/**
 * Componente principal de tarefas do cliente
 * Orquestra a tabela de tarefas
 */
import { Link } from "wouter";
import { CheckCircle2, Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Task as GlobalTask } from "@/types/task";
import type { useInlineClientTasks } from "@/hooks/useInlineClientTasks";
import { TasksTable } from "./TasksTable";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { buildTasksUrl } from "@/hooks/useTaskUrlParams";

export interface ClientTasksProps {
  tasks: GlobalTask[];
  inlineProps: ReturnType<typeof useInlineClientTasks>;
  clientName: string;
}

export function ClientTasks({ tasks, inlineProps, clientName }: ClientTasksProps) {
  // Hook de busca por título
  const searchFilter = useSearchFilter<GlobalTask>(
    tasks,
    (task, term) => task.title.toLowerCase().includes(term)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Tasks</h2>
        </div>
        <div className="flex items-center gap-3">
          {searchFilter.isSearchOpen ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchFilter.searchTerm}
                onChange={(e) => searchFilter.setSearchTerm(e.target.value)}
                placeholder="Buscar tarefa..."
                className="bg-[#2c2c2c] border border-[#404040] rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#2eaadc] w-48"
                autoFocus
                data-testid="input-search-task"
              />
              <button
                onClick={searchFilter.closeSearch}
                className="p-1 hover:bg-[#2c2c2c] rounded transition-colors"
                data-testid="button-close-search"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <button
              onClick={searchFilter.openSearch}
              className="p-1 hover:bg-[#2c2c2c] rounded transition-colors"
              data-testid="button-open-search"
            >
              <Search className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <Link 
            href={buildTasksUrl(clientName)} 
            className="text-sm text-[#2eaadc] hover:underline flex items-center gap-1"
            data-testid="link-view-all-tasks"
          >
            Ver todas →
          </Link>
        </div>
      </div>
      <Card className="bg-[#202020] border-[#333333] overflow-hidden">
        <TasksTable tasks={searchFilter.filteredItems} inlineProps={inlineProps} />
      </Card>
    </div>
  );
}
