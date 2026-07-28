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

export default Spinner;
