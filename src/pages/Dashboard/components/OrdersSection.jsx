import { useState, useEffect } from 'react';
import { FiShoppingBag, FiMoreVertical, FiEye, FiX, FiSearch, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axiosInstance from '@api/axiosInstance';
import { formatOrderId } from '@utils/formatters';
import styles from '../Dashboard.module.css';

const INITIAL_ORDERS = [
  { id: 'ORD-125601', customer: 'Tech Solutions Pvt. Ltd.', date: 'May 18, 2026', itemsCount: 4, itemsDetails: 'Custom Leather Keychains ×4', amount: '₹45,600', rawAmount: 45600, status: 'Delivered' },
  { id: 'ORD-125502', customer: 'Rahul Verma', date: 'May 18, 2026', itemsCount: 1, itemsDetails: 'Personalized LED Lamp ×1', amount: '₹12,450', rawAmount: 12450, status: 'Processing' },
  { id: 'ORD-125403', customer: 'ABC Corporation', date: 'May 17, 2026', itemsCount: 15, itemsDetails: 'Executive Gift Hampers ×15', amount: '₹78,900', rawAmount: 78900, status: 'Pending' },
  { id: 'ORD-125304', customer: 'Sneha Iyer', date: 'May 17, 2026', itemsCount: 2, itemsDetails: 'Photo Frame Set ×2', amount: '₹5,250', rawAmount: 5250, status: 'Delivered' },
  { id: 'ORD-125205', customer: 'Global Enterprises', date: 'May 16, 2026', itemsCount: 8, itemsDetails: '3D Caricature Standee ×8', amount: '₹32,750', rawAmount: 32750, status: 'Processing' },
  { id: 'ORD-125106', customer: 'Ananya Sharma', date: 'May 15, 2026', itemsCount: 3, itemsDetails: 'Engraved Metal Pens ×3', amount: '₹18,400', rawAmount: 18400, status: 'Cancelled' },
];

const OrdersSection = ({ ordersList = [] }) => {
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState(() => {
    try {
      const stored = localStorage.getItem('giftery_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return ordersList.length > 0 ? ordersList : INITIAL_ORDERS;
  });

  useEffect(() => {
    if (Array.isArray(ordersList) && ordersList.length > 0) {
      setOrders(ordersList);
    }
  }, [ordersList]);

  const handleStatusChange = async (orderId, newStatus) => {
    const uppercaseStatus = String(newStatus).toUpperCase();
    const displayStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase();

    // 1. Update React local state
    const updated = orders.map((o) => {
      const matchId = String(o.id || o.orderId);
      const targetId = String(orderId);
      if (matchId === targetId || matchId.includes(targetId) || targetId.includes(matchId)) {
        return { ...o, status: displayStatus };
      }
      return o;
    });
    setOrders(updated);

    // 2. Update persistent localStorage cache for instant synchronization
    try {
      const stored = JSON.parse(localStorage.getItem('giftery_orders') || '[]');
      const updatedStored = stored.map((o) => {
        const matchId = String(o.id || o.orderId);
        const targetId = String(orderId);
        if (matchId === targetId || matchId.includes(targetId) || targetId.includes(matchId)) {
          return { ...o, status: uppercaseStatus };
        }
        return o;
      });
      localStorage.setItem('giftery_orders', JSON.stringify(updatedStored));
    } catch (e) {}

    // 3. Emit real-time live event so all components on all pages re-render immediately
    window.dispatchEvent(new Event('orders_updated'));

    // 4. Update Backend PostgreSQL database
    try {
      await axiosInstance.patch(`/orders/${orderId}/status`, { status: uppercaseStatus });
    } catch (err) {
      try {
        await axiosInstance.put(`/orders/${orderId}/status`, { status: uppercaseStatus });
      } catch (putErr) {
        console.warn('Backend order status update sync:', err.message);
      }
    }

    toast.success(`Order status updated to "${displayStatus}"`);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter =
      orderFilter === 'ALL' ||
      (o.status || '').toUpperCase() === orderFilter.toUpperCase();

    const q = searchTerm.toLowerCase().trim();
    if (!q) return matchesFilter;

    const idStr = String(o.id || o.orderId || '').toLowerCase();
    const customerStr = String(o.customer || o.customerName || o.user?.name || o.shippingAddress?.fullName || '').toLowerCase();
    const emailStr = String(o.customerEmail || o.user?.email || o.shippingAddress?.email || '').toLowerCase();
    const itemsStr = String(o.itemsDetails || (Array.isArray(o.items) ? o.items.map(i => i.name || i.product?.name).join(' ') : '')).toLowerCase();
    const statusStr = String(o.status || '').toLowerCase();
    const amountStr = String(o.amount || o.rawAmount || o.totalAmount || '').toLowerCase();

    const matchesSearch =
      idStr.includes(q) ||
      customerStr.includes(q) ||
      emailStr.includes(q) ||
      itemsStr.includes(q) ||
      statusStr.includes(q) ||
      amountStr.includes(q);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeaderRow}>
        <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiShoppingBag style={{ color: '#d99b26' }} />
          <span>Orders Management ({orders.length})</span>
        </h3>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          margin: '1.25rem 0 1rem 0',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        {/* Left: Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.25rem' }}>
            <FiFilter /> Filter:
          </span>
          {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setOrderFilter(status)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                border: orderFilter === status ? 'none' : '1px solid #cbd5e1',
                background: orderFilter === status ? '#d99b26' : '#ffffff',
                color: orderFilter === status ? '#ffffff' : '#475569',
                fontWeight: '700',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Right: Search Box */}
        <div style={{ position: 'relative', width: '320px', minWidth: '240px' }}>
          <FiSearch style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.95rem' }} />
          <input
            type="text"
            placeholder="Search Order ID, Customer, Items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 2.2rem 0.55rem 2.4rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              outline: 'none',
              fontSize: '0.85rem',
              background: '#ffffff',
              boxSizing: 'border-box',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items Count</th>
              <th>Product Details</th>
              <th>Amount</th>
              <th>Status (Click to Edit)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o, idx) => {
              const displayId = formatOrderId(o.id || o.orderId, idx);
              const customerName = o.customer || o.customerName || o.user?.name || o.shippingAddress?.fullName || 'Customer';
              const itemCount = o.itemsCount || (Array.isArray(o.items) ? o.items.length : 1);
              const productSummary = o.itemsDetails || (Array.isArray(o.items) ? o.items.map(i => `${i.name || i.product?.name || 'Item'} ×${i.quantity || 1}`).join(', ') : '1 Item');
              const amountDisplay = o.amount || `₹${(Number(o.rawAmount || o.totalAmount || 0)).toLocaleString('en-IN')}`;

              const currentStatusUpper = String(o.status || 'PENDING').toUpperCase();
              const displaySelectValue =
                currentStatusUpper === 'DELIVERED' ? 'Delivered'
                : currentStatusUpper === 'PROCESSING' ? 'Processing'
                : currentStatusUpper === 'CONFIRMED' ? 'Confirmed'
                : currentStatusUpper === 'SHIPPED' ? 'Shipped'
                : currentStatusUpper === 'CANCELLED' ? 'Cancelled'
                : 'Pending';

              return (
                <tr key={o.id || idx}>
                  <td className={styles.orderIdText}>{displayId}</td>
                  <td><strong>{customerName}</strong></td>
                  <td>{o.date || 'Recent'}</td>
                  <td>{itemCount} Items</td>
                  <td style={{ fontSize: '0.82rem', color: '#475569', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={productSummary}>
                    {productSummary}
                  </td>
                  <td><strong style={{ color: '#d99b26' }}>{amountDisplay}</strong></td>
                  <td>
                    <select
                      value={displaySelectValue}
                      onChange={(e) => handleStatusChange(o.id || o.orderId, e.target.value)}
                      className={`${styles.pillStatus} ${
                        currentStatusUpper === 'DELIVERED'
                          ? styles.pillDelivered
                          : currentStatusUpper === 'PROCESSING' || currentStatusUpper === 'CONFIRMED'
                          ? styles.pillProcessing
                          : currentStatusUpper === 'CANCELLED'
                          ? styles.pillCancelled
                          : styles.pillPending
                      }`}
                      style={{
                        border: '1px solid transparent',
                        outline: 'none',
                        cursor: 'pointer',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        fontWeight: '700',
                        fontSize: '0.78rem',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%23475569' height='12' viewBox='0 0 24 24' width='12' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        paddingRight: '24px',
                      }}
                      title="Click to change order status"
                    >
                      <option value="Pending" style={{ background: '#ffffff', color: '#1e293b' }}>Pending</option>
                      <option value="Confirmed" style={{ background: '#ffffff', color: '#1e293b' }}>Confirmed</option>
                      <option value="Processing" style={{ background: '#ffffff', color: '#1e293b' }}>Processing</option>
                      <option value="Shipped" style={{ background: '#ffffff', color: '#1e293b' }}>Shipped</option>
                      <option value="Delivered" style={{ background: '#ffffff', color: '#1e293b' }}>Delivered</option>
                      <option value="Cancelled" style={{ background: '#ffffff', color: '#1e293b' }}>Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.dotsBtn}
                      title="View Details"
                      onClick={() => setSelectedOrder(o)}
                    >
                      <FiEye />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Admin Order Details Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }} onClick={() => setSelectedOrder(null)}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '550px', width: '100%', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }} onClick={() => setSelectedOrder(null)}>
              <FiX />
            </button>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>
              Order {formatOrderId(selectedOrder.id || selectedOrder.orderId)}
            </h3>
            <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>
              Customer: <strong>{selectedOrder.customer || selectedOrder.customerName || 'Customer'}</strong> ({selectedOrder.date || 'Recent'})
            </p>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#1e293b' }}>Purchased Products ({selectedOrder.itemsCount || 1} Items):</div>
              <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.5' }}>
                {selectedOrder.itemsDetails || (Array.isArray(selectedOrder.items) ? selectedOrder.items.map(i => `${i.name || i.product?.name || 'Item'} ×${i.quantity || 1}`).join(', ') : '1 Item')}
              </div>
            </div>

            {selectedOrder.shippingAddress && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.25rem' }}>Shipping Address:</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: '1.4' }}>
                  {selectedOrder.shippingAddress.fullName || selectedOrder.shippingAddress.name}<br />
                  {selectedOrder.shippingAddress.addressLine1 || selectedOrder.shippingAddress.address}<br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode || selectedOrder.shippingAddress.zip}<br />
                  Phone: {selectedOrder.shippingAddress.phone || 'N/A'}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
              <span style={{ fontWeight: '700', color: '#0f172a' }}>Total Amount:</span>
              <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#d99b26' }}>
                {selectedOrder.amount || `₹${(Number(selectedOrder.rawAmount || selectedOrder.totalAmount || 0)).toLocaleString('en-IN')}`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersSection;
