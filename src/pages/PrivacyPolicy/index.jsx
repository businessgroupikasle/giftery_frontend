import { Link } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import { ROUTES } from '@constants/routes';
import styles from './PrivacyPolicy.module.css';

const PRIVACY_SECTIONS = [
  {
    id: 1,
    title: 'Information We Collect',
    content: `We collect personal information that you provide to us when registering an account, placing corporate or personalized gift orders, requesting custom quotes, or contacting customer support.`,
    bullets: [
      'Personal Identifiers: Full name, company name, GST number, email address, phone number, and delivery address.',
      'Order & Quotation Data: Customization text, logo file uploads, order history, and payment transaction references.',
      'Technical Log Data: IP address, browser type, device information, and site interaction cookies.',
    ],
  },
  {
    id: 2,
    title: 'How We Use Your Information',
    content: `Your information is used strictly to fulfill your orders, process custom gifting requests, provide customer support, and improve your platform experience.`,
    bullets: [
      'Processing and shipping customized gifts across India.',
      'Generating corporate quote estimates and invoices.',
      'Sending order updates, tracking information, and customer care responses.',
      'Ensuring store security, fraud prevention, and regulatory compliance.',
    ],
  },
  {
    id: 3,
    title: 'Data Sharing & Third Parties',
    content: `Giftery respects your confidentiality. We do not sell, rent, or trade your personal or business data to third parties for marketing purposes.`,
    bullets: [
      'Logistics & Delivery Partners: Shared solely for dispatching packages to your recipient address.',
      'Secure Payment Gateways: Encrypted payment processing directly with RBI-regulated payment gateways.',
      'Legal Requirements: Disclosed only when required by law or government authorities.',
    ],
  },
  {
    id: 4,
    title: 'Data Security & Protection',
    content: `We employ industry-standard SSL encryption, secure servers, access controls, and firewall protections to safeguard your personal data and uploaded corporate logo artwork.`,
  },
  {
    id: 5,
    title: 'Cookies & Tracking',
    content: `Our website uses cookies to maintain session states, remember shopping cart items, and collect general analytical insights to optimize website performance. You can disable cookies in your browser settings.`,
  },
  {
    id: 6,
    title: 'Your Privacy Rights',
    content: `You have the right to access, update, or request deletion of your account information at any time by contacting our Privacy Team.`,
  },
];

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className={styles.privacyPage}>
        {/* Hero Banner Header */}
        <section className={styles.heroHeader}>
          <nav className={styles.breadcrumb}>
            <Link to={ROUTES.HOME}>Home</Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <span className={styles.breadcrumbActive}>Privacy Policy</span>
          </nav>
          <span className={styles.topSubheading}>TRUST &amp; PRIVACY</span>
          <h1 className={styles.heroTitle}>
            Privacy <span className={styles.goldText}>Policy</span>
          </h1>
          <p className={styles.heroSubtext}>
            At Giftery, we are committed to protecting your personal data, corporate information, and custom branding privacy.
          </p>
        </section>

        {/* Main Content Area */}
        <div className={styles.contentContainer}>
          <div className={styles.introBox}>
            <p className={styles.introText}>
              This Privacy Policy explains how Giftery collects, uses, protects, and handles your information when you visit our website or order customized corporate gifts.
            </p>
          </div>

          {/* Render Sections */}
          {PRIVACY_SECTIONS.map((sec) => (
            <article key={sec.id} className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>0{sec.id}</span>
                <h2 className={styles.sectionTitle}>{sec.title}</h2>
              </div>
              <p className={styles.paragraph}>{sec.content}</p>
              {sec.bullets && (
                <ul className={styles.bulletList}>
                  {sec.bullets.map((item, idx) => (
                    <li key={idx} className={styles.bulletItem}>
                      <span className={styles.bulletDot}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}

          {/* Support Section */}
          <div className={styles.contactSupportBox}>
            <h3 className={styles.supportTitle}>Questions About Your Data Privacy?</h3>
            <p className={styles.supportDesc}>
              Contact our Data Protection Officer for any privacy concerns, data deletion requests, or information inquiries.
            </p>
            <Link to={ROUTES.CONTACT} className={styles.supportBtn}>
              GET IN TOUCH &rarr;
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
