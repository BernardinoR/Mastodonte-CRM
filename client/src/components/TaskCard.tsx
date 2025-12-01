import { useState, useRef, useMemo, memo, useCallback } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ContextMenu,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  Pencil,
  Trash2,
  Check,
  Plus,
  X,
  Search,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfDay, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseLocalDate } from "@/lib/date-utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MOCK_RESPONSIBLES } from "@/lib/mock-users";
import { 
  ClientSelector, 
  AssigneeSelector
} from "@/components/task-editors";
import { useTaskCardEditing } from "@/hooks/useTaskCardEditing";
import { useTaskAssignees } from "@/hooks/useTaskAssignees";
import { useTaskContextMenu } from "@/hooks/useTaskContextMenu";
import { TaskCardDialogs } from "@/components/task-card-dialogs";
import { TaskDatePopover } from "@/components/task-popovers";
import { TaskCardContextMenu } from "@/components/task-context-menu";
import { PriorityBadge, StatusBadge, PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/components/ui/task-badges";
import type { TaskStatus, TaskPriority } from "@/types/task";

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};


const getAvatarColor = (index: number): string => {
  const colors = ["bg-slate-600", "bg-slate-500", "bg-slate-400", "bg-slate-700", "bg-slate-300"];
  return colors[index % colors.length];
};

interface TaskCardProps {
  id: string;
  title: string;
  clientName?: string;
  priority?: TaskPriority;
  status: TaskStatus;
  assignees: string[];
  dueDate: Date;
  description?: string;
  notes?: string[];
  isSelected?: boolean;
  selectedCount?: number;
  isDragActive?: boolean;
  onSelect?: (taskId: string, shiftKey: boolean, ctrlKey: boolean) => void;
  onUpdate: (taskId: string, updates: any) => void;
  onDelete: (taskId: string) => void;
  onBulkUpdate?: (updates: any) => void;
  onBulkDelete?: () => void;
  onBulkAppendTitle?: (suffix: string) => void;
  onBulkReplaceTitle?: (newTitle: string) => void;
  onBulkAddAssignee?: (assignee: string) => void;
  onBulkSetAssignees?: (assignees: string[]) => void;
  onBulkRemoveAssignee?: (assignee: string) => void;
}

interface AssigneeListProps {
  assignees: string[];
  isEditing: boolean;
  taskId: string;
}

const AssigneeList = memo(function AssigneeList({ 
  assignees, 
  isEditing, 
  taskId
}: AssigneeListProps) {
  if (assignees.length === 0) {
    return (
      <span 
        className="inline-flex px-2 py-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-gray-700/80 text-xs md:text-sm"
        data-testid={`button-add-assignee-${taskId}`}
      >
        + Adicionar Responsável
      </span>
    );
  }

  return (
    <div className="space-y-0.5">
      {assignees.map((assignee, index) => {
        const consultant = MOCK_RESPONSIBLES.find(c => c.name === assignee);
        const grayColor = consultant?.grayColor || "bg-gray-600";
        return (
          <div 
            key={index} 
            className={cn(
              "flex items-center gap-2 rounded-full group/edit-assignee",
              isEditing ? "px-2 py-0.5" : "py-0.5",
              "hover:bg-gray-700/80"
            )}
          >
            <Avatar className="w-6 h-6 shrink-0">
              <AvatarFallback className={cn("text-[10px] font-normal text-white", grayColor)}>
                {getInitials(assignee)}
              </AvatarFallback>
            </Avatar>
            <span 
              className="text-[13px] font-normal flex-1" 
              data-testid={index === 0 ? `text-assignee-${taskId}` : undefined}
            >
              {assignee}
            </span>
          </div>
        );
      })}
    </div>
  );
});


export function TaskCard({
  id,
  title,
  clientName,
  priority,
  status,
  assignees,
  dueDate,
  description,
  notes,
  isSelected = false,
  selectedCount = 0,
  isDragActive = false,
  onSelect,
  onUpdate,
  onDelete,
  onBulkUpdate,
  onBulkDelete,
  onBulkAppendTitle,
  onBulkReplaceTitle,
  onBulkAddAssignee,
  onBulkSetAssignees,
  onBulkRemoveAssignee,
}: TaskCardProps) {
  const [, navigate] = useLocation();
  
  const {
    isEditing,
    setIsEditing,
    editedTask,
    setEditedTask,
    activePopover,
    setActivePopover,
    cardRef,
    titleRef,
    clickTimeoutRef,
    handleUpdate,
    handleTitleEdit,
    handleEditClick,
    handleCloseEditing,
    isJustClosedEdit,
    safeAssignees,
    stableAssignees,
  } = useTaskCardEditing({
    id,
    title,
    clientName,
    priority,
    status,
    assignees,
    dueDate,
    description,
    onUpdate,
  });
  
  const updateAssigneesInEditedTask = useCallback((newAssignees: string[]) => {
    setEditedTask(prev => ({ ...prev, assignees: newAssignees }));
  }, [setEditedTask]);
  
  const {
    newAssigneeName,
    setNewAssigneeName,
    addAssignee,
    removeAssignee,
    handleAddFromInput: handleAddAssignee,
    handleContextAdd: handleContextAddAssignee,
    handleContextRemove: handleContextRemoveAssignee,
    handleContextSetSingle: handleContextSetSingleAssignee,
  } = useTaskAssignees({
    taskId: id,
    assignees: editedTask.assignees,
    selectedCount,
    onUpdate,
    onBulkAddAssignee,
    onBulkRemoveAssignee,
    onBulkSetAssignees,
    updateEditedTask: updateAssigneesInEditedTask,
  });

  const {
    handleContextPriorityChange,
    handleContextStatusChange,
    handleContextDelete,
    handleContextClientChange,
    handleContextDateChange,
    handleReplaceTitleSubmit,
    handleAppendTitleSubmit,
  } = useTaskContextMenu({
    id,
    title,
    selectedCount,
    onUpdate,
    onDelete,
    onBulkUpdate,
    onBulkDelete,
    onBulkReplaceTitle,
    onBulkAppendTitle,
  });
  
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newNote, setNewNote] = useState("");
  
  const [showReplaceTitleDialog, setShowReplaceTitleDialog] = useState(false);
  const [showAppendTitleDialog, setShowAppendTitleDialog] = useState(false);
  const [newTitleText, setNewTitleText] = useState("");
  const [appendTitleText, setAppendTitleText] = useState("");
  const [showBulkDatePicker, setShowBulkDatePicker] = useState(false);
  
  const datePopoverContentRef = useRef<HTMLDivElement>(null);

  const onReplaceTitleSubmit = useCallback(() => {
    if (!newTitleText.trim()) return;
    handleReplaceTitleSubmit(newTitleText);
    setNewTitleText("");
    setShowReplaceTitleDialog(false);
  }, [handleReplaceTitleSubmit, newTitleText]);

  const onAppendTitleSubmit = useCallback(() => {
    if (!appendTitleText.trim()) return;
    handleAppendTitleSubmit(appendTitleText);
    setAppendTitleText("");
    setShowAppendTitleDialog(false);
  }, [handleAppendTitleSubmit, appendTitleText]);

  const onContextDateChange = useCallback((newDate: Date) => {
    handleContextDateChange(newDate);
    setShowBulkDatePicker(false);
  }, [handleContextDateChange]);

  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging 
  } = useSortable({
    id: id,
    disabled: isEditing || activePopover !== null,
  });
  
  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const shouldHideForDrag = isDragActive && isSelected;

  const handleDelete = useCallback(() => {
    onDelete(id);
    setShowDeleteConfirm(false);
  }, [onDelete, id]);

  const handleAddNote = useCallback(() => {
    if (newNote.trim()) {
      onUpdate(id, {
        notes: [...(notes || []), newNote],
      });
      setNewNote("");
    }
  }, [newNote, onUpdate, id, notes]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    
    if ((e.shiftKey || e.ctrlKey || e.metaKey) && onSelect) {
      e.preventDefault();
      e.stopPropagation();
      onSelect(id, e.shiftKey, e.ctrlKey || e.metaKey);
      return;
    }
    
    if (isEditing) {
      return;
    }
    
    const target = e.target as HTMLElement;
    const isInteractiveElement = 
      target.closest('button') ||
      target.closest('[contenteditable]') ||
      target.closest('[role="combobox"]') ||
      target.closest('[data-radix-collection-item]');
    
    if (!isInteractiveElement && !isJustClosedEdit()) {
      clickTimeoutRef.current = setTimeout(() => {
        if (!isEditing) {
          setShowDetails(true);
        }
        clickTimeoutRef.current = null;
      }, 250);
    }
  }, [onSelect, id, isEditing, isJustClosedEdit]);

  const handleDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      handleUpdate("dueDate", format(date, "yyyy-MM-dd"));
    }
  }, [handleUpdate]);

  const handlePriorityChange = useCallback((value: string) => {
    handleUpdate("priority", value === "_none" ? "" : value);
    setActivePopover(null);
  }, [handleUpdate]);

  const handleStatusChange = useCallback((value: string) => {
    handleUpdate("status", value);
    setActivePopover(null);
  }, [handleUpdate]);

  const handleClientChange = useCallback((value: string) => {
    handleUpdate("clientName", value === "_none" ? "" : value);
    setActivePopover(null);
  }, [handleUpdate]);

  const cancelClickTimeout = useCallback(() => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
  }, []);

  // Calculate overdue status for Card border styling
  const today = startOfDay(new Date());
  let isOverdue = false;
  
  if (isEditing) {
    // Strict format validation with regex
    const dateStr = editedTask.dueDate;
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (dateStr && isoDateRegex.test(dateStr)) {
      const [y, m, d] = dateStr.split('-').map(Number);
      
      // Validate month (1-12) and day ranges
      if (m >= 1 && m <= 12) {
        const daysInMonth = new Date(y, m, 0).getDate();
        if (d >= 1 && d <= daysInMonth) {
          // Valid date - check if overdue
          const parsed = parseLocalDate(dateStr);
          isOverdue = isBefore(startOfDay(parsed), today);
        }
      }
    }
  } else {
    // In read-only mode, use the validated dueDate prop
    isOverdue = isBefore(startOfDay(dueDate), today);
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            ref={setNodeRef}
            style={{
              ...sortableStyle,
              opacity: shouldHideForDrag ? 0 : (isDragging ? 0.5 : 1),
              pointerEvents: shouldHideForDrag ? 'none' : 'auto',
            }}
            data-task-card
            {...(!isEditing ? { ...attributes, ...listeners } : {})}
          >
            <Card
              ref={cardRef}
              className={cn(
                "group/task-card cursor-pointer transition-all hover-elevate active-elevate-2 border",
                !isEditing && "select-none",
                isEditing && "ring-2 ring-primary shadow-lg",
                isSelected && !isEditing && "ring-2 ring-blue-500 shadow-lg",
                isOverdue && "border-l-[3px] border-l-red-900 dark:border-l-red-700",
                status === "To Do" && "bg-[#262626] border-[#363636]",
                status === "In Progress" && "bg-[#243041] border-[#344151]",
                status === "Done" && "bg-green-950 border-green-900"
              )}
              onClick={handleCardClick}
              onDoubleClick={handleEditClick}
              data-testid={`card-task-${id}`}
            >
          <CardHeader className="p-4 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div
                ref={titleRef}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={handleTitleEdit}
                onClick={(e) => isEditing && e.stopPropagation()}
                onKeyDown={(e) => {
                  if (isEditing && e.key === "Enter") {
                    e.preventDefault();
                    (e.target as HTMLDivElement).blur();
                  }
                }}
                className={cn(
                  "font-bold text-sm leading-tight flex-1",
                  isEditing && "cursor-text outline-none bg-[#2a2a2a] hover:bg-[#333333] rounded px-2 py-1 -mx-2 -my-1 focus:bg-[#333333] focus:ring-1 focus:ring-blue-500/50"
                )}
                data-testid={`text-tasktitle-${id}`}
              >
                {title}
              </div>
              <div className="flex gap-1">
                {isEditing && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                    data-testid={`button-delete-${id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-8 w-8 shrink-0",
                    !isEditing && "opacity-0 pointer-events-none transition-opacity group-hover/task-card:opacity-100 group-hover/task-card:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto focus-visible:ring-2 focus-visible:ring-primary"
                  )}
                  onClick={isEditing ? (e) => { e.stopPropagation(); handleCloseEditing(); } : handleEditClick}
                  data-testid={`button-edit-${id}`}
                >
                  {isEditing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <Separator className="mt-2 bg-[#64635E]" />
          </CardHeader>

          <CardContent className="p-4 pt-0 space-y-2">
              
              {/* Linha 2: Data - Always clickable */}
              <div className="flex items-center text-[10px] md:text-xs font-semibold text-foreground">
                <TaskDatePopover
                  id={id}
                  dateValue={editedTask.dueDate}
                  isOpen={activePopover === "date"}
                  onOpenChange={(open) => setActivePopover(open ? "date" : null)}
                  onDateChange={handleDateChange}
                  onStopPropagation={cancelClickTimeout}
                  popoverRef={datePopoverContentRef}
                />
              </div>
              
              {/* Linha 3: Cliente - Only show if has client or in edit mode */}
              {clientName ? (
                <div className={cn("flex items-center text-[10px] md:text-xs font-semibold text-foreground", isEditing && "-mx-2")}>
                  <div className={cn(
                    "inline-flex items-center gap-1",
                    isEditing ? "px-2 py-0.5 rounded-full group/edit-client hover:bg-gray-700/80" : ""
                  )}>
                    {isEditing ? (
                      <Popover open={activePopover === "client"} onOpenChange={(open) => setActivePopover(open ? "client" : null)}>
                        <PopoverTrigger asChild>
                          <span 
                            className="inline-flex items-center gap-1.5 font-medium cursor-pointer px-2 py-0.5 rounded-full hover:bg-gray-700/80 hover:text-foreground text-[13px]"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              if (clickTimeoutRef.current) {
                                clearTimeout(clickTimeoutRef.current);
                                clickTimeoutRef.current = null;
                              }
                            }}
                            data-testid={`text-client-${id}`}
                          >
                            {clientName}
                          </span>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-80 p-0 bg-[#1a1a1a] border-[#2a2a2a]" 
                          side="bottom" 
                          align="start" 
                          sideOffset={6} 
                          avoidCollisions={true} 
                          collisionPadding={8}
                        >
                          <ClientSelector 
                            selectedClient={clientName || null}
                            onSelect={(client) => {
                              handleClientChange(client);
                              setActivePopover(null);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span 
                        className="inline-flex items-center gap-1.5 font-medium cursor-pointer px-2 py-0.5 rounded-full hover:bg-gray-700/80 hover:text-foreground text-[13px]"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (clickTimeoutRef.current) {
                            clearTimeout(clickTimeoutRef.current);
                            clickTimeoutRef.current = null;
                          }
                          navigate(`/clients/${encodeURIComponent(clientName)}`);
                        }}
                        data-testid={`text-client-${id}`}
                      >
                        {clientName}
                      </span>
                    )}
                    {isEditing && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-4 w-4 text-muted-foreground hover:text-foreground hidden group-hover/edit-client:inline-flex"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClientChange("_none");
                        }}
                        data-testid={`button-clear-client-${id}`}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : isEditing ? (
                <div className={cn("flex items-center gap-1.5 text-xs md:text-sm", isEditing && "-mx-2")}>
                  <Popover open={activePopover === "client"} onOpenChange={(open) => setActivePopover(open ? "client" : null)}>
                    <PopoverTrigger asChild>
                      <span 
                        className="inline-flex px-2 py-0.5 rounded-full cursor-pointer text-muted-foreground hover:text-foreground hover:bg-gray-700/80"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (clickTimeoutRef.current) {
                            clearTimeout(clickTimeoutRef.current);
                            clickTimeoutRef.current = null;
                          }
                        }}
                        data-testid={`text-client-${id}`}
                      >
                        + Adicionar Cliente
                      </span>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-80 p-0 bg-[#1a1a1a] border-[#2a2a2a]" 
                      side="bottom" 
                      align="start" 
                      sideOffset={6} 
                      avoidCollisions={true} 
                      collisionPadding={8}
                    >
                      <ClientSelector 
                        selectedClient={null}
                        onSelect={(client) => {
                          handleClientChange(client);
                          setActivePopover(null);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ) : null}
              
              {/* Linha 4: Prioridade */}
              <div className={cn("flex items-center gap-1.5 text-xs md:text-sm", isEditing && "-mx-2")}>
                {/* Priority Badge - Always clickable */}
                {priority ? (
                  <div className={cn(
                    "inline-flex items-center gap-1 rounded-full",
                    isEditing ? "px-2 py-0.5 group/edit-priority hover:bg-gray-700/80" : ""
                  )}>
                    <Popover open={activePopover === "priority"} onOpenChange={(open) => setActivePopover(open ? "priority" : null)}>
                      <PopoverTrigger asChild>
                        <div
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (clickTimeoutRef.current) {
                              clearTimeout(clickTimeoutRef.current);
                              clickTimeoutRef.current = null;
                            }
                          }}
                        >
                          <PriorityBadge 
                            priority={priority}
                            className="cursor-pointer hover:bg-muted/50"
                            data-testid={`badge-priority-${id}`}
                          />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6} avoidCollisions={true} collisionPadding={8}>
                        <div className="w-full">
                          <div className="border-b border-[#2a2a2a]">
                            <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                            <div className="px-3 py-1">
                              <div 
                                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer bg-[#2a2a2a] rounded-md group"
                                onClick={(e) => { e.stopPropagation(); handlePriorityChange("_none"); }}
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
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                                onClick={() => handlePriorityChange(p)}
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
                          handlePriorityChange("_none");
                        }}
                        data-testid={`button-clear-priority-${id}`}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ) : isEditing ? (
                  <Popover open={activePopover === "priority"} onOpenChange={(open) => setActivePopover(open ? "priority" : null)}>
                    <PopoverTrigger asChild>
                      <span 
                        className="inline-flex px-2 py-0.5 rounded-full cursor-pointer text-muted-foreground hover:text-foreground hover:bg-gray-700/80"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (clickTimeoutRef.current) {
                            clearTimeout(clickTimeoutRef.current);
                            clickTimeoutRef.current = null;
                          }
                        }}
                        data-testid={`badge-priority-${id}`}
                      >
                        + Adicionar Prioridade
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6} avoidCollisions={true} collisionPadding={8}>
                      <div className="w-full">
                        <div className="px-3 py-1.5 text-xs text-gray-500">Selecionar prioridade</div>
                        <div className="pb-1">
                          {PRIORITY_OPTIONS.map(p => (
                            <div
                              key={p}
                              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                              onClick={() => handlePriorityChange(p)}
                            >
                              <PriorityBadge priority={p} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : null}
              </div>
              
              {/* Linha 5: Status - Always clickable */}
              <div className="flex items-center gap-1.5 text-xs md:text-sm">
                <Popover open={activePopover === "status"} onOpenChange={(open) => setActivePopover(open ? "status" : null)}>
                  <PopoverTrigger asChild>
                    <div
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (clickTimeoutRef.current) {
                          clearTimeout(clickTimeoutRef.current);
                          clickTimeoutRef.current = null;
                        }
                      }}
                    >
                      <StatusBadge 
                        status={status}
                        className="cursor-pointer hover:bg-muted/50"
                        data-testid={`badge-status-${id}`}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6} avoidCollisions={true} collisionPadding={8}>
                    <div className="w-full">
                      <div className="border-b border-[#2a2a2a]">
                        <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                        <div className="px-3 py-1">
                          <div className="flex items-center gap-2 px-2 py-1.5 bg-[#2a2a2a] rounded-md">
                            <StatusBadge status={status} />
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
                      <div className="pb-1">
                        {STATUS_OPTIONS.filter(s => s !== status).map(s => (
                          <div
                            key={s}
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                            onClick={() => handleStatusChange(s)}
                          >
                            <StatusBadge status={s} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Responsáveis */}
              <div className={cn("space-y-1.5", isEditing && "-mx-2")}>
                <div className={cn("text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider", isEditing && "px-2")}>
                  Responsáveis
                </div>
                
                <Popover open={activePopover === "assignee"} onOpenChange={(open) => setActivePopover(open ? "assignee" : null)}>
                  <PopoverTrigger asChild>
                    <div 
                      className="cursor-pointer"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (clickTimeoutRef.current) {
                          clearTimeout(clickTimeoutRef.current);
                          clickTimeoutRef.current = null;
                        }
                      }}
                    >
                      <AssigneeList
                        assignees={stableAssignees}
                        isEditing={isEditing}
                        taskId={id}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-80 p-0 bg-[#1a1a1a] border-[#2a2a2a]" 
                    side="bottom" 
                    align="start" 
                    sideOffset={6} 
                    avoidCollisions={true} 
                    collisionPadding={8}
                  >
                    <AssigneeSelector 
                      selectedAssignees={editedTask.assignees}
                      onSelect={addAssignee}
                      onRemove={removeAssignee}
                    />
                  </PopoverContent>
                </Popover>
              </div>
          </CardContent>
            </Card>
          </div>
        </ContextMenuTrigger>
        <TaskCardContextMenu
          selectedCount={selectedCount}
          currentDate={editedTask.dueDate}
          currentClient={editedTask.clientName || ""}
          currentAssignees={editedTask.assignees || []}
          onShowReplaceTitleDialog={() => setShowReplaceTitleDialog(true)}
          onShowAppendTitleDialog={() => setShowAppendTitleDialog(true)}
          onDateChange={handleContextDateChange}
          onClientChange={handleContextClientChange}
          onPriorityChange={handleContextPriorityChange}
          onStatusChange={handleContextStatusChange}
          onAddAssignee={handleContextAddAssignee}
          onRemoveAssignee={handleContextRemoveAssignee}
          onSetSingleAssignee={handleContextSetSingleAssignee}
          onDelete={handleContextDelete}
        />
      </ContextMenu>
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid={`dialog-details-${id}`}>
          <DialogHeader className="space-y-0 pb-4">
            <DialogTitle>{title}</DialogTitle>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              className="absolute right-4 top-4 text-destructive hover:text-destructive hover:bg-destructive/10"
              data-testid={`button-modal-delete-${id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </DialogHeader>

          <div className="space-y-6">
            <div className="border-t pt-6">
              <label className="text-sm font-medium mb-3 block">Descrição</label>
              <Textarea
                value={editedTask.description}
                onChange={(e) => {
                  setEditedTask({ ...editedTask, description: e.target.value });
                  onUpdate(id, { description: e.target.value });
                }}
                placeholder="Adicione detalhes sobre esta tarefa..."
                className="min-h-[100px] hover-elevate"
                data-testid={`textarea-description-${id}`}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-medium mb-3">Histórico / Notas</h3>
              {notes && notes.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {notes.map((note, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                      {note}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">Nenhuma nota ainda.</p>
              )}
              <div className="flex gap-2">
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                  placeholder="Adicionar nota..."
                  className="flex-1"
                  data-testid={`input-note-${id}`}
                />
                <Button onClick={handleAddNote} data-testid={`button-addnote-${id}`}>
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <TaskCardDialogs
        id={id}
        dueDate={dueDate}
        selectedCount={selectedCount}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        showReplaceTitleDialog={showReplaceTitleDialog}
        setShowReplaceTitleDialog={setShowReplaceTitleDialog}
        showAppendTitleDialog={showAppendTitleDialog}
        setShowAppendTitleDialog={setShowAppendTitleDialog}
        showBulkDatePicker={showBulkDatePicker}
        setShowBulkDatePicker={setShowBulkDatePicker}
        newTitleText={newTitleText}
        setNewTitleText={setNewTitleText}
        appendTitleText={appendTitleText}
        setAppendTitleText={setAppendTitleText}
        onDelete={handleDelete}
        onReplaceTitleSubmit={onReplaceTitleSubmit}
        onAppendTitleSubmit={onAppendTitleSubmit}
        onContextDateChange={onContextDateChange}
      />
    </>
  );
}