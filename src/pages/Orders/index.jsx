import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Layout from '@components/layout/Layout';
import PrivateImage from '@components/PrivateImage';
import useFetch from '@hooks/useFetch';
import { ENDPOINTS } from '@api/endpoints';
import { formatDate, formatOrderId } from '@utils/formatters';
import styles from './Orders.module.css';
import InvoiceModal from './InvoiceModal';
import { CustomizationStatus } from '@components/customization/CustomizationDetails';

const STATUS_COPY = {
  PENDING: 'Order placed',
  CONFIRMED: 'Order confirmed',
  PROCESSING: 'Preparing your order',
  SHIPPED: 'Your order is on the way',
  DELIVERED: 'Your item has been delivered',
  CANCELLED: 'This order was cancelled',
  REFUNDED: 'This order was refunded',
};

const Orders = () => {
  const reduxUser = useSelector((state) => state.auth.user);
  const { data, loading: fetchLoading, fetch: refetchOrders } = useFetch(ENDPOINTS.ORDERS.MY);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const loadOrders = () => {
      const apiOrders = Array.isArray(data?.data?.data)
        ? data.data.data
        : (Array.isArray(data?.data?.orders)
          ? data.data.orders
          : (Array.isArray(data?.data)
            ? data.data
            : (Array.isArray(data?.orders)
              ? data.orders
              : (Array.isArray(data) ? data : []))));

      let localOrders = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('giftery_orders') || '[]');
      } catch {
        localOrders = [];
      }

      const filteredLocal = reduxUser?.id
        ? localOrders.filter((order) => order.ownerUserId && String(order.ownerUserId) === String(reduxUser.id))
        : [];
      const mergedMap = new Map();

      filteredLocal.forEach((order) => {
        const idKey = String(order.id || order.orderId || '');
        if (idKey) mergedMap.set(idKey, order);
      });

      apiOrders.forEach((apiOrder) => {
        const idKey = String(apiOrder.id || apiOrder.orderId || '');
        if (!idKey) return;
        const localMatch = mergedMap.get(idKey);
        mergedMap.set(idKey, {
          ...localMatch,
          ...apiOrder,
          status: (apiOrder.status || localMatch?.status || 'PENDING').toUpperCase(),
        });
      });

      setOrders(Array.from(mergedMap.values()).sort(
        (first, second) => new Date(second.createdAt || Date.now()) - new Date(first.createdAt || Date.now())
      ));
      setLoading(false);
    };

    loadOrders();
    const handleLiveSync = () => {
      refetchOrders?.();
      loadOrders();
    };
    window.addEventListener('orders_updated', handleLiveSync);
    window.addEventListener('storage', handleLiveSync);
    return () => {
      window.removeEventListener('orders_updated', handleLiveSync);
      window.removeEventListener('storage', handleLiveSync);
    };
  }, [data, reduxUser, refetchOrders]);

  const isLoading = loading && fetchLoading;

  return (
    <Layout>
      <div className={`container section ${styles.page}`}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>My Orders</h1>
            <p>Track fulfilment, payment, and complete order details.</p>
          </div>
          {!isLoading && <span className={styles.orderCount}>{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>}
        </div>

        {isLoading && <p className={styles.emptyState}>Loading your orders…</p>}
        {!isLoading && orders.length === 0 && <p className={styles.emptyState}>You haven't placed any orders yet.</p>}

        {!isLoading && orders.length > 0 && (
          <div className={styles.list}>
            {orders.map((order, index) => {
              const displayId = formatOrderId(order.orderNumber || order.orderId || order.id, { prefix: '#', index, createdAt: order.createdAt });
              const items = Array.isArray(order.items) ? order.items : [];
              const primaryItem = items[0] || {};
              const orderStatus = String(order.status || 'PENDING').toUpperCase();
              const rawPaymentStatus = String(order.paymentStatus || order.payment?.status || 'PENDING').toUpperCase();
              const paymentStatus = rawPaymentStatus === 'SUCCEEDED' ? 'PAID' : rawPaymentStatus;
              const paymentMethod = String(order.paymentMethod || order.payment?.method || 'COD').toUpperCase();
              const orderTotal = Number(order.totalAmount || order.total || 0);
              const openDetails = () => setSelectedOrder(order);

              return (
                <article
                  key={order.id || order.orderId || index}
                  className={styles.orderCard}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${displayId}`}
                  onClick={openDetails}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openDetails();
                    }
                  }}
                >
                  <div className={styles.productBlock}>
                    <PrivateImage
                      customized={Boolean(primaryItem.customization)}
                      assetId={primaryItem.customization?.previewAssetId}
                      src={primaryItem.image || primaryItem.product?.images?.[0]}
                      alt={primaryItem.name || primaryItem.product?.name || 'Ordered product'}
                      className={styles.productImage}
                    />
                    <div className={styles.productCopy}>
                      <strong>{primaryItem.name || primaryItem.product?.name || 'Gift item'}</strong>
                      <span>Qty: {primaryItem.quantity || 1}{primaryItem.variant ? ` · ${primaryItem.variant}` : ''}</span>
                      {primaryItem.customization && <span className={styles.customization}>Customized · <CustomizationStatus status={primaryItem.customizationStatus} /></span>}
                      {items.length > 1 && <span className={styles.moreItems}>+{items.length - 1} more item{items.length > 2 ? 's' : ''}</span>}
                    </div>
                  </div>

                  <div className={styles.orderMeta}>
                    <strong>{displayId}</strong>
                    <span>{formatDate(order.createdAt || new Date())}</span>
                  </div>

                  <div className={styles.amountBlock}>
                    <strong>₹{orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    <span>{paymentMethod}</span>
                    <span className={styles.paymentBadge} data-paid={paymentStatus === 'PAID'}>{paymentStatus}</span>
                  </div>

                  <div className={styles.deliveryBlock} data-status={orderStatus}>
                    <strong><i aria-hidden="true" />{orderStatus}</strong>
                    <span>{STATUS_COPY[orderStatus] || 'Order status updated'}</span>
                    <button type="button" onClick={(event) => { event.stopPropagation(); openDetails(); }}>View full details →</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <InvoiceModal order={selectedOrder} user={reduxUser} onClose={() => setSelectedOrder(null)} />
    </Layout>
  );
};

export default Orders;