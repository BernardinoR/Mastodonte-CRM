import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FilterBarProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  assigneeFilter?: string;
  onAssigneeChange?: (value: string) => void;
  priorityFilter?: string;
  onPriorityChange?: (value: string) => void;
  showSearch?: boolean;
  showAssignee?: boolean;
  showPriority?: boolean;
}

export function FilterBar({
  searchQuery = "",
  onSearchChange,
  assigneeFilter = "all",
  onAssigneeChange,
  priorityFilter = "all",
  onPriorityChange,
  showSearch = true,
  showAssignee = true,
  showPriority = true,
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-3 mb-6 flex-wrap">
      {showSearch && (
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
      )}
      {showAssignee && (
        <Select value={assigneeFilter} onValueChange={onAssigneeChange}>
          <SelectTrigger className="w-[180px]" data-testid="select-assignee">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="rafael">Rafael Bernardino</SelectItem>
            <SelectItem value="assistant">Assistente</SelectItem>
          </SelectContent>
        </Select>
      )}
      {showPriority && (
        <Select value={priorityFilter} onValueChange={onPriorityChange}>
          <SelectTrigger className="w-[150px]" data-testid="select-priority">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Urgente">Urgente</SelectItem>
            <SelectItem value="Normal">Normal</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
