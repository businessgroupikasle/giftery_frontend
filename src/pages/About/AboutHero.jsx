import styles from './About.module.css';

const AboutHero = () => {
  return (
    <section className={styles.heroSection}>
      {/* Full-bleed background hero image */}
      <img
        src="/images/about_hero_bg.png"
        alt="Gifterys Luxury Corporate Gift Set"
        className={styles.heroBgImage}
      />

      {/* Dark gradient overlay so left text stays readable */}
      <div className={styles.heroOverlay} />

      {/* Text content — positioned on the left over the image */}
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <span className={styles.topSubheading}>ABOUT US</span>

          <h1 className={styles.heroTitle}>
            Thoughtful Gifts.<br />
            <span className={styles.goldText}>Stronger</span> Relationships.
          </h1>

          <p className={styles.heroDescription}>
            At Gifterys, we help businesses build stronger connections
            through premium, customized gifting solutions that leave
            a lasting impression.
          </p>

          {/* Feature Highlights */}
          <div className={styles.featuresRow}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h3 className={styles.featureTitle}>Premium Quality</h3>
                <p className={styles.featureDesc}>Finest materials and<br />luxurious finishing</p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div>
                <h3 className={styles.featureTitle}>Custom Branding</h3>
                <p className={styles.featureDesc}>Your brand, beautifully<br />represented</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side intentionally empty — image fills the background */}
        <div className={styles.heroVisualSpacer} />
      </div>
    </section>
  );
};

export default AboutHero;
