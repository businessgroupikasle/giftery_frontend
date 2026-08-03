/**
 * Validation utilities for email and mobile phone number.
 */

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

export const isValidMobile = (phone) => {
  if (!phone || (typeof phone !== 'string' && typeof phone !== 'number')) return false;
  const cleanPhone = String(phone).replace(/[\s\-\(\)\+]/g, '');
  // Accepts 10 digits or 12 digits starting with country code 91
  return /^[0-9]{10}$/.test(cleanPhone) || (cleanPhone.length === 12 && cleanPhone.startsWith('91'));
};
