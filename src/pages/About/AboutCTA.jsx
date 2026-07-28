import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import styles from './About.module.css';

const AboutCTA = () => {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.ctaContainer}>
        <h2 className={styles.ctaTitle}>Ready to Elevate Your Corporate Gifting?</h2>
        <p className={styles.ctaDesc}>
          Get in touch with our expert team to create custom gift hampers tailored to your brand.
        </p>
        <Link to={ROUTES.CONTACT} className={styles.ctaBtn}>
          REQUEST A CUSTOM QUOTE &rarr;
        </Link>
      </div>
    </section>
  );
};

export default AboutCTA;
