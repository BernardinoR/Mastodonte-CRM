import { useState, useEffect, useRef, useCallback } from "react";
import { Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export interface NewClientInlineData {
  name: string;
  email: string;
}

interface NewClientInlineCardProps {
  onSave: (data: NewClientInlineData) => void;
  onCancel: () => void;
}

export function NewClientInlineCard({ onSave, onCancel }: NewClientInlineCardProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isSavingRef = useRef(false);
  const nameRef = useRef(name);

  useEffect(() => {
    nameRef.current = name;
  }, [name]);

  useEffect(() => {
    // Auto-focus no campo nome quando o card aparece
    nameInputRef.current?.focus();
  }, []);

  const commitSave = useCallback(() => {
    const currentName = nameRef.current;
    if (currentName.trim() && !isSavingRef.current) {
      isSavingRef.current = true;
      onSave({ name: currentName.trim(), email: email.trim() });
      setName("");
      setEmail("");
      setTimeout(() => {
        isSavingRef.current = false;
      }, 100);
    }
  }, [email, onSave]);

  const handleCancel = useCallback(() => {
    setName("");
    setEmail("");
    onCancel();
  }, [onCancel]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && nameRef.current.trim()) {
      e.preventDefault();
      commitSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      const relatedTarget = e.relatedTarget as Node | null;
      const isInsideCard = cardRef.current?.contains(relatedTarget);

      if (!isInsideCard) {
        setTimeout(() => {
          if (nameRef.current.trim() && !isSavingRef.current) {
            commitSave();
          } else if (!nameRef.current.trim()) {
            handleCancel();
          }
        }, 150);
      }
    },
    [commitSave, handleCancel],
  );

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
      ref={cardRef}
      className={cn(
        "rounded-xl border border-dashed border-[#2a2a2a] bg-[#1a1a1a] p-5 transition-all",
        "hover:border-[#3a3a3a] hover:bg-[#1f1f1f]",
      )}
      onBlur={handleBlur}
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
            placeholder="Nome do cliente"
            className="w-full border-b border-[#2eaadc] bg-transparent pb-1 text-sm font-medium text-[#ededed] placeholder:text-[#666666] focus:outline-none"
            data-testid="input-new-client-name"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="email@exemplo.com"
            className="w-full border-b border-[#333333] bg-transparent pb-1 text-sm text-[#ededed] placeholder:text-[#666666] focus:border-[#2eaadc] focus:outline-none"
            data-testid="input-new-client-email"
          />
        </div>

        {/* Botão de confirmar */}
        <div className="flex flex-shrink-0 items-start">
          <Button
            size="icon"
            onClick={commitSave}
            disabled={!name.trim()}
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
