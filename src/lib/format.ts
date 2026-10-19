/** Format a date string to a readable date: "Oct 7, 2026" */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format a datetime to: "Oct 7, 2026 at 11:30 PM" */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Returns days until a date (negative = overdue) */
export function daysUntil(dateStr: string): number {
  const diffTime = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/** Format relative time: "2 days ago", "in 3 hours" */
export function formatRelative(dateStr: string): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const days = daysUntil(dateStr);
  return rtf.format(days, 'day');
}
