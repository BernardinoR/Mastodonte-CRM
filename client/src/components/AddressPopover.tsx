import type React from "react";
import { useState, useRef, useEffect } from "react";
import { MapPin, Copy, Pencil, Check, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Address } from "@/types/client";

interface AddressPopoverProps {
  address: Address;
  onAddressChange: (newAddress: Address) => void;
}

export function AddressPopover({
  address,
  onAddressChange,
}: AddressPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftAddress, setDraftAddress] = useState<Address>(address);
  const streetInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isEditing && streetInputRef.current) {
      streetInputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setDraftAddress(address);
  }, [address]);

  const displayAddress = `${address.city}/${address.state}`;

  const formatFullAddress = () => {
    const parts: string[] = [];
    if (address.street) parts.push(address.street);
    if (address.complement) parts.push(address.complement);
    if (address.neighborhood) parts.push(address.neighborhood);
    if (address.city && address.state) parts.push(`${address.city}/${address.state}`);
    if (address.zipCode) parts.push(`CEP: ${address.zipCode}`);
    return parts.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatFullAddress());
      toast({
        title: "Endereço copiado!",
        description: "O endereço completo foi copiado para a área de transferência.",
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
    onAddressChange(draftAddress);
    toast({
      title: "Endereço atualizado",
      description: "O endereço foi salvo com sucesso.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftAddress(address);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === "Enter") {
      handleSave();
    }
  };

  const updateField = (field: keyof Address, value: string) => {
    setDraftAddress(prev => ({ ...prev, [field]: value }));
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
            {displayAddress || "Não informado"}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-[#252525] border-[#333333]"
        align="start"
      >
        <div className="px-4 py-3 border-b border-[#333333] flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Endereço</span>
          {!isEditing && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleStartEditing}
              className="h-7 px-2 text-gray-400 hover:text-foreground"
              data-testid="button-edit-address"
            >
              <Pencil className="w-3.5 h-3.5 mr-1" />
              Editar
            </Button>
          )}
        </div>

        <div className="p-4">
          {isEditing ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Rua/Número</Label>
                <Input
                  ref={streetInputRef}
                  value={draftAddress.street}
                  onChange={(e) => updateField("street", e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ex: Av. Paulista, 1000"
                  className="h-8 bg-[#1a1a1a] border-[#333333] text-foreground text-sm"
                  data-testid="input-address-street"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Complemento</Label>
                <Input
                  value={draftAddress.complement}
                  onChange={(e) => updateField("complement", e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ex: Apto 501, Bloco B"
                  className="h-8 bg-[#1a1a1a] border-[#333333] text-foreground text-sm"
                  data-testid="input-address-complement"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Bairro</Label>
                <Input
                  value={draftAddress.neighborhood}
                  onChange={(e) => updateField("neighborhood", e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ex: Centro"
                  className="h-8 bg-[#1a1a1a] border-[#333333] text-foreground text-sm"
                  data-testid="input-address-neighborhood"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-400">Cidade</Label>
                  <Input
                    value={draftAddress.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ex: São Paulo"
                    className="h-8 bg-[#1a1a1a] border-[#333333] text-foreground text-sm"
                    data-testid="input-address-city"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-400">UF</Label>
                  <Input
                    value={draftAddress.state}
                    onChange={(e) => updateField("state", e.target.value.toUpperCase().slice(0, 2))}
                    onKeyDown={handleKeyDown}
                    placeholder="SP"
                    maxLength={2}
                    className="h-8 bg-[#1a1a1a] border-[#333333] text-foreground text-sm uppercase"
                    data-testid="input-address-state"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">CEP</Label>
                <Input
                  value={draftAddress.zipCode}
                  onChange={(e) => updateField("zipCode", e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ex: 01310-100"
                  className="h-8 bg-[#1a1a1a] border-[#333333] text-foreground text-sm"
                  data-testid="input-address-zipcode"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
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
              <div className="space-y-2.5">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-0.5">Rua/Número</span>
                  <span className="text-sm text-foreground">{address.street || "—"}</span>
                </div>
                {address.complement && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-0.5">Complemento</span>
                    <span className="text-sm text-foreground">{address.complement}</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-0.5">Bairro</span>
                  <span className="text-sm text-foreground">{address.neighborhood || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-0.5">Cidade/UF</span>
                  <span className="text-sm text-foreground">{address.city}/{address.state}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-0.5">CEP</span>
                  <span className="text-sm text-foreground">{address.zipCode || "—"}</span>
                </div>
              </div>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="w-full border-[#333333] hover:bg-[#2c2c2c]"
                  data-testid="button-copy-address"
                >
                  <Copy className="w-4 h-4 mr-1.5" />
                  Copiar endereço completo
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
