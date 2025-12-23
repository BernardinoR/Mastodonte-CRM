import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { MOCK_USERS } from "@/lib/mock-users";
import { useClients } from "@/contexts/ClientsContext";

export interface NewTaskFormData {
  title: string;
  description: string;
  clientId: string;
  clientName?: string;
  priority: string;
  assignees: string[];
  dueDate: string;
}

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: NewTaskFormData) => void;
  preSelectedClient?: string;
}

export function NewTaskDialog({ open, onOpenChange, onSubmit, preSelectedClient }: NewTaskDialogProps) {
  const { clients } = useClients();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clientId: preSelectedClient || "",
    priority: "Normal",
    assignee: MOCK_USERS[0].name,
    dueDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = clients.find(c => c.id === formData.clientId);
    const taskData = {
      ...formData,
      clientName: selectedClient?.name,
      assignees: [formData.assignee],
    };
    console.log('Task submitted:', taskData);
    onSubmit?.(taskData);
    onOpenChange(false);
    setFormData({
      title: "",
      description: "",
      clientId: preSelectedClient || "",
      priority: "Normal",
      assignee: MOCK_USERS[0].name,
      dueDate: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-medium uppercase tracking-wide">
                Título *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                data-testid="input-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-medium uppercase tracking-wide">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                data-testid="input-description"
              />
            </div>
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
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-xs font-medium uppercase tracking-wide">
                  Prioridade
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id="priority" data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignee" className="text-xs font-medium uppercase tracking-wide">
                  Responsável
                </Label>
                <Select
                  value={formData.assignee}
                  onValueChange={(value) => setFormData({ ...formData, assignee: value })}
                >
                  <SelectTrigger id="assignee" data-testid="select-assignee">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-xs font-medium uppercase tracking-wide">
                  Data de Vencimento
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  data-testid="input-duedate"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
              Cancelar
            </Button>
            <Button type="submit" data-testid="button-save">
              Criar Tarefa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
