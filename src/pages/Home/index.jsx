import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import Layout from '@components/layout/Layout';
import ShopByCategory from '@components/home/ShopByCategory';
import TrustedBy from '@components/home/TrustedBy';
import OurProcess from '@components/home/OurProcess';
import BulkOrdersBanner from '@components/home/BulkOrdersBanner';
import styles from './Home.module.css';

const Home = () => {
  return (
    <Layout>
      {/* ── Corporate Gifting Hero Banner ── */}
      <section className={styles.heroBanner}>
        <div className={styles.heroContainer}>
          {/* Left Text Content */}
          <div className={styles.heroContent}>
            <span className={styles.topSubheading}>PREMIUM CORPORATE GIFTING</span>
            
            <h1 className={styles.heroTitle}>
              Premium Corporate<br />
              <span className={styles.goldSerifTitle}>Gifting Solutions</span>
            </h1>
            
            <p className={styles.heroDescription}>
              Elevate your brand with our curated range of customized gifts and merchandise that leave a lasting impression.
            </p>

            <div className={styles.heroCtaGroup}>
              <Link to={ROUTES.SHOP} className={styles.primaryCta}>
                EXPLORE COLLECTION &rarr;
              </Link>
              <Link to={ROUTES.CONTACT} className={styles.secondaryCta}>
                REQUEST A QUOTE
              </Link>
            </div>

            {/* Bottom Stats Row */}
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="1.8">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <div className={styles.statVal}>1000+</div>
                  <div className={styles.statLbl}>Happy Clients</div>
                </div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="1.8">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>
                <div>
                  <div className={styles.statVal}>5000+</div>
                  <div className={styles.statLbl}>Products</div>
                </div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="1.8">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                </div>
                <div>
                  <div className={styles.statVal}>PAN India</div>
                  <div className={styles.statLbl}>Delivery</div>
                </div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="1.8">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                </div>
                <div>
                  <div className={styles.statVal}>Custom</div>
                  <div className={styles.statLbl}>Branding</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Image */}
          <div className={styles.heroVisual}>
            <div className={styles.imageContainer}>
              <img
                src="/images/corporate_gifting_banner.png"
                alt="Premium Corporate Gifting Solutions"
                className={styles.bannerImage}
              />
              <div className={styles.goldGlowOverlay} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted By Businesses Section ── */}
      <TrustedBy />

      {/* ── Standalone Shop By Category Component ── */}
      <ShopByCategory />

      {/* ── Our Process Section (4 Steps) ── */}
      <OurProcess />

      {/* ── Bulk Orders Special Benefits Banner ── */}
      <BulkOrdersBanner />

      {/* ── Trust Badges (Commented Out) ── */}
      {/*
      <section className={styles.trust}>
        <div className="container">
          <div className={styles.trustGrid}>
            {[
              { icon: '🚀', title: 'Express Delivery', desc: 'Timely dispatch for all corporate orders' },
              { icon: '🔒', title: 'Secure Payment', desc: 'Encrypted B2B checkout' },
              { icon: '🎨', title: 'Custom Branding', desc: 'Logo printing & engraving on all products' },
              { icon: '⭐', title: 'Premium Quality', desc: 'Handpicked products guaranteed to impress' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className={styles.trustCard}>
                <span className={styles.trustIcon}>{icon}</span>
                <div>
                  <h4 className={styles.trustTitle}>{title}</h4>
                  <p className={styles.trustDesc}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      */}
    </Layout>
  );
};

export default Home;
