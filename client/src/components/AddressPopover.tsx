import type React from "react";
import { useState, useRef, useEffect } from "react";
import { MapPin, Copy, Pencil, Check, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AddressPopoverProps {
  address: string;
  onAddressChange: (newAddress: string) => void;
}

export function AddressPopover({
  address,
  onAddressChange,
}: AddressPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftAddress, setDraftAddress] = useState(address);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setDraftAddress(address);
  }, [address]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast({
        title: "Endereço copiado!",
        description: "O endereço foi copiado para a área de transferência.",
      });
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o endereço.",
        variant: "destructive",
      });
    }
  };

  const handleStartEditing = () => {
    setDraftAddress(address);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = draftAddress.trim();
    if (trimmed && trimmed !== address) {
      onAddressChange(trimmed);
      toast({
        title: "Endereço atualizado",
        description: "O endereço foi salvo com sucesso.",
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftAddress(address);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setIsEditing(false);
        setDraftAddress(address);
      }
    }}>
      <PopoverTrigger asChild>
        <div className="flex flex-col gap-1 cursor-pointer">
          <span className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Endereço
          </span>
          <span 
            className="text-sm font-medium text-foreground px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-md hover:bg-[#2c2c2c] transition-colors"
            data-testid="text-client-address"
          >
            {address || "Não informado"}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-[#252525] border-[#333333]"
        align="start"
      >
        <div className="p-4">
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                ref={textareaRef}
                value={draftAddress}
                onChange={(e) => setDraftAddress(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite o endereço..."
                className="min-h-[80px] bg-[#1a1a1a] border-[#333333] text-foreground resize-none"
                data-testid="input-edit-address"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-foreground"
                  data-testid="button-cancel-address"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-[#2eaadc] hover:bg-[#259bc5] text-white"
                  data-testid="button-save-address"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Salvar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {address || "Endereço não informado"}
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="flex-1 border-[#333333] hover:bg-[#2c2c2c]"
                  data-testid="button-copy-address"
                >
                  <Copy className="w-4 h-4 mr-1.5" />
                  Copiar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStartEditing}
                  className="flex-1 border-[#333333] hover:bg-[#2c2c2c]"
                  data-testid="button-edit-address"
                >
                  <Pencil className="w-4 h-4 mr-1.5" />
                  Editar
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
