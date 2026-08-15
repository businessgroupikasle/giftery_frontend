/**
 * Validation utilities for email, mobile phone number, and postal pincode.
 */

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

export const isValidMobile = (phone) => {
  if (!phone || (typeof phone !== 'string' && typeof phone !== 'number')) return false;
  const cleanPhone = String(phone).replace(/[\s\-\(\)\+]/g, '');
  // Accepts standard 10-digit mobile number (starting with 6-9 in India or any 10 digits)
  if (/^[6-9][0-9]{9}$/.test(cleanPhone) || /^[0-9]{10}$/.test(cleanPhone)) return true;
  // Accepts 12 digits starting with country code 91
  if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    const national = cleanPhone.slice(2);
    return /^[0-9]{10}$/.test(national);
  }
  return false;
};

export const isValidPincode = (pincode) => {
  if (!pincode || (typeof pincode !== 'string' && typeof pincode !== 'number')) return false;
  const clean = String(pincode).trim();
  // Valid Indian 6-digit pincode or standard 5-6 digit zip code
  return /^[1-9][0-9]{5}$/.test(clean) || /^[0-9]{5,6}$/.test(clean);
};

