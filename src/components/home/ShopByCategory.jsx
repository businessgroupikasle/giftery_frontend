import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiShoppingCart, 
  FiShield, 
  FiTag, 
  FiPackage, 
  FiTruck, 
  FiHeart, 
  FiArrowRight, 
  FiStar, 
  FiTrendingUp, 
  FiAward, 
  FiZap, 
  FiGift 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { ROUTES } from '@constants/routes';
import { useCartContext } from '@context/CartContext';
import { addItem } from '@store/slices/cartSlice';
import { addToWishlistAlias, removeFromWishlistAlias, selectWishlistItems } from '@store/slices/wishlistSlice';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import styles from './ShopByCategory.module.css';

const filterCategories = [
  { id: 'featured', label: 'Featured Products' },
  { id: 'bestsellers', label: 'Best Sellers' },
  { id: 'popular', label: 'Popular Products' },
  { id: 'new', label: 'New Arrivals' },
  { id: 'loved', label: 'Most Loved' },
  { id: 'giftsets', label: 'Gift Sets' },
];

const sampleProducts = [
  {
    id: 'prod-corp-1',
    name: 'Luxury Executive Onboarding Gift Set',
    description: 'Premium corporate welcome box featuring thermal bottle, leather diary, and gold pen.',
    price: 1249,
    image: '/images/prod_gift_set.png',
    isFeatured: true,
    isGiftSet: true,
    tags: ['Corporate Gifts', 'featured', 'giftsets'],
  },
  {
    id: 'prod-corp-2',
    name: 'Executive Laptop Backpack',
    description: 'Ergonomic water-resistant laptop bag for modern professionals.',
    price: 1999,
    image: '/images/prod_laptop_bag.png',
    isBestseller: true,
    isPopular: true,
    tags: ['Corporate Gifts', 'bestsellers', 'popular'],
  },
  {
    id: 'prod-pers-1',
    name: 'Custom Engraved Wooden Photo Frame',
    description: 'High precision laser engraved solid beechwood photo frame.',
    price: 699,
    image: '/images/prod_notebook_pen.png',
    isPopular: true,
    isMostLoved: true,
    tags: ['Personalized Gifts', 'popular', 'loved'],
  },
  {
    id: 'prod-pers-2',
    name: 'Customized Acrylic Table Stand & Desk Clock',
    description: 'Crystal clear acrylic desk accent customized with name and logo.',
    price: 899,
    image: '/images/cat_welcome.png',
    isNewArrival: true,
    isMostLoved: true,
    tags: ['Personalized Gifts', 'new', 'loved'],
  },
  {
    id: 'prod-toy-1',
    name: 'Educational STEM Building Blocks Set',
    description: 'Interactive building block set encouraging creative thinking for kids.',
    price: 799,
    image: '/images/cat_tech.png',
    isNewArrival: true,
    isGiftSet: true,
    tags: ['Toys', 'new', 'giftsets'],
  },
  {
    id: 'prod-toy-2',
    name: 'Remote Control High Speed Stunt Car',
    description: '360 degree rotating rechargeable remote control car with LED lights.',
    price: 1499,
    image: '/images/prod_power_bank.png',
    isBestseller: true,
    isFeatured: true,
    tags: ['Toys', 'bestsellers', 'featured'],
  },
];

const ShopByCategory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('featured');
  const [productsList, setProductsList] = useState([]);
  const wishlistItems = useSelector(selectWishlistItems);
  const { openCart } = useCartContext();

  const loadProducts = async () => {
    let apiProds = [];
    try {
      const res = await axiosInstance.get(ENDPOINTS.PRODUCTS.LIST);
      if (Array.isArray(res)) apiProds = res;
      else if (res?.data && Array.isArray(res.data)) apiProds = res.data;
      else if (res?.data?.data && Array.isArray(res.data.data)) apiProds = res.data.data;
      else if (res?.data?.products && Array.isArray(res.data.products)) apiProds = res.data.products;
    } catch (e) {}

    const deletedIds = new Set(JSON.parse(localStorage.getItem('giftery_deleted_products') || '[]'));
    const localProds = JSON.parse(localStorage.getItem('giftery_products') || '[]');
    const combinedMap = new Map();

    localProds.forEach(p => {
      const idStr = String(p.id || '');
      const slugStr = String(p.slug || '');
      if ((idStr || slugStr) && !deletedIds.has(idStr) && !deletedIds.has(slugStr)) {
        combinedMap.set(idStr || slugStr, p);
      }
    });

    apiProds.forEach(p => {
      const idStr = String(p.id || '');
      const slugStr = String(p.slug || '');
      if ((idStr || slugStr) && !deletedIds.has(idStr) && !deletedIds.has(slugStr)) {
        if (!combinedMap.has(idStr) && !combinedMap.has(slugStr)) {
          combinedMap.set(idStr || slugStr, p);
        }
      }
    });

    let result = Array.from(combinedMap.values());
    if (result.length === 0) result = sampleProducts;

    setProductsList(result);
    localStorage.setItem('giftery_products', JSON.stringify(result));
  };

  useEffect(() => {
    loadProducts();
    window.addEventListener('products_updated', loadProducts);
    window.addEventListener('storage', loadProducts);
    return () => {
      window.removeEventListener('products_updated', loadProducts);
      window.removeEventListener('storage', loadProducts);
    };
  }, []);

  const getFilteredProducts = () => {
    const listToFilter = productsList.length > 0 ? productsList : sampleProducts;
    const matches = listToFilter.filter(product => {
      const tags = Array.isArray(product.tags) ? product.tags.map(t => String(t).toLowerCase()) : [];
      if (activeFilter === 'featured') {
        return product.isFeatured || product.featured || tags.includes('featured');
      }
      if (activeFilter === 'bestsellers') {
        return product.isBestseller || tags.includes('bestsellers') || tags.includes('bestseller') || tags.includes('best seller');
      }
      if (activeFilter === 'popular') {
        return product.isPopular || tags.includes('popular');
      }
      if (activeFilter === 'new') {
        return product.isNewArrival || tags.includes('new') || tags.includes('new arrival');
      }
      if (activeFilter === 'loved') {
        return product.isMostLoved || tags.includes('loved') || tags.includes('most loved');
      }
      if (activeFilter === 'giftsets') {
        return product.isGiftSet || tags.includes('giftsets') || tags.includes('gift set') || tags.includes('giftset');
      }
      return true;
    });

    if (matches.length > 0) return matches.slice(0, 6);
    return listToFilter.slice(0, 6);
  };

  const displayProducts = getFilteredProducts();

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const targetId = String(product.id || product.slug || `prod-${Date.now()}`);
    const imgUrl = Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : (product.image || '/images/prod_gift_set.png');
    const unitPrice = Number(product.price || product.salePrice || 0);

    const cartPayload = {
      id: targetId,
      productId: targetId,
      name: product.name,
      price: unitPrice,
      image: imgUrl,
      quantity: 1,
    };

    dispatch(addItem(cartPayload));
    if (openCart) openCart();
    toast.success(`🛒 ${product.name} added to cart! Proceed to Checkout!`);
  };

  const handleToggleWishlist = (product) => {
    const targetId = String(product.id || product.slug);
    const isWishlisted = wishlistItems.some((i) => String(i.productId || i.id) === targetId);

    if (isWishlisted) {
      dispatch(removeFromWishlistAlias(targetId));
      toast.info(`Removed ${product.name} from Wishlist`);
    } else {
      const imgUrl = Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : (product.image || '/images/prod_gift_set.png');
      dispatch(
        addToWishlistAlias({
          id: targetId,
          productId: targetId,
          name: product.name,
          price: Number(product.price || 0),
          image: imgUrl,
          slug: product.slug || '',
        })
      );
      toast.success(`💖 ${product.name} added to Wishlist!`);
    }
  };

  return (
    <section className={styles.collectionsSection}>
      <div className={styles.collectionsContainer}>
        {/* Header Section */}
        <div className={styles.headerWrapper}>
          <div className={styles.subheadingWrapper}>
            <span className={styles.subheadingDash}>—</span>
            <span className={styles.subheadingText}>OUR PRODUCTS</span>
            <span className={styles.subheadingDash}>—</span>
          </div>
          <h2 className={styles.mainHeading}>
            Explore Our <span className={styles.headingHighlight}>Collections</span>
          </h2>
          <p className={styles.descriptionText}>
            Thoughtfully curated corporate gifts for every occasion and every relationship.
          </p>
        </div>

        {/* Filter Pills Navigation */}
        <div className={styles.filterPillsRow}>
          {filterCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveFilter(cat.id)}
              className={`${styles.filterPill} ${activeFilter === cat.id ? styles.filterPillActive : ''}`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Products Grid (6 Columns) */}
        <div className={styles.productsGrid}>
          {displayProducts.map((product) => {
            const targetId = String(product.id || product.slug);
            const imgSrc = Array.isArray(product.images) && product.images.length > 0
              ? product.images[0]
              : (product.image || '/images/prod_gift_set.png');
            const isWishlisted = wishlistItems.some((i) => String(i.productId || i.id) === targetId);

            return (
              <div
                key={targetId}
                className={styles.productCard}
                onClick={() => navigate(`/product/${targetId}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.productImgWrapper} style={{ position: 'relative' }}>
                  <img src={imgSrc} alt={product.name} className={styles.productImg} />
                  <button
                    type="button"
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleWishlist(product);
                    }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(255, 255, 255, 0.92)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      zIndex: 10,
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <FiHeart fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#64748b'} size={16} />
                  </button>
                </div>

                <div className={styles.productCardBody}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productDesc}>{product.description}</p>
                  <div className={styles.productPrice}>₹{Number(product.price || 0).toLocaleString('en-IN')}</div>
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, product)}
                    className={styles.addToCartBtn}
                  >
                    <FiShoppingCart style={{ marginRight: '6px' }} /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Products CTA Button */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link to={ROUTES.SHOP} className={styles.viewAllProductsBtn}>
            View All Products <FiArrowRight style={{ marginLeft: '6px' }} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;
