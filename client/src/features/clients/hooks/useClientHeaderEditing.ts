import { useState, useCallback, useEffect } from "react";
import { useInlineHeaderField } from "@/shared/hooks/useInlineHeaderField";

export interface UseClientHeaderEditingOptions {
  clientId: string;
  clientName: string;
  clientCpf: string;
  clientPhone: string;
  clientLastMeeting: Date;
  clientSinceDate: Date;
  onUpdateName: (id: string, name: string) => void | Promise<void>;
  onUpdateCpf: (id: string, cpf: string) => void | Promise<void>;
  onUpdatePhone: (id: string, phone: string) => void | Promise<void>;
  onUpdateLastMeeting: (id: string, date: Date) => void | Promise<void>;
  onUpdateClientSince: (id: string, date: Date) => void | Promise<void>;
}

// Formatters
const formatCpf = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatPhone = (value: string): string => {
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
};

export function useClientHeaderEditing(options: UseClientHeaderEditingOptions) {
  const {
    clientId,
    clientName,
    clientCpf,
    clientPhone,
    clientLastMeeting,
    clientSinceDate,
    onUpdateName,
    onUpdateCpf,
    onUpdatePhone,
    onUpdateLastMeeting,
    onUpdateClientSince,
  } = options;

  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [draftLastMeeting, setDraftLastMeeting] = useState<Date | null>(null);
  const [draftClientSince, setDraftClientSince] = useState<Date | null>(null);

  // Bulk editing handlers
  const commitAllChanges = useCallback(() => {
    // Will be implemented after field hooks are created
  }, []);

  const cancelAllChanges = useCallback(() => {
    setIsBulkEditing(false);
  }, []);

  // Name field
  const nameField = useInlineHeaderField({
    initialValue: clientName,
    onCommit: (value) => onUpdateName(clientId, value),
    isBulkEditing,
    onBulkCommit: commitAllChanges,
    onBulkCancel: cancelAllChanges,
  });

  // CPF field
  const cpfField = useInlineHeaderField({
    initialValue: clientCpf,
    onCommit: (value) => onUpdateCpf(clientId, value),
    format: formatCpf,
    isBulkEditing,
    onBulkCommit: commitAllChanges,
    onBulkCancel: cancelAllChanges,
  });

  // Phone field
  const phoneField = useInlineHeaderField({
    initialValue: clientPhone,
    onCommit: (value) => onUpdatePhone(clientId, value),
    format: formatPhone,
    isBulkEditing,
    onBulkCommit: commitAllChanges,
    onBulkCancel: cancelAllChanges,
  });

  // Implement commitAllChanges now that fields are available
  const commitAllChangesImpl = useCallback(() => {
    const trimmedName = nameField.draft.trim();
    if (trimmedName && trimmedName !== clientName) {
      onUpdateName(clientId, trimmedName);
    }

    const trimmedCpf = cpfField.draft.trim();
    if (trimmedCpf && trimmedCpf !== clientCpf) {
      onUpdateCpf(clientId, trimmedCpf);
    }

    const trimmedPhone = phoneField.draft.trim();
    if (trimmedPhone && trimmedPhone !== clientPhone) {
      onUpdatePhone(clientId, trimmedPhone);
    }

    if (draftLastMeeting && draftLastMeeting.getTime() !== clientLastMeeting.getTime()) {
      onUpdateLastMeeting(clientId, draftLastMeeting);
    }

    if (draftClientSince && draftClientSince.getTime() !== clientSinceDate.getTime()) {
      onUpdateClientSince(clientId, draftClientSince);
    }

    setIsBulkEditing(false);
  }, [
    nameField.draft,
    cpfField.draft,
    phoneField.draft,
    clientName,
    clientCpf,
    clientPhone,
    clientId,
    onUpdateName,
    onUpdateCpf,
    onUpdatePhone,
    draftLastMeeting,
    clientLastMeeting,
    onUpdateLastMeeting,
    draftClientSince,
    clientSinceDate,
    onUpdateClientSince,
  ]);

  const handleEditClient = useCallback(() => {
    nameField.setDraft(clientName);
    cpfField.setDraft(clientCpf);
    phoneField.setDraft(clientPhone);
    setDraftLastMeeting(clientLastMeeting);
    setDraftClientSince(clientSinceDate);
    setIsBulkEditing(true);
  }, [
    clientName,
    clientCpf,
    clientPhone,
    clientLastMeeting,
    clientSinceDate,
    nameField,
    cpfField,
    phoneField,
  ]);

  const cancelAllChangesImpl = useCallback(() => {
    setIsBulkEditing(false);
    nameField.setDraft("");
    cpfField.setDraft("");
    phoneField.setDraft("");
    setDraftLastMeeting(null);
    setDraftClientSince(null);
  }, [nameField, cpfField, phoneField]);

  // Focus name input when bulk editing starts
  useEffect(() => {
    if (isBulkEditing && nameField.inputRef.current) {
      nameField.inputRef.current.focus();
      nameField.inputRef.current.select();
    }
  }, [isBulkEditing, nameField.inputRef]);

  return {
    // Name field (for backwards compatibility)
    isEditingName: nameField.isEditing || isBulkEditing,
    draftName: nameField.draft,
    setDraftName: nameField.setDraft,
    nameInputRef: nameField.inputRef,
    startEditingName: nameField.startEditing,
    commitNameChange: nameField.commit,
    cancelEditingName: nameField.cancel,
    handleNameKeyDown: nameField.handleKeyDown,
    handleNameBlur: nameField.handleBlur,

    // CPF field (for backwards compatibility)
    isEditingCpf: cpfField.isEditing || isBulkEditing,
    draftCpf: cpfField.draft,
    setDraftCpf: cpfField.setDraft,
    cpfInputRef: cpfField.inputRef,
    startEditingCpf: cpfField.startEditing,
    commitCpfChange: cpfField.commit,
    cancelEditingCpf: cpfField.cancel,
    handleCpfChange: cpfField.handleChange,
    handleCpfKeyDown: cpfField.handleKeyDown,
    handleCpfBlur: cpfField.handleBlur,

    // Phone field (for backwards compatibility)
    isEditingPhone: phoneField.isEditing || isBulkEditing,
    draftPhone: phoneField.draft,
    setDraftPhone: phoneField.setDraft,
    phoneInputRef: phoneField.inputRef,
    startEditingPhone: phoneField.startEditing,
    commitPhoneChange: phoneField.commit,
    cancelEditingPhone: phoneField.cancel,
    handlePhoneChange: phoneField.handleChange,
    handlePhoneKeyDown: phoneField.handleKeyDown,
    handlePhoneBlur: phoneField.handleBlur,

    // Date drafts
    draftLastMeeting,
    setDraftLastMeeting,
    draftClientSince,
    setDraftClientSince,

    // Bulk editing
    isBulkEditing,
    handleEditClient,
    commitAllChanges: commitAllChangesImpl,
    cancelAllChanges: cancelAllChangesImpl,

    // Formatters (exported for external use)
    formatCpf,
    formatPhone,
  };
}
