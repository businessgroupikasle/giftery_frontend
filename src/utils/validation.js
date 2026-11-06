/**
 * Validation utilities for email and postal pincode.
 */

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

export const isValidPincode = (pincode) => {
  if (!pincode || (typeof pincode !== 'string' && typeof pincode !== 'number')) return false;
  const clean = String(pincode).trim();
  // Valid Indian 6-digit pincode or standard 5-6 digit zip code
  return /^[1-9][0-9]{5}$/.test(clean) || /^[0-9]{5,6}$/.test(clean);
};

export const isValidFullName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const clean = name.trim();
  // Allow only valid alphabetic characters and spaces (minimum 2 characters)
  return clean.length >= 2 && /^[A-Za-z\s]+$/.test(clean);
};

