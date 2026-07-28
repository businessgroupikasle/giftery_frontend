/**
 * formatters.js — Reusable value formatting helpers
 */

/**
 * Format a number as currency
 * @param {number} amount
 * @param {string} currency
 * @param {string} locale
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);

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
