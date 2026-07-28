import { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(({
  label,
  error,
  hint,
  prefix,
  suffix,
  className = '',
  containerClassName = '',
  id,
  ...rest
}, ref) => {
  return (
    <div className={`${styles.field} ${containerClassName}`}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <div className={`${styles.inputWrapper} ${error ? styles.hasError : ''}`}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <input id={id} ref={ref} className={`${styles.input} ${className}`} {...rest} />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
      {hint  && !error && <p className={styles.hint}>{hint}</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
