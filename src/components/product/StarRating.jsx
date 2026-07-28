import styles from './StarRating.module.css';

const StarRating = ({ rating = 0, max = 5, size = 'md', showValue = false }) => {
  const stars = Array.from({ length: max }, (_, i) => {
    const filled = i + 1 <= Math.floor(rating);
    const half   = !filled && i < rating && rating % 1 >= 0.4;
    return { filled, half };
  });

  return (
    <span className={`${styles.stars} ${styles[size]}`} aria-label={`${rating} out of ${max} stars`}>
      {stars.map((star, i) => (
        <span
          key={i}
          className={`${styles.star} ${star.filled ? styles.filled : star.half ? styles.half : styles.empty}`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
      {showValue && <span className={styles.value}>{rating.toFixed(1)}</span>}
    </span>
  );
};

export default StarRating;
