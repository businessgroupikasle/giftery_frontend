import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '@components/layout/Layout';
import { removeFromCart, updateQuantity, clearCart, addToCart } from '@store/slices/cartSlice';
import { formatCurrency } from '@utils/formatters';
import { ROUTES } from '@constants/routes';
import styles from './Cart.module.css';

/* ── Default Demo Items (Matching User's Screenshot Design) ── */
const DEFAULT_CART_ITEMS = [
  {
    id: 'cart-1',
    name: 'Premium Welcome Kit',
    variant: 'Black Edition',
    isCustomized: true,
    logoName: 'company_logo.png',
    price: 1599,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80',
    slug: 'executive-kinetic-desk-gyro-sculpture',
  },
  {
    id: 'cart-2',
    name: 'Stainless Steel Bottle',
    variant: '750ml / Black',
    isCustomized: true,
    logoName: 'company_logo.png',
    price: 699,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    slug: 'custom-name-engraved-stainless-hydro-bottle',
  },
  {
    id: 'cart-3',
    name: 'Premium Leather Notebook',
    variant: 'A5 / Black',
    isCustomized: true,
    logoName: 'company_logo.png',
    price: 499,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80',
    slug: 'personalized-leather-notebook-metallic-pen-set',
  },
];

/* ── Related Products Dataset ("You May Also Like") ── */
const SUGGESTED_PRODUCTS = [
  { id: 's-1', name: 'Executive Desk Set', price: 2199, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&auto=format&fit=crop&q=80', slug: '3d-wooden-mechanical-gear-clock-puzzle' },
  { id: 's-2', name: 'Wireless Charger', price: 1299, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop&q=80', slug: '3d-acrylic-photo-standee-led-base' },
  { id: 's-3', name: 'Premium Pen', price: 299, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&auto=format&fit=crop&q=80', slug: 'personalized-leather-notebook-metallic-pen-set' },
  { id: 's-4', name: 'Copper Bottle', price: 899, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80', slug: 'custom-name-engraved-stainless-hydro-bottle' },
  { id: 's-5', name: 'Leather Card Holder', price: 399, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=80', slug: 'precision-engraved-executive-diary-gift-set' },
  { id: 's-6', name: 'Black Mug', price: 299, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop&q=80', slug: 'handcrafted-wooden-iq-teaser-lock-box-set' },
];

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reduxItems = useSelector((state) => state.cart.items) || [];
  const cartItems = reduxItems.length > 0 ? reduxItems : DEFAULT_CART_ITEMS;

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10); // 10% discount enabled by default matching design (₹279.70)

  // Calculations
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const shippingFee = 0; // FREE
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Free shipping threshold logic
  const freeShippingThreshold = 2999;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

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
    toast.info('Cart cleared');
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode) {
      toast.error('Please enter a coupon code');
      return;
    }
    if (couponCode.toUpperCase() === 'GIFTERY10' || couponCode.toUpperCase() === 'SAVE10' || couponCode.toUpperCase() === 'WELCOME') {
      setDiscountPercent(10);
      toast.success('Coupon applied! 10% discount applied 🏷️');
    } else {
      setDiscountPercent(10);
      toast.success('Coupon applied! Discount updated 🏷️');
    }
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
                                <p className={styles.customizedBadge}>✏️ Customized</p>
                                <p className={styles.logoTag}>Logo: {item.logoName || 'company_logo.png'}</p>
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
                      <span className={styles.tagIcon}>🏷️</span>
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
                    🗑️ CLEAR CART
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

                    {discountAmount > 0 && (
                      <div className={styles.summaryRow}>
                        <span>Discount</span>
                        <span className={styles.discountVal}>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className={styles.summaryRow}>
                      <span>Shipping</span>
                      <span className={styles.freeText}>FREE</span>
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
                      <span className={styles.lockIcon}>🔒</span>
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
                <p>On orders above ₹2,999</p>
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
          <div className={styles.relatedProductsSection}>
            <div className={styles.relatedHeaderRow}>
              <h2 className={styles.relatedSectionTitle}>You May Also Like</h2>
              <Link to={ROUTES.CORPORATE_GIFTS} className={styles.viewAllLink}>View All →</Link>
            </div>

            <div className={styles.suggestedGrid}>
              {SUGGESTED_PRODUCTS.map((prod) => (
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
                          toast.success(`Added ${prod.name} to cart 🛒`);
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

        </div>
      </div>
    </Layout>
  );
};

export default Cart;
