import { useMemo } from 'react';
import { 
  FiBarChart2, 
  FiShoppingBag, 
  FiPackage, 
  FiBriefcase, 
  FiUsers, 
  FiMessageSquare, 
  FiDownload, 
  FiFilter 
} from 'react-icons/fi';
import { filterByDateRange, filterByStatus } from '@utils/formatters';
import styles from '../Dashboard.module.css';

const ReportsSection = ({
  ordersList = [],
  productsList = [],
  corporateQuotes = [],
  customersList = [],
  enquiriesList = [],
  dateFilter = 'Last 30 Days',
  statusFilter = 'All',
  handleExportOrdersCSV,
  handleExportProductsCSV,
  handleExportQuotesCSV,
  handleExportCustomersCSV,
  handleExportEnquiriesCSV,
}) => {
  // Filter records dynamically based on active dashboard date range & status (KAN-62)
  const filteredOrders = useMemo(() => {
    let list = filterByDateRange(ordersList, dateFilter, 'createdAt');
    list = filterByStatus(list, statusFilter);
    return list;
  }, [ordersList, dateFilter, statusFilter]);

  const filteredQuotes = useMemo(() => {
    let list = filterByDateRange(corporateQuotes, dateFilter, 'createdAt');
    list = filterByStatus(list, statusFilter);
    return list;
  }, [corporateQuotes, dateFilter, statusFilter]);

  const filteredEnquiries = useMemo(() => {
    let list = filterByDateRange(enquiriesList, dateFilter, 'createdAt');
    list = filterByStatus(list, statusFilter);
    return list;
  }, [enquiriesList, dateFilter, statusFilter]);

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
          {/* Active Filter Indicator Badge (KAN-62) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
            <FiFilter size={13} />
            <span>Range: <strong>{dateFilter}</strong>{statusFilter !== 'All' ? ` • Status: ${statusFilter}` : ''}</span>
          </div>
        </div>

        {/* 5 Download Action Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
          {/* Card 1: Sales & Orders (KAN-61, KAN-63) */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className={styles.reportIconBox} style={{ color: '#d99b26', background: 'rgba(217, 155, 38, 0.12)' }}>
                <FiShoppingBag size={20} />
              </div>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                {filteredOrders.length} Orders
              </span>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>Sales & Orders Report</h4>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Complete log of customer orders, totals, and fulfillment status.</p>
            </div>
            <button
              type="button"
              onClick={handleExportOrdersCSV}
              className={styles.reportDownloadBtn}
              title="Download Sales & Orders CSV"
            >
              <FiDownload size={16} />
              <span>Download CSV Report</span>
            </button>
          </div>

          {/* Card 2: Products Inventory (KAN-61, KAN-63) */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className={styles.reportIconBox} style={{ color: '#0284c7', background: 'rgba(2, 132, 199, 0.12)' }}>
                <FiPackage size={20} />
              </div>
              <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                {productsList.length} Items
              </span>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>Products Inventory Report</h4>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Catalogue of product SKUs, stock levels, pricing, and active status.</p>
            </div>
            <button
              type="button"
              onClick={handleExportProductsCSV}
              className={styles.reportDownloadBtn}
              title="Download Products Inventory CSV"
            >
              <FiDownload size={16} />
              <span>Download CSV Report</span>
            </button>
          </div>

          {/* Card 3: Corporate Quotes (KAN-61, KAN-63) */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className={styles.reportIconBox} style={{ color: '#d97706', background: 'rgba(217, 119, 6, 0.12)' }}>
                <FiBriefcase size={20} />
              </div>
              <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                {filteredQuotes.length} Quotes
              </span>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>Corporate Quotes Report</h4>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>B2B quote submissions, requested unit quantities, and contact details.</p>
            </div>
            <button
              type="button"
              onClick={handleExportQuotesCSV}
              className={styles.reportDownloadBtn}
              title="Download Corporate Quotes CSV"
            >
              <FiDownload size={16} />
              <span>Download CSV Report</span>
            </button>
          </div>

          {/* Card 4: Customers Database (KAN-61, KAN-63) */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className={styles.reportIconBox} style={{ color: '#059669', background: 'rgba(5, 150, 105, 0.12)' }}>
                <FiUsers size={20} />
              </div>
              <span style={{ background: '#ecfdf5', color: '#15803d', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                {customersList.length} Users
              </span>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>Customer Database Report</h4>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Registered customer profiles, total spend history, and account roles.</p>
            </div>
            <button
              type="button"
              onClick={handleExportCustomersCSV}
              className={styles.reportDownloadBtn}
              title="Download Customer Database CSV"
            >
              <FiDownload size={16} />
              <span>Download CSV Report</span>
            </button>
          </div>

          {/* Card 5: Customer Enquiries Report (KAN-61, KAN-63) */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className={styles.reportIconBox} style={{ color: '#6366f1', background: 'rgba(99, 102, 241, 0.12)' }}>
                <FiMessageSquare size={20} />
              </div>
              <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                {filteredEnquiries.length} Enquiries
              </span>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>Customer Enquiries Report</h4>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Complete log of customer contact inquiries, store visits, and quote messages.</p>
            </div>
            <button
              type="button"
              onClick={handleExportEnquiriesCSV}
              className={styles.reportDownloadBtn}
              title="Download Customer Enquiries CSV"
            >
              <FiDownload size={16} />
              <span>Download CSV Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsSection;
