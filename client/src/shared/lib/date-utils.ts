/**
 * Parse a yyyy-MM-dd string as a local date (not UTC)
 * Avoids timezone offset issues when converting between Date objects and strings
 */
export function parseLocalDate(dateString: string): Date {
  const parts = dateString.split("-");
  if (parts.length === 3) {
    // Create date in local timezone (month is 0-indexed in JS)
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  // Fallback for invalid format
  return new Date(dateString);
}

/**
 * Format a Date object as yyyy-MM-dd in local timezone
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
