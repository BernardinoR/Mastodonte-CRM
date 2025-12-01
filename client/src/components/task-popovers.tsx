import { memo, useCallback } from "react";
import { DateInput } from "@/components/ui/date-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseLocalDate } from "@/lib/date-utils";

interface TaskDatePopoverProps {
  id: string;
  dateValue: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDateChange: (date: Date | undefined) => void;
  onStopPropagation: () => void;
  popoverRef?: React.RefObject<HTMLDivElement>;
}

export const TaskDatePopover = memo(function TaskDatePopover({
  id,
  dateValue,
  isOpen,
  onOpenChange,
  onDateChange,
  onStopPropagation,
  popoverRef,
}: TaskDatePopoverProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onStopPropagation();
  }, [onStopPropagation]);

  const handleInteractOutside = useCallback((e: any) => {
    const originalTarget = e.detail?.originalEvent?.target as HTMLElement | null;
    const target = originalTarget || (e.target as HTMLElement);
    if (popoverRef?.current?.contains(target) || target?.closest('.rdp')) {
      e.preventDefault();
    }
  }, [popoverRef]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      onDateChange(date);
      onOpenChange(false);
    }
  }, [onDateChange, onOpenChange]);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <span 
          className="inline-flex items-center gap-1.5 font-medium cursor-pointer px-2 py-0.5 rounded-full hover:bg-gray-700/80 hover:text-foreground text-[13px]"
          onClick={handleClick}
          data-testid={`text-date-${id}`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          {format(parseLocalDate(dateValue), "dd/MM/yyyy", { locale: ptBR })}
        </span>
      </PopoverTrigger>
      <PopoverContent 
        ref={popoverRef}
        className="w-auto p-0 bg-[#1a1a1a] border-[#2a2a2a]" 
        side="bottom" 
        align="start" 
        sideOffset={6} 
        avoidCollisions={true} 
        collisionPadding={8}
        onInteractOutside={handleInteractOutside}
        onPointerDownOutside={handleInteractOutside}
        onFocusOutside={handleInteractOutside}
      >
        <DateInput
          value={dateValue}
          onChange={handleDateSelect}
          className="font-semibold"
          dataTestId={`input-date-${id}`}
          hideIcon
          commitOnInput={false}
        />
      </PopoverContent>
    </Popover>
  );
});
