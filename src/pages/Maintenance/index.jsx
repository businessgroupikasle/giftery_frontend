import { FiTool, FiClock, FiMail } from 'react-icons/fi';
import styles from './Maintenance.module.css';

const Maintenance = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <FiTool className={styles.icon} />
        </div>
        
        <h1 className={styles.title}>We're under maintenance!</h1>
        <p className={styles.message}>
          Our store is currently undergoing scheduled maintenance to improve your shopping experience.
          We'll be back online shortly. Thank you for your patience!
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <FiClock className={styles.featureIcon} />
            <div className={styles.featureText}>
              <strong>Estimated Time</strong>
              <span>Back in a few hours</span>
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

        <div className={styles.adminLink}>
          Are you an administrator? <a href="/login">Admin Login</a>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
