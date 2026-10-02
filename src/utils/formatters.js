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
 * Format long CUID or timestamp order IDs into clean sequential number format like #ORD-1001, #ORD-1002
 */
export const formatOrderId = (rawId, index = 0) => {
  if (!rawId) return `#ORD-${1001 + index}`;

  const clean = String(rawId).trim().replace(/^#/, '');

  if (/^ORD-[A-Z0-9]+$/i.test(clean)) {
    return `#${clean.toUpperCase()}`;
  }

  const alphaNum = clean.replace(/[^a-zA-Z0-9]/g, '');
  if (alphaNum.length >= 6) {
    return `#ORD-${alphaNum.slice(-6).toUpperCase()}`;
  }
  if (alphaNum.length > 0) {
    return `#ORD-${alphaNum.toUpperCase()}`;
  }

  return `#ORD-${1001 + index}`;
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
