import { useCallback } from "react";
import { format } from "date-fns";

type PopoverType = "date" | "priority" | "status" | "client" | "assignee" | null;

interface UseTaskCardFieldHandlersProps {
  handleUpdate: (field: string, value: any) => void;
  setActivePopover: (popover: PopoverType) => void;
}

interface UseTaskCardFieldHandlersReturn {
  handleDateChange: (date: Date | undefined) => void;
  handlePriorityChange: (value: string) => void;
  handleStatusChange: (value: string) => void;
  handleClientChange: (value: string) => void;
}

export function useTaskCardFieldHandlers({
  handleUpdate,
  setActivePopover,
}: UseTaskCardFieldHandlersProps): UseTaskCardFieldHandlersReturn {
  const handleDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      handleUpdate("dueDate", format(date, "yyyy-MM-dd"));
    }
  }, [handleUpdate]);

  const handlePriorityChange = useCallback((value: string) => {
    handleUpdate("priority", value === "_none" ? "" : value);
    setActivePopover(null);
  }, [handleUpdate, setActivePopover]);

  const handleStatusChange = useCallback((value: string) => {
    handleUpdate("status", value);
    setActivePopover(null);
  }, [handleUpdate, setActivePopover]);

  const handleClientChange = useCallback((value: string) => {
    handleUpdate("clientName", value === "_none" ? "" : value);
    setActivePopover(null);
  }, [handleUpdate, setActivePopover]);

  return {
    handleDateChange,
    handlePriorityChange,
    handleStatusChange,
    handleClientChange,
  };
}
