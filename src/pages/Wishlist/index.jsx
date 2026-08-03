import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '@components/layout/Layout';
import useFetch from '@hooks/useFetch';
import { ENDPOINTS } from '@api/endpoints';
import { ROUTES } from '@constants/routes';
import { addToCart } from '@store/slices/cartSlice';
import { addToWishlist, removeFromWishlist, clearWishlist } from '@store/slices/wishlistSlice';
import { formatCurrency } from '@utils/formatters';
import styles from './Wishlist.module.css';

// Initial curated products to display as sample saved wishlist items
const INITIAL_WISHLIST_DEMO = [
  {
    id: 'w-101',
    name: 'Executive Kinetic Desk Gyro Sculpture',
    price: 1499,
    comparePrice: 1999,
    discount: '25% OFF',
    category: 'Corporate Gifts',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
    slug: 'executive-kinetic-desk-gyro-sculpture',
  },
  {
    id: 'w-102',
    name: '3D Wooden Mechanical Gear Clock Puzzle',
    price: 2199,
    comparePrice: 2799,
    discount: '21% OFF',
    category: 'Desk Accessories',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
    slug: '3d-wooden-mechanical-gear-clock-puzzle',
  },
  {
    id: 'w-103',
    name: 'Personalized Leather Notebook & Pen Set',
    price: 899,
    comparePrice: 1299,
    discount: '30% OFF',
    category: 'Personalized Gifts',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    slug: 'personalized-leather-notebook-pen-set',
  },
];

// Recommended Catalog items to quickly add to wishlist
const RECOMMENDED_ITEMS = [
  {
    id: 'rec-201',
    name: 'Custom Engraved Stainless Hydro Bottle',
    price: 799,
    comparePrice: 999,
    category: 'Drinkware',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    slug: 'custom-engraved-hydro-bottle',
  },
  {
    id: 'rec-202',
    name: '3D Acrylic Photo Standee with LED Base',
    price: 1299,
    comparePrice: 1699,
    category: 'Personalized Gifts',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
    slug: '3d-acrylic-photo-standee-led-base',
  },
  {
    id: 'rec-203',
    name: 'Traditional Festive Gourmet Sweets & Snacks Box',
    price: 1599,
    comparePrice: 1999,
    category: 'Traditional Sweets',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
    slug: 'traditional-festive-gourmet-box',
  },
];

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get items from Redux store
  const reduxWishlist = useSelector((state) => state.wishlist.items) || [];

  // Fetch backend API wishlist items if user logged in
  const { data } = useFetch(ENDPOINTS.WISHLIST.GET);
  const apiWishlist = data?.wishlist?.items
    ? data.wishlist.items.map((i) => i.product || i)
    : [];

  // Combine items avoiding duplicates
  const allItems = [...reduxWishlist, ...apiWishlist];
  const itemsMap = new Map();

  allItems.forEach((item) => {
    const id = item.id || item.productId || item._id;
    if (id && !itemsMap.has(id)) {
      itemsMap.set(id, {
        id,
        name: item.name || 'Wishlist Product',
        price: item.price || 999,
        comparePrice: item.comparePrice || (item.price ? Math.round(item.price * 1.25) : 1499),
        discount: item.discount || '20% OFF',
        category: item.category || 'Giftery Collection',
        image: item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
        slug: item.slug || '',
      });
    }
  });

  // Use stored wishlist items, or fallback to initial demo items for showcase
  const storedItems = Array.from(itemsMap.values());
  const wishlistItems = storedItems.length > 0 ? storedItems : INITIAL_WISHLIST_DEMO;
  const itemCount = wishlistItems.length;

  const handleAddToCart = (item) => {
    dispatch(addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, slug: item.slug }));
    toast.success(`Added "${item.name}" to cart 🛒`);
  };

  const handleBuyNow = (item) => {
    dispatch(addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, slug: item.slug }));
    toast.success(`Proceeding to checkout for "${item.name}" ⚡`);
    navigate(ROUTES.CART);
  };

  const handleRemoveFromWishlist = (id, name) => {
    dispatch(removeFromWishlist(id));
    toast.info(`Removed "${name}" from wishlist`);
  };

  const handleClearWishlist = () => {
    dispatch(clearWishlist());
    toast.info('Wishlist cleared');
  };

  const handleAddRecommendedToWishlist = (item) => {
    dispatch(addToWishlist(item));
    toast.success(`Added "${item.name}" to Wishlist ❤️`);
  };

  return (
    <Layout>
      <div className={styles.wishlistPage}>
        <div className={styles.container}>
          {/* Header Row */}
          <div className={styles.headerRow}>
            <div className={styles.headerLeft}>
              {/* Soft Pink Rounded Box with Red Heart Icon */}
              <div className={styles.badgeIconWrapper}>
                <svg className={styles.badgeHeartIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <div className={styles.headerText}>
                <h1 className={styles.title}>My Wishlist</h1>
                <p className={styles.subtitle}>
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} saved
                </p>
              </div>
            </div>

            {/* Continue Shopping Button */}
            <Link to={ROUTES.SHOP} className={styles.continueBtn}>
              <span className={styles.continueBtnArrow}>←</span>
              <span>Continue Shopping</span>
            </Link>
          </div>

          {/* Main Card View showing Saved Wishlist Products with BUY NOW Options */}
          <div className={`${styles.mainCard} ${styles.populatedCard}`}>
            <div className={styles.cardTopRow}>
              <div className={styles.cardTopTitle}>
                <span>❤️ Saved Wishlist Products</span>
              </div>
              {storedItems.length > 0 && (
                <button onClick={handleClearWishlist} className={styles.clearAllBtn}>
                  Clear All
                </button>
              )}
            </div>

            {/* Product Grid */}
            <div className={styles.grid}>
              {wishlistItems.map((item) => (
                <div key={item.id} className={styles.itemCard}>
                  <div className={styles.imageArea}>
                    <img src={item.image} alt={item.name} className={styles.itemImg} />
                    {item.discount && <span className={styles.discountTag}>{item.discount}</span>}
                    <button
                      className={styles.removeBadgeBtn}
                      onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                      title="Remove from wishlist"
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </div>

                  <div className={styles.itemBody}>
                    <span className={styles.categoryTag}>{item.category || 'Giftery Exclusive'}</span>
                    <Link
                      to={item.slug ? ROUTES.PRODUCT.replace(':slug', item.slug) : ROUTES.SHOP}
                      className={styles.itemName}
                    >
                      {item.name}
                    </Link>

                    <div className={styles.priceRow}>
                      <span className={styles.price}>{formatCurrency(item.price)}</span>
                      {item.comparePrice && (
                        <span className={styles.comparePrice}>{formatCurrency(item.comparePrice)}</span>
                      )}
                    </div>

                    {/* Dual Buy Actions: BUY NOW & ADD TO CART */}
                    <div className={styles.actionGroup}>
                      <button
                        className={styles.buyNowBtn}
                        onClick={() => handleBuyNow(item)}
                      >
                        ⚡ BUY NOW
                      </button>
                      <button
                        className={styles.addToCartOutlineBtn}
                        onClick={() => handleAddToCart(item)}
                      >
                        🛒 Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>


        </div>
      </div>
    </Layout>
  );
};

export default Wishlist;
