import { useState, useEffect, useRef, useCallback } from "react";
import { Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export interface NewClientInlineData {
  name: string;
  email: string;
}

interface NewClientInlineCardProps {
  onSave: (data: NewClientInlineData) => void | Promise<void>;
  onCancel: () => void;
}

export function NewClientInlineCard({ onSave, onCancel }: NewClientInlineCardProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef(name);

  useEffect(() => {
    nameRef.current = name;
  }, [name]);

  useEffect(() => {
    // Auto-focus no campo nome quando o card aparece
    nameInputRef.current?.focus();
  }, []);

  const commitSave = useCallback(async () => {
    const currentName = nameRef.current;
    if (currentName.trim() && !isSaving) {
      setIsSaving(true);
      try {
        await onSave({ name: currentName.trim(), email: email.trim() });
      } finally {
        setIsSaving(false);
      }
    }
  }, [email, isSaving, onSave]);

  const handleCancel = useCallback(() => {
    setName("");
    setEmail("");
    onCancel();
  }, [onCancel]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && nameRef.current.trim()) {
      e.preventDefault();
      commitSave();
    } else if (e.key === "Escape" && !isSaving) {
      e.preventDefault();
      handleCancel();
    }
  };

  // Gerar iniciais do nome
  const getInitials = (name: string): string => {
    if (!name.trim()) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.trim().substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-[#3a3a3a] bg-[#1a1a1a] p-5 transition-all",
        "hover:border-[#444444] hover:bg-[#222222]",
        isSaving && "pointer-events-none animate-pulse",
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#2a2a2a] text-sm font-semibold text-[#8c8c8c]">
          {getInitials(name)}
        </div>

        {/* Inputs inline */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <input
            ref={nameInputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            placeholder="Nome do cliente"
            className="w-full border-b border-[#2eaadc] bg-transparent pb-1 text-sm font-medium text-[#ededed] placeholder:text-[#666666] focus:outline-none disabled:opacity-50"
            data-testid="input-new-client-name"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            placeholder="email@exemplo.com"
            className="w-full border-b border-[#3a3a3a] bg-transparent pb-1 text-sm text-[#ededed] placeholder:text-[#666666] focus:border-[#2eaadc] focus:outline-none disabled:opacity-50"
            data-testid="input-new-client-email"
          />
        </div>

        {/* Botão de confirmar */}
        <div className="flex flex-shrink-0 items-start">
          <Button
            size="icon"
            onClick={commitSave}
            disabled={!name.trim() || isSaving}
            className="h-9 w-9 border border-[#3a5a3a] bg-[#1a2e1a] text-[#6ecf8e] hover:border-[#6ecf8e] hover:bg-[#243a24] disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="button-save-new-client"
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
