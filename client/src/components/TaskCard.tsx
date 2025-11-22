import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Pencil, Trash2, User, FileText, Flag } from "lucide-react";
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

  const handleUpdate = (field: string, value: any) => {
    const updates: any = {};
    
    if (field === "dueDate") {
      updates.dueDate = new Date(value);
    } else if (field === "priority") {
      updates.priority = value === "_none" ? undefined : (value as TaskPriority);
    } else if (field === "clientName") {
      updates.clientName = value === "_none" ? undefined : value;
    } else {
      updates[field] = value;
    }
    
    onUpdate(id, updates);
    setEditedTask({ ...editedTask, [field]: value === "_none" ? "" : value });
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
    if (!(e.target as HTMLElement).closest('button')) {
      setShowDetails(true);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(true);
  };

  return (
    <>
      <Card 
        ref={setNodeRef}
        style={style}
        className="hover-elevate active-elevate-2 cursor-pointer" 
        data-testid={`card-task-${id}`}
        onClick={handleCardClick}
        {...listeners}
        {...attributes}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-base" data-testid={`text-tasktitle-${id}`}>{title}</h3>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 shrink-0"
                onClick={handleEditClick}
                data-testid={`button-edit-${id}`}
              >
                <Pencil className="w-3 h-3" />
              </Button>
            </div>
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
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid={`dialog-details-${id}`}>
          <DialogHeader className="space-y-0 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <Input
                  value={editedTask.title}
                  onChange={(e) => handleUpdate("title", e.target.value)}
                  className="text-2xl font-semibold border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Título da tarefa"
                  data-testid={`input-modal-title-${id}`}
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                data-testid={`button-modal-delete-${id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Data de Vencimento
                </label>
                <Input
                  type="date"
                  value={editedTask.dueDate}
                  onChange={(e) => handleUpdate("dueDate", e.target.value)}
                  className="hover-elevate"
                  data-testid={`input-modal-date-${id}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Cliente
                </label>
                <Select
                  value={editedTask.clientName || "_none"}
                  onValueChange={(value) => handleUpdate("clientName", value)}
                >
                  <SelectTrigger className="hover-elevate" data-testid={`select-modal-client-${id}`}>
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Flag className="w-4 h-4 text-muted-foreground" />
                  Prioridade
                </label>
                <Select
                  value={editedTask.priority || "_none"}
                  onValueChange={(value) => handleUpdate("priority", value)}
                >
                  <SelectTrigger className="hover-elevate" data-testid={`select-modal-priority-${id}`}>
                    <SelectValue placeholder="Prioridade (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Nenhuma</SelectItem>
                    <SelectItem value="Urgente">
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        Urgente
                      </Badge>
                    </SelectItem>
                    <SelectItem value="Importante">
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                        Importante
                      </Badge>
                    </SelectItem>
                    <SelectItem value="Normal">
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/20">
                        Normal
                      </Badge>
                    </SelectItem>
                    <SelectItem value="Baixa">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        Baixa
                      </Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Status
                </label>
                <Select
                  value={editedTask.status}
                  onValueChange={(value) => handleUpdate("status", value)}
                >
                  <SelectTrigger className="hover-elevate" data-testid={`select-modal-status-${id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        To Do
                      </Badge>
                    </SelectItem>
                    <SelectItem value="In Progress">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        In Progress
                      </Badge>
                    </SelectItem>
                    <SelectItem value="Done">
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                        Done
                      </Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Responsável
                </label>
                <Input
                  value={editedTask.assignee}
                  onChange={(e) => handleUpdate("assignee", e.target.value)}
                  placeholder="Nome do responsável"
                  className="hover-elevate"
                  data-testid={`input-modal-assignee-${id}`}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <label className="text-sm font-medium mb-3 block">Descrição</label>
              <Textarea
                value={editedTask.description}
                onChange={(e) => handleUpdate("description", e.target.value)}
                placeholder="Adicione detalhes sobre esta tarefa..."
                className="min-h-[120px] hover-elevate resize-none"
                data-testid={`textarea-modal-description-${id}`}
              />
            </div>

            <div className="border-t pt-6">
              <label className="text-sm font-medium mb-3 block">Histórico / Notas</label>
              <div className="space-y-2 mb-4">
                {notes && notes.length > 0 ? (
                  notes.map((note, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-muted/50 rounded-md text-sm border border-border/50" 
                      data-testid={`note-${id}-${index}`}
                    >
                      {note}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nenhuma nota ainda.</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Adicionar nota..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                  className="hover-elevate"
                  data-testid={`input-modal-newnote-${id}`}
                />
                <Button onClick={handleAddNote} data-testid={`button-modal-addnote-${id}`}>
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
