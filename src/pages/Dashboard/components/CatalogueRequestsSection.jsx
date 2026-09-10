import { useMemo, useState } from 'react';
import { FiBookOpen, FiMail, FiPhone, FiSearch } from 'react-icons/fi';
import styles from '../Dashboard.module.css';

const CatalogueRequestsSection = ({ enquiriesList = [], handleUpdateEnquiryStatus }) => {
  const [search, setSearch] = useState('');
  const requests = useMemo(() => enquiriesList.filter((item) =>
    (item.subject || '').toLowerCase() === 'catalogue request' &&
    [item.name, item.email, item.phone, item.message].some((value) => String(value || '').toLowerCase().includes(search.toLowerCase()))
  ), [enquiriesList, search]);

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeaderRow}>
        <div>
          <h3 className={styles.cardTitle} style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}><FiBookOpen style={{ color: '#d99b26' }} /> Catalogue Requests</h3>
          <p style={{ margin: '.25rem 0 0', color: '#64748b', fontSize: '.84rem' }}>Customer details collected before catalogue downloads.</p>
        </div>
        <strong style={{ color: '#b7790b', background: '#fffbeb', border: '1px solid #fde68a', padding: '.4rem .7rem', borderRadius: '20px', fontSize: '.78rem' }}>Total: {requests.length}</strong>
      </div>
      <div style={{ position: 'relative', width: 'min(100%, 320px)', margin: '1rem 0' }}>
        <FiSearch style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search catalogue requests..." style={{ width: '100%', boxSizing: 'border-box', padding: '.6rem .75rem .6rem 2.25rem', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
      </div>
      <div style={{ overflowX: 'auto' }}>
        {requests.length === 0 ? <p style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', background: '#f8fafc', borderRadius: '10px' }}>No catalogue requests found.</p> : (
          <table className={styles.ordersTable}>
            <thead><tr><th>Name</th><th>Contact</th><th>Company / Details</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>{requests.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.name}</strong></td>
                <td><div><FiMail /> {item.email}</div><div><FiPhone /> {item.phone || 'N/A'}</div></td>
                <td style={{ whiteSpace: 'pre-line' }}>{item.message}</td>
                <td>{item.createdAt || item.date || 'Recent'}</td>
                <td><select value={item.status || 'New'} onChange={(e) => handleUpdateEnquiryStatus(item.id, e.target.value)} style={{ padding: '.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}><option>New</option><option>In Progress</option><option>Resolved</option></select></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CatalogueRequestsSection;
