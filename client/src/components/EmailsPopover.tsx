import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Mail, Plus, Circle, X, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface EmailsPopoverProps {
  emails: string[];
  primaryEmailIndex: number;
  onAddEmail: (email: string) => void;
  onRemoveEmail: (index: number) => void;
  onUpdateEmail: (index: number, newEmail: string) => void;
  onSetPrimaryEmail: (index: number) => void;
}

export function EmailsPopover({
  emails,
  primaryEmailIndex,
  onAddEmail,
  onRemoveEmail,
  onUpdateEmail,
  onSetPrimaryEmail,
}: EmailsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftEmail, setDraftEmail] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);

  const primaryEmail = emails[primaryEmailIndex] || emails[0] || "";

  useEffect(() => {
    if (editingIndex !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingIndex]);

  useEffect(() => {
    if (isAddingNew && newInputRef.current) {
      newInputRef.current.focus();
    }
  }, [isAddingNew]);

  const startEditing = (index: number) => {
    setDraftEmail(emails[index]);
    setEditingIndex(index);
  };

  const commitEdit = () => {
    if (editingIndex !== null && draftEmail.trim()) {
      onUpdateEmail(editingIndex, draftEmail.trim());
    }
    setEditingIndex(null);
    setDraftEmail("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setDraftEmail("");
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  const startAddingNew = () => {
    setNewEmail("");
    setIsAddingNew(true);
  };

  const commitNewEmail = () => {
    if (newEmail.trim() && newEmail.includes("@")) {
      onAddEmail(newEmail.trim());
      setNewEmail("");
      setIsAddingNew(false);
    }
  };

  const cancelAddingNew = () => {
    setIsAddingNew(false);
    setNewEmail("");
  };

  const handleNewKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitNewEmail();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelAddingNew();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="flex flex-col gap-1 cursor-pointer">
          <span className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            Email
            {emails.length > 1 && (
              <span className="text-[10px] bg-[#333333] px-1.5 py-0.5 rounded">
                +{emails.length - 1}
              </span>
            )}
          </span>
          <span 
            className="text-sm font-medium text-foreground px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-md hover:bg-[#2c2c2c] transition-colors"
            data-testid="text-client-email"
          >
            {primaryEmail}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-[#252525] border-[#333333]"
        align="start"
      >
        <div className="p-3 border-b border-[#333333]">
          <h4 className="text-sm font-medium text-foreground">Emails do Cliente</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Clique para definir o email principal
          </p>
        </div>
        
        <div className="max-h-[200px] overflow-y-auto">
          {emails.map((email, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-3 py-2 hover:bg-[#2c2c2c] group"
            >
              <button
                type="button"
                onClick={() => onSetPrimaryEmail(index)}
                className="p-1 rounded transition-colors"
                title={index === primaryEmailIndex ? "Email principal" : "Definir como principal"}
                data-testid={`button-set-primary-email-${index}`}
              >
                {index === primaryEmailIndex ? (
                  <div className="w-4 h-4 rounded-full bg-[#2eaadc] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                )}
              </button>
              
              {editingIndex === index ? (
                <div className="flex-1 flex items-center gap-1">
                  <input
                    ref={inputRef}
                    type="email"
                    value={draftEmail}
                    onChange={(e) => setDraftEmail(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    onBlur={commitEdit}
                    className="flex-1 text-sm text-foreground bg-transparent border-b border-[#2eaadc] outline-none"
                    data-testid={`input-edit-email-${index}`}
                  />
                  <button
                    type="button"
                    onClick={commitEdit}
                    className="p-1 text-emerald-400 hover:bg-[#333333] rounded"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span 
                  className="flex-1 text-sm text-foreground cursor-pointer truncate"
                  onClick={() => startEditing(index)}
                  data-testid={`text-email-${index}`}
                >
                  {email}
                </span>
              )}
              
              {emails.length > 1 && editingIndex !== index && (
                <button
                  type="button"
                  onClick={() => onRemoveEmail(index)}
                  className="p-1 text-muted-foreground hover:text-red-400 hover:bg-[#333333] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remover email"
                  data-testid={`button-remove-email-${index}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="p-2 border-t border-[#333333]">
          {isAddingNew ? (
            <div className="flex items-center gap-2 px-1">
              <input
                ref={newInputRef}
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={handleNewKeyDown}
                onBlur={() => {
                  if (!newEmail.trim()) cancelAddingNew();
                }}
                placeholder="novo@email.com"
                className="flex-1 text-sm text-foreground bg-transparent border-b border-[#2eaadc] outline-none placeholder:text-muted-foreground"
                data-testid="input-new-email"
              />
              <button
                type="button"
                onClick={commitNewEmail}
                className="p-1 text-emerald-400 hover:bg-[#333333] rounded"
                data-testid="button-confirm-new-email"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={cancelAddingNew}
                className="p-1 text-muted-foreground hover:bg-[#333333] rounded"
                data-testid="button-cancel-new-email"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={startAddingNew}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              data-testid="button-add-email"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar email
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
