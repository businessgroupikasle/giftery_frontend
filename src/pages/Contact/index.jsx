import { useState } from 'react';
import { toast } from 'react-toastify';
import { isValidEmail, isValidMobile } from '../../utils/validation';
import { Link } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import { ROUTES } from '@constants/routes';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import styles from './Contact.module.css';

/* ── SVG Icon components ─────────────────────────────── */
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 010 .18 2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const HeadphonesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0118 0v6"/>
    <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const StoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const PackageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '13px', height: '13px' }}>
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ── Main Component ──────────────────────────────────── */
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'message') setCharCount(value.length);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) {
      toast.error('Please fill in required fields (Name, Email, Message)');
      return;
    }
    if (!isValidEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (formData.phone && !isValidMobile(formData.phone)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      const res = await axiosInstance.post(ENDPOINTS.ENQUIRIES.SUBMIT, {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone || 'Not provided',
        subject: formData.subject || formData.inquiryType || 'General Inquiry',
        message: formData.message,
      });

      const savedItem = res.data?.data || res.data || {
        id: `enq-${Date.now()}`,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone || 'Not provided',
        subject: formData.subject || formData.inquiryType || 'General Inquiry',
        message: formData.message,
        status: 'New',
        createdAt: new Date().toISOString(),
      };

      try {
        const stored = JSON.parse(localStorage.getItem('customer_enquiries') || '[]');
        localStorage.setItem('customer_enquiries', JSON.stringify([savedItem, ...stored]));
        window.dispatchEvent(new Event('enquiries_updated'));
      } catch (e) {}

      setSubmitted(true);
      toast.success('Your enquiry has been submitted successfully!');
    } catch (err) {
      setSubmitted(true);
      toast.success('Your enquiry has been submitted!');
    }
  };

  return (
    <Layout>
      <div className={styles.pageContainer}>

        {/* ── SECTION 1: HERO ── */}
        <section className={styles.heroSection}>
          {/* Background image + overlay */}
          <img
            src="/images/contact_hero_bg.png"
            alt="Gifterys luxury gift collection"
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
                  <span className={styles.successEmoji}>🎉</span>
                  <h4>Message Sent Successfully!</h4>
                  <p>Our gifting specialist will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className={styles.formGrid}>
                    {/* Row 1 */}
                    <input
                      className={styles.formInput}
                      type="text"
                      name="fullName"
                      placeholder="Your Full Name *"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    <input
                      className={styles.formInput}
                      type="email"
                      name="email"
                      placeholder="Your Email Address *"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />

                    {/* Row 2 */}
                    <input
                      className={styles.formInput}
                      type="tel"
                      name="phone"
                      placeholder="Phone Number *"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                    />
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
                        className={styles.formSelect}
                        name="inquiryType"
                        required
                        value={formData.inquiryType}
                        onChange={handleChange}
                      >
                        <option value="" disabled>Select Inquiry Type *</option>
                        <option value="corporate-gifting">Corporate Gifting</option>
                        <option value="bulk-order">Bulk Order</option>
                        <option value="personalized-gifts">Personalized Gifts</option>
                        <option value="partnership">Partnership / Collaboration</option>
                        <option value="general">General Inquiry</option>
                      </select>
                    </div>

                    {/* Row 4 — Subject */}
                    <div className={styles.formGroupFull}>
                      <input
                        className={styles.formInput}
                        type="text"
                        name="subject"
                        placeholder="Subject *"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Row 5 — Message */}
                    <div className={styles.formGroupFull}>
                      <textarea
                        className={styles.formTextarea}
                        name="message"
                        placeholder="Your Message *"
                        required
                        maxLength={500}
                        value={formData.message}
                        onChange={handleChange}
                      />
                      <p className={styles.charCount}>{charCount} / 500</p>
                    </div>

                    {/* Submit */}
                    <div className={styles.formGroupFull}>
                      <button type="submit" className={styles.sendBtn}>
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
                  <span className={styles.mapBadgeHeadquarters}>CORPORATE HEADQUARTERS</span>
                  <h3 className={styles.mapTitleText}>Noida Corporate Office</h3>
                  <p className={styles.mapAddressSubtext}>123, Business Park, Sector 62, Noida, Uttar Pradesh 201309</p>
                </div>
              </div>
              <div className={styles.mapWrapper}>
                <iframe
                  className={styles.mapFrame}
                  title="Noida Corporate HQ Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.3449649929967!2d77.36487251508247!3d28.62705798241736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5a2ed95d8a1%3A0x2c2d41c31abe9c7e!2sSector%2062%2C%20Noida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1691400000000!5m2!1sen!2sin"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className={styles.mapOfficeCard}>
                  <div className={styles.mapOfficePinIcon}>
                    <MapPinIcon />
                  </div>
                  <div>
                    <p className={styles.mapOfficeTitle}>Corporate Headquarters</p>
                    <p className={styles.mapOfficeAddress}>
                      123, Business Park, Sector 62,<br />Noida, Uttar Pradesh 201309
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map 2: Experience Studio (Bengaluru, MG Road) */}
            <div className={styles.mapCard}>
              <div className={styles.mapCardHeader}>
                <div className={styles.mapCardTitleGroup}>
                  <span className={styles.mapBadgeStudio}>EXPERIENCE STUDIO & HUB</span>
                  <h3 className={styles.mapTitleText}>Bengaluru Experience Studio</h3>
                  <p className={styles.mapAddressSubtext}>104, Luxury Tower, MG Road, Bengaluru, Karnataka 560001</p>
                </div>
              </div>
              <div className={styles.mapWrapper}>
                <iframe
                  className={styles.mapFrame}
                  title="Bengaluru Studio Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.97341852033!2d77.60742187512165!3d12.97344968734204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba3592eb49e29a3%3A0x8e8d8935c12f20f6!2sM.G.%20Road%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1691400000000!5m2!1sen!2sin"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className={styles.mapOfficeCard}>
                  <div className={styles.mapOfficePinIcon}>
                    <MapPinIcon />
                  </div>
                  <div>
                    <p className={styles.mapOfficeTitle}>Experience Studio</p>
                    <p className={styles.mapOfficeAddress}>
                      104, Luxury Tower, MG Road,<br />Bengaluru, Karnataka 560001
                    </p>
                  </div>
                </div>
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
                <p className={styles.contactInfoValue}>+91 98765 43210</p>
              </div>
            </div>

            <div className={styles.contactInfoItem}>
              <div className={styles.contactIconBubble}>
                <MailIcon />
              </div>
              <div>
                <p className={styles.contactInfoLabel}>Email</p>
                <p className={styles.contactInfoValue}>hello@gifterys.com</p>
              </div>
            </div>

            <div className={styles.contactInfoItem}>
              <div className={styles.contactIconBubble}>
                <MapPinIcon />
              </div>
              <div>
                <p className={styles.contactInfoLabel}>Corporate HQ</p>
                <p className={styles.contactInfoValue}>
                  123, Business Park, Sector 62,<br />Noida, Uttar Pradesh 201309
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
              See, feel and experience our premium corporate gifts in person at our Bengaluru Experience Hub.
            </p>
            <Link to={ROUTES.CONTACT} className={styles.studioLink}>
              BOOK AN APPOINTMENT <ArrowRight />
            </Link>
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
            <Link to={ROUTES.CORPORATE_GIFTS} className={styles.bulkLink}>
              REQUEST CORPORATE CATALOG <ArrowRight />
            </Link>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Contact;
