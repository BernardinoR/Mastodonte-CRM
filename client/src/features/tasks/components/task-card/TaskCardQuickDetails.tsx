import { useState, useCallback, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Input } from "@/shared/components/ui/input";
import { Trash2 } from "lucide-react";
import type { TaskUpdates } from "../../types/task";

interface TaskCardQuickDetailsProps {
  id: string;
  title: string;
  description: string;
  notes?: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (taskId: string, updates: TaskUpdates) => void;
  onDelete: () => void;
}

export function TaskCardQuickDetails({
  id,
  title,
  description,
  notes,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: TaskCardQuickDetailsProps) {
  const [localDescription, setLocalDescription] = useState(description);
  const [newNote, setNewNote] = useState("");
  const prevDescRef = useRef<string | null>(null);

  // Sync local description with props when they change
  useEffect(() => {
    if (prevDescRef.current !== description) {
      prevDescRef.current = description;
      setLocalDescription(description);
    }
  }, [description]);

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setLocalDescription(value);
      onUpdate(id, { description: value });
    },
    [id, onUpdate],
  );

  const handleAddNote = useCallback(() => {
    if (newNote.trim()) {
      onUpdate(id, {
        notes: [...(notes || []), newNote],
      });
      setNewNote("");
    }
  }, [newNote, onUpdate, id, notes]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] max-w-3xl overflow-y-auto"
        data-testid={`dialog-details-${id}`}
      >
        <DialogHeader className="space-y-0 pb-4">
          <DialogTitle>{title}</DialogTitle>
          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            className="absolute right-4 top-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
            data-testid={`button-modal-delete-${id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <div className="border-t pt-6">
            <label className="mb-3 block text-sm font-medium">Descrição</label>
            <Textarea
              value={localDescription}
              onChange={handleDescriptionChange}
              placeholder="Adicione detalhes sobre esta tarefa..."
              className="hover-elevate min-h-[100px]"
              data-testid={`textarea-description-${id}`}
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="mb-3 text-sm font-medium">Histórico / Notas</h3>
            {notes && notes.length > 0 ? (
              <div className="mb-4 space-y-2">
                {notes.map((note, index) => (
                  <div key={index} className="rounded-lg bg-muted p-3 text-sm">
                    {note}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-4 text-sm text-muted-foreground">Nenhuma nota ainda.</p>
            )}
            <div className="flex gap-2">
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
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
  );
}
