import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Layout from '@components/layout/Layout';
import StarRating from '@components/product/StarRating';
import Spinner from '@components/ui/Spinner';
import Button from '@components/ui/Button';
import { addToCart } from '@store/slices/cartSlice';
import { addToWishlist } from '@store/slices/wishlistSlice';
import useFetch from '@hooks/useFetch';
import { formatCurrency, formatDate } from '@utils/formatters';
import { ENDPOINTS } from '@api/endpoints';
import { ROUTES } from '@constants/routes';
import styles from './Product.module.css';

const Product = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { data, loading, error } = useFetch(`${ENDPOINTS.PRODUCTS.LIST}/${slug}`);
  const product = data?.product;

  if (loading) return <Layout><div className="flex-col-center section"><Spinner size="lg" /></div></Layout>;
  if (error || !product) return (
    <Layout>
      <div className="flex-col-center section text-center">
        <h2>Product not found</h2>
        <Link to={ROUTES.SHOP} className={styles.backLink}>← Back to Shop</Link>
      </div>
    </Layout>
  );

  const { name, description, price, comparePrice, images, category, reviews, _count } = product;
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : null;
  const avgRating = reviews?.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <Layout>
      <div className={`container ${styles.product}`}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to={ROUTES.HOME}>Home</Link> /
          <Link to={ROUTES.SHOP}>Shop</Link> /
          <span>{name}</span>
        </nav>

        <div className={styles.grid}>
          {/* Image */}
          <div className={styles.imageSection}>
            <img src={images?.[0] || '/placeholder.jpg'} alt={name} className={styles.mainImage} />
            {images?.length > 1 && (
              <div className={styles.thumbs}>
                {images.map((img, i) => (
                  <img key={i} src={img} alt={`${name} ${i + 1}`} className={styles.thumb} />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className={styles.details}>
            {category && <Link to={`${ROUTES.CATEGORIES}/${category.slug}`} className={styles.category}>{category.name}</Link>}
            <h1 className={styles.name}>{name}</h1>

            <div className={styles.ratingRow}>
              <StarRating rating={avgRating} showValue size="md" />
              <span className={styles.reviewCount}>({_count?.reviews ?? 0} reviews)</span>
            </div>

            <div className={styles.pricing}>
              <span className={styles.price}>{formatCurrency(price)}</span>
              {comparePrice && <span className={styles.comparePrice}>{formatCurrency(comparePrice)}</span>}
              {discount && <span className={styles.discountBadge}>Save {discount}%</span>}
            </div>

            <p className={styles.description}>{description}</p>

            <div className={styles.actions}>
              <Button onClick={() => dispatch(addToCart({ id: product.id, name, price, image: images?.[0], slug }))} fullWidth>
                🛒 Add to Cart
              </Button>
              <Button variant="outline" onClick={() => dispatch(addToWishlist({ id: product.id }))}>♡ Wishlist</Button>
            </div>

            <div className={styles.meta}>
              <span>SKU: {product.sku || 'N/A'}</span>
              <span>Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {reviews?.length > 0 && (
          <section className={styles.reviewsSection}>
            <h2 className={styles.reviewsTitle}>Customer Reviews</h2>
            <div className={styles.reviewsList}>
              {reviews.map((r) => (
                <div key={r.id} className={styles.review}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerAvatar}>{r.user.name[0]}</div>
                    <div>
                      <strong>{r.user.name}</strong>
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                    <span className={styles.reviewDate}>{formatDate(r.createdAt)}</span>
                  </div>
                  <p className={styles.reviewComment}>{r.comment}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Product;
