import { getNthBusinessDay } from "@/shared/lib/business-days";
import type { DbConta } from "./buildExtratos";

const ALL_TYPES = new Set(["Automático", "Manual", "Manual Cliente"]);

export function getVisibleContaTypes(month: string, today?: Date): Set<string> {
  const now = today ?? new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  let lastClosedMonth = currentMonth - 1;
  let lastClosedYear = currentYear;
  if (lastClosedMonth === 0) {
    lastClosedMonth = 12;
    lastClosedYear--;
  }
  const lastClosedStr = `${String(lastClosedMonth).padStart(2, "0")}/${lastClosedYear}`;

  if (month !== lastClosedStr) return ALL_TYPES;

  const bd5 = getNthBusinessDay(currentYear, currentMonth, 5);
  if (now >= bd5) return ALL_TYPES;

  const bd3 = getNthBusinessDay(currentYear, currentMonth, 3);
  if (now >= bd3) return new Set(["Automático"]);

  return new Set<string>();
}

export function filterContasByVisibility(
  contas: DbConta[],
  month: string,
  today?: Date,
): DbConta[] {
  const visibleTypes = getVisibleContaTypes(month, today);
  if (visibleTypes.size === 3) return contas;
  return contas.filter((c) => visibleTypes.has(c.type));
}
