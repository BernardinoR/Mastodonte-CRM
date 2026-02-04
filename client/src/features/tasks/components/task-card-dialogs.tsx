import { memo, useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Input } from "@/shared/components/ui/input";
import { ptBR } from "date-fns/locale";

interface TaskCardDialogsProps {
  id: string;
  dueDate: Date;
  selectedCount: number;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  showReplaceTitleDialog: boolean;
  setShowReplaceTitleDialog: (show: boolean) => void;
  showAppendTitleDialog: boolean;
  setShowAppendTitleDialog: (show: boolean) => void;
  showBulkDatePicker: boolean;
  setShowBulkDatePicker: (show: boolean) => void;
  newTitleText: string;
  setNewTitleText: (text: string) => void;
  appendTitleText: string;
  setAppendTitleText: (text: string) => void;
  onDelete: () => void;
  onReplaceTitleSubmit: () => void;
  onAppendTitleSubmit: () => void;
  onContextDateChange: (date: Date) => void;
}

export const TaskCardDialogs = memo(function TaskCardDialogs({
  id,
  dueDate,
  selectedCount,
  showDeleteConfirm,
  setShowDeleteConfirm,
  showReplaceTitleDialog,
  setShowReplaceTitleDialog,
  showAppendTitleDialog,
  setShowAppendTitleDialog,
  showBulkDatePicker,
  setShowBulkDatePicker,
  newTitleText,
  setNewTitleText,
  appendTitleText,
  setAppendTitleText,
  onDelete,
  onReplaceTitleSubmit,
  onAppendTitleSubmit,
  onContextDateChange,
}: TaskCardDialogsProps) {
  const handleReplaceKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onReplaceTitleSubmit();
      }
    },
    [onReplaceTitleSubmit],
  );

  const handleAppendKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onAppendTitleSubmit();
      }
    },
    [onAppendTitleSubmit],
  );

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        onContextDateChange(date);
      }
    },
    [onContextDateChange],
  );

  return (
    <>
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
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid={`button-confirmdelete-${id}`}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showReplaceTitleDialog} onOpenChange={setShowReplaceTitleDialog}>
        <DialogContent className="max-w-md border-[#2a2a2a] bg-[#1a1a1a]">
          <DialogHeader>
            <DialogTitle>
              Substituir nome{selectedCount > 1 ? ` (${selectedCount} tarefas)` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={newTitleText}
              onChange={(e) => setNewTitleText(e.target.value)}
              placeholder="Digite o novo nome..."
              className="border-[#3a3a3a] bg-[#2a2a2a]"
              autoFocus
              onKeyDown={handleReplaceKeyDown}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReplaceTitleDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={onReplaceTitleSubmit} disabled={!newTitleText.trim()}>
                Substituir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAppendTitleDialog} onOpenChange={setShowAppendTitleDialog}>
        <DialogContent className="max-w-md border-[#2a2a2a] bg-[#1a1a1a]">
          <DialogHeader>
            <DialogTitle>
              Adicionar ao final{selectedCount > 1 ? ` (${selectedCount} tarefas)` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              O texto será adicionado ao final do nome de cada tarefa selecionada.
            </p>
            <Input
              value={appendTitleText}
              onChange={(e) => setAppendTitleText(e.target.value)}
              placeholder="Digite o texto a adicionar..."
              className="border-[#3a3a3a] bg-[#2a2a2a]"
              autoFocus
              onKeyDown={handleAppendKeyDown}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAppendTitleDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={onAppendTitleSubmit} disabled={!appendTitleText.trim()}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkDatePicker} onOpenChange={setShowBulkDatePicker}>
        <DialogContent className="max-w-md border-[#2a2a2a] bg-[#1a1a1a]">
          <DialogHeader>
            <DialogTitle>
              Alterar data{selectedCount > 1 ? ` (${selectedCount} tarefas)` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={handleDateSelect}
              locale={ptBR}
              className="rounded-md border border-[#2a2a2a]"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
