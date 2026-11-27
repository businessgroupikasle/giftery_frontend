import { formatCurrency } from '@utils/formatters';
import styles from './PriceSavingsBadge.module.css';

const PriceSavingsBadge = ({ amount, className }) => (
  <span className={`${styles.badge} ${className}`}>
    You Save <strong>{formatCurrency(amount)}</strong>
  </span>
);

export default PriceSavingsBadge;
