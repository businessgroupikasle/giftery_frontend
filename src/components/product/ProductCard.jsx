import { Link, useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@store/slices/cartSlice';
import { selectIsWishlisted } from '@store/slices/wishlistSlice';
import useWishlist from '@hooks/useWishlist';
import StarRating from './StarRating';
import { formatCurrency } from '@utils/formatters';
import { ROUTES } from '@constants/routes';
import { toast } from 'react-toastify';
import styles from './ProductCard.module.css';

import ThreeDotMenu from './ThreeDotMenu';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist } = useWishlist();

  const {
    id, name, slug, price, comparePrice, images, rating = 4.8, _count,
  } = product;

  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : null;
  const isWishlisted = useSelector(selectIsWishlisted(id));
  
  let image = '/placeholder.jpg';
  if (Array.isArray(images) && images.length > 0) {
    image = images[0];
  } else if (typeof images === 'string' && images.trim()) {
    const trimmed = images.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) image = parsed[0];
      } catch (e) {}
    } else {
      image = trimmed.split(',')[0].trim();
    }
  } else if (product.image) {
    image = product.image;
  }

  const productUrl = ROUTES.PRODUCT_PATH ? ROUTES.PRODUCT_PATH(slug) : `/product/${slug}`;

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ id, name, price, image, slug, quantity: 1 }));
    toast.success(`Proceeding to checkout with ${name}...`);
    navigate('/checkout');
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(id);
      toast.info(`Removed ${name} from wishlist`);
    } else {
      addToWishlist({ id, name, price, comparePrice, image, slug });
      toast.success(`Added ${name} to wishlist`);
    }
  };

  return (
    <article className={styles.card} aria-label={name}>
      <div className={styles.imageWrapper}>
        <Link to={productUrl} className={styles.imageLink}>
          <img src={image} alt={name} className={styles.image} loading="lazy" />
        </Link>
        {discount && <span className={styles.badge}>-{discount}%</span>}

        {/* Floating Top Right Wishlist Button */}
        <button
          className={styles.topRightWishlistBtn}
          onClick={handleWishlist}
          aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <FiHeart fill={isWishlisted ? '#ef4444' : 'transparent'} color={isWishlisted ? '#ef4444' : 'currentColor'} />
        </button>
      </div>

      <div className={styles.body}>
        <Link to={productUrl} className={styles.name}>{name}</Link>

        <div className={styles.rating}>
          <StarRating rating={rating} size="sm" />
          <span className={styles.reviewCount}>({_count?.reviews ?? 24})</span>
        </div>

        <div className={styles.pricing}>
          <span className={styles.price}>{formatCurrency(price)}</span>
          {comparePrice && <span className={styles.comparePrice}>{formatCurrency(comparePrice)}</span>}
        </div>

        {/* Action Buttons: Add to Cart + Buy Now + 3-Dot Menu on Single Line */}
        <div className={styles.actionsRow}>
          <button
            className={styles.addToCartBtn}
            onClick={() => {
              dispatch(addToCart({ id, name, price, image, slug }));
              toast.success(`Added "${name}" to cart!`);
            }}
          >
            Add to Cart
          </button>
          <button
            className={styles.buyNowBtn}
            onClick={handleBuyNow}
          >
            Buy Now
          </button>
          <ThreeDotMenu
            productUrl={productUrl}
            productName={name}
            productImage={image}
          />
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
