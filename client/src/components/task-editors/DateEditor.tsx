import { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "@/shared/components/ui/input";
import { Calendar } from "@/shared/components/ui/calendar";
import { cn } from "@/shared/lib/utils";
import { format, parse, isValid, setYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseLocalDate } from "@/shared/lib/date-utils";

interface ContextMenuDateEditorProps {
  currentDate: string;
  onSelect: (date: string) => void;
  isBulk?: boolean;
}

export function ContextMenuDateEditor({ currentDate, onSelect, isBulk = false }: ContextMenuDateEditorProps) {
  const [inputValue, setInputValue] = useState(() => {
    const dateValue = parseLocalDate(currentDate);
    return dateValue && isValid(dateValue) ? format(dateValue, "dd/MM/yyyy", { locale: ptBR }) : "";
  });
  const [isInvalid, setIsInvalid] = useState(false);
  const [displayMonth, setDisplayMonth] = useState<Date>(() => {
    const dateValue = parseLocalDate(currentDate);
    return dateValue && isValid(dateValue) ? dateValue : new Date();
  });
  
  const isLocalUpdate = useRef(false);
  const isMountedRef = useRef(true);
  const pendingUpdatesRef = useRef<string[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevCurrentDateRef = useRef(currentDate);
  
  useEffect(() => {
    if (prevCurrentDateRef.current !== currentDate && !isLocalUpdate.current) {
      const dateValue = parseLocalDate(currentDate);
      if (dateValue && isValid(dateValue)) {
        setInputValue(format(dateValue, "dd/MM/yyyy", { locale: ptBR }));
        setDisplayMonth(dateValue);
        pendingUpdatesRef.current = [];
      }
    }
    prevCurrentDateRef.current = currentDate;
    isLocalUpdate.current = false;
  }, [currentDate]);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
    };
  }, []);
  
  const flushPendingUpdates = () => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
    }
    flushTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      const updates = [...pendingUpdatesRef.current];
      pendingUpdatesRef.current = [];
      
      if (updates.length > 0) {
        const lastUpdate = updates[updates.length - 1];
        try {
          onSelect(lastUpdate);
        } catch (e) {
          // Silently ignore errors
        }
      }
    }, 100);
  };
  
  const parseDate = (input: string): Date | null => {
    let cleaned = input.replace(/[^\d\/\-\.]/g, "");
    cleaned = cleaned.replace(/[\/\-\.]+$/, "");
    
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
        
        if (formatString.indexOf("yyyy") === -1 && formatString.indexOf("yy") === -1) {
          parsed = setYear(parsed, new Date().getFullYear());
        }
        
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
    
    const hasDot = newValue.includes(".");
    const hasDash = newValue.includes("-");
    const hasSlash = newValue.includes("/");
    
    if (newValue.length > prevLength && !hasDot && !hasDash) {
      if (newValue.length === 2 && !hasSlash) {
        const lastChar = newValue[newValue.length - 1];
        if (lastChar !== "/" && lastChar !== "-" && lastChar !== ".") {
          newValue = newValue + "/";
        }
      }
      else if (newValue.length === 5 && newValue.split("/").length === 2) {
        const lastChar = newValue[newValue.length - 1];
        if (lastChar !== "/" && lastChar !== "-" && lastChar !== ".") {
          newValue = newValue + "/";
        }
      }
    }
    
    setInputValue(newValue);
    
    const parsed = parseDate(newValue);
    if (parsed) {
      setIsInvalid(false);
      setDisplayMonth(parsed);
    } else if (newValue.replace(/[^\d]/g, "").length >= 6) {
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
    }
  };

  const handleInputBlur = () => {
    const parsed = parseDate(inputValue);
    if (parsed) {
      const formatted = format(parsed, "dd/MM/yyyy", { locale: ptBR });
      setInputValue(formatted);
      setIsInvalid(false);
      
      const dateString = format(parsed, "yyyy-MM-dd");
      pendingUpdatesRef.current.push(dateString);
      flushPendingUpdates();
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
      
      isLocalUpdate.current = true;
      
      const dateString = format(localDate, "yyyy-MM-dd");
      pendingUpdatesRef.current.push(dateString);
      flushPendingUpdates();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    }
    if (e.key !== "Tab") {
      e.stopPropagation();
    }
  };

  const currentDateValue = useMemo(() => {
    const dateValue = parseLocalDate(currentDate);
    return dateValue && isValid(dateValue) ? dateValue : undefined;
  }, [currentDate]);

  return (
    <div className="w-auto">
      <div className="p-3 border-b border-[#2a2a2a]">
        {isBulk && (
          <div className="text-xs text-gray-500 mb-2 text-center">
            Definir data para todos
          </div>
        )}
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder="DD/MM/YYYY"
          className={cn(
            "text-center text-sm font-medium",
            "bg-[#0a0a0a] border-[#2a2a2a]",
            "text-white placeholder:text-gray-500",
            "focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500",
            isInvalid && "border-red-500 focus-visible:ring-red-500"
          )}
          onClick={(e) => e.stopPropagation()}
          onKeyDownCapture={(e) => e.stopPropagation()}
          autoFocus
          data-testid="input-date-context"
        />
        {isInvalid && (
          <span className="text-xs text-red-400 block mt-2 text-center">
            Data inválida
          </span>
        )}
      </div>
      <div data-calendar-container>
        <Calendar
          mode="single"
          selected={currentDateValue}
          onSelect={handleCalendarSelect}
          month={displayMonth}
          onMonthChange={setDisplayMonth}
          locale={ptBR}
          className="rounded-b-lg"
        />
      </div>
    </div>
  );
}
