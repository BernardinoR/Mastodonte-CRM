import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Mail, Plus, Circle, X, Check, CheckCircle2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";

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
        <div className="flex cursor-pointer flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            Email
            {emails.length > 1 && (
              <span className="rounded bg-[#333333] px-1.5 py-0.5 text-[10px]">
                +{emails.length - 1}
              </span>
            )}
          </span>
          <span
            className="-mx-1.5 -my-0.5 rounded-md px-1.5 py-0.5 text-sm font-medium text-foreground transition-colors hover:bg-[#2c2c2c]"
            data-testid="text-client-email"
          >
            {primaryEmail}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 border-[#333333] bg-[#252525] p-0" align="start">
        <div className="border-b border-[#333333] p-3">
          <h4 className="text-sm font-medium text-foreground">Emails do Cliente</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Clique para definir o email principal
          </p>
        </div>

        <div className="max-h-[200px] overflow-y-auto">
          {emails.map((email, index) => (
            <div key={index} className="group flex items-center gap-2 px-3 py-2 hover:bg-[#2c2c2c]">
              <button
                type="button"
                onClick={() => onSetPrimaryEmail(index)}
                className="rounded p-1 transition-colors"
                title={index === primaryEmailIndex ? "Email principal" : "Definir como principal"}
                data-testid={`button-set-primary-email-${index}`}
              >
                {index === primaryEmailIndex ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500/70" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/60" />
                )}
              </button>

              {editingIndex === index ? (
                <div className="flex flex-1 items-center gap-1">
                  <input
                    ref={inputRef}
                    type="email"
                    value={draftEmail}
                    onChange={(e) => setDraftEmail(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    onBlur={commitEdit}
                    className="flex-1 border-b border-[#2eaadc] bg-transparent text-sm text-foreground outline-none"
                    data-testid={`input-edit-email-${index}`}
                  />
                  <button
                    type="button"
                    onClick={commitEdit}
                    className="rounded p-1 text-emerald-400 hover:bg-[#333333]"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <span
                  className="flex-1 cursor-pointer truncate text-sm text-foreground"
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
                  className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-[#333333] hover:text-red-400 group-hover:opacity-100"
                  title="Remover email"
                  data-testid={`button-remove-email-${index}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-[#333333] p-2">
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
                className="flex-1 border-b border-[#2eaadc] bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                data-testid="input-new-email"
              />
              <button
                type="button"
                onClick={commitNewEmail}
                className="rounded p-1 text-emerald-400 hover:bg-[#333333]"
                data-testid="button-confirm-new-email"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={cancelAddingNew}
                className="rounded p-1 text-muted-foreground hover:bg-[#333333]"
                data-testid="button-cancel-new-email"
              >
                <X className="h-4 w-4" />
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
              <Plus className="mr-2 h-4 w-4" />
              Adicionar email
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
