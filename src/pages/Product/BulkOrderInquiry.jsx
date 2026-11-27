import { useEffect, useRef, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiPackage } from 'react-icons/fi';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import PhoneInput from '@components/ui/PhoneInput';
import { DEFAULT_PHONE_COUNTRY, parseStoredPhone } from '@utils/phone';
import {
  BULK_MIN_QUANTITY,
  BULK_SUCCESS_MESSAGE,
  EMPTY_BULK_FORM,
  buildBulkInquiryPayload,
  describeBulkSubmitError,
  validateBulkField,
  validateBulkForm,
} from './bulkInquiryForm';
import styles from './BulkOrderInquiry.module.css';

/**
 * Bulk order inquiry with the 10% bulk offer banner, shown only on the product details page.
 * It records an inquiry for the sales team; it never changes the price, cart or checkout.
 * Render it with `key={product.id}` so moving to another product starts a fresh form.
 */
const BulkOrderInquiry = ({ product, user }) => {
  const [form, setForm] = useState(EMPTY_BULK_FORM);
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_PHONE_COUNTRY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const submittingRef = useRef(false);
  const phoneEditedRef = useRef(false);
  const successRef = useRef(null);
  const errorRef = useRef(null);

  // Fill in the signed-in customer's details, without overwriting anything already typed.
  useEffect(() => {
    if (!user) return;
    const saved = parseStoredPhone(user.phone);
    const usePhone = !phoneEditedRef.current && Boolean(saved.number);
    if (usePhone) setPhoneCountry(saved.country);
    setForm((current) => ({
      ...current,
      name: current.name || user.name || '',
      email: current.email || user.email || '',
      company: current.company || user.company || '',
      phone: usePhone ? saved.number : current.phone,
    }));
  }, [user]);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  useEffect(() => {
    if (submitError) errorRef.current?.focus();
  }, [submitError]);

  const updateField = (field, value, country = phoneCountry) => {
    const next = { ...form, [field]: value };
    setForm(next);
    // Once a field shows an error, re-check it as the customer fixes it.
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: validateBulkField(field, next, country) }));
    }
  };

  const checkField = (field) => () => {
    setErrors((current) => ({ ...current, [field]: validateBulkField(field, form, phoneCountry) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const fieldErrors = validateBulkForm(form, phoneCountry);
    setErrors(fieldErrors);
    setSubmitError('');
    const firstInvalid = Object.keys(EMPTY_BULK_FORM).find((field) => fieldErrors[field]);
    if (firstInvalid) {
      document.getElementById(`bulk-${firstInvalid}`)?.focus();
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.ENQUIRIES.BULK_ORDER,
        buildBulkInquiryPayload(product.id, form, phoneCountry)
      );
      setSubmitted(response?.data || {});
      setForm((current) => ({ ...current, quantity: '', requirements: '' }));
      setErrors({});
      window.dispatchEvent(new Event('enquiries_updated'));
    } catch (err) {
      const { message, fieldErrors: serverErrors } = describeBulkSubmitError(err);
      setErrors((current) => ({ ...current, ...serverErrors }));
      setSubmitError(message);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const fieldProps = (field) => ({
    id: `bulk-${field}`,
    name: field,
    value: form[field],
    onChange: (event) => updateField(field, event.target.value),
    onBlur: checkField(field),
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `bulk-${field}-error` : undefined,
    disabled: submitting,
  });

  const fieldError = (field) => errors[field] ? (
    <span id={`bulk-${field}-error`} className={styles.fieldError}>{errors[field]}</span>
  ) : null;

  return (
    <section id="bulk-order" className={styles.section} aria-labelledby="bulk-order-title">
      {/* ── 10% bulk offer banner, directly above the form ── */}
      <div className={styles.offerBanner}>
        <div className={styles.offerBadge} aria-hidden="true">
          <span className={styles.offerBadgeValue}>10%</span>
          <span className={styles.offerBadgeOff}>OFF</span>
        </div>
        <div className={styles.offerCopy}>
          <span className={styles.offerEyebrow}>Special Bulk Order Offer</span>
          <p className={styles.offerHeadline}>
            GET <strong>10% OFF</strong>
          </p>
          <p className={styles.offerLead}>Order in bulk and save 10% on your purchase!</p>
          <span className={styles.offerMinimum}>Minimum order: {BULK_MIN_QUANTITY} units</span>
          <p className={styles.offerText}>
            Submit your bulk order inquiry and our team will contact you regarding your bulk order.
          </p>
        </div>
      </div>
      <p className={styles.offerNote}>
        Bulk order offer: 10% OFF on orders of {BULK_MIN_QUANTITY} units or more. Submit your inquiry to receive confirmation of bulk pricing and eligibility
        from our team. The offer is not applied automatically to cart or checkout prices; final bulk pricing is
        confirmed by our team.
      </p>

      {/* ── Bulk order inquiry form ── */}
      <div className={styles.formCard}>
        <h2 id="bulk-order-title" className={styles.formTitle}>
          <FiPackage aria-hidden="true" /> Bulk Order Inquiry
        </h2>

        {submitted ? (
          <div ref={successRef} tabIndex={-1} className={styles.successBox} role="status">
            <FiCheckCircle className={styles.successIcon} aria-hidden="true" />
            <div>
              <p className={styles.successMessage}>{BULK_SUCCESS_MESSAGE}</p>
              {submitted.id && (
                <p className={styles.successMeta}>
                  Inquiry reference: <strong>{submitted.id}</strong>
                </p>
              )}
              <button type="button" className={styles.secondaryBtn} onClick={() => setSubmitted(null)}>
                Submit another inquiry
              </button>
            </div>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate aria-busy={submitting}>
            {submitError && (
              <div ref={errorRef} tabIndex={-1} className={styles.errorBox} role="alert">
                <FiAlertCircle aria-hidden="true" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Linked product: read-only, the server re-reads it by ID */}
            <div className={styles.productGrid}>
              <label className={styles.field} htmlFor="bulk-product-name">
                <span className={styles.label}>Product Name</span>
                <input id="bulk-product-name" value={product.name || ''} readOnly aria-readonly="true" className={styles.readOnly} />
              </label>
              {product.sku && (
                <label className={styles.field} htmlFor="bulk-product-sku">
                  <span className={styles.label}>SKU</span>
                  <input id="bulk-product-sku" value={product.sku} readOnly aria-readonly="true" className={styles.readOnly} />
                </label>
              )}
              <label className={styles.field} htmlFor="bulk-quantity">
                <span className={styles.label}>Required Quantity <em>*</em></span>
                <input
                  {...fieldProps('quantity')}
                  aria-describedby={errors.quantity ? 'bulk-quantity-error' : 'bulk-quantity-hint'}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={`Min. ${BULK_MIN_QUANTITY}`}
                  required
                />
                {fieldError('quantity') || (
                  <span id="bulk-quantity-hint" className={styles.fieldHint}>Minimum {BULK_MIN_QUANTITY} units</span>
                )}
              </label>
            </div>
            <input type="hidden" name="productId" value={product.id} />

            <div className={styles.grid}>
              <label className={styles.field} htmlFor="bulk-name">
                <span className={styles.label}>Full Name <em>*</em></span>
                <input {...fieldProps('name')} autoComplete="name" placeholder="Enter your full name" required />
                {fieldError('name')}
              </label>
              <label className={styles.field} htmlFor="bulk-phone">
                <span className={styles.label}>Phone Number <em>*</em></span>
                <PhoneInput
                  id="bulk-phone"
                  required
                  label="Phone number"
                  country={phoneCountry}
                  value={form.phone}
                  disabled={submitting}
                  invalid={Boolean(errors.phone)}
                  describedBy={errors.phone ? 'bulk-phone-error' : undefined}
                  onChange={({ country, number }) => {
                    phoneEditedRef.current = true;
                    setPhoneCountry(country);
                    updateField('phone', number, country);
                  }}
                  onBlur={checkField('phone')}
                />
                {fieldError('phone')}
              </label>
              <label className={styles.field} htmlFor="bulk-email">
                <span className={styles.label}>Email Address <em>*</em></span>
                <input {...fieldProps('email')} type="email" autoComplete="email" placeholder="name@company.com" required />
                {fieldError('email')}
              </label>
              <label className={styles.field} htmlFor="bulk-company">
                <span className={styles.label}>Company / Organization Name <small>(Optional)</small></span>
                <input {...fieldProps('company')} autoComplete="organization" placeholder="Enter company name" />
                {fieldError('company')}
              </label>
              <label className={`${styles.field} ${styles.fullWidth}`} htmlFor="bulk-requirements">
                <span className={styles.label}>Additional Requirements <small>(Optional)</small></span>
                <textarea
                  {...fieldProps('requirements')}
                  rows={4}
                  placeholder="Branding / logo printing, delivery date, packaging, etc."
                />
                {fieldError('requirements')}
              </label>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Submitting inquiry…' : 'Submit Bulk Order Inquiry'}
            </button>
            <p className={styles.formFootnote}>
              This is an inquiry, not an order. No payment is taken and prices are not changed. Our team will confirm bulk
              pricing, eligibility and availability with you.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};

export default BulkOrderInquiry;
