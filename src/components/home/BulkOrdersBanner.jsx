import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import styles from './BulkOrdersBanner.module.css';

const BENEFITS = [
  {
    id: 'pricing',
    text: 'Best Pricing Guaranteed',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="1.8">
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    ),
  },
  {
    id: 'priority',
    text: 'Priority Production',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="1.8">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    ),
  },
  {
    id: 'manager',
    text: 'Dedicated Team Support',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="1.8">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
  },
];

const BulkOrdersBanner = () => {
  return (
    <section className={styles.bulkSection}>
      <div className={styles.bulkCard}>
        {/* Dark Golden Sparkle Overlay */}
        <div className={styles.sparkleOverlay} />

        <div className={styles.bulkContent}>
          <h2 className={styles.bulkTitle}>
            Bulk Orders? <span className={styles.goldText}>Get Special Benefits!</span>
          </h2>
          <p className={styles.bulkSubtitle}>
            Unlock exclusive discounts and priority support for bulk corporate orders.
          </p>

          <div className={styles.actionRow}>
            <Link to={ROUTES.CONTACT} className={styles.contactBtn}>
              CONTACT OUR TEAM &rarr;
            </Link>

            <div className={styles.benefitsGroup}>
              {BENEFITS.map((item) => (
                <div key={item.id} className={styles.benefitBadge}>
                  <span className={styles.benefitIcon}>{item.icon}</span>
                  <span className={styles.benefitText}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Gift Box Visual */}
        <div className={styles.bulkVisual}>
          <img
            src="/images/bulk_orders_gift_box.png"
            alt="Luxury Corporate Gift Box"
            className={styles.giftBoxImg}
          />
        </div>
      </div>
    </section>
  );
};

export default BulkOrdersBanner;
