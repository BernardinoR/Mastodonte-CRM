import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useState } from "react";

export interface NewMeetingFormData {
  clientId: string;
  date: string;
  type: string;
  notes: string;
}

interface NewMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: NewMeetingFormData) => void;
  preSelectedClient?: string;
}

export function NewMeetingDialog({ open, onOpenChange, onSubmit, preSelectedClient }: NewMeetingDialogProps) {
  const [formData, setFormData] = useState({
    clientId: preSelectedClient || "",
    date: "",
    type: "Reunião Mensal",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Meeting submitted:', formData);
    onSubmit?.(formData);
    onOpenChange(false);
    setFormData({
      clientId: preSelectedClient || "",
      date: "",
      type: "Reunião Mensal",
      notes: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Reunião</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client" className="text-xs font-medium uppercase tracking-wide">
                  Cliente *
                </Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                  required
                >
                  <SelectTrigger id="client" data-testid="select-client">
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Alessandro Cuçulin Mazer</SelectItem>
                    <SelectItem value="2">Fernanda Carolina De Faria</SelectItem>
                    <SelectItem value="3">Gustavo Samconi Soares</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-xs font-medium uppercase tracking-wide">
                  Data *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  data-testid="input-date"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-xs font-medium uppercase tracking-wide">
                Tipo de Reunião
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="type" data-testid="select-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Reunião Mensal">Reunião Mensal</SelectItem>
                  <SelectItem value="Reunião Anual">Reunião Anual</SelectItem>
                  <SelectItem value="Política de Investimento">Política de Investimento</SelectItem>
                  <SelectItem value="Patrimônio Previdencial">Patrimônio Previdencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs font-medium uppercase tracking-wide">
                Notas da Reunião *
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={8}
                placeholder="Digite as anotações da reunião..."
                required
                data-testid="input-notes"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
              Cancelar
            </Button>
            <Button type="submit" data-testid="button-save">
              Salvar Reunião
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
