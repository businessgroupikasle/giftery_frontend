/**
 * validators.js — Form and data validation helpers
 */

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPassword = (password) =>
  password?.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password);

export const isValidPhone = (phone) =>
  /^\+?[1-9]\d{7,14}$/.test(phone);

export const isRequired = (value) =>
  value !== null && value !== undefined && String(value).trim() !== '';

export const minLength = (value, min) =>
  String(value).trim().length >= min;

export const maxLength = (value, max) =>
  String(value).trim().length <= max;
