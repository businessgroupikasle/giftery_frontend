import { 
  FiShoppingBag, 
  FiClock, 
  FiCheckCircle, 
  FiUsers, 
  FiFileText, 
  FiTrendingUp, 
  FiMoreVertical, 
  FiArchive, 
  FiXCircle, 
  FiUserPlus,
  FiMail,
  FiPhone,
  FiCalendar
} from 'react-icons/fi';
import styles from '../Dashboard.module.css';

const DashboardOverview = ({ handleTabChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── ROW 1: 6 KPI METRICS CARDS ── */}
      <div className={styles.kpiGrid}>
        {/* Card 1: Total Revenue */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={`${styles.kpiIconCircle} ${styles.bgPurple}`}>
              <FiShoppingBag />
            </div>
            <span className={styles.kpiTitle}>Total Revenue</span>
          </div>
          <h2 className={styles.kpiValue}>₹12,45,890</h2>
          <div className={styles.kpiFooter}>
            <span className={styles.trendGreen}><FiTrendingUp /> 18.6%</span>
            <span className={styles.kpiSubtext}>vs May 05 - May 11</span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={`${styles.kpiIconCircle} ${styles.bgBlue}`}>
              <FiShoppingBag />
            </div>
            <span className={styles.kpiTitle}>Total Orders</span>
          </div>
          <h2 className={styles.kpiValue}>1,246</h2>
          <div className={styles.kpiFooter}>
            <span className={styles.trendGreen}><FiTrendingUp /> 12.4%</span>
            <span className={styles.kpiSubtext}>vs May 05 - May 11</span>
          </div>
        </div>

        {/* Card 3: Pending Orders */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={`${styles.kpiIconCircle} ${styles.bgOrange}`}>
              <FiClock />
            </div>
            <span className={styles.kpiTitle}>Pending Orders</span>
          </div>
          <h2 className={styles.kpiValue}>86</h2>
          <div className={styles.kpiFooter}>
            <span className={styles.trendRed}><FiTrendingUp /> 8.2%</span>
            <span className={styles.kpiSubtext}>vs May 05 - May 11</span>
          </div>
        </div>

        {/* Card 4: Completed Orders */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={`${styles.kpiIconCircle} ${styles.bgGreen}`}>
              <FiCheckCircle />
            </div>
            <span className={styles.kpiTitle}>Completed Orders</span>
          </div>
          <h2 className={styles.kpiValue}>1,088</h2>
          <div className={styles.kpiFooter}>
            <span className={styles.trendGreen}><FiTrendingUp /> 14.8%</span>
            <span className={styles.kpiSubtext}>vs May 05 - May 11</span>
          </div>
        </div>

        {/* Card 5: Total Customers */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={`${styles.kpiIconCircle} ${styles.bgIndigo}`}>
              <FiUsers />
            </div>
            <span className={styles.kpiTitle}>Total Customers</span>
          </div>
          <h2 className={styles.kpiValue}>2,345</h2>
          <div className={styles.kpiFooter}>
            <span className={styles.trendGreen}><FiTrendingUp /> 9.5%</span>
            <span className={styles.kpiSubtext}>vs May 05 - May 11</span>
          </div>
        </div>

        {/* Card 6: New Quotes */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={`${styles.kpiIconCircle} ${styles.bgPink}`}>
              <FiFileText />
            </div>
            <span className={styles.kpiTitle}>New Quotes</span>
          </div>
          <h2 className={styles.kpiValue}>32</h2>
          <div className={styles.kpiFooter}>
            <span className={styles.trendGreen}><FiTrendingUp /> 20.0%</span>
            <span className={styles.kpiSubtext}>vs May 05 - May 11</span>
          </div>
        </div>
      </div>

      {/* ── ROW 2: CHARTS GRID (3 COLUMNS) ── */}
      <div className={styles.chartsGrid}>
        {/* Column 1: Sales Overview (Line Chart SVG) */}
        <div className={styles.cardContainer}>
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.cardTitle}>Sales Overview</h3>
            <select className={styles.dropdownSelect}>
              <option>Weekly ▼</option>
              <option>Monthly</option>
            </select>
          </div>

          <div className={styles.chartLegendRow}>
            <div className={styles.legendItem}>
              <span className={styles.legendDotOrange} />
              <span>This Week</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendLineGray} />
              <span>Last Week</span>
            </div>
          </div>

          <div className={styles.lineChartBox}>
            <div className={styles.tooltipCallout}>
              ₹32,450
              <div className={styles.tooltipSub}>May 16, 2025</div>
            </div>

            <svg width="100%" height="100%" viewBox="0 0 500 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeDasharray="4" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeDasharray="4" />
              <line x1="0" y1="110" x2="500" y2="110" stroke="#f1f5f9" strokeDasharray="4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeDasharray="4" />

              <path
                d="M 20,130 Q 90,140 160,110 T 300,100 T 440,70 T 480,90"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="4"
              />

              <path
                d="M 20,140 Q 80,80 150,110 T 290,40 T 410,120 T 480,70 L 480,170 L 20,170 Z"
                fill="url(#areaGrad)"
              />

              <path
                d="M 20,140 Q 80,80 150,110 T 290,40 T 410,120 T 480,70"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <circle cx="290" cy="40" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Column 2: Top Categories (Donut Chart SVG) */}
        <div className={styles.cardContainer}>
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.cardTitle}>Top Categories</h3>
            <select className={styles.dropdownSelect}>
              <option>This Week ▼</option>
              <option>This Month</option>
            </select>
          </div>

          <div className={styles.donutWrapper}>
            <div className={styles.donutSvgBox}>
              <svg width="150" height="150" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="4.5" />
                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#0284c7" strokeWidth="4.5" strokeDasharray="45 55" strokeDashoffset="25" />
                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#e11d48" strokeWidth="4.5" strokeDasharray="25 75" strokeDashoffset="80" />
                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#eab308" strokeWidth="4.5" strokeDasharray="15 85" strokeDashoffset="55" />
                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#14b8a6" strokeWidth="4.5" strokeDasharray="10 90" strokeDashoffset="40" />
                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#a855f7" strokeWidth="4.5" strokeDasharray="5 95" strokeDashoffset="30" />
              </svg>
              <div className={styles.donutCenterLabel}>
                <span className={styles.donutCenterSub}>Total Sales</span>
                <span className={styles.donutCenterVal}>₹12,45,890</span>
              </div>
            </div>

            <div className={styles.categoryList}>
              <div className={styles.categoryRow}>
                <div className={styles.categoryLeft}>
                  <span className={styles.catDotBlue} />
                  <span>Corporate Gifts</span>
                </div>
                <div className={styles.categoryRight}>
                  <span>₹5,60,650</span>
                  <span className={styles.pctBadge}>45%</span>
                </div>
              </div>
              <div className={styles.categoryRow}>
                <div className={styles.categoryLeft}>
                  <span className={styles.catDotPink} />
                  <span>Personalized Gifts</span>
                </div>
                <div className={styles.categoryRight}>
                  <span>₹3,11,472</span>
                  <span className={styles.pctBadge}>25%</span>
                </div>
              </div>
              <div className={styles.categoryRow}>
                <div className={styles.categoryLeft}>
                  <span className={styles.catDotYellow} />
                  <span>Toys</span>
                </div>
                <div className={styles.categoryRight}>
                  <span>₹1,86,884</span>
                  <span className={styles.pctBadge}>15%</span>
                </div>
              </div>
              <div className={styles.categoryRow}>
                <div className={styles.categoryLeft}>
                  <span className={styles.catDotTeal} />
                  <span>Tech Gifts</span>
                </div>
                <div className={styles.categoryRight}>
                  <span>₹1,24,589</span>
                  <span className={styles.pctBadge}>10%</span>
                </div>
              </div>
              <div className={styles.categoryRow}>
                <div className={styles.categoryLeft}>
                  <span className={styles.catDotPurple} />
                  <span>Others</span>
                </div>
                <div className={styles.categoryRight}>
                  <span>₹62,295</span>
                  <span className={styles.pctBadge}>5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Order Status (Donut Chart SVG) */}
        <div className={styles.cardContainer}>
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.cardTitle}>Order Status</h3>
            <select className={styles.dropdownSelect}>
              <option>This Week ▼</option>
              <option>This Month</option>
            </select>
          </div>

          <div className={styles.donutWrapper}>
            <div className={styles.donutSvgBox}>
              <svg width="150" height="150" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="4.5" />
                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#22c55e" strokeWidth="4.5" strokeDasharray="87.3 12.7" strokeDashoffset="25" />
                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#06b6d4" strokeWidth="4.5" strokeDasharray="6.9 93.1" strokeDashoffset="37.7" />
                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#eab308" strokeWidth="4.5" strokeDasharray="3.7 96.3" strokeDashoffset="30.8" />
                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#ef4444" strokeWidth="4.5" strokeDasharray="2.1 97.9" strokeDashoffset="27.1" />
              </svg>
              <div className={styles.donutCenterLabel}>
                <span className={styles.donutCenterSub}>Total Orders</span>
                <span className={styles.donutCenterVal}>1,246</span>
              </div>
            </div>

            <div className={styles.categoryList}>
              <div className={styles.categoryRow}>
                <div className={styles.categoryLeft}>
                  <span className={styles.catDotBlue} style={{ background: '#22c55e' }} />
                  <span>Delivered</span>
                </div>
                <div className={styles.categoryRight}>
                  <span>1,088</span>
                  <span className={styles.pctBadge}>(87.3%)</span>
                </div>
              </div>
              <div className={styles.categoryRow}>
                <div className={styles.categoryLeft}>
                  <span className={styles.catDotBlue} style={{ background: '#06b6d4' }} />
                  <span>Processing</span>
                </div>
                <div className={styles.categoryRight}>
                  <span>86</span>
                  <span className={styles.pctBadge}>(6.9%)</span>
                </div>
              </div>
              <div className={styles.categoryRow}>
                <div className={styles.categoryLeft}>
                  <span className={styles.catDotYellow} />
                  <span>Pending</span>
                </div>
                <div className={styles.categoryRight}>
                  <span>46</span>
                  <span className={styles.pctBadge}>(3.7%)</span>
                </div>
              </div>
              <div className={styles.categoryRow}>
                <div className={styles.categoryLeft}>
                  <span className={styles.catDotPink} style={{ background: '#ef4444' }} />
                  <span>Cancelled</span>
                </div>
                <div className={styles.categoryRight}>
                  <span>26</span>
                  <span className={styles.pctBadge}>(2.1%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: DATA TABLES & ACTIVITY GRID (3 COLUMNS) ── */}
      <div className={styles.bottomGrid}>
        {/* Column 1: Recent Orders Table & Mini Alert Cards */}
        <div className={styles.cardContainer}>
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.cardTitle}>Recent Orders</h3>
            <button type="button" className={styles.viewAllBtn} onClick={() => handleTabChange('orders')}>View All</button>
          </div>

          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.orderIdText}>#ORD-1256</td>
                <td>Tech Solutions Pvt. Ltd.</td>
                <td>May 18, 2025</td>
                <td>₹45,600</td>
                <td><span className={`${styles.pillStatus} ${styles.pillDelivered}`}>Delivered</span></td>
                <td><button type="button" className={styles.dotsBtn}><FiMoreVertical /></button></td>
              </tr>
              <tr>
                <td className={styles.orderIdText}>#ORD-1255</td>
                <td>Rahul Verma</td>
                <td>May 18, 2025</td>
                <td>₹12,450</td>
                <td><span className={`${styles.pillStatus} ${styles.pillProcessing}`}>Processing</span></td>
                <td><button type="button" className={styles.dotsBtn}><FiMoreVertical /></button></td>
              </tr>
              <tr>
                <td className={styles.orderIdText}>#ORD-1254</td>
                <td>ABC Corporation</td>
                <td>May 17, 2025</td>
                <td>₹78,900</td>
                <td><span className={`${styles.pillStatus} ${styles.pillPending}`}>Pending</span></td>
                <td><button type="button" className={styles.dotsBtn}><FiMoreVertical /></button></td>
              </tr>
              <tr>
                <td className={styles.orderIdText}>#ORD-1253</td>
                <td>Sneha Iyer</td>
                <td>May 17, 2025</td>
                <td>₹5,250</td>
                <td><span className={`${styles.pillStatus} ${styles.pillDelivered}`}>Delivered</span></td>
                <td><button type="button" className={styles.dotsBtn}><FiMoreVertical /></button></td>
              </tr>
              <tr>
                <td className={styles.orderIdText}>#ORD-1252</td>
                <td>Global Enterprises</td>
                <td>May 16, 2025</td>
                <td>₹32,750</td>
                <td><span className={`${styles.pillStatus} ${styles.pillProcessing}`}>Processing</span></td>
                <td><button type="button" className={styles.dotsBtn}><FiMoreVertical /></button></td>
              </tr>
            </tbody>
          </table>

          {/* Bottom 4 Mini Alert Cards Row */}
          <div className={styles.miniAlertsGrid}>
            <div className={`${styles.miniAlertCard} ${styles.miniCardOrange}`}>
              <div className={styles.miniIconBox} style={{ color: '#ea580c' }}>
                <FiArchive />
              </div>
              <div>
                <div className={styles.miniLabel}>Low Stock Alert</div>
                <div className={styles.miniVal}>12</div>
                <div className={styles.miniSub}>Products</div>
              </div>
            </div>

            <div className={`${styles.miniAlertCard} ${styles.miniCardRed}`}>
              <div className={styles.miniIconBox} style={{ color: '#dc2626' }}>
                <FiXCircle />
              </div>
              <div>
                <div className={styles.miniLabel}>Out of Stock</div>
                <div className={styles.miniVal}>05</div>
                <div className={styles.miniSub}>Products</div>
              </div>
            </div>

            <div className={`${styles.miniAlertCard} ${styles.miniCardBlue}`}>
              <div className={styles.miniIconBox} style={{ color: '#0284c7' }}>
                <FiUserPlus />
              </div>
              <div>
                <div className={styles.miniLabel}>New Customers</div>
                <div className={styles.miniVal}>38</div>
                <div className={styles.miniSub}>This Week</div>
              </div>
            </div>

            <div className={`${styles.miniAlertCard} ${styles.miniCardGreen}`}>
              <div className={styles.miniIconBox} style={{ color: '#16a34a' }}>
                <FiFileText />
              </div>
              <div>
                <div className={styles.miniLabel}>Bulk Quotes</div>
                <div className={styles.miniVal}>14</div>
                <div className={styles.miniSub}>This Week</div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Top Selling Products List */}
        <div className={styles.cardContainer}>
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.cardTitle}>Top Selling Products</h3>
            <button type="button" className={styles.viewAllBtn} onClick={() => handleTabChange('products')}>View All</button>
          </div>

          <div className={styles.productsList}>
            <div className={styles.productRow}>
              <div className={styles.productLeft}>
                <img
                  src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&auto=format&fit=crop&q=80"
                  alt="Hamper"
                  className={styles.productThumb}
                />
                <div>
                  <h4 className={styles.productTitle}>Premium Gift Hamper</h4>
                  <span className={styles.productSoldText}>256 Sold</span>
                </div>
              </div>
              <div className={styles.productRevenue}>₹2,56,000</div>
            </div>

            <div className={styles.productRow}>
              <div className={styles.productLeft}>
                <img
                  src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=100&auto=format&fit=crop&q=80"
                  alt="Bottle"
                  className={styles.productThumb}
                />
                <div>
                  <h4 className={styles.productTitle}>Custom Monogram Flask</h4>
                  <span className={styles.productSoldText}>198 Sold</span>
                </div>
              </div>
              <div className={styles.productRevenue}>₹1,58,400</div>
            </div>

            <div className={styles.productRow}>
              <div className={styles.productLeft}>
                <img
                  src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=100&auto=format&fit=crop&q=80"
                  alt="Engraved Clock"
                  className={styles.productThumb}
                />
                <div>
                  <h4 className={styles.productTitle}>Laser Engraved Desk Clock</h4>
                  <span className={styles.productSoldText}>142 Sold</span>
                </div>
              </div>
              <div className={styles.productRevenue}>₹1,70,400</div>
            </div>

            <div className={styles.productRow}>
              <div className={styles.productLeft}>
                <img
                  src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&auto=format&fit=crop&q=80"
                  alt="Journal"
                  className={styles.productThumb}
                />
                <div>
                  <h4 className={styles.productTitle}>Executive Leather Journal</h4>
                  <span className={styles.productSoldText}>115 Sold</span>
                </div>
              </div>
              <div className={styles.productRevenue}>₹92,000</div>
            </div>
          </div>
        </div>

        {/* Column 3: Recent Activity & Live Support Request */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top Activity Card */}
          <div className={styles.cardContainer} style={{ flex: 1 }}>
            <div className={styles.cardHeaderRow}>
              <h3 className={styles.cardTitle}>Recent Activity</h3>
              <button type="button" className={styles.dotsBtn}><FiMoreVertical /></button>
            </div>

            <div className={styles.timelineList}>
              <div className={styles.timelineItem}>
                <span className={`${styles.timelineBadge} ${styles.bgTimelineGreen}`} />
                <div>
                  <p className={styles.timelineText}>New order <strong>#ORD-1256</strong> placed by Tech Solutions</p>
                  <span className={styles.timelineTime}>5 mins ago</span>
                </div>
              </div>

              <div className={styles.timelineItem}>
                <span className={`${styles.timelineBadge} ${styles.bgTimelineBlue}`} />
                <div>
                  <p className={styles.timelineText}>Bulk quote request submitted by Apex Infotech</p>
                  <span className={styles.timelineTime}>22 mins ago</span>
                </div>
              </div>

              <div className={styles.timelineItem}>
                <span className={`${styles.timelineBadge} ${styles.bgTimelineOrange}`} />
                <div>
                  <p className={styles.timelineText}>Low stock alert for <strong>Executive Leather Journal</strong></p>
                  <span className={styles.timelineTime}>1 hour ago</span>
                </div>
              </div>

              <div className={styles.timelineItem}>
                <span className={`${styles.timelineBadge} ${styles.bgTimelinePurple}`} />
                <div>
                  <p className={styles.timelineText}>New enquiry registered from Little Explorers Preschool</p>
                  <span className={styles.timelineTime}>2 hours ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Live Customer Enquiries Card */}
          <div className={styles.cardContainer}>
            <div className={styles.cardHeaderRow}>
              <h3 className={styles.cardTitle}>Live Enquiries</h3>
              <button type="button" className={styles.viewAllBtn} onClick={() => handleTabChange('enquiries')}>View All</button>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>Bulk Executive Hampers Inquiry</div>
              <div style={{ marginTop: '2px' }}>Tech Solutions Pvt. Ltd.</div>
              <span className={`${styles.pillStatus} ${styles.pillPending}`} style={{ marginTop: '6px', display: 'inline-block' }}>New</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
