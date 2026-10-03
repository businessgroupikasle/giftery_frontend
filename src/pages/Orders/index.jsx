import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Layout from '@components/layout/Layout';
import useFetch from '@hooks/useFetch';
import { ENDPOINTS } from '@api/endpoints';
import { formatDate, formatOrderId } from '@utils/formatters';
import styles from './Orders.module.css';
import InvoiceModal from './InvoiceModal';

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
  const { data, loading: fetchLoading, fetch: refetchOrders } = useFetch(ENDPOINTS.ORDERS.MY);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const loadOrders = () => {
      // Unpack nested API data structure safely
      const apiOrders = Array.isArray(data?.data?.data)
        ? data.data.data
        : (Array.isArray(data?.data?.orders)
          ? data.data.orders
          : (Array.isArray(data?.data)
            ? data.data
            : (Array.isArray(data?.orders)
              ? data.orders
              : (Array.isArray(data) ? data : []))));

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

      // Merge API orders and Local orders uniquely (PostgreSQL DB orders take precedence)
      const mergedMap = new Map();

      // 1. Add local orders
      filteredLocal.forEach((o) => {
        const idKey = String(o.id || o.orderId || '');
        if (idKey) mergedMap.set(idKey, o);
      });

      // 2. Override with live PostgreSQL DB orders (DB is the source of truth)
      apiOrders.forEach((ao) => {
        const idKey = String(ao.id || ao.orderId || '');
        if (idKey) {
          const localMatch = mergedMap.get(idKey);
          mergedMap.set(idKey, {
            ...localMatch,
            ...ao,
            status: (ao.status || localMatch?.status || 'PENDING').toUpperCase(),
          });
        }
      });

      const mergedList = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now())
      );

      setOrders(mergedList);
      setLoading(false);
    };

    loadOrders();

    const handleLiveSync = () => {
      if (typeof refetchOrders === 'function') {
        refetchOrders();
      }
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
        <h1 className={styles.title}>My Orders</h1>
        {isLoading && <p>Loading your orders…</p>}

        {!isLoading && orders.length === 0 && (
          <p className="text-muted">You haven't placed any orders yet.</p>
        )}

        {!isLoading && orders.length > 0 && (
          <div className={styles.list}>
            {orders.map((order, idx) => {
              const displayId = formatOrderId(order.id || order.orderId, { prefix: '#', index: idx, createdAt: order.createdAt });
              const itemsList = Array.isArray(order.items) ? order.items : [];
              const orderStatus = order.status || 'PENDING';
              const orderTotal = Number(order.totalAmount || order.total || 0);

              return (
                <div key={order.id || order.orderId || idx} className={styles.order}>
                  <div className={styles.orderHeader}>
                    <div>
                      <span className={styles.orderId}>{displayId}</span>
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
      <InvoiceModal order={selectedOrder} user={reduxUser} onClose={() => setSelectedOrder(null)} />
    </Layout>
  );
};

export default Orders;
