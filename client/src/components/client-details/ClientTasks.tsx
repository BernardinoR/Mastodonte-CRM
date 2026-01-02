/**
 * Componente principal de tarefas do cliente
 * Orquestra a tabela de tarefas
 */
import { Link } from "wouter";
import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { CheckCircle2, Search, X, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Task as GlobalTask, TaskStatus, TaskPriority, DateFilterValue } from "@/types/task";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/types/task";
import type { useInlineClientTasks } from "@/hooks/useInlineClientTasks";
import { TasksTable } from "./TasksTable";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { buildTasksUrl } from "@/hooks/useTaskUrlParams";
import { StatusFilterContent, PriorityFilterContent } from "@/components/filter-bar/FilterPopoverContent";
import { DateRangeFilterContent, formatDateFilterLabel } from "@/components/filter-bar/DateRangeFilterContent";
import { startOfDay, isBefore, isAfter, isSameDay, endOfDay } from "date-fns";

export interface ClientTasksProps {
  tasks: GlobalTask[];
  inlineProps: ReturnType<typeof useInlineClientTasks>;
  clientName: string;
}

export function ClientTasks({ tasks, inlineProps, clientName }: ClientTasksProps) {
  // Estados dos filtros locais
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>(STATUS_OPTIONS);
  const [selectedPriorities, setSelectedPriorities] = useState<(TaskPriority | "none")[]>(PRIORITY_OPTIONS);
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ type: "all" });
  
  // Aplicar filtros locais antes da busca
  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    // Filtro de status
    if (selectedStatuses.length < STATUS_OPTIONS.length) {
      result = result.filter(task => selectedStatuses.includes(task.status));
    }
    
    // Filtro de prioridade
    if (selectedPriorities.length < PRIORITY_OPTIONS.length) {
      result = result.filter(task => {
        const taskPriority = task.priority || "none";
        return selectedPriorities.includes(taskPriority);
      });
    }
    
    // Filtro de data
    if (dateFilter.type !== "all") {
      const today = startOfDay(new Date());
      result = result.filter(task => {
        const taskDate = task.dueDate ? startOfDay(new Date(task.dueDate)) : null;
        
        if (dateFilter.type === "preset") {
          switch (dateFilter.preset) {
            case "today":
              return taskDate && isSameDay(taskDate, today);
            case "overdue":
              return taskDate && isBefore(taskDate, today);
            case "no-date":
              return !taskDate;
            default:
              return true;
          }
        } else if (dateFilter.type === "range" || dateFilter.type === "relative") {
          if (dateFilter.startDate && dateFilter.endDate) {
            const start = startOfDay(dateFilter.startDate);
            const end = endOfDay(dateFilter.endDate);
            return taskDate && taskDate >= start && taskDate <= end;
          } else if (dateFilter.startDate) {
            const start = startOfDay(dateFilter.startDate);
            return taskDate && !isBefore(taskDate, start);
          }
        }
        
        return true;
      });
    }
    
    return result;
  }, [tasks, selectedStatuses, selectedPriorities, dateFilter]);
  
  // Hook de busca por título (aplicado após os filtros)
  const searchFilter = useSearchFilter<GlobalTask>(
    filteredTasks, 
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
  
  // Handlers dos filtros
  const handleStatusToggle = useCallback((status: TaskStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  }, []);
  
  const handlePriorityToggle = useCallback((priority: TaskPriority | "none") => {
    setSelectedPriorities(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  }, []);
  
  const handleDateChange = useCallback((value: DateFilterValue) => {
    setDateFilter(value);
  }, []);
  
  // Labels dos filtros
  const statusLabel = selectedStatuses.length === STATUS_OPTIONS.length 
    ? "Status" 
    : `Status (${selectedStatuses.length})`;
  
  const priorityLabel = selectedPriorities.length === PRIORITY_OPTIONS.length 
    ? "Prioridade" 
    : `Prioridade (${selectedPriorities.length})`;
  
  const dateLabel = dateFilter.type === "all" 
    ? "Data" 
    : formatDateFilterLabel(dateFilter);

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
          
          {/* Filtros */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                data-testid="button-filter-status"
              >
                {statusLabel}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" side="bottom" align="start" sideOffset={6}>
              <StatusFilterContent 
                selectedValues={selectedStatuses} 
                onToggle={handleStatusToggle} 
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                data-testid="button-filter-priority"
              >
                {priorityLabel}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
                    </PopoverTrigger>
            <PopoverContent className="w-64 p-0" side="bottom" align="start" sideOffset={6}>
              <PriorityFilterContent 
                selectedValues={selectedPriorities} 
                onToggle={handlePriorityToggle} 
                      />
                    </PopoverContent>
                  </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                data-testid="button-filter-date"
              >
                {dateLabel}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
                      </PopoverTrigger>
            <PopoverContent className="w-auto p-0" side="bottom" align="start" sideOffset={6}>
              <DateRangeFilterContent 
                value={dateFilter}
                onChange={handleDateChange}
                        />
                      </PopoverContent>
                    </Popover>
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
