import { useState, useRef, useCallback, useEffect } from "react";
import type { ClientMeeting } from "@/types/client";
import { useClients } from "@/contexts/ClientsContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export interface UseInlineClientMeetingsOptions {
  clientId: string;
  clientName: string;
  defaultConsultant?: string;
}

export function useInlineClientMeetings(options: UseInlineClientMeetingsOptions) {
  const { clientId, clientName, defaultConsultant } = options;
  const { addClientMeeting } = useClients();
  const { data: currentUserData } = useCurrentUser();
  const defaultConsultantName = defaultConsultant || currentUserData?.user?.name || "Rafael Bernardino Silveira";

  const [isAddingMeeting, setIsAddingMeeting] = useState(false);
  const [newMeetingName, setNewMeetingName] = useState("");
  const [newMeetingType, setNewMeetingType] = useState("Reunião Mensal");
  const [newMeetingDate, setNewMeetingDate] = useState<Date>(new Date());
  const [newMeetingStatus, setNewMeetingStatus] = useState<"Agendada" | "Realizada" | "Cancelada">("Agendada");
  const [newMeetingConsultant, setNewMeetingConsultant] = useState<string>(defaultConsultantName);
  
  const [newTypePopoverOpen, setNewTypePopoverOpen] = useState(false);
  const [newStatusPopoverOpen, setNewStatusPopoverOpen] = useState(false);
  const [newDatePopoverOpen, setNewDatePopoverOpen] = useState(false);
  const [newConsultantPopoverOpen, setNewConsultantPopoverOpen] = useState(false);

  const isSavingRef = useRef(false);
  const newMeetingRowElementRef = useRef<HTMLTableRowElement | null>(null);
  const newMeetingNameRef = useRef(newMeetingName);

  useEffect(() => {
    newMeetingNameRef.current = newMeetingName;
  }, [newMeetingName]);

  useEffect(() => {
    if (isAddingMeeting && defaultConsultantName && !newMeetingConsultant) {
      setNewMeetingConsultant(defaultConsultantName);
    }
  }, [isAddingMeeting, defaultConsultantName, newMeetingConsultant]);

  const setNewMeetingRowRef = useCallback((element: HTMLTableRowElement | null) => {
    newMeetingRowElementRef.current = element;
  }, []);

  const resetNewMeetingForm = useCallback(() => {
    setNewMeetingName("");
    setNewMeetingType("Reunião Mensal");
    setNewMeetingDate(new Date());
    setNewMeetingStatus("Agendada");
    setNewMeetingConsultant(defaultConsultantName);
    setNewTypePopoverOpen(false);
    setNewStatusPopoverOpen(false);
    setNewDatePopoverOpen(false);
    setNewConsultantPopoverOpen(false);
  }, [defaultConsultantName]);

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
      consultant: newMeetingConsultant,
    });

    resetNewMeetingForm();
    setIsAddingMeeting(false);

    setTimeout(() => {
      isSavingRef.current = false;
    }, 100);
  }, [newMeetingType, newMeetingStatus, newMeetingDate, newMeetingConsultant, clientId, addClientMeeting, resetNewMeetingForm]);

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

  const handleNewConsultantChange = useCallback((consultant: string) => {
    setNewMeetingConsultant(consultant);
    setNewConsultantPopoverOpen(false);
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
    newMeetingConsultant,
    setNewMeetingConsultant,

    newTypePopoverOpen,
    setNewTypePopoverOpen,
    newStatusPopoverOpen,
    setNewStatusPopoverOpen,
    newDatePopoverOpen,
    setNewDatePopoverOpen,
    newConsultantPopoverOpen,
    setNewConsultantPopoverOpen,

    setNewMeetingRowRef,

    handleStartAddMeeting,
    handleCancelAddMeeting,
    handleSaveMeeting,
    handleKeyDown,
    handleNewTypeChange,
    handleNewStatusChange,
    handleNewDateChange,
    handleNewConsultantChange,
  };
}



