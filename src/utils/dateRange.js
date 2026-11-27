/**
 * Turns the dashboard's date filter ("Last 30 Days", "This Month",
 * "2026-11-01 - 2026-11-15", { startDate, endDate } ...) into from/to Dates,
 * using the same day boundaries as filterByDateRange in formatters.js.
 * Returns {} for "All Time" or anything unrecognised, meaning no date limit.
 */
const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
const endOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

const parseDay = (value) => {
  if (!value) return null;
  const text = String(value).trim();
  // "YYYY-MM-DD" is read as a local calendar day, not UTC midnight.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  const date = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
};

const customBounds = (start, end) => {
  const from = parseDay(start);
  const to = parseDay(end);
  return {
    ...(from && { from: startOfDay(from) }),
    ...(to && { to: endOfDay(to) }),
  };
};

export const dateRangeToBounds = (range, now = new Date()) => {
  if (range && typeof range === 'object') return customBounds(range.startDate, range.endDate);
  if (typeof range !== 'string') return {};
  if (range.includes(' - ')) {
    const [start, end] = range.split(' - ');
    return customBounds(start, end);
  }

  const today = startOfDay(now);
  switch (range) {
    case 'Today':
      return { from: today, to: endOfDay(now) };
    case 'Yesterday': {
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return { from: yesterday, to: new Date(today.getTime() - 1) };
    }
    case 'Last 7 Days':
      return { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), to: now };
    case 'Last 30 Days':
      return { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to: now };
    case 'This Month':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) };
    case 'Last Month':
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
      };
    default:
      return {};
  }
};

/** Short label for the period a card covers. */
export const describeDateRange = (range) => {
  if (!range || range === 'All' || range === 'All Time' || range === 'Custom Range') return 'All time';
  if (typeof range === 'object') return [range.startDate, range.endDate].filter(Boolean).join(' – ') || 'All time';
  return range.replace(' - ', ' – ');
};
