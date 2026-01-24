import { startOfDay, isBefore } from "date-fns";
import { parseLocalDate } from "@/shared/lib/date-utils";

export function calculateIsOverdue(
  isEditing: boolean,
  editedDueDate: string,
  dueDate: Date
): boolean {
  const today = startOfDay(new Date());
  
  if (isEditing) {
    const dateStr = editedDueDate;
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (dateStr && isoDateRegex.test(dateStr)) {
      const [y, m, d] = dateStr.split('-').map(Number);
      if (m >= 1 && m <= 12) {
        const daysInMonth = new Date(y, m, 0).getDate();
        if (d >= 1 && d <= daysInMonth) {
          const parsed = parseLocalDate(dateStr);
          return isBefore(startOfDay(parsed), today);
        }
      }
    }
    return false;
  }
  
  return isBefore(startOfDay(dueDate), today);
}
