import { useState, useEffect } from 'react';
import Layout from '@components/layout/Layout';
import useFetch from '@hooks/useFetch';
import { ENDPOINTS } from '@api/endpoints';
import { formatCurrency, formatDate } from '@utils/formatters';
import { ROUTES } from '@constants/routes';
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
  const { data, loading: fetchLoading } = useFetch(ENDPOINTS.ORDERS.MY);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const loadOrders = () => {
      const apiOrders = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      const localOrders = JSON.parse(localStorage.getItem('giftery_orders') || '[]');

      const storedUser = JSON.parse(localStorage.getItem('giftery_user') || '{}');
      const currentUserEmail = storedUser.email ? storedUser.email.toLowerCase().trim() : '';

      const filteredLocal = currentUserEmail
        ? localOrders.filter(o => !o.customerEmail || o.customerEmail.toLowerCase().trim() === currentUserEmail)
        : localOrders;

      const merged = [...filteredLocal];
      apiOrders.forEach(ao => {
        if (!merged.find(m => m.id === ao.id || m.orderId === ao.id)) {
          merged.push(ao);
        }
      });

      setOrders(merged);
      setLoading(false);
    };

    loadOrders();

    window.addEventListener('orders_updated', loadOrders);
    return () => window.removeEventListener('orders_updated', loadOrders);
  }, [data]);

  return (
    <Layout>
      <div className={`container section ${styles.page}`}>
        <h1 className={styles.title}>My Orders</h1>
        {loading && <p>Loading orders…</p>}
        {!loading && !orders.length && <p className="text-muted">You haven't placed any orders yet.</p>}
        <div className={styles.list}>
          {orders.map((order) => (
            <div key={order.id} className={styles.order}>
              <div className={styles.orderHeader}>
                <div>
                  <span className={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</span>
                  <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                </div>
                <span className={styles.status} style={{ color: STATUS_COLORS[order.status] }}>
                  {order.status}
                </span>
              </div>
              <div className={styles.orderItems}>
                {order.items?.slice(0, 3).map((item) => (
                  <span key={item.id} className={styles.itemName}>{item.name} ×{item.quantity}</span>
                ))}
                {order.items?.length > 3 && <span className="text-muted">+{order.items.length - 3} more</span>}
              </div>
              <div className={styles.orderFooter}>
                <strong>{formatCurrency(order.totalAmount)}</strong>
                <button 
                  className={styles.detailsBtn} 
                  onClick={() => setSelectedOrder(order)}
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelectedOrder(null)}>×</button>
            <h2 className={styles.modalTitle}>
              Order #{selectedOrder.id?.slice(-8).toUpperCase()}
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className="text-muted">Placed on {formatDate(selectedOrder.createdAt)}</span>
              <span className={styles.status} style={{ color: STATUS_COLORS[selectedOrder.status] }}>
                {selectedOrder.status}
              </span>
            </div>

            <div className={styles.sectionTitle}>Items</div>
            <div className={styles.itemsList}>
              {selectedOrder.items?.map((item, idx) => (
                <div key={item.id || idx} className={styles.orderItemFull}>
                  <img src={item.image || '/placeholder.jpg'} alt={item.name} className={styles.itemImage} />
                  <div className={styles.itemDetails}>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div className={styles.itemPriceRow}>
                      <span className="text-muted">Qty: {item.quantity}</span>
                      <span>{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedOrder.shippingAddress && (
              <>
                <div className={styles.sectionTitle}>Shipping Address</div>
                <div className={styles.addressBlock}>
                  <strong>{selectedOrder.shippingAddress.fullName || selectedOrder.shippingAddress.name}</strong><br />
                  {selectedOrder.shippingAddress.street || selectedOrder.shippingAddress.address}<br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}<br />
                  {selectedOrder.shippingAddress.country}<br />
                  Phone: {selectedOrder.shippingAddress.phone}
                </div>
              </>
            )}

            <div className={styles.totalRow}>
              <span>Total Amount:</span>
              <span>{formatCurrency(selectedOrder.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Orders;
