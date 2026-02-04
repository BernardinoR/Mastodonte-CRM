import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useState } from "react";

export interface NewClientFormData {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  status: string;
  folderLink: string;
}

interface NewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: NewClientFormData) => void;
}

export function NewClientDialog({ open, onOpenChange, onSubmit }: NewClientDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    status: "Ativo",
    folderLink: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    onSubmit?.(formData);
    onOpenChange(false);
    setFormData({
      name: "",
      cpf: "",
      email: "",
      phone: "",
      status: "Ativo",
      folderLink: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wide">
                Nome Completo *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                data-testid="input-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-xs font-medium uppercase tracking-wide">
                CPF
              </Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="XXX.XXX.XXX-XX"
                data-testid="input-cpf"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-medium uppercase tracking-wide">
                Telefone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+55 11 99999-9999"
                data-testid="input-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wide">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-xs font-medium uppercase tracking-wide">
                Status *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status" data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Prospect">Prospect</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="folderLink" className="text-xs font-medium uppercase tracking-wide">
                Link da Pasta
              </Label>
              <Input
                id="folderLink"
                type="url"
                value={formData.folderLink}
                onChange={(e) => setFormData({ ...formData, folderLink: e.target.value })}
                placeholder="https://drive.google.com/..."
                data-testid="input-folderlink"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button type="submit" data-testid="button-save">
              Salvar Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
