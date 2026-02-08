import { memo, useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import { DateInput } from "@/shared/components/ui/date-input";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Calendar as CalendarIcon, X, Pencil } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseLocalDate } from "@/shared/lib/date-utils";
import { cn } from "@/shared/lib/utils";
import {
  PriorityBadge,
  StatusBadge,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "@/shared/components/ui/task-badges";
import { ClientSelector, AssigneeSelector } from "./task-editors";
import { UI_CLASSES } from "../lib/statusConfig";
import { getAvatarColor, getInitials } from "@/shared/components/ui/task-assignees";
import type { TaskPriority, TaskStatus } from "../types/task";

// ============================================
// Shared styles configuration
// ============================================

const TRIGGER_STYLES = {
  base: "inline-flex items-center gap-1.5 font-medium cursor-pointer px-2 py-0.5 rounded-full hover:bg-gray-700/80 hover:text-foreground transition-colors",
  card: "text-[13px]",
  modal: "text-sm font-medium text-gray-200",
  table: "text-sm text-muted-foreground",
} as const;

// ============================================
// TaskDatePopover
// ============================================

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
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onStopPropagation();
    },
    [onStopPropagation],
  );

  const handleInteractOutside = useCallback(
    (e: CustomEvent<{ originalEvent?: Event }>) => {
      const originalTarget = e.detail?.originalEvent?.target as HTMLElement | null;
      const target = originalTarget || (e.target as HTMLElement);
      if (popoverRef?.current?.contains(target) || target?.closest(".rdp")) {
        e.preventDefault();
      }
    },
    [popoverRef],
  );

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        onDateChange(date);
        onOpenChange(false);
      }
    },
    [onDateChange, onOpenChange],
  );

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <span
          className={cn(TRIGGER_STYLES.base, TRIGGER_STYLES.card)}
          onClick={handleClick}
          data-testid={`text-date-${id}`}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
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

// ============================================
// TaskPriorityPopover
// ============================================

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
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onStopPropagation();
    },
    [onStopPropagation],
  );

  const handlePrioritySelect = useCallback(
    (p: TaskPriority | "_none") => {
      onPriorityChange(p);
      onOpenChange(false);
    },
    [onPriorityChange, onOpenChange],
  );

  if (!priority && !isEditing) return null;

  return (
    <div className={cn("flex items-center gap-1.5 text-xs md:text-sm", isEditing && "-mx-2")}>
      {priority ? (
        <div
          className={cn(
            "inline-flex items-center gap-1 rounded-full",
            isEditing ? "group/edit-priority px-2 py-0.5 hover:bg-gray-700/80" : "",
          )}
        >
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
            <PopoverContent
              className={cn("w-56 p-0", UI_CLASSES.popover)}
              side="bottom"
              align="start"
              sideOffset={6}
              avoidCollisions={true}
              collisionPadding={8}
            >
              <div className="w-full">
                <div className={cn("border-b", UI_CLASSES.border)}>
                  <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                  <div className="px-3 py-1">
                    <div
                      className={cn(
                        "group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5",
                        UI_CLASSES.selectedItem,
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrioritySelect("_none");
                      }}
                    >
                      <PriorityBadge priority={priority} />
                      <X className="ml-auto h-3 w-3 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
                <div className="pb-1">
                  {PRIORITY_OPTIONS.filter((p) => p !== priority).map((p) => (
                    <div
                      key={p}
                      className={UI_CLASSES.dropdownItem}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrioritySelect(p);
                      }}
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
              className="hidden h-4 w-4 text-muted-foreground hover:text-foreground group-hover/edit-priority:inline-flex"
              onClick={(e) => {
                e.stopPropagation();
                handlePrioritySelect("_none");
              }}
              data-testid={`button-clear-priority-${id}`}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ) : (
        <Popover open={isOpen} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            <span
              className="inline-flex cursor-pointer rounded-full px-2 py-0.5 text-muted-foreground hover:bg-gray-700/80 hover:text-foreground"
              onClick={handleClick}
              data-testid={`badge-priority-${id}`}
            >
              + Adicionar Prioridade
            </span>
          </PopoverTrigger>
          <PopoverContent
            className={cn("w-56 p-0", UI_CLASSES.popover)}
            side="bottom"
            align="start"
            sideOffset={6}
            avoidCollisions={true}
            collisionPadding={8}
          >
            <div className="w-full">
              <div className="px-3 py-1.5 text-xs text-gray-500">Selecionar prioridade</div>
              <div className="pb-1">
                {PRIORITY_OPTIONS.map((p) => (
                  <div
                    key={p}
                    className={UI_CLASSES.dropdownItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrioritySelect(p);
                    }}
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

// ============================================
// TaskStatusPopover
// ============================================

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
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onStopPropagation();
    },
    [onStopPropagation],
  );

  const handleStatusSelect = useCallback(
    (s: TaskStatus) => {
      onStatusChange(s);
      onOpenChange(false);
    },
    [onStatusChange, onOpenChange],
  );

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
        <PopoverContent
          className="w-56 p-0"
          side="bottom"
          align="start"
          sideOffset={6}
          avoidCollisions={true}
          collisionPadding={8}
        >
          <div className="w-full">
            <div className={cn("border-b", UI_CLASSES.border)}>
              <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
              <div className="px-3 py-1">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5",
                    UI_CLASSES.selectedItem,
                  )}
                >
                  <StatusBadge status={status} />
                </div>
              </div>
            </div>
            <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
            <div className="pb-1">
              {STATUS_OPTIONS.filter((s) => s !== status).map((s) => (
                <div
                  key={s}
                  className={UI_CLASSES.dropdownItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusSelect(s);
                  }}
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
// TaskClientPopover - Unified client selector
// ============================================

interface TaskClientPopoverProps {
  id: string;
  clientId?: string | null;
  clientName: string | null;
  isEditing?: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClientChange: (clientId: string, clientName: string) => void;
  onStopPropagation?: () => void;
  onNavigate?: (clientId: string) => void;
  variant?: "card" | "modal" | "table";
}

export const TaskClientPopover = memo(function TaskClientPopover({
  id,
  clientId,
  clientName,
  isEditing = true,
  isOpen,
  onOpenChange,
  onClientChange,
  onStopPropagation,
  onNavigate,
  variant = "card",
}: TaskClientPopoverProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onStopPropagation?.();
    },
    [onStopPropagation],
  );

  const handleClientSelect = useCallback(
    (clientId: string, clientName: string) => {
      onClientChange(clientId, clientName);
      onOpenChange(false);
    },
    [onClientChange, onOpenChange],
  );

  const handleNavigate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onStopPropagation?.();
      if (onNavigate) {
        if (clientId) {
          onNavigate(clientId);
        } else if (clientName) {
          onNavigate(encodeURIComponent(clientName));
        }
      }
    },
    [clientId, clientName, onNavigate, onStopPropagation],
  );

  const handleClearClient = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClientChange("_none", "");
    },
    [onClientChange],
  );

  const isModal = variant === "modal";
  const isTable = variant === "table";

  // No client and not editing (and not table) - render nothing
  if (!clientName && !isEditing && !isTable) return null;

  // Shared popover content
  const renderPopoverContent = (selectedClient: string | null) => (
    <PopoverContent
      className={cn("w-80 p-0", UI_CLASSES.popover)}
      side="bottom"
      align="start"
      sideOffset={6}
      avoidCollisions={true}
      collisionPadding={8}
    >
      <ClientSelector selectedClient={selectedClient} onSelect={handleClientSelect} />
    </PopoverContent>
  );

  // Empty state - show "Selecionar" or "+ Adicionar Cliente"
  if (!clientName) {
    const emptyLabel = isTable ? "Selecionar" : isModal ? "Sem cliente" : "+ Adicionar Cliente";
    const emptyStyles = cn(
      "inline-flex px-2 py-0.5 rounded-full cursor-pointer text-muted-foreground hover:text-foreground hover:bg-gray-700/80 transition-colors",
      isModal && "text-sm font-medium",
      isTable && "text-sm",
    );

    return (
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <span className={emptyStyles} onClick={handleClick} data-testid={`text-client-${id}`}>
            {emptyLabel}
          </span>
        </PopoverTrigger>
        {renderPopoverContent(null)}
      </Popover>
    );
  }

  // Has client - different layouts per variant
  const triggerStyles = cn(
    TRIGGER_STYLES.base,
    isModal ? TRIGGER_STYLES.modal : isTable ? TRIGGER_STYLES.table : TRIGGER_STYLES.card,
    isTable && "line-clamp-2",
  );

  // Table variant: click navigates, hover shows edit button
  if (isTable) {
    return (
      <div className="group flex items-center gap-1">
        <span className={triggerStyles} onClick={handleNavigate} data-testid={`text-client-${id}`}>
          {clientName}
        </span>
        <Popover open={isOpen} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              onClick={handleClick}
              data-testid={`button-edit-client-${id}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          {renderPopoverContent(clientName)}
        </Popover>
      </div>
    );
  }

  // Modal variant: click navigates, hover shows edit button
  if (isModal) {
    return (
      <div className="group flex items-center gap-1">
        <span className={triggerStyles} onClick={handleNavigate} data-testid={`text-client-${id}`}>
          {clientName}
        </span>
        <Popover open={isOpen} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              data-testid="button-edit-client"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          {renderPopoverContent(clientName)}
        </Popover>
      </div>
    );
  }

  // Card variant: editing vs read-only
  if (isEditing) {
    return (
      <div className="group -mx-2 flex items-center gap-1">
        <div className="group/edit-client inline-flex items-center gap-1 rounded-full px-2 py-0.5 hover:bg-gray-700/80">
          <Popover open={isOpen} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
              <span
                className={triggerStyles}
                onClick={handleClick}
                data-testid={`text-client-${id}`}
              >
                {clientName}
              </span>
            </PopoverTrigger>
            {renderPopoverContent(clientName)}
          </Popover>
          <Button
            size="icon"
            variant="ghost"
            className="hidden h-4 w-4 text-muted-foreground hover:text-foreground group-hover/edit-client:inline-flex"
            onClick={handleClearClient}
            data-testid={`button-clear-client-${id}`}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  // Card variant: read-only (click navigates)
  return (
    <div className="group flex items-center gap-1">
      <span className={triggerStyles} onClick={handleNavigate} data-testid={`text-client-${id}`}>
        {clientName}
      </span>
    </div>
  );
});

// ============================================
// TaskAssigneesPopover
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
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onStopPropagation?.();
    },
    [onStopPropagation],
  );

  const isModal = variant === "modal";
  const displayed = assignees.slice(0, maxDisplay);
  const remaining = assignees.slice(maxDisplay);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-md transition-colors",
            isModal ? "-ml-2 px-2 py-1 hover:bg-gray-700/80" : "px-1 py-0.5 hover:bg-gray-700/80",
          )}
          onClick={handleClick}
          data-testid={`button-edit-assignees-${id}`}
        >
          {assignees.length === 0 ? (
            <span className="text-sm text-gray-500">
              {isModal ? "Adicionar responsável..." : "+ Responsável"}
            </span>
          ) : (
            <>
              <div className="flex flex-shrink-0 -space-x-2">
                {displayed.map((assignee, idx) => (
                  <Avatar
                    key={idx}
                    className={cn(
                      isModal ? "h-7 w-7" : "h-6 w-6",
                      UI_CLASSES.avatarBorder,
                      getAvatarColor(idx),
                    )}
                  >
                    <AvatarFallback className="bg-transparent text-[11px] font-medium text-white">
                      {getInitials(assignee)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {isModal && (
                <div className="flex items-center">
                  <span className="text-sm text-gray-300">{displayed.join(", ")}</span>
                  {remaining.length > 0 && (
                    <span className="ml-1 whitespace-nowrap text-sm text-gray-400">
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
