import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Layout from '@components/layout/Layout';
import useFetch from '@hooks/useFetch';
import { ENDPOINTS } from '@api/endpoints';
import { formatCurrency, formatDate } from '@utils/formatters';
import styles from './Orders.module.css';

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  PROCESSING: '#8b5cf6',
  SHIPPED: '#06b6d4',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
  REFUNDED: '#6b7280',
};

const Orders = () => {
  const reduxUser = useSelector((state) => state.auth.user);
  const { data, loading: fetchLoading } = useFetch(ENDPOINTS.ORDERS.MY);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const loadOrders = () => {
      // Unpack nested API data structure safely
      const apiOrders = Array.isArray(data?.data?.data)
        ? data.data.data
        : (Array.isArray(data?.data)
          ? data.data
          : (Array.isArray(data?.orders)
            ? data.orders
            : (Array.isArray(data) ? data : [])));

      // Retrieve local orders saved during checkout
      let localOrders = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('giftery_orders') || '[]');
      } catch (e) {
        localOrders = [];
      }

      // Determine current user email
      const storedUser = JSON.parse(localStorage.getItem('giftery_user') || localStorage.getItem('ec_user') || '{}');
      const currentUserEmail = (reduxUser?.email || storedUser.email || '').toLowerCase().trim();

      // Filter local orders relevant to this user account
      const filteredLocal = currentUserEmail
        ? localOrders.filter((o) => {
            if (!o.customerEmail) return true;
            return o.customerEmail.toLowerCase().trim() === currentUserEmail;
          })
        : localOrders;

      // Merge API orders and Local orders uniquely
      const mergedMap = new Map();

      // Add local orders first
      filteredLocal.forEach((o) => {
        const idKey = String(o.id || o.orderId || '');
        if (idKey) mergedMap.set(idKey, o);
      });

      // Add API orders from backend database
      apiOrders.forEach((ao) => {
        const idKey = String(ao.id || ao.orderId || '');
        if (idKey && !mergedMap.has(idKey)) {
          mergedMap.set(idKey, ao);
        }
      });

      const mergedList = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now())
      );

      setOrders(mergedList);
      setLoading(false);
    };

    loadOrders();

    window.addEventListener('orders_updated', loadOrders);
    return () => window.removeEventListener('orders_updated', loadOrders);
  }, [data, reduxUser]);

  const isLoading = loading && fetchLoading;

  return (
    <Layout>
      <div className={`container section ${styles.page}`}>
        <h1 className={styles.title}>My Orders</h1>
        {isLoading && <p>Loading your orders…</p>}

        {!isLoading && orders.length === 0 && (
          <p className="text-muted">You haven't placed any orders yet.</p>
        )}

        {!isLoading && orders.length > 0 && (
          <div className={styles.list}>
            {orders.map((order) => {
              const orderIdStr = String(order.id || order.orderId || 'ORD-000000');
              const displayId = orderIdStr.length > 8 ? orderIdStr.slice(-8).toUpperCase() : orderIdStr;
              const itemsList = Array.isArray(order.items) ? order.items : [];
              const orderStatus = order.status || 'PENDING';
              const orderTotal = Number(order.totalAmount || order.total || 0);

              return (
                <div key={orderIdStr} className={styles.order}>
                  <div className={styles.orderHeader}>
                    <div>
                      <span className={styles.orderId}>#{displayId}</span>
                      <span className={styles.orderDate}>{formatDate(order.createdAt || new Date())}</span>
                    </div>
                    <span className={styles.status} style={{ color: STATUS_COLORS[orderStatus] || '#f59e0b' }}>
                      {orderStatus}
                    </span>
                  </div>

                  <div className={styles.orderItems}>
                    {itemsList.slice(0, 3).map((item, idx) => (
                      <span key={item.id || idx} className={styles.itemName}>
                        {item.name || item.product?.name || 'Gift Item'} ×{item.quantity || 1}
                      </span>
                    ))}
                    {itemsList.length > 3 && (
                      <span className="text-muted">+{itemsList.length - 3} more</span>
                    )}
                  </div>

                  <div className={styles.orderFooter}>
                    <strong>₹{orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    <button
                      type="button"
                      className={styles.detailsBtn}
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.closeButton} onClick={() => setSelectedOrder(null)}>
              ×
            </button>
            <h2 className={styles.modalTitle}>
              Order #{String(selectedOrder.id || selectedOrder.orderId || '').slice(-8).toUpperCase()}
            </h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className="text-muted">Placed on {formatDate(selectedOrder.createdAt)}</span>
              <span
                className={styles.status}
                style={{ color: STATUS_COLORS[selectedOrder.status] || '#f59e0b' }}
              >
                {selectedOrder.status || 'PENDING'}
              </span>
            </div>

            <div className={styles.sectionTitle}>Items</div>
            <div className={styles.itemsList}>
              {(selectedOrder.items || []).map((item, idx) => (
                <div key={item.id || idx} className={styles.orderItemFull}>
                  <img
                    src={item.image || item.product?.images?.[0] || item.product?.image || '/images/products/placeholder.png'}
                    alt={item.name || item.product?.name}
                    className={styles.itemImage}
                  />
                  <div className={styles.itemDetails}>
                    <div style={{ fontWeight: 600 }}>{item.name || item.product?.name || 'Gift Item'}</div>
                    <div className={styles.itemPriceRow}>
                      <span className="text-muted">Qty: {item.quantity || 1}</span>
                      <span>₹{Number(item.price || item.product?.price || 0).toLocaleString('en-IN')}.00</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedOrder.shippingAddress && (
              <>
                <div className={styles.sectionTitle}>Shipping Address</div>
                <div className={styles.addressBlock}>
                  <strong>{selectedOrder.shippingAddress.fullName || selectedOrder.shippingAddress.name}</strong>
                  <br />
                  {selectedOrder.shippingAddress.addressLine1 || selectedOrder.shippingAddress.address || selectedOrder.shippingAddress.street}
                  <br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                  {selectedOrder.shippingAddress.pincode || selectedOrder.shippingAddress.zip}
                  <br />
                  {selectedOrder.shippingAddress.country || 'India'}
                  <br />
                  Phone: {selectedOrder.shippingAddress.phone}
                </div>
              </>
            )}

            <div className={styles.totalRow}>
              <span>Total Amount:</span>
              <span>
                ₹
                {Number(selectedOrder.totalAmount || selectedOrder.total || 0).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Orders;
