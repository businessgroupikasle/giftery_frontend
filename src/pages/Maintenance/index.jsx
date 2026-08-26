import { FiClock, FiMail, FiShield } from 'react-icons/fi';
import styles from './Maintenance.module.css';

const Maintenance = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.brandBadge}>
          <span className={styles.brandEmoji}>🎁</span>
          <span className={styles.brandName}>GIFTERY</span>
        </div>

        <div className={styles.iconWrapper}>
          <span style={{ fontSize: '2.5rem' }}>🛠️</span>
        </div>
        
        <h1 className={styles.title}>We're Under Maintenance</h1>
        <p className={styles.message}>
          We're currently making some improvements to give you a better shopping experience.
          We'll be back shortly. Thank you for your patience!
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <FiClock className={styles.featureIcon} />
            <div className={styles.featureText}>
              <strong>Estimated Time</strong>
              <span>Back online in a few moments</span>
            </div>
          </div>
          <div className={styles.feature}>
            <FiMail className={styles.featureIcon} />
            <div className={styles.featureText}>
              <strong>Contact Support</strong>
              <span>support@giftery.com</span>
            </div>
          </div>
        </div>

        <div className={styles.tagline}>
          <em>Giftery — Premium Gifts, Lasting Impressions</em>
        </div>

        <div className={styles.adminLink}>
          <FiShield style={{ marginRight: '5px', verticalAlign: 'middle' }} />
          Are you an administrator? <a href="/login">Admin Login</a>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
