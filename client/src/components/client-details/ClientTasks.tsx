/**
 * Componente principal de tarefas do cliente
 * Orquestra a tabela de tarefas
 */
import { Link } from "wouter";
import { useRef, useEffect } from "react";
import { CheckCircle2, Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focar no input quando a busca abrir
  useEffect(() => {
    if (searchFilter.isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchFilter.isSearchOpen]);

  const handleSearchBlur = () => {
    // Não fechar se ainda há texto digitado
    if (!searchFilter.searchTerm.trim()) {
      searchFilter.closeSearch();
    }
  };

  const handleClearSearch = () => {
    searchFilter.setSearchTerm("");
    searchFilter.closeSearch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Tasks</h2>
            </div>
          
          {/* Search - Expandable with animation (mesmo estilo do FilterBar) */}
          <div 
            className={cn(
              "relative flex items-center h-8 rounded-full overflow-hidden transition-all duration-300 ease-out",
              searchFilter.isSearchOpen 
                ? "w-52 bg-[#1a1a1a] border border-[#333] px-3" 
                : "w-8"
            )}
          >
            <button
              onClick={() => !searchFilter.isSearchOpen && searchFilter.openSearch()}
              className={cn(
                "flex items-center justify-center shrink-0 transition-colors",
                searchFilter.isSearchOpen 
                  ? "w-4 h-4 text-gray-500 cursor-default" 
                  : "w-8 h-8 rounded-full text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]"
              )}
              data-testid="button-search"
            >
              <Search className="w-4 h-4" />
            </button>
            
            <div className={cn(
              "flex items-center gap-1.5 overflow-hidden transition-all duration-300 ease-out",
              searchFilter.isSearchOpen ? "w-full opacity-100 ml-1.5" : "w-0 opacity-0"
            )}>
              <Input
                ref={searchInputRef}
                type="text"
                value={searchFilter.searchTerm}
                onChange={(e) => searchFilter.setSearchTerm(e.target.value)}
                onBlur={handleSearchBlur}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    handleClearSearch();
                  }
                }}
                placeholder="Buscar tarefa..."
                className="h-7 flex-1 bg-transparent border-0 p-0 text-sm focus-visible:ring-0 placeholder:text-gray-500"
                data-testid="input-search-task"
              />
              {searchFilter.searchTerm && (
          <button
                  onClick={handleClearSearch}
                  className="flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-300 shrink-0"
                  data-testid="button-clear-search"
                >
                  <X className="w-3.5 h-3.5" />
          </button>
              )}
            </div>
        </div>
      </div>

        <Link 
          href={buildTasksUrl(clientName)} 
          className="text-sm text-[#2eaadc] hover:underline flex items-center gap-1"
          data-testid="link-view-all-tasks"
        >
          Ver todas →
        </Link>
      </div>
      <Card className="bg-[#202020] border-[#333333] overflow-hidden">
        <TasksTable tasks={searchFilter.filteredItems} inlineProps={inlineProps} />
      </Card>
    </div>
  );
}
