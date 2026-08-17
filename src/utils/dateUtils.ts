/**
 * Utility functions for local date management and formatting across Omega
 */

/**
 * Returns a YYYY-MM-DD date key based on local timezone date.
 * Avoids UTC offset shifts caused by toISOString().
 */
export function getLocalDateKey(dateInput: Date | number | string = new Date()): string {
  const d = typeof dateInput === 'object' ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) {
    const fallback = new Date();
    const y = fallback.getFullYear();
    const m = String(fallback.getMonth() + 1).padStart(2, '0');
    const day = String(fallback.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a date key offset by a specified number of days from today in local time.
 */
export function getOffsetLocalDateKey(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return getLocalDateKey(d);
}

/**
 * Formats a date for UI tooltips or headers (e.g., "Mon, Aug 10, 2026")
 */
export function formatReadableDate(dateInput: Date | number | string): string {
  const d = typeof dateInput === 'object' ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
