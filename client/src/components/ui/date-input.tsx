import * as React from "react";
import { format, parse, isValid, setYear } from "date-fns";
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
    let cleaned = input.replace(/[^\d\/\-\.]/g, "");
    
    // Remove trailing separators (important for partial dates like "15/12/")
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
    
    // Only auto-format with slashes if:
    // 1. User is adding characters (not deleting)
    // 2. No other separator is being used (dots or dashes)
    // 3. We're at the right position for a separator
    if (newValue.length > prevLength && !hasDot && !hasDash) {
      // Check if we should add a slash after day (position 2)
      if (newValue.length === 2 && !hasSlash) {
        const lastChar = newValue[newValue.length - 1];
        if (lastChar !== "/" && lastChar !== "-" && lastChar !== ".") {
          newValue = newValue + "/";
        }
      }
      // Check if we should add a slash after month (position 5)
      else if (newValue.length === 5 && newValue.split("/").length === 2) {
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
      // Don't call onChange on every keystroke, only on blur or valid complete dates
      const cleanedLength = newValue.replace(/[^\d]/g, "").length;
      if (cleanedLength >= 8) { // At least DDMMYYYY digits
        onChange(parsed);
      }
    } else if (newValue.replace(/[^\d]/g, "").length >= 6) {
      // Only show invalid after user has typed enough digits
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
      setOpen(false);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
    // Prevent opening popover when typing
    if (e.key !== "Tab") {
      e.stopPropagation();
    }
  };

  const currentDate = typeof value === "string" ? new Date(value) : value;

  return (
    <div className={cn("relative flex items-center w-full gap-1", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-1 w-full">
          <span 
            onClick={() => setOpen(true)}
            className="text-xs cursor-pointer hover:bg-muted/50 rounded px-2 py-1 flex-1"
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
        <PopoverContent className="w-auto p-0" align="start">
          <div className="space-y-2 p-3 border-b">
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
                "text-sm",
                isInvalid && "border-destructive focus-visible:ring-destructive"
              )}
              onClick={(e) => e.stopPropagation()}
            />
            {isInvalid && (
              <span className="text-xs text-destructive block">
                Data inválida
              </span>
            )}
          </div>
          <Calendar
            mode="single"
            selected={currentDate && isValid(currentDate) ? currentDate : undefined}
            onSelect={handleCalendarSelect}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
