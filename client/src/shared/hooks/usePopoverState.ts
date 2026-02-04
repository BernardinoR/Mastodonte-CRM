import { useState, useCallback } from "react";

export type PopoverField = "status" | "priority" | "dueDate" | "client" | "assignee" | null;

export function usePopoverState() {
  const [openPopover, setOpenPopover] = useState<PopoverField>(null);

  const openField = useCallback((field: PopoverField) => {
    setOpenPopover(field);
  }, []);

  const closeAll = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const toggleField = useCallback((field: Exclude<PopoverField, null>) => {
    setOpenPopover((prev) => (prev === field ? null : field));
  }, []);

  const isOpen = useCallback(
    (field: Exclude<PopoverField, null>) => {
      return openPopover === field;
    },
    [openPopover],
  );

  const handleOpenChange = useCallback((field: Exclude<PopoverField, null>) => {
    return (open: boolean) => {
      setOpenPopover(open ? field : null);
    };
  }, []);

  return {
    openPopover,
    openField,
    closeAll,
    toggleField,
    isOpen,
    handleOpenChange,
  };
}
