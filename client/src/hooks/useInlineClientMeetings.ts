import { useState, useRef, useCallback, useEffect } from "react";
import type { ClientMeeting } from "@/types/client";
import { useClients } from "@/contexts/ClientsContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { MEETING_TYPE_OPTIONS, MEETING_STATUS_OPTIONS, type MeetingStatus } from "@shared/config/meetingConfig";

export interface UseInlineClientMeetingsOptions {
  clientId: string;
  clientName: string;
  defaultAssignee?: string;
}

export function useInlineClientMeetings(options: UseInlineClientMeetingsOptions) {
  const { clientId, clientName, defaultAssignee } = options;
  const { addClientMeeting } = useClients();
  const { data: currentUserData } = useCurrentUser();
  const defaultAssigneeName = defaultAssignee || currentUserData?.user?.name || "Rafael Bernardino Silveira";

  const [isAddingMeeting, setIsAddingMeeting] = useState(false);
  const [newMeetingName, setNewMeetingName] = useState("");
  const [newMeetingType, setNewMeetingType] = useState(MEETING_TYPE_OPTIONS[0]);
  const [newMeetingDate, setNewMeetingDate] = useState<Date>(new Date());
  const [newMeetingStatus, setNewMeetingStatus] = useState<MeetingStatus>(MEETING_STATUS_OPTIONS[0]);
  const [newMeetingAssignees, setNewMeetingAssignees] = useState<string[]>([]);
  
  const [newTypePopoverOpen, setNewTypePopoverOpen] = useState(false);
  const [newStatusPopoverOpen, setNewStatusPopoverOpen] = useState(false);
  const [newDatePopoverOpen, setNewDatePopoverOpen] = useState(false);
  const [newAssigneePopoverOpen, setNewAssigneePopoverOpen] = useState(false);

  const isSavingRef = useRef(false);
  const newMeetingRowElementRef = useRef<HTMLTableRowElement | null>(null);
  const newMeetingNameRef = useRef(newMeetingName);
  const newDatePopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    newMeetingNameRef.current = newMeetingName;
  }, [newMeetingName]);

  useEffect(() => {
    if (isAddingMeeting && defaultAssigneeName && newMeetingAssignees.length === 0) {
      setNewMeetingAssignees([defaultAssigneeName]);
    }
  }, [isAddingMeeting, defaultAssigneeName, newMeetingAssignees.length]);

  const setNewMeetingRowRef = useCallback((element: HTMLTableRowElement | null) => {
    newMeetingRowElementRef.current = element;
  }, []);

  const resetNewMeetingForm = useCallback(() => {
    setNewMeetingName("");
    setNewMeetingType(MEETING_TYPE_OPTIONS[0]);
    setNewMeetingDate(new Date());
    setNewMeetingStatus(MEETING_STATUS_OPTIONS[0]);
    setNewMeetingAssignees(defaultAssigneeName ? [defaultAssigneeName] : []);
    setNewTypePopoverOpen(false);
    setNewStatusPopoverOpen(false);
    setNewDatePopoverOpen(false);
    setNewAssigneePopoverOpen(false);
  }, [defaultAssigneeName]);

  const commitNewMeeting = useCallback(() => {
    const name = newMeetingNameRef.current;
    if (!name.trim()) return;
    if (isSavingRef.current) return;

    isSavingRef.current = true;

    addClientMeeting(clientId, {
      name: name.trim(),
      type: newMeetingType,
      status: newMeetingStatus,
      date: newMeetingDate,
      assignees: newMeetingAssignees,
    });

    resetNewMeetingForm();
    setIsAddingMeeting(false);

    setTimeout(() => {
      isSavingRef.current = false;
    }, 100);
  }, [newMeetingType, newMeetingStatus, newMeetingDate, newMeetingAssignees, clientId, addClientMeeting, resetNewMeetingForm]);

  const handleNewTypeChange = useCallback((type: string) => {
    setNewMeetingType(type);
    setNewTypePopoverOpen(false);
  }, []);

  const handleNewStatusChange = useCallback((status: "Agendada" | "Realizada" | "Cancelada") => {
    setNewMeetingStatus(status);
    setNewStatusPopoverOpen(false);
  }, []);

  const handleNewDateChange = useCallback((date: Date) => {
    setNewMeetingDate(date);
    setNewDatePopoverOpen(false);
  }, []);

  const handleNewDatePopoverInteractOutside = useCallback((e: CustomEvent<{ originalEvent?: Event }>) => {
    const originalTarget = e.detail?.originalEvent?.target as HTMLElement | null;
    const target = originalTarget || (e.target as HTMLElement);
    if (newDatePopoverRef.current?.contains(target) || target?.closest('.rdp')) {
      e.preventDefault();
    }
  }, []);

  const handleNewAddAssignee = useCallback((assignee: string) => {
    setNewMeetingAssignees(prev => prev.includes(assignee) ? prev : [...prev, assignee]);
  }, []);

  const handleNewRemoveAssignee = useCallback((assignee: string) => {
    setNewMeetingAssignees(prev => prev.filter(a => a !== assignee));
  }, []);

  const handleStartAddMeeting = useCallback(() => {
    resetNewMeetingForm();
    setIsAddingMeeting(true);
  }, [resetNewMeetingForm]);

  const handleCancelAddMeeting = useCallback(() => {
    setIsAddingMeeting(false);
    resetNewMeetingForm();
  }, [resetNewMeetingForm]);

  const handleSaveMeeting = useCallback(() => {
    commitNewMeeting();
  }, [commitNewMeeting]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newMeetingNameRef.current.trim()) {
      e.preventDefault();
      commitNewMeeting();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelAddMeeting();
    }
  }, [commitNewMeeting, handleCancelAddMeeting]);

  const handleNewMeetingRowBlur = useCallback((e: React.FocusEvent) => {
    // Verificar se algum popover está aberto
    if (newTypePopoverOpen || newStatusPopoverOpen || 
        newDatePopoverOpen || newAssigneePopoverOpen) {
      return;
    }
    
    const relatedTarget = e.relatedTarget as Node | null;
    const isInsideRow = newMeetingRowElementRef.current?.contains(relatedTarget);
    const isInsidePopover = relatedTarget?.parentElement?.closest('[data-radix-popper-content-wrapper]');
    
    if (!isInsideRow && !isInsidePopover) {
      setTimeout(() => {
        // Usar ref em vez de state para evitar dependências desnecessárias
        if (newMeetingNameRef.current.trim() && !isSavingRef.current) {
          commitNewMeeting();
        }
      }, 150);
    }
  }, [newTypePopoverOpen, newStatusPopoverOpen, newDatePopoverOpen, 
      newAssigneePopoverOpen, commitNewMeeting]);

  return {
    isAddingMeeting,
    newMeetingName,
    setNewMeetingName,
    newMeetingType,
    setNewMeetingType,
    newMeetingDate,
    setNewMeetingDate,
    newMeetingStatus,
    setNewMeetingStatus,
    newMeetingAssignees,
    setNewMeetingAssignees,

    newTypePopoverOpen,
    setNewTypePopoverOpen,
    newStatusPopoverOpen,
    setNewStatusPopoverOpen,
    newDatePopoverOpen,
    setNewDatePopoverOpen,
    newAssigneePopoverOpen,
    setNewAssigneePopoverOpen,

    setNewMeetingRowRef,
    newDatePopoverRef,

    handleStartAddMeeting,
    handleCancelAddMeeting,
    handleSaveMeeting,
    handleKeyDown,
    handleNewTypeChange,
    handleNewStatusChange,
    handleNewDateChange,
    handleNewAddAssignee,
    handleNewRemoveAssignee,
    handleNewDatePopoverInteractOutside,
    handleNewMeetingRowBlur,
  };
}
