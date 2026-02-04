import { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "@/shared/components/ui/input";
import { Calendar } from "@/shared/components/ui/calendar";
import { cn } from "@/shared/lib/utils";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseLocalDate } from "@/shared/lib/date-utils";

interface ContextMenuDateEditorProps {
  currentDate: string;
  onSelect: (date: string) => void;
  isBulk?: boolean;
}

export function ContextMenuDateEditor({
  currentDate,
  onSelect,
  isBulk = false,
}: ContextMenuDateEditorProps) {
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
    // Normalizar entrada: remover caracteres não-numéricos exceto separadores
    const cleaned = input.replace(/[^\d\/\-\.]/g, "").replace(/[\/\-\.]+$/, "");

    // Normalizar todos os separadores para /
    const normalized = cleaned.replace(/[\-\.]/g, "/");

    // Extrair partes da data (dd/MM/yyyy, dd/MM/yy, ou dd/MM)
    const parts = normalized.split("/").map((p) => parseInt(p, 10));
    if (parts.some(isNaN) || parts.length < 2) return null;

    const [day, month, year] = parts;

    // Validar dia e mês básico
    if (day < 1 || day > 31 || month < 1 || month > 12) return null;

    // Determinar ano
    let fullYear: number;
    if (year === undefined) {
      fullYear = new Date().getFullYear();
    } else if (year < 100) {
      fullYear = 2000 + year;
    } else {
      fullYear = year;
    }

    // Criar e validar data
    const date = new Date(fullYear, month - 1, day);
    return isValid(date) && date.getDate() === day ? date : null;
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
      } else if (newValue.length === 5 && newValue.split("/").length === 2) {
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
      <div className="border-b border-[#3a3a3a] p-3">
        {isBulk && (
          <div className="mb-2 text-center text-xs text-gray-500">Definir data para todos</div>
        )}
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder="DD/MM/YYYY"
          className={cn(
            "text-center text-sm font-medium",
            "border-[#3a3a3a] bg-[#0f0f0f]",
            "text-white placeholder:text-gray-500",
            "focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500",
            isInvalid && "border-red-500 focus-visible:ring-red-500",
          )}
          onClick={(e) => e.stopPropagation()}
          onKeyDownCapture={(e) => e.stopPropagation()}
          autoFocus
          data-testid="input-date-context"
        />
        {isInvalid && (
          <span className="mt-2 block text-center text-xs text-red-400">Data inválida</span>
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
