import { useCallback, useMemo } from "react";
import { useClients } from "@features/clients";
import { useInlineFieldEdit } from "@/shared/hooks/useInlineFieldEdit";

export function useInlineMeetingEdit(clientId?: string) {
  const { updateClientMeeting, deleteClientMeeting } = useClients();

  // Configuração dos campos
  const fields = useMemo(() => [
    { name: "type" as const },
    { name: "status" as const },
    { name: "date" as const },
    { name: "assignee" as const },
  ], []);

  // Adapter para o hook genérico - extrai clientId do meetingId composto
  // Formato: "clientId:meetingId"
  const handleUpdate = useCallback((compositeId: string, updates: Record<string, any>) => {
    const [cId, mId] = compositeId.split(":");
    updateClientMeeting(cId, mId, updates);
  }, [updateClientMeeting]);

  const handleDelete = useCallback((compositeId: string) => {
    const [cId, mId] = compositeId.split(":");
    deleteClientMeeting(cId, mId);
  }, [deleteClientMeeting]);

  // Hook genérico
  const {
    popoverStates,
    openPopover,
    closePopover,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    datePopoverRef,
    handleFieldChange,
    handleDateChange: handleGenericDateChange,
    handleAddAssignee: handleGenericAddAssignee,
    handleRemoveAssignee: handleGenericRemoveAssignee,
    handleDeleteClick: handleGenericDeleteClick,
    handleConfirmDelete: handleGenericConfirmDelete,
    handleInteractOutside,
  } = useInlineFieldEdit({
    fields,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    hasDateField: true,
    deleteConfirmKeys: { id: "meetingId", title: "meetingName" },
  });

  // Handlers específicos mantendo a API original (com clientId, meetingId separados)
  const handleTypeChange = useCallback((clientId: string, meetingId: string, type: string) => {
    handleFieldChange("type", `${clientId}:${meetingId}`, type);
  }, [handleFieldChange]);

  const handleStatusChange = useCallback((clientId: string, meetingId: string, status: "Agendada" | "Realizada" | "Cancelada") => {
    handleFieldChange("status", `${clientId}:${meetingId}`, status);
  }, [handleFieldChange]);

  const handleDateChange = useCallback((clientId: string, meetingId: string, date: Date | undefined) => {
    handleGenericDateChange("date", `${clientId}:${meetingId}`, date);
  }, [handleGenericDateChange]);

  const handleAddAssignee = useCallback((clientId: string, meetingId: string, currentAssignees: string[], assignee: string) => {
    handleGenericAddAssignee(`${clientId}:${meetingId}`, currentAssignees, assignee);
  }, [handleGenericAddAssignee]);

  const handleRemoveAssignee = useCallback((clientId: string, meetingId: string, currentAssignees: string[], assignee: string) => {
    handleGenericRemoveAssignee(`${clientId}:${meetingId}`, currentAssignees, assignee);
  }, [handleGenericRemoveAssignee]);

  const handleDeleteClick = useCallback((meetingId: string, meetingName: string) => {
    handleGenericDeleteClick(meetingId, meetingName);
  }, [handleGenericDeleteClick]);

  const handleConfirmDelete = useCallback(() => {
    if (!clientId || !deleteConfirmOpen) return;
    // Usa clientId do parâmetro do hook + meetingId do estado
    deleteClientMeeting(clientId, deleteConfirmOpen.id);
    setDeleteConfirmOpen(null);
  }, [clientId, deleteConfirmOpen, deleteClientMeeting, setDeleteConfirmOpen]);

  // Adaptadores para manter API original com setters individuais
  const setTypePopoverOpen = useCallback((value: string | null) => {
    if (value === null) closePopover("type");
    else openPopover("type", value);
  }, [openPopover, closePopover]);

  const setStatusPopoverOpen = useCallback((value: string | null) => {
    if (value === null) closePopover("status");
    else openPopover("status", value);
  }, [openPopover, closePopover]);

  const setDatePopoverOpen = useCallback((value: string | null) => {
    if (value === null) closePopover("date");
    else openPopover("date", value);
  }, [openPopover, closePopover]);

  const setAssigneePopoverOpen = useCallback((value: string | null) => {
    if (value === null) closePopover("assignee");
    else openPopover("assignee", value);
  }, [openPopover, closePopover]);

  return {
    // Estados - mantendo API original
    typePopoverOpen: popoverStates.type,
    setTypePopoverOpen,
    statusPopoverOpen: popoverStates.status,
    setStatusPopoverOpen,
    datePopoverOpen: popoverStates.date,
    setDatePopoverOpen,
    assigneePopoverOpen: popoverStates.assignee,
    setAssigneePopoverOpen,
    deleteConfirmOpen: deleteConfirmOpen ? {
      meetingId: deleteConfirmOpen.id,
      meetingName: deleteConfirmOpen.title,
    } : null,
    setDeleteConfirmOpen: (value: { meetingId: string; meetingName: string } | null) => {
      setDeleteConfirmOpen(value ? { id: value.meetingId, title: value.meetingName } : null);
    },
    datePopoverRef,

    // Handlers - mantendo API original
    handleTypeChange,
    handleStatusChange,
    handleDateChange,
    handleAddAssignee,
    handleRemoveAssignee,
    handleDeleteClick,
    handleConfirmDelete,
    handleInteractOutside,
  };
}
