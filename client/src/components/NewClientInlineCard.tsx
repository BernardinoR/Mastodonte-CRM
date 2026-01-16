import { useState, useEffect, useRef, useCallback } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  const handleBlur = useCallback((e: React.FocusEvent) => {
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
  }, [commitSave, handleCancel]);

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
        "bg-[#1a1a1a] border border-[#2a2a2a] border-dashed rounded-xl p-5 transition-all",
        "hover:bg-[#1f1f1f] hover:border-[#3a3a3a]"
      )}
      onBlur={handleBlur}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-[#2a2a2a] flex items-center justify-center text-sm font-semibold text-[#8c8c8c] flex-shrink-0">
          {getInitials(name)}
        </div>
        
        {/* Inputs inline */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <input
            ref={nameInputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nome do cliente"
            className="bg-transparent border-b border-[#2eaadc] text-sm text-[#ededed] font-medium placeholder:text-[#666666] focus:outline-none w-full pb-1"
            data-testid="input-new-client-name"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="email@exemplo.com"
            className="bg-transparent border-b border-[#333333] text-sm text-[#ededed] placeholder:text-[#666666] focus:outline-none focus:border-[#2eaadc] w-full pb-1"
            data-testid="input-new-client-email"
          />
        </div>
        
        {/* Botão de confirmar */}
        <div className="flex items-start flex-shrink-0">
          <Button
            size="icon"
            onClick={commitSave}
            disabled={!name.trim()}
            className="h-9 w-9 bg-[#1a2e1a] border border-[#3a5a3a] text-[#6ecf8e] hover:bg-[#243a24] hover:border-[#6ecf8e] disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-save-new-client"
          >
            <Check className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
