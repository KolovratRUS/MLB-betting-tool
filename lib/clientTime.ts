/**
 * Small client-side time helpers, all pinned to U.S. Eastern Time
 * (America/New_York) since the app's MLB schedule day is Eastern-based.
 */

/**
 * Format a Date as an Eastern-time "fetched" stamp, e.g. "Jun 20, 9:15 AM ET".
 * The "ET" suffix is shown literally (rather than EDT/EST) to match how MLB and
 * U.S. sportsbooks label their daily slate.
 */
export function formatEasternTimestamp(date: Date): string {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
  return `${formatted} ET`;
}

/**
 * Return the current Eastern calendar day ("YYYY-MM-DD") and 24h hour (0-23),
 * independent of the browser's local timezone. Used to decide when to trigger
 * the daily 9:00 AM ET auto-refresh.
 */
export function easternDayAndHour(date: Date = new Date()): { day: string; hour: number } {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(date);
  const hourStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    hour12: false,
  }).format(date);
  // "24" can be emitted at midnight by some runtimes; normalize to 0-23.
  return { day, hour: Number(hourStr) % 24 };
}
