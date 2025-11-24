import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar as CalendarIcon,
  Pencil,
  Trash2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseLocalDate, formatLocalDate } from "@/lib/date-utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { MOCK_USERS, MOCK_RESPONSIBLES, getUserByName } from "@/lib/mock-users";

type TaskStatus = "To Do" | "In Progress" | "Done";
type TaskPriority = "Urgente" | "Importante" | "Normal" | "Baixa";

interface TaskCardProps {
  id: string;
  title: string;
  clientName?: string;
  priority?: TaskPriority;
  status: TaskStatus;
  assignee: string;
  dueDate: Date;
  description?: string;
  notes?: string[];
  onUpdate: (taskId: string, updates: any) => void;
  onDelete: (taskId: string) => void;
}

// Global flag to prevent click events after closing edit mode
let globalJustClosedEdit = false;

export function TaskCard({
  id,
  title,
  clientName,
  priority,
  status,
  assignee,
  dueDate,
  description,
  notes,
  onUpdate,
  onDelete,
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title,
    clientName: clientName || "",
    priority: priority || "",
    status,
    assignee,
    dueDate: format(dueDate, "yyyy-MM-dd"),
    description: description || "",
  });
  const [newNote, setNewNote] = useState("");
  const [activePopover, setActivePopover] = useState<"date" | "priority" | "status" | "client" | null>(null);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const assigneeRef = useRef<HTMLDivElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setEditedTask({
      title,
      clientName: clientName || "",
      priority: priority || "",
      status,
      assignee,
      dueDate: format(dueDate, "yyyy-MM-dd"),
      description: description || "",
    });
  }, [title, clientName, priority, status, assignee, dueDate, description]);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    disabled: isEditing || activePopover !== null,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors: Record<string, string> = {
    Urgente: "bg-destructive/10 text-destructive border-destructive/20",
    Importante: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Normal: "bg-muted text-muted-foreground border-muted-foreground/20",
    Baixa: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  const statusColors: Record<string, string> = {
    "To Do": "bg-gray-500/10 text-gray-500 border-gray-500/20",
    "In Progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Done: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  const handleSave = () => {
    // Close all popovers when exiting edit mode
    setActivePopover(null);
    setIsEditing(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is inside any Radix portal using composedPath
      const path = event.composedPath();
      const isPortal = path.some((element) => {
        if (element instanceof HTMLElement) {
          return (
            element.hasAttribute('data-radix-portal') ||
            element.hasAttribute('data-popover-portal') ||
            element.getAttribute('role') === 'dialog' ||
            element.getAttribute('role') === 'listbox' ||
            element.getAttribute('role') === 'menu' ||
            element.classList.contains('date-input-calendar-popover') ||
            // Also check for Radix Popover specific classes
            element.hasAttribute('data-radix-popper-content-wrapper') ||
            element.classList.contains('rdp') // react-day-picker calendar
          );
        }
        return false;
      });
      
      if (isEditing && cardRef.current && !cardRef.current.contains(target) && !isPortal) {
        // Set flag FIRST to prevent any card clicks in the same event cycle
        globalJustClosedEdit = true;
        setTimeout(() => {
          globalJustClosedEdit = false;
        }, 300);
        
        // Stop propagation to prevent click from reaching other elements
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        handleSave();
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside, true);
      document.addEventListener("click", handleClickOutside, true);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside, true);
        document.removeEventListener("click", handleClickOutside, true);
      };
    }
  }, [isEditing]);

  const handleUpdate = (field: string, value: any) => {
    const updated = { ...editedTask, [field]: value };
    setEditedTask(updated);
    
    // Auto-save immediately on field change
    // Always derive the date from the updated state (not from props)
    // Parse if non-empty, otherwise use the original prop as fallback
    const parsedDueDate = updated.dueDate ? parseLocalDate(updated.dueDate) : dueDate;
    
    onUpdate(id, {
      title: updated.title,
      clientName: updated.clientName || undefined,
      priority: (updated.priority as TaskPriority) || undefined,
      status: updated.status as TaskStatus,
      assignee: updated.assignee,
      dueDate: parsedDueDate,
    });
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
    
    if (!isInteractiveElement && !globalJustClosedEdit) {
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

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Clear the single click timeout to prevent modal from opening
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    
    setIsEditing(true);
  };

  const handleTitleEdit = (e: React.FocusEvent<HTMLDivElement>) => {
    const newTitle = e.currentTarget.textContent || "";
    if (newTitle.trim() && newTitle !== editedTask.title) {
      handleUpdate("title", newTitle.trim());
    } else if (!newTitle.trim()) {
      // Restore original title if empty
      e.currentTarget.textContent = editedTask.title;
    }
  };

  const handleAssigneeEdit = (e: React.FocusEvent<HTMLDivElement>) => {
    const newAssignee = e.currentTarget.textContent || "";
    if (newAssignee.trim() && newAssignee !== editedTask.assignee) {
      handleUpdate("assignee", newAssignee.trim());
    } else if (!newAssignee.trim()) {
      // Restore original assignee if empty
      e.currentTarget.textContent = editedTask.assignee;
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

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...(!isEditing ? { ...attributes, ...listeners } : {})}
      >
        <Card
          ref={cardRef}
          className={cn(
            "group/task-card cursor-pointer transition-all hover-elevate active-elevate-2",
            isEditing && "ring-2 ring-primary shadow-lg"
          )}
          onClick={handleCardClick}
          onDoubleClick={handleEditClick}
          data-testid={`card-task-${id}`}
        >
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              {/* Linha 1: Título + Ações (lápis com hover) + Divisória */}
              <div className="pb-3 border-b border-border/80">
                <div className="flex items-start justify-between gap-2">
                  <div
                    ref={titleRef}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={handleTitleEdit}
                    onClick={(e) => isEditing && e.stopPropagation()}
                    className={cn(
                      "font-semibold text-base leading-tight flex-1",
                      isEditing && "cursor-text outline-none hover:bg-muted/50 rounded px-1 -mx-1 focus:bg-muted/50"
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
                        className="h-6 w-6 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                        data-testid={`button-delete-${id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "h-6 w-6 shrink-0",
                        !isEditing && "opacity-0 pointer-events-none transition-opacity group-hover/task-card:opacity-100 group-hover/task-card:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto focus-visible:ring-2 focus-visible:ring-primary"
                      )}
                      onClick={isEditing ? (e) => { e.stopPropagation(); setIsEditing(false); } : handleEditClick}
                      data-testid={`button-edit-${id}`}
                    >
                      {isEditing ? <Check className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Linha 2: Data */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {isEditing ? (
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <DateInput
                      value={editedTask.dueDate}
                      onChange={handleDateChange}
                      className="max-w-[120px]"
                      dataTestId={`input-date-${id}`}
                    />
                  </div>
                ) : (
                  <>
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{format(dueDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                  </>
                )}
              </div>
              
              {/* Linha 3: Prioridade - Status */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                {/* Priority Badge */}
                {isEditing ? (
                  <Popover open={activePopover === "priority"} onOpenChange={(open) => setActivePopover(open ? "priority" : null)}>
                    <PopoverTrigger asChild onPointerDownCapture={(e: React.PointerEvent) => e.stopPropagation()}>
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
                            "text-[11px] px-2 py-0.5 cursor-pointer hover:bg-muted/50",
                            priority ? priorityColors[priority] : "border-dashed"
                          )}
                          data-testid={`badge-priority-${id}`}
                        >
                          {priority || "Adicionar Prioridade"}
                        </Badge>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0" side="bottom" align="start" sideOffset={6} avoidCollisions={true} collisionPadding={8}>
                      <div className="space-y-1 p-1">
                        <div
                          className="px-2 py-1.5 text-sm rounded hover:bg-muted cursor-pointer"
                          onClick={() => handlePriorityChange("_none")}
                        >
                          Nenhuma
                        </div>
                        <div
                          className="px-2 py-1.5 text-sm rounded hover:bg-muted cursor-pointer flex items-center"
                          onClick={() => handlePriorityChange("Urgente")}
                        >
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[11px] px-2 py-0.5">
                            Urgente
                          </Badge>
                        </div>
                        <div
                          className="px-2 py-1.5 text-sm rounded hover:bg-muted cursor-pointer flex items-center"
                          onClick={() => handlePriorityChange("Importante")}
                        >
                          <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[11px] px-2 py-0.5">
                            Importante
                          </Badge>
                        </div>
                        <div
                          className="px-2 py-1.5 text-sm rounded hover:bg-muted cursor-pointer flex items-center"
                          onClick={() => handlePriorityChange("Normal")}
                        >
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/20 text-[11px] px-2 py-0.5">
                            Normal
                          </Badge>
                        </div>
                        <div
                          className="px-2 py-1.5 text-sm rounded hover:bg-muted cursor-pointer flex items-center"
                          onClick={() => handlePriorityChange("Baixa")}
                        >
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[11px] px-2 py-0.5">
                            Baixa
                          </Badge>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : priority ? (
                  <Badge variant="outline" className={`text-[11px] px-2 py-0.5 ${priorityColors[priority]}`}>
                    {priority}
                  </Badge>
                ) : null}
                
                {/* Status Badge */}
                {isEditing ? (
                  <Popover open={activePopover === "status"} onOpenChange={(open) => setActivePopover(open ? "status" : null)}>
                    <PopoverTrigger asChild onPointerDownCapture={(e: React.PointerEvent) => e.stopPropagation()}>
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
                            "text-[11px] px-2 py-0.5 cursor-pointer hover:bg-muted/50",
                            statusColors[status]
                          )}
                          data-testid={`badge-status-${id}`}
                        >
                          {status}
                        </Badge>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0" side="bottom" align="start" sideOffset={6} avoidCollisions={true} collisionPadding={8}>
                      <div className="space-y-1 p-1">
                        <div
                          className="px-2 py-1.5 text-sm rounded hover:bg-muted cursor-pointer flex items-center"
                          onClick={() => handleStatusChange("To Do")}
                        >
                          <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20 text-[11px] px-2 py-0.5">
                            To Do
                          </Badge>
                        </div>
                        <div
                          className="px-2 py-1.5 text-sm rounded hover:bg-muted cursor-pointer flex items-center"
                          onClick={() => handleStatusChange("In Progress")}
                        >
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[11px] px-2 py-0.5">
                            In Progress
                          </Badge>
                        </div>
                        <div
                          className="px-2 py-1.5 text-sm rounded hover:bg-muted cursor-pointer flex items-center"
                          onClick={() => handleStatusChange("Done")}
                        >
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[11px] px-2 py-0.5">
                            Done
                          </Badge>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Badge variant="outline" className={`text-[11px] px-2 py-0.5 ${statusColors[status]}`}>
                    {status}
                  </Badge>
                )}
              </div>
              
              {/* Linha 4: Cliente */}
              {(clientName || isEditing) && (
                <div className="text-sm text-muted-foreground mt-1">
                  {isEditing ? (
                    <Popover open={activePopover === "client"} onOpenChange={(open) => setActivePopover(open ? "client" : null)}>
                      <PopoverTrigger asChild onPointerDownCapture={(e: React.PointerEvent) => e.stopPropagation()}>
                        <span 
                          className="cursor-pointer hover:bg-muted/50 rounded px-1"
                          data-testid={`text-client-${id}`}
                        >
                          {clientName || "Adicionar cliente"}
                        </span>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0" side="bottom" align="start" sideOffset={6} avoidCollisions={true} collisionPadding={8}>
                        <div className="space-y-1 p-1 max-h-64 overflow-y-auto">
                          <div
                            className="px-2 py-1.5 text-sm rounded hover:bg-muted cursor-pointer"
                            onClick={() => handleClientChange("_none")}
                          >
                            Nenhum
                          </div>
                          <div
                            className="px-2 py-1.5 text-sm rounded hover:bg-muted cursor-pointer"
                            onClick={() => handleClientChange("Ademar João Gréguer")}
                          >
                            Ademar João Gréguer
                          </div>
                          <div
                            className="px-2 py-1.5 text-sm rounded hover:bg-muted cursor-pointer"
                            onClick={() => handleClientChange("Fernanda Carolina De Faria")}
                          >
                            Fernanda Carolina De Faria
                          </div>
                          <div
                            className="px-2 py-1.5 text-sm rounded hover:bg-muted cursor-pointer"
                            onClick={() => handleClientChange("Gustavo Samconi Soares")}
                          >
                            Gustavo Samconi Soares
                          </div>
                          <div
                            className="px-2 py-1.5 text-sm rounded hover:bg-muted cursor-pointer"
                            onClick={() => handleClientChange("Israel Schuster Da Fonseca")}
                          >
                            Israel Schuster Da Fonseca
                          </div>
                          <div
                            className="px-2 py-1.5 text-sm rounded hover:bg-muted cursor-pointer"
                            onClick={() => handleClientChange("Marcia Mozzato Ciampi De Andrade")}
                          >
                            Marcia Mozzato Ciampi De Andrade
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <span>{clientName}</span>
                  )}
                </div>
              )}
              
              {/* Linha 5: Responsáveis */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.08em]">
                  Responsáveis
                </div>
                {isEditing ? (
                  <Select
                    value={assignee}
                    onValueChange={(value) => handleUpdate("assignee", value)}
                  >
                    <SelectTrigger 
                      className="h-8 w-auto min-w-[160px] text-sm border-0 bg-transparent hover:bg-muted/50 focus:ring-0 gap-2 px-0"
                      onPointerDownCapture={(e) => e.stopPropagation()}
                      data-testid={`select-assignee-${id}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent onPointerDownCapture={(e) => e.stopPropagation()}>
                      {MOCK_USERS.map((user) => (
                        <SelectItem key={user.id} value={user.name}>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-[10px]">
                                {user.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-1.5">
                    {MOCK_RESPONSIBLES.map((responsible) => (
                      <div key={responsible.id} className="flex items-center gap-1.5">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className={cn("text-[10px] text-white", responsible.avatarColor)}>
                            {responsible.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm" data-testid={responsible.id === "rafael-bernardino" ? `text-assignee-${id}` : undefined}>
                          {responsible.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
    </>
  );
}