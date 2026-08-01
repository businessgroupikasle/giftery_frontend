import { FiHelpCircle } from 'react-icons/fi';
import styles from '../Dashboard.module.css';

const EnquiriesSection = ({
  enquiriesList,
  handleUpdateEnquiryStatus,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className={styles.cardContainer}>
        <div className={styles.cardHeaderRow}>
          <div>
            <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiHelpCircle style={{ color: '#d99b26' }} />
              <span>Categorized Customer Enquiries (3-Column View)</span>
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Enquiries split into 3 dedicated columns: Corporate Gifts, Personalized Gifts, and Toys.
            </p>
          </div>
          <span className={styles.viewAllBtn} style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
            Total Enquiries: {enquiriesList.length}
          </span>
        </div>

        {/* 3 Columns Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginTop: '1.25rem' }}>

          {/* 💼 Column 1: Corporate Gifts Enquiries */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #d99b26', paddingBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>💼</span>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>Corporate Gifts</h4>
              </div>
              <span style={{ background: '#fef3c7', color: '#b45309', fontWeight: '700', fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                {enquiriesList.filter(e => e.category === 'Corporate Gifts' || !e.category || e.category?.includes('Corporate')).length} Enquiries
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {enquiriesList.filter(e => e.category === 'Corporate Gifts' || !e.category || e.category?.includes('Corporate')).map((e) => (
                <div key={e.id} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <code style={{ background: '#f1f5f9', color: '#d99b26', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>{e.id}</code>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{e.createdAt || 'Recent'}</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block' }}>{e.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>✉️ {e.email}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>📞 {e.phone}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: '#334155' }}>
                    <strong style={{ color: '#1e293b', display: 'block', marginBottom: '2px' }}>{e.subject}</strong>
                    {e.message}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                    <span className={`${styles.pillStatus} ${e.status === 'Resolved' ? styles.pillDelivered : e.status === 'In Progress' ? styles.pillProcessing : styles.pillPending}`}>
                      {e.status}
                    </span>
                    <select
                      value={e.status}
                      onChange={(evt) => handleUpdateEnquiryStatus(e.id, evt.target.value)}
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', padding: '0.2rem 0.4rem', cursor: 'pointer', fontWeight: '600' }}
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🖊️ Column 2: Personalized Gifts Enquiries */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #2563eb', paddingBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🖊️</span>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>Personalized Gifts</h4>
              </div>
              <span style={{ background: '#dbeafe', color: '#1d4ed8', fontWeight: '700', fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                {enquiriesList.filter(e => e.category === 'Personalized Gifts').length} Enquiries
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {enquiriesList.filter(e => e.category === 'Personalized Gifts').map((e) => (
                <div key={e.id} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <code style={{ background: '#f1f5f9', color: '#2563eb', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>{e.id}</code>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{e.createdAt || 'Recent'}</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block' }}>{e.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>✉️ {e.email}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>📞 {e.phone}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: '#334155' }}>
                    <strong style={{ color: '#1e293b', display: 'block', marginBottom: '2px' }}>{e.subject}</strong>
                    {e.message}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                    <span className={`${styles.pillStatus} ${e.status === 'Resolved' ? styles.pillDelivered : e.status === 'In Progress' ? styles.pillProcessing : styles.pillPending}`}>
                      {e.status}
                    </span>
                    <select
                      value={e.status}
                      onChange={(evt) => handleUpdateEnquiryStatus(e.id, evt.target.value)}
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', padding: '0.2rem 0.4rem', cursor: 'pointer', fontWeight: '600' }}
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🧩 Column 3: Toys Enquiries */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #059669', paddingBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🧩</span>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>Toys & Desk Games</h4>
              </div>
              <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: '700', fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                {enquiriesList.filter(e => e.category === 'Toys').length} Enquiries
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {enquiriesList.filter(e => e.category === 'Toys').map((e) => (
                <div key={e.id} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <code style={{ background: '#f1f5f9', color: '#059669', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>{e.id}</code>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{e.createdAt || 'Recent'}</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block' }}>{e.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>✉️ {e.email}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>📞 {e.phone}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: '#334155' }}>
                    <strong style={{ color: '#1e293b', display: 'block', marginBottom: '2px' }}>{e.subject}</strong>
                    {e.message}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                    <span className={`${styles.pillStatus} ${e.status === 'Resolved' ? styles.pillDelivered : e.status === 'In Progress' ? styles.pillProcessing : styles.pillPending}`}>
                      {e.status}
                    </span>
                    <select
                      value={e.status}
                      onChange={(evt) => handleUpdateEnquiryStatus(e.id, evt.target.value)}
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', padding: '0.2rem 0.4rem', cursor: 'pointer', fontWeight: '600' }}
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EnquiriesSection;
