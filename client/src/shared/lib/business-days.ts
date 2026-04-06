import { addDays, subDays, startOfDay } from "date-fns";

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

export function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getBrazilianHolidays(year: number): Set<string> {
  const holidays = new Set<string>();

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
    holidays.add(formatDateKey(new Date(year, m - 1, d)));
  }

  const easter = getEasterDate(year);
  holidays.add(formatDateKey(subDays(easter, 48))); // Carnival Monday
  holidays.add(formatDateKey(subDays(easter, 47))); // Carnival Tuesday
  holidays.add(formatDateKey(subDays(easter, 2))); // Good Friday
  holidays.add(formatDateKey(addDays(easter, 60))); // Corpus Christi

  return holidays;
}

// ============================================
// Business Day Utilities
// ============================================

export function isBusinessDay(date: Date, holidays: Set<string>): boolean {
  const dow = date.getDay();
  return dow !== 0 && dow !== 6 && !holidays.has(formatDateKey(date));
}

export function getLatestBusinessDay(date: Date): Date {
  const holidays = getBrazilianHolidays(date.getFullYear());
  let d = startOfDay(date);
  while (!isBusinessDay(d, holidays)) {
    d = subDays(d, 1);
    if (d.getFullYear() !== date.getFullYear()) {
      for (const h of getBrazilianHolidays(d.getFullYear())) {
        holidays.add(h);
      }
    }
  }
  return d;
}

export function getNthBusinessDay(year: number, month: number, n: number): Date {
  const holidays = getBrazilianHolidays(year);
  let count = 0;
  let day = new Date(year, month - 1, 1);

  while (count < n) {
    if (isBusinessDay(day, holidays)) {
      count++;
      if (count === n) return day;
    }
    day = addDays(day, 1);
  }

  return day;
}

export function countBusinessDays(from: Date, to: Date): number {
  const start = startOfDay(from);
  const end = startOfDay(to);
  if (end <= start) return 0;

  // Collect holidays for all years in range
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  const holidays = new Set<string>();
  for (let y = startYear; y <= endYear; y++) {
    for (const h of getBrazilianHolidays(y)) {
      holidays.add(h);
    }
  }

  let count = 0;
  let current = addDays(start, 1); // start counting from the day AFTER `from`
  while (current <= end) {
    if (isBusinessDay(current, holidays)) count++;
    current = addDays(current, 1);
  }

  return count;
}
