import styles from '../Dashboard.module.css';

const CouponsSection = ({ initialCoupons }) => {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeaderRow}>
        <h3 className={styles.cardTitle}>Coupons & Promotional Discount Offers</h3>
        <button type="button" className={styles.viewAllBtn} style={{ background: '#d99b26', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700' }}>+ Add New Coupon</button>
      </div>
      <table className={styles.ordersTable}>
        <thead>
          <tr><th>Coupon Code</th><th>Discount Value</th><th>Applies To</th><th>Status</th></tr>
        </thead>
        <tbody>
          {initialCoupons.map(c => (
            <tr key={c.id}>
              <td><strong style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#d99b26' }}>{c.code}</strong></td>
              <td><strong>{c.discount}</strong></td>
              <td>{c.category}</td>
              <td><span className={`${styles.pillStatus} ${styles.pillDelivered}`}>{c.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CouponsSection;
