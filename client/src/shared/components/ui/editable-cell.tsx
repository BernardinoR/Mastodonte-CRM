import { Pencil } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/**
 * Componente genérico para células de tabela editáveis
 *
 * @example
 * ```tsx
 * <EditableCell
 *   value={meeting.name}
 *   isEditing={inlineEdit.isEditing(meeting.id)}
 *   editValue={inlineEdit.editingValue}
 *   onEditValueChange={inlineEdit.setEditingValue}
 *   onStartEdit={(e) => inlineEdit.startEdit(meeting, e)}
 *   onSave={inlineEdit.save}
 *   onKeyDown={inlineEdit.handleKeyDown}
 *   icon={<FileText className="w-4 h-4 text-muted-foreground" />}
 * />
 * ```
 */
export interface EditableCellProps {
  /** Valor atual a ser exibido quando não está editando */
  value: string;
  /** Se true, mostra o input de edição */
  isEditing: boolean;
  /** Valor do campo de edição */
  editValue: string;
  /** Callback para atualizar o valor de edição */
  onEditValueChange: (value: string) => void;
  /** Callback para iniciar a edição */
  onStartEdit: (e: React.MouseEvent) => void;
  /** Callback para salvar a edição (chamado no blur) */
  onSave: () => void;
  /** Handler para eventos de teclado */
  onKeyDown: (e: React.KeyboardEvent) => void;
  /** Ícone opcional a exibir antes do valor */
  icon?: React.ReactNode;
  /** Classes CSS adicionais */
  className?: string;
  /** Placeholder para o input */
  placeholder?: string;
  /** Data-testid para o input */
  inputTestId?: string;
  /** Data-testid para o botão de edição */
  buttonTestId?: string;
}

export function EditableCell({
  value,
  isEditing,
  editValue,
  onEditValueChange,
  onStartEdit,
  onSave,
  onKeyDown,
  icon,
  className,
  placeholder = "Digite aqui...",
  inputTestId,
  buttonTestId,
}: EditableCellProps) {
  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {icon}
        <input
          type="text"
          value={editValue}
          onChange={(e) => onEditValueChange(e.target.value)}
          onBlur={onSave}
          onKeyDown={onKeyDown}
          onClick={(e) => e.stopPropagation()}
          autoFocus
          placeholder={placeholder}
          className="w-full border-b border-[#2eaadc] bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
          data-testid={inputTestId}
        />
      </div>
    );
  }

  return (
    <div className={cn("group/cell flex items-center gap-2", className)}>
      {icon}
      <span className="font-medium text-foreground">{value}</span>
      <button
        onClick={onStartEdit}
        className="rounded p-1 opacity-0 transition-all hover:bg-[#3a3a3a] group-hover/cell:opacity-100"
        data-testid={buttonTestId}
      >
        <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
      </button>
    </div>
  );
}
