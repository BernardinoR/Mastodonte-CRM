import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, X, Pencil, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseLocalDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { PriorityBadge, StatusBadge, PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/components/ui/task-badges";
import { ClientSelector, AssigneeSelector } from "@/components/task-editors";
import { UI_CLASSES } from "@/lib/statusConfig";
import { getAvatarColor, getInitials } from "@/components/ui/task-assignees";
import type { TaskPriority, TaskStatus } from "@/types/task";

interface TaskDatePopoverProps {
  id: string;
  dateValue: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDateChange: (date: Date | undefined) => void;
  onStopPropagation: () => void;
  popoverRef?: React.RefObject<HTMLDivElement>;
}

export const TaskDatePopover = memo(function TaskDatePopover({
  id,
  dateValue,
  isOpen,
  onOpenChange,
  onDateChange,
  onStopPropagation,
  popoverRef,
}: TaskDatePopoverProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onStopPropagation();
  }, [onStopPropagation]);

  const handleInteractOutside = useCallback((e: any) => {
    const originalTarget = e.detail?.originalEvent?.target as HTMLElement | null;
    const target = originalTarget || (e.target as HTMLElement);
    if (popoverRef?.current?.contains(target) || target?.closest('.rdp')) {
      e.preventDefault();
    }
  }, [popoverRef]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      onDateChange(date);
      onOpenChange(false);
    }
  }, [onDateChange, onOpenChange]);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <span 
          className="inline-flex items-center gap-1.5 font-medium cursor-pointer px-2 py-0.5 rounded-full hover:bg-gray-700/80 hover:text-foreground text-[13px]"
          onClick={handleClick}
          data-testid={`text-date-${id}`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          {format(parseLocalDate(dateValue), "dd/MM/yyyy", { locale: ptBR })}
        </span>
      </PopoverTrigger>
      <PopoverContent 
        ref={popoverRef}
        className={cn("w-auto p-0", UI_CLASSES.popover)}
        side="bottom" 
        align="start" 
        sideOffset={6} 
        avoidCollisions={true} 
        collisionPadding={8}
        onInteractOutside={handleInteractOutside}
        onPointerDownOutside={handleInteractOutside}
        onFocusOutside={handleInteractOutside}
      >
        <DateInput
          value={dateValue}
          onChange={handleDateSelect}
          className="font-semibold"
          dataTestId={`input-date-${id}`}
          hideIcon
          commitOnInput={false}
        />
      </PopoverContent>
    </Popover>
  );
});

interface TaskPriorityPopoverProps {
  id: string;
  priority: TaskPriority | undefined;
  isEditing: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPriorityChange: (priority: TaskPriority | "_none") => void;
  onStopPropagation: () => void;
}

export const TaskPriorityPopover = memo(function TaskPriorityPopover({
  id,
  priority,
  isEditing,
  isOpen,
  onOpenChange,
  onPriorityChange,
  onStopPropagation,
}: TaskPriorityPopoverProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onStopPropagation();
  }, [onStopPropagation]);

  const handlePrioritySelect = useCallback((p: TaskPriority | "_none") => {
    onPriorityChange(p);
    onOpenChange(false);
  }, [onPriorityChange, onOpenChange]);

  if (!priority && !isEditing) return null;

  return (
    <div className={cn("flex items-center gap-1.5 text-xs md:text-sm", isEditing && "-mx-2")}>
      {priority ? (
        <div className={cn(
          "inline-flex items-center gap-1 rounded-full",
          isEditing ? "px-2 py-0.5 group/edit-priority hover:bg-gray-700/80" : ""
        )}>
          <Popover open={isOpen} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
              <div onClick={handleClick}>
                <PriorityBadge 
                  priority={priority}
                  className="cursor-pointer hover:bg-muted/50"
                  data-testid={`badge-priority-${id}`}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className={cn("w-56 p-0", UI_CLASSES.popover)} side="bottom" align="start" sideOffset={6} avoidCollisions={true} collisionPadding={8}>
              <div className="w-full">
                <div className={cn("border-b", UI_CLASSES.border)}>
                  <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                  <div className="px-3 py-1">
                    <div 
                      className={cn("flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md group", UI_CLASSES.selectedItem)}
                      onClick={(e) => { e.stopPropagation(); handlePrioritySelect("_none"); }}
                    >
                      <PriorityBadge priority={priority} />
                      <X className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
                <div className="pb-1">
                  {PRIORITY_OPTIONS.filter(p => p !== priority).map(p => (
                    <div
                      key={p}
                      className={UI_CLASSES.dropdownItem}
                      onClick={(e) => { e.stopPropagation(); handlePrioritySelect(p); }}
                    >
                      <PriorityBadge priority={p} />
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {isEditing && (
            <Button
              size="icon"
              variant="ghost"
              className="h-4 w-4 text-muted-foreground hover:text-foreground hidden group-hover/edit-priority:inline-flex"
              onClick={(e) => {
                e.stopPropagation();
                handlePrioritySelect("_none");
              }}
              data-testid={`button-clear-priority-${id}`}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      ) : (
        <Popover open={isOpen} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            <span 
              className="inline-flex px-2 py-0.5 rounded-full cursor-pointer text-muted-foreground hover:text-foreground hover:bg-gray-700/80"
              onClick={handleClick}
              data-testid={`badge-priority-${id}`}
            >
              + Adicionar Prioridade
            </span>
          </PopoverTrigger>
          <PopoverContent className={cn("w-56 p-0", UI_CLASSES.popover)} side="bottom" align="start" sideOffset={6} avoidCollisions={true} collisionPadding={8}>
            <div className="w-full">
              <div className="px-3 py-1.5 text-xs text-gray-500">Selecionar prioridade</div>
              <div className="pb-1">
                {PRIORITY_OPTIONS.map(p => (
                  <div
                    key={p}
                    className={UI_CLASSES.dropdownItem}
                    onClick={(e) => { e.stopPropagation(); handlePrioritySelect(p); }}
                  >
                    <PriorityBadge priority={p} />
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
});

interface TaskStatusPopoverProps {
  id: string;
  status: TaskStatus;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (status: TaskStatus) => void;
  onStopPropagation: () => void;
}

export const TaskStatusPopover = memo(function TaskStatusPopover({
  id,
  status,
  isOpen,
  onOpenChange,
  onStatusChange,
  onStopPropagation,
}: TaskStatusPopoverProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onStopPropagation();
  }, [onStopPropagation]);

  const handleStatusSelect = useCallback((s: TaskStatus) => {
    onStatusChange(s);
    onOpenChange(false);
  }, [onStatusChange, onOpenChange]);

  return (
    <div className="flex items-center gap-1.5 text-xs md:text-sm">
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <div onClick={handleClick}>
            <StatusBadge 
              status={status}
              className="cursor-pointer hover:bg-muted/50"
              data-testid={`badge-status-${id}`}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6} avoidCollisions={true} collisionPadding={8}>
          <div className="w-full">
            <div className={cn("border-b", UI_CLASSES.border)}>
              <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
              <div className="px-3 py-1">
                <div className={cn("flex items-center gap-2 px-2 py-1.5 rounded-md", UI_CLASSES.selectedItem)}>
                  <StatusBadge status={status} />
                </div>
              </div>
            </div>
            <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
            <div className="pb-1">
              {STATUS_OPTIONS.filter(s => s !== status).map(s => (
                <div
                  key={s}
                  className={UI_CLASSES.dropdownItem}
                  onClick={(e) => { e.stopPropagation(); handleStatusSelect(s); }}
                >
                  <StatusBadge status={s} />
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});

// ============================================
// TaskClientPopover - Shared client selector
// ============================================

interface TaskClientPopoverProps {
  id: string;
  clientName: string | null;
  isEditing?: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClientChange: (client: string) => void;
  onStopPropagation?: () => void;
  onNavigate?: (clientName: string) => void;
  variant?: "card" | "modal" | "table";
}

export const TaskClientPopover = memo(function TaskClientPopover({
  id,
  clientName,
  isEditing = true,
  isOpen,
  onOpenChange,
  onClientChange,
  onStopPropagation,
  onNavigate,
  variant = "card",
}: TaskClientPopoverProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onStopPropagation?.();
  }, [onStopPropagation]);

  const handleClientSelect = useCallback((client: string) => {
    onClientChange(client);
    onOpenChange(false);
  }, [onClientChange, onOpenChange]);

  const handleNavigate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onStopPropagation?.();
    if (clientName && onNavigate) {
      onNavigate(clientName);
    }
  }, [clientName, onNavigate, onStopPropagation]);

  const handleClearClient = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClientChange("_none");
  }, [onClientChange]);

  const isModal = variant === "modal";
  const isTable = variant === "table";

  if (!clientName && !isEditing && !isTable) return null;

  // Table variant: compact click-to-navigate + hover-to-edit
  if (isTable) {
    return (
      <div className="flex items-center gap-1 group">
        {clientName ? (
          <>
            <span 
              className="text-sm text-muted-foreground hover:text-primary hover:underline cursor-pointer line-clamp-2"
              onClick={handleNavigate}
              data-testid={`text-client-${id}`}
            >
              {clientName}
            </span>
            <Popover open={isOpen} onOpenChange={onOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={handleClick}
                  data-testid={`button-edit-client-${id}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className={cn("w-80 p-0", UI_CLASSES.popover)}
                side="bottom" 
                align="start" 
                sideOffset={6}
              >
                <ClientSelector 
                  selectedClient={clientName}
                  onSelect={handleClientSelect}
                />
              </PopoverContent>
            </Popover>
          </>
        ) : (
          <Popover open={isOpen} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
              <span 
                className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={handleClick}
                data-testid={`text-client-${id}`}
              >
                Selecionar
              </span>
            </PopoverTrigger>
            <PopoverContent 
              className={cn("w-80 p-0", UI_CLASSES.popover)}
              side="bottom" 
              align="start" 
              sideOffset={6}
            >
              <ClientSelector 
                selectedClient={null}
                onSelect={handleClientSelect}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-1 group",
      !isModal && isEditing && "-mx-2"
    )}>
      {clientName ? (
        <div className={cn(
          "inline-flex items-center gap-1",
          isEditing && !isModal ? "px-2 py-0.5 rounded-full group/edit-client hover:bg-gray-700/80" : ""
        )}>
          {isEditing && !isModal ? (
            <Popover open={isOpen} onOpenChange={onOpenChange}>
              <PopoverTrigger asChild>
                <span 
                  className="inline-flex items-center gap-1.5 font-medium cursor-pointer px-2 py-0.5 rounded-full hover:bg-gray-700/80 hover:text-foreground text-[13px]"
                  onClick={handleClick}
                  data-testid={`text-client-${id}`}
                >
                  {clientName}
                </span>
              </PopoverTrigger>
              <PopoverContent 
                className={cn("w-80 p-0", UI_CLASSES.popover)}
                side="bottom" 
                align="start" 
                sideOffset={6} 
                avoidCollisions={true} 
                collisionPadding={8}
              >
                <ClientSelector 
                  selectedClient={clientName}
                  onSelect={handleClientSelect}
                />
              </PopoverContent>
            </Popover>
          ) : isModal ? (
            <span 
              className="inline-flex items-center gap-1.5 font-medium cursor-pointer px-2 py-0.5 rounded-full hover:bg-gray-700/80 hover:text-foreground text-2xl font-semibold text-white leading-tight -ml-2"
              onClick={handleNavigate}
              data-testid={`text-client-${id}`}
            >
              {clientName}
            </span>
          ) : (
            <span 
              className="inline-flex items-center gap-1.5 font-medium cursor-pointer px-2 py-0.5 rounded-full hover:bg-gray-700/80 hover:text-foreground text-[13px]"
              onClick={handleNavigate}
              data-testid={`text-client-${id}`}
            >
              {clientName}
            </span>
          )}
          {isEditing && !isModal && (
            <Button
              size="icon"
              variant="ghost"
              className="h-4 w-4 text-muted-foreground hover:text-foreground hidden group-hover/edit-client:inline-flex"
              onClick={handleClearClient}
              data-testid={`button-clear-client-${id}`}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          {isModal && (
            <Popover open={isOpen} onOpenChange={onOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  data-testid="button-edit-client"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className={cn("w-80 p-0", UI_CLASSES.popover)}
                side="bottom" 
                align="start" 
                sideOffset={6}
              >
                <ClientSelector 
                  selectedClient={clientName}
                  onSelect={handleClientSelect}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      ) : isEditing ? (
        <Popover open={isOpen} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            <span 
              className={cn(
                "inline-flex px-2 py-0.5 rounded-full cursor-pointer text-muted-foreground hover:text-foreground hover:bg-gray-700/80",
                isModal ? "text-2xl font-semibold leading-tight -ml-2" : ""
              )}
              onClick={handleClick}
              data-testid={`text-client-${id}`}
            >
              {isModal ? "Sem cliente" : "+ Adicionar Cliente"}
            </span>
          </PopoverTrigger>
          <PopoverContent 
            className={cn("w-80 p-0", UI_CLASSES.popover)}
            side="bottom" 
            align="start" 
            sideOffset={6} 
            avoidCollisions={true} 
            collisionPadding={8}
          >
            <ClientSelector 
              selectedClient={null}
              onSelect={handleClientSelect}
            />
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
});

// ============================================
// TaskAssigneesPopover - Shared assignees selector
// ============================================

interface TaskAssigneesPopoverProps {
  id: string;
  assignees: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAssignee: (assignee: string) => void;
  onRemoveAssignee: (assignee: string) => void;
  onStopPropagation?: () => void;
  variant?: "card" | "modal";
  maxDisplay?: number;
}

export const TaskAssigneesPopover = memo(function TaskAssigneesPopover({
  id,
  assignees,
  isOpen,
  onOpenChange,
  onAddAssignee,
  onRemoveAssignee,
  onStopPropagation,
  variant = "card",
  maxDisplay = 3,
}: TaskAssigneesPopoverProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onStopPropagation?.();
  }, [onStopPropagation]);

  const isModal = variant === "modal";
  const displayed = assignees.slice(0, maxDisplay);
  const remaining = assignees.slice(maxDisplay);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div 
          className={cn(
            "inline-flex items-center gap-2 rounded-md cursor-pointer transition-colors",
            isModal 
              ? "px-2 py-1 -ml-2 hover:bg-gray-700/80" 
              : "hover:bg-gray-700/80 px-1 py-0.5"
          )}
          onClick={handleClick}
          data-testid={`button-edit-assignees-${id}`}
        >
          {assignees.length === 0 ? (
            <span className="text-gray-500 text-sm">
              {isModal ? "Adicionar responsável..." : "+ Responsável"}
            </span>
          ) : (
            <>
              <div className="flex -space-x-2 flex-shrink-0">
                {displayed.map((assignee, idx) => (
                  <Avatar 
                    key={idx} 
                    className={cn(
                      isModal ? "w-7 h-7" : "w-6 h-6",
                      UI_CLASSES.avatarBorder,
                      getAvatarColor(idx)
                    )}
                  >
                    <AvatarFallback className="bg-transparent text-white font-medium text-[11px]">
                      {getInitials(assignee)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {isModal && (
                <div className="flex items-center">
                  <span className="text-gray-300 text-sm">
                    {displayed.join(", ")}
                  </span>
                  {remaining.length > 0 && (
                    <span className="text-gray-400 text-sm whitespace-nowrap ml-1">
                      e mais {remaining.length}...
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-0" 
        side={isModal ? "top" : "bottom"} 
        align="start" 
        sideOffset={6}
      >
        <AssigneeSelector
          selectedAssignees={assignees}
          onSelect={onAddAssignee}
          onRemove={onRemoveAssignee}
        />
      </PopoverContent>
    </Popover>
  );
});
