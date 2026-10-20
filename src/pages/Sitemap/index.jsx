import { Link } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import { ROUTES } from '@constants/routes';
import styles from './Sitemap.module.css';

// Mirrors public/sitemap.xml so crawlers and visitors see the same pages
const SITEMAP_GROUPS = [
  {
    title: 'Main Store Pages',
    links: [
      { name: 'Home', path: ROUTES.HOME, description: 'Giftery home page and featured collections' },
      { name: 'Corporate Gifts', path: ROUTES.CORPORATE_GIFTS, description: 'Bulk and branded gifts for your business' },
      { name: 'Personalized Gifts', path: ROUTES.PERSONALIZED_GIFTS, description: 'Custom photo frames, caricatures and keepsakes' },
      { name: 'Toys', path: ROUTES.TOYS, description: 'Toys and games for every age' },
      { name: 'Categories', path: ROUTES.CATEGORIES, description: 'Browse every product category' },
    ],
  },
  {
    title: 'Informational Pages',
    links: [
      { name: 'About Us', path: ROUTES.ABOUT, description: 'Who we are and what we do' },
      { name: 'Contact Us', path: ROUTES.CONTACT, description: 'Reach the Giftery team' },
      { name: 'FAQs', path: ROUTES.FAQ, description: 'Answers to common questions' },
      { name: 'Terms & Conditions', path: ROUTES.TERMS, description: 'Rules for using Giftery' },
      { name: 'Privacy Policy', path: ROUTES.PRIVACY, description: 'How we handle your data' },
    ],
  },
];

const Sitemap = () => (
  <Layout>
    <div className={styles.sitemapPage}>
      <section className={styles.heroHeader}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to={ROUTES.HOME}>Home</Link>
          <span className={styles.breadcrumbSeparator}>›</span>
          <span className={styles.breadcrumbActive}>Sitemap</span>
        </nav>
        <h1 className={styles.heroTitle}>
          Site<span className={styles.goldText}>map</span>
        </h1>
        <p className={styles.heroSubtext}>
          Every public page on Giftery, in one place.
        </p>
      </section>

      <div className={styles.contentContainer}>
        {SITEMAP_GROUPS.map((group) => (
          <section key={group.title} className={styles.group} aria-labelledby={`sitemap-${group.title.replace(/\s+/g, '-').toLowerCase()}`}>
            <h2 id={`sitemap-${group.title.replace(/\s+/g, '-').toLowerCase()}`} className={styles.groupTitle}>
              {group.title}
            </h2>
            <ul className={styles.linkList}>
              {group.links.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className={styles.linkCard}>
                    <span className={styles.linkName}>{link.name}</span>
                    <span className={styles.linkDescription}>{link.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  </Layout>
);

export default Sitemap;
