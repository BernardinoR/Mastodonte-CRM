import * as React from "react";
import { format, parse, isValid, setYear, setMonth, setDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DateInputProps {
  value: Date | string;
  onChange: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  dataTestId?: string;
}

export function DateInput({
  value,
  onChange,
  className,
  placeholder = "DD/MM/YYYY",
  disabled = false,
  dataTestId,
}: DateInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [isInvalid, setIsInvalid] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Initialize input value from prop
  React.useEffect(() => {
    const dateValue = typeof value === "string" ? new Date(value) : value;
    if (dateValue && isValid(dateValue)) {
      setInputValue(format(dateValue, "dd/MM/yyyy", { locale: ptBR }));
    }
  }, [value]);

  // Parse date from input string with flexible formats
  const parseDate = (input: string): Date | null => {
    // Remove any non-numeric characters except separators
    const cleaned = input.replace(/[^\d\/\-\.]/g, "");
    
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
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Auto-format with slashes as user types
    if (newValue.length === 2 || newValue.length === 5) {
      const lastChar = newValue[newValue.length - 1];
      if (lastChar !== "/" && lastChar !== "-" && lastChar !== ".") {
        setInputValue(newValue + "/");
      }
    }
    
    // Try to parse the date
    const parsed = parseDate(newValue);
    if (parsed) {
      setIsInvalid(false);
      onChange(parsed);
    } else if (newValue.length >= 6) {
      // Only show invalid after user has typed enough
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
    }
  };

  const handleInputBlur = () => {
    // On blur, try to parse and format the date
    const parsed = parseDate(inputValue);
    if (parsed) {
      setInputValue(format(parsed, "dd/MM/yyyy", { locale: ptBR }));
      setIsInvalid(false);
      onChange(parsed);
    } else if (inputValue.trim()) {
      setIsInvalid(true);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setInputValue(format(date, "dd/MM/yyyy", { locale: ptBR }));
      setIsInvalid(false);
      onChange(date);
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    }
    // Prevent opening popover when typing
    if (e.key !== "Tab" && e.key !== "Escape") {
      e.stopPropagation();
    }
  };

  const currentDate = typeof value === "string" ? new Date(value) : value;

  return (
    <div className={cn("relative flex w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative flex w-full">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "pr-10",
              isInvalid && "border-destructive focus-visible:ring-destructive"
            )}
            data-testid={dataTestId}
            onClick={(e) => e.stopPropagation()}
          />
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 h-9 w-9 rounded-l-none hover:bg-transparent"
              disabled={disabled}
              data-testid={dataTestId ? `${dataTestId}-calendar` : undefined}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={currentDate && isValid(currentDate) ? currentDate : undefined}
            onSelect={handleCalendarSelect}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {isInvalid && (
        <span className="absolute -bottom-5 left-0 text-xs text-destructive">
          Data inválida
        </span>
      )}
    </div>
  );
}