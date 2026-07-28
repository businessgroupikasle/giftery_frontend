import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '@store/slices/cartSlice';
import { addToWishlist } from '@store/slices/wishlistSlice';
import StarRating from './StarRating';
import { formatCurrency } from '@utils/formatters';
import { ROUTES } from '@constants/routes';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const {
    id, name, slug, price, comparePrice, images, rating = 4.3, _count,
  } = product;

  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : null;
  const image = images?.[0] || '/placeholder.jpg';

  return (
    <article className={styles.card} aria-label={name}>
      <Link to={ROUTES.PRODUCT.replace(':slug', slug)} className={styles.imageLink}>
        <div className={styles.imageWrapper}>
          <img src={image} alt={name} className={styles.image} loading="lazy" />
          {discount && <span className={styles.badge}>-{discount}%</span>}
        </div>
      </Link>

      <div className={styles.body}>
        <Link to={ROUTES.PRODUCT.replace(':slug', slug)} className={styles.name}>{name}</Link>

        <div className={styles.rating}>
          <StarRating rating={rating} size="sm" />
          <span className={styles.reviewCount}>({_count?.reviews ?? 0})</span>
        </div>

        <div className={styles.pricing}>
          <span className={styles.price}>{formatCurrency(price)}</span>
          {comparePrice && <span className={styles.comparePrice}>{formatCurrency(comparePrice)}</span>}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.addToCart}
            onClick={() => dispatch(addToCart({ id, name, price, image, slug }))}
            aria-label={`Add ${name} to cart`}
          >
            Add to Cart
          </button>
          <button
            className={styles.wishlist}
            onClick={() => dispatch(addToWishlist({ id }))}
            aria-label={`Add ${name} to wishlist`}
          >
            ♡
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
