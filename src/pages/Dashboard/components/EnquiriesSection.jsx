import { FiHelpCircle, FiMail, FiPhone, FiCalendar, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import styles from '../Dashboard.module.css';

const EnquiriesSection = ({
  enquiriesList = [],
  handleUpdateEnquiryStatus,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className={styles.cardContainer}>
        <div className={styles.cardHeaderRow}>
          <div>
            <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiHelpCircle style={{ color: '#d99b26' }} />
              <span>Customer Enquiries</span>
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              View and manage all customer contact messages and product enquiries in one place.
            </p>
          </div>
          <span className={styles.viewAllBtn} style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
            Total Enquiries: {enquiriesList.length}
          </span>
        </div>

        {/* Unified Enquiries List / Grid */}
        <div style={{ marginTop: '1.25rem' }}>
          {enquiriesList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
              <FiHelpCircle style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem', color: '#334155' }}>No customer enquiries yet</p>
              <span style={{ fontSize: '0.85rem' }}>Messages submitted through the contact form will appear here.</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {enquiriesList.map((e) => (
                <div
                  key={e.id}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    gap: '1rem',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <div>
                    {/* Header Row: ID + Date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <code style={{ background: '#f1f5f9', color: '#d99b26', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700' }}>
                        {e.id}
                      </code>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <FiCalendar style={{ fontSize: '0.75rem' }} />
                        {e.createdAt || 'Recent'}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                      <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>
                        {e.name}
                      </strong>
                      <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <FiMail style={{ color: '#64748b' }} /> {e.email}
                      </div>
                      {e.phone && (
                        <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                          <FiPhone style={{ color: '#64748b' }} /> {e.phone}
                        </div>
                      )}
                    </div>

                    {/* Subject & Message Content */}
                    <div style={{ background: '#f8fafc', padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      {e.subject && (
                        <strong style={{ color: '#1e293b', display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                          {e.subject}
                        </strong>
                      )}
                      <p style={{ margin: 0, fontSize: '0.83rem', color: '#334155', lineHeight: '1.45', whiteSpace: 'pre-line' }}>
                        {e.message}
                      </p>
                    </div>
                  </div>

                  {/* Status & Action Select */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px dashed #e2e8f0' }}>
                    <span className={`${styles.pillStatus} ${e.status === 'Resolved' ? styles.pillDelivered : e.status === 'In Progress' ? styles.pillProcessing : styles.pillPending}`}>
                      {e.status || 'New'}
                    </span>
                    <select
                      value={e.status || 'New'}
                      onChange={(evt) => handleUpdateEnquiryStatus(e.id, evt.target.value)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        padding: '0.3rem 0.6rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                        color: '#1e293b',
                      }}
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnquiriesSection;
