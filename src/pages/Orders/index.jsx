import Layout from '@components/layout/Layout';
import useFetch from '@hooks/useFetch';
import { ENDPOINTS } from '@api/endpoints';
import { formatCurrency, formatDate } from '@utils/formatters';
import { Link } from 'react-router-dom';
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
  const { data, loading } = useFetch(ENDPOINTS.ORDERS.MY);
  const orders = data?.data || [];

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
                <Link to={`${ROUTES.ORDERS}/${order.id}`} className={styles.detailsLink}>View Details →</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
