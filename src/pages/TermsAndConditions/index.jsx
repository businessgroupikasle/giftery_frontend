import { Link } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import { ROUTES } from '@constants/routes';
import styles from './TermsAndConditions.module.css';

const TERMS_SECTIONS = [
  {
    id: 1,
    title: 'Acceptance of Terms',
    content: `Welcome to Giftery. By accessing or using our website, services, and customized gifting platform, you agree to be bound by these Terms and Conditions. If you do not agree to all of these terms, please do not use our services.`,
  },
  {
    id: 2,
    title: 'Custom Orders & Personalization',
    content: `All corporate and personalized gift items are customized according to customer instructions, logo files, and message inputs. Customers are responsible for reviewing proofs and verifying spelling, design layout, and branding specifications before final confirmation.`,
    bullets: [
      'Artwork and logo files must be provided in high-resolution vector or PNG formats.',
      'Once custom production has commenced, modifications or cancellations may not be accepted.',
      'Slight color variations may occur due to screen resolution differences and material properties.',
    ],
  },
  {
    id: 3,
    title: 'Pricing & Quotations',
    content: `All prices listed on our platform or provided in custom corporate quotations are in Indian Rupees (INR) and are subject to applicable GST. Corporate quote pricing is valid for the duration specified in the official proposal document.`,
  },
  {
    id: 4,
    title: 'Shipping & Pan-India Delivery',
    content: `We deliver products across India using trusted logistics partners. Estimated delivery timelines are provided at checkout or in your order contract. While we strive to meet all delivery schedules, Giftery is not liable for delays caused by force majeure events or courier disruptions.`,
  },
  {
    id: 5,
    title: 'Returns & Cancellations',
    content: `Due to the custom and personalized nature of our products, custom orders are non-refundable once production has started. If an item arrives damaged or defective, please notify our customer support team within 48 hours of receipt with photo evidence for immediate replacement.`,
  },
  {
    id: 6,
    title: 'Intellectual Property',
    content: `All content, branding, designs, logos, and images on this website are the property of Giftery. Customers retain ownership of their submitted company logos and proprietary artwork for customization purposes.`,
  },
];

const TermsAndConditions = () => {
  return (
    <Layout>
      <div className={styles.termsPage}>
        {/* Hero Banner Header */}
        <section className={styles.heroHeader}>
          <nav className={styles.breadcrumb}>
            <Link to={ROUTES.HOME}>Home</Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <span className={styles.breadcrumbActive}>Terms &amp; Conditions</span>
          </nav>
          <span className={styles.topSubheading}>LEGAL &amp; AGREEMENTS</span>
          <h1 className={styles.heroTitle}>
            Terms &amp; <span className={styles.goldText}>Conditions</span>
          </h1>
          <p className={styles.heroSubtext}>
            Please review the terms and conditions that govern your use of Giftery platform, purchases, and corporate gifting services.
          </p>
        </section>

        {/* Main Content Area */}
        <div className={styles.contentContainer}>
          <div className={styles.introBox}>
            <p className={styles.introText}>
              These Terms &amp; Conditions apply to all visitors, buyers, corporate clients, and users who access or purchase products through Giftery.
            </p>
          </div>

          {/* Render Sections */}
          {TERMS_SECTIONS.map((sec) => (
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

          {/* Need Support Section */}
          <div className={styles.contactSupportBox}>
            <h3 className={styles.supportTitle}>Have Questions About Our Terms?</h3>
            <p className={styles.supportDesc}>
              Our corporate support team is here to assist you with any legal, order, or customization inquiries.
            </p>
            <Link to={ROUTES.CONTACT} className={styles.supportBtn}>
              CONTACT OUR TEAM &rarr;
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsAndConditions;
