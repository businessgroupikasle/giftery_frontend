import styles from './Spinner.module.css';

const Spinner = ({ size = 'md', className = '' }) => (
  <div className={`${styles.spinner} ${styles[size]} ${className}`} role="status" aria-label="Loading">
    <span className="sr-only">Loading…</span>
  </div>
);

export const PageSpinner = () => (
  <div className={styles.pageSpinner}>
    <Spinner size="lg" />
  </div>
);

export const AppPageLoader = () => (
  <div className={styles.appPageLoader} role="status" aria-label="Loading page">
    <div className={styles.brandLoader} aria-hidden="true">
      <span className={styles.loaderRing} />
      <span className={styles.loaderIcon}>
        <img src="/favicon.svg" alt="" />
      </span>
    </div>
    <span className={styles.loaderText}>Loading...</span>
  </div>
);

export default Spinner;
