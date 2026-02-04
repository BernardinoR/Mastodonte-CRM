import { useState, useCallback, useRef, useEffect } from "react";

interface UseTaskCardDialogsProps {
  id: string;
  isEditing: boolean;
  activePopover: string | null;
  onDelete: (taskId: string) => void;
  onEditStateChange?: (isEditing: boolean) => void;
  onOpenDetail?: (taskId: string) => void;
  handleReplaceTitleSubmit: (text: string) => void;
  handleAppendTitleSubmit: (text: string) => void;
  handleContextDateChange: (date: Date) => void;
}

interface UseTaskCardDialogsReturn {
  showDetails: boolean;
  setShowDetails: (show: boolean) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  showReplaceTitleDialog: boolean;
  setShowReplaceTitleDialog: (show: boolean) => void;
  showAppendTitleDialog: boolean;
  setShowAppendTitleDialog: (show: boolean) => void;
  showBulkDatePicker: boolean;
  setShowBulkDatePicker: (show: boolean) => void;
  newTitleText: string;
  setNewTitleText: (text: string) => void;
  appendTitleText: string;
  setAppendTitleText: (text: string) => void;
  datePopoverContentRef: React.RefObject<HTMLDivElement>;
  handleDelete: () => void;
  onReplaceTitleSubmit: () => void;
  onAppendTitleSubmit: () => void;
  onContextDateChange: (date: Date) => void;
  openDetails: () => void;
}

export function useTaskCardDialogs({
  id,
  isEditing,
  activePopover,
  onDelete,
  onEditStateChange,
  onOpenDetail,
  handleReplaceTitleSubmit,
  handleAppendTitleSubmit,
  handleContextDateChange,
}: UseTaskCardDialogsProps): UseTaskCardDialogsReturn {
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReplaceTitleDialog, setShowReplaceTitleDialog] = useState(false);
  const [showAppendTitleDialog, setShowAppendTitleDialog] = useState(false);
  const [newTitleText, setNewTitleText] = useState("");
  const [appendTitleText, setAppendTitleText] = useState("");
  const [showBulkDatePicker, setShowBulkDatePicker] = useState(false);

  const datePopoverContentRef = useRef<HTMLDivElement>(null);
  const prevEditStateRef = useRef<boolean | null>(null);

  useEffect(() => {
    const isCurrentlyEditing = isEditing || activePopover !== null;
    if (prevEditStateRef.current !== isCurrentlyEditing) {
      prevEditStateRef.current = isCurrentlyEditing;
      onEditStateChange?.(isCurrentlyEditing);
    }
  }, [isEditing, activePopover, onEditStateChange]);

  const handleDelete = useCallback(() => {
    onDelete(id);
    setShowDeleteConfirm(false);
  }, [onDelete, id]);

  const onReplaceTitleSubmit = useCallback(() => {
    if (!newTitleText.trim()) return;
    handleReplaceTitleSubmit(newTitleText);
    setNewTitleText("");
    setShowReplaceTitleDialog(false);
  }, [handleReplaceTitleSubmit, newTitleText]);

  const onAppendTitleSubmit = useCallback(() => {
    if (!appendTitleText.trim()) return;
    handleAppendTitleSubmit(appendTitleText);
    setAppendTitleText("");
    setShowAppendTitleDialog(false);
  }, [handleAppendTitleSubmit, appendTitleText]);

  const onContextDateChange = useCallback(
    (newDate: Date) => {
      handleContextDateChange(newDate);
      setShowBulkDatePicker(false);
    },
    [handleContextDateChange],
  );

  const openDetails = useCallback(() => {
    if (onOpenDetail) {
      onOpenDetail(id);
    } else {
      setShowDetails(true);
    }
  }, [onOpenDetail, id]);

  return {
    showDetails,
    setShowDetails,
    showDeleteConfirm,
    setShowDeleteConfirm,
    showReplaceTitleDialog,
    setShowReplaceTitleDialog,
    showAppendTitleDialog,
    setShowAppendTitleDialog,
    showBulkDatePicker,
    setShowBulkDatePicker,
    newTitleText,
    setNewTitleText,
    appendTitleText,
    setAppendTitleText,
    datePopoverContentRef,
    handleDelete,
    onReplaceTitleSubmit,
    onAppendTitleSubmit,
    onContextDateChange,
    openDetails,
  };
}
