/**
 * formatters.js — Reusable value formatting helpers
 */

/**
 * Format a number as currency
 * @param {number} amount
 * @param {string} currency
 * @param {string} locale
 */
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Truncate text to a max length
 */
export const truncate = (text, maxLength = 100) =>
  text?.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

/**
 * Format a date string
 */
export const formatDate = (date, options = {}) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(date));

/**
 * Calculate discount percentage
 */
export const calcDiscount = (original, sale) =>
  Math.round(((original - sale) / original) * 100);

/**
 * Build a full image URL from a relative path
 */
export const buildImageUrl = (path, cdnBase) =>
  path?.startsWith('http') ? path : `${cdnBase}/${path}`;

/**
 * Generate a readable public identifier while retaining the database ID separately.
 */
export const createPublicId = (prefix, date = new Date()) => {
  const value = date instanceof Date ? date : new Date(date);
  const safeDate = Number.isNaN(value.getTime()) ? new Date() : value;
  const year = safeDate.getFullYear();
  const timePart = safeDate.getTime().toString(36).toUpperCase().slice(-7);
  const randomPart = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID().replaceAll('-', '').slice(0, 5).toUpperCase()
    : Math.random().toString(36).slice(2, 7).toUpperCase().padEnd(5, '0');
  return `${String(prefix).toUpperCase()}-${year}-${timePart}-${randomPart}`;
};

const stableIdCode = (value, length = 7) => {
  let hash = 2166136261;
  for (const char of String(value || '')) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(length, '0').slice(-length);
};

export const formatCustomerId = (rawId, options = {}) => {
  const clean = String(options.customerId || rawId || '').trim().replace(/^#/, '');
  if (/^CUS-\d{4}-[A-Z0-9-]+$/i.test(clean)) return clean.toUpperCase();
  const date = options.createdAt ? new Date(options.createdAt) : null;
  const year = date && !Number.isNaN(date.getTime()) ? date.getFullYear() : new Date().getFullYear();
  return `CUS-${year}-${stableIdCode(clean || options.email || "customer")}`;
};

/**
 * Format order ID into standard readable business format: ORD-2026-0001 or #ORD-2026-0001
 * Replaces unreadable cuid strings (cmtr739d10009jcnb6tsgvlk3)
 * @param {string} rawId - The raw ID (cuid, timestamp, or formatted string)
 * @param {number|object} [indexOrOptions=0] - Optional list index or options { prefix = '#', index, createdAt }
 * @param {string|Date} [createdAt] - Creation date of the order
 * @returns {string} Standard business formatted order ID
 */
export const formatOrderId = (rawId, indexOrOptions = 0, createdAt = null) => {
  const options = typeof indexOrOptions === 'object' && indexOrOptions !== null
    ? indexOrOptions
    : { index: typeof indexOrOptions === 'number' ? indexOrOptions : 0 };

  const prefix = options.prefix !== undefined ? options.prefix : '#';
  const index = options.index ?? (typeof indexOrOptions === 'number' ? indexOrOptions : 0);
  
  let year = '2026';
  const dateVal = options.createdAt || createdAt;
  if (dateVal) {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) year = String(d.getFullYear());
  }

  if (!rawId) {
    const seq = String((index >= 0 ? index : 0) + 1).padStart(4, '0');
    return `${prefix}ORD-${year}-${seq}`;
  }

  const clean = String(rawId).trim().replace(/^#/, '');

  // If already in standard format like ORD-2026-0001 or ORD-0001
  if (/^ORD-\d{4}-[A-Z0-9-]+$/i.test(clean) || /^ORD-\d{4,}/i.test(clean)) {
    return `${prefix}${clean.toUpperCase()}`;
  }

  // Legacy database IDs get a stable code that does not change with sorting or pagination.
  return `${prefix}ORD-${year}-${stableIdCode(clean)}`;
};

/**
 * Format an enquiry ID into a clean, human-readable format like ENQ-2026-0001 or ENQ-0001
 * Converts unreadable system-generated CUIDs (e.g. cmudyrdkg000gzvm7anlm1ig5) or timestamps
 * @param {string} rawId - The raw ID (CUID, timestamp, or formatted string)
 * @param {string|Date} [createdAt] - Creation date of the enquiry
 * @param {number} [index=0] - Optional list index for clean sequential numbering
 * @returns {string} Short readable enquiry identifier (e.g. ENQ-2026-0001)
 */
export const formatEnquiryId = (rawId, createdAt, index = 0) => {
  if (!rawId) {
    const year = new Date().getFullYear();
    const seq = String(1001 + (typeof index === 'number' ? index : 0)).slice(-4);
    return `ENQ-${year}-${seq}`;
  }

  const clean = String(rawId).trim();

  // If already in standard readable format e.g. ENQ-2026-0001 or ENQ-0001
  if (/^ENQ-\d{4}-\d+/i.test(clean) || /^ENQ-\d+/i.test(clean)) {
    return clean.toUpperCase();
  }

  // Determine year from createdAt or fallback to current year (e.g. 2026)
  let year = '2026';
  if (createdAt) {
    const d = new Date(createdAt);
    if (!isNaN(d.getTime())) {
      year = String(d.getFullYear());
    }
  }

  // If valid index provided (>= 0), create a clean sequential identifier
  if (typeof index === 'number' && index >= 0) {
    const seq = String(index + 1).padStart(4, '0');
    return `ENQ-${year}-${seq}`;
  }

  // If rawId contains numbers (e.g. timestamp or cuid)
  const numbers = clean.replace(/\D/g, '');
  if (numbers.length >= 4) {
    return `ENQ-${year}-${numbers.slice(-4)}`;
  }

  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) - hash + clean.charCodeAt(i)) & 0xffff;
  }
  const hashSeq = String(Math.abs(hash) % 10000).padStart(4, '0');
  return `ENQ-${year}-${hashSeq}`;
};

/**
 * Filter an array of items by a designated date range string or custom range
 * Handles 'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month', and Custom Date Ranges
 * @param {Array} items - List of items to filter
 * @param {string|object} dateRange - Filter range name or custom range { startDate, endDate }
 * @param {string} [dateField='createdAt'] - Primary date field on each item
 */
export const filterByDateRange = (items, dateRange, dateField = 'createdAt') => {
  if (!dateRange || dateRange === 'All' || dateRange === 'All Time') {
    return items || [];
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const endOfYesterday = new Date(startOfToday.getTime() - 1);

  // Check if dateRange is a custom range object or string "YYYY-MM-DD - YYYY-MM-DD"
  let customStart = null;
  let customEnd = null;
  if (typeof dateRange === 'object' && dateRange !== null) {
    if (dateRange.startDate) customStart = new Date(new Date(dateRange.startDate).setHours(0, 0, 0, 0));
    if (dateRange.endDate) customEnd = new Date(new Date(dateRange.endDate).setHours(23, 59, 59, 999));
  } else if (typeof dateRange === 'string' && dateRange.includes(' - ')) {
    const [s, e] = dateRange.split(' - ');
    if (s) customStart = new Date(new Date(s.trim()).setHours(0, 0, 0, 0));
    if (e) customEnd = new Date(new Date(e.trim()).setHours(23, 59, 59, 999));
  }

  return (items || []).filter(item => {
    const rawVal = item[dateField] || item.createdAt || item.date || item.createdDate || item.joinedDate;
    if (!rawVal) return false;

    // Handle string keywords
    const lower = String(rawVal).toLowerCase().trim();
    if (lower === 'today') {
      return dateRange === 'Today' || dateRange === 'Last 7 Days' || dateRange === 'Last 30 Days' || dateRange === 'This Month';
    }
    if (lower === 'yesterday') {
      return dateRange === 'Yesterday' || dateRange === 'Last 7 Days' || dateRange === 'Last 30 Days' || dateRange === 'This Month';
    }
    if (lower === 'recent') {
      return dateRange === 'Today' || dateRange === 'Last 7 Days' || dateRange === 'Last 30 Days' || dateRange === 'This Month';
    }

    const d = new Date(rawVal);
    if (isNaN(d.getTime())) {
      // Unparseable date: do not match specific daily filters like Today or Yesterday
      return dateRange === 'Last 30 Days';
    }

    // Custom Range evaluation
    if (customStart || customEnd) {
      if (customStart && d < customStart) return false;
      if (customEnd && d > customEnd) return false;
      return true;
    }

    switch (dateRange) {
      case 'Today':
        return d >= startOfToday && d <= endOfToday;
      case 'Yesterday':
        return d >= startOfYesterday && d <= endOfYesterday;
      case 'Last 7 Days':
        return d >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'Last 30 Days':
        return d >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'This Month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        return d >= startOfMonth && d <= endOfToday;
      }
      case 'Last Month': {
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return d >= startOfLastMonth && d <= endOfLastMonth;
      }
      case 'Custom Range':
        return true;
      default:
        return true;
    }
  });
};

/**
 * Filter an array of items by status string
 */
export const filterByStatus = (items, status) => {
  if (!status || status === 'All') return items || [];
  const target = status.toLowerCase();
  return (items || []).filter(item => {
    const s = String(item.status || '').toLowerCase();
    if (target === 'completed') return s === 'delivered' || s === 'completed' || s === 'resolved';
    if (target === 'pending') return s === 'pending' || s === 'processing' || s === 'new';
    if (target === 'cancelled') return s === 'cancelled' || s === 'rejected';
    return s.includes(target);
  });
};
