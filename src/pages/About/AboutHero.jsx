import styles from './About.module.css';

const AboutHero = () => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContainer}>
        {/* Left Content */}
        <div className={styles.heroContent}>
          <span className={styles.topSubheading}>ABOUT US</span>

          <h1 className={styles.heroTitle}>
            Thoughtful Gifts.<br />
            <span className={styles.goldText}>Stronger Relationships.</span>
          </h1>

          <p className={styles.heroDescription}>
            At Giftery, we help businesses build stronger connections through premium, customized gifting solutions that leave a lasting impression.
          </p>

          {/* Highlights Row */}
          <div className={styles.featuresRow}>
            {/* Feature 1: Premium Quality */}
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div>
                <h3 className={styles.featureTitle}>Premium Quality</h3>
                <p className={styles.featureDesc}>Finest materials and luxurious finishing</p>
              </div>
            </div>

            {/* Feature 2: Custom Branding */}
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
              </div>
              <div>
                <h3 className={styles.featureTitle}>Custom Branding</h3>
                <p className={styles.featureDesc}>Your brand, beautifully represented</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Visual Image */}
        <div className={styles.heroVisual}>
          <div className={styles.imageWrapper}>
            <img
              src="/images/about_hero_gift_set.png"
              alt="Giftery Luxury Corporate Gift Set"
              className={styles.heroImg}
            />
            <div className={styles.glowOverlay} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
