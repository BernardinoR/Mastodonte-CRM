import { useState, useRef, useMemo, memo, useCallback } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Calendar as CalendarIcon,
  Pencil,
  Trash2,
  Check,
  Plus,
  X,
  Search,
  User,
  AlertTriangle,
  Circle,
  Users,
  Type,
  Briefcase,
  PenLine,
  ChevronLeft,
  ChevronRight,
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
  ContextMenuClientEditor,
  ContextMenuDateEditor,
  AssigneeSelector,
  ContextMenuAssigneeEditor
} from "@/components/task-editors";
import { getStatusConfig, getPriorityConfig } from "@/lib/statusConfig";
import { useTaskCardEditing } from "@/hooks/useTaskCardEditing";
import { useTaskAssignees } from "@/hooks/useTaskAssignees";
import type { TaskStatus, TaskPriority } from "@/types/task";

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
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
  
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newNote, setNewNote] = useState("");
  
  const [showReplaceTitleDialog, setShowReplaceTitleDialog] = useState(false);
  const [showAppendTitleDialog, setShowAppendTitleDialog] = useState(false);
  const [newTitleText, setNewTitleText] = useState("");
  const [appendTitleText, setAppendTitleText] = useState("");
  const [showBulkDatePicker, setShowBulkDatePicker] = useState(false);
  
  const datePopoverContentRef = useRef<HTMLDivElement>(null);

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

  const getPriorityClasses = (p: TaskPriority) => {
    const config = getPriorityConfig(p);
    return `${config.bgColor} ${config.textColor} ${config.borderColor}`;
  };

  const getStatusClasses = (s: TaskStatus) => {
    const config = getStatusConfig(s);
    return `${config.bgColor} ${config.textColor} ${config.borderColor}`;
  };

  const getAvatarColor = (index: number): string => {
    const colors = ["bg-slate-600", "bg-slate-500", "bg-slate-400", "bg-slate-700", "bg-slate-300"];
    return colors[index % colors.length];
  };

  const handleDelete = () => {
    onDelete(id);
    setShowDeleteConfirm(false);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      onUpdate(id, {
        notes: [...(notes || []), newNote],
      });
      setNewNote("");
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Clear any existing timeout first
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    
    // Handle Shift+click or Ctrl+click for multi-selection
    if ((e.shiftKey || e.ctrlKey || e.metaKey) && onSelect) {
      e.preventDefault();
      e.stopPropagation();
      onSelect(id, e.shiftKey, e.ctrlKey || e.metaKey);
      return;
    }
    
    // Don't open modal if in edit mode
    if (isEditing) {
      return;
    }
    
    // Prevent opening details when clicking on interactive elements
    const target = e.target as HTMLElement;
    const isInteractiveElement = 
      target.closest('button') ||
      target.closest('[contenteditable]') ||
      target.closest('[role="combobox"]') ||
      target.closest('[data-radix-collection-item]');
    
    if (!isInteractiveElement && !isJustClosedEdit()) {
      // Set a timeout to open details modal only if not followed by a double click or edit mode
      clickTimeoutRef.current = setTimeout(() => {
        // Double check we're still not in edit mode when timeout fires
        if (!isEditing) {
          setShowDetails(true);
        }
        clickTimeoutRef.current = null;
      }, 250);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      handleUpdate("dueDate", format(date, "yyyy-MM-dd"));
    }
  };

  const handlePriorityChange = (value: string) => {
    handleUpdate("priority", value === "_none" ? "" : value);
    setActivePopover(null);
  };

  const handleStatusChange = (value: string) => {
    handleUpdate("status", value);
    setActivePopover(null);
  };

  const handleClientChange = (value: string) => {
    handleUpdate("clientName", value === "_none" ? "" : value);
    setActivePopover(null);
  };

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


  // Context menu handlers
  const handleContextPriorityChange = (newPriority: TaskPriority) => {
    if (selectedCount > 1 && onBulkUpdate) {
      onBulkUpdate({ priority: newPriority });
    } else {
      onUpdate(id, { priority: newPriority });
    }
  };

  const handleContextStatusChange = (newStatus: TaskStatus) => {
    if (selectedCount > 1 && onBulkUpdate) {
      onBulkUpdate({ status: newStatus });
    } else {
      onUpdate(id, { status: newStatus });
    }
  };

  const handleContextDelete = () => {
    if (selectedCount > 1 && onBulkDelete) {
      onBulkDelete();
    } else {
      onDelete(id);
    }
  };

  const handleContextClientChange = (newClient: string) => {
    if (selectedCount > 1 && onBulkUpdate) {
      onBulkUpdate({ clientName: newClient });
    } else {
      onUpdate(id, { clientName: newClient });
    }
  };

  const handleContextDateChange = (newDate: Date) => {
    if (selectedCount > 1 && onBulkUpdate) {
      onBulkUpdate({ dueDate: newDate });
    } else {
      onUpdate(id, { dueDate: newDate });
    }
    setShowBulkDatePicker(false);
  };

  const handleReplaceTitleSubmit = () => {
    if (!newTitleText.trim()) return;
    if (selectedCount > 1 && onBulkReplaceTitle) {
      onBulkReplaceTitle(newTitleText.trim());
    } else {
      onUpdate(id, { title: newTitleText.trim() });
    }
    setNewTitleText("");
    setShowReplaceTitleDialog(false);
  };

  const handleAppendTitleSubmit = () => {
    if (!appendTitleText.trim()) return;
    const textToAppend = appendTitleText.trim();
    // Add space only if: title exists, doesn't end with whitespace, and suffix starts with alphanumeric
    const startsWithAlphanumeric = /^[a-zA-Z0-9\u00C0-\u024F]/.test(textToAppend);
    const needsSpace = title.length > 0 && !/\s$/.test(title) && startsWithAlphanumeric;
    const suffix = needsSpace ? " " + textToAppend : textToAppend;
    if (selectedCount > 1 && onBulkAppendTitle) {
      onBulkAppendTitle(textToAppend);
    } else {
      onUpdate(id, { title: title + suffix });
    }
    setAppendTitleText("");
    setShowAppendTitleDialog(false);
  };

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
                <Popover open={activePopover === "date"} onOpenChange={(open) => setActivePopover(open ? "date" : null)}>
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
                      data-testid={`text-date-${id}`}
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {format(parseLocalDate(editedTask.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </PopoverTrigger>
                  <PopoverContent 
                    ref={datePopoverContentRef}
                    className="w-auto p-0 bg-[#1a1a1a] border-[#2a2a2a]" 
                    side="bottom" 
                    align="start" 
                    sideOffset={6} 
                    avoidCollisions={true} 
                    collisionPadding={8}
                    onInteractOutside={(e) => {
                      const originalTarget = (e as any).detail?.originalEvent?.target as HTMLElement | null;
                      const target = originalTarget || (e.target as HTMLElement);
                      if (datePopoverContentRef.current?.contains(target) || target?.closest('.rdp')) {
                        e.preventDefault();
                      }
                    }}
                    onPointerDownOutside={(e) => {
                      const originalTarget = (e as any).detail?.originalEvent?.target as HTMLElement | null;
                      const target = originalTarget || (e.target as HTMLElement);
                      if (datePopoverContentRef.current?.contains(target) || target?.closest('.rdp')) {
                        e.preventDefault();
                      }
                    }}
                    onFocusOutside={(e) => {
                      const originalTarget = (e as any).detail?.originalEvent?.target as HTMLElement | null;
                      const target = originalTarget || (e.target as HTMLElement);
                      if (datePopoverContentRef.current?.contains(target) || target?.closest('.rdp')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <DateInput
                      value={editedTask.dueDate}
                      onChange={(date) => {
                        handleDateChange(date);
                        setActivePopover(null);
                      }}
                      className="font-semibold"
                      dataTestId={`input-date-${id}`}
                      hideIcon
                      commitOnInput={false}
                    />
                  </PopoverContent>
                </Popover>
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
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] md:text-[11px] px-2 py-[2px] rounded-full cursor-pointer hover:bg-muted/50 font-normal flex items-center gap-1",
                              getPriorityClasses(priority)
                            )}
                            data-testid={`badge-priority-${id}`}
                          >
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              priority === "Urgente" && "bg-red-200",
                              priority === "Importante" && "bg-orange-200",
                              priority === "Normal" && "bg-yellow-200",
                              priority === "Baixa" && "bg-blue-200"
                            )} />
                            {priority}
                          </Badge>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6} avoidCollisions={true} collisionPadding={8}>
                        <div className="w-full">
                          {/* Selected priority section */}
                          <div className="border-b border-[#2a2a2a]">
                            <div className="px-3 py-1.5 text-xs text-gray-500">
                              Selecionado
                            </div>
                            <div className="px-3 py-1">
                              <div 
                                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer bg-[#2a2a2a] rounded-md group"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePriorityChange("_none");
                                }}
                              >
                                <Badge variant="outline" className={cn("text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1", getPriorityClasses(priority))}>
                                  <span className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    priority === "Urgente" && "bg-red-200",
                                    priority === "Importante" && "bg-orange-200",
                                    priority === "Normal" && "bg-yellow-200",
                                    priority === "Baixa" && "bg-blue-200"
                                  )} />
                                  {priority}
                                </Badge>
                                <X className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Other options label */}
                          <div className="px-3 py-1.5 text-xs text-gray-500">
                            Outras opções
                          </div>
                          
                          {/* Available priorities */}
                          <div className="pb-1">
                            {priority !== "Urgente" && (
                              <div
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                                onClick={() => handlePriorityChange("Urgente")}
                              >
                                <Badge variant="outline" className="bg-red-900 text-white border-red-900 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-200" />
                                  Urgente
                                </Badge>
                              </div>
                            )}
                            {priority !== "Importante" && (
                              <div
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                                onClick={() => handlePriorityChange("Importante")}
                              >
                                <Badge variant="outline" className="bg-orange-800 text-white border-orange-800 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-200" />
                                  Importante
                                </Badge>
                              </div>
                            )}
                            {priority !== "Normal" && (
                              <div
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                                onClick={() => handlePriorityChange("Normal")}
                              >
                                <Badge variant="outline" className="bg-yellow-700 text-white border-yellow-700 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-200" />
                                  Normal
                                </Badge>
                              </div>
                            )}
                            {priority !== "Baixa" && (
                              <div
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                                onClick={() => handlePriorityChange("Baixa")}
                              >
                                <Badge variant="outline" className="bg-blue-800 text-white border-blue-800 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-200" />
                                  Baixa
                                </Badge>
                              </div>
                            )}
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
                        {/* Options label */}
                        <div className="px-3 py-1.5 text-xs text-gray-500">
                          Selecionar prioridade
                        </div>
                        
                        {/* Available priorities */}
                        <div className="pb-1">
                          <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                            onClick={() => handlePriorityChange("Urgente")}
                          >
                            <Badge variant="outline" className="bg-red-900 text-white border-red-900 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-200" />
                              Urgente
                            </Badge>
                          </div>
                          <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                            onClick={() => handlePriorityChange("Importante")}
                          >
                            <Badge variant="outline" className="bg-orange-800 text-white border-orange-800 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-200" />
                              Importante
                            </Badge>
                          </div>
                          <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                            onClick={() => handlePriorityChange("Normal")}
                          >
                            <Badge variant="outline" className="bg-yellow-700 text-white border-yellow-700 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-200" />
                              Normal
                            </Badge>
                          </div>
                          <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                            onClick={() => handlePriorityChange("Baixa")}
                          >
                            <Badge variant="outline" className="bg-blue-800 text-white border-blue-800 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-200" />
                              Baixa
                            </Badge>
                          </div>
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
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] md:text-[11px] px-2 py-[2px] rounded-full cursor-pointer hover:bg-muted/50 font-normal flex items-center gap-1",
                          getStatusClasses(status)
                        )}
                        data-testid={`badge-status-${id}`}
                      >
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          status === "To Do" && "bg-[#8E8B86]",
                          status === "In Progress" && "bg-[rgb(66,129,220)]",
                          status === "Done" && "bg-green-200"
                        )} />
                        {status}
                      </Badge>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6} avoidCollisions={true} collisionPadding={8}>
                    <div className="w-full">
                      {/* Selected status section */}
                      <div className="border-b border-[#2a2a2a]">
                        <div className="px-3 py-1.5 text-xs text-gray-500">
                          Selecionado
                        </div>
                        <div className="px-3 py-1">
                          <div className="flex items-center gap-2 px-2 py-1.5 bg-[#2a2a2a] rounded-md">
                            <Badge variant="outline" className={cn("text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1", getStatusClasses(status))}>
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                status === "To Do" && "bg-[#8E8B86]",
                                status === "In Progress" && "bg-[rgb(66,129,220)]",
                                status === "Done" && "bg-green-200"
                              )} />
                              {status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Other options label */}
                      <div className="px-3 py-1.5 text-xs text-gray-500">
                        Outras opções
                      </div>
                      
                      {/* Available statuses */}
                      <div className="pb-1">
                        {status !== "To Do" && (
                          <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                            onClick={() => handleStatusChange("To Do")}
                          >
                            <Badge variant="outline" className="bg-[#64635E] text-white border-[#64635E] text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#8E8B86]" />
                              To Do
                            </Badge>
                          </div>
                        )}
                        {status !== "In Progress" && (
                          <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                            onClick={() => handleStatusChange("In Progress")}
                          >
                            <Badge variant="outline" className="bg-[rgb(64,97,145)] text-white border-[rgb(64,97,145)] text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[rgb(66,129,220)]" />
                              In Progress
                            </Badge>
                          </div>
                        )}
                        {status !== "Done" && (
                          <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                            onClick={() => handleStatusChange("Done")}
                          >
                            <Badge variant="outline" className="bg-green-800 text-white border-green-800 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-200" />
                              Done
                            </Badge>
                          </div>
                        )}
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
        <ContextMenuContent className="w-56 bg-[#1a1a1a] border-[#2a2a2a]">
          {/* Header for multi-selection */}
          {selectedCount > 1 && (
            <>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Selecionando {selectedCount} tarefas
              </div>
              <ContextMenuSeparator className="bg-[#2a2a2a]" />
            </>
          )}
          
          {/* 1. Título */}
          <ContextMenuSub>
            <ContextMenuSubTrigger className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <span>Título</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <ContextMenuItem 
                onClick={() => setShowReplaceTitleDialog(true)} 
                className="flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                <span>Substituir nome</span>
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => setShowAppendTitleDialog(true)} 
                className="flex items-center gap-2"
              >
                <PenLine className="w-4 h-4" />
                <span>Adicionar ao final</span>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          
          {/* 2. Data */}
          <ContextMenuSub>
            <ContextMenuSubTrigger className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span>Data</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent 
              className="bg-[#1a1a1a] border-[#2a2a2a] p-0"
              onPointerDownOutside={(e) => {
                // Prevent closing if clicking inside a calendar container
                const target = e.target as HTMLElement;
                if (target.closest('[data-calendar-container]')) {
                  e.preventDefault();
                }
              }}
              onInteractOutside={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest('[data-calendar-container]')) {
                  e.preventDefault();
                }
              }}
            >
              <ContextMenuDateEditor 
                currentDate={editedTask.dueDate}
                isBulk={selectedCount > 1}
                onSelect={(dateString) => {
                  handleContextDateChange(parseLocalDate(dateString));
                }}
              />
            </ContextMenuSubContent>
          </ContextMenuSub>
          
          {/* 3. Cliente */}
          <ContextMenuSub>
            <ContextMenuSubTrigger className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>Cliente</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a] p-0">
              <ContextMenuClientEditor 
                currentClient={editedTask.clientName || null}
                isBulk={selectedCount > 1}
                onSelect={(client) => {
                  handleContextClientChange(client);
                }}
              />
            </ContextMenuSubContent>
          </ContextMenuSub>
          
          {/* 4. Prioridade */}
          <ContextMenuSub>
            <ContextMenuSubTrigger className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Prioridade</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <ContextMenuItem onClick={() => handleContextPriorityChange("Urgente")} className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-900 text-white border-red-900 text-[10px] px-2 py-[2px] rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-200 mr-1" />
                  Urgente
                </Badge>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextPriorityChange("Importante")} className="flex items-center gap-2">
                <Badge variant="outline" className="bg-orange-800 text-white border-orange-800 text-[10px] px-2 py-[2px] rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-200 mr-1" />
                  Importante
                </Badge>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextPriorityChange("Normal")} className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-700 text-white border-yellow-700 text-[10px] px-2 py-[2px] rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-200 mr-1" />
                  Normal
                </Badge>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextPriorityChange("Baixa")} className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-800 text-white border-blue-800 text-[10px] px-2 py-[2px] rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-200 mr-1" />
                  Baixa
                </Badge>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          
          {/* 5. Status */}
          <ContextMenuSub>
            <ContextMenuSubTrigger className="flex items-center gap-2">
              <Circle className="w-4 h-4" />
              <span>Status</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <ContextMenuItem onClick={() => handleContextStatusChange("To Do")} className="flex items-center gap-2">
                <Badge variant="outline" className="bg-[#64635E] text-white border-[#64635E] text-[10px] px-2 py-[2px] rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8E8B86] mr-1" />
                  To Do
                </Badge>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextStatusChange("In Progress")} className="flex items-center gap-2">
                <Badge variant="outline" className="bg-[rgb(64,97,145)] text-white border-[rgb(64,97,145)] text-[10px] px-2 py-[2px] rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[rgb(66,129,220)] mr-1" />
                  In Progress
                </Badge>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextStatusChange("Done")} className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-900 text-white border-green-900 text-[10px] px-2 py-[2px] rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-200 mr-1" />
                  Done
                </Badge>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          
          {/* 6. Responsável */}
          <ContextMenuSub>
            <ContextMenuSubTrigger className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Responsável</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a] p-0">
              <ContextMenuAssigneeEditor 
                currentAssignees={editedTask.assignees || []}
                isBulk={selectedCount > 1}
                onAdd={handleContextAddAssignee}
                onRemove={handleContextRemoveAssignee}
                onSetSingle={handleContextSetSingleAssignee}
              />
            </ContextMenuSubContent>
          </ContextMenuSub>
          
          <ContextMenuSeparator className="bg-[#2a2a2a]" />
          <ContextMenuItem 
            onClick={handleContextDelete} 
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir</span>
          </ContextMenuItem>
        </ContextMenuContent>
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
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente esta tarefa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid={`button-confirmdelete-${id}`}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={showReplaceTitleDialog} onOpenChange={setShowReplaceTitleDialog}>
        <DialogContent className="max-w-md bg-[#1a1a1a] border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle>Substituir nome{selectedCount > 1 ? ` (${selectedCount} tarefas)` : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={newTitleText}
              onChange={(e) => setNewTitleText(e.target.value)}
              placeholder="Digite o novo nome..."
              className="bg-[#2a2a2a] border-[#3a3a3a]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleReplaceTitleSubmit();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReplaceTitleDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleReplaceTitleSubmit} disabled={!newTitleText.trim()}>
                Substituir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showAppendTitleDialog} onOpenChange={setShowAppendTitleDialog}>
        <DialogContent className="max-w-md bg-[#1a1a1a] border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle>Adicionar ao final{selectedCount > 1 ? ` (${selectedCount} tarefas)` : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              O texto será adicionado ao final do nome de cada tarefa selecionada.
            </p>
            <Input
              value={appendTitleText}
              onChange={(e) => setAppendTitleText(e.target.value)}
              placeholder="Digite o texto a adicionar..."
              className="bg-[#2a2a2a] border-[#3a3a3a]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAppendTitleSubmit();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAppendTitleDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAppendTitleSubmit} disabled={!appendTitleText.trim()}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showBulkDatePicker} onOpenChange={setShowBulkDatePicker}>
        <DialogContent className="max-w-md bg-[#1a1a1a] border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle>Alterar data{selectedCount > 1 ? ` (${selectedCount} tarefas)` : ''}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={(date) => date && handleContextDateChange(date)}
              locale={ptBR}
              className="rounded-md border border-[#2a2a2a]"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}