import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import styles from './BulkOrdersBanner.module.css';

const BulkOrdersBanner = () => {
  return (
    <section className={styles.bulkSection}>
      <div className={styles.bulkCard}>
        {/* Dark Golden Sparkle Overlay */}
        <div className={styles.sparkleOverlay} />

        <div className={styles.bulkLeft}>
          <h2 className={styles.bulkTitle}>
            Bulk Orders? <span className={styles.goldText}>Get Special Benefits!</span>
          </h2>
          <p className={styles.bulkSubtitle}>
            Unlock exclusive discounts and priority support for bulk corporate orders.
          </p>
        </div>

        <div className={styles.bulkRight}>
          <Link
            to={ROUTES.CONTACT}
            className={styles.contactBtn}
            onClick={() => {
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              if (document.documentElement) document.documentElement.scrollTop = 0;
              if (document.body) document.body.scrollTop = 0;
            }}
          >
            CONTACT OUR TEAM &rarr;
          </Link>
        </div>

      </div>
    </section>
  );
};

export default BulkOrdersBanner;
