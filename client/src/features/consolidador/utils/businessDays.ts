import { addDays, subDays } from "date-fns";

// ============================================
// Easter (Meeus/Anonymous Gregorian algorithm)
// ============================================

function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// ============================================
// Brazilian National Holidays
// ============================================

function getBrazilianHolidays(year: number): Set<string> {
  const holidays = new Set<string>();
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // Fixed holidays
  const fixed = [
    [1, 1], // Confraternização Universal
    [4, 21], // Tiradentes
    [5, 1], // Dia do Trabalho
    [9, 7], // Independência
    [10, 12], // Nossa Senhora Aparecida
    [11, 2], // Finados
    [11, 15], // Proclamação da República
    [11, 20], // Consciência Negra
    [12, 25], // Natal
  ];
  for (const [m, d] of fixed) {
    holidays.add(fmt(new Date(year, m - 1, d)));
  }

  // Easter-based holidays
  const easter = getEasterDate(year);
  holidays.add(fmt(subDays(easter, 48))); // Carnival Monday
  holidays.add(fmt(subDays(easter, 47))); // Carnival Tuesday
  holidays.add(fmt(subDays(easter, 2))); // Good Friday
  holidays.add(fmt(addDays(easter, 60))); // Corpus Christi

  return holidays;
}

// ============================================
// Nth Business Day
// ============================================

export function getNthBusinessDay(year: number, month: number, n: number): Date {
  const holidays = getBrazilianHolidays(year);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  let count = 0;
  let day = new Date(year, month - 1, 1);

  while (count < n) {
    const dow = day.getDay();
    if (dow !== 0 && dow !== 6 && !holidays.has(fmt(day))) {
      count++;
      if (count === n) return day;
    }
    day = addDays(day, 1);
  }

  return day;
}

// ============================================
// Visibility Logic
// ============================================

const ALL_TYPES = new Set(["Automático", "Manual", "Manual Cliente"]);

export function getVisibleContaTypes(month: string, today?: Date): Set<string> {
  const now = today ?? new Date();
  const currentMonth = now.getMonth() + 1; // 1-indexed
  const currentYear = now.getFullYear();

  // Last closed month = previous calendar month
  let lastClosedMonth = currentMonth - 1;
  let lastClosedYear = currentYear;
  if (lastClosedMonth === 0) {
    lastClosedMonth = 12;
    lastClosedYear--;
  }
  const lastClosedStr = `${String(lastClosedMonth).padStart(2, "0")}/${lastClosedYear}`;

  // If this month is NOT the last closed month, all types are visible
  if (month !== lastClosedStr) return ALL_TYPES;

  // Check business day thresholds for the CURRENT month (not the closed month)
  const bd5 = getNthBusinessDay(currentYear, currentMonth, 5);
  if (now >= bd5) return ALL_TYPES;

  const bd3 = getNthBusinessDay(currentYear, currentMonth, 3);
  if (now >= bd3) return new Set(["Automático"]);

  return new Set<string>();
}
