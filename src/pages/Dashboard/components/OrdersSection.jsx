import { useState } from 'react';
import { FiShoppingBag, FiMoreVertical } from 'react-icons/fi';
import styles from '../Dashboard.module.css';

const OrdersSection = ({ handleExportOrdersCSV }) => {
  const [orderFilter, setOrderFilter] = useState('ALL');

  const orders = [
    { id: 'ORD-1256', customer: 'Tech Solutions Pvt. Ltd.', date: 'May 18, 2025', itemsCount: 4, amount: '₹45,600', status: 'Delivered' },
    { id: 'ORD-1255', customer: 'Rahul Verma', date: 'May 18, 2025', itemsCount: 1, amount: '₹12,450', status: 'Processing' },
    { id: 'ORD-1254', customer: 'ABC Corporation', date: 'May 17, 2025', itemsCount: 15, amount: '₹78,900', status: 'Pending' },
    { id: 'ORD-1253', customer: 'Sneha Iyer', date: 'May 17, 2025', itemsCount: 2, amount: '₹5,250', status: 'Delivered' },
    { id: 'ORD-1252', customer: 'Global Enterprises', date: 'May 16, 2025', itemsCount: 8, amount: '₹32,750', status: 'Processing' },
    { id: 'ORD-1251', customer: 'Ananya Sharma', date: 'May 15, 2025', itemsCount: 3, amount: '₹18,400', status: 'Cancelled' },
  ];

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'ALL') return true;
    return o.status.toUpperCase() === orderFilter;
  });

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeaderRow}>
        <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiShoppingBag style={{ color: '#d99b26' }} />
          <span>Orders Management</span>
        </h3>
        <button
          type="button"
          onClick={handleExportOrdersCSV}
          className={styles.viewAllBtn}
          style={{ background: '#d99b26', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer' }}
        >
          📥 Export Orders CSV
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0', flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setOrderFilter(status)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              border: orderFilter === status ? 'none' : '1px solid #cbd5e1',
              background: orderFilter === status ? '#d99b26' : '#ffffff',
              color: orderFilter === status ? '#ffffff' : '#475569',
              fontWeight: '600',
              fontSize: '0.78rem',
              cursor: 'pointer',
            }}
          >
            {status}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items Count</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <tr key={o.id}>
                <td className={styles.orderIdText}>#{o.id}</td>
                <td><strong>{o.customer}</strong></td>
                <td>{o.date}</td>
                <td>{o.itemsCount} Items</td>
                <td><strong style={{ color: '#d99b26' }}>{o.amount}</strong></td>
                <td>
                  <span className={`${styles.pillStatus} ${o.status === 'Delivered' ? styles.pillDelivered : o.status === 'Processing' ? styles.pillProcessing : o.status === 'Cancelled' ? styles.pillCancelled : styles.pillPending}`}>
                    {o.status}
                  </span>
                </td>
                <td>
                  <button type="button" className={styles.dotsBtn} title="More Actions">
                    <FiMoreVertical />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersSection;
