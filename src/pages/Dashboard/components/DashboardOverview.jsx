import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FiPackage,
  FiMoreVertical,
  FiArchive,
  FiXCircle,
  FiUserPlus,
} from 'react-icons/fi';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import { getSocket } from '@api/socket';
import { unwrapApiData } from '@utils/apiResponse';
import { formatOrderId, formatEnquiryId, filterByDateRange, filterByStatus } from '@utils/formatters';
import styles from '../Dashboard.module.css';
import OverviewKpiCards from './OverviewKpiCards';

/*
 * Everything below the KPI cards comes from GET /dashboard/overview (real orders, enquiries,
 * customers and stock). Nothing here is sample data: with no records, cards say so.
 */

const SALES_RANGES = [
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'year', label: 'Last 12 months' },
];
const CHART_RANGES = [
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
];
const CATEGORY_COLORS = ['#0284c7', '#e11d48', '#eab308', '#14b8a6', '#a855f7'];
const STATUS_SEGMENTS = [
  { key: 'delivered', label: 'Delivered', color: '#22c55e' },
  { key: 'shipped', label: 'Shipped', color: '#6366f1' },
  { key: 'processing', label: 'Processing', color: '#06b6d4' },
  { key: 'pending', label: 'Pending', color: '#eab308' },
  { key: 'cancelled', label: 'Cancelled', color: '#ef4444' },
];
const LIVE_EVENTS = ['order:created', 'enquiry:created', 'customer:created'];
const RETRY_EVERY_MS = 15000;
const PRODUCT_PLACEHOLDER = '/placeholder-product.png';

const rupees = (value, digits = 0) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: digits })}`;

/** "just now", "5 mins ago", "3 hours ago", "2 days ago", then the date. */
const timeAgo = (iso, now = Date.now()) => {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** Donut segments on a circle whose circumference is 100, starting at 12 o'clock. */
const donutSegments = (parts) => {
  let start = 0;
  return parts.filter((part) => part.pct > 0).map((part) => {
    const segment = { ...part, dasharray: `${part.pct} ${100 - part.pct}`, dashoffset: (((25 - start) % 100) + 100) % 100 };
    start += part.pct;
    return segment;
  });
};

const ACTIVITY_BADGE = {
  order: styles.bgTimelineGreen,
  bulk: styles.bgTimelineBlue,
  customer: styles.bgTimelineBlue,
  enquiry: styles.bgTimelinePurple,
  lowStock: styles.bgTimelineOrange,
  outOfStock: styles.bgTimelineOrange,
};

const activityText = (event) => {
  switch (event.type) {
    case 'order':
      return <>New order <strong>{event.reference}</strong> placed by {event.customer} · {rupees(event.amount, 2)} ({event.paymentMethod === 'RAZORPAY' ? 'paid online' : 'COD'})</>;
    case 'bulk':
      return <>Bulk order inquiry for <strong>{Number(event.quantity || 0).toLocaleString('en-IN')} × {event.productName}</strong> from {event.customer}</>;
    case 'enquiry':
      return <>New enquiry from {event.customer}{event.subject ? `: ${event.subject}` : ''}</>;
    case 'customer':
      return <>New customer <strong>{event.customer}</strong> registered</>;
    case 'lowStock':
      return <>Low stock alert for <strong>{event.productName}</strong> ({event.stock} left)</>;
    case 'outOfStock':
      return <><strong>{event.productName}</strong> is out of stock</>;
    default:
      return null;
  }
};

/** Loads GET /dashboard/overview and keeps it fresh when orders, enquiries or sign-ups arrive. */
const useDashboardOverview = (params, refreshKey) => {
  const [overview, setOverview] = useState(null);
  const [status, setStatus] = useState('loading');
  const requestId = useRef(0);
  const { sales, categories, status: statusRange } = params;

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setStatus((current) => (current === 'ready' ? 'refreshing' : 'loading'));
    try {
      const response = await axiosInstance.get(ENDPOINTS.DASHBOARD.OVERVIEW, { params: { sales, categories, status: statusRange } });
      if (id !== requestId.current) return;
      const data = unwrapApiData(response);
      // An unexpected body (old backend, proxy error page) must not crash the dashboard.
      if (!data?.sales?.labels || !data?.categories?.categories || !data?.orderStatus || !data?.topProducts?.products || !Array.isArray(data?.activity) || !data?.quickStats) {
        throw new Error('Unexpected dashboard overview response');
      }
      setOverview(data);
      setStatus('ready');
    } catch {
      if (id === requestId.current) setStatus('error');
    }
  }, [sales, categories, statusRange]);

  useEffect(() => { load(); }, [load, refreshKey]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;
    let timer;
    const onEvent = () => { clearTimeout(timer); timer = setTimeout(load, 400); };
    LIVE_EVENTS.forEach((event) => socket.on(event, onEvent));
    socket.on('connect', onEvent);
    return () => {
      clearTimeout(timer);
      LIVE_EVENTS.forEach((event) => socket.off(event, onEvent));
      socket.off('connect', onEvent);
    };
  }, [load]);

  useEffect(() => {
    if (status !== 'error') return undefined;
    const timer = setInterval(load, RETRY_EVERY_MS);
    return () => clearInterval(timer);
  }, [status, load]);

  return { overview, status, reload: load };
};

/** Loading / error / empty states for a card; shows the last loaded data while refreshing. */
const CardState = ({ status, hasData, empty, children }) => {
  if (!hasData) {
    return status === 'error'
      ? <p role="alert" style={{ margin: '1rem 0', color: '#b91c1c', fontSize: '0.85rem' }}>Couldn't load live data. Retrying automatically.</p>
      : <p className={styles.timelineTime} style={{ margin: '1rem 0' }}>Loading live data…</p>;
  }
  if (empty) return <p className={styles.timelineTime} style={{ margin: '1rem 0' }}>{empty}</p>;
  return children;
};

const RangeSelect = ({ value, onChange, options, label }) => (
  <select className={styles.dropdownSelect} value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
    {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
  </select>
);

/** Line chart of current vs previous period, scaled to the larger of the two. */
const SalesChart = ({ sales }) => {
  const W = 500; const H = 180; const left = 20; const right = 480; const top = 20; const bottom = 160;
  const max = Math.max(...sales.current, ...sales.previous, 1);
  const x = (i) => left + (sales.current.length === 1 ? 0 : (i * (right - left)) / (sales.current.length - 1));
  const y = (value) => bottom - (value / max) * (bottom - top);
  const line = (values) => values.map((v, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const peakIndex = sales.peak ? sales.current.indexOf(sales.peak.value) : -1;
  const labelEvery = Math.ceil(sales.labels.length / 7);

  return (
    <div className={styles.lineChartBox}>
      {sales.peak && (
        <div className={styles.tooltipCallout} style={{ left: `clamp(0px, calc(${(x(peakIndex) / W) * 100}% - 45px), calc(100% - 110px))`, top: `${Math.max(0, (y(sales.peak.value) / H) * 100 - 30)}%` }}>
          {rupees(sales.peak.value)}
          <div className={styles.tooltipSub}>Peak · {sales.peak.label}</div>
        </div>
      )}
      <svg width="100%" height="85%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`Sales: ${rupees(sales.total)} this period, ${rupees(sales.previousTotal)} the period before`}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[30, 70, 110, 150].map((gy) => <line key={gy} x1="0" y1={gy} x2={W} y2={gy} stroke="#f1f5f9" strokeDasharray="4" />)}
        <path d={line(sales.previous)} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" vectorEffect="non-scaling-stroke" />
        <path d={`${line(sales.current)} L ${x(sales.current.length - 1)},${bottom + 10} L ${left},${bottom + 10} Z`} fill="url(#areaGrad)" />
        <path d={line(sales.current)} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {peakIndex >= 0 && <circle cx={x(peakIndex)} cy={y(sales.peak.value)} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', padding: '0 0.25rem' }}>
        {sales.labels.map((label, i) => <span key={`${label}-${i}`} style={{ visibility: i % labelEvery === 0 || i === sales.labels.length - 1 ? 'visible' : 'hidden', whiteSpace: 'nowrap' }}>{label}</span>)}
      </div>
    </div>
  );
};

const Donut = ({ segments, centerLabel, centerValue }) => (
  <div className={styles.donutSvgBox}>
    <svg width="150" height="150" viewBox="0 0 42 42" aria-hidden="true">
      <circle cx="21" cy="21" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="4.5" />
      {segments.map((segment) => (
        <circle key={segment.label} cx="21" cy="21" r="15.915" fill="none" stroke={segment.color} strokeWidth="4.5" strokeDasharray={segment.dasharray} strokeDashoffset={segment.dashoffset} />
      ))}
    </svg>
    <div className={styles.donutCenterLabel}>
      <span className={styles.donutCenterSub}>{centerLabel}</span>
      <span className={styles.donutCenterVal}>{centerValue}</span>
    </div>
  </div>
);

const DashboardOverview = ({
  handleTabChange,
  enquiriesList = [],
  ordersList = [],
  dateFilter = 'Last 30 Days',
  statusFilter = 'All',
  refreshKey = 0,
}) => {
  const [salesRange, setSalesRange] = useState('week');
  const [categoryRange, setCategoryRange] = useState('week');
  const [statusRange, setStatusRange] = useState('week');
  const { overview, status } = useDashboardOverview({ sales: salesRange, categories: categoryRange, status: statusRange }, refreshKey);

  // Recent Orders table follows the header date / status filter (KAN-48)
  const activeOrders = useMemo(() => filterByStatus(filterByDateRange(ordersList, dateFilter, 'createdAt'), statusFilter), [ordersList, dateFilter, statusFilter]);

  const categorySegments = useMemo(() => donutSegments((overview?.categories.categories || []).map((cat, i) => ({ ...cat, label: cat.name, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))), [overview]);
  const statusParts = useMemo(() => {
    const counts = overview?.orderStatus;
    const total = counts?.total || 0;
    return STATUS_SEGMENTS.map((segment) => ({ ...segment, count: counts?.[segment.key] || 0, pct: total ? Math.round(((counts[segment.key] || 0) / total) * 1000) / 10 : 0 }));
  }, [overview]);

  // Ticks every minute so "5 mins ago" stays true while the page is open.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => { if (overview) setNow(Date.now()); }, [overview]);

  const quick = overview?.quickStats;
  const quickValue = (value) => (quick ? value.toLocaleString('en-IN') : '—');
  const salesChange = overview && overview.sales.previousTotal > 0
    ? Math.round(((overview.sales.total - overview.sales.previousTotal) / overview.sales.previousTotal) * 100)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Active Filter Bar Indicator (KAN-48) */}
      {(dateFilter !== 'Last 30 Days' || statusFilter !== 'All') && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.65rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#92400e', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Filtered by Date: <strong>{dateFilter}</strong></span>
            {statusFilter !== 'All' && <span>• Status: <strong>{statusFilter}</strong></span>}
            <span style={{ fontSize: '0.8rem', color: '#b45309', background: '#fde68a', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>{activeOrders.length} Orders Matching</span>
          </div>
        </div>
      )}

      {/* ── ROW 1: LIVE KPI CARDS — one per sidebar section, from GET /dashboard/summary ── */}
      <OverviewKpiCards handleTabChange={handleTabChange} dateFilter={dateFilter} refreshKey={refreshKey} />

      {/* ── ROW 2: CHARTS GRID (3 COLUMNS) ── */}
      <div className={styles.chartsGrid}>
        {/* Column 1: Sales Overview */}
        <div className={styles.cardContainer}>
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.cardTitle}>Sales Overview</h3>
            <RangeSelect value={salesRange} onChange={setSalesRange} options={SALES_RANGES} label="Sales overview period" />
          </div>

          <div className={styles.chartLegendRow}>
            <div className={styles.legendItem}>
              <span className={styles.legendDotOrange} />
              <span>Current {overview ? `· ${rupees(overview.sales.total)}` : ''}</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendLineGray} />
              <span>Previous {overview ? `· ${rupees(overview.sales.previousTotal)}` : ''}</span>
            </div>
            {salesChange !== null && (
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: salesChange >= 0 ? '#16a34a' : '#dc2626' }}>{salesChange >= 0 ? '▲' : '▼'} {Math.abs(salesChange)}%</span>
            )}
          </div>

          <CardState status={status} hasData={Boolean(overview)} empty={overview && overview.sales.total === 0 && overview.sales.previousTotal === 0 ? 'No sales in this period yet.' : null}>
            {overview && <SalesChart sales={overview.sales} />}
          </CardState>
        </div>

        {/* Column 2: Top Categories by revenue */}
        <div className={styles.cardContainer}>
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.cardTitle}>Top Categories</h3>
            <RangeSelect value={categoryRange} onChange={setCategoryRange} options={CHART_RANGES} label="Top categories period" />
          </div>

          <CardState status={status} hasData={Boolean(overview)} empty={overview && overview.categories.categories.length === 0 ? 'No category sales in this period yet.' : null}>
            {overview && (
              <div className={styles.donutWrapper}>
                <Donut segments={categorySegments} centerLabel="Total Sales" centerValue={rupees(overview.categories.total)} />
                <div className={styles.categoryList}>
                  {categorySegments.map((cat) => (
                    <div className={styles.categoryRow} key={cat.name}>
                      <div className={styles.categoryLeft}>
                        <span className={styles.catDotBlue} style={{ background: cat.color }} />
                        <span>{cat.name}</span>
                      </div>
                      <div className={styles.categoryRight}>
                        <span>{rupees(cat.revenue)}</span>
                        <span className={styles.pctBadge}>{cat.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardState>
        </div>

        {/* Column 3: Order Status */}
        <div className={styles.cardContainer}>
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.cardTitle}>Order Status</h3>
            <RangeSelect value={statusRange} onChange={setStatusRange} options={CHART_RANGES} label="Order status period" />
          </div>

          <CardState status={status} hasData={Boolean(overview)} empty={overview && overview.orderStatus.total === 0 ? 'No orders in this period yet.' : null}>
            {overview && (
              <div className={styles.donutWrapper}>
                <Donut segments={donutSegments(statusParts)} centerLabel="Total Orders" centerValue={overview.orderStatus.total.toLocaleString('en-IN')} />
                <div className={styles.categoryList}>
                  {statusParts.map((part) => (
                    <div className={styles.categoryRow} key={part.key}>
                      <div className={styles.categoryLeft}>
                        <span className={styles.catDotBlue} style={{ background: part.color }} />
                        <span>{part.label}</span>
                      </div>
                      <div className={styles.categoryRight}>
                        <span>{part.count.toLocaleString('en-IN')}</span>
                        <span className={styles.pctBadge}>({part.pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardState>
        </div>
      </div>

      {/* ── QUICK STATUS SECTION (KAN-52) ── */}
      <div className={styles.quickStatusGrid}>
        <div className={`${styles.miniAlertCard} ${styles.miniCardOrange}`} onClick={() => handleTabChange('products')} style={{ cursor: 'pointer' }} title="Manage Low Stock Products">
          <div className={styles.miniIconBox} style={{ color: '#ea580c' }}><FiArchive /></div>
          <div>
            <div className={styles.miniLabel}>Low Stock Alert</div>
            <div className={styles.miniVal}>{quickValue(quick?.lowStock ?? 0)}</div>
            <div className={styles.miniSub}>Products (10 or fewer left)</div>
          </div>
        </div>

        <div className={`${styles.miniAlertCard} ${styles.miniCardRed}`} onClick={() => handleTabChange('products')} style={{ cursor: 'pointer' }} title="Manage Out of Stock Products">
          <div className={styles.miniIconBox} style={{ color: '#dc2626' }}><FiXCircle /></div>
          <div>
            <div className={styles.miniLabel}>Out of Stock</div>
            <div className={styles.miniVal}>{quickValue(quick?.outOfStock ?? 0)}</div>
            <div className={styles.miniSub}>Products</div>
          </div>
        </div>

        <div className={`${styles.miniAlertCard} ${styles.miniCardBlue}`} onClick={() => handleTabChange('customers')} style={{ cursor: 'pointer' }} title="View Customer Database">
          <div className={styles.miniIconBox} style={{ color: '#0284c7' }}><FiUserPlus /></div>
          <div>
            <div className={styles.miniLabel}>New Customers</div>
            <div className={styles.miniVal}>{quickValue(quick?.newCustomersThisWeek ?? 0)}</div>
            <div className={styles.miniSub}>Last 7 days</div>
          </div>
        </div>

        <div className={`${styles.miniAlertCard} ${styles.miniCardPurple}`} onClick={() => handleTabChange('bulk-orders')} style={{ cursor: 'pointer' }} title="View new bulk order inquiries">
          <div className={styles.miniIconBox} style={{ color: '#8b5cf6' }}><FiPackage /></div>
          <div>
            <div className={styles.miniLabel}>Bulk Inquiries</div>
            <div className={styles.miniVal}>{quickValue(quick?.newBulkInquiries ?? 0)}</div>
            <div className={styles.miniSub}>Waiting for a reply</div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: DATA TABLES & ACTIVITY GRID (3 COLUMNS) ── */}
      <div className={styles.bottomGrid}>
        {/* Column 1: Recent Orders Table */}
        <div className={styles.cardContainer}>
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.cardTitle}>Recent Orders</h3>
            <button type="button" className={styles.viewAllBtn} onClick={() => handleTabChange('orders')}>View All</button>
          </div>

          {activeOrders.length === 0 ? (
            <p className={styles.timelineTime} style={{ margin: '1rem 0' }}>No orders yet.</p>
          ) : (
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Product Details</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.slice(0, 5).map((o, idx) => {
                  const displayId = formatOrderId(o.id || o.orderId, idx);
                  const customerName = o.customer || o.customerName || o.user?.name || o.shippingAddress?.fullName || 'Customer';
                  const itemCount = o.itemsCount || (Array.isArray(o.items) ? o.items.length : 1);
                  const productSummary = o.itemsDetails || (Array.isArray(o.items) ? o.items.map(i => `${i.name || i.product?.name || 'Item'} ×${i.quantity || 1}`).join(', ') : `${itemCount} Items`);
                  const amountDisplay = o.amount || rupees(o.rawAmount || o.totalAmount || 0);

                  return (
                    <tr key={o.id || idx}>
                      <td className={styles.orderIdText}>{displayId}</td>
                      <td><strong>{customerName}</strong></td>
                      <td>{o.date || (o.createdAt ? timeAgo(o.createdAt, now) : '')}</td>
                      <td style={{ fontSize: '0.82rem', color: '#475569', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={productSummary}>
                        {productSummary}
                      </td>
                      <td><strong style={{ color: '#d99b26' }}>{amountDisplay}</strong></td>
                      <td>
                        <span className={`${styles.pillStatus} ${o.status === 'Delivered' ? styles.pillDelivered : o.status === 'Processing' ? styles.pillProcessing : o.status === 'Cancelled' ? styles.pillCancelled : styles.pillPending}`}>
                          {o.status || 'Pending'}
                        </span>
                      </td>
                      <td><button type="button" className={styles.dotsBtn} onClick={() => handleTabChange('orders')} title="Manage Orders"><FiMoreVertical /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Column 2: Top Selling Products (units actually sold) */}
        <div className={styles.cardContainer}>
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.cardTitle}>Top Selling Products</h3>
            <button type="button" className={styles.viewAllBtn} onClick={() => handleTabChange('products')}>View All</button>
          </div>

          <CardState status={status} hasData={Boolean(overview)} empty={overview && overview.topProducts.products.length === 0 ? 'No products sold yet. Best sellers appear here after the first orders.' : null}>
            <div className={styles.productsList}>
              {(overview?.topProducts.products || []).map((p) => (
                <div className={styles.productRow} key={p.id} onClick={() => handleTabChange('products')} style={{ cursor: 'pointer' }}>
                  <div className={styles.productLeft}>
                    <img
                      src={p.image || PRODUCT_PLACEHOLDER}
                      alt={p.name}
                      className={styles.productThumb}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PRODUCT_PLACEHOLDER; }}
                    />
                    <div>
                      <h4 className={styles.productTitle}>{p.name}</h4>
                      <span className={styles.productSoldText}>{p.unitsSold.toLocaleString('en-IN')} sold{p.stock !== null ? ` · ${p.stock} in stock` : ''}</span>
                    </div>
                  </div>
                  <div className={styles.productRevenue}>{rupees(p.revenue)}</div>
                </div>
              ))}
            </div>
          </CardState>
        </div>

        {/* Column 3: Recent Activity & Live Customer Enquiries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className={styles.cardContainer} style={{ flex: 1 }}>
            <div className={styles.cardHeaderRow}>
              <h3 className={styles.cardTitle}>Recent Activity</h3>
            </div>

            <CardState status={status} hasData={Boolean(overview)} empty={overview && overview.activity.length === 0 ? 'No activity yet.' : null}>
              <div className={styles.timelineList}>
                {(overview?.activity || []).map((event) => (
                  <div className={styles.timelineItem} key={`${event.type}-${event.id}`} onClick={() => handleTabChange(event.tab)} style={{ cursor: 'pointer' }}>
                    <span className={`${styles.timelineBadge} ${ACTIVITY_BADGE[event.type] || styles.bgTimelineBlue}`} />
                    <div>
                      <p className={styles.timelineText}>{activityText(event)}</p>
                      <time className={styles.timelineTime} dateTime={event.at} title={new Date(event.at).toLocaleString('en-IN')}>{timeAgo(event.at, now)}</time>
                    </div>
                  </div>
                ))}
              </div>
            </CardState>
          </div>

          <div className={styles.cardContainer}>
            <div className={styles.cardHeaderRow}>
              <h3 className={styles.cardTitle}>Live Customer Enquiries</h3>
              <button type="button" className={styles.viewAllBtn} onClick={() => handleTabChange('enquiries')}>View All ({enquiriesList.length})</button>
            </div>
            {enquiriesList.length === 0 ? (
              <p className={styles.timelineTime} style={{ margin: '0.75rem 0 0' }}>No customer enquiries yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
                {enquiriesList.slice(0, 3).map((enq) => (
                  <div
                    key={enq.id}
                    onClick={() => handleTabChange('enquiries')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.15rem' }}>
                        <code style={{ background: '#fef3c7', color: '#b45309', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                          {enq.displayId || formatEnquiryId(enq.id, enq.createdAt)}
                        </code>
                        <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{enq.name}</strong>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{enq.subject || enq.category || 'General Inquiry'}</span>
                    </div>
                    <span className={`${styles.pillStatus} ${enq.status === 'Resolved' ? styles.pillDelivered : enq.status === 'In Progress' ? styles.pillProcessing : styles.pillPending}`}>
                      {enq.status || 'New'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
