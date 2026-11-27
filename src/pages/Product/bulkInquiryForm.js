/**
 * Form logic for the product page's bulk order inquiry. Kept free of React so it can be unit tested.
 * The 10% bulk offer is promotional only: nothing here touches price, cart or checkout.
 */
import { getPhoneError, normalizePhone } from '../../utils/phone.js';

/* Bulk orders (and the 10% bulk offer) start at this many units; the server enforces it too. */
export const BULK_MIN_QUANTITY = 100;
export const BULK_MAX_QUANTITY = 1_000_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const BULK_SUCCESS_MESSAGE =
  'Your bulk order inquiry has been submitted successfully! Our team will contact you shortly to discuss your bulk order and the 10% offer eligibility.';

export const EMPTY_BULK_FORM = Object.freeze({
  quantity: '',
  name: '',
  email: '',
  phone: '',
  company: '',
  requirements: '',
});

const LIMITS = { name: 100, email: 254, company: 150, requirements: 2000 };

/** Validates one field; returns the message to show, or '' when it's fine. */
export const validateBulkField = (field, form, phoneCountry) => {
  const value = String(form[field] ?? '').trim();
  switch (field) {
    case 'quantity': {
      if (!value) return 'Please enter the quantity you need.';
      if (!/^\d+$/.test(value)) return 'Quantity must be a whole number, like 100.';
      const quantity = Number(value);
      if (quantity < BULK_MIN_QUANTITY) return `Minimum bulk order is ${BULK_MIN_QUANTITY} units.`;
      if (quantity > BULK_MAX_QUANTITY) return `Quantity can be at most ${BULK_MAX_QUANTITY.toLocaleString('en-IN')}.`;
      return '';
    }
    case 'name':
      if (!value) return 'Please enter your full name.';
      if (value.length < 2) return 'Name must be at least 2 characters.';
      return value.length > LIMITS.name ? `Name must be at most ${LIMITS.name} characters.` : '';
    case 'email':
      if (!value) return 'Please enter your email address.';
      if (value.length > LIMITS.email || !EMAIL_PATTERN.test(value)) return 'Please enter a valid email address.';
      return '';
    case 'phone':
      return getPhoneError(phoneCountry, form.phone, { required: true });
    case 'company':
      return value.length > LIMITS.company ? `Company name must be at most ${LIMITS.company} characters.` : '';
    case 'requirements':
      return value.length > LIMITS.requirements ? `Please keep this under ${LIMITS.requirements} characters.` : '';
    default:
      return '';
  }
};

/** All field errors; an empty object means the form can be submitted. */
export const validateBulkForm = (form, phoneCountry) => Object.fromEntries(
  Object.keys(EMPTY_BULK_FORM)
    .map((field) => [field, validateBulkField(field, form, phoneCountry)])
    .filter(([, message]) => message)
);

/** Request body. Only the product ID is sent: the server reads the name and SKU itself. */
export const buildBulkInquiryPayload = (productId, form, phoneCountry) => ({
  productId,
  quantity: Number(String(form.quantity).trim()),
  name: form.name.trim(),
  email: form.email.trim(),
  phone: normalizePhone(phoneCountry, form.phone),
  company: form.company.trim() || undefined,
  requirements: form.requirements.trim() || undefined,
});

/**
 * Turns a failed request into what the form shows: a banner message plus any
 * field errors the server reported. The customer's input is left untouched.
 */
export const describeBulkSubmitError = (err = {}) => {
  const fieldErrors = {};
  for (const { field, message } of Array.isArray(err.errors) ? err.errors : []) {
    if (field && field in EMPTY_BULK_FORM && message) fieldErrors[field] = message;
  }
  let message;
  if (!err.status) message = "We couldn't reach our server. Please check your connection and try again.";
  else if (err.status === 429) message = 'Too many inquiries were sent from this connection. Please wait a few minutes and try again.';
  else if (err.status >= 500) message = 'Something went wrong on our side and your inquiry was not sent. Please try again.';
  else if (err.status === 422 && Object.keys(fieldErrors).length) message = 'Please correct the highlighted fields.';
  else message = err.message || 'Your inquiry could not be submitted. Please try again.';
  return { message, fieldErrors };
};
