import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiTrash2, FiX } from 'react-icons/fi';
import Layout from '@components/layout/Layout';
import { clearCartAsync, updateQuantity, removeFromCart } from '@store/slices/cartSlice';
import { createPublicId, formatCurrency, formatOrderId } from '@utils/formatters';
import { ROUTES } from '@constants/routes';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import { addressService } from '@services/addressService';
import { isValidMobile, isValidPincode, isValidFullName } from '@utils/validation';
import { unwrapApiData } from '@utils/apiResponse';
import { getStoredCoupons } from '@constants/coupons';
import useStoreSettings from '@hooks/useStoreSettings';
import styles from './Checkout.module.css';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Buy Now temporary item vs Cart Checkout
  const buyNowItem = location.state?.buyNowItem || null;
  const isBuyNow = Boolean(buyNowItem);

  const reduxItems = useSelector((state) => state.cart.items) || [];
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const cartItems = isBuyNow ? [buyNowItem] : reduxItems;
  const [orderCompleted, setOrderCompleted] = useState(null);
  const orderCompletedRef = useRef(false);

  useEffect(() => {
    if (cartItems.length === 0 && !orderCompletedRef.current) {
      toast.info('Your cart is empty. Please add products to checkout.');
      navigate(ROUTES.CART);
    }
  }, [cartItems.length, navigate, orderCompleted]);

  // Active step: 1 = Shopping Cart, 2 = Delivery, 3 = Payment (starts at 2 for Buy Now / direct delivery)
  const [currentStep, setCurrentStep] = useState(2);

  // Saved addresses from Backend DB
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Delivery Address Form State
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    saveAddress: false,
  });

  // Fetch saved addresses from Backend on mount or auth change
  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (!isAuthenticated) return;
      setLoadingAddresses(true);
      try {
        const { addresses, defaultAddress } = await addressService.getAddresses();
        setSavedAddresses(addresses);

        if (addresses.length > 0) {
          const active = defaultAddress || addresses[0];
          setSelectedAddressId(active.id);
          setAddressForm({
            fullName: active.fullName || user?.name || '',
            email: user?.email || '',
            phone: active.phone || user?.phone || '',
            addressLine1: active.street || active.addressLine1 || '',
            landmark: active.landmark || '',
            city: active.city || '',
            state: active.state || '',
            pincode: active.zip || active.pincode || '',
            country: active.country || 'India',
            saveAddress: false,
          });
        } else {
          setSelectedAddressId('new');
          setAddressForm((prev) => ({
            ...prev,
            fullName: user?.name || prev.fullName || '',
            email: user?.email || prev.email || '',
            phone: user?.phone || prev.phone || '',
            saveAddress: true,
          }));
        }
      } catch (err) {
        console.warn('Failed to load saved addresses from DB:', err.message);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchUserAddresses();
  }, [isAuthenticated, user?.id]);

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setAddressForm({
      fullName: addr.fullName || user?.name || '',
      email: user?.email || '',
      phone: addr.phone || user?.phone || '',
      addressLine1: addr.street || addr.addressLine1 || '',
      landmark: addr.landmark || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.zip || addr.pincode || '',
      country: addr.country || 'India',
      saveAddress: false,
    });
  };

  const handleSelectNewAddress = () => {
    setSelectedAddressId('new');
    setAddressForm({
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      addressLine1: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      saveAddress: true,
    });
  };

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod' | 'card'
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const storeSettings = useStoreSettings();

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
      return;
    }

    let type = 'percent';
    let val = 0;

    const rawDiscount = String(matched.discount || matched.discountValue || '');
    if (rawDiscount.includes('%') || matched.discountType === 'percent' || matched.discountType === 'percentage') {
      type = 'percent';
      val = parseFloat(rawDiscount.replace(/[^0-9.]/g, '')) || 0;
    } else {
      type = 'fixed';
      val = parseFloat(rawDiscount.replace(/[^0-9.]/g, '')) || 0;
    }

    const newApplied = {
      code: matched.code,
      discountText: matched.discount || (type === 'percent' ? `${val}% OFF` : `₹${val} OFF`),
      type,
      value: val,
    };

    setAppliedCoupon(newApplied);
    setCouponCode('');
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

  // Totals
  const itemCount = cartItems.length;
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    const rawType = String(appliedCoupon.type || appliedCoupon.discountType || '').toLowerCase();
    const discountStr = String(appliedCoupon.discount || appliedCoupon.discountText || '');
    const isPercent = rawType === 'percent' || rawType === 'percentage' || discountStr.includes('%');

    let numVal = parseFloat(appliedCoupon.value ?? appliedCoupon.discountValue);
    if (isNaN(numVal) || numVal <= 0) {
      numVal = parseFloat(discountStr.replace(/[^0-9.]/g, '')) || 0;
    }

    if (isPercent) {
      discountAmount = (subtotal * numVal) / 100;
    } else {
      discountAmount = Math.min(subtotal, numVal);
    }
  }

  const isFreeShipping = subtotal >= storeSettings.freeShippingThreshold;
  const shippingFee = (isFreeShipping || subtotal === 0) ? 0 : storeSettings.standardShippingFee;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = storeSettings.taxPercentage > 0 ? (taxableAmount * storeSettings.taxPercentage) / 100 : 0;
  const grandTotal = taxableAmount + taxAmount + shippingFee;

  // Dynamically load Razorpay SDK script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'phone') {
      const clean = value.replace(/[^0-9+]/g, '');
      if (clean.length > 13) return;
      setAddressForm((prev) => ({ ...prev, phone: clean }));
      return;
    }
    if (name === 'pincode') {
      const digitsOnly = value.replace(/[^0-9]/g, '');
      if (digitsOnly.length > 6) return;
      setAddressForm((prev) => ({ ...prev, pincode: digitsOnly }));
      return;
    }
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleQtyChange = (id, newQty) => {
    if (newQty < 1) return;
    if (isBuyNow) {
      navigate('/checkout', { state: { buyNowItem: { ...buyNowItem, quantity: newQty } }, replace: true });
    } else {
      dispatch(updateQuantity({ id, quantity: newQty }));
    }
  };

  const handleRemoveItem = (id, name) => {
    if (isBuyNow) {
      navigate(ROUTES.HOME);
    } else {
      dispatch(removeFromCart(id));
      toast.info(`Removed "${name}" from cart`);
    }
  };

  // Step Navigators
  const goToDelivery = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    setCurrentStep(2);
  };

  const goToPayment = (e) => {
    e.preventDefault();
    if (!addressForm.fullName?.trim() || !addressForm.phone?.trim() || !addressForm.addressLine1?.trim() || !addressForm.city?.trim() || !addressForm.pincode?.trim()) {
      toast.error('Please complete all required address fields (*)');
      return;
    }
    if (!isValidFullName(addressForm.fullName)) {
      toast.error('Full Name should allow only valid alphabetic characters and spaces.');
      return;
    }
    if (!isValidMobile(addressForm.phone)) {
      toast.error('Please enter a valid 10-digit mobile number (e.g. 9876543210 or +91 9876543210)');
      return;
    }
    if (!isValidPincode(addressForm.pincode)) {
      toast.error('Please enter a valid 6-digit Pincode / ZIP Code (e.g. 600001)');
      return;
    }
    setCurrentStep(3);
  };

  // Complete Order Handler (Razorpay or COD)
  const createConfirmedOrder = async (orderData, paymentId = null) => {
    const response = await axiosInstance.post(ENDPOINTS.ORDERS.CREATE, {
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      subtotal: orderData.subtotal,
      discountAmount: orderData.discountAmount,
      shippingFee: orderData.shippingFee,
      taxPercentage: orderData.taxPercentage,
      taxAmount: orderData.taxAmount,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      ...(paymentId ? { paymentId } : {}),
    });
    const payload = unwrapApiData(response);
    return payload?.order || payload || {};
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    const orderData = {
      orderId: createPublicId('ORD'),
      items: cartItems,
      subtotal,
      discountAmount,
      shippingFee,
      taxPercentage: storeSettings.taxPercentage,
      taxAmount: taxAmount,
      freeShippingThreshold: storeSettings.freeShippingThreshold,
      couponCode: appliedCoupon?.code || null,
      totalAmount: grandTotal,
      shippingAddress: {
        fullName: addressForm.fullName.trim(),
        email: addressForm.email.trim(),
        phone: addressForm.phone.trim(),
        street: [addressForm.addressLine1.trim(), addressForm.landmark?.trim()].filter(Boolean).join(', '),
        addressLine1: addressForm.addressLine1.trim(),
        landmark: addressForm.landmark ? addressForm.landmark.trim() : '',
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        zip: addressForm.pincode.trim(),
        pincode: addressForm.pincode.trim(),
        country: addressForm.country || 'India',
      },
      paymentMethod,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    if (paymentMethod === 'razorpay') {
      try {
        const createResponse = await axiosInstance.post(ENDPOINTS.PAYMENTS.RAZORPAY_CREATE_ORDER, {
          amount: grandTotal,
          currency: 'INR',
          notes: {
            customerName: addressForm.fullName,
            customerEmail: addressForm.email,
          },
        });
        const createPayload = unwrapApiData(createResponse);
        const orderInfo = createPayload?.order || createPayload;
        const razorpayOrderId = orderInfo?.orderId || orderInfo?.id;
        const razorpayKey = orderInfo?.keyId || orderInfo?.key;

        if (!razorpayOrderId || !razorpayKey) {
          throw new Error('Payment gateway returned an invalid order. Please retry.');
        }

        if (!window.Razorpay) {
          throw new Error('Razorpay payment gateway failed to load. Please check your network or try Cash on Delivery.');
        }

        const cleanPhone = addressForm.phone ? addressForm.phone.replace(/[^0-9]/g, '').slice(-10) : '';
        const options = {
          key: razorpayKey,
          amount: Math.round(Number(orderInfo?.amount || grandTotal * 100)),
          currency: orderInfo?.currency || 'INR',
          name: 'GIFTERY Store',
          description: `Order #${orderData.orderId} - Corporate & Personalized Gifts`,
          order_id: razorpayOrderId,
          handler: async (response) => {
            try {
              const verificationResponse = await axiosInstance.post(ENDPOINTS.PAYMENTS.RAZORPAY_VERIFY, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              const verification = unwrapApiData(verificationResponse);
              if (verification?.verified === false || verification?.success === false) {
                throw new Error(verification?.message || 'Payment signature verification failed.');
              }

              const confirmedOrder = await createConfirmedOrder(orderData, response.razorpay_payment_id);
              await finishOrderSuccess(orderData, confirmedOrder, response.razorpay_payment_id);
              toast.success(`Payment successful! Razorpay ID: ${response.razorpay_payment_id}`);
            } catch (error) {
              const message = error.message || 'Payment verification failed. Please contact support before retrying.';
              setIsProcessing(false);
              setPaymentError({ title: 'Payment Verification Failed', message, code: 'VERIFY_FAILED' });
              toast.error(message);
            }
          },
          prefill: { name: addressForm.fullName, email: addressForm.email, contact: cleanPhone },
          theme: { color: '#1b4d2e' },
          retry: { enabled: true, max_count: 3 },
          modal: { ondismiss: () => setIsProcessing(false), escape: true, backdropclose: false },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', (failureResponse) => {
          setIsProcessing(false);
          const error = failureResponse?.error || {};
          const message = error.description || error.reason || 'Payment failed or was declined by the bank.';
          setPaymentError({
            title: 'Payment Failed',
            message,
            code: error.code || 'PAYMENT_FAILED',
            orderId: error.metadata?.order_id || razorpayOrderId,
            paymentId: error.metadata?.payment_id,
          });
          toast.error(`Payment failed: ${message}`);
        });
        razorpay.open();
      } catch (error) {
        setIsProcessing(false);
        const message = error.message || 'Failed to initialize payment gateway';
        setPaymentError({ message, code: 'ORDER_INIT_FAILED' });
        toast.error(`Payment error: ${message}`);
      }
      return;
    }

    try {
      const confirmedOrder = await createConfirmedOrder(orderData);
      await finishOrderSuccess(orderData, confirmedOrder);
      toast.success('Order placed successfully!');
    } catch (error) {
      setIsProcessing(false);
      const message = error.message || 'The order could not be saved. Please retry.';
      setPaymentError({ title: 'Order Failed', message, code: 'ORDER_CREATE_FAILED' });
      toast.error(message);
    }
  };
  const finishOrderSuccess = async (orderData, confirmedOrder = {}, paymentId = null) => {
    const storedUser = JSON.parse(localStorage.getItem('giftery_user') || '{}');
    const uniqueId = confirmedOrder.id || confirmedOrder.orderId || orderData.orderId;
    const newPlacedOrder = {
      ...orderData,
      ...confirmedOrder,
      id: uniqueId,
      orderId: confirmedOrder.orderNumber || confirmedOrder.publicOrderId || (/^ORD-/i.test(confirmedOrder.orderId || '') ? confirmedOrder.orderId : orderData.orderId),
      createdAt: confirmedOrder.createdAt || new Date().toISOString(),
      status: confirmedOrder.status || 'PENDING',
      paymentId: confirmedOrder.paymentId || paymentId || null,
      customerName: addressForm.fullName || storedUser.name || 'Customer',
      customerEmail: addressForm.email || storedUser.email || '',
      customerPhone: addressForm.phone || '',
    };

    const existingOrders = JSON.parse(localStorage.getItem('giftery_orders') || '[]');
    localStorage.setItem(
      'giftery_orders',
      JSON.stringify([newPlacedOrder, ...existingOrders.filter((order) => order.id !== newPlacedOrder.id)])
    );
    window.dispatchEvent(new Event('orders_updated'));

    if (addressForm.saveAddress && isAuthenticated) {
      try {
        await addressService.createAddress({
          fullName: addressForm.fullName,
          phone: addressForm.phone,
          street: [addressForm.addressLine1, addressForm.landmark].filter(Boolean).join(', '),
          city: addressForm.city,
          state: addressForm.state,
          zip: addressForm.pincode,
          country: addressForm.country || 'India',
          isDefault: savedAddresses.length === 0,
        });
      } catch (error) {
        toast.warning('Order placed, but the delivery address could not be saved to your profile.');
      }
    }

    orderCompletedRef.current = true;
    setOrderCompleted(newPlacedOrder);
    if (!isBuyNow) {
      await dispatch(clearCartAsync());
    }
    setIsProcessing(false);
  };
  if (orderCompleted) {
    return (
      <Layout>
        <div className={styles.successWrapper}>
          <div className={styles.successCard}>
            <h1 className={styles.successTitle}>Thank You For Your Order!</h1>
            <p className={styles.successSub}>
              Order ID: <strong>{formatOrderId(orderCompleted.orderId || orderCompleted.id, { prefix: '', createdAt: orderCompleted.createdAt })}</strong>
            </p>
            <div className={styles.successInfoBox}>
              <p> <strong>Delivering To:</strong> {orderCompleted.shippingAddress.fullName}, {orderCompleted.shippingAddress.addressLine1}, {orderCompleted.shippingAddress.city} - {orderCompleted.shippingAddress.pincode}</p>
              <p> <strong>Payment Method:</strong> {orderCompleted.paymentMethod.toUpperCase()}</p>
              <p> <strong>Total Paid:</strong> ₹{orderCompleted.totalAmount.toLocaleString('en-IN')}.00</p>
            </div>
            <div className={styles.successActions}>
              <Link to={ROUTES.HOME} className={styles.successHomeBtn}>
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.checkoutPageWrapper}>
        <div className={styles.container}>

          {/* ── 1. STEPPER PROGRESS BAR (Matching Design Screenshot) ── */}
          <div className={styles.stepperContainer}>
            <div className={styles.stepperInner}>
              {/* Step 1: Shopping Cart */}
              <div
                className={`${styles.stepItem} ${currentStep === 1 ? styles.activeStep : ''} ${currentStep > 1 ? styles.completedStep : ''}`}
                onClick={() => setCurrentStep(1)}
              >
                <span className={styles.stepNumber}>1</span>
                <span className={styles.stepLabel}>Shopping Cart</span>
              </div>

              <div className={`${styles.stepDivider} ${currentStep >= 2 ? styles.activeDivider : ''}`} />

              {/* Step 2: Delivery */}
              <div
                className={`${styles.stepItem} ${currentStep === 2 ? styles.activeStep : ''} ${currentStep > 2 ? styles.completedStep : ''}`}
                onClick={() => setCurrentStep(2)}
              >
                <span className={styles.stepNumber}>2</span>
                <span className={styles.stepLabel}>Delivery</span>
              </div>

              <div className={`${styles.stepDivider} ${currentStep >= 3 ? styles.activeDivider : ''}`} />

              {/* Step 3: Payment */}
              <div className={`${styles.stepItem} ${currentStep === 3 ? styles.activeStep : ''}`}>
                <span className={styles.stepNumber}>3</span>
                <span className={styles.stepLabel}>Payment</span>
              </div>
            </div>
          </div>

          {/* ── 2. STEP CONTENT GRID ── */}
          <div className={styles.checkoutMainGrid}>

            {/* LEFT COLUMN (Forms according to current step) */}
            <div className={styles.leftCol}>

              {/* ── STEP 1: SHOPPING CART REVIEW ── */}
              {currentStep === 1 && (
                <div className={styles.cardBox}>
                  <h2 className={styles.cardTitle}>Review Shopping Cart</h2>
                  <div className={styles.cartReviewList}>
                    {cartItems.map((item) => (
                      <div key={item.id} className={styles.cartReviewItem}>
                        <img src={item.image} alt={item.name} className={styles.cartReviewImg} />
                        <div className={styles.cartReviewInfo}>
                          <h4 className={styles.reviewItemName}>{item.name}</h4>
                          <span className={styles.reviewItemPrice}>₹{item.price?.toLocaleString('en-IN')}.00</span>
                        </div>
                        <div className={styles.qtyStepperMini}>
                          <button type="button" onClick={() => handleQtyChange(item.id, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => handleQtyChange(item.id, item.quantity + 1)}>+</button>
                        </div>
                        <button type="button" className={styles.deleteMiniBtn} onClick={() => handleRemoveItem(item.id, item.name)} aria-label={`Remove ${item.name}`}><FiTrash2 aria-hidden="true" /></button>
                      </div>
                    ))}
                  </div>
                  <div className={styles.stepCtaRow}>
                    <button type="button" className={styles.nextStepGoldBtn} onClick={goToDelivery}>
                      Proceed to Delivery →
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: DELIVERY ADDRESSING FORM ── */}
              {currentStep === 2 && (
                <form onSubmit={goToPayment} className={styles.cardBox}>
                  <div className={styles.cardTitleRow}>
                    <h2 className={styles.cardTitle}>2. Delivery Address Information</h2>
                    <span className={styles.stepBadge}>Step 2 of 3</span>
                  </div>

                  {/* Saved Addresses Selector (if user has saved addresses) */}
                  {savedAddresses.length > 0 && (
                    <div style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '0.75rem' }}>
                        Choose from your saved delivery addresses:
                      </label>
                      <div className={styles.savedAddressesGrid}>
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id;
                          return (
                            <div
                              key={addr.id}
                              className={`${styles.savedAddressCard} ${isSelected ? styles.selectedAddressCard : ''}`}
                              onClick={() => handleSelectSavedAddress(addr)}
                            >
                              <div className={styles.addrCardHeader}>
                                <span className={styles.addrCardName}>
                                  {isSelected ? ' ' : ''}{addr.fullName}
                                </span>
                                {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                              </div>
                              <p className={styles.addrCardText}>
                                {addr.street || addr.addressLine1}
                                {addr.city ? `, ${addr.city}` : ''}
                                {addr.state ? `, ${addr.state}` : ''}
                                {addr.zip || addr.pincode ? ` - ${addr.zip || addr.pincode}` : ''}
                              </p>
                              {addr.phone && <div className={styles.addrCardPhone}> {addr.phone}</div>}
                            </div>
                          );
                        })}

                        <div
                          className={`${styles.addNewAddressOption} ${selectedAddressId === 'new' ? styles.newAddressOptionActive : ''}`}
                          onClick={handleSelectNewAddress}
                        >
                          <span>+ Enter A Different Address</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={styles.formGrid}>
                    {/* Full Name */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={addressForm.fullName}
                        onChange={handleAddressChange}
                        placeholder="John Doe"
                        className={styles.formInput}
                      />
                    </div>

                    {/* Email */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={addressForm.email}
                        onChange={handleAddressChange}
                        placeholder="john@example.com"
                        className={styles.formInput}
                      />
                    </div>

                    {/* Phone Number */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Mobile / Phone Number * (10 Digits)</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        maxLength={13}
                        inputMode="tel"
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                        placeholder="9876543210"
                        className={styles.formInput}
                      />
                    </div>

                    {/* Pincode */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Pincode / ZIP Code * (6 Digits)</label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        maxLength={6}
                        inputMode="numeric"
                        value={addressForm.pincode}
                        onChange={handleAddressChange}
                        placeholder="600001"
                        className={styles.formInput}
                      />
                    </div>

                    {/* Address Line 1 */}
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label className={styles.formLabel}>Street Address / House No. *</label>
                      <input
                        type="text"
                        name="addressLine1"
                        required
                        value={addressForm.addressLine1}
                        onChange={handleAddressChange}
                        placeholder="Flat 4B, Lotus Apartments, Green Road"
                        className={styles.formInput}
                      />
                    </div>

                    {/* Landmark / Apartment */}
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label className={styles.formLabel}>Landmark / Area (Optional)</label>
                      <input
                        type="text"
                        name="landmark"
                        value={addressForm.landmark}
                        onChange={handleAddressChange}
                        placeholder="Near Metro Station"
                        className={styles.formInput}
                      />
                    </div>

                    {/* City */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        placeholder="Chennai"
                        className={styles.formInput}
                      />
                    </div>

                    {/* State */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>State *</label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={addressForm.state}
                        onChange={handleAddressChange}
                        placeholder="Tamil Nadu"
                        className={styles.formInput}
                      />
                    </div>
                  </div>

                  {/* Save Address Checkbox */}
                  <div className={styles.checkboxRow}>
                    <input
                      id="saveAddressCheck"
                      type="checkbox"
                      name="saveAddress"
                      checked={addressForm.saveAddress}
                      onChange={handleAddressChange}
                    />
                    <label htmlFor="saveAddressCheck">Save this delivery address for future orders</label>
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.stepCtaRow}>
                    <button type="button" className={styles.backOutlineBtn} onClick={() => setCurrentStep(1)}>
                      ← Back to Cart
                    </button>
                    <button type="submit" className={styles.nextStepGoldBtn}>
                      Proceed to Payment →
                    </button>
                  </div>
                </form>
              )}

              {/* ── STEP 3: PAYMENT OPTIONS & RAZORPAY ── */}
              {currentStep === 3 && (
                <div className={styles.cardBox}>
                  <div className={styles.cardTitleRow}>
                    <h2 className={styles.cardTitle}>3. Select Payment Option</h2>
                    <span className={styles.stepBadge}>Step 3 of 3</span>
                  </div>

                  {/* Payment Method Selector Pills */}
                  <div className={styles.paymentMethodsGrid}>

                    {/* Razorpay Option */}
                    <div
                      className={`${styles.paymentMethodCard} ${paymentMethod === 'razorpay' ? styles.activePaymentCard : ''}`}
                      onClick={() => setPaymentMethod('razorpay')}
                    >
                      <div className={styles.radioRadio}>
                        {paymentMethod === 'razorpay' && <div className={styles.radioDot} />}
                      </div>
                      <div className={styles.paymentCardContent}>
                        <div className={styles.paymentCardTitleRow}>
                          <strong className={styles.paymentCardTitle}>Razorpay Instant Payment</strong>
                          <span className={styles.recommendedBadge}>RECOMMENDED</span>
                        </div>
                        <p className={styles.paymentCardDesc}>
                          Pay via UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking & Wallets securely.
                        </p>
                        <div className={styles.razorpayLogosRow}>
                          <span className={styles.payBadgeIcon}>GPay</span>
                          <span className={styles.payBadgeIcon}>PhonePe</span>
                          <span className={styles.payBadgeIcon}>Paytm</span>
                          <span className={styles.payBadgeIcon}>UPI</span>
                          <span className={styles.payBadgeIcon}>Cards</span>
                        </div>
                      </div>
                    </div>

                    {/* Cash on Delivery (COD) Option */}
                    <div
                      className={`${styles.paymentMethodCard} ${paymentMethod === 'cod' ? styles.activePaymentCard : ''}`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <div className={styles.radioRadio}>
                        {paymentMethod === 'cod' && <div className={styles.radioDot} />}
                      </div>
                      <div className={styles.paymentCardContent}>
                        <strong className={styles.paymentCardTitle}>Cash on Delivery (COD)</strong>
                        <p className={styles.paymentCardDesc}>
                          Pay with cash or UPI at your doorstep upon delivery.
                        </p>
                      </div>
                    </div>

                  </div>

{/* Payment Failure Card with Retry & Fallback Options */}
                  {paymentError && (
                    <div className={styles.paymentErrorCard}>
                      <div className={styles.paymentErrorHeader}>
                        <div className={styles.paymentErrorTextGroup}>
                          <strong className={styles.paymentErrorTitle}>Payment Failed</strong>
                          <p className={styles.paymentErrorReason}>{paymentError.message}</p>
                          {paymentError.code && (
                            <span className={styles.paymentErrorCode}>Reason Code: {paymentError.code}</span>
                          )}
                        </div>
                      </div>
                      <div className={styles.paymentErrorActions}>
                        <button
                          type="button"
                          className={styles.retryPaymentBtn}
                          onClick={handleCompleteOrder}
                        >
                           Retry Payment
                        </button>
                        <button
                          type="button"
                          className={styles.codFallbackBtn}
                          onClick={() => {
                            setPaymentMethod('cod');
                            setPaymentError(null);
                          }}
                        >
                           Switch to Cash on Delivery (COD)
                        </button>

                      </div>
                    </div>
                  )}

                  {/* Complete Payment Button */}
                  <div className={styles.stepCtaRow} style={{ marginTop: '2rem' }}>
                    <button type="button" className={styles.backOutlineBtn} onClick={() => setCurrentStep(2)}>
                      ← Back to Delivery
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      className={styles.payNowGoldBtn}
                      onClick={handleCompleteOrder}
                    >
                      {isProcessing
                        ? 'Processing Payment...'
                        : paymentMethod === 'razorpay'
                        ? `Pay ₹${grandTotal.toLocaleString('en-IN')}.00 via Razorpay `
                        : `Place Order via COD `}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR */}
            <div className={styles.rightCol}>
              <div className={styles.summarySidebarCard}>
                <h3 className={styles.sidebarTitle}>Order Summary</h3>

                {/* Items preview */}
                <div className={styles.sidebarItemsList}>
                  {cartItems.map((item) => (
                    <div key={item.id} className={styles.sidebarItemRow}>
                      <img src={item.image} alt={item.name} className={styles.sidebarImg} />
                      <div className={styles.sidebarInfo}>
                        <strong className={styles.sidebarItemName}>{item.name}</strong>
                        <span className={styles.sidebarItemQty}>Qty: {item.quantity}</span>
                      </div>
                      <span className={styles.sidebarItemPrice}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.sidebarDivider} />

                {/* Coupon Apply Option */}
                <div className={styles.sidebarCouponWrapper}>
                  {appliedCoupon ? (
                    <div className={styles.appliedCouponPill}>
                      <div className={styles.appliedCouponInfo}>
                        <span className={styles.appliedCouponCode}> {appliedCoupon.code}</span>
                        <span className={styles.appliedCouponDesc}>({appliedCoupon.discountText})</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className={styles.removeCouponBtn}
                        title="Remove coupon"
                      >
                        <FiX aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className={styles.sidebarCouponForm}>
                      <div className={styles.sidebarCouponInputWrapper}>
                        <input
                          type="text"
                          placeholder="Promo / Coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className={styles.sidebarCouponInput}
                        />
                      </div>
                      <button type="submit" className={styles.sidebarCouponApplyBtn}>
                        APPLY
                      </button>
                    </form>
                  )}
                </div>

                {/* Price calculations */}
                <div className={styles.sidebarTotals}>
                  <div className={styles.sidebarRow}>
                    <span>Subtotal ({itemCount} items)</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}.00</span>
                  </div>
                  {appliedCoupon && (
                    <div className={styles.sidebarRow}>
                      <span>Discount ({appliedCoupon.code}{appliedCoupon.discountText ? ` - ${appliedCoupon.discountText}` : ''})</span>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>
                        -₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className={styles.sidebarRow}>
                    <span>Delivery Charges</span>
                    <span style={{ color: shippingFee === 0 ? '#16a34a' : 'inherit', fontWeight: 700 }}>
                      {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                    </span>
                  </div>
                  <div className={styles.sidebarRow}>
                    <span>GST ({storeSettings.taxPercentage}%)</span>
                    <span>₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className={styles.sidebarDivider} />
                  <div className={styles.sidebarTotalRow}>
                    <strong>Total Amount</strong>
                    <strong className={styles.totalGoldText}>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </div>
                </div>

                {/* Security Badge Footer */}
                <div className={styles.sidebarSecurityFooter}>
                  <span> 256-bit Bank Grade SSL Security</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
