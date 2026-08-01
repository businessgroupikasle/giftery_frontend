import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiTrash2, 
  FiHeart, 
  FiArrowRight, 
  FiArrowLeft, 
  FiShield, 
  FiLock, 
  FiRefreshCw, 
  FiTruck,
  FiCreditCard
} from 'react-icons/fi';
import { FaPaypal, FaApple } from 'react-icons/fa';
import { removeFromCart, updateQuantity, clearCart } from '@store/slices/cartSlice';
import { addToWishlist } from '@store/slices/wishlistSlice';
import { formatCurrency } from '@utils/formatters';
import { ROUTES } from '@constants/routes';
import styles from './Cart.module.css';

// Default mock items if user's cart is empty, matching design image showcase
const INITIAL_DEMO_ITEMS = [
  {
    id: 'c-101',
    name: 'iPhone 15 Pro Max',
    specs: 'Color: Natural Titanium  Storage: 256GB',
    price: 1199,
    quantity: 1,
    image: '/images/cat_tech.png',
    slug: 'iphone-15-pro-max',
  },
  {
    id: 'c-102',
    name: 'AirPods Pro 3',
    specs: 'Color: White',
    price: 249,
    quantity: 2,
    image: '/images/cat_welcome.png',
    slug: 'airpods-pro-3',
  },
  {
    id: 'c-103',
    name: 'Apple Watch Series 11',
    specs: 'Color: Midnight  Size: 45mm',
    price: 399,
    quantity: 1,
    image: '/images/cat_corporate.png',
    slug: 'apple-watch-series-11',
    outOfStock: true,
  },
];

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduxItems = useSelector((state) => state.cart.items) || [];

  // Use Redux items if present, otherwise fallback to initial demo items for showcase
  const cartItems = reduxItems.length > 0 ? reduxItems : INITIAL_DEMO_ITEMS;

  // Form states
  const [shippingForm, setShippingForm] = useState({
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Main Street',
    city: 'New York',
    zipCode: '10001',
    state: 'NY',
    country: 'United States',
    phone: '+1 (555) 123-4567',
    saveInfo: true,
  });

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'paypal' | 'apple'
  const [cardForm, setCardForm] = useState({
    cardNumber: '1234 5678 9012 3456',
    expiry: '12/28',
    cvc: '123',
    cardName: 'John Doe',
  });

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Totals calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || item.product?.price || 0) * item.quantity,
    0
  );
  const shippingFee = subtotal > 500 ? 0 : 15;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const discountAmount = (subtotal * discountPercent) / 100;
  const grandTotal = Math.max(0, subtotal + shippingFee + tax - discountAmount);

  const handleInputChange = (e) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    setCardForm({ ...cardForm, [e.target.name]: e.target.value });
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode) {
      toast.error('Please enter a promo code');
      return;
    }
    if (promoCode.toUpperCase() === 'GIFTERY10' || promoCode.toUpperCase() === 'SAVE10') {
      setDiscountPercent(10);
      toast.success('Promo code applied! 10% OFF 🏷️');
    } else {
      toast.error('Invalid promo code. Try "GIFTERY10"');
    }
  };

  const handleQtyChange = (itemId, newQty) => {
    if (newQty < 1) return;
    dispatch(updateQuantity({ id: itemId, quantity: newQty }));
  };

  const handleRemoveItem = (item) => {
    dispatch(removeFromCart(item.id));
    toast.info(`Removed "${item.name}" from cart`);
  };

  const handleSaveToWishlist = (item) => {
    dispatch(addToWishlist({ id: item.id, name: item.name, price: item.price, image: item.image }));
    toast.success(`Saved "${item.name}" to Wishlist ❤️`);
  };

  const handlePlaceOrder = () => {
    if (!shippingForm.firstName || !shippingForm.address) {
      toast.error('Please complete shipping information');
      return;
    }
    toast.success('Order placed successfully! 🎉 Thank you for shopping with Gifterys.');
    dispatch(clearCart());
    setTimeout(() => {
      navigate(ROUTES.HOME);
    }, 1500);
  };

  return (
    <div className={styles.cartPageWrapper}>
      {/* Top Header Navigation Bar */}
      <header className={styles.topNav}>
        <div className={styles.topNavInner}>
          {/* Logo Left */}
          <Link to={ROUTES.HOME} className={styles.logoWrapper}>
            <div className={styles.logoIcon}>LG</div>
            <span className={styles.logoText}>Logo</span>
          </Link>

          {/* Center Step Indicator (1 Cart ------- 2 Checkout) */}
          <div className={styles.stepIndicator}>
            <div className={`${styles.stepItem} ${styles.activeStep}`}>
              <span className={styles.stepNum}>1</span>
              <span>Cart</span>
            </div>
            <div className={styles.stepLine} />
            <div className={styles.stepItem}>
              <span className={styles.stepNum}>2</span>
              <span>Checkout</span>
            </div>
          </div>

          {/* Secure Checkout Indicator Right */}
          <div className={styles.secureBadge}>
            <FiShield />
            <span>Secure checkout</span>
            <FiLock size={14} />
          </div>
        </div>
      </header>

      {/* Main 2-Column Layout */}
      <div className={styles.mainContainer}>
        {/* Left Column: Guest, Shipping, Payment, Promo */}
        <div className={styles.leftColumn}>
          {/* Card 1: Checkout as Guest */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Checkout as Guest</h2>
                <p className={styles.cardSub}>
                  Sign in to track your order and save your information for faster checkout.
                </p>
              </div>
              <button
                type="button"
                className={styles.signInBtn}
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Card 2: Shipping Information */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Shipping Information</h2>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={shippingForm.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={shippingForm.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.formLabel}>Address</label>
                <input
                  type="text"
                  name="address"
                  value={shippingForm.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>City</label>
                <input
                  type="text"
                  name="city"
                  value={shippingForm.city}
                  onChange={handleInputChange}
                  placeholder="New York"
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={shippingForm.zipCode}
                  onChange={handleInputChange}
                  placeholder="10001"
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>State</label>
                <input
                  type="text"
                  name="state"
                  value={shippingForm.state}
                  onChange={handleInputChange}
                  placeholder="NY"
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Country</label>
                <input
                  type="text"
                  name="country"
                  value={shippingForm.country}
                  onChange={handleInputChange}
                  placeholder="United States"
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.formLabel}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingForm.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={`${styles.fullWidth}`}>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={shippingForm.saveInfo}
                    onChange={(e) =>
                      setShippingForm({ ...shippingForm, saveInfo: e.target.checked })
                    }
                    className={styles.checkboxInput}
                  />
                  Save this information for next time
                </label>
              </div>
            </div>
          </div>

          {/* Card 3: Payment Method */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Payment Method</h2>
            </div>

            {/* Payment Options Selection Pills */}
            <div className={styles.paymentOptionsGrid}>
              <div
                className={`${styles.paymentPill} ${
                  paymentMethod === 'card' ? styles.activePaymentPill : ''
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className={styles.radioCircle}>
                  {paymentMethod === 'card' && <div className={styles.radioInner} />}
                </div>
                <span className={styles.paymentLabel}>
                  <FiCreditCard size={18} /> Credit/Debit Card
                </span>
              </div>

              <div
                className={`${styles.paymentPill} ${
                  paymentMethod === 'paypal' ? styles.activePaymentPill : ''
                }`}
                onClick={() => setPaymentMethod('paypal')}
              >
                <div className={styles.radioCircle}>
                  {paymentMethod === 'paypal' && <div className={styles.radioInner} />}
                </div>
                <span className={styles.paymentLabel}>
                  <FaPaypal color="#003087" size={18} /> PayPal
                </span>
              </div>

              <div
                className={`${styles.paymentPill} ${
                  paymentMethod === 'apple' ? styles.activePaymentPill : ''
                }`}
                onClick={() => setPaymentMethod('apple')}
              >
                <div className={styles.radioCircle}>
                  {paymentMethod === 'apple' && <div className={styles.radioInner} />}
                </div>
                <span className={styles.paymentLabel}>
                  <FaApple color="#000000" size={18} /> Apple Pay
                </span>
              </div>
            </div>

            {/* Card Inputs Form */}
            {paymentMethod === 'card' && (
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardForm.cardNumber}
                    onChange={handleCardChange}
                    placeholder="1234 5678 9012 3456"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Expiry Date</label>
                  <input
                    type="text"
                    name="expiry"
                    value={cardForm.expiry}
                    onChange={handleCardChange}
                    placeholder="MM/YY"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>CVC</label>
                  <input
                    type="text"
                    name="cvc"
                    value={cardForm.cvc}
                    onChange={handleCardChange}
                    placeholder="123"
                    className={styles.formInput}
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>Name on Card</label>
                  <input
                    type="text"
                    name="cardName"
                    value={cardForm.cardName}
                    onChange={handleCardChange}
                    placeholder="John Doe"
                    className={styles.formInput}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Promo Code */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Promo Code</h2>
            </div>
            <form onSubmit={handleApplyPromo} className={styles.promoRow}>
              <input
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className={`${styles.formInput} ${styles.promoInput}`}
              />
              <button type="submit" className={styles.applyBtn}>
                Apply
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary, Order Total, Trust Badges, CTAs */}
        <div className={styles.rightColumn}>
          {/* Card 1: Order Summary */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Order Summary</h2>
            </div>

            <div className={styles.itemList}>
              {cartItems.map((item) => {
                const itemImg = item.image || item.images?.[0] || '/placeholder.jpg';
                const itemPrice = item.price || item.product?.price || 0;

                return (
                  <div key={item.id} className={styles.itemRow}>
                    <img src={itemImg} alt={item.name} className={styles.itemImg} />

                    <div className={styles.itemDetails}>
                      <div className={styles.itemHeader}>
                        <Link
                          to={ROUTES.PRODUCT.replace(':slug', item.slug || 'product')}
                          className={styles.itemName}
                        >
                          {item.name}
                        </Link>
                        <span className={styles.itemPrice}>{formatCurrency(itemPrice)}</span>
                      </div>

                      {item.specs && <span className={styles.itemSpecs}>{item.specs}</span>}

                      {item.outOfStock && (
                        <span className={styles.outOfStockTag}>Out of Stock</span>
                      )}

                      <div className={styles.itemActionsRow}>
                        {/* Quantity Controls */}
                        <div className={styles.qtyBox}>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            –
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>

                        {/* Action Links (Remove & Save) */}
                        <div className={styles.actionLinks}>
                          <button
                            type="button"
                            className={styles.removeLink}
                            onClick={() => handleRemoveItem(item)}
                          >
                            <FiTrash2 size={13} /> Remove
                          </button>

                          <button
                            type="button"
                            className={styles.saveLink}
                            onClick={() => handleSaveToWishlist(item)}
                          >
                            <FiHeart size={13} /> Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Order Total & Free Shipping Banner */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Order Total</h2>
            </div>

            <div className={styles.totalsList}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'Free' : formatCurrency(shippingFee)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              {discountPercent > 0 && (
                <div className={styles.totalRow} style={{ color: '#16a34a', fontWeight: 600 }}>
                  <span>Discount ({discountPercent}%)</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className={styles.totalRowFinal}>
                <span>Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Free Shipping Notification Banner */}
            <div className={styles.shippingBanner}>
              <FiTruck size={18} />
              <span>Free shipping on orders over $500</span>
            </div>
          </div>

          {/* Trust Badges Footer Bar */}
          <div className={styles.trustBadgesCard}>
            <div className={styles.trustBadgeItem}>
              <FiShield className={styles.trustBadgeIcon} />
              <span>Secure Payment</span>
            </div>
            <div className={styles.trustBadgeItem}>
              <FiLock className={styles.trustBadgeIcon} />
              <span>SSL Encrypted</span>
            </div>
            <div className={styles.trustBadgeItem}>
              <FiRefreshCw className={styles.trustBadgeIcon} />
              <span>Free Returns</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <button
            type="button"
            className={styles.placeOrderBtn}
            onClick={handlePlaceOrder}
          >
            <span>Place Order</span>
            <FiArrowRight size={18} />
          </button>

          <Link to={ROUTES.SHOP} className={styles.continueShoppingBtn}>
            <FiArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
