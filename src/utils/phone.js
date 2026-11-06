/**
 * phone.js — International mobile numbers for customer enquiry forms.
 * Forms keep a country and the digits the customer typed; what gets submitted is the
 * full international number, e.g. +971501234567.
 */
import { getCountries, getCountryCallingCode, getExampleNumber, parsePhoneNumberFromString } from 'libphonenumber-js/mobile';
import examples from 'libphonenumber-js/mobile/examples';

export const DEFAULT_PHONE_COUNTRY = 'IN';
const MAX_PHONE_DIGITS = 15;

// Listed first in the dropdown: the store's home market, then common overseas customers.
const PRIORITY_COUNTRIES = ['IN', 'AE', 'SA', 'QA', 'KW', 'OM', 'BH', 'SG', 'MY', 'GB', 'US', 'CA', 'AU'];

const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });

const toCountry = (code) => ({
  code,
  name: displayNames.of(code) || code,
  dial: getCountryCallingCode(code),
});

const byCode = new Map(getCountries().map((code) => [code, toCountry(code)]));

export const PRIORITY_PHONE_COUNTRIES = PRIORITY_COUNTRIES.map((code) => byCode.get(code));
export const OTHER_PHONE_COUNTRIES = [...byCode.values()]
  .filter((country) => !PRIORITY_COUNTRIES.includes(country.code))
  .sort((a, b) => a.name.localeCompare(b.name));

export const getPhoneCountry = (code) => byCode.get(code) || byCode.get(DEFAULT_PHONE_COUNTRY);

const digitsOf = (value) => String(value ?? '').replace(/\D/g, '');

/** The full international number, or null when the digits aren't a valid mobile number for that country. */
export const normalizePhone = (country, number) => {
  const digits = digitsOf(number);
  if (!digits) return null;
  const parsed = parsePhoneNumberFromString(digits, getPhoneCountry(country).code);
  return parsed?.isValid() ? parsed.number : null;
};

/** The message to show for a phone field, or an empty string when it's fine. */
export const getPhoneError = (country, number, { required = false } = {}) => {
  if (!digitsOf(number)) return required ? 'Please enter your mobile number.' : '';
  if (normalizePhone(country, number)) return '';
  const { name, dial } = getPhoneCountry(country);
  return `Please enter a valid mobile number for ${name} (+${dial}).`;
};

/**
 * Turns what was typed or pasted into a country and digits. A number pasted
 * with its country code, like "+971 50 123 4567", switches the dropdown to match.
 */
export const readPhoneInput = (raw, country) => {
  const text = String(raw ?? '').trim();
  if (text.startsWith('+')) {
    const parsed = parsePhoneNumberFromString(text);
    if (parsed?.country && byCode.has(parsed.country)) return { country: parsed.country, number: parsed.nationalNumber };
  }
  return { country, number: digitsOf(text).slice(0, MAX_PHONE_DIGITS) };
};

/** Splits a saved number, such as one on the customer's profile, back into the form's two fields. */
export const parseStoredPhone = (value) => {
  const text = String(value ?? '').trim();
  if (!digitsOf(text)) return { country: DEFAULT_PHONE_COUNTRY, number: '' };
  const parsed = text.startsWith('+') ? parsePhoneNumberFromString(text) : parsePhoneNumberFromString(text, DEFAULT_PHONE_COUNTRY);
  if (parsed?.country && byCode.has(parsed.country)) return { country: parsed.country, number: parsed.nationalNumber };
  return { country: DEFAULT_PHONE_COUNTRY, number: digitsOf(text).slice(0, MAX_PHONE_DIGITS) };
};

/** The same split as form fields, ready to spread into a form's state. */
export const storedPhoneFields = (value) => {
  const { country, number } = parseStoredPhone(value);
  return { phone: number, phoneCountry: country };
};

export const getPhonePlaceholder = (country) => getExampleNumber(getPhoneCountry(country).code, examples)?.formatNational() || 'Mobile number';
