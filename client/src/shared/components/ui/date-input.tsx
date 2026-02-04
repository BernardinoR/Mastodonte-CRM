import * as React from "react";
import { format, parse, isValid, setYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { parseLocalDate } from "@/shared/lib/date-utils";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Input } from "@/shared/components/ui/input";

interface DateInputProps {
  value: Date | string;
  onChange: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  dataTestId?: string;
  hideIcon?: boolean;
  commitOnInput?: boolean;
}

export function DateInput({
  value,
  onChange,
  className,
  placeholder = "DD/MM/YYYY",
  disabled = false,
  dataTestId,
  hideIcon = false,
  commitOnInput = true,
}: DateInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [isInvalid, setIsInvalid] = React.useState(false);
  const [displayMonth, setDisplayMonth] = React.useState<Date>(new Date());
  const inputRef = React.useRef<HTMLInputElement>(null);
  const prevValueRef = React.useRef<string | null>(null);

  // Initialize input value and display month from prop
  React.useEffect(() => {
    const dateValue = typeof value === "string" ? parseLocalDate(value) : value;

    if (dateValue && isValid(dateValue)) {
      const formatted = format(dateValue, "dd/MM/yyyy", { locale: ptBR });

      // Only update if value actually changed to prevent infinite loops
      if (prevValueRef.current !== formatted) {
        prevValueRef.current = formatted;
        setInputValue(formatted);
        setDisplayMonth(dateValue);
      }
    }
  }, [value]);

  // Parse date from input string with flexible formats
  const parseDate = (input: string): Date | null => {
    // Remove any non-numeric characters except separators
    let cleaned = input.replace(/[^\d\/\-\.]/g, "");

    // Remove trailing separators
    cleaned = cleaned.replace(/[\/\-\.]+$/, "");

    // Try different date formats
    const formats = [
      "dd/MM/yyyy",
      "dd/MM/yy",
      "dd/MM",
      "dd-MM-yyyy",
      "dd-MM-yy",
      "dd-MM",
      "dd.MM.yyyy",
      "dd.MM.yy",
      "dd.MM",
      "d/M/yyyy",
      "d/M/yy",
      "d/M",
    ];

    for (const formatString of formats) {
      try {
        let parsed = parse(cleaned, formatString, new Date(), { locale: ptBR });

        // If no year provided, use current year
        if (formatString.indexOf("yyyy") === -1 && formatString.indexOf("yy") === -1) {
          parsed = setYear(parsed, new Date().getFullYear());
        }

        // If year is two digits, adjust to 2000s
        if (formatString.includes("yy") && !formatString.includes("yyyy")) {
          const year = parsed.getFullYear();
          if (year < 100) {
            parsed = setYear(parsed, 2000 + year);
          }
        }

        if (isValid(parsed)) {
          return parsed;
        }
      } catch {
        // Continue trying other formats
      }
    }

    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    const prevLength = inputValue.length;

    // Detect which separator is being used
    const hasDot = newValue.includes(".");
    const hasDash = newValue.includes("-");
    const hasSlash = newValue.includes("/");

    // Auto-format with slashes
    if (newValue.length > prevLength && !hasDot && !hasDash) {
      if (newValue.length === 2 && !hasSlash) {
        const lastChar = newValue[newValue.length - 1];
        if (lastChar !== "/" && lastChar !== "-" && lastChar !== ".") {
          newValue = newValue + "/";
        }
      } else if (newValue.length === 5 && newValue.split("/").length === 2) {
        const lastChar = newValue[newValue.length - 1];
        if (lastChar !== "/" && lastChar !== "-" && lastChar !== ".") {
          newValue = newValue + "/";
        }
      }
    }

    setInputValue(newValue);

    // Try to parse the date
    const parsed = parseDate(newValue);
    if (parsed) {
      setIsInvalid(false);
      // Update calendar month in real-time when valid date is typed
      setDisplayMonth(parsed);
      const cleanedLength = newValue.replace(/[^\d]/g, "").length;
      if (cleanedLength >= 8 && commitOnInput) {
        onChange(parsed);
      }
    } else if (newValue.replace(/[^\d]/g, "").length >= 6) {
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
    }
  };

  const handleInputBlur = () => {
    const parsed = parseDate(inputValue);
    if (parsed) {
      setInputValue(format(parsed, "dd/MM/yyyy", { locale: ptBR }));
      setIsInvalid(false);
      if (commitOnInput) {
        onChange(parsed);
      }
    } else if (inputValue.trim()) {
      setIsInvalid(true);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const formatted = format(localDate, "dd/MM/yyyy", { locale: ptBR });
      setInputValue(formatted);
      setIsInvalid(false);
      onChange(localDate);
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
      setOpen(false);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
    if (e.key !== "Tab") {
      e.stopPropagation();
    }
  };

  const currentDate = React.useMemo(() => {
    const dateValue = typeof value === "string" ? parseLocalDate(value) : value;
    return dateValue && isValid(dateValue) ? dateValue : undefined;
  }, [value]);

  if (hideIcon) {
    return (
      <div className={cn("w-auto", className)}>
        <div className="border-b border-[#3a3a3a] p-3">
          <Input
            ref={inputRef}
            id={dataTestId}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "text-center text-sm font-medium",
              "border-[#3a3a3a] bg-[#0f0f0f]",
              "text-white placeholder:text-gray-500",
              "focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500",
              isInvalid && "border-red-500 focus-visible:ring-red-500",
            )}
            onClick={(e) => e.stopPropagation()}
            data-testid={dataTestId}
          />
          {isInvalid && (
            <span className="mt-2 block text-center text-xs text-red-400">Data inválida</span>
          )}
        </div>
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={handleCalendarSelect}
          month={displayMonth}
          onMonthChange={setDisplayMonth}
          locale={ptBR}
          className="rounded-b-lg"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative flex w-full items-center gap-1", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex w-full items-center gap-1">
          <span
            onClick={() => setOpen(true)}
            className="flex-1 cursor-pointer rounded px-2 py-1 text-xs hover:bg-muted/50"
            data-testid={dataTestId}
          >
            {inputValue}
          </span>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              disabled={disabled}
              data-testid={dataTestId ? `${dataTestId}-calendar` : undefined}
            >
              <CalendarIcon className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent
          className="date-input-calendar-popover w-auto border-[#3a3a3a] bg-[#1a1a1a] p-0"
          align="start"
        >
          {/* Input no topo com visual dark sofisticado */}
          <div className="border-b border-[#3a3a3a] p-3">
            <Input
              ref={inputRef}
              id={dataTestId}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "text-center text-sm font-medium",
                "border-[#3a3a3a] bg-[#0f0f0f]",
                "text-white placeholder:text-gray-500",
                "focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500",
                isInvalid && "border-red-500 focus-visible:ring-red-500",
              )}
              onClick={(e) => e.stopPropagation()}
            />
            {isInvalid && (
              <span className="mt-2 block text-center text-xs text-red-400">Data inválida</span>
            )}
          </div>

          {/* Calendário com tema dark */}
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={handleCalendarSelect}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            locale={ptBR}
            initialFocus
            className="rounded-b-lg"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
