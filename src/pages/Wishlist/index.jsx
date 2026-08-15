import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '@components/layout/Layout';
import useFetch from '@hooks/useFetch';
import useWishlist from '@hooks/useWishlist';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import { ROUTES } from '@constants/routes';
import { addToCart } from '@store/slices/cartSlice';
import { removeFromWishlist, clearWishlist } from '@store/slices/wishlistSlice';
import { formatCurrency } from '@utils/formatters';
import { getImageUrl } from '@utils/imageUrl';
import styles from './Wishlist.module.css';

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToWishlist } = useWishlist();

  // Get items from Redux store
  const reduxWishlist = useSelector((state) => state.wishlist.items) || [];

  // Fetch backend API wishlist items if user logged in
  const { data, fetch: refetchWishlist } = useFetch(ENDPOINTS.WISHLIST.GET);
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
        comparePrice: item.comparePrice || (item.price ? Math.round(item.price * 1.25) : null),
        discount: item.discount || (item.comparePrice ? `${Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100)}% OFF` : null),
        category: item.category?.name || item.categoryName || item.category || 'Giftery Collection',
        image: item.image || item.images?.[0] || '/placeholder.jpg',
        slug: item.slug || '',
      });
    }
  });

  // Stored wishlist items (only real items, no fake fallback)
  const wishlistItems = Array.from(itemsMap.values());
  const itemCount = wishlistItems.length;

  // Live Recommended Catalog items from store
  const [recommendedItems, setRecommendedItems] = useState([]);

  useEffect(() => {
    const fetchLiveProducts = async () => {
      let apiProducts = [];
      try {
        const res = await axiosInstance.get(ENDPOINTS.PRODUCTS.LIST);
        let extracted = [];
        if (Array.isArray(res)) extracted = res;
        else if (res?.data && Array.isArray(res.data)) extracted = res.data;
        else if (res?.data?.data && Array.isArray(res.data.data)) extracted = res.data.data;
        else if (res?.data?.products && Array.isArray(res.data.products)) extracted = res.data.products;
        else if (res?.products && Array.isArray(res.products)) extracted = res.products;
        apiProducts = extracted;
      } catch (err) {}

      if (apiProducts.length > 0) {
        // Exclude items already in wishlist
        const wishlistIds = new Set(wishlistItems.map(i => i.id));
        const filtered = apiProducts
          .filter(p => !wishlistIds.has(p.id))
          .slice(0, 3)
          .map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            comparePrice: p.comparePrice,
            category: p.category?.name || p.categoryName || 'Giftery Collection',
            image: Array.isArray(p.images) ? p.images[0] : (p.image || '/placeholder.jpg'),
            slug: p.slug,
          }));
        setRecommendedItems(filtered);
      }
    };

    fetchLiveProducts();
    window.addEventListener('products_updated', fetchLiveProducts);
    return () => window.removeEventListener('products_updated', fetchLiveProducts);
  }, [wishlistItems.length]);

  const handleAddToCart = async (item) => {
    dispatch(addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, slug: item.slug }));
    dispatch(removeFromWishlist(item.id));

    try {
      await axiosInstance.delete(ENDPOINTS.WISHLIST.REMOVE(item.id));
      refetchWishlist();
    } catch (e) {
      refetchWishlist();
    }

    toast.success(`Moved "${item.name}" to cart`);
  };

  const handleBuyNow = async (item) => {
    dispatch(addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, slug: item.slug }));
    dispatch(removeFromWishlist(item.id));

    try {
      await axiosInstance.delete(ENDPOINTS.WISHLIST.REMOVE(item.id));
      refetchWishlist();
    } catch (e) {
      refetchWishlist();
    }

    toast.success(`Proceeding to cart with "${item.name}"`);
    navigate(ROUTES.CART);
  };

  const handleRemoveFromWishlist = async (id, name) => {
    dispatch(removeFromWishlist(id));
    try {
      await axiosInstance.delete(ENDPOINTS.WISHLIST.REMOVE(id));
      refetchWishlist();
    } catch (e) {
      refetchWishlist();
    }
    toast.info(`Removed "${name}" from wishlist`);
  };

  const handleClearWishlist = () => {
    dispatch(clearWishlist());
    toast.info('Wishlist cleared');
  };

  const handleAddRecommendedToWishlist = (item) => {
    addToWishlist(item);
    toast.success(`Added "${item.name}" to Wishlist`);
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
              {wishlistItems.length > 0 && (
                <button onClick={handleClearWishlist} className={styles.clearAllBtn}>
                  Clear All
                </button>
              )}
            </div>

            {/* Product Grid or Empty State */}
            {wishlistItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💔</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                  Your Wishlist is Empty
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  You haven't saved any items yet. Explore our product collections to add your favorites!
                </p>
                <Link
                  to={ROUTES.SHOP}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#0f172a',
                    color: '#ffffff',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                  }}
                >
                  Explore Products →
                </Link>
              </div>
            ) : (
              <div className={styles.grid}>
                {wishlistItems.map((item) => (
                  <div key={item.id} className={styles.itemCard}>
                    <div className={styles.imageArea}>
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className={styles.itemImg}
                        onError={(e) => { e.currentTarget.src = '/placeholder-product.png'; }}
                      />
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
            )}
          </div>

          {/* Recommended Catalog Items Section */}
          {recommendedItems.length > 0 && (
            <div style={{ marginTop: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Recommended For You</h3>
                <Link to={ROUTES.SHOP} style={{ color: '#d99b26', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>View All →</Link>
              </div>
              <div className={styles.grid}>
                {recommendedItems.map((item) => (
                  <div key={item.id} className={styles.itemCard}>
                    <div className={styles.imageArea}>
                      <img src={item.image} alt={item.name} className={styles.itemImg} />
                    </div>
                    <div className={styles.itemBody}>
                      <span className={styles.categoryTag}>{item.category}</span>
                      <Link to={item.slug ? ROUTES.PRODUCT_PATH(item.slug) : ROUTES.SHOP} className={styles.itemName}>{item.name}</Link>
                      <div className={styles.priceRow}>
                        <span className={styles.price}>{formatCurrency(item.price)}</span>
                      </div>
                      <button
                        className={styles.buyNowBtn}
                        onClick={() => handleAddRecommendedToWishlist(item)}
                        style={{ width: '100%', marginTop: '0.75rem' }}
                      >
                        ❤️ Save to Wishlist
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


        </div>
      </div>
    </Layout>
  );
};

export default Wishlist;
