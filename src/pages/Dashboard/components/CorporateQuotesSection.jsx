import { FiFileText } from 'react-icons/fi';
import styles from '../Dashboard.module.css';

const CorporateQuotesSection = ({
  corporateQuotes,
  handleUpdateQuoteStatus,
  handleDeleteQuote,
  handleExportQuotesCSV,
}) => {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeaderRow}>
        <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiFileText style={{ color: '#d99b26' }} />
          <span>Corporate Gift Quote Requests ({corporateQuotes.length})</span>
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleExportQuotesCSV}
            className={styles.viewAllBtn}
            style={{ background: '#d99b26', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer' }}
          >
            📥 Export CSV
          </button>
          <span className={styles.viewAllBtn} style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
            Total Requests: {corporateQuotes.length}
          </span>
        </div>
      </div>

      {corporateQuotes.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          <FiFileText style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
          <p>No corporate quote requests submitted yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Quote ID</th>
                <th>Customer & Company</th>
                <th>Contact Email & Phone</th>
                <th>Units Requested</th>
                <th>Notes / Customization</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {corporateQuotes.map((q) => (
                <tr key={q.id}>
                  <td>
                    <code style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700', color: '#d99b26' }}>{q.id}</code>
                  </td>
                  <td>
                    <strong>{q.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>🏢 {q.company}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>✉️ {q.email}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>📞 {q.phone}</div>
                  </td>
                  <td>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>
                      {q.quantity}
                    </span>
                  </td>
                  <td style={{ maxWidth: '240px', fontSize: '0.82rem', color: '#475569' }}>
                    {q.notes}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {q.date}
                  </td>
                  <td>
                    <span className={`${styles.pillStatus} ${q.status === 'Converted' || q.status === 'Quoted' ? styles.pillDelivered : q.status === 'In Progress' ? styles.pillProcessing : styles.pillPending}`}>
                      {q.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        value={q.status}
                        onChange={(evt) => handleUpdateQuoteStatus(q.id, evt.target.value)}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', padding: '0.25rem 0.5rem', cursor: 'pointer', fontWeight: '600' }}
                      >
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Quoted">Quoted</option>
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuote(q.id)}
                        style={{ padding: '0.3rem 0.6rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CorporateQuotesSection;
