import { FiUsers } from 'react-icons/fi';
import styles from '../Dashboard.module.css';

const CustomersSection = ({
  customersList,
  selectedCustomerModal,
  setSelectedCustomerModal,
  handleExportCustomersCSV,
}) => {
  return (
    <div className={styles.cardContainer} style={{ background: '#ffffff', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' }}>
      <div className={styles.cardHeaderRow} style={{ marginBottom: '1.25rem' }}>
        <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiUsers style={{ color: '#d99b26' }} />
          <span>Store Customers & Registered Users ({customersList.length})</span>
        </h3>
        <button
          type="button"
          onClick={handleExportCustomersCSV}
          className={styles.viewAllBtn}
          style={{ background: '#d99b26', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer' }}
        >
          📥 Export CSV
        </button>
      </div>

      {/* Table Layout */}
      <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '10px', border: '1px solid #edf2f7' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
              <th style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', padding: '0.9rem 1.25rem', letterSpacing: '0.5px' }}>NAME</th>
              <th style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', padding: '0.9rem 1.25rem', letterSpacing: '0.5px' }}>PHONE</th>
              <th style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', padding: '0.9rem 1.25rem', letterSpacing: '0.5px' }}>ORDERS</th>
              <th style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', padding: '0.9rem 1.25rem', letterSpacing: '0.5px' }}>VERIFIED</th>
              <th style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', padding: '0.9rem 1.25rem', letterSpacing: '0.5px' }}>STATUS</th>
              <th style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', padding: '0.9rem 1.25rem', letterSpacing: '0.5px' }}>JOINED</th>
              <th style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', padding: '0.9rem 1.25rem', letterSpacing: '0.5px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {customersList.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block', fontWeight: '600' }}>{c.name}</strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.email}</span>
                </td>
                <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontSize: '0.88rem' }}>
                  {c.phone && c.phone !== 'Not provided' ? c.phone : '—'}
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.88rem', color: '#334155' }}>
                  {c.ordersCount ?? 0}
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                    Yes
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {c.status || 'Active'}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#475569', whiteSpace: 'nowrap' }}>
                  {c.joinedDate || '27/7/2026'}
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomerModal(c)}
                    style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#64748b', padding: '0.2rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    title="View Details"
                  >
                    👁️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomerModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setSelectedCustomerModal(null)}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b' }}>Customer Details</h3>
              <button type="button" onClick={() => setSelectedCustomerModal(null)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div><strong>Name:</strong> {selectedCustomerModal.name}</div>
              <div><strong>Email:</strong> {selectedCustomerModal.email}</div>
              <div><strong>Phone:</strong> {selectedCustomerModal.phone || 'N/A'}</div>
              <div><strong>Orders Count:</strong> {selectedCustomerModal.ordersCount || 0}</div>
              <div><strong>Total Spent:</strong> ₹{(selectedCustomerModal.totalSpent || 0).toLocaleString('en-IN')}</div>
              <div><strong>Account Status:</strong> <span style={{ color: '#16a34a', fontWeight: '700' }}>{selectedCustomerModal.status || 'Active'}</span></div>
            </div>
            <button type="button" onClick={() => setSelectedCustomerModal(null)} style={{ marginTop: '1.25rem', width: '100%', padding: '0.65rem', background: '#d99b26', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersSection;
