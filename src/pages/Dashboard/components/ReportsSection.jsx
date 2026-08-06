import { FiBarChart2 } from 'react-icons/fi';
import styles from '../Dashboard.module.css';

const ReportsSection = ({
  productsList = [],
  corporateQuotes = [],
  customersList = [],
  enquiriesList = [],
  handleExportOrdersCSV,
  handleExportProductsCSV,
  handleExportQuotesCSV,
  handleExportCustomersCSV,
  handleExportEnquiriesCSV,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Reports Top Summary Header */}
      <div className={styles.cardContainer}>
        <div className={styles.cardHeaderRow}>
          <div>
            <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiBarChart2 style={{ color: '#d99b26' }} />
              <span>Store Analytics & Downloadable Reports</span>
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Generate, preview, and download official CSV data reports for all store sections.
            </p>
          </div>
        </div>

        {/* 5 Download Action Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
          {/* Card 1: Sales & Orders */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.5rem' }}>🛍️</span>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>Live Data</span>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>Sales & Orders Report</h4>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Complete log of customer orders, totals, and fulfillment status.</p>
            </div>
            <button
              type="button"
              onClick={handleExportOrdersCSV}
              style={{ marginTop: 'auto', padding: '0.65rem 1rem', background: '#d99b26', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(217,155,38,0.25)' }}
            >
              <span>📥 Download CSV Report</span>
            </button>
          </div>

          {/* Card 2: Products Inventory */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.5rem' }}>📦</span>
              <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>{productsList.length} Items</span>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>Products Inventory Report</h4>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Catalog of product SKUs, stock levels, pricing, and active status.</p>
            </div>
            <button
              type="button"
              onClick={handleExportProductsCSV}
              style={{ marginTop: 'auto', padding: '0.65rem 1rem', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(2,132,199,0.25)' }}
            >
              <span>📥 Download CSV Report</span>
            </button>
          </div>

          {/* Card 3: Corporate Quotes */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.5rem' }}>💼</span>
              <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>{corporateQuotes.length} Quotes</span>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>Corporate Quotes Report</h4>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>B2B quote submissions, requested unit quantities, and contact details.</p>
            </div>
            <button
              type="button"
              onClick={handleExportQuotesCSV}
              style={{ marginTop: 'auto', padding: '0.65rem 1rem', background: '#d97706', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(217,119,6,0.25)' }}
            >
              <span>📥 Download CSV Report</span>
            </button>
          </div>

          {/* Card 4: Customers Database */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.5rem' }}>👥</span>
              <span style={{ background: '#ecfdf5', color: '#15803d', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>{customersList.length} Users</span>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>Customer Database Report</h4>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Registered customer profiles, total spend history, and account roles.</p>
            </div>
            <button
              type="button"
              onClick={handleExportCustomersCSV}
              style={{ marginTop: 'auto', padding: '0.65rem 1rem', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(5,150,105,0.25)' }}
            >
              <span>📥 Download CSV Report</span>
            </button>
          </div>

          {/* Card 5: Customer Enquiries Report */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.5rem' }}>❓</span>
              <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                {enquiriesList.length} Enquiries
              </span>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>Customer Enquiries Report</h4>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Complete log of customer contact inquiries, store visits, and quote messages.</p>
            </div>
            <button
              type="button"
              onClick={handleExportEnquiriesCSV}
              style={{ marginTop: 'auto', padding: '0.65rem 1rem', background: '#475569', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(71,85,105,0.25)' }}
            >
              <span>📥 Download CSV Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsSection;
