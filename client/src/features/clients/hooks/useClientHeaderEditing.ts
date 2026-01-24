import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type ChangeEvent } from "react";

export interface UseClientHeaderEditingOptions {
  clientId: string;
  clientName: string;
  clientCpf: string;
  clientPhone: string;
  onUpdateName: (id: string, name: string) => void | Promise<void>;
  onUpdateCpf: (id: string, cpf: string) => void | Promise<void>;
  onUpdatePhone: (id: string, phone: string) => void | Promise<void>;
}

export function useClientHeaderEditing(options: UseClientHeaderEditingOptions) {
  const { clientId, clientName, clientCpf, clientPhone, onUpdateName, onUpdateCpf, onUpdatePhone } = options;

  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [isEditingCpf, setIsEditingCpf] = useState(false);
  const [draftCpf, setDraftCpf] = useState("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [draftPhone, setDraftPhone] = useState("");
  const [isBulkEditing, setIsBulkEditing] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const cpfInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<number | null>(null);
  const cpfBlurTimeoutRef = useRef<number | null>(null);
  const phoneBlurTimeoutRef = useRef<number | null>(null);

  const formatCpf = useCallback((value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }, []);

  const formatPhone = useCallback((value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 0) return "";
    
    if (digits.startsWith("55") && digits.length >= 3) {
      const country = "+55";
      const rest = digits.slice(2);
      if (rest.length <= 2) return `${country} (${rest}`;
      const ddd = rest.slice(0, 2);
      const number = rest.slice(2);
      if (number.length <= 4) return `${country} (${ddd}) ${number}`;
      if (number.length <= 8) return `${country} (${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;
      return `${country} (${ddd}) ${number.slice(0, 5)}-${number.slice(5, 9)}`;
    }
    
    if (digits.length <= 2) return `+${digits}`;
    const countryCode = digits.slice(0, 2);
    const number = digits.slice(2);
    if (number.length <= 4) return `+${countryCode} ${number}`;
    if (number.length <= 8) return `+${countryCode} ${number.slice(0, 4)} ${number.slice(4)}`;
    return `+${countryCode} ${number.slice(0, 4)} ${number.slice(4, 8)} ${number.slice(8, 12)}`;
  }, []);

  const startEditingName = useCallback(() => {
    setDraftName(clientName);
    setIsEditingName(true);
  }, [clientName]);

  const commitNameChange = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== clientName) {
      onUpdateName(clientId, trimmed);
    }
    setIsEditingName(false);
  }, [draftName, clientName, clientId, onUpdateName]);

  const cancelEditingName = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsEditingName(false);
    setDraftName("");
  }, []);

  const startEditingCpf = useCallback(() => {
    setDraftCpf(clientCpf);
    setIsEditingCpf(true);
  }, [clientCpf]);

  const commitCpfChange = useCallback(() => {
    if (cpfBlurTimeoutRef.current) {
      clearTimeout(cpfBlurTimeoutRef.current);
      cpfBlurTimeoutRef.current = null;
    }
    
    const formatted = draftCpf.trim();
    if (formatted && formatted !== clientCpf) {
      onUpdateCpf(clientId, formatted);
    }
    setIsEditingCpf(false);
  }, [draftCpf, clientCpf, clientId, onUpdateCpf]);

  const cancelEditingCpf = useCallback(() => {
    if (cpfBlurTimeoutRef.current) {
      clearTimeout(cpfBlurTimeoutRef.current);
      cpfBlurTimeoutRef.current = null;
    }
    setIsEditingCpf(false);
    setDraftCpf("");
  }, []);

  const startEditingPhone = useCallback(() => {
    setDraftPhone(clientPhone);
    setIsEditingPhone(true);
  }, [clientPhone]);

  const commitPhoneChange = useCallback(() => {
    if (phoneBlurTimeoutRef.current) {
      clearTimeout(phoneBlurTimeoutRef.current);
      phoneBlurTimeoutRef.current = null;
    }
    
    const formatted = draftPhone.trim();
    if (formatted && formatted !== clientPhone) {
      onUpdatePhone(clientId, formatted);
    }
    setIsEditingPhone(false);
  }, [draftPhone, clientPhone, clientId, onUpdatePhone]);

  const cancelEditingPhone = useCallback(() => {
    if (phoneBlurTimeoutRef.current) {
      clearTimeout(phoneBlurTimeoutRef.current);
      phoneBlurTimeoutRef.current = null;
    }
    setIsEditingPhone(false);
    setDraftPhone("");
  }, []);

  const handleEditClient = useCallback(() => {
    setDraftName(clientName);
    setDraftCpf(clientCpf);
    setDraftPhone(clientPhone);
    setIsEditingName(true);
    setIsEditingCpf(true);
    setIsEditingPhone(true);
    setIsBulkEditing(true);
  }, [clientName, clientCpf, clientPhone]);

  const commitAllChanges = useCallback(() => {
    const trimmedName = draftName.trim();
    if (trimmedName && trimmedName !== clientName) {
      onUpdateName(clientId, trimmedName);
    }
    
    const trimmedCpf = draftCpf.trim();
    if (trimmedCpf && trimmedCpf !== clientCpf) {
      onUpdateCpf(clientId, trimmedCpf);
    }
    
    const trimmedPhone = draftPhone.trim();
    if (trimmedPhone && trimmedPhone !== clientPhone) {
      onUpdatePhone(clientId, trimmedPhone);
    }
    
    setIsEditingName(false);
    setIsEditingCpf(false);
    setIsEditingPhone(false);
    setIsBulkEditing(false);
  }, [draftName, draftCpf, draftPhone, clientName, clientCpf, clientPhone, clientId, onUpdateName, onUpdateCpf, onUpdatePhone]);

  const cancelAllChanges = useCallback(() => {
    setIsEditingName(false);
    setIsEditingCpf(false);
    setIsEditingPhone(false);
    setIsBulkEditing(false);
    setDraftName("");
    setDraftCpf("");
    setDraftPhone("");
  }, []);

  const handleNameKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isBulkEditing) {
        commitAllChanges();
      } else {
        commitNameChange();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (isBulkEditing) {
        cancelAllChanges();
      } else {
        cancelEditingName();
      }
    }
  }, [isBulkEditing, commitAllChanges, commitNameChange, cancelAllChanges, cancelEditingName]);

  const handleNameBlur = useCallback(() => {
    if (isBulkEditing) return;
    blurTimeoutRef.current = window.setTimeout(() => {
      commitNameChange();
    }, 150);
  }, [isBulkEditing, commitNameChange]);

  const handleCpfChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setDraftCpf(formatCpf(e.target.value));
  }, [formatCpf]);

  const handleCpfKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isBulkEditing) {
        commitAllChanges();
      } else {
        commitCpfChange();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (isBulkEditing) {
        cancelAllChanges();
      } else {
        cancelEditingCpf();
      }
    }
  }, [isBulkEditing, commitAllChanges, commitCpfChange, cancelAllChanges, cancelEditingCpf]);

  const handleCpfBlur = useCallback(() => {
    if (isBulkEditing) return;
    cpfBlurTimeoutRef.current = window.setTimeout(() => {
      commitCpfChange();
    }, 150);
  }, [isBulkEditing, commitCpfChange]);

  const handlePhoneChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setDraftPhone(formatPhone(e.target.value));
  }, [formatPhone]);

  const handlePhoneKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isBulkEditing) {
        commitAllChanges();
      } else {
        commitPhoneChange();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (isBulkEditing) {
        cancelAllChanges();
      } else {
        cancelEditingPhone();
      }
    }
  }, [isBulkEditing, commitAllChanges, commitPhoneChange, cancelAllChanges, cancelEditingPhone]);

  const handlePhoneBlur = useCallback(() => {
    if (isBulkEditing) return;
    phoneBlurTimeoutRef.current = window.setTimeout(() => {
      commitPhoneChange();
    }, 150);
  }, [isBulkEditing, commitPhoneChange]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (isEditingCpf && cpfInputRef.current && !isBulkEditing) {
      cpfInputRef.current.focus();
      cpfInputRef.current.select();
    }
  }, [isEditingCpf, isBulkEditing]);

  useEffect(() => {
    if (isEditingPhone && phoneInputRef.current && !isBulkEditing) {
      phoneInputRef.current.focus();
      phoneInputRef.current.select();
    }
  }, [isEditingPhone, isBulkEditing]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      if (cpfBlurTimeoutRef.current) {
        clearTimeout(cpfBlurTimeoutRef.current);
      }
      if (phoneBlurTimeoutRef.current) {
        clearTimeout(phoneBlurTimeoutRef.current);
      }
    };
  }, []);

  return {
    isEditingName,
    draftName,
    setDraftName,
    isEditingCpf,
    draftCpf,
    setDraftCpf,
    isEditingPhone,
    draftPhone,
    setDraftPhone,
    isBulkEditing,

    nameInputRef,
    cpfInputRef,
    phoneInputRef,

    formatCpf,
    formatPhone,

    startEditingName,
    commitNameChange,
    cancelEditingName,
    handleNameKeyDown,
    handleNameBlur,

    startEditingCpf,
    commitCpfChange,
    cancelEditingCpf,
    handleCpfChange,
    handleCpfKeyDown,
    handleCpfBlur,

    startEditingPhone,
    commitPhoneChange,
    cancelEditingPhone,
    handlePhoneChange,
    handlePhoneKeyDown,
    handlePhoneBlur,

    handleEditClient,
    commitAllChanges,
    cancelAllChanges,
  };
}
