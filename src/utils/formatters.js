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
