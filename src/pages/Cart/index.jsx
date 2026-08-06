import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '@components/layout/Layout';
import { removeFromCart, updateQuantity, clearCart, addToCart } from '@store/slices/cartSlice';
import { formatCurrency } from '@utils/formatters';
import { ROUTES } from '@constants/routes';
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

      const localProducts = JSON.parse(localStorage.getItem('giftery_products') || '[]');
      const combined = [...localProducts];
      apiProducts.forEach(ap => {
        if (!combined.find(c => c.id === ap.id || c.slug === ap.slug)) combined.push(ap);
      });

      if (combined.length > 0) {
        const cartIds = new Set(cartItems.map(i => i.id));
        const filtered = combined
          .filter(p => !cartIds.has(p.id))
          .slice(0, 6)
          .map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: Array.isArray(p.images) ? p.images[0] : (p.image || '/placeholder.jpg'),
            slug: p.slug,
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

  const [availableCoupons, setAvailableCoupons] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_coupons');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      { id: 'c-1', code: 'LUXURY20', discount: '20% OFF', category: 'Corporate Gifts', status: 'Active' },
      { id: 'c-2', code: 'WELCOME10', discount: '₹100 OFF', category: 'First Purchase', status: 'Active' },
      { id: 'c-3', code: 'GIFTERY10', discount: '10% OFF', category: 'All Products', status: 'Active' },
      { id: 'c-4', code: 'SAVE10', discount: '₹50 OFF', category: 'Special Offer', status: 'Active' },
    ];
  });

  useEffect(() => {
    const handleCouponsUpdate = () => {
      try {
        const stored = localStorage.getItem('admin_coupons');
        if (stored) setAvailableCoupons(JSON.parse(stored));
      } catch (e) {}
    };
    window.addEventListener('admin_coupons_updated', handleCouponsUpdate);
    return () => window.removeEventListener('admin_coupons_updated', handleCouponsUpdate);
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

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode || !couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    const trimmedInput = couponCode.trim().toUpperCase();
    const matched = availableCoupons.find(
      (c) => c.code.toUpperCase() === trimmedInput && c.status === 'Active'
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
          <div className={styles.shippingBannerCard}>
            <div className={styles.shippingBannerContent}>
              <div className={styles.eligibleBadge}>
                <span className={styles.greenCheck}>✓</span>
                <span>You are eligible for free shipping!</span>
              </div>
              <div className={styles.progressBarWrapper}>
                <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
              </div>
              <div className={styles.shippingMsgText}>
                {isFreeShipping ? (
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>FREE shipping unlocked!</span>
                ) : (
                  <span>Add ₹{amountNeededForFreeShipping} more to get <strong>FREE shipping</strong></span>
                )}
              </div>
            </div>
          </div>

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
                                <img src={item.image} alt={item.name} />
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
                <Link to={ROUTES.CORPORATE_GIFTS} className={styles.viewAllLink}>View All →</Link>
              </div>

              <div className={styles.suggestedGrid}>
                {suggestedProducts.map((prod) => (
                  <div key={prod.id} className={styles.suggestedCard} onClick={() => navigate(ROUTES.PRODUCT_PATH(prod.slug))}>
                    <div className={styles.suggestedImgBox}>
                      <img src={prod.image} alt={prod.name} />
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
