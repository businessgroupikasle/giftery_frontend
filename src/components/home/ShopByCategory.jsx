import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import styles from './ShopByCategory.module.css';

const giftCollections = [
  {
    id: 'corporate-gifts',
    title: 'Corporate Gifts',
    subtitle: 'Premium onboarding kits, executive desk accents & branded corporate merchandise',
    image: '/images/cat_corporate.png',
    link: ROUTES.CORPORATE_GIFTS,
    theme: 'dark',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    ),
  },
  {
    id: 'personalized-gifts',
    title: 'Personalized Gifts',
    subtitle: 'Custom photo frames, acrylic stands, caricatures & engraved wooden keepsakes',
    image: '/images/cat_welcome.png',
    link: ROUTES.PERSONALIZED_GIFTS,
    theme: 'gold',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
        <line x1="7" y1="7" x2="7.01" y2="7"></line>
      </svg>
    ),
  },
  {
    id: 'toys',
    title: 'Toys',
    subtitle: 'Educational toys, remote control cars, soft toys & building blocks for all age groups',
    image: '/images/cat_tech.png',
    link: ROUTES.TOYS,
    theme: 'light',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    ),
  },
];

const ShopByCategory = () => {
  return (
    <section className={styles.collectionsSection}>
      <div className={styles.collectionsContainer}>
        <div className={styles.collectionsHeader}>
          <div>
            <span className={styles.collectionsSubheading}>SHOP BY CATEGORY</span>
            <h2 className={styles.collectionsTitle}>
              Explore Our <span className={styles.collectionsTitleGold}>Gift Collections</span>
            </h2>
          </div>
          <Link to={ROUTES.CORPORATE_GIFTS} className={styles.viewAllBtn}>
            View All Categories &rarr;
          </Link>
        </div>

        <div className={styles.collectionsGrid}>
          {giftCollections.map((col) => (
            <div
              key={col.id}
              className={`${styles.collectionCard} ${styles[`cardTheme_${col.theme}`]}`}
            >
              <div className={styles.cardImageWrapper}>
                <img src={col.image} alt={col.title} className={styles.cardImg} />
              </div>
              <div className={styles.cardBadge}>{col.icon}</div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{col.title}</h3>
                <p className={styles.cardSubtitle}>{col.subtitle}</p>
                <Link to={col.link} className={styles.cardCta}>
                  EXPLORE &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;
