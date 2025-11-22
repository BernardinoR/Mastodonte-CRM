import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Pencil, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Global flag to prevent card clicks immediately after exiting edit mode
let globalJustClosedEdit = false;

type TaskPriority = "Urgente" | "Importante" | "Normal" | "Baixa";
type TaskStatus = "To Do" | "In Progress" | "Done";

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
  onUpdate: (id: string, updates: Partial<TaskCardProps>) => void;
  onDelete: (id: string) => void;
}

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
  const cardRef = useRef<HTMLDivElement>(null);

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
    disabled: isEditing,
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

  const statusColors = {
    "To Do": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "In Progress": "bg-primary/10 text-primary border-primary/20",
    Done: "bg-green-500/10 text-green-400 border-green-500/20",
  };

  const handleSave = () => {
    onUpdate(id, {
      title: editedTask.title,
      clientName: editedTask.clientName || undefined,
      priority: (editedTask.priority as TaskPriority) || undefined,
      status: editedTask.status,
      assignee: editedTask.assignee,
      dueDate: new Date(editedTask.dueDate),
    });
    setIsEditing(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Ignore clicks on Radix portals (Select, Dialog, etc)
      const isPortal = target.closest('[role="dialog"]') || 
                      target.closest('[data-radix-portal]') ||
                      target.closest('[role="listbox"]') ||
                      target.closest('[role="menu"]');
      
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
    onUpdate(id, {
      title: updated.title,
      clientName: updated.clientName || undefined,
      priority: (updated.priority as TaskPriority) || undefined,
      status: updated.status,
      assignee: updated.assignee,
      dueDate: new Date(updated.dueDate),
    });
  };

  const handleDelete = () => {
    onDelete(id);
    setShowDeleteConfirm(false);
    setShowDetails(false);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const updatedNotes = [...(notes || []), `${new Date().toLocaleString('pt-BR')}: ${newNote}`];
      onUpdate(id, { notes: updatedNotes });
      setNewNote("");
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (!isEditing && !(e.target as HTMLElement).closest('button') && !globalJustClosedEdit) {
      setShowDetails(true);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  return (
    <>
      <Card 
        ref={isEditing ? cardRef : setNodeRef}
        style={isEditing ? undefined : style}
        className={isEditing ? "border-primary shadow-lg" : "hover-elevate active-elevate-2 cursor-pointer"}
        data-testid={`card-task-${id}`}
        onClick={isEditing ? undefined : handleCardClick}
        {...(isEditing ? {} : listeners)}
        {...(isEditing ? {} : attributes)}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header with title and edit button */}
            <div className="flex items-start justify-between gap-2">
              {isEditing ? (
                <Input
                  value={editedTask.title}
                  onChange={(e) => handleUpdate("title", e.target.value)}
                  placeholder="Título da tarefa"
                  className="font-medium"
                  autoFocus
                  data-testid={`input-title-${id}`}
                />
              ) : (
                <h3 className="font-medium text-base" data-testid={`text-tasktitle-${id}`}>
                  {title}
                </h3>
              )}
              <div className="flex items-center gap-1 shrink-0">
                {isEditing ? (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={handleDeleteClick}
                      data-testid={`button-delete-${id}`}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={handleSave}
                      data-testid={`button-save-${id}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={handleEditClick}
                    data-testid={`button-edit-${id}`}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Date, Client, Priority, Status */}
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  type="date"
                  value={editedTask.dueDate}
                  onChange={(e) => handleUpdate("dueDate", e.target.value)}
                  data-testid={`input-date-${id}`}
                />

                <Select
                  value={editedTask.clientName || "_none"}
                  onValueChange={(value) => handleUpdate("clientName", value === "_none" ? "" : value)}
                >
                  <SelectTrigger data-testid={`select-client-${id}`}>
                    <SelectValue placeholder="Selecionar cliente (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Nenhum</SelectItem>
                    <SelectItem value="Ademar João Gréguer">Ademar João Gréguer</SelectItem>
                    <SelectItem value="Fernanda Carolina De Faria">Fernanda Carolina De Faria</SelectItem>
                    <SelectItem value="Gustavo Samconi Soares">Gustavo Samconi Soares</SelectItem>
                    <SelectItem value="Israel Schuster Da Fonseca">Israel Schuster Da Fonseca</SelectItem>
                    <SelectItem value="Marcia Mozzato Ciampi De Andrade">Marcia Mozzato Ciampi De Andrade</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={editedTask.priority || "_none"}
                  onValueChange={(value) => handleUpdate("priority", value === "_none" ? "" : value)}
                >
                  <SelectTrigger data-testid={`select-priority-${id}`}>
                    <SelectValue placeholder="Prioridade (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Nenhuma</SelectItem>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                    <SelectItem value="Importante">Importante</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={editedTask.status}
                  onValueChange={(value) => handleUpdate("status", value as TaskStatus)}
                >
                  <SelectTrigger data-testid={`select-status-${id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={editedTask.assignee}
                  onChange={(e) => handleUpdate("assignee", e.target.value)}
                  placeholder="Responsável"
                  data-testid={`input-assignee-${id}`}
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  {priority && (
                    <Badge variant="outline" className={`text-xs ${priorityColors[priority]}`}>
                      {priority}
                    </Badge>
                  )}
                  <Badge variant="outline" className={`text-xs ${statusColors[status]}`}>
                    {status}
                  </Badge>
                  {clientName && (
                    <span className="text-xs text-muted-foreground">{clientName}</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-[10px]">
                        {assignee.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{assignee}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{format(dueDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl" data-testid={`dialog-details-${id}`}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Descrição</label>
              <Textarea
                value={editedTask.description}
                onChange={(e) => {
                  handleUpdate("description", e.target.value);
                  onUpdate(id, { description: e.target.value });
                }}
                placeholder="Adicione detalhes sobre esta tarefa..."
                className="min-h-[100px]"
                data-testid={`textarea-description-${id}`}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Histórico / Notas</label>
              <div className="space-y-2 mb-3">
                {notes && notes.length > 0 ? (
                  notes.map((note, index) => (
                    <div key={index} className="p-2 bg-muted rounded-md text-sm" data-testid={`note-${id}-${index}`}>
                      {note}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma nota ainda.</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Adicionar nota..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                  data-testid={`input-newnote-${id}`}
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
            <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A tarefa "{title}" será permanentemente excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid={`button-canceldelete-${id}`}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} data-testid={`button-confirmdelete-${id}`}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
