import { useState, useRef, useCallback, useMemo } from "react";

/**
 * Cria um adapter para popover que converte a API genérica (openPopover/closePopover)
 * para a API de setter individual (setValue(value | null))
 *
 * Elimina duplicação de:
 * const setStatusPopoverOpen = useCallback((value: string | null) => {
 *   if (value === null) closePopover("status");
 *   else openPopover("status", value);
 * }, [openPopover, closePopover]);
 */
export function createPopoverAdapter<TFieldType extends string>(
  fieldName: TFieldType,
  openPopover: (field: TFieldType, id: string) => void,
  closePopover: (field: TFieldType) => void
): (value: string | null) => void {
  return (value: string | null) => {
    if (value === null) closePopover(fieldName);
    else openPopover(fieldName, value);
  };
}

/**
 * Configuração para um campo editável inline
 */
export interface FieldConfig<TFieldType extends string = string> {
  /** Nome do campo (ex: "status", "priority", "type") */
  name: TFieldType;
  /** Nome da propriedade no objeto de update (pode ser diferente do name) */
  updateKey?: string;
}

/**
 * Configuração do hook useInlineFieldEdit
 */
export interface UseInlineFieldEditConfig<TFieldType extends string = string> {
  /** Lista de campos que terão popovers de edição */
  fields: FieldConfig<TFieldType>[];

  /** Callback chamado quando um campo é atualizado */
  onUpdate: (entityId: string, updates: Record<string, any>) => void;

  /** Callback chamado quando a entidade é deletada (opcional) */
  onDelete?: (entityId: string) => void;

  /** Se true, inclui ref para date popover e lógica de interact outside */
  hasDateField?: boolean;

  /** Nome das propriedades do objeto de delete confirmation */
  deleteConfirmKeys?: {
    id: string;
    title: string;
  };
}

/**
 * Estado de delete confirmation genérico
 */
export interface DeleteConfirmState {
  id: string;
  title: string;
}

/**
 * Hook genérico para edição inline com popovers
 * Elimina duplicação entre useInlineTaskEdit e useInlineMeetingEdit
 */
export function useInlineFieldEdit<TFieldType extends string = string>(
  config: UseInlineFieldEditConfig<TFieldType>
) {
  const { fields, onUpdate, onDelete, hasDateField = false, deleteConfirmKeys = { id: "id", title: "title" } } = config;

  // Estados de popovers - um para cada campo
  const [popoverStates, setPopoverStates] = useState<Record<TFieldType, string | null>>(
    fields.reduce((acc, field) => {
      acc[field.name as TFieldType] = null;
      return acc;
    }, {} as Record<TFieldType, string | null>)
  );

  // Estado de confirmação de delete
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<DeleteConfirmState | null>(null);

  // Ref para date popover (se necessário)
  const datePopoverRef = hasDateField ? useRef<HTMLDivElement>(null) : null;

  /**
   * Abre um popover específico para uma entidade
   */
  const openPopover = useCallback((fieldName: TFieldType, entityId: string) => {
    setPopoverStates(prev => ({ ...prev, [fieldName]: entityId }));
  }, []);

  /**
   * Fecha um popover específico
   */
  const closePopover = useCallback((fieldName: TFieldType) => {
    setPopoverStates(prev => ({ ...prev, [fieldName]: null }));
  }, []);

  /**
   * Handler genérico para mudança de campo simples
   */
  const handleFieldChange = useCallback((
    fieldName: TFieldType,
    entityId: string,
    value: any
  ) => {
    const field = fields.find(f => f.name === fieldName);
    const updateKey = field?.updateKey || fieldName;

    onUpdate(entityId, { [updateKey]: value });
    closePopover(fieldName);
  }, [fields, onUpdate, closePopover]);

  /**
   * Handler para mudança de data
   */
  const handleDateChange = useCallback((
    fieldName: TFieldType,
    entityId: string,
    date: Date | undefined
  ) => {
    if (date) {
      handleFieldChange(fieldName, entityId, date);
    }
  }, [handleFieldChange]);

  /**
   * Handler para adicionar assignee
   */
  const handleAddAssignee = useCallback((
    entityId: string,
    currentAssignees: string[],
    assignee: string
  ) => {
    if (!currentAssignees.includes(assignee)) {
      onUpdate(entityId, { assignees: [...currentAssignees, assignee] });
    }
  }, [onUpdate]);

  /**
   * Handler para remover assignee
   */
  const handleRemoveAssignee = useCallback((
    entityId: string,
    currentAssignees: string[],
    assignee: string
  ) => {
    onUpdate(entityId, { assignees: currentAssignees.filter(a => a !== assignee) });
  }, [onUpdate]);

  /**
   * Handler para click em delete
   */
  const handleDeleteClick = useCallback((id: string, title: string) => {
    setDeleteConfirmOpen({ id, title });
  }, []);

  /**
   * Handler para confirmar delete
   */
  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmOpen && onDelete) {
      onDelete(deleteConfirmOpen.id);
      setDeleteConfirmOpen(null);
    }
  }, [deleteConfirmOpen, onDelete]);

  /**
   * Handler para interact outside do date popover
   */
  const handleInteractOutside = useCallback((e: CustomEvent<{ originalEvent?: Event }>) => {
    if (!hasDateField) return;

    const originalTarget = e.detail?.originalEvent?.target as HTMLElement | null;
    const target = originalTarget || (e.target as HTMLElement);
    if (datePopoverRef?.current?.contains(target) || target?.closest('.rdp')) {
      e.preventDefault();
    }
  }, [hasDateField]);

  return {
    // Estados de popovers individuais
    popoverStates,

    // Setters individuais para compatibilidade
    setPopoverOpen: setPopoverStates,

    // Funções de controle
    openPopover,
    closePopover,

    // Delete confirmation
    deleteConfirmOpen,
    setDeleteConfirmOpen,

    // Date popover ref
    datePopoverRef,

    // Handlers
    handleFieldChange,
    handleDateChange,
    handleAddAssignee,
    handleRemoveAssignee,
    handleDeleteClick,
    handleConfirmDelete,
    handleInteractOutside,
  };
}
