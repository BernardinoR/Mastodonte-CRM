import { useState, useRef, useCallback } from "react";
import { useClients } from "@/contexts/ClientsContext";

export function useInlineMeetingEdit() {
  const { updateClientMeeting, deleteClientMeeting } = useClients();

  const [typePopoverOpen, setTypePopoverOpen] = useState<string | null>(null);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState<string | null>(null);
  const [datePopoverOpen, setDatePopoverOpen] = useState<string | null>(null);
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState<string | null>(null);

  const datePopoverRef = useRef<HTMLDivElement>(null);

  const handleTypeChange = useCallback((clientId: string, meetingId: string, type: string) => {
    updateClientMeeting(clientId, meetingId, { type });
    setTypePopoverOpen(null);
  }, [updateClientMeeting]);

  const handleStatusChange = useCallback((clientId: string, meetingId: string, status: "Agendada" | "Realizada" | "Cancelada") => {
    updateClientMeeting(clientId, meetingId, { status });
    setStatusPopoverOpen(null);
  }, [updateClientMeeting]);

  const handleDateChange = useCallback((clientId: string, meetingId: string, date: Date | undefined) => {
    if (date) {
      updateClientMeeting(clientId, meetingId, { date });
      setDatePopoverOpen(null);
    }
  }, [updateClientMeeting]);

  const handleAddAssignee = useCallback((clientId: string, meetingId: string, currentAssignees: string[], assignee: string) => {
    if (!currentAssignees.includes(assignee)) {
      updateClientMeeting(clientId, meetingId, { assignees: [...currentAssignees, assignee] });
    }
  }, [updateClientMeeting]);

  const handleRemoveAssignee = useCallback((clientId: string, meetingId: string, currentAssignees: string[], assignee: string) => {
    updateClientMeeting(clientId, meetingId, { assignees: currentAssignees.filter(a => a !== assignee) });
  }, [updateClientMeeting]);

  const handleInteractOutside = useCallback((e: CustomEvent<{ originalEvent?: Event }>) => {
    const originalTarget = e.detail?.originalEvent?.target as HTMLElement | null;
    const target = originalTarget || (e.target as HTMLElement);
    if (datePopoverRef.current?.contains(target) || target?.closest('.rdp')) {
      e.preventDefault();
    }
  }, []);

  return {
    typePopoverOpen,
    setTypePopoverOpen,
    statusPopoverOpen,
    setStatusPopoverOpen,
    datePopoverOpen,
    setDatePopoverOpen,
    assigneePopoverOpen,
    setAssigneePopoverOpen,
    datePopoverRef,

    handleTypeChange,
    handleStatusChange,
    handleDateChange,
    handleAddAssignee,
    handleRemoveAssignee,
    handleInteractOutside,
  };
}
