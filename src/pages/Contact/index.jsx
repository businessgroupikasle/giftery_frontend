import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { isValidEmail, isValidMobile } from '../../utils/validation';
import { Link } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import { ROUTES } from '@constants/routes';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import { formatEnquiryId } from '@utils/formatters';
import styles from './Contact.module.css';

/* ── SVG Icon components ─────────────────────────────── */
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 010 .18 2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const HeadphonesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0118 0v6" />
    <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const StoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const PackageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '13px', height: '13px' }}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ── Main Component ──────────────────────────────────── */
const EMAIL_VALIDATION_MESSAGE = 'Please enter a valid email address';
const MAIN_FORM_ERROR_MESSAGES = {
  fullName: 'Please enter your full name',
  phone: 'Please enter a valid 10-digit mobile number',
  inquiryType: 'Please select an inquiry type',
  subject: 'Please enter a subject',
  message: 'Please enter your message',
};
const VALID_INQUIRY_TYPES = new Set([
  'corporate-gifting',
  'bulk-order',
  'personalized-gifts',
  'partnership',
  'general',
]);
const CONTACT_EMAIL_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z]{2,})+$/;

const CATALOGUE_EMAIL_VALIDATION_MESSAGE = 'Please enter a valid email address.';

const getCatalogueEmailError = (value, required = false) => (
  getContactEmailError(value, required) ? CATALOGUE_EMAIL_VALIDATION_MESSAGE : ''
);
const APPOINTMENT_VALIDATION_MESSAGES = {
  name: 'Please enter a valid full name.',
  email: 'Please enter a valid email address.',
  phone: 'Please enter a valid 10-digit mobile number.',
};

const getAppointmentFieldError = (name, value, required = false) => {
  const normalizedValue = value?.trim() || '';
  if (!normalizedValue) return required ? APPOINTMENT_VALIDATION_MESSAGES[name] : '';

  if (name === 'name') {
    return /^[a-zA-Z\s.'-]+$/.test(normalizedValue) && /[a-zA-Z]/.test(normalizedValue)
      ? ''
      : APPOINTMENT_VALIDATION_MESSAGES.name;
  }
  if (name === 'email') {
    return !getContactEmailError(normalizedValue) && /[a-zA-Z0-9]/.test(normalizedValue.split('@')[0])
      ? ''
      : APPOINTMENT_VALIDATION_MESSAGES.email;
  }
  if (name === 'phone') {
    return isValidMobile(normalizedValue) ? '' : APPOINTMENT_VALIDATION_MESSAGES.phone;
  }
  return '';
};
const getContactEmailError = (value, required = false) => {
  const email = value?.trim() || '';
  if (!email) return required ? EMAIL_VALIDATION_MESSAGE : '';
  if (
    email.length > 80
    || !CONTACT_EMAIL_PATTERN.test(email)
    || email.includes('..')
    || !isValidEmail(email)
    || /^\d+$/.test(email)
  ) {
    return EMAIL_VALIDATION_MESSAGE;
  }
  return '';
};

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    inquiryType: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [emailError, setEmailError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Book an Appointment Modal State
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentSubmitted, setAppointmentSubmitted] = useState(false);
  const [appointmentErrors, setAppointmentErrors] = useState({ name: '', email: '', phone: '' });
  const [appointmentData, setAppointmentData] = useState({
    name: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '11:00 AM',
    location: 'Giftery Corporate Gift Store (R.S. Puram, Coimbatore)',
    notes: '',
  });

  // Corporate Catalogue Modal State
  const [showCatalogueModal, setShowCatalogueModal] = useState(false);
  const [catalogueDownloading, setCatalogueDownloading] = useState(false);
  const [catalogueEmailError, setCatalogueEmailError] = useState('');
  const [catalogueForm, setCatalogueForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  // Prevent background scrolling when modals are open (KAN-43)
  useEffect(() => {
    if (showAppointmentModal || showCatalogueModal) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [showAppointmentModal, showCatalogueModal]);

  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === 'phone') nextValue = value.replace(/\D/g, '').slice(0, 10);
    if (name === 'name') nextValue = value.replace(/[^a-zA-Z\s.'-]/g, '');

    setAppointmentData((prev) => ({ ...prev, [name]: nextValue }));
    if (Object.hasOwn(APPOINTMENT_VALIDATION_MESSAGES, name)) {
      setAppointmentErrors((prev) => ({
        ...prev,
        [name]: getAppointmentFieldError(name, nextValue),
      }));
    }
  };

  const handleAppointmentBlur = (e) => {
    const { name, value } = e.target;
    if (!Object.hasOwn(APPOINTMENT_VALIDATION_MESSAGES, name)) return;
    setAppointmentErrors((prev) => ({
      ...prev,
      [name]: getAppointmentFieldError(name, value, true),
    }));
  };

  const handleCatalogueSubmit = async (e) => {
    e.preventDefault();
    if (catalogueDownloading) return;
    if (!catalogueForm.name?.trim() || !/^[a-zA-Z\s.'-]+$/.test(catalogueForm.name.trim())) {
      toast.error('Please enter a valid full name containing only letters');
      return;
    }
    const currentCatalogueEmailError = getCatalogueEmailError(catalogueForm.email, true);
    if (currentCatalogueEmailError) {
      setCatalogueEmailError(currentCatalogueEmailError);
      toast.error(currentCatalogueEmailError);
      return;
    }
    if (!isValidMobile(catalogueForm.phone)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setCatalogueDownloading(true);
    try {
      await axiosInstance.post(ENDPOINTS.ENQUIRIES.SUBMIT, {
        name: catalogueForm.name.trim(),
        email: catalogueForm.email.trim(),
        phone: catalogueForm.phone.trim(),
        subject: 'Corporate Catalogue Request',
        message: `Company: ${catalogueForm.company.trim() || 'Not specified'}\nRequested corporate gifting catalogue from Contact Page.`,
      });
      const link = document.createElement('a');
      link.href = '/downloads/Giftery_Corporate_Catalogue.pdf';
      link.download = 'Giftery_Corporate_Catalogue.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowCatalogueModal(false);
      setCatalogueForm({ name: '', email: '', phone: '', company: '' });
      setCatalogueEmailError('');
      toast.success('Corporate catalogue downloaded successfully!');
      window.dispatchEvent(new Event('enquiries_updated'));
    } catch (err) {
      toast.error('Failed to process catalogue request. Please try again.');
    } finally {
      setCatalogueDownloading(false);
    }
  };

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    const validationErrors = {
      name: getAppointmentFieldError('name', appointmentData.name, true),
      email: getAppointmentFieldError('email', appointmentData.email, true),
      phone: getAppointmentFieldError('phone', appointmentData.phone, true),
    };
    setAppointmentErrors(validationErrors);
    const firstError = validationErrors.name || validationErrors.email || validationErrors.phone;
    if (firstError) {
      toast.error(firstError);
      return;
    }

    const stored = JSON.parse(localStorage.getItem('customer_enquiries') || '[]');
    const readableId = formatEnquiryId(null, new Date(), stored.length);

    const newBooking = {
      id: readableId,
      displayId: readableId,
      name: appointmentData.name,
      email: appointmentData.email,
      phone: appointmentData.phone,
      subject: `Studio Appointment: ${appointmentData.location}`,
      message: `Appointment requested for ${appointmentData.date} at ${appointmentData.timeSlot}. Store: ${appointmentData.location}. Notes: ${appointmentData.notes || 'None'}`,
      status: 'New',
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('customer_enquiries', JSON.stringify([newBooking, ...stored]));
      window.dispatchEvent(new Event('enquiries_updated'));
    } catch (e) { }

    setAppointmentSubmitted(true);
    toast.success('Appointment booked successfully! Our team will confirm your visit.');
    setTimeout(() => {
      setShowAppointmentModal(false);
      setAppointmentSubmitted(false);
      setAppointmentErrors({ name: '', email: '', phone: '' });
      setAppointmentData({
        name: '',
        email: '',
        phone: '',
        date: new Date().toISOString().split('T')[0],
        timeSlot: '11:00 AM',
        location: 'Giftery Corporate Gift Store (R.S. Puram, Coimbatore)',
        notes: '',
      });
    }, 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === 'phone') nextValue = value.replace(/\D/g, '').slice(0, 10);
    if (name === 'fullName') nextValue = value.replace(/[^a-zA-Z\s.'-]/g, '');

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (name === 'email') setEmailError(getContactEmailError(nextValue));
    if (name === 'message') setCharCount(nextValue.length);

    if (Object.hasOwn(MAIN_FORM_ERROR_MESSAGES, name)) {
      let nextError = nextValue.trim() ? '' : MAIN_FORM_ERROR_MESSAGES[name];
      if (name === 'fullName' && (!/^[a-zA-Z\s.'-]+$/.test(nextValue.trim()) || !/[a-zA-Z]/.test(nextValue))) {
        nextError = MAIN_FORM_ERROR_MESSAGES.fullName;
      }
      if (name === 'phone' && !isValidMobile(nextValue)) nextError = MAIN_FORM_ERROR_MESSAGES.phone;
      if (name === 'inquiryType' && !VALID_INQUIRY_TYPES.has(nextValue)) nextError = MAIN_FORM_ERROR_MESSAGES.inquiryType;
      setFormErrors((prev) => ({ ...prev, [name]: nextError }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullName = formData.fullName.trim();
    const validationErrors = {
      fullName: fullName && /^[a-zA-Z\s.'-]+$/.test(fullName) && /[a-zA-Z]/.test(fullName)
        ? ''
        : MAIN_FORM_ERROR_MESSAGES.fullName,
      phone: isValidMobile(formData.phone) ? '' : MAIN_FORM_ERROR_MESSAGES.phone,
      inquiryType: VALID_INQUIRY_TYPES.has(formData.inquiryType) ? '' : MAIN_FORM_ERROR_MESSAGES.inquiryType,
      subject: formData.subject.trim() ? '' : MAIN_FORM_ERROR_MESSAGES.subject,
      message: formData.message.trim() ? '' : MAIN_FORM_ERROR_MESSAGES.message,
    };
    const currentEmailError = getContactEmailError(formData.email, true);
    setFormErrors(validationErrors);
    setEmailError(currentEmailError);

    if (currentEmailError || Object.values(validationErrors).some(Boolean)) return;

    try {
      const res = await axiosInstance.post(ENDPOINTS.ENQUIRIES.SUBMIT, {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone || 'Not provided',
        subject: formData.subject || formData.inquiryType || 'General Inquiry',
        message: formData.message,
      });

      const stored = JSON.parse(localStorage.getItem('customer_enquiries') || '[]');
      const fallbackId = formatEnquiryId(null, new Date(), stored.length);

      const savedItem = res.data?.data || res.data || {
        id: fallbackId,
        displayId: fallbackId,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone || 'Not provided',
        subject: formData.subject || formData.inquiryType || 'General Inquiry',
        message: formData.message,
        status: 'New',
        createdAt: new Date().toISOString(),
      };
      if (!savedItem.displayId) {
        savedItem.displayId = savedItem.enquiryNumber || formatEnquiryId(savedItem.id, savedItem.createdAt, stored.length);
      }

      try {
        localStorage.setItem('customer_enquiries', JSON.stringify([savedItem, ...stored]));
        window.dispatchEvent(new Event('enquiries_updated'));
      } catch (e) { }

      setSubmitted(true);
      toast.success('Your enquiry has been submitted successfully!');
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          company: '',
          subject: '',
          inquiryType: '',
          message: '',
        });
        setCharCount(0);
        setEmailError('');
        setFormErrors({});
      }, 5000);
    } catch (err) {
      setSubmitted(true);
      toast.success('Your enquiry has been submitted!');
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          company: '',
          subject: '',
          inquiryType: '',
          message: '',
        });
        setCharCount(0);
        setEmailError('');
        setFormErrors({});
      }, 5000);
    }
  };

  return (
    <Layout>
      <div className={styles.pageContainer}>

        {/* ── SECTION 1: HERO ── */}
        <section className={styles.heroSection}>
          {/* Background image + overlay */}
          <img
            src="/images/contact_hero_bg.webp"
            alt="GIFTERY luxury gift collection"
            className={styles.heroBgImage}
          />
          <div className={styles.heroOverlay} />

          {/* Left — headline + trust badges */}
          <div className={styles.heroLeft}>
            <p className={styles.getInTouchLabel}>Get In Touch</p>
            <h1 className={styles.heroTitle}>
              We&apos;re Here to<br />
              <span className={styles.heroTitleGold}>Help You Gift Better!</span>
            </h1>
            <div className={styles.titleUnderline} />
            <p className={styles.heroSubtitle}>
              Have a question, need a quote, or want to discuss your corporate gifting needs? Our team is just a message away.
            </p>

            {/* Trust Badges */}
            <div className={styles.heroBadges}>
              <div className={styles.heroBadgeItem}>
                <div className={styles.badgeIconCircle}>
                  <HeadphonesIcon />
                </div>
                <p className={styles.badgeTitle}>Quick Response</p>
                <p className={styles.badgeDesc}>We reply within<br />24 hours</p>
              </div>
              <div className={styles.heroBadgeItem}>
                <div className={styles.badgeIconCircle}>
                  <ShieldIcon />
                </div>
                <p className={styles.badgeTitle}>Reliable Support</p>
                <p className={styles.badgeDesc}>Dedicated assistance<br />for your business</p>
              </div>
              <div className={styles.heroBadgeItem}>
                <div className={styles.badgeIconCircle}>
                  <LockIcon />
                </div>
                <p className={styles.badgeTitle}>100% Confidential</p>
                <p className={styles.badgeDesc}>Your information is<br />always secure</p>
              </div>
            </div>
          </div>

          {/* Right — Send Us a Message Form Card */}
          <div className={styles.heroRight}>
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Send Us a Message</h2>
              <div className={styles.formTitleUnderline} />

              {submitted ? (
                <div className={styles.successMessage}>
                  <h4>Message Sent Successfully!</h4>
                  <p>Our gifting specialist will get back to you within 24 hours.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        fullName: '',
                        email: '',
                        phone: '',
                        company: '',
                        subject: '',
                        inquiryType: '',
                        message: '',
                      });
                      setCharCount(0);
                      setEmailError('');
                      setFormErrors({});
        setEmailError('');
        setFormErrors({});
                    }}
                    style={{
                      marginTop: '1rem',
                      background: '#d99b26',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.6rem 1.25rem',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className={styles.formGrid}>
                    {/* Row 1 */}
                    <div className={styles.formField}>
                      <input
                        className={`${styles.formInput} ${formErrors.fullName ? styles.formInputError : ''}`}
                        type="text"
                        name="fullName"
                        placeholder="Your Full Name *"
                        required
                        maxLength={50}
                        value={formData.fullName}
                        onChange={handleChange}
                        aria-invalid={Boolean(formErrors.fullName)}
                        aria-describedby={formErrors.fullName ? 'contact-name-error' : undefined}
                      />
                      {formErrors.fullName && <p id="contact-name-error" className={styles.fieldError} role="alert">{formErrors.fullName}</p>}
                    </div>
                    <div className={styles.formField}>
                      <input
                        className={`${styles.formInput} ${emailError ? styles.formInputError : ''}`}
                        type="email"
                        name="email"
                        placeholder="Your Email Address *"
                        required
                        maxLength={80}
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => setEmailError(getContactEmailError(formData.email, true))}
                        aria-invalid={Boolean(emailError)}
                        aria-describedby={emailError ? 'contact-email-error' : undefined}
                      />
                      {emailError && (
                        <p id="contact-email-error" className={styles.fieldError} role="alert">
                          {emailError}
                        </p>
                      )}
                    </div>

                    {/* Row 2 */}
                    <div className={styles.formField}>
                      <input
                        className={`${styles.formInput} ${formErrors.phone ? styles.formInputError : ''}`}
                        type="tel"
                        name="phone"
                        placeholder="10-digit Mobile Number *"
                        required
                        maxLength={10}
                        pattern="[6-9][0-9]{9}"
                        inputMode="numeric"
                        value={formData.phone}
                        onChange={handleChange}
                        aria-invalid={Boolean(formErrors.phone)}
                        aria-describedby={formErrors.phone ? 'contact-phone-error' : undefined}
                      />
                      {formErrors.phone && <p id="contact-phone-error" className={styles.fieldError} role="alert">{formErrors.phone}</p>}
                    </div>
                    <input
                      className={styles.formInput}
                      type="text"
                      name="company"
                      placeholder="Company Name"
                      value={formData.company}
                      onChange={handleChange}
                    />

                    {/* Row 3 — Inquiry Type */}
                    <div className={styles.formGroupFull}>
                      <select
                        className={`${styles.formSelect} ${formErrors.inquiryType ? styles.formInputError : ''}`}
                        name="inquiryType"
                        required
                        value={formData.inquiryType}
                        onChange={handleChange}
                        aria-invalid={Boolean(formErrors.inquiryType)}
                        aria-describedby={formErrors.inquiryType ? 'contact-inquiry-error' : undefined}
                      >
                        <option value="" disabled>Select Inquiry Type *</option>
                        <option value="corporate-gifting">Corporate Gifting</option>
                        <option value="bulk-order">Bulk Order</option>
                        <option value="personalized-gifts">Personalized Gifts</option>
                        <option value="partnership">Partnership / Collaboration</option>
                        <option value="general">General Inquiry</option>
                      </select>
                      {formErrors.inquiryType && <p id="contact-inquiry-error" className={styles.fieldError} role="alert">{formErrors.inquiryType}</p>}
                    </div>

                    {/* Row 4 — Subject */}
                    <div className={styles.formGroupFull}>
                      <input
                        className={`${styles.formInput} ${formErrors.subject ? styles.formInputError : ''}`}
                        type="text"
                        name="subject"
                        placeholder="Subject *"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        aria-invalid={Boolean(formErrors.subject)}
                        aria-describedby={formErrors.subject ? 'contact-subject-error' : undefined}
                      />
                      {formErrors.subject && <p id="contact-subject-error" className={styles.fieldError} role="alert">{formErrors.subject}</p>}
                    </div>

                    {/* Row 5 — Message */}
                    <div className={styles.formGroupFull}>
                      <textarea
                        className={`${styles.formTextarea} ${formErrors.message ? styles.formInputError : ''}`}
                        name="message"
                        placeholder="Your Message *"
                        required
                        maxLength={500}
                        value={formData.message}
                        onChange={handleChange}
                        aria-invalid={Boolean(formErrors.message)}
                        aria-describedby={formErrors.message ? 'contact-message-error' : undefined}
                      />
                      {formErrors.message && <p id="contact-message-error" className={styles.fieldError} role="alert">{formErrors.message}</p>}
                      <p className={styles.charCount}>{charCount} / 500</p>
                    </div>

                    {/* Submit */}
                    <div className={styles.formGroupFull}>
                      <button type="submit" className={styles.sendBtn} disabled={submitted || Boolean(emailError) || Object.values(formErrors).some(Boolean)}>
                        SEND MESSAGE <SendIcon />
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ── TWO LOCATIONS MAPS SECTION ── */}
        <section className={styles.twoMapsContainer}>
          <div className={styles.mapsSectionHeader}>
            <p className={styles.mapsSectionSublabel}>OUR LOCATIONS</p>
            <h2 className={styles.mapsSectionTitle}>Visit Our Offices & Experience Studios</h2>
            <div className={styles.mapsTitleUnderline} />
          </div>

          <div className={styles.mapsTwoGrid}>
            {/* Map 1: Corporate HQ (Noida, Sector 62) */}
            <div className={styles.mapCard}>
              <div className={styles.mapCardHeader}>
                <div className={styles.mapCardTitleGroup}>
                  <span className={styles.mapBadgeHeadquarters}>Corporate Gift Store</span>
                  <h3 className={styles.mapTitleText}>Corporate Office</h3>
                  <p className={styles.mapAddressSubtext}>39, Ramachandra Rd, R.S. Puram, Coimbatore, Tamil Nadu 641002,</p>
                </div>
              </div>
              <div className={styles.mapWrapper}>
                <iframe
                  className={styles.mapFrame}
                  title="Giftery Corporate Gift Store Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.4277011676213!2d76.9546855!3d11.006502099999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8593823cf77fd%3A0x81050ca268e468c3!2sGiftery!5e0!3m2!1sen!2sin!4v1786008766904!5m2!1sen!2sin"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
                {/* <div className={styles.mapOfficeCard}>
                  <div className={styles.mapOfficePinIcon}>
                    <MapPinIcon />
                  </div>
                  <div>
                    <p className={styles.mapOfficeTitle}>Corporate Headquarters</p>
                    <p className={styles.mapOfficeAddress}>
                      123, Business Park, Sector 62,<br />Noida, Uttar Pradesh 201309
                    </p>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Map 2: Toys & Games Store */}
            <div className={styles.mapCard}>
              <div className={styles.mapCardHeader}>
                <div className={styles.mapCardTitleGroup}>
                  <span className={styles.mapBadgeStudio}>TOYS & GAMES STORE</span>
                  <h3 className={styles.mapTitleText}>Giftery Toys & Custom Gifts Store</h3>
                  <p className={styles.mapAddressSubtext}>Ramanathapuram, Coimbatore, Tamil Nadu 641045</p>
                </div>
              </div>
              <div className={styles.mapWrapper}>
                <iframe
                  className={styles.mapFrame}
                  title="Giftery Toys Store Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.5386567988758!2d76.98877639999999!3d10.998153199999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba85948b846a5fb%3A0xf7aa26b76aa39cb7!2sGiftery%20-%20Fancy%20Gifts%20Items%20%7C%20Stationary%20%7C%20Engraving%20and%20Customized%20Gifts%20%7C%20Personalized%20Gifts%20%7C%20Toys!5e0!3m2!1sen!2sin!4v1786008856269!5m2!1sen!2sin"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: BOTTOM INFO ROW (All 3 in the same line) ── */}
        <div className={styles.bottomSection}>

          {/* 1. Get In Touch Info Card */}
          <div className={styles.contactInfoCard}>
            <h3 className={styles.contactInfoTitle}>Get In Touch</h3>

            <div className={styles.contactInfoItem}>
              <div className={styles.contactIconBubble}>
                <PhoneIcon />
              </div>
              <div>
                <p className={styles.contactInfoLabel}>Phone</p>
                <p className={styles.contactInfoValue}>
                  <a href="tel:+917010121945" style={{ color: 'inherit', textDecoration: 'none' }}>+91 70101 21945</a>
                </p>
              </div>
            </div>

            <div className={styles.contactInfoItem}>
              <div className={styles.contactIconBubble}>
                <MailIcon />
              </div>
              <div>
                <p className={styles.contactInfoLabel}>Email</p>
                <p className={styles.contactInfoValue}>
                  <a href="mailto:giftery2023@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>giftery2023@gmail.com</a>
                </p>
              </div>
            </div>

            <div className={styles.contactInfoItem}>
              <div className={styles.contactIconBubble}>
                <MapPinIcon />
              </div>
              <div>
                <p className={styles.contactInfoLabel}>Corporate HQ & Store</p>
                <p className={styles.contactInfoValue}>
                  39, Ramachandra Rd, R.S. Puram,<br />Coimbatore, Tamil Nadu 641002
                </p>
              </div>
            </div>

            <div className={styles.contactInfoItem}>
              <div className={styles.contactIconBubble}>
                <ClockIcon />
              </div>
              <div>
                <p className={styles.contactInfoLabel}>Business Hours</p>
                <p className={styles.contactInfoValue}>Mon – Sat: 9:30 AM – 7:00 PM</p>
              </div>
            </div>
          </div>

          {/* 2. Visit Studio Card */}
          <div className={styles.studioCard}>
            <div className={styles.rightCardHeader}>
              <div className={styles.rightCardIconBox}>
                <StoreIcon />
              </div>
              <h4 className={styles.studioCardTitle}>Visit Our Experience Studio</h4>
            </div>
            <p className={styles.studioCardDesc}>
              See, feel and experience our premium corporate gifts in person at our Experience Hubs.
            </p>
            <button
              type="button"
              onClick={() => setShowAppointmentModal(true)}
              className={styles.studioLink}
              style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', textAlign: 'left', padding: 0 }}
            >
              BOOK AN APPOINTMENT <ArrowRight />
            </button>
          </div>

          {/* 3. Bulk Orders Card */}
          <div className={styles.bulkCard}>
            <div className={styles.rightCardHeader}>
              <div className={styles.rightCardIconBox}>
                <PackageIcon />
              </div>
              <h4 className={styles.bulkCardTitle}>Bulk Orders?</h4>
            </div>
            <p className={styles.bulkCardDesc}>
              Get special pricing and exclusive benefits on orders over 25+ units with custom branding.
            </p>
            <button
              type="button"
              onClick={() => setShowCatalogueModal(true)}
              className={styles.bulkLink}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                font: 'inherit',
              }}
            >
              REQUEST CORPORATE CATALOGUE <ArrowRight />
            </button>
          </div>
        </div>

      </div>

      {/* ── BOOK AN APPOINTMENT MODAL ── */}
      {showAppointmentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }} onClick={() => setShowAppointmentModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label="Close modal"
              title="Close modal"
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a',
                transition: 'all 0.2s ease',
                zIndex: 10,
              }}
              onClick={() => setShowAppointmentModal(false)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e2e8f0';
                e.currentTarget.style.color = '#000000';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#0f172a';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              <CloseIcon />
            </button>
            <h3 style={{ margin: '0 0 0.4rem 0', color: '#0f172a', fontSize: '1.35rem', fontWeight: '800' }}>
              Book Studio Appointment
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', color: '#64748b', fontSize: '0.88rem' }}>
              Schedule a personalized consultation & tour at our experience store.
            </p>

            {appointmentSubmitted ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}></span>
                <h4 style={{ margin: 0, color: '#166534', fontSize: '1.1rem', fontWeight: '800' }}>Appointment Confirmed!</h4>
                <p style={{ margin: '0.5rem 0 0 0', color: '#15803d', fontSize: '0.85rem' }}>We look forward to seeing you. Check your email for details.</p>
              </div>
            ) : (
              <form onSubmit={handleAppointmentSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={appointmentData.name}
                      onChange={handleAppointmentChange}
                      onBlur={handleAppointmentBlur}
                    aria-invalid={Boolean(appointmentErrors.name)}
                    aria-describedby={appointmentErrors.name ? "appointment-name-error" : undefined}
                    placeholder="Enter your full name"
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: `1px solid ${appointmentErrors.name ? '#dc2626' : '#cbd5e1'}`, outline: 'none', fontSize: '0.88rem' }}
                  />
                  {appointmentErrors.name && (
                    <p id="appointment-name-error" className={styles.fieldError} role="alert">
                      {appointmentErrors.name}
                    </p>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={appointmentData.email}
                      onChange={handleAppointmentChange}
                      onBlur={handleAppointmentBlur}
                      aria-invalid={Boolean(appointmentErrors.email)}
                      aria-describedby={appointmentErrors.email ? "appointment-email-error" : undefined}
                      placeholder="name@company.com"
                      required
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: `1px solid ${appointmentErrors.email ? '#dc2626' : '#cbd5e1'}`, outline: 'none', fontSize: '0.88rem' }}
                    />
                    {appointmentErrors.email && (
                      <p id="appointment-email-error" className={styles.fieldError} role="alert">
                        {appointmentErrors.email}
                      </p>
                    )}

                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={appointmentData.phone}
                      onChange={handleAppointmentChange}
                      onBlur={handleAppointmentBlur}
                      aria-invalid={Boolean(appointmentErrors.phone)}
                      aria-describedby={appointmentErrors.phone ? "appointment-phone-error" : undefined}
                      placeholder="10-digit mobile number"
                      required
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      inputMode="numeric"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: `1px solid ${appointmentErrors.phone ? '#dc2626' : '#cbd5e1'}`, outline: 'none', fontSize: '0.88rem' }}
                    />
                    {appointmentErrors.phone && (
                      <p id="appointment-phone-error" className={styles.fieldError} role="alert">
                        {appointmentErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>Store Location *</label>
                  <select
                    name="location"
                    value={appointmentData.location}
                    onChange={handleAppointmentChange}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem', background: '#ffffff' }}
                  >
                    <option value="Giftery Corporate Gift Store (R.S. Puram, Coimbatore)">Corporate Gift Store (R.S. Puram, Coimbatore)</option>
                    <option value="Giftery Toys & Custom Gifts Store (Ramanathapuram, Coimbatore)">Toys & Custom Gifts Store (Ramanathapuram, Coimbatore)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>Preferred Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={appointmentData.date}
                      onChange={handleAppointmentChange}
                      required
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>Time Slot *</label>
                    <select
                      name="timeSlot"
                      value={appointmentData.timeSlot}
                      onChange={handleAppointmentChange}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem', background: '#ffffff' }}
                    >
                      <option value="10:00 AM">10:00 AM - 11:30 AM</option>
                      <option value="11:30 AM">11:30 AM - 01:00 PM</option>
                      <option value="02:00 PM">02:00 PM - 03:30 PM</option>
                      <option value="03:30 PM">03:30 PM - 05:00 PM</option>
                      <option value="05:00 PM">05:00 PM - 06:30 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>Specific Requirements / Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={appointmentData.notes}
                    onChange={handleAppointmentChange}
                    placeholder="E.g. Looking for 100+ executive gift hampers..."
                    rows="2"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem', resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={Object.values(appointmentErrors).some(Boolean)}
                  style={{ marginTop: '0.5rem', background: '#dfa843', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.85rem', fontWeight: '800', fontSize: '0.9rem', cursor: Object.values(appointmentErrors).some(Boolean) ? 'not-allowed' : 'pointer', opacity: Object.values(appointmentErrors).some(Boolean) ? 0.6 : 1, boxShadow: '0 4px 12px rgba(223, 168, 67, 0.35)' }}
                >
                  CONFIRM APPOINTMENT
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── CORPORATE CATALOGUE DOWNLOAD MODAL (KAN-41) ── */}
      {showCatalogueModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => !catalogueDownloading && setShowCatalogueModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close modal"
              title="Close modal"
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a',
                transition: 'all 0.2s ease',
                zIndex: 10,
              }}
              onClick={() => setShowCatalogueModal(false)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e2e8f0';
                e.currentTarget.style.color = '#000000';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#0f172a';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              <CloseIcon />
            </button>

            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1rem',
              }}
            >

            </div>

            <h3 style={{ margin: '0 0 0.4rem 0', color: '#0f172a', fontSize: '1.3rem', fontWeight: '800' }}>
              Download Corporate Catalogue
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', color: '#64748b', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Please share your business details to download our complete 2026 Corporate Gifts Catalogue (PDF).
            </p>

            <form onSubmit={handleCatalogueSubmit} noValidate style={{ display: 'grid', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Name (letters only)"
                  value={catalogueForm.name}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '');
                    setCatalogueForm({ ...catalogueForm, name: cleaned });
                  }}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={80}
                    placeholder="name@company.com"
                    value={catalogueForm.email}
                    onChange={(e) => {
                      const { value } = e.target;
                      setCatalogueForm({ ...catalogueForm, email: value });
                      setCatalogueEmailError(getCatalogueEmailError(value));
                    }}
                    onBlur={() => setCatalogueEmailError(getCatalogueEmailError(catalogueForm.email, true))}
                    aria-invalid={Boolean(catalogueEmailError)}
                    aria-describedby={catalogueEmailError ? 'catalogue-email-error' : undefined}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: `1px solid ${catalogueEmailError ? '#dc2626' : '#cbd5e1'}`, outline: 'none', fontSize: '0.88rem' }}
                  />
                  {catalogueEmailError && (
                    <p id="catalogue-email-error" className={styles.fieldError} role="alert">
                      {catalogueEmailError}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                    placeholder="10-digit number"
                    value={catalogueForm.phone}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setCatalogueForm({ ...catalogueForm, phone: cleaned });
                    }}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Your organization"
                  value={catalogueForm.company}
                  onChange={(e) => setCatalogueForm({ ...catalogueForm, company: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={catalogueDownloading || Boolean(catalogueEmailError)}
                style={{
                  marginTop: '0.5rem',
                  background: '#dfa843',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: catalogueDownloading ? 'wait' : catalogueEmailError ? 'not-allowed' : 'pointer',
                  opacity: catalogueEmailError ? 0.6 : 1,
                  boxShadow: '0 4px 12px rgba(223, 168, 67, 0.35)',
                }}
              >
                {catalogueDownloading ? 'Preparing PDF...' : 'Submit & Download PDF'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Contact;
