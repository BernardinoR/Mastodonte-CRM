import { useState, useRef, useCallback } from "react";
import type { WhatsAppGroup } from "@/types/client";

export type WhatsAppGroupStatus = "Ativo" | "Inativo";

export interface UseWhatsAppGroupsOptions {
  onAddGroup?: (group: Omit<WhatsAppGroup, 'id'>) => void;
  onUpdateGroup?: (groupId: string, updates: Partial<Omit<WhatsAppGroup, 'id'>>) => void;
  onDeleteGroup?: (groupId: string) => void;
  isAddingExternal?: boolean;
  onCancelAddExternal?: () => void;
}

export interface EditingField {
  groupId: string;
  field: 'name' | 'purpose' | 'link';
}

export function useWhatsAppGroups(options: UseWhatsAppGroupsOptions) {
  const {
    onAddGroup,
    onUpdateGroup,
    onDeleteGroup,
    isAddingExternal = false,
    onCancelAddExternal,
  } = options;

  const [isAddingInternal, setIsAddingInternal] = useState(false);
  const isAddingGroup = isAddingExternal || isAddingInternal;

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupPurpose, setNewGroupPurpose] = useState("");
  const [newGroupLink, setNewGroupLink] = useState("");
  const [newGroupStatus, setNewGroupStatus] = useState<WhatsAppGroupStatus>("Ativo");

  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [editValue, setEditValue] = useState("");

  const [datePopoverOpen, setDatePopoverOpen] = useState<string | null>(null);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState<string | null>(null);
  const [newStatusPopoverOpen, setNewStatusPopoverOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<{ groupId: string; groupName: string } | null>(null);

  const isSavingRef = useRef(false);
  const newGroupRowRef = useRef<HTMLTableRowElement>(null);
  const datePopoverRef = useRef<HTMLDivElement>(null);

  const resetNewGroupForm = useCallback(() => {
    setNewGroupName("");
    setNewGroupPurpose("");
    setNewGroupLink("");
    setNewGroupStatus("Ativo");
    setNewStatusPopoverOpen(false);
  }, []);

  const commitNewGroup = useCallback(() => {
    if (!newGroupName.trim()) return;
    if (isSavingRef.current) return;

    isSavingRef.current = true;

    const newGroup: Omit<WhatsAppGroup, 'id'> = {
      name: newGroupName.trim(),
      purpose: newGroupPurpose.trim(),
      link: newGroupLink.trim() || null,
      status: newGroupStatus,
      createdAt: new Date(),
    };

    onAddGroup?.(newGroup);
    resetNewGroupForm();
    setIsAddingInternal(false);
    onCancelAddExternal?.();

    setTimeout(() => {
      isSavingRef.current = false;
    }, 100);
  }, [newGroupName, newGroupPurpose, newGroupLink, newGroupStatus, onAddGroup, resetNewGroupForm, onCancelAddExternal]);

  const handleStartAddGroup = useCallback(() => {
    setIsAddingInternal(true);
  }, []);

  const handleCancelAddGroup = useCallback(() => {
    setIsAddingInternal(false);
    onCancelAddExternal?.();
    resetNewGroupForm();
  }, [onCancelAddExternal, resetNewGroupForm]);

  const handleSaveGroup = useCallback(() => {
    commitNewGroup();
  }, [commitNewGroup]);

  const startEditing = useCallback((groupId: string, field: 'name' | 'purpose' | 'link', currentValue: string) => {
    setEditingField({ groupId, field });
    setEditValue(currentValue);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingField(null);
    setEditValue("");
  }, []);

  const saveEditing = useCallback(() => {
    if (!editingField) return;

    const { groupId, field } = editingField;
    const value = editValue.trim();

    if (field === 'name' && !value) {
      cancelEditing();
      return;
    }

    if (field === 'link') {
      onUpdateGroup?.(groupId, { link: value || null });
    } else {
      onUpdateGroup?.(groupId, { [field]: value });
    }

    cancelEditing();
  }, [editingField, editValue, onUpdateGroup, cancelEditing]);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  }, [saveEditing, cancelEditing]);

  const isEditing = useCallback((groupId: string, field: string) => {
    return editingField?.groupId === groupId && editingField?.field === field;
  }, [editingField]);

  const handleDateChange = useCallback((groupId: string, date: Date | undefined) => {
    if (date) {
      onUpdateGroup?.(groupId, { createdAt: date });
      setDatePopoverOpen(null);
    }
  }, [onUpdateGroup]);

  const handleStatusChange = useCallback((groupId: string, status: WhatsAppGroupStatus) => {
    onUpdateGroup?.(groupId, { status });
    setStatusPopoverOpen(null);
  }, [onUpdateGroup]);

  const handleDeleteClick = useCallback((groupId: string, groupName: string) => {
    setDeleteConfirmOpen({ groupId, groupName });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmOpen) {
      onDeleteGroup?.(deleteConfirmOpen.groupId);
      setDeleteConfirmOpen(null);
    }
  }, [deleteConfirmOpen, onDeleteGroup]);

  const handleInteractOutside = useCallback((e: any) => {
    const originalTarget = e.detail?.originalEvent?.target as HTMLElement | null;
    const target = originalTarget || (e.target as HTMLElement);
    if (datePopoverRef.current?.contains(target) || target?.closest('.rdp')) {
      e.preventDefault();
    }
  }, []);

  const handleNewGroupRowBlur = useCallback((e: React.FocusEvent) => {
    if (newStatusPopoverOpen) return;
    
    const relatedTarget = e.relatedTarget as Node | null;
    const isInsideRow = newGroupRowRef.current?.contains(relatedTarget);
    const isInsidePopover = relatedTarget?.parentElement?.closest('[data-radix-popper-content-wrapper]');
    
    if (!isInsideRow && !isInsidePopover) {
      setTimeout(() => {
        if (newGroupName.trim() && !isSavingRef.current) {
          commitNewGroup();
        }
      }, 150);
    }
  }, [newStatusPopoverOpen, newGroupName, commitNewGroup]);

  const handleNewStatusPopoverChange = useCallback((open: boolean) => {
    setNewStatusPopoverOpen(open);
  }, []);

  return {
    isAddingGroup,
    newGroupName,
    setNewGroupName,
    newGroupPurpose,
    setNewGroupPurpose,
    newGroupLink,
    setNewGroupLink,
    newGroupStatus,
    setNewGroupStatus,
    
    editingField,
    editValue,
    setEditValue,
    
    datePopoverOpen,
    setDatePopoverOpen,
    statusPopoverOpen,
    setStatusPopoverOpen,
    newStatusPopoverOpen,
    setNewStatusPopoverOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    
    newGroupRowRef,
    datePopoverRef,
    
    handleStartAddGroup,
    handleCancelAddGroup,
    handleSaveGroup,
    startEditing,
    cancelEditing,
    saveEditing,
    handleEditKeyDown,
    isEditing,
    handleDateChange,
    handleStatusChange,
    handleDeleteClick,
    handleConfirmDelete,
    handleInteractOutside,
    handleNewGroupRowBlur,
    handleNewStatusPopoverChange,
  };
}
