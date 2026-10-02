import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '@components/layout/Layout';
import { removeFromCart, updateQuantity, clearCart, addToCart } from '@store/slices/cartSlice';
import { formatCurrency } from '@utils/formatters';
import { getImageUrl } from '@utils/imageUrl';
import { ROUTES } from '@constants/routes';
import { getStoredCoupons, DEFAULT_COUPONS } from '@constants/coupons';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import styles from './Cart.module.css';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reduxItems = useSelector((state) => state.cart.items) || [];
  const cartItems = reduxItems;

  const [suggestedProducts, setSuggestedProducts] = useState([]);

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
        const cartIds = new Set(cartItems.map(i => i.id));
        const filtered = apiProducts
          .filter(p => !cartIds.has(p.id))
          .slice(0, 6)
          .map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: Array.isArray(p.images) ? p.images[0] : (p.image || '/placeholder.jpg'),
            slug: p.slug,
            categoryName: p.categoryName || p.category?.name || (typeof p.category === 'string' ? p.category : ''),
            categorySlug: p.categorySlug || p.category?.slug || '',
            subCategorySlug: p.subCategorySlug || p.subCategory?.slug || '',
          }));
        setSuggestedProducts(filtered);
      }
    };

    fetchLiveProducts();
    window.addEventListener('products_updated', fetchLiveProducts);
    return () => window.removeEventListener('products_updated', fetchLiveProducts);
  }, [cartItems.length]);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const stored = localStorage.getItem('giftery_applied_coupon');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  });

  const [availableCoupons, setAvailableCoupons] = useState(() => getStoredCoupons());

  useEffect(() => {
    const handleCouponsUpdate = () => {
      setAvailableCoupons(getStoredCoupons());
    };
    window.addEventListener('admin_coupons_updated', handleCouponsUpdate);
    window.addEventListener('storage', handleCouponsUpdate);
    return () => {
      window.removeEventListener('admin_coupons_updated', handleCouponsUpdate);
      window.removeEventListener('storage', handleCouponsUpdate);
    };
  }, []);

  const [storeSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('store_basic_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          freeShippingThreshold: parsed.freeShippingThreshold !== undefined && parsed.freeShippingThreshold !== '' ? Number(parsed.freeShippingThreshold) : 5000,
          standardShippingFee: parsed.standardShippingFee !== undefined && parsed.standardShippingFee !== '' ? Number(parsed.standardShippingFee) : 99,
        };
      }
    } catch (e) {}
    return { freeShippingThreshold: 5000, standardShippingFee: 99 };
  });

  // Calculations
  const itemCount = cartItems.length;
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discountAmount = (subtotal * appliedCoupon.value) / 100;
    } else if (appliedCoupon.type === 'fixed') {
      discountAmount = Math.min(subtotal, appliedCoupon.value);
    }
  }

  // Free shipping threshold logic
  const freeShippingThreshold = storeSettings.freeShippingThreshold;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const shippingFee = (isFreeShipping || subtotal === 0) ? 0 : storeSettings.standardShippingFee;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleQtyChange = (id, newQty) => {
    if (newQty < 1) return;
    dispatch(updateQuantity({ id, quantity: newQty }));
  };

  const handleRemoveItem = (id, name) => {
    dispatch(removeFromCart(id));
    toast.info(`Removed "${name}" from cart`);
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    setAppliedCoupon(null);
    localStorage.removeItem('giftery_applied_coupon');
    toast.info('Cart cleared');
  };

  const getSuggestedViewAllLink = () => {
    // 1. Check cart items for dominant category
    for (const item of cartItems) {
      const cat = (item.categoryName || item.category || '').toLowerCase();
      if (cat.includes('toy')) return ROUTES.TOYS;
      if (cat.includes('personal') || cat.includes('frame') || cat.includes('photo') || cat.includes('acrylic') || cat.includes('caricature')) {
        return ROUTES.PERSONALIZED_GIFTS;
      }
    }
    // 2. Check suggested products
    if (suggestedProducts.length > 0) {
      const first = suggestedProducts[0];
      const catSlug = (first.categorySlug || '').toLowerCase();
      const catName = (first.categoryName || '').toLowerCase();
      if (catSlug === 'toys' || catName.includes('toy')) return ROUTES.TOYS;
      if (catSlug === 'personalized-gifts' || catName.includes('personal') || catName.includes('frame') || catName.includes('photo')) {
        return ROUTES.PERSONALIZED_GIFTS;
      }
      if (first.subCategorySlug) {
        return `${ROUTES.CORPORATE_GIFTS}?subCategory=${encodeURIComponent(first.subCategorySlug)}`;
      }
    }
    return ROUTES.CORPORATE_GIFTS;
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode || !couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    const trimmedInput = couponCode.trim().toUpperCase();

    // Query live list combining fresh storage, current state, and canonical defaults
    const freshCoupons = getStoredCoupons();
    const candidateList = [...availableCoupons, ...freshCoupons];
    const map = new Map();
    candidateList.forEach((c) => {
      if (c && c.code) map.set(c.code.toUpperCase(), c);
    });
    const allCoupons = Array.from(map.values());

    const matched = allCoupons.find(
      (c) => c.code.toUpperCase() === trimmedInput && String(c.status || 'Active').toUpperCase() === 'ACTIVE'
    );

    if (!matched) {
      toast.error(`Invalid or expired coupon code "${couponCode}"`);
      setAppliedCoupon(null);
      try {
        localStorage.removeItem('giftery_applied_coupon');
      } catch (err) {}
      return;
    }

    let type = 'percent';
    let val = 0;

    if (matched.discount.includes('%')) {
      type = 'percent';
      val = parseFloat(matched.discount.replace(/[^0-9.]/g, '')) || 0;
    } else {
      type = 'fixed';
      val = parseFloat(matched.discount.replace(/[^0-9.]/g, '')) || 0;
    }

    const newApplied = {
      code: matched.code,
      discountText: matched.discount,
      type,
      value: val,
    };

    setAppliedCoupon(newApplied);
    try {
      localStorage.setItem('giftery_applied_coupon', JSON.stringify(newApplied));
    } catch (err) {}

    toast.success(`Coupon "${matched.code}" applied! Discount updated`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    try {
      localStorage.removeItem('giftery_applied_coupon');
    } catch (err) {}
    toast.info('Coupon removed');
  };

  const handleProceedToCheckout = () => {
    navigate(ROUTES.CHECKOUT);
  };

  return (
    <Layout>
      <div className={styles.cartPageWrapper}>
        <div className={styles.container}>

          {/* ── 1. PAGE TITLE & FREE SHIPPING BAR ── */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              Your Cart <span className={styles.itemCountBadge}>({itemCount} Items)</span>
            </h1>
          </div>

          {/* Free Shipping Progress Banner */}
          {cartItems.length > 0 && (
            <div className={`${styles.shippingBannerCard} ${isFreeShipping ? styles.shippingBannerEligible : ''}`}>
              <div className={styles.shippingBannerContent}>
                {isFreeShipping ? (
                  <>
                    <div className={styles.eligibleBadge}>
                      <span className={styles.greenCheck}>✓</span>
                      <span>You are eligible for free shipping!</span>
                    </div>
                    <div className={styles.progressBarWrapper}>
                      <div
                        className={`${styles.progressBarFill} ${styles.progressBarFillEligible}`}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className={styles.shippingMsgText}>
                      <span className={styles.freeShippingUnlockedText}>FREE shipping unlocked!</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.progressBarWrapper}>
                      <div
                        className={styles.progressBarFill}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className={styles.shippingMsgText}>
                      <span>
                        Add ₹{amountNeededForFreeShipping.toLocaleString('en-IN')} more to get <strong>FREE shipping</strong>
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── 2. MAIN CART GRID ── */}
          {cartItems.length === 0 ? (
            /* Empty Cart View */
            <div className={styles.emptyCartCard}>
              <div className={styles.emptyCartContent}>
                <span className={styles.emptyCartIcon}>🛒</span>
                <h2>Your Cart is Empty</h2>
                <p>Explore our luxury corporate and personalized gift collections to add items to your cart.</p>
                <Link to={ROUTES.CORPORATE_GIFTS} className={styles.exploreBtn}>
                  Explore Products
                </Link>
              </div>
            </div>
          ) : (
            /* Populated Cart Grid */
            <div className={styles.cartMainGrid}>

              {/* Left Column: Cart Items Table + Coupon Row */}
              <div className={styles.cartLeftCol}>
                <div className={styles.cartItemsCard}>
                  {/* Table Header Row */}
                  <div className={styles.tableHeaderRow}>
                    <span className={styles.colProduct}>PRODUCT</span>
                    <span className={styles.colPrice}>PRICE</span>
                    <span className={styles.colQty}>QUANTITY</span>
                    <span className={styles.colTotal}>TOTAL</span>
                    <span className={styles.colDelete}></span>
                  </div>

                  {/* Cart Items List */}
                  <div className={styles.itemsList}>
                    {cartItems.map((item) => {
                      const itemTotal = (item.price || 0) * item.quantity;
                      return (
                        <div key={item.id} className={styles.cartItemRow}>
                          {/* Product Info */}
                          <div className={styles.colProduct}>
                            <div className={styles.productFlex}>
                              <div className={styles.itemImgBox}>
                                <img
                                  src={getImageUrl(item.image)}
                                  alt={item.name}
                                  onError={(e) => { e.currentTarget.src = '/placeholder-product.png'; }}
                                />
                              </div>
                              <div className={styles.itemDetails}>
                                <h3 className={styles.itemName}>{item.name}</h3>
                                {item.variant && <p className={styles.itemVariant}>{item.variant}</p>}
                              </div>
                            </div>
                          </div>

                          {/* Price */}
                          <div className={styles.colPrice}>
                            <span className={styles.priceText}>₹{item.price?.toLocaleString('en-IN')}.00</span>
                          </div>

                          {/* Quantity */}
                          <div className={styles.colQty}>
                            <div className={styles.qtyStepper}>
                              <button type="button" onClick={() => handleQtyChange(item.id, item.quantity - 1)}>-</button>
                              <span>{item.quantity}</span>
                              <button type="button" onClick={() => handleQtyChange(item.id, item.quantity + 1)}>+</button>
                            </div>
                          </div>

                          {/* Total */}
                          <div className={styles.colTotal}>
                            <span className={styles.totalText}>₹{itemTotal.toLocaleString('en-IN')}.00</span>
                          </div>

                          {/* Delete */}
                          <div className={styles.colDelete}>
                            <button
                              type="button"
                              className={styles.deleteBtn}
                              onClick={() => handleRemoveItem(item.id, item.name)}
                              title="Remove item"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Coupon Code & Clear Cart Row */}
                <div className={styles.bottomActionsRow}>
                  <form onSubmit={handleApplyCoupon} className={styles.couponForm}>
                    <div className={styles.couponInputWrapper}>
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className={styles.couponInput}
                      />
                    </div>
                    <button type="submit" className={styles.applyBtn}>
                      APPLY
                    </button>
                  </form>

                  <button type="button" className={styles.clearCartBtn} onClick={handleClearCart}>
                    CLEAR CART
                  </button>
                </div>
              </div>

              {/* Right Column: Order Summary Card */}
              <div className={styles.cartRightCol}>
                <div className={styles.summaryCard}>
                  <h2 className={styles.summaryTitle}>Order Summary</h2>

                  <div className={styles.summaryRowsList}>
                    <div className={styles.summaryRow}>
                      <span>Subtotal ({itemCount} Items)</span>
                      <span className={styles.rowValBold}>₹{subtotal.toLocaleString('en-IN')}.00</span>
                    </div>

                    {appliedCoupon && (
                      <div className={styles.summaryRow} style={{ color: '#166534', background: '#f0fdf4', padding: '0.4rem 0.6rem', borderRadius: '6px', margin: '0.25rem 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.82rem' }}>Coupon: {appliedCoupon.code}</span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>({appliedCoupon.discountText})</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                          title="Remove Coupon"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {discountAmount > 0 && (
                      <div className={styles.summaryRow}>
                        <span>Discount Savings</span>
                        <span className={styles.discountVal}>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className={styles.summaryRow}>
                      <span>Shipping</span>
                      <span className={shippingFee === 0 ? styles.freeText : styles.rowValBold}>
                        {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                      </span>
                    </div>

                    <div className={styles.dividerLine} />

                    <div className={styles.totalSummaryRow}>
                      <div>
                        <strong className={styles.totalLabel}>Total</strong>
                        <p className={styles.taxesSubtext}>(Inclusive of all taxes)</p>
                      </div>
                      <span className={styles.grandTotalText}>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Checkout & Continue Shopping CTAs */}
                  <div className={styles.summaryCtaGroup}>
                    <button type="button" className={styles.proceedCheckoutBtn} onClick={handleProceedToCheckout}>
                      <span>PROCEED TO CHECKOUT</span>
                    </button>

                    <Link to={ROUTES.SHOP} className={styles.continueShoppingOutlineBtn}>
                      CONTINUE SHOPPING
                    </Link>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ── 3. TRUST & FEATURE HIGHLIGHTS BANNER ── */}
          <div className={styles.featureHighlightsBanner}>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🚚</span>
              <div>
                <strong>Free Shipping</strong>
                <p>On orders above ₹{freeShippingThreshold.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🛡️</span>
              <div>
                <strong>Secure Payment</strong>
                <p>100% safe & secure</p>
              </div>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🔄</span>
              <div>
                <strong>Easy Returns</strong>
                <p>7-day return policy</p>
              </div>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>⭐</span>
              <div>
                <strong>Best Quality</strong>
                <p>Premium products only</p>
              </div>
            </div>
          </div>

          {/* ── 4. "YOU MAY ALSO LIKE" RELATED PRODUCTS GRID ── */}
          {suggestedProducts.length > 0 && (
            <div className={styles.relatedProductsSection}>
              <div className={styles.relatedHeaderRow}>
                <h2 className={styles.relatedSectionTitle}>You May Also Like</h2>
                <Link to={getSuggestedViewAllLink()} className={styles.viewAllLink}>View All →</Link>
              </div>

              <div className={styles.suggestedGrid}>
                {suggestedProducts.map((prod) => (
                  <div key={prod.id} className={styles.suggestedCard} onClick={() => navigate(ROUTES.PRODUCT_PATH(prod.slug))}>
                    <div className={styles.suggestedImgBox}>
                      <img
                        src={getImageUrl(prod.image)}
                        alt={prod.name}
                        onError={(e) => { e.currentTarget.src = '/placeholder-product.png'; }}
                      />
                    </div>
                    <div className={styles.suggestedInfo}>
                      <h4 className={styles.suggestedName}>{prod.name}</h4>
                      <div className={styles.suggestedPriceRow}>
                        <span className={styles.suggestedPrice}>₹{prod.price?.toLocaleString('en-IN')}.00</span>
                        <button
                          type="button"
                          className={styles.miniCartBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(addToCart({ id: prod.id, name: prod.name, price: prod.price, image: prod.image, slug: prod.slug }));
                            toast.success(`Added ${prod.name} to cart`);
                          }}
                          aria-label="Add to cart"
                        >
                          🛒
                        </button>
                      </div>
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

export default Cart;
