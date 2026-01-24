import { useState, useCallback } from "react";

/**
 * Hook genérico para edição inline de campos de texto
 * 
 * @example
 * ```tsx
 * const inlineEdit = useInlineEdit({
 *   onSave: (id, name) => updateMeeting(id, { name }),
 *   getId: (meeting) => meeting.id,
 *   getValue: (meeting) => meeting.name,
 * });
 * 
 * // No componente
 * {inlineEdit.isEditing(item.id) ? (
 *   <input
 *     value={inlineEdit.editingValue}
 *     onChange={(e) => inlineEdit.setEditingValue(e.target.value)}
 *     onBlur={inlineEdit.save}
 *     onKeyDown={inlineEdit.handleKeyDown}
 *   />
 * ) : (
 *   <span onClick={(e) => inlineEdit.startEdit(item, e)}>{item.name}</span>
 * )}
 * ```
 */
export interface UseInlineEditOptions<T> {
  /** Callback chamado ao salvar a edição */
  onSave: (id: string, value: string) => void;
  /** Função para extrair o ID do item */
  getId: (item: T) => string;
  /** Função para extrair o valor inicial do item */
  getValue: (item: T) => string;
  /** Callback opcional chamado após cancelar a edição */
  onCancel?: () => void;
}

export interface UseInlineEditReturn<T> {
  /** ID do item sendo editado, ou null se não estiver editando */
  editingId: string | null;
  /** Valor atual do campo de edição */
  editingValue: string;
  /** Setter para o valor de edição */
  setEditingValue: (value: string) => void;
  /** Inicia a edição de um item */
  startEdit: (item: T, e?: React.MouseEvent) => void;
  /** Salva a edição atual */
  save: () => void;
  /** Cancela a edição atual */
  cancel: () => void;
  /** Handler para eventos de teclado (Enter para salvar, Escape para cancelar) */
  handleKeyDown: (e: React.KeyboardEvent) => void;
  /** Verifica se um item específico está sendo editado */
  isEditing: (id: string) => boolean;
}

export function useInlineEdit<T>({
  onSave,
  getId,
  getValue,
  onCancel,
}: UseInlineEditOptions<T>): UseInlineEditReturn<T> {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const startEdit = useCallback((item: T, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEditingId(getId(item));
    setEditingValue(getValue(item));
  }, [getId, getValue]);

  const save = useCallback(() => {
    if (editingId && editingValue.trim()) {
      onSave(editingId, editingValue.trim());
    }
    setEditingId(null);
    setEditingValue("");
  }, [editingId, editingValue, onSave]);

  const cancel = useCallback(() => {
    setEditingId(null);
    setEditingValue("");
    onCancel?.();
  }, [onCancel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  }, [save, cancel]);

  const isEditing = useCallback((id: string) => editingId === id, [editingId]);

  return {
    editingId,
    editingValue,
    setEditingValue,
    startEdit,
    save,
    cancel,
    handleKeyDown,
    isEditing,
  };
}
