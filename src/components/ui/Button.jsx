import styles from './Button.module.css';

/**
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} [variant='primary']
 * @param {'sm'|'md'|'lg'} [size='md']
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...rest
}) => {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.fullWidth : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
};

export default Button;
